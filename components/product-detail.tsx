"use client";

import { useState, useEffect, useCallback } from "react";
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

// Función auxiliar para convertir cualquier valor a string seguro
const safeString = (value: string | boolean | undefined | null): string => {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (!value || typeof value !== "string") return "";
  return value.trim();
};

// Función para verificar si tiene línea específica
const tieneLineaEspecifica = (
  linea: string | boolean | undefined | null
): boolean => {
  const lineaStr = safeString(linea).toLowerCase();
  return (
    lineaStr !== "" &&
    lineaStr !== "sin-linea" &&
    lineaStr !== "sin línea" &&
    lineaStr !== "sin_linea" &&
    lineaStr !== "sin" &&
    lineaStr !== "false" &&
    lineaStr !== "true"
  );
};

// Función para verificar si tiene marca específica
const tieneMarcaEspecifica = (
  marca: string | boolean | undefined | null
): boolean => {
  const marcaStr = safeString(marca).toLowerCase();
  return (
    marcaStr !== "" &&
    marcaStr !== "sin-marca" &&
    marcaStr !== "sin marca" &&
    marcaStr !== "sin_marca" &&
    marcaStr !== "false" &&
    marcaStr !== "true"
  );
};

// Función para verificar si un producto tiene al menos 2 de los 4 campos principales
const tieneAlMenosDosAtributos = (product: Product): boolean => {
  const atributos = [
    safeString(product.category) !== "",
    safeString(product.marca) !== "",
    safeString(product.linea) !== "",
    safeString(product.aroma) !== "",
  ];

  return atributos.filter(Boolean).length >= 2;
};

// Función para verificar si un producto es individual
const esProductoIndividual = (product: Product): boolean => {
  // Verificar si tiene categoría
  const tieneCategoria = safeString(product.category) !== "";

  // Verificar si NO tiene marca ni línea específicas (o sea, es individual)
  const noTieneMarca = !tieneMarcaEspecifica(product.marca);
  const noTieneLinea = !tieneLineaEspecifica(product.linea);

  // Verificar si tiene características adicionales que lo hacen vendible individualmente
  const tieneCaracteristicas = [
    safeString(product.tamaño) !== "",
    safeString(product.cantidad) !== "",
    safeString(product.color) !== "",
    safeString(product.tipo) !== "",
    safeString(product.piedra) !== "",
  ].some(Boolean);

  // Es individual si tiene categoría, no tiene marca/línea específicas, pero tiene otras características
  return tieneCategoria && noTieneMarca && noTieneLinea && tieneCaracteristicas;
};

