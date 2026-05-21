"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, dict, dirFor, isLang, type DictKey, type Lang } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: (key: DictKey) => string;
  setLang: (next: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface ProviderProps {
  initialLang: Lang;
  children: ReactNode;
}

function writeLangCookie(lang: Lang): void {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=${oneYear};SameSite=Lax`;
}

export function LanguageProvider({ initialLang, children }: ProviderProps) {
  const router = useRouter();

  const setLang = useCallback((next: Lang) => {
    if (!isLang(next)) return;
    writeLangCookie(next);
    // Apply immediately so the page reflects RTL/LTR before the server re-renders.
    document.documentElement.lang = next;
    document.documentElement.dir = dirFor(next);
    // Refresh server components so localized text/data updates.
    router.refresh();
  }, [router]);

  const toggleLang = useCallback(() => {
    setLang(initialLang === "fa" ? "en" : "fa");
  }, [initialLang, setLang]);

  const value = useMemo<LanguageContextValue>(() => ({
    lang: initialLang,
    dir: dirFor(initialLang),
    t: (key: DictKey) => dict[key][initialLang],
    setLang,
    toggleLang,
  }), [initialLang, setLang, toggleLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
