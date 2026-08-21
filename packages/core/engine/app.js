/* ============================================================
   GREAT CIRCLE : engine
   van Wijk & Nuij optimal zoom-and-pan camera over a large canvas.

   Reads three globals from the scene file: NODES, BEATS, ACTS.
   Optionally SUBSTRATE ('grid' by default) and SUBSTRATE_OPT.

   Nothing in here knows what a deck is about.
   ============================================================ */
(function () {
'use strict';

const stage = document.getElementById('stage');
const world = document.getElementById('world');
const $ = s => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';

const SUB     = typeof SUBSTRATE     !== 'undefined' ? SUBSTRATE     : 'grid';
const SUB_OPT = typeof SUBSTRATE_OPT !== 'undefined' ? SUBSTRATE_OPT : {};

function svgLayer(cls, extra) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('width', W); s.setAttribute('height', H);
  s.setAttribute('viewBox', `0 0 ${W} ${H}`);
  s.style.cssText = `position:absolute;left:0;top:0;overflow:visible;pointer-events:none;${extra || ''}`;
  s.setAttribute('class', cls);
  return s;
}

/* ---------------- substrate ----------------
   Scenery, drawn once, underneath everything. It gets a hook on zoom so it
   can fade itself out of the way on a close shot, and nothing else. */
let substrate = null;
{
  const build = GC.get(SUB);
  if (!build) console.warn(`substrate "${SUB}" is not registered. Loaded: ${GC.list().join(', ') || 'none'}`);
  else substrate = build(world, { svgLayer, SVGNS, W, H, opt: SUB_OPT }) || null;
}

/* arcs sit above the substrate and below the nodes */
const arcSvg = svgLayer('arcs');
world.appendChild(arcSvg);

const nodeLayer = document.createElement('div');
nodeLayer.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0';
world.appendChild(nodeLayer);

/* ---------------- build nodes ---------------- */
const EL = {};
NODES.forEach(n => {
  if (n.type === 'arc') {
    const mx = (n.a.x + n.b.x) / 2, my = (n.a.y + n.b.y) / 2;
    const dx = n.b.x - n.a.x, dy = n.b.y - n.a.y, len = Math.hypot(dx, dy);
    const cy = my - len * n.bow;
    const d = `M${n.a.x} ${n.a.y}Q${mx} ${cy} ${n.b.x} ${n.b.y}`;
    const dur = n.dur || 2.6;

    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', n.color || '#d0a24e');
    p.setAttribute('stroke-width', Math.max(6, len * 0.006));
    p.setAttribute('stroke-linecap', 'round');
    if (n.dash) p.setAttribute('stroke-dasharray', n.dash);
    p.setAttribute('class', 'node hidden arcpath');
    arcSvg.appendChild(p);

    /* dasharray drives the draw-on, so a dashed arc cannot also animate.
       A dashed arc appears whole; that is the trade and it is the right one. */
    if (!n.dash) {
      const tl = p.getTotalLength();
      p.style.strokeDasharray = tl;
      p.style.strokeDashoffset = tl;
      p.style.transition = `stroke-dashoffset ${dur}s cubic-bezier(.35,0,.2,1), opacity .8s ease`;
      p.dataset.len = tl;
    }
    EL[n.id] = p;

    if (n.dot) {
      const dot = document.createElementNS(SVGNS, 'circle');
      dot.setAttribute('r', Math.max(10, len * 0.008));
      dot.setAttribute('fill', '#f0d9a8');
      dot.setAttribute('class', 'node hidden');
      const mo = document.createElementNS(SVGNS, 'animateMotion');
      mo.setAttribute('dur', dur + 's'); mo.setAttribute('fill', 'freeze');
      mo.setAttribute('path', d);
      dot.appendChild(mo);
      arcSvg.appendChild(dot);
      EL[n.id + '__dot'] = dot;
      EL[n.id].__dot = dot; EL[n.id].__mo = mo;
    }
    return;
  }

  const d = document.createElement('div');
  d.className = 'node hidden ' + (n.cls || '');
  d.style.left = n.x + 'px';
  d.style.top = n.y + 'px';
  d.style.width = n.w + 'px';
  if (n.h) d.style.height = n.h + 'px';
  d.style.fontSize = (n.fs || 100) + 'px';
  d.style.transform = `translate(-50%,-50%) rotate(${n.rot || 0}deg)`;
  d.innerHTML = n.html;
  nodeLayer.appendChild(d);
  EL[n.id] = d;
});

const KIND = {};
NODES.forEach(n => KIND[n.id] = n.k || 'p');

/* ---------------- toggles ----------------
   A node can publish a second id that, when revealed, puts a class on the
   node instead of creating an element of its own. graph({to:...}) uses it to
   morph between two states on one key press. Toggles are ids in a beat's
   `show` or `steps` like any other, so nothing else in the engine has to
   know they are special. */
const TOGGLES = {};
NODES.forEach(n => {
  if (!n.toId) return;
  TOGGLES[n.toId] = { of: n.id, cls: 'to' };
  KIND[n.toId] = 't';                     // never ghosted: it is not a thing
});
const ALL_IDS = Object.keys(EL).concat(Object.keys(TOGGLES));

/* ---------------- image pre-decode ----------------
   The stall this replaces: Chrome would arrive at a beat with a large raster
   still partially decoded, and paint the plate border with a half-drawn photo
   inside it. Forcing a repaint after arrival fixed it, but only after the
   audience had already seen the stall.

   Decoding ahead of time is the better shape of the same fix. Every image in
   the deck is decoded off the critical path at idle, and the images a beat is
   about to reveal are decoded before the camera starts moving, so by arrival
   there is nothing left to decode. forceRepaint and the R key stay as
   backstops, because this is a heuristic about someone else's compositor. */
const IMGS = {};
NODES.forEach(n => {
  const el = EL[n.id]; if (!el || !el.querySelectorAll) return;
  const list = [...el.querySelectorAll('img')];
  if (list.length) IMGS[n.id] = list;
});

const decoded = new WeakSet();
function decodeFor(ids) {
  const jobs = [];
  ids.forEach(id => (IMGS[id] || []).forEach(img => {
    if (decoded.has(img)) return;
    decoded.add(img);
    if (img.decode) jobs.push(img.decode().catch(() => {}));
  }));
  return jobs.length ? Promise.all(jobs) : Promise.resolve();
}

/* Everything else, slowly, while nobody is waiting. */
(function decodeRest() {
  const all = Object.keys(IMGS);
  let i = 0;
  const idle = window.requestIdleCallback || (f => setTimeout(f, 200));
  (function pump() {
    if (i >= all.length) return;
    decodeFor([all[i++]]).then(() => idle(pump));
  })();
})();

/* ---------------- camera ---------------- */
let vw = innerWidth, vh = innerHeight;
const C0 = typeof BEATS[0].cam === 'object' ? BEATS[0].cam : { x: W / 2, y: H / 2, w: W };
const CAM = { x: C0.x, y: C0.y, w: C0.w * 2.6, rot: 0 };   // start pulled back, then settle in
let target = { ...CAM }, tween = null, manual = false;

/* Zoom expressed 0..1 across the deck's own range, for the substrate hook. */
const ZMIN = 750, ZMAX = 30000;
function apply() {
  const zoom = vw / CAM.w;
  world.style.transform =
    `translate3d(${vw / 2}px,${vh / 2}px,0) scale(${zoom}) rotate(${CAM.rot}deg) translate3d(${-CAM.x}px,${-CAM.y}px,0)`;
  if (substrate && substrate.onZoom) {
    const t = Math.min(1, Math.max(0, (Math.log(CAM.w) - Math.log(ZMIN)) / (Math.log(ZMAX) - Math.log(ZMIN))));
    substrate.onZoom(t, CAM);
  }
}

/* A hand-authored frame can be too tight once a caption wraps to another line.
   Measure what is actually live (offset* are in world units, since the
   transform lives on the parent) and widen the shot only if it would clip. */
function fitToContent(shot, ids) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, any = false;
  ids.forEach(id => {
    const el = EL[id];
    if (!el || el.classList.contains('arcpath') || !el.offsetWidth) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    const cx = parseFloat(el.style.left), cy = parseFloat(el.style.top);
    const r = Math.abs((parseFloat((el.style.transform.match(/rotate\((-?[\d.]+)deg\)/) || [0, 0])[1]) || 0) * Math.PI / 180);
    const rw = w * Math.cos(r) + h * Math.sin(r), rh = w * Math.sin(r) + h * Math.cos(r);
    x0 = Math.min(x0, cx - rw / 2); x1 = Math.max(x1, cx + rw / 2);
    y0 = Math.min(y0, cy - rh / 2); y1 = Math.max(y1, cy + rh / 2);
    any = true;
  });
  if (!any) return shot;
  const PAD = 1.10, aspect = vw / vh;
  const need = Math.max((x1 - x0) * PAD, (y1 - y0) * PAD * aspect);
  const half = shot.w / 2, halfV = shot.w / aspect / 2;
  const fits = x0 >= shot.x - half && x1 <= shot.x + half &&
               y0 >= shot.y - halfV && y1 <= shot.y + halfV;
  if (fits) return shot;
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: Math.max(need, shot.w), rot: shot.rot || 0 };
}

