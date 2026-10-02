const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildRestockUpdateData,
  findProductVariant,
  sameProductVariant,
} = require("./productVariantMatcher.js");

const fragranceDimensions = ["marca", "aroma", "tipo"];

const product = (overrides = {}) => ({
  name: "Difusor",
  category: "Aromatizante de ambiente",
  marca: "Brisa",
  aroma: "Lavanda",
  tipo: "Repuesto",
  image: "https://images.example/lavanda.jpg",
  ...overrides,
});

test("dos aromas del mismo producto son variantes distintas y conservan sus fotos", () => {
  const lavanda = product();
  const vainilla = product({
    aroma: "Vainilla",
    image: "https://images.example/vainilla.jpg",
  });

  assert.equal(sameProductVariant(lavanda, vainilla, fragranceDimensions), false);
  const variants = [lavanda, vainilla];
  assert.equal(findProductVariant(variants, product({ aroma: "Vainilla" }), fragranceDimensions).image,
    "https://images.example/vainilla.jpg");
  assert.equal(findProductVariant(variants, product(), fragranceDimensions).image,
    "https://images.example/lavanda.jpg");
});

test("reponer una variante exacta usa incremento atómico y no actualiza sus fotos", () => {
  const update = buildRestockUpdateData(
    { stock: 4 },
    { quantity: 3, price: 1290, description: " Repuesto de difusor ", includeQuantity: false }
  );

  assert.deepEqual(update, {
    stock: { increment: 3 },
    precio: "1290",
    descripcion: "Repuesto de difusor",
  });
  assert.equal("imgUrl" in update, false);
  assert.equal("imgPublicId" in update, false);
});

test("dimension vacía normalizada no coincide con la dimensión con valor", () => {
  assert.equal(
    sameProductVariant(product({ aroma: null }), product({ aroma: "Lavanda" }), fragranceDimensions),
    false
  );
});

test("NULL y texto vacío histórico representan la misma dimensión ausente", () => {
  assert.equal(
    sameProductVariant(product({ aroma: null }), product({ aroma: "   " }), fragranceDimensions),
    true
  );
});

test("compara alias de Prisma y catálogo para línea, piedra y cantidad", () => {
  const dimensions = ["linea", "piedra", "cantidad"];
  assert.equal(
    sameProductVariant(
      product({ Linea: "Clásica", tipoPiedra: "Cuarzo", cantidad: "6" }),
      product({ linea: " clásica ", piedra: "cuarzo", cantidad: "6" }),
      dimensions
    ),
    true
  );
});
