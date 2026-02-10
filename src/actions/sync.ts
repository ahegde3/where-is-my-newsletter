"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { newsletters, publishers } from "@/lib/db/schema";
import { processNewsletter } from "@/lib/pipeline";
import { actionClient } from "../lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fetchNewsletters } from "@/lib/gmail";

// Helper to decode base64url (no longer needed in this file, but might be used if we needed raw access, removing for now if unused or keeping if needed. Actually fetchNewsletters returns parsed data, so we don't need decodeBase64 here anymore)

export const syncNewsletters = actionClient
    .schema(z.object({}))
    .action(async () => {
        const session = await auth();
        if (!session?.user?.id || !session.accessToken) {
            throw new Error("Unauthorized");
        }

        // 1. Fetch messages using helper
        let fetchedNewsletters;
        try {
            fetchedNewsletters = await fetchNewsletters({
                accessToken: session.accessToken,
                maxResults: 20,
            });
        } catch (error: any) {
            // Check if it's a scope/permission error
            if (
                error?.message?.includes('insufficient authentication scopes') ||
                error?.code === 403 ||
                error?.errors?.[0]?.reason === 'insufficientPermissions'
            ) {
                throw new Error(
                    'Gmail access not authorized. Please sign out and sign back in to grant Gmail permissions.'
                );
            }
            // Re-throw other errors
            throw error;
        }
        console.log("Fetched newsletters count:", fetchedNewsletters.length);
        let syncedCount = 0;

        for (const newsletter of fetchedNewsletters) {
            // Check if already processed
            const existing = await db.query.newsletters.findFirst({
                where: (table, { and, eq }) =>
                    and(eq(table.userId, session.user!.id!), eq(table.messageId, newsletter.id)),
            });

            if (existing) continue;

            // 2. Run Pipeline
            let processed;
            try {
                processed = await processNewsletter(newsletter.htmlBody || newsletter.plainText || "");
            } catch (err) {
                console.error(`Pipeline failed for msg ${newsletter.id}`, err);
                processed = {
                    htmlBody: newsletter.htmlBody || "",
                    cleanedText: newsletter.plainText || "",
                    summary: "Processing failed.",
                    topics: [],
                    viewInBrowserLink: undefined,
                }
            }


            // 3. Save to DB
            let publisherId: string;
            // Use sender email from parsed newsletter
            const senderEmail = newsletter.from.email;
            const senderName = newsletter.from.name;

            const existingPublisher = await db.query.publishers.findFirst({
                where: (table, { and, eq }) =>
                    and(eq(table.userId, session.user!.id!), eq(table.email, senderEmail)),
            });

            if (existingPublisher) {
                publisherId = existingPublisher.id;
            } else {
                const [newPub] = await db
                    .insert(publishers)
                    .values({
                        userId: session.user!.id!,
                        email: senderEmail,
                        name: senderName || senderEmail,
                    })
                    .returning();
                publisherId = newPub.id;
            }

            await db.insert(newsletters).values({
                userId: session.user!.id! as string,
                publisherId,
                messageId: newsletter.id,
                subject: newsletter.subject,
                receivedAt: newsletter.receivedAt,
                plainText: processed?.cleanedText,
                link: processed?.viewInBrowserLink,
                summary: processed?.summary,
                topics: (processed?.topics as string[]) || [],
                processedAt: new Date(),
            } as any);

            syncedCount++;
        }

        revalidatePath("/dashboard");
        return { synced: syncedCount, total: fetchedNewsletters.length };
    });
