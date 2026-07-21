#!/usr/bin/env node

import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const ROOT = path.resolve(option('--dir', 'dist'));
const PORT = Number(option('--port', process.env.PORT || '8888'));
const HOST = option('--host', '127.0.0.1');

const MIME = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8']
]);

async function resolveRequest(pathname) {
  const decoded = decodeURIComponent(pathname).replace(/\\/g, '/');
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidates = [relative];
  if (relative.endsWith('/')) candidates.push(`${relative}index.html`);
  else if (!path.extname(relative)) candidates.push(`${relative}.html`, path.join(relative, 'index.html'));

  for (const candidate of candidates) {
    const resolved = path.resolve(ROOT, candidate);
    if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) continue;
    try {
      const stat = await fs.stat(resolved);
      if (stat.isFile()) return resolved;
    } catch {}
  }
  return null;
}

const server = http.createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url || '/', `http://${request.headers.host || HOST}`).pathname;
    const file = await resolveRequest(pathname);
    if (!file) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': MIME.get(path.extname(file).toLowerCase()) || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(await fs.readFile(file));
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`Server error: ${error.message}`);
  }
});

server.listen(PORT, HOST, () => console.log(`Serving ${ROOT} at http://${HOST}:${PORT}`));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
