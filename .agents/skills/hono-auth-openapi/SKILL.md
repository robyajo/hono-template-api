---
name: hono-auth-openapi
description: Guides on creating endpoints, adding Zod validators, documenting routes with OpenAPI, and handling authentication (JWT and Better Auth).
---

# Hono OpenAPI & Authentication workflow

Use this skill when developing or modifying API routes, adding request/response schemas, configuring OpenAPI/Swagger documentation, or managing user authentication.

## 🔑 Authentication Architecture

The application implements a dual authentication check in its middleware:
1.  **Custom JWT:** Checked via the Bearer token in the `Authorization` header. Uses HS256 signature and has a short 5-minute expiry.
2.  **Better Auth Cookies:** Checked via session cookies if the JWT header is absent.

### Route Protection Middleware
- **`/protected` routes:** Apply `sessionMiddleware` to assert the user is authenticated.
- **`/admin` routes:** Apply both `sessionMiddleware` and `adminMiddleware` sequentially.

```typescript
import { sessionMiddleware, adminMiddleware } from "../middleware/auth.js";

app.get("/admin-only", sessionMiddleware, adminMiddleware, (c) => {
    const user = c.get("user");
    return c.json({ message: `Welcome, ${user.name}!` });
});
```

## 📝 OpenAPI & Swagger UI Documentation

All endpoints must be documented using `hono-openapi` decorators for visibility in the Swagger UI.

### Step-by-Step Route Configuration
1.  **Define Request & Response Schemas** using `zod`.
2.  **Decorate** with `describeRoute()` to document summary, description, and HTTP responses.
3.  **Validate** request payloads using `validator()` from `@hono/zod-validator` (or `@hono/standard-validator`).
4.  **Resolve** Zod schemas inside `describeRoute` responses using `resolver()`.

### Code Example
```typescript
import { describeRoute, validator, resolver } from "hono-openapi";
import z from "zod";

const responseSchema = z.object({
  status: z.string(),
});

app.post(
  "/example",
  describeRoute({
    summary: "Example endpoint",
    responses: {
      200: {
        description: "Success response",
        content: { "application/json": { schema: resolver(responseSchema) } }
      }
    }
  }),
  validator("json", requestSchema),
  async (c) => {
    // handler logic
  }
);
```
