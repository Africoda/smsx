import { setCookie } from "hono/cookie";
import * as jwt from "jsonwebtoken";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import env from "@/env";

import type { LoginRoute, RegisterRoute } from "./routes";

import Auth from "./services";

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const userData = c.req.valid("json");

  const user = await Auth.register(userData.email, userData.password);

  return c.json(user, HttpStatusCodes.CREATED);
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await Auth.login(email, password);

  if (!user) {
    return c.json({
      message: "Invalid email or password",
    }, HttpStatusCodes.UNAUTHORIZED);
  }

  const token = jwt.sign(
    { userId: user.id },
    env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  c.header("Access-Control-Allow-Credentials", "true");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  c.header("Access-Control-Allow-Headers", "*");
  // c.header("Access-Control-Allow-Origin", env.CLIENT_ORIGIN_URL);

  setCookie(c, "token", token, {
    expires: new Date(new Date().setDate(new Date().getDate() + 7)),
    secure: true,
    sameSite: "None",
    httpOnly: true,
  });

  return c.json({
    token,
    user,
    message: "Login Successful",
  }, HttpStatusCodes.OK);
};
