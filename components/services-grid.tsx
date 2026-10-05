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
      price: "30000",
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
        "Terapia vibracional pleyadiana. Es una terapia de alta frecuencia que trabaja con cristales de cuarzo, geometria sagrada y simbolos pleyadianos. Atravez de la puja elevamos la vibracion para liberar bloqueos, cortar lazos y alinear chakras. Ideal para cuando te sentis entacada, cargada o repitiendo historias de lineaje.",
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
        "Sistema natural de esencias florales diseñado para armonizar y equilibrar las emociones. En una entrevista personalizada, identificamos los estados emocionales que necesitas trabajar para preparar una formula floral a tu medida, No tapan lo que sentis, te ayudan a atravesarlo con mas calma, claridad y amor.",
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
      subtitle: "Pendulo y Oráculos",
      description:
        "Preguntas concretas al pendulo y al oráculo para obtener respuestas claras y precisas sobre situaciones específicas. Esta técnica permite acceder a la sabiduría interna y a la guía espiritual, ayudando a tomar decisiones informadas y a encontrar claridad en momentos de incertidumbre.",
      image:
        "/img/pendulo.jpg",
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
      id: "ritual-abrecaminos",
      title: "Velomancia y Rituales con Velas",
      subtitle: "Ritual Abrecaminos",
      description:
        "Limpieza energetica profunda para destrabar lo que no avanza en tu vida (dinero, amor, trabajo, salud).",
      image:
        "/img/abrecaminos.jpg",
      price: "25000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
     {
      id: "ritual-corte-carmatico",
      title: "Ritual Corte Karmático",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Este ritual ayuda a cortar pactos, promesas y lealtades inconsientes desde el útero y vidas pasadas.",
      image:
        "/img/karmatico.jpg",
      price: "25000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
      {
      id: "ritual-corte-lealtades",
      title: "Ritual Corte Lealtades Familiares",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Este ritual corta ese amor que duele, que no deja avanzar y que genera sufrimiento. No dejas de amar a tu familia, dejas de repetir su destino liberandote de lo que no te pertenece.",
      image:
        "/img/familiares.jpg",
      price: "25000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
      {
      id: "ritual-corte-magia",
      title: "Ritual Corte de Trabajo de Magia",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Este ritual corta, limpia y protege de trabajos de magia, brujería, hechicería y mal de ojo.",
      image:
        "/img/magia.jpg",
      price: "25000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
      {
      id: "ritual-armonizacion",
      title: "Ritual de Armonización y Vinculo de Pareja",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Este ritual ayuda a armonizar el lazo para cortar con los conflictos y mejorar la comunicación, la comprensión y el amor en la relación.",
      image:
        "/img/pareja.jpg",
      price: "25000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
      {
      id: "ritual-corte-energetico",
      title: "Ritual Corte de Lazos Energéticos",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Este ritual ayuda a cortar lazos energéticos con personas, lugares o situaciones que ya no te sirven, liberando tu energía y permitiéndote avanzar en tu vida con mayor claridad y libertad. No corta el amor, corta la dependencia, la obsesión y el dolor, devuelve a cada uno su propia energía.",
      image:
        "/img/energetico.jpg",
      price: "25000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
      {
      id: "ritual-limpieza-espiritual",
      title: "Ritual Limpieza Energética",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Este ritual ayuda a limpiar y purificar tu energía, eliminando bloqueos y energías negativas que puedan estar afectando tu bienestar físico, emocional y espiritual. Es ideal para restaurar el equilibrio y la armonía en tu vida.",
      image:
        "/img/limpieza.jpg",
      price: "25000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
      {
      id: "ritual-corte-generacional",
      title: "Ritual Corte Generacional de la Escasez Economica",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Corta la promesa de escasez de 7 generaciones y abre el camino a la prosperidad y abundancia en tu vida. Este ritual ayuda a romper patrones familiares de limitación económica, permitiéndote atraer oportunidades y bienestar financiero.",
      image:
        "/img/flores.jpg",
      price: "30000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
      {
      id: "ritual-corte-sobrepeso",
      title: "Ritual Corte Generacional de Sobrepeso",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Tu sobrepeso no siempre es por comida. A veces es por historia. Es la lealtad al clan que paso hambre, a la abuela que guardo todo en el cuerpo para no desaparecer, a la que tuvo que hacerse grande y fuerte para que no le hagan daño. Este ritual corta ese pacto. No es dieta, es liberacion del cuerpo que carga con tu linaje",
      image:
        "/img/flores.jpg",
      price: "30000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
      {
      id: "ritual-corte-amor-propio",
      title: "Ritual Corte Generacional de Amor Propio",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Este ritual corta el pacto de no merecerte amor, de no sentirte suficiente, de no valorarte. Te ayuda a reconectar con tu esencia y a cultivar el amor propio, la autoestima y la confianza en ti mismo.",
      image:
        "/img/flores.jpg",
      price: "30000",
      duration: "90 minutos",
      benefits: [
        "Armonización y equilibrio emocional",
        "Alivio natural de la ansiedad, miedos y frustraciones",
        "Apoyo en procesos de cambio y momentos difíciles",
        "Tratamiento 100% natural sin contraindicaciones",
      ],
    },
      {
      id: "ritual-amor-propio",
      title: "Ritual de Amor Propio",
      subtitle: "Velomancia y Rituales con Velas",
      description:
        "Este ritual ayuda a fortalecer la relación contigo mismo, promoviendo la aceptación, el respeto y el cuidado personal. Es ideal para quienes buscan mejorar su autoestima y establecer límites saludables en sus relaciones.",
      image:
        "/img/flores.jpg",
      price: "25000",
      duration: "90 minutos",
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
