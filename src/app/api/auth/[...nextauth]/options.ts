import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import {User } from "next-auth";

interface Credentials{
  email?: string;
  password?: string;
};

// Extend the User type to include custom properties
declare module "next-auth" {
  interface User {
    _id?: string;
    username?: string;
    password?: string;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    messages: unknown[];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        // email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Credentials | undefined): Promise<User> {
        await dbConnect();
        console.log('Authorizing user:', credentials);
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials?.email },
              { username: credentials?.email },
            ],
          });
          if (!user) {
            throw new Error('No user found with this email');
          }
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }
          if (!credentials?.password) return {} as User;

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          console.log('verified user ',user.isVerified);
          console.log("user broooo - ",user);
          if (isPasswordCorrect) {
            return user as User;
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err:unknown) {
          console.error('Authorize error:', err);
          return {} as User;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};