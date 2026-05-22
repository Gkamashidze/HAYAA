// Boundary input validation for the admin API routes.
// Dependency-free: small, explicit checks that fail fast with clear messages.

import type { MovementType } from "@/types";

export type Validated<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string };

const fail = (error: string): Validated<never> => ({ ok: false, error });

function asString(v: unknown, field: string, max: number): Validated<string> {
  if (typeof v !== "string") return fail(`${field} must be a string`);
  const trimmed = v.trim();
  if (trimmed.length === 0) return fail(`${field} is required`);
  if (trimmed.length > max) return fail(`${field} exceeds ${max} characters`);
  return { ok: true, data: trimmed };
}

function asPositiveNumber(v: unknown, field: string): Validated<number> {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    return fail(`${field} must be a positive number`);
  }
  return { ok: true, data: n };
}

function asPositiveInt(v: unknown, field: string): Validated<number> {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) {
    return fail(`${field} must be a positive integer`);
  }
  return { ok: true, data: n };
}

function asNonNegativeInt(v: unknown, field: string): Validated<number> {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) {
    return fail(`${field} must be a non-negative integer`);
  }
  if (n > 1_000_000) return fail(`${field} exceeds the maximum of 1,000,000`);
  return { ok: true, data: n };
}

// A signed integer (used for stock deltas, which may add or remove units).
function asInteger(v: unknown, field: string): Validated<number> {
  const n = Number(v);
  if (!Number.isInteger(n)) return fail(`${field} must be an integer`);
  if (Math.abs(n) > 1_000_000) return fail(`${field} is out of range`);
  return { ok: true, data: n };
}

// Optional money value (>= 0) — null when omitted or blank.
function asOptionalMoney(v: unknown, field: string): Validated<number | null> {
  if (v === undefined || v === null || v === "") return { ok: true, data: null };
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return fail(`${field} must be zero or a positive number`);
  return { ok: true, data: n };
}

// Optional SKU — null when blank; trimmed; alphanumerics, hyphen, underscore.
function asOptionalSku(v: unknown): Validated<string | null> {
  if (v === undefined || v === null) return { ok: true, data: null };
  if (typeof v !== "string") return fail("sku must be a string");
  const trimmed = v.trim();
  if (trimmed.length === 0) return { ok: true, data: null };
  if (trimmed.length > 64) return fail("sku exceeds 64 characters");
  if (!/^[A-Za-z0-9._-]+$/.test(trimmed)) {
    return fail("sku may contain only letters, numbers, dot, hyphen and underscore");
  }
  return { ok: true, data: trimmed };
}

function asImageList(v: unknown): Validated<string[]> {
  if (v === undefined) return { ok: true, data: [] };
  if (!Array.isArray(v)) return fail("images must be an array");
  if (v.length > 20) return fail("images: max 20 allowed");
  for (const item of v) {
    if (typeof item !== "string" || item.length > 500) {
      return fail("images must be strings up to 500 characters");
    }
  }
  return { ok: true, data: v as string[] };
}

export interface ProductData {
  readonly name: string;
  readonly nameFa: string | null;
  readonly description: string | null;
  readonly descriptionFa: string | null;
  readonly price: number;
  readonly costPrice: number | null;
  readonly currency: string;
  readonly images: string[];
  readonly categoryId: number;
  readonly sku: string | null;
  readonly quantity: number;
  readonly lowStockThreshold: number;
  readonly inStock: boolean;
  readonly featured: boolean;
}

function asOptionalString(v: unknown, field: string, max: number): Validated<string | null> {
  if (v === undefined || v === null) return { ok: true, data: null };
  if (typeof v !== "string") return fail(`${field} must be a string`);
  const trimmed = v.trim();
  if (trimmed.length === 0) return { ok: true, data: null };
  if (trimmed.length > max) return fail(`${field} exceeds ${max} characters`);
  return { ok: true, data: trimmed };
}

