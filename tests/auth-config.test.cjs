const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const authConfigPath = path.join(__dirname, "../auth.config.ts");
const authConfigCode = ts.transpileModule(
  fs.readFileSync(authConfigPath, "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }
).outputText;

function loadAuthConfig({ findUnique, compare }) {
  const logs = [];
  const module = { exports: {} };
  const credentialsProvider = (options) => options;
  const mockedRequire = (specifier) => {
    if (specifier === "next-auth/providers/credentials") {
      return { __esModule: true, default: credentialsProvider };
    }
    if (specifier === "./lib/prisma") {
      return { prisma: { user: { findUnique } } };
    }
    if (specifier === "bcryptjs") {
      return { __esModule: true, default: { compare } };
    }
    throw new Error(`Unexpected dependency: ${specifier}`);
  };

  vm.runInNewContext(
    authConfigCode,
    {
      exports: module.exports,
      module,
      require: mockedRequire,
      Error,
      Set,
      console: { error: (...args) => logs.push(args) },
      process: { env: { NODE_ENV: "test", NEXTAUTH_SECRET: "test-only" } },
    },
    { filename: authConfigPath }
  );

  return { authorize: module.exports.authOptions.providers[0].authorize, logs };
}

const credentials = { email: "private@example.com", password: "secret" };
const user = {
  id: 7,
  email: credentials.email,
  password: "stored-hash",
  nombre: "Private",
  apellido: "User",
  fechaNac: new Date("1990-01-01T00:00:00.000Z"),
  rol: "user",
};

test("credenciales inválidas conservan la respuesta estándar sin registrar datos", async () => {
  const { authorize, logs } = loadAuthConfig({
    findUnique: async () => null,
    compare: async () => false,
  });

  assert.equal(await authorize(credentials), null);
  assert.equal(logs.length, 0);

  const badPassword = loadAuthConfig({
    findUnique: async () => user,
    compare: async () => false,
  });
  assert.equal(await badPassword.authorize(credentials), null);
  assert.equal(badPassword.logs.length, 0);
});

test("autenticación correcta devuelve la identidad sin hash de contraseña", async () => {
  const { authorize, logs } = loadAuthConfig({
    findUnique: async () => user,
    compare: async (password, storedHash) =>
      password === credentials.password && storedHash === user.password,
  });

  const authorizedUser = await authorize(credentials);

  assert.deepEqual(JSON.parse(JSON.stringify(authorizedUser)), {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    fechaNac: user.fechaNac.toISOString(),
    rol: user.rol,
  });
  assert.equal("password" in authorizedUser, false);
  assert.equal(JSON.stringify(authorizedUser).includes(user.password), false);
  assert.equal(logs.length, 0);
});

test("campos faltantes y usuario sin hash fallan igual sin lookup extra ni filtración", async () => {
  let lookupCount = 0;
  let compareCount = 0;
  const { authorize, logs } = loadAuthConfig({
    findUnique: async () => {
      lookupCount += 1;
      return { ...user, password: "" };
    },
    compare: async () => {
      compareCount += 1;
      return true;
    },
  });

  assert.equal(await authorize({ email: credentials.email }), null);
  assert.equal(lookupCount, 0);
  assert.equal(await authorize(credentials), null);
  assert.equal(lookupCount, 1);
  assert.equal(compareCount, 0);
  assert.equal(logs.length, 0);
});

test("fallo Prisma se identifica como servicio y el log excluye datos sensibles", async () => {
  const dbError = new Error("connection includes private database details");
  dbError.name = "PrismaClientInitializationError";
  dbError.errorCode = "P1001";
  const { authorize, logs } = loadAuthConfig({
    findUnique: async () => {
      throw dbError;
    },
    compare: async () => false,
  });

  await assert.rejects(authorize(credentials), {
    message: "AuthServiceUnavailable",
  });
  assert.equal(logs.length, 1);
  assert.equal(logs[0][0], "Error en authorize");
  assert.equal(logs[0][1].stage, "user_lookup");
  assert.equal(logs[0][1].name, "PrismaClientInitializationError");
  assert.equal(logs[0][1].prismaErrorCode, "P1001");
  assert.equal(JSON.stringify(logs).includes("private database details"), false);
  assert.equal(JSON.stringify(logs).includes(credentials.email), false);
  assert.equal(JSON.stringify(logs).includes(credentials.password), false);
});

test("fallo de bcrypt se clasifica en la etapa de comparación", async () => {
  const { authorize, logs } = loadAuthConfig({
    findUnique: async () => user,
    compare: async () => {
      throw new Error("hash/parser detail");
    },
  });

  await assert.rejects(authorize(credentials), {
    message: "AuthServiceUnavailable",
  });
  assert.equal(logs.length, 1);
  assert.equal(logs[0][1].stage, "password_compare");
  assert.equal(logs[0][1].name, "Error");
  assert.equal(JSON.stringify(logs).includes("hash/parser detail"), false);
});
