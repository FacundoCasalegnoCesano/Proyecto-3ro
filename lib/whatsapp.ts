const SERVICES_WHATSAPP_PHONE = "5493404514018";

export function getWhatsAppContactUrl(message: string): string {
  return `https://wa.me/${SERVICES_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
