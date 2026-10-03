// auth.config.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        let stage = "user_lookup";
        try {
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
            },
          });

          if (!user) {
            return null;
          }

          if (!user.password) {
            return null;
          }

          stage = "password_compare";
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
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
          const errorRecord =
            typeof error === "object" && error !== null
              ? (error as Record<string, unknown>)
              : null;
          const allowedErrorNames = new Set([
            "Error",
            "TypeError",
            "RangeError",
            "PrismaClientKnownRequestError",
            "PrismaClientUnknownRequestError",
            "PrismaClientRustPanicError",
            "PrismaClientInitializationError",
            "PrismaClientValidationError",
          ]);
          const errorName =
            error instanceof Error && allowedErrorNames.has(error.name)
              ? error.name
              : "Unknown";
          const prismaCode =
            typeof errorRecord?.code === "string" &&
            /^P\d{4}$/.test(errorRecord.code)
              ? errorRecord.code
              : undefined;
          const prismaErrorCode =
            typeof errorRecord?.errorCode === "string" &&
            /^P\d{4}$/.test(errorRecord.errorCode)
              ? errorRecord.errorCode
              : undefined;

          console.error("Error en authorize", {
            stage,
            name: errorName,
            prismaCode,
            prismaErrorCode,
          });
          throw new Error("AuthServiceUnavailable");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.nombre = user.nombre;
        token.apellido = user.apellido;
        token.fechaNac = user.fechaNac;
        token.rol = user.rol;
      } else if (token.id) {
        token.id = Number(token.id);
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
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
    },
  },
  pages: {
    signIn: "/iniciar-sesion",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
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
};
