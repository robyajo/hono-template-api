import "dotenv/config";
import { db } from "./index.js";
import { user as UserTable } from "./schema/auth.js";
import { hashPassword } from "../lib/crypto.js";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

export async function seed() {
    console.log("🌱 Starting database seeding...");

    try {
        const adminEmail = "admin@gmail.com";
        const userEmail = "user@gmail.com";

        // Check if admin already exists
        const [existingAdmin] = await db
            .select()
            .from(UserTable)
            .where(eq(UserTable.email, adminEmail));

        if (existingAdmin) {
            console.log(`⚠️ Admin user with email "${adminEmail}" already exists. Skipping.`);
            return;
        }

        const defaultPassword = "adminpassword123";
        const passwordHash = await hashPassword(defaultPassword);
        const adminId = randomUUID();
        const userId = randomUUID();

        await db.insert(UserTable).values({
            id: adminId,
            name: "Admin",
            email: adminEmail,
            passwordHash,
            role: "ADMIN",
            emailVerified: true,
            createdFrom: "system",
            image: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await db.insert(UserTable).values({
            id: userId,
            name: "User",
            email: userEmail,
            passwordHash,
            role: "USER",
            emailVerified: true,
            createdFrom: "system",
            image: "https://api.dicebear.com/7.x/adventurer/svg?seed=User",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log("✅ Database seeding completed successfully!");
        console.log(`👤 Accounts Created:`);
        console.log(`   👑 Admin:`);
        console.log(`      📧 Email: ${adminEmail}`);
        console.log(`      🔑 Password: ${defaultPassword}`);
        console.log(`   👤 User:`);
        console.log(`      📧 Email: ${userEmail}`);
        console.log(`      🔑 Password: ${defaultPassword}`);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

if (process.argv[1] && (process.argv[1].endsWith("seed.ts") || process.argv[1].endsWith("seed.js"))) {
    seed().then(() => process.exit(0));
}

