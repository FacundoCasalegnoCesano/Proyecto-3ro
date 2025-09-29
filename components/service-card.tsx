"use client";

import Image from "next/image";
import { Button } from "../components/ui/button";
import { Clock, DollarSign, CheckCircle, Star } from "lucide-react";
import { useState } from "react";

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

  const handleReservar = () => {
    // Redirigir al formulario de reserva con el servicio preseleccionado
    window.location.href = `/reserva?servicio=${service.id}`;
  };

  const handleVerMas = () => {
    setIsExpanded(!isExpanded);
  };

  const formatPrice = (price: string) => {
    return `$${price}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Imagen del servicio */}
      <div className="relative h-64 bg-gradient-to-br from-babalu-primary/10 to-babalu-primary/5 overflow-hidden">
        <div className="absolute inset-4 group-hover:scale-105 transition-transform duration-300">
          <div className="bg-babalu-primary p-3 rounded-xl h-full">
            <div className="bg-white p-2 rounded-lg h-full relative overflow-hidden">
              <Image
                src={service.image || "/placeholder.svg"}
                alt={service.title}
                fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-2xl font-bold text-gray-800 leading-tight">
              {service.title}
            </h3>
            <div className="flex items-center ml-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>
          <p className="text-babalu-primary font-medium text-lg">
            {service.subtitle}
          </p>
        </div>

        {/* Descripción */}
        <p
          className={`text-gray-600 leading-relaxed mb-6 transition-all duration-300 ${
            isExpanded ? "" : "line-clamp-3"
          }`}
        >
          {service.description}
        </p>

        {/* Botón Ver más/menos */}
        {service.description.length > 150 && (
          <button
            onClick={handleVerMas}
            className="text-babalu-primary hover:text-babalu-dark text-sm font-medium mb-4 transition-colors"
          >
            {isExpanded ? "Ver menos" : "Ver más"}
          </button>
        )}

        {/* Precio y duración */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-50 to-babalu-primary/5 rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-babalu-primary" />
            <span className="text-3xl font-bold text-babalu-primary">
              {formatPrice(service.price)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
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
                  className="flex items-start space-x-3 group/item"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                  <span className="text-sm text-gray-600 group-hover/item:text-gray-800 transition-colors">
                    {benefit}
                  </span>
                </li>
              )
            )}
            {!isExpanded && service.benefits.length > 3 && (
              <li className="text-sm text-babalu-primary font-medium ml-7">
                +{service.benefits.length - 3} beneficios más...
              </li>
            )}
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button
            onClick={handleReservar}
            className="w-full bg-babalu-primary hover:bg-babalu-dark text-white py-3 text-lg font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <span>Reservar Sesión</span>
          </Button>

          {/* Información adicional */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              ✓ Confirmación inmediata por email • ✓ Puedes cancelar hasta 24h
              antes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
