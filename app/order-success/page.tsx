import type { Metadata } from "next";
import Link from "next/link";
import OrderSuccess from "../../components/OrderSuccess";
import "./success.css";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

export default function OrderSuccessPage() {
  return (
    <main className="bag-page order-success-page">
      <nav className="bag-nav" aria-label="Order confirmation navigation">
        <Link href="/" className="bag-brand">K-Bloom<span>THE FRAGRANCE EDIT</span></Link>
        <Link href="/products">The collection <span aria-hidden="true">↗</span></Link>
      </nav>
      <OrderSuccess />
      <p className="success-signoff">A little luxury. A little you. <span>K-Bloom.</span></p>
    </main>
  );
}
