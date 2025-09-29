"use client";

import { MiCaminoHero } from "../../components/mi-camino-hero";
import { MiCaminoStats } from "../../components/mi-camino-stats";
import { MiCaminoTimeline } from "../../components/mi-camino-timeline";
import { MiCaminoGrid } from "../../components/mi-camino-grid";

export function MiCaminoPageContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <MiCaminoHero />

      {/* Estadísticas */}
      <div className="container mx-auto px-4 py-8">
        <MiCaminoStats />
      </div>

      {/* Timeline interactiva */}
      <div className="container mx-auto px-4 py-8">
        <MiCaminoTimeline />
      </div>

      {/* Grid de secciones informativas */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Más sobre mi trabajo
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conoce en detalle mi filosofía, metodología y el espacio donde
            realizo las sesiones
          </p>
        </div>
        <MiCaminoGrid />
      </div>
    </div>
  );
}
