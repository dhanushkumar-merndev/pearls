/* =========================================================
   Static site generator — Pearl Aesthetic & Wellness
   Run:  node build/generate.js
   Outputs: index.html, appointment.html, blog.html,
            procedures/<slug>.html, blog/<slug>.html,
            sitemap.xml, robots.txt
   ========================================================= */

const fs = require('fs');
const path = require('path');
const { CLINIC, ICONS, CATEGORIES, RELATED } = require('./data');
const { BLOG } = require('./blog');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.pearlaesthetic.in';

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const svg = (body, cls = '') =>
  `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const totalServices = CATEGORIES.reduce((n, c) =>
  n + c.groups.reduce((m, g) => m + g.services.length, 0), 0);

const catBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

const fmtDate = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
});

/**
 * An <img> inside a gradient-backed figure. If the file is ever missing,
 * the gradient shows instead of a broken-image icon.
 */
const img = (base, file, alt, { w = 1200, h = 800, lazy = true, cls = '' } = {}) =>
  `<img src="${base}assets/img/${file}" alt="${esc(alt)}" width="${w}" height="${h}"${cls ? ` class="${cls}"` : ''}` +
  ` loading="${lazy ? 'lazy' : 'eager'}" decoding="async" onerror="this.style.display='none'">`;

/* Stroke icons */
const UI = {
  phone:  '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail:   '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  pin:    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check:  '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  star:   '<path d="m12 2 3 6.5 7 1-5 4.9 1.2 7L12 18l-6.2 3.4L7 14.4 2 9.5l7-1z" fill="currentColor" stroke="none"/>',
  arrow:  '<path d="M5 12h14M13 6l6 6-6 6"/>',
  wa:     '<path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.2s-.7 1-.9 1.2c-.2.2-.3.2-.6.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5L9.3 7c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3C7 7.4 6.4 8 6.4 9.3s1 2.6 1.1 2.8c.1.2 1.9 2.9 4.6 4 1.7.8 2.4.8 3.2.7.5 0 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"/>',
  fb:     '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  ig:     '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
  shield: '<path d="M12 2 4 5.5V11c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5.5z"/><path d="m9 12 2 2 4-4"/>',
  spark:  '<path d="M12 2.5 13.8 9 20 11l-6.2 2L12 19.5 10.2 13 4 11l6.2-2z"/><path d="M18.5 3.5 19 5l1.5.5L19 6l-.5 1.5L18 6l-1.5-.5L18 5z"/>',
  lock:   '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  cal:    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  caret:  '<path d="m6 9 6 6 6-6"/>'
};

/* ---------------------------------------------------------
   Shared FAQ (used in the page body and in FAQPage schema)
   --------------------------------------------------------- */
const FAQS = [
  ['How do I know whether I need surgery or a non-surgical treatment?',
   'That is exactly what the consultation determines. As a general rule, non-surgical treatments address skin quality, volume and mild laxity; surgery addresses excess tissue and structural descent. A large proportion of people who arrive asking for surgery are better served by something less invasive, and we would rather tell you that than operate.'],
  ['What does a procedure cost?',
   'Cost depends on the technique required, theatre and anaesthetic time, implants or consumables, and the number of follow-ups involved — so a figure quoted before assessment would be a guess. You receive a full written quotation after your consultation, with no obligation and nothing hidden.'],
  ['Is general anaesthesia safe?',
   'All general anaesthesia is administered by a qualified consultant anaesthetist in an accredited theatre, with continuous monitoring during the procedure and through recovery. Your fitness for anaesthesia is assessed beforehand, and we will postpone or decline where the risk is not justified.'],
  ['How long before I can return to work?',
   'It varies widely. Injectables and most laser treatments need no time off. Eyelid surgery typically needs seven to ten days, rhinoplasty ten to fourteen, and abdominoplasty or a body lift three to six weeks. You will be given a realistic timeline in writing before you commit to a date.'],
  ['Will there be visible scarring?',
   'Any surgery leaves a scar. The question is where it sits and how it matures. Incisions are planned within natural creases, hairlines and skin tension lines wherever the anatomy allows, and you will be shown exactly where they will be before you agree to proceed.'],
  ['Do you treat patients travelling from outside Bengaluru?',
   'Yes. We can begin with a video consultation, though an in-person assessment is always required before any surgical procedure is confirmed. For patients travelling in, we will advise how many days you need to stay locally for safe post-operative review.']
];

/* ---------------------------------------------------------
   <head>
   --------------------------------------------------------- */
function head({ title, description, base, canonical, keywords, ogImage }) {
  const image = SITE_URL + '/assets/img/' + (ogImage || 'hero.jpg');
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="keywords" content="${esc(keywords)}">
<meta name="author" content="${esc(CLINIC.name)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#17110A">

<meta name="geo.region" content="IN-KA">
<meta name="geo.placename" content="Koramangala, Bengaluru">

<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${esc(CLINIC.name)}">
<meta property="og:locale" content="en_IN">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="800">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}assets/css/style.css">
<script>document.documentElement.className += ' js';</script>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23B38B59'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-size='17' fill='white' text-anchor='middle'%3EP%3C/text%3E%3C/svg%3E">`;
}

/* ---------------------------------------------------------
   Chrome
   --------------------------------------------------------- */
function topbar() {
  return `<div class="topbar">
  <div class="container topbar__inner">
    <ul class="topbar__list">
      <li>${svg(UI.pin)} <span>${esc(CLINIC.addressLine2)}, Bengaluru</span></li>
      <li>${svg(UI.phone)} <a href="tel:${CLINIC.phoneRaw}">${esc(CLINIC.phoneDisplay)}</a></li>
      <li>${svg(UI.clock)} <span>${esc(CLINIC.hours)}</span></li>
    </ul>
    <div class="topbar__social">
      <a href="${CLINIC.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${svg(UI.ig)}</a>
      <a href="${CLINIC.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${svg(UI.fb)}</a>
    </div>
  </div>
</div>`;
}

/**
 * Logo lockup. Uses the clinic's own artwork (assets/img/logo.png) and falls
 * back to the typographic lockup if that file is missing, so the header is
 * never empty.
 */
function logo(base) {
  return `<a class="logo" href="${base}index.html" aria-label="${esc(CLINIC.name)} — home">
  <img class="logo__img" src="${base}assets/img/logo.png" alt="${esc(CLINIC.name)}" height="52"
       onerror="this.closest('.logo').classList.add('logo--nologo');this.remove();">
  <span class="logo__fallback">
    <span class="logo__mark">P</span>
    <span class="logo__text">
      <span class="logo__name">Pearl Aesthetic</span>
      <span class="logo__sub">&amp; Wellness</span>
    </span>
  </span>
</a>`;
}

function megaMenu(base) {
  return `<div class="mega">
      ${CATEGORIES.map((c) => `<a href="${base}procedures/${c.slug}.html">${esc(c.name)}</a>`).join('\n      ')}
      <div class="mega__foot">
        <span>${CATEGORIES.length} specialist divisions &middot; ${totalServices}+ procedures</span>
        <a class="link-arrow" href="${base}index.html#treatments">View all treatments ${svg(UI.arrow)}</a>
      </div>
    </div>`;
}

