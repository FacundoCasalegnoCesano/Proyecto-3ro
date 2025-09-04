// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUser } from "lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const { nombre, apellido, email, password, fechaNac } = await request.json();

    // Validaciones básicas
    if (!nombre || !apellido || !email || !password || !fechaNac) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Crear usuario
    const user = await createUser({
      nombre,
      apellido,
      email,
      password,
      fechaNac: new Date(fechaNac),
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente", user },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}