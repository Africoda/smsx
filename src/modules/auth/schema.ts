import { z } from "zod";

export const auth = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(3),
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  logout: z.object({}),
  me: z.object({}),
};

export const GoogleAuthSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().optional()
});

export type GoogleAuthData = z.infer<typeof GoogleAuthSchema>;
