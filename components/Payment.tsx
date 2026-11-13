"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveOrderReceipt } from "../lib/order-receipt";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CART_KEY, readCart, writeCart, type Cart } from "../lib/cart";
import { cartItems } from "../lib/cart";
import { sizeLabel } from "../lib/product-sizes";
import { useProducts } from "./ProductProvider";
import PromotionPrice, { PromotionBadge } from "./PromotionPrice";

const money = (value: number) => `${value.toLocaleString("en-US")} MMK`;

export default function Payment() {
  const { products, available, loaded } = useProducts();
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({});
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const busy = useRef(false);
  const completed = useRef(false);
  const attempt = useRef<{ payload: string; requestId: string } | null>(null);

  useEffect(() => {
    const sync = () => {
      if (busy.current || completed.current) return;
      setCart(readCart());
      setReady(true);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_KEY || event.key === null) sync();
    };
    sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart-updated", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart-updated", sync);
    };
  }, []);

  const items = cartItems(cart, products);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || busy.current || completed.current) return;
    if (!available) { setError("Please wait for current product prices before ordering."); return; }
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name")).trim(),
      phone1: String(data.get("phone1")).trim(),
      phone2: String(data.get("phone2")).trim(),
      address: String(data.get("address")).trim(),
      items: items.map(({ product, size, quantity, price }) => ({ productId: product.id, size, quantity, unitPrice: price })),
    };
    const signature = JSON.stringify(payload);
    if (attempt.current?.payload !== signature)
      attempt.current = { payload: signature, requestId: crypto.randomUUID() };
    busy.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, requestId: attempt.current.requestId }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.orderId !== "string")
        throw new Error(result.error || "We could not confirm your order. Please try again.");
      completed.current = true;
      setOrderId(result.orderId);
      const remaining = readCart();
      for (const item of items) {
        const quantity = (remaining[item.key] || 0) - item.quantity;
        if (quantity > 0) remaining[item.key] = quantity;
        else delete remaining[item.key];
      }
      writeCart(remaining);
      saveOrderReceipt({ orderId: result.orderId, itemCount: count, subtotal });
      router.replace("/order-success");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Connection failed. Please try again.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section
      className="bag-shell payment-shell"
      aria-labelledby="payment-title"
    >
      {/* <header className="payment-heading">
        <p className="bag-eyebrow">THE FINAL DETAILS</p>
        <h1 id="payment-title">Payment<span>.</span></h1>
        <p>A few details to bring your favourites home.</p>
      </header> */}
      <div className="payment-layout">
        <form
          className="payment-form"
          onSubmit={submitOrder}
          aria-busy={submitting}
        >
          <fieldset className="payment-fields" disabled={submitting || !!orderId}>
          <div className="payment-card-heading">
            <span aria-hidden="true">01</span>
            <div>
              <h2>Delivery information</h2>
              <p>Enter your name and delivery address.</p>
            </div>
          </div>
          <label htmlFor="payment-name">
            Name <span>*</span>
          </label>
          <input
            id="payment-name"
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            required
            pattern=".*\S.*"
            maxLength={100}
          />
          <div className="payment-phone-row">
            <div>
              <label htmlFor="payment-phone1">
                Phone 1 <span>*</span>
              </label>
              <input
                id="payment-phone1"
                name="phone1"
                type="tel"
                autoComplete="tel"
                placeholder="09 xxx xxx xxx"
                required
                pattern="[+0-9() .\-]{7,20}"
                title="Enter a phone number using 7–20 digits, spaces, or phone punctuation."
                maxLength={20}
              />
            </div>
            <div>
              <label htmlFor="payment-phone2">
                Phone 2 <small>(optional)</small>
              </label>
              <input
                id="payment-phone2"
                name="phone2"
                type="tel"
                autoComplete="off"
                placeholder="Alternative phone number"
                pattern="[+0-9() .\-]{7,20}"
                title="Enter a phone number using 7–20 digits, spaces, or phone punctuation."
                maxLength={20}
              />
            </div>
          </div>
          <label htmlFor="payment-address">
            Address <span>*</span>
          </label>
          <textarea
            id="payment-address"
            name="address"
            autoComplete="street-address"
            placeholder="House / building, street, township and city"
            required
            minLength={5}
            maxLength={500}
            rows={4}
          />
          <p className="payment-help">
            * Required fields. Delivery charges will be confirmed with the
            store.
          </p>
          <button
            className="bag-primary"
            type="submit"
            disabled={!ready || !available || !items.length || submitting || !!orderId}
          >
            {submitting ? "Submitting order…" : orderId ? "Order submitted" : "Place order"} <span aria-hidden="true">→</span>
          </button>
          <p className="payment-help">
            We will contact you to confirm delivery and payment. No online payment is taken here.
          </p>
          </fieldset>
          {error && <p className="payment-submit-error" role="alert">{error}</p>}
          {orderId && (
            <div className="payment-review" role="status">
              <h3>Thank you! Your order has been received.</h3>
              <p>Order ID: {orderId}</p>
              <small>We will contact you to confirm your order.</small>
            </div>
          )}
        </form>
        <aside className="payment-summary" aria-labelledby="order-detail-title">
          <div className="payment-summary-heading">
            <h2 id="order-detail-title">Order detail</h2>
            <Link href="/cart">Edit bag</Link>
          </div>
          <p className="bag-eyebrow">YOUR FRAGRANCE SELECTION</p>
          {!ready || !loaded ? (
            <p role="status">Loading your order…</p>
          ) : !items.length ? (
            <p className="payment-empty">
              Your bag is empty.{" "}
              <Link href="/products">Explore fragrances →</Link>
            </p>
          ) : (
            <ul className="payment-order-items">
              {items.map(({ key, product, size, price, normalPrice, quantity }) => (
                <li key={key}>
                  <div>
                    <h3>{product.name.trim()} <PromotionBadge promotion={product.promotion} /></h3>
                    <p>
                      {sizeLabel(product, size)} · Qty{" "}
                      {cart[key]}
                    </p>
                  </div>
                  <PromotionPrice price={price * quantity} normalPrice={normalPrice * quantity} promotion={product.promotion} />
                </li>
              ))}
            </ul>
          )}
          <dl className="payment-totals">
            <div>
              <dt>Subtotal ({count} items)</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>To be confirmed</dd>
            </div>
            <div className="payment-total">
              <dt>Items total</dt>
              <dd>{money(subtotal)}</dd>
            </div>
          </dl>
          <p className="payment-help">
            Final total includes delivery and will be confirmed with the store.
          </p>
          <div className="payment-signoff">A little luxury, chosen by you.</div>
        </aside>
      </div>
    </section>
  );
}
