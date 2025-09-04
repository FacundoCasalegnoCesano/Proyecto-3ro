// auth.config.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

// Extender la interfaz de usuario de NextAuth para incluir tus campos personalizados
declare module "next-auth" {
  interface User {
    id: string; // NextAuth requiere que el ID sea string
    nombre: string;
    apellido: string;
    fechaNac: Date;
  }
  
  interface Session {
    user: {
      id: string; // Mantener como string para consistencia con NextAuth
      nombre: string;
      apellido: string;
      email: string;
      fechaNac: Date;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // Mantener como string
    nombre: string;
    apellido: string;
    fechaNac: Date;
  }
}

export const authOptions: NextAuthOptions = {
  // NO USAR ADAPTER con credenciales y JWT
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        // Buscar usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Credenciales inválidas");
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Credenciales inválidas");
        }

        // Retornar usuario con todos los campos necesarios
        // Convertir el ID de number (Prisma) a string (NextAuth)
        return {
          id: user.id.toString(), // Convertir number a string
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          fechaNac: user.fechaNac,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // El user.id ya viene como string desde authorize()
        token.id = user.id;
        token.nombre = user.nombre;
        token.apellido = user.apellido;
        token.fechaNac = user.fechaNac;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Mantener como string - si necesitas number, convierte cuando uses la sesión
        session.user.id = token.id as string;
        session.user.nombre = token.nombre as string;
        session.user.apellido = token.apellido as string;
        session.user.fechaNac = token.fechaNac as Date;
      }
      return session;
    }
  },
  pages: {
    signIn: "/iniciar-sesion",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};