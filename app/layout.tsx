import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "../contexts/cart-context"
import { CartModal } from "../components/cart-modal"
import { Providers } from "app/providers/SessionProvider"

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
        <Providers>
        <CartProvider>
          {children}
          <CartModal />
        </CartProvider>
        </Providers>
      </body>
    </html>
  )
}
