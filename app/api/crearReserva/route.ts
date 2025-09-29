// app/api/crearReserva/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGoogleCalendarClient } from "../../../lib/googleCalendar";
import { PrismaClient, ReservaEstado } from "@prisma/client";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

interface ServicioData {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  description: string;
}

interface ReservaData {
  servicio: ServicioData;
  fecha: string;
  hora: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  mensaje?: string;
}

interface CreateReservaRequest {
  reservaData: ReservaData;
}

// Configuración del consultorio
const CONSULTORIO_INFO = {
  nombre: "Babalu - Centro de Sanación Espiritual",
  direccion: "Av. Ejemplo 1234, Piso 2, Dpto B",
  ciudad: "Buenos Aires",
  codigoPostal: "C1234ABC",
  pais: "Argentina",
  telefono: "+54 11 2345-6789",
  email: "contacto@babalu.com.ar",
  horarios: "Lunes a Viernes: 9:00 - 19:00 hs | Sábados: 9:00 - 15:00 hs",
  indicaciones: [
    "Llegar 5 minutos antes de la hora programada",
    "Traer documento de identidad",
    "Venir con ropa cómoda y mente abierta",
    "El espacio cuenta con estacionamiento gratuito",
  ],
};

// Datos de servicios disponibles
const SERVICIOS_DISPONIBLES: ServicioData[] = [
  {
    id: "tarot",
    title: "Lectura De Tarot",
    subtitle: "Tarot Rider-Waite",
    price: "$3500",
    duration: "60 minutos",
    description:
      "Consultas personalizadas de Tarot para guiar tu camino espiritual.",
  },
  {
    id: "reiki",
    title: "Sesión de Reiki Usui",
    subtitle: "Sanación Energética",
    price: "$4000",
    duration: "90 minutos",
    description:
      "Terapia de sanación energética para equilibrar los chakras y reducir el estrés.",
  },
  {
    id: "limpieza-energetica",
    title: "Limpieza Energética",
    subtitle: "Purificación del Aura",
    price: "$2800",
    duration: "45 minutos",
    description:
      "Ritual de limpieza energética personal para eliminar bloqueos y energías negativas.",
  },
  {
    id: "limpieza-espacios",
    title: "Limpieza de Espacios",
    subtitle: "Armonización del Hogar",
    price: "$5500",
    duration: "2-3 horas",
    description:
      "Limpieza energética completa de hogares, oficinas o locales comerciales.",
  },
  {
    id: "pendulo-hebreo",
    title: "Limpieza con Péndulo Hebreo",
    subtitle: "Liberación de Bloqueos",
    price: "$10000",
    duration: "1-2 horas",
    description:
      "Herramienta de radiestesia vibracional para diagnosticar y equilibrar el campo energético.",
  },
  {
    id: "tarot-africano",
    title: "Sesión de Tarot Africano",
    subtitle: "Sabiduría Ancestral",
    price: "$10000",
    duration: "1-2 horas",
    description:
      "Herramienta de autoconocimiento que conecta con la sabiduría ancestral africana.",
  },
];

function getDurationInMinutes(duration: string): number {
  if (duration.includes("60 minutos")) return 60;
  if (duration.includes("90 minutos")) return 90;
  if (duration.includes("45 minutos")) return 45;
  if (duration.includes("2-3 horas")) return 150;
  if (duration.includes("1-2 horas")) return 90;
  return 60;
}

function generateReservaId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `RSV-${timestamp}-${random}`.toUpperCase();
}

function formatearFecha(fecha: string): string {
  const date = new Date(fecha);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Configurar transportador de email con mejor logging
function createEmailTransporter() {
  console.log("🔧 Configurando transporter SMTP...");
  console.log("📧 SMTP_USER:", process.env.SMTP_USER);
  console.log(
    "🔑 SMTP_PASS:",
    process.env.SMTP_PASS
      ? "***" + process.env.SMTP_PASS.slice(-4)
      : "No configurado"
  );
  console.log("🏠 SMTP_HOST:", process.env.SMTP_HOST);
  console.log("🚪 SMTP_PORT:", process.env.SMTP_PORT);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials missing: SMTP_USER or SMTP_PASS");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Para evitar errores de certificado en desarrollo
    },
  });
}

