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

// Interface para el metadata del producto agrupado
interface ProductMetadata {
  isGrouped?: boolean;
  isLineaGroup?: boolean;
  totalVariantes?: number;
  totalAromas?: number;
  aromas?: string[];
  marca?: string;
  linea?: string;
  category?: string;
  grupoCompleto?: Product[];
  caracteristicas?: {
    tieneMarca: boolean;
    tieneLinea: boolean;
    tieneAromas: boolean;
    tieneCategoria: boolean;
  };
}

// Tipo para producto con metadata extendido
type ProductWithMetadata = Product & {
  metadata?: ProductMetadata;
};

export function ProductsGridPage({ selectedCategory, searchQuery, sortBy }: ProductsGridPageProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState<ProductWithMetadata[]>([])
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
    if (!linea || typeof linea !== 'string') return false;
    const lineaStr = linea.trim().toLowerCase();
    return lineaStr !== '' && 
           lineaStr !== 'sin-linea' &&
           lineaStr !== 'sin línea' &&
           lineaStr !== 'sin_linea';
  }

  // Función para verificar si tiene marca específica (no vacía y no "sin-marca")
  const tieneMarcaEspecifica = (marca: string | boolean | undefined | null): boolean => {
    if (!marca || typeof marca !== 'string') return false;
    const marcaStr = marca.trim().toLowerCase();
    return marcaStr !== '' && 
           marcaStr !== 'sin-marca' &&
           marcaStr !== 'sin marca' &&
           marcaStr !== 'sin_marca';
  }

  // Función para verificar si tiene aroma específico (no vacío)
  const tieneAromaEspecifico = (aroma: string | boolean | undefined | null): boolean => {
    if (!aroma || typeof aroma !== 'string') return false;
    const aromaStr = aroma.trim().toLowerCase();
    return aromaStr !== '' && 
           aromaStr !== 'sin-aroma' &&
           aromaStr !== 'sin aroma' &&
           aromaStr !== 'sin_aroma';
  }

  // Función para verificar si tiene categoría específica (no vacía)
  const tieneCategoriaEspecifica = (categoria: string | boolean | undefined | null): boolean => {
    if (!categoria || typeof categoria !== 'string') return false;
    return categoria.trim() !== '';
  }

  // Función para formatear la línea (solo si tiene línea específica)
  const formatearLinea = (linea: string | boolean | undefined | null): string => {
    if (!tieneLineaEspecifica(linea)) return '';
    return capitalizarPalabras(linea as string);
  }

  // Función para formatear el aroma (solo si tiene aroma específico)
  const formatearAroma = (aroma: string | boolean | undefined | null): string => {
    if (!tieneAromaEspecifico(aroma)) return '';
    return capitalizarPalabras(aroma as string);
  }

  // Función para verificar si un producto puede ser agrupado (tiene al menos 2 características)
  const puedeSerAgrupado = (product: Product): boolean => {
    const caracteristicas = [
      tieneMarcaEspecifica(product.marca),
      tieneCategoriaEspecifica(product.category),
      tieneLineaEspecifica(product.linea),
      tieneAromaEspecifico(product.aroma)
    ];
    
    const cantidadCaracteristicas = caracteristicas.filter(Boolean).length;
    return cantidadCaracteristicas >= 2;
  }

  // Función para obtener la clave de agrupación basada en las características disponibles
  const obtenerClaveAgrupacion = (product: Product): string => {
    const partes: string[] = [];
    
    // Incluir categoría si está disponible
    if (tieneCategoriaEspecifica(product.category)) {
      partes.push((product.category as string).toLowerCase().trim());
    } else {
      partes.push('sin-categoria');
    }
    
    // Incluir marca solo si tiene marca específica
    if (tieneMarcaEspecifica(product.marca)) {
      partes.push((product.marca as string).toLowerCase().trim());
    } else {
      partes.push('sin-marca');
    }
    
    // Incluir línea solo si tiene línea específica
    if (tieneLineaEspecifica(product.linea)) {
      partes.push((product.linea as string).toLowerCase().trim());
    } else {
      partes.push('sin-linea');
    }
    
    return partes.join('-');
  }

  // Función para agrupar productos por características comunes
  const groupProductsByCharacteristics = (products: Product[]): ProductWithMetadata[] => {
    const grouped: { [key: string]: Product[] } = {}
    const nonGrouped: Product[] = []

    products.forEach((product: Product) => {
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
    const representativeProducts: ProductWithMetadata[] = []
    
    Object.entries(grouped).forEach(([key, groupedProducts]) => {
      if (groupedProducts.length > 0) {
        // Extraer información del grupo de la clave
        const [category, marca, linea] = key.split('-')
        
        // Ordenar por stock descendente y tomar el primero (el que tiene más stock)
        const sortedByStock = groupedProducts.sort((a, b) => b.stock - a.stock)
        const representative = sortedByStock[0]
        
        // Capitalizar solo si existen realmente
        const categoriaCapitalizada = (category !== 'sin-categoria') ? capitalizarPalabras(category) : '';
        const marcaCapitalizada = (marca !== 'sin-marca') ? capitalizarPalabras(marca) : '';
        const lineaCapitalizada = (linea !== 'sin-linea') ? capitalizarPalabras(linea) : '';
        
        // Contar aromas únicos en el grupo
        const aromasUnicos = new Set<string>();
        groupedProducts.forEach(p => {
          if (tieneAromaEspecifico(p.aroma)) {
            aromasUnicos.add(formatearAroma(p.aroma));
          }
        });
        
        const cantidadAromas = aromasUnicos.size;
        const listaAromas = Array.from(aromasUnicos).sort();
        
        // Determinar qué características tiene el grupo
        const tieneCategoria = category !== 'sin-categoria';
        const tieneMarca = marca !== 'sin-marca';
        const tieneLinea = linea !== 'sin-linea';
        const tieneAromas = cantidadAromas > 0;

        // Crear nombre y descripción según las características disponibles
        let nombreGrupo = '';
        let descripcionGrupo = '';

        // LÓGICA DE NOMBRES MEJORADA - Similar a sahumerios/rocío áuricos/aromatizantes
        if (tieneCategoria && tieneMarca) {
          if (tieneLinea) {
            // Caso: Categoría + Marca + Línea (ej: "Sahumerios Hem - Clásicos")
            if (tieneAromas) {
              nombreGrupo = `${categoriaCapitalizada} ${marcaCapitalizada} - ${lineaCapitalizada}`;
              descripcionGrupo = `${cantidadAromas} aroma${cantidadAromas > 1 ? 's' : ''} disponible${cantidadAromas > 1 ? 's' : ''}`;
            } else {
              nombreGrupo = `${categoriaCapitalizada} ${marcaCapitalizada} - ${lineaCapitalizada}`;
              descripcionGrupo = `${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
            }
          } else {
            // Caso: Categoría + Marca (ej: "Rocío Áurico Babalú")
            if (tieneAromas) {
              nombreGrupo = `${categoriaCapitalizada} ${marcaCapitalizada}`;
              descripcionGrupo = `${cantidadAromas} aroma${cantidadAromas > 1 ? 's' : ''} disponible${cantidadAromas > 1 ? 's' : ''}`;
            } else {
              nombreGrupo = `${categoriaCapitalizada} ${marcaCapitalizada}`;
              descripcionGrupo = `${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
            }
          }
        } else if (tieneCategoria && !tieneMarca) {
          // Caso: Solo categoría (ej: "Velas")
          if (tieneLinea) {
            nombreGrupo = `${categoriaCapitalizada} - ${lineaCapitalizada}`;
            descripcionGrupo = `${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
          } else {
            nombreGrupo = categoriaCapitalizada;
            descripcionGrupo = `${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
          }
        } else if (!tieneCategoria && tieneMarca) {
          // Caso: Solo marca (raro, pero posible)
          if (tieneLinea) {
            nombreGrupo = `${marcaCapitalizada} - ${lineaCapitalizada}`;
            descripcionGrupo = `${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
          } else {
            nombreGrupo = marcaCapitalizada;
            descripcionGrupo = `${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''} disponible${groupedProducts.length > 1 ? 's' : ''}`;
          }
        } else {
          // Caso: Sin categoría ni marca (muy raro)
          if (tieneLinea) {
            nombreGrupo = lineaCapitalizada;
          } else {
            nombreGrupo = `Productos Variados`;
          }
          descripcionGrupo = `${groupedProducts.length} variante${groupedProducts.length > 1 ? 's' : ''}`;
        }

        // Usar la imagen del producto representativo
        const imagenRepresentativa = representative.image || representative.src;

        // Crear un producto "representativo" con información del grupo
        const enhancedProduct: ProductWithMetadata = {
          ...representative,
          id: representative.id, // Mantener el ID numérico original
          name: nombreGrupo,
          description: descripcionGrupo,
          price: '', // Precio vacío para productos agrupados
          image: imagenRepresentativa,
          src: imagenRepresentativa,
          marca: marcaCapitalizada,
          linea: lineaCapitalizada,
          category: categoriaCapitalizada,
          aroma: tieneAromas ? listaAromas.join(', ') : '',
          
          // Metadata para identificar el grupo
          metadata: {
            isGrouped: true,
            isLineaGroup: true,
            totalVariantes: groupedProducts.length,
            totalAromas: cantidadAromas,
            aromas: listaAromas,
            marca: marcaCapitalizada || undefined,
            linea: lineaCapitalizada || undefined,
            category: categoriaCapitalizada || undefined,
            grupoCompleto: groupedProducts,
            caracteristicas: {
              tieneMarca,
              tieneLinea,
              tieneAromas,
              tieneCategoria
            }
          }
        }
        
        representativeProducts.push(enhancedProduct)
      }
    })

    // Productos no agrupados - capitalizar nombres y limpiar campos vacíos
    const nonGroupedCapitalizados: ProductWithMetadata[] = nonGrouped.map(product => ({
      ...product,
      name: capitalizarPalabras(product.name),
      marca: tieneMarcaEspecifica(product.marca) ? capitalizarPalabras(product.marca as string) : '',
      linea: tieneLineaEspecifica(product.linea) ? formatearLinea(product.linea) : '',
      aroma: tieneAromaEspecifico(product.aroma) ? formatearAroma(product.aroma) : '',
      category: product.category ? capitalizarPalabras(product.category) : product.category,
      description: product.description ? capitalizarPalabras(product.description) : product.description,
      metadata: undefined // No metadata para productos no agrupados
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

        // Filtrar y preparar productos
        const productosPreparados: Product[] = data.data.map((product: any) => ({
          ...product,
          name: product.name || '',
          marca: product.marca || '',
          linea: product.linea || '',
          aroma: product.aroma || '',
          category: product.category || '',
          description: product.description || '',
          // Asegurar que los tipos numéricos sean correctos
          id: typeof product.id === 'string' ? parseInt(product.id) : product.id,
          stock: typeof product.stock === 'string' ? parseInt(product.stock) : product.stock
        }))

        // Agrupar productos por características
        const productosAgrupados = groupProductsByCharacteristics(productosPreparados);
        
        setProducts(productosAgrupados)
        
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

  // Contar productos individuales
  const individualProductsCount = products.length - groupedProductsCount;

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
            ({groupedProductsCount} {groupedProductsCount === 1 ? 'grupo' : 'grupos'} agrupados, {individualProductsCount} individuales)
          </span>
        )}
      </div>

{/* Grid de productos */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  {paginatedProducts.map((product) => (
    <ProductCard 
      key={product.metadata?.isGrouped ? `group-${product.id}` : `product-${product.id}`}
      product={product}
      marcaSeleccionada={typeof product.marca === 'string' ? product.marca : undefined}
      lineaSeleccionada={typeof product.linea === 'string' ? product.linea : undefined}
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