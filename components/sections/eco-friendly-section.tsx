"use client"

import { Leaf, Recycle, Heart, Sprout } from "lucide-react"

export function EcoFriendlySection() {
  const features = [
    {
      icon: Leaf,
      title: "100% Biodegradable",
      description: "Diseñados para minimizar el impacto ambiental, con envases reciclables y materiales de bajo impacto.",
    },
    {
      icon: Recycle,
      title: "Eco-Sostenible",
      description: "Fabricados con insumos naturales y procesos responsables con el planeta.",
    },
    {
      icon: Heart,
      title: "Sin Químicos",
      description: "Libres de fragancias y aditivos artificiales que puedan afectar tu salud o la del entorno.",
    },
    {
      icon: Sprout,
      title: "Origen Natural",
      description: "Cada producto está elaborado a mano con ingredientes naturales, fomentando un consumo consciente.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-16 bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Comprometidos con el Medio Ambiente</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nuestros productos son 100% biodegradables y respetuosos con la naturaleza
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-green-100 rounded-full mb-4">
                <feature.icon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 max-w-3xl mx-auto">
            En Babalú, nos comprometemos a ofrecer productos que cuiden de ti y del planeta. Cada compra que realizas
            contribuye a un futuro más sostenible y consciente.
          </p>
        </div>
      </div>
    </section>
  )
}
