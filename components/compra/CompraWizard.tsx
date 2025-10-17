// compra/CompraWizard.tsx
"use client";

import { useState, useEffect } from "react";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { ShippingStep } from "./steps/ShippingStep";
import { PaymentStep } from "./steps/PaymentStep";
import { useCart } from "../../contexts/cart-context";
import { useSession } from "next-auth/react";
import {
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Calendar,
  Loader2,
} from "lucide-react";
import { ResumenCompra } from "../resumen-compra";
import { toast } from "sonner";
import Image from "next/image";
import type { CartItem } from "app/types/cart";

// Tipo genérico para errores
export interface FormErrors {
  [key: string]: string;
}

// Tipo para setErrors que acepte tanto objetos como funciones
export type SetErrorsFunction = (
  errors: FormErrors | ((prev: FormErrors) => FormErrors)
) => void;

export interface PaymentData {
  // Información personal (desde la sesión)
  nombre: string;
  apellido: string;
  email: string;
  phone: string;

  // Dirección de envío (desde la base de datos)
  calle: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;

  // Información de pago
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;

  // Opciones
  shippingMethod: string;
  paymentMethod: string;
  saveInfo: boolean;
  terms: boolean;

  // Datos de envío calculados
  shippingOption?: {
    carrier: string;
    service: string;
    price: number;
    deliveryDays: number;
    estimatedDate: string;
  };
}

interface StepProps {
  formData: PaymentData;
  updateFormData: (data: Partial<PaymentData>) => void;
  errors: FormErrors;
  setErrors: SetErrorsFunction;
  cartItems: CartItem[];
  subtotal: number;
  isLoading: boolean;
}

interface StockCheckItem {
  id: number;
  name: string;
  requested: number;
  available: number;
}