/* van Wijk & Nuij (1996) optimal path. rho is the one tuning knob: lower is a
   flatter, faster arc, higher pulls further back before diving in. 1.42 reads
   cinematic without making short hops feel like a round trip. */
function interpZoom(p0, p1) {
  const rho = 1.42, rho2 = rho * rho, rho4 = rho2 * rho2;
  const ux0 = p0[0], uy0 = p0[1], w0 = p0[2];
  const ux1 = p1[0], uy1 = p1[1], w1 = p1[2];
  const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, d1 = Math.sqrt(d2);
  const cosh = x => (Math.exp(x) + Math.exp(-x)) / 2;
  const sinh = x => (Math.exp(x) - Math.exp(-x)) / 2;
  const tanh = x => sinh(x) / cosh(x);
  let S, fn;
  if (d2 < 1e-9 || d1 < w0 * 1e-4) {
    S = Math.abs(Math.log(w1 / w0)) / rho;
    fn = t => [ux0 + t * dx, uy0 + t * dy, w0 * Math.pow(w1 / w0, t)];
  } else {
    const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
    const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    S = (r1 - r0) / rho;
    fn = t => {
      const s = t * S, ch0 = cosh(r0);
      const u = w0 / (rho2 * d1) * (ch0 * tanh(rho * s + r0) - sinh(r0));
      return [ux0 + u * dx, uy0 + u * dy, w0 * ch0 / cosh(rho * s + r0)];
    };
  }
  fn.S = Math.abs(S) || 0.001;
  return fn;
}

