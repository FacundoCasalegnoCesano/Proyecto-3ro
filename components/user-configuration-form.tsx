"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { User, Mail, Calendar, MapPin, Save, Loader2, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"

interface AddressData {
  calle: string
  ciudad: string
  provincia: string
  codigoPostal: string
  pais: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  birthDate: string
  address: AddressData
}

interface FormErrors {
  calle?: string
  ciudad?: string
  provincia?: string
  codigoPostal?: string
  pais?: string
  general?: string
}

// Provincias de Argentina para validación y autocompletado
const PROVINCIAS_ARGENTINA = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán"
]

export function UserConfigurationForm() {
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    address: {
      calle: "",
      ciudad: "",
      provincia: "",
      codigoPostal: "",
      pais: "Argentina",
    },
  })

  const [initialAddressData, setInitialAddressData] = useState<AddressData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")

  // Función para validar código postal según el país
  const validatePostalCode = useCallback((code: string, country: string): boolean => {
    if (!code) return true // Es opcional
    
    switch (country) {
      case "Argentina":
        // Argentina: 4 dígitos (CABA) o 4 dígitos + letra (provincias)
        return /^[0-9]{4}[A-Z]{0,3}$/i.test(code.replace(/\s/g, ''))
      case "Chile":
        return /^[0-9]{7}$/.test(code)
      case "Brasil":
        return /^[0-9]{5}-?[0-9]{3}$/.test(code)
      case "Uruguay":
        return /^[0-9]{5}$/.test(code)
      default:
        return /^[0-9]{4,8}$/.test(code)
    }
  }, [])

  // Cargar datos de la sesión y dirección existente
  useEffect(() => {
    if (session?.user) {
      console.log("Session user data:", session.user)
      
      // Cargar datos básicos de la sesión (solo lectura)
      setFormData(prev => ({
        ...prev,
        firstName: session.user.nombre || "",
        lastName: session.user.apellido || "",
        email: session.user.email || "",
        birthDate: session.user.fechaNac 
          ? new Date(session.user.fechaNac).toISOString().split('T')[0] 
          : "",
      }))

      // Cargar dirección existente desde la API
      const loadUserAddress = async () => {
        setIsLoadingAddress(true)
        try {
          console.log("Loading user address from API...")
          console.log("Session ID:", session.user.id)
          
          const response = await fetch('/api/user/address', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          })
          
          console.log("Address API response status:", response.status)
          
          if (response.status === 401) {
            console.log("No autorizado - la sesión puede no estar disponible en el servidor")
            // No mostrar error, simplemente mantener el formulario vacío
            const defaultAddress = {
              calle: "",
              ciudad: "",
              provincia: "",
              codigoPostal: "",
              pais: "Argentina",
            }
            setInitialAddressData(defaultAddress)
            return
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("Error loading address:", errorData)
            
            // Si es un error 404 (usuario no encontrado), no es crítico
            if (response.status === 404) {
              console.log("Usuario no encontrado en BD, usando valores por defecto")
              const defaultAddress = {
                calle: "",
                ciudad: "",
                provincia: "",
                codigoPostal: "",
                pais: "Argentina",
              }
              setInitialAddressData(defaultAddress)
              return
            }
            
            throw new Error(errorData.error || 'Error al cargar la dirección')
          }
          
          const data = await response.json()
          console.log("Address API response data:", data)
          
          if (data.success && data.address) {
            const addressData = {
              calle: data.address.calle || "",
              ciudad: data.address.ciudad || "",
              provincia: data.address.provincia || "",
              codigoPostal: data.address.codigoPostal || "",
              pais: data.address.pais || "Argentina",
            }
            
            setFormData(prev => ({
              ...prev,
              address: addressData
            }))
            setInitialAddressData(addressData)
          } else {
            // Si no hay datos de dirección, usar valores por defecto
            const defaultAddress = {
              calle: "",
              ciudad: "",
              provincia: "",
              codigoPostal: "",
              pais: "Argentina",
            }
            setFormData(prev => ({
              ...prev,
              address: defaultAddress
            }))
            setInitialAddressData(defaultAddress)
          }
        } catch (error) {
          console.error("Error loading user address:", error)
          // Solo mostrar error si es algo crítico, no por falta de datos
          setErrors({ general: "Error al cargar la información de dirección" })
        } finally {
          setIsLoadingAddress(false)
        }
      }

      loadUserAddress()
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1] as keyof AddressData
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))

      // Limpiar errores específicos del campo
      if (errors[addressField]) {
        setErrors((prev) => ({
          ...prev,
          [addressField]: undefined,
        }))
      }
    }

    // Limpiar mensaje de éxito
    if (successMessage) {
      setSuccessMessage("")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validar campos obligatorios si se quiere guardar
    const { calle, ciudad, provincia, codigoPostal, pais } = formData.address
    
    // Si hay algún campo lleno, validar que los campos importantes estén completos
    const hasAnyAddressData = calle || ciudad || provincia || codigoPostal
    
    if (hasAnyAddressData) {
      if (!calle.trim()) {
        newErrors.calle = "La dirección es obligatoria si completas otros datos"
      }
      
      if (!ciudad.trim()) {
        newErrors.ciudad = "La ciudad es obligatoria si completas otros datos"
      }
      
      if (pais === "Argentina" && !provincia.trim()) {
        newErrors.provincia = "La provincia es obligatoria para Argentina"
      }
    }

    // Validar código postal si se proporciona
    if (codigoPostal && !validatePostalCode(codigoPostal, pais)) {
      switch (pais) {
        case "Argentina":
          newErrors.codigoPostal = "Formato: 4 dígitos (ej: 1234 o 1234ABC)"
          break
        case "Chile":
          newErrors.codigoPostal = "Formato: 7 dígitos"
          break
        case "Brasil":
          newErrors.codigoPostal = "Formato: 12345-678"
          break
        case "Uruguay":
          newErrors.codigoPostal = "Formato: 5 dígitos"
          break
        default:
          newErrors.codigoPostal = "Código postal inválido"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Verificar si hay cambios respecto a los datos iniciales
  const hasChanges = (): boolean => {
    if (!initialAddressData) return true
    
    return JSON.stringify(formData.address) !== JSON.stringify(initialAddressData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!hasChanges()) {
      setSuccessMessage("No hay cambios para guardar")
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      console.log("Saving address data:", formData.address)
      
      const response = await fetch('/api/user/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          calle: formData.address.calle.trim(),
          ciudad: formData.address.ciudad.trim(),
          provincia: formData.address.provincia.trim(),
          codigoPostal: formData.address.codigoPostal.trim(),
          pais: formData.address.pais,
        }),
      })

      console.log("Save address response status:", response.status)
      
      const data = await response.json()
      console.log("Save address response data:", data)

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar la dirección')
      }

      // Actualizar los datos iniciales
      setInitialAddressData(formData.address)
      setSuccessMessage("¡Dirección actualizada correctamente!")
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSuccessMessage(""), 5000)
      
    } catch (error) {
      console.error("Error saving address:", error)
      setErrors({
        general: error instanceof Error 
          ? error.message 
          : "Error al actualizar la información. Intenta nuevamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-babalu-primary" />
          <span className="ml-2 text-gray-600">Cargando información...</span>
        </div>
      </div>
    )
  }

  // Si no hay sesión, mostrar mensaje
  if (!session) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No autenticado</h3>
          <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-8 p-8">
        {/* Mensajes de estado */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        {/* Información Personal (solo lectura) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-babalu-primary" />
            Información Personal
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Esta información se obtiene de tu perfil y no puede ser modificada aquí.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre (solo lectura) */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                readOnly
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="Tu nombre"
              />
            </div>

            {/* Apellido (solo lectura) */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                readOnly
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="Tu apellido"
              />
            </div>

            {/* Email (solo lectura) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                readOnly
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="tu@email.com"
              />
            </div>

            {/* Fecha de nacimiento (solo lectura) */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha de Nacimiento
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                readOnly
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Dirección (editable) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-babalu-primary" />
            Dirección de Domicilio
            {isLoadingAddress && (
              <Loader2 className="w-4 h-4 ml-2 animate-spin text-babalu-primary" />
            )}
          </h3>

          <div className="grid grid-cols-1 gap-6">
            {/* Calle */}
            <div>
              <label htmlFor="address.calle" className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                id="address.calle"
                name="address.calle"
                type="text"
                value={formData.address.calle}
                onChange={handleInputChange}
                disabled={isLoadingAddress}
                className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.calle ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Calle y número"
              />
              {errors.calle && <p className="mt-1 text-sm text-red-600">{errors.calle}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ciudad */}
              <div>
                <label htmlFor="address.ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  id="address.ciudad"
                  name="address.ciudad"
                  type="text"
                  value={formData.address.ciudad}
                  onChange={handleInputChange}
                  disabled={isLoadingAddress}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.ciudad ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ciudad"
                />
                {errors.ciudad && <p className="mt-1 text-sm text-red-600">{errors.ciudad}</p>}
              </div>

              {/* Provincia */}
              <div>
                <label htmlFor="address.provincia" className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia {formData.address.pais === "Argentina" && "*"}
                </label>
                {formData.address.pais === "Argentina" ? (
                  <select
                    id="address.provincia"
                    name="address.provincia"
                    value={formData.address.provincia}
                    onChange={handleInputChange}
                    disabled={isLoadingAddress}
                    className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.provincia ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar provincia</option>
                    {PROVINCIAS_ARGENTINA.map(provincia => (
                      <option key={provincia} value={provincia}>{provincia}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="address.provincia"
                    name="address.provincia"
                    type="text"
                    value={formData.address.provincia}
                    onChange={handleInputChange}
                    disabled={isLoadingAddress}
                    className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.provincia ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Provincia/Estado"
                  />
                )}
                {errors.provincia && <p className="mt-1 text-sm text-red-600">{errors.provincia}</p>}
              </div>

              {/* Código Postal */}
              <div>
                <label htmlFor="address.codigoPostal" className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  id="address.codigoPostal"
                  name="address.codigoPostal"
                  type="text"
                  value={formData.address.codigoPostal}
                  onChange={handleInputChange}
                  disabled={isLoadingAddress}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.codigoPostal ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder={
                    formData.address.pais === "Argentina" ? "1234" :
                    formData.address.pais === "Brasil" ? "12345-678" :
                    formData.address.pais === "Chile" ? "1234567" :
                    "12345"
                  }
                />
                {errors.codigoPostal && <p className="mt-1 text-sm text-red-600">{errors.codigoPostal}</p>}
              </div>
            </div>

            {/* País */}
            <div>
              <label htmlFor="address.pais" className="block text-sm font-medium text-gray-700 mb-2">
                País
              </label>
              <select
                id="address.pais"
                name="address.pais"
                value={formData.address.pais}
                onChange={handleInputChange}
                disabled={isLoadingAddress}
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Brasil">Brasil</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Perú">Perú</option>
                <option value="Colombia">Colombia</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Venezuela">Venezuela</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button
            type="submit"
            disabled={isLoading || isLoadingAddress || !hasChanges()}
            className="bg-babalu-primary hover:bg-babalu-dark text-white px-8 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-babalu-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {hasChanges() ? "Guardar Cambios" : "Sin Cambios"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}