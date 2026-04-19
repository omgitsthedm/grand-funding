/* ===================================
   GRAND FUNDING V12 — Main JS
   Vanilla, zero dependencies
   =================================== */

// ---- Hero Video: only load on desktop (saves 3MB on mobile) ----
(() => {
    if (window.innerWidth > 720) {
        const video = document.querySelector('.hero-video');
        if (video && !video.querySelector('source')) {
            const src = document.createElement('source');
            src.src = '/images/arizona-hero.mp4';
            src.type = 'video/mp4';
            video.appendChild(src);
            video.load();
        }
    }
})();

// ---- Mobile Menu Toggle ----
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navList = document.querySelector('.nav-list');

if (mobileMenuToggle && navList) {
    if (!navList.id) navList.id = 'primary-nav';
    mobileMenuToggle.setAttribute('aria-controls', navList.id);
    mobileMenuToggle.setAttribute('aria-expanded', 'false');

    mobileMenuToggle.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active', isOpen);
        mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    const closeMenu = () => {
        navList.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    };

    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    document.addEventListener('click', (e) => {
        if (!navList.classList.contains('active')) return;
        if (navList.contains(e.target) || mobileMenuToggle.contains(e.target)) return;
        closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}

// ---- FAQ Accordion ----
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    question.setAttribute('aria-expanded', 'false');

    const toggle = () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(faq => {
            faq.classList.remove('active');
            const q = faq.querySelector('.faq-question');
            if (q) q.setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        }
    };

    question.addEventListener('click', toggle);
    question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
});

// ---- Smooth Scroll for on-page anchors ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const sel = this.getAttribute('href');
        if (!sel || sel === '#') return;
        const target = document.querySelector(sel);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// ---- CTA Button Click Handlers (non-link buttons) ----
document.querySelectorAll('.cta-btn, .btn-primary').forEach(el => {
    if (el.tagName.toLowerCase() === 'a') return;
    el.setAttribute('type', 'button');
    el.addEventListener('click', (e) => {
        e.preventDefault();
        const contactSection = document.querySelector('#contact');
        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
        else window.location.href = '/apply.html';
    });
});

// ---- Header Scroll Effect ----
let lastScroll = 0;
const header = document.querySelector('.header');
if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.pageYOffset || 0;
            if (y <= 0) {
                header.classList.remove('scroll-up');
            } else if (y > lastScroll && !header.classList.contains('scroll-down')) {
                header.classList.remove('scroll-up');
                header.classList.add('scroll-down');
            } else if (y < lastScroll && header.classList.contains('scroll-down')) {
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
            }
            lastScroll = y;
            ticking = false;
        });
    }, { passive: true });
}

// ---- Phone Number Click Tracking ----
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
        if (typeof gtag === 'function') {
            gtag('event', 'phone_click', { event_category: 'contact', event_label: link.href });
        }
    });
});

// ---- Scroll Reveal (single IntersectionObserver) ----
(() => {
    // CSS default for .reveal is now visible. We only hide before observing
    // by adding .js-reveal-init. For bots/reduced-motion, don't hide at all.
    if (navigator.webdriver) return;  // no animation for bots — already visible
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;  // already visible

    // NOTE: 'section' REMOVED — section wrappers can be taller than viewport,
    // making intersectionRatio never exceed threshold → element stays hidden forever.
    // Only tag card-level elements that are viewport-sized or smaller.
    const selectors = [
        '.product-section', '.blog-post', '.service-card',
        '.feature-card', '.fun-fact-card', '.cta-card', '.value-item',
        '.reason-card', '.faq-item', '.product-card', '.story-card',
        '.fun-fact', '.process-step', '.blog-card', '.contact-card',
        '.team-card', '.timeline-item', '.apply-step',
        '[data-reveal]'
    ];

    const els = document.querySelectorAll(selectors.join(','));
    // Skip above-fold elements: .hero, .hero-content, and the first <section>
    // (always the hero). Reveal animation on these delays LCP and risks CLS.
    const firstSection = document.querySelector('section');
    els.forEach(el => {
        if (el === firstSection) return;
        if (el.classList.contains('hero') || el.classList.contains('hero-content')) return;
        if (el.closest('.hero')) return;
        el.classList.add('reveal', 'js-reveal-init');  // js-reveal-init hides via CSS until is-visible added
    });
    // Also mark any hardcoded .reveal / .reveal-stagger elements as init
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
        el.classList.add('js-reveal-init');
    });

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

    // Observe BOTH the selector-list elements AND any hardcoded .reveal/.reveal-stagger
    // elements. Previously only `els` were observed, so hardcoded reveals got
    // `.js-reveal-init` added (hiding them) but never `.is-visible` (keeping them hidden).
    const allReveals = new Set([
        ...els,
        ...document.querySelectorAll('.reveal, .reveal-stagger')
    ]);
    allReveals.forEach(el => io.observe(el));
})();

