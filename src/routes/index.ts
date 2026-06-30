import { Hono } from "hono";
import authRoute from "./auth.js";
import userRoute from "./user.js";
import { sessionMiddleware, adminMiddleware } from "../middleware/auth.js";
import type { AuthVariables } from "../middleware/auth.js";
import { openAPIRouteHandler } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";

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
api.get("/admin", sessionMiddleware, adminMiddleware, (c) => {
    const user = c.get("user");
    return c.json({
        message: `Welcome, Admin ${user.name}! This is a highly protected resource.`,
        user,
    });
});

export default api;
