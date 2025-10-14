// compra/steps/PersonalInfoStep.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "../../ui/button"
import { User, MapPin, Save, Edit2, Mail, Phone } from "lucide-react"
import { PaymentData, FormErrors } from "../CompraWizard"

// Definir el tipo para setErrors que acepte funciones
type SetErrorsFunction = (errors: FormErrors | ((prev: FormErrors) => FormErrors)) => void

interface PersonalInfoStepProps {
  formData: PaymentData
  updateFormData: (data: Partial<PaymentData>) => void
  errors: FormErrors
  setErrors: SetErrorsFunction
  onNext: () => void
}

export function PersonalInfoStep({ 
  formData, 
  updateFormData, 
  errors, 
  setErrors, 
  onNext 
}: PersonalInfoStepProps) {
  const [hasSavedAddress, setHasSavedAddress] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)

  // Verificar si hay dirección guardada
  useEffect(() => {
    const hasAddress = formData.calle && 
                      formData.ciudad && 
                      formData.provincia && 
                      formData.codigoPostal
    
    setHasSavedAddress(!!hasAddress)
    
    // Mostrar formulario de dirección si no hay datos guardados
    if (!hasAddress) {
      setShowAddressForm(true)
    }
  }, [formData])

  const validateForm = () => {
    const newErrors: FormErrors = {}

    // Validar información personal
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido"
    if (!formData.email.trim()) newErrors.email = "El email es requerido"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido"
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido"

    // Validar dirección solo si se muestra el formulario o no hay datos guardados
    if (showAddressForm || !hasSavedAddress) {
      if (!formData.calle.trim()) newErrors.calle = "La dirección es requerida"
      if (!formData.ciudad.trim()) newErrors.ciudad = "La ciudad es requerida"
      if (!formData.provincia.trim()) newErrors.provincia = "La provincia es requerida"
      if (!formData.codigoPostal.trim()) newErrors.codigoPostal = "El código postal es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      // Si el usuario quiere guardar la información
      if (formData.saveInfo) {
        saveUserAddress()
      }
      onNext()
    }
  }

  const saveUserAddress = async () => {
    try {
      const response = await fetch("/api/user/address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          calle: formData.calle.trim(),
          ciudad: formData.ciudad.trim(),
          provincia: formData.provincia.trim(),
          codigoPostal: formData.codigoPostal.trim(),
          pais: formData.pais,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar la dirección")
      }

      console.log("Dirección guardada exitosamente")
    } catch (error) {
      console.error("Error guardando dirección:", error)
    }
  }

  // SOLUCIÓN CORREGIDA - Usando el tipo SetErrorsFunction
  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
    
    // Limpiar error específico si existe
    if (errors[field]) {
      setErrors((prev: FormErrors) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const useSavedAddress = () => {
    setShowAddressForm(false)
  }

  const editAddress = () => {
    setShowAddressForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <User className="w-5 h-5 text-babalu-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
      </div>

      {/* Información Básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
              errors.nombre ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Tu nombre"
          />
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
          <input
            type="text"
            value={formData.apellido}
            onChange={(e) => handleInputChange("apellido", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
              errors.apellido ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Tu apellido"
          />
          {errors.apellido && <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="tu@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Teléfono *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
              errors.phone ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="+54 11 1234-5678"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      </div>

      {/* Dirección de Envío */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-babalu-primary" />
            <h4 className="text-md font-semibold text-gray-900">Dirección de Envío</h4>
          </div>
          
          {hasSavedAddress && !showAddressForm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={editAddress}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Cambiar Dirección
            </Button>
          )}
        </div>

        {/* Dirección Guardada */}
        {hasSavedAddress && !showAddressForm && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                  <Save className="w-4 h-4" />
                  Usando dirección guardada
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>{formData.calle}</p>
                  <p>{formData.ciudad}, {formData.provincia} - {formData.codigoPostal}</p>
                  <p>{formData.pais}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de Dirección */}
        {(showAddressForm || !hasSavedAddress) && (
          <div className="space-y-4 bg-blue-50/30 rounded-lg p-4 border border-blue-100">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                <input
                  type="text"
                  value={formData.calle}
                  onChange={(e) => handleInputChange("calle", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                    errors.calle ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Calle y número"
                />
                {errors.calle && <p className="mt-1 text-sm text-red-600">{errors.calle}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => handleInputChange("ciudad", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                      errors.ciudad ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Ciudad"
                  />
                  {errors.ciudad && <p className="mt-1 text-sm text-red-600">{errors.ciudad}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provincia *</label>
                  <input
                    type="text"
                    value={formData.provincia}
                    onChange={(e) => handleInputChange("provincia", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                      errors.provincia ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Provincia"
                  />
                  {errors.provincia && <p className="mt-1 text-sm text-red-600">{errors.provincia}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal *</label>
                  <input
                    type="text"
                    value={formData.codigoPostal}
                    onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary ${
                      errors.codigoPostal ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="1234"
                    maxLength={8}
                  />
                  {errors.codigoPostal && <p className="mt-1 text-sm text-red-600">{errors.codigoPostal}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                  <select
                    value={formData.pais}
                    onChange={(e) => handleInputChange("pais", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-babalu-primary bg-white"
                  >
                    <option value="Argentina">Argentina</option>
                    <option value="Chile">Chile</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Brasil">Brasil</option>
                  </select>
                </div>
              </div>
            </div>

            {hasSavedAddress && (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={useSavedAddress}
                  className="text-sm"
                >
                  Usar dirección guardada
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="text-sm bg-gray-500 hover:bg-gray-600"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Opción para guardar información */}
      <div className="border-t border-gray-200 pt-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.saveInfo}
            onChange={(e) => updateFormData({ saveInfo: e.target.checked })}
            className="mt-1 text-babalu-primary focus:ring-babalu-primary"
          />
          <span className="ml-2 text-sm text-gray-600">
            Guardar mi información de dirección para futuras compras
          </span>
        </label>
      </div>

      {/* Botón Siguiente */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          className="bg-babalu-primary hover:bg-babalu-dark text-white px-8"
        >
          Continuar a Envío
        </Button>
      </div>
    </div>
  )
}