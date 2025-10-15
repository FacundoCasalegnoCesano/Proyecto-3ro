import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import { getServerSession } from "next-auth";

// Obtener el ID único del usuario (sesión o usuario autenticado)
const getCartIdentifier = async (request: NextRequest) => {
  // Para usuarios autenticados
  const session = await getServerSession();
  if (session?.user?.email) {
    return { type: "user", identifier: session.user.email };
  }

  // Para usuarios no autenticados, usar session_id de cookies
  const sessionId = request.cookies.get("session_id")?.value;
  if (sessionId) {
    return { type: "session", identifier: sessionId };
  }

  // Crear nueva session_id si no existe
  const newSessionId = Math.random().toString(36).substring(2);
  return { type: "session", identifier: newSessionId };
};

export async function GET(request: NextRequest) {
  try {
    const { type, identifier } = await getCartIdentifier(request);

    const cartItems = await prisma.cart.findMany({
      where:
        type === "user" ? { user_id: identifier } : { session_id: identifier },
      include: {
        product: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            imgUrl: true,
            stock: true,
          },
        },
      },
    });

    // Formatear los items para el frontend
    const formattedItems = cartItems.map((item) => ({
      id: item.product.id,
      name: item.product.nombre,
      price: parseFloat(item.product.precio),
      image: item.product.imgUrl,
      quantity: item.quantity,
      stock: item.product.stock,
    }));

    const response = NextResponse.json({
      success: true,
      data: formattedItems,
    });

    // Si es una nueva sesión, establecer la cookie
    if (type === "session") {
      response.cookies.set("session_id", identifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
      });
    }

    return response;
  } catch (error) {
    console.error("❌ Error al obtener carrito:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, identifier } = await getCartIdentifier(request);
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID es requerido" },
        { status: 400 }
      );
    }

    // Verificar si el producto existe
    const product = await prisma.products.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Buscar item existente en el carrito
    const existingItem = await prisma.cart.findFirst({
      where: {
        ...(type === "user"
          ? { user_id: identifier }
          : { session_id: identifier }),
        product_id: parseInt(productId),
      },
    });

    let cartItem;

    if (existingItem) {
      // Actualizar cantidad
      cartItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + parseInt(quantity),
        },
        include: {
          product: {
            select: {
              id: true,
              nombre: true,
              precio: true,
              imgUrl: true,
              stock: true,
            },
          },
        },
      });
    } else {
      // Crear nuevo item
      cartItem = await prisma.cart.create({
        data: {
          ...(type === "user"
            ? { user_id: identifier }
            : { session_id: identifier }),
          product_id: parseInt(productId),
          quantity: parseInt(quantity),
        },
        include: {
          product: {
            select: {
              id: true,
              nombre: true,
              precio: true,
              imgUrl: true,
              stock: true,
            },
          },
        },
      });
    }

    const formattedItem = {
      id: cartItem.product.id,
      name: cartItem.product.nombre,
      price: parseFloat(cartItem.product.precio),
      image: cartItem.product.imgUrl,
      quantity: cartItem.quantity,
      stock: cartItem.product.stock,
    };

    const response = NextResponse.json({
      success: true,
      data: formattedItem,
    });

    // Establecer cookie si es nueva sesión
    if (type === "session") {
      response.cookies.set("session_id", identifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    console.error("❌ Error al agregar al carrito:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { type, identifier } = await getCartIdentifier(request);
    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: "Product ID y quantity son requeridos" },
        { status: 400 }
      );
    }

    // Buscar item existente
    const existingItem = await prisma.cart.findFirst({
      where: {
        ...(type === "user"
          ? { user_id: identifier }
          : { session_id: identifier }),
        product_id: parseInt(productId),
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Item no encontrado en el carrito" },
        { status: 404 }
      );
    }

    if (parseInt(quantity) <= 0) {
      // Eliminar item si la cantidad es 0 o menor
      await prisma.cart.delete({
        where: { id: existingItem.id },
      });

      return NextResponse.json({
        success: true,
        data: null,
        message: "Item eliminado del carrito",
      });
    }

    // Actualizar cantidad
    const updatedItem = await prisma.cart.update({
      where: { id: existingItem.id },
      data: { quantity: parseInt(quantity) },
      include: {
        product: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            imgUrl: true,
            stock: true,
          },
        },
      },
    });

    const formattedItem = {
      id: updatedItem.product.id,
      name: updatedItem.product.nombre,
      price: parseFloat(updatedItem.product.precio),
      image: updatedItem.product.imgUrl,
      quantity: updatedItem.quantity,
      stock: updatedItem.product.stock,
    };

    return NextResponse.json({
      success: true,
      data: formattedItem,
    });
  } catch (error) {
    console.error("❌ Error al actualizar carrito:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { type, identifier } = await getCartIdentifier(request);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID es requerido" },
        { status: 400 }
      );
    }

    // Buscar item existente
    const existingItem = await prisma.cart.findFirst({
      where: {
        ...(type === "user"
          ? { user_id: identifier }
          : { session_id: identifier }),
        product_id: parseInt(productId),
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Item no encontrado en el carrito" },
        { status: 404 }
      );
    }

    await prisma.cart.delete({
      where: { id: existingItem.id },
    });

    return NextResponse.json({
      success: true,
      message: "Item eliminado del carrito",
    });
  } catch (error) {
    console.error("❌ Error al eliminar del carrito:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
