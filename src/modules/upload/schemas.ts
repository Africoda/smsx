import { z } from "zod";

export const uploadResponseSchema = z.object({
    message: z.string(),
    data: z.object({
        totalRows: z.number(),
        validRows: z.number(),
        errorRows: z.number(),
        errors: z.array(z.string()),
        contacts: z.array(
            z.object({
                userId: z.string(),
                name: z.string(),
                phone: z.string(),
            })
        ),
    }),
});

    