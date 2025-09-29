"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

type FormStep = "email" | "verification" | "newPassword" | "success";

interface FormData {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  verificationCode?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export function ResetPasswordForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>("email");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateEmail = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerificationCode = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.verificationCode) {
      newErrors.verificationCode = "El código de verificación es requerido";
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = "El código debe tener 6 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPassword = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword =
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu nueva contraseña";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simular envío de código
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simular verificación de email existente
      if (formData.email === "admin@babalu.com") {
        setCurrentStep("verification");
      } else {
        setErrors({
          email: "No encontramos una cuenta asociada a este correo electrónico",
        });
      }
    } catch (error) {
      console.error("Error al enviar el código:", error);
      setErrors({
        general: "Error al enviar el código. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateVerificationCode()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simular verificación del código
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simular código correcto
      if (formData.verificationCode === "123456") {
        setCurrentStep("newPassword");
      } else {
        setErrors({
          verificationCode: "Código incorrecto. Intenta con 123456",
        });
      }
    } catch (error) {
      console.error("Error al verificar el código:", error);
      setErrors({
        general: "Error al verificar el código. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateNewPassword()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simular actualización de contraseña
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Nueva contraseña establecida para:", formData.email);
      setCurrentStep("success");
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      setErrors({
        general: "Error al actualizar la contraseña. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Código reenviado a " + formData.email);
    } catch (error) {
      console.error("Error al reenviar el código:", error);
      setErrors({
        general: "Error al reenviar el código.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
      <form className="space-y-6" onSubmit={handleEmailSubmit}>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {errors.general}
          </div>
        )}

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
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-babalu-primary hover:bg-babalu-dark text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando código...
            </>
          ) : (
            "Enviar Código de Verificación"
          )}
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Email de prueba:
          </p>
          <p className="text-sm text-blue-700">
            <strong>Email:</strong> admin@babalu.com
          </p>
        </div>
      </form>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-babalu-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-babalu-primary" />
        </div>
        <p className="text-sm text-gray-600">
          Hemos enviado un código de 6 dígitos a{" "}
          <strong>{formData.email}</strong>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleVerificationSubmit}>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {errors.general}
          </div>
        )}

        <div>
          <label
            htmlFor="verificationCode"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Código de Verificación
          </label>
          <input
            id="verificationCode"
            name="verificationCode"
            type="text"
            maxLength={6}
            value={formData.verificationCode}
            onChange={handleInputChange}
            className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary text-center text-2xl tracking-widest ${
              errors.verificationCode ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="000000"
          />
          {errors.verificationCode && (
            <p className="mt-1 text-sm text-red-600">
              {errors.verificationCode}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-babalu-primary hover:bg-babalu-dark text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar Código"
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading}
            className="text-sm text-babalu-primary hover:text-babalu-dark transition-colors disabled:opacity-50"
          >
            ¿No recibiste el código? Reenviar
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCurrentStep("email")}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Cambiar correo electrónico
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Código de prueba:
          </p>
          <p className="text-sm text-blue-700">
            <strong>Código:</strong> 123456
          </p>
        </div>
      </form>
    </div>
  );

  const renderNewPasswordStep = () => (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-sm text-gray-600">
          Código verificado correctamente. Ahora puedes establecer tu nueva
          contraseña.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handlePasswordSubmit}>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {errors.general}
          </div>
        )}

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nueva Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-10 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                errors.newPassword ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
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
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-babalu-primary hover:bg-babalu-dark text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Actualizando contraseña...
            </>
          ) : (
            "Actualizar Contraseña"
          )}
        </Button>

        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800 font-medium mb-2">
            Requisitos de contraseña:
          </p>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Mínimo 8 caracteres</li>
            <li>• Al menos una letra mayúscula</li>
            <li>• Al menos una letra minúscula</li>
            <li>• Al menos un número</li>
          </ul>
        </div>
      </form>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        ¡Contraseña Actualizada!
      </h3>
      <p className="text-gray-600 mb-8">
        Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar
        sesión con tu nueva contraseña.
      </p>

      <div className="space-y-4">
        <Button
          onClick={() => (window.location.href = "/iniciar-sesion")}
          className="w-full bg-babalu-primary hover:bg-babalu-dark text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          Ir al Inicio de Sesión
        </Button>

        <button
          onClick={() => (window.location.href = "/")}
          className="w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );

  return (
    <>
      {currentStep === "email" && renderEmailStep()}
      {currentStep === "verification" && renderVerificationStep()}
      {currentStep === "newPassword" && renderNewPasswordStep()}
      {currentStep === "success" && renderSuccessStep()}
    </>
  );
}
