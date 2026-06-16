# NextX — Production Architecture & SOW Alignment Plan

> Internal engineering plan mapping the signed Scope of Work to the current
> codebase: target production architecture, alignment scorecard, and a
> sequenced roadmap to close the gaps.

## Context

NextX is a fixed-price (£3,000), 3-phase EHCP companion web app (React + Node/Express + MongoDB + Supabase/Firebase Storage + Stripe + n8n AI). This document answers two questions: (a) what is the production-level architecture, and (b) is the current codebase aligned with it, and what must change.

A deep review shows the project is **already ~75% aligned with the SOW** — far more is built than the git status alone suggests. The skeleton, data layer, auth, admin panel, and most CRUD are real and solid. The gaps are concentrated in three stubbed integrations (n8n chat, Stripe, reminder jobs), a few missing public pages, and production hardening (tests/observability/prod CI).

**Decisions locked in:**
- **Storage:** Supabase is the primary store *for now* (Firebase Storage needs a paid plan). The architecture keeps a clean storage abstraction so the swap to Firebase-only (planned in a few days) is a one-adapter change. Handover/SOW docs stay "Firebase" — reconcile at migration.
- **Priority:** Close **functional gaps first**, then harden.
- **DB schema:** The current 9 Mongoose models are *provisional/imagined*. Real schemas land after the client meeting. Don't over-invest in schema churn now; plan a reconciliation pass. Keep models behind controllers (already the case) so schema changes don't ripple into routes/UI.

---

## Part 1 — Target Production Architecture

```
                          ┌─────────────────────────────┐
        Browser  ───────► │  apps/web (React 19 + Vite)  │
   (mobile/tablet/desktop)│  - user app + /admin panel   │
                          │  - React Query (server state)│
                          │  - Zustand (auth/ui state)   │
                          └──────────────┬──────────────┘
                                         │ HTTPS /api  (Bearer JWT, refresh-on-401)
                          ┌──────────────▼──────────────┐
                          │  apps/api (Express 5 + TS)   │
                          │  routes → validate(zod) →    │
                          │  authenticate → authorize →  │
                          │  controller → service → model│
                          └───┬─────┬──────┬──────┬──────┘
                              │     │      │      │
              ┌───────────────┘     │      │      └────────────────┐
              ▼                     ▼      ▼                       ▼
     ┌──────────────┐   ┌──────────────────┐  ┌────────────┐  ┌──────────────┐
     │ MongoDB Atlas│   │ Storage Adapter  │  │ Stripe     │  │ n8n webhook  │
     │ (Mongoose)   │   │ (Supabase→FB swap)│  │ (billing)  │  │ (AI relay)   │
     └──────────────┘   └──────────────────┘  └────────────┘  └──────────────┘
              ▲                                       ▲
              │                ┌──────────────────────┘
     ┌────────┴─────────┐      │ webhooks (raw body, signature verify)
     │ Worker (BullMQ)  │      │
     │ - reminder send  │◄─────┘  Redis (Upstash/Render) backs queues + scheduler
     │ - stalled-journey│
     │ - email dispatch │      Email: Resend (txn) ── Sentry (errors) ── Pino (logs)
     └──────────────────┘
```

**Layering rules (mostly already followed — keep enforcing):**
- `packages/shared` is the single source of truth for types + Zod schemas. Both apps import `@nextx/shared`. No type duplication. **All new fields/enums start here.**
- API flow is strictly `route → validate → authenticate → authorize → controller → service → model`. Controllers never touch external SDKs directly — they call a `service/`. This is what makes the Supabase→Firebase swap and schema reconciliation cheap.
- External integrations (storage, Stripe, n8n, email) live behind service interfaces in `apps/api/src/services/` so they are mockable in tests and swappable.
- Long-running / scheduled work (reminder delivery, stalled-journey alerts) runs in a **separate worker process** driven by BullMQ + Redis — never in request handlers.

---

## Part 2 — Alignment Scorecard (current vs SOW)

