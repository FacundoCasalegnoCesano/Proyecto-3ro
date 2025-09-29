// app/api/user/address/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import { requireAuth, verifyAdminRole } from "lib/auth-utils";

export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/user/address called");

    const auth = await requireAuth(); // ← Eliminado request
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Parsear el cuerpo de la solicitud
    const body = await request.json();
    console.log("Request body:", body);

    const { calle, ciudad, provincia, codigoPostal, pais, targetUserId } = body;

    let userId = auth.userId;

    // Si se especifica targetUserId, verificar que el usuario actual sea admin
    if (targetUserId && targetUserId !== userId) {
      const adminCheck = await verifyAdminRole(); // ← Eliminado request
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          { error: adminCheck.error },
          { status: adminCheck.status }
        );
      }
      userId = parseInt(targetUserId);
      if (isNaN(userId)) {
        return NextResponse.json(
          { error: "ID de usuario objetivo inválido" },
          { status: 400 }
        );
      }
    }

    // Validación de código postal
    if (codigoPostal) {
      let isValidPostalCode = false;
      switch (pais) {
        case "Argentina":
          isValidPostalCode = /^[0-9]{4}[A-Z]{0,3}$/i.test(
            codigoPostal.replace(/\s/g, "")
          );
          break;
        case "Chile":
          isValidPostalCode = /^[0-9]{7}$/.test(codigoPostal);
          break;
        case "Brasil":
          isValidPostalCode = /^[0-9]{5}-?[0-9]{3}$/.test(codigoPostal);
          break;
        case "Uruguay":
          isValidPostalCode = /^[0-9]{5}$/.test(codigoPostal);
          break;
        default:
          isValidPostalCode = /^\d{4,8}$/.test(codigoPostal);
      }

      if (!isValidPostalCode) {
        return NextResponse.json(
          { error: "Código postal inválido para el país seleccionado" },
          { status: 400 }
        );
      }
    }

    console.log("User ID to update:", userId);

    try {
      // Verificar que el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!existingUser) {
        console.log("Usuario no encontrado en la base de datos:", userId);
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      // Actualizar la dirección
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          calle: calle || null,
          ciudad: ciudad || null,
          provincia: provincia || null,
          codigoPostal: codigoPostal || null,
          pais: pais || "Argentina",
        },
        select: {
          id: true,
          calle: true,
          ciudad: true,
          provincia: true,
          codigoPostal: true,
          pais: true,
        },
      });

      console.log("User updated successfully:", updatedUser);

      return NextResponse.json({
        success: true,
        message: "Dirección actualizada correctamente",
        address: updatedUser,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);

      // Type assertion para errores de Prisma
      const prismaError = dbError as { code?: string };

      if (prismaError.code === "P2025") {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Error al actualizar en la base de datos" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/user/address called");

    const auth = await requireAuth(); // ← Eliminado request
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    let userId = auth.userId;

    // Si se especifica userId en query params, verificar que el usuario actual sea admin
    if (targetUserId && parseInt(targetUserId) !== userId) {
      const adminCheck = await verifyAdminRole(); // ← Eliminado request
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          { error: adminCheck.error },
          { status: adminCheck.status }
        );
      }
      userId = parseInt(targetUserId);
      if (isNaN(userId)) {
        return NextResponse.json(
          { error: "ID de usuario objetivo inválido" },
          { status: 400 }
        );
      }
    }

    console.log("User ID to fetch:", userId);

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          calle: true,
          ciudad: true,
          provincia: true,
          codigoPostal: true,
          pais: true,
        },
      });

      console.log("User address data:", user);

      if (!user) {
        console.log("Usuario no encontrado en la base de datos:", userId);
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        address: user,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Error al consultar la base de datos" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Método no permitido. Use PUT para actualizar o GET para obtener la dirección.",
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json({ error: "Método no permitido" }, { status: 405 });
}
