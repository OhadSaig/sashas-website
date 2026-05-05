'use strict';

/* ─────────────────────────────────────────────
   BUSINESS HOURS — Europe/Dublin
   day: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
   values: minutes from midnight
───────────────────────────────────────────── */
const t = (h, m) => h * 60 + m;

const COFFEE_HOURS = {
  1: [t(7,30), t(15,0)],   // Mon
  2: [t(7,30), t(15,0)],   // Tue
  3: [t(7,30), t(15,0)],   // Wed
  4: [t(7,30), t(15,0)],   // Thu
  5: [t(7,30), t(15,0)],   // Fri
  6: [t(10,0), t(14,0)],   // Sat
  0: null,                  // Sun — closed
};

const DINNER_HOURS = {
  2: [t(17,0), t(21,30)],  // Tue
  3: [t(17,0), t(21,30)],  // Wed
  4: [t(17,0), t(21,30)],  // Thu
  5: [t(17,0), t(21,30)],  // Fri
  6: [t(17,0), t(21,30)],  // Sat
};

const LUNCH_HOURS = {
  2: [t(12,0), t(14,0)],   // Tue
  3: [t(12,0), t(14,0)],   // Wed
  4: [t(12,0), t(14,0)],   // Thu
};

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'pm' : 'am';
  const hd = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return m === 0 ? `${hd}${ampm}` : `${hd}:${String(m).padStart(2,'0')}${ampm}`;
}

function minsUntil(close, now) {
  const diff = close - now;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function nextOpen(day, nowMins) {
  // Check later today first
  for (const [hours, label] of [[COFFEE_HOURS,'coffee bar'], [DINNER_HOURS,'pizzeria']]) {
    const slot = hours[day];
    if (slot && nowMins < slot[0]) {
      return `Opens ${label} at ${fmtTime(slot[0])} today`;
    }
  }
  // Scan next 7 days
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    for (const [hours, label] of [[COFFEE_HOURS,'coffee bar'], [DINNER_HOURS,'pizzeria']]) {
      const slot = hours[d];
      if (slot) {
        const when = i === 1 ? 'tomorrow' : DAY_NAMES[d];
        return `Opens ${label} ${when} at ${fmtTime(slot[0])}`;
      }
    }
  }
  return 'Check opening hours below';
}

function updateStatus() {
  const badge = document.getElementById('statusBadge');
  if (!badge) return;

  // Always use Dublin time
  const dublin = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Dublin' }));
  const day     = dublin.getDay();
  const nowMins = dublin.getHours() * 60 + dublin.getMinutes();

  let isOpen = false;
  let label  = '';

  const coffee = COFFEE_HOURS[day];
  if (coffee && nowMins >= coffee[0] && nowMins < coffee[1]) {
    isOpen = true;
    label  = `Coffee Bar open · closes in ${minsUntil(coffee[1], nowMins)}`;
  }

  const dinner = DINNER_HOURS[day];
  if (!isOpen && dinner && nowMins >= dinner[0] && nowMins < dinner[1]) {
    isOpen = true;
    label  = `Pizzeria open · closes in ${minsUntil(dinner[1], nowMins)}`;
  }

  const lunch = LUNCH_HOURS[day];
  if (!isOpen && lunch && nowMins >= lunch[0] && nowMins < lunch[1]) {
    isOpen = true;
    label  = `Lunch service open · closes in ${minsUntil(lunch[1], nowMins)}`;
  }

  if (!isOpen) label = `Closed now · ${nextOpen(day, nowMins)}`;

  badge.innerHTML = `<span class="status-dot"></span>${label}`;
  badge.className = `status-badge ${isOpen ? 'open' : 'closed'}`;
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
let _toastTimer = null;
function showToast(msg, ms = 3500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ─────────────────────────────────────────────
   NAVBAR — transparent ↔ scrolled
───────────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const update = () => {
    const scrolled = window.scrollY > 40;
    nav.classList.toggle('scrolled', scrolled);
    nav.classList.toggle('transparent', !scrolled);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ─────────────────────────────────────────────
   MOBILE NAV
───────────────────────────────────────────── */
function initMobileNav() {
  const btn     = document.getElementById('hamburger');
  const nav     = document.getElementById('mobNav');
  const overlay = document.getElementById('mobOverlay');
  const close   = document.getElementById('mobClose');
  const links   = document.querySelectorAll('.mob-link');

  const open = () => {
    nav?.classList.add('open');
    overlay?.classList.add('active');
    btn?.classList.add('active');
    btn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const shut = () => {
    nav?.classList.remove('open');
    overlay?.classList.remove('active');
    btn?.classList.remove('active');
    btn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn?.addEventListener('click', () => nav?.classList.contains('open') ? shut() : open());
  close?.addEventListener('click', shut);
  overlay?.addEventListener('click', shut);
  links.forEach(l => l.addEventListener('click', shut));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
}

/* ─────────────────────────────────────────────
   SMOOTH SCROLL — offset for fixed navbar
───────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'smooth'
      });
    });
  });
}

/* ─────────────────────────────────────────────
   MENU TABS
───────────────────────────────────────────── */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.tab-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');

      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (panel) {
        panel.style.animation = 'none';
        panel.offsetHeight; // force reflow so animation re-fires
        panel.style.animation = '';
        panel.classList.add('active');
      }
    });
  });
}

/* ─────────────────────────────────────────────
   INTERSECTION OBSERVER — fade-up on scroll
───────────────────────────────────────────── */
function initAnimations() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}

/* ─────────────────────────────────────────────
   HERO KEN-BURNS
───────────────────────────────────────────── */
function initHero() {
  const bg = document.querySelector('.hero-bg');
  if (bg) setTimeout(() => bg.classList.add('loaded'), 80);
}

/* ─────────────────────────────────────────────
   COPYRIGHT YEAR
───────────────────────────────────────────── */
function setCopyrightYear() {
  const el = document.getElementById('copyrightYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
function init() {
  setCopyrightYear();
  updateStatus();
  setInterval(updateStatus, 60_000);

  initNavbar();
  initMobileNav();
  initSmoothScroll();
  initTabs();
  initAnimations();
  initHero();
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
