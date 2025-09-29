// app/hooks/useLogin.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseLoginReturn {
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
}

export function useLogin(options?: UseLoginOptions): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/#",
      });

      if (result?.error) {
        let errorMessage = "Error al iniciar sesión";

        switch (result.error) {
          case "Email y contraseña son requeridos":
            errorMessage = "Por favor, completa todos los campos";
            break;
          case "Credenciales inválidas":
            errorMessage = "Email o contraseña incorrectos";
            break;
          case "CredentialsSignin":
            errorMessage =
              "Error de autenticación. Por favor, verifica tus credenciales";
            break;
          default:
            errorMessage = result.error;
        }

        throw new Error(errorMessage);
      }

      if (result?.ok && result.url) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        options?.onSuccess?.();

        router.push(result.url);
        router.refresh();
      } else {
        throw new Error("Error desconocido al iniciar sesión");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al iniciar sesión";
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetError = () => {
    setError(null);
  };

  return {
    login,
    isLoading,
    error,
    resetError,
  };
}
