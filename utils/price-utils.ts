// utils/price-utils.ts
export const parsePrice = (priceString: string | number): number => {
  if (typeof priceString === 'number') {
    return priceString;
  }
  
  if (!priceString) return 0;
  
  // Si ya es un número en string sin formato
  if (/^\d+$/.test(priceString)) {
    return parseFloat(priceString) || 0;
  }
  
  // Si tiene formato "$1.000,00" o "1.000,00"
  const cleanPrice = priceString
    .replace('$', '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  
  const price = parseFloat(cleanPrice);
  return isNaN(price) ? 0 : price;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};