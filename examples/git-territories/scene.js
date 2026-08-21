/* ============================================================
   GIT, AS A PLACE
   An example deck for Great Circle.

   THE THESIS, and why the deck is shaped this way.

   Learn Git Branching (learngitbranching.js.org) is the best git teaching
   tool that exists, and several people in the room will already have done
   it. It works by animating the commit graph while you type real commands.
   It is interactive; a talk is not. Competing with it head-on would be a
   losing move.

   But there is a whole half of git it structurally cannot draw, because it
   models the commit graph and nothing else: the working tree, the index, and
   the fact that `origin/main` is a CACHE living inside your own repository.
   Those are exactly the things people are still confused about after they
   finish it.

   So this deck does the half LGB cannot, and then hands the room to LGB for
   the half it does better than any talk could. Ending by sending people
   somewhere else is not a weakness. It is the most useful thing a
   twenty-minute talk can do.

   Julia Evans's research on git confusion pointed at the same place: teach
   behaviour, not .git internals, because behaviour is what people hit. So
   there is no cat-file spelunking in here. One 41-byte fact survives,
   because it is the single most load-bearing thing you can tell someone.

   Assumes add / commit / push. Does not assume a model.
   ============================================================ */

const SUBSTRATE = 'blueprint';
const SUBSTRATE_OPT = { step: 900 };

/* A wider canvas than the 24000 x 12000 default, because this deck is laid
   out as horizontal strips rather than a column. Widening beats lengthening:
   the same content in a squarer bounding box is a smaller layer for the
   compositor and a better-looking pull-back at the end. */
world(30000, 46000);

/* ---------- layout ----------
   Six strips down the canvas, one per act. Inside a strip the camera pans
   left to right, then drops to the next. Everything is placed relative to a
   strip constant and a column constant, so moving an act is one number. */
const S1 = 5000;    // I   · the picture LGB draws
const S2 = 11800;   // II  · the territories
const S3 = 21000;   // III · origin/main is a cache
const S4 = 27500;   // IV  · when it disagrees
const S5 = 35000;   // V   · nothing is lost
const S6 = 41500;   // VI  · go and practise

const C = [4200, 11400, 18600, 25800];       // column centres

const RW = 5200, RH = 3400;                  // territory box
const HI = S2 - 2500, LO = S2 + 2500;        // roads above and below the row
const ALL4 = cam(15000, S2, 31000);

const BRASS = '#d0a24e', STEEL = '#7fa8d0';

/* ---------- graph states ----------
   Pulled out of NODES so the before/after pairs sit next to each other and
   the diff is readable in source. A commit keeps the same col/row in both
   states, because in git a commit never moves: only refs move, new commits
   appear, and abandoned ones stop being pointed at. */
const LINE3 = [
  { id: 'a', col: 0, row: 0, label: 'a1c' },
  { id: 'b', col: 1, row: 0, label: '9f2' },
  { id: 'c', col: 2, row: 0, label: '4de' }
];
const LINE3E = [['b', 'a'], ['c', 'b']];

const FORK = [
  { id: 'a', col: 0, row: 0, label: 'a1c' },
  { id: 'b', col: 1, row: 0, label: '9f2' },
  { id: 'm', col: 2, row: 0, label: '4de' },
  { id: 'f1', col: 2, row: 1, label: 'c07' },
  { id: 'f2', col: 3, row: 1, label: 'e18' }
];
const FORKE = [['b', 'a'], ['m', 'b'], ['f1', 'b'], ['f2', 'f1']];
const dimmed = ids => FORK.map(c => ids.includes(c.id) ? { ...c, dim: true } : c);

/* ============================================================
   NODES : what exists
   ============================================================ */
