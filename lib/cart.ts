import type { Product } from "./products";
import { isProductSize, sizePrice, normalSizePrice, type ProductSize } from "./product-sizes";

export type Cart = Record<string, number>;
export const CART_KEY = "kbloom-cart";

export function cartKey(productId: string, size: ProductSize): string {
  return `${productId}:${size}`;
}

export function cartItems(cart: Cart, products: Product[]) {
  return Object.entries(cart).flatMap(([key, quantity]) => {
    const [id, size = "full"] = key.split(":");
    const product = products.find((entry) => entry.id === id);
    if (!product || !isProductSize(size) || !Number.isSafeInteger(quantity) || quantity <= 0) return [];
    return [{ key, product, size, quantity, price: sizePrice(product, size), normalPrice: normalSizePrice(product, size) }];
  });
}

export function changeCartSize(cart: Cart, key: string, size: ProductSize, products: Product[]): Cart {
  const item = cartItems(cart, products).find((entry) => entry.key === key);
  if (!item) return cart;
  const nextKey = cartKey(item.product.id, size);
  if (nextKey === key) return cart;
  const next = { ...cart };
  delete next[key];
  next[nextKey] = (next[nextKey] || 0) + item.quantity;
  return next;
}

export function readCart(): Cart {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const normalized: Cart = {};
    for (const [key, stored] of Object.entries(value)) {
      if (typeof stored !== "number" && typeof stored !== "string") continue;
      const [id, size = "full", extra] = key.split(":");
      const quantity = Number(stored);
      if (extra !== undefined || !/^[a-zA-Z0-9_-]+$/.test(id) || !isProductSize(size) || !Number.isSafeInteger(quantity) || quantity <= 0) continue;
      const nextKey = cartKey(id, size);
      normalized[nextKey] = (normalized[nextKey] || 0) + quantity;
    }
    return normalized;
  } catch {
    return {};
  }
}

export function writeCart(cart: Cart): boolean {
  let saved = true;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    saved = false;
  }
  window.dispatchEvent(
    new CustomEvent<number>("cart-updated", {
      detail: Object.values(cart).reduce((sum, quantity) => sum + quantity, 0),
    }),
  );
  return saved;
}
