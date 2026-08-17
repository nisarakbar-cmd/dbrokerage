# dBrokerage MVP — Build Brief (Claude Code)

**Stack:** Next.js (full-stack) · **Market:** Islamabad & Rawalpindi residential sales
**Source of truth:** DAOProptech Brokerage Strategy + approved dBrokerage MVP SRS + the 5 design mockups (homepage desktop/mobile, buy-results desktop/mobile, admin CRM).

> **How to use this file.** Drop it in the repo as `docs/BUILD_BRIEF.md` (and/or paste the relevant section into `CLAUDE.md`). Build in the milestone order in §10 — do **one milestone per Claude Code session**, verify against its acceptance criteria, then move on. Do not build anything in §11 (out of scope).

---

## Table of contents
1. [What we're building (and the one rule)](#1-what-were-building)
2. [Tech stack & setup](#2-tech-stack--setup)
3. [Design system / tokens](#3-design-system--tokens)
4. [Component inventory](#4-component-inventory)
5. [Routes / information architecture](#5-routes--information-architecture)
6. [Data model (Prisma)](#6-data-model-prisma)
7. [Screen specs & acceptance criteria](#7-screen-specs--acceptance-criteria)
8. [Lead capture + phone verification](#8-lead-capture--phone-verification)
9. [Scope decisions (the 3 flags, resolved)](#9-scope-decisions)
10. [Build order / milestones](#10-build-order--milestones)
11. [Explicitly NOT building](#11-explicitly-not-building)
12. [Guardrails & non-functional requirements](#12-guardrails--non-functional)
13. [Seed data](#13-seed-data)

---

## 1. What we're building

A **residential sales portal for one brokerage** — a discovery and evidence layer, **not an open marketplace**. It presents controlled inventory, captures **phone-verified** buyer leads, and gives Admin a simple internal workflow for listings, leads and viewings.

**Product principles (encode these in the UX):**
- **Trust before scale.** The brokerage is the product; the portal makes it visible. Never let the interface imply more verification than actually happened.
- **Three listing tiers, never blurred:**
  - `VERIFIED_FEATURED` — represented directly by dBrokerage.
  - `VERIFIED` — checked by dBrokerage but listed/represented elsewhere.
  - `UNVERIFIED` — clearly labelled, never shown with verified badges/language, always ranked last.
- **Default ordering = "listing priority":** Featured & Verified → Verified → Unverified.
- **Agents are never exposed.** No agent phone numbers on the public site; every inquiry routes through the platform.

### The one rule
> **Do not store ownership or title documents anywhere in this system.** Record verification *status / checklist completion / date* only. The admin UI must actively state this (see the drawer note in the mockup). No file-upload field for ownership docs, ever.

---

## 2. Tech stack & setup

| Concern | Choice |
|---|---|
| Framework | **Next.js 15 (App Router)**, React 19, TypeScript (strict) |
| Styling | **Tailwind CSS v4** + **shadcn/ui** (Radix primitives), dark theme default |
| Icons | **lucide-react** |
| DB | **PostgreSQL** — Neon (serverless, hosted) or local Postgres for dev |
| ORM | **Prisma 6** |
| Admin auth | **Auth.js v5 (NextAuth)** — Credentials provider, admin only |
| Password hashing | **argon2** (or bcrypt) |
| Mutations | **Server Actions**; use Route Handlers only for OTP endpoints/webhooks |
| Validation / forms | **Zod** + **React Hook Form** |
| Anti-spam / rate limit | Simple DB-based limiter for MVP (Upstash Ratelimit optional) |
| SMS (phone OTP) | **Abstracted `SmsSender` interface** — dev transport logs code to console; prod plugs Twilio Verify or a local PK SMS gateway |
| Maps (v1.1 only) | react-leaflet or Mapbox GL — **do not build in v1** |
| Deploy | Vercel + Neon |

**Project shape:**
```
src/
  app/
    (public)/            # homepage, buy, property, sell, home-estimator, static pages
    admin/               # gated CRM (own layout)
    api/otp/             # route handlers: request + verify
  components/
    ui/                  # shadcn primitives
    public/              # Nav, Footer, PropertyCard, FilterBar, TrustStrip, LeadDialog...
    admin/               # PipelineBoard, LeadsTable, LeadDrawer, KpiCard, ListingForm...
  lib/
    db.ts                # Prisma client
    auth.ts              # Auth.js config
    sms/                 # SmsSender interface + console + twilio impls
    ratelimit.ts
    format.ts            # PKR crore/lakh + size formatting
    location.ts          # location hierarchy helpers
  prisma/
    schema.prisma
    seed.ts
```

**Env vars:**
```
DATABASE_URL=
AUTH_SECRET=
SMS_PROVIDER=console        # console | twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
NEXT_PUBLIC_INVEST_URL=     # external DAOProptech investment platform link
```

**Setup steps (M0):** `create-next-app` (TS, App Router, Tailwind) → add shadcn/ui → add Prisma + connect Neon → add Auth.js → configure Tailwind theme tokens (§3) → fonts → `prisma migrate dev` → seed (§13).

---

## 3. Design system / tokens

The mockups pin the visual direction — **follow it exactly**. Dark, calm, "trustworthy fintech-for-real-estate." Cyan is the brand; two action colors are reserved and must never be reused for anything else.

**Palette (define as CSS variables / Tailwind theme):**
```
--bg-base:        #0A0F1E   /* app background, near-black navy */
--bg-surface:     #0F1629   /* cards, filter bar */
--bg-elevated:    #141C31   /* drawers, popovers, hover */
--border:         rgba(255,255,255,0.08)
--text:           #F8FAFC   /* primary */
--text-muted:     #94A3B8   /* labels, meta */
--text-subtle:    #64748B

--primary:        #1CA9E3   /* cyan — search, active tab, links, outlined Sign Up */
--primary-hover:  #1893C7

--action-viewing: #7C3AED   /* violet — "Request a Viewing" ONLY */
--action-contact: #25D366   /* WhatsApp green — "Contact Agent" ONLY */
--success:        #22C55E   /* "Available" dot */
```

**Pipeline stage colors** (admin chips must match the mockup exactly):
```
New              #3B82F6   (blue)
Contacted        #6366F1   (indigo)
Qualified        #14B8A6   (teal)
Viewing Req/Sch  #8B5CF6   (violet)
Negotiation      #F59E0B   (amber)
Closed           #22C55E   (green)
Lost             #EF4444   (red)
```

**Typography:** `Inter` (or `Geist Sans`) via `next/font`. Scale: hero H1 ~36–40px/600; section H2 ~24px/600; card price ~20px/600; labels ~13px/500 uppercase-tracked for filter labels and the "listing priority" legend; body 14–16px/400. Tabular numerals for prices/KPIs.

**Shape & spacing:** cards `rounded-xl` (~12px); inputs/buttons `rounded-lg` (~8px); pills/badges `rounded-full`. Hairline borders on `--border`. Generous padding; 8px spacing grid. Faint grid/topo texture behind hero sections only (very low opacity — atmosphere, not decoration).

**Button variants:** `primary` (cyan), `viewing` (violet, calendar icon), `contact` (green, WhatsApp icon), `outline` (cyan border on dark), `ghost`. Visible keyboard focus rings; respect `prefers-reduced-motion`.

**Copy voice (from the mockups, keep it):** plain, action-first, and honest — "Request a Viewing," "Contact Agent," "Checked inventory," "Phone-verified inquiries," "Browse account-free," "Listings are reviewed before publishing," "Controlled inventory across Islamabad & Rawalpindi." Buttons keep the same verb through the flow (a "Request a Viewing" submit → a "Viewing requested" confirmation).

---

## 4. Component inventory

**Public / shared:** `TopNav` (Buy · Sell · Invest↗ · Home Estimator · Log In · Sign Up; mobile hamburger), `Footer`, `HeroSearchCard` (Location · Property type · Price · Quick types House/Apartment/Plot), `FilterBar` (Location, Property type, Price, Bedrooms, Size, More filters, Search), `LocationBreadcrumb` (City › CDA/DHA/Bahria › Sector/Phase), `PropertyCard` (image, tier badge, price, location, beds/baths/size, Available dot, Request-a-Viewing + Contact-Agent), `TierBadge`, `AvailabilityDot`, `TierTabs` (Featured & Verified / Verified / Unverified), `SortSelect` ("Listing priority"), `ViewToggle` (List/Map or Map+List/Grid), `TrustStrip` (Checked inventory · Phone-verified inquiries · Browse account-free), `SellCta` ("Thinking of selling?"), `LeadDialog` (form + OTP step), `MarketUpdatesDialog`.

**Admin:** `AdminSidebar` (Overview, Leads & Pipeline, Listings, Viewings, Assignments), `AdminTopbar` (search, notifications, + New lead), `KpiCard` (value + Δ vs yesterday), `PipelineBoard` (7 color-coded stage columns with counts), `LeadsTable` (filters: source, agent, status, phone-verified), `StatusPill`, `LeadDrawer` (contact, property interest, assign + stage selects, schedule viewing, internal notes, activity timeline, the ownership-docs warning), `ListingForm` (specs, price, location, photos, tier, verification checklist, availability/status/expiry), `ListingsTable`, `VerificationChecklist`, `ViewingsTable`, `AssignmentsView`.

---

## 5. Routes / information architecture

**Public (no login needed to browse or send a lead):**
| Route | Purpose |
|---|---|
| `/` | Homepage — hero search, Explore properties (tier tabs), trust strip, sell CTA |
| `/buy` | Search results — filters + location hierarchy, listing-priority sort, list/grid (map = v1.1) |
| `/property/[slug]` | Property detail — specs, price, location, photos, description, tier, verification/status, availability, Contact Agent + Request a Viewing |
| `/sell` | "Thinking of selling?" → **lead form** (source `SELL`). Not self-publish. |
| `/home-estimator` | **Lead form** (source `HOME_ESTIMATOR`) — "request an estimate," *not* an instant valuation (see §9) |
| `/invest` | External redirect to `NEXT_PUBLIC_INVEST_URL` (opens the DAOProptech platform) |
| `/how-it-works`, `/about`, `/faqs`, `/contact` | Static content |

**Admin (gated, `role=ADMIN`):**
`/admin` (Overview) · `/admin/leads` (Leads & Pipeline) · `/admin/listings` + `/new` + `/[id]/edit` · `/admin/viewings` · `/admin/assignments` · `/admin/login`.

**Location hierarchy** (drives Location filter + breadcrumb), two branches per SRS:
- `City › CDA › Sector › Subsector/Society`
- `City › DHA / Bahria Town / Bahria Enclave › Phase › Sector`

---

## 6. Data model (Prisma)

```prisma
enum PropertyType { HOUSE APARTMENT PLOT }          // penthouse→APARTMENT, farmhouse→HOUSE
enum ListingTier  { VERIFIED_FEATURED VERIFIED UNVERIFIED }
enum Availability  { AVAILABLE UNDER_OFFER SOLD WITHDRAWN }
enum SizeUnit      { MARLA KANAL SQFT }
enum Zone          { CDA DHA BAHRIA_TOWN BAHRIA_ENCLAVE PRIVATE_SCHEME }
enum LeadSource    { REQUEST_VIEWING CONTACT_AGENT SELL HOME_ESTIMATOR MARKET_UPDATES }
enum LeadStatus    { NEW CONTACTED QUALIFIED VIEWING_REQUESTED VIEWING_SCHEDULED NEGOTIATION CLOSED LOST }
enum ViewingStatus { REQUESTED SCHEDULED COMPLETED CANCELLED }
enum AdminRole     { ADMIN AGENT }                  // only ADMIN logs in for v1
enum ActivityType  { PHONE_VERIFIED CREATED CONTACTED QUALIFIED VIEWING_REQUESTED VIEWING_SCHEDULED ASSIGNED STATUS_CHANGED NOTE_ADDED CLOSED LOST }

model Listing {
  id            String       @id @default(cuid())
  slug          String       @unique
  title         String
  description   String
  propertyType  PropertyType
  tier          ListingTier  @default(UNVERIFIED)
  priceRupees   BigInt        // store rupees; format to Crore/Lakh in UI
  availability  Availability @default(AVAILABLE)
  published     Boolean      @default(false)
  expiryDate    DateTime?    // MANUAL expiry only (no automation)

  // Location (structured for filtering + breadcrumb)
  city          String       @default("Islamabad")
  zone          Zone
  sector        String?
  phase         String?
  society       String?
  subSector     String?
  areaLabel     String        // e.g. "DHA Phase 2, Islamabad"
  lat           Float?        // nullable — for v1.1 map
  lng           Float?

  // Specs (beds/baths null for plots)
  bedrooms      Int?
  bathrooms     Int?
  sizeValue     Float
  sizeUnit      SizeUnit

  // Verification — STATUS ONLY, no documents
  verificationChecklistDone Boolean  @default(false)
  verifiedDate  DateTime?
  verifiedBy    String?
  sourceRef     String?       // unverified: source url/person (admin-only)
  lastCheckedAt DateTime?     // unverified freshness display

  photos        Photo[]
  leads         Lead[]
  viewings      Viewing[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Photo {
  id        String  @id @default(cuid())
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  order     Int     @default(0)
}

model Agent {                 // assignment target; no login in v1
  id        String  @id @default(cuid())
  name      String
  initials  String
  email     String?
  active    Boolean @default(true)
  leads     Lead[]
  viewings  Viewing[]
}

model AdminUser {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  role         AdminRole @default(ADMIN)
  active       Boolean   @default(true)
}

model Lead {
  id              String     @id @default(cuid())
  source          LeadSource
  status          LeadStatus @default(NEW)
  name            String
  phone           String
  email           String?
  phoneVerified   Boolean    @default(false)
  verifiedAt      DateTime?
  message         String?
  propertyInterest String?   // free text when no listing (e.g. "Islamabad residential")
  preferredTime   DateTime?  // for REQUEST_VIEWING

  listingId       String?
  listing         Listing?   @relation(fields: [listingId], references: [id])
  assignedAgentId String?
  assignedAgent   Agent?     @relation(fields: [assignedAgentId], references: [id])

  notes           LeadNote[]
  activities      LeadActivity[]
  viewings        Viewing[]
  createdAt       DateTime   @default(now())
  lastActivityAt  DateTime   @default(now())
}

model LeadNote {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  body      String
  authorId  String?
  createdAt DateTime @default(now())
}

model LeadActivity {
  id        String       @id @default(cuid())
  leadId    String
  lead      Lead         @relation(fields: [leadId], references: [id], onDelete: Cascade)
  type      ActivityType
  message   String
  actorId   String?
  createdAt DateTime     @default(now())
}

model Viewing {
  id          String        @id @default(cuid())
  leadId      String
  lead        Lead          @relation(fields: [leadId], references: [id], onDelete: Cascade)
  listingId   String
  listing     Listing       @relation(fields: [listingId], references: [id])
  agentId     String?
  agent       Agent?        @relation(fields: [agentId], references: [id])
  scheduledAt DateTime?
  status      ViewingStatus @default(REQUESTED)
  notes       String?
  createdAt   DateTime      @default(now())
}

model OtpChallenge {
  id         String   @id @default(cuid())
  phone      String
  codeHash   String
  attempts   Int      @default(0)
  expiresAt  DateTime
  consumedAt DateTime?
  createdAt  DateTime @default(now())
  @@index([phone])
}
```

---

## 7. Screen specs & acceptance criteria

### 7.1 Homepage `/`
Hero search card (Location / Property type / Price range / Quick types House·Apartment·Plot) → routes to `/buy` with query params. "Explore properties" with tier tabs (Featured & Verified default, subtitle "Represented directly by dBrokerage"), a horizontal card carousel + "View all properties" → `/buy`. Trust strip (Checked inventory · Phone-verified inquiries · Browse account-free). "Thinking of selling?" band → `/sell`. Footer with the tagline.
**Done when:** tabs filter by tier; every card links to its detail page; card CTAs open the lead dialog; fully responsive to the mobile mockup.

### 7.2 Buy / results `/buy`
Filter bar + location breadcrumb; H1 "Properties for sale in Islamabad & Rawalpindi"; live count ("24 properties"); "All matching listings, ordered by listing priority" + the tier legend; Sort ("Listing priority" default) and List/Grid toggle. Cards in a responsive grid. **Map is v1.1** — ship List/Grid now; leave a disabled/"coming soon" Map toggle if you want design fidelity.
**Done when:** filters (type, price, bedrooms, size, location hierarchy) work via URL params and server-side query; default sort enforces Featured&Verified → Verified → Unverified; mobile = single-column list with the same controls.

### 7.3 Property detail `/property/[slug]`
Photo gallery, price, location, description, specs (beds/baths/size — hide beds/baths for plots), tier badge, verification status + verified date (or "Unverified" treatment), availability, and **Contact Agent + Request a Viewing** buttons. **No agent contact info shown.**
**Unverified pages:** clearly labelled; no verified badge/language; primary CTA is "Ask dBrokerage to verify / check availability" rather than implying a confirmed viewing.
**Done when:** verified vs unverified are visually unmistakable; both CTAs open the lead dialog with listing context prefilled.

### 7.4 Admin — Leads & Pipeline `/admin/leads` (matches mockup 5)
KPI cards (New leads, Follow-ups due, Viewing requests, Active listings — each with Δ vs yesterday). Horizontal `PipelineBoard`: New → Contacted → Qualified → Viewing Requested/Scheduled → Negotiation → Closed → Lost, with live counts and the exact colors. Recent-leads table with filters (source, agent, status, phone-verified) and columns Lead · Inquiry source · Property/Interest · Assigned to · Status · Last activity. Clicking a row opens `LeadDrawer`: contact (with Phone-verified badge), property interest, **Assigned to** + **Stage** selects, **Schedule viewing**, **Internal notes** (add/save), **Activity timeline**, and the footer note *"Verification checklist data only. Do not upload ownership documents."*
**Done when:** changing stage/assignment writes a `LeadActivity` and updates the board/counts; scheduling creates a `Viewing`; notes persist; every mutation is a Server Action; the whole thing is admin-gated.

### 7.5 Admin — Listings `/admin/listings`
Create / edit / publish / unpublish / delete. Assign tier; maintain specs, photos, price, location; complete the **verification checklist** (records completion + date + who); set availability/status and a **manual** expiry date. **No ownership-document upload.** Log status/verification/availability changes to an audit trail.
**Done when:** publish/unpublish toggles public visibility; tier drives public ordering/badges; checklist state + verified date surface on the public page.

### 7.6 Admin — Viewings & Assignments
`Viewings`: list requested/scheduled viewings, set date/agent, mark completed/cancelled. `Assignments`: view leads by agent, (re)assign. Admin controls assignment and pipeline (no agent self-service in v1).

---

## 8. Lead capture + phone verification

Every property page has **separate** Contact Agent and Request a Viewing buttons; each opens a structured `LeadDialog`. Same phone-verified pattern powers Sell, Home Estimator, and Market Updates entry points.

**Flow:**
1. Form collects **name, phone, (email optional)**, message; Request-a-Viewing also collects **preferred date/time**. Listing context prefilled and read-only.
2. Submit → `POST /api/otp/request` creates an `OtpChallenge` and sends a code via `SmsSender` (dev: log to console). UI switches to code entry.
3. `POST /api/otp/verify` checks the code → on success, **create the `Lead`** (`phoneVerified=true`, correct `source`, listing attached), plus `LeadActivity` = `PHONE_VERIFIED` and the initial request activity. Confirmation uses the action's own verb ("Viewing requested").
4. **A lead is created only after successful phone verification.**

**Anti-spam:** hidden honeypot field; per-phone + per-IP rate limits; OTP expiry (~5 min) and max attempts; ignore/deny silently on limit.

**SMS abstraction:**
```ts
export interface SmsSender { send(phone: string, code: string): Promise<void>; }
// console impl (dev) logs the code; twilio impl uses Verify API. Select via SMS_PROVIDER.
```

---

## 9. Scope decisions

The 3 flags from our review, resolved for v1:

1. **Map view → DEFER to v1.1.** The strategy files a map under "launch soon after," and the SRS MVP is list/search-based. Ship `/buy` and `/property` with List/Grid + the location hierarchy now. Keep `lat`/`lng` nullable in the schema so the map drops in later with no migration. (Optional: a disabled "Map" toggle for design fidelity.)
2. **Home Estimator → LEAD FORM ONLY, not a valuation.** AI price scoring / automated valuation is explicitly out of scope, and the strategy is firm about not manufacturing price precision before the data exists. `/home-estimator` collects the property details and creates a phone-verified lead (`source=HOME_ESTIMATOR`) for a human to follow up. No number is computed or shown.
3. **Consumer auth → DEFER; Admin login only.** No customer account is required to browse or send a lead ("Sign up only for market updates"). For v1, wire the public **"Sign Up"** to the Market-Updates capture (`source=MARKET_UPDATES`); the real login lives at `/admin/login`, not the public nav. (Keep nav items for design fidelity, but they don't gate anything.)

---

## 10. Build order / milestones

Do one per session; verify acceptance criteria before moving on.

- **M0 — Setup.** Next.js + TS + Tailwind + shadcn + Prisma + Neon + Auth.js; theme tokens (§3); fonts; base layouts; `migrate` + seed (§13).
- **M1 — Design system & shared components.** Buttons (primary/viewing/contact/outline), TierBadge, StatusPill, PropertyCard, FilterBar, TopNav, Footer, TrustStrip. Static, no data yet.
- **M2 — Public read surfaces.** Homepage, `/buy` (filters + location hierarchy + tier ordering, List/Grid), `/property/[slug]`. Wire to DB + seed. SEO metadata + `RealEstateListing` structured data + OG previews.
- **M3 — Lead capture + phone OTP.** `LeadDialog`, OTP request/verify, Lead creation + activities, anti-spam; Sell / Home-Estimator / Market-Updates entry points.
- **M4 — Admin auth + Leads & Pipeline.** `/admin/login`, gated `/admin`, KPI cards, PipelineBoard, LeadsTable + filters, LeadDrawer (assign, stage, schedule viewing, notes, timeline, ownership-docs note).
- **M5 — Admin Listings.** CRUD, tier, verification checklist, photos, publish/unpublish, availability + manual expiry, audit trail.
- **M6 — Viewings + Assignments + polish.** Responsive QA against all mobile mockups, keyboard focus, reduced motion, empty/error states, backups/audit notes.
- **v1.1 (later, flagged):** Map on `/buy` + `/property`; anything else deferred.

---

## 11. Explicitly NOT building

From the SRS out-of-scope list — Claude Code must not add these:
- AI price scoring / automated valuation
- Automated listing freshness/expiry (**manual only**)
- Customer accounts, saved searches, alerts
- Native mobile apps
- Online consultancy-retainer payment
- Open owner/agent self-publishing
- Blockchain functionality
- Advanced CRM automation
- **Any storage of ownership/title documents** (see §1)

---

## 12. Guardrails & non-functional

- **Tier integrity:** unverified listings visually + textually distinct; never verified badges/language; always ranked last; different CTA ("ask us to verify").
- **No agent exposure:** all inquiries route through the platform; no public agent phone numbers.
- **No ownership docs** anywhere; admin UI states this on the lead drawer and listing form.
- **Role-based admin access;** all `/admin` routes gated by `role=ADMIN`.
- **Audit trail:** log listing status/verification/availability changes and lead status/assignment changes (via `LeadActivity` + a listing audit).
- **Performance:** fast on ordinary mobile connections; Server Components for reads; images optimized (`next/image`).
- **Responsive:** all three surfaces match their mobile mockups; visible keyboard focus; `prefers-reduced-motion` respected.
- **No login to browse or send a lead.**
- **SEO:** clean area/listing pages, structured data, tidy share previews.
- **Ops:** daily DB backups (Neon), basic privacy controls, a documented incident path.

---

## 13. Seed data

Seed from the mockups so the UI has realistic content.

**Listings (Featured & Verified):**
| Price | Type | Location | Beds/Baths | Size |
|---|---|---|---|---|
| PKR 8.75 Crore | House | DHA Phase 2, Islamabad | 5 / 6 | 1 kanal |
| PKR 4.20 Crore | Apartment | F-11/1, Islamabad | 3 / 3 | 12 marla |
| PKR 2.85 Crore | Plot | Bahria Town Phase 7 | — | 10 marla |
| PKR 6.10 Crore | House | E-11/4, Islamabad | 4 / 5 | 14 marla |

Add ~3 `VERIFIED` and ~3 `UNVERIFIED` listings across CDA sectors / Bahria / DHA so tiers and ordering are visible (target ~24 total to match the "24 properties" count).

**Agents:** Ahmed Raza, Sana Iqbal. **Admin:** Hira Malik (Administrator).

**Leads (with source + status, phone-verified):**
| Name | Source | Interest | Assigned | Status |
|---|---|---|---|---|
| Sara Khan | Request Viewing | DHA Phase 2 · 8.75 Cr | Ahmed Raza | Viewing Requested |
| Hamza Ali | Contact Agent | F-11/1 · 4.20 Cr | — | New |
| Mariam Ahmed | Sell | E-11/4, Islamabad | Ahmed Raza | Contacted |
| Usman Tariq | Home Estimator | Bahria Town Phase 7 | — | Qualified |
| Noor Shah | Market Updates | Islamabad residential | Sana Iqbal | New |

Give Sara Khan a sample activity timeline (Phone verified → Viewing requested → Assigned to Ahmed Raza) and an internal note ("Prefers an evening visit. Financing pre-approved.") so the drawer renders fully.
