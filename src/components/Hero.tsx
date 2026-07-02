import appStoreBadgeUrl from '../../images/Download_on_App.svg';
import macAppBadgeUrl from '../../images/Download_on_Mac_App.svg';
import homepageScreenshot from '../../images/homepage.jpg';

const HERO_AWARDS = [
  'Smart Ways to Manage Money',
  'Must-Have Finance Apps',
  'Apps We Love',
  'Charted #200 in Finance',
] as const;

/** Pointed leaf: base at origin, tip at (0,-11). Placed along the stem via translate+rotate. */
const LAUREL_LEAF = 'M0 0 C2.5 -2.8 2.9 -7.2 0 -11.5 C-2.9 -7.2 -2.5 -2.8 0 0 Z';

/**
 * One side of a laurel wreath — a curved stem with pointed leaves
 * alternating on each side. Mirrored via CSS for the right branch.
 */
function LaurelBranch({ mirrored = false }: { readonly mirrored?: boolean }) {
  const leaves = [
    { x: 19.2, y: 51.5, r: -62 },
    { x: 16.4, y: 46, r: 44 },
    { x: 14.6, y: 39.5, r: -58 },
    { x: 13.3, y: 32.5, r: 46 },
    { x: 12.8, y: 25.5, r: -52 },
    { x: 12.7, y: 18.5, r: 48 },
    { x: 13.1, y: 11.5, r: -46 },
    { x: 14.2, y: 5, r: -4 },
  ];
  return (
    <svg
      className="hero-award__laurel"
      viewBox="0 0 28 58"
      width={22}
      height={46}
      aria-hidden="true"
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path
        d="M22 56 C13 44 11 26 14.5 3"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      {leaves.map((leaf, i) => (
        <path
          key={i}
          d={LAUREL_LEAF}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg className="hero-award__apple" viewBox="0 0 384 512" width={13} height={16} aria-hidden="true">
      <path
        fill="currentColor"
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
      />
    </svg>
  );
}

function HeroAwardsTrack({ hidden = false }: { readonly hidden?: boolean }) {
  return (
    <ul className="hero-awards__track-half" aria-hidden={hidden || undefined}>
      {HERO_AWARDS.map((title) => (
        <li key={title} className="hero-award">
          <LaurelBranch />
          <span className="hero-award__body">
            <span className="hero-award__title">{title}</span>
            <AppleGlyph />
          </span>
          <LaurelBranch mirrored />
        </li>
      ))}
    </ul>
  );
}

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-heading">
      <div className="container hero__container">
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="hero__eyebrow">Meet Luminy</p>
            <h1 id="hero-heading" className="hero__headline">
              <span className="hero__headline-line">Modern Money Management</span>
              <span className="hero__headline-line hero__headline-line--secondary">
                Track every account in one place
              </span>
            </h1>
            <p className="hero__desc">
              Banking, investments, credit cards, loans, and real estate powered by intelligent financial insights.
            </p>
            <div id="download" className="hero__cta">
              <div className="hero__actions">
                <a className="hero__app-store" href="#" aria-label="Download on the App Store">
                  <img className="hero__app-store-img" src={appStoreBadgeUrl} alt="" width={120} height={40} />
                </a>
                <a className="hero__app-store" href="#" aria-label="Download on the Mac App Store">
                  <img className="hero__app-store-img" src={macAppBadgeUrl} alt="" width={157} height={40} />
                </a>
              </div>
              <p className="hero__trust" aria-label="5 out of 5 on the App Store">
                <span className="hero__trust-stars" aria-hidden="true">
                  ★★★★★
                </span>
                <span className="hero__trust-text">5/5 on the App Store</span>
              </p>
            </div>
          </div>

          <div id="hero-mock" className="hero__mock-host">
            <div className="hero__mock-frame">
              <img
                className="hero__screenshot"
                src={homepageScreenshot}
                alt="Luminy dashboard showing accounts, spending, and financial insights"
                width={1440}
                height={900}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="hero__awards" role="list" aria-label="App Store recognition">
        <div className="hero__awards-track">
          <HeroAwardsTrack />
          <HeroAwardsTrack hidden />
        </div>
      </div>
    </section>
  );
}
