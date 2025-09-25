import { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleCalendarClient } from "lib/googleCalendar";
import nodemailer from 'nodemailer';

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

interface CreateReservaResponse {
  success: boolean;
  reservaId?: string;
  eventId?: string;
  eventLink?: string;
  hangoutLink?: string;
  emailSent?: boolean;
  error?: string;
  details?: string;
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
    "El espacio cuenta con estacionamiento gratuito"
  ]
};

// Datos de servicios disponibles - Actualizados para coincidir con ServicesGrid
const SERVICIOS_DISPONIBLES: ServicioData[] = [
  {
    id: "tarot",
    title: "Lectura De Tarot",
    subtitle: "Tarot Rider-Waite",
    price: "$3500",
    duration: "60 minutos",
    description: "Consultas personalizadas de Tarot para guiar tu camino espiritual.",
  },
  {
    id: "reiki",
    title: "Sesión de Reiki Usui",
    subtitle: "Sanación Energética",
    price: "$4000",
    duration: "90 minutos",
    description: "Terapia de sanación energética para equilibrar los chakras y reducir el estrés.",
  },
  {
    id: "limpieza-energetica",
    title: "Limpieza Energética",
    subtitle: "Purificación del Aura",
    price: "$2800",
    duration: "45 minutos",
    description: "Ritual de limpieza energética personal para eliminar bloqueos y energías negativas.",
  },
  {
    id: "limpieza-espacios",
    title: "Limpieza de Espacios",
    subtitle: "Armonización del Hogar",
    price: "$5500",
    duration: "2-3 horas",
    description: "Limpieza energética completa de hogares, oficinas o locales comerciales.",
  },
  {
    id: "pendulo-hebreo",
    title: "Limpieza con Péndulo Hebreo",
    subtitle: "Liberación de Bloqueos",
    price: "$10000",
    duration: "1-2 horas",
    description: "Herramienta de radiestesia vibracional para diagnosticar y equilibrar el campo energético.",
  },
  {
    id: "tarot-africano",
    title: "Sesión de Tarot Africano",
    subtitle: "Sabiduría Ancestral",
    price: "$10000",
    duration: "1-2 horas",
    description: "Herramienta de autoconocimiento que conecta con la sabiduría ancestral africana.",
  },
];

function getDurationInMinutes(duration: string): number {
  // Convertir duración a minutos
  if (duration.includes("60 minutos")) return 60;
  if (duration.includes("90 minutos")) return 90;
  if (duration.includes("45 minutos")) return 45;
  if (duration.includes("2-3 horas")) return 150; // 2.5 horas promedio
  if (duration.includes("1-2 horas")) return 90; // 1.5 horas promedio
  return 60; // default
}

function generateReservaId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `RSV-${timestamp}-${random}`.toUpperCase();
}

