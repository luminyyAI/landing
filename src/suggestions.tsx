import './styles/main.css';
import { renderApp } from './bootstrap/renderApp';
import { siteConfig } from './config/site.config';
import { SuggestionsPage } from './pages/SuggestionsPage';

renderApp(<SuggestionsPage config={siteConfig} />);
