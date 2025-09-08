"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { HeroCarousel } from "../../components/hero-carousel"
import { Button } from "../../components/ui/button"


const heroImages = [
  {
    src: "/img/cartas-tarot.jpg",
    alt: "Tarot cards spread",
    focalPoint: "center center",
    content: {
      title: "Descubre tu Destino con el Tarot",
      description: "Consultas personalizadas de Tarot Rider-Waite para guiar tu camino espiritual.",
      buttonText: "Reservar Lectura",
      buttonAction: () => {
      }
    }
  },
  {
    src: "/img/1744750643661.jpg",
    alt: "Reiki session",
    focalPoint: "center 30%",
    content: {
      title: "Sanación Energética con Reiki",
      description: "Sesiones de Reiki para equilibrar tu energía vital y reducir el estrés.",
      buttonText: "Agendar Sesión",
      buttonAction: () => {
      }
    }
  },
  {
    src: "/placeholder.svg?height=500&width=800",
    alt: "Spiritual cleansing",
    focalPoint: "center center",
    content: {
      title: "Limpieza Espiritual Profunda",
      description: "Rituales de limpieza energética para purificar tu aura.",
      buttonText: "Conocer Más",
      buttonAction: () => {
      }
    }
  }
]

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  const handleSlideChange = (index: number) => {
    console.log("Slide cambiado a:", index)
    setCurrentIndex(index)
    setIsInitialized(true)
  }

  const handleButtonAction = () => {
    router.push("/servicios")
  }

  
  useEffect(() => {
    if (isInitialized) {
      console.log("Índice actual:", currentIndex)
      console.log("Contenido actual:", heroImages[currentIndex]?.content)
    }
  }, [currentIndex, isInitialized])

  const currentContent = heroImages[currentIndex]?.content || {}

  return (
    <section className="w-full h-[70vh] min-h-[500px] max-h-[800px] relative">
      <HeroCarousel 
        images={heroImages} 
        className="h-full" 
        onSlideChange={handleSlideChange} 
      />

      {/* Contenido dinámico */}
      {isInitialized && (
        <div className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 max-w-xs md:max-w-md z-10">
          <div className="bg-[#FBE9E7] bg-opacity-90 p-4 md:p-6 rounded-lg shadow-lg">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
              {currentContent.title}
            </h1>
            <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">
              {currentContent.description}
            </p>
            <Button
              className="bg-babalu-primary hover:bg-babalu-dark text-white"
              onClick={handleButtonAction}
            >
              {currentContent.buttonText}
            </Button>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-white w-6' : 'bg-white/50'}`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}