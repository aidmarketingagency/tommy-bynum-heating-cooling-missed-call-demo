(function(){
  // -- prefers-reduced-motion gate --
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reducedMotion(){ return !!motionQuery.matches; }

  // -- SMS thread staged reveal with typing indicators, replayable + re-arms on scroll re-entry --
  var thread = document.getElementById('thread');
  var bubbles = Array.prototype.slice.call(thread.querySelectorAll('.bubble'));
  var typers = { 1: document.getElementById('typing1'), 2: document.getElementById('typing2') };
  var replayBtn = document.getElementById('replayBtn');
  var timers = [];
  var playing = false;

  function clearTimers(){ timers.forEach(function(t){ clearTimeout(t); }); timers = []; }

  function resetThread(){
    bubbles.forEach(function(b){ b.classList.remove('show'); });
    Object.keys(typers).forEach(function(k){ typers[k].classList.remove('show'); });
  }

  function showThreadFinal(){
    clearTimers();
    playing = false;
    bubbles.forEach(function(b){ b.classList.add('show'); });
    Object.keys(typers).forEach(function(k){ typers[k].classList.remove('show'); });
  }

  function playThread(){
    if (reducedMotion()){ showThreadFinal(); return; }
    if (playing) return;
    playing = true;
    clearTimers();
    resetThread();
    var seq = [
      { t: 220,  action: function(){ bubbles[0].classList.add('show'); } },
      { t: 900,  action: function(){ typers[1].classList.add('show'); } },
      { t: 1880, action: function(){ typers[1].classList.remove('show'); bubbles[1].classList.add('show'); } },
      { t: 2680, action: function(){ bubbles[2].classList.add('show'); } },
      { t: 3260, action: function(){ typers[2].classList.add('show'); } },
      { t: 4180, action: function(){ typers[2].classList.remove('show'); bubbles[3].classList.add('show'); playing = false; } }
    ];
    seq.forEach(function(step){ timers.push(setTimeout(step.action, step.t)); });
  }

  replayBtn.addEventListener('click', function(){
    replayBtn.classList.add('spin');
    setTimeout(function(){ replayBtn.classList.remove('spin'); }, 520);
    playThread();
  });

  // Re-arm on scroll re-entry: observer stays alive for the page lifetime
  if ('IntersectionObserver' in window){
    var demoIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          playThread();
        } else if (!reducedMotion()){
          // left the viewport: cancel in-flight sequence so re-entry starts clean
          clearTimers();
          playing = false;
          resetThread();
        }
      });
    }, { threshold: 0.32 });
    demoIO.observe(thread);
  } else {
    playThread();
  }

  // -- Reveal-on-scroll for sections (plays once, never hides content) --
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var revealIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('visible'); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function(el){ revealIO.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('visible'); });
  }

  // -- Animated stat counter: $450, re-arms on scroll re-entry, generation token kills superseded loops --
  // Source: https://hvaccalculatorhub.com/blog/hvac-service-call-costs-2026 ($450 avg emergency HVAC call, range $350-$600)
  var STAT_TARGET = 450;
  var statEl = document.getElementById('statNumber');
  var statReplayBtn = document.getElementById('statReplayBtn');
  var countRun = 0;

  function showStatFinal(){
    countRun++;
    if (statEl) statEl.textContent = '$' + STAT_TARGET;
  }

  function runCount(){
    if (reducedMotion()){ showStatFinal(); return; }
    var runId = ++countRun;
    var dur = 1200;
    var start = null;
    function step(ts){
      if (runId !== countRun) return; // superseded by a newer run -- stop this loop
      if (!start) start = ts;
      var progress = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = Math.round(eased * STAT_TARGET);
      if (statEl) statEl.textContent = '$' + val;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Reduced motion from first paint: show final immediately
  if (reducedMotion()){ showStatFinal(); }

  if (statEl && 'IntersectionObserver' in window){
    var statIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ runCount(); }
      });
    }, { threshold: 0.38 });
    statIO.observe(statEl);
  }

  if (statReplayBtn){
    statReplayBtn.addEventListener('click', function(){
      statReplayBtn.classList.add('spin');
      setTimeout(function(){ statReplayBtn.classList.remove('spin'); }, 520);
      runCount();
    });
  }

  // Mid-session preference toggle: snap to final state if reduce turns on
  if (motionQuery.addEventListener){
    motionQuery.addEventListener('change', function(){
      if (reducedMotion()){ showStatFinal(); showThreadFinal(); }
    });
  }

  // -- A1: sticky mobile CTA bar -- hide while real CTA panel is in view --
  var stickyCta = document.getElementById('stickyCta');
  var ctaPanel = document.getElementById('ctaPanel');
  if (stickyCta && ctaPanel && 'IntersectionObserver' in window){
    // Show sticky bar after a beat so it doesn't flash on load before we know position
    setTimeout(function(){ stickyCta.classList.remove('hide'); }, 800);
    var ctaIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          stickyCta.classList.add('hide');
        } else {
          stickyCta.classList.remove('hide');
        }
      });
    }, { threshold: 0.2 });
    ctaIO.observe(ctaPanel);
  }

})();

(function () {
  var BUBBLE_ID = 'ultra-fast-widget-bubble-54722168';
  var KEY = 'aidDemoWidgetAutoOpened';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) { userTouched = true; }
  }, true);
  var tries = 0;
  var t = setInterval(function () {
    tries += 1;
    var b = document.getElementById(BUBBLE_ID);
    if (b && tries >= 7) {
      clearInterval(t);
      if (!userTouched) { b.click(); }
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }
    if (tries > 30) { clearInterval(t); }
  }, 1000);
})();