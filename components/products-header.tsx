"use client"

import { Search, Mic } from "lucide-react"
import { Button } from "../components/ui/button"

interface ProductsHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

export function ProductsHeader({ searchQuery, onSearchChange, sortBy, onSortChange }: ProductsHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {/* Barra de búsqueda */}
      <div className="flex-1 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-transparent"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Mic className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Selector de ordenamiento */}
      <div className="w-48">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-transparent bg-white"
        >
          <option value="default">Ordenar por...</option>
          <option value="price-low">Precio: Menor a Mayor</option>
          <option value="price-high">Precio: Mayor a Menor</option>
          <option value="name">Nombre A-Z</option>
          <option value="newest">Más Recientes</option>
        </select>
      </div>
    </div>
  )
}