/* Chrome rasterises a composited layer at one scale and reuses it. Because
   this canvas spans ~100k px and the zoom range is ~100x, a permanently
   promoted layer can exceed the tile budget and paint an image only
   partially. Promoting only during motion, then dropping the hint on arrival,
   forces a clean re-raster at the final scale. */
let repaintTimer = null;
function settle() {
  world.classList.remove('moving');
  clearTimeout(repaintTimer);
  const elapsed = performance.now() - goAt;
  repaintTimer = setTimeout(forceRepaint, Math.max(250, quietMs - elapsed));
}
function forceRepaint() {
  const d = world.style.display;
  world.style.display = 'none';
  void world.offsetHeight;          // reflow: discards every cached tile
  world.style.display = d;
}

function flyTo(c, speed) {
  world.classList.add('moving');
  clearTimeout(repaintTimer);
  const f = interpZoom([CAM.x, CAM.y, CAM.w], [c.x, c.y, c.w]);
  const dur = Math.min(3400, Math.max(950, f.S * 900)) * (speed || 1);
  tween = { f, dur, t0: performance.now(), r0: CAM.rot, r1: c.rot || 0 };
}

function frame(now) {
  if (tween) {
    let t = (now - tween.t0) / tween.dur;
    if (t >= 1) t = 1;
    const e = t * t * (3 - 2 * t);          // smoothstep on arc length
    const p = tween.f(e);
    CAM.x = p[0]; CAM.y = p[1]; CAM.w = p[2];
    CAM.rot = tween.r0 + (tween.r1 - tween.r0) * e;
    if (t === 1) { tween = null; apply(); settle(); return requestAnimationFrame(frame); }
    apply();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------------- beats ---------------- */
let idx = -1, step = 0, goAt = 0, quietMs = 900;
const seenBefore = BEATS.map(() => null);
(function precompute() {
  const seen = new Set();
  BEATS.forEach((b, i) => {
    seenBefore[i] = new Set(seen);
    (b.show || []).forEach(id => seen.add(id));
    (b.steps || []).forEach(g => g.forEach(id => seen.add(id)));
  });
})();

function setNode(id, state) {
  const t = TOGGLES[id];
  if (t) {
    const host = EL[t.of];
    /* The graph itself has to be on screen for the flip to mean anything, so
       a toggle only ever adds or removes a class; it never reveals. */
    if (host) host.classList.toggle(t.cls, state === 'live');
    return;
  }
  const el = EL[id]; if (!el) return;
  if (el.classList.contains(state)) return;   // unchanged -> do not restart entry animations
  el.classList.remove('hidden', 'ghost', 'live', 'recap');
  el.classList.add(state);
  if (el.classList.contains('arcpath')) {
    const tl = el.dataset.len;
    if (tl) el.style.strokeDashoffset = (state === 'hidden') ? tl : 0;
    const dot = el.__dot;
    if (dot) {
      dot.classList.remove('hidden', 'ghost', 'live', 'recap');
      dot.classList.add(state === 'live' ? 'live' : 'hidden');
      if (state === 'live' && el.__mo.beginElement) { try { el.__mo.beginElement(); } catch (e) {} }
    }
  }
}

function stepsOf(b) { return b.steps || null; }
function lastStep(b) { const s = stepsOf(b); return s ? s.length - 1 : 0; }

/* Arrow keys walk sub-reveals inside a beat before moving to the next beat.
   Beat numbers therefore never shift when a beat gains internal steps, which
   is what lets a human review a deck by beat number while the structure is
   still moving. It matters more than it sounds. */
function nav(dir) {
  if (overview) overview = false;
  const b = BEATS[idx];
  if (dir > 0) {
    if (b && stepsOf(b) && step < lastStep(b)) return go(idx, { step: step + 1 });
    return go(idx + 1, { step: 0 });
  }
  if (step > 0) return go(idx, { step: step - 1 });
  const prev = BEATS[idx - 1];
  return go(idx - 1, { step: prev ? lastStep(prev) : 0 });
}

/* What the next press will reveal, so it can be decoded in advance. */
function idsAhead(i, s) {
  const out = [];
  const b = BEATS[i];
  if (b && b.steps && s < lastStep(b)) out.push(...(b.steps[s + 1] || []));
  const nx = BEATS[i + 1];
  if (nx) { out.push(...(nx.show || [])); if (nx.steps) out.push(...(nx.steps[0] || [])); }
  return out;
}

function go(i, opt) {
  opt = opt || {};
  i = Math.max(0, Math.min(BEATS.length - 1, i));
  const b = BEATS[i];
  const first = idx < 0;
  const sameBeat = i === idx;
  idx = i;
  step = Math.max(0, Math.min(lastStep(b), opt.step == null ? 0 : opt.step));
  manual = false; $('#hint').classList.remove('on');

  const live = new Set(b.show || []);
  if (stepsOf(b)) for (let s = 0; s <= step; s++) (b.steps[s] || []).forEach(id => live.add(id));
  const dim = b.recap ? 'recap' : 'ghost';
  const pool = b.recap ? ALL_IDS : [...seenBefore[i]];
  const ghost = new Set(pool.filter(id => !live.has(id) && !id.endsWith('__dot') &&
    !TOGGLES[id] && (b.recap || KIND[id] !== 't')));
  ALL_IDS.forEach(id => {
    if (id.endsWith('__dot')) return;
    setNode(id, live.has(id) ? 'live' : (ghost.has(id) ? dim : 'hidden'));
  });

  $('#desat').classList.toggle('on', !!b.desat);
  $('#warm').classList.toggle('on', !!b.warm);

  /* How long this beat's reveals run: an arc draws for 2.6s, a glyph stamps
     for ~1s, a plain cross-fade 0.85s. The repaint waits for whichever
     applies. Firing early repaints mid-animation and the stall comes back. */
  goAt = performance.now();
  const liveEls = [...live].map(id => EL[id]).filter(Boolean);
  quietMs = liveEls.some(el => el.classList.contains('arcpath')) ? 2800
          : [...live].some(id => TOGGLES[id]) ? 1700          // a graph is morphing
          : liveEls.some(el => el.querySelector && el.querySelector('.glyph')) ? 1400
          : 900;

  /* Fit to what THIS press reveals, not everything accumulated, so a
     deliberate push-in can still let earlier nodes fall out of frame. */
  const fitIds = (b.steps && b.steps[step] && b.steps[step].length) ? b.steps[step] : (b.show || []);
  /* cam: 'overview' means "frame everything", computed from the placed nodes
     and the window. Use it for the closing pull-back so the shot stays right
     as the deck grows instead of drifting out of date. */
  const authored = (b.stepCams && b.stepCams[step]) || b.cam;
  const shot = fitToContent(authored === 'overview' ? overviewShot() : authored, fitIds);
  flyTo(shot, first ? 1.5 : (sameBeat ? 0.72 : 1));
  chrome(b, i);
  pushPresenter(i);
  decodeFor(idsAhead(i, step));
}

function chrome(b, i) {
  const a = ACTS[b.act] || { n: '', c: '#d0a24e' };
  $('#actlabel').innerHTML = `<b>${a.n}</b>`;
  const n = lastStep(b);
  $('#counter').innerHTML = String(i + 1).padStart(2, '0') + ' / ' + BEATS.length +
    (n ? ' <span style="color:#d0a24e;letter-spacing:.3em;margin-left:8px">' +
      Array.from({ length: n + 1 }, (_, k) => k <= step ? '●' : '○').join('') + '</span>' : '');
  $('#voText').innerHTML = (b.stepVo && b.stepVo[step]) || b.vo || '';
  const nxv = (b.stepVo && b.stepVo[step + 1]) || (BEATS[i + 1] && ((BEATS[i + 1].stepVo && BEATS[i + 1].stepVo[0]) || BEATS[i + 1].vo));
  $('#nxtText').innerHTML = nxv ? `<span>NEXT →</span> ${nxv.replace(/<[^>]+>/g, '').slice(0, 190)}…` : '<span>END</span>';
  document.querySelectorAll('#bar .seg').forEach((s, k) => {
    const inAct = BEATS.filter(x => x.act === k), pos = inAct.indexOf(b);
    const done = b.act > k ? 1 : (b.act < k ? 0 : (pos + 1) / inAct.length);
    s.firstChild.style.width = (done * 100) + '%';
    s.firstChild.style.background = (ACTS[k] || {}).c || '#d0a24e';
  });
}

{
  const bar = $('#bar');
  ACTS.forEach(() => { const s = document.createElement('div'); s.className = 'seg'; s.innerHTML = '<i></i>'; bar.appendChild(s); });
}

/* ---------------- overview ----------------
   Derived from the placed nodes rather than hand-authored, so it stays
   correct as the deck grows. */
const BOUNDS = (() => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  NODES.forEach(n => {
    if (n.type === 'arc') {
      [n.a, n.b].forEach(p => {
        x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
        y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
      });
      return;
    }
    const hw = n.w / 2, hh = (n.h || n.w * 0.4) / 2;
    x0 = Math.min(x0, n.x - hw); x1 = Math.max(x1, n.x + hw);
    y0 = Math.min(y0, n.y - hh); y1 = Math.max(y1, n.y + hh);
  });
  if (!isFinite(x0)) return { x: W / 2, y: H / 2, w: W * 1.2, h: H * 1.2 };
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: (x1 - x0) * 1.14, h: (y1 - y0) * 1.14 };
})();

