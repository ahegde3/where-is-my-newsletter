import { db } from "@/lib/db";
import { users, accounts } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        // Test 1: Check if we can connect
        const result = await db.execute(sql`SELECT current_database(), current_user`);

        // Test 2: List all tables
        const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        // Test 3: Count records in users and accounts
        const userCount = await db.select().from(users);
        const accountCount = await db.select().from(accounts);

        return Response.json({
            success: true,
            connection: Array.isArray(result) ? result[0] : result,
            tables: Array.isArray(tables) ? tables : [],
            counts: {
                users: userCount.length,
                accounts: accountCount.length,
            }
        });
    } catch (error: any) {
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
