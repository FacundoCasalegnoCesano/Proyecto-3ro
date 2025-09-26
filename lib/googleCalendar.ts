// lib/googleCalendar.ts
import { google, calendar_v3 } from "googleapis";

export function getGoogleCalendarClient(): calendar_v3.Calendar {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    
    if (!privateKey || !process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error("Missing Google Calendar credentials: GOOGLE_PRIVATE_KEY or GOOGLE_CLIENT_EMAIL");
    }

    if (!process.env.GOOGLE_CALENDAR_ID) {
      throw new Error("Missing GOOGLE_CALENDAR_ID");
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    console.log('✅ Cliente de Google Calendar creado');
    return google.calendar({ version: "v3", auth });
  } catch (error) {
    console.error("❌ Error creating Google Calendar client:", error);
    throw new Error(`Error creating Google Calendar client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Función para verificar la conexión
export async function testCalendarConnection(): Promise<boolean> {
  try {
    const calendar = getGoogleCalendarClient();
    
    // Verificar que el calendario existe y es accesible
    const response = await calendar.calendars.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID!
    });
    
    console.log('✅ Calendario accesible:', response.data.summary);
    return true;
  } catch (error: any) {
    console.error('❌ Error conectando al calendario:', error);
    
    if (error.code === 404) {
      console.error('📝 Calendario no encontrado. Verifica el GOOGLE_CALENDAR_ID');
    } else if (error.code === 403) {
      console.error('📝 Sin permisos para acceder al calendario');
    }
    
    return false;
  }
}