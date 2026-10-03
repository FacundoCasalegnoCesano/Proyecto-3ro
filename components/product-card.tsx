"use client";

import { Card, CardContent } from "../components/ui/card";
import { ProductImage } from "./product-image";
import { Product } from "app/types/product";
import { useRouter } from "next/navigation";
import { parsePrice, formatPrice } from "../utils/price-utils";
import { buildCatalogFamilyTitle, sameCatalogText } from "../lib/product-variants";

// En product-card.tsx, reemplaza la interfaz ProductMetadata con:
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

interface ProductCardProps {
  product: Product & { metadata?: ProductMetadata };
  marcaSeleccionada?: string;
  lineaSeleccionada?: string;
  esProductoAgrupado?: boolean;
}

export function ProductCard({
  product,
  marcaSeleccionada,
  lineaSeleccionada,
  esProductoAgrupado = false,
}: ProductCardProps) {
  const router = useRouter();

  // Función para capitalizar la primera letra de cada palabra
  const capitalizarPalabras = (texto: string | undefined | null): string => {
    if (!texto || typeof texto !== "string") return "";
    return texto
      .toLowerCase()
      .split(" ")
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  };

  // Función auxiliar para convertir cualquier valor a string seguro
  const safeString = (value: string | boolean | undefined | null): string => {
    if (typeof value === "boolean") return value ? "true" : "false";
    if (!value || typeof value !== "string") return "";
    return value.trim();
  };

  // Función para verificar si tiene línea específica (siempre devuelve boolean)
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

  // Función para verificar si tiene marca específica (siempre devuelve boolean)
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

  // Función para verificar si un producto es individual (tiene pocas características pero es vendible)
  const esProductoIndividualActualizado = (product: Product): boolean => {
    // Si es una categoría no agrupable, siempre es individual
    if (esCategoriaNoAgrupable(product)) {
      return true;
    }

    // Lógica original para otros productos
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

    return (
      tieneCategoria && noTieneMarca && noTieneLinea && tieneCaracteristicas
    );
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
  const handleCardClick = () => {
    const params = new URLSearchParams();

    const marca =
      typeof marcaSeleccionada === "string" &&
      tieneMarcaEspecifica(marcaSeleccionada)
        ? marcaSeleccionada
        : tieneMarcaEspecifica(product.marca)
        ? safeString(product.marca)
        : "";

    const linea =
      typeof lineaSeleccionada === "string" &&
      tieneLineaEspecifica(lineaSeleccionada)
        ? lineaSeleccionada
        : tieneLineaEspecifica(product.linea)
        ? safeString(product.linea)
        : "";

    if (marca && marca.trim() !== "") {
      params.append("marca", marca.trim());
    }

    if (linea && linea.trim() !== "") {
      params.append("linea", linea.trim());
    }

    const queryString = params.toString();
    const url = `/productos/${product.id}${
      queryString ? `?${queryString}` : ""
    }`;

    router.push(url);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  // Función para formatear línea
  const formatearLinea = (linea: string): string => {
    return capitalizarPalabras(linea);
  };

  // Función para obtener el texto de línea de forma segura (solo si tiene línea específica)
  const getLineaText = (): string | undefined => {
    const linea =
      typeof lineaSeleccionada === "string"
        ? lineaSeleccionada
        : safeString(product.linea);

    if (linea && tieneLineaEspecifica(linea)) {
      return formatearLinea(linea);
    }
    return undefined;
  };

  // Función para obtener la imagen del producto
  const getProductImage = (): string | undefined => {
    if (product.image && typeof product.image === "string")
      return product.image;
    if (product.src && typeof product.src === "string") return product.src;
    return undefined;
  };

  // Función para obtener el precio formateado para display
  const getFormattedPrice = (): string => {
    if (!product.price) return "";

    const priceNumber = parsePrice(product.price);
    return formatPrice(priceNumber);
  };

  // Función para obtener información del grupo (solo para productos agrupados)
  const getGroupInfo = (): { variantes?: number; aromas?: number } => {
    if (!esProductoAgrupado || !product.metadata) return {};

    return {
      variantes: product.metadata.totalVariantes,
      aromas: product.metadata.totalAromas,
    };
  };

  const lineaText = getLineaText();
  const productImage = getProductImage();
  const formattedPrice = getFormattedPrice();
  const groupProducts = product.metadata?.grupoCompleto || [];
  const groupPrices = groupProducts.map((item) => parsePrice(item.price));
  const groupMinPrice = groupPrices.length ? Math.min(...groupPrices) : parsePrice(product.price);
  const hasDifferentGroupPrices = new Set(groupPrices).size > 1;
  const groupInfo = getGroupInfo();
  const aromaCount = groupInfo.aromas ?? 0;
  const esIndividual = esProductoIndividualActualizado(product);

  // Función para limpiar y capitalizar el nombre del producto
  const limpiarYCapitalizarNombre = (nombre: string | undefined): string => {
    if (!nombre || typeof nombre !== "string") return "Producto sin nombre";

    const nombreLimpio = nombre.replace(/\s*-\s*sin\s*$/i, "").trim();
    return capitalizarPalabras(nombreLimpio);
  };

  const nombreCapitalizado = limpiarYCapitalizarNombre(product.name);
  const categoryForTitle =
    safeString(product.category) || safeString(product.metadata?.category);
  const brandForTitle =
    safeString(marcaSeleccionada) ||
    safeString(product.marca) ||
    safeString(product.metadata?.marca);
  const lineForTitle =
    safeString(lineaSeleccionada) ||
    safeString(product.linea) ||
    safeString(product.metadata?.linea);
  const tituloPublico =
    buildCatalogFamilyTitle(categoryForTitle, brandForTitle, lineForTitle) ||
    nombreCapitalizado;

  return (
    <Card
      role="link"
      tabIndex={0}
      className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full"
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardContent className="p-4 h-full flex flex-col">
        <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
          <ProductImage
            src={productImage}
            alt={product.name || "Producto"}
            width={200}
            height={200}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            onClick={handleImageClick}
            fallbackLabel={`${product.name || "Producto"}: imagen no disponible`}
          />
        </div>
        <div className="space-y-2 flex-grow flex flex-col">
          <div className="flex-grow space-y-2">
            <h3 className="font-semibold text-gray-800 text-lg leading-tight">
              {tituloPublico}
            </h3>
            {product.familyName && !sameCatalogText(product.familyName, lineForTitle) && (
              <p className="text-xs text-gray-500">Modelo: {product.familyName}</p>
            )}

            {/* Mostrar precio para productos individuales o no agrupados */}
            {formattedPrice && !esProductoAgrupado && (
              <p className="text-xl font-bold text-babalu-primary">
                {formattedPrice}
              </p>
            )}
            {esProductoAgrupado && (
              <p className="text-xl font-bold text-babalu-primary">
                {hasDifferentGroupPrices
                  ? `Desde ${formatPrice(groupMinPrice)}`
                  : groupPrices.length > 0
                    ? formatPrice(groupMinPrice)
                    : formattedPrice}
              </p>
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
                {safeString(product.tamaño) !== "" && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Tamaño: {capitalizarPalabras(safeString(product.tamaño))}
                  </p>
                )}
                {safeString(product.cantidad) !== "" && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Cantidad: {safeString(product.cantidad)}
                  </p>
                )}
                {safeString(product.color) !== "" && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Color: {capitalizarPalabras(safeString(product.color))}
                  </p>
                )}
                {safeString(product.tipo) !== "" && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Tipo: {capitalizarPalabras(safeString(product.tipo))}
                  </p>
                )}
                {safeString(product.piedra) !== "" && (
                  <p className="bg-gray-100 px-2 py-1 rounded inline-block mr-1 mb-1">
                    Piedra: {capitalizarPalabras(safeString(product.piedra))}
                  </p>
                )}
              </div>
            )}

            {/* Mostrar información del grupo para productos agrupados */}
            {esProductoAgrupado && (
              <div className="text-xs text-blue-600 space-y-1">
                {groupInfo.variantes && groupInfo.variantes > 0 && (
                  <p>
                    {groupInfo.variantes} variante
                    {groupInfo.variantes > 1 ? "s" : ""}
                    {aromaCount > 0 && (
                      <>
                        {" · "}
                        {aromaCount} aroma
                        {aromaCount > 1 ? "s" : ""}
                      </>
                    )}
                  </p>
                )}
                {(!groupInfo.variantes || groupInfo.variantes === 0) && (
                  <p>Haz clic para ver detalles</p>
                )}
              </div>
            )}
          </div>

          {esProductoAgrupado && !esIndividual && (
            <div className="text-center py-2 mt-3 bg-gray-100 rounded text-sm text-gray-600">
              Haz clic para ver variantes disponibles
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
