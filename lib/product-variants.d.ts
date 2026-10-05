import type { Product } from "../app/types/product";

export function buildCatalogFamilyTitle(category?: string | null, brand?: string | null, line?: string | null): string;
export function buildCatalogProductTitle(category?: string | null, brand?: string | null, line?: string | null, productName?: string | null): string;
export function isCeramicsCategory(category?: string | null): boolean;
export function sameCatalogText(left?: string | null, right?: string | null): boolean;

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
