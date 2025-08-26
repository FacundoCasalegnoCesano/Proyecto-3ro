"use client";

import { ServiceCard } from "./service-card";

interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  price: string;
  duration: string;
  benefits: string[];
}

export function ServicesGrid() {
  const services: Service[] = [
    {
      id: "tarot",
      title: "Lectura De Tarot",
      subtitle: "Tarot Rider-Waite",
      description:
        "Consultas personalizadas de Tarot para guiar tu camino espiritual. Utilizamos el tradicional mazo Rider-Waite para brindarte claridad sobre tu presente y futuro. Cada lectura es única y adaptada a tus necesidades específicas.",
      image: "/img/cartas-tarot.jpg",
      price: "$3500",
      duration: "60 minutos",
      benefits: [
        "Claridad sobre situaciones actuales",
        "Guía para tomar decisiones importantes",
        "Conexión con tu intuición",
        "Perspectiva sobre relaciones y trabajo",
      ],
    },
    {
      id: "reiki",
      title: "Sesión de Reiki",
      subtitle: "Sanación Energética",
      description:
        "Terapia de sanación energética que utiliza la imposición de manos para canalizar energía universal. El Reiki ayuda a equilibrar los chakras, reducir el estrés y promover la sanación natural del cuerpo y la mente.",
      image:
        "/placeholder.svg?height=300&width=400&text=Reiki+Session&bg=E8F5E8",
      price: "$4000",
      duration: "90 minutos",
      benefits: [
        "Reducción del estrés y ansiedad",
        "Equilibrio energético",
        "Mejora del sueño",
        "Fortalecimiento del sistema inmune",
        "Sanación emocional",
      ],
    },
    {
      id: "limpieza-espiritual",
      title: "Limpieza Espiritual",
      subtitle: "Purificación del Aura",
      description:
        "Ritual de limpieza energética personal para eliminar bloqueos, energías negativas y cargas emocionales. Incluye limpieza del aura, equilibrio de chakras y protección espiritual personalizada.",
      image:
        "/placeholder.svg?height=300&width=400&text=Spiritual+Cleansing&bg=F0E6FF",
      price: "$2800",
      duration: "45 minutos",
      benefits: [
        "Eliminación de energías negativas",
        "Purificación del aura",
        "Protección espiritual",
        "Renovación energética",
        "Mayor claridad mental",
      ],
    },
    {
      id: "limpieza-espacios",
      title: "Limpieza de Espacios",
      subtitle: "Armonización del Hogar",
      description:
        "Limpieza energética completa de hogares, oficinas o locales comerciales. Utilizamos sahumerios, cristales y técnicas ancestrales para purificar y armonizar los espacios, creando un ambiente de paz y prosperidad.",
      image:
        "/placeholder.svg?height=300&width=400&text=Space+Cleansing&bg=FFF4E6",
      price: "$5500",
      duration: "2-3 horas",
      benefits: [
        "Purificación del ambiente",
        "Eliminación de energías estancadas",
        "Armonización del espacio",
        "Protección del hogar",
        "Mejora de la prosperidad",
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
