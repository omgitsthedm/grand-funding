/* Grand Funding — Consent Mode v2 + cookie banner + phone/form conversion tracking */
{
  const STORAGE_KEY = 'gf_consent_v1';
  const AW_ID = 'AW-XXXXXXXXXX';               /* Placeholder: Google Ads conversion ID */
  const AW_LEAD_LABEL = 'XXXXXXXXXXXXXXXXXXX';  /* Placeholder: lead-submit conversion label */
  const AW_CALL_LABEL = 'XXXXXXXXXXXXXXXXXXX';  /* Placeholder: phone-click conversion label */

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args) => window.dataLayer.push(args);

  // Load saved consent, apply immediately so GA/Ads see it on first call
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch {}
  if (saved?.v === 1) {
    gtag('consent', 'update', {
      ad_storage: saved.ads ? 'granted' : 'denied',
      ad_user_data: saved.ads ? 'granted' : 'denied',
      ad_personalization: saved.ads ? 'granted' : 'denied',
      analytics_storage: saved.analytics ? 'granted' : 'denied'
    });
  }

  const init = () => {
    const banner = document.getElementById('consent-banner');
    if (banner) {
      if (!saved) setTimeout(() => banner.classList.add('is-open'), 350);
      for (const btn of banner.querySelectorAll('[data-consent]')) {
        btn.addEventListener('click', () => {
          const choice = btn.getAttribute('data-consent');
          const ads = choice === 'all';
          const analytics = choice === 'all';
          const payload = { v: 1, ads, analytics, ts: Date.now() };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
          gtag('consent', 'update', {
            ad_storage: ads ? 'granted' : 'denied',
            ad_user_data: ads ? 'granted' : 'denied',
            ad_personalization: ads ? 'granted' : 'denied',
            analytics_storage: analytics ? 'granted' : 'denied'
          });
          banner.classList.remove('is-open');
        });
      }
    }

    // Phone click conversion — fires on any tel: link
    for (const a of document.querySelectorAll('a[href^="tel:"]')) {
      a.addEventListener('click', () => {
        gtag('event', 'phone_click', { event_category: 'engagement', event_label: a.getAttribute('href') });
        if (!AW_ID.includes('X') && !AW_CALL_LABEL.includes('X')) {
          gtag('event', 'conversion', { send_to: `${AW_ID}/${AW_CALL_LABEL}` });
        }
      });
    }

    // UTM capture — persist source params to sessionStorage and hidden form fields
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'];
    const utm = {};
    for (const k of utmKeys) {
      const fromUrl = params.get(k);
      if (fromUrl) {
        utm[k] = fromUrl;
        sessionStorage.setItem(`gf_${k}`, fromUrl);
      } else {
        const stored = sessionStorage.getItem(`gf_${k}`);
        if (stored) utm[k] = stored;
      }
    }
    // Capture referrer on first page load if not internal
    if (document.referrer && !document.referrer.includes(window.location.host)) {
      const ref = sessionStorage.getItem('gf_referrer') || document.referrer;
      sessionStorage.setItem('gf_referrer', ref);
      utm.referrer = ref;
    }
    // Populate hidden form fields with captured attribution
    for (const [k, v] of Object.entries(utm)) {
      for (const input of document.querySelectorAll(`input[name="${k}"]`)) input.value = v;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Expose a helper to fire the lead-submit conversion (thanks.html calls this on load)
  window.gfLeadConversion = () => {
    gtag('event', 'generate_lead', { event_category: 'form', event_label: 'apply_form' });
    if (!AW_ID.includes('X') && !AW_LEAD_LABEL.includes('X')) {
      gtag('event', 'conversion', { send_to: `${AW_ID}/${AW_LEAD_LABEL}`, value: 1.0, currency: 'USD' });
    }
  };
}
