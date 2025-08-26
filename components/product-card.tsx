"use client"

import Image from "next/image"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "../contexts/cart-context"
import { Product } from "app/types/product" // Importar la interfaz compartida

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    // Convertir precio string a número
    const priceNumber = Number.parseFloat(product.price.replace("$", ""))

    addItem({
      id: product.id,
      name: product.name,
      price: priceNumber,
      image: product.image,
    })
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden cursor-pointer">
          <Image
            src={product.image || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onClick={() => (window.location.href = `/productos/${product.id}`)}
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight">{product.name}</h3>
          <p className="text-xl font-bold text-babalu-primary">{product.price}</p>
          <p className="text-sm text-green-600 font-medium">{product.shipping}</p>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-babalu-primary hover:bg-babalu-dark text-white mt-3"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Agregar al Carrito
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}