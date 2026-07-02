import './styles/main.css';
import { renderApp } from './bootstrap/renderApp';
import { siteConfig } from './config/site.config';
import { FaqPage } from './pages/FaqPage';

renderApp(<FaqPage config={siteConfig} />);