/* A tall canvas needs a wider cam.w than its own width to fit vertically, and
   the amount depends on the window, so it is resolved at press time. */
function overviewShot() {
  return { x: BOUNDS.x, y: BOUNDS.y, w: Math.max(BOUNDS.w, BOUNDS.h * (vw / vh)), rot: 0 };
}

let overview = false;
function toggleOverview() {
  overview = !overview;
  if (overview) {
    ALL_IDS.forEach(id => { if (!id.endsWith('__dot') && !TOGGLES[id]) setNode(id, 'recap'); });
    (BEATS[idx].show || []).forEach(id => setNode(id, 'live'));
    flyTo(overviewShot());
    $('#hint').textContent = 'overview · press O to return'; $('#hint').classList.add('on');
  } else { $('#hint').classList.remove('on'); go(idx); }
}

/* ---------------- controls ---------------- */
addEventListener('keydown', e => {
  const k = e.key;
  if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter') { e.preventDefault(); nav(1); }
  else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); nav(-1); }
  else if (k === 'Home') go(0);
  else if (k === 'End') go(BEATS.length - 1);
  else if (k === 'o' || k === 'O' || k === 'Escape') { e.preventDefault(); toggleOverview(); }
  else if (k === 'p' || k === 'P') { e.preventDefault(); openPresenter(); }
  else if (k === 'n' || k === 'N') $('#notes').classList.toggle('on');
  else if (k === '?' || k === '/') $('#help').classList.toggle('on');
  else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
  else if (k === 't' || k === 'T') startClock();
  else if (k === 'r' || k === 'R') { e.preventDefault(); forceRepaint(); }
  else if (k >= '1' && k <= '9') { const a = +k - 1; const j = BEATS.findIndex(b => b.act === a); if (j >= 0) go(j); }
});

