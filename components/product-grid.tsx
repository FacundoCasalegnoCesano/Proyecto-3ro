import { ProductCard } from "./product-card"

interface Product {
  id: number
  name: string
  price: string
  shipping: string
  image: string
  src?: string // Añade esta línea
}

interface ProductGridProps {
  title?: string
  products: Product[]
  className?: string
}

export function ProductGrid({ title, products, className = "" }: ProductGridProps) {
  return (
    <section className={`py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            PRODUCTOS <span className="text-babalu-primary">{title}</span>
          </h2>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.slice(0, 10).map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                ...product,
                image: product.src || product.image 
              }} 
            />
          ))}
        </div>
      </div>
    </section>
  )
}