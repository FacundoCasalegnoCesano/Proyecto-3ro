"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "../contexts/cart-context";
import { Product } from "app/types/product"; // Importar la interfaz compartida

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // Datos de productos que coinciden con products-grid-page.tsx
  const getProductData = (id: string): Product => {
    const products: Product[] = [
      {
        id: 1,
        name: "Sahumerio Lavanda",
        price: "$2000",
        image: "/img/sahumerio1.jpg",
        category: "Sahumerio",
        shipping: "Envío Gratis",
        src: "/img/sahumerio1.jpg",
        description: "Sahumerio de lavanda de alta calidad. Perfecto para aromatizar ambientes y crear una atmósfera relajante."
      },
      {
        id: 2,
        name: "Aromatizante Citrus",
        price: "$2500",
        image: "/images/products/aromatizante-citrus.jpg",
        category: "Aromatizante de ambiente",
        shipping: "Envío Gratis",
        src: "/images/products/aromatizante-citrus.jpg",
        description: "Aromatizante con fragancia cítrica que refresca cualquier espacio. Ideal para hogares y oficinas."
      },
      {
        id: 3,
        name: "Lámpara de Sal Rosa",
        price: "$5000",
        image: "/images/products/lampara-sal-rosa.jpg",
        category: "Lamparas de Sal",
        shipping: "Envío Gratis",
        src: "/images/products/lampara-sal-rosa.jpg",
        description: "Lámpara de sal del Himalaya que purifica el aire y emite una cálida luz ambiental. Hecha de sal natural."
      },
      {
        id: 4,
        name: "Sahumerio Sándalo",
        price: "$2200",
        image: "/images/products/sahumerio-sandalo.jpg",
        category: "Sahumerios",
        shipping: "Envío Gratis",
        src: "/images/products/sahumerio-sandalo.jpg",
        description: "Sahumerio de sándalo con aroma oriental. Ideal para meditación y momentos de relax."
      },
      {
        id: 5,
        name: "Aromatizante para Auto",
        price: "$1800",
        image: "/images/products/aromatizante-auto.jpg",
        category: "Aromatizante para auto",
        shipping: "Envío Gratis",
        src: "/images/products/aromatizante-auto.jpg",
        description: "Aromatizante especialmente diseñado para vehículos. Fragancia duradera y refrescante."
      },
      {
        id: 6,
        name: "Lámpara de Sal Grande",
        price: "$6000",
        image: "/images/products/lampara-sal-grande.jpg",
        category: "Lamparas de Sal",
        shipping: "Envío Gratis",
        src: "/images/products/lampara-sal-grande.jpg",
        description: "Lámpara de sal de tamaño grande. Perfecta para espacios amplios, purifica y decora."
      },
      {
        id: 7,
        name: "Incienso Natural",
        price: "$1500",
        image: "/images/products/incienso-natural.jpg",
        category: "Inciensos",
        shipping: "Envío Gratis",
        src: "/images/products/incienso-natural.jpg",
        description: "Incienso 100% natural con ingredientes orgánicos. Aromas auténticos y relajantes."
      },
      {
        id: 8,
        name: "Palo Santo",
        price: "$1200",
        image: "/images/products/palo-santo.jpg",
        category: "Palo santos",
        shipping: "Envío Gratis",
        src: "/images/products/palo-santo.jpg",
        description: "Palo Santo natural para limpieza energética. Aroma dulce y propiedades espirituales."
      },
      {
        id: 9,
        name: "Vela Aromática",
        price: "$3000",
        image: "/images/products/vela-aromatica.jpg",
        category: "Velas",
        shipping: "Envío Gratis",
        src: "/images/products/vela-aromatica.jpg",
        description: "Vela aromática con esencias naturales. Quema limpia y fragancia duradera."
      },
      {
        id: 10,
        name: "Esencia de Lavanda",
        price: "$2800",
        image: "/images/products/esencia-lavanda.jpg",
        category: "Esencias",
        shipping: "Envío Gratis",
        src: "/images/products/esencia-lavanda.jpg",
        description: "Esencia pura de lavanda para difusores. Propiedades relajantes y aroma floral."
      },
      {
        id: 11,
        name: "Bomba de Humo Azul",
        price: "$3500",
        image: "/images/products/bomba-humo-azul.jpg",
        category: "Bombas de Humo",
        shipping: "Envío Gratis",
        src: "/images/products/bomba-humo-azul.jpg",
        description: "Bomba de humo azul para rituales y fotografía. Efecto visual impactante y color vibrante."
      },
      {
        id: 12,
        name: "Estatua Buda",
        price: "$8000",
        image: "/images/products/estatua-buda.jpg",
        category: "Estatuas",
        shipping: "Envío Gratis",
        src: "/images/products/estatua-buda.jpg",
        description: "Estatua de Buda para decoración y meditación. Material de alta calidad y diseño artesanal."
      }
    ];

    const product = products.find(p => p.id === Number.parseInt(id));
    return product || products[0]; // Retorna el primer producto si no encuentra el ID
  };

  const product = getProductData(productId);

  const handleAddToCart = () => {
    // Convertir precio string a número (elimina "$" y convierte)
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