// Generar HTML del email
function generateEmailHTML(
  reservaData: ReservaData,
  reservaId: string
): string {
  const fechaFormateada = formatearFecha(reservaData.fecha);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Información de tu Reserva - Babalu</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8B5DBA 0%, #6B46C1 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 30px 20px; }
        .reservation-info { background: #f8f9ff; border-left: 4px solid #8B5DBA; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .service-card { background: linear-gradient(135deg, #f8f9ff 0%, #f1f0ff 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e3ff; }
        .location-card { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bae6fd; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
        .info-item { display: flex; align-items: center; }
        .info-label { font-weight: 600; color: #4B5563; margin-right: 8px; min-width: 80px; }
        .info-value { color: #1F2937; }
        .highlight { color: #8B5DBA; font-weight: 600; }
        .instructions { background: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .instructions h3 { color: #92400e; margin-top: 0; }
        .instructions ul { margin: 10px 0; padding-left: 20px; }
        .instructions li { margin: 5px 0; color: #78350f; }
        .footer { background: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        .contact-info { display: flex; justify-content: center; gap: 30px; margin: 15px 0; flex-wrap: wrap; }
        .contact-item { display: flex; align-items: center; gap: 8px; color: #6b7280; }
        .divider { height: 1px; background: #e5e7eb; margin: 25px 0; }
        @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
            .contact-info { flex-direction: column; gap: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Tu Reserva Está Confirmada</h1>
            <p>Información completa de tu sesión espiritual</p>
        </div>
        
        <div class="content">
            <div class="reservation-info">
                <h2 style="margin-top: 0; color: #8B5DBA;">Detalles de tu Reserva</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">ID:</span>
                        <span class="info-value highlight">${reservaId}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cliente:</span>
                        <span class="info-value">${reservaData.nombre} ${
    reservaData.apellido
  }</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fecha:</span>
                        <span class="info-value highlight">${fechaFormateada}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Hora:</span>
                        <span class="info-value highlight">${
                          reservaData.hora
                        } hs</span>
                    </div>
                </div>
            </div>

            <div class="service-card">
                <h3 style="margin-top: 0; color: #8B5DBA;">${
                  reservaData.servicio.title
                }</h3>
                <p style="color: #8B5DBA; font-weight: 500; margin: 5px 0;">${
                  reservaData.servicio.subtitle
                }</p>
                <p style="margin: 10px 0; color: #4B5563;">${
                  reservaData.servicio.description
                }</p>
                <div class="info-grid" style="margin-top: 15px;">
                    <div class="info-item">
                        <span class="info-label">Precio:</span>
                        <span class="info-value highlight" style="font-size: 18px; font-weight: bold;">${
                          reservaData.servicio.price
                        }</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Duración:</span>
                        <span class="info-value">${
                          reservaData.servicio.duration
                        }</span>
                    </div>
                </div>
            </div>

            <div class="location-card">
                <h3 style="margin-top: 0; color: #0369a1;">Ubicación del Consultorio</h3>
                <div style="margin: 15px 0;">
                    <p style="font-weight: 600; color: #1e40af; margin: 5px 0;">${
                      CONSULTORIO_INFO.nombre
                    }</p>
                    <p style="margin: 5px 0; color: #4B5563;">${
                      CONSULTORIO_INFO.direccion
                    }</p>
                    <p style="margin: 5px 0; color: #4B5563;">${
                      CONSULTORIO_INFO.ciudad
                    }, ${CONSULTORIO_INFO.codigoPostal}</p>
                    <p style="margin: 5px 0; color: #4B5563;">${
                      CONSULTORIO_INFO.pais
                    }</p>
                </div>
                <div style="margin: 15px 0; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 6px;">
                    <p style="margin: 0; font-weight: 600; color: #1e40af;">Teléfono: ${
                      CONSULTORIO_INFO.telefono
                    }</p>
                    <p style="margin: 5px 0 0 0; color: #4B5563;">Horarios: ${
                      CONSULTORIO_INFO.horarios
                    }</p>
                </div>
            </div>

            ${
              reservaData.mensaje
                ? `
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">Tu Mensaje</h3>
                <p style="margin: 0; color: #4B5563; font-style: italic;">"${reservaData.mensaje}"</p>
            </div>
            `
                : ""
            }

            <div class="instructions">
                <h3>Indicaciones Importantes</h3>
                <ul>
                    ${CONSULTORIO_INFO.indicaciones
                      .map((indicacion) => `<li>${indicacion}</li>`)
                      .join("")}
                </ul>
                <p style="margin-top: 15px; color: #92400e; font-weight: 500;">
                    Si necesitas cancelar o reprogramar tu cita, por favor contáctanos con al menos 24 horas de anticipación.
                </p>
            </div>

            <div class="divider"></div>
            
            <div style="text-align: center; margin: 25px 0;">
                <h3 style="color: #8B5DBA; margin-bottom: 15px;">¿Tienes alguna pregunta?</h3>
                <p style="color: #6b7280; margin-bottom: 20px;">
                    Estamos aquí para ayudarte. No dudes en contactarnos si tienes alguna consulta.
                </p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="https://wa.me/5491123456789" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: 500;">
                        WhatsApp
                    </a>
                    <a href="tel:${
                      CONSULTORIO_INFO.telefono
                    }" style="background: #8B5DBA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: 500;">
                        Llamar
                    </a>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="contact-info">
                <div class="contact-item">
                    <span>${CONSULTORIO_INFO.email}</span>
                </div>
                <div class="contact-item">
                    <span>${CONSULTORIO_INFO.telefono}</span>
                </div>
                <div class="contact-item">
                    <span>${CONSULTORIO_INFO.ciudad}, ${
    CONSULTORIO_INFO.pais
  }</span>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #9ca3af; font-size: 14px; margin: 15px 0;">
                Gracias por confiar en nosotros para tu crecimiento espiritual.<br>
                Te esperamos con mucho amor y luz.
            </p>
            
            <p style="color: #d1d5db; font-size: 12px; margin: 10px 0;">
                Este email fue enviado automáticamente. Por favor no respondas a este mensaje.<br>
                Para consultas, utiliza nuestros canales de contacto oficiales.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Enviar email informativo con mejor manejo de errores
async function sendReservationEmail(
  reservaData: ReservaData,
  reservaId: string
): Promise<boolean> {
  try {
    console.log(`📧 Intentando enviar email a: ${reservaData.email}`);

    const transporter = createEmailTransporter();

    // Verificar conexión SMTP primero
    console.log("🔍 Verificando conexión SMTP...");
    await transporter.verify();
    console.log("✅ Conexión SMTP verificada");

    const mailOptions = {
      from: {
        name: CONSULTORIO_INFO.nombre,
        address: process.env.SMTP_USER!,
      },
      to: reservaData.email,
      subject: `Confirmación de Reserva ${reservaId} - ${reservaData.servicio.title}`,
      html: generateEmailHTML(reservaData, reservaId),
      text: `
Hola ${reservaData.nombre},

Tu reserva ha sido confirmada exitosamente.

DETALLES DE LA RESERVA:
- ID: ${reservaId}
- Servicio: ${reservaData.servicio.title}
- Fecha: ${formatearFecha(reservaData.fecha)}
- Hora: ${reservaData.hora} hs
- Duración: ${reservaData.servicio.duration}
- Precio: ${reservaData.servicio.price}

UBICACIÓN:
${CONSULTORIO_INFO.nombre}
${CONSULTORIO_INFO.direccion}
${CONSULTORIO_INFO.ciudad}, ${CONSULTORIO_INFO.pais}
Teléfono: ${CONSULTORIO_INFO.telefono}

INDICACIONES:
${CONSULTORIO_INFO.indicaciones.map((ind, i) => `${i + 1}. ${ind}`).join("\n")}

¿Preguntas? Contáctanos:
- WhatsApp: https://wa.me/5491123456789
- Teléfono: ${CONSULTORIO_INFO.telefono}
- Email: ${CONSULTORIO_INFO.email}

¡Te esperamos!
Equipo Babalu
      `,
    };

    console.log("🔄 Enviando email...");
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado exitosamente:", result.messageId);

    return true;
  } catch (error) {
    console.error("❌ Error enviando email:", error);

    // Log detallado del error SMTP
    if (error instanceof Error) {
      console.error("📝 Error message:", error.message);

      // Usar type assertion en lugar de any
      const smtpError = error as { responseCode?: number; command?: string };

      if (smtpError.responseCode !== undefined) {
        console.error("📞 Response code:", smtpError.responseCode);
      }
      if (smtpError.command) {
        console.error("⚡ Command:", smtpError.command);
      }
    }

    return false;
  }
}

function validateReservaData(reservaData: ReservaData): string | null {
  if (!reservaData.servicio?.id) return "Servicio no especificado";
  if (!reservaData.fecha) return "Fecha no especificada";
  if (!reservaData.hora) return "Hora no especificada";
  if (!reservaData.nombre?.trim()) return "Nombre requerido";
  if (!reservaData.apellido?.trim()) return "Apellido requerido";
  if (!reservaData.email?.trim()) return "Email requerido";
  if (!reservaData.telefono?.trim()) return "Teléfono requerido";

  const servicioExiste = SERVICIOS_DISPONIBLES.find(
    (s) => s.id === reservaData.servicio.id
  );
  if (!servicioExiste) return "Servicio no válido";

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(reservaData.email)) return "Email no válido";

  const fechaReserva = new Date(`${reservaData.fecha}T${reservaData.hora}`);
  if (fechaReserva <= new Date()) return "La fecha debe ser futura";

  return null;
}

// GET endpoint
export async function GET() {
  return NextResponse.json({
    message: "API de Reservas - Babalu",
    version: "1.0.0",
    endpoints: {
      POST: "/api/crearReserva - Crear nueva reserva",
    },
  });
}

// POST endpoint principal
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API /api/crearReserva llamada");

    // Verificar configuración primero
    if (!process.env.GOOGLE_CALENDAR_ID) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuración incompleta: GOOGLE_CALENDAR_ID no definido",
        },
        { status: 503 }
      );
    }

    console.log("📅 Calendar ID:", process.env.GOOGLE_CALENDAR_ID);

    // COMENTA TEMPORALMENTE la verificación de conexión para ver el error real
    // const calendarConnected = await testCalendarConnection();
    // if (!calendarConnected) {
    //   return NextResponse.json({
    //     success: false,
    //     error: "No se pudo conectar con el calendario. Verifica los permisos y configuración.",
    //     details: "Calendar connection failed"
    //   }, { status: 503 });
    // }

    console.log("🔍 Saltando verificación inicial para ver error real...");

    const body: CreateReservaRequest = await request.json();
    console.log("📦 Body recibido:", JSON.stringify(body, null, 2));

    const { reservaData } = body;

    if (!reservaData) {
      return NextResponse.json(
        {
          error: "Datos de reserva no proporcionados",
          success: false,
        },
        { status: 400 }
      );
    }

    // Validar datos de reserva
    const validationError = validateReservaData(reservaData);
    if (validationError) {
      return NextResponse.json(
        {
          error: validationError,
          success: false,
        },
        { status: 400 }
      );
    }

    // Crear fechas de inicio y fin del evento
    const startDateTime = new Date(
      `${reservaData.fecha}T${reservaData.hora}:00`
    );
    const durationMinutes = getDurationInMinutes(reservaData.servicio.duration);
    const endDateTime = new Date(
      startDateTime.getTime() + durationMinutes * 60000
    );

    const reservaId = generateReservaId();

    // 1. PRIMERO: Guardar en la base de datos con Prisma
    console.log(`💾 Guardando reserva ${reservaId} en la base de datos...`);

    let reservaDB;
    try {
      reservaDB = await prisma.reserva.create({
        data: {
          reservaId: reservaId,
          servicioId: reservaData.servicio.id,
          servicioNombre: reservaData.servicio.title,
          servicioPrecio: reservaData.servicio.price,
          servicioDuracion: reservaData.servicio.duration,
          fecha: startDateTime,
          hora: reservaData.hora,
          clienteNombre: reservaData.nombre.trim(),
          clienteApellido: reservaData.apellido.trim(),
          clienteEmail: reservaData.email.trim(),
          clienteTelefono: reservaData.telefono.trim(),
          mensaje: reservaData.mensaje?.trim() || null,
          estado: ReservaEstado.PENDIENTE,
          emailEnviado: false,
        },
      });
      console.log(
        "✅ Reserva guardada en la base de datos con ID:",
        reservaDB.id
      );
    } catch (dbError) {
      console.error("❌ Error guardando en la base de datos:", dbError);

      const errorMessage =
        dbError instanceof Error
          ? dbError.message
          : "Error desconocido en base de datos";

      throw new Error(`Error de base de datos: ${errorMessage}`);
    }

    // 2. Crear evento en Google Calendar (VERSIÓN CORREGIDA)
    console.log(
      `🔄 Creando evento en Google Calendar para reserva ${reservaId}...`
    );

    let eventId: string | undefined;
    let eventLink: string | undefined;
    let hangoutLink: string | undefined;

    try {
      const calendar = getGoogleCalendarClient();
      console.log("✅ Cliente de Google Calendar inicializado");

      const eventDescription = `
NUEVA RESERVA - ${reservaId}

CLIENTE:
• Nombre: ${reservaData.nombre} ${reservaData.apellido}
• Email: ${reservaData.email}
• Teléfono: ${reservaData.telefono}

SERVICIO:
• ${reservaData.servicio.title} (${reservaData.servicio.subtitle})
• Precio: ${reservaData.servicio.price}
• Duración: ${reservaData.servicio.duration}

ID de Reserva: ${reservaId}
`.trim();

      // ✅ EVENTO CORREGIDO - SIN ATTENDEES que causan error 403
      const event = {
        summary: `[Reserva] ${reservaData.servicio.title} - ${reservaData.nombre}`,
        description: eventDescription,
        location: `${CONSULTORIO_INFO.direccion}, ${CONSULTORIO_INFO.ciudad}, ${CONSULTORIO_INFO.pais}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: "America/Argentina/Buenos_Aires",
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: "America/Argentina/Buenos_Aires",
        },
        // ❌ REMOVIDO: attendees - causa error "forbiddenForServiceAccounts"
        // ✅ USAR: reminders por defecto en lugar de overrides complejos
        reminders: {
          useDefault: true, // Simplificado - usa la configuración por defecto del calendario
        },
      };

      console.log("📅 Creando evento en calendario...");
      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        requestBody: event,
        sendUpdates: "none",
      });

      eventId = response.data.id ? String(response.data.id) : undefined;
      eventLink = response.data.htmlLink || undefined;
      hangoutLink = response.data.hangoutLink || undefined;

      // Actualizar la reserva con la información de Google Calendar
      await prisma.reserva.update({
        where: { id: reservaDB.id },
        data: {
          googleEventId: eventId,
          googleCalendarLink: eventLink,
          estado: ReservaEstado.CONFIRMADA,
        },
      });

      console.log(`✅ Evento creado en Google Calendar - ID: ${eventId}`);
      console.log("🔗 Enlace del evento:", eventLink);
    } catch (calendarError) {
      console.error("❌ ERROR DETALLADO DE GOOGLE CALENDAR:");

      // Type assertion para el error de Google Calendar
      const gError = calendarError as {
        message?: string;
        code?: string | number;
        response?: {
          status?: number;
          statusText?: string;
          data?: unknown;
        };
      };

      console.error("=== MENSAJE ===");
      console.error(gError.message || "No message");

      console.error("=== CÓDIGO ===");
      console.error("Code:", gError.code || "No code");

      console.error("=== RESPONSE ===");
      if (gError.response) {
        console.error("Status:", gError.response.status || "No status");
        console.error(
          "Status Text:",
          gError.response.statusText || "No status text"
        );
        if (gError.response.data) {
          console.error("Data:", JSON.stringify(gError.response.data, null, 2));
        }
      }

      console.error("=== CONFIGURACIÓN ===");
      console.error("Calendar ID:", process.env.GOOGLE_CALENDAR_ID);

      console.log("⚠️ Continuando sin evento de calendario...");
    }

    // 3. Enviar email informativo al cliente
    console.log("📧 Procediendo a enviar email...");
    let emailSent = false;

    try {
      emailSent = await sendReservationEmail(reservaData, reservaId);

      // Actualizar estado del email en la base de datos
      if (emailSent) {
        await prisma.reserva.update({
          where: { id: reservaDB.id },
          data: { emailEnviado: true },
        });
        console.log("✅ Estado de email actualizado en la base de datos");
      }

      if (emailSent) {
        console.log(`✅ Email enviado exitosamente a ${reservaData.email}`);
      } else {
        console.log(
          `⚠️ Advertencia: No se pudo enviar el email a ${reservaData.email}`
        );
      }
    } catch (emailError) {
      console.error("❌ Error enviando email (no crítico):", emailError);
      // Email error is not critical, continue with the process
    }

    console.log(`🎉 Reserva ${reservaId} procesada exitosamente`);

    return NextResponse.json(
      {
        success: true,
        reservaId,
        eventId,
        eventLink,
        hangoutLink,
        emailSent,
        dbId: reservaDB.id,
        message: eventId
          ? "Reserva y evento creados exitosamente"
          : "Reserva creada (sin evento de calendario)",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error general procesando reserva:", error);

    let errorMessage = "Error interno del servidor";
    const statusCode = 500;

    if (error instanceof Error) {
      errorMessage = `Error al crear la reserva: ${error.message}`;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        details:
          process.env.NODE_ENV === "development"
            ? error?.toString()
            : undefined,
      },
      { status: statusCode }
    );
  } finally {
    await prisma.$disconnect();
  }
}
