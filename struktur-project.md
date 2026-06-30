📦 root-project/
├── 📁 backend-hono/          # Project Hono (API)
│   ├── 📁 src/
│   │   ├── 📁 auth/
│   │   │   ├── index.ts      # Konfigurasi Better Auth
│   │   │   └── schema.ts     # Schema DB (jika pakai Drizzle/Prisma)
│   │   ├── 📁 db/
│   │   │   └── index.ts      # Database connection
│   │   ├── 📁 routes/
│   │   │   ├── index.ts      # Route utama
│   │   │   └── users.ts      # Route lainnya
│   │   ├── 📁 middleware/
│   │   │   └── auth.ts       # Middleware session
│   │   └── index.ts          # Entry point server
│   ├── 📄 .env               # Env variables (DATABASE_URL, BETTER_AUTH_SECRET)
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📄 better-auth.sql     # Schema migration (optional)
│
├── 📁 frontend-nextjs/        # Project Next.js (Frontend)
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 api/        # Route handler Next.js (jika perlu)
│   │   │   │   └── 📁 auth/
│   │   │   │       └── [...all]/
│   │   │   │           └── route.ts  # (Optional - proxy ke Hono)
│   │   │   ├── 📁 (auth)/
│   │   │   │   ├── 📁 sign-in/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 sign-up/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── page.tsx   # Protected route
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx       # Landing page
│   │   ├── 📁 components/
│   │   │   ├── 📁 auth/
│   │   │   │   ├── sign-in-form.tsx
│   │   │   │   ├── sign-up-form.tsx
│   │   │   │   └── sign-out-button.tsx
│   │   │   └── 📁 ui/
│   │   ├── 📁 lib/
│   │   │   ├── auth-client.ts  # Better Auth client
│   │   │   └── utils.ts
│   │   ├── 📁 hooks/
│   │   │   └── use-session.ts  # Custom hooks (optional)
│   │   └── 📁 types/
│   │       └── index.ts
│   ├── 📁 public/
│   ├── 📄 .env.local          # NEXT_PUBLIC_API_URL=http://localhost:3001
│   ├── 📄 .env.example
│   ├── 📄 middleware.ts       # Next.js middleware (optional)
│   ├── 📄 next.config.js
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
└── 📄 README.md               # Dokumentasi setup