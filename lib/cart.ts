import { products } from "./products";

export type Cart = Record<string, number>;
export const CART_KEY = "kbloom-cart";

export function readCart(): Cart {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).flatMap(([id, stored]) => {
        if (typeof stored !== "number" && typeof stored !== "string") return [];
        const quantity = Number(stored);
        return products.some((product) => product.id === id) &&
          Number.isSafeInteger(quantity) &&
          quantity > 0
          ? [[id, quantity]]
          : [];
      }),
    );
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
