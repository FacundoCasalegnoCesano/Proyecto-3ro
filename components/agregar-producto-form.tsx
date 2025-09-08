"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import ImageUploader from "./imageUploader"
import { Package, DollarSign, ImageIcon, Tag, FileText, Save, Loader2, ArrowLeft } from "lucide-react"

interface UploadedImage {
  publicId: string
  url: string
}

interface ProductFormData {
  name: string
  price: string
  category: string
  description: string
  images: UploadedImage[]
  shipping: string
}

interface FormErrors {
  name?: string
  price?: string
  category?: string
  description?: string
  images?: string
  general?: string
}

export function AgregarProductoForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    category: "",
    description: "",
    images: [],
    shipping: "Envío Gratis",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple' | null>(null)

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

  const handleSingleImageMode = () => {
    setUploadMode('single')
    setFormData(prev => ({ ...prev, images: [] })) // Limpiar imágenes existentes
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }))
    }
  }

  const handleMultipleImageMode = () => {
    setUploadMode('multiple')
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: undefined }))
    }
  }

  const handleImageUpload = (result: { publicId: string; url: string }) => {
    if (!result.url) return // Si se elimina la imagen

    const newImage: UploadedImage = {
      publicId: result.publicId,
      url: result.url
    }

    if (uploadMode === 'single') {
      setFormData(prev => ({
        ...prev,
        images: [newImage] // Reemplazar con una sola imagen
      }))
    } else if (uploadMode === 'multiple') {
      setFormData(prev => {
        // Verificar que no exceda el límite de 5 imágenes
        if (prev.images.length >= 5) {
          setErrors(prevErrors => ({
            ...prevErrors,
            images: "Máximo 5 imágenes permitidas"
          }))
          return prev
        }
        
        return {
          ...prev,
          images: [...prev.images, newImage]
        }
      })
    }

    // Limpiar errores si había
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: undefined
      }))
    }
  }

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
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

    // Validar imágenes
    if (formData.images.length === 0) {
      newErrors.images = "Se requiere al menos una imagen del producto"
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
      console.log('Enviando datos:', {
        nombre: formData.name,
        precio: formData.price,
        descripcion: formData.description,
        imgUrl: formData.images[0]?.url || '',
        imgPublicId: formData.images[0]?.publicId || '',
        category: formData.category,
        shipping: formData.shipping,
      })

      const response = await fetch('/api/agregarProd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.name,
          precio: formData.price,
          descripcion: formData.description,
          imgUrl: formData.images[0]?.url || '',
          imgPublicId: formData.images[0]?.publicId || '',
          category: formData.category,
          shipping: formData.shipping,
          allImages: formData.images
        }),
      })

      console.log('Response status:', response.status)
      
      // Intentar leer la respuesta como texto primero para debuggear
      const responseText = await response.text()
      console.log('Response text:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError)
        throw new Error('La respuesta del servidor no es válida. Verifica que la API esté funcionando correctamente.')
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al crear el producto')
      }

      console.log("Producto creado exitosamente:", data.data)
      
      setSuccessMessage("¡Producto agregado exitosamente!")

      // Limpiar formulario después del éxito
      setTimeout(() => {
        setFormData({
          name: "",
          price: "",
          category: "",
          description: "",
          images: [],
          shipping: "Envío Gratis",
        })
        setUploadMode(null)
        setSuccessMessage("")
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      setErrors({
        general: error instanceof Error ? error.message : "Error al agregar el producto. Intenta nuevamente.",
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

        {/* Imágenes del Producto */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-babalu-primary" />
            Imágenes del Producto
          </h3>

          <div className="space-y-4">
            {/* Selección de modo */}
            {!uploadMode && (
              <>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSingleImageMode}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-transparent"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Seleccionar una imagen</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMultipleImageMode}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-transparent"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Seleccionar múltiples imágenes</span>
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  <p>• Máximo 5 imágenes</p>
                  <p>• Formatos soportados: JPG, PNG, GIF, WebP</p>
                </div>
              </>
            )}

            {/* Modo una imagen */}
            {uploadMode === 'single' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Imagen principal del producto
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadMode(null)
                      setFormData(prev => ({ ...prev, images: [] }))
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cambiar modo
                  </Button>
                </div>
                <ImageUploader
                  label="Subir imagen"
                  onUpload={handleImageUpload}
                  maxImages={1}
                />
              </div>
            )}

            {/* Modo múltiples imágenes */}
            {uploadMode === 'multiple' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Galería de imágenes ({formData.images.length}/5)
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadMode(null)
                      setFormData(prev => ({ ...prev, images: [] }))
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cambiar modo
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Imágenes subidas */}
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square border border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* Slot para nueva imagen */}
                  {formData.images.length < 5 && (
                    <ImageUploader
                      label="Agregar imagen"
                      onUpload={handleImageUpload}
                      maxImages={1}
                    />
                  )}
                </div>
              </div>
            )}

            {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
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