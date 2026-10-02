"use client";

import { LoginForm } from "../../components/login-page";

export function LoginPageContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accede a tu cuenta para gestionar tus pedidos y reservas
          </p>
        </div>

        {/* Formulario de login */}
        <LoginForm />

        {/* Enlaces adicionales */}
        <div className="text-center space-y-4">
          <div className="text-sm">
            <a
              href="/reset-password"
              className="text-babalu-primary hover:text-babalu-dark transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div className="text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <a
              href="/registrar-usuario"
              className="text-babalu-primary hover:text-babalu-dark font-medium transition-colors"
            >
              Regístrate aquí
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
