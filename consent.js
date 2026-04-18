/* Grand Funding — Consent Mode v2 + cookie banner + phone/form conversion tracking */
(function(){
  var STORAGE_KEY='gf_consent_v1';
  var AW_ID='AW-XXXXXXXXXX';               /* Placeholder: Google Ads conversion ID */
  var AW_LEAD_LABEL='XXXXXXXXXXXXXXXXXXX';  /* Placeholder: lead-submit conversion label */
  var AW_CALL_LABEL='XXXXXXXXXXXXXXXXXXX';  /* Placeholder: phone-click conversion label */

  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}

  /* Load saved consent, apply immediately so GA/Ads see it on first call */
  var saved=null;
  try{saved=JSON.parse(localStorage.getItem(STORAGE_KEY));}catch(e){}
  if(saved&&saved.v===1){
    gtag('consent','update',{
      ad_storage:saved.ads?'granted':'denied',
      ad_user_data:saved.ads?'granted':'denied',
      ad_personalization:saved.ads?'granted':'denied',
      analytics_storage:saved.analytics?'granted':'denied'
    });
  }

  /* Banner — only show if no saved choice */
  document.addEventListener('DOMContentLoaded',function(){
    var banner=document.getElementById('consent-banner');
    if(!banner)return;
    if(!saved){
      setTimeout(function(){banner.classList.add('is-open');},350);
    }
    banner.querySelectorAll('[data-consent]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var choice=btn.getAttribute('data-consent');
        var ads=choice==='all', analytics=choice==='all';
        var payload={v:1,ads:ads,analytics:analytics,ts:Date.now()};
        try{localStorage.setItem(STORAGE_KEY,JSON.stringify(payload));}catch(e){}
        gtag('consent','update',{
          ad_storage:ads?'granted':'denied',
          ad_user_data:ads?'granted':'denied',
          ad_personalization:ads?'granted':'denied',
          analytics_storage:analytics?'granted':'denied'
        });
        banner.classList.remove('is-open');
      });
    });

    /* Phone click conversion — fires on any tel: link */
    document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
      a.addEventListener('click',function(){
        gtag('event','phone_click',{event_category:'engagement',event_label:a.getAttribute('href')});
        if(AW_ID.indexOf('X')<0&&AW_CALL_LABEL.indexOf('X')<0){
          gtag('event','conversion',{send_to:AW_ID+'/'+AW_CALL_LABEL});
        }
      });
    });

    /* UTM capture — persist source params to sessionStorage and hidden form fields */
    var params=new URLSearchParams(window.location.search);
    var utmKeys=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid'];
    var utm={};
    utmKeys.forEach(function(k){
      var fromUrl=params.get(k);
      if(fromUrl){utm[k]=fromUrl;sessionStorage.setItem('gf_'+k,fromUrl);}
      else{var stored=sessionStorage.getItem('gf_'+k);if(stored)utm[k]=stored;}
    });
    /* Also capture referrer on first page load if not internal */
    if(document.referrer&&document.referrer.indexOf(window.location.host)<0){
      var ref=sessionStorage.getItem('gf_referrer')||document.referrer;
      sessionStorage.setItem('gf_referrer',ref);
      utm.referrer=ref;
    }
    /* Populate hidden form fields with captured attribution */
    Object.keys(utm).forEach(function(k){
      document.querySelectorAll('input[name="'+k+'"]').forEach(function(input){input.value=utm[k];});
    });
  });

  /* Expose a helper to fire the lead-submit conversion (thanks.html calls this on load) */
  window.gfLeadConversion=function(){
    gtag('event','generate_lead',{event_category:'form',event_label:'apply_form'});
    if(AW_ID.indexOf('X')<0&&AW_LEAD_LABEL.indexOf('X')<0){
      gtag('event','conversion',{send_to:AW_ID+'/'+AW_LEAD_LABEL,value:1.0,currency:'USD'});
    }
  };
})();
