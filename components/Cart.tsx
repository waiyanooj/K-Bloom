"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "../lib/products";
import {
  CART_KEY,
  readCart,
  writeCart,
  type Cart as CartValues,
} from "../lib/cart";

const money = (value: number) => `${value.toLocaleString("en-US")} MMK`;

export default function Cart() {
  const [cart, setCart] = useState<CartValues>({});
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [removed, setRemoved] = useState<{
    id: string;
    quantity: number;
  } | null>(null);

  useEffect(() => {
    setCart(readCart());
    setReady(true);
    function sync(event: StorageEvent) {
      if (event.key === CART_KEY || event.key === null) {
        setCart(readCart());
        setRemoved(null);
        setStatus("Your bag was updated in another tab.");
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const items = products.filter((product) => cart[product.id] > 0);
  const count = items.reduce((sum, product) => sum + cart[product.id], 0);
  const subtotal = items.reduce(
    (sum, product) => sum + product.price * cart[product.id],
    0,
  );

  function update(next: CartValues, message: string) {
    setCart(next);
    const saved = writeCart(next);
    setStatus(
      `${message}${saved ? "" : " Changes could not be saved on this device."}`,
    );
  }

  function remove(id: string) {
    const next = { ...cart };
    setRemoved({ id, quantity: next[id] });
    delete next[id];
    update(next, "Fragrance removed from your bag.");
  }

  function downloadSummary() {
    const summary = [
      "K-Bloom — Your fragrance selection",
      "",
      ...items.map(
        (product) =>
          `${product.name.trim()} × ${cart[product.id]} — ${money(product.price * cart[product.id])}`,
      ),
      "",
      `Items subtotal: ${money(subtotal)}`,
      "Delivery and final total to be confirmed with the store.",
      "This is a saved selection, not a confirmed order.",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([summary], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "K-Bloom-selection.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Your selection summary has been downloaded.");
  }

  return (
    <section className="bag-shell" aria-labelledby="bag-title">
      <div className="bag-heading">
        <div>
          <p className="bag-eyebrow">YOUR PERSONAL EDIT</p>
          <h1 id="bag-title" style={{ fontSize: "45px" }}>
            Good scents. <em>Great choices.</em>
          </h1>
        </div>
        <p className="bag-count">
          Your bag <span>{ready ? String(count).padStart(2, "0") : "—"}</span>
        </p>
      </div>
      <div className="bag-feedback">
        <p role="status" aria-live="polite">
          {status}
        </p>
        {removed && (
          <button
            type="button"
            onClick={() => {
              update(
                {
                  ...cart,
                  [removed.id]: (cart[removed.id] || 0) + removed.quantity,
                },
                "Fragrance restored to your bag.",
              );
              setRemoved(null);
            }}
          >
            Undo removal
          </button>
        )}
      </div>
      {!ready ? (
        <p className="bag-empty" role="status">
          Loading your bag…
        </p>
      ) : items.length === 0 ? (
        <div className="bag-empty">
          <span className="bag-empty-icon" aria-hidden="true">
            ✧
          </span>
          <h2>A little room for something lovely.</h2>
          <p>Your bag is empty. Discover a fragrance that feels like you.</p>
          <Link className="bag-primary" href="/products">
            Explore fragrances <span aria-hidden="true">↗</span>
          </Link>
        </div>
      ) : (
        <div className="bag-layout">
          <div className="bag-items">
            <div className="bag-list-label">
              <span>FRAGRANCE / {items.length} selections</span>
              <span>YOUR EDIT</span>
            </div>
            {items.map((product) => (
              <article
                className="bag-item"
                key={product.id}
                aria-label={product.name.trim()}
              >
                <div
                  className="bag-image"
                  style={{
                    background: `radial-gradient(ellipse, ${product.tint}, transparent 72%)`,
                  }}
                >
                  <img
                    src={product.image}
                    alt={`${product.name.trim()} perfume`}
                    width="150"
                    height="170"
                  />
                </div>
                <div className="bag-item-info">
                  <p className="bag-eyebrow">
                    {product.family} / Eau de parfum
                  </p>
                  <h2>{product.name.trim()}</h2>
                  <p className="bag-unit-price">
                    {money(product.price)} / {product.priceLabel ?? "Full size"}
                  </p>
                  <div className="bag-item-actions">
                    <div
                      className="bag-quantity"
                      role="group"
                      aria-label={`Quantity for ${product.name.trim()}`}
                    >
                      <button
                        type="button"
                        disabled={cart[product.id] <= 1}
                        aria-label={`Decrease ${product.name.trim()} quantity`}
                        onClick={() =>
                          update(
                            { ...cart, [product.id]: cart[product.id] - 1 },
                            "Quantity updated.",
                          )
                        }
                      >
                        −
                      </button>
                      <span aria-label={`Quantity: ${cart[product.id]}`}>
                        {cart[product.id]}
                      </span>
                      <button
                        type="button"
                        disabled={cart[product.id] >= 99}
                        aria-label={`Increase ${product.name.trim()} quantity`}
                        onClick={() =>
                          update(
                            { ...cart, [product.id]: cart[product.id] + 1 },
                            "Quantity updated.",
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="bag-remove"
                      type="button"
                      aria-label={`Remove ${product.name.trim()}`}
                      onClick={() => remove(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="bag-line-total">
                  {money(product.price * cart[product.id])}
                </p>
              </article>
            ))}
            <Link className="bag-back" href="/products">
              ← Find another favourite
            </Link>
          </div>
          <aside className="bag-summary" aria-labelledby="bag-summary-title">
            <p className="bag-eyebrow">THE FINISHING TOUCH</p>
            <h2 id="bag-summary-title">Your selection.</h2>
            <dl>
              <div>
                <dt>Items ({count})</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>To be confirmed</dd>
              </div>
            </dl>
            <div className="bag-subtotal">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <p className="bag-summary-note">
              Delivery and final total are confirmed with the store. Online
              checkout is not available yet.
            </p>
            <button
              type="button"
              className="bag-primary"
              onClick={downloadSummary}
            >
              Save selection <span aria-hidden="true">↓</span>
            </button>
            <Link className="bag-visit" href="/#location">
              Visit our boutique ↗
            </Link>
            <p className="bag-summary-footnote">
              Your favourites, all in one place.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
