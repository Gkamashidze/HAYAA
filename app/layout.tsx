import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getServerLang } from "@/lib/i18n.server";
import { dirFor } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { NavCategory } from "@/lib/categories";

export const metadata: Metadata = {
  title: "HAYAA — Where Modesty Meets Luxury",
  description: "Discover elegant Islamic clothing, children's fashion, perfumery, and makeup at HAYAA.",
  icons: { icon: "/favicon.ico" },
};

// Category nav is read from the DB per request so admin changes (add, delete,
// rename, reorder) reflect on the site immediately.
async function getNavCategories(): Promise<NavCategory[]> {
  try {
    return await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, name: true, nameFa: true, slug: true },
    });
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, categories] = await Promise.all([getServerLang(), getNavCategories()]);
  const dir = dirFor(lang);

  return (
    <html lang={lang} dir={dir}>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <LanguageProvider initialLang={lang}>
          <CartProvider>
            <Header categories={categories} />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer categories={categories} />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
