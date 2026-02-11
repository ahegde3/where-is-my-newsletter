"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { publishers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Publisher } from "@/types";

export async function getPublishers(): Promise<Publisher[]> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const data = await db.query.publishers.findMany({
        where: eq(publishers.userId, session.user.id),
        orderBy: (publishers, { desc }) => [desc(publishers.createdAt)],
    });

    return data as Publisher[];
}

export async function createPublisher(name: string, email: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, error: "Invalid email format" };
    }

    try {
        const [newPublisher] = await db
            .insert(publishers)
            .values({
                userId: session.user.id,
                name: name.trim() || null,
                email: email.trim().toLowerCase(),
            })
            .returning();

        return { success: true, data: newPublisher };
    } catch (error) {
        console.error("Failed to create publisher:", error);
        return { success: false, error: "Failed to create publisher" };
    }
}

export async function deletePublisher(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        await db
            .delete(publishers)
            .where(and(eq(publishers.id, id), eq(publishers.userId, session.user.id)));

        return { success: true };
    } catch (error) {
        console.error("Failed to delete publisher:", error);
        return { success: false, error: "Failed to delete publisher" };
    }
}
