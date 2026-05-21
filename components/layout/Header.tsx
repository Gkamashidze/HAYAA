"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Products" },
  { href: "/category/islamic-clothing", label: "Islamic Clothing" },
  { href: "/category/childrens-clothing", label: "Kids" },
  { href: "/category/childrens-toys", label: "Kids Toys" },
  { href: "/category/home-electronics", label: "Home Electronics" },
  { href: "/category/perfumery", label: "Perfumery" },
  { href: "/category/makeup", label: "Makeup" },
];

export default function Header() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header style={{ background: "white", borderBottom: "1px solid var(--border-color)" }} className="sticky top-0 z-40">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color: "white", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em" }}>H</span>
                </div>
                <div>
                  <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 18, color: "#1A1A1A", lineHeight: 1.1, letterSpacing: "0.08em" }}>HAYAA</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Where Modesty Meets Luxury</div>
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }} className="hidden md:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  color: pathname === link.href ? "var(--primary)" : "#1A1A1A",
                  fontWeight: pathname === link.href ? 600 : 400,
                  borderBottom: pathname === link.href ? "2px solid var(--primary)" : "2px solid transparent",
                  paddingBottom: 2,
                  transition: "color 0.2s",
                }}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                onClick={() => setCartOpen(true)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  position: "relative", padding: "0.5rem",
                  display: "flex", alignItems: "center", gap: 6,
                  color: "#1A1A1A",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {totalItems > 0 && (
                  <span style={{
                    position: "absolute", top: 2, right: 2,
                    background: "var(--primary)", color: "white",
                    borderRadius: "50%", width: 18, height: 18,
                    fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>

              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}
                className="md:hidden"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {menuOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <line x1="3" y1="12" x2="21" y2="12"/>
                      <line x1="3" y1="18" x2="21" y2="18"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: "white", borderTop: "1px solid var(--border-color)", padding: "1rem 1.5rem 1.5rem" }} className="md:hidden">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block", padding: "0.6rem 0",
                  textDecoration: "none",
                  color: pathname === link.href ? "var(--primary)" : "#1A1A1A",
                  fontWeight: pathname === link.href ? 600 : 400,
                  borderBottom: "1px solid var(--border-color)",
                  fontSize: "0.95rem",
                }}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
