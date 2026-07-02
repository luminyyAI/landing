import { ScrollAmbientController } from './ScrollAmbientController';
import { NavbarScrollAppearanceController } from './NavbarScrollAppearanceController';
import { SupportEmailCopyController } from './supportEmailCopy';

let scrollAmbient: ScrollAmbientController | null = null;
let navAppearance: NavbarScrollAppearanceController | null = null;
let supportCopy: SupportEmailCopyController | null = null;

export function stopMarketingChrome(): void {
  scrollAmbient?.stop();
  navAppearance?.stop();
  supportCopy?.stop();
  scrollAmbient = null;
  navAppearance = null;
  supportCopy = null;
}

/**
 * Ambient scroll background, navbar scroll styling, and Contact-us email copy.
 * Pair with {@link stopMarketingChrome} in React effect cleanup (Strict Mode safe).
 */
export function startMarketingChrome(): void {
  stopMarketingChrome();

  scrollAmbient = new ScrollAmbientController();
  scrollAmbient.start();

  navAppearance = new NavbarScrollAppearanceController();
  navAppearance.start();

  supportCopy = new SupportEmailCopyController();
  supportCopy.start();
}
