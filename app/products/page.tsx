import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCollection from '../../components/ProductCollection';
import Footer from '../../components/Footer';
import CartCount from '../../components/CartCount';

export const metadata: Metadata = { title: 'All Perfumes' };

export default function ProductsPage() {
  return (
    <main className="catalog-page">
      <nav className="catalog-nav" aria-label="Catalog navigation">
        <Link href="/">← K-Bloom Home</Link>
        <span>THE FRAGRANCE EDIT</span>
        <div className="cart-link catalog-cart" title="Shopping cart">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3h2l2.4 12h11.2l2-8H6" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <CartCount />
        </div>
      </nav>
      <ProductCollection catalog />
      <Footer />
    </main>
   
  );
}
