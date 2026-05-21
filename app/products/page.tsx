"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { localized } from "@/lib/i18n";
import type { Product, Category } from "@/types";

export default function ProductsPage() {
  const { t, lang } = useLanguage();
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

  const itemsLabel = products.length === 1 ? t("items_count_one") : t("items_count_many");

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 600, marginBottom: "0.5rem" }}>{t("all_products_title")}</h1>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: "2rem" }}>{products.length} {itemsLabel}</p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "2rem", alignItems: "center" }}>
        {/* Search */}
        <input
          type="text"
          placeholder={t("search_placeholder")}
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
            {t("filter_all")}
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
              {localized(cat, lang)}
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
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#1A1A1A" }}>{t("no_products_found_title")}</h3>
          <p style={{ fontSize: 14 }}>{t("no_products_found_sub")}</p>
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
