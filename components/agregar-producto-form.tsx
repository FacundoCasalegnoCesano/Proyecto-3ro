"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Package, DollarSign, ImageIcon, Tag, FileText, Save, Loader2, ArrowLeft, Upload } from "lucide-react"

interface ProductFormData {
  name: string
  price: string
  category: string
  description: string
  image: string
  shipping: string
}

interface FormErrors {
  name?: string
  price?: string
  category?: string
  description?: string
  image?: string
  general?: string
}

export function AgregarProductoForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    shipping: "Envío Gratis",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")

  const categories = [
    "Sahumerios",
    "Aromatizante de ambiente",
    "Aromatizante para auto",
    "Inciensos",
    "Bombas de Humo",
    "Velas",
    "Lamparas de Sal",
    "Estatuas",
    "Porta Sahumerios",
    "Esencias",
    "Palo santos",
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    // Limpiar mensaje de éxito
    if (successMessage) {
      setSuccessMessage("")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre del producto es requerido"
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres"
    }

    // Validar precio
    if (!formData.price.trim()) {
      newErrors.price = "El precio es requerido"
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = "Ingresa un precio válido (ej: 25.99)"
    }

    // Validar categoría
    if (!formData.category) {
      newErrors.category = "Selecciona una categoría"
    }

    // Validar descripción
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "La descripción debe tener al menos 10 caracteres"
    }

    // Validar imagen
    if (!formData.image.trim()) {
      newErrors.image = "La URL de la imagen es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Simular guardado del producto
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Crear el nuevo producto
      const newProduct = {
        id: Date.now(), // ID temporal
        name: formData.name,
        price: `$${formData.price}`,
        category: formData.category,
        description: formData.description,
        image: formData.image,
        shipping: formData.shipping,
        src: formData.image,
      }

      console.log("Nuevo producto creado:", newProduct)
      setSuccessMessage("¡Producto agregado exitosamente!")

      // Limpiar formulario después del éxito
      setTimeout(() => {
        setFormData({
          name: "",
          price: "",
          category: "",
          description: "",
          image: "",
          shipping: "Envío Gratis",
        })
        setSuccessMessage("")
      }, 2000)
    } catch (error) {
      setErrors({
        general: "Error al agregar el producto. Intenta nuevamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    window.location.href = "/productos"
  }

  return (
    <div className="bg-white shadow-lg rounded-lg">
      {/* Header con botón de volver */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Productos</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-8">
        {/* Mensajes de estado */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        {/* Información Básica */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-babalu-primary" />
            Información del Producto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del producto */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Ej: Sahumerio de Lavanda Premium"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Precio */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Precio (ARS)
              </label>
              <input
                id="price"
                name="price"
                type="text"
                value={formData.price}
                onChange={handleInputChange}
                className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                  errors.price ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="2500"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoría
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                  errors.category ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Envío */}
            <div className="md:col-span-2">
              <label htmlFor="shipping" className="block text-sm font-medium text-gray-700 mb-2">
                Información de Envío
              </label>
              <select
                id="shipping"
                name="shipping"
                value={formData.shipping}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white"
              >
                <option value="Envío Gratis">Envío Gratis</option>
                <option value="Envío Pago">Envío Pago</option>
                <option value="Retiro en Local">Retiro en Local</option>
              </select>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-babalu-primary" />
            Descripción
          </h3>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Producto
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary resize-none ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Describe las características, beneficios y usos del producto..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
        </div>

        {/* Imagen */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-babalu-primary" />
            Imagen del Producto
          </h3>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              URL de la Imagen
            </label>
            <div className="flex space-x-4">
              <input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleInputChange}
                className={`flex-1 px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                  errors.image ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <Button type="button" variant="outline" className="px-4 py-3 flex items-center space-x-2 bg-transparent">
                <Upload className="w-4 h-4" />
                <span>Subir</span>
              </Button>
            </div>
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}

            {/* Vista previa de la imagen */}
            {formData.image && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=128&width=128&text=Error"
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleGoBack} className="px-6 py-3 bg-transparent">
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
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
                Agregar Producto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
