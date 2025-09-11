"use client"

import { Edit, Trash2, Package, AlertCircle, Plus, Minus, Tag } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"
import { useState, useEffect } from "react"

interface Producto {
  id: number
  name: string
  price: string
  category: string
  marca: string
  image: string
  description: string
  shipping: string
  stock: number
  status: string
}

export function StockProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingStock, setEditingStock] = useState<{ [key: number]: number }>({})
  const [filtroMarca, setFiltroMarca] = useState<string>('all')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all')

  // Función para calcular el status basado en el stock
  const calculateStatus = (stock: number): string => {
    if (stock === 0) return "agotado"
    if (stock <= 5) return "bajo-stock"
    return "disponible"
  }

  // Función para obtener productos de la API
  const fetchProductos = async () => {
    try {
      setLoading(true)
      
      // Construir URL con filtros
      const params = new URLSearchParams()
      if (filtroMarca && filtroMarca !== 'all') {
        params.append('marca', filtroMarca)
      }
      if (filtroCategoria && filtroCategoria !== 'all') {
        params.append('category', filtroCategoria)
      }
      
      const url = `/api/agregarProd${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        // Los productos ya vienen con el status calculado desde la API
        setProductos(data.data)
      } else {
        setError('Error al cargar productos: ' + data.error)
      }
    } catch (error) {
      console.error('Error al obtener productos:', error)
      setError('Error de conexión al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  // Cargar productos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    fetchProductos()
  }, [filtroMarca, filtroCategoria])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 text-green-800"
      case "bajo-stock":
        return "bg-yellow-100 text-yellow-800"
      case "agotado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "disponible":
        return "Disponible"
      case "bajo-stock":
        return "Bajo Stock"
      case "agotado":
        return "Agotado"
      default:
        return "Desconocido"
    }
  }

  // Calcular estadísticas reales
  const stats = productos.reduce((acc, producto) => {
    if (producto.status === "disponible") acc.disponibles++
    else if (producto.status === "bajo-stock") acc.bajoStock++
    else if (producto.status === "agotado") acc.agotados++
    
    return acc
  }, { disponibles: 0, bajoStock: 0, agotados: 0 })

  // Obtener marcas únicas para el filtro
  const marcasUnicas = Array.from(new Set(productos.map(p => p.marca).filter(marca => marca && marca.trim() !== '')))
  
  // Obtener categorías únicas para el filtro
  const categoriasUnicas = Array.from(new Set(productos.map(p => p.category).filter(cat => cat && cat.trim() !== '')))

  // Función para actualizar stock
  const updateStock = async (id: number, newStock: number) => {
    if (newStock < 0) {
      alert('El stock no puede ser negativo')
      return
    }

    try {
      const response = await fetch('/api/agregarProd', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          stock: newStock
        })
      })

      const data = await response.json()

      if (data.success) {
        // Actualizar el producto en el estado local con el nuevo status
        setProductos(prev => prev.map(producto => {
          if (producto.id === id) {
            const newStatus = calculateStatus(newStock)
            return {
              ...producto,
              stock: newStock,
              status: newStatus
            }
          }
          return producto
        }))
        
        // Limpiar el estado de edición
        setEditingStock(prev => {
          const newState = { ...prev }
          delete newState[id]
          return newState
        })

        console.log(`✅ Stock actualizado: ${newStock}, Status: ${calculateStatus(newStock)}`)
      } else {
        alert('Error al actualizar stock: ' + data.error)
      }
    } catch (error) {
      console.error('Error al actualizar stock:', error)
      alert('Error de conexión al actualizar stock')
    }
  }

  // Función para incrementar/decrementar stock
  const adjustStock = async (id: number, operation: 'increment' | 'decrement', amount: number = 1) => {
    const producto = productos.find(p => p.id === id)
    if (!producto) return

    // Calcular el nuevo stock antes de enviarlo
    let newStock: number
    if (operation === 'increment') {
      newStock = producto.stock + amount
    } else {
      newStock = Math.max(0, producto.stock - amount)
    }

    try {
      const response = await fetch('/api/agregarProd', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          stock: amount,
          operation
        })
      })

      const data = await response.json()

      if (data.success) {
        // Actualizar directamente con el stock calculado
        setProductos(prev => prev.map(producto => {
          if (producto.id === id) {
            const newStatus = calculateStatus(newStock)
            return {
              ...producto,
              stock: newStock,
              status: newStatus
            }
          }
          return producto
        }))
        
        console.log(`✅ Stock ${operation}: ${newStock}, Status: ${calculateStatus(newStock)}`)
      } else {
        alert('Error al actualizar stock: ' + data.error)
      }
    } catch (error) {
      console.error('Error al ajustar stock:', error)
      alert('Error de conexión al ajustar stock')
    }
  }

  // Función para manejar cambio en input de stock
  const handleStockChange = (productId: number, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0) // Asegurar que no sea negativo
    setEditingStock(prev => ({
      ...prev,
      [productId]: numValue
    }))
  }

  // Función para cancelar edición
  const cancelEdit = (productId: number) => {
    setEditingStock(prev => {
      const newState = { ...prev }
      delete newState[productId]
      return newState
    })
  }

  // Función para eliminar producto
  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return
    }

    try {
      const response = await fetch(`/api/agregarProd?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchProductos()
      } else {
        alert('Error al eliminar producto: ' + data.error)
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      alert('Error de conexión al eliminar producto')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchProductos} variant="outline">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-babalu-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-babalu-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Stock de Productos</h2>
              <p className="text-sm text-gray-600">Gestiona el inventario de tu tienda</p>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.disponibles}</div>
              <div className="text-gray-500">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.bajoStock}</div>
              <div className="text-gray-500">Bajo Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.agotados}</div>
              <div className="text-gray-500">Agotados</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Marca:</label>
            <select 
              value={filtroMarca} 
              onChange={(e) => setFiltroMarca(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary"
            >
              <option value="all">Todas las marcas</option>
              {marcasUnicas.map(marca => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Categoría:</label>
            <select 
              value={filtroCategoria} 
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-babalu-primary"
            >
              <option value="all">Todas las categorías</option>
              {categoriasUnicas.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto">
        {productos.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">Agrega algunos productos para comenzar a gestionar tu inventario.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                  {/* Producto */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={producto.image || "/placeholder.svg"}
                          alt={producto.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{producto.name}</div>
                        <div className="text-sm text-gray-500">ID: #{producto.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Marca */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {producto.marca ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {producto.marca}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Sin marca</span>
                    )}
                  </td>

                  {/* Categoría */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-babalu-primary/10 text-babalu-primary">
                      {producto.category}
                    </span>
                  </td>

                  {/* Precio */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{producto.price}</div>
                  </td>

                  {/* Stock con controles */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {editingStock[producto.id] !== undefined ? (
                        // Modo edición
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={editingStock[producto.id]}
                            onChange={(e) => handleStockChange(producto.id, e.target.value)}
                            className="w-20 h-8 text-sm px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStock(producto.id, editingStock[producto.id])}
                            className="h-8 px-2"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelEdit(producto.id)}
                            className="h-8 px-2"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        // Modo visualización
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustStock(producto.id, 'decrement')}
                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                            disabled={producto.stock === 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <span 
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 min-w-[2rem] text-center"
                            onClick={() => setEditingStock(prev => ({
                              ...prev,
                              [producto.id]: producto.stock
                            }))}
                            title="Click para editar"
                          >
                            {producto.stock}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustStock(producto.id, 'increment')}
                            className="h-6 w-6 p-0 text-green-600 hover:bg-green-50"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          
                          {producto.stock <= 5 && producto.stock > 0 && (
                            <span title="Bajo stock">
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                            </span>
                          )}
                          {producto.stock === 0 && (
                            <span title="Agotado">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(producto.status)}`}
                    >
                      {getStatusText(producto.status)}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 bg-transparent"
                        onClick={() => {
                          console.log('Editar producto:', producto.id)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 bg-transparent"
                        onClick={() => handleEliminar(producto.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer con información adicional */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Mostrando {productos.length} productos
            {filtroMarca !== 'all' && (
              <span className="ml-2 text-purple-600 font-medium">• Marca: {filtroMarca}</span>
            )}
            {filtroCategoria !== 'all' && (
              <span className="ml-2 text-babalu-primary font-medium">• Categoría: {filtroCategoria}</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Disponible (Stock &gt; 5)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Bajo Stock (1-5)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Agotado (0)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}