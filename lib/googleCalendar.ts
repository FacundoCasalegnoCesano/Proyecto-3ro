// lib/googleCalendar.ts
import { google, calendar_v3 } from "googleapis";

export function getGoogleCalendarClient(): calendar_v3.Calendar {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!privateKey || !process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error(
        "Missing Google Calendar credentials: GOOGLE_PRIVATE_KEY or GOOGLE_CLIENT_EMAIL"
      );
    }

    if (!process.env.GOOGLE_CALENDAR_ID) {
      throw new Error("Missing GOOGLE_CALENDAR_ID");
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    console.log("✅ Cliente de Google Calendar creado");
    return google.calendar({ version: "v3", auth });
  } catch (error) {
    console.error("❌ Error creating Google Calendar client:", error);
    throw new Error(
      `Error creating Google Calendar client: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Función para verificar la conexión
export async function testCalendarConnection(): Promise<boolean> {
  try {
    const calendar = getGoogleCalendarClient();

    const response = await calendar.calendars.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
    });

    console.log("✅ Calendario accesible:", response.data.summary);
    return true;
  } catch (error) {
    console.error("❌ Error conectando al calendario:", error);

    const err = error as {
      code?: string | number;
      response?: { status?: number };
    };

    if (err.code === 404 || err.code === "404") {
      console.error(
        "📝 Calendario no encontrado. Verifica el GOOGLE_CALENDAR_ID"
      );
    } else if (err.code === 403 || err.code === "403") {
      console.error("📝 Sin permisos para acceder al calendario");
    } else if (err.response?.status === 401) {
      console.error("📝 Error de autenticación. Verifica las credenciales");
    }

    return false;
  }
}

// NUEVA FUNCIÓN: Verificar disponibilidad de horario
export async function checkTimeSlotAvailability(
  startDateTime: Date,
  endDateTime: Date
): Promise<{
  available: boolean;
  conflictingEvents?: calendar_v3.Schema$Event[];
}> {
  try {
    const calendar = getGoogleCalendarClient();

    console.log(
      `🔍 Verificando disponibilidad: ${startDateTime.toISOString()} - ${endDateTime.toISOString()}`
    );

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    // Filtrar eventos que se solapan con el horario solicitado
    const conflictingEvents = events.filter((event) => {
      const eventStart = new Date(
        event.start?.dateTime || event.start?.date || ""
      );
      const eventEnd = new Date(event.end?.dateTime || event.end?.date || "");

      // Verificar si hay solapamiento
      return (
        startDateTime < eventEnd &&
        endDateTime > eventStart &&
        event.status !== "cancelled" // Ignorar eventos cancelados
      );
    });

    const available = conflictingEvents.length === 0;

    console.log(
      `📊 Resultado disponibilidad: ${available ? "DISPONIBLE" : "OCUPADO"}`
    );
    console.log(`📈 Eventos conflictivos: ${conflictingEvents.length}`);

    return {
      available,
      conflictingEvents: available ? undefined : conflictingEvents,
    };
  } catch (error) {
    console.error("❌ Error verificando disponibilidad:", error);
    throw new Error(
      `Error verificando disponibilidad: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// NUEVA FUNCIÓN: Obtener horarios disponibles para una fecha específica
export async function getAvailableTimeSlots(date: string): Promise<string[]> {
  try {
    const calendar = getGoogleCalendarClient();
    const horariosDisponibles = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];

    // Obtener eventos del día
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    // Obtener horarios ocupados
    const occupiedSlots = new Set<string>();

    events.forEach((event) => {
      if (event.status === "cancelled") return;

      const eventStart = new Date(
        event.start?.dateTime || event.start?.date || ""
      );
      // ✅ Remover eventEnd ya que no se usa
      // const eventEnd = new Date(event.end?.dateTime || event.end?.date || '');

      // Convertir a hora local Argentina
      const startHour = eventStart.getHours().toString().padStart(2, "0");
      const startMinute = eventStart.getMinutes().toString().padStart(2, "0");
      const timeSlot = `${startHour}:${startMinute}`;

      occupiedSlots.add(timeSlot);
    });

    console.log(
      `📅 Horarios ocupados para ${date}:`,
      Array.from(occupiedSlots)
    );

    // Filtrar horarios disponibles
    const availableSlots = horariosDisponibles.filter(
      (slot) => !occupiedSlots.has(slot)
    );

    console.log(`✅ Horarios disponibles para ${date}:`, availableSlots);

    return availableSlots;
  } catch (error) {
    console.error("❌ Error obteniendo horarios disponibles:", error);
    // En caso de error, retornar todos los horarios como disponibles
    return [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];
  }
}
