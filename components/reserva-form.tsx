"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { GoogleCalendarIntegration } from "./google-calendar-integration";

interface ServicioOption {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  description: string;
}

interface FormData {
  servicio: string;
  fecha: string;
  hora: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  mensaje: string;
}

interface FormErrors {
  servicio?: string;
  fecha?: string;
  hora?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  general?: string;
}

interface ReservaResponse {
  success: boolean;
  reservaId?: string;
  eventId?: string;
  eventLink?: string;
  error?: string;
  details?: string;
}

export function ReservaForm() {
  const [formData, setFormData] = useState<FormData>({
    servicio: "",
    fecha: "",
    hora: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<{[key: string]: boolean}>({});

  const servicios: ServicioOption[] = useMemo(
    () => [
      {
        id: "tarot",
        title: "Lectura de Tarot",
        subtitle: "Tarot Rider-Waite",
        price: "$3500",
        duration: "60 minutos",
        description:
          "Consultas personalizadas de Tarot para guiar tu camino espiritual.",
      },
      {
        id: "reiki",
        title: "Sesión de Reiki",
        subtitle: "Sanación Energética",
        price: "$4000",
        duration: "90 minutos",
        description:
          "Terapia de sanación energética para equilibrar los chakras y reducir el estrés.",
      },
      {
        id: "limpieza-espiritual",
        title: "Limpieza Espiritual",
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
    ],
    []
  );

  // ✅ Mover horariosDisponibles a useMemo para evitar recreación en cada render
  const horariosDisponibles = useMemo(() => [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ], []);

  // Pre-seleccionar servicio si viene en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const servicioParam = urlParams.get("servicio");
    if (servicioParam && servicios.find((s) => s.id === servicioParam)) {
      setFormData((prev) => ({ ...prev, servicio: servicioParam }));
    }
  }, [servicios]);

  // ✅ Cargar horarios disponibles desde la API - usando useCallback
  const loadAvailableSlots = useCallback(async (fecha: string) => {
    try {
      setCheckingAvailability(true);
      const response = await fetch(`/api/check-availability?fecha=${fecha}`);
      const result = await response.json();

      if (result.success) {
        // Actualizar disponibilidad de cada slot
        const availabilityMap: {[key: string]: boolean} = {};
        horariosDisponibles.forEach(slot => {
          availabilityMap[slot] = result.availableSlots.includes(slot);
        });
        setSlotAvailability(availabilityMap);
      } else {
        console.error("Error cargando horarios disponibles:", result.error);
        // En caso de error, mostrar todos como disponibles
        const availabilityMap: {[key: string]: boolean} = {};
        horariosDisponibles.forEach(slot => {
          availabilityMap[slot] = true;
        });
        setSlotAvailability(availabilityMap);
      }
    } catch (error) {
      console.error("Error cargando horarios disponibles:", error);
      // En caso de error, mostrar todos como disponibles
      const availabilityMap: {[key: string]: boolean} = {};
      horariosDisponibles.forEach(slot => {
        availabilityMap[slot] = true;
      });
      setSlotAvailability(availabilityMap);
    } finally {
      setCheckingAvailability(false);
    }
  }, [horariosDisponibles]); // ✅ Ahora horariosDisponibles es estable

  // ✅ Cargar horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (formData.fecha && formData.servicio) {
      loadAvailableSlots(formData.fecha);
    }
  }, [formData.fecha, formData.servicio, loadAvailableSlots]);

  // ✅ Verificar disponibilidad antes de enviar
  const checkAvailabilityBeforeSubmit = useCallback(async (): Promise<boolean> => {
    if (!formData.fecha || !formData.hora || !formData.servicio) {
      return false;
    }

    try {
      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha: formData.fecha,
          hora: formData.hora,
          servicioId: formData.servicio
        }),
      });

      const result = await response.json();

      if (result.success && result.available) {
        return true;
      } else {
        setErrors({
          general: `El horario seleccionado no está disponible. Por favor selecciona otro horario.`
        });
        return false;
      }
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      // En caso de error, permitir el envío pero mostrar advertencia
      setErrors({
        general: `No se pudo verificar la disponibilidad. Por favor intenta nuevamente.`
      });
      return false;
    }
  }, [formData.fecha, formData.hora, formData.servicio]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar errores
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleServicioSelect = (servicioId: string) => {
    setFormData((prev) => ({ ...prev, servicio: servicioId }));
    if (errors.servicio) {
      setErrors((prev) => ({ ...prev, servicio: undefined }));
    }
  };

  const handleDateSelect = (fecha: string) => {
    setFormData((prev) => ({ ...prev, fecha, hora: "" })); // Reset hora al cambiar fecha
    if (errors.fecha) {
      setErrors((prev) => ({ ...prev, fecha: undefined }));
    }
  };

  const handleHoraSelect = (hora: string) => {
    setFormData((prev) => ({ ...prev, hora }));
    if (errors.hora) {
      setErrors((prev) => ({ ...prev, hora: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.servicio) newErrors.servicio = "Selecciona un servicio";
    if (!formData.fecha) newErrors.fecha = "Selecciona una fecha";
    if (!formData.hora) newErrors.hora = "Selecciona un horario";

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = "El apellido debe tener al menos 2 caracteres";
    }

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!/^\+?[\d\s\-()]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = "Ingresa un teléfono válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Verificar disponibilidad antes de proceder
    const isAvailable = await checkAvailabilityBeforeSubmit();
    if (!isAvailable) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const servicioSeleccionado = servicios.find(
        (s) => s.id === formData.servicio
      );

      if (!servicioSeleccionado) {
        throw new Error("Servicio no encontrado");
      }

      const reservaData = {
        servicio: servicioSeleccionado,
        fecha: formData.fecha,
        hora: formData.hora,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        mensaje: formData.mensaje.trim(),
      };

      const response = await fetch("/api/crearReserva", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservaData }),
      });

      const result: ReservaResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error al crear la reserva");
      }

      console.log("Reserva creada exitosamente:", result);
      setSuccessMessage(
        `¡Reserva confirmada! ID: ${result.reservaId}. Te contactaremos pronto para confirmar los detalles.`
      );

      // Limpiar formulario después de 5 segundos
      setTimeout(() => {
        setFormData({
          servicio: "",
          fecha: "",
          hora: "",
          nombre: "",
          apellido: "",
          email: "",
          telefono: "",
          mensaje: "",
        });
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error al enviar reserva:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Error al enviar la reserva. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    window.location.href = "/servicios";
  };

  const servicioSeleccionado = servicios.find(
    (s) => s.id === formData.servicio
  );

  return (
    <div className="bg-white shadow-lg rounded-lg">
      {/* Header con botón de volver */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Nueva Reserva</h2>
          <p className="text-sm text-gray-600">
            {servicioSeleccionado
              ? `Reservar: ${servicioSeleccionado.title}`
              : "Completa los datos para agendar tu sesión"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Servicios</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-8">
        {/* Mensajes de estado */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Selección de Servicio - Solo mostrar si no hay servicio preseleccionado */}
        {!servicioSeleccionado && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-babalu-primary" />
              Selecciona tu Servicio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicios.map((servicio) => (
                <div
                  key={servicio.id}
                  onClick={() => handleServicioSelect(servicio.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.servicio === servicio.id
                      ? "border-babalu-primary bg-babalu-primary/5"
                      : "border-gray-200 hover:border-babalu-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {servicio.title}
                    </h4>
                    <span className="text-lg font-bold text-babalu-primary">
                      {servicio.price}
                    </span>
                  </div>
                  <p className="text-sm text-babalu-primary font-medium mb-2">
                    {servicio.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {servicio.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{servicio.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            {errors.servicio && (
              <p className="mt-1 text-sm text-red-600">{errors.servicio}</p>
            )}
          </div>
        )}

        {/* Resumen del servicio seleccionado */}
        {servicioSeleccionado && (
          <div className="bg-babalu-primary/5 border border-babalu-primary/20 rounded-lg p-6">
            <h4 className="font-semibold text-babalu-primary mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Servicio Seleccionado:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-bold text-gray-800 text-lg">
                  {servicioSeleccionado.title}
                </h5>
                <p className="text-babalu-primary font-medium">
                  {servicioSeleccionado.subtitle}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {servicioSeleccionado.description}
                </p>
              </div>
              <div className="text-right md:text-left">
                <p className="text-2xl font-bold text-babalu-primary">
                  {servicioSeleccionado.price}
                </p>
                <div className="flex items-center justify-end md:justify-start text-gray-600 mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="font-medium">
                    {servicioSeleccionado.duration}
                  </span>
                </div>
              </div>
            </div>
            {!formData.servicio && (
              <Button
                type="button"
                onClick={() => handleServicioSelect(servicioSeleccionado.id)}
                className="mt-4 bg-babalu-primary hover:bg-babalu-dark text-white"
              >
                Confirmar Servicio
              </Button>
            )}
          </div>
        )}

        {/* Selección de Fecha y Hora - Solo mostrar si hay servicio seleccionado */}
        {formData.servicio && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-babalu-primary" />
              Fecha y Horario
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona una fecha
                </label>
                <GoogleCalendarIntegration
                  selectedDate={formData.fecha}
                  onDateSelect={handleDateSelect}
                />
                {errors.fecha && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
                )}
              </div>

              {/* Horarios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horarios disponibles
                  {checkingAvailability && (
                    <span className="ml-2 text-xs text-blue-600">
                      <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                      Verificando disponibilidad...
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {horariosDisponibles.map((hora) => {
                    const isAvailable = slotAvailability[hora] !== false; // true o undefined
                    const isSelected = formData.hora === hora;
                    
                    return (
                      <button
                        key={hora}
                        type="button"
                        onClick={() => isAvailable && handleHoraSelect(hora)}
                        disabled={!isAvailable}
                        className={`p-2 text-sm rounded-md border transition-all relative ${
                          isSelected
                            ? "bg-babalu-primary text-white border-babalu-primary"
                            : isAvailable
                            ? "bg-white text-gray-700 border-gray-300 hover:border-babalu-primary hover:bg-babalu-primary/5"
                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        }`}
                        title={!isAvailable ? "Horario no disponible" : ""}
                      >
                        {hora}
                        {!isAvailable && (
                          <XCircle className="w-3 h-3 absolute -top-1 -right-1 text-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Leyenda de disponibilidad */}
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-babalu-primary rounded"></div>
                    <span>Seleccionado</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                    <span>Ocupado</span>
                  </div>
                </div>
                
                {errors.hora && (
                  <p className="mt-1 text-sm text-red-600">{errors.hora}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Información Personal - Solo mostrar si hay fecha y hora seleccionadas */}
        {formData.fecha && formData.hora && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-babalu-primary" />
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                    errors.nombre ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Tu nombre"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label
                  htmlFor="apellido"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Apellido
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                    errors.apellido ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Tu apellido"
                />
                {errors.apellido && (
                  <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary ${
                    errors.telefono ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="+54 11 1234-5678"
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                )}
              </div>
            </div>

            {/* Mensaje adicional */}
            <div className="mt-6">
              <label
                htmlFor="mensaje"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Mensaje adicional (opcional)
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={4}
                value={formData.mensaje}
                onChange={handleInputChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-babalu-primary focus:border-babalu-primary resize-none"
                placeholder="Cuéntanos sobre tus expectativas o cualquier información relevante para la sesión..."
              />
            </div>
          </div>
        )}

        {/* Botones de acción - Solo mostrar si el formulario está completo */}
        {formData.nombre &&
          formData.apellido &&
          formData.email &&
          formData.telefono && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoBack}
                className="px-6 py-3 bg-transparent"
                disabled={isLoading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-babalu-primary hover:bg-babalu-dark text-white px-8 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-babalu-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando reserva...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Confirmar Reserva
                  </>
                )}
              </Button>
            </div>
          )}

        {/* Información adicional */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium mb-2">📝 Información importante:</p>
          <ul className="space-y-1 text-xs">
            <li>
              • Recibirás una confirmación por email con los detalles de tu
              reserva
            </li>
            <li>
              • Te contactaremos dentro de las próximas 24 horas para confirmar
              la ubicación
            </li>
            <li>
              • Puedes cancelar o reprogramar tu cita hasta 24 horas antes
            </li>
            <li>
              • Para consultas urgentes, puedes contactarnos directamente por
              WhatsApp
            </li>
            <li>
              • Los horarios mostrados se actualizan en tiempo real según disponibilidad
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
}