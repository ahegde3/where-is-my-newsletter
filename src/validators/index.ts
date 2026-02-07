import { z } from "zod";

export const newsletterFilterSchema = z.object({
  topic: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const syncInputSchema = z.object({
  force: z.boolean().default(false),
});

export type NewsletterFilter = z.infer<typeof newsletterFilterSchema>;
export type SyncInput = z.infer<typeof syncInputSchema>;