/* free roam */
let drag = null;
stage.addEventListener('pointerdown', e => {
  world.classList.add('moving');
  drag = { x: e.clientX, y: e.clientY, cx: CAM.x, cy: CAM.y };
  stage.setPointerCapture(e.pointerId); document.body.classList.add('grabbing');
});
stage.addEventListener('pointermove', e => {
  if (!drag) return;
  tween = null; manual = true;
  $('#hint').textContent = 'manual view · press → to resume'; $('#hint').classList.add('on');
  const z = vw / CAM.w;
  CAM.x = drag.cx - (e.clientX - drag.x) / z;
  CAM.y = drag.cy - (e.clientY - drag.y) / z;
  apply();
});
addEventListener('pointerup', () => { drag = null; document.body.classList.remove('grabbing'); settle(); });
stage.addEventListener('wheel', e => {
  e.preventDefault(); tween = null; manual = true;
  $('#hint').textContent = 'manual view · press → to resume'; $('#hint').classList.add('on');
  const f = Math.exp(e.deltaY * 0.0016);
  const z = vw / CAM.w;
  const mx = CAM.x + (e.clientX - vw / 2) / z, my = CAM.y + (e.clientY - vh / 2) / z;
  CAM.w = Math.min(W * 5, Math.max(100, CAM.w * f));
  const z2 = vw / CAM.w;
  CAM.x = mx - (e.clientX - vw / 2) / z2; CAM.y = my - (e.clientY - vh / 2) / z2;
  apply();
}, { passive: false });

