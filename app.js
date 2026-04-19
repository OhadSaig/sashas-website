/* ══════════════════════════════════════════════════════
   SASHA'S PIZZERIA & COFFEE BAR — app.js
   Timezone: Europe/Dublin (IST / GMT)
══════════════════════════════════════════════════════ */

'use strict';

/* ─── PRODUCT DATA ───────────────────────────────── */
const PRODUCTS = [
  {
    id: 1,
    brand: "Sasha's Coffee Bar",
    name: "House Blend Coffee Beans",
    desc: "250g of our signature espresso blend, roasted in Dublin. Full-bodied with dark chocolate and caramel notes.",
    price: 14.00,
    category: "coffee",
    badge: "Bestseller",
    img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&q=80&auto=format&fit=crop",
    variants: null,
  },
  {
    id: 2,
    brand: "Sasha's Coffee Bar",
    name: "Single Origin Pour Over",
    desc: "Seasonal single-origin ground coffee, 200g. Perfect for filter brewing at home — flavour-forward and aromatic.",
    price: 16.00,
    category: "coffee",
    badge: "Seasonal",
    img: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=400&q=80&auto=format&fit=crop",
    variants: null,
  },
  {
    id: 3,
    brand: "Sasha's",
    name: "Keep Cup — Glass Edition",
    desc: "12oz reusable glass keep cup with our wordmark. BPA-free, dishwasher safe. Drink in style.",
    price: 22.00,
    category: "merch",
    badge: null,
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&q=80&auto=format&fit=crop",
    variants: null,
  },
  {
    id: 4,
    brand: "Sasha's",
    name: "Canvas Tote Bag",
    desc: "Heavy-duty natural canvas tote with the Sasha's script wordmark. 100% organic cotton. Holds a pizza box.",
    price: 15.00,
    category: "merch",
    badge: null,
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&auto=format&fit=crop",
    variants: null,
  },
  {
    id: 5,
    brand: "Sasha's",
    name: "Gift Card",
    desc: "Give the gift of great pizza and coffee. Valid in-store and online. Never expires.",
    price: 25.00,
    category: "gift",
    badge: "Perfect Gift",
    img: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&q=80&auto=format&fit=crop",
    variants: [25, 50, 100],
  },
];

/* ─── BUSINESS HOURS (Europe/Dublin) ──────────────── */
// day: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
// times in [openMinutes, closeMinutes] from midnight
const t = (h, m) => h * 60 + m;

const COFFEE_HOURS = {
  1: [t(7,30), t(15,0)],
  2: [t(7,30), t(15,0)],
  3: [t(7,30), t(15,0)],
  4: [t(7,30), t(15,0)],
  5: [t(7,30), t(15,0)],
  6: [t(10,0), t(14,0)],
  0: null, // Sunday — closed
};

const DINNER_HOURS = {
  2: [t(17,0), t(21,30)],
  3: [t(17,0), t(21,30)],
  4: [t(17,0), t(21,30)],
  5: [t(17,0), t(21,30)],
  6: [t(17,0), t(21,30)],
};

