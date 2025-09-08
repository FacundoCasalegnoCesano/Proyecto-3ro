// app/api/user/address/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "auth.config"
import { prisma } from "lib/prisma"

export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/user/address called")
    
    
    const session = await getServerSession(authOptions)
    console.log("Session in PUT:", {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session) {
      console.log("No hay sesión disponible")
      return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 })
    }
    
    if (!session.user?.id) {
      console.log("No hay ID de usuario en la sesión")
      return NextResponse.json({ error: "ID de usuario no encontrado en sesión" }, { status: 401 })
    }

    // Parsear el cuerpo de la solicitud
    const body = await request.json()
    console.log("Request body:", body)

    const { calle, ciudad, provincia, codigoPostal, pais } = body

    
    if (codigoPostal) {
      
      let isValidPostalCode = false
      switch (pais) {
        case "Argentina":
          isValidPostalCode = /^[0-9]{4}[A-Z]{0,3}$/i.test(codigoPostal.replace(/\s/g, ''))
          break
        case "Chile":
          isValidPostalCode = /^[0-9]{7}$/.test(codigoPostal)
          break
        case "Brasil":
          isValidPostalCode = /^[0-9]{5}-?[0-9]{3}$/.test(codigoPostal)
          break
        case "Uruguay":
          isValidPostalCode = /^[0-9]{5}$/.test(codigoPostal)
          break
        default:
          isValidPostalCode = /^\d{4,8}$/.test(codigoPostal)
      }
      
      if (!isValidPostalCode) {
        return NextResponse.json(
          { error: "Código postal inválido para el país seleccionado" },
          { status: 400 }
        )
      }
    }

    
    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      console.log("ID de usuario no es un número válido:", session.user.id)
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 })
    }

    console.log("User ID parsed:", userId)

    try {
      
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      })

      if (!existingUser) {
        console.log("Usuario no encontrado en la base de datos:", userId)
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      
      // @ts-ignore - Temporal hasta que Prisma reconozca los nuevos campos
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
        }
      })

      console.log("User updated successfully:", updatedUser)

      return NextResponse.json({ 
        success: true,
        message: "Dirección actualizada correctamente",
        address: updatedUser
      })
      
    } catch (dbError: any) {
      console.error("Database error:", dbError)
      
      if (dbError.code === "P2025") {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: "Error al actualizar en la base de datos" },
        { status: 500 }
      )
    }
    
  } catch (error: any) {
    console.error("Error updating address:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}


export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/user/address called")
    
    
    const session = await getServerSession(authOptions)
    console.log("Session in GET:", {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })
    
    if (!session) {
      console.log("No hay sesión disponible")
      return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 })
    }
    
    if (!session.user?.id) {
      console.log("No hay ID de usuario en la sesión")
      return NextResponse.json({ error: "ID de usuario no encontrado en sesión" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    if (isNaN(userId)) {
      console.log("ID de usuario no es un número válido:", session.user.id)
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 })
    }

    console.log("User ID parsed:", userId)

    try {
      // @ts-ignore - Temporal hasta que Prisma reconozca los nuevos campos
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          calle: true,
          ciudad: true,
          provincia: true,
          codigoPostal: true,
          pais: true,
        }
      })

      console.log("User address data:", user)

      if (!user) {
        console.log("Usuario no encontrado en la base de datos:", userId)
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ 
        success: true,
        address: user
      })
      
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { error: "Error al consultar la base de datos" },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}


export async function POST() {
  return NextResponse.json(
    { error: "Método no permitido. Use PUT para actualizar o GET para obtener la dirección." },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Método no permitido" },
    { status: 405 }
  )
}