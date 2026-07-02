import { FaqSection } from '../components/FaqSection';
import type { SiteConfig } from '../config/site.config';
import { PageShell } from '../layout/PageShell';

export function FaqPage({ config }: { readonly config: SiteConfig }) {
  return (
    <PageShell config={config} mainClassName="main faq-page">
      <FaqSection />
    </PageShell>
  );
}
