// app/api/auth/[...nextauth]/route.ts - VERSIÓN MÍNIMA CORREGIDA
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const dynamic = 'force-dynamic'

// Configuración mínima con tipos correctos
const minimalAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize() {
        // Siempre fallar temporalmente
        return null;
      }
    })
  ],
  session: { 
    strategy: "jwt" as const 
  },
  secret: process.env.NEXTAUTH_SECRET || "temp-secret-for-build",
  pages: {
    signIn: "/iniciar-sesion",
  },
};

const handler = NextAuth(minimalAuthOptions);

export { handler as GET, handler as POST };