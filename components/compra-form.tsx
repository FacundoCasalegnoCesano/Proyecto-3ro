"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { CreditCard, User, MapPin, Truck, Shield, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useCart } from "../contexts/cart-context"
import { useSession } from "next-auth/react" // Importar useSession

interface PaymentData {
  // Información personal
  firstName: string
  lastName: string
  email: string
  phone: string

  // Dirección de envío
  address: string
  city: string
  state: string
  zipCode: string
  country: string

  // Información de pago
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string

  // Opciones
  shippingMethod: string
  paymentMethod: string
  saveInfo: boolean
  terms: boolean
}

interface FormErrors {
  [key: string]: string
}

export function CompraForm() {
  const { data: session } = useSession() // Usar useSession en lugar de useAuth
  const { clearCart } = useCart()

  const [formData, setFormData] = useState<PaymentData>({
    firstName: session?.user?.name?.split(' ')[0] || "", // Extraer nombre del session
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || "", // Extraer apellido
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Argentina",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    shippingMethod: "standard",
    paymentMethod: "credit-card",
    saveInfo: false,
    terms: false,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [orderSuccess, setOrderSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Limpiar errores
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      // Validar información personal
      if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido"
      if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido"
      if (!formData.email.trim()) newErrors.email = "El email es requerido"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido"
      if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido"
    }

    if (step === 2) {
      // Validar dirección
      if (!formData.address.trim()) newErrors.address = "La dirección es requerida"
      if (!formData.city.trim()) newErrors.city = "La ciudad es requerida"
      if (!formData.state.trim()) newErrors.state = "La provincia es requerida"
      if (!formData.zipCode.trim()) newErrors.zipCode = "El código postal es requerido"
    }

    if (step === 3) {
      // Validar pago
      if (formData.paymentMethod === "credit-card") {
        if (!formData.cardNumber.trim()) newErrors.cardNumber = "El número de tarjeta es requerido"
        else if (formData.cardNumber.replace(/\s/g, "").length < 16) newErrors.cardNumber = "Número de tarjeta inválido"

        if (!formData.expiryDate.trim()) newErrors.expiryDate = "La fecha de vencimiento es requerida"
        if (!formData.cvv.trim()) newErrors.cvv = "El CVV es requerido"
        else if (formData.cvv.length < 3) newErrors.cvv = "CVV inválido"

        if (!formData.cardName.trim()) newErrors.cardName = "El nombre en la tarjeta es requerido"
      }

      if (!formData.terms) newErrors.terms = "Debes aceptar los términos y condiciones"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setFormData((prev) => ({ ...prev, cardNumber: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(3)) return

    setIsLoading(true)

    try {
      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simular éxito del pago
      console.log("Procesando pago:", formData)

      setOrderSuccess(true)
      clearCart()

      // Redirigir después de 3 segundos
      setTimeout(() => {
        window.location.href = "/"
      }, 3000)
    } catch (error) {
      setErrors({ general: "Error al procesar el pago. Intenta nuevamente." })
    } finally {
      setIsLoading(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Pago Exitoso!</h2>
        <p className="text-gray-600 mb-6">
          Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación en breve.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">Número de orden: #ORD-{Date.now()}</p>
        </div>
        <p className="text-sm text-gray-500">Serás redirigido automáticamente...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? "bg-babalu-primary text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              <span
                className={`ml-2 text-sm ${currentStep >= step ? "text-babalu-primary font-medium" : "text-gray-500"}`}
              >
                {step === 1 && "Información Personal"}
                {step === 2 && "Dirección de Envío"}
                {step === 3 && "Pago"}
              </span>
              {step < 3 && (
                <div className={`w-12 h-0.5 mx-4 ${currentStep > step ? "bg-babalu-primary" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors.general}
          </div>
        )}

        {/* Step 1: Información Personal */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="w-5 h-5 text-babalu-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                    errors.firstName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Tu nombre"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                    errors.lastName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Tu apellido"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="+54 11 1234-5678"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Dirección de Envío */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="w-5 h-5 text-babalu-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Dirección de Envío</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                    errors.address ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Calle y número"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                      errors.city ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Ciudad"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provincia *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                      errors.state ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Provincia"
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                      errors.zipCode ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="1234"
                  />
                  {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary bg-white"
                >
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Uruguay">Uruguay</option>
                </select>
              </div>

              {/* Método de envío */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Truck className="w-5 h-5 text-babalu-primary" />
                  <h4 className="text-md font-medium text-gray-900">Método de Envío</h4>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === "standard"}
                      onChange={handleInputChange}
                      className="text-babalu-primary focus:ring-babalu-primary"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Envío Estándar</div>
                      <div className="text-sm text-gray-600">5-7 días hábiles - Gratis</div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === "express"}
                      onChange={handleInputChange}
                      className="text-babalu-primary focus:ring-babalu-primary"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Envío Express</div>
                      <div className="text-sm text-gray-600">2-3 días hábiles - $500</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Información de Pago */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="w-5 h-5 text-babalu-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Información de Pago</h3>
            </div>

            {/* Método de pago */}
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit-card"
                  checked={formData.paymentMethod === "credit-card"}
                  onChange={handleInputChange}
                  className="text-babalu-primary focus:ring-babalu-primary"
                />
                <CreditCard className="w-5 h-5 ml-3 text-gray-600" />
                <span className="ml-3 font-medium text-gray-900">Tarjeta de Crédito/Débito</span>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={formData.paymentMethod === "transfer"}
                  onChange={handleInputChange}
                  className="text-babalu-primary focus:ring-babalu-primary"
                />
                <div className="w-5 h-5 ml-3 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">$</span>
                </div>
                <span className="ml-3 font-medium text-gray-900">Transferencia Bancaria</span>
              </label>
            </div>

            {/* Información de tarjeta */}
            {formData.paymentMethod === "credit-card" && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Tarjeta *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                      errors.cardNumber ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                        errors.expiryDate ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      maxLength={4}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                        errors.cvv ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="123"
                    />
                    {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre en la Tarjeta *</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                      errors.cardName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Nombre como aparece en la tarjeta"
                  />
                  {errors.cardName && <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>}
                </div>
              </div>
            )}

            {/* Información de transferencia */}
            {formData.paymentMethod === "transfer" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Datos para Transferencia</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Banco:</strong> Banco Nación
                  </p>
                  <p>
                    <strong>CBU:</strong> 0110599520000012345678
                  </p>
                  <p>
                    <strong>Alias:</strong> BABALU.REIKI.TAROT
                  </p>
                  <p>
                    <strong>Titular:</strong> Babalu Aye Reiki & Tarot
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-2">Envía el comprobante por WhatsApp para confirmar tu pedido</p>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="saveInfo"
                  checked={formData.saveInfo}
                  onChange={handleInputChange}
                  className="mt-1 text-babalu-primary focus:ring-babalu-primary"
                />
                <span className="ml-2 text-sm text-gray-600">Guardar mi información para futuras compras</span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  className="mt-1 text-babalu-primary focus:ring-babalu-primary"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Acepto los{" "}
                  <a href="#" className="text-babalu-primary hover:underline">
                    términos y condiciones
                  </a>{" "}
                  y la{" "}
                  <a href="#" className="text-babalu-primary hover:underline">
                    política de privacidad
                  </a>{" "}
                  *
                </span>
              </label>
              {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}
            </div>

            {/* Seguridad */}
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
              <div className="text-sm text-green-800">
                <div className="font-medium">Pago 100% Seguro</div>
                <div>Tus datos están protegidos con encriptación SSL</div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevStep} className="px-6 py-2 bg-transparent">
              Anterior
            </Button>
          )}

          <div className="ml-auto">
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-babalu-primary hover:bg-babalu-dark text-white px-6 py-2"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-babalu-primary hover:bg-babalu-dark text-white px-8 py-3 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando Pago...
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
      </form>
    </div>
  )
}