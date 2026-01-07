import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { getDb } from './mongodb';
import { User } from '@/models/types';
import { ObjectId } from 'mongodb';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        const db = await getDb();
        const user = await db.collection<User>('users').findOne({
          email: credentials.email
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email,
        };
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account?.provider === 'github' && account.access_token) {
        token.githubAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.githubAccessToken = token.githubAccessToken as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle GitHub OAuth sign in
      if (account?.provider === 'github') {
        const db = await getDb();
        
        // Check if user exists
        const existingUser = await db.collection<User>('users').findOne({
          email: user.email || ''
        });

        if (existingUser) {
          // Update GitHub info
          await db.collection<User>('users').updateOne(
            { _id: existingUser._id },
            {
              $set: {
                githubAccessToken: account.access_token,
                githubUsername: (profile as { login?: string })?.login || user.name,
                updatedAt: new Date(),
              }
            }
          );
          user.id = existingUser._id.toString();
        } else {
          // Create new user from GitHub
          const newUser: Omit<User, '_id'> = {
            email: user.email || '',
            password: '', // No password for OAuth users
            name: user.name || '',
            githubAccessToken: account.access_token,
            githubUsername: (profile as { login?: string })?.login || user.name,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result = await db.collection<User>('users').insertOne(newUser as User);
          user.id = result.insertedId.toString();
        }
      }
      return true;
    },
  },
};
