// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUser } from "../../../lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { nombre, apellido, email, password, fechaNac } = body;

    if (!nombre || !apellido || !email || !password || !fechaNac) {
      console.log("Faltan campos requeridos");
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    const user = await createUser({
      nombre,
      apellido,
      email,
      password,
      fechaNac: new Date(fechaNac),
    });

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor";

    // Verificar si el error indica que el usuario ya existe
    if (errorMessage.includes("ya existe")) {
      return NextResponse.json(
        { error: "El usuario ya existe con este email" },
        { status: 409 }
      );
    }

    const errorRecord =
      typeof error === "object" && error !== null
        ? (error as Record<string, unknown>)
        : null;
    const allowedErrorNames = new Set([
      "Error",
      "SyntaxError",
      "PrismaClientKnownRequestError",
      "PrismaClientUnknownRequestError",
      "PrismaClientRustPanicError",
      "PrismaClientInitializationError",
      "PrismaClientValidationError",
    ]);
    const safeErrorName =
      error instanceof Error && allowedErrorNames.has(error.name)
        ? error.name
        : "Unknown";
    const safePrismaCode =
      typeof errorRecord?.code === "string" && /^P\d{4}$/.test(errorRecord.code)
        ? errorRecord.code
        : undefined;
    const safePrismaErrorCode =
      typeof errorRecord?.errorCode === "string" && /^P\d{4}$/.test(errorRecord.errorCode)
        ? errorRecord.errorCode
        : undefined;
    const failureKind = /query engine|libssl/i.test(errorMessage)
      ? "PRISMA_ENGINE"
      : undefined;
    console.error("Error en API register", {
      name: safeErrorName,
      prismaCode: safePrismaCode,
      prismaErrorCode: safePrismaErrorCode,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      failureKind,
      nodeVersion: failureKind ? process.version : undefined,
    });

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
