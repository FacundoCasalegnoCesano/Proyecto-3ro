"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Calendar, MapPin, Award, Heart, Sparkles, Users } from "lucide-react"

interface TimelineEvent {
  id: string
  year: string
  date: string
  title: string
  description: string
  location?: string
  type: "education" | "milestone" | "achievement" | "personal"
  image?: string
  icon: React.ComponentType<{ className?: string }>
}

export function MiCaminoTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const timelineEvents: TimelineEvent[] = [
    {
      id: "inicio",
      year: "2016",
      date: "Marzo 2016",
      title: "El Despertar Espiritual",
      description:
        "Mi primer contacto con el mundo espiritual llegó en un momento de gran transformación personal. Buscando sanación interior, descubrí el poder del Reiki y sentí una conexión inmediata con esta práctica ancestral.",
      location: "Buenos Aires, Argentina",
      type: "personal",
      icon: Sparkles,
      image: "/placeholder.svg?height=200&width=300&text=Spiritual+Awakening&bg=E8F5E8",
    },
    {
      id: "reiki-1",
      year: "2017",
      date: "Junio 2017",
      title: "Certificación Reiki Nivel I",
      description:
        "Completé mi primera certificación en Reiki Usui Nivel I. Este fue el comienzo formal de mi camino como sanadora energética. Aprendí las bases de la canalización de energía universal.",
      location: "Centro Holístico Luz Dorada",
      type: "education",
      icon: Award,
      image: "/placeholder.svg?height=200&width=300&text=Reiki+Level+1&bg=FFE4B5",
    },
    {
      id: "primeros-clientes",
      year: "2018",
      date: "Enero 2018",
      title: "Primeras Sesiones",
      description:
        "Comencé a ofrecer mis primeras sesiones de Reiki a familiares y amigos. La respuesta fue increíble y confirmó que este era mi verdadero llamado. Cada sesión me enseñaba algo nuevo.",
      type: "milestone",
      icon: Users,
      image: "/placeholder.svg?height=200&width=300&text=First+Sessions&bg=F0E6FF",
    },
    {
      id: "tarot",
      year: "2019",
      date: "Septiembre 2019",
      title: "Iniciación en el Tarot",
      description:
        "Descubrí el Tarot Rider-Waite y me fascinó su capacidad para brindar guía y claridad. Dediqué meses al estudio intensivo de cada carta y su simbolismo profundo.",
      type: "education",
      icon: Sparkles,
      image: "/placeholder.svg?height=200&width=300&text=Tarot+Learning&bg=FFB6C1",
    },
    {
      id: "reiki-2",
      year: "2020",
      date: "Marzo 2020",
      title: "Reiki Nivel II - Okuden",
      description:
        "Avancé al segundo nivel de Reiki, aprendiendo los símbolos sagrados y técnicas de sanación a distancia. Este nivel profundizó mi conexión con la energía universal.",
      location: "Formación Online - Pandemia",
      type: "education",
      icon: Award,
      image: "/placeholder.svg?height=200&width=300&text=Reiki+Level+2&bg=E0FFFF",
    },
    {
      id: "espacio-propio",
      year: "2021",
      date: "Julio 2021",
      title: "Mi Primer Espacio Sagrado",
      description:
        "Abrí mi primer consultorio dedicado exclusivamente a la sanación energética. Diseñé cada detalle para crear un ambiente de paz y transformación.",
      location: "Villa Crespo, CABA",
      type: "milestone",
      icon: MapPin,
      image: "/placeholder.svg?height=200&width=300&text=Sacred+Space&bg=F5DEB3",
    },
    {
      id: "reiki-master",
      year: "2022",
      date: "Noviembre 2022",
      title: "Maestría en Reiki - Shinpiden",
      description:
        "Alcancé el nivel de Maestra en Reiki Usui. Ahora puedo iniciar a otros en esta hermosa práctica y transmitir las enseñanzas que tanto han transformado mi vida.",
      type: "achievement",
      icon: Award,
      image: "/placeholder.svg?height=200&width=300&text=Reiki+Master&bg=FFD700",
    },
    {
      id: "expansion",
      year: "2023",
      date: "Abril 2023",
      title: "Expansión de Servicios",
      description:
        "Incorporé la limpieza espiritual y de espacios a mis servicios. También comencé a trabajar con productos artesanales como sahumerios y cristales.",
      type: "milestone",
      icon: Sparkles,
      image: "/placeholder.svg?height=200&width=300&text=Service+Expansion&bg=DDA0DD",
    },
    {
      id: "presente",
      year: "2024",
      date: "Presente",
      title: "Babalu Aye Reiki & Tarot",
      description:
        "Hoy continúo mi misión de acompañar a las personas en su camino de sanación y crecimiento espiritual. Cada día es una oportunidad de servir desde el amor.",
      type: "personal",
      icon: Heart,
      image: "/placeholder.svg?height=200&width=300&text=Present+Day&bg=FFC0CB",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "education":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "milestone":
        return "bg-green-100 text-green-800 border-green-200"
      case "achievement":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "personal":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "education":
        return "Formación"
      case "milestone":
        return "Hito"
      case "achievement":
        return "Logro"
      case "personal":
        return "Personal"
      default:
        return "Evento"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Mi Camino Espiritual</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Un recorrido por los momentos más importantes que han marcado mi desarrollo como sanadora y guía espiritual
        </p>
      </div>

      <div className="relative">
        {/* Línea central */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-babalu-primary h-full rounded-full"></div>

        {/* Eventos */}
        <div className="space-y-12">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
              {/* Contenido */}
              <div className={`w-5/12 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                <div
                  className={`bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                    selectedEvent === event.id ? "border-babalu-primary shadow-lg" : ""
                  }`}
                  onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                >
                  {/* Año destacado */}
                  <div className="text-2xl font-bold text-babalu-primary mb-2">{event.year}</div>

                  {/* Tipo de evento */}
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-3 ${getTypeColor(event.type)}`}
                  >
                    {getTypeLabel(event.type)}
                  </div>

                  {/* Título */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>

                  {/* Fecha */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{event.date}</span>
                  </div>

                  {/* Ubicación */}
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {/* Descripción */}
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>

                  {/* Imagen expandible */}
                  {selectedEvent === event.id && event.image && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <Image
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Punto central con ícono */}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-babalu-primary rounded-full flex items-center justify-center shadow-lg">
                  <event.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Espacio vacío del otro lado */}
              <div className="w-5/12"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Llamada a la acción */}
      <div className="text-center mt-16 p-8 bg-gradient-to-r from-babalu-primary/10 to-babalu-primary/5 rounded-xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">¿Quieres ser parte de mi historia?</h3>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Cada persona que llega a mi consulta se convierte en parte de este camino. Permíteme acompañarte en tu proceso
          de sanación y crecimiento.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/servicios"
            className="bg-babalu-primary hover:bg-babalu-dark text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Conocer Servicios
          </a>
          <a
            href="https://wa.me/5491123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
