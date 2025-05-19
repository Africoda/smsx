import { createRouter } from "@/lib/create-app";

import * as handlers from "./handlers";
import * as routes from "./routes";

const router = createRouter();

router
  .openapi(routes.register, handlers.register)
  .openapi(routes.login, handlers.login);

export default router;
