/**
 * Toggles `nav--scrolled` (hairline + frosted background) only after the hero
 * dashboard mock (`#hero-mock`) scrolls up far enough to meet the navbar — i.e.
 * when the nav links would visually intersect the top of that image.
 * Other pages fall back to a small scroll offset.
 */
export class NavbarScrollAppearanceController {
  private readonly header: HTMLElement;

  private readonly scrolledClass = 'nav--scrolled';

  private readonly heroMockSelector: string;

  private scheduledFrame = 0;

  public constructor(
    headerSelector = 'header.nav',
    /** Hero UI mock — see `Hero.ts` (`id="hero-mock"`). */
    heroMockSelector = '#hero-mock',
  ) {
    const el = document.querySelector(headerSelector);
    if (!el) {
      throw new Error(`Navbar not found: ${headerSelector}`);
    }
    this.header = el as HTMLElement;
    this.heroMockSelector = heroMockSelector;
  }

  public start(): void {
    this.sync();
    requestAnimationFrame(() => this.sync());
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
    window.addEventListener('pageshow', this.onPageshow);
  }

  public stop(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    window.removeEventListener('pageshow', this.onPageshow);
    if (this.scheduledFrame !== 0) {
      cancelAnimationFrame(this.scheduledFrame);
      this.scheduledFrame = 0;
    }
  }

  private readonly onPageshow = (): void => {
    this.sync();
  };

  private readonly onScroll = (): void => {
    if (this.scheduledFrame !== 0) {
      return;
    }
    this.scheduledFrame = requestAnimationFrame(() => {
      this.scheduledFrame = 0;
      this.sync();
    });
  };

  private sync(): void {
    const mock = document.querySelector<HTMLElement>(this.heroMockSelector);
    if (!mock) {
      this.header.classList.toggle(this.scrolledClass, window.scrollY > 8);
      return;
    }

    const navRect = this.header.getBoundingClientRect();
    const mockRect = mock.getBoundingClientRect();
    /** Top of mock has entered the navbar band (same vertical region as the link row). */
    const mockCollidesNav = mockRect.top <= navRect.bottom + 1;

    this.header.classList.toggle(this.scrolledClass, mockCollidesNav);
  }
}
