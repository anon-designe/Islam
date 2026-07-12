const http = require('http');
const fs = require('fs');
const path = require('path');
const { ROOT, buildManifest } = require('./img-gallery-utils');

const PORT = Number(process.env.PORT) || 8080;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.avif': 'image/avif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

function sendFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, data) => {
        if (error) {
            res.writeHead(error.code === 'ENOENT' ? 404 : 500);
            res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
            return;
        }

        res.writeHead(200, { 'Content-Type': type });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === '/img/manifest.json') {
        const manifest = buildManifest();
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        res.end(JSON.stringify(manifest));
        return;
    }

    if (pathname === '/') pathname = '/index.html';

    const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(ROOT, safePath);

    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    sendFile(res, filePath);
});

server.listen(PORT, () => {
    console.log(`Islam Time dev server: http://localhost:${PORT}`);
    console.log('Gallery reads img/ folder live — add/rename/delete then refresh library.');
});
