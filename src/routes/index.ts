import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { createRouter } from "@/lib/create-app";
import sendsmsRouter from "@/modules/sendsms"; 

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/",
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          createMessageObjectSchema("SMSX API"),
          "SMSX API Index"
        ),
      },
    }),
    (c) => {
      return c.json(
        {
          message: "SMSX API",
        },
        HttpStatusCodes.OK
      );
    }
  )
  .route("/sendsms", sendsmsRouter);

export default router;
