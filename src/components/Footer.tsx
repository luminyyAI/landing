import appStoreBadgeUrl from '../../images/Download_on_App.svg';
import macAppBadgeUrl from '../../images/Download_on_Mac_App.svg';
import type { SiteConfig } from '../config/site.config';
import type { FooterSocialBrand } from '../ui/footerSocialIcons';
import { FOOTER_SOCIAL_ICONS } from '../ui/footerSocialIcons';

const IG_GRAD_ID = 'footer-social-gr-ig';

function FooterSocialGlyph({ brand, paths }: { readonly brand: FooterSocialBrand; readonly paths: readonly string[] }) {
  if (brand === 'instagram') {
    return (
      <svg className="footer__social-svg" viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
        <defs>
          <linearGradient id={IG_GRAD_ID} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#833ab4" />
            <stop offset="45%" stopColor="#fd1d1d" />
            <stop offset="100%" stopColor="#fcb045" />
          </linearGradient>
        </defs>
        {paths.map((d, i) => (
          <path key={i} d={d} fill={`url(#${IG_GRAD_ID})`} />
        ))}
      </svg>
    );
  }

  if (brand === 'tiktok') {
    return (
      <svg className="footer__social-svg" viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
        {paths.map((d, i) => (
          <path key={i} d={d} fill="currentColor" />
        ))}
      </svg>
    );
  }

  return (
    <svg className="footer__social-svg" viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} fill="#0a66c2" />
      ))}
    </svg>
  );
}

export interface FooterProps {
  readonly config: SiteConfig;
}

export function Footer({ config }: FooterProps) {
  return (
    <footer id="footer" className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <a className="footer__logo-link" href={config.homeHref} aria-label={`${config.brandName} — home`}>
              <img className="footer__logo" src={config.logoSrc} alt="" width={40} height={40} />
              <span className="footer__brand-name">{config.brandName}</span>
            </a>
            <p className="footer__download-label">Download {config.brandName}</p>
            <div className="footer__badges">
              <a className="footer__badge" href="index.html#download" aria-label="Download on the App Store">
                <img src={appStoreBadgeUrl} alt="" width={135} height={40} />
              </a>
              <a className="footer__badge" href="index.html#download" aria-label="Download on the Mac App Store">
                <img src={macAppBadgeUrl} alt="" width={157} height={40} />
              </a>
            </div>
          </div>

          {config.footerColumns.map((column) => (
            <div key={column.heading} className="footer__column">
              <p className="footer__heading">{column.heading}</p>
              <ul className="footer__list">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      className="footer__link"
                      href={link.copySupportEmail ? '#' : link.href}
                      {...(link.copySupportEmail
                        ? ({
                            'data-copy-support-email': '',
                            role: 'button',
                            'aria-label': 'Copy support email to clipboard',
                          } as const)
                        : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">{config.copyright}</p>

          <ul className="footer__social">
            {FOOTER_SOCIAL_ICONS.map((item) => (
              <li key={item.brand}>
                <a className="footer__social-link" href={item.href} aria-label={item.network} title={item.network}>
                  <span className={`footer__social-icon footer__social-icon--${item.brand}`}>
                    <FooterSocialGlyph brand={item.brand} paths={item.paths} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
