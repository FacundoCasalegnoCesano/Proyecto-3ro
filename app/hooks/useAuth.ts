// hooks/useAuth.ts
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

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

    // Mostrar toast de carga
    const loadingToast = toast.loading("Iniciando sesión...");

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      // Cerrar toast de carga
      toast.dismiss(loadingToast);

      if (result?.error) {
        const errorMessage = getErrorMessage(result.error);
        setError(errorMessage);

        // Mostrar toast de error específico
        if (errorMessage.includes("incorrectos")) {
          toast.error("Credenciales incorrectas", {
            description: "El email o la contraseña son incorrectos",
            duration: 5000,
          });
        } else {
          toast.error("Error de autenticación", {
            description: errorMessage,
            duration: 5000,
          });
        }

        onError?.(errorMessage);
        return false;
      } else if (result?.ok) {
        // Login exitoso
        setSuccess(true);

        // Mostrar toast de éxito
        toast.success("¡Bienvenido!", {
          description: "Has iniciado sesión correctamente",
          duration: 3000,
        });

        onSuccess?.();
        return true;
      }

      return false;
    } catch (error: unknown) {
      // ✅ Cambiado de any a unknown
      // Cerrar toast de carga
      toast.dismiss(loadingToast);

      let errorMessage = "Ocurrió un error durante el inicio de sesión";

      // ✅ Manejo seguro del error
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message);
      }

      setError(errorMessage);

      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      });

      onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: string): string => {
    // Limpiar el mensaje de error para mostrar uno más amigable
    const errorLower = error.toLowerCase();

    if (
      errorLower.includes("credenciales") ||
      errorLower.includes("inválidas")
    ) {
      return "Email o contraseña incorrectos";
    }

    if (errorLower.includes("email") && errorLower.includes("requeridos")) {
      return "Por favor, completa todos los campos";
    }

    if (
      errorLower.includes("configuración") ||
      errorLower.includes("configuracion")
    ) {
      return "Error de configuración del servidor";
    }

    if (error.includes("Error durante la autenticación")) {
      return "Error del servidor. Intenta más tarde.";
    }

    // Mensaje por defecto
    return "Email o contraseña incorrectos";
  };

  const clearError = () => setError(null);

  return {
    handleLogin,
    isLoading,
    error,
    success,
    clearError,
  };
};
