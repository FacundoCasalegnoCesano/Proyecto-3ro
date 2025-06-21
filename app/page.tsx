"use client"

import { Header } from "@/components/header"
import { HeroCarousel } from "@/components/hero-carousel"
import { ProductGrid } from "@/components/product-grid"
import { NavigationLinks } from "@/components/navigation-links"
import { Footer } from "@/components/footer"

export default function HomePage() {

  const heroImages = [
    {
      src: "/img/cartas-tarot.jpg",
      alt: "Tarot cards spread",
      focalPoint: "center center",
      width: 1600,  
      height: 400 
    },
    {
      src: "/img/1744750643646.jpg",
      alt: "Reiki session",
      focalPoint: "center 30%"
    },
    {
      src: "/img/1744750643661.jpg",
      alt: "Spiritual cleansing",
      focalPoint: "center center"
    },
  ].map(image => ({
    ...image,
    src: image.src.split('?')[0] 
  }))

const products = [
  {
    id: 1,
    name: "Tarot Rider-Waite",
    price: "$4000",
    shipping: "Envío Gratis",
    image: "/img/sahumerio1.jpg",
  },
{
    id: 2,
    name: "Tarot Rider-Waite",
    price: "$4000",
    shipping: "Envío Gratis",
    image: "/img/sahumerio2.jpg",
  },
  {
    id: 3,
    name: "Tarot Rider-Waite",
    price: "$4000",
    shipping: "Envío Gratis",
    image: "/img/sahumerio1.jpg",
  },
  {
    id: 4,
    name: "Tarot Rider-Waite",
    price: "$4000",
    shipping: "Envío Gratis",
    image: "/img/sahumerio2.jpg",
  },
  {
    id: 5,
    name: "Tarot Rider-Waite",
    price: "$4000",
    shipping: "Envío Gratis",
    image: "/img/sahumerio1.jpg",
  },
]


  const navigationLinks = [
    { href: "#", label: "Informática" },
    { href: "#", label: "Para bebes" },
    { href: "#", label: "Perfumes" },
    { href: "#", label: "Bombas de baño" },
    { href: "#", label: "Accesorios" },
    { href: "#", label: "Alimentación" },
    { href: "#", label: "Limpieza de Oro" },
  ]

  const footerContactInfo = {
    instagram:  "Instagram ",
    phone: "+54 11 1234-5678",
    email: "hola@babalu.com",
  }

  const footerText = {
    quote: "Tu energía habla más fuerte que tus palabras",
    copyright: "Todos los derechos reservados © 2023 Facundo Castañio Cesario",
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      
<div className="w-full h-[70vh] min-h-[500px] max-h-[800px]">
  <HeroCarousel 
  images={heroImages} 
  className="mb-4"
/>
</div>

      <ProductGrid title="MAS VENDIDO" products={products} />

      <NavigationLinks links={navigationLinks} showViewMore={true} />

      <ProductGrid products={products} className="border-t-0" />

      <Footer contactInfo={footerContactInfo} footerText={footerText} />
    </div>
  )
}
