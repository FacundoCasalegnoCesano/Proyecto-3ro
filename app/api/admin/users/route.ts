import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log("✅ Admin users API - Minimal version working");
    
    return NextResponse.json({
      success: true,
      message: "Admin users API - Minimal version working",
      users: []
    });
  } catch (error) {
    console.error("❌ Error in minimal admin users API:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Simple error in minimal version" 
      },
      { status: 500 }
    );
  }
}