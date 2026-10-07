// app/iniciar-sesion/page.tsx
"use client";

import { useRef, useState } from "react";
import { Header } from "components/header";
import { PageLayout } from "../../../components/layout/page-layout";
import { Button } from "components/ui/button";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useLogin } from "app/hooks/useLogin";

export default function IniciarSesionPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const { login, isLoading, error } = useLogin({
    onSuccess: () => {
      // Limpiar formulario después de éxito
      setFormData({ email: "", password: "", rememberMe: false });
    },
    onError: (error) => {
      console.error("Error en login:", error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    if (newErrors.email) {
      emailRef.current?.focus();
    } else if (newErrors.password) {
      passwordRef.current?.focus();
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await login(formData.email, formData.password, formData.rememberMe);
  };

  return (
    <PageLayout>
      <Header />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Accede a tu cuenta de Babalu
            </p>
          </div>

          {/* Formulario de login */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Error de autenticación */}
              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Campo de email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-babalu-action focus:border-babalu-action ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Campo de contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-babalu-action focus:border-babalu-action ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-action"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Recordar sesión */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-babalu-action focus:ring-babalu-action border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Recordar sesión
                  </label>
                </div>
              </div>

              {/* Botón de envío */}
              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-h-11 w-full bg-babalu-action hover:bg-babalu-dark text-white py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-babalu-action disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </div>

            </form>
          </div>

          {/* Enlaces adicionales */}
          <div className="text-center space-y-4">
            <div className="text-sm">
              <a
                href="/reset-password"
                className="text-babalu-action hover:text-babalu-dark transition-colors underline underline-offset-4"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <a
                href="/registrar-usuario"
                className="text-babalu-action hover:text-babalu-dark font-medium transition-colors underline underline-offset-4"
              >
                Regístrate aquí
              </a>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
