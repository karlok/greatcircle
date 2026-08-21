/* ============================================================
   GREAT CIRCLE : primitives
   The vocabulary a scene file is written in.

   Everything here returns a plain object. Nothing here touches the DOM.
   The engine reads NODES and BEATS; these functions just make them
   pleasant to type.
   ============================================================ */

/* ---------------- world ----------------
   World space is 24000 x 12000 by default. Keep it this order of magnitude.
   It is tempting to use bigger numbers for precision: do not. Chrome's
   compositor drops tiles on very large layers and paints images half-drawn,
   which looks like a photo rendering as a staircase. The camera scales up to
   compensate, so nothing is lost visually. */
var W = 24000, H = 12000;

/* Redefine the canvas if a deck genuinely needs a different aspect. */
function world(w, h) { W = w; H = h; return { W, H }; }

/* ---------------- camera ----------------
   cam(x, y, w) where w is how much of the world fits across the viewport.
   Smaller is more zoomed in. That one number is the entire camera language. */
const cam = (x, y, w, rot) => ({ x, y, w, rot: rot || 0 });

/* ---------------- images ----------------
   Flat img/ folder keyed by basename. build.js rewrites this helper to read
   from an inlined base64 map, so do not change its shape without changing
   the needle in tools/build.js. */
const IMG = f => `img/${f}.jpg`;

/* ---------------- text ---------------- */

/* Large prose on the canvas. k:'t' marks it as text, which excludes it from
   ghosting: ghosted text is just noise. */
function text(id, x, y, w, fs, html, opt = {}) {
  return { id, k: 't', x, y, w, fs, rot: opt.rot || 0,
           html: `<div class="wtext">${html}</div>` };
}

/* Small monospace caption, uppercase, letterspaced. Labels a region or a
   detail without competing with the prose. */
function tag(id, x, y, w, fs, html) {
  return { id, k: 't', x, y, w, fs, html: `<div class="tag">${html}</div>` };
}

/* ---------------- plate ----------------
   An archival photo print: paper border, drop shadow, optional caption. */
function plate(id, x, y, w, file, cap, opt = {}) {
  const fs = opt.fs || w * 0.042;
  return {
    id, x, y, w, rot: opt.rot || 0, fs,
    html: `<div class="plate ${opt.bare ? 'bare' : ''}">
             <img src="${IMG(file)}" alt="" decoding="async">
             ${cap ? `<div class="cap">${cap}</div>` : ''}
           </div>`
  };
}

/* ---------------- pin ----------------
   A located marker with a pinging ring and a label to one side.
   side: '' puts the label right, 'l' puts it left. */
function pin(id, p, label, sub, size = 190, side = '') {
  return {
    id, k: 'p', x: p.x, y: p.y, w: size, fs: size * 0.72,
    html: `<div class="pin" style="width:${size}px;height:${size}px">
      <span class="ring" style="width:${size}px;height:${size}px"></span>
      <span class="dot" style="width:${size * .26}px;height:${size * .26}px"></span>
      <span class="lab ${side}">${label}${sub ? `<small>${sub}</small>` : ''}</span></div>`
  };
}

/* ---------------- rhumbline ----------------
   The red line crawling across the map. Two placed points, a bow, a draw-on
   animation and a travelling glyph.

   a and b are {x, y} points, not node ids, so an arc can start anywhere.
   bow is how far the curve lifts off the straight line, as a fraction of its
   own length. Positive bows upward. 0.2 is a good default; 0 is a straight
   line; negative bows the other way.

   arc() and rhumb() are the same function. Use whichever reads better. */
function rhumb(id, a, b, bow = 0.20, opt = {}) {
  return { id, type: 'arc', a, b, bow, dash: opt.dash, color: opt.color,
           dot: opt.dot !== false, dur: opt.dur };
}
const arc = rhumb;

/* ---------------- region ----------------
   A named territory on the canvas. The box is scenery: it gives the camera
   something to fly between and gives the audience a place to put things.

   Regions are large. A region 6000 wide reads comfortably at cam w 8000, and
   all four of a four-territory layout read at cam w 26000. */
function region(id, x, y, w, h, label, sub, opt = {}) {
  return {
    id, k: 'r', x, y, w, h, fs: opt.fs || w * 0.055,
    html: `<div class="region ${opt.cls || ''}" style="height:${h}px">
             <span class="rlabel">${label}${sub ? `<small>${sub}</small>` : ''}</span>
           </div>`
  };
}

/* ---------------- code ----------------
   A terminal block. Pass an array of lines. A line starting with "$ " is
   rendered as a command, anything else as output. Backticks inside a line
   mark a highlighted span.

   Keep blocks to about six lines. A wall of terminal output is unreadable at
   any zoom, and the camera cannot rescue it. */
