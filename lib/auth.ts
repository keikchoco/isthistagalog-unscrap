import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import clientPromise from './mongodb';

const client = await clientPromise;

if (!client) {
  throw new Error('MONGODB_URI is required for Better Auth');
}

const db = process.env.MONGODB_DB ? client.db(process.env.MONGODB_DB) : client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'unscrap-development-secret-unscrap-development-secret',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});