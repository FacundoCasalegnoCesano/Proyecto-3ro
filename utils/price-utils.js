function parsePriceInput(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const text = value.trim().replace(/^\$\s*/, "").replace(/\s+/g, "");
  if (!text) return null;

  let normalized;
  if (/^-?\d+(?:\.\d{1,2})?$/.test(text)) {
    normalized = text;
  } else if (/^-?\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(text)) {
    normalized = text.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d+,\d{1,2}$/.test(text)) {
    normalized = text.replace(",", ".");
  } else {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePrice(value) {
  return parsePriceInput(value) ?? 0;
}

function formatPrice(value) {
  const amount = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
}

module.exports = { parsePrice, parsePriceInput, formatPrice };
