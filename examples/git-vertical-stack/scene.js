/* ============================================================
   GIT, STACKED
   An evaluation deck for Great Circle.

   THE QUESTION THIS DECK IS FOR.

   Every "how git works" explainer draws the same horizontal timeline:
   time runs left to right, branches peel off above or below the line. It
   works, but it asks a first-time viewer to hold two unfamiliar ideas at
   once — "left is the past" AND "this line can split sideways" — before
   they have any anchor for either one.

   This deck tries a different axis. Commits stack vertically, like a pile
   of cards or an inventory list: newest on top, history running downward,
   and `main` is just whichever card is currently on top. A branch doesn't
   split the timeline, it extrudes sideways off a specific card and stays
   tied back to it. The bet is that "a pile that only ever grows, and one
   name for whatever's on top" is a mental model people already carry
   around (a stack of papers, an undo history, a save-file list), so the
   git-specific part — branching, merging — has less to fight through to
   land.

   This is deliberately narrow: three git ideas (commit, branch, merge),
   proven or disproven on the vertical axis before spending any more effort
   extending it. `graph()` already supports this without a schema change —
   col becomes the branch lane instead of time, row becomes time instead of
   lane — so the only engine change was `laneBy: 'col'`, an option to colour
   commits by lane-lane instead of by row, since the existing lane colouring
   assumed the horizontal convention.
   ============================================================ */

const SUBSTRATE = 'blueprint';
const SUBSTRATE_OPT = { step: 700 };

/* ---------- layout ----------
   One diagram, evolving in place, so it is anchored at a single point and
   only the camera moves. Acts are still separated vertically on the canvas
   (fitting, for once) purely so text call-outs have somewhere to live that
   isn't on top of the graph. */
const GX = 12000, GY = 6300, GW = 3200;
const T0 = 1200, T1 = 3400, T4 = 11000;

/* ---------- graph states ----------
   Same col/row grid the whole way through, because a commit's position
   never moves once it exists — only what points at it does. col 0 is the
   trunk. col 1 is the one branch this deck needs. row counts generations,
   oldest at 0, so newer rows land higher on screen (see AGENTS.md: row * RH
   is subtracted from the viewBox height). That single sign flip is the
   entire "vertical" idea. */
const C1 = { id: 'c1', col: 0, row: 0, label: 'c1' };
const C2 = { id: 'c2', col: 0, row: 1, label: 'c2' };
const C3 = { id: 'c3', col: 0, row: 2, label: 'c3' };
const F1 = { id: 'f1', col: 1, row: 3, label: 'f1' };
const F2 = { id: 'f2', col: 1, row: 4, label: 'f2' };
const M  = { id: 'm',  col: 0, row: 5, label: 'm'  };

const S_ROOT     = { commits: [C1],
  refs: [{ at: 'c1', name: 'main', kind: 'branch' }] };

const S_ADD2      = { commits: [C1, C2], edges: [['c2', 'c1']],
  refs: [{ at: 'c2', name: 'main', kind: 'branch' }] };

const S_ADD3      = { commits: [C1, C2, C3], edges: [['c2', 'c1'], ['c3', 'c2']],
  refs: [{ at: 'c3', name: 'main', kind: 'branch' }] };

const S_BRANCH1   = { commits: [C1, C2, C3, F1],
  edges: [['c2', 'c1'], ['c3', 'c2'], ['f1', 'c3']],
  refs: [{ at: 'c3', name: 'main', kind: 'branch' },
         { at: 'f1', name: 'feature', kind: 'branch' }] };

const S_BRANCH2   = { commits: [C1, C2, C3, F1, F2],
  edges: [['c2', 'c1'], ['c3', 'c2'], ['f1', 'c3'], ['f2', 'f1']],
  refs: [{ at: 'c3', name: 'main', kind: 'branch' },
         { at: 'f2', name: 'feature', kind: 'branch' }] };

const S_MERGE     = { commits: [C1, C2, C3, F1, F2, M],
  edges: [['c2', 'c1'], ['c3', 'c2'], ['f1', 'c3'], ['f2', 'f1'], ['m', 'c3'], ['m', 'f2']],
  refs: [{ at: 'm', name: 'main', kind: 'branch' },
         { at: 'f2', name: 'feature', kind: 'branch' }] };

