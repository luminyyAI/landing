import './styles/main.css';
import { renderApp } from './bootstrap/renderApp';
import { siteConfig } from './config/site.config';
import { PricingPage } from './pages/PricingPage';

renderApp(<PricingPage config={siteConfig} />);
