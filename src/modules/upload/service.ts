import { parse } from "csv-parse/sync";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { AppError } from "@/utils/error";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^233\d{9}$/, "Invalid phone number format"),
});

export const uploadService = {
  async parseContacts(buffer: Buffer, userId: string) {
    try {
      const csvText = buffer.toString();
      const rows = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const validContacts: { userId: string; name: string; phone: string; }[] = [];
      const errors: string[] = [];

      rows.forEach((row: any, index: number) => {
        const result = contactSchema.safeParse(row);
        if (result.success) {
          validContacts.push({
            ...result.data,
            userId,
          });
        } else {
          errors.push(`Row ${index + 2}: ${result.error.issues[0].message}`);
        }
      });

      return {
        message: "CSV parsed successfully",
        data: {
          totalRows: rows.length,
          validRows: validContacts.length,
          errorRows: errors.length,
          errors,
          contacts: validContacts,
        },
      };
    } catch (error) {
      throw new AppError(
        "Failed to parse CSV file",
        HttpStatusCodes.BAD_REQUEST,
        { cause: error }
      );
    }
  },
};

export default uploadService;