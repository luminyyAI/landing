import { useEffect } from 'react';
import type { SiteConfig } from '../config/site.config';
import { PageShell } from '../layout/PageShell';

export function BlogPage({ config }: { readonly config: SiteConfig }) {
  useEffect(() => {
    document.body.classList.add('blog-chrome');
    return () => document.body.classList.remove('blog-chrome');
  }, []);

  return (
    <PageShell config={config} appClassName="app blog-app" mainClassName="main blog-page">
      <header className="blog-hero container">
        <h1 className="blog-hero__title">Updates from Luminy</h1>
        <p className="blog-hero__sub">
          Product news, launches, and how we are building a calmer way to see your money — with the same quantitative rigor you
          deserve in one place.
        </p>
      </header>

      <div className="blog-grid-wrap container">
        <div className="blog-grid" aria-label="Articles">
          <a className="blog-card" href="blog-releasing-soon.html">
            <div className="blog-card__media blog-card__media--launch" aria-hidden="true" />
            <div className="blog-card__body">
              <h2 className="blog-card__title">Releasing soon</h2>
              <p className="blog-card__tag">Product</p>
            </div>
          </a>
        </div>
      </div>
    </PageShell>
  );
}
