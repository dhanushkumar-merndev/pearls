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
| **Before/after images** | Home → "Results" | The comparison slider uses gradient placeholders. Only add real images with written patient consent. |
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

**Animation cost** is kept low deliberately: only `opacity` and `transform` are
animated (both composited — no layout or paint), `will-change` is applied just for
the duration of each transition rather than held on dozens of elements, cards use
`contain: layout paint style`, and the scroll listener is `requestAnimationFrame`-throttled.
On coarse pointers all hover-lift effects are disabled — they stick after a tap.

---

## The Treatments dropdown

It opens on **click or tap** as well as hover, because a hover-only menu is unusable
on touch: `:hover` latches after a tap and the menu can never be dismissed. Hover is
layered on top behind `@media (hover: hover) and (pointer: fine)`.

It also closes on Escape, on clicking outside, and on pointer-leave, sets
`aria-haspopup` / `aria-expanded`, and opens to the first item on `ArrowDown`.

One subtlety worth preserving: `visibility` is **not** in the transition list. It is a
discrete property, and browsers disagree about when it flips mid-transition — which
made the panel stay invisible even with the open class applied. It now switches
instantly on open and is delayed until after the fade on close.

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

`sitemap.xml` lists all 25 pages with `lastmod` and priorities; `robots.txt` points to it.

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
