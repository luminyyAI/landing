import type { SiteConfig } from '../config/site.config';
import { LEGAL_PAGE_CONTENT, type LegalPageId } from '../legal/copy';
import { PageShell } from '../layout/PageShell';

export function LegalDocumentPage({
  config,
  pageId,
}: {
  readonly config: SiteConfig;
  readonly pageId: LegalPageId;
}) {
  const { titleId, html } = LEGAL_PAGE_CONTENT[pageId];

  return (
    <PageShell config={config} mainClassName="main legal-page">
      <article className="legal-prose container" aria-labelledby={titleId} dangerouslySetInnerHTML={{ __html: html }} />
    </PageShell>
  );
}
