// compra/CompraWizard.tsx
"use client"

import { useState, useEffect } from "react"
import { PersonalInfoStep } from "./steps/PersonalInfoStep"
import { ShippingStep } from "./steps/ShippingStep"
import { PaymentStep } from "./steps/PaymentStep"
import { useCart } from "../../contexts/cart-context"
import { useSession } from "next-auth/react"
import { CheckCircle, Loader2 } from "lucide-react"
import { ResumenCompra } from "../resumen-compra"

// Tipo genérico para errores
export interface FormErrors {
  [key: string]: string
}

// Tipo para setErrors que acepte tanto objetos como funciones
export type SetErrorsFunction = (errors: FormErrors | ((prev: FormErrors) => FormErrors)) => void

export interface PaymentData {
  // Información personal (desde la sesión)
  nombre: string
  apellido: string
  email: string
  phone: string

  // Dirección de envío (desde la base de datos)
  calle: string
  ciudad: string
  provincia: string
  codigoPostal: string
  pais: string

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

  // Datos de envío calculados
  shippingOption?: {
    carrier: string
    service: string
    price: number
    deliveryDays: number
    estimatedDate: string
  }
}

interface StepProps {
  formData: PaymentData
  updateFormData: (data: Partial<PaymentData>) => void
  errors: FormErrors
  setErrors: SetErrorsFunction
  cartItems: any[]
  subtotal: number
  isLoading: boolean
}

export function CompraWizard() {
  const { data: session, status } = useSession()
  const { clearCart, state, getTotalPrice, getTotalItems } = useCart()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PaymentData>({
    nombre: "",
    apellido: "",
    email: "",
    phone: "",
    calle: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    pais: "Argentina",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    shippingMethod: "standard",
    paymentMethod: "credit-card",
    saveInfo: false,
    terms: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [loadingUserData, setLoadingUserData] = useState(true)

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user) {
        try {
          // Cargar datos básicos de la sesión
          const userData = {
            nombre: session.user.nombre || "",
            apellido: session.user.apellido || "",
            email: session.user.email || "",
            phone: "",
          }

          // Cargar dirección desde la API
          const addressResponse = await fetch("/api/user/address", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          })

          let addressData = {
            calle: "",
            ciudad: "",
            provincia: "",
            codigoPostal: "",
            pais: "Argentina",
          }

          if (addressResponse.ok) {
            const addressResult = await addressResponse.json()
            if (addressResult.success && addressResult.address) {
              addressData = {
                calle: addressResult.address.calle || "",
                ciudad: addressResult.address.ciudad || "",
                provincia: addressResult.address.provincia || "",
                codigoPostal: addressResult.address.codigoPostal || "",
                pais: addressResult.address.pais || "Argentina",
              }
            }
          }

          setFormData(prev => ({
            ...prev,
            ...userData,
            ...addressData,
          }))

        } catch (error) {
          console.error("Error cargando datos del usuario:", error)
        } finally {
          setLoadingUserData(false)
        }
      } else {
        setLoadingUserData(false)
      }
    }

    loadUserData()
  }, [session])

  const updateFormData = (newData: Partial<PaymentData>) => {
    setFormData(prev => ({ ...prev, ...newData }))
  }

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (finalData: PaymentData) => {
    setIsLoading(true)

    try {
      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      console.log("Procesando pago:", finalData)
      setOrderSuccess(true)
      clearCart()

      setTimeout(() => {
        window.location.href = "/"
      }, 3000)
    } catch (error) {
      setErrors({ general: "Error al procesar el pago. Intenta nuevamente." })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading mientras se cargan los datos del usuario
  if (loadingUserData || status === "loading") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-babalu-primary" />
            <span className="ml-2 text-gray-600">Cargando información...</span>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ResumenCompra items={state.items} totalPrice={getTotalPrice()} />
        </div>
      </div>
    )
  }

  // Si no hay sesión
  if (!session) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No autenticado
            </h3>
            <p className="text-gray-600">
              Debes iniciar sesión para realizar una compra.
            </p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ResumenCompra items={state.items} totalPrice={getTotalPrice()} />
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8 text-center">
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
        <div className="lg:col-span-1">
          <ResumenCompra 
            items={state.items} 
            totalPrice={getTotalPrice()} 
            shippingOption={formData.shippingOption}
          />
        </div>
      </div>
    )
  }

  // Renderizar step actual
  const renderStep = () => {
    const stepProps: StepProps = {
      formData,
      updateFormData,
      errors,
      setErrors,
      cartItems: state.items,
      subtotal: getTotalPrice(),
      isLoading
    }

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} onNext={handleNextStep} />
      case 2:
        return (
          <ShippingStep 
            {...stepProps} 
            onNext={handleNextStep} 
            onBack={handlePrevStep} 
          />
        )
      case 3:
        return (
          <PaymentStep 
            {...stepProps} 
            onSubmit={handleSubmit} 
            onBack={handlePrevStep} 
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna principal con el wizard */}
      <div className="lg:col-span-2">
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
                    {step === 1 && "Información"}
                    {step === 2 && "Envío"}
                    {step === 3 && "Pago"}
                  </span>
                  {step < 3 && (
                    <div className={`w-12 h-0.5 mx-4 ${currentStep > step ? "bg-babalu-primary" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {renderStep()}
          </div>
        </div>
      </div>

      {/* Columna del resumen */}
      <div className="lg:col-span-1">
        <ResumenCompra 
          items={state.items} 
          totalPrice={getTotalPrice()} 
          shippingOption={formData.shippingOption}
        />
      </div>
    </div>
  )
}