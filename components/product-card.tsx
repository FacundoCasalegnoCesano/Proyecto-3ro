"use client";

import Image from "next/image";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../contexts/cart-context";
import { Product } from "app/types/product";
import { useRouter } from "next/navigation";
import { parsePrice, formatPrice } from "../utils/price-utils";

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
  const { addItem } = useCart();
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
  const handleAddToCart = () => {
    // Permitir agregar al carrito si NO es un producto agrupado O si es un producto individual
    if (esProductoAgrupado && !esProductoIndividualActualizado(product)) return;

    // Usar la función parsePrice para convertir de forma segura
    const priceNumber = parsePrice(product.price);

    console.log("Agregando al carrito:", {
      id: product.id,
      name: product.name,
      price: priceNumber,
      priceOriginal: product.price,
    });

    // Solo agregar si el precio es válido
    if (priceNumber > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: priceNumber,
        quantity: 1,
        image: product.image || product.src || "/placeholder.svg",
        stockIndividual: 0,
      });
    }
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
  const getProductImage = (): string => {
    if (product.image && typeof product.image === "string")
      return product.image;
    if (product.src && typeof product.src === "string") return product.src;
    return "/placeholder.svg?height=200&width=200";
  };

  // Función para obtener el precio formateado para display
  const getFormattedPrice = (): string => {
    if (!product.price) return "";

    // Si ya está formateado como "$1.000,00", usarlo directamente
    if (typeof product.price === "string" && product.price.includes("$")) {
      return product.price;
    }

    // Si es un número o string numérico, formatearlo
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
  const groupInfo = getGroupInfo();
  const esIndividual = esProductoIndividualActualizado(product);

  // Función para limpiar y capitalizar el nombre del producto
  const limpiarYCapitalizarNombre = (nombre: string | undefined): string => {
    if (!nombre || typeof nombre !== "string") return "Producto sin nombre";

    const nombreLimpio = nombre.replace(/\s*-\s*sin\s*$/i, "").trim();
    return capitalizarPalabras(nombreLimpio);
  };

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
            {formattedPrice && (!esProductoAgrupado || esIndividual) && (
              <p className="text-xl font-bold text-babalu-primary">
                {formattedPrice}
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
                {groupInfo.aromas && groupInfo.aromas > 0 && (
                  <p>
                    {groupInfo.aromas} aroma{groupInfo.aromas > 1 ? "s" : ""}{" "}
                    disponible{groupInfo.aromas > 1 ? "s" : ""}
                  </p>
                )}
                {(!groupInfo.aromas || groupInfo.aromas === 0) && (
                  <p>Haz clic para ver detalles</p>
                )}
              </div>
            )}
          </div>

          {/* Botón de agregar al carrito - Para productos NO agrupados o productos individuales */}
          {!esProductoAgrupado || esIndividual ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
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
  );
}
