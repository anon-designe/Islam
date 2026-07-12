const { spawn, spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NODE = process.execPath;
const PORT = process.env.PORT || 8080;

function runScript(name, scriptFile) {
    const child = spawn(NODE, [path.join(__dirname, scriptFile)], {
        cwd: ROOT,
        stdio: 'inherit'
    });

    child.on('exit', (code) => {
        if (code && code !== 0) {
            console.error(`[${name}] توقف unexpectedly (code ${code})`);
        }
    });

    return child;
}

console.log('');
console.log('  Islam Time — تشغيل تلقائي');
console.log('  ─────────────────────────');
console.log(`  الموقع:  http://localhost:${PORT}`);
console.log('  أي تغيير في مجلد img/ → يتحدث تلقائياً');
console.log('  Ctrl+C للإيقاف');
console.log('');

spawnSync(NODE, [path.join(__dirname, 'generate-img-manifest.js')], {
    cwd: ROOT,
    stdio: 'inherit'
});

const watch = runScript('watch', 'watch-img-gallery.js');
const server = runScript('server', 'dev-server.js');

setTimeout(() => {
    const url = `http://localhost:${PORT}`;
    if (process.platform === 'win32') {
        spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' });
    } else if (process.platform === 'darwin') {
        spawn('open', [url], { detached: true, stdio: 'ignore' });
    } else {
        spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
    }
}, 1200);

function shutdown() {
    watch.kill();
    server.kill();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
