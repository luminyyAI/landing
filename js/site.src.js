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

/* ---------------------------------------------------- mobile hamburger */

/** Mobile: primary links hide behind the hamburger next to Login / Sign up. */
function initMobileMenu() {
  const header = document.querySelector('header.nav');
  const btn = document.querySelector('.nav__hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!header || !btn || !menu) return;

  const setOpen = (open) => {
    header.classList.toggle('nav--menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  btn.addEventListener('click', () => setOpen(!header.classList.contains('nav--menu-open')));
  // Any link tap closes the menu (same-page anchors don't reload the page).
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
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

/* ------------------------------------------------ why-choose icon waves */
/* Port of the onboarding aurora waves (shared/promo-waves.js in the app):
   Catmull-Rom splines whose control points orbit on independent sine tracks,
   stroked with a drifting gradient + traveling highlight. Trimmed to three
   horizontal lines and recolored to the brand blue/black family so the tiny
   54px icon tiles read as liquid brand-blue light, not a full aurora field. */
function initWhyChooseWaves() {
  const tiles = document.querySelectorAll('.why-choose-luminy__card-icon');
  if (!tiles.length) return;

  const AURORA = ['#9cc6ff', '#e2eeff', '#6faeff', '#c7defe'];
  const BASE = ['#5a9dff', '#7cb5ff', '#a8ccff'];
  const HIGHLIGHT = '#ffffff';

  const cp = (x, y, ax, ay, fx, fy, px, py) => ({ x, y, ax, ay, fx, fy, px, py });
  const LINES = [
    {
      pts: [cp(-0.10, 0.60, 0.020, 0.110, 0.11, 0.15, 0.4, 2.9),
            cp(0.30, 0.40, 0.034, 0.160, 0.08, 0.12, 1.8, 0.7),
            cp(0.62, 0.66, 0.038, 0.180, 0.15, 0.08, 4.9, 0.8),
            cp(1.10, 0.46, 0.020, 0.110, 0.13, 0.10, 3.4, 5.6)],
      width: 2.1, alpha: 0.95, aurora: 0.8, seed: 53, speed: 1.0,
    },
    {
      pts: [cp(-0.06, 0.80, 0.018, 0.100, 0.09, 0.13, 2.6, 5.0),
            cp(0.38, 0.92, 0.028, 0.130, 0.12, 0.09, 0.9, 4.4),
            cp(0.72, 0.68, 0.032, 0.150, 0.10, 0.16, 3.6, 2.0),
            cp(1.08, 0.86, 0.018, 0.100, 0.11, 0.14, 2.2, 1.1)],
      width: 1.6, alpha: 0.8, aurora: 0.55, seed: 37, speed: 0.85,
    },
    {
      pts: [cp(-0.05, 0.44, 0.024, 0.120, 0.16, 0.21, 0.2, 3.8),
            cp(0.45, 0.60, 0.036, 0.170, 0.19, 0.14, 2.2, 1.1),
            cp(1.08, 0.48, 0.022, 0.110, 0.17, 0.12, 1.4, 0.3)],
      width: 1.2, alpha: 0.65, aurora: 1.0, seed: 23, speed: 1.3,
    },
  ];

  function catmullRom(pts, i, u) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1],
      p3 = pts[Math.min(i + 2, pts.length - 1)];
    const u2 = u * u, u3 = u2 * u;
    const blend = (a, b, c, d) =>
      0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 +
        (-a + 3 * b - 3 * c + d) * u3);
    return { x: blend(p0.x, p1.x, p2.x, p3.x), y: blend(p0.y, p1.y, p2.y, p3.y) };
  }

  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgba = (hex, a) => {
    const c = hexToRgb(hex);
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  };
  const mixHex = (hexA, hexB, t) => {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    return a.map((v, i) => Math.round(v + (b[i] - v) * t));
  };

  function drawFrame(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    const TEMPO = 4.4;
    for (const spec of LINES) {
      const ts = t * TEMPO * spec.speed;
      const cps = spec.pts.map((p) => ({
        x: (p.x + p.ax * Math.sin(p.fx * ts + p.px)) * w,
        y: (p.y + p.ay * Math.sin(p.fy * ts + p.py)) * h,
      }));

      const segs = cps.length - 1, perSeg = 12;
      const path = new Path2D();
      const first = catmullRom(cps, 0, 0);
      path.moveTo(first.x, first.y);
      for (let n = 1; n <= segs * perSeg; n++) {
        const i = Math.min(Math.floor(n / perSeg), segs - 1);
        const pt = catmullRom(cps, i, (n - i * perSeg) / perSeg);
        path.lineTo(pt.x, pt.y);
      }

      const a0 = cps[0], a1 = cps[cps.length - 1];
      const grad = ctx.createLinearGradient(a0.x, a0.y, a1.x, a1.y);
      const drift = 0.5 + 0.5 * Math.sin(ts * 0.13 + spec.seed);
      for (let s = 0; s <= 4; s++) {
        const auroraColor = AURORA[(s + Math.floor(drift * AURORA.length)) % AURORA.length];
        const c = mixHex(BASE[s % BASE.length], auroraColor, spec.aurora);
        const stopAlpha = Math.max(
          spec.alpha * (0.65 + 0.35 * Math.sin(ts * 0.21 + spec.seed + s * 1.7)), 0.15);
        grad.addColorStop(s / 4, `rgba(${c[0]},${c[1]},${c[2]},${Math.min(stopAlpha, 1).toFixed(3)})`);
      }
      ctx.lineWidth = spec.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = grad;
      ctx.shadowColor = 'rgba(140, 190, 255, 0.85)';
      ctx.shadowBlur = 5;
      ctx.stroke(path);
      ctx.shadowBlur = 0;

      const hlPos = 0.5 + 0.5 * Math.sin(ts * 0.17 + spec.seed * 1.3);
      const hl = ctx.createLinearGradient(a0.x, a0.y, a1.x, a1.y);
      const band = 0.16;
      const lo = Math.max(0, hlPos - band), hi = Math.min(1, hlPos + band);
      hl.addColorStop(0, 'rgba(255,255,255,0)');
      if (lo > 0) hl.addColorStop(lo, 'rgba(255,255,255,0)');
      hl.addColorStop(Math.min(Math.max(hlPos, 0.001), 0.999), rgba(HIGHLIGHT, 0.55 * spec.alpha));
      if (hi < 1) hl.addColorStop(hi, 'rgba(255,255,255,0)');
      hl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.lineWidth = spec.width + 0.6;
      ctx.strokeStyle = hl;
      ctx.stroke(path);
    }
  }

  const reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  tiles.forEach((tile, idx) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'why-choose-luminy__card-waves';
    canvas.setAttribute('aria-hidden', 'true');
    tile.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    let w = 0, h = 0;
    const resize = () => {
      const rect = tile.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(rect.width, 1);
      h = Math.max(rect.height, 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(tile);
    else window.addEventListener('resize', resize);

    // Per-tile phase offset so the four tiles never move in sync.
    const phase = 4.2 + idx * 2.7;
    if (reduceMotion) {
      drawFrame(ctx, w, h, phase);
      return;
    }
    const start = performance.now();
    let last = 0;
    const frame = (now) => {
      if (now - last >= 33 && tile.offsetParent !== null) {
        last = now;
        drawFrame(ctx, w, h, (now - start) / 1000 + phase);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

/* ----------------------------------------------------------------- boot */

function boot() {
  initWhyChooseWaves();
  initAuthLinks();
  initMobileMenu();
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
