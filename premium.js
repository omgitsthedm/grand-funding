/* Grand Funding — premium interactions: scroll reveal, nav scroll state */
if (!navigator.webdriver) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Scroll-progress nav state — rAF-gated scrollY read
  const header = document.querySelector('.header');
  if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
    }, { passive: true });
  }

  // Intersection-observer scroll reveal — deferred to idle
  if (!reduced && 'IntersectionObserver' in window) {
    const initReveals = () => {
      const autoTargets = [
        '.section-header', '.story-content', '.story-highlight',
        '.featured-grid', '.deals-grid', '.values-grid', '.reasons-grid', '.services-grid',
        '.fun-facts-grid', '.logan-content', '.cta-content', '.deals-stats',
        '.glossary-controls', '.glossary-panels', '.footer-main'
      ];
      for (const sel of autoTargets) {
        for (const el of document.querySelectorAll(sel)) {
          if (el.classList.contains('reveal') || el.classList.contains('reveal-stagger')) continue;
          const isGrid = /grid|stats|columns/.test(sel);
          el.classList.add(isGrid ? 'reveal-stagger' : 'reveal');
        }
      }

      const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      for (const el of document.querySelectorAll('.reveal,.reveal-stagger')) {
        el.classList.add('js-reveal-init');
        io.observe(el);
      }
    };

    // Defer to idle so reveal setup doesn't block first paint / interactive
    const run = () => (window.requestIdleCallback ?? window.setTimeout)(initReveals, { timeout: 500 });
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  }
}
