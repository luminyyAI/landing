import { useEffect } from 'react';
import { startMarketingChrome, stopMarketingChrome } from '../ui/startMarketingChrome';

/**
 * Ambient chrome (scroll/nav styling, support-email copy helpers).
 */
export function MarketingChrome(): null {
  useEffect(() => {
    startMarketingChrome();
    return () => stopMarketingChrome();
  }, []);

  return null;
}
