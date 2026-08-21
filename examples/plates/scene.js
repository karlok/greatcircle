/* ============================================================
   PLATES
   Two jobs, both real.

   1. It is the worked example for `plate()`. Neither of the other examples
      uses a photograph, so without this one the archival-print primitive is
      documented but never shown.

   2. It is the regression case for the repaint stall.

   THE STALL, for whoever picks this up next. Chrome would occasionally
   arrive at a beat with a large raster still partially decoded and paint the
   plate border around a half-drawn photo. Pressing R fixed it instantly,
   every time. It was 100% reproducible on specific images in a real browser
   and NEVER reproducible headless, which is exactly why it survived the
   automated harness for a week and then happened twice during a live talk.

   The current fix is in engine/app.js: every image a beat is about to reveal
   is decoded before the camera starts moving, with the rest decoded at idle.
   The old adaptive repaint and the R key are still there as backstops,
   because this is a heuristic about someone else's compositor.

   So this deck is deliberately unkind. Six 2600x1750 rasters, revealed on
   wide shots, with long camera flights between them, which is the exact
   combination the stall correlated with.

   HOW TO TEST IT. `verify` passing here proves very little, because the bug
   does not reproduce headless. Open this deck in a real Chrome, full screen,
   and walk it with the arrow keys twice. If any photo ever paints as a
   staircase or a half-drawn block, the fix has regressed. Do not trust a
   green harness on this one.
   ============================================================ */

const SUBSTRATE = 'grid';
const SUBSTRATE_OPT = { step: 1200 };

world(26000, 14000);

const R1 = 4200, R2 = 9600;

const NODES = [

text('t.title', 13000, 1200, 9000, 460, `
  <span class="lede">Plates</span>
  <span class="aside" style="font-size:.24em;letter-spacing:.4em;text-transform:uppercase;color:var(--brass);margin-top:1.2em">Six photographs, and a bug that only happens in a real browser</span>`),

plate('p.harbour',  4000,  R1, 6200, 'harbour',  'A harbour, 2600 &times; 1750'),
plate('p.ridge',   13000,  R1, 6200, 'ridge',    'Revealed on a wide shot, which is when the stall used to bite'),
plate('p.crossing',22000,  R1, 6200, 'crossing', 'A long flight from the last one, on purpose'),

plate('p.archive',  4000,  R2, 6200, 'archive',  'Rotated, because the fit maths has to cope', { rot: -2.5 }),
plate('p.delta',   13000,  R2, 6200, 'delta',    'Two large rasters revealed on the same press'),
plate('p.beacon',  22000,  R2, 6200, 'beacon',   'And the last one, framed tight'),

text('t.how', 13000, 12600, 11000, 300, `
  If any photograph here ever paints half-drawn, the pre-decode fix has
  regressed.
  <span class="aside">Press <code>R</code> to force a repaint. Needing to is the bug.</span>`)

];

const ACTS = [
  { n: 'Plates', c: '#d0a24e' },
  { n: 'The unkind part', c: '#c9503f' }
];

const BEATS = [

{ act: 0, cam: cam(13000, 1200, 14000), show: ['t.title'],
  vo: `<em>[title]</em>` },

{ act: 0, cam: cam(4000, R1, 8000), show: ['p.harbour'],
  vo: `One plate, framed close. The easy case.` },

{ act: 0, cam: cam(13000, R1, 9000), show: ['p.ridge'],
  vo: `A second, revealed on a wider shot.` },

/* The unkind sequence: long flights, wide shots, several large rasters
   arriving at once. Each of these is a condition the stall correlated with,
   and they are stacked here deliberately. */
{ act: 1, cam: cam(22000, R1, 9000), show: ['p.crossing'],
  vo: `A long flight across the canvas to a cold plate. This is the one that used to stall.` },

{ act: 1, cam: cam(4000, R2, 9000), show: ['p.archive'],
  vo: `All the way back the other way, and rotated.` },

{ act: 1, cam: cam(13000, R2 + 200, 22000), show: ['p.delta', 'p.beacon'],
  vo: `Two large rasters on one press, on a wide shot.` },

{ act: 1, cam: cam(13000, 12600, 13000), show: ['t.how'],
  vo: `And the instruction for whoever tests this next.` },

{ act: 1, cam: 'overview', show: [], recap: true,
  vo: `<em>[everything at once, which is the worst case for the compositor]</em>` }

];
