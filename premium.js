/* Grand Funding — premium interactions: scroll reveal, nav scroll state */
(function(){
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll-progress nav state */
  var header=document.querySelector('.header');
  if(header){
    var onScroll=function(){
      if(window.scrollY>20){header.classList.add('scrolled');}
      else{header.classList.remove('scrolled');}
    };
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
  }

  /* Intersection-observer scroll reveal */
  if(reduced||!('IntersectionObserver' in window))return;

  /* Auto-tag common sections for reveal on first run */
  document.addEventListener('DOMContentLoaded',function(){
    var autoTargets=[
      '.section-header','.hero-content','.story-content','.story-highlight',
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
