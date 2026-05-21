"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, toggleLang, t } = useLanguage();
  const nextLabel = lang === "fa" ? "EN" : "فا";

  return (
    <button
      onClick={toggleLang}
      aria-label={t("switch_language")}
      title={t("switch_language")}
      style={{
        background: "none",
        border: "1px solid var(--border-color)",
        borderRadius: 6,
        padding: "0.35rem 0.65rem",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        color: "#1A1A1A",
        letterSpacing: "0.05em",
        minWidth: 44,
        transition: "background 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-color)";
        (e.currentTarget as HTMLButtonElement).style.color = "#1A1A1A";
      }}
    >
      {nextLabel}
    </button>
  );
}
