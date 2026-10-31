"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Product } from "../lib/products";
import { useEffect, useRef, useState } from "react";
import { categories, products } from "../lib/products";
import { productDetails } from "../lib/product-details";

type StoredValues = Record<string, number>;
type ProductStyle = CSSProperties & { "--product-tint": string };

function read(key: string): StoredValues {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).flatMap(([id, stored]) => {
        if (typeof stored !== "number" && typeof stored !== "string") return [];
        const number = Number(stored);
        return Number.isSafeInteger(number) && number > 0 ? [[id, number]] : [];
      }),
    );
  } catch {
    return {};
  }
}

function save(key: string, value: StoredValues) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
// Add to Cart 
// function add(product: Product) {
//   const cart = useRef<Record<string, number>>({});
//   const [status, setStatus] = useState("");
//   const count = Number(cart.current[product.id]);

//   cart.current[product.id] =
//     (Number.isSafeInteger(count) && count > 0 ? count : 0) + 1;

//   const persisted = save("kbloom-cart", cart.current);

//   const total = Object.values(cart.current).reduce(
//     (sum, quantity) => sum + quantity,
//     0,
//   );

//   window.dispatchEvent(
//     new CustomEvent<number>("cart-updated", { detail: total }),
//   );

//   setStatus(
//     `${product.name} added to cart (${cart.current[product.id]}). ${
//       persisted ? "Saved on this device." : "Saved for this visit only."
//     }`,
//   );
// }

