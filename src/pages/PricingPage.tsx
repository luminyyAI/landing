import type { SiteConfig } from '../config/site.config';
import { PageShell } from '../layout/PageShell';
import { PricingSection } from '../components/PricingSection';

export function PricingPage({ config }: { readonly config: SiteConfig }) {
  return (
    <PageShell config={config} mainClassName="main pricing-page">
      <PricingSection />
    </PageShell>
  );
}
