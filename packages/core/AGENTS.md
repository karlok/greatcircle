# AGENTS.md

You are editing a Great Circle deck. This file is the whole briefing. Read it
before you touch `scene.js`.

There is no API, no chat window and no auth. The authoring interface is a
small legible data file, and you are extremely good at editing small legible
data files. That is the entire design.

---

## The loop

Run this every pass. Not at the end. Every pass.

```
greatcircle sheet     # regenerate EDIT-SHEET.md FROM SOURCE
greatcircle verify    # headless walk of every beat and every step
greatcircle build     # one portable HTML file
```

Each takes a deck folder, defaulting to the current directory. `verify`
starts its own server, so there is nothing to run first. In a scaffolded deck
these are `npm run sheet` / `verify` / `build`.

You are editing one file: `scene.js`, next to this one. The engine is in
`node_modules/@greatcircle/core` and you should not need to open it. If you
believe you do, say so rather than vendoring a copy into the deck folder.

**Regenerate the sheet from source, every time.** Do not generate it once and
hand-patch it afterwards. That caused a real incident: the human reviewed a
stale sheet full of content that had already been cut, and approved things
that no longer existed.

**Look at what you built.** `greatcircle verify --shots` writes a PNG
per press into `shots/`. Read them. An agent that can see its own
output is worth more than one with a nicer text box, and a beat that reads
fine in source and looks wrong on screen is the normal case, not the
exception.

---

## The format

Two lists. That is all.

```js
const NODES = [                       // WHAT EXISTS
  text  ('t.why', 6000, 1800, 4000, 240, 'Why one writer?'),
  region('r.db',  4200, 1800, 4400, 3200, 'Primary', 'single writer'),
  code  ('c.q',   4200, 3400, 3300, 140, ['$ SELECT 1', 'ok']),
  arc   ('a.1', at(4200, 900), at(9800, 900), .22),
];

const BEATS = [                       // WHAT HAPPENS
  { act: 0, cam: cam(4200, 1800, 8000), show: ['r.db'],
    vo: `We start with one database.` },

  { act: 0, cam: cam(6000, 1800, 12000),
    show: ['r.db'],
    steps:   [[], ['a.1'], ['t.why']],          // one key press each
    stepVo:  [`Reads come from here.`, `Writes go here.`, `So why one writer?`] },
];
```

`ACTS` is a third list, one entry per act, giving the label and the progress
bar colour:

```js
const ACTS = [{ n: 'Prologue', c: '#d0a24e' }, { n: 'I · The Shape', c: '#3fe0c0' }];
```

---

## The camera

`cam(x, y, w)` where **`w` is how much of the world fits across the
viewport**. Smaller is more zoomed in. That one number is the entire camera
language; there is no zoom level, no scale factor and no easing to choose.

Travel between two shots is van Wijk and Nuij's optimal zoom-and-pan, so the
camera pulls back and dives in on its own when the distance warrants it. Do
not try to choreograph that by adding intermediate beats. Let it work.

Rules of thumb, for a 16:9 window:

| you want | use |
|---|---|
| one region, comfortably framed | `w` ≈ region width × 1.5 |
| a paragraph of `text()` | `w` ≈ node width × 1.3 |
| four regions on one row | `w` ≈ 25000 |
| the closing pull-back | `cam: 'overview'` |

`cam: 'overview'` frames every placed node, computed from the window at press
time. Use it for the final beat instead of a hand-picked wide shot, so it
stays correct as the deck grows.

`stepCams` gives a beat one camera per press. Use it when a beat's reveals are
spread across the canvas.

---

## Coordinates

**World space is 24000 × 12000 by default**, and `world(w, h)` changes it.
Keep the whole canvas to this order of magnitude — around 10k units, not
100k. Chrome's compositor drops tiles on very large layers and paints images
half-drawn, which looks like a photo rendering as a staircase. Reducing
coordinates 4× was one of the fixes that made that go away. The camera scales
up to compensate, so nothing is lost visually.

**Widen before you lengthen.** When a deck outgrows the canvas the reflex is
to keep adding rows downward, which produces a tall ribbon: a large layer, an
awkward pull-back, and a poor overview. Call `world()` wider and lay acts out
as horizontal strips instead. Same content, squarer bounding box, smaller
layer. The `git-territories` example is 30000 × 46000 for this reason and is at
the upper end of what is comfortable — it gets away with it because it
contains no raster images, which is where the tile problem actually bites.

`x` and `y` are the **centre** of a node, not its top-left.

Lay a deck out in **bands**, one per act, and name them:

```js
const B0 = 900, ROW = 7000, B2 = 15200, B4 = 28200;
```

Then place everything relative to a band constant. This is what makes a deck
restructurable: moving an act is one number. Do it even for a five-beat deck.
`examples/git-territories/scene.js` is laid out this way; copy its shape.

---

## Beats and steps

`steps` lets one beat hold several key presses **without changing the beat
count**. Beat 12 stays beat 12 when it grows a fourth reveal.

This matters more than it sounds. Stable beat numbering is what lets a human
review a deck by beat number while the structure is still moving. The origin
deck ran 47 beats and 59 presses for exactly this reason.

- `show` is live for the whole beat
- `steps[i]` are revealed cumulatively, one press at a time
- `stepVo[i]` is the line for press `i`
- `recap: true` un-ghosts everything, for the closing pull-back

Nodes shown in earlier beats persist at 13% opacity, to build a sense of
accumulated territory. Text nodes are excluded, because ghosted text is
noise. Both are intentional. Do not "fix" them.

---

## The vocabulary

