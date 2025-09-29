// app/api/products/specific/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const ids = request.nextUrl.searchParams
      .getAll("ids")
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No se proporcionaron IDs válidos",
        },
        { status: 400 }
      );
    }

    // Obtener productos específicos por IDs
    const products = await prisma.products.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        imgUrl: true,
        imgPublicId: true,
        category: true,
        empresaEnvios: true,
        Linea: true,
        marca: true,
        aroma: true,
        tamaño: true,
        cantidad: true,
        color: true,
        tipo: true,
        tipoPiedra: true,
        stock: true,
      },
    });

    // CORRECCIÓN: Mantener los valores originales como strings, no convertirlos a booleanos
    const normalizedProducts = products.map((product) => ({
      id: product.id,
      name: product.nombre,
      price: formatPrice(product.precio),
      image: product.imgUrl || "/placeholder.jpg",
      category: product.category || "General",
      shipping: getShippingText(product.empresaEnvios),
      src: product.imgUrl || "/placeholder.jpg",
      description: product.descripcion || "",
      // CORREGIDO: Mantener como strings, no convertir a booleanos
      tamaño: product.tamaño || "", // ← Mantener string
      cantidad: product.cantidad || "", // ← Mantener string
      color: product.color || "", // ← Mantener string
      tipo: product.tipo || "", // ← Mantener string
      piedra: product.tipoPiedra || "", // ← Mantener string
      linea: product.Linea || "",
      metadata: {},
      marca: product.marca || "",
      stock: Number(product.stock || 0),
      aroma: product.aroma || null,
    }));

    return NextResponse.json({
      success: true,
      products: normalizedProducts,
    });
  } catch (error) {
    console.error("Error fetching specific products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

function formatPrice(price: unknown): string {
  if (typeof price === "string") {
    if (price.includes("$")) return price;
    return `$${price}`;
  }

  if (typeof price === "number") {
    return `$${price.toFixed(2)}`;
  }

  return "$0.00";
}

function getShippingText(empresaEnvios: number): string {
  switch (empresaEnvios) {
    case 1:
      return "Envío Gratis";
    case 2:
      return "Envío Express";
    case 3:
      return "Envío Estándar";
    default:
      return "Envío Gratis";
  }
}
