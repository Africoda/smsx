import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { authSchema } from "../schemas/auth.schema";

const auth = new Hono();

auth.post("/register", zValidator("json", authSchema.register), (c) => {
  const data = c.req.valid("json");
  // Handle registration
});

auth.post("/login", zValidator("json", authSchema.login.body), (c) => {
  const data = c.req.valid("json");
  // Handle login
});
