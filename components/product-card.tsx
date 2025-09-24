"use client"

import Image from "next/image"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "../contexts/cart-context"
import { Product } from "app/types/product"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: Product
  marcaSeleccionada?: string
  lineaSeleccionada?: string
  esProductoAgrupado?: boolean
}

export function ProductCard({ product, marcaSeleccionada, lineaSeleccionada, esProductoAgrupado = false }: ProductCardProps) {
  const { addItem } = useCart()
  const router = useRouter()

  // Función para capitalizar la primera letra de cada palabra
  const capitalizarPalabras = (texto: string | undefined | null): string => {
    if (!texto || typeof texto !== 'string') return '';
    return texto
      .toLowerCase()
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  // Función auxiliar para convertir cualquier valor a string seguro
  const safeString = (value: string | boolean | undefined | null): string => {
    if (typeof value === 'boolean') return value ? 'true' : 'false'; // Convertir boolean a string
    if (!value || typeof value !== 'string') return '';
    return value.trim();
  }

  // Función para verificar si tiene línea específica (siempre devuelve boolean)
  const tieneLineaEspecifica = (linea: string | boolean | undefined | null): boolean => {
    const lineaStr = safeString(linea).toLowerCase();
    return lineaStr !== '' && 
           lineaStr !== 'sin-linea' &&
           lineaStr !== 'sin línea' &&
           lineaStr !== 'sin_linea' &&
           lineaStr !== 'sin' &&
           lineaStr !== 'false' && // Excluir el string "false" de booleanos convertidos
           lineaStr !== 'true';    // Excluir el string "true" de booleanos convertidos
  }

  // Función para verificar si tiene marca específica (siempre devuelve boolean)
  const tieneMarcaEspecifica = (marca: string | boolean | undefined | null): boolean => {
    const marcaStr = safeString(marca).toLowerCase();
    return marcaStr !== '' && 
           marcaStr !== 'sin-marca' &&
           marcaStr !== 'sin marca' &&
           marcaStr !== 'sin_marca' &&
           marcaStr !== 'false' && // Excluir el string "false" de booleanos convertidos
           marcaStr !== 'true';    // Excluir el string "true" de booleanos convertidos
  }

  // Función para verificar si un producto es individual (tiene pocas características pero es vendible)
  const esProductoIndividual = (product: Product): boolean => {
    // Verificar si tiene categoría
    const tieneCategoria = safeString(product.category) !== '';
    
    // Verificar si NO tiene marca ni línea específicas (o sea, es individual)
    const noTieneMarca = !tieneMarcaEspecifica(product.marca);
    const noTieneLinea = !tieneLineaEspecifica(product.linea);
    
    // Verificar si tiene características adicionales que lo hacen vendible individualmente
    const tieneCaracteristicas = [
      safeString(product.tamaño) !== '',
      safeString(product.cantidad) !== '',
      safeString(product.color) !== '',
      safeString(product.tipo) !== '',
      safeString(product.piedra) !== ''
    ].some(Boolean);
    
    // Es individual si tiene categoría, no tiene marca/línea específicas, pero tiene otras características
    return tieneCategoria && noTieneMarca && noTieneLinea && tieneCaracteristicas;
  }

  const handleAddToCart = () => {
    // Permitir agregar al carrito si NO es un producto agrupado O si es un producto individual
    if (esProductoAgrupado && !esProductoIndividual(product)) return;
    
    // Convertir precio string a número de forma segura
    let priceNumber = 0;
    if (product.price && typeof product.price === 'string') {
      const cleanedPrice = product.price.replace("$", "").replace(",", "");
      priceNumber = Number.parseFloat(cleanedPrice) || 0;
    }

    // Solo agregar si el precio es válido
    if (priceNumber > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: priceNumber,
        image: product.image || product.src || "/placeholder.svg",
      })
    }
  }

  const handleCardClick = () => {
    // Construir URL con los parámetros de marca y línea
    const params = new URLSearchParams()
    
    // Solo pasar marca si tiene marca específica
    const marca = typeof marcaSeleccionada === 'string' && tieneMarcaEspecifica(marcaSeleccionada) 
      ? marcaSeleccionada 
      : tieneMarcaEspecifica(product.marca)
        ? safeString(product.marca)
        : '';
    
    // Solo pasar línea si tiene línea específica
    const linea = typeof lineaSeleccionada === 'string' && tieneLineaEspecifica(lineaSeleccionada)
      ? lineaSeleccionada
      : tieneLineaEspecifica(product.linea)
        ? safeString(product.linea)
        : '';

    if (marca && marca.trim() !== '') {
      params.append('marca', marca.trim())
    }
    
    if (linea && linea.trim() !== '') {
      params.append('linea', linea.trim())
    }

    const queryString = params.toString()
    const url = `/productos/${product.id}${queryString ? `?${queryString}` : ''}`
    
    router.push(url)
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleCardClick()
  }

  // Función para formatear línea
  const formatearLinea = (linea: string): string => {
    return capitalizarPalabras(linea);
  }

  // Función para obtener el texto de línea de forma segura (solo si tiene línea específica)
  const getLineaText = (): string | undefined => {
    // Primero intentar con lineaSeleccionada, luego con product.linea
    const linea = typeof lineaSeleccionada === 'string' ? lineaSeleccionada : 
                 safeString(product.linea);
    
    if (linea && tieneLineaEspecifica(linea)) {
      return formatearLinea(linea);
    }
    return undefined;
  }

  // Función para obtener la imagen del producto
  const getProductImage = (): string => {
    if (product.image && typeof product.image === 'string') return product.image;
    if (product.src && typeof product.src === 'string') return product.src;
    return "/placeholder.svg?height=200&width=200";
  }

  // Función para obtener el precio formateado
  const getFormattedPrice = (): string => {
    if (!product.price) return '';
    if (typeof product.price === 'string') return product.price;
    if (typeof product.price === 'number') return `$${product.price}`;
    return '';
  }

  // Función para obtener información del grupo (solo para productos agrupados)
  const getGroupInfo = (): { variantes?: number; aromas?: number } => {
    if (!esProductoAgrupado || !product.metadata) return {};
    
    return {
      variantes: product.metadata.totalVariantes,
      aromas: product.metadata.totalAromas
    };
  }

  const lineaText = getLineaText();
  const productImage = getProductImage();
  const formattedPrice = getFormattedPrice();
  const groupInfo = getGroupInfo();
  const esIndividual = esProductoIndividual(product);

  // Función para limpiar y capitalizar el nombre del producto
  const limpiarYCapitalizarNombre = (nombre: string | undefined): string => {
    if (!nombre || typeof nombre !== 'string') return 'Producto sin nombre';
    
    // Eliminar "- Sin" del final del nombre
    let nombreLimpio = nombre.replace(/\s*-\s*sin\s*$/i, '').trim();
    
    return capitalizarPalabras(nombreLimpio);
  }

  const nombreCapitalizado = limpiarYCapitalizarNombre(product.name);

  return (
    <Card 
      className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 h-full flex flex-col">
        <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
          <Image
            src={productImage}
            alt={product.name || "Producto"}
            width={200}
            height={200}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onClick={handleImageClick}
          />
        </div>
        <div className="space-y-2 flex-grow flex flex-col">
          <div className="flex-grow space-y-2">
            <h3 className="font-semibold text-gray-800 text-lg leading-tight">
              {nombreCapitalizado}
            </h3>
            
            {/* Mostrar precio para productos individuales o no agrupados */}
            {(formattedPrice && (!esProductoAgrupado || esIndividual)) && (
              <p className="text-xl font-bold text-babalu-primary">{formattedPrice}</p>
            )}

            {/* Mostrar información de línea SOLO si tiene línea específica */}
            {lineaText && (
              <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                Línea: {lineaText}
              </p>
            )}

            {/* Mostrar características del producto individual */}
            {esIndividual && (
              <div className="text-xs text-gray-500 space-y-1">
                {safeString(product.tamaño) !== '' && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Tamaño: {capitalizarPalabras(safeString(product.tamaño))}
                  </p>
                )}
                {safeString(product.cantidad) !== '' && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Cantidad: {safeString(product.cantidad)}
                  </p>
                )}
                {safeString(product.color) !== '' && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Color: {capitalizarPalabras(safeString(product.color))}
                  </p>
                )}
                {safeString(product.tipo) !== '' && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Tipo: {capitalizarPalabras(safeString(product.tipo))}
                  </p>
                )}
                {safeString(product.piedra) !== '' && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Piedra: {capitalizarPalabras(safeString(product.piedra))}
                  </p>
                )}
              </div>
            )}

            {/* Mostrar información del grupo para productos agrupados */}
            {esProductoAgrupado && (
              <div className="text-xs text-blue-600 space-y-1">
                {groupInfo.aromas && groupInfo.aromas > 0 && (
                  <p>{groupInfo.aromas} aroma{groupInfo.aromas > 1 ? 's' : ''} disponible{groupInfo.aromas > 1 ? 's' : ''}</p>
                )}
                {(!groupInfo.aromas || groupInfo.aromas === 0) && (
                  <p>Haz clic para ver detalles</p>
                )}
              </div>
            )}
          </div>

          {/* Botón de agregar al carrito - Para productos NO agrupados o productos individuales */}
          {(!esProductoAgrupado || esIndividual) ? (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart()
              }}
              className="w-full bg-babalu-primary hover:bg-babalu-dark text-white mt-3"
              size="sm"
              disabled={!formattedPrice}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Agregar al Carrito
            </Button>
          ) : (
            <div className="text-center py-2 mt-3 bg-gray-100 rounded text-sm text-gray-600">
              Haz clic para ver variantes disponibles
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}