// ---- Header/Nav scrolled state + scroll progress ----
(() => {
    const headerEl = document.querySelector('.header');
    const navbarEl = document.querySelector('.navbar');
    const progressBar = document.querySelector('.scroll-progress__bar');
    const doc = document.documentElement;
    let ticking = false;
    // Lazily initialized on first call so we never read scrollHeight immediately
    // after the scroll-reveal IIFE wrote .reveal classes (avoids forced reflow).
    let scrollableHeight = 0;

    const onScroll = () => {
        const y = window.scrollY || 0;
        // Read layout FIRST — before any DOM writes — to avoid forced reflow.
        // Lazy-init: only reads after layout is settled (first rAF or scroll event).
        if (!scrollableHeight) scrollableHeight = Math.max(1, doc.scrollHeight - doc.clientHeight);
        const pct = Math.min(100, Math.max(0, (y / scrollableHeight) * 100)).toFixed(2) + '%';
        // Writes after reads
        if (headerEl) headerEl.classList.toggle('is-scrolled', y > 8);
        if (navbarEl) navbarEl.classList.toggle('is-scrolled', y > 8);
        if (progressBar) progressBar.style.width = pct;
    };

    window.addEventListener('resize', () => { scrollableHeight = 0; }, { passive: true });
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { onScroll(); ticking = false; });
    }, { passive: true });
    // No initial onScroll() call: at page load scroll is 0 so progress bar
    // is correctly 0% and header has no scroll state. Avoids forced reflow
    // caused by reading scrollHeight after reveal-class writes (premium.js
    // DOMContentLoaded) have invalidated layout.
})();

// ---- Products page glossary: search + category filters ----
(() => {
    const searchInput = document.querySelector('[data-glossary-search]');
    const filterRow = document.querySelector('[data-glossary-filters]');
    const list = document.querySelector('[data-glossary-list]');
    if (!list) return;

    const panels = Array.from(list.querySelectorAll('.glossary-panel'));
    const entries = Array.from(list.querySelectorAll('.glossary-entry'));
    let activeFilter = 'all';
    let query = '';
    const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

    const renderEmpty = (count) => {
        let empty = list.querySelector('.glossary-empty');
        if (count > 0) { if (empty) empty.remove(); return; }
        if (!empty) {
            empty = document.createElement('div');
            empty.className = 'glossary-empty';
            empty.textContent = 'No matching terms. Try another keyword or category.';
            list.appendChild(empty);
        }
    };

    const apply = () => {
        const q = normalize(query);
        let visible = 0;
        entries.forEach(entry => {
            const panel = entry.closest('.glossary-panel');
            const cat = panel?.getAttribute('data-category') || 'other';
            const text = normalize(`${entry.getAttribute('data-term') || ''} ${entry.textContent}`);
            const ok = ((activeFilter === 'all') || (cat === activeFilter)) && (!q || text.includes(q));
            entry.style.display = ok ? '' : 'none';
            if (ok) visible++;
        });
        panels.forEach(panel => {
            const vis = panel.querySelectorAll('.glossary-entry:not([style*="display: none"])').length;
            panel.style.display = vis ? '' : 'none';
            if (vis && query) panel.open = true;
        });
        renderEmpty(visible);
    };

    if (filterRow) filterRow.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        activeFilter = btn.getAttribute('data-filter') || 'all';
        filterRow.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === btn));
        apply();
    });

    if (searchInput) searchInput.addEventListener('input', () => { query = searchInput.value || ''; apply(); });
    apply();
})();

// ---- Expandable product cards (homepage grid) ----
(() => {
    const toggles = document.querySelectorAll('.product-expand');
    if (!toggles.length) return;

    const setOpen = (card, isOpen) => {
        card.classList.toggle('is-open', isOpen);
        const btn = card.querySelector('.product-expand');
        const panelId = btn?.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : card.querySelector('.product-extra');
        if (btn) btn.setAttribute('aria-expanded', String(isOpen));
        if (panel) {
            panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : '0px';
            panel.setAttribute('aria-hidden', String(!isOpen));
        }
    };

    toggles.forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
        const card = btn.closest('.product-card');
        if (card) setOpen(card, false);

        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            if (!card) return;
            const isOpen = card.classList.contains('is-open');
            document.querySelectorAll('.product-card.is-open').forEach(c => { if (c !== card) setOpen(c, false); });
            setOpen(card, !isOpen);
        });
    });
})();

