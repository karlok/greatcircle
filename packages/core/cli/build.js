/* ============================================================
   greatcircle build [deck] [-o out.html]

   Reads the runtime, the engine, the substrate the scene asks for, the scene,
   the theme, and every image in the deck's img/. Inlines the lot and writes
   one portable HTML file. No server, no network, nothing to upload alongside
   it. That single file is what you present from.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PKG } = require('./serve');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
               '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

module.exports = function build(deckDir, opts = {}) {
  const deck = path.resolve(deckDir);
  const die = m => { console.error('\n  BUILD FAILED: ' + m + '\n'); process.exit(1); };

  const scenePath = path.join(deck, 'scene.js');
  if (!fs.existsSync(scenePath)) die(`no scene.js in ${deckDir}`);
  const scene = fs.readFileSync(scenePath, 'utf8');

  let html = fs.readFileSync(path.join(PKG, 'runtime/index.html'), 'utf8');

  /* Read the substrate name out of the source rather than executing the
     scene, so a scene with a syntax error fails in one obvious place. */
  const m = scene.match(/^\s*const\s+SUBSTRATE\s*=\s*['"]([\w-]+)['"]/m);
  const sub = m ? m[1] : 'grid';

  const files = ['engine/gc.js', 'engine/primitives.js',
                 'substrates/grid.js', 'substrates/blueprint.js'];
  let own = null;
  if (sub === 'world-map') files.push('substrates/land-path.js', 'substrates/world-map.js');
  else if (!['grid', 'blueprint'].includes(sub)) {
    if (fs.existsSync(path.join(PKG, `substrates/${sub}.js`))) files.push(`substrates/${sub}.js`);
    else if (fs.existsSync(path.join(deck, 'substrate.js'))) own = path.join(deck, 'substrate.js');
    else die(`substrate "${sub}" is not in the package and there is no substrate.js in ${deckDir}`);
  }

  let js = '';
  for (const f of files) js += `\n/* ===== ${f} ===== */\n` + fs.readFileSync(path.join(PKG, f), 'utf8') + '\n';
  if (own) js += `\n/* ===== substrate.js ===== */\n` + fs.readFileSync(own, 'utf8') + '\n';
  js += `\n/* ===== scene.js ===== */\n` + scene + '\n';
  js += `\n/* ===== engine/app.js ===== */\n` + fs.readFileSync(path.join(PKG, 'engine/app.js'), 'utf8') + '\n';

  /* ---- images ---- */
  const imgDir = path.join(deck, 'img');
  let imgs = [];
  if (fs.existsSync(imgDir)) {
    imgs = fs.readdirSync(imgDir).filter(f => MIME[path.extname(f).toLowerCase()]).sort();
  }
  const pairs = imgs.map(f => {
    const ext = path.extname(f).toLowerCase();
    const b64 = fs.readFileSync(path.join(imgDir, f)).toString('base64');
    return JSON.stringify(path.basename(f, ext)) + ':' + JSON.stringify(`data:${MIME[ext]};base64,${b64}`);
  });

  const needle = 'const IMG = f => `img/${f}.jpg`;';
  if (!js.includes(needle)) die('could not find the IMG() helper in engine/primitives.js');
  js = js.replace(needle,
    'const IMGMAP={' + pairs.join(',') + '};\n' +
    'const IMG = f => IMGMAP[f] || (console.warn("no image named " + f), "");');

  /* ---- styles ---- */
  let css = fs.readFileSync(path.join(PKG, 'runtime/theme.css'), 'utf8');
  const ownCss = path.join(deck, 'theme.css');
  if (fs.existsSync(ownCss)) css += '\n/* ===== deck theme.css ===== */\n' + fs.readFileSync(ownCss, 'utf8');
  html = html.replace(/<link rel="stylesheet" href="\/_gc\/runtime\/theme\.css">[\s\S]*?<link rel="stylesheet" href="\/theme\.css">/,
    '<style>\n' + css + '\n</style>');

  /* ---- scripts ---- */
  const start = html.indexOf('<script src="/_gc/engine/gc.js">');
  const end = html.indexOf('</body>');
  if (start < 0 || end < 0) die('could not find the script block in runtime/index.html');
  html = html.slice(0, start) + '<script>' + js + '</script>\n' + html.slice(end);

  /* Title the file after the deck, so a shared tab is not called "index". */
  const t = scene.match(/class="lede"[^>]*>([^<]{2,90})</);
  if (t) html = html.replace(/<title>[^<]*<\/title>/, `<title>${t[1].trim()}</title>`);

  const out = path.resolve(opts.out || path.join(deck, path.basename(deck) + '.html'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  const mb = fs.statSync(out).size / 1e6;
  console.log(`\n  built ${path.relative(process.cwd(), out)}  —  ${mb.toFixed(2)} MB, substrate "${sub}", ${imgs.length} images inlined\n`);

  const have = new Set(imgs.map(f => path.basename(f, path.extname(f))));
  const want = new Set([...scene.matchAll(/\bplate\(\s*'[^']+'\s*,[^,]+,[^,]+,[^,]+,\s*'([\w-]+)'/g)].map(x => x[1]));
  const missing = [...want].filter(w => !have.has(w));
  if (missing.length) console.log('  WARNING — referenced but not in img/: ' + missing.join(', ') + '\n');
  return out;
};
