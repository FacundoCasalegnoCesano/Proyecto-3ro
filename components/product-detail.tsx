"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { ShoppingCart, Minus, Plus, Loader2 } from "lucide-react";
import { useCart } from "../contexts/cart-context";
import { Product } from "app/types/product";

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/agregarProd?id=${productId}`);
        
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Endpoint de API no encontrado. Verifica la ruta.');
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Error al cargar el producto');
        }

        setProduct(data.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    
    const priceNumber = Number.parseFloat(product.price.replace("$", ""));
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: priceNumber,
        image: product.image,
      });
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8 mb-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-babalu-primary" />
          <span className="ml-2 text-gray-600">Cargando producto...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-8 mb-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error al cargar el producto</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-lg p-8 mb-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagen del producto */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Detalles del producto */}
        <div className="space-y-6">
          <div>
            <span className="inline-block bg-babalu-primary text-white text-sm px-3 py-1 rounded-full mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="text-4xl font-bold text-babalu-primary">
            {product.price}
          </div>

          <div className="text-green-600 font-medium">
            {product.shipping}
          </div>

          {/* Selector de cantidad */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={decrementQuantity}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                {quantity}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={incrementQuantity}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="bg-babalu-primary hover:bg-babalu-dark text-white px-6 py-2 flex items-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar al Carrito</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}