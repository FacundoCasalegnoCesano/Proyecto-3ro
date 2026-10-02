"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi as EmblaCarouselApi,
} from "../components/ui/carousel";

export type HeroCarouselApi = NonNullable<EmblaCarouselApi>;

interface HeroImage {
  src: string;
  alt: string;
  focalPoint?: string;
}

interface HeroCarouselProps {
  images: HeroImage[];
  className?: string;
  onSlideChange: (index: number) => void;
  onApiChange?: (api: HeroCarouselApi) => void;
}

export function HeroCarousel({
  images = [],
  className = "",
  onSlideChange,
  onApiChange,
}: HeroCarouselProps) {
  const apiRef = useRef<HeroCarouselApi | null>(null);
  const [carouselApi, setCarouselApiState] = useState<HeroCarouselApi | null>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Memorizar stopAutoplay para evitar recreación en cada render
  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  // Memorizar startAutoplay para evitar recreación en cada render
  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      apiRef.current?.scrollNext();
    }, 5000);
  }, [stopAutoplay]);

  const handlePrevious = useCallback(() => {
    stopAutoplay();
    apiRef.current?.scrollPrev();
  }, [stopAutoplay]);

  const handleNext = useCallback(() => {
    stopAutoplay();
    apiRef.current?.scrollNext();
  }, [stopAutoplay]);

  // Inicialización del carrusel
  useEffect(() => {
    const api = carouselApi;
    if (!api) return;

    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      onSlideChange(selectedIndex);
    };

    api.on("select", handleSelect);
    api.on("pointerDown", stopAutoplay);
    api.on("pointerUp", startAutoplay);

    // Iniciar autoplay después de configurar los listeners
    startAutoplay();

    return () => {
      stopAutoplay();
      api.off("select", handleSelect);
      api.off("pointerDown", stopAutoplay);
      api.off("pointerUp", startAutoplay);
    };
  }, [carouselApi, onSlideChange, startAutoplay, stopAutoplay]);

  const setCarouselApi = useCallback(
    (api: EmblaCarouselApi) => {
      if (!api) return;
      apiRef.current = api;
      setCarouselApiState(api);
      onApiChange?.(api);
      // Notificar el slide inicial inmediatamente
      onSlideChange(api.selectedScrollSnap());
    },
    [onApiChange, onSlideChange]
  );

  if (!images?.length) {
    return (
      <div
        className={`relative w-full h-[65vh] bg-gray-200 flex items-center justify-center ${className}`}
      >
        <p className="text-gray-500">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Carousel
        className="w-full h-full"
        opts={{
          loop: true,
          skipSnaps: false,
        }}
        setApi={setCarouselApi}
      >
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem
              key={`${image.src}-${index}`}
              className="relative p-0 h-full"
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  style={{
                    objectPosition: image.focalPoint || "center center",
                  }}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          className="left-2 z-30 h-11 w-11 border-white/80 bg-black/40 text-white hover:bg-black/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white md:left-4 md:h-9 md:w-9"
          aria-label="Imagen anterior"
          onClick={handlePrevious}
        />
        <CarouselNext
          className="right-2 z-30 h-11 w-11 border-white/80 bg-black/40 text-white hover:bg-black/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white md:right-4 md:h-9 md:w-9"
          aria-label="Imagen siguiente"
          onClick={handleNext}
        />
      </Carousel>
    </div>
  );
}
