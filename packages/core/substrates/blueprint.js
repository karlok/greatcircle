/* ============================================================
   SUBSTRATE : blueprint
   Engineering-drawing paper. A fine grid, a heavier index grid, corner
   registration marks and a drawing border. Good for system design, where
   the regions are boxes rather than places.
   ============================================================ */
GC.substrate('blueprint', (world, api) => {
  const { svgLayer, W, H, opt, SVGNS } = api;
  const step = opt.step || 500;
  const ink = opt.color || '#2f6e8c';
  const g = svgLayer('blueprint');

  const path = (d, w, o, col) => {
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', d); p.setAttribute('fill', 'none');
    p.setAttribute('stroke', col || ink);
    p.setAttribute('stroke-width', w); p.setAttribute('opacity', o);
    return p;
  };

  let fine = '', index = '';
  for (let x = 0; x <= W; x += step) {
    const d = `M${x} 0V${H}`;
    if (x % (step * 4)) fine += d; else index += d;
  }
  for (let y = 0; y <= H; y += step) {
    const d = `M0 ${y}H${W}`;
    if (y % (step * 4)) fine += d; else index += d;
  }
  g.appendChild(path(fine, 1.2, .05));
  g.appendChild(path(index, 2.6, .10));

  /* drawing border, inset */
  const M = step * 0.8;
  g.appendChild(path(`M${M} ${M}H${W - M}V${H - M}H${M}Z`, 6, .22, '#d0a24e'));

  /* corner registration marks */
  const tick = step * 0.55;
  [[M, M, 1, 1], [W - M, M, -1, 1], [M, H - M, 1, -1], [W - M, H - M, -1, -1]]
    .forEach(([x, y, sx, sy]) => {
      g.appendChild(path(`M${x} ${y}h${tick * sx}M${x} ${y}v${tick * sy}`, 8, .35, '#d0a24e'));
    });

  world.appendChild(g);
  return { onZoom: t => { g.style.opacity = (.35 + .65 * t).toFixed(3); } };
});
