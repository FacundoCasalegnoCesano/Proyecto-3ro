"use client";

import Image from "next/image";
import { Button } from "../components/ui/button";
import { useCart } from "../contexts/cart-context";

interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

export function RecommendedProducts() {
  const { addItem } = useCart();

  const recommendedProducts: RecommendedProduct[] = [
    {
      id: 101,
      name: "Text",
      price: 0,
      image: "/placeholder.svg?height=200&width=200&text=Product1&bg=CCCCCC",
      description: "Body text",
    },
    {
      id: 102,
      name: "Text",
      price: 0,
      image: "/placeholder.svg?height=200&width=200&text=Product2&bg=CCCCCC",
      description: "Body text",
    },
    {
      id: 103,
      name: "Text",
      price: 0,
      image: "/placeholder.svg?height=200&width=200&text=Product3&bg=CCCCCC",
      description: "Body text",
    },
    {
      id: 104,
      name: "Text",
      price: 0,
      image: "/placeholder.svg?height=200&width=200&text=Product4&bg=CCCCCC",
      description: "Body text",
    },
  ];

  const handleAddToCart = (product: RecommendedProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        TAMBIEN TE <span className="font-normal">RECOMENDAMOS</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedProducts.map((product) => (
          <div key={product.id} className="text-center">
            {/* Imagen del producto */}
            <div className="aspect-square bg-gray-300 rounded-lg mb-4 overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() =>
                  (window.location.href = `/productos/${product.id}`)
                }
              />
            </div>

            {/* Información del producto */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-xl font-bold text-gray-800">
                ${product.price}
              </p>
              <p className="text-sm text-gray-600">{product.description}</p>

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