const NODES = [

/* ---------- act 0 : prologue ---------- */
text('t.title', 15000, 400, 11000, 540, `
  <span class="lede" style="font-size:1.1em;letter-spacing:-.025em">Git, as a place</span>
  <span class="aside" style="font-size:.22em;letter-spacing:.46em;text-transform:uppercase;color:var(--brass);margin-top:1.3em">The half the tutorials do not draw</span>`),

text('t.lgb', 15000, 1400, 9000, 285, `
  Some of you have done <em>Learn Git Branching</em>. It is the best thing
  there is, and I am going to send you back to it at the end.
  <span class="aside">It animates the commit graph. It does not draw your files.</span>`),

text('t.claim', 15000, 2400, 9600, 265, `
  Which is a problem, because the part that confuses people is not the graph.
  It is <em>which of four places my work is in right now.</em>`),

/* ---------- act 1 : the picture LGB draws ---------- */
text('t.g0', C[0], S1 - 1500, 6000, 285, `
  Thirty seconds of shared vocabulary.
  <span class="aside">If you have done the tutorial, this is revision.</span>`),

graph('g.commit', C[0], S1 + 900, 6000, {
  commits: LINE3.slice(0, 2), edges: [['b', 'a']],
  refs: [{ at: 'b', name: 'main', kind: 'branch' },
         { at: 'b', name: 'HEAD', kind: 'head', lift: 1 }]
}, {
  to: { commits: LINE3, edges: LINE3E,
        refs: [{ at: 'c', name: 'main', kind: 'branch' },
               { at: 'c', name: 'HEAD', kind: 'head', lift: 1 }] },
  cap: 'a commit is a snapshot plus a pointer to its parent',
  capTo: 'commit: a new snapshot, and the branch moves with you'
}),

text('t.branch', C[1], S1 - 1500, 6000, 285, `
  A branch is a file with a hash in it.
  <span class="aside">Not a simplification for the talk. The implementation.</span>`),

code('c.41', C[1], S1 + 600, 5000, 150, [
  '$ wc -c .git/refs/heads/main',
  '`41`',
  '',
  '# forty hex characters and a newline'
], { ttl: 'your entire main branch' }),

text('t.brcost', C[1], S1 + 2200, 5600, 235, `
  Which is why branching is instant in a repository of any size.
  You wrote 41 bytes.`),

text('t.head', C[2], S1 - 1500, 6000, 285, `
  <code>HEAD</code> is a pointer to a pointer.
  <span class="aside">It holds the <em>name</em> of a branch, which is why committing takes the branch with you.</span>`),

graph('g.head', C[2], S1 + 900, 6000, {
  commits: LINE3, edges: LINE3E,
  refs: [{ at: 'c', name: 'main', kind: 'branch' },
         { at: 'c', name: 'HEAD', kind: 'head', lift: 1 }]
}, {
  to: { commits: LINE3, edges: LINE3E,
        refs: [{ at: 'c', name: 'main', kind: 'branch' },
               { at: 'b', name: 'HEAD', kind: 'head' }] },
  cap: 'normally: HEAD names a branch, the branch names a commit',
  capTo: 'detached HEAD: HEAD skips the branch. That is the whole thing.'
}),

text('t.detach', C[3], S1 - 1500, 6000, 265, `
  You are not lost. You are standing somewhere that has no name.
  <span class="aside">Commit here, walk away, and nothing points at your work. That is the only real risk.</span>`),

text('t.append', C[3], S1 + 1200, 6000, 265, `
  And the property everything else rests on: nothing in a repository is ever
  modified. Things are added, then <em>pointed at</em> or not.
  <span class="aside">"Deleting" a commit only removes the pointer.</span>`),

/* ---------- act 2 : the territories ---------- */
region('r.wt', C[0], S2, RW, RH, 'Working tree', 'the only one Finder can see'),
region('r.ix', C[1], S2, RW, RH, 'Index', 'a.k.a. the staging area'),
region('r.lr', C[2], S2, RW, RH, 'Local repository', 'everything in the last act lives here'),
region('r.rm', C[3], S2, RW, RH, 'Remote', 'someone else’s local repository', { cls: 'remote' }),

text('n.wt', C[0], S2 - 700, 3900, 215, `
  Ordinary files on disk. The only territory that is <em>not</em>
  version controlled.
  <span class="aside">Git does not watch this. It reads it when you ask.</span>`),

text('n.ix', C[1], S2 - 700, 3900, 215, `
  One file, <code>.git/index</code>, holding a complete proposed
  <em>snapshot</em> of your next commit.
  <span class="aside">Not a list of files you flagged. A whole tree.</span>`),

text('n.lr', C[2], S2 - 700, 3900, 215, `
  The commit graph you just saw, plus the refs pointing into it.
  <em>Append only.</em>
  <span class="aside">Everything you have ever committed is still in here.</span>`),

text('n.rm', C[3], S2 - 700, 3900, 215, `
  Another repository, usually on a machine you do not own.
  <span class="aside">"origin" is a nickname, not a status. Your laptop could be someone's origin.</span>`),

code('c.add', C[1], S2 + 950, 3900, 140, [
  '$ git add app.js',
  '',
  'reads app.js off disk',
  'writes the content into .git/objects',
  'records it in the `index`'
], { ttl: 'what add actually does' }),

code('c.gotcha', C[0], S2 + 950, 3900, 140, [
  '$ git add app.js',
  '$ vim app.js        # more edits',
  '$ git commit -m ok',
  '',
  'you committed the `first` version'
], { ttl: 'the classic surprise' }),

arc('a.add',    at(C[0], HI), at(C[1], HI), .22, { color: BRASS }),
arc('a.commit', at(C[1], HI), at(C[2], HI), .22, { color: BRASS }),
arc('a.push',   at(C[2], HI), at(C[3], HI), .22, { color: BRASS }),

tag('l.add',    (C[0] + C[1]) / 2, HI + 400, 3000, 180, 'git add<span class="sub">tree &rarr; index</span>'),
tag('l.commit', (C[1] + C[2]) / 2, HI + 400, 3000, 180, 'git commit<span class="sub">index &rarr; repository</span>'),
tag('l.push',   (C[2] + C[3]) / 2, HI + 400, 3000, 180, 'git push<span class="sub">repository &rarr; remote</span>'),

text('t.noskip', 15000, S2 + 3400, 10000, 260, `
  There is no road from your working tree to the remote.
  <span class="aside">Which is why "I pushed but it isn't there" is always one of the two earlier roads not taken.</span>`),

/* ---------- act 3 : origin/main is a cache ---------- */
text('t.c0', C[0], S3 - 1900, 6400, 300, `
  Now the one that costs people real hours.
  <span class="aside"><code>origin/main</code> is not the remote. It is a note you wrote about the remote.</span>`),

region('r.lr2', C[0], S3 + 700, RW, 2900, 'Local repository', 'on your laptop'),
region('r.cache', C[0], S3 + 1100, 3400, 1100, 'origin/main',
       'a value you remembered, not a place', { cls: 'remote', fs: 150 }),

text('t.cache', C[1], S3 - 1900, 6000, 265, `
  It lives <em>inside your repository</em>, not on the server. It is a
  remembered value, and it is only ever updated by <code>fetch</code>.
  <span class="aside">Nothing on the server can reach across and correct it.</span>`),

graph('g.cache', C[1], S3 + 1000, 6400, {
  commits: LINE3, edges: LINE3E,
  refs: [{ at: 'c', name: 'main', kind: 'branch' },
         { at: 'c', name: 'origin/main', kind: 'remote', lift: 1 }]
}, {
  to: { commits: LINE3.concat([{ id: 'd', col: 3, row: 0, label: 'd4f', dim: true }]),
        edges: LINE3E.concat([['d', 'c']]),
        refs: [{ at: 'c', name: 'main', kind: 'branch' },
               { at: 'c', name: 'origin/main', kind: 'remote', lift: 1 }] },
  cap: 'you and the server agree',
  capTo: 'a colleague pushed d4f. Your origin/main has not moved, because you have not fetched.'
}),

code('c.status', C[2], S3 + 200, 5800, 145, [
  '$ git status',
  'On branch main',
  "Your branch is `up to date` with 'origin/main'.",
  '',
  'nothing to commit, working tree clean'
], { ttl: 'and so this is a lie' }),

text('t.status', C[2], S3 + 2200, 5800, 250, `
  It means "up to date with what I saw last time I fetched", which might
  have been Tuesday.`),

text('t.fetch', C[3], S3 - 1900, 6000, 285, `
  So <code>fetch</code> is the command that makes the note true again.
  <span class="aside">It downloads commits and updates the cache. It does not touch your files.</span>`),

text('t.pull', C[3], S3 + 900, 6000, 265, `
  And <code>pull</code> is <code>fetch</code> plus <code>merge</code>, run
  back to back.
  <span class="aside">Which is why a pull can hand you a conflict and a fetch never can.</span>`),

/* ---------- act 4 : when it disagrees ---------- */
text('t.d0', C[0], S4 - 1900, 6200, 300, `
  Two people worked at once. Now what?`),

graph('g.merge', C[0], S4 + 900, 6200, {
  commits: FORK, edges: FORKE,
  refs: [{ at: 'm', name: 'main', kind: 'branch' },
         { at: 'f2', name: 'feature', kind: 'branch' }]
}, {
  to: { commits: FORK.concat([{ id: 'mc', col: 4, row: 0, label: '77b' }]),
        edges: FORKE.concat([['mc', 'm'], ['mc', 'f2']]),
        refs: [{ at: 'mc', name: 'main', kind: 'branch' },
               { at: 'f2', name: 'feature', kind: 'branch' }] },
  cap: 'diverged: two routes out of one fork',
  capTo: 'merge: one new commit with two parents. Both routes survive.'
}),

graph('g.rebase', C[1], S4 + 900, 6400, {
  commits: FORK, edges: FORKE,
  refs: [{ at: 'm', name: 'main', kind: 'branch' },
         { at: 'f2', name: 'feature', kind: 'branch' }]
}, {
  to: { commits: dimmed(['f1', 'f2']).concat([
          { id: 'n1', col: 3, row: 0, label: 'b31' },
          { id: 'n2', col: 4, row: 0, label: 'd92' }]),
        edges: FORKE.concat([['n1', 'm'], ['n2', 'n1']]),
        refs: [{ at: 'm', name: 'main', kind: 'branch' },
               { at: 'n2', name: 'feature', kind: 'branch' }] },
  cap: 'the same fork again',
  capTo: 'rebase: replayed as NEW commits. c07 and e18 are still there, unpointed-at.'
}),

text('t.newid', C[1], S4 + 3300, 6400, 250, `
  Nothing moved. New commits were built, with new parents, so new ids.
  <span class="aside">Which is the whole reason not to rewrite a branch someone else already has.</span>`),

text('t.cf0', C[2], S4 - 1900, 6000, 300, `
  And sometimes it cannot decide.`),

code('c.conflict', C[2], S4 + 700, 5600, 140, [
  '<<<<<<< HEAD',
  '  padding: 12px;',
  '=======',
  '  padding: 16px;',
  '>>>>>>> feature'
], { ttl: 'a conflict, in your file' }),

text('t.cf1', C[3], S4 - 1900, 6200, 265, `
  Notice <em>where</em> that landed: in your working tree. The leftmost
  territory. The one git does not manage.
  <span class="aside">That is not a failure. It is git handing you the decision it cannot make.</span>`),

text('t.cf2', C[3], S4 + 900, 6200, 250, `
  Which also tells you the way out. Edit the file, <code>git add</code> it to
  say "this is the answer", and continue.
  <span class="aside">You are just walking the roads again.</span>`),

/* ---------- act 5 : nothing is lost ---------- */
text('t.r0', 15000, S5 - 2400, 10500, 320, `
  Last one. The three resets are one question:
  <em>how far left across the territories does it reach?</em>`),

region('r.rwt', C[0], S5 + 300, RW, 1900, 'Working tree', '', { cls: 'danger' }),
region('r.rix', C[1], S5 + 300, RW, 1900, 'Index', ''),
region('r.rlr', C[2], S5 + 300, RW, 1900, 'Local repository', ''),

tag('l.soft',  C[2], S5 + 1900, 4800, 190, '--soft<span class="sub">moves the branch pointer. Nothing else.</span>'),
tag('l.mixed', C[1], S5 + 1900, 4800, 190, '--mixed<span class="sub">and rewrites the index. The default.</span>'),
tag('l.hard',  C[0], S5 + 1900, 4800, 190, '--hard<span class="sub">and overwrites your files.</span>'),

text('t.hard', C[3], S5 + 300, 5600, 250, `
  <code>--hard</code> is the only command on this whole map that can destroy
  something git never recorded.
  <span class="aside">Everything else is recoverable. This is not.</span>`),

code('c.reflog', C[0] + 1800, S5 + 4200, 7200, 140, [
  '$ git reflog',
  '4de9c1b HEAD@{0}: reset: moving to HEAD~2',
  '77b0a3f HEAD@{1}: merge feature',
  'e18cc21 HEAD@{2}: commit: fix the thing',
  '',
  '$ git reset --hard `HEAD@{2}`'
], { ttl: 'every value HEAD has ever had' }),

text('t.reflog', C[2] + 1800, S5 + 4200, 6400, 250, `
  Local, and it keeps about ninety days. Inside that window,
  "I destroyed my branch" is almost never true.
  <span class="aside">And <code>revert</code> is the forward version: a new commit that undoes an old one.</span>`),

/* ---------- act 6 : go and practise ---------- */
text('t.close', 15000, S6, 12000, 340, `
  The only way to truly lose work in git is to never have added it.
  <span class="aside">Everything after <code>git add</code> is somewhere on this map.</span>`),

text('t.handoff', 15000, S6 + 1500, 11000, 285, `
  Now go and do <em>learngitbranching.js.org</em>. It will drill the graph
  half far better than I just did.
  <span class="aside">The difference is that you now know what it is <em>not</em> showing you.</span>`)

];

