"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "../lib/products";

const ProductContext = createContext<{ products: Product[]; available: boolean; loaded: boolean }>({ products: [], available: false, loaded: false });
export const useProducts = () => useContext(ProductContext);

export default function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [available, setAvailable] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let disposed = false;
    let running = false;
    const controller = new AbortController();
    async function refresh() {
      if (running || document.visibilityState === "hidden") return;
      running = true;
      try {
        const response = await fetch("/api/products", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Products unavailable");
        const result = await response.json();
        if (!Array.isArray(result.products)) throw new Error("Invalid products");
        if (!disposed) { setProducts(result.products); setAvailable(true); setFailed(false); setLoaded(true); }
      } catch {
        if (!disposed) { setAvailable(false); setFailed(true); }
      } finally { running = false; }
    }
    void refresh();
    const timer = setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { disposed = true; controller.abort(); clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  return <ProductContext.Provider value={{ products, available, loaded }}>
    {failed && <p role="status" style={{ padding: "12px 24px", background: "#fff4df", color: "#563b12", margin: 0 }}>{loaded ? "Product updates are unavailable. Showing the last loaded prices. Please wait before ordering." : "Products could not be loaded. We will retry automatically."}</p>}
    {!loaded && !failed && <p role="status" style={{ padding: "12px 24px", margin: 0 }}>Loading fragrances…</p>}
    {children}
  </ProductContext.Provider>;
}
