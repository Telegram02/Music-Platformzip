# Caktus Productions

Music producer portfolio site for Eric (Caktus Productions) — showcases services, portfolio, and audio tracks with a full admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages (run `typecheck:libs` first after schema changes)
- `pnpm run typecheck:libs` — rebuild lib declarations (required before api-server typecheck after DB schema changes)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env secrets: `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_USERNAME`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (`artifacts/caktus-portfolio`)
- API: Express 5 + Helmet + express-rate-limit (`artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Auth: bcryptjs + express-session (session cookie: `caktus.sid`)

## Where things live

- `lib/db/src/schema/` — all DB table schemas (source of truth)
- `artifacts/api-server/src/routes/` — all API routes
- `artifacts/api-server/src/lib/seed.ts` — default data seeded on startup
- `artifacts/caktus-portfolio/src/components/sections/` — public page sections
- `artifacts/caktus-portfolio/src/pages/admin/tabs/` — all admin tab components
- `artifacts/caktus-portfolio/src/lib/api.ts` — typed API client
- `artifacts/caktus-portfolio/src/hooks/useSiteData.ts` — React Query hooks

## DB Tables

- `site_settings` — key-value settings (bio, tagline, seo, hero, availability, etc.)
- `audio_tracks` — music tracks (admin managed)
- `portfolio_items` — portfolio/reel items
- `social_links` — social media links
- `services` — service cards (icon, title, desc, color, sort_order, active)
- `contact_messages` — public contact form submissions (name, email, subject, message, read)
- `login_activity` — login attempt log (username, success, ip, timestamp)
- `admin_credentials` — admin username/email/password_hash
- `admin_otp` — password reset OTP codes

## Admin Tabs

- **Site Settings** — hero badge, tagline, bio, contact, availability, SEO meta, media uploads
- **Services** — full CRUD with icon picker + color theme picker
- **Audio Tracks** — manage music tracks
- **Portfolio** — manage portfolio/reel items
- **Social Links** — manage social links
- **Media Library** — file uploads
- **Messages** — contact form inbox (mark read/unread, reply, delete)
- **Login Activity** — authentication log with success/failure tracking
- **Account** — change password via email OTP

## Security

- Helmet.js security headers on all responses
- express-rate-limit: max 10 login attempts per 15 min per IP (skips successful logins)
- bcrypt (cost 12) for password hashing
- Session cookie: `caktus.sid`, httpOnly, sameSite lax, secure in prod
- `trust proxy = 1` so IP headers work behind Replit proxy
- All credentials in Replit Secrets (no hardcoded fallbacks)
- Login attempts logged to DB with IP address

## Architecture decisions

- Session-based auth (not JWT) — simpler for single-admin use case
- Services section is DB-driven with fallback to hardcoded defaults if empty
- Contact form stores messages in DB (no email sending for public form — admin views inbox)
- Rate limiter uses `skipSuccessfulRequests: true` so only failed attempts count toward limit
- New DB tables require `pnpm run typecheck:libs` before leaf package typechecks will pass

## Gotchas

- After adding new DB schema files, ALWAYS run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck`
- After schema changes, run `pnpm --filter @workspace/db run push` then restart the api-server workflow
- Server uses esbuild (not tsc) for its runtime build — TypeScript errors won't prevent the server from starting, but the typecheck script will catch them

## User preferences

- Add all security measures and premium admin features proactively
- No hardcoded credentials anywhere in source code
