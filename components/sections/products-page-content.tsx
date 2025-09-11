"use client"

import { useState } from "react"
import { ProductsSidebar } from "../../components/products-sidebar"
import { ProductsGridPage } from "../../components/products-grid-page"
import { ProductsHeader } from "../../components/products-header"
import { StockProductos } from "components/stock-productos"
import { Button } from "components/ui/button"
import { Package } from "lucide-react"

export function ProductsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("default")

    const handleStockRedirect = () => {
    window.location.href = "/productos/stock"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Título principal */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800">Tienda</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-babalu-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-babalu-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Gestionar Stock</h3>
              <p className="text-sm text-gray-600">Ver y administrar el inventario de productos</p>
            </div>
          </div>

          <Button
            onClick={handleStockRedirect}
            className="bg-babalu-primary hover:bg-babalu-dark text-white px-6 py-2 flex items-center space-x-2 transition-all duration-200 hover:scale-105"
          >
            <Package className="w-4 h-4" />
            <span>Ver Stock</span>
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar de categorías */}
          <div className="w-64 flex-shrink-0">
            <ProductsSidebar selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            <ProductsHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <ProductsGridPage selectedCategory={selectedCategory} searchQuery={searchQuery} sortBy={sortBy} />
          </div>
        </div>
      </div>
    </div>
  )
}
