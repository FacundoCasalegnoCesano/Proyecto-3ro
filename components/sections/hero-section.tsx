"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HeroCarousel,
  type HeroCarouselApi,
} from "../../components/hero-carousel";
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
      buttonText: "Ver lecturas",
      href: "/servicios",
    },
  },
  {
    src: "/img/persona-que-realiza-terapia-reiki_23-2149403922.webp",
    alt: "Reiki session",
    focalPoint: "center 30%",
    content: {
      title: "Sanación Energética con Reiki",
      description:
        "Sesiones de Reiki para equilibrar tu energía vital y reducir el estrés.",
      buttonText: "Ver sesiones",
      href: "/servicios",
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
      href: "/servicios",
    },
  },
  {
    src: "/img/1662063240.webp",
    alt: "Spiritual cleansing",
    focalPoint: "center center",
    content: {
      title: "Promo Por Tu Cumpleaños",
      description:
        "Si realizas una compra de productos o reservas un servicio el día de tu cumpleaños, se te realizará un 10% de descuento.",
      buttonText: "Explorar Productos",
      href: "/productos",
    },
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [carouselApi, setCarouselApi] = useState<HeroCarouselApi | null>(null);
  const router = useRouter();

  const handleSlideChange = useCallback((index: number) => {
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
  }, []);

  const handleButtonAction = () => {
    router.push(currentContent.href || "/servicios");
  };

  useEffect(() => {
    if (isInitialized) {
      setIsContentVisible(true);
    }
  }, [isInitialized]);

  const currentContent = heroImages[currentIndex]?.content || {};

  return (
    <section className="relative h-[65vh] max-h-[800px] min-h-[500px] w-full overflow-hidden md:h-[70vh]">
      <HeroCarousel
        images={heroImages}
        className="h-full"
        onSlideChange={handleSlideChange}
        onApiChange={setCarouselApi}
      />

      {/* Contenido dinámico */}
      {isInitialized && (
        <div className={`absolute inset-x-14 top-1/2 z-20 max-w-md -translate-y-1/2 transform transition-all duration-500 md:left-8 md:right-auto ${
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

      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 space-x-2 transform">
        {heroImages.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => carouselApi?.scrollTo(index)}
            className="group flex h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
            aria-label={`Ir a imagen ${index + 1}`}
            aria-current={currentIndex === index ? "true" : undefined}
          >
            <span
              aria-hidden="true"
              className={`block h-3 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "w-6 scale-110 bg-white"
                  : "w-3 bg-white/50 group-hover:scale-110 group-hover:bg-white/80"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
