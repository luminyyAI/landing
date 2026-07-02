import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        privacy: './privacy.html',
        terms: './terms.html',
        cookiePolicy: './cookie-policy.html',
        dataPolicy: './data-policy.html',
        suggestions: './suggestions.html',
        pricing: './pricing.html',
        faq: './faq.html',
        tracking: './tracking.html',
        blog: './blog.html',
        blogReleasingSoon: './blog-releasing-soon.html',
      },
    },
  },
});
