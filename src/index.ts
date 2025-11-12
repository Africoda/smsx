import { serve } from "@hono/node-server";

import app from "./app";
import env from "./env";

const port = env.PORT;
// eslint-disable-next-line no-console
console.log(`Server is running on port http://localhost:${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

// Graceful shutdown
function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    // eslint-disable-next-line no-console
    console.log("Server closed. Exiting process.");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
