import { z } from 'zod';

export const GetSummarySchema = z.object({
  prompt: z
    .string()
    .min(1, { message: 'Le texte ne peut pas être vide.' })
    .max(4000, { message: 'Le texte ne peut pas dépasser 4000 caractères.' }),
  optimized: z.coerce.boolean(),
});

export type GetSummarySchemaType = z.infer<typeof GetSummarySchema>;
