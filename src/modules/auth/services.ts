import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import env from '@/env';

import db from "@/db";
import { users } from "@/db/schema/schema";

const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.CLIENT_ORIGIN_URL}/auth/google/callback`
);

const authService = {
  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
    }).returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    return user;
  },

  async login(email: string, password: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),

    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  },

  async getUser(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  async verifyGoogleToken(token: string) {
    const { tokens } = await client.getToken(token);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as TokenPayload;
    
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
  }
};

export default authService;
