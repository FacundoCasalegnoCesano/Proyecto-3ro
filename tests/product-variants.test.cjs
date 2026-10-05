const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildCatalogProductTitle,
  buildCatalogFamilyTitle,
  buildProductVariants,
  getInitialVariantId,
  isCeramicsCategory,
  isStatuesCategory,
  sameCatalogText,
} = require("../lib/product-variants.js");
const { parsePrice, parsePriceInput, formatPrice } = require("../utils/price-utils.js");

test("forma el título del grupo con categoría, marca y línea, omitiendo campos vacíos", () => {
  assert.equal(
    buildCatalogFamilyTitle("sahumerios", "sagrada madre", "cannabis"),
    "Sahumerios Sagrada Madre Cannabis"
  );
  assert.equal(
    buildCatalogFamilyTitle("aceites esenciales", "casa del aroma", "sueños"),
    "Aceites Esenciales Casa Del Aroma Sueños"
  );
  assert.equal(buildCatalogFamilyTitle("Sahumerios", "Sagrada Madre", ""), "Sahumerios Sagrada Madre");
  assert.equal(buildCatalogFamilyTitle("Sahumerios", "", "Común"), "Sahumerios Común");
  assert.equal(buildCatalogFamilyTitle("Sin categoría", "Sin marca", "sin-linea"), "");
  assert.equal(sameCatalogText(" Cannabis ", "cannabis"), true);
  assert.equal(sameCatalogText("Modelo A", "Cannabis"), false);
});

test("conserva el nombre cargado para cerámica y estatuas, y mantiene el título por categoría para otras familias", () => {
  assert.equal(isCeramicsCategory("Cerámica artesanal"), true);
  assert.equal(isCeramicsCategory("CERAMICA"), true);
  assert.equal(isCeramicsCategory("Sahumerios"), false);
  assert.equal(isStatuesCategory("Estatua"), true);
  assert.equal(isStatuesCategory("ESTATUAS decorativas"), true);
  assert.equal(isStatuesCategory("Sahumerios"), false);
  assert.equal(
    buildCatalogProductTitle("Cerámica", "Taller Sur", "Rústica", "Cuenco OM / Portasahumerio LED"),
    "Cuenco OM / Portasahumerio LED"
  );
  assert.equal(
    buildCatalogProductTitle("Ceramica", "", "", ""),
    "Ceramica"
  );
  assert.equal(
    buildCatalogProductTitle("Estatuas", "Taller Sur", "Piedra", "Virgen María 3D"),
    "Virgen María 3D"
  );
  assert.equal(
    buildCatalogProductTitle("Estatua", "", "", ""),
    "Estatua"
  );
  assert.equal(
    buildCatalogProductTitle("Sahumerios", "Aroma Sur", "Clásica", "Sahumerio clásico"),
    "Sahumerios Aroma Sur Clásica"
  );
});

const fixture = [
  {
    id: 11,
    name: "Sahumerio clásico Lavanda",
    category: "Sahumerios",
    marca: "Aroma Sur",
    linea: "Clásica",
    tipo: "Varilla",
    aroma: "Lavanda",
    color: "",
    tamaño: "",
    piedra: "",
    cantidad: "",
    price: "$1200",
    stock: 2,
    image: "/fixture/lavanda.jpg",
    description: "Sahumerio aromático de lavanda.",
  },
  {
    id: 12,
    name: "Sahumerio clásico Rosas",
    category: "Sahumerios",
    marca: "Aroma Sur",
    linea: "Clásica",
    tipo: "Varilla",
    aroma: "Rosa",
    color: "",
    tamaño: "",
    piedra: "",
    cantidad: "",
    price: "$1300",
    stock: 4,
    image: "/fixture/rosa.jpg",
    description: "Sahumerio floral de rosas.",
  },
  {
    id: 13,
    name: "Sahumerio clásico",
    category: "Sahumerios",
    marca: "Aroma Sur",
    linea: "Clásica",
    tipo: "Varilla",
    aroma: "Lavanda",
    color: "Verde",
    tamaño: "Grande",
    piedra: "",
    cantidad: "",
    price: "$1400",
    stock: 0,
    image: "/fixture/lavanda-verde.jpg",
  },
  {
    id: 14,
    name: "Sahumerio clásico Vainilla",
    category: "Sahumerios",
    marca: "Aroma Sur",
    linea: "Clásica",
    tipo: "Varilla",
    aroma: "Vainilla",
    color: "",
    tamaño: "",
    piedra: "",
    cantidad: "",
    price: "$2000",
    stock: 8,
    image: "/fixture/premium.jpg",
  },
  {
    id: 15,
    name: "Sahumerio clásico",
    category: "Sahumerios",
    marca: "Aroma Sur",
    linea: "Premium",
    tipo: "Varilla",
    aroma: "Vainilla",
    color: "",
    tamaño: "",
    piedra: "",
    cantidad: "",
    price: "$2000",
    stock: 8,
    image: "/fixture/otra-linea.jpg",
  },
  {
    id: 16,
    name: "Sahumerio clásico",
    category: "Sahumerios",
    marca: "Aroma Sur",
    linea: "Clásica",
    tipo: "Cono",
    aroma: "Vainilla",
    color: "",
    tamaño: "",
    piedra: "",
    cantidad: "",
    price: "$2000",
    stock: 8,
    image: "/fixture/otro-tipo.jpg",
  },
];

