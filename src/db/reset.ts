import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index.js";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { seed } from "./seed.js";

async function reset() {
    console.log("🔄 Resetting database...");

    try {
        // Disable foreign key checks to safely drop tables
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);

        // Fetch all base tables in the current database
        const [rows] = await db.execute(
            sql`SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'`
        );

        const tables = rows as unknown as Array<Record<string, any>>;
        
        for (const row of tables) {
            // MySQL could return TABLE_NAME or table_name depending on server case sensitivity configuration
            const key = Object.keys(row).find(k => k.toLowerCase() === "table_name");
            const tableName = key ? row[key] : null;

            if (tableName) {
                console.log(`🗑️ Dropping table: ${tableName}`);
                await db.execute(sql.raw(`DROP TABLE IF EXISTS \`${tableName}\``));
            }
        }

        // Re-enable foreign key checks
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
        console.log("✅ Database tables dropped successfully!");

        // Run migrations
        console.log("🔄 Running migrations...");
        await migrate(db, { migrationsFolder: "./src/db/migrations" });
        console.log("✅ Migrations completed successfully!");

        // Check if --seed argument is passed
        const shouldSeed = process.argv.includes("--seed");
        if (shouldSeed) {
            console.log("🌱 --seed flag detected. Starting seeding...");
            await seed();
        }
    } catch (error) {
        console.error("❌ Reset failed:", error);
        process.exit(1);
    }
}

reset().then(() => process.exit(0));
