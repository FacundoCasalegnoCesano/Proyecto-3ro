"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Gem,
  Sparkles,
  SunMedium,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

interface Subcategory {
  name: string;
  label?: string;
  image?: string;
  emoji?: string;
  icon?: LucideIcon;
}

interface ProductCategoryGroup {
  id: string;
  name: string;
  label?: string;
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
        {
          name: "Rocio Aurico",
          label: "Rocío áurico",
          icon: Sparkles,
        },
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
      label: "Decoración espiritual",
      subcategories: [
        { name: "Vela", image: "/img/candles.png" },
        { name: "Cascada de humo", image: "/img/fountain.png" },
        { name: "Estatua", image: "/img/buddha.png" },
        {
          name: "Lampara de Sal",
          label: "Lámpara de sal",
          image: "/img/salt-lamp.png",
        },
        { name: "Ceramica", label: "Cerámica", image: "/img/incense.png" },
        { name: "Accesorios", icon: Gem },
        { name: "Atrapaluz", icon: SunMedium },
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
        <div
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-white/20"
        >
          <Image
            src={item.image}
            alt=""
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
      );
    }

    if (item.emoji) {
      return (
        <div
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-white/20"
        >
          <span className="text-xs">{item.emoji}</span>
        </div>
      );
    }

    if (item.icon) {
      const IconComponent = item.icon;
      return (
        <div
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-white/20"
        >
          <IconComponent className="h-5 w-5" strokeWidth={1.75} />
        </div>
      );
    }

    return (
      <div
        aria-hidden="true"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-white/20"
      >
        <span className="text-xs">📦</span>
      </div>
    );
  };

  return (
    <div className="min-w-0 rounded-lg border-2 border-babalu-primary/100 bg-gray p-4 text-black">
      <div className="mb-4 flex items-center justify-between gap-3">
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
            className="mb-2 flex w-full min-w-0 items-start justify-between gap-2 text-left font-semibold transition-colors hover:text-babalu-primary"
            disabled={isLoading}
          >
            <span className="min-w-0 flex-1 break-words">
              {group.label || group.name}
            </span>
            {expandedCategories.includes(group.name) ? (
              <ChevronDown
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 flex-shrink-0"
              />
            ) : (
              <ChevronRight
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 flex-shrink-0"
              />
            )}
          </button>

          {expandedCategories.includes(group.name) && (
            <div className="ml-4 space-y-2">
              {group.subcategories.map((subcategory) => (
                <button
                  key={subcategory.name}
                  onClick={() => handleSubcategoryClick(subcategory.name)}
                  className={`flex w-full min-w-0 items-center gap-2 rounded p-2 text-left text-sm transition-colors hover:text-babalu-primary ${
                    currentSelectedCategory === subcategory.name
                      ? "bg-white/20 font-medium border-l-4 border-orange-500"
                      : "border-l-4 border-transparent"
                  }`}
                  disabled={isLoading}
                >
                  {renderIcon(subcategory)}
                  <span className="min-w-0 flex-1 break-words">
                    {subcategory.label || subcategory.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