| primitive | for |
|---|---|
| `text(id, x, y, w, fs, html)` | prose. Serif, large. `<em>` is brass, `<code>` is jade |
| `tag(id, x, y, w, fs, html)` | small mono caption. `<span class="sub">` for a second line |
| `region(id, x, y, w, h, label, sub)` | a named territory. Scenery for the camera to fly between |
| `code(id, x, y, w, fs, lines[])` | terminal block. `$ ` prefix = command. Backticks = highlight |
| `graph(id, x, y, w, spec, {to})` | a commit DAG, as one inline SVG. `to` gives it a second state |
| `plate(id, x, y, w, file, cap)` | an archival photo print from `img/<file>.jpg` |
| `arc(id, a, b, bow)` / `rhumb` | the line crawling across the map. Draws on, with a travelling glyph |
| `pin(id, point, label, sub)` | a located marker with a pinging ring |
| `glyph(id, x, y, ch, phonetic)` | one enormous character, stamped on reveal |
| `rule(id, x, y, w)` | a brass hairline |
| `at(x, y)` | a bare point, for arc endpoints |

Inside `text()`: `<span class="aside">` is a small mono footnote,
`<span class="lede">` is a brighter opening. Inside a voice-over,
`<span class="cue">` is a presenter-only note that never appears on screen.

### Animated diagrams

`graph()` takes a second state and morphs between them on one key press:

```js
graph('g.rebase', x, y, w, BEFORE, {
  to: AFTER,
  cap:   'the fork, before',
  capTo: 'rebase: replayed as new commits'
}),
```

Then reveal the generated `<id>__to` id like any other step:

```js
{ act: 4, cam: cam(x, y, w), show: ['g.rebase'],
  steps:  [[], ['g.rebase__to']],
  stepVo: [`Same fork.`, `Watch c07 and e18 fade.`] },
```

The beat number does not change; the flip is one press. The `__to` id is not
an element, it is a switch, so it never ghosts and never needs a camera.

**Give a commit the same `col`/`row` in both states.** The morph works
because in git a commit never moves: only refs move, new commits appear, and
abandoned ones stop being pointed at. Fixed positions mean every surviving
edge has unchanged endpoints, so nothing needs path interpolation and the
animation is exactly the four things git actually does. A commit that appears
to "move" is really a different commit and wants a new id, which is also the
truth about rebase.

What animates: refs slide, new commits fade in, `dim: true` commits fade
back, edges cross-fade, and the caption swaps if you gave it a `capTo`.

`arc` is deliberately first-class rather than a plugin. Two points, a bow, a
draw-on animation, an optional travelling marker. `bow` is the lift as a
fraction of the arc's own length: `0.2` is a good default, `0` is straight,
negative bows the other way. A dashed arc appears whole rather than drawing
on, because the dash array is what drives the animation.

---

## Substrates

The background is a plugin and it is **empty by default**.

- `grid` — near-invisible rule grid. The default
- `blueprint` — engineering-drawing paper, border and registration marks
- `world-map` — real coastlines, graticule, rhumb web, compass rose, starfield

```js
const SUBSTRATE = 'blueprint';
const SUBSTRATE_OPT = { step: 700 };
```

The substrate is scenery. Do not let it become the framework, and do not put
content in it.

`world-map` carries a generated coastline path with the rings pre-projected
and split at the seam using Sutherland-Hodgman clipping. **Never hand-edit
it.** With that substrate, `LL(lon, lat)` converts degrees to world units.

To bring your own, drop a `substrate.js` next to `scene.js` that calls
`GC.substrate('name', build)`, and set `SUBSTRATE = 'name'`. It is picked up
automatically by both `dev` and `build`.

---

## House rules

These were each found by fixing a real, observed problem. Breaking one brings
the problem back.

**No `will-change` on nodes.** A blanket `.node { will-change: opacity }`
promotes every element to its own permanent GPU layer. At ~90 nodes that made
playback visibly choppy and introduced tearing. It belongs on the moving
container only, and it is already there.

**Keep the DOM in the canvas low.** `verify.js` prints the count. Under 800.
If a change pushes it over, that change is probably wrong: build the thing as
one inline SVG instead of thirty elements. The starfield went from 900 divs to
5 paths; the landmass from a `clipPath` and two `<use>` elements to 1 path.

**Border widths in `em`, not `px`.** Inside the scaled canvas a `px` value is
a *world* unit, so a 2px border is invisible at a wide shot.

**Theme changes go in `theme.css`, next to your scene.** It loads after the
runtime's stylesheet and is inlined at build time. Never edit the runtime.

**Keep code blocks to about six lines.** A wall of terminal output is
unreadable at any zoom and the camera cannot rescue it.

**Grep the real source text before applying an edit.** Fail loudly if the
match count is not exactly 1. Curly quotes and inline HTML tags cause silent
no-op replacements, and a silent no-op is worse than an error.

**Measure before optimising.** A suspected performance regression turned out
not to exist: building the previous version and running both through the same
harness back to back showed them identical within noise. Ten minutes of
measurement prevented speculative surgery on a verified build hours before a
live talk.

---

## Presenting

`P` opens a separate presenter window with the voice-over, a timer and the
next line. Chrome's tab capture is compositor-level, so **share the deck TAB
in Meet, never the screen**, and the presenter window stays private.

`R` forces a repaint. Images are pre-decoded ahead of the beat that reveals
them, which is the fix for a stall where Chrome painted a plate border around
a half-decoded photo. `R` remains as a backstop, because this is a heuristic
about someone else's compositor.

---

## Things that are not bugs

- **Ghosting.** Previously shown nodes persist at 13% opacity. Intentional.
- **Beat count ≠ press count.** `steps`. See above.
- **The presenter window is invisible in Meet.** That is the point.
- **`land-path.js` is unreadable.** It is generated. Leave it alone.
