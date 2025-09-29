"use client";

import { ReservaForm } from "components/reserva-form";

export function ReservaPageContent() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reservar Sesión</h1>
          <p className="mt-2 text-sm text-gray-600">
            Selecciona tu servicio preferido y agenda tu cita de sanación
            espiritual
          </p>
        </div>

        {/* Formulario de reserva */}
        <ReservaForm />
      </div>
    </div>
  );
}
