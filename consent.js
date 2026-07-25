(() => {
  "use strict";

  const CONSENT_KEY = "gf_consent_v1";
  const GOOGLE_ADS_ID = "AW-XXXXXXXXXX";
  const GOOGLE_ADS_LABELS = {
    application: "XXXXXXXXXXXXXXXXXXX",
    contact: "XXXXXXXXXXXXXXXXXXX",
    phone: "XXXXXXXXXXXXXXXXXXX"
  };

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args) => window.dataLayer.push(args);

  const readConsent = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return saved?.v === 1 ? saved : null;
    } catch {
      return null;
    }
  };

  const updateGoogleConsent = consent => {
    gtag("consent", "update", {
      ad_storage: consent?.ads ? "granted" : "denied",
      ad_user_data: consent?.ads ? "granted" : "denied",
      ad_personalization: consent?.ads ? "granted" : "denied",
      analytics_storage: consent?.analytics ? "granted" : "denied"
    });
  };

  let consent = readConsent();
  if (consent) updateGoogleConsent(consent);

  const configuredLabel = label =>
    Boolean(label) &&
    !GOOGLE_ADS_ID.includes("X") &&
    !label.includes("X");

  const fireAdsConversion = (label, fields = {}) => {
    if (!consent?.ads || !configuredLabel(label)) return;
    gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${label}`,
      ...fields
    });
  };

  window.gfPhoneConversion = ({ href = "", location = "page" } = {}) => {
    consent = readConsent();
    if (!consent?.analytics) return false;
    gtag("event", "phone_click", {
      event_category: "engagement",
      event_label: href,
      cta_location: location
    });
    fireAdsConversion(GOOGLE_ADS_LABELS.phone);
    return true;
  };

  window.gfLeadConversion = ({
    formType,
    submissionId
  } = {}) => {
    consent = readConsent();
    if (
      !consent?.analytics ||
      !["application", "contact"].includes(formType) ||
      !submissionId
    ) {
      return false;
    }

    const conversionKey = `gf_lead_conversion_v1:${submissionId}`;
    try {
      if (sessionStorage.getItem(conversionKey) === "1") return false;
      sessionStorage.setItem(conversionKey, "1");
    } catch {
      // Storage can be unavailable. The pending marker is still removed once.
    }

    gtag("event", "generate_lead", {
      form_type: formType,
      method: "web_form",
      submission_id: submissionId
    });
    fireAdsConversion(GOOGLE_ADS_LABELS[formType], {
      value: 1,
      currency: "USD"
    });
    return true;
  };

  const ready = callback => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  };

  ready(() => {
    const banner = document.getElementById("consent-banner");
    if (!banner) return;

    if (!consent) {
      setTimeout(() => banner.classList.add("is-open"), 350);
    }

    banner.querySelectorAll("[data-consent]").forEach(button => {
      button.addEventListener("click", () => {
        const acceptedAll = button.dataset.consent === "all";
        consent = {
          v: 1,
          ads: acceptedAll,
          analytics: acceptedAll,
          ts: Date.now()
        };
        try {
          localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
        } catch {
          // Consent mode still updates for this page when storage is unavailable.
        }
        updateGoogleConsent(consent);
        banner.classList.remove("is-open");
        dispatchEvent(
          new CustomEvent("gf:consent-changed", { detail: { ...consent } })
        );
      });
    });
  });
})();
