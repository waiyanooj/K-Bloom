import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/#home" className="footer-logo" aria-label="K-Bloom home">
              <img src="/K_Bloom Perfume Logo.png" alt="" width={64} height={64} />
              <span>K-Bloom</span>
            </Link>
            <p>A little floral, a little fresh. Entirely you.</p>
            <span className="footer-tagline">Find your signature scent.</span>
          </div>

          <div className="footer-links" role="navigation" aria-label="Footer navigation">
            <h2>Explore</h2>
            <Link href="/#home">Home</Link>
            <Link href="/products">All fragrances</Link>
            <Link href="/#about">Our story</Link>
            <Link href="/#location">Find us</Link>
          </div>

          <div className="footer-visit">
            <h2>Visit our boutique</h2>
            <p>K’Bloom Perfume Store</p>
            <p>Mon – Sun · 10:00 AM – 8:00 PM</p>
            <a href="https://maps.app.goo.gl/GtJ4YMjKrFDTGovk7" target="_blank" rel="noreferrer">
              Get directions <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <small>© {new Date().getFullYear()} K-Bloom. All rights reserved.</small>
          <Link href="/#home">Back to top <span aria-hidden="true">↑</span></Link>
        </div>
      </div>
    </footer>
  );
}
