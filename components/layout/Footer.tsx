"use client";

import Link from "next/link";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "995000000000";
const MESSENGER = process.env.NEXT_PUBLIC_MESSENGER_PAGE ?? "hayaastore";

export default function Footer() {
  return (
    <footer style={{
      background: "#1A1A1A", color: "#ccc",
      marginTop: "auto",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "white", letterSpacing: "0.08em", marginBottom: 8 }}>HAYAA</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#aaa" }}>Where Modesty Meets Luxury.<br/>Quality Islamic and modest fashion.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                style={{ background: "#25D366", color: "white", padding: "6px 14px", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.117 1.524 5.849L.057 23.5l5.802-1.52A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.96 0-3.788-.534-5.347-1.463l-.383-.228-3.441.902.918-3.352-.25-.397A9.794 9.794 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182c5.422 0 9.818 4.396 9.818 9.818 0 5.422-4.396 9.818-9.818 9.818z"/></svg>
                WhatsApp
              </a>
              <a href={`https://m.me/${MESSENGER}`} target="_blank" rel="noopener noreferrer"
                style={{ background: "#0084FF", color: "white", padding: "6px 14px", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.63 0 12.595c0 3.874 1.908 7.32 4.883 9.57V24l4.458-2.45c1.19.33 2.45.507 3.759.507 6.627 0 12-5.373 12-12S18.627 0 12 0zm1.19 16.078l-3.054-3.254-5.955 3.254L10.8 9.4l3.13 3.254 5.88-3.254-6.62 6.678z"/></svg>
                Messenger
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 style={{ color: "white", fontSize: 14, fontWeight: 600, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Categories</h3>
            {[
              { href: "/category/islamic-clothing", label: "Islamic Clothing" },
              { href: "/category/childrens-clothing", label: "Children's Clothing" },
              { href: "/category/perfumery", label: "Perfumery" },
              { href: "/category/makeup", label: "Makeup" },
              { href: "/category/other", label: "Other" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ display: "block", color: "#aaa", textDecoration: "none", fontSize: 13, marginBottom: 6, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Shop */}
          <div>
            <h3 style={{ color: "white", fontSize: 14, fontWeight: 600, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Shop</h3>
            {[
              { href: "/products", label: "All Products" },
              { href: "/cart", label: "Shopping Cart" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ display: "block", color: "#aaa", textDecoration: "none", fontSize: 13, marginBottom: 6 }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #333", marginTop: "2rem", paddingTop: "1.5rem", textAlign: "center", fontSize: 12, color: "#777" }}>
          © {new Date().getFullYear()} HAYAA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
