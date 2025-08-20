import { z } from "zod";

export const notifications = {
  create: z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    recipientId: z.string().uuid(),
    type: z.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]),
  }),
  list: z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10),
  }),
};
