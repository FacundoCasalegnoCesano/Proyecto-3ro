import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      nombre: string;
      apellido: string;
      email: string;
      fechaNac: Date;
    }
  }

  interface User {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    fechaNac: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    nombre: string;
    apellido: string;
    fechaNac: Date;
  }
}