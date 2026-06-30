# Drizzle ORM Developer Guide

This document describes how to work with **Drizzle ORM** inside the Hono API template. It covers schema definition, migration workflows, connection pooling, and standard CRUD operations.

---

## 🏗️ Architecture Overview

The database layer consists of:
1.  **Schema Definition:** [src/db/schema/auth.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/MITUNI/KILEX/be-kilex-mituni/src/db/schema/auth.ts) defines tables using Drizzle's `mysqlTable` and configures their relations using Drizzle's `relations` API.
2.  **Connection Pool:** [src/db/index.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/MITUNI/KILEX/be-kilex-mituni/src/db/index.ts) initializes the connection pool using `mysql2/promise` with config loaded from `.env`.
3.  **Drizzle Config:** [drizzle.config.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/MITUNI/KILEX/be-kilex-mituni/drizzle.config.ts) dictates how Drizzle Kit generates, saves, and pushes changes.

---

## 🔄 Schema Migration Workflow

When you need to modify the database schema, follow this standard three-step process:

### Step 1: Update the Schema File
Make modifications to the tables inside `src/db/schema/auth.ts` (or add a new schema file).
For example, adding a new `phoneNumber` field:
```typescript
export const user = mysqlTable("user", {
    id: varchar("id", { length: 36 }).primaryKey(),
    // ...
    phoneNumber: varchar("phone_number", { length: 20 }),
});
```

### Step 2: Generate Migration SQL File
Run the Drizzle Kit generate command. This scans your schema changes and outputs a new SQL file inside `src/db/migrations/`:
```bash
npm run db:generate
```

### Step 3: Run the Migration script
Apply the generated SQL files to your database:
```bash
npm run db:migrate
```
*(Alternatively, for local development prototyping, you can skip creating SQL files and sync schemas immediately using `npm run db:push`).*

---

## 💻 CRUD Query Examples

Always import the `db` instance and your tables from the schema:
```typescript
import { db } from "../db/index.js";
import { user as UserTable } from "../db/schema/auth.js";
import { eq, and, or, like } from "drizzle-orm";
```

### 1. Select Operations

#### Select All Columns
```typescript
const allUsers = await db.select().from(UserTable);
```

#### Select Specific Columns (Recommended for performance)
```typescript
const userNames = await db
  .select({
    id: UserTable.id,
    name: UserTable.name,
  })
  .from(UserTable);
```

#### Filtering with Conditions
```typescript
const [targetUser] = await db
  .select()
  .from(UserTable)
  .where(
    and(
      eq(UserTable.email, "user@example.com"),
      eq(UserTable.role, "USER")
    )
  );
```

---

### 2. Insert Operations
```typescript
import { randomUUID } from "node:crypto";

await db.insert(UserTable).values({
  id: randomUUID(),
  name: "Jane Doe",
  email: "jane@example.com",
  passwordHash: "hashed-pass-here",
  role: "USER",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```
> [!IMPORTANT]
> **MySQL Limitation:** Unlike PostgreSQL, MySQL inserts do not natively support the `.returning()` clause. If you need to retrieve database-calculated defaults (like `id` or timestamps) upon insertion, you must select them in a separate query or generate UUIDs manually at runtime.

---

### 3. Update Operations
```typescript
await db
  .update(UserTable)
  .set({
    name: "Updated Name",
    updatedAt: new Date(),
  })
  .where(eq(UserTable.id, "target-uuid-here"));
```

---

### 4. Delete Operations
```typescript
await db
  .delete(UserTable)
  .where(eq(UserTable.id, "target-uuid-here"));
```

---

### 5. Transactions
If you need to run multiple queries sequentially and roll back all changes if one fails:
```typescript
await db.transaction(async (tx) => {
  const newUserId = randomUUID();
  
  await tx.insert(UserTable).values({
    id: newUserId,
    name: "Account Holder",
    email: "holder@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Perform other related operations using `tx`
});
```
