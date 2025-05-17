## Endpoint Creation

### 1. Define Routes Using `createRouter`

- **Step 1: Create a Router**

  ```typescript
  import { createRouter } from "@/lib/create-app";
  ```

- **Step 2: OpenAPI Function**
  - The openAPI function takes two parameters:
    1. A route defined using `createRoute`.
    2. A handler or controller to handle the request.

### Example Usage

#### Simple Example

```typescript
import { createRoute, HttpStatusCodes, jsonContent } from "@/lib/types";

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
    c => c.json({ message: "Tasks API" }, HttpStatusCodes.OK),
  );
```

#### Advanced Example

```typescript
import { createRoute, HttpStatusCodes, jsonContent } from "@/lib/types";

import * as handlers from "./tasks.handlers";
import * as routes from "./tasks.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);
```

### Refactored for Simplicity

- **Create Services**

  ```typescript
  // services/businessLogic.ts
  export function doSomething() {
    // Business logic implementation
  }
  ```

- **Create Controllers or Handlers**

  - Use a consistent naming convention (e.g., `controller`).

  ```typescript
  // controllers/defaultController.ts
  import { createRoute, HttpStatusCodes, jsonContent } from "@/lib/types";

  import { doSomething } from "../services/businessLogic";

  export const defaultController: AppRouteHandler = async (c) => {
    return c.json({ message: "Default Controller", data: await doSomething() }, HttpStatusCodes.OK);
  };
  ```

- **Create Routes Dynamically**

  ```typescript
  // utils/routeSetup.ts
  import { createRoute, HttpStatusCodes, jsonContent } from "@/lib/types";

  import * as routes from "./tasks.routes";

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

### Using the Dynamic Route Setup

```typescript
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
