/**
 * Luminy marketing site — vanilla JS.
 * Source of truth for all page interactivity; bundled+minified to js/site.min.js
 * (npx esbuild js/site.src.js --bundle --minify --format=iife --outfile=js/site.min.js).
 * Each init is feature-gated on the DOM it needs, so one bundle serves every page.
 */
import EmblaCarousel from './vendor/embla-carousel.esm.js';

const SUPPORT_EMAIL = 'support@luminyy.com';

/* Luminy app (luminyy-frontend). Point APP_BASE_URL at the deployed app;
   127.0.0.1:8765 is the frontend's local dev server. */
const APP_BASE_URL = 'http://127.0.0.1:8765';
const SIGNUP_URL = `${APP_BASE_URL}/onboarding/onboarding.html`;
const LOGIN_URL = `${APP_BASE_URL}/dashboard/dashboard.html`;

/* ---------------------------------------------------------------- toast */

const TOAST_MS = 2800;

/** Short bottom toast (shared by email copy, suggestions mailto, etc.). */
function showTransientToast(message, durationMs = TOAST_MS) {
  const existing = document.querySelector('.email-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'email-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('email-toast--visible');
    });
  });

  window.setTimeout(() => {
    toast.classList.remove('email-toast--visible');
  }, durationMs);
  window.setTimeout(() => {
    toast.remove();
  }, durationMs + 450);
}

async function copySupportEmailAndToast() {
  try {
    await navigator.clipboard.writeText(SUPPORT_EMAIL);
    showTransientToast('Email copied');
  } catch {
    showTransientToast('Could not copy email');
  }
}

/** Event delegation: footer "Contact us" uses `a[data-copy-support-email]`. */
function initSupportEmailCopy() {
  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest('a[data-copy-support-email]');
    if (!anchor) return;
    event.preventDefault();
    void copySupportEmailAndToast();
  });

  // Suggestions page copies the address on arrival.
  if (document.querySelector('.suggestions-page')) {
    queueMicrotask(() => {
      void copySupportEmailAndToast();
    });
  }
}

/* ------------------------------------------------------- ambient scroll */

/**
 * Drives `--scroll-pct` (0–1) on the document root so CSS can shift soft
 * background tones as the user scrolls.
 */
function initScrollAmbient() {
  const root = document.documentElement;

  const ambientLayer = document.createElement('div');
  ambientLayer.className = 'ambient';
  ambientLayer.setAttribute('aria-hidden', 'true');
  document.body.prepend(ambientLayer);

  let rafId = null;

  const apply = () => {
    const scrollable = Math.max(0, root.scrollHeight - window.innerHeight);
    const raw = scrollable > 0 ? window.scrollY / scrollable : 0;
    const pct = Math.min(1, Math.max(0, raw));
    root.style.setProperty('--scroll-pct', pct.toFixed(4));
  };

  const onScroll = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      apply();
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  apply();
  requestAnimationFrame(apply);
}

/* -------------------------------------------------- navbar height var */

/**
 * Publishes the navbar's rendered height as `--nav-h` on the document root
 * so the hero can size itself to exactly fill the first screen.
 */
function initNavHeightVar() {
  const header = document.querySelector('header.nav');
  if (!header) return;

  const apply = () => {
    document.documentElement.style.setProperty('--nav-h', `${header.offsetHeight}px`);
  };

  apply();
  window.addEventListener('resize', apply, { passive: true });
  window.addEventListener('load', apply);
}

/* -------------------------------------------------- navbar appearance */

/**
 * Toggles `nav--scrolled` once the hero dashboard mock (`#hero-mock`)
 * meets the navbar; other pages fall back to a small scroll offset.
 */
function initNavbarAppearance() {
  const header = document.querySelector('header.nav');
  if (!header) return;

  let scheduledFrame = 0;

  const sync = () => {
    const mock = document.querySelector('#hero-mock');
    if (!mock) {
      header.classList.toggle('nav--scrolled', window.scrollY > 8);
      return;
    }
    const navRect = header.getBoundingClientRect();
    const mockRect = mock.getBoundingClientRect();
    header.classList.toggle('nav--scrolled', mockRect.top <= navRect.bottom + 1);
  };

  const onScroll = () => {
    if (scheduledFrame !== 0) return;
    scheduledFrame = requestAnimationFrame(() => {
      scheduledFrame = 0;
      sync();
    });
  };

  sync();
  requestAnimationFrame(sync);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('pageshow', sync);
}

/* -------------------------------------------------- navbar morph docks */

/** Past a ~110px sentinel the bar splits into floating docks (CSS does the rest). */
function initNavbarMorph() {
  const header = document.querySelector('header.nav');
  if (!header) return;

  // The floating pill shows the logo inside it; injected here so the 11
  // static pages don't each need the extra markup.
  const dockNav = header.querySelector('.nav__center-slot > nav');
  if (dockNav && !dockNav.querySelector('.nav__dock-brand')) {
    const brand = document.createElement('a');
    brand.className = 'nav__dock-brand';
    brand.href = 'index.html#top';
    brand.setAttribute('aria-label', 'Luminy home');
    const img = document.createElement('img');
    img.src = 'images/luminy-mark-blue.png';
    img.alt = '';
    brand.appendChild(img);
    dockNav.prepend(brand);
  }

  const sentinel = document.createElement('div');
  sentinel.className = 'nav__scroll-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  document.body.prepend(sentinel);

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('nav--floating', !entry.isIntersecting);
    },
    { rootMargin: '0px', threshold: 0 },
  );
  observer.observe(sentinel);
}

