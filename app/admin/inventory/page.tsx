import InventoryClient from "@/components/admin/InventoryClient";

export const metadata = { title: "Inventory — HAYAA Admin" };

export default function InventoryPage() {
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", fontWeight: 600 }}>Inventory</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
          Track stock, run counts, and review every change
        </p>
      </div>
      <InventoryClient />
    </div>
  );
}
