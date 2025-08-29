"use client";

import Image from "next/image";
import { Button } from "../components/ui/button";
import { Clock, DollarSign, CheckCircle } from "lucide-react";

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
  const handleReservar = () => {
    // Aquí iría la lógica para reservar una sesión específica
    alert(`Reservando sesión de ${service.title}...`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Imagen del servicio */}
      <div className="relative h-64 bg-gradient-to-br from-babalu-primary/10 to-babalu-primary/5">
        <div className="absolute inset-4">
          <div className="bg-babalu-primary p-3 rounded-xl h-full">
            <div className="bg-white p-2 rounded-lg h-full">
              <Image
                src={service.image || "/placeholder.svg"}
                alt={service.title}
                fill
                className="object-cover rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {service.title}
          </h3>
          <p className="text-babalu-primary font-medium">{service.subtitle}</p>
        </div>

        {/* Descripción */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {service.description}
        </p>

        {/* Precio y duración */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-black" />
            <span className="text-2xl font-bold text-black">
              {service.price}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{service.duration}</span>
          </div>
        </div>

        {/* Beneficios */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Beneficios:</h4>
          <ul className="space-y-2">
            {service.benefits.slice(0, 3).map((benefit, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Botón de reserva */}
        <Button
          onClick={handleReservar}
          className="w-full bg-babalu-primary hover:bg-babalu-dark text-white py-3 text-lg font-medium rounded-lg transition-all duration-200 hover:scale-105"
          >
          Reservar Sesión
        </Button>
      </div>
    </div>
  );
}
