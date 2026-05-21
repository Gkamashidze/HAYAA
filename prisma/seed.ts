import dotenv from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";

// Load .env.local first (local dev), then .env. Railway's real env vars are not overridden.
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: "Islamic Clothing", slug: "islamic-clothing" },
    { name: "Kids Clothing", slug: "childrens-clothing" },
    { name: "Kids Toys", slug: "childrens-toys" },
    { name: "Home Electronics", slug: "home-electronics" },
    { name: "Perfumery", slug: "perfumery" },
    { name: "Makeup", slug: "makeup" },
    { name: "Other", slug: "other" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  // Admin credentials come from env — never hardcode a password in the repo.
  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must be set and at least 8 characters (12+ recommended)."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { username },
    // Re-apply the hash so ADMIN_PASSWORD stays the single source of truth.
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`✅ Seeded: ${categories.length} categories + admin user (${username})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
