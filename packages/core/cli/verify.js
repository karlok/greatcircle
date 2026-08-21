/* ============================================================
   greatcircle verify [deck] [--shots]

   Headless walk of every beat and every sub-step. Reports broken images,
   console errors, DOM count in the canvas, and whether the presenter window
   opens and stays in sync. With --shots it writes a PNG per press into
   <deck>/shots/, which is how an agent looks at what it just built.

   It starts its own server on an ephemeral port. The old version made you
   run one first and produced a confusing failure if you forgot, which was
   the single most common first-run problem.
   ============================================================ */
const path = require('path');
const fs = require('fs');
const { listen } = require('./serve');

module.exports = async function verify(deckDir, opts = {}) {
  const deck = path.resolve(deckDir);
  if (!fs.existsSync(path.join(deck, 'scene.js'))) {
    console.error(`\n  no scene.js in ${deckDir}\n`); process.exit(1);
  }

  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) {
    console.error('\n  verify needs Playwright:\n\n    npm i -D playwright\n    npx playwright install chromium\n');
    process.exit(1);
  }

  const EXEC = process.env.GC_CHROMIUM ||
    (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

  const { server, port } = await listen(deck, 0);
  const close = () => new Promise(r => server.close(r));

  let b;
  try { b = await chromium.launch(EXEC ? { executablePath: EXEC } : {}); }
  catch (e) {
    await close();
    console.error('\n  could not launch Chromium. Set GC_CHROMIUM to its path, or run\n' +
                  '  npx playwright install chromium\n\n  ' + e.message + '\n');
    process.exit(1);
  }

  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text()); });
  p.on('requestfailed', r => { if (!/favicon/.test(r.url())) errs.push('REQUEST FAILED ' + r.url()); });

  await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load', timeout: 15000 });
  await p.waitForTimeout(2500);

  if (!await p.evaluate(() => !!window.__deck)) {
    console.error('\n  the engine never started. Console said:\n    ' + (errs.join('\n    ') || '(nothing)') + '\n');
    await b.close(); await close(); process.exit(1);
  }

  const beats = await p.evaluate(() => window.__deck.beats());
  const presses = await p.evaluate(() => window.__deck.presses());

  const shotDir = path.join(deck, 'shots');
  if (opts.shots) { fs.rmSync(shotDir, { recursive: true, force: true }); fs.mkdirSync(shotDir, { recursive: true }); }

  await p.evaluate(() => window.__deck.go(0));
  await p.waitForTimeout(1800);
  let walked = 1, stalled = 0;
  if (opts.shots) await p.screenshot({ path: path.join(shotDir, '001-01.png') });

  /* Walk one press at a time and stop when the deck stops advancing, rather
     than pressing a fixed number of times and hoping. */
  for (let i = 0; i < presses + 20; i++) {
    const before = await p.evaluate(() => [window.__deck.at(), window.__deck.step()]);
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(opts.shots ? 1500 : 140);
    const after = await p.evaluate(() => [window.__deck.at(), window.__deck.step()]);
    if (before[0] === after[0] && before[1] === after[1]) { if (++stalled > 2) break; continue; }
    stalled = 0; walked++;
    if (opts.shots) {
      const nm = String(after[0] + 1).padStart(3, '0') + '-' + String(after[1] + 1).padStart(2, '0');
      await p.screenshot({ path: path.join(shotDir, nm + '.png') });
    }
  }

  await p.waitForTimeout(2000);
  const bad = await p.evaluate(() => [...document.images].filter(i => !i.complete || i.naturalWidth === 0).length);
  const dom = await p.evaluate(() => document.getElementById('world').querySelectorAll('*').length);

  let presLine;
  try {
    const [pop] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }), p.keyboard.press('p')]);
    await pop.waitForTimeout(1200);
    const ok = await pop.evaluate(() => !!document.getElementById('pvo'));
    await pop.keyboard.press('ArrowLeft');
    await pop.waitForTimeout(1400);
    const synced = await pop.evaluate(() => document.getElementById('ppos').innerText);
    presLine = ok ? 'opens + syncs -> ' + synced.replace(/\s+/g, ' ') : 'FAILED';
  } catch (e) { presLine = 'FAILED to open (' + e.message.split('\n')[0] + ')'; }

  await p.keyboard.press('r');
  await p.waitForTimeout(700);

  const uniq = [...new Set(errs)];
  console.log('');
  console.log('  deck:              ' + (path.relative(process.cwd(), deck) || path.basename(deck)));
  console.log('  beats:             ' + beats);
  console.log('  presses expected:  ' + presses);
  console.log('  presses walked:    ' + walked + (walked === presses ? '  ok' : '  <-- MISMATCH'));
  console.log('  broken images:     ' + bad + (bad ? '  <-- FIX' : ''));
  console.log('  DOM in canvas:     ' + dom + (dom > 800 ? '  <-- over budget, see AGENTS.md' : ''));
  console.log('  presenter window:  ' + presLine);
  console.log('  console errors:    ' + (uniq.length ? '\n    ' + uniq.join('\n    ') : 'none'));
  if (opts.shots) console.log('  screenshots:       ' + path.relative(process.cwd(), shotDir) + '/');
  console.log('');

  await b.close(); await close();
  return (bad || uniq.length || walked !== presses) ? 1 : 0;
};
