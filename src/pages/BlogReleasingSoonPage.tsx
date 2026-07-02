import { useEffect } from 'react';
import type { SiteConfig } from '../config/site.config';
import { PageShell } from '../layout/PageShell';

export function BlogReleasingSoonPage({ config }: { readonly config: SiteConfig }) {
  useEffect(() => {
    document.body.classList.add('blog-chrome');
    return () => document.body.classList.remove('blog-chrome');
  }, []);

  return (
    <PageShell config={config} appClassName="app blog-app" mainClassName="main blog-post-page">
      <article className="blog-article container">
        <a className="blog-article__back" href="blog.html">
          ← Blog
        </a>
        <p className="blog-article__tag">Product</p>
        <h1 className="blog-article__title">Releasing soon</h1>
        <div className="blog-article__body">
          <p className="blog-article__p">
            We plan to launch Luminy on the App Store for iPhone first, with a focused, native experience for tracking accounts and insights on the go. A polished desktop version for Mac will follow, so you can review cash flow, subscriptions, and analytics on a larger canvas when it suits you. Our roadmap targets both the iOS App Store release and the Mac build for the desktop by June 2026. Until then, we are hardening security, refining onboarding, and making sure linking and analytics feel fast and trustworthy before we open downloads to everyone.
          </p>
        </div>
      </article>
    </PageShell>
  );
}
