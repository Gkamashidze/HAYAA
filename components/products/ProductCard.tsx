"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const image = product.images[0] ?? null;

  return (
    <div style={{
      background: "white", borderRadius: 12, overflow: "hidden",
      border: "1px solid var(--border-color)",
      transition: "box-shadow 0.2s, transform 0.2s",
      display: "flex", flexDirection: "column",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <Link href={`/products/${product.id}`} style={{ textDecoration: "none" }}>
        <div style={{ aspectRatio: "3/4", background: "#f5f0eb", overflow: "hidden", position: "relative" }}>
          {image ? (
            <Image
              src={image} alt={product.name}
              fill style={{ objectFit: "contain" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
          {!product.inStock && (
            <div style={{
              position: "absolute", top: 8, left: 8,
              background: "#cc4444", color: "white",
              fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
              letterSpacing: "0.05em", textTransform: "uppercase",
            }}>Out of Stock</div>
          )}
          {product.featured && product.inStock && (
            <div style={{
              position: "absolute", top: 8, left: 8,
              background: "var(--gold)", color: "white",
              fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
              letterSpacing: "0.05em",
            }}>Featured</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: "0.875rem 1rem 1rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: 10, color: "var(--primary)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
          {product.category.name}
        </p>
        <Link href={`/products/${product.id}`} style={{ textDecoration: "none" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 6, lineHeight: 1.4 }}>
            {product.name}
          </h3>
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 15 }}>
            {product.price.toFixed(2)} {product.currency}
          </span>
          <button
            onClick={() => addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              currency: product.currency,
              image,
            })}
            disabled={!product.inStock}
            style={{
              background: product.inStock ? "var(--primary)" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "0.4rem 0.875rem",
              fontSize: 12,
              fontWeight: 600,
              cursor: product.inStock ? "pointer" : "not-allowed",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => product.inStock && ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary-dark)")}
            onMouseLeave={(e) => product.inStock && ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary)")}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
