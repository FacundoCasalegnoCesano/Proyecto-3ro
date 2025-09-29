// app/productos/modificar/page.tsx
"use client";

import { Header } from "components/header";
import { ModificarProductoPageContent } from "components/sections/modificar-producto-page-content";
import { PageLayout } from "components/layout/page-layout";
import { Suspense } from "react";

// Componente interno que usa useSearchParams
function ModificarProductoContent() {
  return (
    <PageLayout>
      <Header />
      <ModificarProductoPageContent />
    </PageLayout>
  );
}

// Componente principal con Suspense
export default function ModificarProductoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-babalu-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <ModificarProductoContent />
    </Suspense>
  );
}
