"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import CartDrawer from "@/components/cart/CartDrawer";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { buildHeaderNav, type NavCategory } from "@/lib/categories";
import { localized } from "@/lib/i18n";

type NavLink = {
  href: string;
  label: string;
  slug?: string;
  children?: { href: string; label: string }[];
};

export default function Header({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { lang, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const navLinks: NavLink[] = [
    { href: "/products", label: t("nav_all_products") },
    ...buildHeaderNav(categories).map((node) => ({
      href: `/category/${node.category.slug}`,
      label: localized(node.category, lang),
      slug: node.category.slug,
      children: node.children.length
        ? node.children.map((ch) => ({ href: `/category/${ch.slug}`, label: localized(ch, lang) }))
        : undefined,
    })),
  ];

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
                  <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 18, color: "#1A1A1A", lineHeight: 1.1, letterSpacing: "0.08em" }}>{lang === "fa" ? "حییأ" : "HAYAA"}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{t("brand_tagline")}</div>
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav style={{ gap: "1.5rem", alignItems: "center" }} className="hidden md:flex">
              {navLinks.map((link) => {
                const hasChildren = link.children && link.children.length > 0;
                const isOpen = hasChildren && openDropdown === link.href;
                return (
                  <div
                    key={link.href}
                    style={{ position: "relative" }}
                    onMouseEnter={() => hasChildren && setOpenDropdown(link.href)}
                    onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                  >
                    <Link href={link.href} style={{
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      color: pathname === link.href ? "var(--primary)" : "#1A1A1A",
                      fontWeight: pathname === link.href ? 600 : 400,
                      borderBottom: pathname === link.href ? "2px solid var(--primary)" : "2px solid transparent",
                      paddingBottom: 2,
                      transition: "color 0.2s",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      {link.label}
                      {hasChildren && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      )}
                    </Link>
                    {isOpen && link.children && (
                      <div style={{
                        position: "absolute",
                        top: "100%",
                        insetInlineStart: 0,
                        paddingTop: 10,
                        minWidth: 160,
                        zIndex: 50,
                      }}>
                        <div style={{
                          background: "white",
                          border: "1px solid var(--border-color)",
                          borderRadius: 6,
                          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                          padding: "0.4rem 0",
                        }}>
                          {link.children.map((child) => (
                            <Link key={child.href} href={child.href} style={{
                              display: "block",
                              padding: "0.55rem 1rem",
                              textDecoration: "none",
                              fontSize: "0.85rem",
                              color: pathname === child.href ? "var(--primary)" : "#1A1A1A",
                              fontWeight: pathname === child.href ? 600 : 400,
                              whiteSpace: "nowrap",
                            }}>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <LanguageSwitcher />

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
                    position: "absolute", top: 2, insetInlineEnd: 2,
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
            {navLinks.map((link) => {
              const hasChildren = link.children && link.children.length > 0;
              const isExpanded = hasChildren && mobileExpanded === link.href;
              return (
                <div key={link.href} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href={link.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        flex: 1,
                        display: "block", padding: "0.6rem 0",
                        textDecoration: "none",
                        color: pathname === link.href ? "var(--primary)" : "#1A1A1A",
                        fontWeight: pathname === link.href ? 600 : 400,
                        fontSize: "0.95rem",
                      }}>
                      {link.label}
                    </Link>
                    {hasChildren && (
                      <button
                        onClick={() => setMobileExpanded(isExpanded ? null : link.href)}
                        aria-label={t("nav_toggle_submenu")}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "0.6rem 0.5rem", color: "#1A1A1A" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  {isExpanded && link.children && (
                    <div style={{ paddingInlineStart: "1rem", paddingBottom: "0.4rem" }}>
                      {link.children.map((child) => (
                        <Link key={child.href} href={child.href}
                          onClick={() => setMenuOpen(false)}
                          style={{
                            display: "block",
                            padding: "0.5rem 0",
                            textDecoration: "none",
                            color: pathname === child.href ? "var(--primary)" : "#444",
                            fontWeight: pathname === child.href ? 600 : 400,
                            fontSize: "0.9rem",
                          }}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