/* Same commits and edges as S_MERGE. Only the refs list changes: `feature`
   is deleted. f1 and f2 are still drawn — deleting a branch removes a
   label, not the commits underneath it. That's the whole point of this
   beat, and the reason it gets to be the deck's turn. */
const S_CLEANUP  = { commits: [C1, C2, C3, F1, F2, M],
  edges: [['c2', 'c1'], ['c3', 'c2'], ['f1', 'c3'], ['f2', 'f1'], ['m', 'c3'], ['m', 'f2']],
  refs: [{ at: 'm', name: 'main', kind: 'branch' }] };

/* noGhost: every graph() below sits at the same GX/GY as the one before and
   after it — one evolving diagram, not six separate ones. The engine's
   default is to ghost a node at 13% opacity once its beat has passed (nice
   for territory that should feel accumulated, wrong here: it would leave
   the previous frame's dots and ref labels doubled up under the current
   one). Forcing k:'t' opts a node out of ghosting the same way text nodes
   already are — a deck-local trick, not an engine change; see AGENTS.md,
   which is explicit that the ghosting default itself should stay put. */
const noGhost = n => ({ ...n, k: 't' });

/* ============================================================
   NODES
   ============================================================ */
const NODES = [

/* ---------- prologue ---------- */
text('t.title', GX, T0, 9000, 460, `
  <span class="lede" style="font-size:1.1em;letter-spacing:-.025em">Git, stacked</span>
  <span class="aside" style="font-size:.22em;letter-spacing:.4em;text-transform:uppercase;color:var(--brass);margin-top:1.2em">one axis, three ideas</span>`),

text('t.premise', GX, T1, 7200, 250, `
  Every commit lands on top of the last one.
  <span class="aside">No timeline. No left and right. Just a pile that only ever grows.</span>`),

/* ---------- act I : the stack ---------- */
noGhost(graph('g.s0', GX, GY, GW, S_ROOT, {
  to: S_ADD2, laneBy: 'col', cards: true,
  cap: 'one commit — main points at it',
  capTo: 'commit again, and main moves up with you'
})),

noGhost(graph('g.s1', GX, GY, GW, S_ADD2, {
  to: S_ADD3, laneBy: 'col', cards: true,
  cap: 'main, one commit up',
  capTo: 'and again. the stack just grows'
})),

/* ---------- act II : off to the side ---------- */
text('t.branch', GX, T1, 7400, 230, `
  Now two people want to work at once.
  <span class="aside">A branch doesn't fork the timeline. It just starts a second, shorter pile — tied to the card it grew out of.</span>`),

noGhost(graph('g.s2', GX, GY, GW, S_ADD3, {
  to: S_BRANCH1, laneBy: 'col', cards: true,
  cap: 'three commits, one column',
  capTo: 'branch: a new commit, one column over — still tied to where it started'
})),

noGhost(graph('g.s3', GX, GY, GW, S_BRANCH1, {
  to: S_BRANCH2, laneBy: 'col', cards: true,
  cap: 'feature has its own commit',
  capTo: 'and it stacks too, in its own column'
})),

/* ---------- act III : folding back in ---------- */
text('t.merge', GX, T1, 7000, 230, `
  Merging isn't a special move.
  <span class="aside">It's one more commit — the only kind with two parents.</span>`),

noGhost(graph('g.s4', GX, GY, GW, S_BRANCH2, {
  to: S_MERGE, laneBy: 'col', cards: true,
  cap: 'two piles, side by side',
  capTo: 'merge: one commit, two parents, folded back into main'
})),

/* ---------- act IV : the turn ---------- */
noGhost(graph('g.s5', GX, GY, GW, S_MERGE, {
  to: S_CLEANUP, laneBy: 'col', cards: true,
  cap: 'feature is still labelled',
  capTo: 'delete the branch — the label goes. the commits underneath do not'
})),

text('t.turn', GX, T4, 8200, 260, `
  Nothing in that pile was ever thrown away.
  <span class="aside"><code>main</code> was never a container. It's a sticky note on whichever card is currently on top.</span>`),

text('t.close', GX, T4 + 1500, 7800, 220, `
  Does the pile read faster than the timeline did?
  <span class="aside">That's the actual question this deck exists to answer.</span>`)

];