function nav(base, active) {
  const is = (k) => (active === k ? ' class="is-active"' : '');
  return `<header class="nav">
  <div class="container nav__inner">
    ${logo(base)}
    <nav aria-label="Primary">
      <ul class="nav__links">
        <li><a href="${base}index.html#about"${is('about')}>About</a></li>
        <li class="has-menu">
          <a href="${base}index.html#treatments"${is('treatments')}>Treatments ${svg(UI.caret, 'nav__caret')}</a>
          ${megaMenu(base)}
        </li>
        <li><a href="${base}index.html#surgeon"${is('surgeon')}>Our Surgeon</a></li>
        <li><a href="${base}blog.html"${is('blog')}>Blog</a></li>
        <li><a href="${base}appointment.html"${is('appointment')}>Appointment</a></li>
        <li><a href="${base}index.html#contact"${is('contact')}>Contact</a></li>
      </ul>
    </nav>
    <div class="nav__cta">
      <a class="btn btn--ghost" href="tel:${CLINIC.phoneRaw}">${svg(UI.phone)} Call</a>
      <a class="btn btn--primary" href="${base}appointment.html">Book Appointment</a>
      <button class="nav__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><span></span></button>
    </div>
  </div>
</header>`;
}

function drawer(base) {
  return `<div class="scrim"></div>
<aside class="drawer" id="drawer" aria-label="Mobile menu">
  <div class="drawer__head">
    ${logo(base)}
    <button class="drawer__close" type="button" aria-label="Close menu">&times;</button>
  </div>
  <nav>
    <a href="${base}index.html#about">About</a>
    <a href="${base}index.html#surgeon">Our Surgeon</a>
    <a href="${base}index.html#results">Results</a>
    <a href="${base}blog.html">Blog</a>
    <a href="${base}appointment.html">Book an Appointment</a>
    <a href="${base}index.html#contact">Contact</a>
    <p class="drawer__group">Treatments</p>
    ${CATEGORIES.map((c) => `<a class="drawer__sub" href="${base}procedures/${c.slug}.html">${esc(c.name)}</a>`).join('\n    ')}
  </nav>
  <div class="drawer__actions">
    <a class="btn btn--primary btn--block" href="${base}appointment.html">Book Appointment</a>
    <a class="btn btn--ghost btn--block" href="tel:${CLINIC.phoneRaw}">${svg(UI.phone)} ${esc(CLINIC.phoneDisplay)}</a>
  </div>
</aside>`;
}

/* Bold full-bleed image CTA */
function ctaBand(base) {
  return `<section class="band">
  <div class="band__img">${img(base, 'cta.jpg', 'Calm, softly lit wellness setting', { w: 1400, h: 933 })}</div>
  <div class="container" style="text-align:center">
    <p class="eyebrow is-center" style="justify-content:center">Begin Your Consultation</p>
    <h2 class="h2" style="max-width:26ch;margin-inline:auto">Every plan starts with an <em>honest conversation</em></h2>
    <p class="lead" style="margin-inline:auto">A consultation is an assessment, not a sales appointment. If a procedure is not right for you — or if something simpler will do — we will tell you.</p>
    <div class="band__actions" style="justify-content:center">
      <a class="btn btn--gold btn--lg" href="${base}appointment.html">${svg(UI.cal)} Book an Appointment</a>
      <a class="btn btn--outline-light btn--lg" href="https://wa.me/${CLINIC.whatsapp}" target="_blank" rel="noopener">${svg(UI.wa)} Message on WhatsApp</a>
    </div>
  </div>
</section>`;
}

function footer(base) {
  const half = Math.ceil(CATEGORIES.length / 2);
  const list = (arr) => arr.map((c) =>
    `<li><a href="${base}procedures/${c.slug}.html">${esc(c.name)}</a></li>`).join('\n        ');

  return `<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        ${logo(base)}
        <p class="footer__blurb">A surgeon-led aesthetic and reconstructive practice in Koramangala, Bengaluru — combining plastic surgery, laser dermatology and non-surgical medicine under one roof.</p>
        <div class="footer__social">
          <a href="${CLINIC.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${svg(UI.ig)}</a>
          <a href="${CLINIC.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${svg(UI.fb)}</a>
          <a href="https://wa.me/${CLINIC.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${svg(UI.wa)}</a>
        </div>
      </div>
      <div>
        <h4>Treatments</h4>
        <ul class="footer__links">
        ${list(CATEGORIES.slice(0, half))}
        </ul>
      </div>
      <div>
        <h4>&nbsp;</h4>
        <ul class="footer__links">
        ${list(CATEGORIES.slice(half))}
        <li><a href="${base}blog.html"><strong>Blog</strong></a></li>
        <li><a href="${base}appointment.html"><strong>Book Appointment</strong></a></li>
        </ul>
      </div>
      <div>
        <h4>Visit Us</h4>
        <ul class="footer__contact">
          <li>${svg(UI.pin)}<span>${esc(CLINIC.addressLine1)}<br>${esc(CLINIC.addressLine2)}<br>${esc(CLINIC.addressLine3)}</span></li>
          <li>${svg(UI.phone)}<a href="tel:${CLINIC.phoneRaw}">${esc(CLINIC.phoneDisplay)}</a></li>
          <li>${svg(UI.mail)}<a href="mailto:${CLINIC.email}">${esc(CLINIC.email)}</a></li>
          <li>${svg(UI.clock)}<span>${esc(CLINIC.hours)}</span></li>
        </ul>
      </div>
    </div>

    <p class="footer__disclaimer">
      <strong>Medical disclaimer:</strong> The information on this website, including all articles in the blog, is provided for general education and does not constitute medical advice. It is not a substitute for an in-person consultation with a qualified practitioner. All surgical and non-surgical procedures carry risk, and results vary between individuals. No outcome is guaranteed. Suitability for any procedure can only be established at consultation. Photography on this site is illustrative and does not depict patients of this clinic unless explicitly labelled as a patient result.
    </p>

    <div class="footer__bar">
      <span>&copy; <span data-year>2026</span> ${esc(CLINIC.name)}. All rights reserved.</span>
      <nav>
        <a href="${base}appointment.html">Appointment</a>
        <a href="${base}blog.html">Blog</a>
        <a href="${base}index.html#contact">Contact</a>
        <a href="${base}index.html#faq">FAQs</a>
        <a href="${CLINIC.mapsUrl}" target="_blank" rel="noopener">Directions</a>
      </nav>
    </div>
  </div>
</footer>`;
}

function floaters(base) {
  return `<div class="floaters">
  <a class="float-wa" href="https://wa.me/${CLINIC.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp us">${svg(UI.wa)}</a>
  <a class="float-call" href="tel:${CLINIC.phoneRaw}" aria-label="Call the clinic">${svg(UI.phone)}</a>
</div>`;
}

function shell({ title, description, base, canonical, active, body, jsonld, keywords, ogImage }) {
  const blocks = (Array.isArray(jsonld) ? jsonld : [jsonld]).filter(Boolean);
  return `<!doctype html>
<html lang="en-IN">
<head>
${head({ title, description, base, canonical, keywords, ogImage })}
${blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n')}
</head>
<body>
${topbar()}
${nav(base, active)}
${drawer(base)}
<main>
${body}
</main>
${footer(base)}
${floaters(base)}
<script src="${base}assets/js/lenis.min.js" defer></script>
<script src="${base}assets/js/main.js" defer></script>
</body>
</html>
`;
}

