"use client";

import { ResetPasswordForm } from "../../components/reset-password-form";

export function ResetPasswordPageContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu correo electrónico para recibir las instrucciones de
            restablecimiento
          </p>
        </div>

        {/* Formulario de reset */}
        <ResetPasswordForm />

        {/* Enlaces adicionales */}
        <div className="text-center space-y-4">
          <div className="text-sm text-gray-600">
            ¿Recordaste tu contraseña?{" "}
            <a
              href="/iniciar-sesion"
              className="text-babalu-primary hover:text-babalu-dark font-medium transition-colors"
            >
              Volver al inicio de sesión
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
