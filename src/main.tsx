import './styles/main.css';
import { renderApp } from './bootstrap/renderApp';
import { siteConfig } from './config/site.config';
import { HomePage } from './pages/HomePage';

renderApp(<HomePage config={siteConfig} />);
