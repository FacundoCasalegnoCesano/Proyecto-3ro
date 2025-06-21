import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "../contexts/cart-context"
import { CartModal } from "../components/cart-modal"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Babalu Aye Reiki & Tarot",
  description: "Armoniza Cuerpo, Mente y Espíritu",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          {children}
          <CartModal />
        </CartProvider>
      </body>
    </html>
  )
}
