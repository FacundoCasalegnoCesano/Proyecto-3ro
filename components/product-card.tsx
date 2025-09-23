"use client"

import Image from "next/image"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "../contexts/cart-context"
import { Product } from "app/types/product"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: Product
  marcaSeleccionada?: string
  lineaSeleccionada?: string
  esProductoAgrupado?: boolean
}

export function ProductCard({ product, marcaSeleccionada, lineaSeleccionada, esProductoAgrupado = false }: ProductCardProps) {
  const { addItem } = useCart()
  const router = useRouter()

  // Función para capitalizar la primera letra de cada palabra
  const capitalizarPalabras = (texto: string): string => {
    if (!texto) return texto;
    return texto
      .toLowerCase()
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  // Función especial para capitalizar nombres de líneas
  const capitalizarLinea = (linea: string): string => {
    if (!linea) return linea;
    
    // Si la línea es "sin-linea", retornar texto descriptivo
    if (linea === 'sin-linea') {
      return 'Línea Estándar';
    }
    
    return capitalizarPalabras(linea);
  }

  const handleAddToCart = () => {
    // Solo permitir agregar al carrito si NO es un producto agrupado
    if (esProductoAgrupado) return;
    
    // Convertir precio string a número
    const priceNumber = Number.parseFloat(product.price.replace("$", ""))

    addItem({
      id: product.id,
      name: product.name, // El nombre ya viene capitalizado desde el grid
      price: priceNumber,
      image: product.image,
    })
  }

  const handleCardClick = () => {
    // Construir URL con los parámetros de marca y línea
    const params = new URLSearchParams()
    
    // Asegurarnos de que solo pasemos strings válidos
    const marca = typeof marcaSeleccionada === 'string' ? marcaSeleccionada : 
                 typeof product.marca === 'string' ? product.marca : '';
    
    const linea = typeof lineaSeleccionada === 'string' ? lineaSeleccionada : 
                 typeof product.linea === 'string' ? product.linea : '';

    if (marca) {
      params.append('marca', marca)
    }
    
    if (linea) {
      params.append('linea', linea)
    }

    const queryString = params.toString()
    const url = `/productos/${product.id}${queryString ? `?${queryString}` : ''}`
    
    router.push(url)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevenir que el click se propague al card
    handleCardClick()
  }

  // Función para obtener el texto de línea de forma segura y capitalizada
  const getLineaText = (): string | undefined => {
    if (typeof lineaSeleccionada === 'string') return capitalizarLinea(lineaSeleccionada);
    if (typeof product.linea === 'string') return capitalizarLinea(product.linea);
    return undefined;
  }

  const lineaText = getLineaText();

  // Capitalizar el nombre del producto para mostrarlo (por si acaso)
  const nombreCapitalizado = capitalizarPalabras(product.name);

  return (
    <Card 
      className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onClick={handleImageClick}
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight">{nombreCapitalizado}</h3>
          <p className="text-xl font-bold text-babalu-primary">{product.price}</p>
          <p className="text-sm text-green-600 font-medium">{product.shipping}</p>

          {/* Mostrar información de línea si está disponible */}
          {lineaText && (
            <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
              Línea: {lineaText}
            </p>
          )}

          {/* Botón de agregar al carrito - SOLO para productos NO agrupados */}
          {!esProductoAgrupado ? (
            <Button
              onClick={(e) => {
                e.stopPropagation() // Prevenir navegación al hacer click en el botón
                handleAddToCart()
              }}
              className="w-full bg-babalu-primary hover:bg-babalu-dark text-white mt-3"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Agregar al Carrito
            </Button>
          ) : (
            <div className="text-center py-2 mt-3 bg-gray-100 rounded text-sm text-gray-600">
              Haz clic para ver los aromas disponibles
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}