interface StockCheckResult {
  available: boolean;
  outOfStockItems: StockCheckItem[];
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderResponse {
  success: boolean;
  order?: {
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingAddress: {
      calle: string;
      ciudad: string;
      provincia: string;
      codigoPostal: string;
    };
    shippingMethod: {
      name: string;
      carrier: string;
      service: string;
      price: number;
      deliveryDays: number;
      estimatedDate: string;
    };
    paymentMethod: string;
    createdAt: string;
  };
  error?: string;
  outOfStockItems?: StockCheckItem[];
}

interface UserSession {
  user?: {
    nombre?: string;
    apellido?: string;
    email?: string;
  };
}

export function CompraWizard() {
  const { data: session, status } = useSession() as {
    data: UserSession | null;
    status: string;
  };
  const { state, getTotalPrice } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PaymentData>({
    nombre: "",
    apellido: "",
    email: "",
    phone: "",
    calle: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    pais: "Argentina",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    shippingMethod: "standard",
    paymentMethod: "credit-card",
    saveInfo: false,
    terms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [orderData, setOrderData] = useState<OrderResponse["order"] | null>(
    null
  );

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user) {
        try {
          // Cargar datos básicos de la sesión
          const userData = {
            nombre: session.user.nombre || "",
            apellido: session.user.apellido || "",
            email: session.user.email || "",
            phone: "",
          };

          // Cargar dirección desde la API
          const addressResponse = await fetch("/api/user/address", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          let addressData = {
            calle: "",
            ciudad: "",
            provincia: "",
            codigoPostal: "",
            pais: "Argentina",
          };

          if (addressResponse.ok) {
            const addressResult = await addressResponse.json();
            if (addressResult.success && addressResult.address) {
              addressData = {
                calle: addressResult.address.calle || "",
                ciudad: addressResult.address.ciudad || "",
                provincia: addressResult.address.provincia || "",
                codigoPostal: addressResult.address.codigoPostal || "",
                pais: addressResult.address.pais || "Argentina",
              };
            }
          }

          setFormData((prev) => ({
            ...prev,
            ...userData,
            ...addressData,
          }));
        } catch (error) {
          console.error("Error cargando datos del usuario:", error);
        } finally {
          setLoadingUserData(false);
        }
      } else {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [session]);

  const checkCurrentStock = async (
    cartItems: CartItem[]
  ): Promise<StockCheckResult> => {
    try {
      const stockPromises = cartItems.map(async (item) => {
        const response = await fetch(`/api/agregarProd?id=${item.id}`);
        if (response.ok) {
          const result = await response.json();
          return {
            id: item.id,
            name: item.name,
            requested: item.quantity,
            available: result.data?.stock || 0,
          };
        }
        return {
          id: item.id,
          name: item.name,
          requested: item.quantity,
          available: 0,
        };
      });

      const stockResults = await Promise.all(stockPromises);
      const outOfStockItems = stockResults.filter(
        (item) => item.requested > item.available
      );

      return {
        available: outOfStockItems.length === 0,
        outOfStockItems,
      };
    } catch (error) {
      console.error("Error verificando stock:", error);
      return { available: false, outOfStockItems: [] };
    }
  };

  const updateFormData = (newData: Partial<PaymentData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (finalData: PaymentData) => {
    setIsLoading(true);

    try {
      // Verificar stock antes de enviar
      console.log("🔍 Verificando stock actual...");
      const stockCheck = await checkCurrentStock(state.items);

      if (!stockCheck.available) {
        const errorMessage = `Stock insuficiente para: ${stockCheck.outOfStockItems
          .map(
            (item) =>
              `${item.name} (solicitado: ${item.requested}, disponible: ${item.available})`
          )
          .join(", ")}`;

        toast.error("Error en el stock", {
          description: errorMessage,
        });
        setErrors({ general: errorMessage });
        setIsLoading(false);
        return;
      }

      console.log("✅ Stock verificado, procesando orden...");

      // Mostrar toast de carga
      const loadingToast = toast.loading("Procesando tu compra...");

      const orderResponse = await processOrder(finalData, state.items);

      // Cerrar toast de carga
      toast.dismiss(loadingToast);

      if (orderResponse.success && orderResponse.order) {
        // Mostrar toast de éxito
        toast.success("¡Compra realizada!", {
          description: `Tu orden #${orderResponse.order.orderNumber} ha sido procesada exitosamente`,
          duration: 3000,
        });

        setOrderData(orderResponse.order);
        setOrderSuccess(true);

        // ⚠️ ELIMINADO: clearCart() - No limpiar el carrito aquí para evitar alerts

        // Redirigir después de 3 segundos
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        // Manejar error de stock insuficiente del servidor
        if (orderResponse.outOfStockItems) {
          const errorMessage = `Stock insuficiente durante el procesamiento: ${orderResponse.outOfStockItems
            .map(
              (item) =>
                `${item.name} (solicitado: ${item.requested}, disponible: ${item.available})`
            )
            .join(", ")}`;

          toast.error("Error en el stock", {
            description: errorMessage,
          });
          setErrors({ general: errorMessage });
        } else {
          toast.error("Error al procesar el pago", {
            description: orderResponse.error || "Intenta nuevamente.",
          });
          setErrors({
            general:
              orderResponse.error ||
              "Error al procesar el pago. Intenta nuevamente.",
          });
        }
      }
    } catch {
      toast.error("Error inesperado", {
        description: "Ocurrió un error al procesar tu compra.",
      });
      setErrors({ general: "Error al procesar el pago. Intenta nuevamente." });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para procesar la orden y actualizar stock
  const processOrder = async (
    paymentData: PaymentData,
    cartItems: CartItem[]
  ): Promise<OrderResponse> => {
    try {
      console.log("🔄 Enviando orden al servidor...", {
        paymentData: {
          calle: paymentData.calle,
          ciudad: paymentData.ciudad,
          provincia: paymentData.provincia,
          codigoPostal: paymentData.codigoPostal,
          pais: paymentData.pais,
          shippingOption: paymentData.shippingOption,
          paymentMethod: paymentData.paymentMethod,
        },
        items: cartItems.length,
        subtotal: getTotalPrice(),
        shipping: paymentData.shippingOption?.price || 0,
      });

      // Preparar los datos del carrito
      const cartItemsData = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "/placeholder.svg",
      }));

      const requestData = {
        paymentData: {
          ...paymentData,
          // Asegurar que shippingOption esté presente
          shippingOption: paymentData.shippingOption || {
            name: "Envío estándar",
            carrier: "Correo Argentino",
            service: "Estándar",
            price: 0,
            deliveryDays: 5,
            estimatedDate: new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000
            ).toLocaleDateString("es-AR"),
          },
        },
        cartItems: cartItemsData,
        subtotal: getTotalPrice(),
        shippingCost: paymentData.shippingOption?.price || 0,
      };

      console.log("📤 Enviando datos:", JSON.stringify(requestData, null, 2));

      const response = await fetch("/api/orders/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result: OrderResponse = await response.json();

      if (!response.ok) {
        console.error("❌ Error del servidor:", result);
        throw new Error(
          result.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Error procesando orden:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al procesar la orden",
      };
    }
  };

  // Mostrar loading mientras se cargan los datos del usuario
  if (loadingUserData || status === "loading") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-babalu-primary" />
            <span className="ml-2 text-gray-600">Cargando información...</span>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ResumenCompra items={state.items} totalPrice={getTotalPrice()} />
        </div>
      </div>
    );
  }

  // Si no hay sesión
  if (!session) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No autenticado
            </h3>
            <p className="text-gray-600">
              Debes iniciar sesión para realizar una compra.
            </p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <ResumenCompra items={state.items} totalPrice={getTotalPrice()} />
        </div>
      </div>
    );
  }

