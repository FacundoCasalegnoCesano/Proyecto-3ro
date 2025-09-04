// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUser } from "../../../lib/auth-helpers"; 

export async function POST(request: NextRequest) {
  console.log("API de registro llamada");
  
  try {
    const body = await request.json();
    console.log("Datos recibidos:", body);

    const { nombre, apellido, email, password, fechaNac } = body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !password || !fechaNac) {
      console.log("Faltan campos requeridos");
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de email
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    console.log("Intentando crear usuario...");
    
    // Crear usuario
    const user = await createUser({
      nombre,
      apellido,
      email,
      password,
      fechaNac: new Date(fechaNac),
    });

    console.log("Usuario creado exitosamente:", user);

    return NextResponse.json(
      { 
        message: "Usuario creado exitosamente", 
        user 
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error("Error en API register:", error);
    
    // Manejar errores específicos de Prisma
    if (error.message.includes("ya existe")) {
      return NextResponse.json(
        { error: "El usuario ya existe con este email" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Agregar para preflight requests (CORS)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}