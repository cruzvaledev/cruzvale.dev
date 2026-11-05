/* Vale & Co: shared site behavior (mobile menu button). Loaded on every page. */
(function(){
  var MOBILE = window.matchMedia('(max-width:680px)');

  function setup(header, n){
    var nav = header.querySelector('.main-nav');
    if(!nav || header.querySelector('.nav-toggle')){ return; }
    if(!nav.id){ nav.id = 'main-nav-' + n; }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-controls', nav.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    btn.appendChild(document.createElement('span'));
    nav.parentNode.insertBefore(btn, nav.nextSibling);

    function setOpen(open){
      header.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      setOpen(!header.classList.contains('nav-open'));
    });
    nav.addEventListener('click', function(e){
      if(e.target.closest('a')){ setOpen(false); }
    });
    document.addEventListener('click', function(e){
      if(header.classList.contains('nav-open') && !header.contains(e.target)){ setOpen(false); }
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && header.classList.contains('nav-open')){ setOpen(false); btn.focus(); }
    });
    var onChange = function(){ if(!MOBILE.matches){ setOpen(false); } };
    if(MOBILE.addEventListener){ MOBILE.addEventListener('change', onChange); } else if(MOBILE.addListener){ MOBILE.addListener(onChange); }
  }

  var headers = document.querySelectorAll('.site-header .header-inner, .landing-top');
  for(var i = 0; i < headers.length; i++){
    var h = headers[i].classList.contains('header-inner') ? headers[i].closest('.site-header') : headers[i];
    setup(h, i);
  }
})();

/* Carousels (.carousel and .review-carousel).
   Autoplay delay comes from data-autoplay or data-delay (ms).
   Autoplay is off for people who prefer reduced motion, pauses on hover/focus,
   and stops for good once someone uses the arrows, dots, swipe, or arrow keys. */
(function(){
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initCarousel(c){
    var track = c.querySelector('.track');
    var slides = c.querySelectorAll('.slide');
    var n = slides.length;
    if(!track || n <= 1){ c.classList.add('single'); return; }

    var noun = c.classList.contains('review-carousel') ? 'review' : 'photo';
    var delay = parseInt(c.getAttribute('data-autoplay') || c.getAttribute('data-delay') || '5000', 10);
    var autoplay = !REDUCED && delay > 0;
    var i = 0, timer = null, hovering = false, focused = false;

    c.setAttribute('role', 'region');
    c.setAttribute('aria-roledescription', 'carousel');
    if(!c.hasAttribute('aria-label')){
      var heading = c.parentNode.querySelector('h2');
      c.setAttribute('aria-label', heading ? heading.textContent.trim() : 'Gallery');
    }
    c.tabIndex = -1;

    var dotsWrap = c.querySelector('.dots');
    var dots = [];
    if(dotsWrap){
      for(var k = 0; k < n; k++){ (function(k){
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Show ' + noun + ' ' + (k + 1) + ' of ' + n);
        b.addEventListener('click', function(){ userGo(k); });
        dotsWrap.appendChild(b); dots.push(b);
      })(k); }
    }

    function go(idx){
      i = (idx + n) % n;
      track.style.transform = 'translateX(-' + (i * 100) + '%)';
      for(var s = 0; s < n; s++){
        if(s === i){ slides[s].removeAttribute('aria-hidden'); } else { slides[s].setAttribute('aria-hidden', 'true'); }
      }
      for(var d = 0; d < dots.length; d++){
        dots[d].classList.toggle('active', d === i);
        if(d === i){ dots[d].setAttribute('aria-current', 'true'); } else { dots[d].removeAttribute('aria-current'); }
      }
    }
    function stop(){ clearInterval(timer); timer = null; }
    function start(){ stop(); if(autoplay && !hovering && !focused){ timer = setInterval(function(){ go(i + 1); }, delay); } }
    function userGo(idx){ autoplay = false; stop(); go(idx); }

    var nextBtn = c.querySelector('.cnext'), prevBtn = c.querySelector('.cprev');
    if(nextBtn){ nextBtn.type = 'button'; nextBtn.addEventListener('click', function(){ userGo(i + 1); }); }
    if(prevBtn){ prevBtn.type = 'button'; prevBtn.addEventListener('click', function(){ userGo(i - 1); }); }

    c.addEventListener('mouseenter', function(){ hovering = true; stop(); });
    c.addEventListener('mouseleave', function(){ hovering = false; start(); });
    c.addEventListener('focusin', function(){ focused = true; stop(); });
    c.addEventListener('focusout', function(e){ if(!c.contains(e.relatedTarget)){ focused = false; start(); } });
    c.addEventListener('keydown', function(e){
      if(e.key === 'ArrowRight'){ userGo(i + 1); e.preventDefault(); }
      else if(e.key === 'ArrowLeft'){ userGo(i - 1); e.preventDefault(); }
    });

    var x0 = null;
    c.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; stop(); }, { passive: true });
    c.addEventListener('touchend', function(e){
      if(x0 === null){ return; }
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if(Math.abs(dx) > 40){ userGo(dx < 0 ? i + 1 : i - 1); } else { start(); }
    }, { passive: true });

    document.addEventListener('visibilitychange', function(){ if(document.hidden){ stop(); } else { start(); } });

    go(0); start();
  }

  var cs = document.querySelectorAll('.carousel, .review-carousel');
  for(var ci = 0; ci < cs.length; ci++){ initCarousel(cs[ci]); }
})();
