// config/consultorio.ts - Configuración centralizada del consultorio

export interface ConsultorioInfo {
  nombre: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  pais: string;
  telefono: string;
  email: string;
  horarios: string;
  indicaciones: string[];
  ubicacionGoogleMaps?: string;
  comoLlegar?: string[];
  estacionamiento?: string;
  referenciasUbicacion?: string[];
}

export const CONSULTORIO_CONFIG: ConsultorioInfo = {
  // 🏢 INFORMACIÓN BÁSICA DEL CONSULTORIO
  nombre: "Babalu - Centro de Sanación Espiritual",
  direccion: "Av. Corrientes 1234, Piso 2, Dpto B", // 👈 CAMBIAR POR TU DIRECCIÓN
  ciudad: "Buenos Aires",
  codigoPostal: "C1043AAZ", // 👈 CAMBIAR POR TU CÓDIGO POSTAL
  pais: "Argentina",
  
  // 📞 CONTACTO
  telefono: "+54 11 2345-6789", // 👈 CAMBIAR POR TU TELÉFONO
  email: "facucasalegno@gmail.com", // 👈 CAMBIAR POR TU EMAIL
  
  // 🕐 HORARIOS DE ATENCIÓN
  horarios: "Lunes a Viernes: 9:00 - 19:00 hs | Sábados: 9:00 - 15:00 hs",
  
  // 📍 UBICACIÓN Y REFERENCIAS
  ubicacionGoogleMaps: "https://goo.gl/maps/ejemplo123", // 👈 AGREGAR TU LINK DE GOOGLE MAPS
  
  // 🗺️ CÓMO LLEGAR
  comoLlegar: [
    "🚇 Metro: Línea B, estación Carlos Pellegrini (2 cuadras)",
    "🚌 Colectivos: 5, 7, 17, 23, 45, 70, 99, 115",
    "🚗 En auto: Av. Corrientes altura 1200, buscar estacionamiento en calles aledañas",
    "🚶‍♀️ A pie: Muy cerca del Obelisco y Teatro San Martín"
  ],
  
  // 📍 REFERENCIAS PARA ENCONTRAR EL LUGAR
  referenciasUbicacion: [
    "Edificio con portero, frente a Farmacity",
    "Entre las calles Talcahuano y Uruguay",
  ],
  
  // 📋 INDICACIONES IMPORTANTES PARA EL CLIENTE
  indicaciones: [
    "Llegar 5 minutos antes de la hora programada",
    "Traer documento de identidad",
    "Venir con ropa cómoda y mente abierta",
    "Evitar usar perfumes fuertes (pueden interferir con la energía)",
    "El consultorio cuenta con estacionamiento gratuito",
    "Si llegas tarde, por favor avisa por WhatsApp"
  ]
};

// 🔧 FUNCIONES HELPER PARA USAR LA CONFIGURACIÓN

export function getConsultorioAddress(): string {
  return `${CONSULTORIO_CONFIG.direccion}, ${CONSULTORIO_CONFIG.ciudad}, ${CONSULTORIO_CONFIG.codigoPostal}, ${CONSULTORIO_CONFIG.pais}`;
}

export function getConsultorioPhoneFormatted(): string {
  return CONSULTORIO_CONFIG.telefono;
}

export function getWhatsAppLink(): string {
  // Convierte el teléfono a formato WhatsApp (sin + y espacios)
  const phoneNumber = CONSULTORIO_CONFIG.telefono.replace(/[\s\+\-\(\)]/g, '');
  return `https://wa.me/${phoneNumber}`;
}

export function getGoogleMapsLink(): string {
  if (CONSULTORIO_CONFIG.ubicacionGoogleMaps) {
    return CONSULTORIO_CONFIG.ubicacionGoogleMaps;
  }
  
  // Si no hay link personalizado, genera uno automático
  const address = encodeURIComponent(getConsultorioAddress());
  return `https://www.google.com/maps/search/?api=1&query=${address}`;
}

export function generateConsultorioDescription(): string {
  return `
${CONSULTORIO_CONFIG.nombre}
${getConsultorioAddress()}

📞 Teléfono: ${CONSULTORIO_CONFIG.telefono}
📧 Email: ${CONSULTORIO_CONFIG.email}
🕐 Horarios: ${CONSULTORIO_CONFIG.horarios}

🗺️ Cómo llegar:
${CONSULTORIO_CONFIG.comoLlegar?.map(item => `• ${item}`).join('\n')}

📍 Referencias:
${CONSULTORIO_CONFIG.referenciasUbicacion?.map(item => `• ${item}`).join('\n')}
`.trim();
}

// 📧 CONFIGURACIÓN DE EMAIL ESPECÍFICA
export const EMAIL_CONFIG = {
  fromName: CONSULTORIO_CONFIG.nombre,
  replyTo: CONSULTORIO_CONFIG.email,
  supportEmail: CONSULTORIO_CONFIG.email,
  whatsappLink: getWhatsAppLink(),
  googleMapsLink: getGoogleMapsLink()
};

// 🎨 PERSONALIZACIÓN DEL EMAIL
export const EMAIL_STYLING = {
  primaryColor: '#8B5DBA',
  secondaryColor: '#6B46C1',
  accentColor: '#f8f9ff',
  textColor: '#333333',
  mutedTextColor: '#6b7280'
};