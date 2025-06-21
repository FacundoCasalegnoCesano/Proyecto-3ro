"use client"

import { Footer } from "../../components/footer"

export function FooterSection() {
  const footerContactInfo = {
    instagram: "Instagram",
    phone: "+54 11 1234-5678",
    email: "hola@babalu.com",
  }

  const footerText = {
    quote: "Tu energía habla más fuerte que tus palabras",
    copyright: "Todos los derechos reservados © 2023 Facundo Castañio Cesario",
  }

  return <Footer contactInfo={footerContactInfo} footerText={footerText} />
}
