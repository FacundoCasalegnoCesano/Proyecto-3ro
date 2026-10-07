"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { ProductImage } from "./product-image";
import { Product } from "app/types/product";
import { buildProductVariants, getInitialVariantId } from "../lib/product-variants";
import { buildCatalogProductTitle, sameCatalogText } from "../lib/product-variants";
import type { ProductVariant } from "../lib/product-variants";
import { formatPrice, parsePrice } from "../utils/price-utils";

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
  const tieneCategoria = safeString(product.category) !== "";
  const noTieneMarca = !tieneMarcaEspecifica(product.marca);
  const noTieneLinea = !tieneLineaEspecifica(product.linea);
  const tieneCaracteristicas = [
    safeString(product.tamaño) !== "",
    safeString(product.cantidad) !== "",
    safeString(product.color) !== "",
    safeString(product.tipo) !== "",
    safeString(product.piedra) !== "",
  ].some(Boolean);

  return tieneCategoria && noTieneMarca && noTieneLinea && tieneCaracteristicas;
};
const esCategoriaNoAgrupable = (product: Product): boolean => {
  const categoria = safeString(product.category).toLowerCase();

  const categoriasNoAgrupables = [
    "ceramica",
    "cerámica",
    "vela",
    "velas",
    "cascada de humo",
    "cascadas de humo",
    "estatua",
    "estatuas",
    "lampara de sal",
    "lamparas de sal",
    "lámpara de sal",
    "lámparas de sal",
    "porta sahumerios",
    "accesorios",
    "atrapaluz",
  ];

  return categoriasNoAgrupables.some((cat) => categoria.includes(cat));
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  const fetchVariants = useCallback(
    async (
      category: string,
      marca: string,
      linea?: string,
      currentProduct?: Product
    ) => {
      setIsLoadingVariants(true);
      setVariants([]);
      setSelectedVariantId(null);

      try {
        if (!currentProduct) {
          setVariants([]);
          return;
        }

        const query = currentProduct.familyId != null
          ? new URLSearchParams({ familyId: String(currentProduct.familyId) })
          : new URLSearchParams({ category });
        if (currentProduct.familyId == null && marca) query.set("marca", marca);
        if (currentProduct.familyId == null && linea && tieneLineaEspecifica(linea)) query.set("linea", linea);

        const response = await fetch(`/api/agregarProd?${query.toString()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        const products: Product[] =
          result.success && Array.isArray(result.data) ? result.data : [];
        const nextVariants = buildProductVariants(products, currentProduct, linea);

        setVariants(nextVariants);
        setSelectedVariantId(getInitialVariantId(nextVariants, currentProduct));
      } catch (error) {
        console.error("Error fetching variants:", error);
        setVariants([]);
      } finally {
        setIsLoadingVariants(false);
      }
    },
    []
  );

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      setProduct(null);
      setVariants([]);
      setSelectedVariantId(null);

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

        const esIndividual =
          esProductoIndividual(productData) ||
          esCategoriaNoAgrupable(productData);
        console.log("🔍 ¿Es producto individual?", esIndividual);

        const tieneAtributosSuficientes = tieneAlMenosDosAtributos(productData);

        if (productData.familyId != null || (!esIndividual && tieneAtributosSuficientes)) {
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

          await fetchVariants(
            productData.category,
            marca,
            linea,
            productData
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

  const esIndividual =
    esProductoIndividual(product) || esCategoriaNoAgrupable(product);
  const puedeMostrarAromas = product.familyId != null || (!esIndividual && tieneAlMenosDosAtributos(product));
  const lineaDisplay =
    typeof lineaSeleccionada === "string"
      ? lineaSeleccionada
      : safeString(product.linea);

  const getProductPrice = (): number => {
    return parsePrice(product.price);
  };

  const productPrice = getProductPrice();
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ||
    variants.find((variant) => variant.aroma === safeString(product.aroma)) ||
    variants[0];
  const displayedName = selectedVariant?.productName || product.name;
  const displayedTitle = buildCatalogProductTitle(
    product.category,
    marcaSeleccionada || safeString(product.marca),
    lineaDisplay,
    displayedName
  );
  const displayedDescription = selectedVariant?.description || product.description;
  const displayedImage = selectedVariant?.image || product.image || undefined;
  const displayedPrice = selectedVariant?.price ?? productPrice;
  const displayedStock = selectedVariant?.stock ?? product.stock;
  const selectedSize = selectedVariant ? selectedVariant.tamaño : safeString(product.tamaño);
  const selectedQuantity = selectedVariant ? selectedVariant.cantidad : safeString(product.cantidad);
  const selectedColor = selectedVariant ? selectedVariant.color : safeString(product.color);
  const selectedType = selectedVariant ? selectedVariant.tipo : safeString(product.tipo);
  const selectedStone = selectedVariant ? selectedVariant.piedra : safeString(product.piedra);

  return (
    <div className="bg-white rounded-lg p-4 mb-8 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <ProductImage
              src={displayedImage}
              alt={displayedName}
              width={500}
              height={500}
              className="w-full h-full object-contain"
              fallbackLabel={`${displayedName}: imagen no disponible`}
            />
          </div>
        </div>

        {/* Detalles del producto */}
        <div className="space-y-6">
          <div>
            <span className="inline-block bg-babalu-action text-white text-sm px-3 py-1 rounded-full mb-3">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:text-3xl">
              {displayedTitle}
              {puedeMostrarAromas && variants.length > 0 && (
                <span className="text-lg text-gray-600 font-normal ml-2">
                  ({variants.length} variantes
                  {lineaDisplay ? ` en línea ${lineaDisplay}` : ""})
                </span>
              )}
            </h1>
            {product.familyName && !sameCatalogText(product.familyName, lineaDisplay) && (
              <p className="mb-3 text-sm text-gray-500">Modelo: {product.familyName}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>
                Marca: {marcaSeleccionada || safeString(product.marca) || "N/A"}
              </span>
              {lineaDisplay && <span>Línea: {lineaDisplay}</span>}
              {(selectedVariant?.name || safeString(product.aroma)) && (
                <span aria-live="polite">
                  Variante: {selectedVariant?.name || safeString(product.aroma)}
                </span>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              {displayedDescription}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xl font-bold text-babalu-action">
                {formatPrice(displayedPrice)}
              </span>
              <span className={`text-sm font-medium ${displayedStock > 0 ? "text-green-700" : "text-gray-600"}`}>
                {displayedStock > 0 ? "Disponible" : "Agotado"}
              </span>
            </div>
          </div>

          {/* CARACTERÍSTICAS DEL PRODUCTO INDIVIDUAL */}
          {esIndividual && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                Características:
              </h3>
              <div className="space-y-1 text-xs">
                {selectedSize !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Tamaño:
                    </span>
                    <span className="font-medium text-gray-800 capitalize">
                      {selectedSize
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                )}
                {selectedQuantity !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Cantidad:
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedQuantity}
                    </span>
                  </div>
                )}
                {selectedColor !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Color:
                    </span>
                    <span className="font-medium text-gray-800 capitalize">
                      {selectedColor
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                )}
                {selectedType !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Tipo:
                    </span>
                    <span className="font-medium text-gray-800 capitalize">
                      {selectedType
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                )}
                {selectedStone !== "" && (
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[60px]">
                      Piedra:
                    </span>
                    <span className="font-medium text-gray-800 capitalize">
                      {selectedStone
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selector de variantes */}
          {puedeMostrarAromas && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                  {lineaDisplay
                    ? `Variantes de la línea ${lineaDisplay}:`
                    : "Variantes disponibles:"}
                </h3>
                {isLoadingVariants && (
                  <Loader2 className="w-3 h-3 animate-spin text-babalu-primary" />
                )}
              </div>

              {variants.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Seleccionar variante">
                  {variants.map((variant: ProductVariant) => (
                    <button
                      key={variant.id}
                      type="button"
                      aria-pressed={selectedVariant?.id === variant.id}
                      aria-label={`${variant.name}, ${formatPrice(variant.price)}, ${variant.stock > 0 ? `${variant.stock} disponibles` : "agotado"}`}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`flex min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-babalu-action focus-visible:ring-offset-2 ${selectedVariant?.id === variant.id ? "border-babalu-action bg-babalu-action/5 ring-1 ring-babalu-action" : "border-gray-200 bg-gray-50 hover:border-gray-400"}`}
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                          <ProductImage
                            src={variant.image}
                            alt={variant.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                            fallbackLabel={`${variant.name}: imagen no disponible`}
                          />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">
                          {variant.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                          <span className="font-bold text-babalu-action">
                            {formatPrice(variant.price)}
                          </span>
                          <span className={variant.stock > 0 ? "text-green-700" : "text-gray-600"}>
                            {variant.stock > 0 ? `${variant.stock} disponibles` : "Agotado"}
                          </span>
                          {variant.linea && !lineaDisplay && (
                            <span className="text-gray-500">
                              Línea {variant.linea}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
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
                className="text-babalu-action hover:text-babalu-dark text-sm underline underline-offset-4"
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
              Volver al catálogo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