  if (orderSuccess && orderData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumen de compra exitosa */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pago Exitoso!
            </h2>
            <p className="text-gray-600">
              Tu pedido ha sido procesado correctamente. Recibirás un email de
              confirmación en breve.
            </p>
          </div>

          {/* Información de la orden */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-800 font-medium">
                  Orden #{orderData.orderNumber}
                </p>
                <p className="text-green-600 text-sm">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha:{" "}
                  {new Date(orderData.createdAt).toLocaleDateString("es-AR")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-green-800 font-bold text-lg">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(orderData.total)}
                </p>
                <p className="text-green-600 text-sm">
                  {orderData.items.length} productos
                </p>
              </div>
            </div>
          </div>

          {/* Detalles de la orden */}
          <div className="space-y-6">
            {/* Información de envío */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 text-babalu-primary mr-2" />
                Información de Envío
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Dirección de entrega
                  </p>
                  <p className="text-gray-600">
                    {orderData.shippingAddress.calle}
                  </p>
                  <p className="text-gray-600">
                    {orderData.shippingAddress.ciudad},{" "}
                    {orderData.shippingAddress.provincia}
                  </p>
                  <p className="text-gray-600">
                    CP: {orderData.shippingAddress.codigoPostal}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Método de envío
                  </p>
                  <p className="text-gray-600">
                    {orderData.shippingMethod.name}
                  </p>
                  <p className="text-gray-600">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Entrega estimada: {orderData.shippingMethod.estimatedDate}
                  </p>
                  <p className="text-gray-600">
                    Costo:{" "}
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(orderData.shippingCost)}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de pago */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 text-babalu-primary mr-2" />
                Información de Pago
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Método de pago
                  </p>
                  <p className="text-gray-600">
                    {orderData.paymentMethod === "mercado-pago"
                      ? "Mercado Pago"
                      : orderData.paymentMethod === "credit-card"
                      ? "Tarjeta de crédito"
                      : "Tarjeta de débito"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Total pagado
                  </p>
                  <p className="text-babalu-primary font-bold text-lg">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(orderData.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Productos comprados */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 text-babalu-primary mr-2" />
                Productos en tu pedido
              </h3>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        }).format(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        }).format(item.price)}{" "}
                        c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen de totales */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Resumen de totales
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(orderData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(orderData.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (21%):</span>
                  <span>
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(orderData.tax)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-babalu-primary">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(orderData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                Serás redirigido automáticamente a la página principal en 5
                segundos...
              </p>
            </div>
          </div>
        </div>

        {/* Columna del resumen */}
        <div className="lg:col-span-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              ¿Qué sigue?
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>
                  Recibirás un email de confirmación con los detalles de tu
                  pedido
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Package className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  Prepararemos tu pedido y te notificaremos cuando sea enviado
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <Truck className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p>
                  Recibirás un código de seguimiento para monitorear tu envío
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar step actual
  const renderStep = () => {
    const stepProps: StepProps = {
      formData,
      updateFormData,
      errors,
      setErrors,
      cartItems: state.items,
      subtotal: getTotalPrice(),
      isLoading,
    };

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} onNext={handleNextStep} />;
      case 2:
        return (
          <ShippingStep
            {...stepProps}
            onNext={handleNextStep}
            onBack={handlePrevStep}
          />
        );
      case 3:
        return (
          <PaymentStep
            {...stepProps}
            onSubmit={handleSubmit}
            onBack={handlePrevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna principal con el wizard */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? "bg-babalu-primary text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      currentStep >= step
                        ? "text-babalu-primary font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {step === 1 && "Información"}
                    {step === 2 && "Envío"}
                    {step === 3 && "Pago"}
                  </span>
                  {step < 3 && (
                    <div
                      className={`w-12 h-0.5 mx-4 ${
                        currentStep > step ? "bg-babalu-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">{renderStep()}</div>
        </div>
      </div>

      {/* Columna del resumen */}
      <div className="lg:col-span-1">
        <ResumenCompra
          items={state.items}
          totalPrice={getTotalPrice()}
          shippingOption={formData.shippingOption}
        />
      </div>
    </div>
  );
}
