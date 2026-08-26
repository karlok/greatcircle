/* ============================================================
   FIRST CROSSING
   A three-beat demo of the world-map substrate and the arc primitive.

   This is the project's visual identity in one screen: a line drawing
   itself across a chart, with a glyph travelling the path. Casablanca
   opens with one. Raiders made it the signature transition. Anyone who
   has watched a film made after 1942 knows what it means before they
   read a word.
   ============================================================ */

const SUBSTRATE = 'world-map';
const SUBSTRATE_OPT = {};

/* The seam is the longitude the projection is cut at. 60E runs through
   empty central Asia, which puts Asia left and the Americas centre, so a
   Pacific crossing reads left to right. Changing this requires
   substrates/land-path.js to be regenerated to match. */
const SEAM = 60;

const P = {
  manila: LL(121.00, 14.60),
  sf:     LL(-122.20, 37.60)
};

const NODES = [
  text('t.x', 12000, 2600, 7000, 330, `
    <span class="lede">First crossing</span>
    <span class="aside">A line crawling across a map. Two points, a bow, and a glyph that travels the path.</span>`),

  pin('p.manila', P.manila, 'Manila', 'left 1927', 190),
  pin('p.sf', P.sf, 'San Francisco', 'arrived 1927', 190, 'l'),
  arc('a.cross', P.manila, P.sf, .20)
];

const ACTS = [{ n: 'First crossing', c: '#d0a24e' }];

const BEATS = [
  { act: 0, cam: cam(12000, 2600, 10000), show: ['t.x'],
    vo: `<em>[title]</em>` },

  { act: 0, cam: cam(9000, 4500, 15000),
    show: ['p.manila', 'p.sf'],
    steps: [[], ['a.cross']],
    stepVo: [`Two ports.`, `And the crossing between them.`] },

  { act: 0, cam: 'overview', show: [], recap: true,
    vo: `<em>[pull back]</em>` }
];
