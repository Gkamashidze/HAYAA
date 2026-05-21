// Bilingual (English + Persian) dictionaries and helpers.
// Language is persisted in the `hayaa_lang` cookie so the server and client agree.

export type Lang = "en" | "fa";

export const LANG_COOKIE = "hayaa_lang";
export const DEFAULT_LANG: Lang = "en";
export const SUPPORTED_LANGS: readonly Lang[] = ["en", "fa"] as const;

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "fa";
}

export function dirFor(lang: Lang): "ltr" | "rtl" {
  return lang === "fa" ? "rtl" : "ltr";
}

export const dict = {
  // Header / Nav
  nav_home: { en: "Home", fa: "خانه" },
  nav_all_products: { en: "All Products", fa: "همه محصولات" },
  nav_toggle_submenu: { en: "Toggle submenu", fa: "باز/بستن زیرمنو" },
  brand_tagline: { en: "Where Modesty Meets Luxury", fa: "آنجا که حیا با تجمل تلاقی می‌کند" },
  switch_language: { en: "Switch language", fa: "تغییر زبان" },

  // Categories
  cat_islamic_clothing: { en: "Islamic Clothing", fa: "پوشاک اسلامی" },
  cat_childrens_clothing: { en: "Child", fa: "کودک" },
  cat_childrens_toys: { en: "Kids Toys", fa: "اسباب‌بازی کودکان" },
  cat_home_electronics: { en: "Home Electronics", fa: "لوازم الکترونیکی خانه" },
  cat_perfumery: { en: "Perfumery", fa: "عطریات" },
  cat_makeup: { en: "Makeup", fa: "آرایش" },
  cat_other: { en: "Other", fa: "سایر" },

  // Home page
  home_hero_subtitle: {
    en: "Discover our curated collection of elegant, modest fashion for every occasion.",
    fa: "مجموعه‌ی منتخب ما از مد محجبه و شیک برای هر مناسبتی را کشف کنید.",
  },
  home_shop_now: { en: "Shop Now", fa: "خرید کنید" },
  home_shop_by_category: { en: "Shop by Category", fa: "خرید بر اساس دسته‌بندی" },
  home_shop_by_category_sub: { en: "Find exactly what you're looking for", fa: "آنچه را که می‌خواهید پیدا کنید" },
  home_featured: { en: "Featured Collection", fa: "مجموعه ویژه" },
  home_featured_sub: { en: "Handpicked for you", fa: "گزیده‌ی ویژه برای شما" },
  home_view_all: { en: "View All →", fa: "مشاهده همه ←" },
  home_cta_title: { en: "Ready to Order?", fa: "آماده‌ی سفارش هستید؟" },
  home_cta_sub: {
    en: "Add items to your cart and send your order instantly via WhatsApp or Messenger.",
    fa: "محصولات را به سبد خرید اضافه کنید و سفارش خود را در لحظه از طریق واتس‌اپ یا مسنجر بفرستید.",
  },
  home_browse_all: { en: "Browse All Products", fa: "مشاهده همه محصولات" },

  // Product card / detail
  add_to_cart: { en: "Add to Cart", fa: "افزودن به سبد" },
  added_to_cart: { en: "Added to Cart!", fa: "به سبد افزوده شد!" },
  in_stock: { en: "In Stock", fa: "موجود" },
  out_of_stock: { en: "Out of Stock", fa: "ناموجود" },
  featured: { en: "Featured", fa: "ویژه" },
  category_label: { en: "Category", fa: "دسته‌بندی" },
  or_order_directly: { en: "OR ORDER DIRECTLY", fa: "یا مستقیم سفارش دهید" },
  order_via_whatsapp: { en: "Order via WhatsApp", fa: "سفارش از طریق واتس‌اپ" },
  order_via_messenger: { en: "Order via Messenger", fa: "سفارش از طریق مسنجر" },

  // Products listing
  all_products_title: { en: "All Products", fa: "همه محصولات" },
  search_placeholder: { en: "Search products...", fa: "جستجوی محصول..." },
  filter_all: { en: "All", fa: "همه" },
  items_count_one: { en: "item", fa: "محصول" },
  items_count_many: { en: "items", fa: "محصول" },
  no_products_found_title: { en: "No products found", fa: "محصولی یافت نشد" },
  no_products_found_sub: { en: "Try a different search or category.", fa: "جستجو یا دسته‌بندی دیگری را امتحان کنید." },
  no_products_yet_title: { en: "No products yet", fa: "هنوز محصولی نیست" },
  no_products_yet_sub: { en: "Check back soon — new items coming!", fa: "به‌زودی محصولات جدید اضافه می‌شوند!" },

  // Cart
  cart_title: { en: "Shopping Cart", fa: "سبد خرید" },
  cart_short: { en: "Cart", fa: "سبد" },
  cart_empty: { en: "Your cart is empty", fa: "سبد خرید شما خالی است" },
  cart_empty_sub: { en: "Add some products and come back!", fa: "چند محصول اضافه کنید و بازگردید!" },
  browse_products: { en: "Browse Products", fa: "مشاهده محصولات" },
  clear_all: { en: "Clear all", fa: "حذف همه" },
  remove: { en: "Remove", fa: "حذف" },
  total: { en: "Total", fa: "جمع کل" },
  order_summary: { en: "Order Summary", fa: "خلاصه‌ی سفارش" },
  cart_disclaimer: {
    en: "Send your order via WhatsApp or Messenger and we'll confirm it shortly.",
    fa: "سفارش خود را از طریق واتس‌اپ یا مسنجر بفرستید تا به‌زودی تأیید کنیم.",
  },
  view_cart_order: { en: "View Cart & Order", fa: "مشاهده سبد و سفارش" },

  // Footer
  footer_brand_sub: {
    en: "Where Modesty Meets Luxury.\nQuality Islamic and modest fashion.",
    fa: "آنجا که حیا با تجمل تلاقی می‌کند.\nپوشاک باکیفیت اسلامی و محجبه.",
  },
  footer_categories: { en: "Categories", fa: "دسته‌بندی‌ها" },
  footer_shop: { en: "Shop", fa: "فروشگاه" },
  footer_rights: { en: "All rights reserved.", fa: "تمامی حقوق محفوظ است." },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}

// Resolve a localized DB field. Falls back to the English value if Fa is missing.
export function localized<T extends { name: string; nameFa?: string | null }>(
  entity: T,
  lang: Lang,
): string {
  if (lang === "fa" && entity.nameFa && entity.nameFa.trim().length > 0) {
    return entity.nameFa;
  }
  return entity.name;
}

export function localizedDescription(
  description: string | null,
  descriptionFa: string | null | undefined,
  lang: Lang,
): string | null {
  if (lang === "fa" && descriptionFa && descriptionFa.trim().length > 0) {
    return descriptionFa;
  }
  return description;
}
