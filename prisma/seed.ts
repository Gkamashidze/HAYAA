import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: "Islamic Clothing", slug: "islamic-clothing" },
    { name: "Children's Clothing", slug: "childrens-clothing" },
    { name: "Perfumery", slug: "perfumery" },
    { name: "Makeup", slug: "makeup" },
    { name: "Other", slug: "other" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const passwordHash = await bcrypt.hash("hayaa2024", 12);
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash },
  });

  console.log("✅ Seeded: 5 categories + admin user (admin / hayaa2024)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
