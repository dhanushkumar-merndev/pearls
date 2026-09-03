/* =========================================================
   Icons — react-icons, rendered to static SVG at build time.

   This is a static site: there is no React in the browser and no bundler.
   react-icons ships React components, so each one is rendered once here with
   renderToStaticMarkup and inlined into the HTML as a plain <svg>. Nothing
   from react/react-dom/react-icons reaches the visitor — they are build-time
   devDependencies only, and the output stays pure static HTML.

   Every export below is a COMPLETE <svg> markup string, not a path body.

   ── Two icons are deliberately not from react-icons ──────────────────────
   `breast` and `buttock` have no equivalent in the library. That is not a
   style judgement: all 29 sets were searched (47,274 icons) and the only
   name matches are treasure chests, medieval breastplate armour, a rifle and
   arrow glyphs. Those two keep their original hand-drawn paths, so the
   Breast Surgery and Buttock Contouring divisions still read correctly in
   the treatment grid and mega menu. Everything else is react-icons.
   ========================================================= */

const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const Lu = require('react-icons/lu');
const Tb = require('react-icons/tb');
const Fa = require('react-icons/fa6');
const Gi = require('react-icons/gi');

/* Lucide and Tabler default to stroke-width 2. The site's own drawing weight
   is 1.6, so it is passed through to keep the finer line the design uses. */
const STROKE_SETS = new Set([Lu, Tb]);

function render(set, name) {
  const Component = set[name];
  if (!Component) throw new Error(`icons.js: "${name}" is not exported by its react-icons set`);
  const props = { 'aria-hidden': 'true' };
  if (STROKE_SETS.has(set)) props.strokeWidth = 1.6;
  return renderToStaticMarkup(createElement(Component, props));
}

/* Original hand-drawn markup, kept only where react-icons has no equivalent.
   Matches the site's 24px / 1.6-stroke drawing convention. */
const custom = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

/* Interface icons */
const UI = {
  phone:  render(Lu, 'LuPhone'),
  mail:   render(Lu, 'LuMail'),
  pin:    render(Lu, 'LuMapPin'),
  clock:  render(Lu, 'LuClock'),
  check:  render(Lu, 'LuCircleCheck'),
  star:   render(Fa, 'FaStar'),          // solid: these are rating stars
  arrow:  render(Lu, 'LuArrowRight'),
  wa:     render(Fa, 'FaWhatsapp'),      // brand marks exist only in Font Awesome
  fb:     render(Lu, 'LuFacebook'),
  ig:     render(Lu, 'LuInstagram'),
  yt:     render(Lu, 'LuYoutube'),
  shield: render(Lu, 'LuShieldCheck'),
  spark:  render(Lu, 'LuSparkles'),
  lock:   render(Lu, 'LuLock'),
  user:   render(Lu, 'LuUser'),
  cal:    render(Lu, 'LuCalendar'),
  caret:  render(Lu, 'LuChevronDown'),
  chevR:  render(Lu, 'LuChevronRight'),
  menu:   render(Lu, 'LuMenu'),
  close:  render(Lu, 'LuX'),
  grid:   render(Lu, 'LuLayoutGrid')
};

/* Division icons, keyed to `icon:` in build/data.js */
const ICONS = {
  laser:   render(Lu, 'LuZap'),
  syringe: render(Lu, 'LuSyringe'),
  scalpel: render(Gi, 'GiScalpel'),
  nose:    render(Gi, 'GiNoseFront'),
  eye:     render(Lu, 'LuEye'),
  face:    render(Lu, 'LuScanFace'),
  ear:     render(Tb, 'TbEar'),
  body:    render(Lu, 'LuPersonStanding'),
  venus:   render(Tb, 'TbVenus'),
  mommy:   render(Lu, 'LuBaby'),
  weight:  render(Lu, 'LuWeight'),
  mars:    render(Tb, 'TbMars'),
  gender:  render(Tb, 'TbGenderTransgender'),
  hair:    render(Gi, 'GiHairStrands'),

  // No react-icons equivalent exists — see the header note.
  breast:  custom('<path d="M4 9a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 4.5-3.6 8-8 8s-8-3.5-8-8z"/><circle cx="8" cy="10.5" r="1.1"/><circle cx="16" cy="10.5" r="1.1"/>'),
  buttock: custom('<path d="M12 4v9"/><path d="M12 6.5a4.5 4.5 0 0 0-8 3c0 3 1.8 5.5 4 5.5s4-2.5 4-5.5z"/><path d="M12 6.5a4.5 4.5 0 0 1 8 3c0 3-1.8 5.5-4 5.5s-4-2.5-4-5.5z"/>')
};

/* Sanity: data.js drives which division icons are needed. If a key is ever
   added there without a matching icon here, fail the build loudly rather
   than silently emitting a hole in the treatment grid. */
function assertCoverage(dataIcons) {
  const missing = Object.keys(dataIcons).filter((k) => !ICONS[k]);
  if (missing.length) throw new Error(`icons.js: no icon for division key(s): ${missing.join(', ')}`);
}

module.exports = { UI, ICONS, assertCoverage };
