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

  const readConsent = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("gf_consent_v1"));
      return saved?.v === 1 ? saved : null;
    } catch {
      return null;
    }
  };

  const trackClassifiedCallsToAction = () => {
    document.addEventListener("click", event => {
      const control = event.target.closest?.("[data-cta-intent]");
      if (!control) return;
      const intent = control.dataset.ctaIntent || "";
      const locationName = control.dataset.ctaLocation || "page";

      if (intent === "call") {
        window.gfPhoneConversion?.({
          href: control.getAttribute("href") || "",
          location: locationName
        });
        return;
      }

      if (
        !["apply", "contact", "funded-proof"].includes(intent) ||
        !readConsent()?.analytics
      ) {
        return;
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "cta_click",
        cta_intent: intent,
        cta_location: locationName
      });
    });
  };

  const synchronizeFaqDisclosures = () => {
    const items = [...document.querySelectorAll(".faq-item")];
    if (!items.length) return;

    const sync = () => {
      items.forEach(item => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        if (!question || !answer) return;
        const expanded =
          item.classList.contains("active") ||
          question.getAttribute("aria-expanded") === "true";
        question.setAttribute("aria-expanded", String(expanded));
        answer.hidden = !expanded;
      });
    };

    items.forEach(item => {
      const question = item.querySelector(".faq-question");
      if (!question) return;
      question.addEventListener("click", () => queueMicrotask(sync));
      question.addEventListener("keydown", event => {
        if (!["Enter", " "].includes(event.key)) return;
        queueMicrotask(sync);
      });
    });
    sync();
  };

  const enhanceLeadForms = () => {
    document.querySelectorAll("form[data-gf-lead-form]").forEach(form => {
      const button = form.querySelector("button[type='submit']");
      const status = form.querySelector("[data-form-status]");
      if (!button || !status) return;

      const defaultLabel =
        button.dataset.submitLabel || button.textContent.trim() || "Send";
      let recoveryTimer = 0;

      const restore = message => {
        clearTimeout(recoveryTimer);
        form.removeAttribute("aria-busy");
        button.removeAttribute("aria-busy");
        button.disabled = false;
        button.textContent = defaultLabel;
        if (message) status.textContent = message;
        try {
          sessionStorage.removeItem("gf_pending_lead_v1");
        } catch {
          // Native form behavior remains available when storage is blocked.
        }
      };

      form.addEventListener("submit", event => {
        if (form.getAttribute("aria-busy") === "true") {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }

        const pending = {
          v: 1,
          id:
            crypto.randomUUID?.() ||
            `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: form.dataset.formKind,
          createdAt: Date.now(),
          path: location.pathname
        };
        try {
          sessionStorage.setItem(
            "gf_pending_lead_v1",
            JSON.stringify(pending)
          );
        } catch {
          // The native Netlify POST remains available when storage is blocked.
        }

        form.setAttribute("aria-busy", "true");
        button.setAttribute("aria-busy", "true");
        button.disabled = true;
        button.textContent = "Sending securely…";
        status.textContent = "Sending securely…";
        recoveryTimer = setTimeout(
          () =>
            restore(
              "Still here? Check your connection, then try sending again."
            ),
          12_000
        );
      });

      addEventListener("pageshow", event => {
        if (!event.persisted && form.getAttribute("aria-busy") !== "true") return;
        restore("");
      });
    });
  };

  const consumeConfirmedLead = () => {
    const route = cleanRoute();
    const expectedType =
      route === "thanks"
        ? "application"
        : route === "thanks-contact"
          ? "contact"
          : "";
    if (!expectedType) return;

    let pending = null;
    try {
      pending = JSON.parse(sessionStorage.getItem("gf_pending_lead_v1"));
    } catch {
      pending = null;
    }
    const fresh =
      pending?.v === 1 &&
      pending.type === expectedType &&
      typeof pending.id === "string" &&
      Date.now() - Number(pending.createdAt) < 30 * 60 * 1000;
    if (!fresh) return;

    const consume = () => {
      const tracked = window.gfLeadConversion?.({
        formType: pending.type,
        submissionId: pending.id
      });
      if (!tracked) return;
      try {
        sessionStorage.removeItem("gf_pending_lead_v1");
      } catch {
        // The conversion guard still prevents a second event when available.
      }
    };

    consume();
    addEventListener("gf:consent-changed", consume);
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
          [
            ".hero",
            ".products-hero",
            ".deals-hero",
            ".blog-hero",
            ".quiz",
            ".loan-calc",
            ".meet-logan__cta",
            ".blog-callout",
            "form[name='pre-approval']",
            "form[name='contact']",
            "#contact",
            ".contact-section",
            ".apply-form"
          ].join(",")
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
    trackClassifiedCallsToAction();
    synchronizeFaqDisclosures();
    enhanceLeadForms();
    consumeConfirmedLead();
    improveMobileMenuFocus();
    controlStickyCallToAction();
  });
})();
