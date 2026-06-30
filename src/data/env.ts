import "dotenv/config";
import z from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(8000),
    JWT_SECRET: z.string().default("super-secret-jwt-key-change-me"),
    DB_USER: z.string().default("root"),
    DB_PASSWORD: z.string().default("123"),
    DB_NAME: z.string().default("db_hono_api"),
    DB_HOST: z.string().default("127.0.0.1"),
    DB_PORT: z.coerce.number().default(3306),
    BETTER_AUTH_SECRET: z.string().optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}

export const env = parsed.data;
