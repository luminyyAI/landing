/**
 * Luminy marketing site - vanilla JS.
 * Source of truth for all page interactivity; bundled+minified to js/site.min.js
 * (npx esbuild js/site.src.js --bundle --minify --format=iife --outfile=js/site.min.js).
 * Each init is feature-gated on the DOM it needs, so one bundle serves every page.
 */
import EmblaCarousel from './vendor/embla-carousel.esm.js';

const SUPPORT_EMAIL = 'support@luminyy.com';

/* Luminy app (luminyy-frontend). Auto-switches: local dev server while the
   landing site itself is served locally, deployed app otherwise. */
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const APP_BASE_URL = IS_LOCAL ? 'http://127.0.0.1:8765' : 'https://app.luminyy.com/app';
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
}

/* ------------------------------------------------------ form validation */

/* Strict email shape: one local part (letters, digits, . _ % + -), exactly
   one "@", dot-separated domain labels that don't start/end with a hyphen,
   and a letters-only top-level domain of 2+ characters (.com, .io, …).
   Deliberately stricter than the browser's built-in type="email" check,
   which accepts addresses like "a@b". */
const STRICT_EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

const EMAIL_MAX_LENGTH = 254;

/** Returns '' when the email is valid, otherwise a user-facing error. */
function validateEmailStrict(value) {
  const email = value.trim();
  if (!email) return 'Please enter your email address.';
  if (!email.includes('@')) return 'Email must include an "@".';
  if (email.split('@').length !== 2) return 'Email must contain exactly one "@".';
  if (email.length > EMAIL_MAX_LENGTH) return 'Email address is too long.';

  const [local, domain] = email.split('@');
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return 'The part before "@" can\'t start, end, or repeat with dots.';
  }
  if (!domain.includes('.')) {
    return 'The domain needs a dot, like "example.com".';
  }
  if (!STRICT_EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email like you@example.com - the ending after the last "." must be at least 2 letters.';
  }
  return '';
}

/* ---------------------------------------------------- suggestions form */

/* Where suggestion messages are POSTed as JSON ({ email, message }).
   Leave empty to fall back to a pre-filled mailto: draft (no backend
   needed). NOTE: the localStorage limit below only deters casual repeat
   submissions from the same browser - anyone can clear storage or hit the
   endpoint directly, so the real quota must live server-side (form
   provider limits, Turnstile/captcha, or per-IP rate limiting). */
const SUGGESTIONS_ENDPOINT = '';
const SUGGESTIONS_MAX_PER_DAY = 2;
const SUGGESTIONS_MIN_INTERVAL_MS = 60 * 1000;
const SUGGESTIONS_STORE_KEY = 'luminy-suggestion-times';

function recentSuggestionTimes() {
  try {
    const raw = JSON.parse(localStorage.getItem(SUGGESTIONS_STORE_KEY));
    if (!Array.isArray(raw)) return [];
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return raw.filter((t) => typeof t === 'number' && t > dayAgo);
  } catch {
    return [];
  }
}

function recordSuggestionTime(times) {
  try {
    localStorage.setItem(SUGGESTIONS_STORE_KEY, JSON.stringify([...times, Date.now()]));
  } catch {
    /* private browsing - limit simply doesn't persist */
  }
}

function initSuggestionsForm() {
  const form = document.getElementById('suggestions-form');
  if (!form) return;

  const hint = document.getElementById('suggestions-hint');
  const submitBtn = form.querySelector('.suggestions__submit');
  const emailField = form.elements.email;
  const setHint = (message) => {
    if (hint) hint.textContent = message;
  };

  // Clear the strict-validation error as soon as the user edits the field,
  // so the browser doesn't keep blocking submits with a stale message.
  emailField.addEventListener('input', () => {
    emailField.setCustomValidity('');
    setHint('');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    emailField.setCustomValidity(validateEmailStrict(emailField.value));
    if (!form.reportValidity()) return;

    const times = recentSuggestionTimes();
    if (times.length >= SUGGESTIONS_MAX_PER_DAY) {
      setHint(`You've reached the limit of ${SUGGESTIONS_MAX_PER_DAY} messages per day. Please try again tomorrow.`);
      return;
    }
    const last = times[times.length - 1];
    if (last && Date.now() - last < SUGGESTIONS_MIN_INTERVAL_MS) {
      setHint('Please wait a minute before sending another message.');
      return;
    }

    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    if (SUGGESTIONS_ENDPOINT) {
      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await fetch(SUGGESTIONS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, message }),
        });
        if (!res.ok) throw new Error(String(res.status));
        recordSuggestionTime(times);
        form.reset();
        setHint('');
        showTransientToast('Message sent - thank you!');
      } catch {
        showTransientToast('Could not send message. Please try again.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
      return;
    }

    // No endpoint configured: open a pre-filled email draft instead.
    const subject = encodeURIComponent('Luminy suggestion');
    const body = encodeURIComponent(`${message}\n\n- ${email}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    recordSuggestionTime(times);
    setHint('');
    showTransientToast('Email draft opened');
  });
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

/* ---------------------------------------------------- why-free dialog */

const WHY_FREE_PARAGRAPHS = [
  'Unfortunately, our backend servers cost money to fetch data from financial institutions and host our application.',
  "We're also in this for the long term. Luminy started as a private tool for creators and close friends - and the people with early access found it so useful that we decided to release it to the public.",
  'We genuinely enjoy this product, and we want to keep improving it for years to come.',
];
const WHY_FREE_CHAR_MS = 14;
const WHY_FREE_PARAGRAPH_PAUSE_MS = 350;

/** "Why isn't Luminy free?" - opens a dialog that types out the answer. */
function initWhyFreeDialog() {
  const trigger = document.querySelector('[data-why-free-trigger]');
  const dialog = document.querySelector('[data-why-free-dialog]');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;

  const body = dialog.querySelector('[data-why-free-body]');
  const closeBtn = dialog.querySelector('[data-why-free-close]');
  let timerId = null;

  const stopStreaming = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const stream = () => {
    body.replaceChildren();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const text of WHY_FREE_PARAGRAPHS) {
        const p = document.createElement('p');
        p.className = 'why-free__p';
        p.textContent = text;
        body.appendChild(p);
      }
      return;
    }

    let paragraphIndex = 0;
    let charIndex = 0;
    let current = null;

    const tick = () => {
      if (paragraphIndex >= WHY_FREE_PARAGRAPHS.length) {
        timerId = null;
        return;
      }
      if (!current) {
        current = document.createElement('p');
        current.className = 'why-free__p';
        body.appendChild(current);
      }
      const text = WHY_FREE_PARAGRAPHS[paragraphIndex];
      charIndex += 1;
      current.textContent = text.slice(0, charIndex);
      if (charIndex >= text.length) {
        paragraphIndex += 1;
        charIndex = 0;
        current = null;
        timerId = window.setTimeout(tick, WHY_FREE_PARAGRAPH_PAUSE_MS);
      } else {
        timerId = window.setTimeout(tick, WHY_FREE_CHAR_MS);
      }
    };
    tick();
  };

  trigger.addEventListener('click', () => {
    dialog.showModal();
    stopStreaming();
    stream();
  });
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', stopStreaming);
  // Click on the backdrop (outside the dialog's content box) closes it.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
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
  initSuggestionsForm();
  initIncludesCarousel();
  initPricingToggle();
  initWhyFreeDialog();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
