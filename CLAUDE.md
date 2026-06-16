# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NextX** — an EHCP (Education, Health and Care Plan) Journey Companion for parents/caretakers of children with special educational needs.

Monorepo using **TurboRepo + pnpm workspaces** with two apps:
- `apps/api` — Node.js/Express backend (port 4000)
- `apps/web` — React/Vite frontend (port 5173)
- `packages/shared` — Shared Zod schemas, TypeScript types, and enums used by both apps

## Commands

### Root (runs across all workspaces via Turbo)
```bash
pnpm dev          # Start all dev servers concurrently
pnpm build        # Build all apps and packages
pnpm lint         # Lint entire monorepo
pnpm typecheck    # TypeScript check all packages
pnpm test         # Run all tests
pnpm format       # Format with Prettier
```

### Backend (`apps/api`)
```bash
pnpm dev          # tsx watch (hot reload)
pnpm build        # Compile TypeScript
pnpm typecheck    # Type check without emit
pnpm test         # Run vitest
pnpm test:watch   # Vitest watch mode
pnpm seed:admin   # Seed initial admin user
```

### Frontend (`apps/web`)
```bash
pnpm dev          # Vite dev server
pnpm build        # Production bundle
pnpm typecheck    # Type check
pnpm test         # Run vitest
```

Swagger API docs are available at `http://localhost:4000/api-docs` when the API is running.

## Architecture

### Shared Package (`packages/shared`)
Single source of truth for types and validation. **Always define types and Zod schemas here first**, then import into both API and web. Key exports:
- Zod schemas (used for backend route validation AND frontend form validation)
- Enums: `UserRole` (user, admin), `Plan` (free, pro, premium), `EHCPStage`, `SubscriptionStatus`
- Interfaces: `IUser`, `IChild`, `IDocument`, `IFolder`, `IChat`, `IReminder`, `ISupport`, `IAdmin`

### Backend Structure (`apps/api/src`)
MVC pattern:
- **`routes/`** — Express routers; apply Zod `validate()` middleware before controllers
- **`controllers/`** — Business logic; use `sendSuccess`/`sendError` utilities for consistent response shape
- **`models/`** — Mongoose schemas (User, Child, Document, Folder, Subscription, ChatSession, Reminder, SupportTicket, KnowledgeArticle)
- **`middleware/`** — `authenticate.ts` (JWT → attaches `req.user`), `authorize.ts` (RBAC), `validate.ts` (Zod), `errorHandler.ts`, `rateLimiter.ts`
- **`services/`** — External integrations (file upload to Firebase/local, Stripe payments, email via Resend)
- **`config/`** — Initialisation for DB, Firebase, Stripe, Redis, email, Swagger
- **`utils/`** — JWT helpers, crypto, email templates, Pino logger, API response formatters

**API response format** is always:
```typescript
{ success: true, data: T, meta?: PaginationMeta }   // success
{ success: false, error: { code: string, message: string, details?: [...] } }  // error
```

**Route prefix:** all endpoints under `/api`. Admin routes under `/api/admin`.

### Frontend Structure (`apps/web/src`)
- **`router.tsx`** — React Router v7 config; protected routes wrapped in auth guards, admin sub-routes under `/admin`
- **`pages/`** — Route-level components
- **`components/ui/`** — Dumb reusable primitives (Button, Input, Modal, Card, Toast)
- **`components/layout/`** — `AppLayout` (authenticated users), `AdminLayout` (admin area)
- **`components/auth/`** — `AdminAuthGuard`
- **`stores/`** — Zustand stores: `authStore.ts` (user + tokens, persisted to `localStorage`), `uiStore.ts` (UI preferences)
- **`services/api.ts`** — Axios instance with JWT request interceptor and 401 → auto-refresh response interceptor (queues concurrent requests during refresh, auto-logout on refresh failure)
- **`services/`** — Resource-specific API call functions (child, document, admin, user, etc.)

### Authentication Flow
1. Login/signup → backend returns `{ accessToken, refreshToken }`
2. Tokens stored in `localStorage` via `authStore`
3. Axios request interceptor attaches `Authorization: Bearer <accessToken>`
4. On 401: interceptor calls `/api/auth/refresh`, queues in-flight requests, retries after new token
5. Failed refresh → clear store → redirect to `/login`
6. Google OAuth also supported (frontend uses `@react-oauth/google`, backend verifies via Google API)

### State Management
- **Server state:** React Query (`@tanstack/react-query`) with 5-minute `staleTime` by default
- **Client/global state:** Zustand (`authStore`, `uiStore`)
- **Form state:** React Hook Form + Zod resolvers

### File Storage
- **Production:** Firebase Storage (via Firebase Admin SDK)
- **Development fallback:** Local filesystem
- Upload handled in `apps/api/src/services/fileUpload.service.ts`; Multer middleware handles multipart before controllers

## Key Configuration

### Environment Variables (required for local dev)
```
MONGODB_URI=mongodb://localhost:27017/nextx
JWT_ACCESS_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
GOOGLE_CLIENT_ID=<oauth client id>
```
See `.env.example.backup` at repo root for the full list including optional services (Stripe, Resend, Firebase, Redis, Supabase, Sentry, n8n).

### Vite Proxy
`apps/web/vite.config.ts` proxies `/api` → `http://localhost:4000` in development, so frontend fetch calls use relative paths (`/api/...`).

### Path Alias
Frontend uses `@` as an alias for `apps/web/src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### TypeScript
- Strict mode enabled across all packages
- Backend (`apps/api`) compiles to CommonJS; Frontend (`apps/web`) uses bundler resolution with React JSX
- Base config in `tsconfig.base.json` at root (ES2022 target, ESM)
