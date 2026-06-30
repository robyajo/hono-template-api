import { Hono } from "hono";
import authRoute from "./auth.js";
import userRoute from "./user.js";
import { sessionMiddleware } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import type { AuthVariables } from "../middleware/auth.js";
import { openAPIRouteHandler, describeRoute, resolver } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import z from "zod";

const api = new Hono<{
    Variables: AuthVariables;
}>();

// Mount Auth sub-router (mounts to /auth)
api.route("/auth", authRoute);

// Mount User sub-router (mounts to /users)
api.route("/users", userRoute);

// OpenAPI spec generation endpoint
api.get(
    "/openapi",
    openAPIRouteHandler(api, {
        documentation: {
            info: {
                title: "Kilex Hono API",
                version: "1.0.0",
                description: "Hono API with Better Auth, Drizzle MySQL, Zod validation and Swagger UI documentation",
            },
            servers: [
                {
                    url: "http://localhost:8000/api",
                    description: "Local Development Server",
                },
            ],
        },
    })
);

// Swagger UI Documentation Dashboard
api.get("/doc", swaggerUI({ url: "/api/openapi" }));

const healthSchema = z.object({
    status: z.string(),
    timestamp: z.string(),
    database: z.string(),
});

// Health check route
api.get(
    "/health",
    describeRoute({
        summary: "Database health check",
        description: "Checks if the API and database connections are healthy.",
        responses: {
            200: {
                description: "API and Database are healthy",
                content: {
                    "application/json": {
                        schema: resolver(healthSchema),
                    },
                },
            },
            503: {
                description: "Database connection failed",
                content: {
                    "application/json": {
                        schema: resolver(
                            z.object({
                                status: z.string(),
                                timestamp: z.string(),
                                database: z.string(),
                                error: z.string(),
                            })
                        ),
                    },
                },
            },
        },
    }),
    async (c) => {
        try {
            await db.execute(sql`SELECT 1`);
            return c.json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                database: "connected",
            }, 200);
        } catch (error) {
            return c.json({
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                database: "disconnected",
                error: error instanceof Error ? error.message : "Unknown error",
            }, 503);
        }
    }
);

// Public route
api.get("/public", (c) => {
    return c.json({
        message: "Welcome to the public API endpoint!",
        timestamp: new Date(),
    });
});

// Protected route (authenticated users)
api.get("/protected", sessionMiddleware, (c) => {
    const user = c.get("user");
    return c.json({
        message: `Hello ${user.name}, you are authenticated!`,
        user,
    });
});

// Admin-only route
api.get("/admin", ensureAdmin, (c) => {
    const user = c.get("user");
    return c.json({
        message: `Welcome, Admin ${user.name}! This is a highly protected resource.`,
        user,
    });
});

export default api;
