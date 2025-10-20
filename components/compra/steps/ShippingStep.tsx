"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../../ui/button";
import { MapPin, Truck, Clock, Check, Loader2 } from "lucide-react";
import { PaymentData, FormErrors, SetErrorsFunction } from "../CompraWizard";
import type { CartItem } from "app/types/cart";

// Interface para las opciones de envío (corregida)
interface ShippingOption {
  id: string;
  carrier: "andreani" | "correo-argentino";
  name: string;
  price: number;
  deliveryDays: number;
  estimatedDate: string;
  service: string;
}

// Interface para las zonas
interface Zone {
  name: string;
  zipCodes: string[];
  basePrice: number;
  deliveryDays: number;
}

interface ShippingStepProps {
  formData: PaymentData;
  updateFormData: (data: Partial<PaymentData>) => void;
  errors: FormErrors;
  setErrors: SetErrorsFunction;
  cartItems: CartItem[];
  subtotal: number;
  onNext: () => void;
  onBack: () => void;
}

// Servicio simulado integrado (segunda opción avanzada)
class AdvancedShippingService {
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
  ): Promise<ShippingOption[]> {
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

    const quotes: ShippingOption[] = [
      {
        id: "andreani-standard",
        carrier: "andreani",
        name: "Andreani Estandar",
        price: andreaniPrice,
        deliveryDays: andreaniDays,
        estimatedDate: this.calculateEstimatedDate(andreaniDays),
        service: "Estandar",
      },
      {
        id: "andreani-express",
        carrier: "andreani",
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
        carrier: "correo-argentino",
        name: "Correo Argentino",
        price: correoPrice,
        deliveryDays: correoDays,
        estimatedDate: this.calculateEstimatedDate(correoDays),
        service: "Estandar",
      },
      {
        id: "correo-argentino-prioritario",
        carrier: "correo-argentino",
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

const shippingService = new AdvancedShippingService();

export function ShippingStep({
  formData,
  updateFormData,
  errors,
  setErrors,
  cartItems,
  onNext,
  onBack,
}: ShippingStepProps) {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(
    null
  );

  // Usar useRef para trackear si ya se hizo la selección automática inicial
  const initialAutoSelectDone = useRef(false);

  // Usar useRef para evitar dependencias cambiantes
  const formDataRef = useRef(formData);
  const errorsRef = useRef(errors);

  // Actualizar las refs cuando cambien los props
  useEffect(() => {
    formDataRef.current = formData;
    errorsRef.current = errors;
  }, [formData, errors]);

  // Calcular peso total del carrito
  const calculateTotalWeight = useCallback((): number => {
    return cartItems.reduce((total, item) => total + 0.5 * item.quantity, 0);
  }, [cartItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!selectedOption)
      newErrors.shipping = "Debes seleccionar un método de envío";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar la selección de envío
  const handleSelectShipping = useCallback(
    (option: ShippingOption) => {
      setSelectedOption(option);
      updateFormData({
        shippingOption: option,
        shippingMethod: option.id,
      });

      // Limpiar error de shipping si existe
      if (errorsRef.current.shipping) {
        const newErrors = { ...errorsRef.current };
        delete newErrors.shipping;
        setErrors(newErrors);
      }
    },
    [updateFormData, setErrors]
  );

  // Memoizar calculateShipping sin dependencias problemáticas
  const calculateShipping = useCallback(async () => {
    const currentFormData = formDataRef.current;
    const currentErrors = errorsRef.current;

    if (
      !currentFormData.codigoPostal ||
      currentFormData.codigoPostal.length < 4
    ) {
      setErrors({
        ...currentErrors,
        shipping: "Completa tu código postal para calcular envíos",
      });
      return;
    }

    setCalculating(true);
    try {
      const totalWeight = calculateTotalWeight();

      // Usar el servicio simulado avanzado
      const quotes = await shippingService.getAllQuotes(
        "1001", // Código postal de origen fijo (tu almacén/ubicación)
        currentFormData.codigoPostal,
        totalWeight
      );

      setShippingOptions(quotes);

      // SOLO seleccionar automáticamente si es la primera vez y no hay selección previa
      if (
        quotes.length > 0 &&
        !initialAutoSelectDone.current &&
        !selectedOption
      ) {
        const cheapestOption = quotes.reduce((prev, current) =>
          prev.price < current.price ? prev : current
        );
        handleSelectShipping(cheapestOption);
        initialAutoSelectDone.current = true; // Marcar que ya se hizo la selección automática
      }

      // Limpiar errores si hay opciones disponibles
      if (quotes.length > 0 && currentErrors.shipping) {
        const newErrors = { ...currentErrors };
        delete newErrors.shipping;
        setErrors(newErrors);
      }
    } catch (error) {
      console.error("Error calculando envíos:", error);
      setErrors({
        ...currentErrors,
        shipping:
          "Error al calcular opciones de envío. Verifica tu código postal.",
      });
    } finally {
      setCalculating(false);
    }
  }, [calculateTotalWeight, handleSelectShipping, setErrors, selectedOption]);

  // Calcular envíos automáticamente cuando cambia el código postal
  useEffect(() => {
    if (formData.codigoPostal && formData.codigoPostal.length >= 4) {
      // Usar un timeout para evitar cálculos demasiado frecuentes
      const timeoutId = setTimeout(() => {
        calculateShipping();
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [formData.codigoPostal, calculateShipping]);

  // Calcular envíos solo una vez al montar el componente si hay código postal
  useEffect(() => {
    if (
      formData.codigoPostal &&
      formData.codigoPostal.length >= 4 &&
      shippingOptions.length === 0
    ) {
      calculateShipping();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta una vez al montar

  const handleNext = () => {
    if (validateForm() && selectedOption) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <MapPin className="w-5 h-5 text-babalu-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Método de Envío</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información de Dirección (solo lectura) */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">
              Dirección de Envío
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{formData.calle}</p>
              <p>
                {formData.ciudad}, {formData.provincia}
              </p>
              <p>
                C.P. {formData.codigoPostal} - {formData.pais}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                * Esta dirección se usará para el envío de tu pedido
              </p>
            </div>
          </div>

          {/* Botón para recalcular envíos */}
          {formData.codigoPostal && formData.codigoPostal.length >= 4 && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={calculateShipping}
                disabled={calculating}
                className="text-sm"
              >
                {calculating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    Calculando...
                  </>
                ) : (
                  "Recalcular Envíos"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Opciones de envío */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-100/50 p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-babalu-primary" />
              Opciones de Envío Disponibles
            </h4>

            {calculating ? (
              <div className="text-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-babalu-primary mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Calculando opciones de envío...
                </p>
              </div>
            ) : shippingOptions.length > 0 ? (
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`bg-white rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 ${
                      selectedOption?.id === option.id
                        ? "border-babalu-primary bg-blue-50/50"
                        : "border-gray-200 hover:border-babalu-primary/50"
                    }`}
                    onClick={() => handleSelectShipping(option)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            selectedOption?.id === option.id
                              ? "bg-babalu-primary text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {selectedOption?.id === option.id && (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {option.name}
                        </span>
                      </div>
                      <span className="font-bold text-babalu-primary">
                        {formatPrice(option.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        {option.deliveryDays} días - Llega:{" "}
                        {option.estimatedDate}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {option.carrier === "andreani"
                        ? "🚚 Andreani"
                        : "📮 Correo Argentino"}{" "}
                      • {option.service}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Truck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {formData.codigoPostal
                    ? "No hay opciones de envío disponibles para tu ubicación"
                    : "Completa tu dirección para calcular envíos"}
                </p>
              </div>
            )}
            {errors.shipping && (
              <p className="text-sm text-red-600 mt-2">{errors.shipping}</p>
            )}
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="px-6"
        >
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedOption || calculating}
          className="bg-babalu-primary hover:bg-babalu-dark text-white px-6"
        >
          Continuar al Pago
        </Button>
      </div>
    </div>
  );
}
