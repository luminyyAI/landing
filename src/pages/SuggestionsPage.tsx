import { useEffect } from 'react';
import { LEGAL_SUPPORT_EMAIL } from '../legal/copy';
import type { SiteConfig } from '../config/site.config';
import { PageShell } from '../layout/PageShell';
import { copySupportEmailAndToast } from '../ui/supportEmailCopy';

export function SuggestionsPage({ config }: { readonly config: SiteConfig }) {
  useEffect(() => {
    queueMicrotask(() => {
      void copySupportEmailAndToast();
    });
  }, []);

  return (
    <PageShell config={config} mainClassName="main suggestions-page">
      <div className="suggestions-layout container">
        <h1 id="suggestions-title" className="suggestions__title">
          Suggestions
        </h1>
        <p className="suggestions__intro">
          Our support address is copied to your clipboard — paste it into your email app to share ideas or feedback. If your browser blocked automatic copy, use the button below.
        </p>
        <p className="suggestions__email-row">
          <span className="suggestions__email">{LEGAL_SUPPORT_EMAIL}</span>
        </p>
        <div className="suggestions__actions">
          <a
            href="#"
            className="suggestions__copy-cta"
            data-copy-support-email=""
            role="button"
            aria-label="Copy support email to clipboard"
          >
            Copy support email
          </a>
        </div>
      </div>
    </PageShell>
  );
}
