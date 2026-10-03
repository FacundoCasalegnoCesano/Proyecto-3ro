// app/hooks/useLogin.tsx - Versión simplificada que usa Sonner
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const SERVICE_UNAVAILABLE_MESSAGE =
  "El inicio de sesión no está disponible en este momento. Inténtalo de nuevo más tarde.";

export function useLogin(options?: UseLoginOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);

    const loadingToast = toast.loading("Iniciando sesión...");

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      toast.dismiss(loadingToast);

      if (result?.error) {
        const errorMessage = mapSignInError(result.error);

        // Mostrar toast de error
        toast.error("Error de autenticación", {
          description: errorMessage,
          duration: 5000,
        });

        setError(errorMessage);
        options?.onError?.(errorMessage);
        return false;
      }

      if (result?.ok) {
        // Guardar preferencia de "recordarme"
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        // Toast de éxito
        toast.success("¡Bienvenido!", {
          description: "Has iniciado sesión correctamente",
          duration: 3000,
        });

        options?.onSuccess?.();

        // Redirección
        router.push("/"); // Ajusta esta ruta
        router.refresh();
        return true;
      }

      return false;
    } catch {
      toast.dismiss(loadingToast);

      // No mostrar mensajes de red o del servidor que puedan incluir detalles internos.
      const errorMessage = SERVICE_UNAVAILABLE_MESSAGE;

      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      });

      setError(errorMessage);
      options?.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetError = () => setError(null);

  return {
    login,
    isLoading,
    error,
    resetError,
  };
}

function mapSignInError(error: string): string {
  if (error === "CredentialsSignin") {
    return "Email o contraseña incorrectos";
  }

  // Keep the existing safe messages for explicitly recognized public errors.
  if (error === "Email y contraseña son requeridos") {
    return "Por favor, completa todos los campos";
  }
  if (error === "Error de configuración del usuario") {
    return "Error de configuración del usuario";
  }

  // Service sentinels and all unknown NextAuth errors must not look like bad credentials.
  return SERVICE_UNAVAILABLE_MESSAGE;
}
