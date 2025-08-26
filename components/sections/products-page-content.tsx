"use client"

import { useState } from "react"
import { ProductsSidebar } from "../../components/products-sidebar"
import { ProductsGridPage } from "../../components/products-grid-page"
import { ProductsHeader } from "../../components/products-header"

export function ProductsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("default")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Título principal */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800">Tienda</h1>
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
