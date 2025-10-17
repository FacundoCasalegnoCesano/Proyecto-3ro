// lib/shipping/advancedShippingService.ts
import { ShippingQuote, Zone } from "./types";

export class AdvancedShippingService {
  private zones: Zone[] = [
    {
      name: "CABA",
      zipCodes: [
        "1001",
        "1002",
        "1003",
        "1004",
        "1005",
        "1006",
        "1007",
        "1008",
        "1009",
        "1010",
      ],
      basePrice: 1500,
      deliveryDays: 3,
    },
    {
      name: "GBA Norte",
      zipCodes: [
        "1600",
        "1601",
        "1602",
        "1603",
        "1604",
        "1605",
        "1606",
        "1607",
        "1608",
        "1609",
      ],
      basePrice: 1800,
      deliveryDays: 4,
    },
    {
      name: "GBA Sur",
      zipCodes: [
        "1800",
        "1801",
        "1802",
        "1803",
        "1804",
        "1805",
        "1806",
        "1807",
        "1808",
        "1809",
      ],
      basePrice: 1900,
      deliveryDays: 5,
    },
    {
      name: "Interior Bs As",
      zipCodes: [
        "6000",
        "6001",
        "6002",
        "6003",
        "6004",
        "6005",
        "6006",
        "6007",
        "6008",
        "6009",
      ],
      basePrice: 2200,
      deliveryDays: 6,
    },
    {
      name: "Resto del País",
      zipCodes: [],
      basePrice: 2800,
      deliveryDays: 8,
    },
  ];

  async getAllQuotes(
    originZipCode: string,
    destinationZipCode: string,
    weight: number
  ): Promise<ShippingQuote[]> {
    // Simular delay de red
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000)
    );

    // Validar código postal
    if (!this.isValidZipCode(destinationZipCode)) {
      throw new Error("Código postal inválido");
    }

    const originZone = this.findZone(originZipCode);
    const destinationZone = this.findZone(destinationZipCode);

    // Calcular precios basados en zonas y peso
    const andreaniPrice = this.calculatePrice(
      "andreani",
      originZone,
      destinationZone,
      weight
    );
    const correoPrice = this.calculatePrice(
      "correo-argentino",
      originZone,
      destinationZone,
      weight
    );

    const andreaniDays = this.calculateDeliveryDays(
      "andreani",
      originZone,
      destinationZone
    );
    const correoDays = this.calculateDeliveryDays(
      "correo-argentino",
      originZone,
      destinationZone
    );

    const quotes: ShippingQuote[] = [
      {
        id: "andreani-standard",
        carrier: "andreani", // CORREGIDO: tipo específico
        name: "Andreani Estandar",
        price: andreaniPrice,
        deliveryDays: andreaniDays,
        estimatedDate: this.calculateEstimatedDate(andreaniDays),
        service: "Estandar",
      },
      {
        id: "andreani-express",
        carrier: "andreani", // CORREGIDO: tipo específico
        name: "Andreani Express",
        price: Math.round(andreaniPrice * 1.5),
        deliveryDays: Math.max(2, Math.round(andreaniDays * 0.5)),
        estimatedDate: this.calculateEstimatedDate(
          Math.max(2, Math.round(andreaniDays * 0.5))
        ),
        service: "Express",
      },
      {
        id: "correo-argentino-standard",
        carrier: "correo-argentino", // CORREGIDO: tipo específico
        name: "Correo Argentino",
        price: correoPrice,
        deliveryDays: correoDays,
        estimatedDate: this.calculateEstimatedDate(correoDays),
        service: "Estandar",
      },
      {
        id: "correo-argentino-prioritario",
        carrier: "correo-argentino", // CORREGIDO: tipo específico
        name: "Correo Argentino Prioritario",
        price: Math.round(correoPrice * 1.4),
        deliveryDays: Math.max(3, Math.round(correoDays * 0.6)),
        estimatedDate: this.calculateEstimatedDate(
          Math.max(3, Math.round(correoDays * 0.6))
        ),
        service: "Prioritario",
      },
    ];

    return quotes
      .sort((a, b) => a.price - b.price)
      .filter((quote) => quote.price < 10000);
  }

  private isValidZipCode(zipCode: string): boolean {
    return /^\d{4,8}$/.test(zipCode);
  }

  private findZone(zipCode: string): Zone {
    return (
      this.zones.find(
        (zone) =>
          zone.zipCodes.includes(zipCode) ||
          zone.zipCodes.some((prefix) => zipCode.startsWith(prefix))
      ) || this.zones[this.zones.length - 1]
    );
  }

  private calculatePrice(
    carrier: "andreani" | "correo-argentino",
    origin: Zone,
    destination: Zone,
    weight: number
  ): number {
    const basePrice =
      carrier === "andreani" ? origin.basePrice * 1.1 : origin.basePrice;
    const weightMultiplier = weight * (carrier === "andreani" ? 300 : 250);
    const distancePenalty = this.calculateDistancePenalty(origin, destination);

    return Math.round((basePrice + weightMultiplier) * distancePenalty);
  }

  private calculateDeliveryDays(
    carrier: "andreani" | "correo-argentino",
    origin: Zone,
    destination: Zone
  ): number {
    const baseDays =
      carrier === "andreani" ? origin.deliveryDays - 1 : origin.deliveryDays;
    const distancePenalty = this.calculateDistancePenalty(origin, destination);

    return Math.round(baseDays * distancePenalty);
  }

  private calculateDistancePenalty(origin: Zone, destination: Zone): number {
    if (origin.name === destination.name) return 1.0;
    if (origin.name.includes("CABA") && destination.name.includes("GBA"))
      return 1.2;
    if (origin.name.includes("GBA") && destination.name.includes("CABA"))
      return 1.2;
    return 1.8;
  }

  private calculateEstimatedDate(deliveryDays: number): string {
    const date = new Date();
    let daysAdded = 0;

    while (daysAdded < deliveryDays) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        daysAdded++;
      }
    }

    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

export const advancedShippingService = new AdvancedShippingService();
