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
        let errorMessage = "Email o contraseña incorrectos";

        // Mapear errores específicos
        if (result.error.includes("requeridos")) {
          errorMessage = "Por favor, completa todos los campos";
        } else if (result.error.includes("configuración")) {
          errorMessage = "Error de configuración del usuario";
        }

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
    } catch (error: unknown) {
      toast.dismiss(loadingToast);

      // ✅ Manejo seguro del tipo unknown
      let errorMessage = "Error desconocido al iniciar sesión";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message);
      }

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
