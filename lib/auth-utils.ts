// lib/auth-utils.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "auth.config";
import { prisma } from "lib/prisma";

export const dynamic = "force-dynamic";

export async function verifyAdminRole() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        isAdmin: false,
        error: "No hay sesión activa",
        status: 401,
      };
    }

    const userId = session.user.id;

    if (!Number.isInteger(userId) || userId <= 0) {
      return {
        isAdmin: false,
        error: "No hay sesión activa",
        status: 401,
      };
    }

    // Verificar si el usuario existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rol: true },
    });

    if (!user || user.rol !== "admin") {
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
  } catch {
    console.error("Error verificando rol de admin");
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
  } catch {
    console.error("Error verificando autenticación");
    return {
      isAuthenticated: false,
      error: "Error interno del servidor",
      status: 500,
    };
  }
}
