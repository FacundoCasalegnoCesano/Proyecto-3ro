import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, BrandContactStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'El campo status es requerido' },
        { status: 400 }
      )
    }

    // Validar que el status sea válido
    const validStatuses: BrandContactStatus[] = ["PENDING", "REVIEWED", "CONTACTED", "APPROVED", "REJECTED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const updatedContact = await prisma.brandContact.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({
      message: 'Estado actualizado correctamente',
      data: updatedContact
    })

  } catch (error) {
    console.error('Error actualizando estado:', error)

    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'Solicitud no encontrada' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const contact = await prisma.brandContact.findUnique({
      where: { id },
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: contact })

  } catch (error) {
    console.error('Error obteniendo solicitud:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}