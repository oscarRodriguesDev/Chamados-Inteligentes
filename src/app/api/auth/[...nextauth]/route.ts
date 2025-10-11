import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/src/lib/prisma";
import { compare } from "bcryptjs";

// Tipagem para o usuário devolvido na sessão/jwt
type SafeUser = {
  id: string;
  name: string;
  email: string;
  rules: string;
  setor: string;
  empresa: any;
  chamados: any[];
  avisos: any[];
};

async function getUserWithRelations(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      empresa: true,
      chamados: true,
      avisos: true,
    },
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await getUserWithRelations(credentials.email);
        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        // Retornar apenas dados necessários
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          rules: user.rules,
          setor: user.setor,
          empresa: user.empresa,
          chamados: user.chamados,
          avisos: user.avisos,
        } as SafeUser;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hora
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.user) {
        session.user = {
          ...session.user,
          ...token.user,
        };
      }
      return session;
    },
  },
  pages: {
    error: "/login?error=login", // redireciona para a página de login
  },
  debug: process.env.NODE_ENV === "development",
};

// App Router: exportar GET e POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