| Area | SOW MS | State | Note |
|---|---|---|---|
| Auth (signup/login/logout/reset/Google) | M1 | ✅ Done | Email *verification send* is a TODO |
| Profile mgmt | M1 | ✅ Done | Avatar upload stubbed |
| Children CRUD | M1 | ✅ Done | |
| Documents (upload/folders/tags/search) | M1 | ✅ Done | On Supabase, behind a partial adapter |
| Design system + UI kit | M1 | ✅ Done | tokens.css, Button/Input/Card/Modal/Toast |
| Journey tracker + next steps | M2 | ✅ Done | |
| Reminders CRUD | M2 | ⚠️ Partial | No scheduled delivery (BullMQ unused) |
| Support tickets (user+admin) | M2 | ✅ Done | |
| Knowledge base (admin editor + API) | M2/M3 | ✅ Done | Public-facing FAQ/EHCP pages missing |
| **AI chat (n8n relay)** | M2 | 🔴 Stub | Persistence done; webhook relay hardcoded placeholder |
| **Stripe (checkout/portal/webhooks)** | M2 | 🔴 Stub | Model + status done; all Stripe calls TODO |
| **Public pages** (Chat, Subscription, FAQ, EHCP intro) | M2 | 🔴 Missing | Routes alias to DashboardPage |
| Admin panel (7 pages + RBAC + audit log) | M3 | ✅ Done | acknowledgeAlert stub |
| Stalled-journey alerts | M3 | ⚠️ Partial | Query exists; no scheduled job/email |
| Sentry / error tracking | M3 | 🔴 Missing | DSN accepted, never wired |
| Tests (unit + E2E) | P3 | ⚠️ Partial | 1 integration test; no Playwright |
| Prod CI/CD | infra | ⚠️ Partial | Staging only; no prod/release workflow |

**Verdict:** the architecture in the codebase *already matches* the target above — same layering, shared types, middleware, adapters. No re-architecture needed. The work is **filling stubs + adding the worker + hardening**, not restructuring.

---

## Part 3 — What Needs to Change (sequenced: functional gaps first)

### Gap 1 — Storage abstraction (do first; unblocks the Firebase swap)
Today `document.controller.ts` branches inline across Supabase/Firebase/local. Extract a single interface so the swap is one file.
- Create `apps/api/src/services/storage/StorageProvider.ts` — interface: `upload()`, `getSignedUrl()`, `delete()`.
- Implement `SupabaseStorageProvider.ts` (move logic from `fileUpload.service.ts` + `lib/supabase.ts`) and a stub `FirebaseStorageProvider.ts`.
- Select provider via env (`STORAGE_PROVIDER=supabase|firebase`) in a small factory.
- Refactor `document.controller.ts` and admin document download to depend only on the interface.
- *Result:* the "Firebase-only in a few days" change = implement one class + flip one env var.

### Gap 2 — AI chat n8n relay (M2, highest user-visible value)
- `apps/api/src/services/n8n.service.ts`: POST to `N8N_WEBHOOK_URL` with shared-secret signing (`N8N_WEBHOOK_SECRET`), timeout (`N8N_TIMEOUT_MS`), retry w/ backoff; map response → assistant message.
- Replace the placeholder in `chat.controller.ts` (~line 64) with a real call; persist `n8nExecutionId`, `processingTimeMs`, and `error` (already in `ChatMessage` schema).
- Build the missing **ChatPage** (`apps/web/src/pages/ChatPage.tsx`) + wire route (currently aliased to DashboardPage in `router.tsx`): message list, typing indicator, retry-on-failure, paginated history. Add `chat.service.ts`.

### Gap 3 — Stripe subscriptions (M2)
- `apps/api/src/services/stripe.service.ts`: `createCheckoutSession()`, `createBillingPortalSession()`, `constructWebhookEvent()` (signature verify against raw body — raw-body route already reserved in `index.ts`).
- Fill `subscription.controller.ts` checkout/portal stubs; implement `webhook.controller.ts` handlers for `checkout.session.completed`, `customer.subscription.updated/deleted` → sync `Subscription` doc + plan gating.
- Build **SubscriptionPage** (`apps/web/src/pages/SubscriptionPage.tsx`): plan cards → Checkout redirect, "Manage billing" → Portal. Add `subscription.service.ts`. Gate premium features off subscription status.