export function validateProductCreate(body: unknown): Validated<ProductData> {
  if (typeof body !== "object" || body === null) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const name = asString(b.name, "name", 200);
  if (!name.ok) return name;

  const nameFa = asOptionalString(b.nameFa, "nameFa", 200);
  if (!nameFa.ok) return nameFa;

  const price = asPositiveNumber(b.price, "price");
  if (!price.ok) return price;

  const categoryId = asPositiveInt(b.categoryId, "categoryId");
  if (!categoryId.ok) return categoryId;

  const images = asImageList(b.images);
  if (!images.ok) return images;

  const costPrice = asOptionalMoney(b.costPrice, "costPrice");
  if (!costPrice.ok) return costPrice;

  const sku = asOptionalSku(b.sku);
  if (!sku.ok) return sku;

  const quantity =
    b.quantity === undefined
      ? ({ ok: true, data: 0 } as const)
      : asNonNegativeInt(b.quantity, "quantity");
  if (!quantity.ok) return quantity;

  const lowStockThreshold =
    b.lowStockThreshold === undefined
      ? ({ ok: true, data: 5 } as const)
      : asNonNegativeInt(b.lowStockThreshold, "lowStockThreshold");
  if (!lowStockThreshold.ok) return lowStockThreshold;

  if (b.description !== undefined && b.description !== null) {
    if (typeof b.description !== "string" || b.description.length > 5000) {
      return fail("description must be a string up to 5000 characters");
    }
  }
  const descriptionFa = asOptionalString(b.descriptionFa, "descriptionFa", 5000);
  if (!descriptionFa.ok) return descriptionFa;

  if (b.currency !== undefined && typeof b.currency !== "string") {
    return fail("currency must be a string");
  }

  // When the caller does not set inStock explicitly, derive it from quantity
  // if a quantity was provided; otherwise default to true.
  const inStock =
    b.inStock !== undefined
      ? b.inStock !== false
      : b.quantity !== undefined
        ? quantity.data > 0
        : true;

  return {
    ok: true,
    data: {
      name: name.data,
      nameFa: nameFa.data,
      description: typeof b.description === "string" ? b.description : null,
      descriptionFa: descriptionFa.data,
      price: price.data,
      costPrice: costPrice.data,
      currency: typeof b.currency === "string" ? b.currency.slice(0, 8) : "USD",
      images: images.data,
      categoryId: categoryId.data,
      sku: sku.data,
      quantity: quantity.data,
      lowStockThreshold: lowStockThreshold.data,
      inStock,
      featured: b.featured === true,
    },
  };
}

export function validateProductUpdate(
  body: unknown
): Validated<Partial<ProductData>> {
  if (typeof body !== "object" || body === null) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;
  const out: { -readonly [K in keyof ProductData]?: ProductData[K] } = {};

  if (b.name !== undefined) {
    const name = asString(b.name, "name", 200);
    if (!name.ok) return name;
    out.name = name.data;
  }
  if (b.nameFa !== undefined) {
    const nameFa = asOptionalString(b.nameFa, "nameFa", 200);
    if (!nameFa.ok) return nameFa;
    out.nameFa = nameFa.data;
  }
  if (b.price !== undefined) {
    const price = asPositiveNumber(b.price, "price");
    if (!price.ok) return price;
    out.price = price.data;
  }
  if (b.categoryId !== undefined) {
    const categoryId = asPositiveInt(b.categoryId, "categoryId");
    if (!categoryId.ok) return categoryId;
    out.categoryId = categoryId.data;
  }
  if (b.images !== undefined) {
    const images = asImageList(b.images);
    if (!images.ok) return images;
    out.images = images.data;
  }
  if (b.costPrice !== undefined) {
    const costPrice = asOptionalMoney(b.costPrice, "costPrice");
    if (!costPrice.ok) return costPrice;
    out.costPrice = costPrice.data;
  }
  if (b.sku !== undefined) {
    const sku = asOptionalSku(b.sku);
    if (!sku.ok) return sku;
    out.sku = sku.data;
  }
  if (b.quantity !== undefined) {
    const quantity = asNonNegativeInt(b.quantity, "quantity");
    if (!quantity.ok) return quantity;
    out.quantity = quantity.data;
  }
  if (b.lowStockThreshold !== undefined) {
    const lowStockThreshold = asNonNegativeInt(b.lowStockThreshold, "lowStockThreshold");
    if (!lowStockThreshold.ok) return lowStockThreshold;
    out.lowStockThreshold = lowStockThreshold.data;
  }
  if (b.description !== undefined) {
    if (
      b.description !== null &&
      (typeof b.description !== "string" || b.description.length > 5000)
    ) {
      return fail("description must be a string up to 5000 characters");
    }
    out.description = (b.description as string | null) ?? null;
  }
  if (b.descriptionFa !== undefined) {
    const descriptionFa = asOptionalString(b.descriptionFa, "descriptionFa", 5000);
    if (!descriptionFa.ok) return descriptionFa;
    out.descriptionFa = descriptionFa.data;
  }
  if (b.currency !== undefined) {
    if (typeof b.currency !== "string") return fail("currency must be a string");
    out.currency = b.currency.slice(0, 8);
  }
  if (b.inStock !== undefined) {
    if (typeof b.inStock !== "boolean") return fail("inStock must be a boolean");
    out.inStock = b.inStock;
  }
  if (b.featured !== undefined) {
    if (typeof b.featured !== "boolean") return fail("featured must be a boolean");
    out.featured = b.featured;
  }

  return { ok: true, data: out };
}

