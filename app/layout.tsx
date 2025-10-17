// app/layout.tsx (más limpio)
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "app/providers/SessionProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Babalu Aye Reiki & Tarot",
  description: "Armoniza Cuerpo, Mente y Espíritu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
          duration={3000}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
