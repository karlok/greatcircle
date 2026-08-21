/* ============================================================
   The dev server, shared by `dev` and `verify`.

   Two roots, so a deck folder never contains a copy of the engine:

     /            -> runtime/index.html   (from the installed package)
     /_gc/*       -> the installed package
     /scene.js    -> <deck>/scene.js
     /theme.css   -> <deck>/theme.css     (optional override)
     /substrate.js-> <deck>/substrate.js  (optional, bring your own)
     /img/*       -> <deck>/img/*

   Deliberately dependency-free. Authoring should need a text editor and
   nothing else; the only package that ever needs installing is Playwright,
   and only for `verify`.
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PKG = path.resolve(__dirname, '..');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.md': 'text/markdown; charset=utf-8'
};

/* Resolve inside a root and refuse to escape it. */
function within(root, rel) {
  const p = path.resolve(root, '.' + path.posix.normalize('/' + rel));
  return p.startsWith(path.resolve(root)) ? p : null;
}

function send(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'          // a deck author refreshes constantly
    });
    res.end(buf);
  });
}

function createServer(deckDir) {
  const deck = path.resolve(deckDir);
  return http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);

    if (url === '/' || url === '/index.html') return send(res, path.join(PKG, 'runtime/index.html'));

    if (url.startsWith('/_gc/')) {
      const f = within(PKG, url.slice(4));
      return f ? send(res, f) : (res.writeHead(403), res.end('no'));
    }

    const f = within(deck, url);
    if (!f) { res.writeHead(403); return res.end('no'); }
    /* An absent theme.css or substrate.js is normal, not an error worth
       shouting about: answer with empty rather than a console 404. */
    if (!fs.existsSync(f) && /\/(theme\.css|substrate\.js)$/.test(url)) {
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(url)] });
      return res.end('');
    }
    send(res, f);
  });
}

/* Listen on `port`, or on an ephemeral port when port is 0. */
function listen(deckDir, port) {
  return new Promise((resolve, reject) => {
    const s = createServer(deckDir);
    s.on('error', reject);
    s.listen(port, '127.0.0.1', () => resolve({ server: s, port: s.address().port }));
  });
}

module.exports = { createServer, listen, PKG };
