import { ProductCard } from "./product-card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel"

interface Product {
  id: number
  name: string
  price: string
  shipping: string
  src?: string
  image: string
}

interface ProductGridProps {
  title?: string
  products: Product[]
  className?: string
}

export function ProductGrid({ title, products, className = "" }: ProductGridProps) {
  // Generar productos con imágenes únicas
  const productsWithUniqueImages = products.map((product, index) => ({
    ...product,
    src: `/placeholder.svg?height=200&width=200&text=Product${index + 1}&bg=${Math.floor(Math.random() * 16777215).toString(16)}`,
  }))

  return (
    <section className={`py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            PRODUCTOS <span className="text-babalu-primary">{title}</span>
          </h2>
        )}

        <Carousel className="w-full" opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {productsWithUniqueImages.slice(0, 10).map((product) => (
              <CarouselItem
                key={product.id}
                
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-white/80 hover:bg-white border-babalu-primary text-babalu-primary hover:text-babalu-dark" />
          <CarouselNext className="right-2 bg-white/80 hover:bg-white border-babalu-primary text-babalu-primary hover:text-babalu-dark" />
        </Carousel>
      </div>
    </section>
  )
}
