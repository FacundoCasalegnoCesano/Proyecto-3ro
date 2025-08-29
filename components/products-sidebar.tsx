"use client"

import { useState } from "react"
import { 
  ChevronDown, 
  ChevronRight, 
} from "lucide-react"
import Image from "next/image"

// Define las props que aceptan los íconos
interface IconProps {
  className?: string
  size?: number
  strokeWidth?: number
  // otras props que puedan tener los íconos
}

interface Subcategory {
  name: string
  icon?: React.ComponentType<IconProps> // Icono de Lucide con tipo específico
  image?: string // URL de imagen personalizada
  emoji?: string // Emoji como alternativa
}

interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

interface ProductsSidebarProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function ProductsSidebar({ selectedCategory, onCategoryChange }: ProductsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["aromatizantes"])

  const categories: Category[] = [
    {
      id: "aromatizantes",
      name: "Aromatizantes",
      subcategories: [
        { name: "Aromatizante para auto", image: "/img/air-freshener.png" },
        { name: "Aromatizante de ambiente", image: "/img/diffuser.png" },
        { name: "Esencias", image: "/img/essence.png" },
        { name: "Inciensos", image: "/img/copal.png" },
        { name: "Bombas de Humo", image: "/img/smoke-bomb.png" },
        { name: "Sahumerios", image: "/img/sahumerios.png" },
      ],
    },
    {
      id: "decoracion",
      name: "Decoracion Espiritual",  
      subcategories: [
        { name: "Velas", image: "/img/candles.png" },
        { name: "Cascadas de humo", image: "/img/fountain.png" },
        { name: "Estatuas", image: "/img/buddha.png" },
        { name: "Lamparas de Sal", image: "/img/salt-lamp.png" },
        { name: "Porta Sahumerios", image: "/img/incense.png" },
      ],
    },
  ]

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSubcategoryClick = (subcategoryName: string) => {
    onCategoryChange(selectedCategory === subcategoryName ? null : subcategoryName)
  }

  // Componente para renderizar el ícono/imagen
  const renderIcon = (subcategory: Subcategory) => {
    if (subcategory.image) {
      return (
        <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
          <Image 
            src={subcategory.image} 
            alt={subcategory.name}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
      )
    }
    
    if (subcategory.emoji) {
      return (
        <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
          <span className="text-xs">{subcategory.emoji}</span>
        </div>
      )
    }
    
    if (subcategory.icon) {
      const IconComponent = subcategory.icon
      return (
        <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
          <IconComponent className="w-4 h-4" />
        </div>
      )
    }

    // Fallback por si no hay ningún tipo de ícono
    return (
      <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
        <span className="text-xs">📦</span>
      </div>
    )
  }

  return (
    <div className="bg-babalu-primary rounded-lg p-4 text-black">
      <h2 className="text-xl font-bold mb-4">Categorías</h2>

      {categories.map((category) => (
        <div key={category.id} className="mb-4">
          <button
            onClick={() => toggleCategory(category.id)}
            className="flex items-center justify-between w-full text-left font-semibold mb-2 hover:text-orange-200 transition-colors"
          >
            <span>{category.name}</span>
            {expandedCategories.includes(category.id) ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {expandedCategories.includes(category.id) && (
            <div className="ml-4 space-y-2">
              {category.subcategories.map((subcategory) => (
                <button
                  key={subcategory.name}
                  onClick={() => handleSubcategoryClick(subcategory.name)}
                  className={`flex items-center space-x-2 text-sm hover:text-orange-200 transition-colors w-full text-left p-2 rounded ${
                    selectedCategory === subcategory.name ? "bg-white/20" : ""
                  }`}
                >
                  {renderIcon(subcategory)}
                  <span>{subcategory.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}