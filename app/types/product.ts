// types/product.ts
export interface Product {
  tamaño: string; // ← Cambiar de boolean a string
  cantidad: string; // ← Cambiar de boolean a string
  color: string; // ← Cambiar de boolean a string
  tipo: string; // ← Cambiar de boolean a string
  piedra: string; // ← Cambiar de boolean a string
  linea: string | boolean;
  metadata: Record<string, unknown>;
  marca: string;
  stock: number;
  aroma: string | null;
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  shipping: string;
  src: string;
  description?: string;
}
