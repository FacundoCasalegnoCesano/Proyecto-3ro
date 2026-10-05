"use client";

import { Footer } from "../../components/footer";

export function FooterSection() {
  const footerContactInfo = {
    instagram: "Instagram",
    phone: "+54 9 3404 514018",
    email: "hola@babalu.com",
  };

  const footerText = {
    quote: "Tu energía habla más fuerte que tus palabras",
    copyright: "Todos los derechos reservados © 2026 Facundo Casalegno Cesano",
  };

  return <Footer contactInfo={footerContactInfo} footerText={footerText} />;
}
