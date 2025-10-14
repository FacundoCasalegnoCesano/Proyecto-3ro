// lib/shipping/types.ts
export interface ShippingQuote {
  id: string;
  carrier: "andreani" | "correo-argentino";
  name: string;
  price: number;
  deliveryDays: number;
  estimatedDate: string;
  service: string;
}

export interface Zone {
  name: string;
  zipCodes: string[];
  basePrice: number;
  deliveryDays: number;
}