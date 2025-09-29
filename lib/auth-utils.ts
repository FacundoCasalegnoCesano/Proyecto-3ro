// lib/auth-utils.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "auth.config";
import { prisma } from "lib/prisma";

export async function verifyAdminRole() {
  // ← Eliminado request no utilizado
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return {
        isAdmin: false,
        error: "No hay sesión activa",
        status: 401,
      };
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return {
        isAdmin: false,
        error: "ID de usuario inválido",
        status: 400,
      };
    }

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

    if (user.rol !== "admin") {
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
  // ← Eliminado request no utilizado
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return {
        isAuthenticated: false,
        error: "No hay sesión activa",
        status: 401,
      };
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return {
        isAuthenticated: false,
        error: "ID de usuario inválido",
        status: 400,
      };
    }

    return {
      isAuthenticated: true,
      userId: userId,
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
