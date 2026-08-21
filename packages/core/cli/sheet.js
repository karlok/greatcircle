/* ============================================================
   Generate EDIT-SHEET.md: a human-readable projection of the whole deck.

       greatcircle sheet [deck]

   This is how a non-coder reviews the thing. Every beat, every press, the
   voice-over and what appears, in order, by beat number.

   REGENERATE FROM SOURCE ON EVERY PASS. Generating the sheet once and then
   hand-patching it afterwards caused a real incident: the reviewer read a
   stale sheet full of content that had already been cut. The sheet is only
   trustworthy because it is disposable.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const { PKG } = require('./serve');

module.exports = function sheet(deckDir) {
const deck = path.resolve(deckDir);
const scenePath = path.join(deck, 'scene.js');
if (!fs.existsSync(scenePath)) {
  console.error(`\n  no scene.js in ${deckDir}\n`); process.exit(1);
}

/* Run primitives then the scene in a sandbox. No DOM is touched by either. */
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(PKG, 'engine/primitives.js'), 'utf8')
  .replace(/if \(typeof module[\s\S]*$/, ''), ctx, { filename: 'primitives.js' });
vm.runInContext(fs.readFileSync(scenePath, 'utf8') +
  '\n;this.__x={NODES,BEATS,ACTS};', ctx, { filename: scenePath });
const { NODES, BEATS, ACTS } = ctx.__x;

const byId = {};
NODES.forEach(n => byId[n.id] = n);

/* A node may publish a second id that flips it to another state rather than
   revealing an element of its own (graph({to:...})). The sheet has to name
   the flip, because to a reviewer it is a press like any other. */
const TOGGLES = {};
NODES.forEach(n => { if (n.toId) TOGGLES[n.toId] = n.id; });

const strip = h => h
  .replace(/<span class="sm"[^>]*>/g, '\n    LABEL: ')
  .replace(/<span class="sub"[^>]*>/g, '\n    SUB:   ')
  .replace(/<span class="aside"[^>]*>/g, '\n    ASIDE: ')
  .replace(/<div class="cap">/g, '\n    CAPTION: ')
  .replace(/<div class="gcap">/g, '\n    CAPTION: ')
  .replace(/<span class="ctitle">/g, '\n    TITLE:   ')
  .replace(/<span class="rlabel">/g, '\n    REGION: ')
  .replace(/<span class="cl[^"]*">/g, '\n    | ')
  .replace(/<small>/g, '\n    SUB:   ')
  .replace(/<li>/g, '\n    • ')
  .replace(/<br\s*\/?>/g, ' / ')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&rarr;/g, '->').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#8202;/g, '').replace(/&#8242;/g, "'").replace(/&#8243;/g, '"')
  .replace(/[ \t]+/g, ' ')
  .split('\n').map(s => s.trimEnd()).filter(s => s.trim()).join('\n').trim();

const title = (() => {
  const t = (byId['t.title'] || {}).html || '';
  const m = t.match(/class="lede"[^>]*>([^<]+)</);
  return m ? m[1].trim() : deckDir;
})();

let out = `# ${title} : edit sheet

REGENERATED FROM THE LIVE DECK. Every edit already applied is in here, and
every beat that has been restructured is shown as it now actually plays.

Some beats are built from several key presses. Those are broken out below as
"press 1 of 3" and so on: each press has its own voice-over line and its own
reveal, and each one is a separate → on the night.

Every beat, in order. Edit the text in place; leave the \`[id]\` markers alone.
Delete nothing you want kept. Add a line starting with \`>>\` anywhere for a note
back to the author (e.g. \`>> swap this photo\`, \`>> cut this beat\`, \`>> hold longer\`).

Beat numbers match the counter in the bottom-right corner of the screen.

${BEATS.length} beats · ${BEATS.reduce((n, b) => n + (b.steps ? b.steps.length : 1), 0)} presses · ${NODES.length} nodes

---
`;

BEATS.forEach((b, i) => {
  out += `\n## ${String(i + 1).padStart(2, '0')} / ${BEATS.length}  ·  ${(ACTS[b.act] || {}).n || '?'}\n\n`;

  const steps = b.steps || null;
  const shownBy = s => [...(b.show || [])].concat(...(steps ? steps.slice(0, s + 1) : []));

  const canvasFor = ids => {
    if (!ids.length) return '    (camera move only)\n';
    let o = '';
    ids.forEach(id => {
      if (TOGGLES[id]) {
        const host = byId[TOGGLES[id]] || {};
        const cap = (host.html || '').match(/class="cb">([^<]*)</);
        o += `    [${id}]  (the diagram [${TOGGLES[id]}] animates to its second state)\n`;
        if (cap) o += `      NOW READS: ${cap[1]}\n`;
        return;
      }
      const n = byId[id];
      if (!n) { o += `    [${id}]  (UNKNOWN ID)\n`; return; }
      if (n.type === 'arc') { o += `    [${id}]  (route line drawing on)\n`; return; }
      const im = (n.html || '').match(/img\/([\w-]+)\.\w+/);
      o += `    [${id}]${im ? '   photo: ' + im[1] : ''}\n`;
      const t = strip(n.html || '');
      if (t) o += t.split('\n').map(l => '      ' + l.trim()).join('\n') + '\n';
    });
    return o;
  };

  if (!steps) {
    out += `VOICE OVER:\n  ${strip(b.vo || '(none)')}\n\n`;
    out += `ON CANVAS:\n` + canvasFor(b.show || []).replace(/^ {4}/gm, '  ');
  } else {
    out += `THIS BEAT IS ${steps.length} PRESSES. Each one is a separate → on the night.\n`;
    steps.forEach((_, s) => {
      out += `\n  ── press ${s + 1} of ${steps.length} ──\n\n`;
      out += `  VOICE OVER:\n    ${strip((b.stepVo && b.stepVo[s]) || b.vo || '(none)')}\n\n`;
      out += s === 0
        ? `  ON CANVAS:\n` + canvasFor(shownBy(0))
        : `  APPEARS NOW:\n` + canvasFor(steps[s] || []);
    });
  }
  out += `\n---\n`;
});

const dest = path.join(deck, 'EDIT-SHEET.md');
fs.writeFileSync(dest, out);
console.log(`  written ${path.relative(process.cwd(), dest)} — ${out.length} chars, ${BEATS.length} beats`);

/* Referential integrity, while we are already holding both lists. */
const known = new Set(NODES.map(n => n.id).concat(Object.keys(TOGGLES)));
const bad = [];
BEATS.forEach((b, i) => {
  [...(b.show || []), ...(b.steps || []).flat()].forEach(id => {
    if (!known.has(id)) bad.push(`beat ${i + 1}: no node "${id}"`);
  });
});
const used = new Set(BEATS.flatMap(b => [...(b.show || []), ...(b.steps || []).flat()]));
const orphans = [...known].filter(id => !used.has(id));
if (bad.length) console.log('\n  BROKEN IDS:\n    ' + bad.join('\n    '));
if (orphans.length) console.log('\n  defined but never shown: ' + orphans.join(', '));
if (bad.length) process.exit(1);
return dest;
};
