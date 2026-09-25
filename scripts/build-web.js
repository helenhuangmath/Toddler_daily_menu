// Copies the web app into www/ for the native iPhone build (Capacitor).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
// The family gallery is loaded live from the published site (js/config.js), so it is not bundled.
const items = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'icons'];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const item of items) fs.cpSync(path.join(root, item), path.join(out, item), { recursive: true });
console.log('Web app copied to www/');
