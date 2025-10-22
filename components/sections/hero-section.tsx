"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroCarousel } from "../../components/hero-carousel";
import { Button } from "../../components/ui/button";

const heroImages = [
  {
    src: "/img/una-por-una-un-repaso-por-todas-las-cartas-del-6W4474GEFBAENM72ABI5CHFCTI.webp",
    alt: "Tarot cards spread",
    focalPoint: "center center",
    content: {
      title: "Descubre tu Destino con el Tarot",
      description:
        "Consultas personalizadas de Tarot Africano para guiar tu camino espiritual.",
      buttonText: "Reservar Lectura",
      buttonAction: () => {},
    },
  },
  {
    src: "/img/reiki-niveles.webp",
    alt: "Reiki session",
    focalPoint: "center 30%",
    content: {
      title: "Sanación Energética con Reiki",
      description:
        "Sesiones de Reiki para equilibrar tu energía vital y reducir el estrés.",
      buttonText: "Agendar Sesión",
      buttonAction: () => {},
    },
  },
  {
    src: "/img/lg.webp",
    alt: "Spiritual cleansing",
    focalPoint: "center center",
    content: {
      title: "Limpieza Espiritual Profunda",
      description: "Rituales de limpieza energética para purificar tu aura.",
      buttonText: "Conocer Más",
      buttonAction: () => {},
    },
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const router = useRouter();

  const handleSlideChange = (index: number) => {
    console.log("Slide cambiado a:", index);
    
    // Animación de salida
    setIsContentVisible(false);
    
    setTimeout(() => {
      setCurrentIndex(index);
      setIsInitialized(true);
      
      // Animación de entrada
      setTimeout(() => {
        setIsContentVisible(true);
      }, 100);
    }, 100);
  };

  const handleButtonAction = () => {
    router.push("/servicios");
  };

  useEffect(() => {
    if (isInitialized) {
      setIsContentVisible(true);
    }
  }, [isInitialized]);

  const currentContent = heroImages[currentIndex]?.content || {};

  return (
    <section className="w-full h-[70vh] min-h-[500px] max-h-[800px] relative overflow-hidden">
      <HeroCarousel
        images={heroImages}
        className="h-full"
        onSlideChange={handleSlideChange}
      />

      {/* Contenido dinámico */}
      {isInitialized && (
        <div className={`absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 max-w-xs md:max-w-md z-10 transition-all duration-500 ${
          isContentVisible 
            ? 'translate-x-0 opacity-100' 
            : '-translate-x-8 opacity-0'
        }`}>
          <div className="bg-[#FBE9E7] bg-opacity-90 p-4 md:p-6 rounded-lg shadow-lg backdrop-blur-sm">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3 transform transition-transform duration-300 hover:scale-105">
              {currentContent.title}
            </h1>
            <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 leading-relaxed">
              {currentContent.description}
            </p>
            <Button
              className="bg-babalu-primary hover:bg-babalu-dark text-white transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? "bg-white w-6 scale-110" 
                : "bg-white/50 hover:bg-white/80 hover:scale-110"
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}