## endpoint creation

- uses create router from create-app.ts
- its openapi function takes two params: a route defined with create route and a handler or controller
  examples:

```ts
const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/",
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          createMessageObjectSchema("Tasks API"),
          "Tasks API Index",
        ),
      },
    }),
    (c) => {
      return c.json({
        message: "Tasks API",
      }, HttpStatusCodes.OK);
    },
  );

```

and a more advanced form

```ts
import * as handlers from "./tasks.handlers";
import * as routes from "./tasks.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);
```

now refactored for simplicity

- create your services to handle business logic and interaction with external services
- create your controllers or handlers ( we'll go with the naming controller for consistency and familiarity sake)
- create your routes

you can also use this option:

```ts
// utils/routeSetup.ts
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import type { AppRouteHandler } from "@/lib/types";

import { createRouter } from "@/lib/create-app";

// This function sets up a route dynamically with a given config
export function setupRoute(config: {
  method: string;
  path: string;
  controller: AppRouteHandler;
  responseSchema: any;
  tags?: string[];
}) {
  const router = createRouter();
  router.openapi(
    createRoute({
      tags: config.tags || ["Default"],
      method: config.method,
      path: config.path,
      responses: {
        [HttpStatusCodes.OK]: jsonContent(config.responseSchema, `Response for ${config.path}`),
      },
    }),
    config.controller
  );
  return router;
}
```

using it

```ts
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { defaultController } from "../controllers/defaultController";
import { setupRoute } from "../utils/routeSetup";

// Define your route setup configuration
const routeConfig = {
  method: "get",
  path: "/tasks",
  controller: defaultController,
  responseSchema: createMessageObjectSchema("Tasks API"),
  tags: ["Tasks"],
};
// Set up the route dynamically
const router = setupRoute(routeConfig);
export default router;
```
