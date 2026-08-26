/* ============================================================
   GIT, THE EIGHT THINGS
   A survey deck for Great Circle.

   Not a deep dive — the git-vertical-stack deck already tried the vertical
   card metaphor against one narrow question (does a stack read better than
   a timeline for commit/branch/merge) and it held up. This deck spends that
   same visual language on breadth instead of depth: the eight moves a
   non-technical, AI-tool-using person actually has to make in a repo before
   they can stop being afraid of it.

   status · add · commit · diff · push/pull · branch/switch · merge · stash

   Everything that isn't one of those eight is deliberately out of scope for
   this pass (rebase, --force, worktree, bisect, reflog — the concepts from
   the original brainstorm chart that are real but not day-one survival).
   ============================================================ */

const SUBSTRATE = 'blueprint';
const SUBSTRATE_OPT = { step: 800 };

world(34000, 12500);

/* ---------- layout ----------
   Five columns, one per act, widened rather than lengthened (AGENTS.md).
   The prologue and the close sit above/below the whole row rather than in
   their own column. */
const CS = 3600;   // I   · starting a repo
const CL = 10000;  // II  · where a file lives
const CG = 16800;  // III · the stack (commit / branch / merge)
const CR = 23600;  // IV  · talking to a remote
const CU = 30400;  // V   · undoing without fear

const YTXT = 2200, YMAIN = 6600, YSUB = 9600;
const MIDX = (CS + CU) / 2;

const BRASS = '#d0a24e', TEAL = '#3fe0c0', RED = '#c9503f', BLUE = '#7fa8d0';

/* noGhost: opts a node out of the engine's default "fade to 13% once your
   beat has passed" behaviour, the same way text nodes already are (see
   packages/core/engine/app.js — KIND[id] !== 't' is what the ghost pool
   checks). Needed anywhere a graph() is reused at the same x/y across
   several beats to render one evolving diagram instead of several jump
   cuts — without it, the previous frame's dots and labels persist
   underneath the current one. A deck-local trick, not an engine change. */
const noGhost = n => ({ ...n, k: 't' });

/* ============================================================
   ACT III state chain — the stack, condensed
   Same col/row convention as git-vertical-stack: col is the branch lane,
   row is time, so newer rows land higher on screen. Condensed to four
   beats instead of six, because this deck is a survey of eight ideas, not
   a monograph on three of them.
   ============================================================ */
const T1 = { id: 't1', col: 0, row: 0, label: 't1' };
const T2 = { id: 't2', col: 0, row: 1, label: 't2' };
const T3 = { id: 't3', col: 0, row: 2, label: 't3' };
const B1 = { id: 'b1', col: 1, row: 3, label: 'b1' };
const B2 = { id: 'b2', col: 1, row: 4, label: 'b2' };
const MG = { id: 'mg', col: 0, row: 5, label: 'mg' };

const G_ROOT   = { commits: [T1], refs: [{ at: 't1', name: 'main', kind: 'branch' }] };
const G_THREE  = { commits: [T1, T2, T3], edges: [['t2', 't1'], ['t3', 't2']],
  refs: [{ at: 't3', name: 'main', kind: 'branch' }] };
const G_BRANCH = { commits: [T1, T2, T3, B1, B2],
  edges: [['t2', 't1'], ['t3', 't2'], ['b1', 't3'], ['b2', 'b1']],
  refs: [{ at: 't3', name: 'main', kind: 'branch' }, { at: 'b2', name: 'feature', kind: 'branch' }] };
const G_MERGE  = { commits: [T1, T2, T3, B1, B2, MG],
  edges: [['t2', 't1'], ['t3', 't2'], ['b1', 't3'], ['b2', 'b1'], ['mg', 't3'], ['mg', 'b2']],
  refs: [{ at: 'mg', name: 'main', kind: 'branch' }, { at: 'b2', name: 'feature', kind: 'branch' }] };
const G_DONE   = { commits: [T1, T2, T3, B1, B2, MG],
  edges: [['t2', 't1'], ['t3', 't2'], ['b1', 't3'], ['b2', 'b1'], ['mg', 't3'], ['mg', 'b2']],
  refs: [{ at: 'mg', name: 'main', kind: 'branch' }] };

/* ============================================================
   ACT V state chain — stash and restore, a small, self-contained example
   rather than a continuation of act III's history.
   ============================================================ */
/* wip (the desk) and stash (the pocket) are two DIFFERENT ids, each with a
   fixed col/row for the whole deck — not one card that "moves" between
   col 1 and col 2. The engine positions a commit from whichever state
   first adds its id to the union, so reusing one id with two different
   columns just leaves it stuck at its first position; see graph()'s own
   comment on this in primitives.js. Two ids, each appearing or not, gets
   the fade-out/fade-in that actually reads as "tucked away" and "brought
   back." */
