(() => {
  "use strict";

  const ready = callback => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  };

  const cleanRoute = () => {
    const route = location.pathname
      .replace(/\/index\.html$/i, "/")
      .replace(/\.html$/i, "")
      .replace(/^\/+|\/+$/g, "");
    return route || "home";
  };

  const visibleInViewport = element => {
    const bounds = element.getBoundingClientRect();
    return bounds.bottom > 0 && bounds.top < innerHeight;
  };

  const revealContentReliably = () => {
    const targets = [...document.querySelectorAll(".reveal, .reveal-stagger")];
    if (!targets.length) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const automation = navigator.webdriver === true;
    const show = element => {
      element.classList.add("is-visible");
      if (reducedMotion || automation) element.classList.remove("js-reveal-init");
    };

    if (reducedMotion || automation || !("IntersectionObserver" in window)) {
      targets.forEach(show);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -2% 0px" });

    targets.forEach(element => {
      if (visibleInViewport(element)) show(element);
      else observer.observe(element);
    });

    addEventListener("pageshow", () => {
      targets.filter(visibleInViewport).forEach(show);
    }, { once: true });
  };

  const stabilizeCounters = () => {
    if (!navigator.webdriver && !matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll("[data-counter][data-to]").forEach(counter => {
      const number = Number(counter.dataset.to);
      if (!Number.isFinite(number)) return;
      const value = Number.isInteger(number)
        ? Math.round(number).toLocaleString("en-US")
        : number.toLocaleString("en-US");
      counter.textContent = `${counter.dataset.prefix || ""}${value}${counter.dataset.suffix || ""}`;
      counter.dataset.counterDone = "1";
    });
  };

  const classifyCallsToAction = () => {
    document.querySelectorAll("a[href], button[type='submit']").forEach(control => {
      if (control.dataset.ctaIntent) return;
      const href = control.getAttribute("href") || "";
      const intent = href.startsWith("tel:")
        ? "call"
        : /\/apply(?:\.html)?(?:$|[?#])/.test(href)
          ? "apply"
          : /\/contact(?:\.html)?(?:$|[?#])/.test(href)
            ? "contact"
            : control.matches("button[type='submit']")
              ? "lead-submit"
              : "";
      if (!intent) return;
      const region = control.closest("section, header, footer, [data-sticky-cta]");
      const locationName = region?.dataset.ctaLocation
        || [...(region?.classList || [])].find(name => !/^(?:container|reveal|is-)/.test(name))
        || region?.tagName.toLowerCase()
        || "page";
      control.dataset.ctaIntent = intent;
      control.dataset.ctaLocation = locationName;
    });
  };

  const improveMobileMenuFocus = () => {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const menu = document.querySelector(".nav-list");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      toggle.classList.remove("active");
      menu.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    };

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !menu.classList.contains("active")) return;
      event.preventDefault();
      closeMenu();
    });

    toggle.addEventListener("keydown", event => {
      if (!["Enter", " "].includes(event.key)) return;
      setTimeout(() => {
        if (!menu.classList.contains("active")) return;
        menu.querySelector("a[href]")?.focus();
      });
    });
  };

  const controlStickyCallToAction = () => {
    const sticky = document.querySelector("[data-sticky-cta]");
    if (!sticky) return;

    const route = cleanRoute();
    const disabledRoute = /^(?:apply|contact|thanks(?:-contact)?)(?:\/|$)/.test(route);
    if (disabledRoute) {
      sticky.hidden = true;
      sticky.setAttribute("aria-hidden", "true");
      document.body.classList.remove("has-sticky-cta");
      return;
    }

    document.body.classList.add("has-sticky-cta");
    const activeReasons = new Set();
    const setReason = (reason, active) => {
      if (active) activeReasons.add(reason);
      else activeReasons.delete(reason);
      const suppressed = activeReasons.size > 0;
      sticky.classList.toggle("is-suppressed", suppressed);
      sticky.setAttribute("aria-hidden", String(suppressed));
      sticky.querySelectorAll("a").forEach(link => {
        if (suppressed) link.setAttribute("tabindex", "-1");
        else link.removeAttribute("tabindex");
      });
    };

    const consent = document.getElementById("consent-banner");
    if (consent) {
      let savedConsent = false;
      try {
        savedConsent = JSON.parse(localStorage.getItem("gf_consent_v1"))?.v === 1;
      } catch {
        savedConsent = false;
      }
      const syncConsent = () => setReason(
        "consent",
        consent.classList.contains("is-open") || !savedConsent
      );
      new MutationObserver(syncConsent).observe(consent, {
        attributes: true,
        attributeFilter: ["class"]
      });
      syncConsent();
      consent.querySelectorAll("[data-consent]").forEach(button => {
        button.addEventListener("click", () => {
          savedConsent = true;
          requestAnimationFrame(syncConsent);
        });
      });
    }

    const mobileMenu = document.querySelector(".nav-list");
    if (mobileMenu) {
      const syncMenu = () =>
        setReason("mobile-menu", mobileMenu.classList.contains("active"));
      new MutationObserver(syncMenu).observe(mobileMenu, {
        attributes: true,
        attributeFilter: ["class"]
      });
      syncMenu();
    }

    if ("IntersectionObserver" in window) {
      const conversionZones = [
        ...document.querySelectorAll(
          ".hero, form[name='pre-approval'], #contact, .contact-section, .apply-form"
        )
      ];
      const visibleZones = new Set();
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) visibleZones.add(entry.target);
          else visibleZones.delete(entry.target);
        });
        setReason("conversion-zone", visibleZones.size > 0);
      }, { threshold: 0.08 });
      conversionZones.filter(visibleInViewport).forEach(zone => {
        visibleZones.add(zone);
      });
      setReason("conversion-zone", visibleZones.size > 0);
      conversionZones.forEach(zone => observer.observe(zone));
    }
  };

  ready(() => {
    document.body.dataset.route ||= cleanRoute();
    revealContentReliably();
    stabilizeCounters();
    classifyCallsToAction();
    improveMobileMenuFocus();
    controlStickyCallToAction();
  });
})();
