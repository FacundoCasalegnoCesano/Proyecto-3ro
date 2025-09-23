"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "../components/product-card"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Product } from "app/types/product"

interface ProductsGridPageProps {
  selectedCategory: string | null
  searchQuery: string
  sortBy: string
}

export function ProductsGridPage({ selectedCategory, searchQuery, sortBy }: ProductsGridPageProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const productsPerPage = 6

  // Función para capitalizar la primera letra de cada palabra (con validación de tipo)
  const capitalizarPalabras = (texto: string | boolean | undefined | null): string => {
    if (!texto || typeof texto !== 'string') return '';
    return texto
      .toLowerCase()
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  // Función para verificar si tiene línea específica (no vacía y no "sin-linea")
  const tieneLineaEspecifica = (linea: string | boolean | undefined | null): boolean => {
    return !!linea && 
           typeof linea === 'string' && 
           linea.trim() !== '' && 
           linea.trim().toLowerCase() !== 'sin-linea' &&
           linea.trim().toLowerCase() !== 'sin línea' &&
           linea.trim().toLowerCase() !== 'sin_linea';
  }

  // Función para formatear la línea (solo si tiene línea específica)
  const formatearLinea = (linea: string | boolean | undefined | null): string => {
    if (!tieneLineaEspecifica(linea)) return '';
    return capitalizarPalabras(linea);
  }

  // Función para verificar si un producto puede ser agrupado (tiene al menos 2 características)
  const puedeSerAgrupado = (product: Product): boolean => {
    const caracteristicas = [
      product.marca && typeof product.marca === 'string' && product.marca.trim() !== '',
      product.category && typeof product.category === 'string' && product.category.trim() !== '',
      tieneLineaEspecifica(product.linea), // Usar la función mejorada
      product.aroma && typeof product.aroma === 'string' && product.aroma.trim() !== ''
    ];
    
    const cantidadCaracteristicas = caracteristicas.filter(Boolean).length;
    return cantidadCaracteristicas >= 2;
  }

  // Función para obtener la clave de agrupación basada en las características disponibles
  const obtenerClaveAgrupacion = (product: Product): string => {
    const partes: string[] = [];
    
    // Siempre incluir categoría si está disponible (con validación de tipo)
    if (product.category && typeof product.category === 'string' && product.category.trim() !== '') {
      partes.push(product.category.toLowerCase());
    } else {
      partes.push('sin-categoria');
    }
    
    // Incluir marca si está disponible (con validación de tipo)
    if (product.marca && typeof product.marca === 'string' && product.marca.trim() !== '') {
      partes.push(product.marca.toLowerCase());
    } else {
      partes.push('sin-marca');
    }
    
    // Incluir línea solo si tiene línea específica (usando función mejorada)
    if (tieneLineaEspecifica(product.linea)) {
      partes.push((product.linea as string).toLowerCase());
    } else {
      partes.push('sin-linea-especifica');
    }
    
    return partes.join('-');
  }

  // Función para agrupar productos por características comunes
  const groupProductsByCharacteristics = (products: Product[]) => {
    const grouped: { [key: string]: Product[] } = {}
    const nonGrouped: Product[] = []

    products.forEach(product => {
      if (puedeSerAgrupado(product)) {
        const key = obtenerClaveAgrupacion(product)
        
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key].push(product)
      } else {
        nonGrouped.push(product)
      }
    })

    // Para cada grupo, seleccionar un producto representativo
    const representativeProducts: Product[] = []
    
    Object.entries(grouped).forEach(([key, groupedProducts]) => {
      if (groupedProducts.length > 0) {
        // Extraer información del grupo de la clave
        const [category, marca, linea] = key.split('-')
        
        // Ordenar por stock descendente y tomar el primero (el que tiene más stock)
        const sortedByStock = groupedProducts.sort((a, b) => b.stock - a.stock)
        const representative = sortedByStock[0]
        
        // Capitalizar marca y categoría
        const marcaCapitalizada = capitalizarPalabras(marca === 'sin-marca' ? '' : marca);
        const categoriaCapitalizada = capitalizarPalabras(category === 'sin-categoria' ? '' : category);
        
        // Formatear línea solo si tiene línea específica
        const tieneLinea = linea !== 'sin-linea-especifica';
        const lineaFormateada = tieneLinea ? formatearLinea(linea) : '';
        
        // Contar aromas únicos si el grupo tiene productos con aromas
        const aromasUnicos = new Set<string>();
        groupedProducts.forEach(p => {
          if (p.aroma && typeof p.aroma === 'string' && p.aroma.trim() !== '') {
            aromasUnicos.add(p.aroma.trim());
          }
        });
        
        const cantidadAromas = aromasUnicos.size;
        
        // Crear nombre y descripción según las características disponibles
        let nombreGrupo = '';
        let descripcionGrupo = '';
        
        // LÓGICA MEJORADA: Solo mostrar categoría y marca si no hay línea
        if (categoriaCapitalizada && marcaCapitalizada) {
          if (tieneLinea && lineaFormateada) {
            // Con categoría, marca y línea
            if (cantidadAromas > 0) {
              nombreGrupo = `${categoriaCapitalizada} ${marcaCapitalizada} - ${lineaFormateada} (${cantidadAromas} aromas)`;
              descripcionGrupo = `${categoriaCapitalizada} • ${marcaCapitalizada} • ${lineaFormateada} • ${cantidadAromas} aroma${cantidadAromas > 1 ? 's' : ''} disponible${cantidadAromas > 1 ? 's' : ''}`;
            } else {
              nombreGrupo = `${categoriaCapitalizada} ${marcaCapitalizada} - ${lineaFormateada} (${groupedProducts.length} variantes)`;
              descripcionGrupo = `${categoriaCapitalizada} • ${marcaCapitalizada} • ${lineaFormateada} • ${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
            }
          } else {
            // SOLO categoría y marca (SIN LÍNEA) - ESTO ES LO QUE QUERÍAS
            if (cantidadAromas > 0) {
              nombreGrupo = `${categoriaCapitalizada} ${marcaCapitalizada} (${cantidadAromas} aromas)`;
              descripcionGrupo = `${categoriaCapitalizada} • ${marcaCapitalizada} • ${cantidadAromas} aroma${cantidadAromas > 1 ? 's' : ''} disponible${cantidadAromas > 1 ? 's' : ''}`;
            } else {
              nombreGrupo = `${categoriaCapitalizada} ${marcaCapitalizada} (${groupedProducts.length} variantes)`;
              descripcionGrupo = `${categoriaCapitalizada} • ${marcaCapitalizada} • ${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
            }
          }
        } else if (categoriaCapitalizada) {
          // Si solo tenemos categoría
          if (tieneLinea && lineaFormateada) {
            nombreGrupo = `${categoriaCapitalizada} - ${lineaFormateada} (${groupedProducts.length} variantes)`;
            descripcionGrupo = `${categoriaCapitalizada} • ${lineaFormateada} • ${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
          } else {
            // Solo categoría, sin línea
            nombreGrupo = `${categoriaCapitalizada} (${groupedProducts.length} variantes)`;
            descripcionGrupo = `${categoriaCapitalizada} • ${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
          }
        } else if (marcaCapitalizada) {
          // Si solo tenemos marca
          if (tieneLinea && lineaFormateada) {
            nombreGrupo = `${marcaCapitalizada} - ${lineaFormateada} (${groupedProducts.length} variantes)`;
            descripcionGrupo = `${marcaCapitalizada} • ${lineaFormateada} • ${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
          } else {
            // Solo marca, sin línea
            nombreGrupo = `${marcaCapitalizada} (${groupedProducts.length} variantes)`;
            descripcionGrupo = `${marcaCapitalizada} • ${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
          }
        }
        
        // Crear un producto "representativo" con información adicional
        const enhancedProduct: Product = {
          ...representative,
          name: nombreGrupo,
          description: descripcionGrupo,
          // QUITAR EL PRECIO para productos agrupados
          price: '', // Precio vacío para que no se muestre en la card
          // Limpiar línea si no es específica
          linea: tieneLinea ? lineaFormateada : '', // Vacío si no tiene línea específica
          // Mantener información de agrupación para uso posterior
          metadata: {
            isGrouped: true,
            totalVariantes: groupedProducts.length,
            totalAromas: cantidadAromas,
            marca: marcaCapitalizada,
            linea: tieneLinea ? lineaFormateada : undefined, // undefined si no tiene línea
            category: categoriaCapitalizada,
            // Indicar que es un producto agrupado (sin botón de agregar)
            isLineaGroup: true,
            // Información adicional para el product-detail
            grupoCompleto: groupedProducts,
            caracteristicas: {
              tieneMarca: !!marcaCapitalizada,
              tieneLinea: tieneLinea && !!lineaFormateada,
              tieneAromas: cantidadAromas > 0,
              tieneCategoria: !!categoriaCapitalizada
            }
          }
        }
        
        representativeProducts.push(enhancedProduct)
      }
    })

    // Combinar productos representativos con no agrupados (capitalizando nombres)
    const nonGroupedCapitalizados = nonGrouped.map(product => ({
      ...product,
      name: capitalizarPalabras(product.name),
      marca: product.marca ? capitalizarPalabras(product.marca) : product.marca,
      // Para productos no agrupados, limpiar línea si no es específica
      linea: tieneLineaEspecifica(product.linea) ? formatearLinea(product.linea) : '', // Vacío si no tiene línea específica
      category: product.category ? capitalizarPalabras(product.category) : product.category,
      description: product.description ? capitalizarPalabras(product.description) : product.description
    }))

    return [...representativeProducts, ...nonGroupedCapitalizados]
  }

  // Fetch productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Construir query parameters
        const params = new URLSearchParams()
        
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory)
        }
        
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        
        if (sortBy && sortBy !== 'default') {
          params.append('sort', sortBy)
        }

        const response = await fetch(`/api/agregarProd?${params}`)
        
        // Verificar si la respuesta es HTML (error 404)
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Endpoint de API no encontrado. Verifica la ruta.')
        }

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Error al cargar productos')
        }

        // Capitalizar los datos recibidos de la API antes de agrupar
        const productosCapitalizados = data.data.map((product: Product) => ({
          ...product,
          name: capitalizarPalabras(product.name),
          marca: product.marca ? capitalizarPalabras(product.marca) : product.marca,
          // Para productos individuales, mantener la línea original (se formateará después)
          linea: product.linea,
          category: product.category ? capitalizarPalabras(product.category) : product.category,
          description: product.description ? capitalizarPalabras(product.description) : product.description
        }))

        // Agrupar productos por características antes de establecer los productos
        const groupedProducts = groupProductsByCharacteristics(productosCapitalizados)
        setProducts(groupedProducts)
        
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar productos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, searchQuery, sortBy])

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, sortBy])

  // Paginación
  const totalPages = Math.ceil(products.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const paginatedProducts = products.slice(startIndex, startIndex + productsPerPage)

  // Contar grupos únicos para el mensaje informativo
  const groupedProductsCount = products.filter(product => 
    product.metadata?.isGrouped
  ).length

  // Contar productos agrupados por categoría para el mensaje
  const gruposPorCategoria: { [categoria: string]: number } = {};
  products.forEach(product => {
    if (product.metadata?.isGrouped && product.category && typeof product.category === 'string') {
      const categoria = product.category.toLowerCase();
      gruposPorCategoria[categoria] = (gruposPorCategoria[categoria] || 0) + 1;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-babalu-primary" />
        <span className="ml-2 text-gray-600">Cargando productos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Error al cargar productos</p>
        <p className="text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-babalu-primary text-white rounded-md hover:bg-babalu-dark"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Contador de productos */}
      <div className="mb-4 text-sm text-gray-600">
        {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
        {groupedProductsCount > 0 && (
          <span className="ml-2 text-blue-600 font-medium">
            ({groupedProductsCount} {groupedProductsCount === 1 ? 'grupo' : 'grupos'} agrupados por características)
          </span>
        )}
      </div>

      {/* Información adicional sobre grupos por categoría */}
      {Object.keys(gruposPorCategoria).length > 0 && (
        <div className="mb-4 text-xs text-gray-500">
          Grupos por categoría: {Object.entries(gruposPorCategoria).map(([categoria, count]) => (
            <span key={categoria} className="ml-2">
              {capitalizarPalabras(categoria)}: {count}
            </span>
          ))}
        </div>
      )}

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedProducts.map((product) => (
          <ProductCard 
            key={`${product.id}-${product.marca || 'no-marca'}-${product.linea || 'no-linea'}`} 
            product={product}
            // Pasar la información de marca y línea para que ProductDetail la use
            // Solo pasar línea si realmente tiene línea específica
            marcaSeleccionada={product.metadata?.marca || product.marca}
            lineaSeleccionada={
              (product.metadata?.caracteristicas?.tieneLinea && product.metadata?.linea) || 
              (tieneLineaEspecifica(product.linea) ? product.linea : undefined)
            }
            // Indicar si es un producto agrupado (sin botón de agregar)
            esProductoAgrupado={!!product.metadata?.isLineaGroup}
          />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded border text-sm ${
                  currentPage === page
                    ? "bg-babalu-primary text-white border-babalu-primary"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {page}
              </button>
            )
          })}

          {totalPages > 5 && <span className="text-gray-400">...</span>}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mensaje si no hay productos */}
      {products.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
          <p className="text-gray-400">Intenta con otros filtros o términos de búsqueda</p>
        </div>
      )}
    </div>
  )
}