import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCollection from '../../components/ProductCollection';
import Footer from '../../components/Footer';

export const metadata: Metadata = { title: 'All Perfumes' };

export default function ProductsPage() {
  return (
    <main className="catalog-page">
      <nav className="catalog-nav" aria-label="Catalog navigation">
        <Link href="/">← K-Bloom Home</Link>
        <span>THE FRAGRANCE EDIT</span>
      </nav>
      <ProductCollection catalog />
      <Footer />
    </main>
   
  );
}
