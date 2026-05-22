"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Category { id: number; name: string; }
interface ProductFormData {
  name: string; nameFa: string;
  description: string; descriptionFa: string;
  price: string; costPrice: string; currency: string;
  categoryId: string; inStock: boolean; featured: boolean; images: string[];
  sku: string; quantity: string; lowStockThreshold: string;
}

interface Props {
  initialData?: Partial<ProductFormData> & { id?: number };
  mode: "create" | "edit";
}

export default function ProductForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    nameFa: initialData?.nameFa ?? "",
    description: initialData?.description ?? "",
    descriptionFa: initialData?.descriptionFa ?? "",
    price: initialData?.price ?? "",
    costPrice: initialData?.costPrice ?? "",
    currency: initialData?.currency ?? "USD",
    categoryId: initialData?.categoryId ?? "",
    inStock: initialData?.inStock ?? true,
    featured: initialData?.featured ?? false,
    images: initialData?.images ?? [],
    sku: initialData?.sku ?? "",
    quantity: initialData?.quantity ?? "0",
    lowStockThreshold: initialData?.lowStockThreshold ?? "5",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) set("images", [...form.images, data.url]);
  };

  const removeImage = (idx: number) =>
    set("images", form.images.filter((_, i) => i !== idx));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        ...form,
        price: Number(form.price),
        costPrice: form.costPrice.trim() === "" ? null : Number(form.costPrice),
        categoryId: Number(form.categoryId),
        nameFa: form.nameFa.trim() || null,
        descriptionFa: form.descriptionFa.trim() || null,
        sku: form.sku.trim() || null,
        lowStockThreshold: Number(form.lowStockThreshold),
      };
      // On edit, stock changes go through the audited Inventory page only.
      if (mode === "create") {
        payload.quantity = Number(form.quantity);
      } else {
        delete payload.quantity;
      }
      const url = mode === "edit" ? `/api/products/${initialData?.id}` : "/api/products";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "An error occurred");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8,
    border: "1px solid var(--border-color)", fontSize: 14, background: "white",
  };

  const labelStyle = { fontSize: 13, fontWeight: 500 as const, display: "block" as const, marginBottom: 6 };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Name (EN) */}
        <div>
          <label style={labelStyle}>Product Name (EN) *</label>
          <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. Black Abaya" />
        </div>

        {/* Name (FA) */}
        <div>
          <label style={labelStyle}>Product Name (FA)</label>
          <input style={{ ...inputStyle, direction: "rtl", textAlign: "right" }} value={form.nameFa} onChange={(e) => set("nameFa", e.target.value)} placeholder="مثلاً عبای مشکی" />
        </div>

        {/* Description (EN) */}
        <div>
          <label style={labelStyle}>Description (EN)</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Product description..." />
        </div>

        {/* Description (FA) */}
        <div>
          <label style={labelStyle}>Description (FA)</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical", direction: "rtl", textAlign: "right" }} value={form.descriptionFa} onChange={(e) => set("descriptionFa", e.target.value)} placeholder="توضیحات محصول..." />
        </div>

        {/* Price */}
        <div>
          <label style={labelStyle}>Price *</label>
          <input style={inputStyle} type="number" step="0.01" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} required placeholder="0.00" />
        </div>

        {/* Currency */}
        <div>
          <label style={labelStyle}>Currency</label>
          <select style={inputStyle} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        {/* Inventory */}
        <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", marginTop: "0.25rem" }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Inventory</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>SKU</label>
              <input style={inputStyle} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. ABYA-BLK-M" />
            </div>
            <div>
              <label style={labelStyle}>Cost Price</label>
              <input style={inputStyle} type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} placeholder="0.00" />
            </div>
            {mode === "create" ? (
              <div>
                <label style={labelStyle}>Opening Stock</label>
                <input style={inputStyle} type="number" step="1" min="0" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="0" />
              </div>
            ) : (
              <div>
                <label style={labelStyle}>On Hand</label>
                <div style={{ ...inputStyle, background: "#f5f5f5", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>{form.quantity}</span>
                  <Link href="/admin/inventory" style={{ fontSize: 11, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Manage →</Link>
                </div>
              </div>
            )}
            <div>
              <label style={labelStyle}>Low-stock Alert At</label>
              <input style={inputStyle} type="number" step="1" min="0" value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} placeholder="5" />
            </div>
          </div>
          {mode === "edit" && (
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
              On-hand quantity is changed from the Inventory page so every change is recorded.
            </p>
          )}
        </div>

        {/* Category */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Category *</label>
          <select style={inputStyle} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
            <option value="">Select category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Toggles */}
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
            <input type="checkbox" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--primary)" }} />
            In Stock
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--primary)" }} />
            Featured
          </label>
        </div>

        {/* Images */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Product Images</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            {form.images.map((img, i) => (
              <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                <Image src={img} alt={`Image ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="80px" />
                <button type="button" onClick={() => removeImage(i)} style={{
                  position: "absolute", top: 2, right: 2, width: 18, height: 18,
                  borderRadius: "50%", background: "rgba(204,68,68,0.9)", color: "white",
                  border: "none", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
              </div>
            ))}
            <label style={{
              width: 80, height: 80, borderRadius: 8, border: "2px dashed var(--border-color)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 11, color: "var(--muted)", gap: 4,
              background: uploading ? "#f5f5f5" : "white",
            }}>
              {uploading ? "..." : <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload
              </>}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} disabled={uploading} />
            </label>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)" }}>First image is the main product image. Max 5MB per file.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(204,68,68,0.08)", border: "1px solid rgba(204,68,68,0.3)", color: "#cc4444", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: 13, marginTop: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: "1.5rem" }}>
        <button type="submit" disabled={saving} style={{
          background: saving ? "#ccc" : "var(--primary)", color: "white",
          padding: "0.75rem 1.5rem", borderRadius: 8, border: "none",
          fontWeight: 600, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
        }}>
          {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} style={{
          background: "white", color: "#1A1A1A",
          border: "1px solid var(--border-color)",
          padding: "0.75rem 1.5rem", borderRadius: 8,
          fontWeight: 500, fontSize: 14, cursor: "pointer",
        }}>Cancel</button>
      </div>
    </form>
  );
}