const LUNCH_HOURS = {
  2: [t(12,0), t(14,0)],
  3: [t(12,0), t(14,0)],
  4: [t(12,0), t(14,0)],
};

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'pm' : 'am';
  const hDisplay = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${hDisplay}${ampm}` : `${hDisplay}:${String(m).padStart(2,'0')}${ampm}`;
}

function minsUntil(closeMins, currentMins) {
  const diff = closeMins - currentMins;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function getNextOpen(day, currentMins) {
  // Try same-day remaining services, then tomorrow and beyond
  const checks = [
    { hours: DINNER_HOURS, label: 'Pizzeria', type: 'dinner' },
    { hours: COFFEE_HOURS, label: 'Coffee Bar', type: 'coffee' },
  ];

  // Same day — something opens later today?
  for (const { hours, label } of checks) {
    const slot = hours[day];
    if (slot && currentMins < slot[0]) {
      return `Opens ${label.toLowerCase()} at ${formatTime(slot[0])} today`;
    }
  }

  // Look through the next 7 days
  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (day + offset) % 7;
    for (const { hours, label } of [
      { hours: COFFEE_HOURS, label: 'Coffee Bar' },
      { hours: DINNER_HOURS, label: 'Pizzeria' },
    ]) {
      const slot = hours[nextDay];
      if (slot) {
        const when = offset === 1 ? 'tomorrow' : DAY_NAMES[nextDay];
        return `Opens ${label.toLowerCase()} ${when} at ${formatTime(slot[0])}`;
      }
    }
  }

  return 'Check our hours below';
}

function updateOpenStatus() {
  const badge = document.getElementById('statusBadge');
  if (!badge) return;

  // Get current Dublin time
  const now = new Date();
  const dublinStr = now.toLocaleString('en-US', { timeZone: 'Europe/Dublin' });
  const dublin = new Date(dublinStr);
  const day = dublin.getDay();
  const currentMins = dublin.getHours() * 60 + dublin.getMinutes();

  let label = '';
  let isOpen = false;

  // Check Coffee Bar
  const coffee = COFFEE_HOURS[day];
  if (coffee && currentMins >= coffee[0] && currentMins < coffee[1]) {
    isOpen = true;
    label = `☕ Coffee Bar open · Closes in ${minsUntil(coffee[1], currentMins)}`;
  }

  // Check Dinner
  const dinner = DINNER_HOURS[day];
  if (!isOpen && dinner && currentMins >= dinner[0] && currentMins < dinner[1]) {
    isOpen = true;
    label = `🍕 Pizzeria open · Closes in ${minsUntil(dinner[1], currentMins)}`;
  }

  // Check Lunch
  const lunch = LUNCH_HOURS[day];
  if (!isOpen && lunch && currentMins >= lunch[0] && currentMins < lunch[1]) {
    isOpen = true;
    label = `🥪 Lunch service open · Closes in ${minsUntil(lunch[1], currentMins)}`;
  }

  if (!isOpen) {
    label = `Closed now · ${getNextOpen(day, currentMins)}`;
  }

  badge.innerHTML = `<span class="status-dot"></span>${label}`;
  badge.className = `status-badge ${isOpen ? 'open' : 'closed'}`;
}

/* ─── CART (localStorage) ──────────────────────────── */
const CART_KEY = 'sashas_cart_v1';
let cart = [];

function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    cart = [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartItemCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  const count = cartItemCount();
  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);
}

function addToCart(productId, variant) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const price = variant ? variant : product.price;
  const variantLabel = variant ? `€${variant} Gift Card` : null;
  const itemKey = `${productId}-${variant || 'default'}`;

  const existing = cart.find(i => i.key === itemKey);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      key: itemKey,
      id: productId,
      name: product.name,
      brand: product.brand,
      price,
      variant: variantLabel,
      img: product.img,
      qty: 1,
    });
  }

  saveCart();
  updateCartBadge();
  renderCartItems();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(itemKey) {
  cart = cart.filter(i => i.key !== itemKey);
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function changeQty(itemKey, delta) {
  const item = cart.find(i => i.key === itemKey);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(itemKey);
  } else {
    saveCart();
    updateCartBadge();
    renderCartItems();
  }
}

function renderCartItems() {
  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingMsg = document.getElementById('cartShippingMsg');

  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = '<p class="cart-empty">Your cart is empty.<br><a href="#shop">Browse the shop →</a></p>';
    if (footer) footer.hidden = true;
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item" data-key="${item.key}">
      <div class="cart-item-img">
        <img src="${item.img}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        ${item.variant ? `<div class="cart-item-variant">${item.variant}</div>` : ''}
        <div class="cart-qty-row">
          <button class="qty-btn" data-key="${item.key}" data-delta="-1" aria-label="Decrease quantity">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" data-key="${item.key}" data-delta="1" aria-label="Increase quantity">+</button>
          <span class="cart-item-remove" data-key="${item.key}" role="button" tabindex="0">Remove</span>
        </div>
      </div>
      <div class="cart-item-price">€${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join('');

  // Qty / remove event delegation
  body.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.key, parseInt(btn.dataset.delta)));
  });
  body.querySelectorAll('.cart-item-remove').forEach(el => {
    el.addEventListener('click', () => removeFromCart(el.dataset.key));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') removeFromCart(el.dataset.key); });
  });

  const total = cartTotal();
  if (subtotalEl) subtotalEl.textContent = `€${total.toFixed(2)}`;
  if (footer) footer.hidden = false;

  // Shipping threshold
  if (shippingMsg) {
    if (total >= 50) {
      shippingMsg.textContent = '🎉 You qualify for free shipping!';
    } else {
      shippingMsg.textContent = `Add €${(50 - total).toFixed(2)} more for free shipping.`;
    }
  }
}

/* ─── CART SIDEBAR OPEN/CLOSE ──────────────────────── */
function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

/* ─── CHECKOUT MODAL ──────────────────────────────── */
function openCheckout() {
  closeCart();
  const overlay = document.getElementById('checkoutOverlay');
  const summary = document.getElementById('checkoutSummary');

  if (summary) {
    summary.innerHTML = `
      ${cart.map(i => `
        <div class="checkout-summary-item">
          <span>${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.qty}</span>
          <span>€${(i.price * i.qty).toFixed(2)}</span>
        </div>
      `).join('')}
      <div class="checkout-summary-total">
        <span>Total</span>
        <span>€${cartTotal().toFixed(2)}</span>
      </div>
    `;
  }

  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckout() {
  document.getElementById('checkoutOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── TOAST ───────────────────────────────────────── */
// BUG FIX: z-index 9999 in CSS — higher than modal overlay (9000)
let toastTimer = null;

function showToast(msg, duration = 3500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─── NAVBAR SCROLL BEHAVIOUR ─────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  function updateNav() {
    if (window.scrollY > 40) {
      nav.classList.remove('transparent');
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
      nav.classList.add('transparent');
    }
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
}

/* ─── MOBILE NAV ──────────────────────────────────── */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const overlay   = document.getElementById('mobileNavOverlay');
  const closeBtn  = document.getElementById('mobileNavClose');
  const links     = document.querySelectorAll('.mobile-nav-link');

  function open() {
    mobileNav?.classList.add('open');
    overlay?.classList.add('active');
    hamburger?.classList.add('active');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    mobileNav?.classList.remove('open');
    overlay?.classList.remove('active');
    hamburger?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    mobileNav?.classList.contains('open') ? close() : open();
  });

  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  // BUG FIX: mobile nav closes when a link is clicked
  links.forEach(link => link.addEventListener('click', close));
}

/* ─── SMOOTH SCROLL ────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─── MENU TABS ────────────────────────────────────── */
function initMenuTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const panel = document.getElementById(`tab-${target}`);
      if (panel) {
        panel.style.animation = 'none';
        panel.offsetHeight; // reflow
        panel.style.animation = '';
        panel.classList.add('active');
      }
    });
  });
}

/* ─── SHOP: RENDER & FILTER ───────────────────────── */
function renderShop() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card" data-category="${p.category}">
      <div class="product-img">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-body">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <span class="product-price">€${p.price.toFixed(2)}</span>
          ${p.variants ? `
            <select class="variant-select" data-id="${p.id}" aria-label="Select value">
              ${p.variants.map(v => `<option value="${v}">€${v} Gift Card</option>`).join('')}
            </select>
          ` : ''}
          <button class="add-to-cart" data-id="${p.id}" ${p.variants ? 'data-variant' : ''}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Add-to-cart event delegation
  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const select = btn.closest('.product-footer')?.querySelector('.variant-select');
      const variant = select ? parseFloat(select.value) : null;
      addToCart(id, variant);
    });
  });
}

function initShopFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const grid    = document.getElementById('shopGrid');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards  = grid?.querySelectorAll('.product-card');

      cards?.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = 'fadeInUp .35s ease both';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ─── INTERSECTION OBSERVER (fade-up) ─────────────── */
function initAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* ─── NEWSLETTER FORM ──────────────────────────────── */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('nlName')?.value.trim();
    const email = document.getElementById('nlEmail')?.value.trim();

    if (!name || !email) {
      showToast('Please fill in all fields.');
      return;
    }

    // Personalised toast with user's name
    showToast(`Thanks ${name}! You're on the list — check your inbox for 10% off.`, 5000);
    form.reset();
  });
}

