import type { JSX } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export function renderApp(ui: JSX.Element): void {
  const mountPoint = document.getElementById('app');

  if (!mountPoint) {
    throw new Error('Missing #app mount point');
  }

  createRoot(mountPoint).render(<StrictMode>{ui}</StrictMode>);
}
