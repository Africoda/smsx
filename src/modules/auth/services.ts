import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import db from "@/db";
import { refreshTokens } from "@/db/schema/auth";
import { users } from "@/db/schema/schema";

const Auth = {
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

  async storeRefreshToken(userId: string, token: string, expiresAt: Date) {
    const [refreshToken] = await db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
    }).returning({
      id: refreshTokens.id,
      userId: refreshTokens.userId,
      token: refreshTokens.token,
      expiresAt: refreshTokens.expiresAt,
    });

    return refreshToken;
  },
  async getRefreshToken(token: string) {
    return db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, token),
    });
  },

  async rotateToken(token: string, newToken: string, newExpires: Date) {
    const existing = await this.getRefreshToken(token);
    if (!existing) {
      throw new Error("Refresh token not found");
    }
    await db.transaction(async (trx) => {
      await trx.delete(refreshTokens).where(eq(refreshTokens.token, token));
      await trx.insert(refreshTokens).values({
        userId: existing.userId,
        token: newToken,
        expiresAt: newExpires,
      });
    });
  },
  async deleteRefreshToken(token: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  },
};

export default Auth;
