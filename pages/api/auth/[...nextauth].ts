import prisma from "@/utils/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { AuthOptions, Session } from "next-auth";
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
    session: (async (session: Session) => {
      // using this empty callback seems to prompt the Prisma adapter to fetch a richer set of data from the database
      return session;
    }) as any,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);