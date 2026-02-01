import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
 providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID, // Убрали AUTH_ и добавили CLIENT
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (session?.user && user) {
        session.user.role = user.role;
        session.user.id = user.id;
      }
      return session;
    },
  },
})

