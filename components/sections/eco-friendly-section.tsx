"use client";

import { Heart, Leaf, Recycle, Sprout } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "100% Biodegradable",
    description:
      "Diseñados para minimizar el impacto ambiental, con envases reciclables y materiales de bajo impacto.",
  },
  {
    icon: Recycle,
    title: "Eco-Sostenible",
    description:
      "Fabricados con insumos naturales y procesos responsables con el planeta.",
  },
  {
    icon: Heart,
    title: "Sin Químicos",
    description:
      "Libres de fragancias y aditivos artificiales que puedan afectar tu salud o la del entorno.",
  },
  {
    icon: Sprout,
    title: "Origen Natural",
    description:
      "Cada producto está elaborado a mano con ingredientes naturales, fomentando un consumo consciente.",
  },
];

export function EcoFriendlySection() {
  return (
    <section className="w-full bg-green-50 py-14 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="mb-8 text-center md:mb-10">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-green-100 p-2.5 text-green-800">
            <Leaf aria-hidden="true" className="h-7 w-7" />
          </div>
          <h2 className="mb-3 text-balance text-2xl font-bold text-gray-900 md:text-3xl">
            Comprometidos con el Medio Ambiente
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
            Nuestros productos son 100% biodegradables y respetuosos con la
            naturaleza
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex h-full flex-col items-center rounded-xl border border-green-900/10 bg-white p-5 text-center shadow-sm"
            >
              <div className="mb-4 rounded-full bg-green-100 p-3 text-green-800">
                <feature.icon aria-hidden="true" className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-gray-700">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-gray-700 md:mt-10">
          En Babalú, nos comprometemos a ofrecer productos que cuiden de ti y
          del planeta. Cada compra que realizas contribuye a un futuro más
          sostenible y consciente.
        </p>
      </div>
    </section>
  );
}