function code(id, x, y, w, fs, lines, opt = {}) {
  const body = (Array.isArray(lines) ? lines : [lines]).map(l => {
    const isCmd = l.startsWith('$ ');
    const txt = (isCmd ? l.slice(2) : l)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/`([^`]+)`/g, '<b>$1</b>');
    return isCmd
      ? `<span class="cl"><i>$</i>${txt}</span>`
      : `<span class="cl out">${txt || '&nbsp;'}</span>`;
  }).join('');
  return { id, k: 't', x, y, w, fs, rot: opt.rot || 0,
           html: `<div class="code ${opt.cls || ''}">${opt.ttl ? `<span class="ctitle">${opt.ttl}</span>` : ''}${body}</div>` };
}

/* ---------------- graph ----------------
   A commit DAG, drawn as one inline SVG so it costs the compositor one
   element instead of thirty.

   spec.commits : [{ id, col, row, label }]  col walks left to right in time,
                  row picks the branch lane, 0 is the trunk.
   spec.edges   : [[fromId, toId], ...]      child listed first, parent second,
                  because that is the direction git actually points.
   spec.refs    : [{ at, name, kind }]       kind: 'branch' | 'head' | 'remote' | 'tag'

   The whole graph is one node, so it reveals and ghosts as a unit. To reveal
   a graph a piece at a time, define several graphs and step through them. */
function graph(id, x, y, w, spec, opt = {}) {
  const A = spec, B = opt.to || null;
  const CW = 150, RH = 130, R = 30;

  /* ---- union layout ----
     A commit's position is fixed across both states, because in git a commit
     never moves. Only refs move, new commits appear, and abandoned ones stop
     being pointed at. That is what makes the morph tractable: no path
     interpolation is needed, because every edge that exists in both states
     has identical endpoints.

     Consequence for authors: give a commit the SAME col/row in both states.
     A commit that "moved" is really a different commit and wants a new id. */
  const union = [];
  const seen = {};
  [A, B].forEach(s => (s ? s.commits : []).forEach(c => {
    if (seen[c.id]) return;
    seen[c.id] = c; union.push(c);
  }));

  const cols = Math.max(...union.map(c => c.col)) + 1;
  const rows = Math.max(...union.map(c => c.row)) + 1;
  const VW = cols * CW + 120, VH = rows * RH + 190;
  const at = {};
  union.forEach(c => { at[c.id] = { x: 70 + c.col * CW, y: VH - 120 - c.row * RH }; });

  const LANE = ['#d0a24e', '#3fe0c0', '#c9503f', '#7fa8d0'];
  const KCOL = { head: '#f2e9d8', remote: '#7fa8d0', tag: '#c9503f', branch: '#3fe0c0' };

  /* opacity of a thing in one state: absent, dimmed, or present */
  const inState = (s, find) => (s ? find(s) : null);
  const vis = (present, dim, fade) => present ? (dim ? fade : 1) : 0;

  /* ---- edges ---- */
  const edgeKey = e => e[0] + '>' + e[1];
  const eA = new Set((A.edges || []).map(edgeKey));
  const eB = B ? new Set((B.edges || []).map(edgeKey)) : eA;
  const allEdges = [];
  [...(A.edges || []), ...(B ? B.edges : [])].forEach(e => {
    if (allEdges.some(x => edgeKey(x) === edgeKey(e))) return;
    allEdges.push(e);
  });

  let edges = '';
  allEdges.forEach(e => {
    const a = at[e[0]], b = at[e[1]]; if (!a || !b) return;
    const dimA = (seen[e[0]] || {}).dim, k = edgeKey(e);
    const oa = eA.has(k) ? (dimA ? .12 : .30) : 0;
    const ob = eB.has(k) ? ((B && (B.commits.find(c => c.id === e[0]) || {}).dim) ? .12 : .30) : 0;
    const mid = (a.x + b.x) / 2;
    const d = a.y === b.y
      ? `M${a.x - R} ${a.y}H${b.x + R}`
      : `M${a.x - R} ${a.y}C${mid} ${a.y} ${mid} ${b.y} ${b.x + R} ${b.y}`;
    edges += `<path class="eg" style="--oa:${oa};--ob:${ob}" d="${d}" fill="none" stroke="#fff" stroke-width="4"/>`;
  });

  /* ---- commits ---- */
  let dots = '';
  union.forEach(c => {
    const p = at[c.id], col = LANE[c.row % LANE.length];
    const ca = inState(A, s => s.commits.find(x => x.id === c.id));
    const cb = B ? B.commits.find(x => x.id === c.id) : ca;
    const oa = vis(!!ca, ca && ca.dim, .34);
    const ob = vis(!!cb, cb && cb.dim, .34);
    dots += `<g class="cm" style="--oa:${oa};--ob:${ob}">
      <circle cx="${p.x}" cy="${p.y}" r="${R}" fill="#0b1c27" stroke="${col}" stroke-width="5"/>
      ${c.label ? `<text x="${p.x}" y="${p.y + 11}" text-anchor="middle" fill="${col}"
        font-family="ui-monospace,Menlo,monospace" font-size="26">${c.label}</text>` : ''}
    </g>`;
  });

  /* ---- refs ----
     Keyed by name, so `main` in state A and `main` in state B are the same
     element and the label slides between commits. This is the whole point. */
  const names = [];
  [...(A.refs || []), ...(B ? (B.refs || []) : [])].forEach(r => {
    if (!names.includes(r.name)) names.push(r.name);
  });

  let refs = '';
  names.forEach(name => {
    const ra = (A.refs || []).find(r => r.name === name);
    const rb = B ? (B.refs || []).find(r => r.name === name) : ra;
    const any = ra || rb;
    const kindCol = KCOL[any.kind] || KCOL.branch;
    const wTxt = name.length * 16 + 26;
    const pos = r => {
      const p = at[r.at]; if (!p) return null;
      /* A lifted ref stops at the box stacked below it rather than drawing a
         stem straight through it down to the commit. */
      const L = r.lift || 0;
      return { x: p.x - wTxt / 2, y: p.y - R - 62 - L * 46, stem: L ? 46 : 62 };
    };
    const pa = ra && pos(ra), pb = rb && pos(rb);
    const home = pa || pb;
    refs += `<g class="rf" style="--ax:${(pa || home).x}px;--ay:${(pa || home).y}px;` +
            `--bx:${(pb || home).x}px;--by:${(pb || home).y}px;--oa:${pa ? 1 : 0};--ob:${pb ? 1 : 0}">
      <rect x="0" y="0" width="${wTxt}" height="42" rx="7" fill="rgba(11,28,39,.92)" stroke="${kindCol}" stroke-width="3"/>
      <text x="${wTxt / 2}" y="29" text-anchor="middle" fill="${kindCol}"
        font-family="ui-monospace,Menlo,monospace" font-size="24" letter-spacing="1">${name}</text>
      <line class="stem" x1="${wTxt / 2}" y1="42" x2="${wTxt / 2}" y2="${(pa || home).stem}"
        stroke="${kindCol}" stroke-width="2.5" opacity=".55"/>
    </g>`;
  });

  const caps = opt.cap
    ? `<div class="gcap"><span class="ca">${opt.cap}</span>${opt.capTo ? `<span class="cb">${opt.capTo}</span>` : ''}</div>`
    : '';

  const node = { id, k: 'g', x, y, w, fs: opt.fs || 100,
    html: `<div class="graph${B ? ' two' : ''}">
      <svg viewBox="0 0 ${VW} ${VH}" style="width:100%;display:block;overflow:visible">${edges}${dots}${refs}</svg>
      ${caps}
    </div>` };

  /* A second, invisible id. Revealing it flips the graph to state B. Put it
     in a `steps` array like any other reveal:
         steps: [[], ['g.rebase__to']]
     The beat number does not change, and the flip is one key press. */
  if (B) node.toId = id + '__to';
  return node;
}

