(() => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrained = Boolean(
    motionQuery?.matches
    || connection?.saveData
    || ['slow-2g', '2g'].includes(connection?.effectiveType)
    || (navigator.deviceMemory && navigator.deviceMemory <= 2)
  );

  root.dataset.experienceMode = constrained ? 'still' : 'motion';

  const revealTargets = [...document.querySelectorAll(
    '[data-gd-reveal], .gd-home > section:not(.gd-hero), .gd-funded-story'
  )];
  if (!constrained && 'IntersectionObserver' in window && revealTargets.length) {
    root.classList.add('gd-motion-ready');
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealTargets.forEach(target => revealObserver.observe(target));
  } else {
    revealTargets.forEach(target => target.classList.add('is-visible'));
  }

  const dealPath = document.querySelector('[data-deal-path]');
  if (dealPath && !constrained && 'IntersectionObserver' in window) {
    const pathObserver = new IntersectionObserver(entries => {
      const entry = entries.find(candidate => candidate.isIntersecting);
      if (!entry) return;
      dealPath.classList.add('is-drawn');
      pathObserver.disconnect();
    }, { threshold: 0.45 });
    pathObserver.observe(dealPath);
  } else {
    dealPath?.classList.add('is-drawn');
  }

  document.querySelectorAll('[data-deal-docket]').forEach(docket => {
    const options = [...docket.querySelectorAll('[data-docket-option]')];
    const summary = docket.querySelector('[data-docket-summary]');
    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(candidate => {
          const selected = candidate === option;
          candidate.classList.toggle('is-active', selected);
          candidate.setAttribute('aria-pressed', String(selected));
        });
        if (summary) summary.textContent = option.dataset.docketCopy || '';
      });
    });
  });

  const consent = document.querySelector('#consent-banner');
  const syncConsentOffset = () => {
    const open = consent?.classList.contains('is-open');
    root.dataset.consentOpen = String(Boolean(open));
    root.style.setProperty('--gd-consent-offset', open ? `${consent.getBoundingClientRect().height}px` : '0px');
  };
  if (consent) {
    syncConsentOffset();
    new MutationObserver(syncConsentOffset).observe(consent, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    window.addEventListener('resize', syncConsentOffset, { passive: true });
  }

  const headerToggle = document.querySelector('.mobile-menu-toggle');
  const primaryNav = document.querySelector('.nav-list');
  if (headerToggle && primaryNav) {
    const firstLink = primaryNav.querySelector('a');
    headerToggle.addEventListener('click', () => {
      requestAnimationFrame(() => {
        if (headerToggle.getAttribute('aria-expanded') === 'true') firstLink?.focus();
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || headerToggle.getAttribute('aria-expanded') !== 'true') return;
      headerToggle.click();
      headerToggle.focus();
    }, { capture: true });
  }

  const reducedBehavior = () => motionQuery?.matches ? 'auto' : 'smooth';
  if (motionQuery?.matches) {
    document.addEventListener('click', event => {
      const anchor = event.target.closest?.('a[href^="#"]');
      const backToTop = event.target.closest?.('[data-back-to-top]');
      const storyStep = event.target.closest?.('.story-step[data-step]');
      if (anchor) {
        const selector = anchor.getAttribute('href');
        const target = selector && selector !== '#' ? document.querySelector(selector) : null;
        if (!target) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else if (backToTop) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else if (storyStep) {
        const target = document.querySelector(`.story-card[data-step="${storyStep.dataset.step}"]`);
        if (!target) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        target.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }, { capture: true });
  }

  document.querySelectorAll('[data-grand-scroll]').forEach(control => {
    control.addEventListener('click', event => {
      const selector = control.getAttribute('href');
      if (!selector?.startsWith('#')) return;
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedBehavior(), block: 'start' });
    });
  });

  const sticky = document.querySelector('[data-sticky-cta]');
  const pageRoute = document.body.dataset.grandRoute || '';
  if (sticky && /^(?:apply|contact|thanks|thanks-contact)(?:\.html)?$/.test(pageRoute)) {
    sticky.hidden = true;
  }
})();
