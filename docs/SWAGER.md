# 📖 Swagger API Documentation Guide

This document describes how to use and extend the automatic OpenAPI/Swagger documentation inside the Hono API template.

---

## 🚀 Accessing Swagger UI

When running the project locally (`npm run dev`), the interactive API documentation and spec endpoints are accessible at:

*   **Interactive UI (Swagger):** [http://localhost:8000/api/doc](http://localhost:8000/api/doc)
*   **OpenAPI JSON Spec:** [http://localhost:8000/api/openapi](http://localhost:8000/api/openapi)

---

## 🛠️ How Swagger works in this Project

We use two primary libraries to generate documentation:
1.  **`hono-openapi`**: Integrates with Hono to generate OpenAPI 3.0 specification schemas dynamically using Zod validators.
2.  **`@hono/swagger-ui`**: Serves the generated specification in a beautiful, interactive web interface.

---

## 📝 Documenting an Endpoint

To document your routes so they show up automatically in Swagger, use `describeRoute`, `validator`, and `resolver` from `hono-openapi`.

### Step 1: Define your Request/Response Zod Schemas
Create Zod schemas for your input payloads and API responses.
```typescript
import z from "zod";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
```

### Step 2: Decorate the Route with `describeRoute` and `validator`
Chain your decorators and validator to the Hono route:
```typescript
import { Hono } from "hono";
import { describeRoute, validator, resolver } from "hono-openapi";

const app = new Hono();

app.post(
  "/users",
  describeRoute({
    summary: "Create a new user",
    description: "Inserts a user into the database and returns the created user record.",
    responses: {
      201: {
        description: "User successfully created",
        content: {
          "application/json": {
            schema: resolver(userResponseSchema),
          },
        },
      },
      400: {
        description: "Validation error",
      },
    },
  }),
  validator("json", createUserSchema),
  async (c) => {
    const body = c.req.valid("json");
    // Your controller logic ...
    return c.json({ id: "123", ...body }, 201);
  }
);
```

---

## 🔍 Examples in the Codebase

You can refer to the existing handlers to see production examples:

1.  **Auth Registration & Login Documentation**: Refer to the schemas and endpoint configurations in [src/routes/auth.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/OPENSOURCE/hono-template-api/src/routes/auth.ts#L17-L86).
2.  **Swagger UI & OpenAPI Setup**: Refer to how Swagger is initialized in [src/routes/index.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/OPENSOURCE/hono-template-api/src/routes/index.ts#L19-L40).
