import EmblaCarousel from 'embla-carousel';
import { useEffect, useRef } from 'react';

interface IncludeSlide {
  readonly cardTitle: string;
  readonly cardBody: string;
}

const INCLUDES: readonly IncludeSlide[] = [
  {
    cardTitle: 'All financial accounts in one place',
    cardBody:
      'Connect banks and institutions so balances, transactions, and history stay unified in one dashboard.',
  },
  {
    cardTitle: 'Subscription tracking',
    cardBody: 'Monitor recurring payments, upcoming renewals, and spending patterns automatically.',
  },
  {
    cardTitle: 'Quantitative analytics & spending insights',
    cardBody: 'Visualize monthly spending, category breakdowns, and cash flow trends at a glance.',
  },
  {
    cardTitle: 'AI & ML implementations for personalization',
    cardBody: 'Get intelligent summaries, unusual activity detection, and personalized analytics.',
  },
];

function SlideDash() {
  return (
    <div
      className="includes__slide"
      dangerouslySetInnerHTML={{
        __html: `
      <div class="inc-screen inc-screen--dash">
        <p class="inc-h">Overview</p>
        <div class="inc-bal">$184,320</div>
        <p class="inc-sub">Total balance</p>
        <div class="inc-row">
          <div class="inc-pill"><span class="inc-pill__l">Checking</span><span class="inc-pill__v">$42.1k</span></div>
          <div class="inc-pill"><span class="inc-pill__l">Savings</span><span class="inc-pill__v">$98.2k</span></div>
        </div>
        <div class="inc-list">
          <div class="inc-tx"><span class="inc-tx__n">Recent</span><span class="inc-tx__a">−$84</span></div>
          <div class="inc-tx inc-tx--pos"><span class="inc-tx__n">Income</span><span class="inc-tx__a">+$6,250</span></div>
        </div>
      </div>
    `,
      }}
    />
  );
}

function SlideSubs() {
  return (
    <div
      className="includes__slide"
      dangerouslySetInnerHTML={{
        __html: `
      <div class="inc-screen inc-screen--subs">
        <p class="inc-h">Subscriptions</p>
        <p class="inc-lead">$287 / month</p>
        <div class="inc-subrow"><span class="inc-subrow__n">Cloud storage</span><span class="inc-subrow__p">$12</span></div>
        <div class="inc-subrow"><span class="inc-subrow__n">Music</span><span class="inc-subrow__p">$10.99</span></div>
        <div class="inc-subrow"><span class="inc-subrow__n">Fitness</span><span class="inc-subrow__p">$9</span></div>
        <div class="inc-banner">Renewal in 5 days</div>
      </div>
    `,
      }}
    />
  );
}

function SlideSpending() {
  return (
    <div
      className="includes__slide"
      dangerouslySetInnerHTML={{
        __html: `
      <div class="inc-screen inc-screen--chart">
        <p class="inc-h">Spending</p>
        <p class="inc-lead">This month</p>
        <div class="inc-bars">
          <div class="inc-bar" style="--h:38%"></div>
          <div class="inc-bar" style="--h:62%"></div>
          <div class="inc-bar" style="--h:45%"></div>
          <div class="inc-bar inc-bar--hi" style="--h:78%"></div>
          <div class="inc-bar" style="--h:52%"></div>
        </div>
        <div class="inc-legend"><span>Groceries</span><span>Dining</span><span>Transit</span></div>
      </div>
    `,
      }}
    />
  );
}

function SlideAi() {
  return (
    <div
      className="includes__slide"
      dangerouslySetInnerHTML={{
        __html: `
      <div class="inc-screen inc-screen--ai">
        <p class="inc-h">Luminy</p>
        <div class="inc-chat">
          <div class="inc-bubble inc-bubble--bot">Your restaurant spend is 18% above usual this month.</div>
          <div class="inc-bubble inc-bubble--user">What should I trim?</div>
          <div class="inc-bubble inc-bubble--bot">Start with dining out — you have 4 charges over $60.</div>
        </div>
        <div class="inc-compose"><span class="inc-compose__ph">Ask anything…</span></div>
      </div>
    `,
      }}
    />
  );
}

export function FeaturesSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = rootRef.current;
    if (!section) return;

    const viewport = section.querySelector<HTMLElement>('[data-includes-embla-viewport]');
    const dotsRoot = section.querySelector<HTMLElement>('[data-includes-dots]');
    const cards = [...section.querySelectorAll<HTMLButtonElement>('[data-includes-card]')];
    if (!viewport || !dotsRoot) return;

    const embla = EmblaCarousel(viewport, {
      loop: true,
      duration: 34,
    });

    const scrollToIndex = (i: number) => {
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

    const setActiveCard = (index: number) => {
      cards.forEach((btn, i) => {
        const on = i === index;
        btn.classList.toggle('includes-card--active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      renderDots();
    };

    const cardListeners = cards.map((btn, i) => {
      const listener = (): void => scrollToIndex(i);
      btn.addEventListener('click', listener);
      return { btn, listener };
    });

    const onSelect = (): void => {
      setActiveCard(embla.selectedScrollSnap());
    };
    embla.on('select', onSelect);
    embla.on('reInit', renderDots);

    setActiveCard(embla.selectedScrollSnap());

    return () => {
      cardListeners.forEach(({ btn, listener }) => btn.removeEventListener('click', listener));
      embla.off('select', onSelect);
      embla.off('reInit', renderDots);
      embla.destroy();
    };
  }, []);

  return (
    <section ref={rootRef} id="features" className="section features includes">
      <div className="container includes">
        <h2 className="includes__headline">What does Luminy include?</h2>

        <div className="includes__layout">
          <div className="includes__phone-col">
            <div className="includes__phone-wrap">
              <div className="includes__device">
                <div className="includes__notch" />
                <div className="includes__screen">
                  <div className="includes__embla-viewport" data-includes-embla-viewport="">
                    <div className="includes__embla-container">
                      <SlideDash />
                      <SlideSubs />
                      <SlideSpending />
                      <SlideAi />
                    </div>
                  </div>
                </div>
              </div>
              <div className="includes__dots" data-includes-dots="" />
            </div>
          </div>

          <div className="includes__cards-col">
            {INCLUDES.map((item, index) => (
              <button
                key={item.cardTitle}
                type="button"
                className={`includes-card${index === 0 ? ' includes-card--active' : ''}`}
                data-includes-card=""
                data-index={String(index)}
                aria-pressed={index === 0 ? 'true' : 'false'}
              >
                <span className="includes-card__title">{item.cardTitle}</span>
                <p className="includes-card__body">{item.cardBody}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
