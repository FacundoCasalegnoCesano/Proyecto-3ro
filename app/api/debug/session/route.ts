// app/api/debug/session/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "auth.config";
import { NextResponse } from "next/server";

// Fuerza que esta route sea dinámica
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Debug endpoint called - checking session...");
    console.log("Environment variables check:", {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
    });

    const session = await getServerSession(authOptions);
    console.log("Session retrieved:", {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.nombre,
      userLastName: session?.user?.apellido,
    });

    return NextResponse.json({
      success: true,
      session: session,
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.nombre,
      userLastName: session?.user?.apellido,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      // No mostrar el secret real por seguridad, solo confirmar que existe
      secretPreview: process.env.NEXTAUTH_SECRET
        ? `${process.env.NEXTAUTH_SECRET.substring(0, 4)}...`
        : "NOT_SET",
    });
  } catch (error) {
    console.error("Error in debug session endpoint:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "UnknownError";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: errorStack,
        type: errorName,
      },
      { status: 500 }
    );
  }
}
