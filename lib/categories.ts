// Single source of truth for category display data (nav labels + icons).
// Slugs must match what's stored in the DB (see prisma/seed.ts).
// Edit this file to add/rename/reorder categories in Header, Footer, and homepage.

export type CategoryNav = {
  slug: string;
  label: string;
  icon: string;
  // Defaults to true. Set to false to hide from the top navbar (still shown in footer).
  inHeader?: boolean;
};

export const categoryNav: CategoryNav[] = [
  { slug: "islamic-clothing", label: "Islamic Clothing", icon: "🧕" },
  { slug: "childrens-clothing", label: "Kids", icon: "👧" },
  { slug: "childrens-toys", label: "Kids Toys", icon: "🧸" },
  { slug: "home-electronics", label: "Home Electronics", icon: "📺" },
  { slug: "perfumery", label: "Perfumery", icon: "🌹" },
  { slug: "makeup", label: "Makeup", icon: "💄" },
  { slug: "other", label: "Other", icon: "✨", inHeader: false },
];

export const categoryIcons: Record<string, string> = Object.fromEntries(
  categoryNav.map((c) => [c.slug, c.icon])
);
