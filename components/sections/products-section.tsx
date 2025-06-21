"use client"

import { ProductGrid } from "../../components/product-grid"

interface ProductsSectionProps {
  title?: string
  showTitle?: boolean
  className?: string
}

export function ProductsSection({ title = "MAS VENDIDO", showTitle = true, className }: ProductsSectionProps) {
  const products = [
    {
      id: 1,
      name: "Sahumerio Madre Santa",
      price: "$25.99",
      shipping: "Envío Gratis",
      image: "/img/sahumerio1.jpg?height=200&width=200&text=Tarot+Cards&bg=8B4513",
    },
    {
      id: 2,
      name: "Cristal de Cuarzo Rosa",
      price: "$18.50",
      shipping: "Envío Gratis",
      image: "/img/sahumerio2.jpg?height=200&width=200&text=Rose+Quartz&bg=FFC0CB",
    },
    {
      id: 3,
      name: "Vela Aromática Lavanda",
      price: "$12.99",
      shipping: "Envío Gratis",
      image: "/img/sahumerio1.jpg?height=200&width=200&text=Lavender+Candle&bg=9370DB",
    },
    {
      id: 4,
      name: "Incienso Palo Santo",
      price: "$15.75",
      shipping: "Envío Gratis",
      image: "/img/sahumerio2.jpg?height=200&width=200&text=Palo+Santo&bg=D2691E",
    },
    {
      id: 5,
      name: "Péndulo de Amatista",
      price: "$22.00",
      shipping: "Envío Gratis",
      image: "/img/sahumerio1.jpg?height=200&width=200&text=Amethyst+Pendulum&bg=9966CC",
    },
    {
      id: 6,
      name: "Aceite Esencial Eucalipto",
      price: "$14.25",
      shipping: "Envío Gratis",
      image: "/img/sahumerio2.jpg?height=200&width=200&text=Essential+Oil&bg=228B22",
    },
    {
      id: 7,
      name: "Runas Vikingas",
      price: "$28.99",
      shipping: "Envío Gratis",
      image: "/img/sahumerio1.jpg?height=200&width=200&text=Viking+Runes&bg=696969",
    },
    {
      id: 8,
      name: "Campana Tibetana",
      price: "$45.50",
      shipping: "Envío Gratis",
      image: "/img/sahumerio2.jpg?height=200&width=200&text=Tibetan+Bowl&bg=DAA520",
    },
    {
      id: 9,
      name: "Sahumerio de Mirra",
      price: "$11.99",
      shipping: "Envío Gratis",
      image: "/img/sahumerio1.jpg?height=200&width=200&text=Myrrh+Incense&bg=8B4513",
    },
    {
      id: 10,
      name: "Collar Chakras",
      price: "$32.75",
      shipping: "Envío Gratis",
      image: "/img/sahumerio2.jpg?height=200&width=200&text=Chakra+Necklace&bg=FF6347",
    },
  ]

  return <ProductGrid title={showTitle ? title : undefined} products={products} className={className} />
}
