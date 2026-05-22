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
    { name: "Islamic Clothing", nameFa: "پوشاک اسلامی", slug: "islamic-clothing" },
    { name: "Kids Clothing", nameFa: "پوشاک کودک", slug: "childrens-clothing" },
    { name: "Kids Toys", nameFa: "اسباب‌بازی کودکان", slug: "childrens-toys" },
    { name: "Home Electronics", nameFa: "لوازم الکترونیکی خانه", slug: "home-electronics" },
    { name: "Perfumery", nameFa: "عطریات", slug: "perfumery" },
    { name: "Makeup", nameFa: "آرایش", slug: "makeup" },
    { name: "Other", nameFa: "سایر", slug: "other" },
  ];

  // Bootstrap default categories ONLY on an empty database. After the first
  // deploy the admin panel is the single source of truth, so categories the
  // owner deletes (or renames) are not recreated on subsequent deploys.
  const existingCategories = await prisma.category.count();
  if (existingCategories === 0) {
    await prisma.category.createMany({ data: categories });
    console.log(`Bootstrapped ${categories.length} default categories.`);
  } else {
    console.log(
      `Categories already exist (${existingCategories}); skipping category seed.`
    );
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

  console.log(`✅ Seed complete: admin user (${username}) ready`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
