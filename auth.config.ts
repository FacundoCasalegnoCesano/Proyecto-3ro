// auth.config.ts
import type { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic'

// Extender la interfaz de usuario de NextAuth para incluir tus campos personalizados + rol
declare module "next-auth" {
  interface User {
    id: string;
    nombre: string;
    apellido: string;
    fechaNac: Date;
    rol: string; // Nuevo campo
  }
  
  interface Session {
    user: {
      id: string;
      nombre: string;
      apellido: string;
      email: string;
      fechaNac: Date;
      rol: string; // Nuevo campo
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nombre: string;
    apellido: string;
    fechaNac: Date;
    rol: string; // Nuevo campo
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email y contraseña son requeridos");
          }

          // Buscar usuario en la base de datos incluyendo el rol
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password: true,
              nombre: true,
              apellido: true,
              fechaNac: true,
              rol: true, // Incluir el rol
            }
          });

          if (!user) {
            throw new Error("Credenciales inválidas");
          }

          if (!user.password) {
            throw new Error("Error de configuración del usuario");
          }

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Credenciales inválidas");
          }

          // Retornar usuario con todos los campos necesarios incluyendo rol
          return {
            id: user.id.toString(),
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            fechaNac: user.fechaNac,
            rol: user.rol, // Incluir el rol
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          throw new Error("Error durante la autenticación");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      // Solo agregar datos del usuario en el primer login
      if (user) {
        console.log("JWT Callback - Usuario logueado:", { 
          id: user.id, 
          email: user.email, 
          rol: user.rol 
        });
        token.id = user.id;
        token.nombre = user.nombre;
        token.apellido = user.apellido;
        token.fechaNac = user.fechaNac;
        token.rol = user.rol; // Incluir el rol en el token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log("Session Callback - Token ID:", token.id, "Rol:", token.rol);
        // Campos personalizados
        session.user.id = token.id;
        session.user.nombre = token.nombre as string;
        session.user.apellido = token.apellido as string;
        session.user.fechaNac = token.fechaNac as Date;
        session.user.email = token.email as string;
        session.user.rol = token.rol as string; // Incluir el rol en la sesión
        
        // Campos estándar de NextAuth (opcional)
        session.user.name = `${token.nombre} ${token.apellido}`.trim();
        session.user.image = null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/iniciar-sesion",
    error: "/auth/error",
  },
  // Agregar configuración de cookies y secret
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 días
      },
    },
  },
  events: {
    async signIn({ user }) {
      console.log("Usuario firmando:", user.email, "Rol:", user.rol);
    },
    async session({ session }) {
      console.log("Sesión activa para:", session.user.email, "Rol:", session.user.rol);
    },
    async signOut({ session }) {
      console.log("Usuario cerrando sesión");
    },
  },
  debug: process.env.NODE_ENV === "development",
};