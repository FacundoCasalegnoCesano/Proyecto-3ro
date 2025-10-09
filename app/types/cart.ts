// app/types/cart.ts
export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  // Nuevos campos para identificar el producto específico
  marca?: string
  categoria?: string
  linea?: string
  aroma?: string
  // Stock individual de ESTE producto específico
  stockIndividual: number
  // Campos adicionales según tu base de datos
  tamaño?: string
  color?: string
  tipo?: string
  piedra?: string
  cantidad?: string
}