import type { Product } from "./products";
import { isProductSize, sizeLabel, sizePrice } from "./product-sizes";

export class InvalidOrder extends Error {}

export function parseOrder(value: unknown, products: Product[]) {
  if (!value || typeof value !== "object") throw new InvalidOrder("Invalid order.");
  const body = value as Record<string, unknown>;
  function field(name: string, min: number, max: number) {
    const value = body[name];
    if (typeof value !== "string" || value.trim().length < min || value.trim().length > max)
      throw new InvalidOrder(`Please check ${name}.`);
    return value.trim();
  }
  const requestId = field("requestId", 36, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))
    throw new InvalidOrder("Invalid order reference.");
  const name = field("name", 1, 100);
  const phone1 = field("phone1", 7, 20);
  const phone2 = field("phone2", 0, 20);
  const address = field("address", 5, 500);
  const phonePattern = /^[+0-9() .-]{7,20}$/;
  if (!phonePattern.test(phone1) || (phone2 && !phonePattern.test(phone2)))
    throw new InvalidOrder("Please check your phone numbers.");
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 160)
    throw new InvalidOrder("Please add fragrances to your bag.");
  const seen = new Set<string>();
  const items = body.items.map((entry: unknown) => {
    if (!entry || typeof entry !== "object") throw new InvalidOrder("Invalid fragrance.");
    const item = entry as Record<string, unknown>;
    const product = products.find((product) => product.id === item.productId);
    if (!product || typeof item.size !== "string" || !isProductSize(item.size))
      throw new InvalidOrder("Invalid fragrance or size.");
    if (typeof item.quantity !== "number" || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 999)
      throw new InvalidOrder("Quantity must be between 1 and 999.");
    const key = `${product.id}:${item.size}`;
    if (seen.has(key)) throw new InvalidOrder("Duplicate fragrance selection.");
    seen.add(key);
    const price = sizePrice(product, item.size);
    if (item.unitPrice !== price) throw new InvalidOrder("A product price has changed. Please wait for updated prices, then review and submit your order again.");
    return { product, size: item.size, quantity: item.quantity, price };
  });
  return { orderId: `KB-${requestId}`, name, phone1, phone2, address, items };
}

export function orderRows(order: ReturnType<typeof parseOrder>, date = new Date()) {
  const timestamp = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Yangon", dateStyle: "short", timeStyle: "medium", hour12: false,
  }).format(date);
  return order.items.map(({ product, size, price, quantity }) => [
    order.orderId, timestamp, order.name, order.phone1, order.phone2,
    order.address, product.name.trim(), sizeLabel(product, size), price, quantity, price * quantity, "Pending",
  ]);
}
