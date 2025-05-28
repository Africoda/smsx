import { setCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { Context } from "hono";
import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";

import env from "@/env";
import db from "@/db";
import { users } from "@/db/schema/schema";
import { and } from "drizzle-orm";

import type { LoginRoute, RegisterRoute, GoogleOAuthCallbackRoute } from "./routes";
import authService from "./services";

// Define context variables
type Variables = {
  db: typeof db;
};

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const userData = c.req.valid("json");
  const db = c.get("db");

  const [user] = await db.insert(users).values(userData).returning();

  return c.json(user, HttpStatusCodes.CREATED);
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid("json");
  const db = c.get("db");

  const [user] = await db.select().from(users).where(
    and(
      eq(users.email, email),
      eq(users.password, password)
    )
  );

  if (!user) {
    return c.json({
      message: "Invalid email or password",
    }, HttpStatusCodes.UNAUTHORIZED);
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET);

  c.header("Access-Control-Allow-Credentials", "true");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  c.header("Access-Control-Allow-Headers", "*");

  setCookie(c, "token", token, {
    expires: new Date(new Date().setDate(new Date().getDate() + 7)),
    secure: true,
    sameSite: "None",
    httpOnly: true,
  });

  const { password: _, ...userWithoutPassword } = user;
  return c.json({
    token,
    user: userWithoutPassword,
    message: "Login Successful",
  }, HttpStatusCodes.OK);
};

export const oauthHandler = async (c: Context) => {
  const code = c.req.query("code");
  if (!code) {
    return c.json({ message: "No code provided" }, 400);
  }

  try {
    const googleUser = await authService.verifyGoogleToken(code);
    
    if (!googleUser.email) {
      return c.json({ message: "No email provided by Google" }, 400);
    }

    // Check if user exists
    const [existingUser] = await c.get("db")
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email));

    let user = existingUser;

    // If user doesn't exist, create one
    if (!existingUser) {
      [user] = await c.get("db")
        .insert(users)
        .values({
          email: googleUser.email,
          name: googleUser.name || "",
          password: "", // No password for OAuth users
          google_id: googleUser.id,
          profile_picture: googleUser.picture || "",
        })
        .returning();
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET);

    setCookie(c, "token", token, {
      expires: new Date(new Date().setDate(new Date().getDate() + 7)),
      secure: true,
      sameSite: "None",
      httpOnly: true,
    });

    const { password: _, ...userWithoutPassword } = user;
    return c.json({
      token,
      user: userWithoutPassword,
      message: "Google authentication successful",
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    return c.json({ message: "Google authentication failed" }, 401);
  }
};
