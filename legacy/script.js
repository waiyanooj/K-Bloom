const navLinks = [...document.querySelectorAll('.navA a[href^="#"]')];
const sections = navLinks
  .map((link) => document.getElementById(link.hash.slice(1)))
  .filter(Boolean);
const header = document.querySelector('header');

function updateActiveLink() {
  const activationLine = (header?.getBoundingClientRect().bottom ?? 0) + 1;
  let activeSection = sections.find((section) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= activationLine && bounds.bottom > activationLine;
  });

  // Keep the final section selectable even when it is shorter than the viewport.
  const atBottom = window.scrollY > 0 &&
    Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight;
  if (atBottom) {
    activeSection = [...sections].reverse().find((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top < window.innerHeight && bounds.bottom > 0;
    }) ?? activeSection;
  }

  navLinks.forEach((link) => {
    const active = link.hash === `#${activeSection?.id}`;
    link.classList.toggle('active', active);
    if (active) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
window.addEventListener('resize', updateActiveLink);
window.addEventListener('hashchange', updateActiveLink);
window.addEventListener('load', updateActiveLink);
updateActiveLink();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observeReveal(element, direction, delay = 0) {
    if (element.classList.contains('reveal-on-scroll')) return;
    element.classList.add('reveal-on-scroll', `reveal-from-${direction}`);
    if (delay) element.style.setProperty('--reveal-delay', `${delay}ms`);
    revealObserver.observe(element);
  }

  document.querySelectorAll('.textbox, .social-glass, .products-heading, .product-categories, .products-toolbar, .product-list, .about-copy, .about-media, .location-card').forEach((element) => {
    const fromRight = element.matches('.social-glass, .products-toolbar, .about-media, .location-card');
    observeReveal(element, fromRight ? 'right' : 'left');
  });

  const productList = document.querySelector('.product-list');
  if (productList) {
    const observeProductCards = () => {
      productList.querySelectorAll('.product-card').forEach((card, index) => {
        observeReveal(card, index % 2 === 0 ? 'left' : 'right', Math.min(index * 80, 320));
      });
    };
    new MutationObserver(observeProductCards).observe(productList, { childList: true });
    observeProductCards();
  }
}
