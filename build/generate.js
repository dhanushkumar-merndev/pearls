/* =========================================================
   Static site generator — Pearl Aesthetic & Wellness
   Run:  node build/generate.js
   Outputs: index.html, appointment.html, blog.html,
            procedures/<slug>.html, blog/<slug>.html,
            sitemap.xml, robots.txt
   ========================================================= */

const fs = require('fs');
const path = require('path');
const { CLINIC, ICONS: DATA_ICONS, CATEGORIES, RELATED } = require('./data');
const { BLOG } = require('./blog');
// Icons come from react-icons, rendered to static SVG at build time. The raw
// path bodies still in data.js are superseded by these and are unused.
const { UI, ICONS, assertCoverage } = require('./icons');
assertCoverage(DATA_ICONS);

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.pearlaesthetic.in';

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Icons arrive from build/icons.js already rendered to complete <svg> markup
 * by react-icons, so this only has to attach an optional class. Signature is
 * unchanged from when it wrapped raw path bodies, which keeps all 62 call
 * sites — svg(UI.phone), svg(ICONS[c.icon]) — working as before.
 */
const svg = (markup, cls = '') =>
  cls ? markup.replace('<svg ', `<svg class="${cls}" `) : markup;

const totalServices = CATEGORIES.reduce((n, c) =>
  n + c.groups.reduce((m, g) => m + g.services.length, 0), 0);

/** Stable anchor id for a procedure, e.g. "Fotona 4D Laser Facelift" -> "fotona-4d-laser-facelift" */
const slugify = (s) => String(s)
  .toLowerCase()
  .replace(/[’'"]/g, '')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/** Flat list of every procedure in a category, with its deep link. */
const servicesOf = (cat) => cat.groups.flatMap((g) =>
  g.services.map(([n]) => ({ name: n, id: slugify(n) })));

/** A category-qualified file name keeps repeated procedure names unambiguous. */
const serviceFile = (cat, name) => `${cat.slug}-${slugify(name)}.html`;

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

/**
 * Before/after imagery is resolved by DIRECTORY, and the directory is the
 * provenance claim. There is no manifest to fall out of sync and no way to
 * mislabel a pair by accident — where the file sits is what the badge says.
 *
 *   assets/img/results/patient/<case-id>-before.jpg  + -after.jpg
 *     → a real patient of this clinic. Only ever add these with written
 *       consent on file. Badged as a patient result.
 *
 *   assets/img/results/illustration/<case-id>-before.jpg + -after.jpg
 *     → a commissioned, licensed or AI-generated illustration. NOT a patient.
 *       Badged as an illustration, persistently and on the frame itself.
 *
 * Anything else renders as an empty reserved frame. Nothing is ever borrowed
 * from another practice: an image sitting in a Before/After frame on a surgery
 * site reads as this clinic's own surgical outcome, whatever the caption says.
 */
const RESULT_TIERS = ['patient', 'illustration'];
// Purpose-made AI illustrations are deliberately kept separate from patient
// photography. Each card has its own finished side-by-side comparison, so the
// difference is visible immediately without reusing another procedure's art.
const AI_ILLUSTRATIONS = Object.freeze({
  rhinoplasty: 'rhinoplasty-comparison.jpg',
  septorhinoplasty: 'septorhinoplasty-comparison.jpg',
  blepharoplasty: 'blepharoplasty-comparison.jpg',
  facelift: 'facelift-comparison.jpg',
  'breast-augmentation': 'breast-augmentation-comparison.jpg',
  'breast-reduction': 'breast-reduction-comparison.jpg',
  gynecomastia: 'gynecomastia-comparison.jpg',
  'liposuction-360': 'liposuction-360-comparison.jpg',
  'tummy-tuck': 'tummy-tuck-comparison.jpg',
  bbl: 'bbl-comparison.jpg',
  'post-weight-loss': 'post-weight-loss-comparison.jpg',
  'hair-transplant': 'hair-transplant-comparison.jpg'
});
const RESULT_PHOTOS = Object.fromEntries(RESULT_TIERS.map((tier) => {
  const dir = path.join(ROOT, 'assets/img/results', tier);
  return [tier, new Set(
    fs.existsSync(dir)
      ? fs.readdirSync(dir)
          .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
          .map((f) => f.replace(/\.[^.]+$/, ''))
      : []
  )];
}));

/** Returns 'patient', 'illustration', or null. A real case outranks an illustration. */
const caseTier = (id) => AI_ILLUSTRATIONS[id] ? 'illustration' : RESULT_TIERS.find((tier) =>
  RESULT_PHOTOS[tier].has(`${id}-before`) && RESULT_PHOTOS[tier].has(`${id}-after`)) || null;


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
function head({ title, description, base, canonical, keywords, ogImage, ogImageAlt, article, preload }) {
  const image = SITE_URL + '/assets/img/' + (ogImage || 'hero.jpg');
  const alt = ogImageAlt || `${CLINIC.name}, Koramangala, Bengaluru`;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="keywords" content="${esc(keywords)}">
<meta name="author" content="${esc(article ? article.author : CLINIC.name)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#17110A">

<meta name="geo.region" content="IN-KA">
<meta name="geo.placename" content="Koramangala, Bengaluru">
<meta name="geo.position" content="12.9345;77.6266">
<meta name="ICBM" content="12.9345, 77.6266">

<meta property="og:type" content="${article ? 'article' : 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${esc(CLINIC.name)}">
<meta property="og:locale" content="en_IN">
<meta property="og:image" content="${image}">
<meta property="og:image:alt" content="${esc(alt)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="800">
${article ? `<meta property="article:published_time" content="${article.date}T09:00:00+05:30">
<meta property="article:modified_time" content="${article.date}T09:00:00+05:30">
<meta property="article:author" content="${esc(article.author)}">
<meta property="article:section" content="${esc(article.section)}">
${article.tags.map((t) => `<meta property="article:tag" content="${esc(t)}">`).join('\n')}` : ''}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${esc(alt)}">
${preload ? `<link rel="preload" as="image" href="${base}assets/img/${preload}" fetchpriority="high">` : ''}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}assets/css/style.css">
<script>document.documentElement.className += ' js';</script>
<link rel="icon" href="${base}assets/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="${base}assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="${base}assets/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="${base}assets/apple-touch-icon.png">`;
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

/**
 * Two-panel mega menu: divisions in a left rail, that division's procedures
 * in the right panel. Every one of the 263 procedures is a real deep link
 * into its category page, which is also the site's main internal-linking.
 *
 * Each division in the rail carries its own photo thumbnail. The alt is empty
 * on purpose — the name sits right beside it, so a label would be read twice.
 */
function megaMenu(base) {
  const rail = CATEGORIES.map((c, i) => {
    const n = servicesOf(c).length;
    return `<button class="mega__cat${i === 0 ? ' is-active' : ''}" type="button" role="tab"
          aria-selected="${i === 0}" aria-controls="megapanel-${c.slug}" data-cat="${c.slug}">
          <span class="mega__cat-media"><img src="${base}assets/img/procedures/${c.slug}.jpg" alt=""
            width="800" height="534" loading="lazy" decoding="async" onerror="this.style.display='none'"></span>
          <span class="mega__cat-name">${esc(c.name)}</span><span class="mega__count">${n}</span>${svg(UI.chevR)}
        </button>`;
  }).join('\n        ');

  const panels = CATEGORIES.map((c, i) => {
    // Procedure links stay text-only. Per-procedure photography does not exist,
    // so a thumbnail here could only repeat the division photo — 13 to 34
    // identical images down one panel, which reads as a rendering fault.
    const links = servicesOf(c).map((s) =>
      `<a href="${base}procedures/${c.slug}.html#${s.id}">${esc(s.name)}</a>`).join('\n            ');
    return `<div class="mega__panel${i === 0 ? ' is-active' : ''}" id="megapanel-${c.slug}" role="tabpanel" data-cat="${c.slug}">
          <div class="mega__panel-head">
            <span class="mega__panel-media"><img src="${base}assets/img/procedures/${c.slug}.jpg" alt=""
              width="800" height="534" loading="lazy" decoding="async" onerror="this.style.display='none'"></span>
            <h4>${esc(c.name)}</h4>
            <a class="link-arrow" href="${base}procedures/${c.slug}.html">Division overview ${svg(UI.arrow)}</a>
          </div>
          <div class="mega__links">
            ${links}
          </div>
        </div>`;
  }).join('\n        ');

  // Both panes scroll, so Lenis must leave their wheel events alone —
  // otherwise the page scrolls instead of the list under the cursor.
  return `<div class="mega mega--split">
      <div class="mega__rail" role="tablist" aria-label="Treatment divisions" data-lenis-prevent>
        ${rail}
        <a class="mega__all" href="${base}index.html#treatments">${svg(UI.grid)} All ${totalServices} procedures</a>
      </div>
      <div class="mega__panels" data-lenis-prevent>
        ${panels}
      </div>
    </div>`;
}

function nav(base, active) {
  const is = (k) => (active === k ? ' class="is-active"' : '');
  return `<header class="nav">
  <div class="container nav__inner">
    ${logo(base)}
    <nav class="nav__primary" aria-label="Primary">
      <ul class="nav__links">
        <li class="has-menu">
          <a href="${base}index.html#treatments"${is('treatments')}>Treatments ${svg(UI.caret, 'nav__caret')}</a>
          ${megaMenu(base)}
        </li>
        <li><a href="${base}about.html"${is('about')}>About Us</a></li>
        <li><a href="${base}surgeon.html"${is('surgeon')}>Our Surgeon</a></li>
        <li><a href="${base}results.html"${is('results')}>Before &amp; After</a></li>
        <li><a href="${base}blog.html"${is('blog')}>Blog</a></li>
        <li><a href="${base}contact.html"${is('contact')}>Contact</a></li>
        <li><a href="${base}privacy-terms.html"${is('privacy')}>Privacy</a></li>
      </ul>
    </nav>
    <div class="nav__cta">
      <a class="btn btn--primary" href="${base}appointment.html">Book Appointment</a>
      <button class="nav__toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">${svg(UI.menu)}</button>
    </div>
  </div>
  <div class="scroll-progress" aria-hidden="true"><span></span></div>
</header>`;
}

function drawer(base) {
  // data-lenis-prevent is essential, not decorative: the drawer opens with
  // lenis.stop(), and a stopped Lenis calls preventDefault() on every
  // touchmove — which would make this panel impossible to scroll.
  return `<div class="scrim"></div>
<aside class="drawer" id="drawer" aria-label="Mobile menu" data-lenis-prevent>
  <div class="drawer__head">
    ${logo(base)}
    <button class="drawer__close" type="button" aria-label="Close menu">${svg(UI.close)}</button>
  </div>
  <nav>
    <a href="${base}about.html">About</a>
    <a href="${base}surgeon.html">Our Surgeon</a>
    <a href="${base}results.html">Before &amp; After</a>
    <a href="${base}blog.html">Blog</a>
    <a href="${base}appointment.html">Book an Appointment</a>
    <a href="${base}contact.html">Contact</a>
    <a href="${base}privacy-terms.html">Privacy &amp; Terms</a>
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
function ctaBand(base, image = 'banner-clinic-ai.png') {
  return `<section class="band">
  <div class="band__img" style="background-image:url('${base}assets/img/${image}')" aria-hidden="true"></div>
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

function bannerForCategory(slug) {
  if (['nose-surgery', 'ear-surgery', 'eyelids-upper-face', 'face-surgery'].includes(slug)) return 'banner-face-ai.png';
  if (['laser-dermatology', 'non-surgical-aesthetics', 'skin-surgery'].includes(slug)) return 'banner-skin-ai.png';
  if (slug === 'hair-transplant') return 'banner-hair-ai.png';
  return 'banner-body-ai.png';
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

    <!-- Site pages as one centred horizontal row rather than a tail on the
         Treatments column, where they read as more categories. -->
    <nav class="footer__nav" aria-label="Footer">
      <a href="${base}about.html">About Us</a>
      <a href="${base}surgeon.html">Our Surgeon</a>
      <a href="${base}results.html">Before &amp; After</a>
      <a href="${base}blog.html">Blog</a>
      <a href="${base}contact.html">Contact</a>
      <a href="${base}appointment.html">Book Appointment</a>
      <a href="${base}privacy-terms.html">Privacy &amp; Terms</a>
    </nav>

    <p class="footer__areas">
      <strong>Serving patients across Bengaluru</strong> — Koramangala, Indiranagar, HSR Layout,
      BTM Layout, Jayanagar, JP Nagar, Whitefield, Electronic City, Marathahalli, Sarjapur Road
      and Hebbal, as well as patients travelling from across Karnataka and India.
    </p>

    <p class="footer__disclaimer">
      <strong>Medical disclaimer:</strong> The information on this website, including all articles in the blog, is provided for general education and does not constitute medical advice. It is not a substitute for an in-person consultation with a qualified practitioner. All surgical and non-surgical procedures carry risk, and results vary between individuals. No outcome is guaranteed. Suitability for any procedure can only be established at consultation. Photography on this site is illustrative and does not depict patients of this clinic unless explicitly labelled as a patient result.
    </p>

    <div class="footer__bar">
      <span>&copy; <span data-year>2026</span> ${esc(CLINIC.name)}. All rights reserved.</span>
      <nav>
        <a href="${base}appointment.html">Appointment</a>
        <a href="${base}blog.html">Blog</a>
        <a href="${base}contact.html">Contact</a>
        <a href="${base}contact.html#faq">FAQs</a>
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

function shell({ title, description, base, canonical, active, body, jsonld, keywords,
                 ogImage, ogImageAlt, article, preload }) {
  const blocks = (Array.isArray(jsonld) ? jsonld : [jsonld]).filter(Boolean);
  return `<!doctype html>
<html lang="en-IN">
<head>
${head({ title, description, base, canonical, keywords, ogImage, ogImageAlt, article, preload })}
${blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n')}
</head>
<body class="page-${active || 'home'}">
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
  geo: { '@type': 'GeoCoordinates', latitude: CLINIC.lat, longitude: CLINIC.lng },
  hasMap: CLINIC.mapsUrl,
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    opens: '10:00', closes: '20:00'
  }],
  sameAs: [CLINIC.instagram, CLINIC.facebook],
  medicalSpecialty: 'PlasticSurgery',
  areaServed: [
    { '@type': 'City', name: 'Bengaluru' },
    { '@type': 'State', name: 'Karnataka' }
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Procedure divisions',
    itemListElement: CATEGORIES.map((c) => ({
      '@type': 'OfferCatalog',
      name: c.name,
      url: `${SITE_URL}/procedures/${c.slug}.html`,
      numberOfItems: servicesOf(c).length
    }))
  }
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
    return `<a class="card cat-card treatments__card reveal" data-dir="zoom" href="procedures/${c.slug}.html" style="padding:0">
        <div class="post-card__media cat-card__media" style="aspect-ratio:16/10">${img(base, 'procedures/' + c.slug + '.jpg', c.name + ' treatments at Pearl Aesthetic, Koramangala, Bengaluru', { w: 800, h: 534 })}</div>
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

  /* Routes into the three pages the home page no longer carries in full. */
  const pillars = [
    [UI.shield, 'The Practice', 'A clinic built around judgement, not volume',
      'How the practice is run, what the pathway looks like, and the cases we turn down.', 'about.html', 'About the practice'],
    [UI.user, 'Your Surgeon', esc(CLINIC.surgeon),
      'MBBS, MS, MCh · KMC Reg. No. 74573 · International Fellowship at Wellness Kliniek, Belgium.', 'surgeon.html', 'Meet your surgeon'],
    [UI.spark, 'Before &amp; After', 'What a realistic result looks like',
      'A case gallery organised by division, with the starting point shown as plainly as the outcome.', 'results.html', 'View the gallery']
    // .pillar, not .feature — .feature is styled light-on-dark for the ink
    // section and its text disappears on this page's light background.
  ].map(([icon, tag, title, desc, href, cta]) => `<a class="card pillar reveal" href="${base}${href}">
        <span class="pillar__tag">${tag}</span>
        <div class="cat-card__icon">${svg(icon)}</div>
        <h3>${title}</h3>
        <p>${esc(desc)}</p>
        <span class="link-arrow pillar__cta">${cta} ${svg(UI.arrow)}</span>
      </a>`).join('\n      ');

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

  const latest = BLOG.slice(0, 3).map((p) => postCard(base, p)).join('\n      ');

  const body = `
<!-- ============ HERO ============ -->
<section class="hero">
  <div class="container hero__grid">
    <div>
      <span class="hero__badge stagger"><b>Koramangala</b> Surgeon-led aesthetic &amp; reconstructive care</span>
      <!-- H1 leads with the primary search term, then carries the brand tagline. -->
      <h1 class="display hero__title">
        <span class="hero__line stagger">Plastic Surgery<br>in Bengaluru</span>
        <span class="hero__tagline stagger">where science meets <em>artistry</em></span>
      </h1>
      <p class="lead stagger">Cosmetic surgery, laser dermatology and non-surgical aesthetics under one roof in Koramangala — <strong>planned around your anatomy</strong>, delivered with restraint, and explained honestly before anything is booked.</p>
      <div class="hero__actions stagger">
        <a class="btn btn--primary btn--lg" href="appointment.html">${svg(UI.cal)} Book an Appointment</a>
        <a class="btn btn--ghost btn--lg" href="#treatments">Explore Treatments ${svg(UI.arrow)}</a>
      </div>
      <!-- Add a "years of experience" figure here once confirmed with the clinic. -->
      <div class="hero__trust stagger">
        <div><strong data-count="${CATEGORIES.length}">${CATEGORIES.length}</strong><span>Specialist Divisions</span></div>
        <div><strong data-count="${totalServices}" data-suffix="+">${totalServices}+</strong><span>Procedures Offered</span></div>
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

<!-- ============ PILLARS — routes into the three content pages ============ -->
<section class="section">
  <div class="container">
    <div class="grid grid-3">
      ${pillars}
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
    <div class="grid grid-4 treatments__grid" id="treatmentsGrid">
      ${catCards}
    </div>
    <div class="treatments__more-wrap">
      <button class="btn btn--ghost treatments__more" type="button" data-show-more="treatmentsGrid" aria-expanded="false">Show more treatments ${svg(UI.arrow)}</button>
    </div>
  </div>
</section>

<!-- ============ RESULTS TEASER — full gallery lives on results.html ============ -->
<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal" data-dir="left">
        <p class="eyebrow">Results</p>
        <h2 class="h2">What a realistic result <em>looks like</em></h2>
        <p class="lead" style="margin-top:1.3rem">Before-and-after images are useful only when they show a comparable starting point. During your consultation you will be shown cases matched to your anatomy, age and skin type — not the best result the clinic has ever produced.</p>
        <div class="info-card" style="margin-top:1.8rem">
          <h4>On photographs</h4>
          <p>Photography on this website is illustrative and does not depict patients of this clinic. Genuine patient results are shown at consultation, and are only ever published with explicit written consent.</p>
        </div>
        <div style="margin-top:1.8rem;display:flex;gap:.8rem;flex-wrap:wrap">
          <a class="btn btn--primary" href="results.html">View the case gallery ${svg(UI.arrow)}</a>
          <a class="btn btn--ghost" href="appointment.html">See cases matched to you</a>
        </div>
      </div>
      <div class="split__visual reveal">
        <!-- AI-generated illustrations, not genuine patient photographs. -->
        <div class="ba">
          <div class="ba__pane ba__pane--before"><img src="assets/img/results-before.jpg" alt="AI-generated illustrative before view of a fictional rhinoplasty patient" width="1200" height="900" loading="lazy" decoding="async"></div>
          <div class="ba__pane ba__pane--after"><img src="assets/img/results-after.jpg" alt="AI-generated illustrative after view of the same fictional rhinoplasty patient" width="1200" height="900" loading="lazy" decoding="async"></div>
          <span class="ba__label ba__label--before">Before</span>
          <span class="ba__label ba__label--after">After</span>
          <!-- Persistent badge: the caption strip alone is easy to miss, and an
               undisclosed AI image in a Before/After frame reads as a real result. -->
          <span class="ba__badge">Illustration &mdash; not a patient</span>
          <span class="ba__handle"></span>
          <span class="ba__note">Drag to compare &middot; AI-generated illustration &mdash; not a patient result</span>
        </div>
      </div>
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

${ctaBand(base)}
`;

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
    title: `Plastic Surgery in Bengaluru | ${CLINIC.shortName}`,
    description: `Surgeon-led plastic surgery, laser dermatology and non-surgical aesthetics in Koramangala, Bengaluru. ${totalServices}+ procedures across ${CATEGORIES.length} divisions. Book a consultation.`,
    ogImageAlt: 'Skin and aesthetic care at Pearl Aesthetic & Wellness, Koramangala, Bengaluru',
    preload: 'hero.jpg',
    keywords: 'plastic surgery Bengaluru, cosmetic surgery Koramangala, aesthetic clinic Bangalore, rhinoplasty Bengaluru, liposuction Bangalore, breast augmentation Bengaluru, gynecomastia surgery Bangalore, laser dermatology Koramangala, hair transplant Bengaluru, Fotona laser Bangalore',
    base, canonical: `${SITE_URL}/`, active: '', body,
    jsonld: [clinicSchema, servicesSchema], ogImage: 'hero.jpg'
  });
}

/* ---------------------------------------------------------
   SHARED PAGE HEADER
   Every standalone content page opens the same way, so About, Our Surgeon,
   Before & After and Contact read as one set rather than four one-offs.
   --------------------------------------------------------- */
function pageHero({ crumb, eyebrow, title, lead, actions = '', figure = '' }) {
  return `<section class="page-hero">
  <div class="container">
    <div class="page-hero__grid${figure ? '' : ' page-hero__grid--solo'}">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1 class="display">${title}</h1>
        <p class="lead">${lead}</p>
        <div class="page-hero__actions">
          ${actions || `<a class="btn btn--primary" href="appointment.html">${svg(UI.cal)} Book an Appointment</a>
          <a class="btn btn--ghost" href="tel:${CLINIC.phoneRaw}">${svg(UI.phone)} ${esc(CLINIC.phoneDisplay)}</a>`}
        </div>
      </div>
      ${figure}
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------
   ABOUT
   --------------------------------------------------------- */
function aboutPage() {
  const base = '';

  const journey = [
    ['Consultation', 'A full assessment with the surgeon — your concerns, your anatomy, your medical history. Nothing is booked on the day you first walk in.'],
    ['The Plan', 'A written plan covering technique, realistic outcome, recovery, risks and total cost. You take it away and think about it.'],
    ['Procedure Day', 'Performed in an accredited theatre with a qualified consultant anaesthetist and continuous monitoring throughout.'],
    ['Recovery', 'Structured aftercare with direct contact to the clinical team, scheduled reviews and clear written instructions.']
  ].map(([h, p]) => `<div class="journey__item reveal"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('\n      ');

  const team = [
    {
      name: 'Dr. Praveen Chandra K',
      role: 'Plastic, Reconstructive & Cosmetic Surgeon',
      qualifications: 'MBBS, MS, MCh (Plastic Surgery) · KMC Reg. No. 74573 · Fellow in Advanced Cosmetic Surgery, MIBIS (Belgium)',
      bio: 'Founder & Director of Pearl Aesthetic Clinic, with more than two decades of experience in aesthetic surgery, rhinoplasty, breast surgery, body contouring and hair restoration.',
      image: 'team/praveen.jpg',
      href: 'surgeon.html'
    },
    {
      name: 'Dr. Shilpa Sharath Kumar',
      role: 'Aesthetic & Laser Medicine',
      qualifications: 'MBBS (Rajiv Gandhi University of Health Sciences), Masters in Dermatology (Cardiff University, UK)',
      bio: 'Specialises in pigmentary disorders, anti-aging procedures, liquid facelifts and glow therapies, with an evidence-based approach to personalised skin health.',
      image: 'team/shilpa.jpg'
    },
    {
      name: 'Dr. Prashanth R. Reddy',
      role: 'ENT & Rhinoplasty Specialist',
      qualifications: 'MBBS, MS (ENT), Fellowship in Rhinoplasty (Seoul, South Korea), MBA (IIM-B)',
      bio: 'Provides advanced care in nasal, skull-base and metabolic ENT surgery, with expertise in endoscopic and minimally invasive procedures.',
      image: 'team/prashanth.jpg'
    },
    {
      name: 'Rajeshwari R. Hanchinal',
      role: 'Clinical Nutritionist',
      qualifications: 'M.H.Sc (Food Science and Nutrition)',
      bio: 'Brings over 15 years of clinical nutrition experience, specialising in weight management, therapeutic nutrition and sustainable, personalised diet plans.',
      image: 'team/rajeshwari.jpg'
    }
  ].map(({ name, role, qualifications, bio, image, href }) => {
    const tag = href ? 'a' : 'article';
    const open = href ? `<a class="team-card reveal" href="${base}${href}" aria-label="View full profile for ${esc(name)}">` : '<article class="team-card reveal">';
    return `${open}
        <div class="team-card__media">${img(base, image, name, { w: 640, h: 800 })}</div>
        <div class="team-card__body">
          <p class="team-card__role">${esc(role)}</p>
          <h3>${esc(name)}</h3>
          <p class="team-card__qualifications">${esc(qualifications)}</p>
          <p class="team-card__bio">${esc(bio)}</p>
${href ? '          <span class="link-arrow">View full profile ' + svg(UI.arrow) + '</span>\n' : ''}        </div>
      </${tag}>`;
  }).join('\n      ');

  const body = `
${pageHero({
    crumb: 'About Us',
    eyebrow: 'The Practice',
    title: 'A clinic built around <em>judgement</em>',
    lead: `${esc(CLINIC.shortName)} brings surgical, laser and non-surgical aesthetic medicine together in one Koramangala practice — so the recommendation you receive is shaped by what will actually work, not by what happens to be available in the building.`,
    figure: `<aside class="page-hero__panel">
        <h4>At a glance</h4>
        <dl>
          <div><dt>Divisions</dt><dd>${CATEGORIES.length}</dd></div>
          <div><dt>Procedures</dt><dd>${totalServices}+</dd></div>
          <div><dt>Location</dt><dd>Koramangala, Bengaluru</dd></div>
          <div><dt>Consultations</dt><dd>Surgeon-led, 1:1</dd></div>
        </dl>
      </aside>`
  })}

<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal" data-dir="left">
        <p class="eyebrow">How We Work</p>
        <h2 class="h2">Four commitments we <em>hold to</em></h2>
        <ul class="checklist">
          <li>${svg(UI.check)}<span><b>Surgeon-led from the first appointment</b><p>You are assessed by the operating surgeon at consultation, not by a coordinator or a counsellor.</p></span></li>
          <li>${svg(UI.check)}<span><b>Accredited theatre, consultant anaesthesia</b><p>General anaesthesia is administered by a qualified consultant anaesthetist with continuous monitoring throughout.</p></span></li>
          <li>${svg(UI.check)}<span><b>Written plans and written quotations</b><p>Technique, expected outcome, recovery, risk and total cost — documented before you commit to anything.</p></span></li>
          <li>${svg(UI.check)}<span><b>We decline cases we should decline</b><p>Where expectations cannot be safely met, or a simpler option exists, we say so. That is the point of an assessment.</p></span></li>
        </ul>
      </div>
      <div class="split__visual reveal" data-dir="right">
        <figure class="fig fig--tall">${img(base, 'about-consultation-ai.png', 'Illustrative surgeon consultation in a private aesthetic clinic', { w: 960, h: 1280 })}<figcaption>Illustrative consultation image</figcaption></figure>
        <div class="stats" style="margin-top:1.5rem">
          <div><strong data-count="${CATEGORIES.length}">${CATEGORIES.length}</strong><span>Divisions</span></div>
          <div><strong data-count="${totalServices}" data-suffix="+">${totalServices}+</strong><span>Procedures</span></div>
          <div><strong>Fotona&reg;</strong><span>Laser Platform</span></div>
          <div><strong data-count="100" data-suffix="%">100%</strong><span>Confidential</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head is-center">
      <p class="eyebrow is-center" style="justify-content:center">Our Team</p>
      <h2 class="h2">Specialists working <em>together</em></h2>
      <p class="lead">A multidisciplinary team for surgical, skin, ENT and nutrition care — so your plan can be shaped around the full picture.</p>
    </div>
    <div class="team-grid">
      ${team}
    </div>
  </div>
</section>

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

${ctaBand(base)}
`;

  return shell({
    title: `About the Practice | ${CLINIC.shortName}, Koramangala`,
    description: `How ${CLINIC.shortName} is run — surgeon-led consultations, accredited theatre, written plans and quotations, and a four-step pathway from assessment to recovery.`,
    keywords: 'plastic surgery clinic Koramangala, aesthetic clinic Bengaluru, surgeon-led consultation Bangalore, accredited theatre Bengaluru',
    base, canonical: `${SITE_URL}/about.html`, active: 'about', body,
    jsonld: [clinicSchema, crumbs([['Home', '/'], ['About Us', '/about.html']])],
    ogImage: 'about-consultation-ai.png', ogImageAlt: 'Illustrative surgeon consultation in a private aesthetic clinic'
  });
}

/* ---------------------------------------------------------
   SURGEON
   --------------------------------------------------------- */
function surgeonPage() {
  const base = '';

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

  const specialties = [
    ['Facial Aesthetic Surgery', 'Primary and revision rhinoplasty, nasal bridge and tip refinement, facelift, blepharoplasty, facial fat transfer, jawline and neck contouring.'],
    ['Breast Surgery', 'Breast augmentation, minimally invasive implant surgery, breast lift, breast reduction, reshaping and fat transfer.'],
    ['Body Contouring', 'High-definition and VASER-assisted liposuction, 360° contouring, tummy tuck, mommy makeover, body lift and fat transfer.'],
    ['Male Aesthetic Surgery', 'Gynecomastia correction, chest contouring, and abdominal and body sculpting.'],
    ['Hair Restoration', 'FUE hair transplantation, body-hair transplantation, natural hairline design and advanced hair restoration.'],
    ['Reconstructive Surgery', 'Female genital rejuvenation, scar revision, post-traumatic and oncoplastic reconstruction, and microsurgical reconstruction.']
  ].map(([title, description]) => `<article class="card reveal">
        <p class="eyebrow">Specialisation</p>
        <h3 class="h3">${esc(title)}</h3>
        <p style="margin-top:.9rem;color:var(--text-muted);line-height:1.7">${esc(description)}</p>
      </article>`).join('\n      ');

  const physicianSchema = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `${SITE_URL}/surgeon.html#dr-praveen-chandra-k`,
    name: 'Dr. Praveen Chandra K',
    honorificPrefix: 'Dr.',
    jobTitle: 'Plastic, Reconstructive & Cosmetic Surgeon',
    identifier: 'KMC Reg. No. 74573',
    description: 'Senior Plastic, Reconstructive and Cosmetic Surgeon in Bengaluru with more than two decades of experience in plastic and aesthetic surgery.',
    medicalSpecialty: ['PlasticSurgery', 'CosmeticSurgery'],
    worksFor: { '@id': `${SITE_URL}/#clinic` },
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: "St. John's Medical College, Bengaluru" },
      { '@type': 'CollegeOrUniversity', name: "BLDEA's Medical College, Bijapur" },
      { '@type': 'CollegeOrUniversity', name: 'Vijayanagara Institute of Medical Sciences, Bellary' }
    ],
    knowsAbout: ['Rhinoplasty', 'Breast Surgery', 'Body Contouring', 'High-definition Liposuction', 'Hair Restoration', 'Reconstructive Surgery']
  };

  const body = `
${pageHero({
    crumb: 'Our Surgeon',
    eyebrow: 'Your Surgeon',
    title: `${esc(CLINIC.surgeon)}`,
    lead: 'Senior Plastic, Reconstructive and Cosmetic Surgeon with more than two decades of experience in aesthetic surgery, facial aesthetics, breast surgery, body contouring and hair restoration.',
    actions: `<a class="btn btn--primary" href="appointment.html">${svg(UI.cal)} Book a consultation</a>
          <a class="btn btn--ghost" href="results.html">See the case gallery ${svg(UI.arrow)}</a>`,
    figure: `<aside class="page-hero__panel">
        <h4>At a glance</h4>
        <dl>
          <div><dt>Qualifications</dt><dd>MBBS, MS, MCh</dd></div>
          <div><dt>Registration</dt><dd>KMC Reg. No. 74573</dd></div>
          <div><dt>Fellowship</dt><dd>Wellness Kliniek, Belgium</dd></div>
          <div><dt>Founder &amp; Director</dt><dd>Pearl Aesthetic Clinic</dd></div>
          <div><dt>Co-Founder</dt><dd>Dr Sculpt Aesthetic Clinic</dd></div>
        </dl>
      </aside>`
  })}

<section class="section">
  <div class="container">
    <div class="split split--reverse">
      <div class="split__visual reveal">
        <div class="fig fig--portrait fig--surgeon">${img(base, 'team/praveen.jpg', 'Dr. Praveen Chandra K, Plastic, Reconstructive and Cosmetic Surgeon', { w: 640, h: 800 })}</div>
      </div>
      <div class="reveal">
        <p class="eyebrow">Professional Profile</p>
        <h2 class="h2">Experience shaped by <em>precision</em></h2>
        <p class="lead" style="margin-top:1.3rem">Dr. Praveen Chandra K is the Founder &amp; Director of Pearl Aesthetic Clinic, Bengaluru, and Co-Founder of Dr Sculpt Aesthetic Clinic, Bengaluru. His practice focuses on refined, individualised aesthetic surgery and reconstruction.</p>
        <p style="margin-top:1rem;color:var(--text-muted);line-height:1.75">His approach is to enhance existing features while maintaining natural proportions, facial harmony and individuality — with meticulous technique, thoughtfully planned scars, clear communication and patient safety at every stage.</p>
        <dl class="credential-grid">
          <div><dt>Registration</dt><dd>Karnataka Medical Council (KMC No. 74573)</dd></div>
          <div><dt>Experience</dt><dd>20+ Years in Aesthetic &amp; Plastic Surgery</dd></div>
          <div><dt>MBBS</dt><dd>Vijayanagara Institute of Medical Sciences, Bellary</dd></div>
          <div><dt>MS, General Surgery</dt><dd>BLDEA's Medical College, Bijapur</dd></div>
          <div><dt>MCh, Plastic Surgery</dt><dd>St. John's Medical College, Bengaluru</dd></div>
          <div><dt>International Fellowship</dt><dd>Wellness Kliniek, Belgium (Cosmetic Surgery)</dd></div>
        </dl>
        <div style="margin-top:2rem">
          <a class="btn btn--primary" href="appointment.html">Book a consultation</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <div class="section-head is-center">
      <p class="eyebrow is-center" style="justify-content:center">Clinical Focus</p>
      <h2 class="h2">A comprehensive aesthetic<br><em>practice</em></h2>
      <p class="lead">A focused practice across face, breast, body, hair and reconstructive surgery — built around an individual treatment plan rather than a one-size-fits-all outcome.</p>
    </div>
    <div class="grid grid-3">
      ${specialties}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal">
        <p class="eyebrow">International Training</p>
        <h2 class="h2">Advanced training in<br><em>Belgium</em></h2>
        <p class="lead" style="margin-top:1.3rem">Fellow in Advanced Cosmetic Surgery &amp; Minimally Invasive Breast Implant Surgery at Wellness Kliniek, Belgium (2017–2018).</p>
      </div>
      <div class="reveal">
        <p style="color:var(--text-muted);line-height:1.75">The fellowship included advanced hands-on training in minimally invasive breast implant surgery, breast augmentation, liposculpture, facelift and eyelid surgery, breast lift and reduction, fillers, Botox and hair transplantation.</p>
        <div class="credential-grid">
          <div><dt>Professional Memberships</dt><dd>Association of Plastic Surgeons of India; Indian Medical Association</dd></div>
          <div><dt>Academic Contributions</dt><dd>Scientific presentations at APSICON and NABICON, with published academic literature in plastic surgery.</dd></div>
        </div>
      </div>
    </div>
  </div>
</section>

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

${ctaBand(base)}
`;

  return shell({
    title: `Our Surgeon | ${CLINIC.shortName}, Bengaluru`,
    description: `Meet Dr. Praveen Chandra K, MBBS, MS, MCh — Founder & Director of ${CLINIC.shortName}, Bengaluru, with more than two decades of experience in plastic, reconstructive and cosmetic surgery.`,
    keywords: 'Dr Praveen Chandra K, plastic surgeon Bengaluru, cosmetic surgeon Koramangala, MCh plastic surgery Bangalore, rhinoplasty surgeon Bengaluru, body contouring Bangalore',
    base, canonical: `${SITE_URL}/surgeon.html`, active: 'surgeon', body,
    jsonld: [clinicSchema, physicianSchema, crumbs([['Home', '/'], ['Our Surgeon', '/surgeon.html']])],
    ogImage: 'team/praveen.jpg', ogImageAlt: 'Dr. Praveen Chandra K, Plastic, Reconstructive and Cosmetic Surgeon'
  });
}

/* ---------------------------------------------------------
   BEFORE & AFTER
   --------------------------------------------------------- */

/**
 * The gallery's running order. Each entry reserves a case frame for one
 * procedure; the `look` line is educational — what a reader should actually
 * assess in a comparison — and stays true whether or not a photo is in place.
 *
 * To publish a case: add assets/img/results/<id>-before.jpg and -after.jpg,
 * then rebuild. Only add a pair once written patient consent is on file.
 */
const CASES = [
  ['rhinoplasty', 'Rhinoplasty', 'nose-surgery',
    'Profile taken from the same angle and lens length in both frames — a dorsal hump looks larger on a wide lens.'],
  ['septorhinoplasty', 'Septorhinoplasty', 'nose-surgery',
    'Breathing is the point here as much as shape; look for a straightened septum, not just a narrower bridge.'],
  ['blepharoplasty', 'Upper Blepharoplasty', 'eyelids-upper-face',
    'Brow position should be unchanged between frames — lifting the brow fakes an eyelid result.'],
  ['facelift', 'Facelift', 'face-surgery',
    'Check the jawline and the earlobe. A natural result leaves the earlobe hanging free, not tethered upward.'],
  ['breast-augmentation', 'Breast Augmentation', 'breast-surgery',
    'Same bra-less posture, arms down, in both frames. Look at the fold beneath the breast, not just volume.'],
  ['breast-reduction', 'Breast Reduction', 'breast-surgery',
    'Nipple position relative to the fold tells you more about the result than cup size does.'],
  ['gynecomastia', 'Gynecomastia Surgery', 'male-surgery',
    'Look for a flat contour that still has a natural chest shadow — over-resection leaves a hollow.'],
  ['liposuction-360', '360 Liposuction', 'body-surgery',
    'Judge the transition zones at the flank and back, not the front-on waist measurement.'],
  ['tummy-tuck', 'Tummy Tuck', 'body-surgery',
    'Scar position should sit below the bikini line, and the navel should look unoperated.'],
  ['bbl', 'Brazilian Butt Lift', 'buttock-contouring',
    'Assess the frame from the side. Projection matters less than whether the waist-to-hip transition is smooth.'],
  ['post-weight-loss', 'Post Weight Loss Body Lift', 'post-weight-loss',
    'Staged procedures — the comparison should state how many operations and over what period.'],
  ['hair-transplant', 'Hair Transplant (FUE)', 'hair-transplant',
    'Hairline density is meaningless without matched lighting and the same hair length in both frames.']
];

function resultsPage() {
  const base = '';

  const cases = CASES.map(([id, name, catSlug, look], i) => {
    const cat = catBySlug[catSlug];
    const tier = caseTier(id);
    const aiIllustration = AI_ILLUSTRATIONS[id];
    const n = String(i + 1).padStart(2, '0');

    // Provenance drives the badge, the alt text and the caption together, so a
    // frame can never show one thing and claim another.
    const meta = {
      patient: {
        badge: 'Patient result &middot; published with consent',
        alt: (w) => `${w} ${name} at ${CLINIC.shortName} — patient result published with written consent`,
        note: 'Drag to compare &middot; individual results vary'
      },
      illustration: {
        badge: 'Illustration &mdash; not a patient',
        alt: (w) => `Illustrative ${w.toLowerCase()} view of ${name} — not a patient of this clinic`,
        note: 'Fictional illustration &mdash; not a patient result'
      }
    }[tier];

    const panes = aiIllustration
      ? `<img class="ba__static" src="${base}assets/img/results/illustration/${aiIllustration}" alt="Fictional illustrative before-and-after ${esc(name)} comparison — not a patient of this clinic" width="1200" height="900" loading="lazy" decoding="async">`
      : tier
      ? `<div class="ba__pane ba__pane--before"><img src="${base}assets/img/results/${tier}/${id}-before.jpg" alt="${esc(meta.alt('Before'))}" width="1200" height="900" loading="lazy" decoding="async"></div>
          <div class="ba__pane ba__pane--after"><img${aiIllustration ? ' class="ba__source--after"' : ''} src="${base}assets/img/results/${tier}/${aiIllustration || `${id}-after.jpg`}" alt="${esc(meta.alt('After'))}" width="1200" height="900" loading="lazy" decoding="async"></div>`
      : `<div class="ba__pane ba__pane--before"></div>
          <div class="ba__pane ba__pane--after"></div>
          <span class="ba__badge ba__badge--empty">${svg(UI.lock)} Awaiting consented photography</span>`;

    // No data-lenis-prevent here: that is for panes that scroll internally.
    // On a .ba it just swallows the wheel, and a grid of them stops the page.
    return `<figure class="case reveal">
        <div class="ba${aiIllustration ? ' ba--static' : tier ? '' : ' ba--empty'}">
          ${panes}
          <span class="ba__label ba__label--before">Before</span>
          <span class="ba__label ba__label--after">After</span>
${aiIllustration ? '' : '          <span class="ba__handle"></span>\n'}          <span class="ba__note">${tier ? meta.note : 'No patient photograph is published for this case yet'}</span>
        </div>
        <figcaption class="case__body">
          <p class="case__meta"><span class="case__num">Case ${n}</span> <a href="${base}procedures/${cat.slug}.html">${esc(cat.name)}</a></p>
          <h3>${esc(name)}</h3>
          <p class="case__look"><b>What to look for:</b> ${esc(look)}</p>
        </figcaption>
      </figure>`;
  }).join('\n      ');

  const body = `
${pageHero({
    crumb: 'Before &amp; After',
    eyebrow: 'Results',
    title: 'Before &amp; After, <em>considered</em>',
    lead: 'A before-and-after image is only useful when the starting point is comparable to yours. This gallery is organised by division, and every frame states plainly what it is — including the ones still waiting on a patient’s consent.',
    actions: `<a class="btn btn--primary" href="appointment.html">${svg(UI.cal)} See cases matched to you</a>
          <a class="btn btn--ghost" href="index.html#treatments">Browse divisions ${svg(UI.arrow)}</a>`,
    figure: `<figure class="results-hero__visual">
        <img src="assets/img/results-hero-ai.png" alt="AI-generated illustrative before-and-after portrait of a fictional woman" width="1680" height="930" fetchpriority="high">
        <figcaption><span>Before / After</span><span>AI illustration &mdash; not a patient</span></figcaption>
      </figure>`
  })}

<section class="section">
  <div class="container">
    <div class="case-grid">
      ${cases}
    </div>
  </div>
</section>

${ctaBand(base)}
`;

  return shell({
    title: `Before & After Gallery | ${CLINIC.shortName}, Bengaluru`,
    description: `Before-and-after case gallery at ${CLINIC.shortName}, Koramangala — by division, with what to look for in each comparison. Consented photography only.`,
    keywords: 'before and after plastic surgery Bengaluru, rhinoplasty before after Bangalore, liposuction results Koramangala, breast surgery before after Bengaluru',
    base, canonical: `${SITE_URL}/results.html`, active: 'results', body,
    jsonld: [clinicSchema, crumbs([['Home', '/'], ['Before & After', '/results.html']])],
    ogImage: 'results-hero-ai.png', ogImageAlt: 'AI-generated illustrative before and after portrait for Pearl Aesthetic & Wellness'
  });
}

/* ---------------------------------------------------------
   CONTACT
   --------------------------------------------------------- */
function contactPage() {
  const base = '';

  const faqs = FAQS.map(([q, a], i) => `<div class="acc__item">
        <button class="acc__btn" type="button" aria-expanded="false" aria-controls="faq-${i}">
          <span>${esc(q)}</span><span class="acc__icon"></span>
        </button>
        <div class="acc__panel" id="faq-${i}"><div><p>${esc(a)}</p></div></div>
      </div>`).join('\n      ');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  };

  const body = `
${pageHero({
    crumb: 'Contact',
    eyebrow: 'Find Us',
    title: 'In the heart of <em>Koramangala</em>',
    lead: `${esc(CLINIC.addressLine1)}, ${esc(CLINIC.addressLine2)}, ${esc(CLINIC.addressLine3)}`,
    actions: `<a class="btn btn--primary" href="${CLINIC.mapsUrl}" target="_blank" rel="noopener">Get Directions</a>
          <a class="btn btn--ghost" href="appointment.html">${svg(UI.cal)} Book Appointment</a>`,
    figure: `<aside class="page-hero__panel">
        <h4>At a glance</h4>
        <dl>
          <div><dt>Open</dt><dd>${esc(CLINIC.hours)}</dd></div>
          <div><dt>Phone</dt><dd><a href="tel:${CLINIC.phoneRaw}">${esc(CLINIC.phoneDisplay)}</a></dd></div>
          <div><dt>Landmark</dt><dd>80ft Road, 4th Block</dd></div>
          <div><dt>Area</dt><dd>Koramangala, Bengaluru</dd></div>
        </dl>
      </aside>`
  })}

<section class="section" id="contact">
  <div class="container">
    <div class="split">
      <div class="reveal" data-dir="left">
        <p class="eyebrow">Clinic Details</p>
        <h2 class="h2">Getting <em>in touch</em></h2>
        <div class="credential-grid" style="margin-top:1.5rem">
          <div><dt>Phone</dt><dd><a href="tel:${CLINIC.phoneRaw}">${esc(CLINIC.phoneDisplay)}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${CLINIC.email}">${esc(CLINIC.email)}</a></dd></div>
          <div><dt>Opening hours</dt><dd>${esc(CLINIC.hours)}</dd></div>
          <div><dt>Nearest landmark</dt><dd>80ft Road, 4th Block</dd></div>
        </div>
        <div class="info-card" style="margin-top:1.8rem">
          <h4>Before you call</h4>
          <p>Enquiries about suitability, technique or cost cannot be answered reliably over the phone — they depend on an assessment. Booking a consultation is the fastest route to a straight answer.</p>
        </div>
        <div style="margin-top:1.8rem;display:flex;gap:.8rem;flex-wrap:wrap">
          <a class="btn btn--primary" href="appointment.html">${svg(UI.cal)} Book Appointment</a>
          <a class="btn btn--ghost" href="https://wa.me/${CLINIC.whatsapp}" target="_blank" rel="noopener">${svg(UI.wa)} WhatsApp</a>
        </div>
      </div>
      <div class="split__visual reveal">
        <div class="map-wrap">
          <!-- Query the Business Profile name, not the street address alone:
               the address on its own geocodes the building and drops the pin
               on "K.P.Aspire" rather than on the clinic. -->
          <iframe title="Map to ${esc(CLINIC.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=${encodeURIComponent(CLINIC.mapsQuery)}&z=17&output=embed"></iframe>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt" id="faq">
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

${ctaBand(base)}
`;

  return shell({
    title: `Contact & Directions | ${CLINIC.shortName}, Koramangala`,
    description: `Visit ${CLINIC.shortName} at ${CLINIC.addressLine2}, Bengaluru. Phone, email, opening hours, directions, and the questions asked most before booking.`,
    keywords: 'plastic surgery clinic Koramangala address, aesthetic clinic Bengaluru contact, cosmetic surgery Bangalore directions',
    base, canonical: `${SITE_URL}/contact.html`, active: 'contact', body,
    jsonld: [clinicSchema, faqSchema, crumbs([['Home', '/'], ['Contact', '/contact.html']])],
    ogImage: 'clinic.jpg', ogImageAlt: 'Pearl Aesthetic & Wellness, Koramangala, Bengaluru'
  });
}

/* ---------------------------------------------------------
   CATEGORY PAGE
   --------------------------------------------------------- */
/* These reviews appear in the shared testimonial carousel on each official
   division page. They are therefore displayed as general clinic-care feedback,
   never as proof of a result for the procedure being viewed. */
const CLINIC_FEEDBACK = Object.freeze([
  ['Satveer', 'I was very pleased with my experience at his place. I really appreciate the way he make patients comfortable.'],
  ['Satendra Kumar', 'The appointment scheduling system is amazing. I am delighted with the medical care.']
]);

function clinicFeedback(cat) {
  return `<section class="section section--alt">
  <div class="container">
    <div class="section-head is-center" style="margin-bottom:1.8rem">
      <p class="eyebrow is-center" style="justify-content:center">Patient Feedback</p>
      <h2 class="h2">What people say about <em>their care</em></h2>
    </div>
    <div class="grid grid-2" style="max-width:940px;margin-inline:auto">
      ${CLINIC_FEEDBACK.map(([name, quote]) => `<div class="quote reveal">
        <div class="quote__stars">${svg(UI.star).repeat(5)}</div>
        <p>&ldquo;${esc(quote)}&rdquo;</p>
        <div class="quote__by"><span class="quote__avatar">${esc(name.charAt(0))}</span><span><strong>${esc(name)}</strong><span>Published patient feedback</span></span></div>
      </div>`).join('\n      ')}
    </div>
    <p class="feedback-note">Feedback published on <a href="https://www.pearlaesthetic.in/procedure/${cat.slug}" target="_blank" rel="noopener">Pearl Aesthetic&rsquo;s official website</a>. It is general clinic feedback, may relate to a different treatment, and is not a guarantee of any outcome.</p>
  </div>
</section>`;
}

function categoryPage(cat, index) {
  const base = '../';
  const count = cat.groups.reduce((m, g) => m + g.services.length, 0);
  const allNames = cat.groups.flatMap((g) => g.services.map(([n]) => n));
  const categoryImage = `procedures/${cat.slug}.jpg`;
  const meta = cat.meta.map(([k, v]) =>
    `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n          ');

  const groups = cat.groups.map((g) => `<div class="svc-group reveal">
        <div class="svc-group__head">
          <h2>${esc(g.name)}</h2>
          <span>${g.services.length} procedures</span>
        </div>
        <div class="svc-grid">
          ${g.services.map(([n, d]) =>
            `<a class="svc" href="../services/${serviceFile(cat, n)}"><h3>${esc(n)}</h3><p>${esc(d)}</p><span class="svc__link">View treatment details ${svg(UI.arrow)}</span></a>`).join('\n          ')}
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
        <!-- Location in the H1 — this is the page that should rank for
             "<procedure> in Bengaluru" style local searches. -->
        <h1 class="display">${esc(cat.name)} <em>in Bengaluru</em></h1>
        <p class="lead">${esc(cat.tagline)} Surgeon-led care at ${esc(CLINIC.shortName)}, Koramangala.</p>
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
      ${img(base, categoryImage, cat.name + ' treatments at Pearl Aesthetic, Bengaluru', { w: 800, h: 534, lazy: false })}
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

${clinicFeedback(cat)}

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
      <a class="related__nav related__nav--prev" href="${prev.slug}.html">${svg(UI.arrow)} ${esc(prev.name)}</a>
      <a class="related__nav" href="${next.slug}.html">${esc(next.name)} ${svg(UI.arrow)}</a>
    </div>
  </div>
</section>

${ctaBand(base, bannerForCategory(cat.slug))}
`;

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${cat.name} — ${CLINIC.name}`,
    url: `${SITE_URL}/procedures/${cat.slug}.html`,
    description: cat.tagline,
    primaryImageOfPage: `${SITE_URL}/assets/img/${categoryImage}`,
    about: allNames.map((n) => ({ '@type': 'MedicalProcedure', name: n })),
    provider: { '@id': SITE_URL + '/#clinic' }
  };

  return shell({
    title: `${cat.name} in Bengaluru | ${CLINIC.shortName}`,
    description: `${cat.name} in Bengaluru — ${count} procedures. ${cat.tagline} Surgeon-led care in Koramangala.`,
    keywords: [cat.name + ' Bengaluru', cat.name + ' Bangalore', cat.name + ' Koramangala',
      ...cat.tags, ...allNames.slice(0, 10)].join(', ').toLowerCase(),
    ogImageAlt: `${cat.name} at ${CLINIC.name}, Bengaluru`,
    preload: categoryImage,
    base, canonical: `${SITE_URL}/procedures/${cat.slug}.html`, active: 'treatments', body,
    jsonld: [pageSchema, crumbs([
      ['Home', '/'], ['Treatments', '/#treatments'], [cat.name, `/procedures/${cat.slug}.html`]
    ])],
    ogImage: categoryImage
  });
}

/* A separate page for each service, generated from the procedure inventory.
   The official site supplies division imagery, rather than photos for every
   individual technique, so the image is explicitly described as a category
   image and never presented as a patient result. */
function servicePage(cat, group, service) {
  const [name, description] = service;
  const base = '../';
  const file = serviceFile(cat, name);
  const categoryImage = `procedures/${cat.slug}.jpg`;
  const related = group.services.filter(([other]) => other !== name).slice(0, 5);
  const relatedCards = related.map(([other, copy]) =>
    `<a class="svc" href="${serviceFile(cat, other)}"><h3>${esc(other)}</h3><p>${esc(copy)}</p><span class="svc__link">View details ${svg(UI.arrow)}</span></a>`).join('\n        ');
  const procedureSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: `${name} in Bengaluru`,
    description,
    url: `${SITE_URL}/services/${file}`,
    image: `${SITE_URL}/assets/img/${categoryImage}`,
    provider: { '@id': SITE_URL + '/#clinic' },
    isPartOf: { '@type': 'MedicalWebPage', name: cat.name, url: `${SITE_URL}/procedures/${cat.slug}.html` }
  };
  const body = `
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${base}index.html">Home</a><span>/</span><a href="${base}procedures/${cat.slug}.html">${esc(cat.name)}</a><span>/</span><span style="color:var(--text-muted)">${esc(name)}</span></nav>
    <div class="page-hero__grid">
      <div>
        <p class="eyebrow">${esc(cat.name)} &nbsp;&middot;&nbsp; ${esc(group.name)}</p>
        <h1 class="display">${esc(name)} <em>in Bengaluru</em></h1>
        <p class="lead">${esc(description)}</p>
        <div class="page-hero__actions"><a class="btn btn--primary" href="${base}appointment.html">${svg(UI.cal)} Book an Assessment</a><a class="btn btn--ghost" href="tel:${CLINIC.phoneRaw}">${svg(UI.phone)} ${esc(CLINIC.phoneDisplay)}</a></div>
      </div>
      <aside class="page-hero__panel"><h4>At a glance</h4><dl><div><dt>Division</dt><dd>${esc(cat.name)}</dd></div><div><dt>Focus</dt><dd>${esc(group.name)}</dd></div><div><dt>Location</dt><dd>Koramangala, Bengaluru</dd></div></dl></aside>
    </div>
    <figure class="fig fig--wide reveal" style="margin-top:clamp(2rem,4vw,3rem)">${img(base, categoryImage, `${cat.name} at Pearl Aesthetic, Bengaluru`, { w: 800, h: 534, lazy: false })}<figcaption>Official ${esc(cat.name.toLowerCase())} category image &mdash; illustrative, not a patient result.</figcaption></figure>
  </div>
</section>

<section class="section"><div class="container"><div class="split" style="align-items:start"><div class="reveal"><p class="eyebrow">About this treatment</p><h2 class="h2">Understanding <em>${esc(name)}</em></h2><p class="lead">${esc(description)}</p><p>Every treatment plan is individual. Your consultation considers your concerns, anatomy, health history and the alternatives that may suit you before any recommendation is made.</p></div><div class="split__visual reveal"><div class="info-card"><h4>Your consultation</h4><p>We discuss appropriate options, likely recovery, scars or side effects where relevant, and what is realistically achievable for you.</p><p style="margin-top:.9rem"><a class="link-arrow" href="${base}appointment.html">Book an assessment ${svg(UI.arrow)}</a></p></div><div class="info-card" style="margin-top:1.2rem;border-left-color:var(--sand-400)"><h4>Fees &amp; recovery</h4><p>Technique, theatre or anaesthetic needs and aftercare differ by person. You receive specific guidance and a written quotation following assessment.</p></div></div></div></div></section>

${clinicFeedback(cat)}

<section class="section"><div class="container"><div class="section-head" style="margin-bottom:1.8rem"><p class="eyebrow">Explore more</p><h2 class="h2">Related <em>${esc(group.name.toLowerCase())}</em></h2></div><div class="svc-grid">${relatedCards || `<a class="svc" href="../procedures/${cat.slug}.html"><h3>All ${esc(cat.name)} treatments</h3><p>Explore the full range of treatments in this division.</p><span class="svc__link">View division ${svg(UI.arrow)}</span></a>`}</div><p style="margin-top:2rem"><a class="link-arrow" href="../procedures/${cat.slug}.html">Back to all ${esc(cat.name)} procedures ${svg(UI.arrow)}</a></p></div></section>

${ctaBand(base, bannerForCategory(cat.slug))}`;
  return shell({
    title: `${name} in Bengaluru | ${CLINIC.shortName}`,
    description: `${name} in Bengaluru. ${description} Consultation-led care at ${CLINIC.shortName}, Koramangala.`,
    keywords: [name, `${name} Bengaluru`, `${name} Bangalore`, cat.name, ...cat.tags].join(', ').toLowerCase(),
    base, canonical: `${SITE_URL}/services/${file}`, active: 'treatments', body,
    ogImage: categoryImage, ogImageAlt: `${cat.name} at ${CLINIC.name}, Bengaluru`, preload: categoryImage,
    jsonld: [procedureSchema, crumbs([['Home', '/'], ['Treatments', '/#treatments'], [cat.name, `/procedures/${cat.slug}.html`], [name, `/services/${file}`]])]
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
    ogImageAlt: post.imageAlt,
    preload: post.image,
    article: {
      author: post.author,
      date: post.date,
      section: post.category,
      tags: post.keywords.split(',').map((t) => t.trim()).slice(0, 6)
    },
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
        <h1 class="display">Book a Plastic Surgery<br>Consultation <em>in Bengaluru</em></h1>
        <p class="lead">Let's start with a conversation. Send your details and we will call you back to arrange a time at our Koramangala clinic. Nothing is booked at the first consultation — you leave with a written plan and decide in your own time.</p>
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
          <!-- Query the Business Profile name, not the street address alone:
               the address on its own geocodes the building and drops the pin
               on "K.P.Aspire" rather than on the clinic. -->
          <iframe title="Map to ${esc(CLINIC.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=${encodeURIComponent(CLINIC.mapsQuery)}&z=17&output=embed"></iframe>
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
    description: `Request a consultation at ${CLINIC.shortName}, Koramangala, Bengaluru. Surgeon-led assessment, a written plan and a full quotation, with no obligation.`,
    keywords: 'book plastic surgery consultation Bengaluru, cosmetic surgery appointment Koramangala, aesthetic clinic booking Bangalore, plastic surgeon consultation India',
    base, canonical: `${SITE_URL}/appointment.html`, active: 'appointment', body,
    jsonld: [clinicSchema, crumbs([['Home', '/'], ['Appointment', '/appointment.html']])],
    ogImage: 'appointment.jpg'
  });
}

/* ---------------------------------------------------------
   PRIVACY POLICY & TERMS OF USE
   --------------------------------------------------------- */
function legalPage() {
  const base = '';
  const effectiveDate = '13 August 2026';

  const body = `
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span>/</span><span style="color:var(--text-muted)">Privacy Policy &amp; Terms of Use</span>
    </nav>
    <div class="section-head" style="margin-bottom:0;max-width:780px">
      <p class="eyebrow">Legal</p>
      <h1 class="display">Privacy Policy &amp;<br><em>Terms of Use</em></h1>
      <p class="lead">How ${esc(CLINIC.name)} collects, uses and protects your information, and the terms that apply when you use this website or book a consultation with us.</p>
    </div>
    <p style="margin-top:1.2rem;font-size:.85rem;color:var(--text-muted)">Effective date: ${effectiveDate}. Last reviewed: ${effectiveDate}.</p>
    <div class="band__actions" style="margin-top:1.6rem">
      <a class="btn btn--ghost" href="#privacy-policy">Jump to Privacy Policy ${svg(UI.arrow)}</a>
      <a class="btn btn--ghost" href="#terms-of-use">Jump to Terms of Use ${svg(UI.arrow)}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="prose">

      <div class="callout">
        <p>This page is written in plain language so it is actually useful to read. It does not cover every conceivable situation, and nothing here overrides the specific consent forms you sign in person before any procedure. If anything below is unclear, contact us using the details at the end of this page.</p>
      </div>

      <div id="privacy-policy">
      <p class="eyebrow">Part One</p>
      <h2 style="margin-top:.6rem">Privacy Policy</h2>
      <p>${esc(CLINIC.name)} ("we", "us", "our", "the clinic") respects your privacy and is committed to protecting the personal information of everyone who visits this website or enquires about, books or receives care with us ("you", "your"). This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and the choices and rights available to you.</p>
      <p>By using this website, submitting an enquiry or appointment request, or otherwise communicating with us through the channels listed on this site, you agree to the practices described in this Privacy Policy.</p>

      <h2>1. Information We Collect</h2>
      <p>We collect information in three broad ways:</p>
      <ul>
        <li><strong>Information you give us directly</strong> — your name, phone number, email address, city, and any message, question or medical concern you choose to share when you fill in an enquiry or appointment form, email us, call, or message us on WhatsApp.</li>
        <li><strong>Health-related information you choose to share</strong> — details of the procedure you are interested in, relevant medical history, current medications, prior surgeries or conditions, and photographs you may voluntarily send ahead of a consultation. You control how much you share before your first visit; nothing is collected without your action.</li>
        <li><strong>Information collected automatically</strong> — when you browse this website, your browser or device may share standard technical details such as approximate location (city-level, from IP address), pages viewed, time spent, referring site and general device/browser type. This helps us understand how the site is used and keep it working correctly.</li>
      </ul>
      <p>We do not ask for or knowingly collect financial information such as card numbers through this website — any payment for a procedure or consultation is handled in person or through a payment channel that has its own separate terms.</p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To respond to your enquiry and to schedule, confirm, reschedule or follow up on appointments.</li>
        <li>To allow the treating clinician(s) to prepare for your consultation.</li>
        <li>To send appointment reminders, follow-up instructions or post-procedure care information, by phone, SMS, WhatsApp or email.</li>
        <li>To answer questions you send us and to improve the quality of the care and information we provide.</li>
        <li>To maintain accurate clinical and administrative records, as required of any healthcare provider.</li>
        <li>To understand, in aggregate, how visitors use this website, so we can keep it accurate, fast and easy to use.</li>
        <li>To meet legal, regulatory and accreditation obligations.</li>
      </ul>
      <p>We do not use anything you share for automated decision-making about your care, and we do not sell your personal information to anyone, for any reason.</p>

      <h2>3. Confidentiality of Medical Information</h2>
      <p>Any health-related information you share with us is treated with the same confidentiality as your in-clinic medical records. It is accessible only to the clinicians and support staff directly involved in assessing or treating you, and to administrative staff who need it to manage your appointment. It is never used for marketing without your specific, separate consent, and it is never shared publicly — testimonials, before/after images or case studies are published only with your explicit written consent and are de-identified unless you agree otherwise.</p>

      <h2>4. Cookies and Similar Technologies</h2>
      <p>This website may use cookies and similar small files stored in your browser to remember basic preferences, keep the site functioning correctly (for example, showing you the menu you have open) and to understand overall visitor traffic in an aggregated, non-identifying way. You can control or delete cookies through your browser settings at any time; doing so may affect how some parts of the site behave but will not prevent you from browsing or contacting us.</p>

      <h2>5. How We Share Information</h2>
      <p>We do not sell, rent or trade your personal information. We only share it in the following limited circumstances:</p>
      <ul>
        <li><strong>Within the clinical team</strong> — with clinicians, nurses and support staff directly involved in your care or appointment administration.</li>
        <li><strong>Service providers acting on our behalf</strong> — for example, a diagnostics or anaesthesia partner directly involved in a procedure you have consented to, bound to the same standard of confidentiality.</li>
        <li><strong>Legal and safety requirements</strong> — where disclosure is required by law, by a court or regulatory authority, or is necessary to protect the safety of you or others.</li>
        <li><strong>With your explicit consent</strong> — for any purpose not covered above, we will ask first.</li>
      </ul>

      <h2>6. Data Storage and Security</h2>
      <p>We take reasonable administrative, technical and physical measures to protect the information we hold against unauthorised access, alteration, disclosure or loss. Access to clinical and contact records is restricted to authorised staff. No method of storage or transmission is completely infallible, and while we work to protect your information, we cannot guarantee absolute security — you should also take care when sharing sensitive information over any channel, including email and WhatsApp.</p>

      <h2>7. Data Retention</h2>
      <p>We retain personal and medical information for as long as needed to provide your care, to meet our legal, medical record-keeping and accreditation obligations, and to resolve any dispute. Where information is kept only for general website enquiries that never proceed to a consultation, it is retained only as long as reasonably useful before being deleted.</p>

      <h2>8. Your Rights</h2>
      <p>Subject to applicable Indian law, including the Digital Personal Data Protection Act, 2023, you may:</p>
      <ul>
        <li>Ask us what personal information we hold about you and how it is used.</li>
        <li>Ask us to correct information that is inaccurate or incomplete.</li>
        <li>Ask us to delete information we hold about you, except where we are required to retain it (for example, clinical records mandated by medical regulation).</li>
        <li>Withdraw consent for non-essential uses, such as marketing communications, at any time.</li>
        <li>Raise a complaint about how your information has been handled.</li>
      </ul>
      <p>To exercise any of these rights, contact us using the details in the "Contact Us" section at the end of this page. We will respond within a reasonable time.</p>

      <h2>9. Children's Privacy</h2>
      <p>This website is not directed at children. Where care is sought for a minor, it is provided only with the involvement, consent and presence of a parent or legal guardian, and information is handled with the same confidentiality described above.</p>

      <h2>10. Third-Party Links and Platforms</h2>
      <p>This site may link out to or embed third-party platforms — for instance, messaging, social media or map/direction services you choose to use to contact us or find our location. Any information you share on those platforms is governed by their own privacy terms, not this one. We encourage you to review those before using them.</p>

      <h2>11. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time to reflect changes in our practices or in applicable law. The "Effective date" at the top of this page will always show when it was last revised. Continued use of the website after an update constitutes acceptance of the revised policy.</p>
      </div>

      <hr style="border:none;border-top:1px solid var(--line);margin:3.2rem 0">

      <div id="terms-of-use">
      <p class="eyebrow">Part Two</p>
      <h2 style="margin-top:.6rem">Terms of Use</h2>
      <p>These Terms of Use govern your access to and use of this website. By browsing this site, submitting an enquiry, or booking an appointment through it, you agree to be bound by these terms. If you do not agree, please do not use this website.</p>

      <h2>1. About This Website</h2>
      <p>This website is published by ${esc(CLINIC.name)} to provide general information about our practice, our specialists, the procedures we offer, and to allow prospective and existing patients to make enquiries and request appointments.</p>

      <h2>2. Not Medical Advice</h2>
      <p>All content on this website — including procedure descriptions, articles, FAQs and any illustrative photography — is provided for general education only. It is not medical advice, is not tailored to any individual's anatomy, medical history or circumstances, and must never be used as a substitute for an in-person consultation with a qualified practitioner. Do not delay seeking medical advice, or disregard it, because of something you have read here.</p>

      <h2>3. No Doctor-Patient Relationship</h2>
      <p>Browsing this website, submitting a form, or exchanging general messages with us does not, by itself, create a doctor-patient relationship. That relationship begins only once you have had a formal consultation with a treating clinician and both parties have agreed to proceed.</p>

      <h2>4. Appointments and Enquiries</h2>
      <p>Submitting an appointment or enquiry form is a request, not a confirmed booking — we will contact you to confirm date, time and any preparation required. We reserve the right to decline, postpone or reschedule an appointment, including where a case requires further assessment before a date can safely be confirmed. Please give us as much notice as possible if you need to cancel or reschedule, so the slot can be offered to another patient.</p>

      <h2>5. Fees, Quotations and Payment</h2>
      <p>Costs for consultations and procedures are confirmed only after an in-person or video assessment, in writing, and are specific to your case. Nothing on this website should be read as a fixed price quotation. Payment terms for any confirmed procedure are set out separately at the time of booking.</p>

      <h2>6. Medical Disclaimer and No Guaranteed Outcomes</h2>
      <p>All surgical and non-surgical procedures carry inherent risk. Individual results vary, and no specific outcome, timeline or result shown on this website is guaranteed for any individual. Suitability for any procedure can only be established through a proper consultation and clinical assessment. Photography used for illustration on this site is illustrative only and does not depict patients of this clinic unless explicitly labelled as a genuine patient result with their consent.</p>

      <h2>7. Testimonials and Reviews</h2>
      <p>Any testimonials, reviews or patient accounts published on this website reflect individual experiences and opinions. They are not a guarantee, warranty or prediction of the outcome any other patient will experience, as outcomes depend on individual anatomy, health and circumstances.</p>

      <h2>8. Intellectual Property</h2>
      <p>Unless otherwise stated, the text, layout, graphics, photography and overall design of this website are the property of ${esc(CLINIC.name)} or are used under licence, and are protected by applicable intellectual property law. You may view and print pages for your own personal, non-commercial reference. You may not reproduce, republish, distribute or otherwise use any content from this site for commercial purposes without our prior written permission.</p>

      <h2>9. Acceptable Use</h2>
      <p>When using this website, you agree not to: submit false or misleading information; attempt to gain unauthorised access to any part of the site or its underlying systems; interfere with the site's normal operation; or use the site for any unlawful purpose.</p>

      <h2>10. Third-Party Links</h2>
      <p>This website may contain links to third-party websites and platforms (for example, social media, messaging or map services) for your convenience. We do not control and are not responsible for the content, accuracy or practices of those third-party sites. Visiting them is at your own discretion and subject to their own terms.</p>

      <h2>11. Limitation of Liability</h2>
      <p>To the fullest extent permitted by applicable law, ${esc(CLINIC.name)} shall not be liable for any indirect, incidental or consequential loss arising from your use of, or inability to use, this website, or reliance on any information published on it. This does not limit or exclude any liability that cannot lawfully be limited or excluded, including liability arising from clinical negligence in the course of actual treatment, which is governed separately by the consent and treatment documentation you sign in person.</p>

      <h2>12. Indemnity</h2>
      <p>You agree to indemnify and hold ${esc(CLINIC.name)} harmless from any claim, loss or demand arising out of your misuse of this website or your breach of these Terms of Use.</p>

      <h2>13. Governing Law and Jurisdiction</h2>
      <p>These Terms of Use are governed by the laws of India. Any dispute arising out of or in connection with this website shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.</p>

      <h2>14. Changes to These Terms</h2>
      <p>We may revise these Terms of Use at any time by updating this page. The "Effective date" at the top reflects the latest revision. Continued use of the website after a change constitutes your acceptance of the updated terms.</p>

      <h2>15. Contact Us</h2>
      <p>For any question about this Privacy Policy or these Terms of Use, or to exercise any of the rights described above, please reach us at:</p>
      <ul>
        <li><strong>${esc(CLINIC.name)}</strong><br>${esc(CLINIC.addressLine1)}, ${esc(CLINIC.addressLine2)}<br>${esc(CLINIC.addressLine3)}</li>
        <li>Phone: <a href="tel:${CLINIC.phoneRaw}">${esc(CLINIC.phoneDisplay)}</a></li>
        <li>Email: <a href="mailto:${CLINIC.email}">${esc(CLINIC.email)}</a></li>
      </ul>
      </div>

    </div>
  </div>
</section>

${ctaBand(base)}
`;

  return shell({
    title: `Privacy Policy & Terms of Use | ${CLINIC.shortName}`,
    description: `How ${CLINIC.name} collects, uses and protects your personal information, and the terms that apply when you use this website or book a consultation.`,
    keywords: 'privacy policy, terms of use, terms and conditions, pearl aesthetic legal',
    base, canonical: `${SITE_URL}/privacy-terms.html`, active: 'privacy', body,
    jsonld: crumbs([['Home', '/'], ['Privacy Policy & Terms of Use', '/privacy-terms.html']])
  });
}

/* ---------------------------------------------------------
   HTML sitemap — a flat crawl path to every division, article
   and individual procedure, and genuinely useful to visitors.
   --------------------------------------------------------- */
function sitemapPage() {
  const base = '';

  const divisions = CATEGORIES.map((c) => {
    const svcs = servicesOf(c);
    return `<div class="svc-group reveal">
        <div class="svc-group__head">
          <h2><a href="procedures/${c.slug}.html">${esc(c.name)}</a></h2>
          <span>${svcs.length} procedures</span>
        </div>
        <ul class="sitemap-list">
          ${svcs.map((s) =>
            `<li><a href="services/${serviceFile(c, s.name)}">${esc(s.name)}</a></li>`).join('\n          ')}
        </ul>
      </div>`;
  }).join('\n      ');

  const body = `
<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span>/</span><span style="color:var(--text-muted)">Sitemap</span>
    </nav>
    <div class="section-head" style="margin-bottom:0;max-width:780px">
      <p class="eyebrow">Site Index</p>
      <h1 class="display">Every page,<br><em>every procedure</em></h1>
      <p class="lead">All ${CATEGORIES.length} specialist divisions and ${totalServices} procedures in one list, plus every article.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="svc-group reveal">
      <div class="svc-group__head"><h2>Main pages</h2></div>
      <ul class="sitemap-list">
        <li><a href="index.html">Home</a></li>
        <li><a href="appointment.html">Book an Appointment</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="about.html">About the Practice</a></li>
        <li><a href="surgeon.html">Our Surgeon</a></li>
        <li><a href="results.html">Before &amp; After</a></li>
        <li><a href="contact.html#faq">FAQs</a></li>
        <li><a href="contact.html">Contact &amp; Directions</a></li>
        <li><a href="privacy-terms.html">Privacy Policy &amp; Terms of Use</a></li>
      </ul>
    </div>

    ${divisions}

    <div class="svc-group reveal">
      <div class="svc-group__head"><h2><a href="blog.html">Articles</a></h2><span>${BLOG.length} articles</span></div>
      <ul class="sitemap-list">
        ${BLOG.map((p) => `<li><a href="blog/${p.slug}.html">${esc(p.title)}</a></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>

${ctaBand(base)}
`;

  return shell({
    title: `Sitemap | All ${totalServices} Procedures | ${CLINIC.shortName}`,
    description: `Full index of ${CLINIC.name}, Koramangala, Bengaluru — all ${CATEGORIES.length} specialist divisions, ${totalServices} procedures and ${BLOG.length} articles in one list.`,
    keywords: 'pearl aesthetic sitemap, cosmetic surgery procedures list bengaluru, plastic surgery treatments koramangala',
    base, canonical: `${SITE_URL}/sitemap.html`, active: 'sitemap', body,
    jsonld: crumbs([['Home', '/'], ['Sitemap', '/sitemap.html']])
  });
}

/* ---------------------------------------------------------
   XML sitemap
   --------------------------------------------------------- */
function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = [
    [`${SITE_URL}/`, '1.0', today],
    [`${SITE_URL}/appointment.html`, '0.9', today],
    [`${SITE_URL}/results.html`, '0.8', today],
    [`${SITE_URL}/about.html`, '0.8', today],
    [`${SITE_URL}/surgeon.html`, '0.8', today],
    [`${SITE_URL}/contact.html`, '0.8', today],
    [`${SITE_URL}/blog.html`, '0.8', today],
    [`${SITE_URL}/sitemap.html`, '0.4', today],
    [`${SITE_URL}/privacy-terms.html`, '0.3', today],
    ...CATEGORIES.map((c) => [`${SITE_URL}/procedures/${c.slug}.html`, '0.8', today]),
    ...CATEGORIES.flatMap((c) => servicesOf(c).map((s) =>
      [`${SITE_URL}/services/${serviceFile(c, s.name)}`, '0.6', today])),
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
  fs.mkdirSync(path.join(ROOT, 'services'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'blog'), { recursive: true });

  fs.writeFileSync(path.join(ROOT, 'index.html'), homePage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'about.html'), aboutPage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'surgeon.html'), surgeonPage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'results.html'), resultsPage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'contact.html'), contactPage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'appointment.html'), appointmentPage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'blog.html'), blogIndexPage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'sitemap.html'), sitemapPage(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'privacy-terms.html'), legalPage(), 'utf8');
  console.log('  index, about, surgeon, results, contact, appointment, blog, sitemap, privacy-terms');

  CATEGORIES.forEach((cat, i) =>
    fs.writeFileSync(path.join(ROOT, 'procedures', `${cat.slug}.html`), categoryPage(cat, i), 'utf8'));
  console.log(`  procedures/ — ${CATEGORIES.length} pages`);

  CATEGORIES.forEach((cat) => cat.groups.forEach((group) => group.services.forEach((service) =>
    fs.writeFileSync(path.join(ROOT, 'services', serviceFile(cat, service[0])), servicePage(cat, group, service), 'utf8'))));
  console.log(`  services/ — ${totalServices} treatment-detail pages`);

  BLOG.forEach((post, i) =>
    fs.writeFileSync(path.join(ROOT, 'blog', `${post.slug}.html`), blogPostPage(post, i), 'utf8'));
  console.log(`  blog/ — ${BLOG.length} articles`);

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');
  console.log('  sitemap.xml, robots.txt');

  /* 301s from the previous site's URL scheme. Its 259 indexed URLs (/service/*,
     /procedure/*, /about-us, /contact) do not exist in this build, so without
     these every one of them 404s and its accumulated ranking is discarded.
     Emitted in both common formats since the host is not pinned down here. */
  const redirects = require('./redirects.json');
  fs.writeFileSync(path.join(ROOT, '_redirects'),
    '# Netlify / Cloudflare Pages — 301s from the previous URL scheme.\n' +
    '# Generated by build/generate.js from build/redirects.json. Do not hand-edit.\n' +
    redirects.map(([from, to]) => `${from}  ${to}  301`).join('\n') + '\n', 'utf8');

  fs.writeFileSync(path.join(ROOT, '.htaccess'),
    '# Apache / cPanel — 301s from the previous URL scheme.\n' +
    '# Generated by build/generate.js from build/redirects.json. Do not hand-edit.\n' +
    '<IfModule mod_rewrite.c>\n  RewriteEngine On\n' +
    redirects.map(([from, to]) =>
      `  RewriteRule ^${from.replace(/^\//, '').replace(/[.$]/g, '\\$&')}/?$ ${to} [R=301,L,NE]`
    ).join('\n') +
    '\n</IfModule>\n', 'utf8');
  console.log(`  _redirects, .htaccess — ${redirects.length} legacy URLs mapped`);

  const pages = 9 + CATEGORIES.length + totalServices + BLOG.length;
  const byTier = (t) => CASES.filter(([id]) => caseTier(id) === t);
  const empty = CASES.filter(([id]) => !caseTier(id));
  console.log(`\n✓ Built ${pages} pages · ${totalServices} procedures · ${BLOG.length} articles.`);

  console.log(`\n   Before & After: ${byTier('patient').length} patient · ` +
    `${byTier('illustration').length} illustration · ${empty.length} reserved (of ${CASES.length}).`);
  if (empty.length) {
    console.log('   Add a -before.jpg / -after.jpg pair to publish a reserved frame:');
    console.log('     assets/img/results/patient/       consented patient photography');
    console.log('     assets/img/results/illustration/  commissioned or licensed artwork');
    console.log(`   Reserved: ${empty.map(([id]) => id).join(', ')}`);
  }
  // Loud, every build: demo stand-ins must never reach production unnoticed.
  const demoFile = path.join(ROOT, 'assets/img/results/illustration/.demo');
  if (fs.existsSync(demoFile)) {
    const ids = fs.readFileSync(demoFile, 'utf8').split('\n')
      .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    if (ids.length) {
      console.log(`\n⚠  DEMO PLACEHOLDERS IN PLACE — ${ids.length} case(s) show generic stock`);
      console.log('   photography from picsum.photos, not clinical imagery. Badged as');
      console.log('   "Illustration — not a patient", but DO NOT SHIP THIS TO PRODUCTION.');
      console.log('   Replace via assets/img/results/patient/, or clear with:');
      console.log('     rm -rf assets/img/results/illustration && node build/generate.js');
    }
  }

  if (!fs.existsSync(path.join(ROOT, 'assets/img/logo.png'))) {
    console.log('\n⚠  assets/img/logo.png is missing — the header is falling back to the');
    console.log('   typographic lockup. Drop the clinic logo there and rebuild.');
  }
}

build();
