// Minimal Node server: serves the static portfolio and the /api/contact endpoint.
// Used for local development (`npm start`) and for hosts like Render.
// On Vercel this file is not needed — Vercel serves index.html and api/contact.js directly.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import contact from './api/contact.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const server = http.createServer(async (req, res) => {
  req.on('error', (err) => console.error('Req error:', err.message));
  res.on('error', (err) => console.error('Res error:', err.message));

  try {
    const { pathname } = new URL(req.url, 'http://localhost');

    if (pathname === '/api/contact') {
      await contact(req, res);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end();
    }

    // Only the page itself and the assets folder are public.
    let rel;
    try {
      rel = decodeURIComponent(pathname);
    } catch {
      res.writeHead(400);
      return res.end();
    }
    if (rel === '/' || rel === '/index.html') rel = '/index.html';
    else if (!rel.startsWith('/assets/')) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }

    const file = path.join(ROOT, rel);
    if (!file.startsWith(path.join(ROOT, 'assets')) && rel !== '/index.html') {
      res.writeHead(403);
      return res.end();
    }

    try {
      const data = await readFile(file);
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': rel === '/index.html' ? 'no-cache' : 'public, max-age=604800',
      });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  } catch (err) {
    console.error('Unhandled server error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('Internal Server Error');
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

server.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
