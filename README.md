# Great Circle

**Presentations that map the journey.**

A camera-driven canvas presentation engine. You write one file. You get one
portable HTML file.

![A line drawing itself across a chart from Manila to San Francisco](docs/media/crossing.gif)

```bash
git clone https://github.com/karlok/greatcircle
cd greatcircle && npm install
npm run git          # "Git, as a place", 39 beats
```

Once the packages are on npm that becomes `npm create greatcircle@latest my-talk`.
Node 18+. Bun works too if you prefer it, Playwright included, and produces a
byte-identical build.

---

## It's a loop!

There is no GUI, no chat box, no API key and no auth surface anywhere in this
project. The authoring interface is a small legible data file, and coding agents 
are extremely good at editing small legible data files.

So the intended usage is: **point an agent at your deck folder and tell
it what you want in your talk.** `AGENTS.md` is scaffolded next to your `scene.js` 
and teaches it the schema, the coordinate system, the camera language and the house 
rules.

Then the loop:

```
1. the agent edits scene.js
2. npm run sheet      -> EDIT-SHEET.md, regenerated FROM SOURCE every time
3. a human reads the markdown by beat number and marks it up with >> notes
4. npm run verify -- --shots   walks every beat and screenshots each one,
                               so the agent can look at what it built
5. npm run build      -> one portable HTML file, which is what you present
```

Step 2's emphasis is critical (and the DX to be improved). Generating the sheet 
once and hand-patching it afterwards caused a real incident: the reviewer approved
content that had already been cut. CI now regenerates every sheet and fails if a
committed one has drifted, so the rule is mechanical rather than a note in a doc.

Step 4 is also important. An agent that can verify its own output is worth more 
than one with a nicer chat interface.

---

## The format

Two lists.

```js
const NODES = [                                    // WHAT EXISTS
  region('r.db',  4200, 1800, 4400, 3200, 'Primary', 'single writer'),
  text  ('t.why', 9800, 1800, 4000, 240, 'Why one writer?'),
  arc   ('a.1', at(4200, 900), at(9800, 900), .22),
];

const BEATS = [                                    // WHAT HAPPENS
  { act: 0, cam: cam(4200, 1800, 8000), show: ['r.db'],
    vo: `We start with one database.` },

  { act: 0, cam: cam(7000, 1800, 12000), show: ['r.db'],
    steps:  [[], ['a.1'], ['t.why']],              // one key press each
    stepVo: [`Reads come from here.`, `Writes go here.`, `So why one writer?`] },
];
```

`cam(x, y, w)`: `w` is how much of the world fits across the screen. Smaller
is more zoomed in. That one number is the entire camera language.

`steps` lets one beat hold several key presses without changing the beat
count, so beat 12 is still beat 12 after it grows a fourth reveal. That is
what makes review-by-beat-number survive a restructure.

Full reference in [AGENTS.md](AGENTS.md).

---

## Animated diagrams

![A rebase: the feature branch label slides to new commits while the originals fade](docs/media/rebase.gif)

`graph()` takes a second state and morphs between them on one key press: refs
slide to their new commits, new commits fade in, abandoned ones fade back.

```js
graph('g.rebase', x, y, w, BEFORE, { to: AFTER, capTo: 'replayed as new commits' })
```

This works because in git a commit never moves. Only the pointers do. Fixing
every commit's position across both states means no path interpolation is
needed, and what you see animate is exactly what git actually does.

---

## Motion

The camera path is van Wijk and Nuij's optimal zoom-and-pan (1996), which
models `(x, y, zoom)` as a point in hyperbolic space and solves for the
geodesic between two camera positions. A great circle is the geodesic on a
sphere, so that's why the name: the engine computes great circles in camera 
space.

In practice it means the camera pulls back and dives in on its own when the
distance warrants it, instead of lerping. That is the coolness this tool offers.

---

## Commands

Every command takes a deck folder, defaulting to the current directory.

| | |
|---|---|
| `greatcircle new <dir>` | scaffold a deck folder |
| `greatcircle dev` | serve it. Edit `scene.js` and refresh |
| `greatcircle sheet` | write `EDIT-SHEET.md` from source |
| `greatcircle verify` | headless walk of every beat. `--shots` writes PNGs |
| `greatcircle build` | one portable HTML file. `-o` to name it |

`verify` starts its own server, so there is nothing to run first. It needs
Playwright; nothing else does. Authoring needs a text editor.

---

## What is what

Your deck folder holds your content and nothing else:

```
my-talk/
  scene.js        your deck
  AGENTS.md       the briefing for a coding agent
  theme.css       optional. Override any colour or face
  substrate.js    optional. Bring your own background
  img/            photos, referenced by basename
```

The engine lives in `node_modules/@greatcircle/core`, so an engine fix
reaches you with `npm update` rather than a merge.

---

## Examples

```bash
npm run git        # "Git, as a place" — 39 beats, five animated diagrams
npm run crossing   # three beats: a line drawing itself across a chart
npm run plates     # six photographs, and a compositor bug
```

| | |
|---|---|
| [`git-territories`](examples/git-territories/scene.js) | A fully worked 39-beat talk |
| [`first-crossing`](examples/first-crossing/scene.js) | The visual identity in one screen |
| [`plates`](examples/plates/scene.js) | `plate()` worked, and the regression case for the repaint stall |

Each has an `EDIT-SHEET.md` next to it, which is what a human reviews.

---

## Substrates

The background is a plugin. It is empty by default.

- `grid` — a near-invisible rule grid. The default
- `blueprint` — engineering-drawing paper, border and registration marks
- `world-map` — real coastlines, graticule, rhumb web, compass rose, starfield

A `substrate.js` next to your `scene.js` is picked up automatically. The
substrate is your cool background scenery, so thematically important.

---

## Presenting

`P` opens a separate presenter window with your voice-over, a timer and the
next line. Chrome's tab capture is compositor-level, so share the deck **tab**
in Meet, never the screen, and the presenter window stays private.

`?` for the rest of the keys.

---

## Status

v0.1. The engine, the schema, the loop and three worked examples. It has
carried one real 47-beat talk, live, served as a single static file.

Known open issue: an intermittent repaint stall on large rasters, which never
reproduces headless. `examples/plates` exists to exercise it and documents how
to test by hand.

---

## Not on the roadmap

A GUI. Hosting. Accounts. An API-key overlay. A chat window. If any of those
ever ship, the project has lost the plot.

Next up will be the video renderer. Because the camera is a pure function of time, 
the same file that drives a live talk renders offline to a video file at any
resolution, with no screen recording and no dropped frames.

---

MIT.
