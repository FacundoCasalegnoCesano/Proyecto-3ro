// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "lib/prisma"
import { verifyAdminRole } from "lib/auth-utils"

// Obtener todos los usuarios (solo admin)
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/users called")
    
    const adminCheck = await verifyAdminRole(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        fechaNac: true,
        calle: true,
        ciudad: true,
        provincia: true,
        codigoPostal: true,
        pais: true,
        rol: true,
      }
    })

    return NextResponse.json({ 
      success: true,
      users: users
    })
    
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Actualizar rol de usuario (solo admin)
export async function PATCH(request: NextRequest) {
  try {
    console.log("PATCH /api/admin/users called")
    
    const adminCheck = await verifyAdminRole(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const body = await request.json()
    const { userId, newRole } = body

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "userId y newRole son requeridos" },
        { status: 400 }
      )
    }

    const validRoles = ['user', 'admin']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: "Rol inválido. Debe ser 'user' o 'admin'" },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { rol: newRole },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "Rol actualizado correctamente",
      user: updatedUser
    })
    
  } catch (error: any) {
    console.error("Error updating user role:", error)
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}