/* Reusable schema */
const clinicSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  '@id': SITE_URL + '/#clinic',
  name: CLINIC.name,
  url: SITE_URL,
  logo: SITE_URL + '/assets/img/hero.jpg',
  image: SITE_URL + '/assets/img/clinic.jpg',
  telephone: CLINIC.phoneDisplay,
  email: CLINIC.email,
  priceRange: '₹₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${CLINIC.addressLine1}, ${CLINIC.addressLine2}`,
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '560034',
    addressCountry: 'IN'
  },
  geo: { '@type': 'GeoCoordinates', latitude: 12.9345, longitude: 77.6266 },
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    opens: '10:00', closes: '20:00'
  }],
  sameAs: [CLINIC.instagram, CLINIC.facebook],
  medicalSpecialty: 'PlasticSurgery'
};

const crumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem', position: i + 1, name: it[0], item: SITE_URL + it[1]
  }))
});

/* ---------------------------------------------------------
   HOME
   --------------------------------------------------------- */
function homePage() {
  const base = '';

  const catCards = CATEGORIES.map((c, i) => {
    const count = c.groups.reduce((m, g) => m + g.services.length, 0);
    return `<a class="card cat-card reveal" href="procedures/${c.slug}.html" style="padding:0">
        <div class="post-card__media" style="aspect-ratio:16/10">${img(base, 'cat-' + c.slug + '.jpg', c.name + ' at Pearl Aesthetic, Bengaluru', { w: 1000, h: 625 })}</div>
        <div style="padding:1.7rem 1.8rem 1.9rem;display:flex;flex-direction:column;flex:1">
          <span class="cat-card__icon">${svg(ICONS[c.icon])}</span>
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.tagline)}</p>
          <div class="cat-card__tags">${c.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
          <div class="cat-card__foot">
            <span class="cat-card__count">${count} procedures</span>
            <span class="link-arrow">Explore ${svg(UI.arrow)}</span>
          </div>
        </div>
      </a>`;
  }).join('\n      ');

  const tech = [
    ['Fotona SP Dynamis', 'Dual-Wavelength Laser', 'Er:YAG and Nd:YAG in one platform — surface resurfacing and deep dermal heating without changing device.'],
    ['Morpheus8', 'RF Microneedling', 'Radiofrequency delivered at controlled depth to remodel collagen and tighten from within.'],
    ['BodyTite / FaceTite', 'RF-Assisted Contouring', 'Contracts skin as fat is removed, closing the gap between liposuction and a lift.'],
    ['Ultrasonic Piezo', 'Rhinoplasty Instrumentation', 'Reshapes nasal bone precisely with markedly less bruising than a traditional osteotome.'],
    ['Ultrasound Guidance', 'Intraoperative Imaging', 'Real-time confirmation of cannula plane during fat transfer — the core BBL safety measure.'],
    ['VASER-Assisted Lipo', 'High Definition Contouring', 'Selective fat emulsification that makes layered, definition-led contouring possible.']
  ].map(([name, tag, desc]) => `<div class="feature reveal">
        <span class="feature__tag">${esc(tag)}</span>
        <div class="feature__icon">${svg(UI.spark)}</div>
        <h3>${esc(name)}</h3>
        <p>${esc(desc)}</p>
      </div>`).join('\n      ');

  const journey = [
    ['Consultation', 'A full assessment with the surgeon — your concerns, your anatomy, your medical history. Nothing is booked on the day you first walk in.'],
    ['The Plan', 'A written plan covering technique, realistic outcome, recovery, risks and total cost. You take it away and think about it.'],
    ['Procedure Day', 'Performed in an accredited theatre with a qualified consultant anaesthetist and continuous monitoring throughout.'],
    ['Recovery', 'Structured aftercare with direct contact to the clinical team, scheduled reviews and clear written instructions.']
  ].map(([h, p]) => `<div class="journey__item reveal"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('\n      ');

  /* ⚠️ REPLACE with genuine, consented patient reviews before publishing. */
  const quotes = [
    ['The consultation was the opposite of what I expected — no pressure, and I was actually talked out of one of the two procedures I came in asking about.', 'A. R.', 'Koramangala'],
    ['Everything about recovery was explained in writing beforehand, so there were no surprises. The follow-up calls made a genuine difference.', 'S. M.', 'Indiranagar'],
    ['I had spent two years reading about this procedure. It was the first appointment where someone explained why my case was different.', 'N. K.', 'HSR Layout']
  ].map(([q, n, city]) => `<div class="quote reveal">
        <div class="quote__stars">${svg(UI.star).repeat(5)}</div>
        <p>&ldquo;${esc(q)}&rdquo;</p>
        <div class="quote__by">
          <span class="quote__avatar">${esc(n.charAt(0))}</span>
          <span><strong>${esc(n)}</strong><span>${esc(city)}, Bengaluru</span></span>
        </div>
      </div>`).join('\n      ');

  const faqs = FAQS.map(([q, a], i) => `<div class="acc__item">
        <button class="acc__btn" type="button" aria-expanded="false" aria-controls="faq-${i}">
          <span>${esc(q)}</span><span class="acc__icon"></span>
        </button>
        <div class="acc__panel" id="faq-${i}"><div><p>${esc(a)}</p></div></div>
      </div>`).join('\n      ');

  const latest = BLOG.slice(0, 3).map((p) => postCard(base, p)).join('\n      ');

  const body = `
<!-- ============ HERO ============ -->
<section class="hero">
  <div class="container hero__grid">
    <div>
      <span class="hero__badge"><b>Koramangala</b> Surgeon-led aesthetic &amp; reconstructive care</span>
      <h1 class="display">Where science<br>meets <em>artistry</em></h1>
      <p class="lead">Plastic surgery, laser dermatology and non-surgical medicine under one roof in Bengaluru — <strong>planned around your anatomy</strong>, delivered with restraint, and explained to you honestly before anything is booked.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="appointment.html">${svg(UI.cal)} Book an Appointment</a>
        <a class="btn btn--ghost btn--lg" href="#treatments">Explore Treatments ${svg(UI.arrow)}</a>
      </div>
      <!-- Add a "years of experience" figure here once confirmed with the clinic. -->
      <div class="hero__trust">
        <div><strong>${CATEGORIES.length}</strong><span>Specialist Divisions</span></div>
        <div><strong>${totalServices}+</strong><span>Procedures Offered</span></div>
        <div><strong>1:1</strong><span>Surgeon-Led Consults</span></div>
      </div>
    </div>

    <div class="hero__visual reveal">
      <span class="hero__chip hero__chip--tl">${svg(UI.shield)} Accredited Theatre</span>
      <span class="hero__chip hero__chip--br">${svg(UI.lock)} Fully Confidential</span>
      <div class="fig fig--tall fig--arch">
        ${img(base, 'hero.jpg', 'Skin and aesthetic care at Pearl Aesthetic & Wellness, Bengaluru', { w: 960, h: 1200, lazy: false })}
        <span class="fig__cap">
          ${svg(UI.spark)}
          <span><strong>Fotona&reg; Laser Suite</strong><span>Dual-wavelength Er:YAG &amp; Nd:YAG</span></span>
        </span>
      </div>
    </div>
  </div>
</section>

<!-- ============ MARQUEE ============ -->
<div class="marquee" aria-hidden="true">
  <div class="marquee__track">
    <span>Rhinoplasty</span><span>Fotona 4D Facelift</span><span>Breast Augmentation</span><span>Gynecomastia Surgery</span><span>360 Liposuction</span><span>Labiaplasty</span><span>Hair Transplant</span><span>Morpheus8</span>
    <span>Rhinoplasty</span><span>Fotona 4D Facelift</span><span>Breast Augmentation</span><span>Gynecomastia Surgery</span><span>360 Liposuction</span><span>Labiaplasty</span><span>Hair Transplant</span><span>Morpheus8</span>
  </div>
</div>

<!-- ============ ABOUT ============ -->
<section class="section" id="about">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <p class="eyebrow">The Practice</p>
        <h2 class="h2">A clinic built around <em>judgement</em>, not volume</h2>
        <p class="lead" style="margin-top:1.3rem">Pearl Aesthetic &amp; Wellness brings surgical, laser and non-surgical aesthetic medicine together in one Koramangala practice — so that the recommendation you receive is shaped by what will actually work, not by what happens to be available in the building.</p>
        <ul class="checklist">
          <li>${svg(UI.check)}<span><b>Surgeon-led from the first appointment</b><p>You are assessed by the operating surgeon at consultation, not by a coordinator or a counsellor.</p></span></li>
          <li>${svg(UI.check)}<span><b>Accredited theatre, consultant anaesthesia</b><p>General anaesthesia is administered by a qualified consultant anaesthetist with continuous monitoring throughout.</p></span></li>
          <li>${svg(UI.check)}<span><b>Written plans and written quotations</b><p>Technique, expected outcome, recovery, risk and total cost — documented before you commit to anything.</p></span></li>
          <li>${svg(UI.check)}<span><b>We decline cases we should decline</b><p>Where expectations cannot be safely met, or a simpler option exists, we say so. That is the point of an assessment.</p></span></li>
        </ul>
      </div>
      <div class="split__visual reveal">
        <div class="fig fig--tall">${img(base, 'about.jpg', 'Consultation space at Pearl Aesthetic & Wellness', { w: 960, h: 1280 })}</div>
        <div class="stats" style="margin-top:1.5rem">
          <div><strong>${CATEGORIES.length}</strong><span>Divisions</span></div>
          <div><strong>${totalServices}+</strong><span>Procedures</span></div>
          <div><strong>Fotona&reg;</strong><span>Laser Platform</span></div>
          <div><strong>100%</strong><span>Confidential</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ TREATMENTS ============ -->
<section class="section section--alt" id="treatments">
  <div class="container">
    <div class="section-head is-center">
      <p class="eyebrow is-center" style="justify-content:center">Our Treatments</p>
      <h2 class="h2">${CATEGORIES.length} specialist divisions,<br><em>${totalServices}+ procedures</em></h2>
      <p class="lead">From a fifteen-minute laser session to a staged post-weight-loss reconstruction. Select a division to see every procedure it covers.</p>
    </div>
    <div class="grid grid-4">
      ${catCards}
    </div>
  </div>
</section>

<!-- ============ SURGEON ============ -->
<section class="section" id="surgeon">
  <div class="container">
    <div class="split split--reverse">
      <div class="split__visual reveal">
        <!-- ⚠️ This is a photograph of the clinic environment, NOT of the surgeon.
             Replace with the surgeon's own portrait once supplied — do not present
             a stock image as a named doctor. -->
        <div class="fig fig--square">${img(base, 'clinic.jpg', 'Treatment room at Pearl Aesthetic & Wellness, Koramangala', { w: 960, h: 960 })}</div>
      </div>
      <div class="reveal">
        <p class="eyebrow">Your Surgeon</p>
        <h2 class="h2">${esc(CLINIC.surgeon)}</h2>
        <p class="lead" style="margin-top:1.3rem">Every consultation at Pearl Aesthetic is conducted by the surgeon who will perform your procedure. That continuity matters: the person assessing your anatomy, setting expectations and quoting your case is the same person operating and reviewing you afterwards.</p>
        <!-- ⚠️ VERIFY AND COMPLETE: replace with the surgeon's actual qualifications and registration number. -->
        <dl class="credential-grid">
          <div><dt>Qualifications</dt><dd>MBBS, MS, MCh &mdash; <em>to confirm</em></dd></div>
          <div><dt>Specialisation</dt><dd>Plastic &amp; Aesthetic Surgery</dd></div>
          <div><dt>Registration</dt><dd><em>To confirm</em></dd></div>
          <div><dt>Practice</dt><dd>Koramangala, Bengaluru</dd></div>
        </dl>
        <div style="margin-top:2rem">
          <a class="btn btn--primary" href="appointment.html">Book a consultation</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ TECHNOLOGY ============ -->
<section class="section section--ink">
  <div class="container">
    <div class="section-head is-center">
      <p class="eyebrow is-center" style="justify-content:center">Technology</p>
      <h2 class="h2">The equipment behind<br>the <em>result</em></h2>
      <p class="lead">Technology does not replace surgical judgement — but it widens what judgement can deliver. These are the platforms our treatment plans are built on.</p>
    </div>
    <div class="grid grid-3">
      ${tech}
    </div>
  </div>
</section>

<!-- ============ RESULTS ============ -->
<section class="section" id="results">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <p class="eyebrow">Results</p>
        <h2 class="h2">What a realistic result <em>looks like</em></h2>
        <p class="lead" style="margin-top:1.3rem">Before-and-after images are useful only when they show a comparable starting point. During your consultation you will be shown cases matched to your anatomy, age and skin type — not the best result the clinic has ever produced.</p>
        <div class="info-card" style="margin-top:1.8rem">
          <h4>On photographs</h4>
          <p>Photography on this website is illustrative and does not depict patients of this clinic. Genuine patient results are shown at consultation, and are only ever published with explicit written consent.</p>
        </div>
        <div style="margin-top:1.8rem">
          <a class="btn btn--ghost" href="appointment.html">See cases matched to you ${svg(UI.arrow)}</a>
        </div>
      </div>
      <div class="split__visual reveal">
        <!-- AI-generated illustrations, not genuine patient photographs. -->
        <div class="ba" data-lenis-prevent>
          <div class="ba__pane ba__pane--before"><img src="assets/img/results-before-ai.png" alt="AI-generated illustrative before view of a fictional rhinoplasty patient" width="1456" height="1088" loading="lazy" decoding="async"></div>
          <div class="ba__pane ba__pane--after"><img src="assets/img/results-after-ai-v2.png" alt="AI-generated illustrative after view of the same fictional rhinoplasty patient" width="1448" height="1086" loading="lazy" decoding="async"></div>
          <span class="ba__label ba__label--before">Before</span>
          <span class="ba__label ba__label--after">After</span>
          <span class="ba__handle"></span>
          <span class="ba__note">Drag to compare &middot; AI-generated illustration &mdash; not a patient result</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ JOURNEY ============ -->
<section class="section section--alt">
  <div class="container">
    <div class="section-head is-center">
      <p class="eyebrow is-center" style="justify-content:center">The Pathway</p>
      <h2 class="h2">Four steps, <em>no surprises</em></h2>
    </div>
    <div class="journey">
      ${journey}
    </div>
  </div>
</section>

<!-- ============ BLOG TEASER ============ -->
<section class="section">
  <div class="container">
    <div class="section-head is-center">
      <p class="eyebrow is-center" style="justify-content:center">From the Clinic</p>
      <h2 class="h2">Reading worth <em>your time</em></h2>
      <p class="lead">Plain-language guidance on choosing a surgeon, understanding recovery and knowing when a treatment is not right for you.</p>
    </div>
    <div class="grid grid-3">
      ${latest}
    </div>
    <div style="text-align:center;margin-top:2.8rem">
      <a class="btn btn--ghost btn--lg" href="blog.html">Read all articles ${svg(UI.arrow)}</a>
    </div>
  </div>
</section>

<!-- ============ TESTIMONIALS ============
     ⚠️ PLACEHOLDER — replace with genuine, consented patient reviews. -->
<section class="section section--alt">
  <div class="container">
    <div class="section-head is-center">
      <p class="eyebrow is-center" style="justify-content:center">Patient Voices</p>
      <h2 class="h2">In their <em>own words</em></h2>
    </div>
    <div class="grid grid-3">
      ${quotes}
    </div>
  </div>
</section>

<!-- ============ FAQ ============ -->
<section class="section" id="faq">
  <div class="container">
    <div class="section-head is-center">
      <p class="eyebrow is-center" style="justify-content:center">Questions</p>
      <h2 class="h2">Before you <em>book</em></h2>
    </div>
    <div class="acc" style="max-width:900px;margin-inline:auto">
      ${faqs}
    </div>
  </div>
</section>

<!-- ============ CONTACT ============ -->
<section class="section section--alt" id="contact">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <p class="eyebrow">Find Us</p>
        <h2 class="h2">In the heart of <em>Koramangala</em></h2>
        <p class="lead" style="margin-top:1.3rem">${esc(CLINIC.addressLine1)}, ${esc(CLINIC.addressLine2)}, ${esc(CLINIC.addressLine3)}</p>
        <div class="credential-grid">
          <div><dt>Phone</dt><dd><a href="tel:${CLINIC.phoneRaw}">${esc(CLINIC.phoneDisplay)}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${CLINIC.email}">${esc(CLINIC.email)}</a></dd></div>
          <div><dt>Opening hours</dt><dd>${esc(CLINIC.hours)}</dd></div>
          <div><dt>Nearest landmark</dt><dd>80ft Road, 4th Block</dd></div>
        </div>
        <div style="margin-top:2rem;display:flex;gap:.8rem;flex-wrap:wrap">
          <a class="btn btn--primary" href="${CLINIC.mapsUrl}" target="_blank" rel="noopener">Get Directions</a>
          <a class="btn btn--ghost" href="appointment.html">${svg(UI.cal)} Book Appointment</a>
        </div>
      </div>
      <div class="split__visual reveal">
        <div class="map-wrap">
          <iframe title="Map to ${esc(CLINIC.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=${encodeURIComponent('KP Aspire, 80 Feet Road, 4th Block, Koramangala, Bengaluru 560034')}&output=embed"></iframe>
        </div>
      </div>
    </div>
  </div>
</section>

${ctaBand(base)}
`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };

  const servicesSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Procedure divisions',
    itemListElement: CATEGORIES.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name,
      url: `${SITE_URL}/procedures/${c.slug}.html`
    }))
  };

  return shell({
    // Search engines truncate titles past ~60 chars and descriptions past ~160.
    title: `Plastic Surgery & Aesthetic Clinic in Bengaluru | ${CLINIC.shortName}`,
    description: `Surgeon-led plastic surgery, laser dermatology and non-surgical aesthetics in Koramangala, Bengaluru. ${totalServices}+ procedures across ${CATEGORIES.length} specialist divisions.`,
    keywords: 'plastic surgery Bengaluru, cosmetic surgery Koramangala, aesthetic clinic Bangalore, rhinoplasty Bengaluru, liposuction Bangalore, breast augmentation Bengaluru, gynecomastia surgery Bangalore, laser dermatology Koramangala, hair transplant Bengaluru, Fotona laser Bangalore',
    base, canonical: `${SITE_URL}/`, active: '', body,
    jsonld: [clinicSchema, faqSchema, servicesSchema], ogImage: 'hero.jpg'
  });
}

/* ---------------------------------------------------------
   CATEGORY PAGE
   --------------------------------------------------------- */
function categoryPage(cat, index) {
  const base = '../';
  const count = cat.groups.reduce((m, g) => m + g.services.length, 0);
  const allNames = cat.groups.flatMap((g) => g.services.map(([n]) => n));

  const meta = cat.meta.map(([k, v]) =>
    `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n          ');

  const groups = cat.groups.map((g) => `<div class="svc-group reveal">
        <div class="svc-group__head">
          <h2>${esc(g.name)}</h2>
          <span>${g.services.length} procedures</span>
        </div>
        <div class="svc-grid">
          ${g.services.map(([n, d]) =>
            `<article class="svc"><h3>${esc(n)}</h3><p>${esc(d)}</p></article>`).join('\n          ')}
        </div>
      </div>`).join('\n      ');

  const related = (RELATED[cat.slug] || []).map((slug) =>
    `<a href="${slug}.html">${esc(catBySlug[slug].name)}</a>`).join('\n        ');

  const prev = CATEGORIES[(index - 1 + CATEGORIES.length) % CATEGORIES.length];
  const next = CATEGORIES[(index + 1) % CATEGORIES.length];

  const body = `
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="${base}index.html">Home</a><span>/</span>
      <a href="${base}index.html#treatments">Treatments</a><span>/</span>
      <span style="color:var(--text-muted)">${esc(cat.name)}</span>
    </nav>
    <div class="page-hero__grid">
      <div>
        <p class="eyebrow">Division ${String(index + 1).padStart(2, '0')} &nbsp;&middot;&nbsp; ${count} procedures</p>
        <h1 class="display">${esc(cat.name)}</h1>
        <p class="lead">${esc(cat.tagline)}</p>
        <div class="page-hero__actions">
          <a class="btn btn--primary" href="${base}appointment.html">${svg(UI.cal)} Book an Appointment</a>
          <a class="btn btn--ghost" href="tel:${CLINIC.phoneRaw}">${svg(UI.phone)} ${esc(CLINIC.phoneDisplay)}</a>
        </div>
      </div>
      <aside class="page-hero__panel">
        <h4>At a glance</h4>
        <dl>
          ${meta}
        </dl>
      </aside>
    </div>
    <div class="fig fig--wide reveal" style="margin-top:clamp(2rem,4vw,3rem)">
      ${img(base, 'cat-' + cat.slug + '.jpg', cat.name + ' treatments at Pearl Aesthetic, Bengaluru', { w: 1000, h: 625, lazy: false })}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="split" style="align-items:start;margin-bottom:clamp(2.5rem,5vw,4rem)">
      <div class="reveal">
        <p class="eyebrow">Overview</p>
        ${cat.intro.map((p) => `<p class="lead" style="margin-bottom:1.2rem">${esc(p)}</p>`).join('\n        ')}
      </div>
      <div class="split__visual reveal">
        <div class="info-card">
          <h4>Is this right for me?</h4>
          <p>The only reliable way to answer that is an in-person assessment. Suitability depends on your anatomy, medical history, skin quality and what you actually want to change &mdash; not on which procedure has the best reviews online.</p>
          <p style="margin-top:.9rem"><a class="link-arrow" href="${base}appointment.html">Book an assessment ${svg(UI.arrow)}</a></p>
        </div>
        <div class="info-card" style="margin-top:1.2rem;border-left-color:var(--sand-400)">
          <h4>What it costs</h4>
          <p>Pricing depends on technique, theatre and anaesthetic time, and follow-up requirements. You receive a full written quotation after consultation &mdash; with no obligation to proceed.</p>
        </div>
      </div>
    </div>

    <div class="section-head" style="margin-bottom:2.5rem">
      <p class="eyebrow">Procedures</p>
      <h2 class="h2">Every ${esc(cat.name.toLowerCase())} <em>procedure we offer</em></h2>
    </div>

    ${groups}
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <div class="section-head" style="margin-bottom:1.8rem">
      <p class="eyebrow">Related Divisions</p>
      <h2 class="h2">Often considered <em>alongside this</em></h2>
    </div>
    <div class="related reveal">
      ${related}
    </div>
    <div class="related reveal" style="margin-top:2.5rem;justify-content:space-between">
      <a href="${prev.slug}.html">&larr; ${esc(prev.name)}</a>
      <a href="${next.slug}.html">${esc(next.name)} &rarr;</a>
    </div>
  </div>
</section>

${ctaBand(base)}
`;

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${cat.name} — ${CLINIC.name}`,
    url: `${SITE_URL}/procedures/${cat.slug}.html`,
    description: cat.tagline,
    primaryImageOfPage: `${SITE_URL}/assets/img/cat-${cat.slug}.jpg`,
    about: allNames.map((n) => ({ '@type': 'MedicalProcedure', name: n })),
    provider: { '@id': SITE_URL + '/#clinic' }
  };

  return shell({
    title: `${cat.name} in Bengaluru | ${CLINIC.shortName}`,
    description: `${cat.tagline} ${count} procedures at ${CLINIC.shortName}, Koramangala, Bengaluru. Surgeon-led consultations.`,
    keywords: [cat.name + ' Bengaluru', cat.name + ' Bangalore', ...cat.tags, ...allNames.slice(0, 8)]
      .join(', ').toLowerCase(),
    base, canonical: `${SITE_URL}/procedures/${cat.slug}.html`, active: 'treatments', body,
    jsonld: [pageSchema, crumbs([
      ['Home', '/'], ['Treatments', '/#treatments'], [cat.name, `/procedures/${cat.slug}.html`]
    ])],
    ogImage: `cat-${cat.slug}.jpg`
  });
}

/* ---------------------------------------------------------
   BLOG
   --------------------------------------------------------- */
function postCard(base, p, feature = false) {
  return `<a class="post-card reveal${feature ? ' post-card--feature' : ''}" href="${base}blog/${p.slug}.html">
        <div class="post-card__media">${img(base, p.image, p.imageAlt, { w: 900, h: 600 })}</div>
        <div class="post-card__body">
          <div class="post-card__meta">${esc(p.category)} <span>&middot;</span> <em>${p.readTime} min read</em></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.excerpt)}</p>
          <div class="post-card__foot"><span class="link-arrow">Read article ${svg(UI.arrow)}</span></div>
        </div>
      </a>`;
}

function blogIndexPage() {
  const base = '';
  const [first, ...rest] = BLOG;

  const body = `
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span>/</span><span style="color:var(--text-muted)">Blog</span>
    </nav>
    <div class="section-head" style="margin-bottom:0;max-width:820px">
      <p class="eyebrow">The Journal</p>
      <h1 class="display">Straight answers,<br><em>no marketing</em></h1>
      <p class="lead">Plain-language articles on choosing a surgeon, understanding recovery, and knowing when a procedure is not the right answer. Written to be useful whether or not you ever book with us.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="grid grid-3">
      ${postCard(base, first, true)}
      ${rest.map((p) => postCard(base, p)).join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <div class="info-card" style="max-width:900px;margin-inline:auto">
      <h4>A note on medical content</h4>
      <p>These articles are written for general education. They are not medical advice and cannot account for your individual anatomy, history or medications. Nothing here replaces an in-person assessment with a qualified practitioner.</p>
    </div>
  </div>
</section>

${ctaBand(base)}
`;

  return shell({
    title: `Blog: Cosmetic Surgery & Skin Guidance | ${CLINIC.shortName}`,
    description: `Honest, plain-language articles on plastic surgery, laser treatment and recovery from ${CLINIC.name}, Koramangala, Bengaluru. ${BLOG.length} in-depth guides.`,
    keywords: 'cosmetic surgery blog India, plastic surgery advice Bengaluru, laser treatment Indian skin, rhinoplasty recovery, gynecomastia guide, BBL safety',
    base, canonical: `${SITE_URL}/blog.html`, active: 'blog', body,
    jsonld: [{
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `${CLINIC.name} Journal`,
      url: `${SITE_URL}/blog.html`,
      publisher: { '@id': SITE_URL + '/#clinic' },
      blogPost: BLOG.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE_URL}/blog/${p.slug}.html`,
        datePublished: p.date,
        image: `${SITE_URL}/assets/img/${p.image}`
      }))
    }, crumbs([['Home', '/'], ['Blog', '/blog.html']])],
    ogImage: BLOG[0].image
  });
}

