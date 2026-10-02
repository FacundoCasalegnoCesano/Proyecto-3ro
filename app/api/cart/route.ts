import { NextResponse } from "next/server";

const unavailable = () =>
  NextResponse.json(
    { success: false, error: "El carrito no está disponible en este catálogo." },
    { status: 410 }
  );

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}

export async function PUT() {
  return unavailable();
}

export async function DELETE() {
  return unavailable();
}
