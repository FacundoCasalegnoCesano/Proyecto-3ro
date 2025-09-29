// app/components/sections/configuration-page-content.tsx
"use client";

import { UserConfigurationForm } from "components/user-configuration-form";

export function ConfigurationPageContent() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Configuración de Usuario
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona tu información personal y preferencias de cuenta
          </p>
        </div>

        {/* Formulario de configuración */}
        <UserConfigurationForm />
      </div>
    </div>
  );
}
