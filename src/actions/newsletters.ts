"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { newsletters } from "@/lib/db/schema";
import { desc, arrayContains, and, eq } from "drizzle-orm";

import { NewsletterWithPublisher } from "@/types";

export async function getNewsletters(topic?: string): Promise<NewsletterWithPublisher[]> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const conditions = [eq(newsletters.userId, session.user.id)];

    if (topic && topic !== "all") {
        // Array contains topic
        conditions.push(arrayContains(newsletters.topics, [topic]));
    }

    const data = await db.query.newsletters.findMany({
        where: and(...conditions),
        orderBy: [desc(newsletters.receivedAt)],
        limit: 50, // Limit for MVP
        with: {
            publisher: true,
        },
    });

    return data as unknown as NewsletterWithPublisher[];
}

export async function toggleReadStatus(id: string, isRead: boolean) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await db
        .update(newsletters)
        .set({ isRead })
        .where(and(eq(newsletters.id, id), eq(newsletters.userId, session.user.id)));

    return { success: true };
}
