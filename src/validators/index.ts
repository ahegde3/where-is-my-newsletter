import { z } from "zod";

export const newsletterFilterSchema = z.object({
  topic: z.string().optional(),
  readStatus: z.enum(["all", "read", "unread"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const syncInputSchema = z.object({
  force: z.boolean().default(false),
});

export const publisherSchema = z.object({
  name: z.string().nullable(),
  email: z.string().email(),
});

export type NewsletterFilter = z.infer<typeof newsletterFilterSchema>;
export type SyncInput = z.infer<typeof syncInputSchema>;
export type PublisherInput = z.infer<typeof publisherSchema>;
