"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { ShoppingCart, Minus, Plus, Loader2 } from "lucide-react";
import { useCart } from "../contexts/cart-context";
import { Product } from "app/types/product";

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  aroma: string;
  linea?: string;
}

interface ProductDetailProps {
  productId: string;
  marcaSeleccionada?: string;
  lineaSeleccionada?: string;
}

// Función para verificar si la categoría puede tener aromas
const categoriaPuedeTenerAromas = (category: string): boolean => {
  const categoriasConAromas = [
    'sahumerio',
    'rocio aurico',
    'aromatizante para auto',
    'aromatizante de ambiente',
    'incienso',
    'esencia'
  ];
  
  return categoriasConAromas.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase())
  );
};

export function ProductDetail({ productId, marcaSeleccionada, lineaSeleccionada }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({});
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Iniciando fetch del producto con ID:', productId);
        const response = await fetch(`/api/agregarProd?id=${productId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Endpoint de API no encontrado. Verifica la ruta.');
        }

        const data = await response.json();
        console.log('📦 Respuesta de la API:', data);

        if (!data.success) {
          throw new Error(data.error || 'Error al cargar el producto');
        }

        const productData = data.data;
        console.log('✅ Producto cargado:', productData);
        setProduct(productData);

        // Si tenemos marca y categoría, buscar variantes
        const marca = marcaSeleccionada || productData.marca;
        const linea = typeof lineaSeleccionada === 'string' ? lineaSeleccionada : 
                     typeof productData.linea === 'string' ? productData.linea : undefined;

        console.log('📋 Parámetros para variantes:', { 
          category: productData.category, 
          marca, 
          linea,
          currentAroma: productData.aroma 
        });

        if (marca && productData.category) {
          // Verificar si la categoría puede tener aromas
          const puedeTenerAromas = categoriaPuedeTenerAromas(productData.category);
          console.log('🌸 ¿Puede tener aromas?', puedeTenerAromas);
          
          if (puedeTenerAromas) {
            await fetchVariants(productData.category, marca, productData.aroma, linea, productData);
          } else {
            console.log('ℹ️ Esta categoría no puede tener aromas, saltando búsqueda de variantes');
          }
        } else {
          console.log('❌ Faltan marca o categoría para buscar variantes');
        }

      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, marcaSeleccionada, lineaSeleccionada]);

  const fetchVariants = async (category: string, marca: string, currentAroma: string, linea?: string, currentProduct?: Product) => {
    setIsLoadingVariants(true);
    setVariants([]); // Limpiar variantes anteriores
    
    try {
      console.log('🔍 Iniciando búsqueda de variantes...');
      console.log('📋 Parámetros de búsqueda:', { category, marca, linea });
      
      // Construir URL para la consulta - SIN LIMIT para obtener todos los productos
      let url = `/api/agregarProd?category=${encodeURIComponent(category)}&marca=${encodeURIComponent(marca)}`;
      
      if (linea) {
        url += `&linea=${encodeURIComponent(linea)}`;
      }

      console.log('🌐 URL de consulta:', url);

      const productsResponse = await fetch(url);
      console.log('📡 Response status:', productsResponse.status);
      
      if (!productsResponse.ok) {
        throw new Error(`HTTP error! status: ${productsResponse.status}`);
      }
      
      const productsData = await productsResponse.json();
      console.log('📦 Respuesta completa de productos:', productsData);

      if (productsData.success && productsData.data) {
        console.log(`✅ Se encontraron ${productsData.data.length} productos en total`);
        
        if (productsData.data.length === 0) {
          console.log('❌ No se encontraron productos con los filtros aplicados');
          setVariants([]);
          return;
        }

        // Mostrar información de los primeros productos para debug
        console.log('📊 Primeros productos encontrados:', productsData.data.slice(0, 3));

        // Filtrar productos que tengan aroma
        const productosConAroma = productsData.data.filter((producto: any) => {
          const tieneAroma = producto.aroma && producto.aroma.trim() !== '';
          if (!tieneAroma) {
            console.log('❌ Producto sin aroma:', producto.name, '- Aroma:', producto.aroma);
          }
          return tieneAroma;
        });
        
        console.log(`🌸 Productos con aroma: ${productosConAroma.length} de ${productsData.data.length}`);
        
        if (productosConAroma.length > 0) {
          // Agrupar productos por aroma
          const productosPorAroma: { [aroma: string]: any[] } = {};
          
          productosConAroma.forEach((producto: any) => {
            const aroma = producto.aroma.trim();
            if (!productosPorAroma[aroma]) {
              productosPorAroma[aroma] = [];
            }
            productosPorAroma[aroma].push(producto);
          });

          console.log('🌺 Aromas únicos encontrados:', Object.keys(productosPorAroma));
          console.log('📈 Distribución de productos por aroma:', Object.keys(productosPorAroma).map(aroma => ({
            aroma,
            cantidad: productosPorAroma[aroma].length
          })));

          // Crear variantes para cada aroma
          const variantes: ProductVariant[] = [];
          
          Object.keys(productosPorAroma).forEach(aroma => {
            const productosDelAroma = productosPorAroma[aroma];
            if (productosDelAroma.length > 0) {
              const productoRepresentativo = productosDelAroma[0];
              
              // Calcular stock total del aroma
              const stockTotal = productosDelAroma.reduce((total, prod) => total + (prod.stock || 0), 0);
              
              // Parsear precio correctamente
              let precio = 0;
              if (typeof productoRepresentativo.price === 'string') {
                const precioLimpio = productoRepresentativo.price.replace('$', '').replace(',', '.').trim();
                precio = parseFloat(precioLimpio);
                if (isNaN(precio)) {
                  console.error('❌ Error parseando precio:', productoRepresentativo.price);
                  precio = 0;
                }
              } else {
                precio = parseFloat(productoRepresentativo.price);
              }

              const variante = {
                id: productoRepresentativo.id.toString(),
                name: aroma,
                price: precio,
                stock: stockTotal,
                aroma: aroma,
                linea: productoRepresentativo.linea || linea || undefined
              };

              console.log('➕ Añadiendo variante:', variante);
              variantes.push(variante);
            }
          });

          console.log('🛍️ Total de variantes creadas:', variantes.length);
          console.log('📋 Lista completa de variantes:', variantes);

          // Incluir también el producto actual si tiene aroma
          const productToUse = currentProduct || product;
          if (productToUse && productToUse.aroma && productToUse.aroma.trim() !== '') {
            const currentProductVariant: ProductVariant = {
              id: productToUse.id.toString(),
              name: productToUse.aroma,
              price: parseFloat(productToUse.price.replace('$', '').replace(',', '.')),
              stock: productToUse.stock,
              aroma: productToUse.aroma,
              linea: typeof productToUse.linea === 'string' ? productToUse.linea : undefined
            };
            
            // Evitar duplicados
            const exists = variantes.some(v => v.aroma === currentProductVariant.aroma);
            if (!exists) {
              console.log('➕ Añadiendo producto actual como variante:', currentProductVariant);
              setVariants([currentProductVariant, ...variantes]);
            } else {
              console.log('ℹ️ Producto actual ya existe en las variantes');
              setVariants(variantes);
            }
          } else {
            console.log('ℹ️ Producto actual no tiene aroma, usando solo variantes encontradas');
            setVariants(variantes);
          }

          // Inicializar cantidades
          const initialQuantities: Record<string, number> = {};
          const todasVariantes = productToUse && productToUse.aroma ? [{
            id: productToUse.id.toString(),
            name: productToUse.aroma,
            price: parseFloat(productToUse.price.replace('$', '').replace(',', '.')),
            stock: productToUse.stock,
            aroma: productToUse.aroma,
            linea: typeof productToUse.linea === 'string' ? productToUse.linea : undefined
          }, ...variantes] : variantes;

          todasVariantes.forEach(variant => {
            initialQuantities[variant.id] = 1;
          });
          setVariantQuantities(initialQuantities);

        } else {
          console.log('❌ No hay productos con aroma en los resultados');
          setVariants([]);
        }
      } else {
        console.log('❌ La respuesta no fue exitosa o no tiene data');
        console.log('Success:', productsData.success);
        console.log('Data:', productsData.data);
        setVariants([]);
      }
    } catch (error) {
      console.error('❌ Error fetching variants:', error);
      setVariants([]);
    } finally {
      setIsLoadingVariants(false);
    }
  };

  const handleVariantQuantityChange = (variantId: string, change: number) => {
    setVariantQuantities(prev => ({
      ...prev,
      [variantId]: Math.max(1, (prev[variantId] || 1) + change)
    }));
  };

  const handleAddVariantToCart = (variant: ProductVariant) => {
    if (!product) return;
    
    const quantity = variantQuantities[variant.id] || 1;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: parseInt(variant.id),
        name: `${product.name}${variant.linea ? ` - Línea ${variant.linea}` : ''} - ${variant.name}`,
        price: variant.price,
        image: product.image || "/placeholder.svg",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8 mb-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-babalu-primary" />
          <span className="ml-2 text-gray-600">Cargando producto...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-8 mb-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error al cargar el producto</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-lg p-8 mb-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  const lineaDisplay = typeof lineaSeleccionada === 'string' ? lineaSeleccionada : 
                     typeof product.linea === 'string' ? product.linea : undefined;

  const puedeMostrarAromas = categoriaPuedeTenerAromas(product.category);

  return (
    <div className="bg-white rounded-lg p-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Detalles del producto */}
        <div className="space-y-6">
          <div>
            <span className="inline-block bg-babalu-primary text-white text-sm px-3 py-1 rounded-full mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.name}
              {puedeMostrarAromas && variants.length > 0 && (
                <span className="text-lg text-gray-600 font-normal ml-2">
                  ({variants.length} aromas disponibles{lineaDisplay ? ` en línea ${lineaDisplay}` : ''})
                </span>
              )}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>Marca: {marcaSeleccionada || product.marca || 'N/A'}</span>
              {lineaDisplay && <span>Línea: {lineaDisplay}</span>}
              {product.aroma && <span>Aroma: {product.aroma}</span>}
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              {product.description}
            </p>
          </div>

          {/* Listado de aromas */}
          {puedeMostrarAromas && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {lineaDisplay 
                    ? `Aromas de la línea ${lineaDisplay}:` 
                    : 'Aromas disponibles:'
                  }
                </h3>
                {isLoadingVariants && <Loader2 className="w-4 h-4 animate-spin text-babalu-primary" />}
              </div>
              
              {variants.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {variants.map((variant: ProductVariant) => (
                    <div key={variant.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{variant.name}</span>
                        <div className="text-sm text-gray-600">
                          {formatPrice(variant.price)} • {variant.stock} disponibles
                          {variant.linea && !lineaDisplay && (
                            <span className="ml-2 text-xs text-gray-500">(Línea {variant.linea})</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVariantQuantityChange(variant.id, -1)}
                            className="px-2 py-1 hover:bg-gray-100 h-8 w-8"
                            disabled={variant.stock === 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>

                          <span className="px-3 py-1 font-medium min-w-[2rem] text-center text-sm">
                            {variantQuantities[variant.id] || 1}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVariantQuantityChange(variant.id, 1)}
                            className="px-2 py-1 hover:bg-gray-100 h-8 w-8"
                            disabled={variant.stock === 0}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <Button
                          onClick={() => handleAddVariantToCart(variant)}
                          className="bg-babalu-primary hover:bg-babalu-dark text-white px-4 py-2 flex items-center gap-2 text-sm"
                          disabled={variant.stock === 0}
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLoadingVariants ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">
                    {lineaDisplay 
                      ? `No hay aromas disponibles en la línea ${lineaDisplay}`
                      : 'No hay aromas disponibles'
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Categoría: {product.category} | Marca: {product.marca}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Información adicional */}
          <div className="pt-6 border-t border-gray-200">
            <div className="mb-4">
              <span className="text-gray-600">Categoría: </span>
              <a href="#" className="text-babalu-primary hover:text-babalu-dark">
                {product.category}
              </a>
            </div>

            <Button
              variant="outline"
              className="w-full py-3 text-gray-700 border-gray-300 hover:bg-gray-50 font-medium"
              onClick={() => (window.location.href = "/productos")}
            >
              SEGUIR COMPRANDO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}