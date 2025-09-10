import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import type { UploadContactsRoute } from "./routes";
import uploadService from "./service";
import { File } from "formdata-node";

export const uploadContacts: AppRouteHandler<UploadContactsRoute> = async (c) => {
  const userId = c.get("jwtPayload")?.userId;

  if (!userId) {
    return c.json(
      { message: "Unauthorized" },
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  const form = await c.req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return c.json(
      { message: "No file uploaded or file is invalid" },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  if (file.type !== "text/csv") {
    return c.json(
      { message: "Invalid file type. Please upload a CSV file" },
      HttpStatusCodes.BAD_REQUEST
    );
  }

  const buffer = await file.arrayBuffer();
  const result = await uploadService.parseContacts(
    Buffer.from(buffer),
    userId
  );

  return c.json(result, HttpStatusCodes.OK);
};