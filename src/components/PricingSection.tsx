import { useState } from 'react';

interface PricingFeature {
  readonly title: string;
  readonly detail?: string;
}

const FREE_FEATURES: readonly PricingFeature[] = [
  { title: 'iOS & Mac', detail: 'The same app experience on iPhone and Mac' },
  {
    title: 'One linked account',
    detail: 'Trial and free tier let you connect a single bank account or card in one dashboard',
  },
  { title: 'Core insights', detail: 'Spending trends, subscriptions, and cash-flow basics' },
  { title: 'Bank-level security', detail: 'Encryption and controls built for your financial data' },
];

const PLUS_FEATURES: readonly PricingFeature[] = [
  {
    title: 'Builds on your trial week',
    detail:
      'All core syncing and dashboards—Plus adds multiple linked accounts, budgeting, smarter alerts, and limited exports.',
  },
  {
    title: 'Enhanced insights',
    detail: 'Deeper trends, budgets, savings goals, and custom categories',
  },
  {
    title: 'Smart alerts',
    detail: 'Unusual spending, bill reminders, and weekly digest summaries',
  },
  {
    title: 'Limited exports',
    detail: 'Monthly CSV summaries of transactions and balances',
  },
];

const PRO_FEATURES: readonly PricingFeature[] = [
  {
    title: 'Advanced analytics',
    detail: 'Deeper categories, history, and quantitative-style views of your money',
  },
  { title: 'Exports & reporting', detail: 'Take your data with you when you need it' },
  { title: 'Priority support', detail: 'Faster responses from our team when you need help' },
  { title: 'Early access', detail: 'Try new features before they roll out to everyone' },
];

function PhoneGlyph() {
  return (
    <svg className="pricing-card__platform-icon" viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 2H8C6.9 2 6 2.9 6 4v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1.5 2v1h-5V4h5zm-5 16V9h5v11h-5z"
      />
    </svg>
  );
}

function LaptopGlyph() {
  return (
    <svg className="pricing-card__platform-icon" viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 16V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v10H2v2h20v-2h-2zm-6 0H10v-1h4v1zM6 6h12v9H6V6z"
      />
    </svg>
  );
}

function FeatureList({ items }: { readonly items: readonly PricingFeature[] }) {
  return (
    <ul className="pricing-card__list">
      {items.map((item) => (
        <li key={item.title} className="pricing-card__li">
          <span className="pricing-card__check">✓</span>
          <span className="pricing-card__li-text">
            <span className="pricing-card__li-title">{item.title}</span>
            {item.detail ? <span className="pricing-card__li-detail">{item.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Dark three-tier pricing section; id `#pricing`. */
export function PricingSection() {
  const [proYearly, setProYearly] = useState(false);

  return (
    <section id="pricing" className="section pricing-anchor" aria-labelledby="pricing-heading">
      <div className="pricing-dark">
        <div className="pricing-dark__intro">
          <h2 id="pricing-heading" className="pricing-dark__title">
            Pick your plan
          </h2>
          <p className="pricing-dark__strapline">
            We use the same quantitative strategies hedge funds use to power your analytics.
          </p>
          <p className="pricing-dark__lead">
            Start with a 7-day trial, then choose Plus for sharper insights or Pro for hedge-fund-style analytics.
          </p>
        </div>

        <div className="pricing-dark__grid">
          <article className="pricing-card">
            <h3 className="pricing-card__name">Luminy</h3>
            <p className="pricing-card__tagline">7-day trial — explore full Luminy access</p>

            <div className="pricing-card__price-row">
              <span className="pricing-card__price">$0</span>
              <span className="pricing-card__period"> · first week</span>
            </div>

            <p className="pricing-card__bill-note">
              After your trial ends, subscribe to Plus or Pro to continue. Trial and free use are limited to one linked account.
            </p>

            <FeatureList items={FREE_FEATURES} />

            <div className="pricing-card__actions">
              <a className="pricing-card__platform" href="#" aria-label="Download Luminy for iPhone">
                <PhoneGlyph />
                For iPhone
              </a>
              <a className="pricing-card__platform" href="#" aria-label="Download Luminy for Mac">
                <LaptopGlyph />
                For macOS
              </a>
            </div>
          </article>

          <article className="pricing-card pricing-card--plus">
            <div className="pricing-card__name-row">
              <h3 className="pricing-card__name">Luminy</h3>
              <span className="pricing-card__badge pricing-card__badge--plus">PLUS</span>
            </div>
            <p className="pricing-card__tagline">More control for serious personal finance</p>

            <div className="pricing-card__price-row">
              <span className="pricing-card__price">$6.99</span>
              <span className="pricing-card__period">/month</span>
            </div>

            <p className="pricing-card__bill-note">Cancel anytime. Taxes may apply.</p>

            <FeatureList items={PLUS_FEATURES} />

            <a className="pricing-card__cta pricing-card__cta--plus" href="#">
              Subscribe to Plus
            </a>
          </article>

          <article className="pricing-card pricing-card--pro">
            <div className="pricing-card__name-row">
              <h3 className="pricing-card__name">Luminy</h3>
              <span className="pricing-card__badge">PRO</span>
            </div>
            <p className="pricing-card__tagline">Everything in Plus, leveled up</p>

            <div className="pricing-card__billing" role="group" aria-label="Billing period">
              <button
                type="button"
                className={`pricing-card__billing-opt${!proYearly ? ' pricing-card__billing-opt--active' : ''}`}
                aria-pressed={!proYearly}
                onClick={() => setProYearly(false)}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`pricing-card__billing-opt${proYearly ? ' pricing-card__billing-opt--active' : ''}`}
                aria-pressed={proYearly}
                onClick={() => setProYearly(true)}
              >
                1 year
              </button>
            </div>

            <div className="pricing-card__price-row">
              <span className="pricing-card__price">{proYearly ? '$140' : '$14.99'}</span>
              <span className="pricing-card__period">{proYearly ? '/year' : '/month'}</span>
            </div>

            <p className={`pricing-card__price-equiv${proYearly ? '' : ' pricing-card__price-equiv--hidden'}`}>
              About $11.67/mo billed annually
            </p>

            <p className="pricing-card__bill-note">
              {proYearly ? 'Billed annually. Cancel anytime. Taxes may apply.' : 'Cancel anytime. Taxes may apply.'}
            </p>

            <FeatureList items={PRO_FEATURES} />

            <a className="pricing-card__cta" href="#">
              Start free trial
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
