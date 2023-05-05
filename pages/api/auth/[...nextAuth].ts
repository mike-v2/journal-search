import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.JWT_SECRET
  /* callbacks: {
    async session(session, user) {
      session.userId = user.id;
      return session;
    },
  },
  adapter: prisma.adapter({
    prisma,
    modelMapping: {
      User: "user",
      Account: "account",
      Session: "session",
    },
  }), */
});