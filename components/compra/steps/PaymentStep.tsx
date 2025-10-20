// compra/steps/PaymentStep.tsx
"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { CreditCard, Wallet, AlertCircle, Lock } from "lucide-react";
import { PaymentData, FormErrors, SetErrorsFunction } from "../CompraWizard";
import Image from "next/image";
import type { CartItem } from "app/types/cart";

interface PaymentStepProps {
  formData: PaymentData;
  updateFormData: (data: Partial<PaymentData>) => void;
  errors: FormErrors;
  setErrors: SetErrorsFunction;
  cartItems: CartItem[];
  subtotal: number;
  isLoading: boolean;
  onSubmit: (data: PaymentData) => void;
  onBack: () => void;
}

export function PaymentStep({
  formData,
  updateFormData,
  errors,
  setErrors,
  subtotal,
  isLoading,
  onSubmit,
  onBack,
}: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "mercado-pago" | "credit-card" | "debit-card"
  >("credit-card");
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    document: "",
    email: "",
  });
  const [detectedCardType, setDetectedCardType] = useState("");

  // Validaciones
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, "");
    return /^\d{13,19}$/.test(cleaned) && luhnCheck(cleaned);
  };

  const validateExpiry = (expiry: string): boolean => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

    const [month, year] = expiry.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth))
      return false;

    return true;
  };

  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateCardName = (name: string): boolean => {
    return name.trim().length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateDocument = (doc: string): boolean => {
    return /^\d{7,8}$/.test(doc);
  };

  // Algoritmo de Luhn
  function luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, "").replace(/\D/g, "");
    const matches = cleaned.match(/\d{1,4}/g);
    return matches ? matches.join(" ") : "";
  };

  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Detectar tipo de tarjeta basado en el número
  const detectCardType = (number: string): string => {
    const cleaned = number.replace(/\s/g, "");

    if (cleaned.length === 0) return "";

    if (/^4/.test(cleaned)) return "visa";
    if (/^5[1-5]/.test(cleaned)) return "mastercard";
    if (/^3[47]/.test(cleaned)) return "amex";
    if (/^6(?:011|5)/.test(cleaned)) return "discover";
    if (/^(606488|603522|36|38)/.test(cleaned)) return "naranja";

    return "unknown";
  };

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === "number") {
      formattedValue = formatCardNumber(value);
      const cardType = detectCardType(formattedValue);
      setDetectedCardType(cardType);
    } else if (field === "expiry") {
      formattedValue = formatExpiry(value);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "document") {
      formattedValue = value.replace(/\D/g, "").slice(0, 8);
    }

    setCardData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (paymentMethod === "credit-card" || paymentMethod === "debit-card") {
      if (!validateCardNumber(cardData.number)) {
        newErrors.number = "Número de tarjeta inválido";
      }
      if (!validateExpiry(cardData.expiry)) {
        newErrors.expiry = "Fecha inválida";
      }
      if (!validateCVV(cardData.cvv)) {
        newErrors.cvv = "CVV inválido";
      }
      if (!validateCardName(cardData.name)) {
        newErrors.name = "Nombre requerido";
      }
      if (!validateDocument(cardData.document)) {
        newErrors.document = "Documento inválido";
      }
      if (!validateEmail(cardData.email)) {
        newErrors.email = "Email inválido";
      }
    }

    if (!formData.terms) {
      newErrors.terms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const finalData = {
        ...formData,
        paymentMethod: paymentMethod,
        ...(paymentMethod !== "mercado-pago" && {
          cardNumber: cardData.number.replace(/\s/g, ""),
          cardName: cardData.name,
          expiryDate: cardData.expiry,
          cvv: cardData.cvv,
          email: cardData.email,
        }),
      };
      
      // Si es Mercado Pago, podrías agregar lógica específica aquí
      if (paymentMethod === "mercado-pago") {
        console.log("Procesando pago con Mercado Pago...");
        // Aquí iría la integración con la API de Mercado Pago
      }
      
      onSubmit(finalData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="w-5 h-5 text-babalu-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Método de Pago</h3>
      </div>

      <div className="space-y-4">
        {/* Tarjeta de Crédito */}
        <div className="bg-white rounded-lg border-2 border-gray-200">
          <div
            className={`p-4 cursor-pointer transition-all ${
              paymentMethod === "credit-card"
                ? "bg-blue-50 border-b-2 border-blue-500"
                : ""
            }`}
            onClick={() => setPaymentMethod("credit-card")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "credit-card"
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "credit-card" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <CreditCard className="w-5 h-5 text-gray-700" />
                <div>
                  <span className="font-medium text-gray-900">
                    Tarjeta de crédito
                  </span>
                  <p className="text-xs text-blue-600">Cuotas sin interés</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Logos de tarjetas */}
                <Image
                  src="/img/logos-tarjetas/png-transparent-visa-logo-credit-card-visa-debit-card-payment-card-mastercard-visa-blue-text-trademark.webp"
                  alt="Visa"
                  width={24}
                  height={24}
                />
                <Image
                  src="/img/logos-tarjetas/png-clipart-mastercard-logo-credit-card-visa-brand-mastercard-text-label-thumbnail.webp"
                  alt="Mastercard"
                  width={24}
                  height={24}
                />
                <Image
                  src="/img/logos-tarjetas/png-transparent-american-express-encapsulated-postscript-logo-business-business-blue-angle-text.webp"
                  alt="Amex"
                  width={24}
                  height={24}
                />
                <Image
                  src="/img/logos-tarjetas/tarjeta-naranja.webp"
                  alt="Naranja"
                  width={24}
                  height={24}
                />
                <Image
                  src="/img/logos-tarjetas/Nuevo_Logo_cabal.webp"
                  alt="Cabal"
                  width={24}
                  height={24}
                />
              </div>
            </div>
          </div>

          {/* Formulario de tarjeta de crédito */}
          {paymentMethod === "credit-card" && (
            <div className="p-4 space-y-4 border-t border-gray-200">
              {/* Número de tarjeta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de tarjeta
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 1234 1234 1234"
                    value={cardData.number}
                    onChange={(e) =>
                      handleCardInputChange("number", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.number ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={19}
                  />
                  {detectedCardType === "visa" && (
                    <Image
                      src="/img/logos-tarjetas/png-transparent-visa-logo-credit-card-visa-debit-card-payment-card-mastercard-visa-blue-text-trademark.webp"
                      alt="Visa"
                      width={20}
                      height={20}
                      className="absolute right-3 top-2.5"
                    />
                  )}
                  {detectedCardType === "mastercard" && (
                    <Image
                      src="/img/logos-tarjetas/png-clipart-mastercard-logo-credit-card-visa-brand-mastercard-text-label-thumbnail.webp"
                      alt="Mastercard"
                      width={20}
                      height={20}
                      className="absolute right-3 top-2.5"
                    />
                  )}
                  {detectedCardType === "amex" && (
                    <Image
                      src="/img/logos-tarjetas/png-transparent-american-express-encapsulated-postscript-logo-business-business-blue-angle-text.webp"
                      alt="Amex"
                      width={20}
                      height={20}
                      className="absolute right-3 top-2.5"
                    />
                  )}
                  {detectedCardType === "naranja" && (
                    <Image
                      src="/img/logos-tarjetas/tarjeta-naranja.webp"
                      alt="Naranja"
                      width={20}
                      height={20}
                      className="absolute right-3 top-2.5"
                    />
                  )}
                  {detectedCardType === "cabal" && (
                    <Image
                      src="/img/logos-tarjetas/Nuevo_Logo_cabal.webp"
                      alt="Cabal"
                      width={20}
                      height={20}
                      className="absolute right-3 top-2.5"
                    />
                  )}
                </div>
                {errors.number && (
                  <p className="text-xs text-red-600 mt-1">{errors.number}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Vencimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardData.expiry}
                    onChange={(e) =>
                      handleCardInputChange("expiry", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.expiry ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={5}
                  />
                  {errors.expiry && (
                    <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>
                  )}
                </div>

                {/* CVV */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Código de seguridad
                    <div className="ml-2 w-8 h-6 bg-gray-200 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej.: 123"
                    value={cardData.cvv}
                    onChange={(e) =>
                      handleCardInputChange("cvv", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cvv ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Nombre del titular */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del titular como aparece en la tarjeta
                </label>
                <input
                  type="text"
                  placeholder="María López"
                  value={cardData.name}
                  onChange={(e) =>
                    handleCardInputChange("name", e.target.value)
                  }
                  className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Documento del titular */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento del titular
                </label>
                <div className="flex gap-2">
                  <div className="w-20 px-3 py-2.5 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      DNI
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="99999999"
                    value={cardData.document}
                    onChange={(e) =>
                      handleCardInputChange("document", e.target.value)
                    }
                    className={`flex-1 px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.document ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={8}
                  />
                </div>
                {errors.document && (
                  <p className="text-xs text-red-600 mt-1">{errors.document}</p>
                )}
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-4">
                  Completa tu información
                </h4>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@email.com"
                    value={cardData.email}
                    onChange={(e) =>
                      handleCardInputChange("email", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tarjeta de Débito */}
        <div className="bg-white rounded-lg border-2 border-gray-200">
          <div
            className={`p-4 cursor-pointer transition-all ${
              paymentMethod === "debit-card"
                ? "bg-blue-50 border-b-2 border-blue-500"
                : ""
            }`}
            onClick={() => setPaymentMethod("debit-card")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "debit-card"
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "debit-card" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <CreditCard className="w-5 h-5 text-gray-700" />
                <span className="font-medium text-gray-900">
                  Tarjeta de débito
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Logos de tarjetas */}
                <Image
                  src="/img/logos-tarjetas/png-transparent-visa-logo-credit-card-visa-debit-card-payment-card-mastercard-visa-blue-text-trademark.webp"
                  alt="Visa"
                  width={24}
                  height={24}
                />
                <Image
                  src="/img/logos-tarjetas/png-clipart-mastercard-logo-credit-card-visa-brand-mastercard-text-label-thumbnail.webp"
                  alt="Mastercard"
                  width={24}
                  height={24}
                />
                <Image
                  src="/img/logos-tarjetas/Nuevo_Logo_cabal.webp"
                  alt="Cabal"
                  width={24}
                  height={24}
                />
              </div>
            </div>
          </div>

          {/* Formulario de tarjeta de débito */}
          {paymentMethod === "debit-card" && (
            <div className="p-4 space-y-4 border-t border-gray-200">
              {/* Número de tarjeta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de tarjeta
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 1234 1234 1234"
                    value={cardData.number}
                    onChange={(e) =>
                      handleCardInputChange("number", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.number ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={19}
                  />
                  {detectedCardType === "visa" && (
                    <Image
                      src="/img/logos-tarjetas/png-transparent-visa-logo-credit-card-visa-debit-card-payment-card-mastercard-visa-blue-text-trademark.webp"
                      alt="Visa"
                      width={20}
                      height={20}
                      className="absolute right-3 top-2.5"
                    />
                  )}
                  {detectedCardType === "mastercard" && (
                    <Image
                      src="/img/logos-tarjetas/png-clipart-mastercard-logo-credit-card-visa-brand-mastercard-text-label-thumbnail.webp"
                      alt="Mastercard"
                      width={20}
                      height={20}
                      className="absolute right-3 top-2.5"
                    />
                  )}
                  {detectedCardType === "cabal" && (
                    <Image
                      src="/img/logos-tarjetas/Nuevo_Logo_cabal.webp"
                      alt="Cabal"
                      width={20}
                      height={20}
                      className="absolute right-3 top-2.5"
                    />
                  )}
                </div>
                {errors.number && (
                  <p className="text-xs text-red-600 mt-1">{errors.number}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Vencimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardData.expiry}
                    onChange={(e) =>
                      handleCardInputChange("expiry", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.expiry ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={5}
                  />
                  {errors.expiry && (
                    <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>
                  )}
                </div>

                {/* CVV */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Código de seguridad
                    <div className="ml-2 w-8 h-6 bg-gray-200 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej.: 123"
                    value={cardData.cvv}
                    onChange={(e) =>
                      handleCardInputChange("cvv", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cvv ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Nombre del titular */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del titular como aparece en la tarjeta
                </label>
                <input
                  type="text"
                  placeholder="María López"
                  value={cardData.name}
                  onChange={(e) =>
                    handleCardInputChange("name", e.target.value)
                  }
                  className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Documento del titular */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento del titular
                </label>
                <div className="flex gap-2">
                  <div className="w-20 px-3 py-2.5 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      DNI
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="99999999"
                    value={cardData.document}
                    onChange={(e) =>
                      handleCardInputChange("document", e.target.value)
                    }
                    className={`flex-1 px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.document ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={8}
                  />
                </div>
                {errors.document && (
                  <p className="text-xs text-red-600 mt-1">{errors.document}</p>
                )}
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-4">
                  Completa tu información
                </h4>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@email.com"
                    value={cardData.email}
                    onChange={(e) =>
                      handleCardInputChange("email", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mercado Pago */}
        <div className="bg-white rounded-lg border-2 border-gray-200">
          <div
            className={`p-4 cursor-pointer transition-all ${
              paymentMethod === "mercado-pago" ? "bg-blue-50 border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setPaymentMethod("mercado-pago")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "mercado-pago"
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "mercado-pago" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <Wallet className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">Mercado Pago</span>
              </div>
            </div>
          </div>

          {/* Contenido de Mercado Pago */}
          {paymentMethod === "mercado-pago" && (
            <div className="p-6 space-y-4 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Wallet className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Pago seguro con Mercado Pago
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                        Paga con tarjeta, efectivo o saldo de Mercado Pago
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                        Proceso 100% seguro y encriptado
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                        Recibirás la confirmación inmediatamente
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Serás redirigido a Mercado Pago para completar tu pago de forma segura
                </p>
                
                {/* Información de resumen */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total a pagar:</span>
                    <span className="font-bold text-lg text-babalu-primary">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(subtotal + (formData.shippingOption?.price || 0))}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-left">
                    <p>• Incluye costo de envío: {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(formData.shippingOption?.price || 0)}</p>
                    <p>• El IVA ya está incluido en los precios</p>
                  </div>
                </div>

                {/* Botón de Mercado Pago */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      Pagar con Mercado Pago
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-3">
                  Al continuar, aceptas los{' '}
                  <a href="/terminos" className="text-blue-600 hover:underline">
                    términos y condiciones
                  </a>{' '}
                  de Mercado Pago
                </p>
              </div>

              {/* Métodos de pago aceptados en Mercado Pago */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Métodos de pago aceptados:
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center bg-white border border-gray-200 rounded px-2 py-1">
                    <Image
                      src="/img/logos-tarjetas/png-transparent-visa-logo-credit-card-visa-debit-card-payment-card-mastercard-visa-blue-text-trademark.webp"
                      alt="Visa"
                      width={20}
                      height={20}
                      className="h-4 w-auto"
                    />
                    <span className="text-xs text-gray-600 ml-1">Visa</span>
                  </div>
                  <div className="flex items-center bg-white border border-gray-200 rounded px-2 py-1">
                    <Image
                      src="/img/logos-tarjetas/png-clipart-mastercard-logo-credit-card-visa-brand-mastercard-text-label-thumbnail.webp"
                      alt="Mastercard"
                      width={20}
                      height={20}
                      className="h-4 w-auto"
                    />
                    <span className="text-xs text-gray-600 ml-1">Mastercard</span>
                  </div>
                  <div className="flex items-center bg-white border border-gray-200 rounded px-2 py-1">
                    <Image
                      src="/img/logos-tarjetas/png-transparent-american-express-encapsulated-postscript-logo-business-business-blue-angle-text.webp"
                      alt="Amex"
                      width={20}
                      height={20}
                      className="h-4 w-auto"
                    />
                    <span className="text-xs text-gray-600 ml-1">Amex</span>
                  </div>
                  <div className="flex items-center bg-white border border-gray-200 rounded px-2 py-1">
                    <span className="text-xs text-gray-600">Efectivo</span>
                  </div>
                  <div className="flex items-center bg-white border border-gray-200 rounded px-2 py-1">
                    <span className="text-xs text-gray-600">Transferencia</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Términos y condiciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={formData.terms}
            onChange={(e) => updateFormData({ terms: e.target.checked })}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            Acepto los{" "}
            <a href="/terminos" className="text-blue-600 hover:underline">
              Términos y Condiciones
            </a>{" "}
            y la{" "}
            <a href="/privacidad" className="text-blue-600 hover:underline">
              Política de Privacidad
            </a>
          </label>
        </div>
        {errors.terms && (
          <p className="text-sm text-red-600 mt-2 flex items-center ml-7">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.terms}
          </p>
        )}
      </div>

      {/* Información de seguridad */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">Pago 100% Seguro</p>
            <p className="text-xs mt-1">
              Tus datos están protegidos con encriptación SSL
            </p>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="px-6"
        >
          Anterior
        </Button>
        
        {/* No mostrar el botón "Finalizar Compra" cuando Mercado Pago está seleccionado */}
        {paymentMethod !== "mercado-pago" && (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-babalu-primary hover:bg-babalu-dark text-white px-8 py-2.5"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Finalizar Compra
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}