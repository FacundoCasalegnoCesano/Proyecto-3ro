"use client";

import { RegisterForm } from "../../components/register-form";

export function RegisterPageContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete a nuestra comunidad espiritual y accede a todos nuestros
            servicios
          </p>
        </div>

        {/* Formulario de registro */}
        <RegisterForm />

        {/* Enlaces adicionales */}
        <div className="text-center">
          <div className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/iniciar-sesion"
              className="text-babalu-primary hover:text-babalu-dark font-medium transition-colors"
            >
              Inicia sesión aquí
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
