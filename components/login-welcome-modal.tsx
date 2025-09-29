"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

export function LoginWelcomeModal() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownForSession, setHasShownForSession] = useState<string>("");
  const router = useRouter();

  const redirectToDashboard = useCallback(() => {
    router.push("/dashboard");
    router.refresh();
  }, [router]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Pequeño delay para que la animación se vea antes de redirigir
    setTimeout(() => {
      redirectToDashboard();
    }, 200);
  }, [redirectToDashboard]);

  useEffect(() => {
    // Solo mostrar si está autenticado y tenemos datos del usuario
    if (status === "authenticated" && session?.user) {
      const sessionId = session.user.id || session.user.email || "default";

      // Solo mostrar si no hemos mostrado el modal para esta sesión
      if (hasShownForSession !== sessionId) {
        console.log("Usuario autenticado, mostrando modal:", session.user);
        setIsVisible(true);
        setHasShownForSession(sessionId);

        // Auto-cerrar después de 4 segundos y redirigir
        const timer = setTimeout(() => {
          handleClose();
        }, 4000);

        return () => clearTimeout(timer);
      }
    }

    // Ocultar si no hay sesión
    if (status === "unauthenticated") {
      setIsVisible(false);
      setHasShownForSession("");
    }
  }, [session, status, hasShownForSession, handleClose]);

  // No mostrar mientras carga o si no está visible
  if (status === "loading" || !isVisible || !session?.user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
        {/* Header con ícono de éxito */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              ¡Inicio de sesión exitoso!
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-babalu-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-babalu-primary">
                {session.user.nombre?.charAt(0)?.toUpperCase() ||
                  session.user.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-800">
                ¡Bienvenido,{" "}
                <span className="text-babalu-primary">
                  {session.user.nombre || "Usuario"}
                </span>
                !
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Has iniciado sesión correctamente en Babalu.
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {session.user.email}
                </span>
                {session.user.rol && (
                  <span className="text-xs bg-babalu-primary/10 text-babalu-primary px-2 py-1 rounded-full capitalize">
                    {session.user.rol}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Redirigiendo al dashboard automáticamente...
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            onClick={handleClose}
            className="bg-babalu-primary hover:bg-babalu-dark"
          >
            Continuar al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
