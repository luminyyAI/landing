import { FeaturesSection } from '../components/FeaturesSection';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { HighlightsSection } from '../components/HighlightsSection';
import { Navbar } from '../components/Navbar';
import { ValuePropsSection } from '../components/ValuePropsSection';
import type { SiteConfig } from '../config/site.config';
import { MarketingChrome } from '../react/MarketingChrome';

export function HomePage({ config }: { readonly config: SiteConfig }) {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar config={config} />
      <main id="main" className="main">
        <Hero />
        <FeaturesSection />
        <HighlightsSection />
        <ValuePropsSection />
      </main>
      <Footer config={config} />
      <MarketingChrome />
    </div>
  );
}
