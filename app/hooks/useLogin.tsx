// app/hooks/useLogin.tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

interface UseLoginOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface UseLoginReturn {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  isLoading: boolean
  error: string | null
  resetError: () => void
}

export function useLogin(options?: UseLoginOptions): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Usar NextAuth signIn para autenticación
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // No redirigir automáticamente, manejamos nosotros
        callbackUrl: "/dashboard", // URL a la que redirigir después de éxito
      })

      if (result?.error) {
        // Mapear errores de NextAuth a mensajes más amigables
        let errorMessage = "Error al iniciar sesión"
        
        switch (result.error) {
          case "Email y contraseña son requeridos":
            errorMessage = "Por favor, completa todos los campos"
            break
          case "Credenciales inválidas":
            errorMessage = "Email o contraseña incorrectos"
            break
          case "CredentialsSignin":
            errorMessage = "Error de autenticación. Por favor, verifica tus credenciales"
            break
          default:
            errorMessage = result.error
        }
        
        throw new Error(errorMessage)
      }

      if (result?.ok && result.url) {
        // Si hay recordar sesión, podrías guardar algo en localStorage
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true")
        }

        // Ejecutar callback de éxito si existe
        options?.onSuccess?.()

        // Redirigir a la página de dashboard o a la URL de callback
        router.push(result.url)
        router.refresh() // Para actualizar el estado de autenticación
      } else {
        throw new Error("Error desconocido al iniciar sesión")
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al iniciar sesión"
      setError(errorMessage)
      options?.onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetError = () => {
    setError(null)
  }

  return {
    login,
    isLoading,
    error,
    resetError,
  }
}