import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    fechaNac: Date;
    rol: string;
  }

  interface Session {
    user: {
      id: number;
      nombre: string;
      apellido: string;
      email: string;
      fechaNac: Date;
      rol: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    nombre: string;
    apellido: string;
    fechaNac: Date;
    rol: string;
    email?: string; // ✅ Agregar email opcional para el token
  }
}