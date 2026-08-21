/* ============================================================
   SUBSTRATE : world-map
   The origin deck's chart, demoted from core to a plugin.

   Real coastlines, a 1-degree graticule, a rhumb web from two roses, a
   compass rose and a starfield above the horizon.

   Requires substrates/land-path.js, which defines LAND_PATH: a single path
   already projected into seam-centred space with the polygons split at the
   cut using Sutherland-Hodgman clipping. It is generated, never hand-edited.

   opt.seam : longitude of the projection cut, default 60. 60E runs through
   empty central Asia, which puts Asia left, the Americas centre and Europe
   right. Change it and land-path.js must be regenerated to match.
   ============================================================ */
GC.substrate('world-map', (world, api) => {
  const { svgLayer, W, H, opt, SVGNS } = api;
  const stars = opt.stars !== false;

  /* ---- graticule + rhumb web + compass rose ---- */
  const gr = svgLayer('graticule');
  {
    let fine = '', ten = '', thirty = '';
    for (let lon = -180; lon <= 180; lon += 1) {
      const x = (lon + 180) / 360 * W;
      const d = `M${x} 0V${H}`;
      if (lon % 30 === 0) thirty += d; else if (lon % 10 === 0) ten += d; else fine += d;
    }
    for (let lat = -90; lat <= 90; lat += 1) {
      const y = (90 - lat) / 180 * H;
      const d = `M0 ${y}H${W}`;
      if (lat % 30 === 0) thirty += d; else if (lat % 10 === 0) ten += d; else fine += d;
    }
    const mk = (d, w, o) => {
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', d); p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#2d6c88'); p.setAttribute('stroke-width', w);
      p.setAttribute('opacity', o);
      return p;
    };
    gr.appendChild(mk(fine, 1.5, .045));
    gr.appendChild(mk(ten, 3.5, .10));
    gr.appendChild(mk(thirty, 6.5, .16));

    (opt.roses || [[17500, 5000], [3500, 6500]]).forEach(([cx, cy]) => {
      let d = '';
      for (let i = 0; i < 32; i++) {
        const a = i * Math.PI / 16, R = 15500;
        d += `M${cx} ${cy}L${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R}`;
      }
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', d); p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#2d6c88'); p.setAttribute('stroke-width', 2.5);
      p.setAttribute('opacity', .07);
      gr.appendChild(p);
    });

    const rose = document.createElementNS(SVGNS, 'g');
    const RX = opt.roseAt ? opt.roseAt[0] : 23000;
    const RY = opt.roseAt ? opt.roseAt[1] : 8250;
    const R = 850;
    let star = '';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, b = a + Math.PI / 8;
      star += `M${RX} ${RY}L${RX + Math.cos(a) * R} ${RY + Math.sin(a) * R}L${RX + Math.cos(b) * R * .3} ${RY + Math.sin(b) * R * .3}Z`;
    }
    const sp = document.createElementNS(SVGNS, 'path');
    sp.setAttribute('d', star); sp.setAttribute('fill', 'none');
    sp.setAttribute('stroke', '#d0a24e'); sp.setAttribute('stroke-width', 6.5);
    sp.setAttribute('opacity', .22);
    rose.appendChild(sp);
    [R * 1.16, R * 1.34].forEach((r, i) => {
      const c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', RX); c.setAttribute('cy', RY); c.setAttribute('r', r);
      c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#d0a24e');
      c.setAttribute('stroke-width', i ? 4 : 6.5); c.setAttribute('opacity', .18);
      rose.appendChild(c);
    });
    const nt = document.createElementNS(SVGNS, 'text');
    nt.setAttribute('x', RX); nt.setAttribute('y', RY - R * 1.62);
    nt.setAttribute('text-anchor', 'middle');
    nt.setAttribute('fill', '#d0a24e'); nt.setAttribute('opacity', .3);
    nt.setAttribute('font-size', 375); nt.setAttribute('font-family', 'ui-serif,Georgia,serif');
    nt.textContent = 'N';
    rose.appendChild(nt);
    gr.appendChild(rose);
  }
  world.appendChild(gr);

  /* ---- land ----
     One path instead of a clipPath wrapping two <use> copies of a 300KB path,
     which is a lot less for the compositor to chew. */
  const landSvg = svgLayer('land');
  if (typeof LAND_PATH === 'undefined') {
    console.warn('world-map substrate: LAND_PATH is missing. Load substrates/land-path.js before this file.');
  } else {
    const fill = document.createElementNS(SVGNS, 'path');
    fill.setAttribute('d', LAND_PATH);
    fill.setAttribute('fill', '#1b4a63'); fill.setAttribute('opacity', .30);
    fill.setAttribute('fill-rule', 'evenodd');
    const line = document.createElementNS(SVGNS, 'path');
    line.setAttribute('d', LAND_PATH);
    line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#4d94b4');
    line.setAttribute('stroke-width', .55); line.setAttribute('opacity', .55);
    landSvg.appendChild(fill); landSvg.appendChild(line);
    landSvg.style.opacity = .5;
    world.appendChild(landSvg);
  }

  /* ---- starfield ----
     900 absolutely-positioned divs used to live here, each one a paint record
     inside the transformed layer. Same stars, now five <path> elements grouped
     by brightness. */
  if (stars) {
    const sky = svgLayer('sky', 'overflow:visible');
    let rnd = 987654321;
    const rand = () => (rnd = (rnd * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const TIERS = 5, buckets = Array.from({ length: TIERS }, () => '');
    for (let i = 0; i < 900; i++) {
      const y = -14500 + rand() * 15250;
      const x = 4500 + rand() * 15500;
      const r = (3 + Math.pow(rand(), 3) * 28) / 2;
      const o = (.10 + rand() * .55) * (y < 0 ? 1 : .12);
      const t = Math.min(TIERS - 1, Math.floor(o / .65 * TIERS));
      buckets[t] += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(r * 2).toFixed(1)},0a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-r * 2).toFixed(1)},0`;
    }
    buckets.forEach((d, t) => {
      if (!d) return;
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', d); p.setAttribute('fill', '#cfe3ee');
      p.setAttribute('opacity', (.08 + (t + .5) / TIERS * .58).toFixed(3));
      sky.appendChild(p);
    });
    const defs = document.createElementNS(SVGNS, 'defs');
    const rg = document.createElementNS(SVGNS, 'radialGradient');
    rg.setAttribute('id', 'SKYGLOW');
    [['0%', 'rgba(63,224,192,.075)'], ['55%', 'rgba(63,224,192,.030)'], ['100%', 'rgba(63,224,192,0)']]
      .forEach(([off, col]) => {
        const st = document.createElementNS(SVGNS, 'stop');
        st.setAttribute('offset', off); st.setAttribute('stop-color', col);
        rg.appendChild(st);
      });
    defs.appendChild(rg); sky.appendChild(defs);
    const glow = document.createElementNS(SVGNS, 'ellipse');
    glow.setAttribute('cx', 12250); glow.setAttribute('cy', -6500);
    glow.setAttribute('rx', 7500); glow.setAttribute('ry', 8500);
    glow.setAttribute('fill', 'url(#SKYGLOW)');
    sky.insertBefore(glow, sky.firstChild);
    world.appendChild(sky);
  }

  return {
    onZoom: t => {
      if (landSvg) landSvg.style.opacity = (.20 + .55 * t).toFixed(3);
      gr.style.opacity = (.35 + .65 * t).toFixed(3);
    }
  };
});
