// CJS is shared by the Node tests and the browser bundle.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parsePrice } = require("../utils/price-utils.js");

const normalized = (value) =>
  typeof value === "string" ? value.trim().toLocaleLowerCase("es") : "";

const capitalizeWords = (value) =>
  value
    .toLocaleLowerCase("es")
    .split(" ")
    .map((word) => word.charAt(0).toLocaleUpperCase("es") + word.slice(1))
    .join(" ");

function sameCatalogText(left, right) {
  return normalized(left) !== "" && normalized(left) === normalized(right);
}

function isCeramicsCategory(category) {
  return normalized(category).normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("ceramica");
}

function isStatuesCategory(category) {
  return normalized(category).normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("estatua");
}

function buildCatalogFamilyTitle(category, brand, line) {
  const placeholders = [
    new Set(["sin-categoria", "sin categoría", "sin_categoria"]),
    new Set(["sin-marca", "sin marca", "sin_marca"]),
    new Set(["sin-linea", "sin línea", "sin_linea", "sin"]),
  ];

  return [category, brand, line]
    .filter((value, index) => {
      const valueNormalized = normalized(value);
      return valueNormalized && !placeholders[index].has(valueNormalized) && !["true", "false"].includes(valueNormalized);
    })
    .map((value) => capitalizeWords(value.trim()))
    .join(" ");
}

function buildCatalogProductTitle(category, brand, line, productName) {
  const originalName = typeof productName === "string" ? productName.trim() : "";
  if (isCeramicsCategory(category) || isStatuesCategory(category)) {
    return originalName || buildCatalogFamilyTitle(category, "", line);
  }

  return buildCatalogFamilyTitle(category, brand, line) || capitalizeWords(originalName);
}

const readImage = (product) => product.image || product.src || "/placeholder.svg";

const formatVariantName = (product) => {
  const dimensions = [
    ["Aroma", product.aroma],
    ["Color", product.color],
    ["Tamaño", product.tamaño],
    ["Piedra", product.piedra],
    ["Cantidad", product.cantidad],
  ].filter(([, value]) => normalized(value));

  return dimensions.length
    ? dimensions.map(([label, value]) => `${label}: ${value.trim()}`).join(" · ")
    : "Variante";
};

function buildProductVariants(products, currentProduct, selectedLine) {
  const currentFamilyId = currentProduct.familyId ?? currentProduct.family?.id ?? null;
  const family = {
    category: normalized(currentProduct.category),
    // En productos con aroma, el nombre suele incluir el aroma (Rosas, Lavanda).
    // Sin aroma sí sirve como identificador del modelo.
    name: normalized(currentProduct.aroma) ? "" : normalized(currentProduct.name),
    marca: normalized(currentProduct.marca),
    linea: normalized(selectedLine || currentProduct.linea),
    tipo: normalized(currentProduct.tipo),
  };
  const uniqueProducts = new Map();

  [currentProduct, ...products].forEach((product) => {
    const matchesFamily =
      (currentFamilyId != null
        ? String(product.familyId ?? product.family?.id ?? "") === String(currentFamilyId)
        : product.familyId == null &&
      normalized(product.category) === family.category &&
      (!family.name || normalized(product.name) === family.name) &&
      normalized(product.marca) === family.marca &&
      normalized(product.linea) === family.linea &&
      normalized(product.tipo) === family.tipo);

    if (matchesFamily && product.id != null) {
      uniqueProducts.set(String(product.id), product);
    }
  });

  return Array.from(uniqueProducts.values()).map((product) => ({
    id: String(product.id),
    productName: product.name || "",
    description: product.description || "",
    name: formatVariantName(product),
    price: parsePrice(product.price),
    stock: Number(product.stock) || 0,
    aroma: typeof product.aroma === "string" ? product.aroma.trim() : "",
    linea: typeof product.linea === "string" ? product.linea.trim() : "",
    tamaño: typeof product.tamaño === "string" ? product.tamaño.trim() : "",
    cantidad: typeof product.cantidad === "string" ? product.cantidad.trim() : "",
    color: typeof product.color === "string" ? product.color.trim() : "",
    tipo: typeof product.tipo === "string" ? product.tipo.trim() : "",
    piedra: typeof product.piedra === "string" ? product.piedra.trim() : "",
    image: readImage(product),
  }));
}

function getInitialVariantId(variants, currentProduct) {
  const currentId = String(currentProduct.id);
  return variants.find((variant) => variant.id === currentId)?.id || variants[0]?.id || null;
}

module.exports = {
  buildCatalogProductTitle,
  buildCatalogFamilyTitle,
  buildProductVariants,
  getInitialVariantId,
  isCeramicsCategory,
  isStatuesCategory,
  sameCatalogText,
};
