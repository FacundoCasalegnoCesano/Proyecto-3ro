// app/api/check-availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkTimeSlotAvailability, getAvailableTimeSlots } from "../../../lib/googleCalendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fecha, hora, servicioId } = body;

    if (!fecha || !hora || !servicioId) {
      return NextResponse.json(
        {
          success: false,
          error: "Fecha, hora y servicio son requeridos",
        },
        { status: 400 }
      );
    }

    // Calcular duración basada en el servicio
    const durationMinutes = getDurationByService(servicioId);
    const startDateTime = new Date(`${fecha}T${hora}:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    // Verificar disponibilidad
    const availability = await checkTimeSlotAvailability(startDateTime, endDateTime);

    return NextResponse.json({
      success: true,
      available: availability.available,
      conflictingEvents: availability.conflictingEvents?.map(event => ({
        summary: event.summary,
        start: event.start,
        end: event.end
      }))
    });

  } catch (error) {
    console.error("❌ Error verificando disponibilidad:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Error verificando disponibilidad",
        available: false // Por seguridad, asumir no disponible en caso de error
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');

    if (!fecha) {
      return NextResponse.json(
        {
          success: false,
          error: "Fecha es requerida",
        },
        { status: 400 }
      );
    }

    const availableSlots = await getAvailableTimeSlots(fecha);

    return NextResponse.json({
      success: true,
      fecha,
      availableSlots
    });

  } catch (error) {
    console.error("❌ Error obteniendo horarios disponibles:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Error obteniendo horarios disponibles",
        availableSlots: [] // Retornar array vacío en caso de error
      },
      { status: 500 }
    );
  }
}

// Helper function para obtener duración por servicio
function getDurationByService(servicioId: string): number {
  const durations: { [key: string]: number } = {
    "tarot": 60,
    "reiki": 90,
    "limpieza-energetica": 45,
    "limpieza-espacios": 150,
    "pendulo-hebreo": 90,
    "tarot-africano": 90
  };

  return durations[servicioId] || 60; // Default 60 minutos
}