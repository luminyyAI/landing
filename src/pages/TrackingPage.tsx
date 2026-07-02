import type { SiteConfig } from '../config/site.config';
import { PageShell } from '../layout/PageShell';

const ACCOUNT_TYPES = [
  {
    title: 'Bank accounts',
    detail: 'Checking and savings balances, deposits, and transfers in one timeline.',
  },
  {
    title: 'Credit cards',
    detail: 'Charges, payments, and utilization without jumping between issuer apps.',
  },
  {
    title: 'Loans',
    detail: 'Mortgages, auto, and personal loans with principal and payment history.',
  },
  {
    title: 'Investment Brokerages',
    detail: 'Investment accounts alongside everyday cash so net worth stays current.',
  },
  {
    title: 'Real estate',
    detail: 'Property values and related liabilities for a fuller balance sheet.',
  },
  {
    title: 'Savings',
    detail: 'Goals and cash reserves tracked next to your spending accounts.',
  },
] as const;

export function TrackingPage({ config }: { readonly config: SiteConfig }) {
  return (
    <PageShell config={config} mainClassName="main feature-detail-page">
      <section className="feature-detail" aria-labelledby="tracking-title">
        <div className="container feature-detail__container">
          <a className="feature-detail__back" href="index.html#features">
            ← Features
          </a>

          <span className="section__label">Tracking</span>
          <h1 id="tracking-title" className="feature-detail__title">
            All your money, synced in one place
          </h1>
          <p className="feature-detail__lead">
            Luminy Tracking connects the accounts you rely on so balances and transactions stay unified—without spreadsheets or switching between apps.
          </p>

          <div className="feature-detail__grid">
            {ACCOUNT_TYPES.map((item) => (
              <article key={item.title} className="feature-detail__card">
                <h2 className="feature-detail__card-title">{item.title}</h2>
                <p className="feature-detail__card-body">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="feature-detail__closing">
            <h2 className="feature-detail__closing-title">Built for clarity, not clutter</h2>
            <p className="feature-detail__closing-body">
              Link only what you need, refresh on a schedule you trust, and see every account in a single dashboard designed for day-to-day decisions—not quarterly exports.
            </p>
            <a className="feature-detail__cta" href="index.html#top">
              Get started with Luminy
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
