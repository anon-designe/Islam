const fs = require('fs');
const path = require('path');
const { updateGalleryFiles, buildManifest, IMG_DIR } = require('./img-gallery-utils');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif']);
let timer = null;

function shouldRefresh(filename) {
    if (!filename) return true;
    if (filename === 'manifest.json' || filename === 'gallery.js') return false;
    const ext = path.extname(filename).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
}

function regenerate(reason) {
    clearTimeout(timer);
    timer = setTimeout(() => {
        try {
            const manifest = updateGalleryFiles();
            console.log(`[watch] ${reason || 'Updated'} → ${manifest.images.length} image(s)`);
        } catch (error) {
            console.error('[watch] Error:', error.message);
        }
    }, 400);
}

if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR, { recursive: true });
}

regenerate('Initial scan');
console.log(`Watching ${IMG_DIR}`);
console.log('Add, rename, or delete images — gallery files update automatically.');
console.log('Press Ctrl+C to stop.');

fs.watch(IMG_DIR, { recursive: true }, (_event, filename) => {
    if (shouldRefresh(filename)) {
        regenerate(filename ? `Changed: ${filename}` : 'Folder changed');
    }
});
