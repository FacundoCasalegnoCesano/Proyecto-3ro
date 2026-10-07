"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { HeroCarousel } from "../../components/hero-carousel";

const heroImages = [
  {
    src: "/img/una-por-una-un-repaso-por-todas-las-cartas-del-6W4474GEFBAENM72ABI5CHFCTI.webp",
    alt: "Tarot cards spread",
    focalPoint: "center center",
    ctaVariant: "service",
    content: {
      title: "Descubre tu Destino con el Tarot",
      description:
        "Consultas personalizadas de Tarot Africano para guiar tu camino espiritual.",
    },
  },
  {
    src: "/img/persona-que-realiza-terapia-reiki_23-2149403922.webp",
    alt: "Reiki session",
    focalPoint: "center 30%",
    ctaVariant: "service",
    content: {
      title: "Sanación Energética con Reiki",
      description:
        "Sesiones de Reiki para equilibrar tu energía vital y reducir el estrés.",
    },
  },
  {
    src: "/img/lg.webp",
    alt: "Spiritual cleansing",
    focalPoint: "center center",
    ctaVariant: "service",
    content: {
      title: "Limpieza Espiritual Profunda",
      description: "Rituales de limpieza energética para purificar tu aura.",
    },
  },
  {
    src: "/img/1662063240.webp",
    alt: "Spiritual cleansing",
    focalPoint: "center center",
    ctaVariant: "promotion",
    content: {
      title: "Promo Por Tu Cumpleaños",
      description:
        "Si realizas una compra de productos o reservas un servicio el día de tu cumpleaños, se te realizará un 10% de descuento.",
    },
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleSlideChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);
  const currentSlide = heroImages[currentIndex] ?? heroImages[0];
  const currentContent = currentSlide.content;

  return (
    <section className="relative h-[65vh] min-h-[500px] max-h-[800px] w-full overflow-hidden md:h-[70vh]">
      <HeroCarousel
        images={heroImages}
        selectedIndex={currentIndex}
        className="h-full"
        onSlideChange={handleSlideChange}
      />

      <div className="absolute inset-x-4 top-1/2 z-20 mx-auto w-auto max-w-xl -translate-y-1/2 md:left-20 md:mx-0 md:w-10/12">
        <div className="rounded-xl border border-white/80 bg-[#FBE9E7] p-5 text-babalu-medium shadow-lg sm:p-6">
          <h1 className="mb-3 text-balance text-2xl font-bold leading-tight md:text-3xl">
            {currentContent.title}
          </h1>
          <p className="mb-5 max-w-prose text-base leading-relaxed text-babalu-medium">
            {currentContent.description}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href="/productos"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-babalu-action px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-babalu-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-action focus-visible:ring-offset-2"
            >
              Explorar productos
            </Link>
            {currentSlide.ctaVariant === "service" && (
              <Link
                href="/servicios"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-babalu-action px-4 py-2 text-center font-semibold text-babalu-action transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-action focus-visible:ring-offset-2"
              >
                Ver servicios
              </Link>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
