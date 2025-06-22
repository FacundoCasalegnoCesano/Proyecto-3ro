"use client"

import { HeroCarousel } from "../../components/hero-carousel"
import { Button } from "../../components/ui/button"
import { useState } from "react"

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Datos completos para cada imagen del carrusel
  const heroImages = [
    {
      src: "/img/cartas-tarot.jpg",
      alt: "Tarot cards spread",
      focalPoint: "center center",
      content: {
        title: "Descubre tu Destino con el Tarot",
        description:
          "Consultas personalizadas de Tarot Rider-Waite para guiar tu camino espiritual y encontrar respuestas a tus preguntas más profundas.",
        buttonText: "Reservar Lectura",
        buttonAction: () => {
          console.log("Reservar lectura de tarot")
        },
      },
    },
    {
      src: "/img/1744750643661.jpg",
      alt: "Reiki session",
      focalPoint: "center 30%",
      content: {
        title: "Sanación Energética con Reiki",
        description:
          "Sesiones de Reiki para equilibrar tu energía vital, reducir el estrés y promover la sanación natural de cuerpo y mente.",
        buttonText: "Agendar Sesión",
        buttonAction: () => {
          console.log("Agendar sesión de Reiki")
        },
      },
    },
    {
      src: "/placeholder.svg?height=500&width=800",
      alt: "Spiritual cleansing",
      focalPoint: "center center",
      content: {
        title: "Limpieza Espiritual Profunda",
        description:
          "Rituales de limpieza energética para purificar tu aura, eliminar energías negativas y restaurar tu equilibrio espiritual.",
        buttonText: "Conocer Más",
        buttonAction: () => {
          console.log("Mostrar información de limpieza espiritual")
        },
      },
    },
    {
      src: "/placeholder.svg?height=500&width=800",
      alt: "Meditation space",
      focalPoint: "center center",
      content: {
        title: "Armoniza Cuerpo, Mente y Espíritu",
        description:
          "Conecta con tu esencia interior a través de nuestros servicios integrales de bienestar espiritual y sanación holística.",
        buttonText: "Explorar Servicios",
        buttonAction: () => {
          console.log("Mostrar todos los servicios")
        },
      },
    },
  ]

  // Función para manejar el cambio de slide de manera segura
  const handleSlideChange = (index: number) => {
    // Asegurarnos de que el índice esté dentro del rango válido
    const safeIndex = ((index % heroImages.length) + heroImages.length) % heroImages.length
    console.log("Slide cambiado:", safeIndex) // Para depuración
    setCurrentSlide(safeIndex)
  }

  const currentContent = heroImages[currentSlide]?.content || {}

  return (
    <section className="w-full h-[70vh] min-h-[500px] max-h-[800px] relative">
      <HeroCarousel 
        images={heroImages} 
        className="h-full" 
        onSlideChange={handleSlideChange} 
      />

      {/* Contenido dinámico - Posicionado absolutamente sobre el carrusel */}
      <div className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 max-w-xs md:max-w-md z-10">
        <div className="bg-[#FBE9E7] bg-opacity-90 p-4 md:p-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
            {currentContent.title || "Título de la imagen"}
          </h1>
          {currentContent.description && (
            <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">
              {currentContent.description}
            </p>
          )}
          {currentContent.buttonText && (
            <Button
              className="bg-babalu-primary hover:bg-babalu-dark text-white text-sm md:text-base transition-all duration-200 hover:scale-105"
              onClick={currentContent.buttonAction}
            >
              {currentContent.buttonText}
            </Button>
          )}
        </div>
      </div>

      {/* Capa semitransparente para mejor legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      {/* Indicadores de slide (opcional) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}