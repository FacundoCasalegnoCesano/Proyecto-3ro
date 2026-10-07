const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

function loadTypeScriptModule(relativePath, dependencies) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const module = { exports: {} };
  const mockRequire = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unexpected import in guard test: ${name}`);
  };

  vm.runInNewContext(
    `(function(require, module, exports) { ${output}\n})`,
    { Object }
  )(mockRequire, module, module.exports);

  return module.exports;
}

const nextServer = {
  NextResponse: {
    json: (body, init) => ({ body, status: init?.status ?? 200 }),
  },
};

test("cart API rejects every method without database access", async () => {
  const route = loadTypeScriptModule("app/api/cart/route.ts", {
    "next/server": nextServer,
  });

  for (const method of ["GET", "POST", "PUT", "DELETE"]) {
    const result = await route[method]();
    assert.equal(result.status, 410, `${method} should be disabled`);
    assert.equal(result.body.success, false);
  }
});

test("order endpoint rejects checkout without database access", async () => {
  const route = loadTypeScriptModule(
    "app/api/orders/process/route.ts",
    { "next/server": nextServer }
  );

  const result = await route.POST();
  assert.equal(result.status, 410);
  assert.equal(result.body.success, false);
});

test("public reservation API rejects creation without side effects", async () => {
  let sideEffectCalls = 0;
  const route = loadTypeScriptModule("app/api/crearReserva/route.ts", {
    "next/server": nextServer,
    "../../../lib/googleCalendar": {
      getGoogleCalendarClient: async () => { sideEffectCalls += 1; },
      checkTimeSlotAvailability: async () => { sideEffectCalls += 1; },
    },
    nodemailer: { createTransport: () => { sideEffectCalls += 1; } },
  });

  const result = await route.POST({
    json: async () => { throw new Error("disabled endpoint should not read request body"); },
  });

  assert.equal(result.status, 410);
  assert.equal(result.body.success, false);
  assert.equal(sideEffectCalls, 0);
});

test("legacy cart and checkout URLs redirect to the public catalog", () => {
  const navigation = {
    redirect: (destination) => {
      throw { destination };
    },
  };

  for (const relativePath of [
    "app/(pages)/carrito/page.tsx",
    "app/(pages)/compra/page.tsx",
  ]) {
    const page = loadTypeScriptModule(relativePath, {
      "next/navigation": navigation,
    });

    assert.throws(() => page.default(), (error) => {
      assert.equal(error.destination, "/productos");
      return true;
    });
  }
});

test("public reservation URL redirects to the services showcase", () => {
  const navigation = {
    redirect: (destination) => {
      throw { destination };
    },
  };
  const page = loadTypeScriptModule("app/(pages)/reserva/page.tsx", {
    "next/navigation": navigation,
  });

  assert.throws(() => page.default(), (error) => {
    assert.equal(error.destination, "/servicios");
    return true;
  });
});
