"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import ImageUploader from "./imageUploader"
import { Package, DollarSign, ImageIcon, Tag, FileText, Save, Loader2, ArrowLeft, Plus, X } from "lucide-react"

interface UploadedImage {
  publicId: string
  url: string
}

interface ProductFormData {
  name: string
  price: string
  category: string
  marca: string
  description: string
  images: UploadedImage[]
}

interface FormErrors {
  name?: string
  price?: string
  category?: string
  marca?: string
  description?: string
  images?: string
  general?: string
}

interface CategoryOption {
  value: string
  label: string
}

interface MarcaOption {
  value: string
  label: string
}

// Función para calcular stock automáticamente
const calculateAutoStock = (category: string, marca: string, productName: string): number => {
  // Convertir a lowercase para comparaciones más flexibles
  const cat = category.toLowerCase()
  const brand = marca.toLowerCase()
  const name = productName.toLowerCase()

  // Lógica específica para sahumerios
  if (cat.includes('sahumerio') || name.includes('sahumerio')) {
    // Para sahumerios, el stock base depende de la marca
    let baseStock = 10 // stock por defecto
    
    // Marcas premium tienen menos stock inicial
    if (brand.includes('premium') || brand.includes('artesanal')) {
      baseStock = 5
    } else if (brand.includes('natural') || brand.includes('organico')) {
      baseStock = 8
    } else if (brand.includes('economico') || brand.includes('basico')) {
      baseStock = 15
    }

    // Ajustar por aroma específico (algunos aromas son más populares)
    if (name.includes('lavanda') || name.includes('rosa') || name.includes('jasmin')) {
      baseStock += 3 // aromas populares
    } else if (name.includes('pachuli') || name.includes('copal') || name.includes('mirra')) {
      baseStock += 1 // aromas especializados
    }

    return baseStock
  }

  // Lógica para velas
  if (cat.includes('vela') || name.includes('vela')) {
    let baseStock = 8
    
    if (brand.includes('artesanal') || brand.includes('premium')) {
      baseStock = 4
    } else if (brand.includes('industrial') || brand.includes('masivo')) {
      baseStock = 12
    }

    return baseStock
  }

  // Lógica para aceites esenciales
  if (cat.includes('aceite') || name.includes('aceite')) {
    let baseStock = 6
    
    if (brand.includes('pure') || brand.includes('organico')) {
      baseStock = 3
    } else if (brand.includes('sintetico')) {
      baseStock = 10
    }

    return baseStock
  }

  // Lógica para cristales/piedras
  if (cat.includes('cristal') || cat.includes('piedra') || name.includes('cristal') || name.includes('cuarzo')) {
    let baseStock = 5
    
    if (name.includes('amatista') || name.includes('cuarzo rosa')) {
      baseStock = 7 // cristales populares
    } else if (name.includes('obsidiana') || name.includes('turmalina')) {
      baseStock = 3 // cristales menos comunes
    }

    return baseStock
  }

  // Stock por defecto para otras categorías
  return 8
}

