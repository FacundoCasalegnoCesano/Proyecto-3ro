"use client"

import { Users, Calendar, Award, Heart } from "lucide-react"

export function MiCaminoStats() {
  const stats = [
    {
      icon: Calendar,
      number: "8+",
      label: "Años de experiencia",
      description: "Dedicados a la sanación energética",
    },
    {
      icon: Users,
      number: "500+",
      label: "Personas atendidas",
      description: "Cada una con su historia única",
    },
    {
      icon: Award,
      number: "5",
      label: "Certificaciones",
      description: "En diferentes disciplinas espirituales",
    },
    {
      icon: Heart,
      number: "∞",
      label: "Amor y dedicación",
      description: "En cada sesión y consulta",
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Mi trayectoria en números</h3>
        <p className="text-gray-600">Algunos datos que reflejan mi compromiso con la sanación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 bg-babalu-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <stat.icon className="w-8 h-8 text-babalu-primary" />
            </div>
            <div className="text-3xl font-bold text-babalu-primary mb-2">{stat.number}</div>
            <div className="font-semibold text-gray-800 mb-1">{stat.label}</div>
            <div className="text-sm text-gray-600">{stat.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
