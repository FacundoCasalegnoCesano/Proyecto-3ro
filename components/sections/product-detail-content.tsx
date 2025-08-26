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
            Tienda
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar de categorías */}
          <div className="w-64 flex-shrink-0">
            <ProductsSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            <ProductDetail productId={productId} />
            <RecommendedProducts />
          </div>
        </div>
      </div>
    </div>
  );
}
