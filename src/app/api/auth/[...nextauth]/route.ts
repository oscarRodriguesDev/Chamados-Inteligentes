export const dynamic = "force-dynamic";


import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/src/lib/prisma";

type User  = {
  id: number;
  name: string | null;
  email: string | null;
  rules: string | null;
  setor: string | null;
  empresa: any;
  chamados: any[];
  avisos: any[];
} ;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rules: string;
      setor: string;
      empresaID: number;
      empresa: any;
      chamados: any[];
      avisos: any[];
    } & DefaultSession["user"];
  }


}



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

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 },
  providers: [
  CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Senha", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Email e senha são obrigatórios.");
    }

    // Busca usuário no Prisma
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: { empresa: true }, // incluir relações se quiser
    });

    if (!user) throw new Error("Usuário não encontrado.");
    if (!user.password) throw new Error("Senha não configurada.");

    const isValid = await compare(credentials.password, user.password);
    if (!isValid) throw new Error("Senha incorreta.");

    // Retorna o usuário com id como string
    return {
      ...user,
      id: String(user.id),
    } as unknown as import("next-auth").User;
  },
}),

  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = {
          ...session.user,
          ...(token.user as any),
          id: String((token.user as any).id),
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=login",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
