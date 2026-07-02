import logoUrl from '../../images/luminy-removebg.png';

/** One column inside the Features hover mega menu. */
export interface SiteNavMegaColumn {
  readonly title: string;
  readonly description: string;
  /** When set with no `items`, the column is a single link (e.g. Tracking → feature page). */
  readonly href?: string;
  /** Non-clickable column; shows a “Coming soon” badge (e.g. Discovery). */
  readonly comingSoon?: boolean;
  readonly items: readonly string[];
}

export interface SiteNavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  /** Copies support email + shows toast instead of navigating. */
  readonly copySupportEmail?: boolean;
  /** Desktop hover mega menu (e.g. Features). Hidden on small screens; link still works. */
  readonly megaMenu?: {
    readonly columns: readonly SiteNavMegaColumn[];
  };
}

export interface SiteNavAuth {
  readonly login: SiteNavItem;
  readonly signup: SiteNavItem;
}

export interface SiteFooterLink {
  readonly label: string;
  readonly href: string;
  /** Copies support email + shows toast instead of navigating. */
  readonly copySupportEmail?: boolean;
}

export interface SiteFooterColumn {
  readonly heading: string;
  readonly links: readonly SiteFooterLink[];
}

export interface SiteConfig {
  readonly brandName: string;
  readonly logoSrc: string;
  readonly logoAlt: string;
  /** Top of landing — use `index.html#top` so nav/footer work from multi-page routes like `privacy.html`. */
  readonly homeHref: string;
  readonly navItems: readonly SiteNavItem[];
  readonly navAuth: SiteNavAuth;
  readonly footerColumns: readonly SiteFooterColumn[];
  readonly copyright: string;
}

export const siteConfig: SiteConfig = {
  brandName: 'Luminy',
  logoSrc: logoUrl,
  logoAlt: 'Luminy logo',
  homeHref: 'index.html#top',
  navItems: [
    { id: 'home', label: 'Home', href: 'index.html#top' },
    {
      id: 'features',
      label: 'Features',
      href: 'index.html#features',
      megaMenu: {
        columns: [
          {
            title: 'Tracking',
            description: 'Sync all accounts and transactions in one place.',
            href: 'tracking.html',
            items: [
              'Bank Accounts',
              'Credit Cards',
              'Loans',
              'Investment Brokerages',
              'Real Estate',
              'Savings',
            ],
          },
          {
            title: 'Analytics',
            description: 'Advanced predictive financial analytics.',
            href: 'index.html#features',
            items: [
              'Spending Analytics',
              'Cash Flow',
              'Forecasting',
              'Risk Metrics',
              'Portfolio Insights',
              'AI Insights',
            ],
          },
          {
            title: 'AI Intelligence',
            description: 'AI-powered financial insights in real time.',
            href: 'index.html#features',
            items: ['Financial Q&A', 'Recommendations', 'Summaries', 'Subscription Intelligence'],
          },
          {
            title: 'Discovery',
            description:
              "We've collaborated with multi-state realtors and financial professionals to provide monthly financial tips proven to amplify your financial growth.",
            comingSoon: true,
            items: [],
          },
        ],
      },
    },
    { id: 'support', label: 'Support', href: 'faq.html' },
    { id: 'pricing', label: 'Pricing', href: 'pricing.html' },
    { id: 'download', label: 'Download', href: 'index.html#download' },
  ],
  navAuth: {
    login: { id: 'login', label: 'Login', href: '#' },
    signup: { id: 'signup', label: 'Sign up', href: '#' },
  },
  footerColumns: [
    {
      heading: 'Product',
      links: [
        { label: 'Pricing', href: 'pricing.html' },
        { label: 'Demo', href: '#' },
        { label: 'Download for iOS', href: '#' },
        { label: 'Download for Mac', href: '#' },
      ],
    },
    {
      heading: 'About',
      links: [
        { label: 'About us', href: '#' },
        { label: 'Features', href: 'index.html#features' },
        { label: 'Blog', href: 'blog.html' },
        { label: 'Suggestions', href: '#', copySupportEmail: true },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy', href: 'privacy.html' },
        { label: 'Terms of use', href: 'terms.html' },
        { label: 'Cookie Policy', href: 'cookie-policy.html' },
        { label: 'Data policy', href: 'data-policy.html' },
      ],
    },
    {
      heading: 'Support',
      links: [
        { label: 'Help Center', href: '#' },
        { label: 'Documentation', href: '#' },
        { label: 'FAQ', href: 'faq.html' },
        { label: 'Contact us', href: '#', copySupportEmail: true },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} Luminy. All rights reserved.`,
};
