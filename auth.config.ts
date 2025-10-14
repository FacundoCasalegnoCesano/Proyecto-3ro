// auth.config.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic'

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

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password: true,
              nombre: true,
              apellido: true,
              fechaNac: true,
              rol: true,
            }
          });

          if (!user) {
            throw new Error("Credenciales inválidas");
          }

          if (!user.password) {
            throw new Error("Error de configuración del usuario");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Credenciales inválidas");
          }

          return {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            fechaNac: user.fechaNac,
            rol: user.rol,
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
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT Callback - Usuario logueado:", { 
          id: user.id, 
          email: user.email, 
          rol: user.rol 
        });
        
        // ✅ Asegurar que el id sea number usando Number()
        token.id = Number(user.id);
        token.nombre = user.nombre;
        token.apellido = user.apellido;
        token.fechaNac = user.fechaNac;
        token.rol = user.rol;
      } else if (token.id) {
        // ✅ También asegurar en actualizaciones subsiguientes
        token.id = Number(token.id);
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log("Session Callback - Token ID:", token.id, "Rol:", token.rol);
        
        // ✅ Asegurar que el id sea number en la sesión también
        const userId = Number(token.id);
        
        session.user = {
          id: userId,
          nombre: token.nombre as string,
          apellido: token.apellido as string,
          fechaNac: token.fechaNac as Date,
          email: token.email as string,
          rol: token.rol as string,
        };
      }
      return session;
    }
  },
  pages: {
    signIn: "/iniciar-sesion",
    error: "/auth/error",
  },
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
        maxAge: 30 * 24 * 60 * 60,
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