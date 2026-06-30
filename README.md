# Kilex Hono API

A backend API built with [Hono](https://hono.dev/), [Drizzle ORM](https://orm.drizzle.team/), [MySQL](https://www.mysql.com/), and [Better Auth](https://www.better-auth.com/). It supports both custom JWT authentication and Better Auth (including Google OAuth), along with User CRUD operations.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` or edit the existing `.env` file in the project root:
```env
PORT=8000

# Better Auth Configuration
BETTER_AUTH_SECRET=your_better_auth_secret_minimum_32_characters_long
BETTER_AUTH_URL=http://localhost:8000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# DB credentials for Drizzle Config
DB_USER=root
DB_PASSWORD=123
DB_NAME=db_mituni_kilex
DB_HOST=127.0.0.1
DB_PORT=3306

# JWT Secret for custom authentication routes
JWT_SECRET=randomlyGeneratedSecretKey1234567890
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start running on [http://localhost:8000](http://localhost:8000).

---

## 🗄️ Drizzle ORM Guide

Drizzle ORM is used for schema definitions and type-safe database queries.

### Project Database Structure
*   **Database Config:** [drizzle.config.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/MITUNI/KILEX/be-kilex-mituni/drizzle.config.ts) handles migrations output, database credentials, and dialect configuration.
*   **Connection Pool:** [src/db/index.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/MITUNI/KILEX/be-kilex-mituni/src/db/index.ts) initializes the MySQL connection pool.
*   **Database Schema:** [src/db/schema/auth.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/MITUNI/KILEX/be-kilex-mituni/src/db/schema/auth.ts) defines tables for users, sessions, OAuth accounts, and verification keys.

---

### Drizzle Kit CLI Commands

#### 1. Generate Migrations
Whenever you update your Drizzle schema (e.g., inside `src/db/schema/auth.ts`), run this command to generate SQL migration scripts inside `src/db/migrations/`:
```bash
npx drizzle-kit generate
```

#### 2. Push Schema Changes directly (Local/Prototype)
If you want to sync schema changes directly to your local database without creating migration files (recommended for fast prototyping):
```bash
npx drizzle-kit push
```

#### 3. Open Drizzle Studio
Drizzle Studio is a premium database browser UI to view and edit your data directly in the browser:
```bash
npx drizzle-kit studio
```

#### 4. Apply Migrations to Production
To run and apply the migration scripts to your production/target database:
```bash
npx drizzle-kit migrate
```

#### 5. Seed Default Admin User
To populate the database with a default `ADMIN` account (`admin@kilex.com` / `adminpassword123`):
```bash
npm run db:seed
```

---

## 🛠️ Middleware & Global Handlers

*   **Logger Middleware:** Utilizes Hono's official console logger to trace incoming HTTP requests, paths, and status codes.
*   **Global Error Handler:** Catches all uncaught server-side exceptions and returns structured JSON responses matching the schema `{ error, message, status }`.
*   **404 Not Found Handler:** Returns structured JSON for invalid endpoints (`{ error: "NotFound", message: "Cannot GET /invalid-endpoint", status: 404 }`).

---

### How to use Drizzle in Code

First, import the `db` instance and the target table from your schema:
```typescript
import { db } from "../db/index.js";
import { user as UserTable } from "../db/schema/auth.js";
import { eq } from "drizzle-orm";
```

#### 1. Query Data (Select)
```typescript
// Fetch all users
const allUsers = await db.select().from(UserTable);

// Fetch a single user by email
const [user] = await db
  .select()
  .from(UserTable)
  .where(eq(UserTable.email, "user@example.com"));
```

#### 2. Insert Data
```typescript
await db.insert(UserTable).values({
  id: "some-unique-uuid",
  name: "John Doe",
  email: "john@example.com",
  role: "USER",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```
*(Note: MySQL does not natively support the `.returning()` clause; retrieve inserted primary keys via `$returningId()` or manual selections).*

#### 3. Update Data
```typescript
await db
  .update(UserTable)
  .set({ name: "New Name", updatedAt: new Date() })
  .where(eq(UserTable.id, "some-unique-uuid"));
```

#### 4. Delete Data
```typescript
await db.delete(UserTable).where(eq(UserTable.id, "some-unique-uuid"));
```

---

## 🛠️ API Routing

### 1. Authentication Routes (`/api/auth`)
*   `POST /api/auth/register` - Custom email/password user registration.
*   `POST /api/auth/login` - Custom email/password login (returns a JWT token).
*   `GET /api/auth/login/google` - Initiates Better Auth Google OAuth login.
*   `GET /api/auth/callback/google` - Redirect URI callback for Google login.

### 2. User CRUD Routes (`/api/users`)
*   `GET /api/users` - List all users (Requires `ADMIN` role).
*   `GET /api/users/me` - Get profile details of the current logged-in user.
*   `GET /api/users/:id` - Get user details by ID (Requires `ADMIN` role or profile owner).
*   `POST /api/users` - Create a new user (Requires `ADMIN` role).
*   `PUT /api/users/:id` - Update user details (Requires `ADMIN` role or profile owner; role updates require `ADMIN`).
*   `DELETE /api/users/:id` - Delete user account (Requires `ADMIN` role; cannot delete yourself).
