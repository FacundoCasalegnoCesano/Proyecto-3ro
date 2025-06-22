"use client"

import { HeroCarousel } from "../../components/hero-carousel"

export function HeroSection() {
  // Imágenes optimizadas para el carrusel
  const heroImages = [
    {
      src: "/img/cartas-tarot.jpg",
      alt: "Tarot cards spread",
      focalPoint: "center center"
    },
    {
      src: "/img/1744750643661.jpg",
      alt: "Reiki session",
      focalPoint: "center 30%"
    },
    {
      src: "/img/1744750643646.jpg",
      alt: "Spiritual cleansing",
      focalPoint: "center center"
    },
  ].map(image => ({
    ...image,
    // Asegura que no haya parámetros en la URL
    src: image.src.split('?')[0],
    // Proporciona texto alternativo descriptivo
    alt: image.alt || "Imagen promocional"
  }))

  return (
    <section className="w-full h-[70vh] min-h-[500px] max-h-[800px] relative">
      <HeroCarousel 
        images={heroImages}
        className="h-full"
      />
      
      {/* Capa semitransparente para mejor legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    </section>
  )
}