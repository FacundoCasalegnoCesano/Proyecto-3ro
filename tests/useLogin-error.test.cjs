const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const hookPath = path.join(__dirname, "../app/hooks/useLogin.tsx");
const hookCode = ts.transpileModule(fs.readFileSync(hookPath, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.React,
  },
}).outputText;

function loadUseLogin(signIn) {
  const toastErrors = [];
  const dependencies = {
    react: { useState: (value) => [value, () => {}] },
    "next-auth/react": { signIn },
    "next/navigation": { useRouter: () => ({ push() {}, refresh() {} }) },
    sonner: {
      toast: {
        loading: () => "loading",
        dismiss() {},
        error: (...args) => toastErrors.push(args),
        success() {},
      },
    },
  };
  const module = { exports: {} };
  const mockRequire = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unexpected dependency: ${name}`);
  };

  vm.runInNewContext(
    `(function(require, module, exports) { ${hookCode}\n})`,
    { Object }
  )(mockRequire, module, module.exports);

  return { useLogin: module.exports.useLogin, toastErrors };
}

test("AuthServiceUnavailable muestra un mensaje temporal y permite reintentar", async () => {
  const { useLogin, toastErrors } = loadUseLogin(async () => ({
    error: "AuthServiceUnavailable",
  }));
  let reportedError;
  const hook = useLogin({ onError: (error) => (reportedError = error) });

  assert.equal(await hook.login("user@example.com", "password"), false);
  assert.equal(
    reportedError,
    "El inicio de sesión no está disponible en este momento. Inténtalo de nuevo más tarde."
  );
  assert.equal(toastErrors[0][1].description, reportedError);
});

test("CredentialsSignin conserva el mensaje genérico de credenciales", async () => {
  const { useLogin } = loadUseLogin(async () => ({ error: "CredentialsSignin" }));
  let reportedError;
  const hook = useLogin({ onError: (error) => (reportedError = error) });

  assert.equal(await hook.login("user@example.com", "password"), false);
  assert.equal(reportedError, "Email o contraseña incorrectos");
});

test("errores NextAuth desconocidos muestran indisponibilidad sin filtrar detalles", async () => {
  const internalError = "Callback: database password=private";
  const { useLogin, toastErrors } = loadUseLogin(async () => ({
    error: internalError,
  }));
  let reportedError;
  const hook = useLogin({ onError: (error) => (reportedError = error) });

  assert.equal(await hook.login("user@example.com", "password"), false);
  assert.equal(
    reportedError,
    "El inicio de sesión no está disponible en este momento. Inténtalo de nuevo más tarde."
  );
  assert.notEqual(reportedError, "Email o contraseña incorrectos");
  assert.equal(JSON.stringify(toastErrors).includes("private"), false);
  assert.equal(JSON.stringify(toastErrors).includes("Callback"), false);
});

test("conserva los mensajes explícitos de validación", async () => {
  const cases = [
    ["Email y contraseña son requeridos", "Por favor, completa todos los campos"],
    ["Error de configuración del usuario", "Error de configuración del usuario"],
  ];

  for (const [authError, expectedMessage] of cases) {
    const { useLogin } = loadUseLogin(async () => ({ error: authError }));
    let reportedError;
    const hook = useLogin({ onError: (error) => (reportedError = error) });

    assert.equal(await hook.login("user@example.com", "password"), false);
    assert.equal(reportedError, expectedMessage);
  }
});

test("las excepciones del cliente no exponen detalles internos", async () => {
  const { useLogin, toastErrors } = loadUseLogin(async () => {
    throw new Error("database password=private");
  });
  let reportedError;
  const hook = useLogin({ onError: (error) => (reportedError = error) });

  assert.equal(await hook.login("user@example.com", "password"), false);
  assert.equal(
    reportedError,
    "El inicio de sesión no está disponible en este momento. Inténtalo de nuevo más tarde."
  );
  assert.equal(JSON.stringify(toastErrors).includes("private"), false);
});
