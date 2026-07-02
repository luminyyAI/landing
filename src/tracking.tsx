import './styles/main.css';
import { renderApp } from './bootstrap/renderApp';
import { siteConfig } from './config/site.config';
import { TrackingPage } from './pages/TrackingPage';

renderApp(<TrackingPage config={siteConfig} />);
