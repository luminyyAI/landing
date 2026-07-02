import './styles/main.css';
import { renderApp } from './bootstrap/renderApp';
import { siteConfig } from './config/site.config';
import { BlogPage } from './pages/BlogPage';

renderApp(<BlogPage config={siteConfig} />);
