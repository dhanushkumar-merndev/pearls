/* =========================================================
   Pearl Aesthetic & Wellness — enquiry form
   Sends the form to the CRM (data-enquiry-api), where it becomes a lead
   for the patient-care team. If the CRM cannot be reached, the visitor is
   offered the same details as a pre-filled WhatsApp message instead, so an
   enquiry is never lost.
   ========================================================= */
(function () {
  'use strict';

  var form = document.getElementById('bookingForm');
  if (!form) return;

  var API = form.getAttribute('data-enquiry-api') || '';
  var WHATSAPP = form.getAttribute('data-whatsapp') || '';
  var TIMEOUT_MS = 20000;
  var result = document.getElementById('formResult');
  var note = document.getElementById('formStatus');
  var submit = form.querySelector('[type="submit"]');
  var submitLabel = submit ? submit.textContent : '';

  // Bots submit instantly; the CRM rejects forms filled faster than a person can.
  var startedAt = Date.now();
  // Reused on retry until the CRM confirms, so a double click or a retry after
  // a dropped connection never creates a second lead.
  var newKey = function () {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  };
  var idempotencyKey = newKey();

  var offer = (new URLSearchParams(location.search).get('offer') || '').trim().slice(0, 120);

  var field = function (name) { return form.elements[name]; };
  var value = function (name) { var el = field(name); return el ? String(el.value || '').trim() : ''; };

  /* ---- Inline errors ---- */
  function setError(name, message) {
    var el = field(name);
    if (!el) return;
    var box = document.getElementById(el.id + '-err');
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (box) { box.textContent = message || ''; box.hidden = !message; }
  }
  function clearErrors() {
    ['name', 'phone', 'email', 'preferredDate', 'message', 'consent'].forEach(function (n) { setError(n, ''); });
  }

  // The CRM accepts a preferred date from today (IST) up to one year ahead.
  var istDate = function (d) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d); };
  var dateLimits = (function () {
    var now = new Date();
    var later = new Date(now.getTime());
    later.setFullYear(later.getFullYear() + 1);
    return { min: istDate(now), max: istDate(later) };
  })();
  if (field('preferredDate')) {
    field('preferredDate').min = dateLimits.min;
    field('preferredDate').max = dateLimits.max;
  }

  var digits = function (s) { return s.replace(/[\s()+.-]/g, ''); };
  function validate() {
    var errors = {};
    if (value('name').length < 2) errors.name = 'Please enter your name so we know who to call back.';
    var phone = digits(value('phone')).replace(/^(?:0091|91|0)(?=[6-9]\d{9}$)/, '');
    if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    var email = value('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please check the email address.';
    var date = value('preferredDate');
    if (date && (date < dateLimits.min || date > dateLimits.max)) errors.preferredDate = 'Please choose a date between today and one year from now.';
    if (!field('consent').checked) errors.consent = 'Please tick the consent box so we are allowed to contact you.';
    return errors;
  }

  function showErrors(errors) {
    var first = null;
    Object.keys(errors).forEach(function (name) {
      setError(name, errors[name]);
      if (!first && field(name)) first = field(name);
    });
    if (first) first.focus();
  }

  /* ---- Result panel ---- */
  function show(kind, html) {
    result.className = 'form-result form-result--' + kind;
    result.innerHTML = '';
    result.appendChild(html);
    result.hidden = false;
  }
  function message(text, extra) {
    var frag = document.createDocumentFragment();
    var p = document.createElement('p');
    p.textContent = text;
    frag.appendChild(p);
    if (extra) frag.appendChild(extra);
    return frag;
  }

  function whatsappText() {
    var lines = ['New appointment request — Pearl Aesthetic', '', 'Name: ' + value('name'), 'Phone: ' + value('phone')];
    if (value('email')) lines.push('Email: ' + value('email'));
    if (value('procedure')) lines.push('Interested in: ' + value('procedure'));
    if (offer) lines.push('Offer: ' + offer);
    if (value('consultType')) lines.push('Consultation type: ' + value('consultType'));
    if (value('preferredDate')) lines.push('Preferred date: ' + value('preferredDate'));
    if (value('preferredTime')) lines.push('Preferred time: ' + value('preferredTime'));
    if (value('message')) lines.push('', 'Notes: ' + value('message'));
    return lines.join('\n');
  }
  function fallback(text) {
    var a = document.createElement('a');
    a.className = 'btn btn--ghost';
    a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(whatsappText());
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Send these details on WhatsApp';
    show('error', message(text, a));
  }

  function busy(on) {
    if (!submit) return;
    submit.disabled = on;
    submit.textContent = on ? 'Sending…' : submitLabel;
    form.setAttribute('aria-busy', on ? 'true' : 'false');
  }

  /* ---- Submit ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    result.hidden = true;

    var errors = validate();
    if (Object.keys(errors).length) { showErrors(errors); return; }
    if (!/^https?:\/\//.test(API)) { fallback('Online enquiries are not available right now.'); return; }

    // multipart/form-data keeps this a "simple" CORS request (no preflight).
    var data = new FormData();
    ['name', 'phone', 'email', 'procedure', 'consultType', 'preferredDate', 'preferredTime', 'message', 'website']
      .forEach(function (n) { data.append(n, value(n)); });
    data.append('offer', offer);
    data.append('sourcePage', location.pathname.slice(0, 200));
    data.append('consent', 'yes');
    data.append('idempotencyKey', idempotencyKey);
    data.append('startedAt', String(startedAt));

    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    busy(true);

    fetch(API, { method: 'POST', body: data, mode: 'cors', credentials: 'omit', headers: { Accept: 'application/json' }, signal: ctrl && ctrl.signal })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) { return { status: res.status, body: body || {} }; });
      })
      .then(function (r) {
        if (r.status === 201 || r.status === 200) {
          var ref = typeof r.body.reference === 'string' ? r.body.reference.slice(0, 40) : '';
          show('success', message('Thank you — your enquiry has reached our patient-care team' +
            (ref ? ' (reference ' + ref + ')' : '') + '. We will call you back shortly to arrange your consultation.'));
          form.reset();
          idempotencyKey = newKey();
          startedAt = Date.now();
          if (note) note.hidden = true;
          result.focus && result.setAttribute('tabindex', '-1');
          result.focus && result.focus();
          return;
        }
        if (r.status === 400 && r.body.fields && typeof r.body.fields === 'object') {
          var mapped = {};
          Object.keys(r.body.fields).forEach(function (k) {
            if (field(k)) mapped[k] = String(r.body.fields[k]).slice(0, 200);
          });
          if (Object.keys(mapped).length) { showErrors(mapped); return; }
          show('error', message('Please check the details and try again.'));
          return;
        }
        if (r.status === 413) { show('error', message('Your message is too long. Please shorten it and try again.')); return; }
        if (r.status === 429) { fallback('We have received several enquiries from this connection. Please try again in a few minutes, or send your details on WhatsApp.'); return; }
        fallback('Sorry — we could not send your enquiry just now. You can send the same details on WhatsApp, or call ' + (WHATSAPP ? '+' + WHATSAPP : 'the clinic') + '.');
      })
      .catch(function () {
        fallback('Sorry — we could not reach our enquiry system. You can send the same details on WhatsApp instead.');
      })
      .then(function () { if (timer) clearTimeout(timer); busy(false); });
  });

  // Clear a field's error as soon as the visitor starts correcting it.
  form.addEventListener('input', function (e) {
    if (e.target && e.target.name && e.target.getAttribute('aria-invalid') === 'true') setError(e.target.name, '');
  });
})();
