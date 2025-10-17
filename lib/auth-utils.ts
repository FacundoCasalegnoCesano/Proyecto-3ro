// lib/auth-utils.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "auth.config";
import { prisma } from "lib/prisma";

export const dynamic = "force-dynamic";

export async function verifyAdminRole() {
  try {
    const session = await getServerSession(authOptions);

    console.log("verifyAdminRole - session:", session); // DEBUG

    if (!session || !session.user) {
      return {
        isAdmin: false,
        error: "No hay sesión activa",
        status: 401,
      };
    }

    // ✅ Usar session.user.id directamente (ya es number según tu configuración)
    const userId = session.user.id;

    console.log("verifyAdminRole - userId:", userId, "rol:", session.user.rol); // DEBUG

    // Verificar si el usuario existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rol: true },
    });

    if (!user) {
      return {
        isAdmin: false,
        error: "Usuario no encontrado",
        status: 404,
      };
    }

    console.log("verifyAdminRole - user from DB:", user); // DEBUG

    // ✅ Verificar rol tanto en la sesión como en la base de datos
    const isAdmin = user.rol === "admin" || session.user.rol === "admin";

    if (!isAdmin) {
      return {
        isAdmin: false,
        error: "Acceso denegado. Se requieren privilegios de administrador",
        status: 403,
      };
    }

    return {
      isAdmin: true,
      userId: userId,
    };
  } catch (error) {
    console.error("Error verificando rol de admin:", error);
    return {
      isAdmin: false,
      error: "Error interno del servidor",
      status: 500,
    };
  }
}

export async function requireAuth() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        isAuthenticated: false,
        error: "No hay sesión activa",
        status: 401,
      };
    }

    return {
      isAuthenticated: true,
      userId: session.user.id,
      session: session,
    };
  } catch (error) {
    console.error("Error verificando autenticación:", error);
    return {
      isAuthenticated: false,
      error: "Error interno del servidor",
      status: 500,
    };
  }
}
