import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Add Product — HAYAA Admin" };

export default function NewProductPage() {
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", fontWeight: 600 }}>Add Product</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Create a new product listing</p>
      </div>
      <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border-color)", padding: "2rem" }}>
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
