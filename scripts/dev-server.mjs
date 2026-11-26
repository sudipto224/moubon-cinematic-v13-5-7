/** MOUBON development / preview server. Node 18+, no npm dependencies needed. */
import {createServer} from 'node:http';
import {readFile, stat, watch} from 'node:fs/promises';
import {resolve, sep, extname, join} from 'node:path';

const isProductionPreview = process.argv.includes('--dist');
const base = resolve(process.cwd(), isProductionPreview ? 'dist' : '.');
const port = Number(process.env.PORT || 5173);
const mime = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.avif':'image/avif', '.webmanifest':'application/manifest+json', '.woff2':'font/woff2', '.mp3':'audio/mpeg', '.txt':'text/plain; charset=utf-8', '.xml':'application/xml; charset=utf-8',
  '.jpeg':'image/jpeg', '.webp':'image/webp', '.mp4':'video/mp4', '.wav':'audio/wav', '.json':'application/json; charset=utf-8',
};
const clients = new Set();
const reloadScript = `<script>\n/* Development-only live reload: no third-party dependency. */\nconst stream = new EventSource('/__moubon_live');\nstream.addEventListener('reload', () => window.location.reload());\n</script>`;

const server = createServer(async (req, res) => {
  let pathname;
  try {pathname = decodeURIComponent(new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`).pathname);}
  catch {res.writeHead(400); res.end('Malformed URL'); return;}

  if (pathname === '/__moubon_live' && !isProductionPreview) {
    res.writeHead(200, {
      'Content-Type':'text/event-stream; charset=utf-8',
      'Cache-Control':'no-cache',
      'Connection':'keep-alive',
    });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (pathname === '/') pathname = '/index.html';
  if (!isProductionPreview && (pathname.startsWith('/assets/') || ['/robots.txt','/sitemap.xml','/site.webmanifest'].includes(pathname))) pathname = '/public' + pathname;
  const absolute = resolve(base, '.' + pathname);
  if (absolute !== base && !absolute.startsWith(base + sep)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  try {
    const file = await stat(absolute);
    if (!file.isFile()) throw Error('Not a file');
    let data = await readFile(absolute);
    if (!isProductionPreview && pathname === '/index.html') {
      data = Buffer.from(data.toString('utf8').replace('</body>', `${reloadScript}\n</body>`));
    }
    res.writeHead(200, {
      'Content-Type':mime[extname(absolute)] || 'application/octet-stream',
      'Cache-Control':isProductionPreview ? 'public, max-age=60' : 'no-cache',
      'X-Content-Type-Options':'nosniff',
    });
    if (req.method === 'HEAD') res.end(); else res.end(data);
  } catch {
    res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
    res.end('404 — File not found');
  }
});

// Watch source directories, update open browser tabs on file changes.
// If a platform does not support recursive watchers, watch the immediate directory.
if (!isProductionPreview) {
  for (const folder of ['src','public/assets','.']) {
    (async () => {
      try {
        const watcher = watch(join(base, folder), {recursive:true});
        for await (const event of watcher) {
          if (folder === '.' && event.filename && !/^(index\.html|config\.js|package\.json)$/.test(event.filename)) continue;
          for (const client of clients) {
            try {client.write('event: reload\ndata: updated\n\n');} catch {clients.delete(client);}
          }
        }
      } catch (err) {
        console.warn(`Live reload watcher unavailable for ${folder}:`, err.message);
      }
    })();
  }
}
server.on('error', err => {
  console.error(err.code === 'EADDRINUSE' ? `Port ${port} is busy. Set PORT=5174 and retry.` : err);
  process.exit(1);
});
server.listen(port, '0.0.0.0', () => {
  console.log(`\n  MOUBON V13 — ${isProductionPreview ? 'Production preview' : 'Development'}\n`);
  console.log(`  Local: http://localhost:${port}/`);
  console.log(`  Press Ctrl+C to stop. ${isProductionPreview ? '' : 'Browser live reload enabled.'}\n`);
});
