/* =========================================================
   Pearl Aesthetic & Wellness — live offers
   The CRM is the source of truth. This reads its public offers API,
   shows the strip under the navbar, and opens the details modal.
   Nothing here is cached for long: every page load revalidates with
   the CRM, so a price change, unpublish or expiry shows on the next
   load (or when the tab is revisited).
   ========================================================= */
(function () {
  'use strict';

  var bar = document.querySelector('[data-offers-api]');
  var modal = document.querySelector('.offer-modal');
  if (!bar || !modal || !window.fetch) return;

  var API = (bar.getAttribute('data-offers-api') || '').replace(/\/+$/, '');
  if (!/^https?:\/\//.test(API)) return;

  var CACHE_KEY = 'pearl-offers-v1';
  // Shown instantly while revalidating; never older than this.
  var FRESH_MS = 60 * 1000;
  // Used only when the CRM cannot be reached; kept short so an offer the
  // clinic has just withdrawn does not linger.
  var FALLBACK_MS = 5 * 60 * 1000;
  var REVISIT_MS = 60 * 1000;
  var TIMEOUT_MS = 8000;

  var list = bar.querySelector('.offers-bar__list');
  var offers = [];
  var lastFetch = 0;
  var lastFocus = null;
  var openId = null;

  /* ---- Contract tolerance: camelCase or snake_case, paise or rupees ---- */
  var pick = function (o, keys) {
    for (var i = 0; i < keys.length; i++) if (o[keys[i]] !== undefined && o[keys[i]] !== null) return o[keys[i]];
    return null;
  };
  var paise = function (o, base) {
    var p = pick(o, [base + 'PricePaise', base + '_price_paise']);
    if (p !== null && isFinite(p)) return Math.round(Number(p));
    var r = pick(o, [base + 'Price', base + '_price']);
    return r !== null && isFinite(r) ? Math.round(Number(r) * 100) : null;
  };
  var text = function (v, max) { return typeof v === 'string' ? v.trim().slice(0, max) : ''; };
  var safeUrl = function (v) {
    if (typeof v !== 'string' || !v) return '';
    try {
      var u = new URL(v, API);
      return u.protocol === 'https:' || (u.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(u.hostname)) ? u.href : '';
    } catch (e) { return ''; }
  };

  function normalize(o) {
    if (!o || typeof o !== 'object') return null;
    var id = text(String(pick(o, ['id']) || ''), 64);
    var title = text(pick(o, ['title']), 120);
    if (!id || !title) return null;
    var was = paise(o, 'original');
    var now = paise(o, 'offer');
    // A single price is just the price, not a discount.
    if (now === null) { now = was; was = null; }
    return {
      id: id,
      title: title,
      summary: text(pick(o, ['summary', 'tagline']), 160),
      description: text(pick(o, ['description']), 4000),
      terms: text(pick(o, ['terms', 'termsAndConditions', 'terms_and_conditions']), 4000),
      image: safeUrl(pick(o, ['imageUrl', 'image_url', 'image'])),
      was: was,
      now: now,
      startsOn: pick(o, ['startsOn', 'starts_on']),
      endsOn: pick(o, ['endsOn', 'ends_on', 'expiresOn', 'expires_on']),
      startsAt: pick(o, ['startsAt', 'starts_at']),
      endsAt: pick(o, ['endsAt', 'ends_at', 'expiresAt', 'expires_at'])
    };
  }

  /* The CRM filters to live offers; this repeats the date check so a cached
     copy can never show an offer that has since expired. */
  var istToday = function () {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  };
  function isLive(o) {
    var now = Date.now();
    var today = istToday();
    if (o.startsAt && Date.parse(o.startsAt) > now) return false;
    if (o.endsAt && Date.parse(o.endsAt) <= now) return false;
    if (o.startsOn && String(o.startsOn).slice(0, 10) > today) return false;
    if (o.endsOn && String(o.endsOn).slice(0, 10) < today) return false;
    return true;
  }

  var money = function (p) {
    var whole = p % 100 === 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2
    }).format(p / 100);
  };
  var saving = function (o) {
    return o.was && o.now !== null && o.now < o.was ? Math.round((1 - o.now / o.was) * 100) : 0;
  };
  function validity(o) {
    var end = o.endsAt || o.endsOn;
    if (!end) return '';
    var d = o.endsAt ? new Date(o.endsAt) : new Date(String(o.endsOn).slice(0, 10) + 'T12:00:00+05:30');
    if (isNaN(d.getTime())) return '';
    return 'Valid until ' + new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric'
    }).format(d);
  }
  var el = function (tag, cls, content) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (content) n.textContent = content;
    return n;
  };

  /* ---- Cache (per browser, short-lived) ---- */
  function readCache(maxAge) {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && c.api === API && Date.now() - c.at < maxAge && Array.isArray(c.offers)) return c.offers;
    } catch (e) { /* storage blocked or corrupt */ }
    return null;
  }
  function writeCache(raw) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ api: API, at: Date.now(), offers: raw })); } catch (e) { /* ignore */ }
  }

  /* ---- Strip ---- */
  function render(raw) {
    offers = (raw || []).map(normalize).filter(function (o) { return o && isLive(o); });
    list.textContent = '';
    offers.forEach(function (o) {
      var li = el('li', 'offers-bar__item');
      var btn = el('button', 'offer-chip');
      btn.type = 'button';
      btn.setAttribute('data-offer-id', o.id);
      btn.setAttribute('aria-haspopup', 'dialog');
      if (o.image) {
        var img = el('img', 'offer-chip__img');
        img.src = o.image; img.alt = ''; img.width = 32; img.height = 32; img.loading = 'lazy'; img.decoding = 'async';
        btn.appendChild(img);
      }
      btn.appendChild(el('span', 'offer-chip__title', o.title));
      if (o.now !== null) {
        var price = el('span', 'offer-chip__price', money(o.now));
        if (saving(o)) price.appendChild(el('small', null, ' · ' + saving(o) + '% off'));
        btn.appendChild(price);
      }
      btn.appendChild(el('span', 'offer-chip__cta', 'View offer'));
      li.appendChild(btn);
      list.appendChild(li);
    });
    bar.hidden = offers.length === 0;
    bar.classList.toggle('offers-bar--single', offers.length === 1);
    if (openId && !offers.some(function (o) { return o.id === openId; })) unavailable();
  }

  function request(url) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    // no-cache: always revalidate with the CRM (an ETag makes that a cheap 304).
    return fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-cache', headers: { Accept: 'application/json' }, signal: ctrl && ctrl.signal })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (res.status === 404) return { notFound: true };
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }, function (err) { if (timer) clearTimeout(timer); throw err; });
  }

  function load() {
    lastFetch = Date.now();
    return request(API).then(function (body) {
      var raw = Array.isArray(body) ? body : body && (body.offers || body.data);
      if (!Array.isArray(raw)) throw new Error('Unexpected offers payload');
      writeCache(raw);
      render(raw);
    }).catch(function () {
      // CRM unreachable: keep a recent copy if there is one, else show nothing.
      var cached = readCache(FALLBACK_MS);
      render(cached || []);
    });
  }

  /* ---- Modal ---- */
  var m = {
    title: modal.querySelector('.offer-modal__title'),
    media: modal.querySelector('.offer-modal__media'),
    img: modal.querySelector('.offer-modal__media img'),
    price: modal.querySelector('.offer-modal__price'),
    validity: modal.querySelector('.offer-modal__validity'),
    desc: modal.querySelector('.offer-modal__desc'),
    terms: modal.querySelector('.offer-modal__terms'),
    termsBody: modal.querySelector('.offer-modal__terms-body'),
    actions: modal.querySelector('.offer-modal__actions'),
    status: modal.querySelector('.offer-modal__status'),
    book: modal.querySelector('[data-offer-book]'),
    wa: modal.querySelector('[data-offer-wa]')
  };
  var lenis = function () { return window.__pearlLenis || null; };

  function fill(o) {
    m.title.textContent = o.title;
    m.status.hidden = true;
    m.actions.hidden = false;
    m.media.hidden = !o.image;
    if (o.image) { m.img.src = o.image; m.img.alt = o.title; } else m.img.removeAttribute('src');

    m.price.textContent = '';
    if (o.now !== null) {
      m.price.appendChild(el('span', 'offer-modal__now', money(o.now)));
      if (o.was && o.was > o.now) {
        var was = el('s', 'offer-modal__was', money(o.was));
        was.setAttribute('aria-label', 'Originally ' + money(o.was));
        m.price.appendChild(was);
        m.price.appendChild(el('span', 'offer-modal__save', 'Save ' + saving(o) + '%'));
      }
    }
    m.price.hidden = o.now === null;
    m.validity.textContent = validity(o);
    m.validity.hidden = !m.validity.textContent;

    m.desc.textContent = '';
    (o.description || o.summary).split(/\n{2,}|\r\n\r\n/).forEach(function (para) {
      if (para.trim()) m.desc.appendChild(el('p', null, para.trim()));
    });
    m.terms.hidden = !o.terms;
    m.termsBody.textContent = '';
    o.terms.split(/\n+/).forEach(function (line) {
      if (line.trim()) m.termsBody.appendChild(el('p', null, line.trim()));
    });

    var base = m.book.getAttribute('data-href');
    m.book.href = base + (base.indexOf('?') < 0 ? '?' : '&') + 'offer=' + encodeURIComponent(o.title);
    var waNum = m.wa.getAttribute('data-number');
    m.wa.href = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(
      'Hi, I would like to know more about the offer "' + o.title + '"' + (o.now !== null ? ' (' + money(o.now) + ')' : '') + '.');
  }

  function unavailable() {
    m.status.hidden = false;
    m.status.textContent = 'This offer is no longer available.';
    m.actions.hidden = true;
  }

  function open(id, trigger) {
    var o = offers.filter(function (x) { return x.id === id; })[0];
    openId = id;
    lastFocus = trigger || document.activeElement;
    if (o) fill(o);
    else {
      m.title.textContent = 'Loading offer…';
      m.media.hidden = true; m.price.hidden = true; m.validity.hidden = true;
      m.desc.textContent = ''; m.terms.hidden = true; m.actions.hidden = true; m.status.hidden = true;
    }
    if (typeof modal.showModal === 'function') { if (!modal.open) modal.showModal(); } else modal.setAttribute('open', '');
    document.documentElement.classList.add('offer-open');
    if (lenis()) lenis().stop();
    if (history.replaceState) history.replaceState(null, '', '#offer-' + id);

    // The strip may be a minute old; the modal always shows the CRM's latest.
    request(API + '/' + encodeURIComponent(id)).then(function (body) {
      if (openId !== id) return;
      if (body && body.notFound) { unavailable(); load(); return; }
      var fresh = normalize(body && (body.offer || body.data || body));
      if (fresh && isLive(fresh)) fill(fresh); else unavailable();
    }).catch(function () {
      if (openId === id && !o) unavailable();
    });
  }

  function close() {
    openId = null;
    if (modal.open && typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
  }
  modal.addEventListener('close', function () {
    openId = null;
    document.documentElement.classList.remove('offer-open');
    if (lenis()) lenis().start();
    if (/^#offer-/.test(location.hash) && history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  modal.querySelector('.offer-modal__close').addEventListener('click', close);
  // A click on the backdrop lands on the <dialog> itself.
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

  list.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-offer-id]');
    if (btn) open(btn.getAttribute('data-offer-id'), btn);
  });

  /* ---- Boot ---- */
  var cached = readCache(FRESH_MS);
  if (cached) render(cached);
  load().then(function () {
    var deep = /^#offer-([A-Za-z0-9-]{1,64})$/.exec(location.hash);
    if (deep) open(deep[1]);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && Date.now() - lastFetch > REVISIT_MS) load();
  });

  /* An offer's "Book this offer" lands on the appointment form with its name. */
  var params = new URLSearchParams(location.search);
  var chosen = text(params.get('offer') || '', 120);
  var msg = document.getElementById('f-msg');
  if (chosen && msg && !msg.value) msg.value = 'I am interested in the offer: ' + chosen + '.';
})();
