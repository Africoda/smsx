import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { z } from "zod";
import { badRequestSchema } from "@/lib/constants";
import { uploadResponseSchema } from "./schemas";

export const uploadContacts = createRoute({
    path: "/upload",
    method: "post",
    tags: ["Contacts"],
    security: [
        {
            Bearer: [],
        },
    ],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        file: z.any(),
                    }),
                }
            }
        },
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            uploadResponseSchema,
            "CSV uploaded successfully"
        ),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            badRequestSchema,
            "Invalid file format"
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            badRequestSchema,
            "Unauthorized"
        ),
    },
});

export type UploadContactsRoute = typeof uploadContacts;