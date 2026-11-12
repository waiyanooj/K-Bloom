import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../../components/Footer";
import Payment from "../../components/Payment";

export const metadata: Metadata = { title: "Payment" };

export default function PaymentPage() {
  return (
    <main className="bag-page">
      <nav className="bag-nav" aria-label="Payment navigation">
        <Link href="/" className="bag-brand">K-Bloom<span>THE FRAGRANCE EDIT</span></Link>
        <Link href="/cart">Back to bag <span aria-hidden="true">↗</span></Link>
      </nav>
      <Payment />
      <Footer />
    </main>
  );
}