/* ------------------------------------------------------ navbar mega menu */

function initNavbarMega() {
  const trigger = document.querySelector('.nav__mega-trigger');
  const megaDropShell = document.querySelector('.nav__mega-drop');
  if (!trigger || !megaDropShell) return;

  const openMega = () => trigger.setAttribute('aria-expanded', 'true');
  const closeMega = () => trigger.setAttribute('aria-expanded', 'false');

  const onLeaveTrigger = () => {
    queueMicrotask(() => {
      if (!megaDropShell.matches(':hover')) closeMega();
    });
  };

  const onFocusOutShell = (e) => {
    const rt = e.relatedTarget;
    if (!rt || (!megaDropShell.contains(rt) && rt !== trigger)) closeMega();
  };

  const onBlurTrigger = (e) => {
    const rt = e.relatedTarget;
    if (!rt || !megaDropShell.contains(rt)) closeMega();
  };

  trigger.addEventListener('mouseenter', openMega);
  trigger.addEventListener('mouseleave', onLeaveTrigger);
  megaDropShell.addEventListener('mouseenter', openMega);
  megaDropShell.addEventListener('mouseleave', closeMega);
  trigger.addEventListener('focus', openMega);
  trigger.addEventListener('blur', onBlurTrigger);
  megaDropShell.addEventListener('focusout', onFocusOutShell);
}

/* -------------------------------------------------- includes carousel */

function initIncludesCarousel() {
  const viewport = document.querySelector('[data-includes-embla-viewport]');
  const dotsRoot = document.querySelector('[data-includes-dots]');
  const cards = [...document.querySelectorAll('[data-includes-card]')];
  if (!viewport || !dotsRoot) return;

  const embla = EmblaCarousel(viewport, {
    loop: true,
    duration: 34,
  });

  const scrollToIndex = (i) => {
    embla.scrollTo(i);
  };

  const renderDots = () => {
    dotsRoot.replaceChildren();
    const n = embla.scrollSnapList().length;
    const active = embla.selectedScrollSnap();
    for (let i = 0; i < n; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `includes__dot${i === active ? ' includes__dot--active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => scrollToIndex(i));
      dotsRoot.appendChild(dot);
    }
  };

  const setActiveCard = (index) => {
    cards.forEach((btn, i) => {
      const on = i === index;
      btn.classList.toggle('includes-card--active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderDots();
  };

  cards.forEach((btn, i) => {
    btn.addEventListener('click', () => scrollToIndex(i));
  });

  embla.on('select', () => setActiveCard(embla.selectedScrollSnap()));
  embla.on('reInit', renderDots);

  setActiveCard(embla.selectedScrollSnap());
}

/* ------------------------------------------------------ pricing toggle */

function initPricingToggle() {
  const pro = document.querySelector('.pricing-card--pro');
  if (!pro) return;
  const opts = pro.querySelectorAll('.pricing-card__billing-opt');
  if (opts.length !== 2) return;

  const price = pro.querySelector('.pricing-card__price');
  const period = pro.querySelector('.pricing-card__period');
  const equiv = pro.querySelector('.pricing-card__price-equiv');
  const note = pro.querySelector('.pricing-card__bill-note');

  const apply = (yearly) => {
    opts[0].classList.toggle('pricing-card__billing-opt--active', !yearly);
    opts[0].setAttribute('aria-pressed', String(!yearly));
    opts[1].classList.toggle('pricing-card__billing-opt--active', yearly);
    opts[1].setAttribute('aria-pressed', String(yearly));
    if (price) price.textContent = yearly ? '$140' : '$14.99';
    if (period) period.textContent = yearly ? '/year' : '/month';
    if (equiv) equiv.classList.toggle('pricing-card__price-equiv--hidden', !yearly);
    if (note) {
      note.textContent = yearly
        ? 'Billed annually. Cancel anytime. Taxes may apply.'
        : 'Cancel anytime. Taxes may apply.';
    }
  };

  opts[0].addEventListener('click', () => apply(false));
  opts[1].addEventListener('click', () => apply(true));
}

/* ------------------------------------------------------------ auth links */

/** Point the navbar Login / Sign up links at the app. */
function initAuthLinks() {
  const login = document.getElementById('login');
  const signup = document.getElementById('signup');
  if (login) login.href = LOGIN_URL;
  if (signup) signup.href = SIGNUP_URL;
}

/* ----------------------------------------------------------------- boot */

function boot() {
  initAuthLinks();
  initScrollAmbient();
  initNavHeightVar();
  initNavbarAppearance();
  initNavbarMorph();
  initNavbarMega();
  initSupportEmailCopy();
  initIncludesCarousel();
  initPricingToggle();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
