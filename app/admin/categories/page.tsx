"use client";

import { useState, useEffect, useCallback } from "react";

interface Category { id: number; name: string; nameFa?: string | null; slug: string; _count?: { products: number }; }

const emptyForm = { name: "", nameFa: "", slug: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setError(""); };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, nameFa: cat.nameFa ?? "", slug: cat.slug });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) { setError("Name and slug required"); return; }
    setSaving(true); setError("");
    const payload = { ...form, nameFa: form.nameFa.trim() || null };
    const res = await fetch(
      editingId ? `/api/categories/${editingId}` : "/api/categories",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error"); return; }
    resetForm();
    load();
  };

  const deleteCategory = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id); setError("");
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to delete"); return; }
    if (editingId === id) resetForm();
    load();
  };

  const inputStyle = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, background: "white" };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", fontWeight: 600 }}>Categories</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>Manage product categories</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Create / edit form */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border-color)", padding: "1.5rem" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{editingId ? "Edit Category" : "Add Category"}</h2>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Category Name (EN) *</label>
            <input style={inputStyle} value={form.name} onChange={(e) => { const name = e.target.value; setForm((p) => ({ ...p, name, slug: editingId ? p.slug : slugify(name) })); }} placeholder="Islamic Clothing" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>Category Name (FA)</label>
            <input style={{ ...inputStyle, direction: "rtl", textAlign: "right" }} value={form.nameFa} onChange={(e) => setForm((p) => ({ ...p, nameFa: e.target.value }))} placeholder="پوشاک اسلامی" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, display: "block", marginBottom: 4 }}>URL Slug *</label>
            <input style={inputStyle} value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="islamic-clothing" />
          </div>
          {error && <div style={{ color: "#cc4444", fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSubmit} disabled={saving} style={{
              background: saving ? "#ccc" : "var(--primary)", color: "white",
              padding: "0.5rem 1rem", borderRadius: 6, border: "none",
              fontWeight: 600, fontSize: 13, cursor: saving ? "not-allowed" : "pointer",
            }}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Category"}
            </button>
            {editingId && (
              <button onClick={resetForm} disabled={saving} style={{
                background: "white", color: "#1A1A1A",
                padding: "0.5rem 1rem", borderRadius: 6, border: "1px solid var(--border-color)",
                fontWeight: 500, fontSize: 13, cursor: "pointer",
              }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border-color)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Loading...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Name", "Slug", "Products", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--border-color)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={{ background: editingId === cat.id ? "rgba(181,83,42,0.06)" : "transparent" }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: 13, fontWeight: 500, borderBottom: "1px solid var(--border-color)" }}>{cat.name}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: 12, color: "var(--muted)", fontFamily: "monospace", borderBottom: "1px solid var(--border-color)" }}>{cat.slug}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: 13, borderBottom: "1px solid var(--border-color)" }}>
                      <span style={{ background: "rgba(181,83,42,0.08)", color: "var(--primary)", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                        {cat._count?.products ?? 0}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => startEdit(cat)}
                          style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border-color)", background: "white", cursor: "pointer", fontSize: 12, color: "#1A1A1A", fontWeight: 500 }}>
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id, cat.name)}
                          disabled={deleting === cat.id}
                          style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(204,68,68,0.1)", color: "#cc4444", cursor: deleting === cat.id ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 500 }}>
                          {deleting === cat.id ? "..." : "Delete"}
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
    </div>
  );
}