test("preserva filas aunque el nombre cambie con el aroma y excluye otras líneas y tipos", () => {
  const current = fixture[0];
  const variants = buildProductVariants(fixture.slice(1), current);

  assert.deepEqual(
    variants.map(({ id, image }) => [id, image]),
    [
      ["11", "/fixture/lavanda.jpg"],
      ["12", "/fixture/rosa.jpg"],
      ["13", "/fixture/lavanda-verde.jpg"],
      ["14", "/fixture/premium.jpg"],
    ]
  );
  assert.equal(variants[2].stock, 0);
  assert.equal(variants[2].name, "Aroma: Lavanda · Color: Verde · Tamaño: Grande");
  assert.equal(variants[1].productName, "Sahumerio clásico Rosas");
  assert.equal(variants[1].description, "Sahumerio floral de rosas.");
});

test("usa el nombre como modelo cuando el producto no tiene aroma", () => {
  const current = {
    ...fixture[0],
    id: 21,
    name: "Porta sahumerio de madera",
    aroma: "",
  };
  const sameModel = { ...current, id: 22, color: "Nogal" };
  const otherModel = { ...current, id: 23, name: "Porta sahumerio de cerámica" };

  const variants = buildProductVariants([sameModel, otherModel], current);

  assert.deepEqual(variants.map((variant) => variant.id), ["21", "22"]);
});

test("selecciona inicialmente la variante por id, aunque comparta aroma", () => {
  const current = fixture[2];
  const variants = buildProductVariants(fixture, current);

  assert.equal(getInitialVariantId(variants, current), "13");
});

test("usa la relación explícita de familia y evita inferirla por atributos", () => {
  const current = { ...fixture[0], familyId: 7 };
  const sameFamily = { ...fixture[1], familyId: 7 };
  const looksSimilar = { ...fixture[2], familyId: 8 };

  const variants = buildProductVariants([sameFamily, looksSimilar], current);

  assert.deepEqual(variants.map((variant) => variant.id), ["11", "12"]);
});

test("agrupa velas individuales por familia y no incorpora familias vecinas ni filas legacy", () => {
  const current = { id: 31, name: "Vela", category: "Vela", familyId: 70, tamaño: "Chica", color: "Blanca", price: 1000 };
  const sameFamily = { ...current, id: 32, tamaño: "Grande", color: "Roja" };
  const otherFamily = { ...sameFamily, id: 33, familyId: 71 };
  const legacy = { ...sameFamily, id: 34, familyId: null };

  const variants = buildProductVariants([sameFamily, otherFamily, legacy], current);
  assert.deepEqual(variants.map((variant) => variant.id), ["31", "32"]);
  assert.equal(variants[1].tamaño, "Grande");
  assert.equal(variants[1].color, "Roja");

  const legacyVariants = buildProductVariants([sameFamily, legacy], legacy);
  assert.deepEqual(legacyVariants.map((variant) => variant.id), ["34"]);
});

test("mantiene compatibilidad con productos antiguos sin familyId", () => {
  const current = fixture[0];
  const variants = buildProductVariants(fixture.slice(1), current);

  assert.deepEqual(variants.map((variant) => variant.id), ["11", "12", "13", "14"]);
});

test("parsea importes ARS y decimales crudos sin aceptar basura", () => {
  assert.equal(parsePriceInput(1290), 1290);
  assert.equal(parsePriceInput("1290.50"), 1290.5);
  assert.equal(parsePriceInput("$1.290,50"), 1290.5);
  assert.equal(parsePriceInput("1.290"), 1290);
  assert.equal(parsePriceInput("12,50"), 12.5);
  assert.equal(parsePriceInput("1290pesos"), null);
  assert.equal(parsePriceInput("Infinity"), null);
  assert.equal(parsePrice("1290pesos"), 0);
  assert.match(formatPrice(parsePrice("$1.290,50")), /\$\s?1\.290,50/);
});
