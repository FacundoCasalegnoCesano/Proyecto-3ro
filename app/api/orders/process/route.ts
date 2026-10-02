import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "La generación de pedidos está deshabilitada en este catálogo.",
    },
    { status: 410 }
  );
}