function blogPostPage(post, index) {
  const base = '../';

  const sections = post.body.map((b) => {
    let out = '';
    if (b.h) out += `<h2>${esc(b.h)}</h2>\n`;
    if (b.p) out += b.p.map((t) => `<p>${esc(t)}</p>`).join('\n') + '\n';
    if (b.list) out += `<ul>\n${b.list.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>\n`;
    if (b.after) out += b.after.map((t) => `<p>${esc(t)}</p>`).join('\n') + '\n';
    return out;
  }).join('\n');

  const others = BLOG.filter((p) => p.slug !== post.slug).slice(0, 3)
    .map((p) => postCard(base, p)).join('\n      ');

  const url = `${SITE_URL}/blog/${post.slug}.html`;

  const body = `
<article>
<section class="article-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb" style="justify-content:center">
      <a href="${base}index.html">Home</a><span>/</span>
      <a href="${base}blog.html">Blog</a><span>/</span>
      <span style="color:var(--text-muted)">${esc(post.category)}</span>
    </nav>
    <div class="article-hero__inner">
      <p class="eyebrow is-center" style="justify-content:center">${esc(post.category)}</p>
      <h1>${esc(post.title)}</h1>
      <p class="lead">${esc(post.excerpt)}</p>
      <div class="article-meta">
        <b>${esc(post.author)}</b><span>&middot;</span>
        <time datetime="${post.date}">${fmtDate(post.date)}</time><span>&middot;</span>
        <span style="color:var(--text-muted)">${post.readTime} min read</span>
      </div>
    </div>
    <div class="fig fig--wide" style="max-width:1000px;margin-inline:auto">
      ${img(base, post.image, post.imageAlt, { w: 900, h: 600, lazy: false })}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <!-- No .reveal here: article body text should never be animation-gated. -->
    <div class="prose">
      ${sections}
      <div class="callout">
        <p><strong>Medical disclaimer.</strong> This article is general education, not medical advice. It cannot account for your individual anatomy, medical history or medications, and it is not a substitute for an in-person consultation with a qualified practitioner. If you are considering a procedure, book an assessment.</p>
      </div>
      <div class="share">
        <span>Share</span>
        <a class="btn btn--ghost" href="https://wa.me/?text=${encodeURIComponent(post.title + ' — ' + url)}" target="_blank" rel="noopener">${svg(UI.wa)} WhatsApp</a>
        <a class="btn btn--ghost" href="mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(url)}">${svg(UI.mail)} Email</a>
        <a class="btn btn--primary" href="${base}appointment.html" style="margin-left:auto">${svg(UI.cal)} Book an Appointment</a>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <div class="section-head" style="margin-bottom:2.2rem">
      <p class="eyebrow">Keep Reading</p>
      <h2 class="h2">More from <em>the journal</em></h2>
    </div>
    <div class="grid grid-3">
      ${others}
    </div>
  </div>
</section>
</article>

${ctaBand(base)}
`;

  const words = post.body.reduce((n, b) =>
    n + (b.p || []).join(' ').split(/\s+/).length + (b.list || []).join(' ').split(/\s+/).length, 0);

  return shell({
    title: `${post.seoTitle || post.title} | ${CLINIC.shortName}`,
    description: post.excerpt,
    keywords: post.keywords,
    base, canonical: url, active: 'blog', body,
    jsonld: [{
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: `${SITE_URL}/assets/img/${post.image}`,
      datePublished: post.date,
      dateModified: post.date,
      wordCount: words,
      keywords: post.keywords,
      articleSection: post.category,
      inLanguage: 'en-IN',
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: { '@type': 'Organization', name: post.author, url: SITE_URL },
      publisher: { '@id': SITE_URL + '/#clinic' }
    }, crumbs([['Home', '/'], ['Blog', '/blog.html'], [post.title, `/blog/${post.slug}.html`]])],
    ogImage: post.image
  });
}

