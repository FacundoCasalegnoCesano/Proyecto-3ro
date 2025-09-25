import { google, calendar_v3 } from "googleapis";

export function getGoogleCalendarClient(): calendar_v3.Calendar {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    
    if (!privateKey || !process.env.GOOGLE_CLIENT_EMAIL) {
      throw new Error("Missing Google Calendar credentials");
    }

    // ✅ Corrección: Usar la nueva sintaxis del constructor JWT
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    return google.calendar({ version: "v3", auth });
  } catch (error) {
    console.error("Error creating Google Calendar client:", error);
    throw error;
  }
}