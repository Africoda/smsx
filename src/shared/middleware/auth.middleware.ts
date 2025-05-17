import type { MiddlewareHandler } from "hono";

import { eq } from "drizzle-orm";
import * as jwt from "jsonwebtoken";
import * as HttpStatusCodes from "stoker/http-status-codes";

import db from "@/db";
import { users } from "@/db/schema";
import env from "@/env";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return c.json(
      { message: "Unauthorized" },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
    });

    if (!user) {
      return c.json(
        { message: "Unauthorized" },
        HttpStatusCodes.UNAUTHORIZED,
      );
    }

    c.set("user", user);
    await next();
  }
  catch {
    return c.json(
      { message: "Unauthorized" },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }
};
