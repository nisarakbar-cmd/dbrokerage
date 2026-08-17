# dBrokerage

Residential sales portal for Islamabad & Rawalpindi. See [`docs/BUILD_BRIEF.md`](docs/BUILD_BRIEF.md) for the full spec, design tokens, data model and milestone build order.

## Stack

Next.js 15 (App Router, TS strict) · Tailwind CSS v4 · shadcn/ui · Prisma 6 + PostgreSQL · Auth.js v5

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and AUTH_SECRET
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run seed` — seed the database from `prisma/seed.ts`
- `npm run lint` — ESLint
