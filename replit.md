# SiapLulus — CPNS & School Tutoring LMS

A full-stack e-learning platform for Indonesian civil servant (CPNS) exam preparation and school tutoring (SD/SMP/SMA). Students purchase packages via manual bank transfer, then access PDF materials, quizzes, and computer-based tryout (CBT) exams.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, wouter, shadcn/ui, Tailwind CSS, Recharts, Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Auth: JWT (bcryptjs + jsonwebtoken), stored in localStorage
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for ALL API contracts (40+ endpoints)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas for server validation
- `lib/db/src/schema/` — Drizzle ORM schema (10 tables)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/lms/src/pages/` — all frontend pages (30+ pages)
- `artifacts/lms/src/lib/auth.tsx` — AuthContext + JWT management

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks + Zod schemas; never write client fetch code by hand
- JWT auth: token stored in localStorage, injected via `setAuthTokenGetter` in `custom-fetch.ts`
- Manual bank transfer payment: unique amount = price + 3-digit suffix, 24h expiry, admin verifies proof image
- CPNS passing thresholds enforced in result display: TWK≥65, TIU≥80, TKP≥166
- CBT tryout: full-screen interface with sidebar navigation grid, countdown timer, tab-visibility anti-cheat

## Product

- **3-role auth**: admin, tutor, student
- **Package catalog**: CPNS, SMA, SMP, SD categories with filtering
- **Payment flow**: bank transfer with unique amount, payment proof upload, admin verification
- **Learning**: PDF materials with read-tracking, watermark overlay
- **Quiz system**: timed multiple-choice with explanations
- **CBT Tryout**: full exam simulation with countdown, question grid navigation, flagging, auto-submit, ranking
- **Student dashboard**: score charts, progress bars, recent attempts
- **Admin dashboard**: revenue chart, pending verifications, CRUD for packages/questions/tryouts/bank accounts

## Demo accounts

- Admin: `admin@siaplulus.id` / `admin123`
- Tutor: `tutor@siaplulus.id` / `tutor123`
- Students: `andi@student.id`, `siti@student.id`, `reza@student.id` / `student123`

## User preferences

- Indonesian language for all UI text
- Rupiah formatting: "Rp 499.000" (period as thousand separator)
- Brand name: SiapLulus

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before touching routes
- `lib/api-client-react/package.json` must export `"./custom-fetch"` subpath for auth token injection
- Google Fonts `@import` must come first in `index.css` before other `@import` statements
- The API returns arrays directly (not wrapped in `{ data: [...] }` objects) for list endpoints
- bcryptjs (pure JS) is used instead of bcrypt (no native bindings needed in Replit)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
