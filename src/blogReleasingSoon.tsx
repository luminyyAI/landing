import './styles/main.css';
import { renderApp } from './bootstrap/renderApp';
import { siteConfig } from './config/site.config';
import { BlogReleasingSoonPage } from './pages/BlogReleasingSoonPage';

renderApp(<BlogReleasingSoonPage config={siteConfig} />);
