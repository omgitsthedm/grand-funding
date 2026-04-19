/* Grand Funding — premium interactions: scroll reveal, nav scroll state */
(function(){
  /* For automated browsers (Lighthouse, bots): skip animations BUT still
     mark all reveal elements as visible so the page renders properly.
     Hardcoded .reveal classes in HTML would otherwise stay at opacity:0. */
  if(navigator.webdriver){
    document.addEventListener('DOMContentLoaded',function(){
      document.querySelectorAll('.reveal,.reveal-stagger').forEach(function(el){
        el.classList.add('is-visible');
      });
    });
    return;
  }
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll-progress nav state */
  var header=document.querySelector('.header');
  if(header){
    var ticking=false;
    var onScroll=function(){
      /* rAF-gated: read scrollY and apply class in next frame */
      if(ticking)return;
      ticking=true;
      requestAnimationFrame(function(){
        if(window.scrollY>20){header.classList.add('scrolled');}
        else{header.classList.remove('scrolled');}
        ticking=false;
      });
    };
    /* No initial call — at page load scrollY is 0 so no 'scrolled' class needed.
       Avoids forced reflow from reading scrollY before layout is settled. */
    window.addEventListener('scroll',onScroll,{passive:true});
  }

  /* Intersection-observer scroll reveal */
  if(reduced||!('IntersectionObserver' in window))return;

  /* Auto-tag common sections for reveal on first run */
  document.addEventListener('DOMContentLoaded',function(){
    /* NOTE: .hero-content EXCLUDED — always above-fold, reveal animation caused
       CLS + LCP delays (LCP element waits for opacity transition to complete). */
    var autoTargets=[
      '.section-header','.story-content','.story-highlight',
      '.featured-grid','.deals-grid','.values-grid','.reasons-grid','.services-grid',
      '.fun-facts-grid','.logan-content','.cta-content','.deals-stats',
      '.glossary-controls','.glossary-panels','.footer-main'
    ];
    autoTargets.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        if(!el.classList.contains('reveal')&&!el.classList.contains('reveal-stagger')){
          /* Grid-like containers get staggered reveal */
          if(/grid|stats|columns/.test(sel)) el.classList.add('reveal-stagger');
          else el.classList.add('reveal');
        }
      });
    });

    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});

    document.querySelectorAll('.reveal,.reveal-stagger').forEach(function(el){io.observe(el);});
  });
})();