function formatearFecha(fecha: string): string {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Configurar transportador de email
function createEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST, // ej: smtp.gmail.com
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Generar HTML del email
function generateEmailHTML(reservaData: ReservaData, reservaId: string): string {
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
            <h1>✨ Tu Reserva Está Confirmada</h1>
            <p>Información completa de tu sesión espiritual</p>
        </div>
        
        <div class="content">
            <div class="reservation-info">
                <h2 style="margin-top: 0; color: #8B5DBA;">📋 Detalles de tu Reserva</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">ID:</span>
                        <span class="info-value highlight">${reservaId}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cliente:</span>
                        <span class="info-value">${reservaData.nombre} ${reservaData.apellido}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fecha:</span>
                        <span class="info-value highlight">${fechaFormateada}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Hora:</span>
                        <span class="info-value highlight">${reservaData.hora} hs</span>
                    </div>
                </div>
            </div>

            <div class="service-card">
                <h3 style="margin-top: 0; color: #8B5DBA;">🔮 ${reservaData.servicio.title}</h3>
                <p style="color: #8B5DBA; font-weight: 500; margin: 5px 0;">${reservaData.servicio.subtitle}</p>
                <p style="margin: 10px 0; color: #4B5563;">${reservaData.servicio.description}</p>
                <div class="info-grid" style="margin-top: 15px;">
                    <div class="info-item">
                        <span class="info-label">💰 Precio:</span>
                        <span class="info-value highlight" style="font-size: 18px; font-weight: bold;">${reservaData.servicio.price}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">⏰ Duración:</span>
                        <span class="info-value">${reservaData.servicio.duration}</span>
                    </div>
                </div>
            </div>

            <div class="location-card">
                <h3 style="margin-top: 0; color: #0369a1;">📍 Ubicación del Consultorio</h3>
                <div style="margin: 15px 0;">
                    <p style="font-weight: 600; color: #1e40af; margin: 5px 0;">${CONSULTORIO_INFO.nombre}</p>
                    <p style="margin: 5px 0; color: #4B5563;">${CONSULTORIO_INFO.direccion}</p>
                    <p style="margin: 5px 0; color: #4B5563;">${CONSULTORIO_INFO.ciudad}, ${CONSULTORIO_INFO.codigoPostal}</p>
                    <p style="margin: 5px 0; color: #4B5563;">${CONSULTORIO_INFO.pais}</p>
                </div>
                <div style="margin: 15px 0; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 6px;">
                    <p style="margin: 0; font-weight: 600; color: #1e40af;">📞 Teléfono: ${CONSULTORIO_INFO.telefono}</p>
                    <p style="margin: 5px 0 0 0; color: #4B5563;">💼 Horarios: ${CONSULTORIO_INFO.horarios}</p>
                </div>
            </div>

            ${reservaData.mensaje ? `
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">💬 Tu Mensaje</h3>
                <p style="margin: 0; color: #4B5563; font-style: italic;">"${reservaData.mensaje}"</p>
            </div>
            ` : ''}

            <div class="instructions">
                <h3>📝 Indicaciones Importantes</h3>
                <ul>
                    ${CONSULTORIO_INFO.indicaciones.map(indicacion => `<li>${indicacion}</li>`).join('')}
                </ul>
                <p style="margin-top: 15px; color: #92400e; font-weight: 500;">
                    💡 Si necesitas cancelar o reprogramar tu cita, por favor contáctanos con al menos 24 horas de anticipación.
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
                        💬 WhatsApp
                    </a>
                    <a href="tel:${CONSULTORIO_INFO.telefono}" style="background: #8B5DBA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: 500;">
                        📞 Llamar
                    </a>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="contact-info">
                <div class="contact-item">
                    <span>📧</span>
                    <span>${CONSULTORIO_INFO.email}</span>
                </div>
                <div class="contact-item">
                    <span>📞</span>
                    <span>${CONSULTORIO_INFO.telefono}</span>
                </div>
                <div class="contact-item">
                    <span>📍</span>
                    <span>${CONSULTORIO_INFO.ciudad}, ${CONSULTORIO_INFO.pais}</span>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #9ca3af; font-size: 14px; margin: 15px 0;">
                Gracias por confiar en nosotros para tu crecimiento espiritual.<br>
                Te esperamos con mucho amor y luz. ✨
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

// Enviar email informativo
async function sendReservationEmail(reservaData: ReservaData, reservaId: string): Promise<boolean> {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: {
        name: CONSULTORIO_INFO.nombre,
        address: process.env.SMTP_USER!
      },
      to: reservaData.email,
      subject: `✨ Información de tu Reserva ${reservaId} - ${reservaData.servicio.title}`,
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
${CONSULTORIO_INFO.indicaciones.map((ind, i) => `${i + 1}. ${ind}`).join('\n')}

¿Preguntas? Contáctanos:
- WhatsApp: https://wa.me/5491123456789
- Teléfono: ${CONSULTORIO_INFO.telefono}
- Email: ${CONSULTORIO_INFO.email}

¡Te esperamos!
Equipo Babalu
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
    
  } catch (error) {
    console.error('Error enviando email:', error);
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

  // Validar que el servicio existe
  const servicioExiste = SERVICIOS_DISPONIBLES.find(s => s.id === reservaData.servicio.id);
  if (!servicioExiste) return "Servicio no válido";

  // Validar formato de email
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(reservaData.email)) return "Email no válido";

  // Validar fecha futura
  const fechaReserva = new Date(`${reservaData.fecha}T${reservaData.hora}`);
  if (fechaReserva <= new Date()) return "La fecha debe ser futura";

  return null;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<CreateReservaResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", success: false });
  }

  const { reservaData }: CreateReservaRequest = req.body;

  if (!reservaData) {
    return res.status(400).json({ 
      error: "Datos de reserva no proporcionados",
      success: false 
    });
  }

  // Validar datos de reserva
  const validationError = validateReservaData(reservaData);
  if (validationError) {
    return res.status(400).json({ 
      error: validationError,
      success: false 
    });
  }

  // Crear fechas de inicio y fin del evento
  const startDateTime = new Date(`${reservaData.fecha}T${reservaData.hora}:00`);
  const durationMinutes = getDurationInMinutes(reservaData.servicio.duration);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

  const reservaId = generateReservaId();

  try {
    // 1. Crear evento en Google Calendar
    const calendar = getGoogleCalendarClient();

    const eventDescription = `
📅 NUEVA RESERVA - ${reservaId}

👤 CLIENTE:
• Nombre: ${reservaData.nombre} ${reservaData.apellido}
• Email: ${reservaData.email}
• Teléfono: ${reservaData.telefono}

🔮 SERVICIO:
• ${reservaData.servicio.title} (${reservaData.servicio.subtitle})
• Precio: ${reservaData.servicio.price}
• Duración: ${reservaData.servicio.duration}
• Descripción: ${reservaData.servicio.description}

📝 MENSAJE DEL CLIENTE:
${reservaData.mensaje || 'Sin mensaje adicional'}

📍 UBICACIÓN:
${CONSULTORIO_INFO.nombre}
${CONSULTORIO_INFO.direccion}
${CONSULTORIO_INFO.ciudad}, ${CONSULTORIO_INFO.pais}

🆔 ID de Reserva: ${reservaId}
`.trim();

    const event = {
      summary: `${reservaData.servicio.title} - ${reservaData.nombre} ${reservaData.apellido}`,
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
      attendees: [
        {
          email: reservaData.email,
          displayName: `${reservaData.nombre} ${reservaData.apellido}`,
          responseStatus: 'needsAction'
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 horas antes
          { method: 'popup', minutes: 60 },      // 1 hora antes
          { method: 'popup', minutes: 15 }       // 15 minutos antes
        ]
      }
    };

    console.log(`🔄 Creando evento en Google Calendar para reserva ${reservaId}...`);
    
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: event,
      sendUpdates: 'none' // No enviar invitaciones por Google, usaremos nuestro email personalizado
    });

    const eventId = response.data.id ? String(response.data.id) : undefined;
    const eventLink = response.data.htmlLink || undefined;
    const hangoutLink = response.data.hangoutLink || undefined;

    console.log(`✅ Evento creado en Google Calendar - ID: ${eventId}`);

    // 2. Enviar email informativo al cliente
    console.log(`📧 Enviando email informativo a ${reservaData.email}...`);
    const emailSent = await sendReservationEmail(reservaData, reservaId);

    if (emailSent) {
      console.log(`✅ Email enviado exitosamente a ${reservaData.email}`);
    } else {
      console.log(`⚠️ Advertencia: No se pudo enviar el email a ${reservaData.email}`);
    }

    console.log(`🎉 Reserva ${reservaId} procesada exitosamente`);

    // Aquí podrías guardar la reserva en tu base de datos
    // await saveReservaToDatabase(reservaId, reservaData, eventId);

    res.status(200).json({ 
      success: true, 
      reservaId,
      eventId,
      eventLink,
      hangoutLink,
      emailSent
    });

  } catch (error: unknown) {
    console.error(`❌ Error procesando reserva ${reservaId}:`, error);
    
    if (error instanceof Error) {
      const googleError = error as any;
      
      if (googleError.code === 401) {
        return res.status(500).json({ 
          error: "Error de autenticación con Google Calendar",
          success: false 
        });
      }
      if (googleError.code === 404) {
        return res.status(500).json({ 
          error: "Calendario no encontrado",
          success: false 
        });
      }
      if (googleError.code === 403) {
        return res.status(500).json({ 
          error: "Permisos insuficientes para acceder al calendario",
          success: false 
        });
      }
      
      return res.status(500).json({ 
        error: "Error al crear la reserva",
        details: error.message,
        success: false 
      });
    }
    
    res.status(500).json({ 
      error: "Error desconocido al procesar la reserva",
      success: false 
    });
  }
}