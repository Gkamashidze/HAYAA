const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "995000000000";
const MESSENGER = process.env.NEXT_PUBLIC_MESSENGER_PAGE ?? "hayaastore";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string;
}

function buildOrderText(items: CartItem[]): string {
  const lines = items.map(
    (i) => `• ${i.name} x${i.quantity} — ${(i.price * i.quantity).toFixed(2)} ${i.currency}`
  );
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const currency = items[0]?.currency ?? "USD";
  return [
    "Hello! I'd like to order from HAYAA 🛍️",
    "",
    ...lines,
    "",
    `Total: ${total.toFixed(2)} ${currency}`,
    "",
    "Please confirm my order. Thank you!",
  ].join("\n");
}

export function whatsappProductUrl(productName: string, price: number, currency: string): string {
  const text = `Hello! I'm interested in: ${productName} — ${price.toFixed(2)} ${currency}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export function whatsappCartUrl(items: CartItem[]): string {
  const text = buildOrderText(items);
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export function messengerProductUrl(productName: string): string {
  const ref = encodeURIComponent(`product:${productName}`);
  return `https://m.me/${MESSENGER}?ref=${ref}`;
}

export function messengerCartUrl(items: CartItem[]): string {
  const ref = encodeURIComponent(`order:${items.map((i) => i.name).join(",")}`);
  return `https://m.me/${MESSENGER}?ref=${ref}`;
}
