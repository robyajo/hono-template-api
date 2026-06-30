# AGENTS.md — hono-template-api

## Quick start

```bash
npm install
# copy .env.example to .env and fill in values
npm run dev          # tsx watch src/index.ts on :8000
npm run build        # tsc -> dist/
npm start            # node dist/index.js
```

## Database commands

```bash
npm run db:generate  # generate migration SQL from schema changes
npm run db:push      # push schema directly (prototyping only)
npm run db:migrate   # apply migrations
npm run db:seed      # seeds admin@gmail.com / adminpassword123 + user@gmail.com
npm run db:reset     # drop all tables, re-migrate; add -- --seed to also seed
npm run db:studio    # Drizzle Studio browser UI
```

Reset with seed: `npm run db:reset -- --seed` (extra `--` required by npm).

## Architecture

- Entry: `src/index.ts` — Hono app, mounts `/api` router
- Routes: `src/routes/index.ts` → mounts `auth` (subrouter) and `users` (subrouter)
- Auth: dual system — custom JWT (Bearer token, HS256, 5min expiry) **and** Better Auth session cookies
- DB: MySQL via `mysql2/promise` + Drizzle ORM; schema in `src/db/schema/auth.ts`
- Schema tables: `user`, `session`, `account`, `verification` (Better Auth compatible)
- OpenAPI: auto-generated at `GET /api/openapi`, Swagger UI at `GET /api/doc`
- Env: loaded via `import "dotenv/config"` per file; accessed through `src/data/env.ts` (plain object, no Zod)

## Gotchas

- `.js` extensions required in all relative imports (enforced by `verbatimModuleSyntax` + `rewriteRelativeImportExtensions`; tsx handles at runtime)
- MySQL has **no `.returning()`** for inserts — generate UUIDs manually with `randomUUID()`
- Zod v4 (`zod@^4.4.3`), not v3
- Password hashing: scrypt with salt stored as `salt:hashHex`
- JWT secret comes from env, not hardcoded; both JWT and Better Auth are checked in middleware (JWT first, then Better Auth session)
- Seed creates admin (`admin@gmail.com`) and user (`user@gmail.com`), both with password `adminpassword123`
- PM2 ecosystem config (`ecosystem.config.cjs`) has hardcoded absolute paths for production
- `.env` and `.env.production` are gitignored
- No CI/CD, no linter, no tests, no pre-commit hooks configured

## Style

- Use `src/index.ts` import pattern for env: `import "dotenv/config"` at top
- Use `describeRoute`, `validator`, `resolver` from `hono-openapi` for route docs
- Route validation with `zod` via `@hono/zod-validator`
- All user IDs: `randomUUID()` from `node:crypto`
- Route files export default `new Hono()` subrouter; parent mounts via `app.route`
