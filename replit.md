# Nova Femme — Celebracja Boskiej Kobiecości

## Overview

A full-stack Polish-language luxury wellness app with oracle/spiritual aesthetic. Features affirmation oracle cards, ritual tracking, dream diary, and soul journal — all protected behind Clerk authentication with private per-user data.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + wouter routing
- **Auth**: Clerk (`@clerk/react` + `@clerk/express`)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Architecture

### Frontend (`artifacts/nova-femme/`)
- **Preview path**: `/` (root)
- **Design**: Oracle/spiritual luxury — burgundy, cream, gold palette; Playfair Display serif; parchment textures; gold glow effects
- **Auth**: Clerk with custom Polish localization ("Zaloguj się do Nova Femme")
- **Pages**:
  - `/` — Landing page (unauthenticated) or redirect to `/przestrzen`
  - `/sign-in` — Clerk sign-in with Nova Femme branding
  - `/sign-up` — Clerk sign-up
  - `/przestrzen` — Dashboard (Moja Przestrzeń) — protected
  - `/afirmacje` — Affirmation oracle cards — protected
  - `/rytualy` — Ritual tracker — protected
  - `/sny` — Dream diary (Moje Sny) — protected
  - `/zapiski` — Soul journal (Zapiski Duszy) — protected

### Backend (`artifacts/api-server/`)
- **Auth middleware**: `requireAuth` (Clerk `getAuth`) on all Nova Femme routes
- **Routes**: `/api/affirmations`, `/api/rituals`, `/api/dreams`, `/api/journal`, `/api/dashboard`, `/api/healthz`
- All data routes filter by `userId` from Clerk

### Database Schema (`lib/db/src/schema/nova-femme.ts`)
- `affirmations` — Shared oracle cards (global)
- `rituals` — Per-user ritual habits (`user_id NOT NULL`)
- `dreams` — Per-user dream diary entries (`user_id NOT NULL`)
- `journal_entries` — Per-user soul journal entries (`user_id NOT NULL`)

## Vite Build Notes

`@clerk/shared` uses wildcard subpath exports (`"./*"`) which Rollup 4 (Vite 7) cannot resolve. A custom Vite plugin `clerkSharedResolver` in `vite.config.ts` intercepts all `@clerk/shared/<subpath>` imports and resolves them using Node's `createRequire`, handing Rollup concrete absolute file paths. Do not remove this plugin.

## Oracle Card Images

60 card images in `artifacts/nova-femme/public/cards/`. Key file: `intuicj.png` (not `intuic.png`).

## Bell Sound

`artifacts/nova-femme/public/campana.mp3` — played via Web Audio API (`use-bell-sound.ts`).

## Lunar Phase

Uses synodic period algorithm (29.53059 days) with J2000 reference new moon (Jan 6, 2000 18:14 UTC). Returns one of 8 Polish phase names.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `cd artifacts/nova-femme && BASE_PATH="/" PORT=19451 pnpm run build` — production build

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (frontend)
- `CLERK_SECRET_KEY` — Clerk secret key (backend auth)
- `CLERK_PUBLISHABLE_KEY` — Clerk publishable key (backend)
- `SESSION_SECRET` — Express session secret
- `DATABASE_URL` — PostgreSQL connection string
