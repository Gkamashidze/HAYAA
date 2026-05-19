"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const deleteProduct = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await loadProducts();
    setDeleting(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", fontWeight: 600 }}>Products</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{products.length} total</p>
        </div>
        <Link href="/admin/products/new" style={{ background: "var(--primary)", color: "white", padding: "0.625rem 1.25rem", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
          + Add Product
        </Link>
      </div>

      <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
            No products yet. <Link href="/admin/products/new" style={{ color: "var(--primary)" }}>Add your first →</Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Image", "Name", "Category", "Price", "Stock", "Featured", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--border-color)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", background: "#f5f0eb", position: "relative" }}>
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "cover" }} sizes="44px" />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 18 }}>📷</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: 13, fontWeight: 500, borderBottom: "1px solid var(--border-color)" }}>{p.name}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: 12, color: "var(--muted)", borderBottom: "1px solid var(--border-color)" }}>{p.category.name}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: 13, fontWeight: 600, color: "var(--primary)", borderBottom: "1px solid var(--border-color)" }}>{p.price.toFixed(2)} {p.currency}</td>
                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: p.inStock ? "rgba(42,122,42,0.1)" : "rgba(204,68,68,0.1)", color: p.inStock ? "#2a7a2a" : "#cc4444" }}>
                      {p.inStock ? "In Stock" : "Out"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
                    {p.featured ? <span style={{ fontSize: 15 }}>⭐</span> : <span style={{ color: "#ccc", fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link href={`/admin/products/${p.id}`} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border-color)", background: "white", textDecoration: "none", fontSize: 12, color: "#1A1A1A", fontWeight: 500 }}>Edit</Link>
                      <button
                        onClick={() => deleteProduct(p.id, p.name)}
                        disabled={deleting === p.id}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(204,68,68,0.1)", color: "#cc4444", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                        {deleting === p.id ? "..." : "Delete"}
                      </button>
                    </div>
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
