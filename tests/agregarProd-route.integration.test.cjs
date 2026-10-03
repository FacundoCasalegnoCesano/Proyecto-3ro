const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const variantMatcher = require("../utils/productVariantMatcher.js");

const routePath = path.join(__dirname, "../app/api/agregarProd/route.ts");
const routeSource = fs.readFileSync(routePath, "utf8");
const authUtilsPath = path.join(__dirname, "../lib/auth-utils.ts");
const authUtilsJavaScript = ts.transpileModule(
  fs.readFileSync(authUtilsPath, "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }
).outputText;
const routeJavaScript = ts.transpileModule(routeSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

function loadPostHandler(state, role = "admin") {
  const prisma = {
    productFamily: {
      findUnique: async ({ where }) =>
        state.families?.find((family) => family.key === where.key) || null,
      upsert: async ({ where, create, update }) => {
        state.families = state.families || [];
        let family = state.families.find((item) => item.key === where.key);
        if (!family) {
          family = { id: state.families.length + 1, ...create };
          state.families.push(family);
        } else {
          Object.assign(family, update);
        }
        return family;
      },
    },
    user: {
      findUnique: async ({ where }) => {
        const user = state.users?.find((item) => item.id === where.id);
        return user ? { rol: user.rol } : null;
      },
    },
    products: {
      findMany: async ({ where }) =>
        state.products.filter(
          (product) =>
            !where?.nombre ||
            (product.nombre.trim().toLowerCase() === where.nombre.trim().toLowerCase() &&
              product.category.trim().toLowerCase() === where.category.trim().toLowerCase())
        ),
      create: async ({ data }) => {
        const product = { id: state.nextId++, ...data };
        state.products.push(product);
        return product;
      },
      findUnique: async ({ where }) =>
        state.products.find((product) => product.id === where.id) || null,
      update: async ({ where, data }) => {
        const product = state.products.find((item) => item.id === where.id);
        if (data.stock && typeof data.stock === "object") {
          data = { ...data, stock: product.stock + data.stock.increment };
        }
        Object.assign(product, data);
        return product;
      },
      updateMany: async ({ where, data }) => {
        const product = state.products.find((item) => item.id === where.id);
        if (!product) return { count: 0 };
        if (where.stock?.lte !== undefined && product.stock > where.stock.lte) return { count: 0 };
        if (where.stock?.gte !== undefined && product.stock < where.stock.gte) return { count: 0 };
        if (where.stock !== undefined && typeof where.stock === "number" && product.stock !== where.stock) return { count: 0 };
        if (typeof data.stock === "number") product.stock = data.stock;
        else if (data.stock?.increment !== undefined) product.stock += data.stock.increment;
        else if (data.stock?.decrement !== undefined) product.stock -= data.stock.decrement;
        return { count: 1 };
      },
    },
    categoryMarca: {
      upsert: async () => {
        state.optionWrites = (state.optionWrites || 0) + 1;
        return {};
      },
      create: async () => {
        state.legacyWrites = (state.legacyWrites || 0) + 1;
        return {};
      },
    },
    deliver: { findFirst: async () => ({ id: 10, empresa: { nombre: "Envío Gratis" } }) },
  };
  prisma.$transaction = async (callback) => callback(prisma);

  const session = role
    ? { user: { id: 1, rol: role } }
    : null;
  const authModule = { exports: {} };
  const authRequire = (specifier) => {
    if (specifier === "next-auth/next") {
      return { getServerSession: async () => session };
    }
    if (specifier === "auth.config") return { authOptions: {} };
    if (specifier === "lib/prisma") return { prisma };
    throw new Error(`Unexpected auth dependency: ${specifier}`);
  };
  vm.runInNewContext(
    authUtilsJavaScript,
    {
      exports: authModule.exports,
      module: authModule,
      require: authRequire,
      console: { log() {}, error() {} },
    },
    { filename: authUtilsPath }
  );
  state.users = state.users || [{ id: 1, rol: state.dbRole || role }];

  const mockedRequire = (specifier) => {
    if (specifier === "next/server") {
      return { NextResponse: { json: (body, init) => Response.json(body, init) } };
    }
    if (specifier === "lib/prisma") return { prisma };
    if (specifier === "lib/auth-utils") return authModule.exports;
    if (specifier === "@prisma/client") return { Prisma: {} };
    if (specifier === "utils/productVariantMatcher") return variantMatcher;
    if (specifier === "utils/price-utils") return require("../utils/price-utils.js");
    if (specifier === "crypto") return require("node:crypto");
    throw new Error(`Unexpected route dependency: ${specifier}`);
  };

  const module = { exports: {} };
  const sandbox = {
    exports: module.exports,
    module,
    require: mockedRequire,
    __filename: routePath,
    __dirname: path.dirname(routePath),
    Response,
    URL,
    console: { log() {}, error(...args) { state.errors = [...(state.errors || []), args.map((value) => value?.stack || String(value))]; } },
  };
  vm.runInNewContext(routeJavaScript, sandbox, { filename: routePath });
  return module.exports;
}

async function post(handler, payload) {
  const response = await handler({ json: async () => payload });
  return { status: response.status, body: await response.json() };
}

function fragrancePayload(aroma, imgUrl, imgPublicId = `id-${aroma}`) {
  return {
    nombre: "Difusor",
    precio: "1200",
    descripcion: "Difusor para ambientes de hogar",
    imgUrl,
    imgPublicId,
    category: "Aromatizante de ambiente",
    marca: "Brisa",
    aroma,
    linea: "Casa",
    cantidad: "2",
  };
}

test("POST crea aromas con fotos propias y reponer stock conserva la foto guardada", async () => {
  const state = { products: [], nextId: 1 };
  const route = loadPostHandler(state);

  const lavanda = await post(route.POST, fragrancePayload("Lavanda", "https://img.test/lavanda.jpg"));
  const vainilla = await post(route.POST, fragrancePayload("Vainilla", "https://img.test/vainilla.jpg"));
  const reponerLavanda = await post(
    route.POST,
    fragrancePayload("Lavanda", "https://img.test/reemplazo.jpg", "id-reemplazo")
  );

  assert.equal(lavanda.status, 201);
  assert.equal(vainilla.status, 201);
  assert.equal(reponerLavanda.status, 200);
  assert.equal(state.products.length, 2);

  const savedLavanda = state.products.find((product) => product.aroma === "Lavanda");
  const savedVainilla = state.products.find((product) => product.aroma === "Vainilla");
  assert.equal(savedLavanda.imgUrl, "https://img.test/lavanda.jpg");
  assert.equal(savedLavanda.imgPublicId, "id-Lavanda");
  assert.equal(savedLavanda.stock, 4);
  assert.equal(savedVainilla.imgUrl, "https://img.test/vainilla.jpg");
  assert.equal(savedVainilla.imgPublicId, "id-Vainilla");
});

test("POST treats an absent optional dimension as distinct from an existing value", async () => {
  const state = { products: [], nextId: 1 };
  const route = loadPostHandler(state);
  const base = {
    nombre: "Pulsera",
    precio: "900",
    descripcion: "Pulsera de piedra natural",
    category: "Accesorios",
    tipo: "Anillo",
    cantidad: "1",
  };

  const conPiedra = await post(route.POST, {
    ...base,
    piedra: "Onix",
    imgUrl: "https://img.test/onix.jpg",
    imgPublicId: "id-onix",
  });
  const sinPiedra = await post(route.POST, {
    ...base,
    imgUrl: "https://img.test/sin-piedra.jpg",
    imgPublicId: "id-sin-piedra",
  });
  const reponerSinPiedra = await post(route.POST, {
    ...base,
    imgUrl: "https://img.test/otra-foto.jpg",
    imgPublicId: "id-otra-foto",
  });

  assert.equal(conPiedra.status, 201);
  assert.equal(sinPiedra.status, 201);
  assert.equal(reponerSinPiedra.status, 200);
  assert.equal(state.products.length, 2);
  assert.equal(state.products.find((product) => product.tipoPiedra === "Onix").imgUrl,
    "https://img.test/onix.jpg");
  const sinPiedraRow = state.products.find((product) => product.tipoPiedra === null);
  assert.equal(sinPiedraRow.imgUrl, "https://img.test/sin-piedra.jpg");
  assert.equal(sinPiedraRow.stock, 2);
});

test("PUT cambia la foto de la variante solo desde la edición explícita", async () => {
  const state = {
    nextId: 2,
    products: [
      {
        id: 1,
        nombre: "Difusor",
        descripcion: "Difusor para ambientes de hogar",
        precio: "1200",
        imgUrl: "https://img.test/lavanda.jpg",
        imgPublicId: "id-lavanda",
        category: "Aromatizante de ambiente",
        marca: "Brisa",
        aroma: "Lavanda",
        Linea: "Casa",
        tamaño: null,
        color: null,
        tipo: null,
        tipoPiedra: null,
        cantidad: null,
        stock: 4,
        empresaEnvios: 10,
      },
    ],
  };
  const route = loadPostHandler(state);
  const response = await post(route.PUT, {
    id: 1,
    nombre: "Difusor",
    precio: "1200",
    descripcion: "Difusor para ambientes de hogar",
    imgUrl: "https://img.test/lavanda-edicion.jpg",
    imgPublicId: "id-lavanda-editada",
    category: "Aromatizante de ambiente",
    marca: "Brisa",
    aroma: "Lavanda",
    linea: "Casa",
  });

  assert.equal(response.status, 200);
  assert.equal(state.products[0].imgUrl, "https://img.test/lavanda-edicion.jpg");
  assert.equal(state.products[0].imgPublicId, "id-lavanda-editada");
  assert.equal(state.products[0].stock, 4);
});

test("las cuatro mutaciones rechazan sesiones anónimas, clientes y vendedores antes de escribir", async () => {
  for (const role of [null, "user", "vendedor"]) {
    const state = { products: [], nextId: 1, dbRole: role };
    const route = loadPostHandler(state, role);
    const body = { id: 1, nombre: "x", precio: "1", descripcion: "x", imgUrl: "x", stock: 2 };
    const methods = [
      ["POST", () => post(route.POST, fragrancePayload("Lavanda", "https://img.test/x.jpg"))],
      ["PUT", () => post(route.PUT, body)],
      ["PATCH", () => post(route.PATCH, body)],
      ["DELETE", async () => {
        const response = await route.DELETE({ url: "http://localhost/api/agregarProd?id=1" });
        return { status: response.status, body: await response.json() };
      }],
    ];
    for (const [method, invoke] of methods) {
      const response = await invoke();
      assert.equal(response.status, role ? 403 : 401, `${method} role=${role}`);
    }
    assert.equal(state.products.length, 0);
  }
});

test("el rol de administrador se valida contra la base de datos", async () => {
  const state = { products: [], nextId: 1, dbRole: "user" };
  const route = loadPostHandler(state, "admin");
  const response = await post(route.POST, fragrancePayload("Lavanda", "https://img.test/x.jpg"));
  assert.equal(response.status, 403);
  assert.equal(state.products.length, 0);
});

test("GET del catálogo permanece público y no ejecuta operaciones de guardado heredadas", async () => {
  const state = { products: [], nextId: 1 };
  const route = loadPostHandler(state, null);
  const response = await route.GET({
    url: "http://localhost/api/agregarProd?saveMarca=true&category=Accesorios&marca=Brisa",
  });

  assert.equal(response.status, 200, JSON.stringify(state.errors));
  assert.deepEqual(await response.json(), { success: true, data: [] });
  assert.equal(state.optionWrites || 0, 0);
  assert.equal(state.legacyWrites || 0, 0);
});

test("POST guarda opciones de catálogo para admin", async () => {
  const state = { products: [], nextId: 1, dbRole: "admin" };
  const route = loadPostHandler(state);
  const response = await post(route.POST, {
    catalogOption: "marca",
    category: "Accesorios",
    marca: " Brisa ",
  });
  assert.equal(response.status, 200);
  assert.equal(state.optionWrites, 1);
});

test("POST mantiene separados modelos distintos aunque compartan variante visible", async () => {
  const state = { products: [], nextId: 1, dbRole: "admin" };
  const route = loadPostHandler(state);
  const base = {
    nombre: "Sahumerio",
    precio: "1.290,50",
    descripcion: "Sahumerio artesanal",
    category: "Sahumerios",
    marca: "Brisa",
    aroma: "Lavanda",
    linea: "Calma",
    cantidad: "1",
  };
  const modelA = await post(route.POST, {
    ...base,
    familyName: "Modelo A",
    imgUrl: "https://img.test/modelo-a.jpg",
  });
  const modelB = await post(route.POST, {
    ...base,
    familyName: "Modelo B",
    imgUrl: "https://img.test/modelo-b.jpg",
  });
  const restockA = await post(route.POST, {
    ...base,
    familyName: "Modelo A",
    imgUrl: "https://img.test/no-debe-reemplazar.jpg",
  });

  assert.equal(modelA.status, 201);
  assert.equal(modelB.status, 201);
  assert.equal(restockA.status, 200);
  assert.equal(state.products.length, 2);
  assert.equal(state.products.find((product) => product.familyId === 1).imgUrl, "https://img.test/modelo-a.jpg");
  assert.equal(state.products.find((product) => product.familyId === 1).stock, 2);
  assert.equal(state.products.find((product) => product.familyId === 2).imgUrl, "https://img.test/modelo-b.jpg");
  assert.equal(state.products.find((product) => product.familyId === 2).stock, 1);
  assert.equal(state.products[0].precio, "1290.5");
});

test("POST crea cargas separadas para líneas distintas y repone sólo dentro de la línea", async () => {
  const state = { products: [], nextId: 1, dbRole: "admin" };
  const route = loadPostHandler(state);
  const base = {
    nombre: "Sahumerio White Widow",
    precio: "1.290",
    descripcion: "Sahumerio artesanal",
    category: "Sahumerios",
    marca: "Sagrada Madre",
    aroma: "White Widow",
    cantidad: "1",
    familyName: "Cannabis",
    imgUrl: "https://img.test/white-widow.jpg",
  };

  const cannabis = await post(route.POST, { ...base, linea: "Cannabis" });
  const comun = await post(route.POST, { ...base, linea: "Común" });
  const restockCannabis = await post(route.POST, { ...base, linea: "Cannabis" });

  assert.equal(cannabis.status, 201);
  assert.equal(comun.status, 201);
  assert.equal(restockCannabis.status, 200);
  assert.equal(state.products.length, 2);
  assert.notEqual(state.products[0].familyId, state.products[1].familyId);
  assert.equal(state.products.find((product) => product.Linea === "Cannabis").stock, 2);
  assert.equal(state.products.find((product) => product.Linea === "Común").stock, 1);
});

test("POST rechaza precios parciales, no finitos o negativos", async () => {
  const state = { products: [], nextId: 1 };
  const route = loadPostHandler(state);
  for (const precio of ["12abc", "Infinity", "-2"]) {
    const response = await post(route.POST, {
      ...fragrancePayload("Lavanda", "https://img.test/x.jpg"),
      precio,
    });
    assert.equal(response.status, 400);
  }
  assert.equal(state.products.length, 0);
});

test("POST cantidad y PUT stock rechazan parciales, vacíos y valores fuera de Int32", async () => {
  for (const cantidad of ["2abc", "1.5", "", " ", 2147483648]) {
    const state = { products: [], nextId: 1, dbRole: "admin" };
    const route = loadPostHandler(state);
    const response = await post(route.POST, {
      ...fragrancePayload("Lavanda", "https://img.test/x.jpg"),
      cantidad,
    });
    assert.equal(response.status, 400, `cantidad=${JSON.stringify(cantidad)}`);
  }

  for (const stock of [-1, 1.5, "2abc", "", " ", 2147483648]) {
    const state = {
      products: [{
        id: 1, nombre: "Difusor", descripcion: "Desc", precio: "1200",
        imgUrl: "https://img.test/x.jpg", imgPublicId: "x", category: "Aromatizante",
        marca: "Brisa", aroma: "Lavanda", Linea: "Casa", tamaño: null, color: null,
        tipo: null, tipoPiedra: null, cantidad: null, stock: 4, empresaEnvios: 10,
      }],
      nextId: 2,
      dbRole: "admin",
    };
    const route = loadPostHandler(state);
    const response = await post(route.PUT, {
      id: 1, nombre: "Difusor", precio: "1200", descripcion: "Desc",
      imgUrl: "https://img.test/x.jpg", category: "Aromatizante", stock,
    });
    assert.equal(response.status, 400, `stock=${JSON.stringify(stock)}`);
    assert.equal(state.products[0].stock, 4);
  }
});

test("PATCH valida stock entero y mantiene incrementos/decrementos atómicos", async () => {
  const state = {
    products: [{ id: 1, nombre: "Producto", precio: "10", imgUrl: "x", descripcion: "x", category: "Accesorios", stock: 0 }],
    nextId: 2,
    dbRole: "admin",
  };
  const route = loadPostHandler(state);

  for (const stock of [-2, 1.5, "2abc", "", 2147483648]) {
    const response = await post(route.PATCH, { id: 1, stock });
    assert.equal(response.status, 400, `stock=${JSON.stringify(stock)}`);
  }
  assert.equal(state.products[0].stock, 0);

  const increments = await Promise.all([
    post(route.PATCH, { id: 1, operation: "increment", stock: 2 }),
    post(route.PATCH, { id: 1, operation: "increment", stock: 3 }),
  ]);
  assert.deepEqual(increments.map((response) => response.status), [200, 200]);
  assert.equal(state.products[0].stock, 5);

  const decrement = await post(route.PATCH, { id: 1, operation: "decrement", stock: 10 });
  assert.equal(decrement.status, 200);
  assert.equal(state.products[0].stock, 0);
});
