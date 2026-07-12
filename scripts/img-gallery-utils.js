const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'img');
const MANIFEST_PATH = path.join(IMG_DIR, 'manifest.json');
const GALLERY_JS_PATH = path.join(IMG_DIR, 'gallery.js');
const INDEX_PATH = path.join(ROOT, 'index.html');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif']);
const DEFAULT_BG_FILE = 'background.webp';
const NAME_OVERRIDES = {
    [DEFAULT_BG_FILE]: 'خلفية افتراضية',
    'background.jpg': 'خلفية افتراضية'
};

function displayName(filename) {
    if (NAME_OVERRIDES[filename]) return NAME_OVERRIDES[filename];
    const base = path.parse(filename).name.replace(/[-_]+/g, ' ').trim();
    return base.length > 48 ? `${base.slice(0, 45)}...` : base;
}

function collectImages() {
    if (!fs.existsSync(IMG_DIR)) {
        fs.mkdirSync(IMG_DIR, { recursive: true });
    }

    return fs.readdirSync(IMG_DIR)
        .filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return IMAGE_EXTENSIONS.has(ext);
        })
        .sort((a, b) => {
            if (a === DEFAULT_BG_FILE || a === 'background.jpg') return -1;
            if (b === DEFAULT_BG_FILE || b === 'background.jpg') return 1;
            return a.localeCompare(b, 'ar');
        })
        .map((file) => ({
            src: `img/${file}`,
            name: displayName(file)
        }));
}

function buildManifest() {
    return {
        updatedAt: new Date().toISOString(),
        images: collectImages()
    };
}

function writeGalleryJs(manifest) {
    const content = `// Auto-generated — do not edit manually. Run: node scripts/generate-img-manifest.js\nwindow.IMG_GALLERY = ${JSON.stringify(manifest, null, 4)};\n`;
    fs.writeFileSync(GALLERY_JS_PATH, content, 'utf8');
}

function updateIndexInlineGallery(manifest) {
    if (!fs.existsSync(INDEX_PATH)) return;

    const html = fs.readFileSync(INDEX_PATH, 'utf8');
    const start = '<!-- IMG_GALLERY_DATA -->';
    const end = '<!-- /IMG_GALLERY_DATA -->';
    const startIdx = html.indexOf(start);
    const endIdx = html.indexOf(end);

    if (startIdx === -1 || endIdx === -1) {
        console.warn('IMG_GALLERY markers not found in index.html — skipped inline update.');
        return;
    }

    const replacement = `${start}\n    <script id="img-gallery-data" type="application/json">${JSON.stringify(manifest)}</script>\n    <!-- /IMG_GALLERY_DATA -->`;
    const updated = html.slice(0, startIdx) + replacement + html.slice(endIdx + end.length);
    fs.writeFileSync(INDEX_PATH, updated, 'utf8');
}

function updateGalleryFiles(manifest) {
    const data = manifest || buildManifest();
    fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    writeGalleryJs(data);
    updateIndexInlineGallery(data);
    return data;
}

module.exports = {
    ROOT,
    IMG_DIR,
    MANIFEST_PATH,
    buildManifest,
    collectImages,
    updateGalleryFiles
};
