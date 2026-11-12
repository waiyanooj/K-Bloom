export type OrderReceipt = { orderId: string; itemCount: number; subtotal: number };
const key = "kbloom-order-receipt";
let current: OrderReceipt | null = null;

export function saveOrderReceipt(receipt: OrderReceipt) {
  current = receipt;
  try { sessionStorage.setItem(key, JSON.stringify(receipt)); } catch { /* Keep this visit's receipt in memory. */ }
}

export function readOrderReceipt(): OrderReceipt | null {
  if (current) return current;
  try {
    const receipt = JSON.parse(sessionStorage.getItem(key) || "null");
    if (receipt && /^KB-[0-9a-f-]{36}$/i.test(receipt.orderId) &&
      Number.isSafeInteger(receipt.itemCount) && receipt.itemCount > 0 &&
      Number.isSafeInteger(receipt.subtotal) && receipt.subtotal > 0) return receipt;
  } catch { /* A direct visit can have no saved receipt. */ }
  return null;
}
