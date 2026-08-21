/* ============================================================
   SUBSTRATE : grid
   The default. A near-invisible rule grid so the eye has something to
   parallax against during a flight, and nothing else.

   The substrate is scenery. Do not let it become the framework.
   ============================================================ */
GC.substrate('grid', (world, api) => {
  const { svgLayer, W, H, opt } = api;
  const step = opt.step || 1000;
  const g = svgLayer('grid');

  let fine = '', major = '';
  for (let x = 0; x <= W; x += step) {
    const d = `M${x} ${-H}V${H * 2}`;
    if (x % (step * 5)) fine += d; else major += d;
  }
  for (let y = -H; y <= H * 2; y += step) {
    const d = `M0 ${y}H${W}`;
    if (y % (step * 5)) fine += d; else major += d;
  }

  const mk = (d, w, o) => {
    const p = document.createElementNS(api.SVGNS, 'path');
    p.setAttribute('d', d); p.setAttribute('fill', 'none');
    p.setAttribute('stroke', opt.color || '#2d6c88');
    p.setAttribute('stroke-width', w); p.setAttribute('opacity', o);
    return p;
  };
  g.appendChild(mk(fine, 1.5, .040));
  g.appendChild(mk(major, 3.5, .085));
  world.appendChild(g);

  /* Fade the grid out as the camera pushes in, so a close shot is clean. */
  return { onZoom: t => { g.style.opacity = (.25 + .75 * t).toFixed(3); } };
});
