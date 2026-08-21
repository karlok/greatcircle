#!/usr/bin/env node
/* ============================================================
   greatcircle

     new <dir>            scaffold a deck folder
     dev [deck]           serve it, live. Refresh to see edits
     sheet [deck]         -> EDIT-SHEET.md, regenerated from source
     verify [deck]        headless walk of every beat and step
     build [deck]         -> one portable HTML file

   [deck] defaults to the current directory.
   ============================================================ */
const path = require('path');

const argv = process.argv.slice(2);
const cmd = argv[0];
const flags = {};
const rest = [];
for (let i = 1; i < argv.length; i++) {
  const a = argv[i];
  if (a === '-o' || a === '--out') flags.out = argv[++i];
  else if (a === '--port') flags.port = +argv[++i];
  else if (a.startsWith('--')) flags[a.slice(2)] = true;
  else rest.push(a);
}
const deck = rest[0] || '.';

const usage = () => {
  console.log(`
  greatcircle <command>

    new <dir>          scaffold a deck folder
    dev [deck]         serve it at http://localhost:8899 (--port)
    sheet [deck]       write EDIT-SHEET.md from source
    verify [deck]      headless walk of every beat (--shots)
    build [deck]       one portable HTML file (-o out.html)

  [deck] defaults to the current directory.
`);
};

(async () => {
  switch (cmd) {
    case 'new':
      require('./new')(rest[0]);
      break;

    case 'dev': {
      const { listen } = require('./serve');
      const port = flags.port || 8899;
      const got = await listen(deck, port).catch(e => {
        if (e.code === 'EADDRINUSE') {
          console.error(`\n  port ${port} is busy. Try: greatcircle dev ${deck} --port ${port + 1}\n`);
          process.exit(1);
        }
        throw e;
      });
      console.log(`\n  ${path.resolve(deck)}\n  http://localhost:${got.port}\n\n  edit scene.js and refresh. ctrl-c to stop.\n`);
      break;
    }

    case 'sheet':
      require('./sheet')(deck);
      break;

    case 'verify':
      process.exit(await require('./verify')(deck, { shots: !!flags.shots }));
      break;

    case 'build':
      require('./build')(deck, { out: flags.out });
      break;

    case undefined:
    case '-h':
    case '--help':
      usage();
      break;

    default:
      console.error(`\n  unknown command: ${cmd}`);
      usage();
      process.exit(1);
  }
})();
