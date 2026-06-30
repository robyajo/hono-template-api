# Product Requirements Document (PRD)

This Product Requirements Document (PRD) details the specifications, design decisions, and system requirements for the Hono MySQL API Base Template.

---

## 🎯 Product Overview

This project is a high-performance, robust, production-ready backend API starter template designed to speed up the development of upcoming API projects. It compiles Hono, Drizzle ORM, Better Auth, and custom JWT authentication into a unified, secure web API.

---

## 🛠️ Key Product Features

### 1. Dual-Authentication Layer
*   **Custom JWT Auth:** Handles traditional email/password user registration and login securely. Successful login returns a JWT bearer token signed via HS256.
*   **Better Auth (OAuth):** Supports social login (Google OAuth integration) out of the box, handling redirect flows and callback sessions.
*   **Universal Auth Middleware:** Validates credentials via incoming HTTP request headers: it checks the `Authorization: Bearer <token>` JWT first and falls back to inspecting Better Auth cookie sessions.

### 2. User Administration CRUD
*   Allows profile retrieval for standard authenticated users (`/me`).
*   Restricts administrative actions (listing all users, updating roles, creating/deleting users) to accounts with the `ADMIN` role.
*   Implements role protection via specific Hono middlewares (`sessionMiddleware` and `adminMiddleware`).

### 3. Automatic OpenAPI Specs & Interactive Swagger UI
*   Incorporates the `hono-openapi` and `@hono/swagger-ui` middleware to automatically generate OpenAPI 3.0 specs.
*   Serves an interactive Swagger UI dashboard at `/api/doc` mapping out all endpoint schemas, param validations, and response specs.
*   Zod input schemas are validated on request arrival using `@hono/standard-validator`.

### 4. Production-Ready Infrastructure
*   **Global Error Handling:** Converts uncaught runtime code exceptions into standardized JSON responses, shielding server details.
*   **Console Logging:** Mounts Hono logger for debugging request pathways.
*   **Background Management:** Ecosystem templates for PM2 process clustering and Nginx reverse proxy configurations with SSL redirects.

---

## 💻 Tech Stack & Dependencies

*   **Runtime:** Node.js & TypeScript
*   **Web Framework:** Hono
*   **ORM Layer:** Drizzle ORM (MySQL dialect)
*   **Database Client:** `mysql2/promise` pool
*   **OAuth Adapter:** `@better-auth/drizzle-adapter`
*   **Validation:** Zod
*   **Documentation:** `hono-openapi` & `@hono/swagger-ui`

---

## 📦 System Architecture (File Structure)

```
be-kilex-mituni/
├── 📁 src/
│   ├── 📁 data/
│   │   └── env.ts            # Configuration environment variable loader
│   ├── 📁 db/
│   │   ├── 📁 migrations/     # Generated SQL migration files
│   │   ├── 📁 schema/
│   │   │   └── auth.ts       # Database structures (users, sessions, roles)
│   │   ├── index.ts          # Connection pool initialization
│   │   └── seed.ts           # Seeder script for admin accounts
│   ├── 📁 lib/
│   │   └── crypto.ts         # Scrypt hashing and api key helpers
│   ├── 📁 middleware/
│   │   └── auth.ts           # Middleware session and role verification
│   ├── 📁 routes/
│   │   ├── auth.ts           # Auth handlers (login, register, Better Auth catchall)
│   │   ├── user.ts           # User CRUD route operations
│   │   └── index.ts          # Main routing aggregator
│   ├── index.ts              # Server entry point
│   └── auth.ts               # Better Auth initialization
├── drizzle.config.ts         # Drizzle kit CLI settings
├── ecosystem.config.cjs      # PM2 deployment clusters configuration
├── nginx.conf                # Nginx proxy and SSL configurations
├── package.json              # Script shortcuts and project dependencies
└── tsconfig.json             # TypeScript rules
```

---

## 📜 API Route Contract

### Base Prefix: `/api`

| Route | Method | Middleware | Description |
| :--- | :--- | :--- | :--- |
| `/openapi` | `GET` | None | Retrieves the raw OpenAPI JSON specification. |
| `/doc` | `GET` | None | Renders the interactive Swagger UI dashboard. |
| `/auth/register` | `POST` | Zod Validation | Registers a new email/password account. |
| `/auth/login` | `POST` | Zod Validation | Authenticates user and returns a JWT token. |
| `/auth/*` | `GET/POST`| Better Auth | Catch-all forwarding to Better Auth (e.g. Google OAuth callbacks, sign-out). |
| `/users` | `GET` | Session + Admin | Lists all user accounts. |
| `/users/me` | `GET` | Session | Retrieves the current user's profile details. |
| `/users/:id` | `GET` | Session + Admin/Owner | Retrieves user details by ID. |
| `/users` | `POST` | Session + Admin | Creates a new user account. |
| `/users/:id` | `PUT` | Session + Admin/Owner | Updates user fields. |
| `/users/:id` | `DELETE`| Session + Admin | Permanently deletes a user account. |
