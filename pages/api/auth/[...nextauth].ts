import prisma from "@/utils/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { AuthOptions, Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token, user }: { token: JWT, user: AdapterUser }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: (async (session: Session, token: JWT) => {
      if (token) {
        session.sessionToken = token.accessToken as string;
        session.user.id = token.id as string;
      }
      return session;
    }) as any,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);