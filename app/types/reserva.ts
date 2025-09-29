// types/reserva.ts

export interface ServicioData {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  description: string;
}

export interface ReservaData {
  servicio: ServicioData;
  fecha: string; // YYYY-MM-DD format
  hora: string; // HH:MM format
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  mensaje?: string;
}

export interface CreateReservaRequest {
  reservaData: ReservaData;
}

export interface CreateReservaResponse {
  success: boolean;
  reservaId?: string;
  eventId?: string;
  eventLink?: string;
  hangoutLink?: string;
  error?: string;
  details?: string;
}

export interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides: Array<{
      method: string;
      minutes: number;
    }>;
  };
  location?: string;
}

export interface FormErrors {
  servicio?: string;
  fecha?: string;
  hora?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  general?: string;
}

// Estados del formulario
export interface FormData {
  servicio: string;
  fecha: string;
  hora: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  mensaje: string;
}

// Constantes - Servicios disponibles actualizados
export const SERVICIOS_DISPONIBLES: ServicioData[] = [
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

export const HORARIOS_DISPONIBLES = [
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

// Utilidades de validación
export const validarEmail = (email: string): boolean => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

export const validarTelefono = (telefono: string): boolean => {
  const telefonoRegex = /^\+?[\d\s\-()]{8,}$/;
  return telefonoRegex.test(telefono);
};

export const obtenerDuracionEnMinutos = (duration: string): number => {
  if (duration.includes("60 minutos")) return 60;
  if (duration.includes("90 minutos")) return 90;
  if (duration.includes("45 minutos")) return 45;
  if (duration.includes("2-3 horas")) return 150; // 2.5 horas promedio
  return 60; // default
};

export const generarIdReserva = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `RSV-${timestamp}-${random}`.toUpperCase();
};

export const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatearHora = (hora: string): string => {
  return hora + " hs";
};
