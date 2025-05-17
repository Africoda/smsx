import { defineConfig } from "drizzle-kit";

import env from "@/env";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  driver: "pglite",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
