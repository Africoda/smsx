import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import * as jwt from "jsonwebtoken";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { users } from "@/db/schema";
import env from "@/env";

import type { LoginRoute, RegisterRoute } from "./auth.routes";

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const userData = c.req.valid("json");

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const [user] = await db.insert(users)
    .values({
      ...userData,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return c.json(user, HttpStatusCodes.CREATED);
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json(
      { message: "Invalid credentials" },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  const token = jwt.sign(
    { userId: user.id },
    env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  const { password: _, ...userWithoutPassword } = user;

  return c.json({
    token,
    user: userWithoutPassword,
  });
};
