"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface Props {
  product: { id: number; name: string; price: number; currency: string; image: string | null; inStock: boolean };
}

export default function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, currency: product.currency, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product.inStock) {
    return (
      <button disabled style={{ width: "100%", padding: "0.875rem", borderRadius: 8, background: "#e0e0e0", color: "#999", border: "none", fontWeight: 600, fontSize: 14, cursor: "not-allowed" }}>
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      style={{
        width: "100%", padding: "0.875rem", borderRadius: 8,
        background: added ? "#2a7a2a" : "var(--primary)",
        color: "white", border: "none", fontWeight: 600, fontSize: 14,
        cursor: "pointer", transition: "background 0.3s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
    >
      {added ? (
        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Added to Cart!</>
      ) : (
        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Add to Cart</>
      )}
    </button>
  );
}
