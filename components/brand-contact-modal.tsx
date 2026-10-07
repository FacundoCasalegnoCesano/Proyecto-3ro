"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

import { X, Building2, Mail, Phone, Globe, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface BrandContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: BrandContactFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface BrandContactFormData {
  brandName: string;
  email: string;
  phone: string;
  website: string;
  productType: string;
  message: string;
}

export function BrandContactModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: BrandContactModalProps) {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialogRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialogRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const data: BrandContactFormData = {
      brandName: formData.get("brandName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      website: formData.get("website") as string,
      productType: formData.get("productType") as string,
      message: formData.get("message") as string,
    };

    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const submitting = isSubmitting || localSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-contact-title"
        aria-describedby="brand-contact-description"
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
      >
        {/* Header - Fondo sólido sin degradado */}
        <div className="sticky top-0 z-10 bg-babalu-action p-6 text-white border-b border-white/20">
          {/* Botón X adicional en la parte superior derecha */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <h2
              id="brand-contact-title"
              className="text-2xl md:text-3xl font-bold"
            >
              Trabajemos Juntos
            </h2>
          </div>
          <p
            id="brand-contact-description"
            className="text-white text-sm md:text-base"
          >
            ¿Tu marca comparte nuestros valores? Nos encantaría conocerte y
            explorar oportunidades de colaboración.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información de la Marca - Unificada */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-babalu-primary" />
              Información de la Marca
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="brandName"
                  className="text-sm font-medium text-gray-700"
                >
                  Nombre de la Marca *
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="brandName"
                    name="brandName"
                    placeholder="Ej: Natura Cosmetics"
                    required
                    className="pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contacto@tumarca.com"
                    required
                    className="pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="website"
                  className="text-sm font-medium text-gray-700"
                >
                  Sitio Web
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://tumarca.com"
                    className="pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    className="pl-10"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="productType"
                className="text-sm font-medium text-gray-700"
              >
                Tipo de Productos *
              </Label>
              <Input
                id="productType"
                name="productType"
                placeholder="Ej: Cosméticos naturales, Productos biodegradables, etc."
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Mensaje */}
          <div className="space-y-2">
            <Label
              htmlFor="message"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4 text-babalu-primary" />
              Cuéntanos sobre tu marca *
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Comparte tu visión, valores, productos destacados y por qué crees que seríamos buenos socios..."
              required
              rows={5}
              className="resize-none"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500">
              Cuéntanos qué hace especial a tu marca y cómo alinean sus valores
              con los nuestros.
            </p>
          </div>

          {/* Info adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Dato importante:</strong> Priorizamos marcas
              comprometidas con la sostenibilidad y el cuidado del medio
              ambiente.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="min-h-11 w-full sm:w-auto bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-h-11 w-full sm:flex-1 bg-babalu-action hover:bg-babalu-dark text-white"
            >
              {submitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
