import type { ReactNode } from 'react';
import type { SiteConfig } from '../config/site.config';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { MarketingChrome } from '../react/MarketingChrome';

export interface PageShellProps {
  readonly config: SiteConfig;
  readonly appClassName?: string;
  readonly mainClassName?: string;
  readonly children: ReactNode;
}

export function PageShell({ config, appClassName = 'app', mainClassName = 'main', children }: PageShellProps) {
  return (
    <div className={appClassName}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar config={config} />
      <main id="main" className={mainClassName}>
        {children}
      </main>
      <Footer config={config} />
      <MarketingChrome />
    </div>
  );
}
