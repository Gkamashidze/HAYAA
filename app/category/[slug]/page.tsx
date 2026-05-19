import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types";

type Params = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const rawProducts = await prisma.product.findMany({
    where: { categoryId: category.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const products = rawProducts.map((p) => ({
    ...p, images: JSON.parse(p.images as string) as string[],
  }));

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Category</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 600, marginBottom: 4 }}>{category.name}</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>{products.length} {products.length === 1 ? "item" : "items"}</p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#1A1A1A" }}>No products yet</h3>
          <p style={{ fontSize: 14 }}>Check back soon — new items coming!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {(products as unknown as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
