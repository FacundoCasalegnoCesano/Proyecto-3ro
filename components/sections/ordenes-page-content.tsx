"use client"

import { OrdenesLista } from "components/ordenes-lista"

export function OrdenesPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F7] to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrdenesLista />
      </div>
    </div>
  )
}
