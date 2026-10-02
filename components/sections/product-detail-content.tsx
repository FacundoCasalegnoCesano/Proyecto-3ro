"use client";

import { useState } from "react";
import { ProductsSidebar } from "../../components/products-sidebar";
import { ProductDetail } from "../../components/product-detail";
import { RecommendedProducts } from "../../components/recommended-products";

interface ProductDetailContentProps {
  productId: string;
}

export function ProductDetailContent({ productId }: ProductDetailContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Título principal */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Catálogo
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:gap-8">
          <details className="rounded-lg border border-babalu-primary/30 bg-white p-4 lg:hidden">
            <summary className="cursor-pointer list-none font-semibold text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-primary">
              Categorías
            </summary>
            <div className="mt-4">
              <ProductsSidebar
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </details>

          {/* Sidebar de categorías en pantallas grandes */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <ProductsSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </aside>

          {/* Contenido principal */}
          <div className="min-w-0 flex-1">
            <ProductDetail productId={productId} />
            <RecommendedProducts />
          </div>
        </div>
      </div>
    </div>
  );
}
