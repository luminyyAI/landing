import { useEffect, useRef } from 'react';
import type { SiteConfig, SiteNavItem, SiteNavMegaColumn } from '../config/site.config';

function MegaColumnTitle({ col }: { readonly col: SiteNavMegaColumn }) {
  if (col.comingSoon) {
    return (
      <h3 className="nav__mega-section-label nav__mega-section-label--with-badge">
        <span>{col.title}</span>
        <span className="nav__mega-soon-badge">Coming soon</span>
      </h3>
    );
  }

  return <h3 className="nav__mega-section-label">{col.title}</h3>;
}

function MegaColumn({ col, fallbackHref }: { readonly col: SiteNavMegaColumn; readonly fallbackHref: string }) {
  if (col.comingSoon) {
    return (
      <div className="nav__mega-col nav__mega-col--soon" aria-label={`${col.title} — coming soon`}>
        <MegaColumnTitle col={col} />
        <p className="nav__mega-tagline nav__mega-tagline--wrap">{col.description}</p>
      </div>
    );
  }

  const href = col.href ?? fallbackHref;

  return (
    <a className="nav__mega-col nav__mega-col--link" href={href}>
      <MegaColumnTitle col={col} />
      <p className="nav__mega-tagline">{col.description}</p>
      {col.items.length > 0 ? (
        <>
          <p className="nav__mega-features-label">Features</p>
          <ul className="nav__mega-list nav__mega-list--bullets" aria-label={`Features · ${col.title}`}>
            {col.items.map((line, i) => (
              <li key={`${line}-${i}`} className="nav__mega-li">
                <span className="nav__mega-item-text">{line}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </a>
  );
}

function MegaPanel({ item }: { readonly item: SiteNavItem }) {
  if (!item.megaMenu) {
    return null;
  }

  return (
    <div className="nav__mega-panel" role="region" aria-label={`${item.label} overview`}>
      <div className="nav__mega-inner">
        {item.megaMenu.columns.map((col, colIndex) => (
          <MegaColumn key={`${col.title}-${colIndex}`} col={col} fallbackHref={item.href} />
        ))}
      </div>
    </div>
  );
}

export interface NavbarProps {
  readonly config: SiteConfig;
}

export function Navbar({ config }: NavbarProps) {
  const megaTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const megaShellRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  // Scroll-driven morph: past the sentinel, the bar splits into floating docks.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

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

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  useEffect(() => {
    const trigger = megaTriggerRef.current;
    const megaDropShell = megaShellRef.current;
    if (!trigger || !megaDropShell) return;

    const openMega = (): void => {
      trigger.setAttribute('aria-expanded', 'true');
    };
    const closeMega = (): void => {
      trigger.setAttribute('aria-expanded', 'false');
    };

    const onLeaveTrigger = (): void => {
      queueMicrotask(() => {
        if (!megaDropShell.matches(':hover')) closeMega();
      });
    };

    const onFocusOutShell = (e: FocusEvent): void => {
      const rt = e.relatedTarget as Node | null;
      if (!rt || (!megaDropShell.contains(rt) && rt !== trigger)) closeMega();
    };

    const onBlurTrigger = (e: FocusEvent): void => {
      const rt = e.relatedTarget as Node | null;
      if (!rt || !megaDropShell.contains(rt)) closeMega();
    };

    trigger.addEventListener('mouseenter', openMega);
    trigger.addEventListener('mouseleave', onLeaveTrigger);
    megaDropShell.addEventListener('mouseenter', openMega);
    megaDropShell.addEventListener('mouseleave', closeMega);
    trigger.addEventListener('focus', openMega);
    trigger.addEventListener('blur', onBlurTrigger);
    megaDropShell.addEventListener('focusout', onFocusOutShell);

    return () => {
      trigger.removeEventListener('mouseenter', openMega);
      trigger.removeEventListener('mouseleave', onLeaveTrigger);
      megaDropShell.removeEventListener('mouseenter', openMega);
      megaDropShell.removeEventListener('mouseleave', closeMega);
      trigger.removeEventListener('focus', openMega);
      trigger.removeEventListener('blur', onBlurTrigger);
      megaDropShell.removeEventListener('focusout', onFocusOutShell);
    };
  }, []);

  const hasMega = config.navItems.some((i) => i.megaMenu);

  return (
    <header className="nav" role="banner">
      <div className="nav__inner">
        <a className="nav__brand" href={config.homeHref} aria-label={`${config.brandName} home`}>
          <img className="nav__logo" src={config.logoSrc} alt={config.logoAlt} width={96} height={96} />
          <span className="nav__wordmark">{config.brandName}</span>
        </a>

        <div className="nav__center-slot">
          <nav aria-label="Primary">
            <ul className="nav__links">
              {config.navItems.map((item) => {
                const liClass = item.megaMenu ? 'nav__item nav__item--mega' : 'nav__item';

                if (item.megaMenu) {
                  return (
                    <li key={item.id} className={liClass}>
                      <a
                        ref={megaTriggerRef}
                        className="nav__link nav__mega-trigger"
                        href={item.href}
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                }

                const isCopySupport = !!item.copySupportEmail;
                return (
                  <li key={item.id} className={liClass}>
                    <a
                      className="nav__link"
                      href={isCopySupport ? '#' : item.href}
                      {...(isCopySupport
                        ? ({
                            'data-copy-support-email': '',
                            role: 'button',
                            'aria-label': 'Copy support email to clipboard',
                          } as const)
                        : {})}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {hasMega ? (
              <div ref={megaShellRef} className="nav__mega-drop">
                {config.navItems
                  .filter((i) => i.megaMenu)
                  .map((item) => (
                    <MegaPanel key={item.id} item={item} />
                  ))}
              </div>
            ) : null}
          </nav>
        </div>

        <div className="nav__actions">
          <a className="nav__link nav__link--auth" href={config.navAuth.login.href} id={config.navAuth.login.id}>
            {config.navAuth.login.label}
          </a>
          <a className="nav__cta" href={config.navAuth.signup.href} id={config.navAuth.signup.id}>
            {config.navAuth.signup.label}
          </a>
        </div>
      </div>
    </header>
  );
}