const H1 = { id: 'h1', col: 0, row: 0, label: 'h1' };
const H2 = { id: 'h2', col: 0, row: 1, label: 'h2' };
const WIP   = { id: 'wip',   col: 1, row: 2, label: 'wip' };
const STASH = { id: 'stash', col: 2, row: 2, label: 'stash', dim: true };

const U_DESK    = { commits: [H1, H2, WIP],
  edges: [['h2', 'h1']],
  refs: [{ at: 'h2', name: 'main', kind: 'branch' }] };
const U_STASHED = { commits: [H1, H2, STASH],
  edges: [['h2', 'h1']],
  refs: [{ at: 'h2', name: 'main', kind: 'branch' }] };
const U_BACK    = { commits: [H1, H2, WIP],
  edges: [['h2', 'h1']],
  refs: [{ at: 'h2', name: 'main', kind: 'branch' }] };

/* ============================================================
   NODES
   ============================================================ */
const NODES = [

/* ---------- prologue ---------- */
text('t.title', MIDX, 900, 11000, 430, `
  <span class="lede" style="font-size:1.05em;letter-spacing:-.02em">Git, the eight things</span>
  <span class="aside" style="font-size:.22em;letter-spacing:.35em;text-transform:uppercase;color:var(--brass);margin-top:1.1em">everything else can wait</span>`),

text('t.premise', MIDX, 1900, 8600, 220, `
  You don't need to know git. You need to survive eight moves in it.
  <span class="aside">status, add, commit, diff, push/pull, branch/switch, merge, stash. That's the whole list.</span>`),

/* ---------- act I : starting ---------- */
text('t.start', CS, YTXT, 5600, 240, `
  Every repo starts one of two ways.
  <span class="aside">Something new, or something that already exists somewhere else.</span>`),

code('c.init', CS - 1350, YMAIN, 2500, 145, [
  '$ git init',
  '',
  '# an empty repo, right here'
], { ttl: 'starting from nothing' }),

code('c.clone', CS + 1350, YMAIN, 2500, 145, [
  '$ git clone <url>',
  '',
  '# a full copy, history and all'
], { ttl: 'starting from something' }),

text('t.startsub', CS, YSUB, 5400, 190, `
  <code>clone</code> if it exists somewhere. <code>init</code> if it doesn't yet.
  <span class="aside">That's the entire decision.</span>`),

/* ---------- act II : where a file lives ---------- */
text('t.lives', CL, YTXT, 6200, 235, `
  A file is always sitting in one of three places.
  <span class="aside"><code>git status</code> tells you which. <code>git diff</code> tells you what actually changed before you commit to it.</span>`),

region('r.working', CL - 3300, YMAIN, 2500, 1700, 'Working tree', 'you just edited it'),
region('r.staged',  CL,        YMAIN, 2500, 1700, 'Staged',       '"git add" — marked ready'),
region('r.history', CL + 3300, YMAIN, 2500, 1700, 'History',      '"git commit" — safe now'),

arc('a.tostage', at(CL - 2050, YMAIN), at(CL - 1250, YMAIN), .3),
arc('a.tohist',  at(CL + 1250, YMAIN), at(CL + 2050, YMAIN), .3),

tag('l.add', CL - 1650, YMAIN - 1500, 1600, 145, 'git add<span class="sub">stage it</span>'),
tag('l.commit', CL + 1650, YMAIN - 1500, 1900, 145, 'git commit<span class="sub">save it, permanently</span>'),

/* ---------- act III : the stack ---------- */
text('t.stack', CG, YTXT, 5800, 235, `
  Commits stack. That's the whole model.
  <span class="aside">Newest on top. <code>main</code> is just whichever card is currently there.</span>`),

noGhost(graph('g.t0', CG, YMAIN, 3100, G_ROOT, {
  to: G_THREE, laneBy: 'col', cards: true,
  cap: 'one commit, main on top of it',
  capTo: 'commit twice more — the pile grows, main rides along'
})),

noGhost(graph('g.t1', CG, YMAIN, 3100, G_THREE, {
  to: G_BRANCH, laneBy: 'col', cards: true,
  cap: 'three commits, one column',
  capTo: 'branch: a second, shorter pile, tied to the card it grew out of'
})),

noGhost(graph('g.t2', CG, YMAIN, 3100, G_BRANCH, {
  to: G_MERGE, laneBy: 'col', cards: true,
  cap: 'two piles, side by side',
  capTo: 'merge: one commit, two parents, folded back into main'
})),

noGhost(graph('g.t3', CG, YMAIN, 3100, G_MERGE, {
  to: G_DONE, laneBy: 'col', cards: true,
  cap: 'feature is still labelled',
  capTo: 'delete the branch — the label goes, the commits do not'
})),

/* ---------- act IV : talking to a remote ---------- */
text('t.remote', CR, YTXT, 6200, 235, `
  <code>origin</code> is just somebody else's copy of the same pile.
  <span class="aside">Usually GitHub's. Push sends your new cards up. Pull brings theirs down.</span>`),

noGhost(graph('g.local', CR - 2900, YMAIN, 2000,
  { commits: [{ id: 'l1', col: 0, row: 0, label: 'l1' }, { id: 'l2', col: 0, row: 1, label: 'l2' }],
    edges: [['l2', 'l1']], refs: [{ at: 'l2', name: 'main', kind: 'branch' }] },
  { laneBy: 'col', cards: true })),

noGhost(graph('g.origin', CR + 2900, YMAIN, 2000,
  { commits: [{ id: 'o1', col: 0, row: 0, label: 'l1' }], refs: [{ at: 'o1', name: 'origin/main', kind: 'remote' }] },
  { to: { commits: [{ id: 'o1', col: 0, row: 0, label: 'l1' }, { id: 'o2', col: 0, row: 1, label: 'l2' }],
          edges: [['o2', 'o1']], refs: [{ at: 'o2', name: 'origin/main', kind: 'remote' }] },
    laneBy: 'col', cards: true,
    cap: `origin has l1, not yet l2`,
    capTo: `git push — origin catches up` })),

arc('a.push', at(CR - 1900, YMAIN - 600), at(CR + 1900, YMAIN - 600), .3),
code('c.pushpull', CR, YSUB + 200, 3600, 150, [
  '$ git push          # send yours up',
  '$ git pull          # bring theirs down'
]),

/* ---------- act V : undoing without fear ---------- */
text('t.undo', CU, YTXT, 6000, 235, `
  Nothing here is a real emergency.
  <span class="aside">Not committed yet? Tuck it away and get it back later.</span>`),

noGhost(graph('g.u0', CU, YMAIN, 2900, U_DESK, {
  to: U_STASHED, laneBy: 'col', cards: true,
  cap: 'wip: not staged, not committed, just sitting there',
  capTo: 'git stash — tucked aside, dimmed, not lost'
})),

noGhost(graph('g.u1', CU, YMAIN, 2900, U_STASHED, {
  to: U_BACK, laneBy: 'col', cards: true,
  cap: 'stashed, out of the way',
  capTo: 'git stash pop — right back where you left it'
})),

text('t.revert', CU, YSUB + 400, 6200, 210, `
  Already committed the mistake? <code>git revert</code> doesn't erase it.
  <span class="aside">It adds a new commit that undoes it. Same append-only rule as everything else.</span>`),

/* ---------- close ---------- */
code('c.cheat1', MIDX - 2000, 11400, 3400, 130, [
  '$ git status', '$ git add .', '$ git commit -m "…"', '$ git diff'
], { ttl: 'see it, stage it, save it' }),

code('c.cheat2', MIDX + 2000, 11400, 3400, 130, [
  '$ git push / pull', '$ git branch / switch', '$ git merge', '$ git stash'
], { ttl: 'share it, split it, undo it' }),

text('t.close', MIDX, 12300, 8600, 190, `
  Eight moves. That's enough to stop being afraid of it.`)

];

