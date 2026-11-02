import type { Metadata } from "next";
import Link from "next/link";
import Cart from "../../components/Cart";
import Footer from "../../components/Footer";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return (
    <main className="bag-page">
      <nav className="bag-nav" aria-label="Cart navigation">
        <Link href="/" className="bag-brand">K-Bloom<span>THE FRAGRANCE EDIT</span></Link>
        <Link href="/products">Continue exploring <span aria-hidden="true">↗</span></Link>
      </nav>
      <Cart />
      <Footer />
    </main>
  );
}
