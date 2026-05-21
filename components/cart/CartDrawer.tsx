"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

interface Props { open: boolean; onClose: () => void; }

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const { t, dir } = useLanguage();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            zIndex: 50, backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Drawer — anchored to the inline-end edge (right for LTR, left for RTL) */}
      <div style={{
        position: "fixed", top: 0, bottom: 0,
        insetInlineEnd: 0,
        width: "min(100vw, 400px)",
        background: "white",
        zIndex: 51,
        transform: open ? "translateX(0)" : (dir === "rtl" ? "translateX(-100%)" : "translateX(100%)"),
        transition: "transform 0.3s ease",
        display: "flex", flexDirection: "column",
        boxShadow: dir === "rtl" ? "4px 0 24px rgba(0,0,0,0.12)" : "-4px 0 24px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border-color)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 600 }}>
            {t("cart_short")} ({totalItems})
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: "3rem", color: "var(--muted)" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", opacity: 0.4 }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p style={{ fontSize: 14 }}>{t("cart_empty")}</p>
              <Link href="/products" onClick={onClose} style={{
                display: "inline-block", marginTop: 16, padding: "0.5rem 1.5rem",
                background: "var(--primary)", color: "white", borderRadius: 6,
                textDecoration: "none", fontSize: 13, fontWeight: 500,
              }}>{t("browse_products")}</Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{
                display: "flex", gap: 12, marginBottom: 16,
                paddingBottom: 16, borderBottom: "1px solid var(--border-color)",
              }}>
                {/* Image */}
                <div style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f5f0eb" }}>
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={64} height={64} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{item.name}</p>
                  <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>
                    {item.price.toFixed(2)} {item.currency}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid var(--border-color)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                      −
                    </button>
                    <span style={{ fontSize: 13, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid var(--border-color)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ marginInlineStart: "auto", background: "none", border: "none", cursor: "pointer", color: "#cc4444", fontSize: 11 }}>
                      {t("remove")}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", background: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>{t("total")}</span>
              <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 16 }}>
                {totalPrice.toFixed(2)} {items[0]?.currency ?? "USD"}
              </span>
            </div>
            <Link href="/cart" onClick={onClose} style={{
              display: "block", textAlign: "center", padding: "0.75rem",
              background: "var(--primary)", color: "white", borderRadius: 8,
              textDecoration: "none", fontWeight: 600, fontSize: 14,
            }}>
              {t("view_cart_order")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