/* ============================================================
   BEATS : what happens
   ============================================================ */
const ACTS = [
  { n: 'Prologue',                c: '#d0a24e' },
  { n: 'I · The picture',         c: '#d0a24e' },
  { n: 'II · Four territories',   c: '#d0a24e' },
  { n: 'III · A cache, not a remote', c: '#7fa8d0' },
  { n: 'IV · When it disagrees',  c: '#c9503f' },
  { n: 'V · Nothing is lost',     c: '#3fe0c0' },
  { n: 'VI · Go and practise',    c: '#3fe0c0' }
];

const BEATS = [

/* ---- prologue ---- */
{ act: 0, cam: cam(15000, 400, 17000), show: ['t.title'],
  vo: `<em>[title]</em> Git, as a place.` },

{ act: 0, cam: cam(15000, 1400, 11500), show: ['t.lgb'],
  vo: `Quick show of hands: who has done Learn Git Branching? Good. It is the best git teaching thing that exists, and I am going to send you back to it at the end of this. But I want to point at something it does not do, which is that it draws the commit graph and it never draws your files.` },

{ act: 0, cam: cam(15000, 2400, 12000), show: ['t.claim'],
  vo: `And that matters, because in my experience the graph is not what confuses people. What confuses people is <em>which of four places my work is in right now.</em> So that is what this twenty minutes is.` },

/* ---- act I : the picture ---- */
{ act: 1, cam: cam(C[0], S1 - 1500, 8000), show: ['t.g0'],
  vo: `Thirty seconds of shared vocabulary first, so we are all holding the same picture. If you have done the tutorial this is revision, and I will go fast.` },

{ act: 1,
  cam: cam(C[0], S1 + 900, 7600),
  show: ['g.commit'],
  steps: [[], ['g.commit__to']],
  stepVo: [
    `A commit is a full snapshot of your files, plus a pointer to its parent. Not a diff. The arrows point <em>backwards</em>, from newest to oldest.`,
    `And when you commit, the branch comes with you. Watch the label move. That is the whole mechanic.`
  ],
  vo: `A commit.` },

{ act: 1,
  cam: cam(C[1], S1 + 600, 7000),
  show: ['t.branch'],
  steps: [[], ['c.41'], ['t.brcost']],
  stepCams: [cam(C[1], S1 - 1500, 8000), cam(C[1], S1 + 600, 6200), cam(C[1], S1 + 2200, 7000)],
  stepVo: [
    `So what is a branch? A branch is a file with a hash in it. I want to be clear that this is not me simplifying.`,
    `Forty-one bytes. Forty hex characters and a newline. That is your entire main branch.`,
    `Which is why branching is instant in a repository of any size, and why the branches-are-expensive instinct people bring from older version control is wrong by about six orders of magnitude.`
  ],
  vo: `A branch.` },

{ act: 1,
  cam: cam(C[2], S1 + 200, 8000),
  show: ['t.head', 'g.head'],
  steps: [[], ['g.head__to']],
  stepCams: [cam(C[2], S1 + 200, 8000), cam(C[2], S1 + 900, 7600)],
  stepVo: [
    `<code>HEAD</code> is a pointer to a pointer. It usually holds the <em>name</em> of a branch, and that indirection is exactly why committing moved the branch a moment ago. You were never attached to the commit.`,
    `And detached HEAD is just this. HEAD skipping the branch and pointing straight at a commit. That is the entire scary state.`
  ],
  vo: `HEAD.` },

{ act: 1, cam: cam(C[3], S1 - 1500, 8000), show: ['t.detach'],
  vo: `You are not lost. You are standing somewhere that does not have a name. The only real risk is that you commit here, then walk away, and nothing points at what you did.` },

{ act: 1, cam: cam(C[3], S1 + 1200, 8000), show: ['t.append'],
  vo: `And hold on to this one, because everything in the last two acts depends on it. Nothing in a repository is ever modified. Things get added, and then they are pointed at, or they are not. Deleting a commit only ever means removing the pointer. <span class="cue">breathe</span>` },

/* ---- act II : the territories ---- */
{ act: 2, cam: ALL4, show: ['r.wt', 'r.ix', 'r.lr', 'r.rm'],
  vo: `Right. That was the half you can already get elsewhere. This is the half you cannot. Four territories, left to right, roughly in order of how permanent they are.` },

{ act: 2, cam: cam(C[0], S2 - 400, 8200), show: ['r.wt', 'n.wt'],
  vo: `The working tree. Your actual files. The only territory you can open in Finder, and the only one that is <em>not</em> version controlled. Git does not watch it. Git reads it when you ask it to.` },

{ act: 2,
  cam: cam(C[1], S2 - 400, 8200),
  show: ['r.ix'],
  steps: [[], ['n.ix'], ['c.add']],
  stepCams: [cam(C[1], S2 - 400, 8200), cam(C[1], S2 - 700, 6000), cam(C[1], S2 + 950, 5600)],
  stepVo: [
    `The index. Staging area. The one everybody uses daily and almost nobody has a picture of.`,
    `It is one file, and it holds a <em>complete proposed snapshot</em> of your next commit. Not a to-do list of files you ticked. A whole tree.`,
    `Which means <code>git add</code> is doing more than marking. It reads the file off disk and writes the content into the object database there and then. Your content is saved before you ever commit.`
  ],
  vo: `The index.` },

{ act: 2, cam: cam(C[0], S2 + 950, 5600), show: ['r.wt', 'c.gotcha'],
  vo: `And that explains the oldest surprise in git. Add a file, keep editing it, commit. You get the version you added, because that is the version that went into the index. Everyone in this room has hit this, and now you know exactly why. <span class="cue">pause</span>` },

{ act: 2, cam: cam(C[2], S2 - 400, 8200), show: ['r.lr', 'n.lr'],
  vo: `The local repository. Which is just the commit graph from the last act, sitting in the <code>.git</code> folder, plus the refs pointing into it. Append only.` },

{ act: 2, cam: cam(C[3], S2 - 400, 8200), show: ['r.rm', 'n.rm'],
  vo: `And the remote, which is another repository on a machine you probably do not own. Structurally there is nothing special about it. Origin is a nickname, not a status.` },

{ act: 2,
  cam: cam(15000, S2 - 1500, 31000),
  show: ['r.wt', 'r.ix', 'r.lr', 'r.rm'],
  steps: [[], ['a.add', 'l.add'], ['a.commit', 'l.commit'], ['a.push', 'l.push']],
  stepVo: [
    `Now the roads. Every command you type all day is one of these.`,
    `<code>add</code>: tree to index.`,
    `<code>commit</code>: index to repository. Notice it never looks at your working tree. It commits the index.`,
    `<code>push</code>: repository to remote.`
  ],
  vo: `The roads.` },

{ act: 2, cam: cam(15000, S2 + 3400, 12500), show: ['t.noskip'],
  vo: `And the thing to notice is that there is no road from the working tree to the remote. You cannot skip a step. Which is why "I pushed but the change isn't there" is always, every single time, one of the two earlier roads not being taken.` },

/* ---- act III : a cache, not a remote ---- */
{ act: 3, cam: cam(C[0], S3 - 1900, 8500), show: ['t.c0'],
  vo: `Act three, and this is the one that costs people real hours. <code>origin/main</code> is not the remote. It is a note you once wrote about the remote.` },

{ act: 3,
  cam: cam(C[0], S3 + 700, 7500),
  show: ['r.lr2'],
  steps: [[], ['r.cache']],
  stepVo: [
    `Here is your local repository again.`,
    `And <code>origin/main</code> lives <em>in here</em>. On your laptop. It is a cached value, and the only thing that ever updates it is you running <code>fetch</code>. Nothing on the server can reach across and correct it.`
  ],
  vo: `Where the cache lives.` },

{ act: 3,
  cam: cam(C[1], S3 + 1000, 8000),
  show: ['t.cache', 'g.cache'],
  steps: [[], ['g.cache__to']],
  stepCams: [cam(C[1], S3 - 400, 9000), cam(C[1], S3 + 1000, 8000)],
  stepVo: [
    `Right now you and the server agree. Your <code>main</code> and your <code>origin/main</code> both point at 4de.`,
    `Then a colleague pushes. That greyed-out commit is on the server, and your repository has never heard of it. Look at <code>origin/main</code>: it has not moved, and it will not move, until you fetch.`
  ],
  vo: `The cache goes stale.` },

{ act: 3, cam: cam(C[2], S3 + 200, 7200), show: ['c.status'],
  vo: `So this line, which all of us read every day, does not mean what it says. "Your branch is up to date with origin/main."` },

{ act: 3, cam: cam(C[2], S3 + 2200, 7200), show: ['t.status'],
  vo: `It means: up to date with what I saw last time you fetched. Which might have been Tuesday. It is not a claim about the server. It is a claim about your own memory of the server, and it is the single most confidently misread sentence in the whole tool.` },

{ act: 3,
  cam: cam(C[3], S3 - 500, 8500),
  show: ['t.fetch'],
  steps: [[], ['t.pull']],
  stepCams: [cam(C[3], S3 - 1900, 8000), cam(C[3], S3 + 900, 8000)],
  stepVo: [
    `Which makes <code>fetch</code> the command that makes the note true again. It downloads commits and updates the cache, and it does not touch your files at all. Fetch is always safe.`,
    `And <code>pull</code> is fetch plus merge, back to back. Which is exactly why a pull can hand you a conflict and a fetch never can. If you are ever nervous: fetch first, then look around.`
  ],
  vo: `Fetch and pull.` },

/* ---- act IV : when it disagrees ---- */
{ act: 4, cam: cam(C[0], S4 - 1900, 8200), show: ['t.d0'],
  vo: `Act four. Two people worked at once, which is the normal case, not the exception.` },

{ act: 4,
  cam: cam(C[0], S4 + 900, 7800),
  show: ['g.merge'],
  steps: [[], ['g.merge__to']],
  stepVo: [
    `You branched off 9f2. Someone else moved main to 4de. Two routes out of one fork.`,
    `Merge makes one new commit with <em>two</em> parents. Both routes survive on the map, exactly as they happened.`
  ],
  vo: `Merge.` },

{ act: 4,
  cam: cam(C[1], S4 + 900, 8000),
  show: ['g.rebase'],
  steps: [[], ['g.rebase__to']],
  stepVo: [
    `Same fork. Now rebase.`,
    `Watch <code>c07</code> and <code>e18</code>. They do not move. They fade, because nothing points at them any more, and two brand new commits appear on the trunk.`
  ],
  vo: `Rebase.` },

{ act: 4, cam: cam(C[1], S4 + 3300, 8000), show: ['t.newid'],
  vo: `Rebase did not <em>move</em> your work. It could not: a commit's id is a hash that covers its parent, so a commit with a new parent is a new commit. It built copies and pointed your branch at the copies. And that is the whole of "do not rebase a shared branch". If a colleague already has the originals, the two of you now hold histories that disagree.` },

{ act: 4, cam: cam(C[2], S4 - 1900, 8200), show: ['t.cf0'],
  vo: `And then sometimes git gets to the same fork and cannot decide.` },

{ act: 4, cam: cam(C[2], S4 + 700, 7000), show: ['c.conflict'],
  vo: `A conflict. Which everyone treats as an error, and it is not one.` },

{ act: 4, cam: cam(C[3], S4 - 1900, 8200), show: ['t.cf1'],
  vo: `Look at <em>where</em> it landed. Those markers are sitting in your working tree. The leftmost territory, the one git does not manage. Git got as far as it could on its own, and then wrote the disagreement into your files and stopped, because the decision is genuinely yours.` },

{ act: 4, cam: cam(C[3], S4 + 900, 8200), show: ['t.cf2'],
  vo: `Which also tells you the way out without memorising anything. Edit the file until it is right. Then <code>git add</code> it, which in this context means "this is the answer". Then continue. You are just walking the same roads again.` },

/* ---- act V : nothing is lost ---- */
{ act: 5, cam: cam(15000, S5 - 2400, 13000), show: ['t.r0'],
  vo: `Last act, and this is where the map pays for itself. The three flavours of reset are not three strengths. They are one question: how far left across the territories does it reach?` },

{ act: 5,
  cam: cam(15000, S5 + 900, 28000),
  show: ['r.rwt', 'r.rix', 'r.rlr'],
  steps: [[], ['l.soft'], ['l.mixed'], ['l.hard']],
  stepVo: [
    `The same territories, minus the remote.`,
    `<code>--soft</code> reaches the repository and stops. It moves the branch pointer, and leaves your index and your files alone. That is the one for redoing a message or squashing the last three commits.`,
    `<code>--mixed</code>, the default, reaches one territory further and rewrites the index too. Your files are still fine.`,
    `<code>--hard</code> goes all the way, and overwrites your working tree.`
  ],
  vo: `Reset, across the map.` },

{ act: 5, cam: cam(C[3], S5 + 300, 7200), show: ['t.hard'],
  vo: `And that is the one genuinely dangerous command on this whole map, for one specific reason: the working tree is the territory git never recorded. Everything else you are about to see is recoverable. This is not.` },

{ act: 5, cam: cam(C[0] + 1800, S5 + 4200, 8800), show: ['c.reflog'],
  vo: `Because of the reflog. Every value HEAD has ever had, in order, with the reason it changed. Bad reset, bad rebase, deleted branch: still addressable.` },

{ act: 5, cam: cam(C[2] + 1800, S5 + 4200, 8200), show: ['t.reflog'],
  vo: `It is local, so it will not save a colleague, and it expires at around ninety days. But inside that window, "I destroyed my branch" is almost never actually true. And if the history is already shared, use <code>revert</code> instead, which goes forward: a new commit that undoes an old one, honestly.` },

/* ---- act VI : go and practise ---- */
{ act: 6, cam: cam(15000, S6, 14500), show: ['t.close'],
  vo: `So if you take one thing away: the only way to truly lose work in git is to never have added it. Everything after <code>git add</code> is somewhere on this map.` },

{ act: 6, cam: cam(15000, S6 + 1500, 13500), show: ['t.handoff'],
  vo: `And now go and do Learn Git Branching, properly, all the way through. It will drill the graph half far better than I just did, because you get to type and it answers. The only difference is that you now know what it is <em>not</em> showing you, and that is the half that was costing you afternoons.` },

/* cam:'overview' frames every placed node, computed at press time, so this
   shot stays correct however much the deck grows. */
{ act: 6, cam: 'overview', show: [], recap: true,
  vo: `<em>[pull all the way back: the whole canvas]</em> Questions.` }

];
