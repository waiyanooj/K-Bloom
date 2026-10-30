(() => {
  const products = [
    { id: 'rose', name: 'Rose Reverie', family: 'Floral', notes: 'Rose · Peony · Soft musk', price: 45000, tint: '#f5e3e7', popular: true },
    { id: 'citrus', name: 'Citrus Muse', family: 'Citrus', notes: 'Bergamot · Neroli · Lemon', price: 39000, tint: '#f7efd9', popular: true },
    { id: 'woody', name: 'Velvet Woods', family: 'Woody', notes: 'Sandalwood · Cedar · Vetiver', price: 58000, tint: '#eee5dc', popular: true },
    { id: 'fresh', name: 'Morning Dew', family: 'Fresh', notes: 'Green tea · Aqua · White musk', price: 42000, tint: '#e4efeb', popular: true },
    { id: 'amber', name: 'Amber Hours', family: 'Amber', notes: 'Amber · Vanilla · Warm spice', price: 52000, tint: '#f5e8d8', popular: true },
    { id: 'floral', name: 'Violet Bloom', family: 'Floral', notes: 'Violet · Iris · Jasmine', price: 48000, tint: '#eee5f1', popular: false },
  ];
  const categories = ['Popular Products', 'Floral', 'Citrus', 'Woody', 'Fresh', 'Amber'];
  const list = document.querySelector('.product-list');
  if (!list) return;
  const categoryList = document.querySelector('.product-categories');
  const status = document.querySelector('.products-status');
  const dialog = document.querySelector('.rating-dialog');
  const catalog = document.body.classList.contains('catalog-page');
  let selected = catalog ? 'All Perfumes' : 'Popular Products';
  let ratingProduct;
  const read = (key) => {
    try { const value = JSON.parse(localStorage.getItem(key) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
    catch { return {}; }
  };
  const ratings = read('kbloom-ratings');
  const cart = read('kbloom-cart');
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
  function updateArrows() {
    document.querySelector('[data-scroll="-1"]').disabled = list.scrollLeft <= 1;
    document.querySelector('[data-scroll="1"]').disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
  }
  function render() {
    const visible = products.filter(p => selected === 'All Perfumes' || (selected === 'Popular Products' ? p.popular : p.family === selected));
    categoryList.innerHTML = [...categories, ...(catalog ? ['All Perfumes'] : [])].map(category => `<button type="button" aria-pressed="${selected === category}">${category}</button>`).join('');
    document.querySelector('.products-count').textContent = `${selected} / ${visible.length} fragrances`;
    list.innerHTML = visible.map(p => {
      const rating = Number(ratings[p.id]);
      const validRating = Number.isInteger(rating) && rating >= 1 && rating <= 5;
      return `<article class="product-card"><div class="product-image" style="--product-tint:${p.tint}"><span class="product-badge">${p.popular ? 'POPULAR' : 'THE FLORAL EDIT'}</span><img src="./img/perfume-${p.id}.svg" alt="${p.name} perfume bottle illustration" width="480" height="480" loading="lazy"></div><div class="product-info"><p class="product-family">${p.family} / Eau de parfum</p><h3>${p.name}</h3><p class="product-notes">${p.notes}</p><div class="product-rating"><span class="product-stars" aria-hidden="true">${validRating ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : '☆☆☆☆☆'}</span><span>${validRating ? `Your rating: ${rating}/5` : 'Not rated yet'}</span><button type="button" class="product-rate" data-rate="${p.id}" aria-label="Rate ${p.name}">Rate</button></div><p class="product-price">${p.price.toLocaleString('en-US')} <small>MMK / 50 ml</small></p><button type="button" class="product-add" data-add="${p.id}" aria-label="Add ${p.name} to cart"><span aria-hidden="true">＋</span> Add to Cart</button></div></article>`;
    }).join('');
    list.scrollLeft = 0;
    requestAnimationFrame(updateArrows);
  }
  categoryList.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    selected = button.textContent;
    render();
    [...categoryList.children].find(item => item.textContent === selected)?.focus({ preventScroll: true });
  });
  list.addEventListener('click', event => {
    const add = event.target.closest('[data-add]');
    if (add) {
      const product = products.find(p => p.id === add.dataset.add);
      cart[product.id] = (Number(cart[product.id]) || 0) + 1;
      const persisted = save('kbloom-cart', cart);
      status.textContent = `${product.name} added to cart (${cart[product.id]}). ${persisted ? 'Saved on this device.' : 'Saved for this visit only.'}`;
      return;
    }
    const rate = event.target.closest('[data-rate]');
    if (!rate) return;
    ratingProduct = products.find(p => p.id === rate.dataset.rate);
    document.querySelector('.rating-product').textContent = ratingProduct.name;
    document.querySelector('.rating-options').innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" data-rating="${n}" aria-label="${n} ${n === 1 ? 'star' : 'stars'}">☆</button>`).join('');
    dialog.showModal();
  });
  document.querySelector('.rating-options').addEventListener('click', event => {
    const button = event.target.closest('[data-rating]');
    if (!button) return;
    ratings[ratingProduct.id] = Number(button.dataset.rating);
    const persisted = save('kbloom-ratings', ratings);
    const scrollPosition = list.scrollLeft;
    dialog.close();
    render();
    list.scrollLeft = scrollPosition;
    list.querySelector(`[data-rate="${ratingProduct.id}"]`).focus({ preventScroll: true });
    status.textContent = `Thank you! You rated ${ratingProduct.name} ${ratings[ratingProduct.id]}/5. ${persisted ? 'Saved on this device.' : 'Saved for this visit only.'}`;
  });
  document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollBy({ left: Number(button.dataset.scroll) * (list.firstElementChild.getBoundingClientRect().width + 20), behavior: reducedMotion ? 'instant' : 'smooth' });
  }));
  list.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  const header = document.querySelector('header');
  if (header) {
    const updateHeader = () => header.classList.toggle('over-products', document.querySelector('#product').getBoundingClientRect().top <= 70);
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }
  render();
})();