export function AgregarProductoForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    category: "",
    marca: "",
    description: "",
    images: [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple' | null>(null)

  // Estados para categorías y marcas
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [marcas, setMarcas] = useState<MarcaOption[]>([])
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [showNewMarcaInput, setShowNewMarcaInput] = useState(false)
  const [newCategoryValue, setNewCategoryValue] = useState("")
  const [newMarcaValue, setNewMarcaValue] = useState("")
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  // Estado para mostrar el stock calculado
  const [calculatedStock, setCalculatedStock] = useState<number>(0)

  // Cargar categorías y marcas existentes al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingOptions(true)
        
        // Obtener categorías únicas
        const categoriesResponse = await fetch('/api/agregarProd?getCategories=true')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          if (categoriesData.success) {
            setCategories(categoriesData.data.map((cat: string) => ({ value: cat, label: cat })))
          }
        }
      } catch (error) {
        console.error('Error cargando categorías:', error)
      } finally {
        setIsLoadingOptions(false)
      }
    }

    loadCategories()
  }, [])

  // Cargar marcas cuando cambie la categoría
  useEffect(() => {
    const loadMarcas = async () => {
      if (!formData.category) {
        setMarcas([])
        return
      }

      try {
        // Obtener marcas únicas para la categoría seleccionada
        const marcasResponse = await fetch(`/api/agregarProd?getMarcas=true&category=${encodeURIComponent(formData.category)}`)
        if (marcasResponse.ok) {
          const marcasData = await marcasResponse.json()
          if (marcasData.success) {
            setMarcas(marcasData.data.map((marca: string) => ({ value: marca, label: marca })))
            // Si la marca actual no está en la nueva lista, resetearla
            if (formData.marca && !marcasData.data.includes(formData.marca)) {
              setFormData(prev => ({ ...prev, marca: "" }))
            }
          }
        }
      } catch (error) {
        console.error('Error cargando marcas:', error)
        setMarcas([])
      }
    }

    loadMarcas()
  }, [formData.category])

  // Efecto para recalcular stock cuando cambien los campos relevantes
  useEffect(() => {
    if (formData.category && formData.marca && formData.name) {
      const newStock = calculateAutoStock(formData.category, formData.marca, formData.name)
      setCalculatedStock(newStock)
    } else {
      setCalculatedStock(0)
    }
  }, [formData.category, formData.marca, formData.name])

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

  const handleCategoryChange = (value: string) => {
    if (value === "add-new") {
      setShowNewCategoryInput(true)
      setFormData(prev => ({ ...prev, category: "", marca: "" }))
      setMarcas([]) // Limpiar marcas cuando se va a agregar nueva categoría
    } else {
      setFormData(prev => ({ ...prev, category: value, marca: "" })) // Limpiar marca cuando cambia categoría
      setShowNewCategoryInput(false)
      if (errors.category) {
        setErrors(prev => ({ ...prev, category: undefined }))
      }
      if (errors.marca) {
        setErrors(prev => ({ ...prev, marca: undefined }))
      }
    }
  }

  const handleMarcaChange = (value: string) => {
    if (value === "add-new") {
      setShowNewMarcaInput(true)
      setFormData(prev => ({ ...prev, marca: "" }))
    } else {
      setFormData(prev => ({ ...prev, marca: value }))
      setShowNewMarcaInput(false)
      if (errors.marca) {
        setErrors(prev => ({ ...prev, marca: undefined }))
      }
    }
  }

  const handleAddNewCategory = async () => {
    if (newCategoryValue.trim()) {
      // Solo agregamos localmente, ya que las categorías se crean automáticamente cuando se crea un producto
      const newCategory = { value: newCategoryValue.trim(), label: newCategoryValue.trim() }
      setCategories(prev => [...prev, newCategory])
      setFormData(prev => ({ ...prev, category: newCategoryValue.trim() }))
      setNewCategoryValue("")
      setShowNewCategoryInput(false)
      if (errors.category) {
        setErrors(prev => ({ ...prev, category: undefined }))
      }
      console.log(`✅ Nueva categoría añadida localmente: "${newCategoryValue.trim()}"`)
    }
  }

  const handleAddNewMarca = async () => {
    if (newMarcaValue.trim() && formData.category) {
      try {
        // Guardar la marca en la base de datos
        const response = await fetch(`/api/agregarProd?saveMarca=true&category=${encodeURIComponent(formData.category)}&marca=${encodeURIComponent(newMarcaValue.trim())}`)
        
        if (response.ok) {
          const newMarca = { value: newMarcaValue.trim(), label: newMarcaValue.trim() }
          setMarcas(prev => [...prev, newMarca])
          setFormData(prev => ({ ...prev, marca: newMarcaValue.trim() }))
          setNewMarcaValue("")
          setShowNewMarcaInput(false)
          if (errors.marca) {
            setErrors(prev => ({ ...prev, marca: undefined }))
          }
          console.log(`✅ Marca "${newMarcaValue.trim()}" guardada en categoría "${formData.category}"`)
        } else {
          console.error('Error al guardar la marca')
          // Aún así agregamos la marca localmente para no interrumpir el flujo
          const newMarca = { value: newMarcaValue.trim(), label: newMarcaValue.trim() }
          setMarcas(prev => [...prev, newMarca])
          setFormData(prev => ({ ...prev, marca: newMarcaValue.trim() }))
          setNewMarcaValue("")
          setShowNewMarcaInput(false)
        }
      } catch (error) {
        console.error('Error al guardar marca:', error)
        // En caso de error, aún así agregamos localmente
        const newMarca = { value: newMarcaValue.trim(), label: newMarcaValue.trim() }
        setMarcas(prev => [...prev, newMarca])
        setFormData(prev => ({ ...prev, marca: newMarcaValue.trim() }))
        setNewMarcaValue("")
        setShowNewMarcaInput(false)
      }
    }
  }

  const handleCancelNewCategory = () => {
    setShowNewCategoryInput(false)
    setNewCategoryValue("")
  }

  const handleCancelNewMarca = () => {
    setShowNewMarcaInput(false)
    setNewMarcaValue("")
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
      newErrors.category = "Selecciona o agrega una categoría"
    }

    // Validar marca (requerida para el cálculo de stock)
    if (!formData.marca) {
      newErrors.marca = "La marca es requerida para calcular el stock automáticamente"
    } else if (formData.marca.trim().length < 2) {
      newErrors.marca = "La marca debe tener al menos 2 caracteres"
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
      const finalStock = calculateAutoStock(formData.category, formData.marca, formData.name)

      console.log('Enviando datos:', {
        nombre: formData.name,
        precio: formData.price,
        descripcion: formData.description,
        imgUrl: formData.images[0]?.url || '',
        imgPublicId: formData.images[0]?.publicId || '',
        category: formData.category,
        marca: formData.marca,
        stock: finalStock,
        shipping: 'Envío Gratis', // Valor por defecto
        allImages: formData.images
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
          marca: formData.marca,
          stock: finalStock,
          shipping: 'Envío Gratis',
          allImages: formData.images
        }),
      })

      console.log('Response status:', response.status)
      
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
      
      setSuccessMessage(`¡Producto agregado exitosamente! Stock calculado: ${finalStock} unidades`)

      // Limpiar formulario después del éxito
      setTimeout(() => {
        setFormData({
          name: "",
          price: "",
          category: "",
          marca: "",
          description: "",
          images: [],
        })
        setUploadMode(null)
        setSuccessMessage("")
        setCalculatedStock(0)
      }, 3000)

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

            {/* Stock calculado automáticamente - Solo mostrar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Calculado Automáticamente
              </label>
              <div className="px-3 py-3 border border-gray-200 bg-gray-50 rounded-md text-sm text-gray-600">
                {calculatedStock > 0 ? (
                  <span className="text-green-600 font-medium">
                    {calculatedStock} unidades
                  </span>
                ) : (
                  <span className="text-gray-400">
                    Completa categoría, marca y nombre para ver el stock
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                El stock se calcula automáticamente basado en la categoría, marca y nombre del producto
              </p>
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoría
              </label>
              {!showNewCategoryInput ? (
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                    errors.category ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={isLoadingOptions}
                >
                  <option value="">
                    {isLoadingOptions ? "Cargando categorías..." : "Selecciona una categoría"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                  <option value="add-new">➕ Agregar nueva categoría</option>
                </select>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategoryValue}
                    onChange={(e) => setNewCategoryValue(e.target.value)}
                    placeholder="Nueva categoría"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNewCategory()}
                  />
                  <Button
                    type="button"
                    onClick={handleAddNewCategory}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelNewCategory}
                    size="sm"
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Marca */}
            <div>
              <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-2">
                Marca <span className="text-red-500">*</span>
              </label>
              {!showNewMarcaInput ? (
                <select
                  id="marca"
                  name="marca"
                  value={formData.marca}
                  onChange={(e) => handleMarcaChange(e.target.value)}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary bg-white ${
                    errors.marca ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={!formData.category || isLoadingOptions}
                >
                  <option value="">
                    {!formData.category 
                      ? "Primero selecciona una categoría" 
                      : marcas.length === 0 
                        ? "No hay marcas para esta categoría"
                        : "Seleccionar marca"
                    }
                  </option>
                  {marcas.map((marca) => (
                    <option key={marca.value} value={marca.value}>
                      {marca.label}
                    </option>
                  ))}
                  <option value="add-new">➕ Agregar nueva marca</option>
                </select>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMarcaValue}
                    onChange={(e) => setNewMarcaValue(e.target.value)}
                    placeholder="Nueva marca"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNewMarca()}
                  />
                  <Button
                    type="button"
                    onClick={handleAddNewMarca}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelNewMarca}
                    size="sm"
                    variant="outline"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {errors.marca && <p className="mt-1 text-sm text-red-600">{errors.marca}</p>}
              {formData.category && marcas.length === 0 && !showNewMarcaInput && (
                <p className="mt-1 text-xs text-blue-600">
                  Esta es una categoría nueva. Agrega la primera marca para esta categoría.
                </p>
              )}
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