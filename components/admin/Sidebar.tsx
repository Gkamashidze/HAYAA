"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/products", label: "Products", icon: "🛍️", exact: false },
  { href: "/admin/inventory", label: "Inventory", icon: "📦", exact: false },
  { href: "/admin/categories", label: "Categories", icon: "📂", exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: "#1A1A1A", color: "white",
      display: "flex", flexDirection: "column", minHeight: "100vh",
    }}>
      {/* Brand */}
      <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 14, color: "white" }}>H</span>
          </div>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em" }}>HAYAA</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>ADMIN PANEL</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem" }}>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "0.625rem 0.75rem", borderRadius: 8,
              textDecoration: "none",
              background: active ? "rgba(181,83,42,0.25)" : "transparent",
              color: active ? "white" : "rgba(255,255,255,0.65)",
              fontSize: 13, fontWeight: active ? 600 : 400,
              marginBottom: 4,
              borderLeft: active ? "3px solid var(--primary)" : "3px solid transparent",
              transition: "all 0.15s",
            }}
              onMouseEnter={(e) => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" target="_blank" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.5rem 0.75rem", borderRadius: 8, textDecoration: "none", color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 4 }}>
          🌐 View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "0.5rem 0.75rem", borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "left" }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