/* ============================================================
   BEATS
   ============================================================ */
const ACTS = [
  { n: 'Prologue',              c: BRASS },
  { n: 'I · Starting',          c: BRASS },
  { n: 'II · Where it lives',   c: TEAL },
  { n: 'III · The stack',       c: RED },
  { n: 'IV · A remote',         c: BLUE },
  { n: 'V · Undoing',           c: TEAL },
  { n: 'Close',                 c: BRASS }
];

const BEATS = [

{ act: 0, cam: cam(MIDX, 900, 15000), show: ['t.title'], vo: `<em>[title]</em>` },
{ act: 0, cam: cam(MIDX, 1900, 11500), show: ['t.premise'],
  vo: `Skip everything you've heard about git being hard. There are eight moves. Once you have them, you can look everything else up when you need it.` },

/* ---- act I ---- */
{ act: 1, cam: cam(CS, YTXT, 8000), show: ['t.start'],
  vo: `Two ways to begin, and the choice is not really a choice.` },

{ act: 1, cam: cam(CS, YMAIN, 8200), show: [],
  steps: [[], ['c.init'], ['c.clone']],
  stepVo: [
    `Starting from nothing.`,
    `git init. An empty repo, right where you're standing.`,
    `git clone. A full copy of one that already exists, history included — this is the one you'll use most, since you're usually joining a project, not starting one.`
  ],
  vo: `Starting.` },

{ act: 1, cam: cam(CS, YSUB, 7500), show: ['t.startsub'],
  vo: `Clone if it exists somewhere. Init if it doesn't yet. That's the entire decision tree.` },

/* ---- act II ---- */
{ act: 2, cam: cam(CL, YTXT, 8800), show: ['t.lives'],
  vo: `A file you're tracking is always in exactly one of three places, and the two commands here just tell you which, or move it to the next one.` },

{ act: 2, cam: cam(CL, YMAIN, 14000),
  show: ['r.working', 'r.staged', 'r.history'],
  steps: [[], ['a.tostage', 'l.add'], ['a.tohist', 'l.commit']],
  stepVo: [
    `You edit a file. It's sitting in the working tree — nothing has been told about it yet.`,
    `git add marks it staged. You're saying "this is going in the next save," nothing more.`,
    `git commit moves it into history. Permanent, safe, and — this matters — never actually erased from here again.`
  ],
  vo: `The three places.` },

/* ---- act III ---- */
{ act: 3, cam: cam(CG, YTXT, 7800), show: ['t.stack'],
  vo: `And "history" is really just a pile. Commits stack on top of each other, and main is a label on whichever one is currently on top.` },

{ act: 3, cam: cam(CG, YMAIN, 5400), show: ['g.t0'],
  steps: [[], ['g.t0__to']],
  stepVo: [
    `One commit. main sits on it.`,
    `Commit twice more and watch main. It doesn't stay put — it rides up to whatever's newest.`
  ],
  vo: `The stack, building.` },

{ act: 3, cam: cam(CG, YMAIN, 7200), show: ['g.t1'],
  steps: [[], ['g.t1__to']],
  stepVo: [
    `Three deep.`,
    `Branch: a second, shorter pile, one column over, still tied back to exactly the card it grew out of.`
  ],
  vo: `A branch.` },

{ act: 3, cam: cam(CG, YMAIN, 7200), show: ['g.t2'],
  steps: [[], ['g.t2__to']],
  stepVo: [
    `Two piles, both growing.`,
    `Merge: one commit, two parents instead of one, folding the side pile back into main.`
  ],
  vo: `Merge.` },

{ act: 3, cam: cam(CG, YMAIN, 7200), show: ['g.t3'],
  steps: [[], ['g.t3__to']],
  stepVo: [
    `feature, still labelled.`,
    `Delete the branch and watch what actually goes: the label. Not the cards. That's the whole reason branches feel disposable and history doesn't.`
  ],
  vo: `The turn.` },

/* ---- act IV ---- */
{ act: 4, cam: cam(CR, YTXT, 9000), show: ['t.remote'],
  vo: `Everything so far has been on your machine. origin is the same idea, living somewhere else.` },

{ act: 4, cam: cam(CR, YMAIN, 10500),
  show: ['g.local', 'g.origin'],
  steps: [[], ['a.push', 'g.origin__to']],
  stepVo: [
    `Your pile, two commits deep. origin's copy, one behind — it doesn't know about your second commit yet.`,
    `git push sends it up. origin catches up to you. Nothing fancier is happening than that.`
  ],
  vo: `Push.` },

{ act: 4, cam: cam(CR, YSUB + 200, 6500), show: ['c.pushpull'],
  vo: `Pull is the same move in reverse — bring down whatever origin has that you don't, usually a teammate's work.` },

/* ---- act V ---- */
{ act: 5, cam: cam(CU, YTXT, 8200), show: ['t.undo'],
  vo: `Last one, and it's the one that actually removes the fear: almost nothing you do here is permanent until you say so.` },

{ act: 5, cam: cam(CU, YMAIN, 6800), show: ['g.u0'],
  steps: [[], ['g.u0__to']],
  stepVo: [
    `History, plus something you're mid-edit on — not staged, not committed, just sitting on your desk.`,
    `git stash tucks it aside. Dimmed, out of the way, not gone.`
  ],
  vo: `Stash.` },

{ act: 5, cam: cam(CU, YMAIN, 6800), show: ['g.u1'],
  steps: [[], ['g.u1__to']],
  stepVo: [
    `Parked.`,
    `git stash pop, and it's back exactly where you left it.`
  ],
  vo: `And it's back.` },

{ act: 5, cam: cam(CU, YSUB + 400, 8200), show: ['t.revert'],
  vo: `And if the mistake already made it into history — same rule as always. Nothing gets deleted, something new gets added on top that cancels it out.` },

/* ---- close ---- */
{ act: 6, cam: cam(MIDX, 11400, 12000), show: ['c.cheat1', 'c.cheat2'],
  vo: `Eight commands. Everything else — rebase, force-pushing, worktrees — can wait until you actually hit a wall that needs it.` },

{ act: 6, cam: cam(MIDX, 11900, 15000), show: ['c.cheat1', 'c.cheat2', 't.close'],
  vo: `<span class="cue">stop here — this is the beat to take questions on</span>` }

];
