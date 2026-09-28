(() => {
  "use strict";
  const CONSENT_KEY = "gf_consent_v1";
  const QA_KEY = "gf_analytics_qa_v1";
  const MEASUREMENT_ID = "G-K825ENLYS6";
  const CONTAINER_ID = "GTM-NCCHQ32T";
  const DISABLE_KEY = "ga-disable-" + MEASUREMENT_ID;
  const denied = { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
  let storageAvailable = true, loaded = false, qa = false;
  const counted = new Set();
  window.dataLayer = window.dataLayer || [];
  window[DISABLE_KEY] = true;
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("consent", "default", denied);
  gtag("set", "ads_data_redaction", true);
  const readConsent = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return saved?.v === 1 ? saved : null;
    } catch { storageAvailable = false; return null; }
  };
  let consent = readConsent();
  try {
    qa = new URLSearchParams(location.search).has("qa") || sessionStorage.getItem(QA_KEY) === "1";
    if (qa) sessionStorage.setItem(QA_KEY, "1");
  } catch { storageAvailable = false; qa = true; }
  const path = () => location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "").replace(/\/$/, "") || "/";
  const expectedPath = () => document.querySelector('meta[name="gf-analytics-path"]')?.content;
  const pendingReceipt = () => {
    const expectedType = path() === "/thanks" ? "application" : path() === "/thanks-contact" ? "contact" : "";
    if (!expectedType) return null;
    try {
      const pending = JSON.parse(sessionStorage.getItem("gf_pending_lead_v1"));
      const age = Date.now() - Number(pending?.createdAt);
      return pending?.v === 1 && pending.type === expectedType && typeof pending.id === "string" && age >= 0 && age < 30 * 60 * 1000 ? pending : null;
    } catch { return null; }
  };
  const confirmedReceipt = () => Boolean(pendingReceipt());
  const allowed = () => {
    if (!storageAvailable || qa || navigator.webdriver || !consent?.analytics) return false;
    if (location.protocol !== "https:" || !["grandfundingllc.com", "www.grandfundingllc.com"].includes(location.hostname)) return false;
    if (path() !== expectedPath()) return false;
    const noindex = /noindex/i.test(document.querySelector('meta[name="robots"]')?.content || "");
    return !noindex || confirmedReceipt();
  };
  const context = () => ({
    page_location: "https://www.grandfundingllc.com" + path(),
    page_path: path(), page_referrer: "", allow_google_signals: false,
    allow_ad_personalization_signals: false,
    // Receipts require a fresh native POST handoff; do not request a receipt page view.
    send_page_view: !confirmedReceipt()
  });
  const sync = () => {
    const enabled = allowed();
    window[DISABLE_KEY] = !enabled;
    gtag("consent", "update", { ...denied, analytics_storage: enabled ? "granted" : "denied" });
    if (!enabled) return;
    const safe = context();
    gtag("set", safe);
    window.dataLayer.push({ gf_page_location: safe.page_location, gf_page_path: safe.page_path, gf_page_referrer: "", gf_send_page_view: safe.send_page_view });
    if (loaded) return;
    loaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.dataset.gfGtm = CONTAINER_ID;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + CONTAINER_ID;
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    document.head.appendChild(script);
  };
  const region = value => ["header", "footer", "hero", "contact", "form", "page"].includes(value) ? value : "page";
  window.gfTrackCta = ({ intent, location: placement = "page" } = {}) => {
    if (!allowed() || !["apply", "contact", "funded-proof"].includes(intent)) return false;
    gtag("event", "cta_click", { cta_intent: intent, cta_location: region(placement), ...context() });
    return true;
  };
  window.gfPhoneConversion = ({ location: placement = "page" } = {}) => {
    if (!allowed()) return false;
    gtag("event", "phone_click", { cta_location: region(placement), ...context() });
    return true;
  };
  window.gfLeadConversion = ({ formType, submissionId } = {}) => {
    const receipt = pendingReceipt();
    if (!allowed() || !receipt || receipt.type !== formType || receipt.id !== submissionId || counted.has(submissionId)) return false;
    try {
      const key = "gf_lead_conversion_v1:" + submissionId;
      if (sessionStorage.getItem(key) === "1") return false;
      sessionStorage.setItem(key, "1");
    } catch { return false; }
    counted.add(submissionId);
    gtag("event", "generate_lead", { form_type: formType, method: "web_form", ...context() });
    return true;
  };
  sync();
  const ready = callback => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", callback, { once: true }) : callback();
  ready(() => {
    const banner = document.getElementById("consent-banner");
    if (!banner) return;
    if (!consent) banner.classList.add("is-open");
    const settings = document.createElement("button");
    settings.type = "button";
    settings.className = "consent-btn consent-btn--ghost";
    settings.textContent = "Analytics settings";
    settings.addEventListener("click", () => { banner.classList.add("is-open"); banner.querySelector("button")?.focus(); });
    (document.querySelector("footer") || banner.parentElement).appendChild(settings);
    banner.querySelectorAll("[data-consent]").forEach(button => {
      button.addEventListener("click", () => {
        consent = { v: 1, ads: false, analytics: button.dataset.consent === "all", ts: Date.now() };
        try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch { storageAvailable = false; }
        sync();
        banner.classList.remove("is-open");
        dispatchEvent(new CustomEvent("gf:consent-changed", { detail: { ...consent } }));
      });
    });
  });
})();
