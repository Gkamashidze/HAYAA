// Single source of truth for category display data (nav labels + icons).
// Slugs must match what's stored in the DB (see prisma/seed.ts).
// Edit this file to add/rename/reorder categories in Header, Footer, and homepage.

import type { DictKey, Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";

export type CategoryNav = {
  slug: string;
  label: string;
  labelKey: DictKey;
  icon: string;
  // Defaults to true. Set to false to hide from the top navbar (still shown in footer).
  inHeader?: boolean;
};

export const categoryNav: CategoryNav[] = [
  { slug: "islamic-clothing", label: "Islamic Clothing", labelKey: "cat_islamic_clothing", icon: "🧕" },
  { slug: "childrens-clothing", label: "Child", labelKey: "cat_childrens_clothing", icon: "👧" },
  { slug: "childrens-toys", label: "Kids Toys", labelKey: "cat_childrens_toys", icon: "🧸", inHeader: false },
  { slug: "home-electronics", label: "Home Electronics", labelKey: "cat_home_electronics", icon: "📺" },
  { slug: "perfumery", label: "Perfumery", labelKey: "cat_perfumery", icon: "🌹" },
  { slug: "makeup", label: "Makeup", labelKey: "cat_makeup", icon: "💄" },
  { slug: "other", label: "Other", labelKey: "cat_other", icon: "✨", inHeader: false },
];

export const categoryIcons: Record<string, string> = Object.fromEntries(
  categoryNav.map((c) => [c.slug, c.icon])
);

export function categoryLabel(slug: string, lang: Lang): string {
  const entry = categoryNav.find((c) => c.slug === slug);
  if (!entry) return slug;
  return dict[entry.labelKey][lang];
}