/* ─── CHECKOUT FORM ────────────────────────────────── */
function initCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('coName')?.value.trim();
    if (!name) {
      showToast('Please complete all required fields.');
      return;
    }

    // Clear cart and close modal
    cart = [];
    saveCart();
    updateCartBadge();
    renderCartItems();
    closeCheckout();

    showToast(`Order placed! We'll email confirmation to you shortly.`, 5000);
    form.reset();
  });
}

/* ─── HERO BG ZOOM ─────────────────────────────────── */
function initHeroBgZoom() {
  const bg = document.querySelector('.hero-bg');
  if (bg) setTimeout(() => bg.classList.add('loaded'), 100);
}

/* ─── COPYRIGHT YEAR ───────────────────────────────── */
// BUG FIX: always shows current year via JS
function setCopyrightYear() {
  const el = document.getElementById('copyrightYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─── INIT ────────────────────────────────────────── */
function init() {
  loadCart();
  setCopyrightYear();
  updateOpenStatus();
  renderShop();
  renderCartItems();
  updateCartBadge();

  initNavbar();
  initMobileNav();
  initSmoothScroll();
  initMenuTabs();
  initShopFilter();
  initAnimations();
  initNewsletter();
  initCheckoutForm();
  initHeroBgZoom();

  // Cart open/close
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }
    openCheckout();
  });

  // Checkout modal close
  document.getElementById('checkoutClose')?.addEventListener('click', closeCheckout);
  document.getElementById('checkoutOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('checkoutOverlay')) closeCheckout();
  });

  // Close cart on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCart();
      closeCheckout();
    }
  });

  // Re-check status every minute
  setInterval(updateOpenStatus, 60_000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
