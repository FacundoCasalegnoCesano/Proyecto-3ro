"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

interface Subcategory {
  name: string;
  image?: string;
  emoji?: string;
  icon?: React.ComponentType<IconProps>;
}

interface ProductCategoryGroup {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface ProductsSidebarProps {
  selectedCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
}

export function ProductsSidebar({
  selectedCategory: externalSelectedCategory,
  onCategoryChange: externalOnCategoryChange,
}: ProductsSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "Aromatizantes",
    "Decoracion Espiritual",
  ]);
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    setInternalSelectedCategory(categoryFromUrl);

    if (
      externalOnCategoryChange &&
      categoryFromUrl !== externalSelectedCategory
    ) {
      externalOnCategoryChange(categoryFromUrl);
    }
  }, [searchParams, externalSelectedCategory, externalOnCategoryChange]);

  const productCategoryGroups: ProductCategoryGroup[] = [
    {
      id: "aromatizantes_group",
      name: "Aromatizantes",
      subcategories: [
        { name: "Rocio Aurico", image: "" },
        { name: "Aromatizante para auto", image: "/img/air-freshener.png" },
        { name: "Aromatizante de ambiente", image: "/img/diffuser.png" },
        { name: "Esencia", image: "/img/essence.png" },
        { name: "Bomba de Humo", image: "/img/smoke-bomb.png" },
        { name: "Sahumerio", image: "/img/sahumerios.png" },
      ],
    },
    {
      id: "decoracion_group",
      name: "Decoracion Espiritual",
      subcategories: [
        { name: "Vela", image: "/img/candles.png" },
        { name: "Cascada de humo", image: "/img/fountain.png" },
        { name: "Estatua", image: "/img/buddha.png" },
        { name: "Lampara de Sal", image: "/img/salt-lamp.png" },
        { name: "Ceramica", image: "/img/incense.png" },
        { name: "Accesorios", image: "" },
        { name: "Atrapaluz", image: "" },
      ],
    },
  ];

  const toggleCategoryGroup = (groupId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubcategoryClick = async (subcategoryName: string) => {
    setIsLoading(true);
    const newCategory =
      internalSelectedCategory === subcategoryName ? null : subcategoryName;

    setInternalSelectedCategory(newCategory);

    const params = new URLSearchParams(searchParams.toString());

    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }

    params.delete("page");

    router.push(`/productos?${params.toString()}`, { scroll: false });

    if (externalOnCategoryChange) {
      externalOnCategoryChange(newCategory);
    }

    setIsLoading(false);
  };

  const currentSelectedCategory =
    externalSelectedCategory !== undefined
      ? externalSelectedCategory
      : internalSelectedCategory;

  const renderIcon = (item: Subcategory) => {
    if (item.image) {
      return (
        <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
          <Image
            src={item.image}
            alt={item.name}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
      );
    }

    if (item.emoji) {
      return (
        <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
          <span className="text-xs">{item.emoji}</span>
        </div>
      );
    }

    if (item.icon) {
      const IconComponent = item.icon;
      return (
        <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
          <IconComponent className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
        <span className="text-xs">📦</span>
      </div>
    );
  };

  return (
    <div className="bg-gray border-2 border-babalu-primary/100 rounded-lg p-4 text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Categorías</h2>
      </div>

      {isLoading && (
        <div className="text-center py-2">
          <div className="animate-pulse text-sm text-gray-600">Cargando...</div>
        </div>
      )}

      {productCategoryGroups.map((group) => (
        <div key={group.id} className="mb-4">
          <button
            onClick={() => toggleCategoryGroup(group.name)}
            className="flex items-center justify-between w-full text-left font-semibold mb-2 hover:text-babalu-primary transition-colors"
            disabled={isLoading}
          >
            <span>{group.name}</span>
            {expandedCategories.includes(group.name) ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {expandedCategories.includes(group.name) && (
            <div className="ml-4 space-y-2">
              {group.subcategories.map((subcategory) => (
                <button
                  key={subcategory.name}
                  onClick={() => handleSubcategoryClick(subcategory.name)}
                  className={`flex items-center space-x-2 text-sm hover:text-babalu-primary transition-colors w-full text-left p-2 rounded ${
                    currentSelectedCategory === subcategory.name
                      ? "bg-white/20 font-medium border-l-4 border-orange-500"
                      : "border-l-4 border-transparent"
                  }`}
                  disabled={isLoading}
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
  );
}
