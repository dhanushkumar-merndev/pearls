/* =========================================================
   Pearl Aesthetic & Wellness — site behaviour
   Vanilla JS. Only dependency is Lenis (vendored, loaded before this).
   ========================================================= */
(function () {
  'use strict';

  /* ---- Clinic constants (edit these in one place) ---- */
  var CLINIC = {
    phone: '+917900802060',
    whatsapp: '917900802060',
    email: 'info@pearlaesthetic.in'
  };

  var on = function (el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt); };
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1. Lenis smooth scroll
     Skipped entirely when the user asks for reduced motion —
     hijacking the scroll is exactly what that setting is about.
     ========================================================= */
  var lenis = null;

  if (!reduceMotion && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.05,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      // Native momentum on touch is better than anything we can emulate,
      // and re-implementing it costs battery on mobile.
      smoothTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
      autoRaf: false
    });

    var raf = function (time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Anchor links go through Lenis so the easing matches the rest of the page.
    var navH = function () {
      return (parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h'), 10) || 78) + 16;
    };

    $$('a[href*="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      // The Treatments link opens the dropdown; it must not also scroll.
      if (a.parentElement && a.parentElement.classList.contains('has-menu')) return;

      var hash = href.slice(href.indexOf('#'));
      var samePage = href.indexOf('#') === 0 ||
        href.split('#')[0] === location.pathname.split('/').pop();
      if (!samePage || hash.length < 2) return;

      var settle = null;

      on(a, 'click', function (e) {
        var target = document.getElementById(hash.slice(1));
        if (!target) return;
        e.preventDefault();

        lenis.scrollTo(target, { offset: -navH(), duration: 1.15 });
        if (history.pushState) history.replaceState(null, '', hash);

        // Lenis animates over requestAnimationFrame. If rAF is throttled —
        // background tab, low-power mode, a busy main thread — the animation
        // can stall part-way and the link silently under-shoots. Snap to the
        // destination if we are not there shortly after it should have landed.
        clearTimeout(settle);
        settle = setTimeout(function () {
          var want = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navH());
          if (Math.abs(window.scrollY - want) > 8) window.scrollTo(0, want);
        }, 1600);
      });
    });
  }

  /* =========================================================
     2. Sticky nav — rAF-throttled so scrolling never does
        layout work on every wheel event.
     ========================================================= */
  var nav = $('.nav');
  if (nav) {
    var ticking = false;
    var applyStuck = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 10);
      ticking = false;
    };
    applyStuck();
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(applyStuck);
    };
    if (lenis) lenis.on('scroll', onScroll);
    else window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* =========================================================
     3. Treatments dropdown
     Works by click/tap as well as hover. CSS handles hover, but only
     behind (hover: hover) — on touch, :hover latches after a tap and
     the menu can never be dismissed.
     ========================================================= */
  var menus = $$('.has-menu');

  function closeMenus(except) {
    menus.forEach(function (m) {
      if (m === except) return;
      m.classList.remove('is-open');
      var t = $(':scope > a', m);
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  menus.forEach(function (m) {
    var trigger = $(':scope > a', m);
    var panel = $('.mega', m);
    if (!trigger || !panel) return;

    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    on(trigger, 'click', function (e) {
      // The trigger is also a real link to #treatments. First tap opens the
      // menu; the links inside are the actual destinations.
      e.preventDefault();
      var open = m.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(open));
      closeMenus(m);
    });

    on(trigger, 'keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        m.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        var first = $('a', panel);
        if (first) first.focus();
      }
    });

    // Leaving with the pointer closes a click-opened menu too.
    on(m, 'mouseleave', function () {
      m.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });

  on(document, 'click', function (e) {
    if (!e.target.closest('.has-menu')) closeMenus(null);
  });

  on(document, 'keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMenus(null);
    var open = $('.has-menu.is-open > a');
    if (open) open.focus();
  });

  /* =========================================================
     4. Mobile drawer
     ========================================================= */
  var toggle = $('.nav__toggle');
  var drawer = $('.drawer');
  var scrim  = $('.scrim');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    if (scrim) scrim.classList.toggle('is-open', open);
    if (toggle) {
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }
    document.body.style.overflow = open ? 'hidden' : '';
    // Lenis keeps its own scroll loop running, so overflow:hidden alone
    // will not stop the page moving behind the drawer.
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  }

  on(toggle, 'click', function () { setDrawer(!drawer.classList.contains('is-open')); });
  on(scrim, 'click', function () { setDrawer(false); });
  on($('.drawer__close'), 'click', function () { setDrawer(false); });
  $$('.drawer a').forEach(function (a) { on(a, 'click', function () { setDrawer(false); }); });
  on(document, 'keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* =========================================================
     5. Scroll reveal
     will-change is set only for the duration of each transition, so we
     never hold dozens of composited layers alive at once.
     ========================================================= */
  var revealables = $$('.reveal');

  function show(el) {
    el.classList.add('is-animating', 'is-in');
    var done = function () {
      el.classList.remove('is-animating');
      el.removeEventListener('transitionend', done);
    };
    el.addEventListener('transitionend', done);
    setTimeout(done, 1200);
  }

  if (revealables.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      // Anything already on screen at load shows immediately. Waiting for the
      // observer leaves above-the-fold content briefly blank, and inside an
      // iframe or an unusual viewport it may not fire at all.
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealables.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) { el.classList.add('is-in'); return; }
        el.style.transitionDelay = ((i % 4) * 70) + 'ms';
        io.observe(el);
      });

      // Safety net: nothing stays invisible, whatever happens above.
      setTimeout(function () {
        revealables.forEach(function (el) { el.classList.add('is-in'); });
      }, 2500);
    } else {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* =========================================================
     6. Accordion
     ========================================================= */
  $$('.acc__btn').forEach(function (btn) {
    on(btn, 'click', function () {
      var item  = btn.closest('.acc__item');
      var panel = $('.acc__panel', item);
      var open  = item.classList.contains('is-open');

      $$('.acc__item', item.closest('.acc')).forEach(function (sib) {
        sib.classList.remove('is-open');
        var p = $('.acc__panel', sib);
        if (p) p.style.maxHeight = null;
        var b = $('.acc__btn', sib);
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      if (!open) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
        if (lenis) lenis.resize();
      }
    });
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      $$('.acc__item.is-open .acc__panel').forEach(function (p) {
        p.style.maxHeight = p.scrollHeight + 'px';
      });
      if (lenis) lenis.resize();
    }, 120);
  }, { passive: true });

  /* =========================================================
     7. Before / after slider
     ========================================================= */
  $$('.ba').forEach(function (ba) {
    var after  = $('.ba__pane--after', ba);
    var handle = $('.ba__handle', ba);
    if (!after || !handle) return;

    var dragging = false;
    var pending = null;
    var initial = parseFloat(getComputedStyle(ba).getPropertyValue('--compare-pos')) || 68;

    function paint() {
      if (pending === null) return;
      after.style.clipPath = 'inset(0 0 0 ' + pending + '%)';
      handle.style.left = pending + '%';
      ba.setAttribute('aria-valuenow', String(Math.round(pending)));
      pending = null;
    }

    function setPos(clientX) {
      var rect = ba.getBoundingClientRect();
      var pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      if (pending === null) requestAnimationFrame(paint);
      pending = pct;
    }

    on(ba, 'pointerdown', function (e) {
      e.preventDefault();
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      if (lenis) lenis.stop();
      setPos(e.clientX);
    }, { passive: false });
    on(ba, 'pointermove', function (e) {
      if (!dragging) return;
      e.preventDefault();
      setPos(e.clientX);
    }, { passive: false });
    var release = function () {
      dragging = false;
      if (lenis) lenis.start();
    };
    on(ba, 'pointerup', release);
    on(ba, 'pointercancel', release);

    ba.setAttribute('tabindex', '0');
    ba.setAttribute('role', 'slider');
    ba.setAttribute('aria-label', 'Before and after comparison');
    ba.setAttribute('aria-valuemin', '0');
    ba.setAttribute('aria-valuemax', '100');
    ba.setAttribute('aria-valuenow', String(Math.round(initial)));

    on(ba, 'keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var current = parseFloat(handle.style.left) || initial;
      var next = Math.max(0, Math.min(100, e.key === 'ArrowLeft' ? current - 4 : current + 4));
      after.style.clipPath = 'inset(0 0 0 ' + next + '%)';
      handle.style.left = next + '%';
      ba.setAttribute('aria-valuenow', String(Math.round(next)));
    });
  });

  /* =========================================================
     8. Booking form → WhatsApp (mailto fallback)
     ========================================================= */
  var form = $('#bookingForm');
  if (form) {
    on(form, 'submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var get = function (k) { return (data.get(k) || '').toString().trim(); };

      var name      = get('name');
      var phone     = get('phone');
      var email     = get('email');
      var procedure = get('procedure');
      var consult   = get('consult');
      var pref      = get('preferred');
      var time      = get('time');
      var message   = get('message');

      var status = $('#formStatus');
      var reject = function (field, msg) {
        if (field) field.focus();
        if (status) { status.textContent = msg; status.style.color = '#b4342b'; }
      };

      if (!name)  return reject(form.elements.name, 'Please enter your name so we know who to call back.');
      if (!phone) return reject(form.elements.phone, 'Please enter a phone number so we can reach you.');

      var consent = form.elements.consent;
      if (consent && !consent.checked) {
        return reject(consent, 'Please tick the consent box so we are allowed to contact you.');
      }

      var lines = [
        'New appointment request — Pearl Aesthetic',
        '',
        'Name: ' + name,
        'Phone: ' + phone
      ];
      if (email)     lines.push('Email: ' + email);
      if (procedure) lines.push('Interested in: ' + procedure);
      if (consult)   lines.push('Consultation type: ' + consult);
      if (pref)      lines.push('Preferred date: ' + pref);
      if (time)      lines.push('Preferred time: ' + time);
      if (message)   lines.push('', 'Notes: ' + message);

      var body = lines.join('\n');
      var win = window.open('https://wa.me/' + CLINIC.whatsapp + '?text=' + encodeURIComponent(body),
        '_blank', 'noopener');

      if (!win) {
        window.location.href = 'mailto:' + CLINIC.email +
          '?subject=' + encodeURIComponent('Appointment request — ' + name) +
          '&body=' + encodeURIComponent(body);
      }

      if (status) {
        status.textContent = 'Opening WhatsApp with your details… if nothing happens, call ' +
          CLINIC.phone.replace('+91', '+91 ') + '.';
        status.style.color = 'var(--gold-deep)';
      }
      form.reset();
    });
  }

  /* =========================================================
     9. Active nav link on scroll (home page only)
     ========================================================= */
  var sectionLinks = $$('.nav__links a[href*="#"]').filter(function (a) {
    return a.getAttribute('href').indexOf('#') > -1 && !a.closest('.has-menu');
  });

  if (sectionLinks.length && 'IntersectionObserver' in window) {
    var targets = sectionLinks.map(function (a) {
      var h = a.getAttribute('href');
      return document.getElementById(h.slice(h.indexOf('#') + 1));
    }).filter(Boolean);

    if (targets.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          sectionLinks.forEach(function (a) {
            var h = a.getAttribute('href');
            a.classList.toggle('is-active', h.slice(h.indexOf('#') + 1) === entry.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      targets.forEach(function (t) { spy.observe(t); });
    }
  }

  /* =========================================================
     10. Current year
     ========================================================= */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* =========================================================
     11. Number counter animation (IntersectionObserver triggered)
     ========================================================= */
  var counters = $$('[data-count]');
  if (counters.length) {
    var animateCounter = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      if (isNaN(target)) return;

      // Lock ALL parent container heights to prevent any layout shifts/jiggling
      var lockHeight = function (container) {
        if (container && !container.dataset.heightLocked) {
          container.style.minHeight = container.offsetHeight + 'px';
          container.dataset.heightLocked = '1';
        }
      };
      lockHeight(el.closest('.stats'));
      lockHeight(el.closest('.hero__trust'));
      lockHeight(el.closest('.split__visual'));
      // Lock this cell's own height too
      var cell = el.closest('.stats > div');
      if (cell) { cell.style.minHeight = cell.offsetHeight + 'px'; }

      var duration = 1600;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var easeOut = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(easeOut * target);
        el.textContent = prefix + current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target + suffix;
        }
      }

      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window && !reduceMotion) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    } else {
      counters.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        if (!isNaN(target)) el.textContent = prefix + target + suffix;
      });
    }
  }
})();
