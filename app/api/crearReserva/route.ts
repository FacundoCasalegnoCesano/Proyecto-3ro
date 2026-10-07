import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    message: "API de Reservas - Babalu",
    version: "1.0.0",
    endpoints: {
      POST: "/api/crearReserva - Reservas en línea deshabilitadas",
    },
  });
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Las reservas en línea no están disponibles." },
    { status: 410 }
  );
}
