"use client";

import Image from "next/image";
import { ArrowRight, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { formatPrice, parsePrice } from "../utils/price-utils";
import { getWhatsAppContactUrl } from "../lib/whatsapp";

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

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleVerMas = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Imagen del servicio */}
      <div className="relative aspect-[16/9] overflow-hidden bg-orange-50">
        <div className="absolute inset-3 rounded-2xl bg-babalu-primary p-2">
          <div className="relative h-full overflow-hidden rounded-xl bg-white">
            <Image
              src={service.image || "/placeholder.svg"}
              alt={service.title}
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="mb-2 min-w-0">
            <h3 className="break-words text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
              {service.title}
            </h3>
          </div>
          <p className="text-base font-semibold text-babalu-dark">
            {service.subtitle}
          </p>
        </div>

        {/* Descripción */}
        <p
          id={`descripcion-${service.id}`}
          className={`text-gray-600 leading-relaxed mb-6 transition-all duration-300 ${
            isExpanded ? "" : "line-clamp-3"
          }`}
        >
          {service.description}
        </p>

        {/* Botón Ver más/menos */}
        {service.description.length > 150 && (
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={`descripcion-${service.id}`}
            onClick={handleVerMas}
            className="mb-4 min-h-11 text-sm font-medium text-babalu-action underline-offset-4 transition-colors hover:text-babalu-dark hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-action focus-visible:ring-offset-2"
          >
            {isExpanded ? "Ver menos" : "Ver más"}
          </button>
        )}

        {/* Precio y duración */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50/70 p-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tabular-nums text-babalu-dark sm:text-3xl">
              {formatPrice(parsePrice(service.price))}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{service.duration}</span>
          </div>
        </div>

        {/* Beneficios */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Beneficios principales:
          </h4>
          <ul className="space-y-2">
            {(isExpanded ? service.benefits : service.benefits.slice(0, 3)).map(
              (benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3"
                >
                  <CheckCircle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-babalu-action" />
                  <span className="text-sm leading-relaxed text-gray-700">
                    {benefit}
                  </span>
                </li>
              )
            )}
            {!isExpanded && service.benefits.length > 3 && (
              <li className="ml-7 text-sm font-medium text-babalu-action">
                +{service.benefits.length - 3} beneficios más...
              </li>
            )}
          </ul>
        </div>

        <a
          href={getWhatsAppContactUrl(`Hola, quisiera consultar por el servicio ${service.title}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
        >
          Consultar por WhatsApp
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
