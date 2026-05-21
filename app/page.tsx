import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { categoryIcons } from "@/lib/categories";

export const dynamic = "force-dynamic";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types";

async function getCategories() {
  return prisma.category.findMany({ orderBy: { id: "asc" } });
}

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true, inStock: true },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => ({ ...p, images: JSON.parse(p.images as string) as string[] }));
}

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts()]);

  return (
    <>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #1A1A1A 0%, #2C1810 60%, #B5532A 100%)",
        color: "white", padding: "5rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(181,83,42,0.15)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 300, height: 300, borderRadius: "50%", background: "rgba(212,165,116,0.1)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: "0 8px 32px rgba(181,83,42,0.5)" }}>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 30, color: "white", letterSpacing: "0.05em" }}>H</span>
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.75rem" }}>HAYAA</h1>
          <p style={{ fontSize: "clamp(0.85rem, 2vw, 1rem)", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1.75rem" }}>Where Modesty Meets Luxury</p>
          <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.1rem)", color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 500, margin: "0 auto 2.5rem" }}>
            Discover our curated collection of elegant, modest fashion for every occasion.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products" style={{ background: "var(--primary)", color: "white", padding: "0.875rem 2rem", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14, letterSpacing: "0.05em" }}>Shop Now</Link>
            <Link href="/category/islamic-clothing" style={{ background: "transparent", color: "white", border: "1.5px solid rgba(255,255,255,0.4)", padding: "0.875rem 2rem", borderRadius: 8, textDecoration: "none", fontWeight: 500, fontSize: 14 }}>Islamic Clothing</Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Categories */}
        <section style={{ paddingTop: "4rem", paddingBottom: "3rem" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", fontWeight: 600, textAlign: "center", marginBottom: "0.5rem" }}>Shop by Category</h2>
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, marginBottom: "2.5rem" }}>Find exactly what you&apos;re looking for</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="cat-card">
                <div style={{ fontSize: 32, marginBottom: 10 }}>{categoryIcons[cat.slug] ?? "🛍️"}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1A1A1A" }}>{cat.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section style={{ paddingBottom: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", fontWeight: 600 }}>Featured Collection</h2>
                <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>Handpicked for you</p>
              </div>
              <Link href="/products" style={{ color: "var(--primary)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>View All →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
              {(featured as unknown as Product[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", borderRadius: 16, padding: "3rem 2rem", textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", color: "white", marginBottom: "0.75rem" }}>Ready to Order?</h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: "1.75rem", maxWidth: 400, margin: "0 auto 1.75rem" }}>
            Add items to your cart and send your order instantly via WhatsApp or Messenger.
          </p>
          <Link href="/products" style={{ background: "white", color: "var(--primary)", padding: "0.75rem 2rem", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
            Browse All Products
          </Link>
        </section>
      </div>
    </>
  );
}