/* click a node to frame it */
nodeLayer.addEventListener('click', e => {
  const n = e.target.closest('.node'); if (!n || n.classList.contains('hidden')) return;
  const id = Object.keys(EL).find(k => EL[k] === n); if (!id) return;
  const def = NODES.find(x => x.id === id); if (!def) return;
  tween = null; flyTo({ x: def.x, y: def.y, w: def.w * 1.5, rot: 0 });
});

/* ---------------- presenter window ----------------
   A SEPARATE browser window. Chrome tab capture is compositor level, so this
   popup never appears in a shared tab. In Meet, share the deck TAB, never the
   screen, and your notes stay yours. */
let pres = null, presPoll = null;

const PRES_CSS = `
:root{--brass:#d0a24e;--jade:#3fe0c0;--paper:#f2e9d8;--dim:#8ba3b2}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:#060d13;color:#e9e0cf;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
body{display:flex;flex-direction:column;padding:22px 24px;gap:16px}
.top{display:flex;align-items:baseline;justify-content:space-between;
  border-bottom:1px solid rgba(208,162,78,.22);padding-bottom:12px;flex:none}
.act{font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.24em;
  text-transform:uppercase;color:var(--brass)}
.pos{font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.14em;color:#5f7383}
.clock{font-family:ui-monospace,Menlo,monospace;font-size:34px;color:var(--paper);
  letter-spacing:.04em;font-variant-numeric:tabular-nums;line-height:1;cursor:pointer;flex:none}
.clock small{display:block;font-size:9px;letter-spacing:.2em;color:#4d6070;margin-top:6px}
.vo{flex:1;overflow:auto;font-family:"Iowan Old Style",Palatino,Georgia,serif;
  font-size:25px;line-height:1.55;color:#f2e9d8;padding-right:6px}
.vo em{font-style:normal;color:var(--jade);background:rgba(63,224,192,.10);padding:0 4px;border-radius:2px}
.vo .cue{font-family:ui-monospace,Menlo,monospace;font-size:14px;letter-spacing:.06em;color:var(--brass);
  border:1px solid rgba(208,162,78,.38);border-radius:4px;padding:2px 8px;margin:0 4px;
  white-space:nowrap;vertical-align:.14em}
.nx{flex:none;border-top:1px solid rgba(255,255,255,.10);padding-top:14px;
  font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.65;color:#7e94a2;max-height:150px;overflow:auto}
.nx b{color:var(--brass);font-weight:500;letter-spacing:.14em}
.nav{flex:none;display:flex;gap:8px}
.nav button{flex:1;padding:13px;background:rgba(255,255,255,.05);color:#cfe0ea;cursor:pointer;
  border:1px solid rgba(255,255,255,.14);border-radius:7px;font-size:14px;font-family:inherit}
.nav button:hover{background:rgba(208,162,78,.16);border-color:rgba(208,162,78,.45)}
.hintbar{flex:none;font-family:ui-monospace,Menlo,monospace;font-size:9.5px;letter-spacing:.14em;
  color:#3f5260;text-transform:uppercase;text-align:center}
`;

