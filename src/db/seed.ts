import { db } from "./index.js";
import { user as UserTable } from "./schema/auth.js";
import { hashPassword } from "../lib/crypto.js";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Starting database seeding...");

    try {
        const adminEmail = "admin@kilex.com";

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

        await db.insert(UserTable).values({
            id: adminId,
            name: "Admin Kilex",
            email: adminEmail,
            passwordHash,
            role: "ADMIN",
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log("✅ Database seeding completed successfully!");
        console.log(`👤 Admin Account Created:`);
        console.log(`   📧 Email: ${adminEmail}`);
        console.log(`   🔑 Password: ${defaultPassword}`);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed().then(() => process.exit(0));
