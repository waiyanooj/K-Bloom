"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import CartCount from "./CartCount";

export default function HomeHeader() {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const reset = () => setOpen(false);
    desktop.addEventListener("change", reset);
    return () => desktop.removeEventListener("change", reset);
  }, []);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <header className="home-header" ref={header} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <nav aria-label="Main navigation">
        <div className="logo">
          <div className="logoImg"><img src="/K_Bloom Perfume Logo.png" alt="K-Bloom Logo" /></div>
          <h4>K-Bloom</h4>
        </div>
        <div className="navbar">
          <button ref={toggle} type="button" className="nav-menu-toggle"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open} aria-controls="home-navigation-links"
            onClick={() => setOpen((current) => !current)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
          <div id="home-navigation-links" className={`navA${open ? " is-open" : ""}`}>
            {[ ["home", "Home"], ["product", "Product"], ["about", "About"], ["location", "Location"] ].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => {
                setOpen(false);
                if (open) toggle.current?.focus();
              }}>{label}</a>
            ))}
          </div>
          <div className="cardB">
            <a href="/cart" className="cart-link" aria-label="Cart"><Icon icon="akar-icons:cart" /><CartCount /></a>
            
          </div>
        </div>
      </nav>
    </header>
  );
}
