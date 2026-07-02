/**
 * Footer social glyphs (viewBox 0 0 24 24). Instagram: gradient fill; LinkedIn: blue;
 * TikTok: currentColor (black on light footer, light on blog — see main.css).
 * Replace `href` when you have real profile URLs.
 */
export type FooterSocialBrand = 'instagram' | 'linkedin' | 'tiktok';

export const FOOTER_SOCIAL_ICONS = [
  {
    network: 'Instagram',
    brand: 'instagram' as const,
    href: '#',
    paths: [
      'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    ],
  },
  {
    network: 'LinkedIn',
    brand: 'linkedin' as const,
    href: '#',
    paths: [
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    ],
  },
  {
    network: 'TikTok',
    brand: 'tiktok' as const,
    href: '#',
    paths: [
      'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.14-1.62.89-3.17 2.08-4.3 1.1-1.05 2.49-1.76 3.98-2.02.28-.05.57-.08.85-.11v3.85c-.29.07-.58.16-.84.3-.73.38-1.26 1.1-1.43 1.91-.05.27-.07.55-.06.83.05.85.52 1.65 1.23 2.14.39.27.84.43 1.32.48.39.04.78.02 1.16-.07.74-.17 1.39-.62 1.81-1.24.31-.46.47-1.01.48-1.57V.02h3.28z',
    ],
  },
] as const;

const IG_GRAD_ID = 'footer-social-gr-ig';

function appendLinearGradient(
  defs: SVGDefsElement,
  id: string,
  stops: readonly { offset: string; color: string }[],
  x1: string,
  y1: string,
  x2: string,
  y2: string,
): void {
  const lg = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  lg.setAttribute('id', id);
  lg.setAttribute('x1', x1);
  lg.setAttribute('y1', y1);
  lg.setAttribute('x2', x2);
  lg.setAttribute('y2', y2);
  lg.setAttribute('gradientUnits', 'userSpaceOnUse');
  for (const { offset, color } of stops) {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('offset', offset);
    stop.setAttribute('stop-color', color);
    lg.appendChild(stop);
  }
  defs.appendChild(lg);
}

export function createFooterSocialSvg(
  brand: FooterSocialBrand,
  paths: readonly string[],
): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('footer__social-svg');

  if (brand === 'instagram') {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    appendLinearGradient(
      defs,
      IG_GRAD_ID,
      [
        { offset: '0%', color: '#833ab4' },
        { offset: '45%', color: '#fd1d1d' },
        { offset: '100%', color: '#fcb045' },
      ],
      '2',
      '22',
      '22',
      '2',
    );
    svg.appendChild(defs);
    for (const d of paths) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', `url(#${IG_GRAD_ID})`);
      svg.appendChild(path);
    }
  } else if (brand === 'tiktok') {
    for (const d of paths) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'currentColor');
      svg.appendChild(path);
    }
  } else {
    for (const d of paths) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', '#0a66c2');
      svg.appendChild(path);
    }
  }

  return svg;
}
