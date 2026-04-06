# Contrib Platform

A **multi-tenant QR-first contributions PWA** designed for churches and organisations.

This platform enables users to quickly give via QR code, track their contributions, and allows admins to manage funds, campaigns, and reporting all in a secure, scalable web application.

---

## Features (MVP)

### Public Giving

* Scan QR code opens giving page
* Select fund/category (e.g. Tithe, Building Fund)
* Enter amount with quick presets
* Secure payment via Stripe Checkout
* Optional email receipt
* Guest checkout supported

### Member Portal

* View personal giving history
* Filter contributions by time (month, year, etc.)
* Download receipts
* (Future) Manage recurring donations

### Admin Portal

* View all donations
* Manage funds and categories
* Basic reporting and exports
* Campaign tracking (e.g. building progress)

### Multi-Tenant Ready

* Supports multiple organisations (churches, charities)
* Role-based access (admin, member)
* Data isolation via Supabase Row Level Security (RLS)

### PWA Support

* Installable on mobile devices
* Works well on low connectivity
* Offline fallback page

---

## Tech Stack

### Frontend / App

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js Route Handlers (API layer)
* Supabase (PostgreSQL + Auth + RLS)

### Payments

* Stripe Checkout (hosted payment flow)
* Stripe Webhooks (source of truth)

### Deployment

* Vercel (recommended)

---

## Project Structure (Simplified)

```text
src/
  app/               Pages + routes (Next.js App Router)
  components/        UI components
  lib/               Business logic, services, integrations
  hooks/             React hooks
  types/             Type definitions
  workers/           Service worker (PWA)

supabase/
  migrations/        Database schema + RLS policies
```

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

(or use npm/yarn)

---

### 2. Setup environment variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3. Run the app

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

---

## Payment Flow (Important)

1. User creates a contribution intent
2. App redirects to Stripe Checkout
3. Payment is completed on Stripe
4. Stripe sends webhook and backend verifies
5. Database is updated (this is the source of truth)

Never trust the success page alone; always rely on webhooks.

---

## Security Notes

* All sensitive logic runs server-side
* Stripe webhooks are verified using signatures
* Supabase Row Level Security (RLS) enforces data isolation
* No card details are handled directly (Stripe-hosted checkout)

---

## Core Concepts

### Organisation

A church or organisation using the platform

### Fund

A category for giving (e.g. Tithe, Building Fund)

### Campaign

A goal-based fund (e.g. GBP 50,000 building target)

### Contribution Intent

A pending donation before payment is completed

### Payment

Confirmed donation via Stripe webhook

---

## Roadmap

* [ ] Recurring donations
* [ ] Presentation mode (projector-friendly progress view)
* [ ] Multi-organisation onboarding
* [ ] Gift Aid support (UK)
* [ ] Email notifications and reporting
* [ ] Mobile app wrapper

---

## Disclaimer

This project is an MVP and should not be used in production without:

* Full payment testing
* Security review
* Compliance checks (especially for financial data)

---

## License

MIT License

---

## Vision

To make giving **simple, transparent, and accessible**, starting with churches and expanding to organisations globally.
