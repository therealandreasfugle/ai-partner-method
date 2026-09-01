/* ==========================================================================
   CORE / BEHAVIOURS
   Shared interactions, all opt-in via data attributes so a template only gets
   what its markup asks for.

     data-letters      split a button label into per-glyph roll spans
     data-fit          size display text to span its container exactly
     data-trail        cursor image trail (wrapper holding <figure> children)
     data-accordion    click-to-open panels
     data-filter       filter chips paired with [data-filterable] items
     data-marquee      duplicate a track so it scrolls seamlessly
     .reveal           fade up on scroll
     .reveal-stagger   fade up children in sequence
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Letter-roll buttons ---------------------------------------------- */

  function splitLetters(el) {
    var label = el.textContent.trim();
    var outer = document.createElement('span');

    label.split('').forEach(function (ch) {
      if (ch === ' ') {
        outer.appendChild(document.createTextNode(' '));
        return;
      }
      var s = document.createElement('span');
      s.className = 'ltr';
      s.textContent = ch;
      outer.appendChild(s);
    });

    el.textContent = '';
    el.appendChild(outer);
    el.setAttribute('aria-label', label);
  }

  document.querySelectorAll('[data-letters]').forEach(splitLetters);

  /* --- Fit-to-width display type ----------------------------------------
     Sizes text so it spans its container exactly. Measured with a Range
     because scrollWidth clamps to the box and would always return a ratio
     of 1 on a full-width element. */

  var measureRange = document.createRange();

  function fitText(el) {
    var parent = el.parentElement;
    if (!parent) return;

    var available = parent.clientWidth;
    if (!available) return;

    el.style.fontSize = '100px';
    measureRange.selectNodeContents(el);
    var natural = measureRange.getBoundingClientRect().width;
    if (!natural) return;

    el.style.fontSize = (100 * available / natural) + 'px';
    el.style.opacity = '1';
  }

  var fitTargets = Array.prototype.slice.call(document.querySelectorAll('[data-fit]'));

  function fitAll() { fitTargets.forEach(fitText); }

  if (fitTargets.length) {
    fitAll();
    window.addEventListener('resize', fitAll);
    window.addEventListener('load', fitAll);
    // Re-fit once the webfont swaps in, or the measurement used the fallback.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  }

  /* --- Nav overlay -------------------------------------------------------- */

  var toggle = document.querySelector('.navbar__toggle');
  var panel = document.querySelector('.navbar__panel');

  if (toggle && panel) {
    var setNav = function (open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', function () {
      setNav(!document.body.classList.contains('nav-open'));
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setNav(false);
    });
  }

  /* --- Past-hero flag ------------------------------------------------------
     Lets a nav sitting over a hero switch ink once the hero scrolls away. */

  var heroEl = document.querySelector('.hero');

  if (heroEl) {
    var syncPastHero = function () {
      var limit = heroEl.offsetHeight - 90;
      document.body.classList.toggle('past-hero', window.scrollY > limit);
    };
    window.addEventListener('scroll', syncPastHero, { passive: true });
    window.addEventListener('resize', syncPastHero);
    syncPastHero();
  }

  /* --- Cursor image trail -------------------------------------------------
     Past a distance threshold, reveal the next image at the pointer and fade
     it out. Images cycle so the set never runs dry. */

  var trail = document.querySelector('[data-trail]');

  if (trail && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var items = Array.prototype.slice.call(trail.querySelectorAll('figure'));
    var host = trail.closest('section') || trail.parentElement;
    var index = 0;
    var depth = 0;
    var last = null;
    var threshold = 120;

    host.addEventListener('mousemove', function (e) {
      var rect = trail.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      if (last) {
        var dx = x - last.x;
        var dy = y - last.y;
        if (Math.sqrt(dx * dx + dy * dy) < threshold) return;
      }
      last = { x: x, y: y };

      var el = items[index % items.length];
      index++;
      depth++;

      var px = x - el.offsetWidth / 2;
      var py = y - el.offsetHeight / 2;
      var at = function (scale) {
        return 'translate3d(' + px + 'px, ' + py + 'px, 0) scale(' + scale + ')';
      };

      el.style.transition = 'none';
      el.style.zIndex = String(depth);
      el.style.transform = at(0.8);
      el.style.opacity = '0';
      el.style.visibility = 'visible';

      void el.offsetWidth; // commit the reset before animating

      el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease';
      el.style.transform = at(1);
      el.style.opacity = '1';

      clearTimeout(el._hideTimer);
      el._hideTimer = setTimeout(function () {
        el.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        el.style.transform = at(0.85);
        el.style.opacity = '0';
      }, 500);
    });

    host.addEventListener('mouseleave', function () {
      last = null;
      items.forEach(function (el) {
        clearTimeout(el._hideTimer);
        el.style.transition = 'opacity 0.5s ease';
        el.style.opacity = '0';
      });
    });
  }

  /* --- Filter chips -------------------------------------------------------- */

  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var filterables = Array.prototype.slice.call(document.querySelectorAll('[data-cat]'));

  function applyFilter(cat) {
    filters.forEach(function (f) {
      f.setAttribute('aria-pressed', String(f.dataset.filter === cat));
    });

    filterables.forEach(function (item) {
      var show = cat === 'all' || item.dataset.cat === cat;
      item.hidden = !show;
      if (show) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(0.75rem)';
        requestAnimationFrame(function () {
          item.style.opacity = '1';
          item.style.transform = 'none';
        });
      }
    });
  }

  filters.forEach(function (f) {
    f.addEventListener('click', function () { applyFilter(f.dataset.filter); });
  });

  document.querySelectorAll('[data-jump]').forEach(function (link) {
    link.addEventListener('click', function () { applyFilter(link.dataset.jump); });
  });

  /* --- Accordion ----------------------------------------------------------- */

  document.querySelectorAll('[data-accordion]').forEach(function (group) {
    var single = group.dataset.accordion !== 'multi';

    group.querySelectorAll('.accordion__item').forEach(function (item) {
      var trigger = item.querySelector('.accordion__trigger');
      if (!trigger) return;

      trigger.setAttribute('aria-expanded', item.dataset.open === 'true' ? 'true' : 'false');

      trigger.addEventListener('click', function () {
        var open = item.dataset.open !== 'true';

        if (single && open) {
          group.querySelectorAll('.accordion__item').forEach(function (other) {
            other.dataset.open = 'false';
            var t = other.querySelector('.accordion__trigger');
            if (t) t.setAttribute('aria-expanded', 'false');
          });
        }

        item.dataset.open = String(open);
        trigger.setAttribute('aria-expanded', String(open));
      });
    });
  });

  /* --- Carousel ------------------------------------------------------------
     Prev/next scroll by one card width and disable at the ends. */

  document.querySelectorAll('[data-carousel]').forEach(function (wrap) {
    var track = wrap.querySelector('.carousel');
    var prev = wrap.querySelector('[data-carousel-prev]');
    var next = wrap.querySelector('[data-carousel-next]');
    if (!track) return;

    var step = function () {
      var first = track.firstElementChild;
      return first ? first.offsetWidth + 16 : track.clientWidth * 0.8;
    };

    var sync = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };

    if (prev) prev.addEventListener('click', function () { track.scrollBy({left: -step(), behavior: 'smooth'}); });
    if (next) next.addEventListener('click', function () { track.scrollBy({left: step(), behavior: 'smooth'}); });

    track.addEventListener('scroll', sync, {passive: true});
    window.addEventListener('resize', sync);
    sync();
  });

  /* --- Marquee -------------------------------------------------------------
     Duplicate the track so the loop has no visible seam. */

  document.querySelectorAll('[data-marquee]').forEach(function (m) {
    var track = m.querySelector('.marquee__track');
    if (!track) return;
    var clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    m.appendChild(clone);
  });

  /* --- Forms ---------------------------------------------------------------
     Templates ship with no backend. Rather than silently swallowing a lead,
     an unwired form says so out loud. Set data-endpoint on the form to POST
     the fields as JSON somewhere real. */

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var status = form.querySelector('.form__status');

    var say = function (msg) { if (status) status.textContent = msg; };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var endpoint = form.dataset.endpoint;

      if (!endpoint) {
        say('This form is not connected yet. Add data-endpoint="https://..." to the form tag to start collecting leads.');
        return;
      }

      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });

      say('Sending...');

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed with status ' + res.status);
        form.reset();
        say('Thanks. We will be in touch shortly.');
      }).catch(function (err) {
        say('That did not send: ' + err.message);
      });
    });
  });

  /* --- Scroll reveal -------------------------------------------------------- */

  var revealables = document.querySelectorAll('.reveal, .reveal-stagger');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        if (el.classList.contains('reveal-stagger')) {
          Array.prototype.slice.call(el.children).forEach(function (child, i) {
            child.style.transitionDelay = (i * 0.07) + 's';
          });
        }

        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { io.observe(el); });
  }
})();
