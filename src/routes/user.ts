import { Hono } from "hono";
import { z } from "zod";
import { describeRoute, validator, resolver } from "hono-openapi";
import { randomUUID } from "node:crypto";
import { db } from "../db/index.js";
import { user as UserTable } from "../db/schema/auth.js";
import { eq } from "drizzle-orm";
import { sessionMiddleware } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import type { AuthVariables } from "../middleware/auth.js";
import { hashPassword } from "../lib/crypto.js";
import { downloadAndSaveAvatar } from "../lib/avatar.js";

const app = new Hono<{
    Variables: AuthVariables;
}>();

const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["ADMIN", "USER"]).default("USER"),
    image: z.string().url().optional(),
});

const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(["ADMIN", "USER"]).optional(),
    image: z.string().url().nullable().optional(),
});

// All routes here require authentication
app.use("*", sessionMiddleware);

// 1. List all users (Admin only)
app.get(
    "/",
    describeRoute({
        summary: "List all users",
        description: "Retrieve a list of all users in the system (Admin only)",
        responses: {
            200: {
                description: "Success",
                content: {
                    "application/json": {
                        schema: resolver(
                            z.array(
                                z.object({
                                    id: z.string(),
                                    name: z.string(),
                                    email: z.string(),
                                    role: z.string(),
                                    image: z.string().nullable(),
                                    emailVerified: z.boolean(),
                                    createdAt: z.date(),
                                    updatedAt: z.date(),
                                })
                            )
                        ),
                    },
                },
            },
        },
    }),
    ensureAdmin,
    async (c) => {
        const users = await db
            .select({
                id: UserTable.id,
                name: UserTable.name,
                email: UserTable.email,
                role: UserTable.role,
                image: UserTable.image,
                emailVerified: UserTable.emailVerified,
                createdAt: UserTable.createdAt,
                updatedAt: UserTable.updatedAt,
            })
            .from(UserTable);

        return c.json(users);
    }
);

// 2. Get profile of current user
app.get(
    "/me",
    describeRoute({
        summary: "Get current user profile",
        description: "Retrieve authenticated user's own profile info",
        responses: {
            200: {
                description: "Success",
            },
        },
    }),
    (c) => {
        const user = c.get("user");
        return c.json(user);
    }
);

// 3. Get user by ID (Admin only)
app.get(
    "/:id",
    describeRoute({
        summary: "Get user by ID",
        description: "Retrieve user details by ID (Admin only)",
        responses: {
            200: {
                description: "Success",
            },
            403: {
                description: "Access denied",
            },
            404: {
                description: "User not found",
            },
        },
    }),
    ensureAdmin,
    async (c) => {
        const id = c.req.param("id");

        const [targetUser] = await db
            .select({
                id: UserTable.id,
                name: UserTable.name,
                email: UserTable.email,
                role: UserTable.role,
                image: UserTable.image,
                emailVerified: UserTable.emailVerified,
                createdAt: UserTable.createdAt,
                updatedAt: UserTable.updatedAt,
            })
            .from(UserTable)
            .where(eq(UserTable.id, id));

        if (!targetUser) {
            return c.json({ error: "User not found" }, 404);
        }

        return c.json(targetUser);
    }
);

// 4. Create user (Admin only)
app.post(
    "/",
    describeRoute({
        summary: "Create new user",
        description: "Create a new user account (Admin only)",
        responses: {
            201: {
                description: "User created successfully",
            },
            409: {
                description: "Email already in use",
            },
        },
    }),
    ensureAdmin,
    validator("json", createUserSchema),
    async (c) => {
        const { name, email, password, role, image } = c.req.valid("json");

        const [existing] = await db
            .select()
            .from(UserTable)
            .where(eq(UserTable.email, email));

        if (existing) {
            return c.json({ error: "Email already in use" }, 409);
        }

        const passwordHash = await hashPassword(password);
        const newId = randomUUID();

        let localImagePath: string | null = null;
        if (image && image.startsWith("http")) {
            const downloaded = await downloadAndSaveAvatar(newId, image);
            if (downloaded) {
                localImagePath = downloaded;
            }
        }

        await db.insert(UserTable).values({
            id: newId,
            name,
            email,
            passwordHash,
            role,
            image: localImagePath,
            createdFrom: "system",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return c.json({ id: newId, name, email, role, image: localImagePath }, 201);
    }
);

// 5. Update user (Admin only)
app.put(
    "/:id",
    describeRoute({
        summary: "Update user details",
        description: "Update user profile fields (Admin only)",
        responses: {
            200: {
                description: "User updated successfully",
            },
            403: {
                description: "Access denied",
            },
            404: {
                description: "User not found",
            },
            409: {
                description: "Email already in use",
            },
        },
    }),
    ensureAdmin,
    validator("json", updateUserSchema),
    async (c) => {
        const id = c.req.param("id");
        const body = c.req.valid("json");

        const [targetUser] = await db
            .select()
            .from(UserTable)
            .where(eq(UserTable.id, id));

        if (!targetUser) {
            return c.json({ error: "User not found" }, 404);
        }

        const updateData: Partial<typeof UserTable.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (body.name !== undefined) updateData.name = body.name;
        if (body.email !== undefined) {
            const [existing] = await db
                .select()
                .from(UserTable)
                .where(eq(UserTable.email, body.email));

            if (existing && existing.id !== id) {
                return c.json({ error: "Email already in use" }, 409);
            }
            updateData.email = body.email;
        }
        if (body.password !== undefined) {
            updateData.passwordHash = await hashPassword(body.password);
        }
        if (body.image !== undefined) {
            if (body.image && body.image.startsWith("http")) {
                const downloaded = await downloadAndSaveAvatar(id, body.image);
                updateData.image = downloaded || body.image;
            } else {
                updateData.image = body.image;
            }
        }

        if (body.role !== undefined) {
            updateData.role = body.role;
        }

        await db
            .update(UserTable)
            .set(updateData)
            .where(eq(UserTable.id, id));

        return c.json({ message: "User updated successfully" });
    }
);

// 6. Delete user (Admin only)
app.delete(
    "/:id",
    describeRoute({
        summary: "Delete user account",
        description: "Permanently delete a user account (Admin only)",
        responses: {
            200: {
                description: "User deleted successfully",
            },
            404: {
                description: "User not found",
            },
            409: {
                description: "Conflict: cannot delete yourself",
            },
        },
    }),
    ensureAdmin,
    async (c) => {
        const id = c.req.param("id");
        const currentUser = c.get("user");

        if (currentUser.id === id) {
            return c.json({ error: "Conflict: You cannot delete your own admin account" }, 409);
        }

        const [targetUser] = await db
            .select()
            .from(UserTable)
            .where(eq(UserTable.id, id));

        if (!targetUser) {
            return c.json({ error: "User not found" }, 404);
        }

        await db.delete(UserTable).where(eq(UserTable.id, id));

        return c.json({ message: "User deleted successfully" });
    }
);

export default app;