/* ---------------------------------------------------------
   APPOINTMENT
   --------------------------------------------------------- */
function appointmentPage() {
  const base = '';

  const options = CATEGORIES.map((c) =>
    `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('\n              ');

  const steps = [
    ['Assessment', 'The surgeon examines the area you are concerned about, takes a medical history, and asks what you actually want to change. Bring a list — it is easy to forget things.'],
    ['Options, including doing nothing', 'You will be told what surgical and non-surgical options exist, what each realistically achieves, and where the limits are. If nothing is indicated, that is a valid answer and you will hear it.'],
    ['Risks and recovery, in full', 'The specific complications for your procedure, how likely they are, and what recovery genuinely involves — time off work, restrictions, garments, follow-ups.'],
    ['A written plan and quotation', 'You leave with the plan and full costs in writing. Nothing is booked on the day. Take it away, read it, and come back if you want to proceed.']
  ].map(([b, p]) => `<li><b>${esc(b)}</b><p>${esc(p)}</p></li>`).join('\n        ');

  const prep = [
    'A list of your current medications and supplements, including anything herbal',
    'Details of previous surgery, especially any anaesthetic problems',
    'Any recent scans, blood tests or specialist letters relevant to the area',
    'Photographs of results you like — and results you specifically do not want',
    'Your questions, written down; consultations move quickly and it is easy to forget',
    'If possible, come without makeup on the area being assessed'
  ].map((t) => `<li>${svg(UI.check)}<span><b>${esc(t)}</b></span></li>`).join('\n          ');

  const apptFaqs = [
    ['Is there a consultation fee?',
     'Please confirm the current consultation fee when you book — it is quoted at the time of booking and varies by whether the appointment is surgical or non-surgical. Any fee is stated to you before you attend, never afterwards.'],
    ['Can I have a video consultation first?',
     'Yes, and it is a sensible first step if you are travelling from outside Bengaluru. An in-person assessment is still required before any surgical procedure is confirmed — some things cannot be judged on a screen.'],
    ['Will I be pressured to book on the day?',
     'No. Nothing is booked at your first consultation as a matter of policy. You leave with a written plan and decide in your own time.'],
    ['Can I bring someone with me?',
     'Yes, and we encourage it for surgical consultations. A second person remembers different things, and it helps to talk the plan through with someone afterwards.'],
    ['How far ahead do I need to book?',
     'Consultation availability is usually within one to two weeks. Surgical dates depend on theatre availability and are discussed once you have decided to proceed.'],
    ['Is my enquiry confidential?',
     'Entirely. Enquiries and records are confidential, and we will only contact you by the method you tell us to use.']
  ].map(([q, a], i) => `<div class="acc__item">
          <button class="acc__btn" type="button" aria-expanded="false" aria-controls="afaq-${i}">
            <span>${esc(q)}</span><span class="acc__icon"></span>
          </button>
          <div class="acc__panel" id="afaq-${i}"><div><p>${esc(a)}</p></div></div>
        </div>`).join('\n        ');

  const body = `
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span>/</span><span style="color:var(--text-muted)">Appointment</span>
    </nav>
    <div class="page-hero__grid">
      <div>
        <p class="eyebrow">Book a Consultation</p>
        <h1 class="display">Let's start with a <em>conversation</em></h1>
        <p class="lead">Send your details and we will call you back to arrange a time. Nothing is booked at the first consultation — you leave with a written plan and decide in your own time.</p>
        <div class="page-hero__actions">
          <a class="btn btn--primary" href="tel:${CLINIC.phoneRaw}">${svg(UI.phone)} ${esc(CLINIC.phoneDisplay)}</a>
          <a class="btn btn--ghost" href="https://wa.me/${CLINIC.whatsapp}" target="_blank" rel="noopener">${svg(UI.wa)} WhatsApp</a>
        </div>
      </div>
      <aside class="page-hero__panel">
        <h4>Opening hours</h4>
        <table class="hours-table">
          <tr><td>Monday – Friday</td><td>10:00 – 20:00</td></tr>
          <tr><td>Saturday</td><td>10:00 – 20:00</td></tr>
          <tr><td>Sunday</td><td>10:00 – 20:00</td></tr>
          <tr><td>Public holidays</td><td>By appointment</td></tr>
        </table>
      </aside>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="appt-grid">
      <div class="appt-form reveal">
        <h2 class="h2" style="font-size:clamp(1.8rem,3vw,2.4rem)">Request an appointment</h2>
        <p class="lead" style="font-size:1rem">Fields marked * are required. Everything you share is confidential.</p>

        <form id="bookingForm" novalidate>
          <div class="field-row">
            <div class="field">
              <label for="f-name">Full name *</label>
              <input id="f-name" name="name" type="text" autocomplete="name" required placeholder="Your name">
            </div>
            <div class="field">
              <label for="f-phone">Phone *</label>
              <input id="f-phone" name="phone" type="tel" autocomplete="tel" required placeholder="+91 ">
            </div>
          </div>
          <div class="field">
            <label for="f-email">Email</label>
            <input id="f-email" name="email" type="email" autocomplete="email" placeholder="you@example.com">
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f-proc">Area of interest</label>
              <select id="f-proc" name="procedure">
                <option value="">Select a division</option>
              ${options}
                <option value="Not sure yet">Not sure yet &mdash; please advise</option>
              </select>
            </div>
            <div class="field">
              <label for="f-type">Consultation type</label>
              <select id="f-type" name="consult">
                <option value="In person">In person &mdash; Koramangala</option>
                <option value="Video">Video consultation</option>
              </select>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f-date">Preferred date</label>
              <input id="f-date" name="preferred" type="date">
            </div>
            <div class="field">
              <label for="f-time">Preferred time</label>
              <select id="f-time" name="time">
                <option value="">No preference</option>
                <option value="Morning (10am – 1pm)">Morning (10am &ndash; 1pm)</option>
                <option value="Afternoon (1pm – 5pm)">Afternoon (1pm &ndash; 5pm)</option>
                <option value="Evening (5pm – 8pm)">Evening (5pm &ndash; 8pm)</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="f-msg">What would you like to discuss?</label>
            <textarea id="f-msg" name="message" placeholder="Briefly describe your concern and anything you'd like us to know beforehand."></textarea>
          </div>

          <div class="consent">
            <input id="f-consent" name="consent" type="checkbox" required>
            <label for="f-consent">I consent to Pearl Aesthetic &amp; Wellness contacting me about this enquiry. I understand this form does not create a confirmed booking and that no medical advice is given until consultation.</label>
          </div>

          <button class="btn btn--gold btn--block btn--lg" type="submit">Request My Appointment</button>
          <p class="form-note" id="formStatus">Submitting opens WhatsApp with your details pre-filled so you can send them directly to the clinic. Prefer to talk? Call <a href="tel:${CLINIC.phoneRaw}">${esc(CLINIC.phoneDisplay)}</a>.</p>
        </form>
      </div>

      <div>
        <div class="fig fig--wide reveal">${img(base, 'appointment.jpg', 'Calm consultation space at Pearl Aesthetic & Wellness', { w: 960, h: 640, lazy: false })}</div>

        <div class="reveal" style="margin-top:2.5rem">
          <p class="eyebrow">What Happens</p>
          <h2 class="h2" style="font-size:clamp(1.6rem,2.6vw,2.1rem);margin-bottom:1.6rem">At your consultation</h2>
          <ol class="steps">
        ${steps}
          </ol>
        </div>

        <div class="reveal" style="margin-top:2.5rem">
          <p class="eyebrow">Come Prepared</p>
          <h2 class="h2" style="font-size:clamp(1.6rem,2.6vw,2.1rem);margin-bottom:1.2rem">What to bring</h2>
          <ul class="checklist">
          ${prep}
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <p class="eyebrow">Appointment Questions</p>
        <h2 class="h2">Before you <em>come in</em></h2>
        <div class="acc" style="margin-top:2rem">
        ${apptFaqs}
        </div>
      </div>
      <div class="split__visual reveal">
        <div class="map-wrap">
          <iframe title="Map to ${esc(CLINIC.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=${encodeURIComponent('KP Aspire, 80 Feet Road, 4th Block, Koramangala, Bengaluru 560034')}&output=embed"></iframe>
        </div>
        <div class="credential-grid" style="margin-top:1.5rem">
          <div><dt>Address</dt><dd style="text-align:left;font-weight:500">${esc(CLINIC.addressLine1)}, ${esc(CLINIC.addressLine2)}, ${esc(CLINIC.addressLine3)}</dd></div>
          <div><dt>Phone</dt><dd><a href="tel:${CLINIC.phoneRaw}">${esc(CLINIC.phoneDisplay)}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${CLINIC.email}">${esc(CLINIC.email)}</a></dd></div>
          <div><dt>Hours</dt><dd>${esc(CLINIC.hours)}</dd></div>
        </div>
      </div>
    </div>
  </div>
</section>
`;

  return shell({
    title: `Book an Appointment | ${CLINIC.shortName}, Bengaluru`,
    description: `Request a consultation at ${CLINIC.name} in Koramangala, Bengaluru. Surgeon-led assessment, a written plan and a full quotation — nothing is booked on the day.`,
    keywords: 'book plastic surgery consultation Bengaluru, cosmetic surgery appointment Koramangala, aesthetic clinic booking Bangalore, plastic surgeon consultation India',
    base, canonical: `${SITE_URL}/appointment.html`, active: 'appointment', body,
    jsonld: [clinicSchema, crumbs([['Home', '/'], ['Appointment', '/appointment.html']])],
    ogImage: 'appointment.jpg'
  });
}

/* ---------------------------------------------------------
   Sitemap
   --------------------------------------------------------- */
function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = [
    [`${SITE_URL}/`, '1.0', today],
    [`${SITE_URL}/appointment.html`, '0.9', today],
    [`${SITE_URL}/blog.html`, '0.8', today],
    ...CATEGORIES.map((c) => [`${SITE_URL}/procedures/${c.slug}.html`, '0.8', today]),
    ...BLOG.map((p) => [`${SITE_URL}/blog/${p.slug}.html`, '0.7', p.date])
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.map(([u, pr, lm]) =>
  `  <url><loc>${u}</loc><lastmod>${lm}</lastmod><changefreq>monthly</changefreq><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`;
}

/* ---------------------------------------------------------
   Build
   --------------------------------------------------------- */
function build() {
  fs.mkdirSync(path.join(ROOT, 'procedures'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'blog'), { recursive: true });

  fs.writeFileSync(path.join(ROOT, 'index.html'), homePage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'appointment.html'), appointmentPage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'blog.html'), blogIndexPage(), 'utf8');
  console.log('  index.html, appointment.html, blog.html');

  CATEGORIES.forEach((cat, i) =>
    fs.writeFileSync(path.join(ROOT, 'procedures', `${cat.slug}.html`), categoryPage(cat, i), 'utf8'));
  console.log(`  procedures/ — ${CATEGORIES.length} pages`);

  BLOG.forEach((post, i) =>
    fs.writeFileSync(path.join(ROOT, 'blog', `${post.slug}.html`), blogPostPage(post, i), 'utf8'));
  console.log(`  blog/ — ${BLOG.length} articles`);

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');
  console.log('  sitemap.xml, robots.txt');

  const pages = 3 + CATEGORIES.length + BLOG.length;
  console.log(`\n✓ Built ${pages} pages · ${totalServices} procedures · ${BLOG.length} articles.`);

  if (!fs.existsSync(path.join(ROOT, 'assets/img/logo.png'))) {
    console.log('\n⚠  assets/img/logo.png is missing — the header is falling back to the');
    console.log('   typographic lockup. Drop the clinic logo there and rebuild.');
  }
}

build();
