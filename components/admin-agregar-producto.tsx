"use client";

import { useSession } from "next-auth/react";
import { AgregarProducto } from "./agregar-producto";

interface AdminAgregarProductoProps {
  onAddProduct?: () => void;
  className?: string;
}

export function AdminAgregarProducto({
  onAddProduct,
  className,
}: AdminAgregarProductoProps) {
  const { data: session, status } = useSession();

  // Mientras carga la sesión, no mostrar nada
  if (status === "loading") {
    return null;
  }

  // Si no hay sesión o el usuario no está autenticado, no mostrar
  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  // Solo mostrar si el usuario tiene rol de admin
  const userRole = session.user.rol?.toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "administrator";

  if (!isAdmin) {
    return null;
  }

  // Si es admin, mostrar el componente AgregarProducto
  return <AgregarProducto onAddProduct={onAddProduct} className={className} />;
}
