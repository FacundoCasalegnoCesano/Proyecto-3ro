import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface Product {
  id: number
  name: string
  price: string
  shipping: string
  image: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight">{product.name}</h3>
          <p className="text-xl font-bold text-babalu-primary">{product.price}</p>
          <p className="text-sm text-green-600 font-medium">{product.shipping}</p>
        </div>
      </CardContent>
    </Card>
  )
}
