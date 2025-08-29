"use client"

import { MiCaminoCard } from "./mi-camino-card"

interface MiCaminoSection {
  id: string
  title: string
  content: string
  image: string
}

export function MiCaminoGrid() {
  const sections: MiCaminoSection[] = [
    {
      id: "quien-soy",
      title: "¿Quien soy?",
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
      image: "/img/about-me.jpg", // Cambia por tu imagen real
    },
    {
      id: "mi-area-trabajo",
      title: "Mi Area De Trabajo",
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
      image: "/img/11744750643661.webp",
    },
    {
      id: "mi-formacion",
      title: "Mi Formación",
      content: `Mi camino en las artes espirituales comenzó hace más de 8 años cuando descubrí el poder sanador del Reiki. Desde entonces, me he formado en diversas disciplinas: Reiki Usui nivel III, Lectura de Tarot Rider-Waite, Limpieza Energética y Aromaterapia. Cada certificación ha sido un paso más en mi crecimiento personal y espiritual.`,
      image: "/img/training.jpg", // Cambia por tu imagen real
    },
    {
      id: "mi-mision",
      title: "Mi Misión",
      content: `Mi propósito es acompañarte en tu proceso de sanación y crecimiento espiritual. Creo firmemente que cada persona tiene el poder de transformar su vida cuando encuentra el equilibrio entre cuerpo, mente y espíritu. A través de mis servicios, busco ser un canal de luz y sanación para quienes necesitan orientación en su camino.`,
      image: "/img/mission.jpg", // Cambia por tu imagen real
    },
    {
      id: "mi-filosofia",
      title: "Mi Filosofía",
      content: `Trabajo desde el amor incondicional y el respeto hacia cada ser. Cada consulta es única y sagrada, por eso me tomo el tiempo necesario para conectar con la energía de cada persona. Mi enfoque combina la sabiduría ancestral con técnicas modernas, siempre adaptándome a las necesidades específicas de cada consultante.`,
      image: "/img/philosophy.jpg", // Cambia por tu imagen real
    },
    {
      id: "mi-espacio",
      title: "Mi Espacio Sagrado",
      content: `He creado un ambiente especial donde la energía fluye libremente. Mi consulta está diseñada para generar paz y tranquilidad, con cristales, plantas sagradas y una decoración que invita a la relajación. Cada elemento ha sido cuidadosamente seleccionado para potenciar la experiencia de sanación y conexión espiritual.`,
      image: "/img/sacred-space.jpg", // Cambia por tu imagen real
    },
  ]

  return (
    <div className="space-y-8 lg:space-y-16">
      {sections.map((section, index) => (
        <MiCaminoCard key={section.id} section={section} reverse={index % 2 !== 0} />
      ))}
    </div>
  )
}