// A stock adjustment from the inventory page.
//  - mode "delta": add (+) or remove (-) `value` units from the current quantity.
//  - mode "set":   set the absolute on-hand quantity to `value` (a stock count).
export interface StockAdjustData {
  readonly mode: "delta" | "set";
  readonly value: number;
  readonly type: MovementType;
  readonly note: string | null;
}

const MOVEMENT_TYPE_VALUES: readonly MovementType[] = [
  "restock",
  "sale",
  "adjustment",
  "count",
  "return",
  "damage",
];

export function validateStockAdjust(body: unknown): Validated<StockAdjustData> {
  if (typeof body !== "object" || body === null) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const mode = b.mode;
  if (mode !== "delta" && mode !== "set") {
    return fail('mode must be "delta" or "set"');
  }

  const value = asInteger(b.value, "value");
  if (!value.ok) return value;
  if (mode === "set" && value.data < 0) {
    return fail("value must be zero or positive when setting an absolute count");
  }
  if (mode === "delta" && value.data === 0) {
    return fail("value must not be zero for a delta adjustment");
  }

  const type = b.type;
  if (!MOVEMENT_TYPE_VALUES.includes(type as MovementType)) {
    return fail(`type must be one of: ${MOVEMENT_TYPE_VALUES.join(", ")}`);
  }

  const note = asOptionalString(b.note, "note", 500);
  if (!note.ok) return note;

  return {
    ok: true,
    data: {
      mode,
      value: value.data,
      type: type as MovementType,
      note: note.data,
    },
  };
}

export interface CategoryData {
  readonly name: string;
  readonly nameFa: string | null;
  readonly slug: string;
  readonly image: string | null;
}

export function validateCategoryCreate(body: unknown): Validated<CategoryData> {
  if (typeof body !== "object" || body === null) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const name = asString(b.name, "name", 100);
  if (!name.ok) return name;

  const nameFa = asOptionalString(b.nameFa, "nameFa", 100);
  if (!nameFa.ok) return nameFa;

  const slug = asString(b.slug, "slug", 100);
  if (!slug.ok) return slug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.data)) {
    return fail("slug must be lowercase letters, numbers and hyphens");
  }

  if (b.image !== undefined && b.image !== null && typeof b.image !== "string") {
    return fail("image must be a string");
  }

  return {
    ok: true,
    data: {
      name: name.data,
      nameFa: nameFa.data,
      slug: slug.data,
      image: typeof b.image === "string" ? b.image : null,
    },
  };
}

// Validates a reorder request: a list of unique positive category ids
// in the desired display order.
export function validateCategoryReorder(body: unknown): Validated<number[]> {
  if (typeof body !== "object" || body === null) {
    return fail("Request body must be a JSON object");
  }
  const order = (body as Record<string, unknown>).order;
  if (!Array.isArray(order)) return fail("order must be an array of ids");
  if (order.length === 0) return fail("order must not be empty");
  if (order.length > 500) return fail("order: max 500 ids allowed");

  const ids: number[] = [];
  const seen = new Set<number>();
  for (const item of order) {
    const n = Number(item);
    if (!Number.isInteger(n) || n <= 0) {
      return fail("order must contain positive integer ids");
    }
    if (seen.has(n)) return fail("order must not contain duplicate ids");
    seen.add(n);
    ids.push(n);
  }
  return { ok: true, data: ids };
}

export function validateCategoryUpdate(
  body: unknown
): Validated<Partial<CategoryData>> {
  if (typeof body !== "object" || body === null) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;
  const out: { -readonly [K in keyof CategoryData]?: CategoryData[K] } = {};

  if (b.name !== undefined) {
    const name = asString(b.name, "name", 100);
    if (!name.ok) return name;
    out.name = name.data;
  }
  if (b.nameFa !== undefined) {
    const nameFa = asOptionalString(b.nameFa, "nameFa", 100);
    if (!nameFa.ok) return nameFa;
    out.nameFa = nameFa.data;
  }
  if (b.slug !== undefined) {
    const slug = asString(b.slug, "slug", 100);
    if (!slug.ok) return slug;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.data)) {
      return fail("slug must be lowercase letters, numbers and hyphens");
    }
    out.slug = slug.data;
  }
  if (b.image !== undefined) {
    if (b.image !== null && typeof b.image !== "string") {
      return fail("image must be a string");
    }
    out.image = (b.image as string | null) ?? null;
  }

  return { ok: true, data: out };
}
