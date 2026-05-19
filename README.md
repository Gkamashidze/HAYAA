# HAYAA Store

E-commerce website for **HAYAA** — *Where Modesty Meets Luxury*. A modest women's clothing store with a public storefront and an admin dashboard. Customers browse products, build a cart, and send orders via WhatsApp or Facebook Messenger.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Prisma 7** + **SQLite** (local) — switchable to PostgreSQL for production
- **NextAuth v5** — credentials-based admin authentication

## Features

**Storefront**
- Product catalog with categories: Islamic Clothing, Children's Clothing, Perfumery, Makeup, Other
- Category filtering and search
- Shopping cart (localStorage-based)
- Order checkout via WhatsApp / Messenger with a pre-filled message

**Admin Dashboard** (`/admin`)
- Product management (create, edit, delete) with image upload
- Category management
- Stats overview

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# then edit .env.local with your values

# 3. Create the database and seed it
npm run db:push
npm run db:seed

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin Access

- URL: `/admin/login`
- Default credentials: `admin` / `hayaa2024` (change before deploying)

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Database connection string |
| `NEXTAUTH_SECRET` | Secret for session encryption |
| `NEXTAUTH_URL` | App base URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number for orders (country code + number) |
| `NEXT_PUBLIC_MESSENGER_PAGE` | Facebook Page username for Messenger orders |
