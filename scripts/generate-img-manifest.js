const { updateGalleryFiles, buildManifest, collectImages } = require('./img-gallery-utils');

const manifest = updateGalleryFiles();

console.log(`Updated gallery with ${manifest.images.length} image(s):`);
manifest.images.forEach((item) => console.log(`  - ${item.src}`));
