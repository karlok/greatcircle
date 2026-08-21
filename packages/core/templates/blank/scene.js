/* ============================================================
   YOUR DECK
   Two lists. That is the whole format.

   NODES : what exists, and where it sits on the canvas
   BEATS : what happens, and where the camera goes

   Point a coding agent at this repo and tell it your story. Read AGENTS.md
   first if you want to know what it is going to do.

   world: 24000 x 12000. Keep it this size. See AGENTS.md, "house rules".
   ============================================================ */

const SUBSTRATE = 'grid';          // 'grid' | 'blueprint' | 'world-map'
const SUBSTRATE_OPT = {};

/* ---------- layout ----------
   Naming your regions and reusing the constants is the difference between a
   deck you can restructure in an afternoon and one you cannot. Do this even
   for a five-beat deck. */
const ROW = 5200;
const A = { one: 4000, two: 10000, three: 16000, four: 21000 };

/* ============================================================
   NODES
   ============================================================ */
const NODES = [

/* ---------- act 0 : title ---------- */
text('t.title', 12000, 1200, 9000, 500, `
  <span class="lede" style="font-size:1.1em;letter-spacing:-.025em">Your title here</span>
  <span class="aside" style="font-size:.22em;letter-spacing:.46em;text-transform:uppercase;color:var(--brass);margin-top:1.3em">A subtitle, if it earns its place</span>`),

text('t.premise', 12000, 2000, 7600, 300, `
  One sentence that tells the room what this talk is going to give them.
  <span class="aside">And one that says why it matters to <em>them</em>.</span>`),

/* ---------- act 1 : the shape of the thing ----------
   Regions give the camera somewhere to fly between. Four across one row is a
   good default: it reads at a wide shot and each one frames comfortably. */
region('r.one',   A.one,   ROW, 4400, 3200, 'First',  'a short gloss'),
region('r.two',   A.two,   ROW, 4400, 3200, 'Second', 'a short gloss'),
region('r.three', A.three, ROW, 4400, 3200, 'Third',  'a short gloss'),
region('r.four',  A.four,  ROW, 4400, 3200, 'Fourth', 'a short gloss', { cls: 'remote' }),

text('n.one', A.one, ROW - 300, 3300, 210, `
  What lives here, in two lines.
  <span class="aside">And the thing people get wrong about it.</span>`),

/* An arc: two points, a bow, a draw-on animation and a travelling glyph.
   This is the primitive the project is named after. Use it when something
   genuinely travels from one place to another. */
arc('a.one-two', at(A.one, ROW - 1700), at(A.two, ROW - 1700), .22, { color: '#d0a24e' }),

tag('l.one-two', (A.one + A.two) / 2, ROW - 3150, 2600, 175,
    'the verb<span class="sub">from &rarr; to</span>'),

/* A terminal block. Lines starting with "$ " render as commands.
   Backticks mark a highlight. Keep it to about six lines. */
code('c.example', A.two, ROW + 900, 3400, 150, [
  '$ the command you actually ran',
  '',
  'the output that made the point',
  'with the `interesting part` marked'
], { ttl: 'optional label' }),

/* ---------- act 2 : the detail that changes their mind ---------- */
text('t.turn', 12000, 10200, 8000, 330, `
  The sentence the whole talk exists to deliver.
  <span class="aside">Give it its own beat and its own silence.</span>`),

text('t.close', 12000, 12400, 9000, 380, `
  What you want them to still have in a week.`)

];

/* ============================================================
   BEATS
   act    : index into ACTS, drives the label and the progress bar
   cam    : cam(x, y, w) — w is how much of the world fits across the screen
   show   : node ids that are live for the whole beat
   steps  : extra reveals, one press each, WITHOUT adding a beat number
   stepVo : one voice-over line per press
   ============================================================ */
const ACTS = [
  { n: 'Prologue',    c: '#d0a24e' },
  { n: 'I · Shape',   c: '#d0a24e' },
  { n: 'II · Turn',   c: '#3fe0c0' }
];

const BEATS = [

{ act: 0, cam: cam(12000, 1200, 15000), show: ['t.title'],
  vo: `<em>[title]</em>` },

{ act: 0, cam: cam(12000, 2000, 10000), show: ['t.premise'],
  vo: `What you say while the premise is on screen. Write it the way you will
       actually say it, not the way you would write it down.` },

{ act: 1, cam: cam(12500, ROW, 25000), show: ['r.one', 'r.two', 'r.three', 'r.four'],
  vo: `The wide shot. Establish the whole shape before you go anywhere near a detail.` },

{ act: 1, cam: cam(A.one, ROW, 6200), show: ['r.one', 'n.one'],
  vo: `Push in on the first one.` },

/* A beat with steps: three presses, one beat number. Use this whenever you
   want to reveal in pieces without renumbering the deck for your reviewers. */
{ act: 1,
  cam: cam(12500, ROW - 900, 25000),
  show: ['r.one', 'r.two', 'r.three', 'r.four'],
  steps: [[], ['a.one-two', 'l.one-two'], ['c.example']],
  stepVo: [
    `Set up the move.`,
    `Draw the road. The arc animates on, so let it land before you keep talking.`,
    `And here is the receipt.`
  ],
  vo: `The move.` },

{ act: 2, cam: cam(12000, 10200, 10500), show: ['t.turn'],
  vo: `The turn. Slow down here.` },

{ act: 2, cam: cam(12000, 12400, 12000), show: ['t.close'],
  vo: `The close.` },

/* End on a pull-back. recap:true un-ghosts everything, so the audience sees
   the whole territory they just travelled. It is a very cheap standing
   ovation and you should take it. */
{ act: 2, cam: cam(12000, 7000, 34000), show: [], recap: true,
  vo: `<em>[pull all the way back]</em> Questions.` }

];
