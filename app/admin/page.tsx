import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, categoryCount, featuredCount, outOfStockCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { featured: true } }),
    prisma.product.count({ where: { inStock: false } }),
  ]);

  const recentProducts = await prisma.product.findMany({
    take: 5, orderBy: { createdAt: "desc" }, include: { category: true },
  });

  const stats = [
    { label: "Total Products", value: productCount, icon: "🛍️", color: "#B5532A", href: "/admin/products" },
    { label: "Categories", value: categoryCount, icon: "📂", color: "#6366F1", href: "/admin/categories" },
    { label: "Featured", value: featuredCount, icon: "⭐", color: "#D4A574", href: "/admin/products" },
    { label: "Out of Stock", value: outOfStockCount, icon: "⚠️", color: "#cc4444", href: "/admin/products" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", fontWeight: 600, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Welcome back to HAYAA Admin</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="admin-stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: "2rem" }}>
        <Link href="/admin/products/new" style={{
          background: "var(--primary)", color: "white",
          padding: "0.625rem 1.25rem", borderRadius: 8, textDecoration: "none",
          fontWeight: 600, fontSize: 13,
        }}>+ Add Product</Link>
        <Link href="/admin/categories" style={{
          background: "white", color: "#1A1A1A",
          border: "1px solid var(--border-color)",
          padding: "0.625rem 1.25rem", borderRadius: 8, textDecoration: "none",
          fontWeight: 500, fontSize: 13,
        }}>Manage Categories</Link>
      </div>

      {/* Recent products */}
      <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Recent Products</h2>
          <Link href="/admin/products" style={{ color: "var(--primary)", textDecoration: "none", fontSize: 13 }}>View all</Link>
        </div>
        {recentProducts.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            No products yet. <Link href="/admin/products/new" style={{ color: "var(--primary)" }}>Add your first product →</Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Name", "Category", "Price", "Stock"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-color)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: "0.75rem 1rem", fontSize: 13, borderBottom: "1px solid var(--border-color)" }}>
                    <Link href={`/admin/products/${p.id}`} style={{ color: "#1A1A1A", textDecoration: "none", fontWeight: 500 }}>{p.name}</Link>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: 13, color: "var(--muted)", borderBottom: "1px solid var(--border-color)" }}>{p.category.name}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: 13, fontWeight: 600, color: "var(--primary)", borderBottom: "1px solid var(--border-color)" }}>{p.price.toFixed(2)} {p.currency}</td>
                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: p.inStock ? "rgba(42,122,42,0.1)" : "rgba(204,68,68,0.1)", color: p.inStock ? "#2a7a2a" : "#cc4444" }}>
                      {p.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
