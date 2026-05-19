"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types";

interface Category { id: number; name: string; slug: string; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (search) params.set("search", search);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 600, marginBottom: "0.5rem" }}>All Products</h1>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: "2rem" }}>{products.length} items</p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "2rem", alignItems: "center" }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.6rem 1rem", borderRadius: 8, border: "1px solid var(--border-color)",
            fontSize: 14, background: "white", minWidth: 220,
          }}
        />

        {/* Category pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedCategory("")}
            style={{
              padding: "0.4rem 1rem", borderRadius: 999,
              border: `1.5px solid ${selectedCategory === "" ? "var(--primary)" : "var(--border-color)"}`,
              background: selectedCategory === "" ? "var(--primary)" : "white",
              color: selectedCategory === "" ? "white" : "#1A1A1A",
              cursor: "pointer", fontSize: 13, fontWeight: 500,
              transition: "all 0.2s",
            }}>
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              style={{
                padding: "0.4rem 1rem", borderRadius: 999,
                border: `1.5px solid ${selectedCategory === cat.slug ? "var(--primary)" : "var(--border-color)"}`,
                background: selectedCategory === cat.slug ? "var(--primary)" : "white",
                color: selectedCategory === cat.slug ? "white" : "#1A1A1A",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                transition: "all 0.2s",
              }}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, height: 280, border: "1px solid var(--border-color)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#1A1A1A" }}>No products found</h3>
          <p style={{ fontSize: 14 }}>Try a different search or category.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
