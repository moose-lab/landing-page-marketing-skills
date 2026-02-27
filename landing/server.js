import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const PUBLIC = path.resolve(__dirname, '../public');

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.css':  'text/css',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.svg':  'image/svg+xml',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  // API: serve manifest for a model
  if (req.url.startsWith('/api/demos/')) {
    const model = req.url.split('/api/demos/')[1];
    const filePath = path.join(PUBLIC, 'demos', `${model}-demos.json`);
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: `No demos found for model: ${model}` }));
    }
    return;
  }

  // Static file serving
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(PUBLIC, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Fall back to index.html for SPA routing
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(PUBLIC, 'index.html')).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Landing page running at http://localhost:${PORT}\n`);
});
