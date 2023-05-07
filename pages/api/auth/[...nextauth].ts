import prisma from "@/utils/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt(token, user, account, profile) {
      if (user) {
        token.id = user.id;
      } else if (account) {
        token.accessToken = account.access_token;
        token.id = profile.id;
      }
      return token;
    },
    async session(session, token) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user.id = token.id;
      }
      

      return session;
    },
  },

  /* adapter: {
    async getAdapter() {
      return {
        async createUser(profile) {
          return prisma.user.create({
            data: {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              image: profile.image,
            },
          });
        },
        async getUser(id) {
          return prisma.user.findUnique({
            where: { id },
          });
        },
        async getUserByEmail(email) {
          return prisma.user.findUnique({
            where: { email },
          });
        },
      };
    },
  }, */
};

export default NextAuth(authOptions);