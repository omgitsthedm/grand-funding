(() => {
  "use strict";
  const CONSENT_KEY = "gf_consent_v1";
  const QA_KEY = "gf_analytics_qa_v1";
  const SOURCE_KEY = "gf_acquisition_v1";
  const MEASUREMENT_ID = "G-K825ENLYS6";
  const CONTAINER_ID = "GTM-NCCHQ32T";
  // Meta Pixel ID for ads measurement. Empty means off: no Meta script loads,
  // no request is made, and the ads toggle never renders. See docs/ADS.md.
  const META_PIXEL_ID = "";
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
  const runtimeOk = () => {
    if (!storageAvailable || qa || navigator.webdriver) return false;
    if (location.protocol !== "https:" || !["grandfundingllc.com", "www.grandfundingllc.com"].includes(location.hostname)) return false;
    if (path() !== expectedPath()) return false;
    const noindex = /noindex/i.test(document.querySelector('meta[name="robots"]')?.content || "");
    return !noindex || confirmedReceipt();
  };
  const allowed = () => runtimeOk() && Boolean(consent?.analytics);
  // Send fixed channel labels only. Never send a referring URL, arbitrary UTM
  // value, click ID, or borrower detail. Storage starts only after consent.
  const sourcePairs = { google: "organic", bing: "organic", instagram: "social", facebook: "social", youtube: "referral", linktree: "referral", "chatgpt.com": "referral", "perplexity.ai": "referral", "claude.ai": "referral", "gemini.google.com": "referral", "copilot.microsoft.com": "referral", "meta.ai": "referral", "muse.ai": "referral" };
  const campaignNames = ["arizona_fix_flip", "phoenix_fix_flip", "arizona_bridge", "investor_loans"];
  const inboundSource = () => {
    const query = new URLSearchParams(location.search);
    if (["gclid", "gbraid", "wbraid", "msclkid"].some(key => query.has(key))) return false;
    const source = query.get("utm_source") === "ig" ? "instagram" : query.get("utm_source");
    // ChatGPT search links may supply only utm_source=chatgpt.com.
    // Retain that fixed label without retaining a prompt or other URL data.
    if (source === "chatgpt.com" && [null, "", "referral", "ai-assistant"].includes(query.get("utm_medium"))) {
      return { source, medium: sourcePairs[source] };
    }
    if (["instagram", "facebook", "linktree", "youtube"].includes(source) && query.get("utm_medium") === sourcePairs[source]) {
      const campaign = query.get("utm_campaign");
      return { source, medium: sourcePairs[source], ...(campaignNames.includes(campaign) ? { campaign } : {}) };
    }
    // An unrecognized campaign or paid-click marker must not become organic.
    if (["utm_source", "utm_medium"].some(key => query.has(key))) return false;
    try {
      const ref = new URL(document.referrer);
      if (!["https:", "http:"].includes(ref.protocol)) return null;
      const hosts = { "google.com": "google", "www.google.com": "google", "bing.com": "bing", "www.bing.com": "bing", "instagram.com": "instagram", "www.instagram.com": "instagram", "l.instagram.com": "instagram", "facebook.com": "facebook", "www.facebook.com": "facebook", "m.facebook.com": "facebook", "l.facebook.com": "facebook", "lm.facebook.com": "facebook", "youtube.com": "youtube", "www.youtube.com": "youtube", "linktr.ee": "linktree", "chatgpt.com": "chatgpt.com", "www.chatgpt.com": "chatgpt.com", "chat.openai.com": "chatgpt.com", "perplexity.ai": "perplexity.ai", "www.perplexity.ai": "perplexity.ai", "claude.ai": "claude.ai", "gemini.google.com": "gemini.google.com", "copilot.microsoft.com": "copilot.microsoft.com", "meta.ai": "meta.ai", "www.meta.ai": "meta.ai", "muse.ai": "muse.ai", "www.muse.ai": "muse.ai" };
      const known = Object.hasOwn(hosts, ref.hostname) ? hosts[ref.hostname] : null;
      return known ? { source: known, medium: sourcePairs[known] } : null;
    } catch { return null; }
  };
  let acquisition = null;
  const acquisitionContext = () => {
    if (!allowed()) return {};
    try {
      if (!acquisition) {
        const saved = JSON.parse(sessionStorage.getItem(SOURCE_KEY));
        const fresh = saved?.v === 1 && Date.now() - saved.ts >= 0 && Date.now() - saved.ts < 30 * 60 * 1000;
        const known = fresh && Object.hasOwn(sourcePairs, saved.source) && sourcePairs[saved.source] === saved.medium && (!saved.campaign || campaignNames.includes(saved.campaign));
        const incoming = inboundSource();
        if (incoming === false) { sessionStorage.removeItem(SOURCE_KEY); return {}; }
        const value = incoming || (known ? { source: saved.source, medium: saved.medium, ...(saved.campaign ? { campaign: saved.campaign } : {}) } : null);
        if (!value) return {};
        acquisition = { ...value, v: 1, ts: Date.now() };
        sessionStorage.setItem(SOURCE_KEY, JSON.stringify(acquisition));
      }
      return { campaign_source: acquisition.source, campaign_medium: acquisition.medium, ...(acquisition.campaign ? { campaign_name: acquisition.campaign } : {}) };
    } catch { return {}; }
  };
  // Ads measurement is a separate opt-in from analytics with its own consent
  // flag. Global Privacy Control opts a visitor out without asking.
  const adsAllowed = () => Boolean(META_PIXEL_ID) && runtimeOk() && consent?.ads === true && navigator.globalPrivacyControl !== true;
  let adsLoaded = false;
  const loadAdsPixel = () => {
    if (!adsAllowed() || adsLoaded) return;
    adsLoaded = true;
    const fbq = window.fbq = window.fbq || function () { (window.fbq.q = window.fbq.q || []).push(arguments); };
    if (!window._fbq) window._fbq = fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window.fbq.queue = [];
    const script = document.createElement("script");
    script.async = true;
    script.dataset.gfMeta = META_PIXEL_ID;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  };
  // Field names that must never reach an ad network, whatever a track call carries.
  const NEVER_SEND = /^(e?mail|phone|tel|mobile|first|last|name|full_?name|address|street|zip|postal|postcode|dob|birth|ssn|user|username|handle|token|password|secret|auth|card|cc|cvv|iban|account)$/i;
  const cleanParams = params => Object.fromEntries(Object.entries(params || {}).filter(([key, value]) =>
    !NEVER_SEND.test(key) && typeof value === "string" && value.length <= 80 &&
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) && !/^\+?[\d][\d\s().-]{6,}$/.test(value)));
  // Conversion events translated to Meta. A submitted quote form (generate_lead)
  // is the event the ad account optimises on; calls and CTA taps are supporting
  // signals. See docs/ADS.md.
  const trackAds = (eventName, params = {}) => {
    if (!adsAllowed() || typeof window.fbq !== "function") return false;
    const clean = cleanParams(params);
    if (eventName === "generate_lead") window.fbq("track", "Lead", clean);
    else if (eventName === "phone_click") window.fbq("track", "Contact", clean);
    else window.fbq("trackCustom", eventName, clean);
    return true;
  };
  const context = () => ({
    ...acquisitionContext(),
    page_location: "https://www.grandfundingllc.com" + path(),
    page_path: path(), page_referrer: "", allow_google_signals: false,
    allow_ad_personalization_signals: false,
    // Receipts require a fresh native POST handoff; do not request a receipt page view.
    send_page_view: !confirmedReceipt()
  });
  const sync = () => {
    if (adsAllowed()) loadAdsPixel();
    const enabled = allowed();
    window[DISABLE_KEY] = !enabled;
    gtag("consent", "update", { ...denied, analytics_storage: enabled ? "granted" : "denied" });
    if (!enabled) {
      acquisition = null;
      try { sessionStorage.removeItem(SOURCE_KEY); } catch { /* Analytics remains off. */ }
      return;
    }
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
    if (!["apply", "contact", "funded-proof"].includes(intent)) return false;
    trackAds("cta_click", { cta_intent: intent, cta_location: region(placement) });
    if (!allowed()) return false;
    gtag("event", "cta_click", { cta_intent: intent, cta_location: region(placement), ...context() });
    return true;
  };
  window.gfPhoneConversion = ({ location: placement = "page" } = {}) => {
    trackAds("phone_click", { cta_location: region(placement) });
    if (!allowed()) return false;
    gtag("event", "phone_click", { cta_location: region(placement), ...context() });
    return true;
  };
  window.gfLeadConversion = ({ formType, submissionId } = {}) => {
    const receipt = pendingReceipt();
    if (!receipt || receipt.type !== formType || receipt.id !== submissionId || counted.has(submissionId)) return false;
    if (!allowed() && !adsAllowed()) return false;
    try {
      const key = "gf_lead_conversion_v1:" + submissionId;
      if (sessionStorage.getItem(key) === "1") return false;
      sessionStorage.setItem(key, "1");
    } catch { return false; }
    counted.add(submissionId);
    trackAds("generate_lead", { form_type: formType, method: "web_form" });
    if (!allowed()) return true;
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
        const grantAll = button.dataset.consent === "all";
        consent = { v: 1, ads: grantAll && consent?.ads === true, analytics: grantAll, ts: Date.now() };
        try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch { storageAvailable = false; }
        sync();
        banner.classList.remove("is-open");
        dispatchEvent(new CustomEvent("gf:consent-changed", { detail: { ...consent } }));
      });
    });
    // Ads measurement gets its own explicit toggle, rendered only when a pixel
    // ID is configured. Without an ID this block changes nothing.
    if (META_PIXEL_ID && navigator.globalPrivacyControl !== true) {
      const actions = banner.querySelector?.(".consent-actions");
      const renderAdsToggle = () => {
        if (!actions?.appendChild) return;
        actions.querySelector?.('[data-ads-toggle]')?.remove?.();
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "consent-btn consent-btn--ghost";
        toggle.setAttribute?.("data-ads-toggle", "");
        const on = consent?.ads === true;
        toggle.textContent = on ? "Ads measurement: On" : "Ads measurement: Off";
        toggle.addEventListener("click", () => {
          consent = { v: 1, ads: !on, analytics: Boolean(consent?.analytics), ts: Date.now() };
          try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch { storageAvailable = false; }
          sync();
          renderAdsToggle();
          dispatchEvent(new CustomEvent("gf:consent-changed", { detail: { ...consent } }));
        });
        actions.appendChild(toggle);
      };
      renderAdsToggle();
    }
  });
})();
