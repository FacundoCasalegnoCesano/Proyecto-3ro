const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const routePath = path.join(__dirname, "../app/api/register/route.ts");
const routeCode = ts.transpileModule(fs.readFileSync(routePath, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

function loadRoute(error) {
  const logs = [];
  const module = { exports: {} };
  const mockedRequire = (specifier) => {
    if (specifier === "next/server") {
      return { NextResponse: { json: (body, init) => Response.json(body, init) } };
    }
    if (specifier === "../../../lib/auth-helpers") {
      return { createUser: async () => { throw error; } };
    }
    throw new Error(`Unexpected dependency: ${specifier}`);
  };

  vm.runInNewContext(routeCode, {
    exports: module.exports,
    module,
    require: mockedRequire,
    Response,
    Error,
    process: { env: { DATABASE_URL: "mysql://user:password@host/db" }, version: "v-test" },
    console: { error: (...args) => logs.push(args) },
  }, { filename: routePath });
  return { route: module.exports, logs };
}

async function sendFailingRequest(route) {
  return route.POST({
    json: async () => ({
      nombre: "Nombre",
      apellido: "Apellido",
      email: "private@example.com",
      password: "secret",
      fechaNac: "1990-01-01",
    }),
  });
}

test("500 mantiene respuesta genérica y registra un código Prisma permitido", async () => {
  const error = new Error("fallo interno");
  error.name = "PrismaClientKnownRequestError";
  error.code = "P2021";
  const { route, logs } = loadRoute(error);
  const response = await sendFailingRequest(route);
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.deepEqual(body, { error: "Error interno del servidor" });
  assert.equal(logs.length, 1);
  assert.equal(logs[0][1].name, "PrismaClientKnownRequestError");
  assert.equal(logs[0][1].prismaCode, "P2021");
  assert.equal(logs[0][1].prismaErrorCode, undefined);
  assert.equal("class" in logs[0][1], false);
});

test("500 registra errorCode P1001", async () => {
  const error = new Error("fallo interno");
  error.name = "PrismaClientInitializationError";
  error.errorCode = "P1001";
  const { route, logs } = loadRoute(error);
  const response = await sendFailingRequest(route);
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.deepEqual(body, { error: "Error interno del servidor" });
  assert.equal(logs.length, 1);
  assert.equal(logs[0][1].name, "PrismaClientInitializationError");
  assert.equal(logs[0][1].prismaCode, undefined);
  assert.equal(logs[0][1].prismaErrorCode, "P1001");
  assert.equal(logs[0][1].failureKind, undefined);
  assert.equal(logs[0][1].nodeVersion, undefined);
});

test("500 clasifica engine sin códigos ni mensaje en los logs", async () => {
  const error = new Error("Prisma query engine libssl password=secret");
  const { route, logs } = loadRoute(error);
  const response = await sendFailingRequest(route);
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.deepEqual(body, { error: "Error interno del servidor" });
  assert.equal(logs.length, 1);
  assert.equal(logs[0][1].name, "Error");
  assert.equal(logs[0][1].prismaCode, undefined);
  assert.equal(logs[0][1].prismaErrorCode, undefined);
  assert.equal(logs[0][1].failureKind, "PRISMA_ENGINE");
  assert.equal(logs[0][1].nodeVersion, "v-test");
  assert.equal(JSON.stringify(logs).includes("password=secret"), false);
});

test("500 omite nombres y códigos inesperados que contienen secretos", async () => {
  const error = new Error("fallo interno");
  error.name = "mysql://user:secret@host/db";
  error.code = "password=secret";
  error.errorCode = "private@example.com";
  const { route, logs } = loadRoute(error);
  const response = await sendFailingRequest(route);
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.deepEqual(body, { error: "Error interno del servidor" });
  assert.equal(logs.length, 1);
  assert.equal(logs[0][1].name, "Unknown");
  assert.equal(logs[0][1].prismaCode, undefined);
  assert.equal(logs[0][1].prismaErrorCode, undefined);
  assert.equal("class" in logs[0][1], false);
  const output = JSON.stringify({ logs, body });
  assert.equal(output.includes("secret"), false);
  assert.equal(output.includes("private@example.com"), false);
  assert.equal(output.includes("mysql://"), false);
});

test("409 para duplicado mantiene respuesta y no registra error", async () => {
  const error = new Error("El usuario ya existe");
  const { route, logs } = loadRoute(error);
  const response = await sendFailingRequest(route);
  const body = await response.json();

  assert.equal(response.status, 409);
  assert.deepEqual(body, { error: "El usuario ya existe con este email" });
  assert.equal(logs.length, 0);
});

test("500 no filtra valores de mensaje, solicitud ni DATABASE_URL", async () => {
  const error = new Error("Prisma query engine libssl password=secret email=private@example.com");
  error.name = "PrismaClientKnownRequestError";
  error.code = "P2021";
  error.errorCode = "P1001";
  const { route, logs } = loadRoute(error);
  const response = await route.POST({
    json: async () => ({
      nombre: "Nombre",
      apellido: "Apellido",
      email: "private@example.com",
      password: "secret",
      fechaNac: "1990-01-01",
    }),
  });
  const body = await response.json();
  assert.equal(response.status, 500);
  assert.deepEqual(body, { error: "Error interno del servidor" });
  assert.equal(logs.length, 1);
  assert.equal(logs[0][0], "Error en API register");
  assert.equal(logs[0][1].hasDatabaseUrl, true);
  assert.equal(logs[0][1].failureKind, "PRISMA_ENGINE");
  assert.equal(logs[0][1].prismaCode, "P2021");
  assert.equal(logs[0][1].prismaErrorCode, "P1001");
  assert.equal(JSON.stringify(logs).includes("password"), false);
  assert.equal(JSON.stringify(logs).includes("private@example.com"), false);
  assert.equal(JSON.stringify(body).includes("password"), false);
});
