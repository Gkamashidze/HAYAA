# HAYAA Store

E-commerce website for **HAYAA** — *Where Modesty Meets Luxury*. A modest women's clothing store with a public storefront and an admin dashboard. Customers browse products, build a cart, and send orders via WhatsApp or Facebook Messenger.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Prisma 7** + **PostgreSQL**
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

## Local Development

Requires a PostgreSQL database. The easiest option is to create one on
[Railway](https://railway.app) and use its public connection string.

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# then edit .env.local — paste your PostgreSQL DATABASE_URL

# 3. Create the schema and seed initial data
npm run db:deploy

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Railway

1. Create a new project on Railway and add a **PostgreSQL** database.
2. Add a service from this GitHub repo. Railway auto-detects Next.js.
3. In the service **Variables**, reference the database and set the rest:
   - `DATABASE_URL` → reference the PostgreSQL service's connection variable
   - `AUTH_SECRET` → run `openssl rand -base64 32` and paste the result
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` → your WhatsApp number (country code + number)
   - `NEXT_PUBLIC_MESSENGER_PAGE` → your Facebook Page username
4. Deploy. `railway.json` runs `npm run db:deploy` before each release —
   this syncs the database schema and seeds categories + the admin user.

## Admin Access

- URL: `/admin/login`
- Default credentials: `admin` / `hayaa2024` — **change this before going live.**

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Secret for session encryption (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number for orders (country code + number) |
| `NEXT_PUBLIC_MESSENGER_PAGE` | Facebook Page username for Messenger orders |

## Notes

- Product images upload to `public/uploads/`. Railway's filesystem is
  ephemeral — for persistent images, attach a Railway volume mounted at
  `public/uploads` or switch to an external store (e.g. Cloudinary).
