"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { useCart } from "../contexts/cart-context";
import { Product } from "app/types/product";
import { Loader2 } from "lucide-react";

export function RecommendedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();


  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/agregarProd?sort=newest&limit=4');
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Endpoint de API no encontrado. Verifica la ruta.');
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Error al cargar productos recomendados');
        }

        setProducts(data.data.slice(0, 4)); 
      } catch (err) {
        console.error('Error fetching recommended products:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar productos recomendados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    
    const priceNumber = Number.parseFloat(product.price.replace("$", ""));
    
    addItem({
      id: product.id,
      name: product.name,
      price: priceNumber,
      image: product.image,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          TAMBIEN TE <span className="font-normal">RECOMENDAMOS</span>
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-babalu-primary" />
          <span className="ml-2 text-gray-600">Cargando recomendaciones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          TAMBIEN TE <span className="font-normal">RECOMENDAMOS</span>
        </h2>
        <div className="text-center py-8">
          <p className="text-red-500">Error al cargar productos recomendados</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          TAMBIEN TE <span className="font-normal">RECOMENDAMOS</span>
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No hay productos recomendados disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        TAMBIEN TE <span className="font-normal">RECOMENDAMOS</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="text-center">
            {/* Imagen del producto */}
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => (window.location.href = `/productos/${product.id}`)}
              />
            </div>

            {/* Información del producto */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-xl font-bold text-gray-800">{product.price}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-babalu-primary hover:bg-babalu-dark text-white text-sm mt-3"
                size="sm"
              >
                Agregar al Carrito
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}