// ---- Sticky narrative (How it Works) ----
(() => {
    const story = document.querySelector('[data-story]');
    if (!story) return;

    const steps = Array.from(story.querySelectorAll('.story-step'));
    const cards = Array.from(story.querySelectorAll('.story-card'));

    const activate = (step) => {
        steps.forEach(s => s.classList.toggle('is-active', s.dataset.step == step));
        cards.forEach(c => c.setAttribute('data-active', String(c.dataset.step == step)));
    };

    steps.forEach(s => {
        s.addEventListener('click', () => {
            const target = cards.find(c => c.dataset.step == s.dataset.step);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    activate('1');

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) activate(visible[0].target.dataset.step);
    }, { threshold: [0.25, 0.4, 0.55], rootMargin: '-20% 0px -35% 0px' });

    cards.forEach(c => io.observe(c));
})();

// ---- Count-up numbers (fun facts) ----
(() => {
    const els = document.querySelectorAll('[data-counter]');
    if (!els.length) return;

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const format = (v, prefix, suffix) => `${prefix || ''}${Math.round(v).toLocaleString()}${suffix || ''}`;

    const setFinal = (el) => {
        el.textContent = format(Number(el.dataset.to || 0), el.dataset.prefix, el.dataset.suffix);
    };

    if (reduced || !('IntersectionObserver' in window)) { els.forEach(setFinal); return; }

    const animate = (el) => {
        const to = Number(el.dataset.to || 0);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = 900;
        const t0 = performance.now();
        const step = (t) => {
            const p = Math.min(1, (t - t0) / duration);
            el.textContent = format((to * (1 - Math.pow(1 - p, 3))), prefix, suffix);
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animate(entry.target);
            io.unobserve(entry.target);
        });
    }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });

    els.forEach(el => io.observe(el));
})();

// ---- Sticky mobile CTA: hide when contact is visible ----
(() => {
    const cta = document.querySelector('[data-sticky-cta]');
    if (!cta) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const contact = document.querySelector('#contact');
    if (!contact || reduced || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => cta.classList.toggle('is-hidden', entry.isIntersecting));
    }, { threshold: 0.25 });
    io.observe(contact);
})();

// ---- Back to top button ----
(() => {
    const btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;
    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            btn.classList.toggle('is-visible', (window.scrollY || 0) > 700);
            ticking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // No initial onScroll() — scrollY is 0 at load, button already hidden.
    // Avoids forced reflow from reading scrollY before layout settles.
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ---- Products page: sticky section nav + scroll spy ----
(() => {
    const nav = document.querySelector('[data-section-nav]');
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    const setActive = (id) => links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
    if (sections[0]) setActive(sections[0].id);

    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
    }, { threshold: [0.22, 0.35, 0.5], rootMargin: '-15% 0px -70% 0px' });
    sections.forEach(s => io.observe(s));
})();

// ---- Blog page: search + category filters ----
(() => {
    const cardsWrap = document.querySelector('[data-blog-cards]');
    const filterRow = document.querySelector('[data-blog-filters]');
    const searchInput = document.querySelector('[data-blog-search]');
    const countEl = document.querySelector('[data-blog-count]');

    if (cardsWrap) {
        const cards = Array.from(cardsWrap.querySelectorAll('.blog-card'));
        let activeFilter = 'all';
        let query = '';
        const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

        const apply = () => {
            let visible = 0;
            cards.forEach(card => {
                const cat = card.getAttribute('data-category') || 'other';
                const text = normalize(card.textContent);
                const show = ((activeFilter === 'all') || (cat === activeFilter)) && (!query || text.includes(query));
                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });
            if (countEl) countEl.textContent = `${visible} post${visible === 1 ? '' : 's'}`;
        };

        if (filterRow) filterRow.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-filter]');
            if (!btn) return;
            activeFilter = btn.getAttribute('data-filter') || 'all';
            filterRow.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === btn));
            apply();
        });

        if (searchInput) searchInput.addEventListener('input', () => { query = normalize(searchInput.value); apply(); });
        apply();
    }
})();
