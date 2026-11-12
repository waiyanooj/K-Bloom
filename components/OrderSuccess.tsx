"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { readOrderReceipt, type OrderReceipt } from "../lib/order-receipt";

export default function OrderSuccess() {
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
  const [ready, setReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { setReceipt(readOrderReceipt()); setReady(true); }, []);
  useEffect(() => { if (ready) title.current?.focus({ preventScroll: true }); }, [ready]);

  if (!ready) return <section className="success-shell"><p role="status">Loading your order receipt…</p></section>;
  if (!receipt) return (
    <section className="success-shell success-empty">
      <p className="success-eyebrow">K-BLOOM / YOUR ORDERS</p>
      <h1 ref={title} tabIndex={-1}>Your next favourite awaits.</h1>
      <p>No order receipt is available in this tab. Explore the collection or return to your bag.</p>
      <div className="success-actions"><Link className="success-primary" href="/products">Explore fragrances ↗</Link><Link href="/cart">View bag</Link></div>
    </section>
  );

  async function copyOrderId() {
    try { await navigator.clipboard.writeText(receipt!.orderId); setCopyStatus("Order ID copied."); }
    catch { setCopyStatus("Select the order ID below to copy it."); }
  }

  return (
    <section className="success-shell" aria-labelledby="success-title">
      <div className="success-intro">
        <div className="success-mark" aria-hidden="true">
          <div className="success-halo" />
          {Array.from({ length: 8 }, (_, index) => <i key={index} className="success-spark" style={{ "--angle": `${index * 45}deg`, "--delay": `${index * 45}ms` } as CSSProperties} />)}
          <svg viewBox="0 0 100 100" fill="none"><circle className="success-ring" cx="50" cy="50" r="44" /><path className="success-tick" d="m30 51 13 13 27-29" /></svg>
        </div>
        <p className="success-eyebrow">A LITTLE LUXURY, ON ITS NEXT CHAPTER</p>
        <h1 ref={title} tabIndex={-1} id="success-title">Good scents.<br /><em>Great choice.</em></h1>
        <p className="success-description">Your order has been received. Thank you for choosing K-Bloom — we’re excited to be part of your everyday.</p>
        <span className="success-status"><span />Order submitted</span>
      </div>

      <div className="success-receipt">
        <div className="success-receipt-heading"><span>YOUR ORDER RECEIPT</span><span aria-hidden="true">✧</span></div>
        <div className="success-reference"><div><span>Order ID</span><strong>{receipt.orderId}</strong></div><button type="button" onClick={copyOrderId} aria-label="Copy order ID"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="3" /><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" /></svg></button></div>
        <p className="success-copy-status" role="status">{copyStatus}</p>
        <dl className="success-totals"><div><dt>Items</dt><dd>{String(receipt.itemCount).padStart(2, "0")}</dd></div><div><dt>Items total</dt><dd>{receipt.subtotal.toLocaleString("en-US")} <small>MMK</small></dd></div></dl>
        <p className="success-delivery-note">Delivery charges will be confirmed separately.</p>
        <div className="success-next"><span className="success-next-icon" aria-hidden="true">↗</span><div><h2>What happens next?</h2><p>Our team will contact you using the phone number you provided to confirm your order, delivery and payment.</p></div></div>
        <p className="success-payment-note">Awaiting store confirmation · No payment taken online</p>
      </div>
      <div className="success-actions"><Link href="/products" className="success-primary">Discover more fragrances <span aria-hidden="true">↗</span></Link><Link href="/">Back to home <span aria-hidden="true">→</span></Link></div>
    </section>
  );
}
