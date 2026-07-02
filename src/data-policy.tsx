import './styles/main.css';
import { renderApp } from './bootstrap/renderApp';
import { siteConfig } from './config/site.config';
import { LegalDocumentPage } from './pages/LegalDocumentPage';

renderApp(<LegalDocumentPage config={siteConfig} pageId="data" />);