export function ProductDetail({
  productId,
  marcaSeleccionada,
  lineaSeleccionada,
}: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variantQuantities, setVariantQuantities] = useState<
    Record<string, number>
  >({});
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // SOLUCIÓN: Remover product de las dependencias y usar parámetros
  const fetchVariants = useCallback(
    async (
      category: string,
      marca: string,
      currentAroma: string,
      linea?: string,
      currentProduct?: Product
    ) => {
      setIsLoadingVariants(true);
      setVariants([]);

      try {
        console.log("🔍 Iniciando búsqueda de variantes...");

        // Construir múltiples URLs para obtener productos con diferentes combinaciones
        const urls: string[] = [];

        if (category && marca) {
          urls.push(
            `/api/agregarProd?category=${encodeURIComponent(
              category
            )}&marca=${encodeURIComponent(marca)}`
          );
        }

        if (category && linea) {
          urls.push(
            `/api/agregarProd?category=${encodeURIComponent(
              category
            )}&linea=${encodeURIComponent(linea)}`
          );
        }

        if (marca && linea) {
          urls.push(
            `/api/agregarProd?marca=${encodeURIComponent(
              marca
            )}&linea=${encodeURIComponent(linea)}`
          );
        }

        if (category && marca && linea) {
          urls.push(
            `/api/agregarProd?category=${encodeURIComponent(
              category
            )}&marca=${encodeURIComponent(marca)}&linea=${encodeURIComponent(
              linea
            )}`
          );
        }

        console.log("🌐 URLs de consulta:", urls);

        const allProductsPromises = urls.map((url) =>
          fetch(url)
            .then((res) => res.json())
            .catch((err) => {
              console.error(`Error fetching ${url}:`, err);
              return { success: false, data: [] };
            })
        );

        const allResults = await Promise.all(allProductsPromises);
        console.log("📦 Respuestas de las consultas:", allResults.length);

        // Combinar todos los productos y eliminar duplicados
        const todosLosProductos: Product[] = [];
        const productosVistos = new Set<number>();

        allResults.forEach((result) => {
          if (result.success && result.data) {
            result.data.forEach((producto: Product) => {
              if (!productosVistos.has(producto.id)) {
                productosVistos.add(producto.id);
                todosLosProductos.push(producto);
              }
            });
          }
        });

        console.log(
          `✅ Se encontraron ${todosLosProductos.length} productos únicos en total`
        );

        if (todosLosProductos.length === 0) {
          console.log(
            "❌ No se encontraron productos con los filtros aplicados"
          );
          setVariants([]);
          return;
        }

        // Filtrar productos que tengan al menos 2 atributos y aroma
        const productosValidados = todosLosProductos.filter(
          (producto: Product) => {
            const tieneAtributosSuficientes =
              tieneAlMenosDosAtributos(producto);
            const tieneAroma = safeString(producto.aroma) !== "";
            return tieneAtributosSuficientes && tieneAroma;
          }
        );

        console.log(
          `🌸 Productos validados con aromas: ${productosValidados.length} de ${todosLosProductos.length}`
        );

        if (productosValidados.length > 0) {
          // Agrupar productos por aroma
          const productosPorAroma: { [aroma: string]: Product[] } = {};

          productosValidados.forEach((producto: Product) => {
            const aroma = safeString(producto.aroma);
            if (!productosPorAroma[aroma]) {
              productosPorAroma[aroma] = [];
            }
            productosPorAroma[aroma].push(producto);
          });

          console.log(
            "🌺 Aromas únicos encontrados:",
            Object.keys(productosPorAroma)
          );

          // Crear variantes para cada aroma
          const variantes: ProductVariant[] = [];

          Object.keys(productosPorAroma).forEach((aroma) => {
            const productosDelAroma = productosPorAroma[aroma];
            if (productosDelAroma.length > 0) {
              const productoRepresentativo = productosDelAroma[0];

              const stockTotal = productosDelAroma.reduce(
                (total, prod) => total + (prod.stock || 0),
                0
              );

              let precio = 0;
              if (typeof productoRepresentativo.price === "string") {
                const precioLimpio = productoRepresentativo.price
                  .replace("$", "")
                  .replace(",", ".")
                  .trim();
                precio = parseFloat(precioLimpio);
                if (isNaN(precio)) {
                  console.error(
                    "❌ Error parseando precio:",
                    productoRepresentativo.price
                  );
                  precio = 0;
                }
              } else if (typeof productoRepresentativo.price === "number") {
                precio = productoRepresentativo.price;
              } else {
                console.error(
                  "❌ Tipo de precio no válido:",
                  typeof productoRepresentativo.price
                );
                precio = 0;
              }

              const variante = {
                id: productoRepresentativo.id.toString(),
                name: aroma,
                price: precio,
                stock: stockTotal,
                aroma: aroma,
                linea:
                  safeString(productoRepresentativo.linea) ||
                  linea ||
                  undefined,
              };

              console.log("➕ Añadiendo variante:", variante);
              variantes.push(variante);
            }
          });

          console.log("🛍️ Total de variantes creadas:", variantes.length);

          // Incluir también el producto actual si tiene aroma y al menos 2 atributos
          if (
            currentProduct &&
            safeString(currentProduct.aroma) !== "" &&
            tieneAlMenosDosAtributos(currentProduct)
          ) {
            const currentProductVariant: ProductVariant = {
              id: currentProduct.id.toString(),
              name: safeString(currentProduct.aroma),
              price: parseFloat(
                safeString(currentProduct.price)
                  .replace("$", "")
                  .replace(",", ".")
              ),
              stock: currentProduct.stock,
              aroma: safeString(currentProduct.aroma),
              linea: safeString(currentProduct.linea) || undefined,
            };

            const exists = variantes.some(
              (v) => v.aroma === currentProductVariant.aroma
            );
            if (!exists) {
              console.log(
                "➕ Añadiendo producto actual como variante:",
                currentProductVariant
              );
              setVariants([currentProductVariant, ...variantes]);
            } else {
              setVariants(variantes);
            }
          } else {
            setVariants(variantes);
          }

          // Inicializar cantidades
          const initialQuantities: Record<string, number> = {};
          variantes.forEach((variant) => {
            initialQuantities[variant.id] = 1;
          });
          setVariantQuantities(initialQuantities);
        } else {
          console.log("❌ No hay productos que cumplan con los criterios");
          setVariants([]);
        }
      } catch (error) {
        console.error("❌ Error fetching variants:", error);
        setVariants([]);
      } finally {
        setIsLoadingVariants(false);
      }
    },
    []
  ); // SOLUCIÓN: Array de dependencias vacío

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("🔍 Iniciando fetch del producto con ID:", productId);
        const response = await fetch(`/api/agregarProd?id=${productId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error("Endpoint de API no encontrado. Verifica la ruta.");
        }

        const data = await response.json();
        console.log("📦 Respuesta de la API:", data);

        if (!data.success) {
          throw new Error(data.error || "Error al cargar el producto");
        }

        const productData = data.data;
        console.log("✅ Producto cargado:", productData);
        setProduct(productData);

        // Verificar si es producto individual
        const esIndividual = esProductoIndividual(productData);
        console.log("🔍 ¿Es producto individual?", esIndividual);

        // Si NO es producto individual y tiene al menos 2 atributos, buscar variantes
        const tieneAtributosSuficientes = tieneAlMenosDosAtributos(productData);

        if (!esIndividual && tieneAtributosSuficientes) {
          const marca = marcaSeleccionada || safeString(productData.marca);
          const linea =
            typeof lineaSeleccionada === "string"
              ? lineaSeleccionada
              : safeString(productData.linea);

          console.log("📋 Buscando variantes para producto agrupado:", {
            category: productData.category,
            marca,
            linea,
            currentAroma: productData.aroma,
          });

          // SOLUCIÓN: Pasar productData directamente en lugar de depender del estado
          await fetchVariants(
            productData.category,
            marca,
            safeString(productData.aroma),
            linea,
            productData // Pasamos el producto actual como parámetro
          );
        } else {
          console.log(
            "ℹ️ Producto individual o sin atributos suficientes, no se buscan variantes"
          );
          setVariants([]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar el producto"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, marcaSeleccionada, lineaSeleccionada, fetchVariants]);

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Convertir precio string a número de forma segura
    let priceNumber = 0;
    if (product.price && typeof product.price === "string") {
      const cleanedPrice = product.price.replace("$", "").replace(",", ".");
      priceNumber = Number.parseFloat(cleanedPrice) || 0;
    }

    // Solo agregar si el precio es válido
    if (priceNumber > 0) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: priceNumber,
          image: product.image || product.src || "/placeholder.svg",
        });
      }
    }
  };

  const handleVariantQuantityChange = (variantId: string, change: number) => {
    setVariantQuantities((prev) => ({
      ...prev,
      [variantId]: Math.max(1, (prev[variantId] || 1) + change),
    }));
  };

  const handleAddVariantToCart = (variant: ProductVariant) => {
    if (!product) return;

    const quantity = variantQuantities[variant.id] || 1;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: parseInt(variant.id),
        name: `${product.name}${
          variant.linea ? ` - Línea ${variant.linea}` : ""
        } - ${variant.name}`,
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

  const esIndividual = esProductoIndividual(product);
  const puedeMostrarAromas = !esIndividual && tieneAlMenosDosAtributos(product);
  const lineaDisplay =
    typeof lineaSeleccionada === "string"
      ? lineaSeleccionada
      : safeString(product.linea);

  // Función para obtener el precio formateado del producto
  const getProductPrice = (): number => {
    if (!product.price) return 0;
    if (typeof product.price === "string") {
      const cleanedPrice = product.price.replace("$", "").replace(",", ".");
      return Number.parseFloat(cleanedPrice) || 0;
    }
    if (typeof product.price === "number") return product.price;
    return 0;
  };

  const productPrice = getProductPrice();

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
                  ({variants.length} aromas disponibles
                  {lineaDisplay ? ` en línea ${lineaDisplay}` : ""})
                </span>
              )}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>
                Marca: {marcaSeleccionada || safeString(product.marca) || "N/A"}
              </span>
              {lineaDisplay && <span>Línea: {lineaDisplay}</span>}
              {safeString(product.aroma) && (
                <span>Aroma: {safeString(product.aroma)}</span>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              {product.description}
            </p>
          </div>

          {/* PRECIO Y BOTÓN DE AGREGAR AL CARRITO PARA PRODUCTOS INDIVIDUALES */}
          {esIndividual && productPrice > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-babalu-primary">
                  {formatPrice(productPrice)}
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    className="px-2 py-1 hover:bg-gray-100 h-7 w-7"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="px-2 py-1 font-medium min-w-[2rem] text-center text-sm">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    className="px-2 py-1 hover:bg-gray-100 h-7 w-7"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleAddToCart}
                className="w-full bg-babalu-primary hover:bg-babalu-dark text-white py-2 flex items-center justify-center gap-2 text-sm"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Agregar al Carrito
              </Button>
            </div>
          )}

          {/* CARACTERÍSTICAS DEL PRODUCTO INDIVIDUAL */}
          {esIndividual && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                Características:
              </h3>
              <div className="space-y-1 text-xs">
                {safeString(product.tamaño) !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Tamaño:
                    </span>
                    <span className="font-medium text-gray-800 capitalize">
                      {safeString(product.tamaño)
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                )}
                {safeString(product.cantidad) !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Cantidad:
                    </span>
                    <span className="font-medium text-gray-800">
                      {safeString(product.cantidad)}
                    </span>
                  </div>
                )}
                {safeString(product.color) !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Color:
                    </span>
                    <span className="font-medium text-gray-800 capitalize">
                      {safeString(product.color)
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                )}
                {safeString(product.tipo) !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Tipo:
                    </span>
                    <span className="font-medium text-gray-800 capitalize">
                      {safeString(product.tipo)
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                )}
                {safeString(product.piedra) !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Piedra:
                    </span>
                    <span className="font-medium text-gray-800 capitalize">
                      {safeString(product.piedra)
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LISTADO DE AROMAS PARA PRODUCTOS AGRUPADOS */}
          {puedeMostrarAromas && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  {lineaDisplay
                    ? `Aromas de la línea ${lineaDisplay}:`
                    : "Aromas disponibles:"}
                </h3>
                {isLoadingVariants && (
                  <Loader2 className="w-3 h-3 animate-spin text-babalu-primary" />
                )}
              </div>

              {variants.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {variants.map((variant: ProductVariant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-800 text-sm">
                          {variant.name}
                        </span>
                        <div className="text-xs text-gray-600">
                          {formatPrice(variant.price)} • {variant.stock}{" "}
                          disponibles
                          {variant.linea && !lineaDisplay && (
                            <span className="ml-1 text-gray-500">
                              (Línea {variant.linea})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-300 rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleVariantQuantityChange(variant.id, -1)
                            }
                            className="px-1 py-0 hover:bg-gray-100 h-6 w-6"
                            disabled={variant.stock === 0}
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </Button>

                          <span className="px-2 py-0 font-medium min-w-[1.5rem] text-center text-xs">
                            {variantQuantities[variant.id] || 1}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleVariantQuantityChange(variant.id, 1)
                            }
                            className="px-1 py-0 hover:bg-gray-100 h-6 w-6"
                            disabled={variant.stock === 0}
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </Button>
                        </div>

                        <Button
                          onClick={() => handleAddVariantToCart(variant)}
                          className="bg-babalu-primary hover:bg-babalu-dark text-white px-2 py-1 flex items-center gap-1 text-xs h-6"
                          disabled={variant.stock === 0}
                        >
                          <ShoppingCart className="w-2.5 h-2.5" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLoadingVariants ? (
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-sm">
                    {lineaDisplay
                      ? `No hay aromas disponibles en la línea ${lineaDisplay}`
                      : "No hay aromas disponibles"}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Información adicional */}
          <div className="pt-4 border-t border-gray-200">
            <div className="mb-3">
              <span className="text-gray-600 text-sm">Categoría: </span>
              <a
                href="#"
                className="text-babalu-primary hover:text-babalu-dark text-sm"
              >
                {product.category}
              </a>
            </div>

            <Button
              variant="outline"
              className="w-full py-2 text-gray-700 border-gray-300 hover:bg-gray-50 font-medium text-sm"
              onClick={() => (window.location.href = "/productos")}
              size="sm"
            >
              SEGUIR COMPRANDO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
