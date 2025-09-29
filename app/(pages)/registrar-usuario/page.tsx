"use client"

import { Header } from "components/header"
import { PageLayout } from "../../../components/layout/page-layout"
import { Button } from "../../../components/ui/button"
import { Eye, EyeOff, Mail, Lock, User, Calendar, Loader2 } from "lucide-react"
import { useState } from "react"
import type React from "react"

interface FormData {
  email: string
  firstName: string
  lastName: string
  birthDate: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  firstName?: string
  lastName?: string
  birthDate?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function RegistrarUsuarioPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validar email
    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido"
    }

    // Validar nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido"
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres"
    }

    // Validar apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido"
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "El apellido debe tener al menos 2 caracteres"
    }

    // Validar fecha de nacimiento
    if (!formData.birthDate) {
      newErrors.birthDate = "La fecha de nacimiento es requerida"
    } else {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      if (age < 13) {
        newErrors.birthDate = "Debes tener al menos 13 años para registrarte"
      } else if (age > 120) {
        newErrors.birthDate = "Por favor ingresa una fecha válida"
      }
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);
  setErrors({});

  try {
    console.log('Enviando datos:', {
      nombre: formData.firstName.trim(),
      apellido: formData.lastName.trim(),
      email: formData.email.toLowerCase(),
      password: formData.password,
      fechaNac: formData.birthDate,
    });

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        nombre: formData.firstName.trim(),
        apellido: formData.lastName.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        fechaNac: formData.birthDate,
      }),
    });

    // Verificar el tipo de contenido primero
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Respuesta inesperada: ${text}`);
    }

    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (!response.ok) {
      // Manejar errores específicos
      if (response.status === 409) {
        throw new Error(data.error || 'El usuario ya existe');
      } else if (response.status === 400) {
        throw new Error(data.error || 'Datos inválidos');
      } else {
        throw new Error(data.error || `Error ${response.status}`);
      }
    }

    // Registro exitoso
    console.log("Usuario registrado exitosamente:", data.user);
    
    // Mostrar mensaje de éxito
    alert("¡Registro exitoso! Bienvenido a Babalu Aye");
    
    // Redirigir al login
    window.location.href = "/iniciar-sesion?message=Cuenta+creada+exitosamente";
    
  } catch (error) {
    console.error("Error en registro:", error);
    
    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (error.message.includes('El usuario ya existe')) {
        setErrors({ email: error.message });
      } else if (error.message.includes('Datos inválidos')) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: error.message });
      }
    } else {
      setErrors({ general: "Error desconocido. Intenta nuevamente." });
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <PageLayout>
      <Header />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Crear Cuenta</h2>
            <p className="mt-2 text-sm text-gray-600">
              Únete a nuestra comunidad espiritual y accede a todos nuestros servicios
            </p>
          </div>

          {/* Formulario de registro */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error general */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              {/* Nombre y Apellido en una fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                        errors.firstName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Tu nombre"
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                {/* Apellido */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                        errors.lastName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Tu apellido"
                    />
                  </div>
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Fecha de nacimiento */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                      errors.birthDate ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                      errors.confirmPassword ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Términos y condiciones */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-babalu-primary focus:ring-babalu-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    Acepto los{" "}
                    <a href="#" className="text-babalu-primary hover:text-babalu-dark">
                      términos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="#" className="text-babalu-primary hover:text-babalu-dark">
                      política de privacidad
                    </a>
                  </label>
                </div>
              </div>

              {/* Botón de envío */}
              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-babalu-primary hover:bg-babalu-dark text-white py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-babalu-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </div>

              {/* Información de seguridad */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-800 font-medium mb-2">Requisitos de contraseña:</p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Mínimo 8 caracteres</li>
                  <li>• Al menos una letra mayúscula</li>
                  <li>• Al menos una letra minúscula</li>
                  <li>• Al menos un número</li>
                </ul>
              </div>
            </form>
          </div>

          {/* Enlaces adicionales */}
          <div className="text-center">
            <div className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <a
                href="/iniciar-sesion"
                className="text-babalu-primary hover:text-babalu-dark font-medium transition-colors"
              >
                Inicia sesión aquí
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">O regístrate con</span>
            </div>
          </div>

          {/* Botones de redes sociales */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="ml-2">Google</span>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="ml-2">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}