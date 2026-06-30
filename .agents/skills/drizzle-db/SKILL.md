---
name: drizzle-db
description: Guides on schema modification, migration generation, database resets, and seeding in Drizzle ORM.
---

# Drizzle ORM & Database Workflow

Use this skill when you need to interact with the database layer, modify table schemas, manage migrations, or seed/reset the database.

## 🏗️ Schema Definition & Updates

- **Schema File:** [src/db/schema/auth.ts](file:///Users/robykartis/Documents/ROBY/GITHUB/OPENSOURCE/hono-template-api/src/db/schema/auth.ts) is where all tables are defined.
- **MySQL gotcha:** MySQL has **no `.returning()`** support for insert statements. Generate IDs manually at runtime using `randomUUID()` from `node:crypto`.
- **New columns:** Always specify a default value or configure nullable fields for compatibility with existing data.

## 🔄 Migration Workflow

Always run these commands sequentially when schema changes occur:

1.  **Generate Migration SQL:**
    ```bash
    npm run db:generate
    ```
    This scans schema changes and creates SQL files in `src/db/migrations/`.

2.  **Apply Migration (Or direct push for rapid prototyping):**
    ```bash
    npm run db:migrate   # apply SQL migrations
    # OR
    npm run db:push      # prototype only (skips SQL files)
    ```

## 🧹 Reset and Seed Workflow

Use the custom reset utility to start fresh during testing:

- **Empty Database and Re-migrate:**
    ```bash
    npm run db:reset
    ```
- **Reset and Seed Default Accounts:**
    ```bash
    npm run db:reset -- --seed
    ```
- **Standalone Seeding:**
    ```bash
    npm run db:seed
    ```
