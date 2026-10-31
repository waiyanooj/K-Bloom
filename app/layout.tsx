import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import Footer from '../components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'K-Bloom | Perfume Store', template: '%s | K-Bloom' },
  description: 'Discover your signature scent with the K-Bloom fragrance collection.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        
        <Script src="https://code.iconify.design/iconify-icon/3.0.3/iconify-icon.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