/* ---------------- rule ----------------
   A brass hairline. Cheap punctuation between sections. */
function rule(id, x, y, w) {
  return { id, k: 't', x, y, w, fs: 10, html: `<div class="rule"></div>` };
}

/* ---------------- glyph ----------------
   One large character with a phonetic label under it, stamped on reveal.
   Kept from the origin deck because a single enormous character is a very
   strong beat and nothing else in the vocabulary does it. */
function glyph(id, x, y, ch, ph, w = 425) {
  return { id, k: 't', x, y, w, fs: w * 0.66,
    html: `<div class="glyph"><span class="ch">${ch}</span><span class="rule"></span><span class="ph">${ph}</span></div>` };
}

/* ---------------- lat/lon ----------------
   Only meaningful with the world-map substrate. Converts degrees to world
   units against the substrate's seam. */
function LL(lon, lat, seam) {
  const s = seam == null ? (typeof SEAM !== 'undefined' ? SEAM : 0) : seam;
  return { x: ((lon - s + 360) % 360) / 360 * W, y: (90 - lat) / 180 * H };
}

/* A bare point, for arcs that do not start at a named place. */
const at = (x, y) => ({ x, y });

if (typeof module !== 'undefined') module.exports = {
  world, cam, IMG, text, tag, plate, pin, rhumb, arc, region, code, graph, rule, glyph, LL, at
};
