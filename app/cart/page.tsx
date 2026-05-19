"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { whatsappCartUrl, messengerCartUrl } from "@/lib/messaging";
import type { CartItem } from "@/lib/messaging";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  const currency = items[0]?.currency ?? "GEL";

  const messagingItems: CartItem[] = items.map((i) => ({
    id: i.id, name: i.name, price: i.price,
    currency: i.currency, quantity: i.quantity,
    image: i.image ?? undefined,
  }));

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛍️</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", marginBottom: 12 }}>Your cart is empty</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>Add some products and come back!</p>
        <Link href="/products" style={{
          background: "var(--primary)", color: "white",
          padding: "0.75rem 2rem", borderRadius: 8, textDecoration: "none",
          fontWeight: 600, fontSize: 14,
        }}>Browse Products</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 600 }}>Shopping Cart</h1>
        <button onClick={clearCart} style={{ background: "none", border: "none", color: "#cc4444", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
          Clear all
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "start" }} className="cart-layout">
        {/* Items */}
        <div>
          {items.map((item) => (
            <div key={item.id} style={{
              display: "flex", gap: 16, padding: "1.25rem",
              background: "white", borderRadius: 12,
              border: "1px solid var(--border-color)",
              marginBottom: 12,
            }}>
              <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f5f0eb", position: "relative" }}>
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="80px" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{item.name}</h3>
                <p style={{ color: "var(--primary)", fontWeight: 700 }}>{item.price.toFixed(2)} {item.currency}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: 6, overflow: "hidden" }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: "4px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--primary)" }}>−</button>
                    <span style={{ padding: "4px 8px", fontSize: 14, fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: "4px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--primary)" }}>+</button>
                  </div>
                  <span style={{ marginLeft: "auto", fontWeight: 600, fontSize: 14 }}>
                    {(item.price * item.quantity).toFixed(2)} {item.currency}
                  </span>
                  <button onClick={() => removeItem(item.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#cc4444", fontSize: 12 }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--border-color)", padding: "1.5rem", minWidth: 260, position: "sticky", top: 90 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", fontWeight: 600, marginBottom: 16 }}>Order Summary</h2>

          {items.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: "var(--muted)" }}>
              <span>{item.name} × {item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div style={{ borderTop: "1px solid var(--border-color)", margin: "12px 0", paddingTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}>
              <span>Total</span>
              <span style={{ color: "var(--primary)" }}>{totalPrice.toFixed(2)} {currency}</span>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 14, marginTop: 8, lineHeight: 1.5 }}>
            Send your order via WhatsApp or Messenger and we&apos;ll confirm it shortly.
          </p>

          <a href={whatsappCartUrl(messagingItems)} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "#25D366", color: "white",
            padding: "0.75rem", borderRadius: 8, textDecoration: "none",
            fontWeight: 700, fontSize: 14, marginBottom: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.117 1.524 5.849L.057 23.5l5.802-1.52A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.96 0-3.788-.534-5.347-1.463l-.383-.228-3.441.902.918-3.352-.25-.397A9.794 9.794 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182c5.422 0 9.818 4.396 9.818 9.818 0 5.422-4.396 9.818-9.818 9.818z"/>
            </svg>
            Order via WhatsApp
          </a>

          <a href={messengerCartUrl(messagingItems)} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "#0084FF", color: "white",
            padding: "0.75rem", borderRadius: 8, textDecoration: "none",
            fontWeight: 700, fontSize: 14,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.63 0 12.595c0 3.874 1.908 7.32 4.883 9.57V24l4.458-2.45c1.19.33 2.45.507 3.759.507 6.627 0 12-5.373 12-12S18.627 0 12 0zm1.19 16.078l-3.054-3.254-5.955 3.254L10.8 9.4l3.13 3.254 5.88-3.254-6.62 6.678z"/>
            </svg>
            Order via Messenger
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
