"use client";

import { ProductGrid } from "../../components/product-grid";
import { useState, useEffect } from "react";
import { Product } from "app/types/product";

interface ProductsSectionProps {
  title?: string;
  showTitle?: boolean;
  className?: string;
  productIds?: number[]; // Array de IDs de productos específicos
}

export function ProductsSection({
  title = "PRODUCTOS DESTACADOS",
  showTitle = true,
  className,
  productIds = [], // Por defecto vacío
}: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        // Si no hay IDs especificados, no hacer nada
        if (productIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Construir query string con los IDs
        const queryString = productIds.map((id) => `ids=${id}`).join("&");
        const response = await fetch(`/api/products/specific?${queryString}`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.products) {
          setProducts(data.products);
        } else {
          throw new Error(data.error || "Error al cargar productos");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Error de conexión");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [productIds]); // Se ejecuta cuando cambian los productIds

  if (loading && productIds.length > 0) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-babalu-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-babalu-primary text-white rounded-md hover:bg-babalu-dark transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    if (productIds.length === 0) {
      return (
        <div className={`text-center py-8 ${className}`}>
          <p className="text-gray-600">
            Especifica los IDs de productos para mostrar
          </p>
        </div>
      );
    }
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">
          No se encontraron los productos solicitados
        </p>
      </div>
    );
  }

  return (
    <ProductGrid
      title={showTitle ? title : undefined}
      products={products}
      className={className}
    />
  );
}
