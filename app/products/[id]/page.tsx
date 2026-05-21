import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { whatsappProductUrl, messengerProductUrl } from "@/lib/messaging";
import AddToCartButton from "@/components/products/AddToCartButton";

type Params = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const raw = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  });
  if (!raw) notFound();

  const product = { ...raw, images: JSON.parse(raw.images as string) as string[] };
  const waUrl = whatsappProductUrl(product.name, product.price, product.currency);
  const msUrl = messengerProductUrl(product.name);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}
        className="product-detail-grid">
        {/* Images */}
        <div>
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: "#f5f0eb", aspectRatio: "3/4", position: "relative" }}>
            {product.images[0] ? (
              <Image
                src={product.images[0]} alt={product.name}
                fill style={{ objectFit: "contain" }}
                priority sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {product.images.slice(1).map((img, i) => (
                <div key={i} style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)", background: "#f5f0eb", position: "relative" }}>
                  <Image src={img} alt={`${product.name} ${i + 2}`} fill style={{ objectFit: "contain" }} sizes="72px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            {product.category.name}
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, marginBottom: 16, lineHeight: 1.3 }}>
            {product.name}
          </h1>

          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>
            {product.price.toFixed(2)} {product.currency}
          </div>

          <div style={{ marginBottom: 20 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
              color: product.inStock ? "#2a7a2a" : "#cc4444",
              padding: "4px 10px", borderRadius: 6,
              background: product.inStock ? "rgba(42,122,42,0.08)" : "rgba(204,68,68,0.08)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: product.inStock ? "#2a7a2a" : "#cc4444", display: "inline-block" }} />
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {product.description && (
            <p style={{ color: "var(--muted)", lineHeight: 1.8, fontSize: 14, marginBottom: 24 }}>
              {product.description}
            </p>
          )}

          {/* Add to cart */}
          <AddToCartButton product={{
            id: product.id, name: product.name, price: product.price,
            currency: product.currency, image: product.images[0] ?? null,
            inStock: product.inStock,
          }} />

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border-color)", margin: "24px 0" }} />

          {/* Order directly */}
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, fontWeight: 500 }}>OR ORDER DIRECTLY</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#25D366", color: "white",
              padding: "0.75rem 1.25rem", borderRadius: 8, textDecoration: "none",
              fontWeight: 600, fontSize: 13,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.117 1.524 5.849L.057 23.5l5.802-1.52A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.96 0-3.788-.534-5.347-1.463l-.383-.228-3.441.902.918-3.352-.25-.397A9.794 9.794 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182c5.422 0 9.818 4.396 9.818 9.818 0 5.422-4.396 9.818-9.818 9.818z"/>
              </svg>
              Order via WhatsApp
            </a>
            <a href={msUrl} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#0084FF", color: "white",
              padding: "0.75rem 1.25rem", borderRadius: 8, textDecoration: "none",
              fontWeight: 600, fontSize: 13,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.63 0 12.595c0 3.874 1.908 7.32 4.883 9.57V24l4.458-2.45c1.19.33 2.45.507 3.759.507 6.627 0 12-5.373 12-12S18.627 0 12 0zm1.19 16.078l-3.054-3.254-5.955 3.254L10.8 9.4l3.13 3.254 5.88-3.254-6.62 6.678z"/>
              </svg>
              Order via Messenger
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