export default function ProductCollection({
  catalog = false,
}: {
  catalog?: boolean;
}) {
  const [selected, setSelected] = useState(
    catalog ? "All Perfumes" : "Popular Products",
  );
  const [ratings, setRatings] = useState<StoredValues>({});
  const cart = useRef<StoredValues>({});
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ratingProduct, setRatingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewDialog = useRef<HTMLDialogElement>(null);
  const previewTrigger = useRef<HTMLButtonElement>(null);
  const previewImages = previewProduct
    ? productDetails[previewProduct.id] ?? [previewProduct.image]
    : [];
  const [arrows, setArrows] = useState({ previous: false, next: false });
  const list = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const ratingTrigger = useRef<HTMLButtonElement>(null);
  const visible = products.filter(
    (product) =>
      selected === "All Perfumes" ||
      (selected === "Popular Products"
        ? product.popular
        : product.family === selected),
  );

  useEffect(() => {
    setRatings(read("kbloom-ratings"));
    cart.current = read("kbloom-cart");
    return () => {
      if (toastTimer.current !== null) clearTimeout(toastTimer.current);
    };
  }, []);

  function dismissToast() {
    if (toastTimer.current !== null) clearTimeout(toastTimer.current);
    toastTimer.current = null;
    setToast("");
  }

  useEffect(() => {
    const element = list.current;
    if (!element) return;
    const update = () => {
      setArrows({
        previous: element.scrollLeft > 1,
        next:
          element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
      });
    };
    element.scrollLeft = 0;
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [selected]);

  useEffect(() => {
    if (ratingProduct) dialog.current?.showModal();
  }, [ratingProduct]);

  useEffect(() => {
    if (!previewProduct) return;
    previewDialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [previewProduct]);

  function add(product: Product) {
   const count = Number(cart.current[product.id]);

  cart.current[product.id] =
    (Number.isSafeInteger(count) && count > 0 ? count : 0) + 1;

  const persisted = save("kbloom-cart", cart.current);

  const total = Object.values(cart.current).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );

  window.dispatchEvent(
    new CustomEvent<number>("cart-updated", { detail: total }),
  );

  const message = `${product.name.trim()} added to cart (${cart.current[product.id]}). ${
      persisted ? "Saved on this device." : "Saved for this visit only."
    }`;
  if (catalog) {
    if (toastTimer.current !== null) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => {
      setToast("");
      toastTimer.current = null;
    }, 5000);
  } else {
    setStatus(message);
  }
  }

  function rate(value: number) {
    if (!ratingProduct) return;
    const updated = { ...ratings, [ratingProduct.id]: value };
    setRatings(updated);
    const persisted = save("kbloom-ratings", updated);
    setStatus(
      `Thank you! You rated ${ratingProduct.name} ${value}/5. ${persisted ? "Saved on this device." : "Saved for this visit only."}`,
    );
    dialog.current?.close();
  }

  function scroll(direction: -1 | 1) {
    const element = list.current;
    if (!element) return;
    const width = element.firstElementChild?.getBoundingClientRect().width ?? 0;
    element.scrollBy({
      left: direction * (width + 20),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <>
      {catalog && (
        <div className={`cart-toast${toast ? " is-visible" : ""}`}>
          <span className="cart-toast-check" aria-hidden="true">✓</span>
          <p role="status" aria-live="polite" aria-atomic="true">{toast}</p>
          {toast && (
            <button type="button" onClick={dismissToast} aria-label="Dismiss notification">×</button>
          )}
        </div>
      )}
      <section
        id="product"
        className="products-section"
        aria-labelledby="products-title"
      >
        <div className="products-shell">
          <div className="products-heading">
            <div>
              <p className="products-eyebrow">THE K-BLOOM COLLECTION</p>
              <h2 id="products-title">
                {catalog ? "All fragrances." : "Find your signature scent."}
              </h2>
              <p className="products-intro">
                A little floral, a little fresh. Entirely you.
              </p>
            </div>
            <Link
              className="products-all"
              href={catalog ? "/#product" : "/products"}
            >
              {catalog ? "Back to collection" : "View All Products"}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="product-categories" aria-label="Perfume categories">
            {[...categories, ...(catalog ? ["All Perfumes"] : [])].map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected === category}
                  onClick={() => setSelected(category)}
                >
                  {category}
                </button>
              ),
            )}
          </div>
          <div className="products-toolbar">
            <p className="products-count" aria-live="polite">
              {selected} / {visible.length} fragrances
            </p>
            <div className="products-arrows">
              <button
                type="button"
                className="products-arrow-left"
                aria-label="Previous products"
                disabled={!arrows.previous}
                onClick={() => scroll(-1)}
              >
                ←
              </button>
              <button
                type="button"
                className="products-arrow-right"
                aria-label="Next products"
                disabled={!arrows.next}
                onClick={() => scroll(1)}
              >
                →
              </button>
            </div>
          </div>
          <div
            ref={list}
            className="product-list"
            tabIndex={0}
            role="region"
            aria-label={
              catalog ? "All perfumes" : "Perfumes, scroll horizontally"
            }
          >
            {visible.map((product) => {
              const rating = Number(ratings[product.id]);
              const valid =
                Number.isInteger(rating) && rating >= 1 && rating <= 5;
              const productStyle: ProductStyle = {
                "--product-tint": product.tint,
              };
              return (
                <article key={product.id} className="product-card">
                  <button
                    type="button"
                    className="product-image product-image-trigger"
                    style={productStyle}
                    aria-label={`View ${product.name.trim()} details`}
                    aria-haspopup="dialog"
                    onClick={(event) => {
                      previewTrigger.current = event.currentTarget;
                      setPreviewIndex(0);
                      setPreviewProduct(product);
                    }}
                  >
                    <span className="product-badge">
                      {product.popular ? "POPULAR" : "THE FLORAL EDIT"}
                    </span>
                    <img
                      src={product.image}
                      alt={`${product.name} perfume bottle`}
                      width="480"
                      height="480"
                      loading="lazy"
                    />
                    <span className="product-image-hint">View details ↗</span>
                  </button>
                  <div className="product-info">
                    <p className="product-family">
                      {product.family} / Eau de parfum
                    </p>
                    <h3>{product.name}</h3>
                    <p className="product-notes">{product.notes}</p>
                    <div className="product-rating">
                      <span className="product-stars" aria-hidden="true">
                        {valid
                          ? "★".repeat(rating) + "☆".repeat(5 - rating)
                          : "☆☆☆☆☆"}
                      </span>
                      <span>
                        {valid ? `Your rating: ${rating}/5` : "Not rated yet"}
                      </span>
                      <button
                        type="button"
                        className="product-rate"
                        aria-label={`Rate ${product.name}`}
                        onClick={(event) => {
                          ratingTrigger.current = event.currentTarget;
                          setRatingProduct(product);
                        }}
                      >
                        Rate
                      </button>
                    </div>
                    <p className="product-price">
                      {product.price.toLocaleString("en-US")}{" "}
                      <small>MMK / {product.priceLabel ?? "Full size"}</small>
                    </p>
                    <button
                      type="button"
                      className="product-add"
                      aria-label={`Add ${product.name} to cart`}
                      onClick={() => add(product)}
                    >
                      <span aria-hidden="true">＋</span> Add to Cart
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="products-note">
            Discover your next favourite · Scroll to explore{" "}
            <span aria-hidden="true">→</span>
          </p>
          <p className="products-status" role="status">
            {status}
          </p>
        </div>
      </section>
      <dialog
        ref={previewDialog}
        className="product-preview"
        aria-labelledby="product-preview-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right ||
                event.clientY < bounds.top || event.clientY > bounds.bottom) {
              event.currentTarget.close();
            }
          }
        }}
        onClose={() => {
          setPreviewProduct(null);
          previewTrigger.current?.focus({ preventScroll: true });
        }}
      >
        <div className="product-preview-header">
          <h2 id="product-preview-title">{previewProduct?.name.trim()}</h2>
          <button type="button" className="product-preview-close"
            aria-label="Close product details" autoFocus
            onClick={() => previewDialog.current?.close()}>×</button>
        </div>
        {previewProduct && (
          <img className="product-preview-image" src={previewImages[previewIndex]}
            alt={`${previewProduct.name.trim()} — product and price details, image ${previewIndex + 1}`}
          />
        )}
        {previewImages.length > 1 && (
          <div className="product-preview-options" aria-label="Product images">
            {previewImages.map((src, index) => (
              <button key={src} type="button" aria-pressed={previewIndex === index}
                onClick={() => setPreviewIndex(index)}>Image {index + 1}</button>
            ))}
          </div>
        )}
      </dialog>
      <dialog
        ref={dialog}
        className="rating-dialog"
        aria-labelledby="rating-title"
        onClose={() => {
          setRatingProduct(null);
          ratingTrigger.current?.focus({ preventScroll: true });
        }}
      >
        <form method="dialog">
          <button className="rating-close" aria-label="Close rating">
            ×
          </button>
        </form>
        <p className="products-eyebrow">YOUR OPINION MATTERS</p>
        <h2 id="rating-title">Rate this fragrance</h2>
        <p className="rating-product">{ratingProduct?.name}</p>
        <div className="rating-options" aria-label="Choose your rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
              onClick={() => rate(value)}
            >
              ☆
            </button>
          ))}
        </div>
        <p className="rating-help">
          Choose a star to save your rating on this device.
        </p>
      </dialog>
    </>
  );
}