### Gap 4 — Worker + scheduled jobs (M2/M3) — activates already-installed BullMQ
- New process `apps/api/src/worker/index.ts` (separate entry; its own Render service/start script).
- Queues: `reminders` (deliver at `dueAt` via Resend + in-app), `stalled-journey` (cron; raises admin alert + email; powers the existing `getStalledAlerts`). Reuse `config/redis.ts`.
- Reminder create/snooze enqueues/reschedules jobs. Requires a real `REDIS_URL` (Upstash free tier or Render Redis).

### Gap 5 — Email completeness (M1/M2)
- Wire verification email on signup (`auth.controller.ts` ~line 47 TODO) using existing `utils/email.ts` pattern.
- Add reminder + support-reply email templates; move `EMAIL_FROM` off the `onboarding@resend.dev` test sender to the verified domain.

### Gap 6 — Public content pages (M2)
- Build **FAQPage** and **EHCPIntroPage** consuming the existing public knowledge endpoints (`getFAQ`, `getEHCPIntro`); render markdown (DOMPurify already a dep). Replace the DashboardPage route aliases.
- Avatar upload in ProfilePage → storage adapter (`user.controller.ts` stub).

### Gap 7 — Production hardening (after functional gaps)
- **Sentry**: wire `@sentry/node` (API + worker) and `@sentry/react` (web); Express error handler integration. DSN env already accepted.
- **Tests**: expand Vitest service/controller coverage (mock the new service interfaces); add Playwright E2E for the M-demo happy paths (signup→login→child→document→chat→subscribe). Add root `vitest`/Playwright config.
- **CI/CD**: add production workflow (deploy on release tag to prod Vercel + Render) to complement the existing staging-on-`test`-branch flow; add migration/rollback note.
- **Webhook hardening**: confirm Stripe + n8n signature verification on by default; document raw-body handling.

### Gap 8 — DB schema reconciliation (after client meeting — do NOT pre-build)
- When client schemas arrive: diff against the 9 provisional models in `apps/api/src/models/`, update `packages/shared` types + Zod first, then models, then controllers. Because routes/UI depend on shared types (not models directly), the blast radius stays small.

---

## Critical Files

**Reuse / depend on (already solid):** `packages/shared/src/*` (types+schemas), `apps/api/src/middleware/*` (authenticate/authorize/validate/rateLimiter/errorHandler), `apps/api/src/config/{env,database,redis,stripe,firebase,email}.ts`, `apps/web/src/services/api.ts` (refresh interceptor), `apps/web/src/components/ui/*`.

**Create:** `apps/api/src/services/storage/{StorageProvider,SupabaseStorageProvider,FirebaseStorageProvider}.ts`, `apps/api/src/services/{n8n,stripe}.service.ts`, `apps/api/src/worker/index.ts` (+ queue defs), `apps/web/src/pages/{ChatPage,SubscriptionPage,FAQPage,EHCPIntroPage}.tsx`, `apps/web/src/services/{chat,subscription}.service.ts`.

**Modify:** `apps/api/src/controllers/{chat,subscription,webhook,user,reminder,document}.controller.ts`, `apps/api/src/controllers/auth.controller.ts` (verification email), `apps/web/src/router.tsx` (replace placeholder aliases).

---

## Verification

- **Per-gap demos mirror the SOW milestone demos** (each milestone is paid on a working staging demo):
  - Chat: send a message → real n8n reply persisted, retry works on forced failure, history paginates.
  - Stripe: subscribe via Checkout (test card), portal upgrade/cancel, webhook flips `Subscription` doc; replay a webhook → idempotent.
  - Worker: create a reminder due in 2 min → email + in-app fire at `dueAt`; stall a journey → admin alert appears.
  - Storage swap dry-run: flip `STORAGE_PROVIDER` and confirm upload/download/signed-URL/delete through the interface.
- **Automated:** `pnpm test` (Vitest, mocked services), `pnpm typecheck`, `pnpm lint` green across the monorepo; Playwright E2E happy-path passes on staging.
- **Security spot-checks (P3):** every endpoint authorizes; non-admin blocked from `/admin`; signed-URL expiry enforced; unauthenticated access rejected.
