import { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { googleAuth } from "@hono/oauth-providers/google";
import { setCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";

import { insertUsersSchema, selectUsersSchema, users } from "@/db/schema/schema";
import { unauthorizedSchema } from "@/lib/constants";
import env from "@/env"; // Make sure to import your env
import db from "@/db";
import { oauthHandler } from "./handlers";
// import { GoogleAuthSchema } from "./schema"; // Only import if you use it

const tags = ["Auth"];

export const register = createRoute({
  path: "/auth/register",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      insertUsersSchema,
      "User registration data",
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectUsersSchema.omit({ password: true }),
      "The registered user",
    ),
  },
});

export const login = createRoute({
  path: "/auth/login",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      "Login credentials",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        token: z.string(),
        user: selectUsersSchema.omit({ password: true }),
        message: z.string(),
      }),
      "Login successful",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Invalid credentials",
    ),
  },
});

// Google OAuth routes with OpenAPI documentation
export const googleOAuthInit = createRoute({
  path: "/auth/google",
  method: "get",
  tags,
  description: "Initiate Google OAuth flow",
  responses: {
    [HttpStatusCodes.MOVED_TEMPORARILY]: {
      description: "Redirects to Google OAuth consent screen",
      headers: z.object({
        Location: z.string().url(),
      }),
    },
  },
});

export const googleOAuthCallback = createRoute({
  path: "/auth/google/callback",
  method: "get",
  tags,
  description: "Google OAuth callback endpoint",
  request: {
    query: z.object({
      code: z.string(),
      scope: z.string(),
      authuser: z.string().optional(),
      prompt: z.string().optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        token: z.string(),
        user: selectUsersSchema.omit({ password: true }),
        message: z.string(),
      }),
      "Google authentication successful",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Google authentication failed",
    ),
  },
});

// Define context variables
type Variables = {
  db: typeof db;
};

const auth = new OpenAPIHono<{ Variables: Variables }>();

// Middleware to attach db to context
auth.use("*", async (c, next) => {
  c.set("db", db);
  await next();
});

// Register OpenAPI documented routes
auth.openapi(register, async (c) => {
  const userData = c.req.valid("json");
  const db = c.get("db");
  const [user] = await db.insert(users).values(userData).returning();
  return c.json(user, HttpStatusCodes.CREATED);
});

auth.openapi(login, async (c) => {
  const { email, password } = c.req.valid("json");
  const db = c.get("db");
  const [user] = await db.select().from(users).where(
    and(
      eq(users.email, email),
      eq(users.password, password)
    )
  );
  
  if (!user) {
    return c.json({ message: "Invalid email or password" }, HttpStatusCodes.UNAUTHORIZED);
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
});

// Google OAuth routes
const googleOAuthMiddleware = googleAuth({
  client_id: env.GOOGLE_CLIENT_ID,
  client_secret: env.GOOGLE_CLIENT_SECRET,
  scope: ["email", "profile"],
  redirect_uri: `${env.CLIENT_ORIGIN_URL}/auth/google/callback`
});

auth.get("/auth/google", googleOAuthMiddleware);

auth.openapi(googleOAuthCallback, async (c) => {
  const handler = oauthHandler as any; // Type assertion to bypass the complex type mismatch
  return handler(c);
});

export default auth;

export type RegisterRoute = typeof register;
export type LoginRoute = typeof login;
export type GoogleOAuthInitRoute = typeof googleOAuthInit;
export type GoogleOAuthCallbackRoute = typeof googleOAuthCallback;