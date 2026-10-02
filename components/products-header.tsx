"use client";

import { Search } from "lucide-react";

interface ProductsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function ProductsHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: ProductsHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Barra de búsqueda */}
      <div className="relative min-w-0 flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="search"
            aria-label="Buscar productos"
            placeholder="Buscar productos"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-babalu-primary"
          />
        </div>
      </div>

      {/* Selector de ordenamiento */}
      <div className="w-full sm:w-48 sm:flex-shrink-0">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Ordenar productos"
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
  );
}
