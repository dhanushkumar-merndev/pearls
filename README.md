# Pearl Aesthetic & Wellness — Website

A static site for Pearl Aesthetic & Wellness Clinic, Koramangala, Bengaluru.
Plain HTML, CSS and JavaScript — no framework, no build step required to host it.

Design direction follows the Makam Multi Speciality reference: warm sand/gold palette,
Playfair Display + Plus Jakarta Sans, bold editorial typography.

**25 pages · 263 procedures · 6 articles · 30 images**

---

## What's here

```
index.html              Landing page
appointment.html        Booking page — form, what to expect, what to bring, FAQs
blog.html               Article index
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

Then run:

```
node build/generate.js
```

That rewrites all 25 pages and the sitemap.

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

## ⚠️ Before this goes live

These are placeholders and **must** be replaced. Each is marked with a `⚠️` comment
in `build/generate.js` or `build/blog.js`.

| Item | Where | What's needed |
|---|---|---|
| **Surgeon credentials** | Home → "Your Surgeon" | Dr. Praveen Chandra K's real qualifications and registration number. Currently reads *"to confirm"*. |
| **Clinic logo (dark variant)** | `assets/img/logo-dark.png` | Optional. The light lockup is in place and working. Supply the gold-on-black version only if you want a dark header — see "The logo" below. |
| **Surgeon photograph** | Home → "Your Surgeon" | Currently shows a **clinic interior**, deliberately — a stock portrait must never sit under a named doctor. Swap in their own photo. |
| **Patient testimonials** | Home → "Patient Voices" | Three illustrative placeholders. Replace with genuine consented reviews. Publishing invented reviews is misleading and a legal risk. |
| **Before/after images** | Home → "Results" | ⚠️ Currently **AI-generated illustrations**, not patients. Disclosed in the alt text, in a persistent on-image badge, and in the caption. Replace with genuine consented patient photographs — see the note below. |
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

## ⚠️ The AI before/after images

The Results slider on the home page currently shows two **AI-generated portraits** of a
person who does not exist, presented as a rhinoplasty before/after.

They are disclosed three ways — descriptive `alt` text, a persistent badge on the image
itself ("Illustration — not a patient"), and the caption strip. That disclosure is
deliberate and should not be removed: an undisclosed synthetic image inside a
Before/After frame on a surgery site reads as a real surgical outcome, and India's
medical advertising rules (NMC code; Drugs & Magic Remedies Act) treat misleading
outcome claims seriously.

Even disclosed, this is a judgement call the clinic should make consciously. The safest
options, in order: use **genuine consented patient photographs**; or remove the slider
and keep the section's text about what a realistic result looks like; or keep the
illustration with the disclosure as it stands.

The files were re-encoded from ~4 MB of PNG to 87 KB / 95 KB JPEG.

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

`sitemap.xml` lists all 26 pages with `lastmod` and priorities; `robots.txt` points to it.
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

## How the booking form works

There is no backend. On submit the form validates name, phone and the consent
checkbox, then opens **WhatsApp** to the clinic's number with everything pre-filled.
If the popup is blocked it falls back to `mailto:`. The WhatsApp number is set once,
in `CLINIC.whatsapp` in `build/data.js`.

To send submissions by email or into a CRM instead, replace the handler in
`assets/js/main.js` (section 6) with a Formspree / Web3Forms endpoint or your own POST.

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
