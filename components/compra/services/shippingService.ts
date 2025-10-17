// components/compra/services/shippingService.ts
import type { CartItem } from "app/types/cart";

export interface ShippingQuote {
  id: string;
  carrier: "andreani" | "correo-argentino";
  name: string;
  price: number;
  deliveryDays: number;
  estimatedDate: string;
  service: string;
}

interface ShippingData {
  codigoPostal: string;
  provincia: string;
  ciudad: string;
  calle: string;
}

interface CartItemWithShipping extends CartItem {
  peso?: number;
  volumen?: number;
}

export class ShippingService {
  private andreaniApiKey = process.env.NEXT_PUBLIC_ANDREANI_API_KEY;
  private correoApiUrl = process.env.NEXT_PUBLIC_CORREO_API_URL;

  async getAndreaniQuote(
    codigoPostal: string,
    peso: number
  ): Promise<ShippingQuote[]> {
    try {
      // Implementación real con Andreani API
      // Por ahora simulamos datos
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return [
        {
          id: "andreani-standard",
          carrier: "andreani",
          name: "Andreani Estandar",
          price: peso > 2 ? 2800 : 2500,
          deliveryDays: 5,
          estimatedDate: this.calculateEstimatedDate(5),
          service: "Estandar",
        },
        {
          id: "andreani-express",
          carrier: "andreani",
          name: "Andreani Express",
          price: peso > 2 ? 3800 : 3500,
          deliveryDays: 2,
          estimatedDate: this.calculateEstimatedDate(2),
          service: "Express",
        },
      ];
    } catch (error) {
      console.error("Error Andreani API:", error);
      return [];
    }
  }

  async getCorreoArgentinoQuote(
    codigoPostal: string,
    peso: number
  ): Promise<ShippingQuote[]> {
    try {
      // Correo Argentino - implementación simulada
      await new Promise((resolve) => setTimeout(resolve, 800));

      return [
        {
          id: "correo-argentino-standard",
          carrier: "correo-argentino",
          name: "Correo Argentino",
          price: peso > 1 ? 2000 : 1800,
          deliveryDays: 7,
          estimatedDate: this.calculateEstimatedDate(7),
          service: "Standard",
        },
      ];
    } catch (error) {
      console.error("Error Correo Argentino:", error);
      return [];
    }
  }

  async getAllQuotes(
    shippingData: ShippingData,
    cartItems: CartItemWithShipping[]
  ): Promise<ShippingQuote[]> {
    const peso = this.calculateTotalWeight(cartItems);

    const quotes = await Promise.all([
      this.getAndreaniQuote(shippingData.codigoPostal, peso),
      this.getCorreoArgentinoQuote(shippingData.codigoPostal, peso),
    ]);

    return quotes.flat().sort((a, b) => a.price - b.price);
  }

  private calculateTotalWeight(cartItems: CartItemWithShipping[]): number {
    return cartItems.reduce(
      (total, item) => total + (item.peso || 0.5) * item.quantity,
      0
    );
  }

  private calculateEstimatedDate(deliveryDays: number): string {
    const date = new Date();
    // Excluir fines de semana
    let daysAdded = 0;
    while (daysAdded < deliveryDays) {
      date.setDate(date.getDate() + 1);
      // Si no es sábado (6) ni domingo (0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        daysAdded++;
      }
    }
    return date.toLocaleDateString("es-AR");
  }
}

export const shippingService = new ShippingService();
