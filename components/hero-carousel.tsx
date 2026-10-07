"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi as EmblaCarouselApi,
} from "../components/ui/carousel";
import { Button } from "../components/ui/button";

export type HeroCarouselApi = NonNullable<EmblaCarouselApi>;

interface HeroImage {
  src: string;
  alt: string;
  focalPoint?: string;
}

interface HeroCarouselProps {
  images: HeroImage[];
  className?: string;
  selectedIndex: number;
  onSlideChange: (index: number) => void;
  onApiChange?: (api: HeroCarouselApi) => void;
}

export function HeroCarousel({
  images = [],
  className = "",
  selectedIndex,
  onSlideChange,
  onApiChange,
}: HeroCarouselProps) {
  const apiRef = useRef<HeroCarouselApi | null>(null);
  const [carouselApi, setCarouselApi] = useState<HeroCarouselApi | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const pauseAutoplay = useCallback(() => setIsPlaying(false), []);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsPlaying(!motionPreference.matches);

    const updateMotionPreference = (event: MediaQueryListEvent) => {
      setIsPlaying(!event.matches);
    };

    motionPreference.addEventListener("change", updateMotionPreference);
    return () => motionPreference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!carouselApi || !isPlaying) return;

    const timer = window.setInterval(() => {
      apiRef.current?.scrollNext();
    }, 7000);

    return () => window.clearInterval(timer);
  }, [carouselApi, isPlaying]);

  useEffect(() => {
    if (!carouselApi) return;

    const updateSelectedSlide = () => {
      onSlideChange(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", updateSelectedSlide);
    return () => {
      carouselApi.off("select", updateSelectedSlide);
    };
  }, [carouselApi, onSlideChange]);

  const handlePrevious = useCallback(() => {
    pauseAutoplay();
    apiRef.current?.scrollPrev();
  }, [pauseAutoplay]);

  const handleNext = useCallback(() => {
    pauseAutoplay();
    apiRef.current?.scrollNext();
  }, [pauseAutoplay]);

  const setApi = useCallback(
    (api: EmblaCarouselApi) => {
      if (!api) return;
      apiRef.current = api;
      setCarouselApi(api);
      onApiChange?.(api);
      onSlideChange(api.selectedScrollSnap());
    },
    [onApiChange, onSlideChange]
  );

  if (!images?.length) {
    return (
      <div
        className={`relative flex h-[65vh] w-full items-center justify-center bg-gray-200 ${className}`}
      >
        <p className="text-gray-700">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onFocusCapture={(event) => {
        if (!(event.target as HTMLElement).closest("[data-carousel-play-toggle]")) {
          pauseAutoplay();
        }
      }}
      onPointerDownCapture={(event) => {
        if (!(event.target as HTMLElement).closest("[data-carousel-play-toggle]")) {
          pauseAutoplay();
        }
      }}
      onTouchStart={(event) => {
        if (!(event.target as HTMLElement).closest("[data-carousel-play-toggle]")) {
          pauseAutoplay();
        }
      }}
    >
      <Carousel
        aria-label="Imágenes de servicios y productos de Babalu"
        className="h-full w-full"
        opts={{ loop: true, skipSnaps: false }}
        setApi={setApi}
      >
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem
              key={`${image.src}-${index}`}
              className="relative h-full p-0"
            >
              <div className="relative h-full w-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: image.focalPoint || "center center" }}
                  priority={index === 0}
                  sizes="100vw"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          className="left-3 z-30 hidden h-11 w-11 border-white/80 bg-black/40 text-white hover:bg-black/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white md:left-5 md:inline-flex"
          aria-label="Imagen anterior"
          onClick={handlePrevious}
        />
        <CarouselNext
          className="right-3 z-30 hidden h-11 w-11 border-white/80 bg-black/40 text-white hover:bg-black/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white md:right-5 md:inline-flex"
          aria-label="Imagen siguiente"
          onClick={handleNext}
        />
      </Carousel>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="absolute bottom-4 left-[calc(50%_-_1.5rem)] z-30 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/35 px-2 sm:left-1/2">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => {
              pauseAutoplay();
              apiRef.current?.scrollTo(index);
            }}
            onFocus={pauseAutoplay}
            aria-label={`Ir a imagen ${index + 1}`}
            aria-current={selectedIndex === index ? "true" : undefined}
            className="group flex h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span
              aria-hidden="true"
              className={`block h-2.5 rounded-full transition-[width,background-color] duration-200 ${
                selectedIndex === index
                  ? "w-6 bg-white"
                  : "w-2.5 bg-white/60 group-hover:bg-white"
              }`}
            />
          </button>
        ))}
      </div>
      <Button
        type="button"
        data-carousel-play-toggle
        variant="outline"
        size="icon"
        aria-label={isPlaying ? "Pausar carrusel" : "Reproducir carrusel"}
        aria-pressed={isPlaying}
        onClick={() => setIsPlaying((playing) => !playing)}
        className="absolute bottom-4 right-4 z-30 h-11 w-11 rounded-full border-white/80 bg-black/40 text-white hover:bg-black/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
      >
        {isPlaying ? (
          <Pause aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Play aria-hidden="true" className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
