// Public category navigation is driven by the DB (admin add/delete/rename/reorder
// all reflect on the site). This file only holds *presentation* metadata keyed by
// slug — an icon, header visibility, and optional dropdown nesting — plus helpers
// to turn the DB category list into a header nav tree.

// Minimal category shape the public nav needs (a subset of the DB Category).
export interface NavCategory {
  id: number;
  name: string;
  nameFa: string | null;
  slug: string;
}

interface Presentation {
  icon: string;
  // Defaults to true. false hides the category from the top navbar (still shown
  // in the footer and on the homepage).
  inHeader?: boolean;
  // Render this category as a dropdown child of the given slug.
  parentSlug?: string;
}

// Decoration for known slugs. Unknown (newly added) categories fall back to a
// default icon, show in the header, and render flat.
const PRESENTATION: Record<string, Presentation> = {
  "islamic-clothing": { icon: "🧕" },
  "childrens-clothing": { icon: "👧" },
  "childrens-toys": { icon: "🧸", inHeader: false, parentSlug: "childrens-clothing" },
  "home-electronics": { icon: "📺" },
  perfumery: { icon: "🌹" },
  makeup: { icon: "💄" },
  other: { icon: "✨", inHeader: false },
};

export const DEFAULT_CATEGORY_ICON = "🛍️";

export function iconFor(slug: string): string {
  return PRESENTATION[slug]?.icon ?? DEFAULT_CATEGORY_ICON;
}

// Backwards-compatible icon map for known slugs (used by the homepage grid).
export const categoryIcons: Record<string, string> = Object.fromEntries(
  Object.entries(PRESENTATION).map(([slug, p]) => [slug, p.icon])
);

export interface HeaderNavNode {
  category: NavCategory;
  children: NavCategory[];
}

// Builds the top-navbar tree from DB categories plus the presentation overlay:
//  - categories marked inHeader:false are skipped as top-level items;
//  - a category with a parentSlug becomes a dropdown child when its parent is
//    present; if the parent was deleted it simply drops out of the header
//    (still reachable via the footer and homepage).
export function buildHeaderNav(categories: NavCategory[]): HeaderNavNode[] {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const childrenOf = new Map<string, NavCategory[]>();

  for (const cat of categories) {
    const parentSlug = PRESENTATION[cat.slug]?.parentSlug;
    if (parentSlug && bySlug.has(parentSlug)) {
      const arr = childrenOf.get(parentSlug) ?? [];
      arr.push(cat);
      childrenOf.set(parentSlug, arr);
    }
  }

  const nodes: HeaderNavNode[] = [];
  for (const cat of categories) {
    const pres = PRESENTATION[cat.slug];
    const parentSlug = pres?.parentSlug;
    if (parentSlug && bySlug.has(parentSlug)) continue; // rendered as a child
    if (pres?.inHeader === false) continue; // explicitly hidden from header
    nodes.push({ category: cat, children: childrenOf.get(cat.slug) ?? [] });
  }
  return nodes;
}
