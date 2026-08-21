/* ============================================================
   greatcircle new <dir>

   Scaffolds a deck folder. What lands on disk is your content and the
   briefing an agent needs, and nothing else: the engine stays in
   node_modules where `npm update` can reach it.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PKG } = require('./serve');

const PKG_JSON = name => JSON.stringify({
  name,
  private: true,
  version: '0.1.0',
  scripts: {
    dev: 'greatcircle dev',
    sheet: 'greatcircle sheet',
    verify: 'greatcircle verify',
    build: 'greatcircle build'
  },
  dependencies: { '@greatcircle/core': '^0.1.0' },
  devDependencies: { playwright: '^1.47.0' }
}, null, 2) + '\n';

const GITIGNORE = `node_modules/
shots/
*.html
`;

const README = name => `# ${name}

A talk built with [Great Circle](https://github.com/karlokilayko/greatcircle).

    npm install
    npm run dev          # http://localhost:8899

Then open \`scene.js\`. Two lists: NODES is what exists, BEATS is what happens.

    npm run sheet        # -> EDIT-SHEET.md, for a human to review by beat number
    npm run verify       # headless walk of every beat, screenshots with -- --shots
    npm run build        # -> one portable HTML file, which is what you present

\`AGENTS.md\` is the briefing for a coding agent. The intended first move is to
point one at this folder and tell it your talk.
`;

module.exports = function newDeck(dir) {
  if (!dir) { console.error('\n  usage: greatcircle new <dir>\n'); process.exit(1); }
  const dest = path.resolve(dir);
  const name = path.basename(dest);
  if (fs.existsSync(dest) && fs.readdirSync(dest).length) {
    console.error(`\n  ${dir} already exists and is not empty\n`); process.exit(1);
  }

  fs.mkdirSync(path.join(dest, 'img'), { recursive: true });
  const tpl = path.join(PKG, 'templates/blank');
  fs.copyFileSync(path.join(tpl, 'scene.js'), path.join(dest, 'scene.js'));
  fs.copyFileSync(path.join(tpl, 'AGENTS.md'), path.join(dest, 'AGENTS.md'));
  fs.writeFileSync(path.join(dest, 'package.json'), PKG_JSON(name));
  fs.writeFileSync(path.join(dest, '.gitignore'), GITIGNORE);
  fs.writeFileSync(path.join(dest, 'README.md'), README(name));
  fs.writeFileSync(path.join(dest, 'img/.gitkeep'), '');

  console.log(`
  created ${dir}/

    scene.js       your deck. Two lists. Start here
    AGENTS.md      the briefing for a coding agent
    img/           drop photos in here, referenced by basename

  next:

    cd ${dir}
    npm install
    npm run dev
`);
  return dest;
};
