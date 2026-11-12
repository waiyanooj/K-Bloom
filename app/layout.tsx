import type { Metadata } from "next";
import type { ReactNode } from "react";
import Footer from "../components/Footer";
import "./globals.css";
import "./responsive.css";
import ProductProvider from "../components/ProductProvider";

export const metadata: Metadata = {
  title: { default: "K-Bloom | Perfume Store", template: "%s | K-Bloom" },
  description:
    "Discover your signature scent with the K-Bloom fragrance collection.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><ProductProvider>{children}</ProductProvider></body>
    </html>
  );
}
