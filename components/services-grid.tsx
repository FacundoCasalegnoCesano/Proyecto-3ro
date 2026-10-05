"use client";

import { ServiceCard } from "./service-card";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Search, Star, Users, Clock } from "lucide-react";

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
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<
    "todos" | "tarot" | "energia" | "limpieza"
  >("todos");
  const [busqueda, setBusqueda] = useState("");

  const services: Service[] = [
    {
      id: "tarot",
      title: "Lectura De Tarot",
      subtitle: "Tarot Egipcio",
      description:
        "Consultas personalizadas de Tarot para guiar tu camino espiritual. Utilizamos el tradicional mazo Egipcio para brindarte claridad sobre tu presente y futuro. Cada lectura es única y adaptada a tus necesidades específicas, ayudándote a tomar decisiones importantes con confianza y sabiduría.",
      image: "/img/510084.webp",
      price: "3500",
      duration: "60 minutos",
      benefits: [
        "Claridad sobre situaciones actuales",
        "Guía para tomar decisiones importantes",
        "Conexión con tu intuición",
        "Perspectiva sobre relaciones y trabajo",
        "Comprensión de patrones de vida",
        "Orientación espiritual personalizada",
      ],
    },
    {
      id: "reiki",
      title: "Sesión de Reiki Usui",
      subtitle: "Sanación Energética",
      description:
        "Terapia de sanación energética que utiliza la imposición de manos para canalizar energía universal. El Reiki ayuda a equilibrar los chakras, reducir el estrés y promover la sanación natural del cuerpo y la mente. Una experiencia profundamente relajante que restaura tu equilibrio interno.",
      image:
        "/img/reiki-niveles.webp",
      price: "22000",
      duration: "60 minutos",
      benefits: [
        "Restaura el equilibrio energético",
        "Mejora la calidad del sueño",
        "Promueve la autocuración física, mental y emocional",
        "Reduce el estrés y la ansiedad",
        "Fortalece el sistema inmunológico",
        "Aumenta la vitalidad y energía",
      ],
    },
    {
      id: "limpieza-energetica",
      title: "Limpieza Energética",
      subtitle: "Purificación del Aura",
      description:
        "Ritual de limpieza energética con péndulo y cristales que se utiliza para detectar y eliminar bloqueos energéticos en el cuerpo y el entorno, promoviendo el equilibrio, la paz y la armonía. Ideal para liberar energías estancadas y restaurar tu vibración natural.",
      image:
        "/img/lg.webp",
      price: "27000",
      duration: "90 minutos",
      benefits: [
        "Eliminación de energías negativas",
        "Promueve el bienestar físico, emocional y espiritual",
        "Restauración del flujo energético",
        "Mayor claridad mental",
        "Sensación de ligereza y renovación",
        "Protección energética personal",
      ],
    },
    {
      id: "limpieza-espacios",
      title: "Limpieza de Espacios",
      subtitle: "Armonización del Hogar",
      description:
        "Limpieza energética completa de hogares, oficinas o locales comerciales. Utilizamos sahumerios, cristales y técnicas ancestrales para purificar y armonizar los espacios, creando un ambiente de paz y prosperidad. Transformamos la energía de tu hogar o lugar de trabajo.",
      image:
        "/img/R6XJNzldS_2000x1500__1.webp",
      price: "50000",
      duration: "2-3 horas",
      benefits: [
        "Purificación completa del ambiente",
        "Eliminación de energías estancadas",
        "Armonización de todos los espacios",
        "Protección duradera del hogar",
        "Mejora de la prosperidad",
        "Ambiente de paz y tranquilidad",
      ],
    },
    {
      id: "pendulo-hebreo",
      title: "Limpieza con Péndulo Hebreo",
      subtitle: "Liberación de Bloqueos",
      description:
        "Herramienta de radiestesia vibracional usada para diagnosticar y equilibrar el campo energético de una persona o espacio. El péndulo hebreo es una técnica especializada que permite identificar y liberar bloqueos profundos, facilitando un proceso de sanación integral y transformación personal.",
      image:
        "/img/Limpieza-con-Pendulo-Hebreo-banner-1024x576.webp",
      price: "32000",
      duration: "3 horas",
      benefits: [
        "Sanación energética profunda",
        "Crecimiento personal acelerado",
        "Desintoxicación energética completa",
        "Bienestar emocional y mental",
        "Liberación de bloqueos ancestrales",
        "Limpieza energética especializada",
      ],
    },
    {
      id: "tarot-africano",
      title: "Sesión de Tarot Africano",
      subtitle: "Sabiduría Ancestral",
      description:
        "Es una herramienta que permite profundizar en el autoconocimiento y la comprensión de uno mismo, siendo guía y orientación en momentos de incertidumbre o cambio. También permite al consultante realizar una reflexión e introspección, ofreciendo una perspectiva única y profunda sobre la vida y su entorno, conectando con la sabiduría ancestral africana.",
      image:
        "/img/D_NQ_NP_951846-MLA92809211063_092025-O.webp",
      price: "30000",
      duration: "1-2 horas",
      benefits: [
        "Sanación espiritual profunda",
        "Crecimiento personal transformador",
        "Conexión con sabiduría ancestral",
        "Desbloqueo de potencial interno",
        "Claridad sobre propósito de vida",
        "Integración de aspectos sombra",
      ],
    },
    {
      id: "sesion-de-tameana",
      title: "Sesión de Tameana",
      subtitle: "Terapia Vibracional",
      description:
        "Técnica de sanación holística que utiliza cristales de cuarzo, geometría sagrada y símbolos para elevar la vibración del cuerpo y la mente. Tameana trabaja liberando bloqueos emocionales y energéticos profundos, ayudando a restaurar el equilibrio interior y promoviendo una sensación de paz y claridad.",
      image:
        "/img/tameana.jpg",
      price: "30000",
      duration: "90 minutos",
      benefits: [
        "Elevación del nivel de vibración energética",
        "Liberación de bloqueos emocionales y estridentes",
        "Reducción del estrés y la ansiedad",
        "Aumento de la paz mental y la armonía interior",
      ],
    },
    {
      id: "terapia-floral",
      title: "Consulta de Flores de Bach y Formula Floral Personalizada",
      subtitle: "Terapia Floral",
      description:
        "Sistema natural de esencias florales diseñado para armonizar y equilibrar las emociones. En una entrevista personalizada, identificamos los estados emocionales que necesitas trabajar para preparar un preparado floral a tu medida, ayudándote a gestionar el miedo, la incertidumbre o el cansancio de forma suave.",
      image:
        "/img/flores.jpg",
      price: "40000",
      duration: "1-2 horas",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
    {
      id: "pendulo",
      title: "Consulta al Péndulo y Oraculos",
      subtitle: "Terapia Floral",
      description:
        "Preguntas concretas al pendulo y al oráculo para obtener respuestas claras y precisas sobre situaciones específicas. Esta técnica permite acceder a la sabiduría interna y a la guía espiritual, ayudando a tomar decisiones informadas y a encontrar claridad en momentos de incertidumbre.",
      image:
        "/img/flores.jpg",
      price: "15000",
      duration: "1-2 horas",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
    {
      id: "ritual-velas",
      title: "Velomancia y Rituales con Velas",
      subtitle: "Terapia Floral",
      description:
        "Sistema natural de esencias florales diseñado para armonizar y equilibrar las emociones. En una entrevista personalizada, identificamos los estados emocionales que necesitas trabajar para preparar un preparado floral a tu medida, ayudándote a gestionar el miedo, la incertidumbre o el cansancio de forma suave.",
      image:
        "/img/flores.jpg",
      price: "40000",
      duration: "1-2 horas",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
  ];

  // Filtrar servicios
  const serviciosFiltrados = services.filter((service) => {
    const coincideBusqueda =
      service.title.toLowerCase().includes(busqueda.toLowerCase()) ||
      service.subtitle.toLowerCase().includes(busqueda.toLowerCase()) ||
      service.description.toLowerCase().includes(busqueda.toLowerCase());

    if (filtroSeleccionado === "todos") return coincideBusqueda;

    if (filtroSeleccionado === "tarot") {
      return (
        coincideBusqueda &&
        (service.id === "tarot" || service.id === "tarot-africano")
      );
    }

    if (filtroSeleccionado === "energia") {
      return (
        coincideBusqueda &&
        (service.id === "reiki" || service.id === "pendulo-hebreo")
      );
    }

    if (filtroSeleccionado === "limpieza") {
      return (
        coincideBusqueda &&
        (service.id === "limpieza-energetica" ||
          service.id === "limpieza-espacios")
      );
    }

    return coincideBusqueda;
  });

  const filtros = [
    { id: "todos" as const, label: "Todos los Servicios", icon: Star },
    { id: "tarot" as const, label: "Lecturas de Tarot", icon: Star },
    { id: "energia" as const, label: "Sanación Energética", icon: Users },
    { id: "limpieza" as const, label: "Limpiezas", icon: Clock },
  ];

  return (
    <div className="w-full">
      {/* Controles de filtrado y búsqueda */}
      <div className="mb-8 space-y-4">
        {/* Barra de búsqueda */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
          />
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap justify-center gap-3">
          {filtros.map((filtro) => {
            const Icon = filtro.icon;
            return (
              <Button
                key={filtro.id}
                onClick={() => setFiltroSeleccionado(filtro.id)}
                variant={
                  filtroSeleccionado === filtro.id ? "default" : "outline"
                }
                className={`flex items-center space-x-2 ${
                  filtroSeleccionado === filtro.id
                    ? "bg-babalu-primary hover:bg-babalu-dark"
                    : "bg-white hover:bg-babalu-primary/5 text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{filtro.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Indicador de resultados */}
      {busqueda && (
        <div className="mb-6 text-center text-gray-600">
          {serviciosFiltrados.length === 0
            ? `No se encontraron servicios para "${busqueda}"`
            : `${serviciosFiltrados.length} servicio${
                serviciosFiltrados.length === 1 ? "" : "s"
              } encontrado${
                serviciosFiltrados.length === 1 ? "" : "s"
              } para "${busqueda}"`}
        </div>
      )}

      {/* Grid de servicios */}
      {serviciosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {serviciosFiltrados.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No se encontraron servicios
          </h3>
          <p className="text-gray-500 mb-4">
            Intenta cambiar los filtros o términos de búsqueda
          </p>
          <Button
            onClick={() => {
              setBusqueda("");
              setFiltroSeleccionado("todos");
            }}
            className="bg-babalu-primary hover:bg-babalu-dark"
          >
            Ver todos los servicios
          </Button>
        </div>
      )}
    </div>
  );
}
