// hooks/useAuth.ts
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

interface UseAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useAuth = ({ onSuccess, onError }: UseAuthProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // No redirigir automáticamente
      });

      if (result?.error) {
        const errorMessage = getErrorMessage(result.error);
        setError(errorMessage);
        onError?.(errorMessage);
      } else if (result?.ok) {
        // Login exitoso
        setSuccess(true);
        onSuccess?.();
        // El modal se encargará de la redirección
        console.log("Login exitoso, el modal manejará la redirección");
      }
    } catch {
      const errorMessage = "Ocurrió un error durante el inicio de sesión";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "CredentialsSignin":
        return "Credenciales inválidas. Verifica tu email y contraseña.";
      case "Configuration":
        return "Error de configuración del servidor";
      case "AccessDenied":
        return "Acceso denegado";
      case "Verification":
        return "El token de verificación ha expirado o es inválido";
      default:
        return "Error al iniciar sesión. Intenta nuevamente.";
    }
  };

  return {
    handleLogin,
    isLoading,
    error,
    success,
  };
};
