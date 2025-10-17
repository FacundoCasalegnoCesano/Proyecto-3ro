"use client";

import { MarcasLista } from "components/marcas-lista";

export function MarcasPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F7] to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MarcasLista />
      </div>
    </div>
  );
}
