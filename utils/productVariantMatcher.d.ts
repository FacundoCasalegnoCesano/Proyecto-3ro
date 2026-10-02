export type ProductVariant = object;

export function normalizeVariantValue(value: unknown): string;

export function sameProductVariant(
  existing: ProductVariant,
  incoming: object,
  dimensions: string[]
): boolean;

export function findProductVariant<T extends ProductVariant>(
  products: T[],
  incoming: object,
  dimensions: string[]
): T | undefined;

export function buildRestockUpdateData(
  existing: { stock: number },
  input: {
    quantity: number;
    price: string | number;
    description: string;
    cantidad?: string | null;
    includeQuantity?: boolean;
  }
): {
  stock: { increment: number };
  precio: string;
  descripcion: string;
  cantidad?: string | null;
};
