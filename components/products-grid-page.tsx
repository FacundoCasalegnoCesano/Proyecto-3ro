"use client"

import { useState } from "react"
import { ProductCard } from "../components/product-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Product } from "app/types/product"

interface ProductsGridPageProps {
  selectedCategory: string | null
  searchQuery: string
  sortBy: string
}

export function ProductsGridPage({ selectedCategory, searchQuery, sortBy }: ProductsGridPageProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 6

  // Datos de productos con imágenes reales
  const allProducts: Product[] = [
    {
      id: 1,
      name: "Sahumerio Lavanda",
      price: "$2000",
      image: "/img/sahumerio1.jpg",
      category: "Sahumerios",
      shipping: "Envío Gratis",
      src: "/img/sahumerio1.jpg",
    },
    {
      id: 2,
      name: "Aromatizante Citrus",
      price: "$2500",
      image: "/images/products/aromatizante-citrus.jpg",
      category: "Aromatizante de ambiente",
      shipping: "Envío Gratis",
      src: "/images/products/aromatizante-citrus.jpg",
    },
    {
      id: 3,
      name: "Lámpara de Sal Rosa",
      price: "$5000",
      image: "/images/products/lampara-sal-rosa.jpg",
      category: "Lamparas de Sal",
      shipping: "Envío Gratis",
      src: "/images/products/lampara-sal-rosa.jpg",
    },
    {
      id: 4,
      name: "Sahumerio Sándalo",
      price: "$2200",
      image: "/images/products/sahumerio-sandalo.jpg",
      category: "Sahumerios",
      shipping: "Envío Gratis",
      src: "/images/products/sahumerio-sandalo.jpg",
    },
    {
      id: 5,
      name: "Aromatizante para Auto",
      price: "$1800",
      image: "/images/products/aromatizante-auto.jpg",
      category: "Aromatizante para auto",
      shipping: "Envío Gratis",
      src: "/images/products/aromatizante-auto.jpg",
    },
    {
      id: 6,
      name: "Lámpara de Sal Grande",
      price: "$6000",
      image: "/images/products/lampara-sal-grande.jpg",
      category: "Lamparas de Sal",
      shipping: "Envío Gratis",
      src: "/images/products/lampara-sal-grande.jpg",
    },
    {
      id: 7,
      name: "Incienso Natural",
      price: "$1500",
      image: "/images/products/incienso-natural.jpg",
      category: "Inciensos",
      shipping: "Envío Gratis",
      src: "/images/products/incienso-natural.jpg",
    },
    {
      id: 8,
      name: "Palo Santo",
      price: "$1200",
      image: "/images/products/palo-santo.jpg",
      category: "Palo santos",
      shipping: "Envío Gratis",
      src: "/images/products/palo-santo.jpg",
    },
    {
      id: 9,
      name: "Vela Aromática",
      price: "$3000",
      image: "/images/products/vela-aromatica.jpg",
      category: "Velas",
      shipping: "Envío Gratis",
      src: "/images/products/vela-aromatica.jpg",
    },
    {
      id: 10,
      name: "Esencia de Lavanda",
      price: "$2800",
      image: "/images/products/esencia-lavanda.jpg",
      category: "Esencias",
      shipping: "Envío Gratis",
      src: "/images/products/esencia-lavanda.jpg",
    },
    {
      id: 11,
      name: "Bomba de Humo Azul",
      price: "$3500",
      image: "/images/products/bomba-humo-azul.jpg",
      category: "Bombas de Humo",
      shipping: "Envío Gratis",
      src: "/images/products/bomba-humo-azul.jpg",
    },
    {
      id: 12,
      name: "Estatua Buda",
      price: "$8000",
      image: "/images/products/estatua-buda.jpg",
      category: "Estatuas",
      shipping: "Envío Gratis",
      src: "/images/products/estatua-buda.jpg",
    },
  ]

  // Filtrar productos
  let filteredProducts = allProducts

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter((product) => product.category === selectedCategory)
  }

  if (searchQuery) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  // Ordenar productos
  switch (sortBy) {
    case "price-low":
      filteredProducts.sort(
        (a, b) => Number.parseInt(a.price.replace("$", "")) - Number.parseInt(b.price.replace("$", "")),
      )
      break
    case "price-high":
      filteredProducts.sort(
        (a, b) => Number.parseInt(b.price.replace("$", "")) - Number.parseInt(a.price.replace("$", "")),
      )
      break
    case "name":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
      break
  }

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  return (
    <div>
      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded border text-sm ${
                currentPage === page
                  ? "bg-babalu-primary text-white border-babalu-primary"
                  : "border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}
            >
              {page}
            </button>
          ))}

          {totalPages > 4 && <span className="text-gray-400">...</span>}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mensaje si no hay productos */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
          <p className="text-gray-400">Intenta con otros filtros o términos de búsqueda</p>
        </div>
      )}
    </div>
  )
}