/* ============================================================
   BEATS
   ============================================================ */
const ACTS = [
  { n: 'Prologue',              c: '#d0a24e' },
  { n: 'I · The stack',         c: '#d0a24e' },
  { n: 'II · Off to the side',  c: '#3fe0c0' },
  { n: 'III · Folding back in', c: '#c9503f' },
  { n: 'IV · The turn',         c: '#7fa8d0' }
];

const BEATS = [

{ act: 0, cam: cam(GX, T0, 12000), show: ['t.title'],
  vo: `<em>[title]</em>` },

{ act: 0, cam: cam(GX, T1, 9500), show: ['t.premise'],
  vo: `Here's the pitch: skip the timeline entirely. A commit just stacks on top of the one before it.` },

/* ---- act I : the stack ---- */
{ act: 1, cam: cam(GX, GY, 12500), show: ['g.s0'],
  steps: [[], ['g.s0__to']],
  stepVo: [
    `One commit. main points at it — that's all a branch name is, a label on a card.`,
    `Commit again, and watch main. It doesn't stay put, it moves up to whatever's newest.`
  ],
  vo: `The first stack.` },

{ act: 1, cam: cam(GX, GY, 14500), show: ['g.s1'],
  steps: [[], ['g.s1__to']],
  stepVo: [
    `Same pile, one card up.`,
    `And again. There's no new mechanic here — that's kind of the point. Committing is just this, repeated.`
  ],
  vo: `It just grows.` },

/* ---- act II : off to the side ---- */
{ act: 2, cam: cam(GX, T1, 10500), show: ['t.branch'],
  vo: `Now two people want to work at the same time, without stepping on each other.` },

{ act: 2, cam: cam(GX, GY, 15000), show: ['g.s2'],
  steps: [[], ['g.s2__to']],
  stepVo: [
    `Main's pile, three cards deep.`,
    `Branching doesn't split this timeline, because there isn't one. It starts a second, shorter pile — one column over — and that first card stays tied back to exactly where it grew out of.`
  ],
  vo: `A branch.` },

{ act: 2, cam: cam(GX, GY, 16500), show: ['g.s3'],
  steps: [[], ['g.s3__to']],
  stepVo: [
    `feature, one commit.`,
    `And it stacks too, same as main does — just in its own column, on its own schedule.`
  ],
  vo: `Its own little stack.` },

/* ---- act III : folding back in ---- */
{ act: 3, cam: cam(GX, T1, 10000), show: ['t.merge'],
  vo: `Eventually that side pile has to come back.` },

{ act: 3, cam: cam(GX, GY, 17500), show: ['g.s4'],
  steps: [[], ['g.s4__to']],
  stepVo: [
    `Two piles, side by side, both still growing.`,
    `A merge is one more commit — the only kind with two parents instead of one. It folds the side pile back into main's column, and main moves up onto it.`
  ],
  vo: `Merge.` },

/* ---- act IV : the turn ---- */
{ act: 4, cam: cam(GX, GY, 17500), show: ['g.s5'],
  steps: [[], ['g.s5__to']],
  stepVo: [
    `feature is still labelled, sitting right there next to main.`,
    `Delete the branch, and watch what actually disappears — the label. Not the cards. They're still in the pile, they just don't have a name pointing at them anymore.`
  ],
  vo: `The label was never the thing.` },

{ act: 4, cam: cam(GX, 9000, 20000), show: ['g.s5', 'g.s5__to', 't.turn'],
  vo: `Which is the whole model, really. Nothing gets thrown away. main is a sticky note, not a box.` },

/* No recap:true here. Recap force-reveals every node ever placed, and this
   deck deliberately reuses one screen position for six evolving graph
   states — a real "everything at once" pull-back would stack all six on
   top of each other. Showing the final state plus the closing texts,
   explicitly, is the honest version of the same beat. */
{ act: 4, cam: cam(GX, 7900, 21500), show: ['g.s5', 'g.s5__to', 't.turn', 't.close'],
  vo: `<span class="cue">this is the beat to stop on and actually ask the room</span>` }

];
