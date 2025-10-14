import NextAuth from "next-auth"
import { authOptions } from "auth.config"

// ✅ Exportar solo el handler de NextAuth sin exportaciones adicionales
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }