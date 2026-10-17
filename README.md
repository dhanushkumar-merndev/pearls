# Pearl Aesthetic & Wellness — Website

A static site for Pearl Aesthetic & Wellness Clinic, Koramangala, Bengaluru.
Plain HTML, CSS and JavaScript — no framework, no build step required to host it.

Design direction follows the Makam Multi Speciality reference: warm sand/gold palette,
Playfair Display + Plus Jakarta Sans, bold editorial typography.

**31 pages · 263 procedures · 6 articles · 30 images**

---

## What's here

```
index.html              Landing page
appointment.html        Booking page — form, what to expect, what to bring, FAQs
blog.html               Article index
privacy-terms.html      Privacy Policy & Terms of Use
procedures/             16 category pages, one per specialist division
blog/                   6 long-form articles
assets/css/style.css    The whole design system
assets/js/main.js       Nav, dropdown, drawer, accordion, slider, form, scroll
assets/js/lenis.min.js  Lenis smooth-scroll (vendored, v1.3.11, MIT)
assets/img/             30 photographs (CC0 licensed) + logo.png
sitemap.xml             Auto-generated
robots.txt              Auto-generated

build/data.js           ← PROCEDURE CONTENT (16 divisions, 263 procedures)
build/blog.js           ← ARTICLE CONTENT
build/generate.js       The generator that writes the HTML
build/serve.js          Local dev server (optional)
```

## Running it

**Quickest:** open `index.html` in any browser. Everything works.

**Better, for development** — serves over `http://` so the Google Maps embed behaves
exactly as it will in production:

```
node build/serve.js
```

Then visit **http://localhost:5173**. Pass a port to change it (`node build/serve.js 8080`).

---

## Editing content

Do not hand-edit the generated `.html` files — they get overwritten.

| To change… | Edit… |
|---|---|
| Clinic phone, address, hours, socials | `build/data.js` → `CLINIC` |
| Divisions and the 263 procedures | `build/data.js` → `CATEGORIES` |
| Blog articles | `build/blog.js` → `BLOG` |
| Page layout / SEO tags | `build/generate.js` |
| Styling | `assets/css/style.css` |
| Offers under the navbar | **Not here** — the CRM (see *Live offers* below) |
| Centres, milestones, clinic photos | `build/data.js` → `CENTRES`, `MILESTONES`, `CLINIC_PHOTOS` |
| Testimonials, case studies | `build/data.js` → `TESTIMONIALS`, `CASE_STUDIES` |
| Enquiry form endpoint | `build/data.js` → `CLINIC.enquiryApi` (see *How the enquiry form works*) |

Then run:

```
node build/generate.js
```

That rewrites all 31 pages and the sitemap.

### Adding a blog post

Append an object to the `BLOG` array in `build/blog.js`:

```js
{
  slug: 'url-slug',
  title: 'Full headline shown on the page',
  seoTitle: 'Short headline for the <title> tag',   // keep under ~45 chars
  excerpt: 'One or two sentences, 70–160 chars.',   // becomes the meta description
  category: 'Recovery',
  image: 'blog-2.jpg',                              // a file in assets/img/
  imageAlt: 'Describe the image',
  date: '2026-07-01',
  readTime: 7,
  author: AUTHOR,
  keywords: 'comma, separated, search terms',
  body: [
    { p: ['Opening paragraph.', 'Second paragraph.'] },
    { h: 'A section heading', p: ['Text.'], list: ['Bullet one', 'Bullet two'], after: ['Text after the list.'] }
  ]
}
```

Rebuild and it appears in the index, the sitemap, the home-page teaser and the
"keep reading" block on other articles automatically.

---

## Live offers (from the CRM)

The dark strip under the navbar and its details modal are filled at runtime
from the clinic CRM (`app.pearlaesthetic.in`). The CRM is the single source of
truth: admins create, publish, re-price, disable, reorder and delete offers
there. Nothing about offers is edited or rebuilt here.

| Piece | File |
|---|---|
| Strip + modal markup (on every page) | `build/generate.js` → `offersBar()`, `offerModal()` |
| Fetching, rendering, modal behaviour | `assets/js/offers.js` |
| Styles | `assets/css/style.css` → *Live offers* block |
| API address | `build/data.js` → `CLINIC.offersApi` (override at build time with `OFFERS_API_URL`) |

**API used** (contract owned by the CRM; CORS-enabled, no credentials):

- `GET {offersApi}` → `{ offers: PublicOffer[], generatedAt }`, already filtered to live offers and sorted
- `GET {offersApi}/{id}` → `{ offer: PublicOffer }`, or `404` once the offer is unpublished, disabled, expired or deleted
- `PublicOffer`: `id, title, description, terms, imageUrl, originalPricePaise, offerPricePaise, currency, startsOn, endsOn (YYYY-MM-DD, IST, inclusive), displayOrder, updatedAt`

**How changes reach visitors.** Each page load revalidates with the CRM (`cache: no-cache`),
and the CRM expires its own cache on every change. A price edit, unpublish or expiry
therefore shows on the visitor's next page load, or when they come back to the tab after a minute.
Opening the modal always re-fetches that one offer, so it never shows a stale price.
The site stays static: no webhook, rebuild or redeploy is involved.

**Safety rules in `offers.js`:**

- All CRM text is set with `textContent`, never `innerHTML`.
- Image URLs must be `https:`.
- Dates are re-checked against today in Asia/Kolkata, so an expired offer never shows, even from a cache.
- If the CRM is down or returns an error, the strip stays hidden. A copy less than five minutes old is the only fallback.
- Deep links work: `/index.html#offer-<id>` opens that offer.
- "Book this offer" opens `appointment.html?offer=<title>` and pre-fills the message field.

With no live offers, or with JavaScript off, the strip is not shown at all.

## ⚠️ Before this goes live

These are placeholders and **must** be replaced. Each is marked with a `⚠️` comment
in `build/generate.js` or `build/blog.js`.

| Item | Where | What's needed |
|---|---|---|
| **Surgeon credentials** | Home → "Your Surgeon" & Surgeon page | Dr. Praveen Chandra K: MBBS, MS, MCh (Plastic Surgery), KMC Reg. No. 74573. |
| **Clinic logo (dark variant)** | `assets/img/logo-dark.png` | Optional. The light lockup is in place and working. Supply the gold-on-black version only if you want a dark header — see "The logo" below. |
| **Surgeon photograph** | Home → "Your Surgeon" | Currently shows a **clinic interior**, deliberately — a stock portrait must never sit under a named doctor. Swap in their own photo. |
| **Patient testimonials** | Home → "Patient Voices" | Three illustrative placeholders. Replace with genuine consented reviews. Publishing invented reviews is misleading and a legal risk. |
| **Before/after images** | Gallery | Clinic-supplied patient posters only. AI-generated illustrations have been removed. |
| **Article authorship** | `build/blog.js` → `AUTHOR` | Attributed to "Pearl Aesthetic Clinical Team". Change to a named clinician once someone has reviewed and signed off the medical content. |
| **Consultation fee** | `appointment.html` FAQ | Says the fee is quoted at booking. Replace with the actual figure if the clinic prefers to publish it. |
| **Experience figures** | Home hero | A marked slot for a "years of experience" figure once the clinic confirms a real number. Nothing invented has been published. |

Stats currently shown (16 divisions, 263+ procedures, Fotona® platform) are all
verifiable from the site's own content, so they are safe as-is.

---

## The logo

`assets/img/logo.png` — **403×159, transparent PNG, 49 KB.**

Sourced from the clinic's own live site (`pearlaesthetic.in/assets/img/logo2.png`),
then auto-trimmed of its transparent margins. It renders at 68px tall in the header,
58px at tablet widths, 52px on mobile — the lockup has a fine "Aesthetic & Wellness
Clinic" subtitle line, so the header is 90px tall to keep it legible.

If the `<img>` is ever missing, an `onerror` handler swaps in a typographic lockup so
the header is never empty, and `node build/generate.js` prints a warning.

### Two variants exist — this matters

The version in use has a **dark brown wordmark** on transparency, meant for pale
backgrounds. There is also a **gold-on-black** variant.

That is why:

- The **header is cream**, not dark. A dark header would swallow the brown wordmark.
- The **footer** (which is ink) hides the image and shows the light typographic
  lockup instead — see `.footer .logo__img { display: none }` in the CSS.

**If you want a dark header instead**, save the gold-on-black artwork as
`assets/img/logo-dark.png` and say so. Both spots can then use the real logo, and the
header/drawer colours flip back to ink — the CSS for that is a single block, commented
in `assets/css/style.css` above `.nav`.

The favicon is still an inline SVG monogram; it can be generated from the emblem.

---

## Motion and scrolling

**Lenis** drives smooth scrolling (vendored locally at `assets/js/lenis.min.js` — no
CDN). It is deliberately **switched off entirely** when the visitor has
`prefers-reduced-motion` set, and `smoothTouch` is off because native momentum
scrolling on phones is better and cheaper than emulating it.

Things worth knowing if you change this:

- Native `scroll-behavior: smooth` is disabled whenever Lenis is active
  (`html:not(.lenis)`) — running both fights over the scroll position.
- In-page anchor links are routed through Lenis so the easing matches, and offset by
  the sticky header height so sections do not land underneath it.
- Anchors have a **1.6s arrival guard**: if `requestAnimationFrame` is throttled
  (background tab, low-power mode, busy main thread) the Lenis animation can stall
  part-way, so the link snaps to its destination rather than under-shooting.
- Lenis is paused while the mobile drawer is open and while dragging the before/after
  slider — `overflow: hidden` alone does not stop it.

**What moves**

| Effect | Where |
|---|---|
| Staggered hero entrance | badge → H1 lines → lead → buttons → stats → image, on load |
| Counting numbers | hero trust row and the stats band, when scrolled into view |
| Scroll progress bar | 2px gold line along the bottom of the header |
| Condensing header | nav and logo shrink once you scroll past 10px |
| Parallax | the full-bleed CTA band image drifts against the scroll |
| Directional reveals | sections arrive from left / right / zoom, not all upward |
| Button sheen | a light sweep across the button on hover |
| Card polish | image zoom, gold rule drawing across the base |
| WhatsApp pulse | soft expanding ring on the floating button |

**Animation cost** is kept low deliberately: only `opacity` and `transform` are
animated (both composited — no layout or paint), `will-change` is applied just for
the duration of each transition rather than held on dozens of elements, and cards use
`contain: layout paint style`. Scroll work is split — the class toggle and the progress
bar (write-only) run synchronously so they never lag, while parallax (which reads
layout) is deferred to `requestAnimationFrame`. On coarse pointers all hover-lift
effects are disabled, since they stick after a tap.

**Nothing can get stranded invisible.** The hero's hidden state lives in the keyframes
(`animation-fill-mode: backwards`) rather than a base `opacity: 0`, so if animations
never run the hero is simply visible; a timer then adds `.is-settled` which removes the
animation outright. Counters have a timer backstop that writes the final figure even if
`requestAnimationFrame` stalls. And `lenis.resize()` is called on `load`, because Lenis
caches its scroll limit at init — before images change the page height — which
otherwise leaves the progress bar reading against a stale total.

---

## The Treatments dropdown

A **two-panel mega menu**, modelled on Centre for Surgery: the 16 divisions sit in a
left rail (each with its procedure count), and hovering or tapping one swaps the right
panel to that division's procedures in three columns.

**All 263 procedures are real links** — each deep-links to its own anchor on the
category page (`procedures/nose-surgery.html#septoplasty`). Every `.svc` card carries a
generated `id`, has `scroll-margin-top` so it clears the sticky header, and gets a gold
outline via `:target` when you arrive. This is the site's main internal-linking asset:
263 links with keyword-rich anchor text on every page.

It adds ~52 KB to each page (≈13 KB gzipped) — the trade the reference site makes too.

**Open state is the `.is-open` class, set by JS — for hover as well as tap.** There is
deliberately *no* CSS `:hover` rule, and that is not an oversight:

- The panel sits below a gap. The moment `:hover` is lost mid-gap, the panel gets
  `pointer-events: none`, so the pointer can never land on it to bring hover back —
  the menu becomes impossible to enter. A class has no such chicken-and-egg.
- On touch, `:hover` latches after a tap and the menu can never be dismissed.

Supporting pieces, all of which matter:

- **`.has-menu::after` is an invisible hover bridge** across the dead strip between the
  trigger and the panel. It lives on the `<li>`, *not* inside `.mega` — `.mega` has
  `overflow: hidden` for its rounded corners, which would clip a bridge placed inside.
- **Nav items stretch to the full bar height** (`.nav__primary { align-self: stretch }`
  down to `.nav__links > li`), so there is no dead strip between the link text and the
  bottom of the header.
- **A 180ms grace period** on `mouseleave`, cancelled on re-entry, so clipping a corner
  does not dismiss it.
- **Hovering any other top-level nav item closes it immediately**, rather than waiting
  out that grace period.

Also closes on Escape and outside-click. `aria-haspopup` / `aria-expanded` /
`aria-selected` are maintained, and ArrowUp/ArrowDown move through the rail.

Two more subtleties worth preserving:

- `visibility` is **not** in the transition list. It is a discrete property and browsers
  disagree about when it flips mid-transition, which made the panel stay invisible even
  with the open class applied. It now switches instantly on open, delayed on close.
- The "Division overview" link restates `display: inline-flex` at matching specificity.
  `.mega a { display: block }` would otherwise beat it, and the global
  `svg { display: block }` then drops the arrow onto its own line.

The mega panel is positioned against `.nav__inner` (which is `position: relative`),
not against its `<li>` — that is why `.has-menu` is `position: static`. It lets the
panel span the full container width instead of being centred on its trigger.

## Headings and the tagline

The H1 leads with the search term and then carries the brand line:

> **Plastic Surgery in Bengaluru**
> *where science meets artistry*

Both are inside the single `<h1>`, so the keyword and the location are in the most
weighted element on the page while the tagline survives visually. The same pattern is
applied elsewhere — category pages are `"<Division> in Bengaluru"`, the appointment
page is `"Book a Plastic Surgery Consultation in Bengaluru"`.

The footer carries a service-areas line (Koramangala, Indiranagar, HSR, BTM, Jayanagar,
JP Nagar, Whitefield, Electronic City, Marathahalli, Sarjapur Road, Hebbal) — a
legitimate local-search signal, and true: the clinic serves all of Bengaluru.

## Lenis and nested scrolling — read before changing

Lenis calls `preventDefault()` on wheel and touch gestures. While it is **stopped**
(which is what the mobile drawer does, so the page behind cannot move) it cancels
*every* `touchmove` — including ones inside the drawer, which makes the panel
impossible to scroll.

Any scrollable element inside the page therefore needs **`data-lenis-prevent`**.
Currently carried by:

- `.drawer` — the mobile menu
- `.mega__rail` and `.mega__panels` — the two scrollable panes of the dropdown
- `.ba` — the before/after comparison slider

If you add another scrollable panel, give it that attribute or it will not scroll.

The drawer also uses `height: 100dvh` (not `inset: 0`) so the last links are not
hidden behind mobile browser chrome, and `overscroll-behavior: contain` so reaching
its end does not start scrolling the page behind it.

**`overflow-x: clip` sits on `<html>` as well as `<body>`.** Body alone is not enough:
Lenis takes over the root element, so body's overflow no longer propagates to the
viewport, and the page could be dragged ~14px sideways on mobile. `clip` is used
rather than `hidden` because `hidden` would create a scroll container and break
`position: sticky` on the header.

## Header layout

Logo left, primary nav immediately beside it (left-aligned, not centred), then
phone / email / WhatsApp icon buttons and the Book Appointment CTA hard right — the
Centre for Surgery arrangement. Below 1100px the WhatsApp icon drops and the icons
shrink; below 980px the whole row collapses to the hamburger.

**Condensed state** (`.nav.is-stuck`, past 10px of scroll) shrinks the bar, the logo,
the contact icons *and* the CTA together — 206×59 → 179×49 for the button, 42 → 36px
for the icons. Note the mobile logo sizes are restated inside their media queries:
media queries add no specificity, so the global `.nav.is-stuck .logo__img` would
otherwise win and the logo would *grow* on scroll instead of shrinking.

One subtlety worth preserving: `visibility` is **not** in the transition list. It is a
discrete property, and browsers disagree about when it flips mid-transition — which
made the panel stay invisible even with the open class applied. It now switches
instantly on open and is delayed until after the fade on close.

---

## Gallery photography and reel previews

AI-generated images have been removed from the site and its image assets. The gallery
shows the clinic-supplied patient posters and seven treatment reel covers. Banners use
existing photographs of the Koramangala clinic.

Real reel covers are cached in `assets/img/reels/`; `sources.json` records their original
Instagram URLs. Preview play links open those reels on Instagram, and each card keeps
a View profile link. This also covers posts whose public embedded player is unavailable.

Only matched photographs in `assets/img/results/patient/<case-id>-before.jpg` and
`<case-id>-after.jpg` are eligible for additional before-and-after comparisons.

---

## Photography

30 images live in `assets/img/`, all **CC0 / public domain** (sourced via Openverse),
resized and re-encoded — 1.7 MB total, largest file 206 KB. No attribution required,
free for commercial use.

They are **generic stock**, not photographs of this clinic. The footer disclaimer on
every page states this. Replace them with real clinic photography when available:
keep the same filenames and rebuild, and nothing else needs to change.

```
hero.jpg  about.jpg  clinic.jpg  tech.jpg  results.jpg  appointment.jpg  spa.jpg  cta.jpg
cat-<division-slug>.jpg   × 16
blog-1.jpg … blog-6.jpg
```

Every `<img>` has explicit `width`/`height` (no layout shift), `loading="lazy"` below
the fold, descriptive `alt` text, and an `onerror` handler that falls back to a sand
gradient — so a missing file never shows a broken-image icon.

---

## SEO

Every page carries:

- Title under 70 characters, meta description 70–175 characters
- Page-specific `keywords`, `author`, `robots` (`max-image-preview:large`)
- Canonical URL, `geo.region` / `geo.placename` for local search
- Full Open Graph + Twitter card set with an absolute `og:image`
- Exactly one `<h1>`; `alt` text on every image

**Structured data (JSON-LD):**

| Page | Schema |
|---|---|
| Home | `MedicalClinic` (address, geo, hours, phone), `FAQPage`, `ItemList` of divisions |
| Category | `MedicalWebPage` with every procedure as `MedicalProcedure`, `BreadcrumbList` |
| Blog index | `Blog` with all posts, `BreadcrumbList` |
| Article | `BlogPosting` (author, dates, word count, section), `BreadcrumbList` |
| Appointment | `MedicalClinic`, `BreadcrumbList` |

`sitemap.xml` lists all 31 pages with `lastmod` and priorities; `robots.txt` points to it.
`sitemap.html` is a human-readable index linking every division, every one of the 263
procedures by anchor, and every article — a flat crawl path and genuinely useful to visitors.

Also in place: `article:published_time` / `modified_time` / `author` / `section` / `tag`
and `og:type=article` on blog posts; `og:image:alt` and `twitter:image:alt` everywhere;
`geo.position` / `ICBM` coordinates; `<link rel="preload" fetchpriority="high">` on each
page's hero image; and `hasOfferCatalog` + `areaServed` on the clinic schema.

**Before deploying:** set the real domain in `SITE_URL` at the top of
`build/generate.js` (currently `https://www.pearlaesthetic.in`) and rebuild, so
canonicals, Open Graph URLs and the sitemap point to the right place.

---

## How the enquiry form works

The form on **Book Appointment** and **Contact Us** is one shared form (`enquiryForm()` in
`build/generate.js`). `assets/js/enquiry.js` sends it straight into the clinic **CRM**,
where it becomes a lead with source "Website" for the patient-care team.

- **Endpoint:** `CLINIC.enquiryApi` in `build/data.js`
  (`https://app.pearlaesthetic.in/api/public/enquiries`). Override it at build time with `ENQUIRY_API_URL`.
- **Sent as** `multipart/form-data`, with no cookies. Fields:
  - `name, phone, email, procedure, consultType, preferredDate, preferredTime, message`
  - `offer` (from `?offer=`, set by the offers modal), `sourcePage`
  - `consent=yes`, `idempotencyKey`, `website` (hidden spam trap), `startedAt`
- **Validated in the browser first:** name, 10-digit Indian mobile, optional email, date not in the past, and consent. The CRM validates again.
- **Responses:**
  - `201`: thank-you message with the CRM reference, then the form clears.
  - `400`: errors appear under the matching fields.
  - `429`, `503` or network failure: the visitor is offered the same details as a pre-filled **WhatsApp** message, so no enquiry is lost.
- **Retries never duplicate a lead:** the `idempotencyKey` is reused until the CRM confirms.
- No photos are collected.
- **CRM rules worth knowing:**
  - The preferred date must be between today and one year ahead; the form enforces this too.
  - Each connection can send 5 enquiries per 10 minutes.
  - An enquiry from a mobile number that already has an open lead is added to that lead, so it shows the same reference.
  - The CRM's `PUBLIC_WEBSITE_ORIGINS` setting lists which sites may call it. It is shared with the offers API, and unset means any site.

---

## Missing images & content (replace before launch)

Every stand-in is marked `placeholder: true` in `build/data.js`. Each build prints the full list.
Stand-ins show a visible **"To be confirmed"**, **"Sample — to be replaced"** or **"Illustrative image"** label on the page.

| Item | Where to change it | What is needed |
|---|---|---|
| Year established (2017) | `CLINIC.established`, `establishedConfirmed` | Confirm the year |
| Centres 2 and 3 | `CENTRES` | Name, address, phone, WhatsApp, Google Maps link, photo |
| Centre photos (centres 2 and 3) | `CENTRES[].image` | Real photo of each centre, then set `imageIsReal: true` (Koramangala is done) |
| Milestones | `MILESTONES` | Verified years and events only |
| Testimonials | `TESTIMONIALS` | Approved text reviews and consented photos (`image`). Videos are Instagram reel IDs (`instagram`); set `embed: false` for a reel Instagram won't embed |
| Treatment videos (Gallery) | `TREATMENT_VIDEOS` | Instagram reel IDs and a `title` for each |
| Case studies | `CASE_STUDIES` | Patient profile, approach, verified outcome, consented images |
| Patient result posters (5) | `PATIENT_POSTERS` | Confirm written consent for website use, then set `consentConfirmed: true` |
| Before & After gallery | `assets/img/results/patient/` | Consented `<case>-before.jpg` / `-after.jpg` pairs (see *The AI before/after images*) |
| Offer names (Carbone, States, Dureha, Medical Facial, Acne) | CRM → Website Offers | Correct spellings, prices, dates, images |

Images go in `assets/img/`. Then run `node build/generate.js`.

---

## Hosting

Static files — upload the whole folder to any host:

- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, done
- **Hostinger / cPanel** — upload to `public_html`
- **GitHub Pages** — push and enable Pages

The `build/` folder is only needed to regenerate the site; it can be excluded from
the upload if you prefer.

---

## Technical notes

- Responsive at 1440 / 1100 / 980 / 700px; driven and verified at 1440×1000 and
  390×844 — no horizontal overflow at either, and every drawer link is ≥40px tall
- Keyboard-operable accordion and before/after slider, ARIA labels throughout,
  `prefers-reduced-motion` respected
- Content stays visible if JavaScript fails — reveal animations are scoped to a `.js`
  class, anything already on screen at load shows immediately, and a 2.5s timer
  guarantees nothing stays hidden
- Article body text is never animation-gated
- No external dependencies except Google Fonts
- A medical disclaimer appears in the footer of every page, and at the end of every
  article. Keep them there.
