## Endpoint Creation

---

### Overview

This section outlines how to define, document, and register API endpoints in
SMSX using Hono, Zod, and the `createRouter` pattern. It supports both
**manual** and **dynamic** route definition workflows.

---

### 1. Define Routes Using `createRouter`

#### Step 1: Import `createRouter`

```ts
import { createRouter } from "@/lib/create-app";
```

#### Step 2: Use `.openapi()` to Register Routes

The `openapi()` method links:

1. A route schema defined using `createRoute`.
2. A handler/controller function.

---

### Simple Example

```ts
import { createMessageObjectSchema } from "@/shared/schemas";

import { createRouter } from "@/lib/create-app";
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

export default router;
```

---

### Advanced Example

```ts
import { createRouter } from "@/lib/create-app";

import * as handlers from "./tasks.handlers";
import * as routes from "./tasks.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
```

---

### 🔄 Modular Route Setup

#### Step 1: Create a Service

```ts
// services/businessLogic.ts
export function doSomething() {
  return { status: "OK" };
}
```

#### Step 2: Create a Controller

```ts
// controllers/defaultController.ts
import { HttpStatusCodes } from "@/lib/types";

import { doSomething } from "../services/businessLogic";

export async function defaultController(c) {
  return c.json(
    { message: "Default Controller", data: doSomething() },
    HttpStatusCodes.OK,
  );
}
```

---

### ✨ Summary

- Use `createRouter().openapi(...)` for static endpoints.
- Always keep routes cleanly separated from business logic.
- Follow consistent naming: `handlers`, `services`, `routes`, `controller`.

> Write routes as **contracts**: typed, documented, and version-ready.