function openPresenter() {
  if (pres && !pres.closed) { pres.focus(); return; }
  pres = window.open('', 'gc_presenter', 'width=640,height=940,menubar=no,toolbar=no,location=no');
  if (!pres) {
    $('#hint').textContent = 'popup blocked. Allow popups for this site, then press P';
    $('#hint').classList.add('on'); return;
  }
  pres.document.open();
  pres.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Presenter</title><style>${PRES_CSS}</style></head><body>
    <div class="top"><span class="act" id="pact"></span><span class="pos" id="ppos"></span></div>
    <div class="clock" id="pclock" title="click to start / reset">00:00<small>click to start · reset</small></div>
    <div class="vo" id="pvo"></div>
    <div class="nx" id="pnx"></div>
    <div class="nav"><button id="pprev">← back</button><button id="pnext">next →</button></div>
    <div class="hintbar">arrows work here and in the deck · share the DECK TAB only</div>
    </body></html>`);
  pres.document.close();

  const d = pres.document;
  d.getElementById('pnext').onclick = () => nav(1);
  d.getElementById('pprev').onclick = () => nav(-1);
  d.getElementById('pclock').onclick = startClock;
  pres.addEventListener('keydown', e => {
    const k = e.key;
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter') { e.preventDefault(); nav(1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); nav(-1); }
    else if (k === 't' || k === 'T') startClock();
    else if (k === 'r' || k === 'R') { e.preventDefault(); forceRepaint(); }
  });

  document.body.classList.add('presenting');
  $('#notes').classList.remove('on');
  pushPresenter(idx);

  clearInterval(presPoll);
  presPoll = setInterval(() => {
    if (!pres || pres.closed) { document.body.classList.remove('presenting'); clearInterval(presPoll); pres = null; }
  }, 700);
}

function pushPresenter(i) {
  if (!pres || pres.closed) return;
  const b = BEATS[i], d = pres.document; if (!d || !d.getElementById('pvo')) return;
  d.getElementById('pact').textContent = (ACTS[b.act] || {}).n || '';
  d.getElementById('pvo').innerHTML = (b.stepVo && b.stepVo[step]) || b.vo || '';
  const nxb = BEATS[i + 1];
  const nxv = (b.stepVo && b.stepVo[step + 1]) || (nxb && ((nxb.stepVo && nxb.stepVo[0]) || nxb.vo));
  const n = lastStep(b);
  d.getElementById('ppos').textContent = String(i + 1).padStart(2, '0') + ' / ' + BEATS.length +
    (n ? '   ·   reveal ' + (step + 1) + ' of ' + (n + 1) : '');
  d.getElementById('pnx').innerHTML = nxv ? '<b>NEXT →</b> ' + nxv.replace(/<[^>]+>/g, '') : '<b>END OF DECK</b>';
}

/* ---------------- presenter clock ---------------- */
let t0 = null;
function startClock() {
  const running = !t0;
  t0 = t0 ? null : Date.now();
  if (!t0) {
    $('#clock').textContent = '00:00';
    if (pres && !pres.closed) { const c = pres.document.getElementById('pclock'); if (c) c.innerHTML = '00:00<small>click to start · reset</small>'; }
  }
  /* the clock only lives in the notes panel and the presenter window, so
     without this the key looked dead */
  if (!(pres && !pres.closed)) {
    $('#hint').textContent = running ? 'timer started' : 'timer reset';
    $('#hint').classList.add('on');
    clearTimeout(startClock._t);
    startClock._t = setTimeout(() => $('#hint').classList.remove('on'), 1600);
  }
}
setInterval(() => {
  if (!t0) return;
  const s = Math.floor((Date.now() - t0) / 1000);
  const t = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  $('#clock').textContent = t;
  if (pres && !pres.closed) {
    const c = pres.document.getElementById('pclock');
    if (c) c.innerHTML = t + '<small>click to start · reset</small>';
  }
}, 500);

addEventListener('resize', () => { vw = innerWidth; vh = innerHeight; apply(); });

/* ---------------- go ---------------- */
apply();
go(0);
setTimeout(() => { $('#help').classList.add('on'); setTimeout(() => $('#help').classList.remove('on'), 3800); }, 900);

/* The harness drives the deck through this. Keep it stable. */
window.__deck = {
  go: (i, s) => go(i, { step: s || 0 }),
  next: () => nav(1), prev: () => nav(-1),
  step: () => step, at: () => idx,
  beats: () => BEATS.length,
  presses: () => BEATS.reduce((n, b) => n + (b.steps ? b.steps.length : 1), 0),
  cam: () => CAM, bounds: () => BOUNDS, overview: () => overviewShot(),
  repaint: () => forceRepaint(),
  presenter: () => openPresenter(),
  isPresenting: () => !!(pres && !pres.closed)
};
})();
