import type { Product } from "../app/types/product";

export interface ProductVariant {
  id: string;
  familyId?: number | null;
  productName: string;
  description: string;
  name: string;
  price: number;
  stock: number;
  aroma: string;
  linea: string;
  tamaño: string;
  cantidad: string;
  color: string;
  tipo: string;
  piedra: string;
  image: string;
}

export function buildProductVariants(
  products: Product[],
  currentProduct: Product,
  selectedLine?: string
): ProductVariant[];

export function getInitialVariantId(
  variants: ProductVariant[],
  currentProduct: Product
): string | null;
