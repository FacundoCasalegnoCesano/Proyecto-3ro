const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { Prisma } = require("@prisma/client");

const routePath = path.join(__dirname, "../app/api/catalogo/route.ts");
const routeCode = ts.transpileModule(fs.readFileSync(routePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;

function loadRoute() {
  const state = { queries: [] };
  const prisma = {
    $queryRaw: async (query) => {
      state.queries.push(query);
      if (query.sql.includes("group_sizes")) return [{ total: 10n, grouped: 1n, individual: 9n }];
      if (query.sql.includes("LIMIT")) {
        return [
          { group_key: "family:4", representative_id: 2 },
          ...Array.from({ length: 5 }, (_, index) => ({ group_key: "product:" + (index + 10), representative_id: index + 10 })),
        ];
      }
      return [
        ...Array.from({ length: 8 }, (_, index) => ({
          id: index + 1, nombre: "Sahumerio " + (index + 1), descripcion: "Aroma lavanda",
          precio: "1290.50", imgUrl: "https://img.test/" + (index + 1) + ".jpg",
          category: "Sahumerios", marca: "Brisa", aroma: index === 0 ? "Lavanda" : "Aroma " + (index + 1),
          Linea: "Calma", tipo: "Varilla", stock: 2, familyId: 4, familyName: "Calma",
          matchesSearch: index === 0 ? 1 : 0, shipping: "Envío Gratis",
        })),
        ...Array.from({ length: 5 }, (_, index) => ({
          id: index + 10, nombre: "Accesorio " + index, descripcion: "Artículo individual",
          precio: "700", imgUrl: "https://img.test/single-" + index + ".jpg",
          category: "Accesorios", stock: 1, familyId: null, familyName: null,
          matchesSearch: 1, shipping: "Envío Gratis",
        })),
      ];
    },
  };
  const module = { exports: {} };
  const mockedRequire = (specifier) => {
    if (specifier === "next/server") return { NextResponse: { json: (body, init) => Response.json(body, init) } };
    if (specifier === "@prisma/client") return { Prisma };
    if (specifier === "lib/prisma") return { prisma };
    throw new Error("Unexpected dependency: " + specifier);
  };
  vm.runInNewContext(routeCode, { exports: module.exports, module, require: mockedRequire, Response }, { filename: routePath });
  return { route: module.exports, state };
}

function request(query) {
  const url = new URL("http://localhost/api/catalogo?" + query);
  return { nextUrl: { searchParams: url.searchParams } };
}

test("pagina por grupos y devuelve todas las variantes de cada grupo elegido", async () => {
  const { route, state } = loadRoute();
  const response = await route.GET(request("page=1&limit=6&search=Lavanda&sort=price-low"));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.pagination.total, 10);
  assert.equal(body.pagination.totalPages, 2);
  assert.equal(body.pagination.grouped, 1);
  assert.equal(body.data.length, 13);
  assert.equal(body.data.filter((product) => product.familyId === 4).length, 8);
  assert.equal(body.data.filter((product) => product.matchesSearch).length, 6);
  assert.equal(state.queries.length, 3);
  assert.ok(state.queries[0].sql.includes("LIMIT"));
  assert.ok(state.queries[0].values.includes(6));
  assert.ok(state.queries[0].values.includes(0));
});

test("valida página y límite máximo sin consultar la base", async () => {
  const { route, state } = loadRoute();
  for (const query of ["page=0&limit=6", "page=1&limit=49", "page=1.5&limit=6"]) {
    const response = await route.GET(request(query));
    assert.equal(response.status, 400);
  }
  assert.equal(state.queries.length, 0);
});
