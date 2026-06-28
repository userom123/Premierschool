/* =============================================================
   Premier Schools Exhibition — interactions
   No frameworks. Plain DOM + a small helper for the horizontal
   text slider in the hero and the highlights carousel below.
   ============================================================= */
(function () {
  'use strict';

  /** Honour the user's OS preference for reduced motion. */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Tiny shorthand. */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* =============================================================
     1. Hero text slider (horizontal axis of the dual-axis hero)
     ============================================================= */
  function initTextSlider() {
    var root  = $('#textSlider');
    var track = $('#textTrack');
    if (!root || !track) return;

    var slides = $$('.text-slider__slide', track);
    var dotsBox = $('#slideDots');
    var prev = $('#prevSlide');
    var next = $('#nextSlide');
    var current = 0;
    var timer;

    // Build dots
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      d.addEventListener('click', function () { go(i); restart(); });
      dotsBox.appendChild(d);
    });
    var dots = $$('.dot', dotsBox);

    function go(i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-current * 100) + '%)';
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', k === current ? 'false' : 'true'); });
      dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === current ? 'true' : 'false'); });
    }

    function start() {
      if (reduceMotion) return;
      stop();
      timer = setInterval(function () { go(current + 1); }, 6000);
    }
    function stop()    { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    prev.addEventListener('click', function () { go(current - 1); restart(); });
    next.addEventListener('click', function () { go(current + 1); restart(); });

    // Pause when the user hovers or focuses inside the slider.
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    // Pause when the tab is not visible (saves CPU and avoids surprises).
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    // Keyboard support.
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(current - 1); restart(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); restart(); }
    });

    // Touch / pointer swipe.
    var startX = 0, dx = 0, dragging = false;
    root.addEventListener('pointerdown', function (e) { dragging = true; startX = e.clientX; dx = 0; stop(); });
    root.addEventListener('pointermove', function (e) { if (dragging) dx = e.clientX - startX; });
    function release() {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 50) (dx < 0 ? go(current + 1) : go(current - 1));
      start();
    }
    root.addEventListener('pointerup', release);
    root.addEventListener('pointercancel', release);
    root.addEventListener('pointerleave', release);

    go(0);
    start();
  }

  /* =============================================================
     2. Participating school logos (sling)
     Two rows, alternating direction. Logos are decorative SVG
     placeholders — swap the markup later for real partner logos.
     ============================================================= */
  function initSling() {
    var top = $('#slingTop');
    var bot = $('#slingBot');
    if (!top || !bot) return;

    var logos = [
      { color: '#1A2A6C', text: 'HARROW',     sub: 'BANGKOK' },
      { color: '#7A1B1B', text: 'SHREWSBURY', sub: 'INTERNATIONAL' },
      { color: '#B71C1C', text: "King's",     sub: 'College India' },
      { color: '#5C4326', text: 'WOODSTOCK',  sub: 'SCHOOL' },
      { color: '#2E7D32', text: 'AGA KHAN',   sub: 'ACADEMY' },
      { color: '#0E4D92', text: 'TISB',       sub: 'INTERNATIONAL' },
      { color: '#5A431F', text: 'DPS',        sub: 'INTERNATIONAL' },
      { color: '#0E4D92', text: 'RIS',        sub: 'RYAN INTL.' }
    ];

    function logoHTML(l) {
      return ''
        + '<div class="logo" role="img" aria-label="' + l.text + ' ' + l.sub + '">'
        +   '<svg viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg">'
        +     '<circle cx="80" cy="40" r="22" fill="none" stroke="' + l.color + '" stroke-width="2"/>'
        +     '<text x="80" y="46" text-anchor="middle" font-family="serif" font-size="12" font-weight="700" fill="' + l.color + '">' + l.text + '</text>'
        +     '<text x="80" y="82" text-anchor="middle" font-family="sans-serif" font-size="8" letter-spacing="1" fill="' + l.color + '">' + l.sub + '</text>'
        +   '</svg>'
        + '</div>';
    }

    // Render each row twice so the CSS marquee can loop seamlessly.
    top.innerHTML = logos.map(logoHTML).join('') + logos.map(logoHTML).join('');
    var reversed = logos.slice().reverse();
    bot.innerHTML = reversed.map(logoHTML).join('') + reversed.map(logoHTML).join('');
  }

  /* =============================================================
     3. Choose-the-school: scroll position -> active dot (mobile)
     ============================================================= */
  function initChooseDots() {
    var grid = $('#chooseGrid');
    var dotsBox = $('#chooseDots');
    if (!grid || !dotsBox) return;

    var cards = $$('.card', grid);
    cards.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Show category ' + (i + 1));
      d.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      d.addEventListener('click', function () {
        cards[i].scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      });
      dotsBox.appendChild(d);
    });
    var dots = $$('.dot', dotsBox);

    // Find the card closest to the centre as the user scrolls.
    grid.addEventListener('scroll', function () {
      var r = grid.getBoundingClientRect();
      var mid = r.left + r.width / 2;
      var best = 0, bestDist = Infinity;
      cards.forEach(function (c, i) {
        var cr = c.getBoundingClientRect();
        var d = Math.abs(cr.left + cr.width / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      dots.forEach(function (d, i) { d.setAttribute('aria-selected', i === best ? 'true' : 'false'); });
    }, { passive: true });
  }

  /* =============================================================
     4. Highlights slider ("What makes this exhibition...")
     ============================================================= */
  function initHighlights() {
    var track = $('#hiTrack');
    var root  = $('#hiSlider');
    if (!track || !root) return;

    var items = [
      { title: 'Interact Directly with School Heads',   text: 'Get answers straight from the experts.',
        svg: '<circle cx="24" cy="18" r="7"/><path d="M10 40c0-8 6-12 14-12s14 4 14 12"/><path d="M16 12 24 8l8 4"/>' },
      { title: 'Compare Curriculum & Pedagogy',         text: 'Understand the differences between CBSE, ICSE, IB, Cambridge, Finnish & more.',
        svg: '<rect x="8" y="8" width="20" height="32" rx="2"/><path d="M14 16h8M14 22h8M14 28h6"/><path d="M32 14h8M32 22h8M32 30h8"/>' },
      { title: 'Get Exclusive Fee Structures & Offers', text: 'Access transparent information and avail offers.',
        svg: '<path d="M24 4 28 8l6-1 2 6 6 3-2 6 2 6-6 3-2 6-6-1-4 4-4-4-6 1-2-6-6-3 2-6-2-6 6-3 2-6 6 1z"/><path d="M18 28 30 16"/><circle cx="19" cy="19" r="2"/><circle cx="29" cy="29" r="2"/>' },
      { title: 'Explore Schools Offerings',             text: 'Preview infrastructure, co-curricular, teaching methodology and culture.',
        svg: '<rect x="6" y="10" width="36" height="26" rx="3"/><path d="M12 18h10M12 24h18M12 30h14"/><circle cx="36" cy="22" r="3"/>' },
      { title: 'On-the-spot Counselling',               text: 'Save time on applications with guidance from experts.',
        svg: '<circle cx="16" cy="18" r="6"/><path d="M6 40c0-6 4-10 10-10s10 4 10 10"/><rect x="28" y="10" width="16" height="12" rx="2"/><path d="M30 16h10"/>' },
      { title: 'Network with Like-minded Parents',      text: 'Share experiences and learn from real parent stories.',
        svg: '<circle cx="24" cy="24" r="4"/><circle cx="10" cy="12" r="3"/><circle cx="38" cy="12" r="3"/><circle cx="10" cy="36" r="3"/><circle cx="38" cy="36" r="3"/><path d="M13 14l9 8M35 14l-9 8M13 34l9-8M35 34l-9-8"/>' }
    ];

    track.innerHTML = items.map(function (it) {
      return ''
        + '<div class="hi-card" role="group" aria-roledescription="slide">'
        +   '<div class="hi-card__icon">'
        +     '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        +     it.svg
        +     '</svg>'
        +   '</div>'
        +   '<h3 class="hi-card__title">' + it.title + '</h3>'
        +   '<p class="hi-card__text">'  + it.text  + '</p>'
        + '</div>';
    }).join('');

    var index = 0;
    function visibleCount() {
      var w = window.innerWidth;
      if (w < 720)  return 1;
      if (w < 1100) return 3;
      return 4;
    }
    function apply() {
      var firstCard = track.children[0];
      if (!firstCard) return;
      var slideWidth = firstCard.getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      var maxIndex = Math.max(0, track.children.length - visibleCount());
      if (index > maxIndex) index = maxIndex;
      track.style.transform = 'translateX(' + -(index * (slideWidth + gap)) + 'px)';
    }

    $('#hiPrev').addEventListener('click', function () { index = Math.max(0, index - 1); apply(); });
    $('#hiNext').addEventListener('click', function () {
      var maxIndex = Math.max(0, track.children.length - visibleCount());
      index = Math.min(maxIndex, index + 1);
      apply();
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); $('#hiPrev').click(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); $('#hiNext').click(); }
    });

    window.addEventListener('resize', apply);
    apply();
  }

  /* =============================================================
     5. Enquire form (front-end only validation + ack message)
     ============================================================= */
  function initEnquireForm() {
    var form = $('#enquireForm');
    var msg  = $('#enquireMsg');
    if (!form || !msg) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        msg.style.color = '#ffd1d1';
        msg.textContent = 'Please fill in all fields correctly.';
        return;
      }
      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      msg.style.color = '';
      msg.textContent = 'Thanks ' + name + '! We will reach you at ' + phone + ' shortly.';
      form.reset();
    });
  }

  /* ----------------------- boot ----------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initTextSlider();
    initSling();
    initChooseDots();
    initHighlights();
    initEnquireForm();
  });
})();
