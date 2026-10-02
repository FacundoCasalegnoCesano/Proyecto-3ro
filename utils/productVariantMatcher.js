/**
 * @typedef {Record<string, unknown>} VariantRecord
 */

const fieldAliases = {
  marca: ["marca"],
  aroma: ["aroma"],
  linea: ["linea", "Linea"],
  tamaño: ["tamaño"],
  color: ["color"],
  tipo: ["tipo"],
  piedra: ["piedra", "tipoPiedra"],
  cantidad: ["cantidad"],
};

/** @param {unknown} value */
function normalizeVariantValue(value) {
  return typeof value === "string" ? value.trim().toLocaleLowerCase() : "";
}

/**
 * Compare only the attributes configured as variant dimensions for this category.
 * Null, undefined, and whitespace-only values are equivalent.
 *
 * @param {VariantRecord} existing
 * @param {VariantRecord} incoming
 * @param {string[]} dimensions
 */
function sameProductVariant(existing, incoming, dimensions) {
  if (
    normalizeVariantValue(existing.name ?? existing.nombre) !==
      normalizeVariantValue(incoming.name ?? incoming.nombre) ||
    normalizeVariantValue(existing.category) !==
      normalizeVariantValue(incoming.category)
  ) {
    return false;
  }

  return dimensions.every((dimension) => {
    const aliases = fieldAliases[dimension] || [dimension];
    const existingValue = aliases.map((key) => existing[key]).find((value) => value !== undefined);
    const incomingValue = aliases.map((key) => incoming[key]).find((value) => value !== undefined);
    return normalizeVariantValue(existingValue) === normalizeVariantValue(incomingValue);
  });
}

/**
 * @template {VariantRecord} T
 * @param {T[]} products
 * @param {VariantRecord} incoming
 * @param {string[]} dimensions
 * @returns {T | undefined}
 */
function findProductVariant(products, incoming, dimensions) {
  return products.find((product) =>
    sameProductVariant(product, incoming, dimensions)
  );
}

/**
 * Build the fields changed when restocking a variant. Images are intentionally
 * omitted; changing a variant's image belongs to the explicit edit flow.
 *
 * @param {{stock: number}} existing
 * @param {{quantity: number, price: string | number, description: string, cantidad?: string | null, includeQuantity?: boolean}} input
 */
function buildRestockUpdateData(existing, input) {
  return {
    stock: { increment: input.quantity },
    precio: input.price.toString(),
    descripcion: input.description.trim(),
    ...(input.includeQuantity ? { cantidad: input.cantidad } : {}),
  };
}

module.exports = {
  normalizeVariantValue,
  sameProductVariant,
  findProductVariant,
  buildRestockUpdateData,
};
