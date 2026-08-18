# Operations

Practical notes for running dBrokerage in production. See [`BUILD_BRIEF.md`](./BUILD_BRIEF.md) for the product spec.

## Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Neon (serverless Postgres) or any managed Postgres works. |
| `AUTH_SECRET` | Yes | Auth.js session signing secret. Generate with `npx auth secret`. Never reuse the dev value. |
| `SMS_PROVIDER` | Yes | `console` (dev only — logs the OTP code to the server log, never use in production) or `twilio`. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | If `SMS_PROVIDER=twilio` | See `src/lib/sms/twilio.ts` — a plain Twilio Messaging API sender, untested against a real account. Verify it end-to-end before launch. |
| `TWILIO_VERIFY_SERVICE_SID` | No | Reserved for a future migration to Twilio's Verify product; unused by the current implementation. |
| `NEXT_PUBLIC_INVEST_URL` | No | External DAOProptech investment platform link, shown in the nav. The "Invest" nav item hides itself when this is unset — it never links to a dead `#`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical production URL, used to resolve absolute OG/share-preview image URLs. |

Copy `.env.example` to `.env` and fill these in. Never commit `.env`.

## Deploying and migrating

1. Deploy the app (e.g. Vercel) with the environment variables above set on the hosting platform, not just locally.
2. Run migrations against the production database **before** traffic hits the new build:
   ```bash
   npx prisma migrate deploy
   ```
   This applies any migrations in `prisma/migrations/` that haven't run yet. It's non-interactive and safe for CI/CD — unlike `prisma migrate dev`, it never generates new migrations or prompts for destructive changes.
3. Only seed a fresh/empty database (`npm run seed`). Do not run the seed script against a database that already has real leads or listings — the seed script's demo leads/listings are for local development and review, not production data. Curate real inventory instead (see the checklist below).

## Backups

Postgres should be backed up daily at minimum:
- **Neon**: point-in-time recovery is available on paid plans — confirm the retention window covers your recovery needs and that it's actually enabled for the production branch/project.
- **Self-managed/other providers**: schedule a daily `pg_dump` (or the provider's equivalent snapshot) to storage outside the database host itself, and periodically test that a backup actually restores — an untested backup is not a backup.

## Incident path

1. **Identify**: check the hosting platform's error/log dashboard and Next.js server logs for the failing request or Server Action.
2. **Contain**: if a bad deploy is the cause, roll back to the last known-good deployment first — investigate root cause after service is restored, not before.
3. **Data issues**: if a mutation corrupted data, use the audit trails to reconstruct what happened — `LeadActivity` for lead/pipeline changes, `ListingAudit` for listing changes — before attempting a manual fix or a backup restore.
4. **Communicate**: note the incident (what broke, when, impact, resolution) somewhere durable for the team — this file is a reasonable place to start a running log if you don't have an incident tracker yet.
5. **Follow up**: once resolved, add a regression check (a test, a validation, a guard in the relevant Server Action) so the same failure mode doesn't recur silently.

## Pre-launch checklist

- [ ] Rotate the seeded admin password (`hira.malik@dbrokerage.pk` / `Admin123!` is a dev-only default) — set a strong password via a real change, not the seed script.
- [ ] Set a real, unique `AUTH_SECRET` in production (not the value from local `.env`).
- [ ] Set a real production `DATABASE_URL` (not the local Docker instance).
- [ ] Configure and **test** a real SMS provider (`SMS_PROVIDER=twilio` with valid credentials) — confirm an OTP actually arrives on a real phone before launch. `console` must never be the production value.
- [ ] Confirm `/styleguide` 404s for anyone not signed in as `ADMIN` (it's gated in code — verify in the deployed environment too).
- [ ] Set `NEXT_PUBLIC_INVEST_URL` to the real DAOProptech investment platform link (or confirm it's intentionally omitted, in which case the nav item hides itself).
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real production domain for correct OG/share previews.
- [ ] Replace or clear the seed data — either re-seed a fresh database with curated real inventory, or manually remove the demo listings/leads/agents before going live.
- [ ] Confirm daily backups are actually configured and enabled (see above) — not just theoretically available on the provider.
