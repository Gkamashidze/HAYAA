import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getServerLang } from "@/lib/i18n.server";
import { dirFor } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "HAYAA — Where Modesty Meets Luxury",
  description: "Discover elegant Islamic clothing, children's fashion, perfumery, and makeup at HAYAA.",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getServerLang();
  const dir = dirFor(lang);

  return (
    <html lang={lang} dir={dir}>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <LanguageProvider initialLang={lang}>
          <CartProvider>
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
