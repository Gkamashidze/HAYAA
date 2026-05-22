// Boundary input validation for the admin API routes.
// Dependency-free: small, explicit checks that fail fast with clear messages.

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
  readonly currency: string;
  readonly images: string[];
  readonly categoryId: number;
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

  return {
    ok: true,
    data: {
      name: name.data,
      nameFa: nameFa.data,
      description: typeof b.description === "string" ? b.description : null,
      descriptionFa: descriptionFa.data,
      price: price.data,
      currency: typeof b.currency === "string" ? b.currency.slice(0, 8) : "USD",
      images: images.data,
      categoryId: categoryId.data,
      inStock: b.inStock !== false,
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
