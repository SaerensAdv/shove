// Builds www/index.html for the Capacitor app: one file, libraries bundled in, no CDN, no service worker.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
const r = await build({ entryPoints: ['native/app-entry.js'], bundle: true, format: 'iife', minify: true, target: 'es2020', write: false, logLevel: 'warning' });
const js = r.outputFiles[0].text.replace(/<\/script>/g, '<\\/script>');
let html = readFileSync('index.html', 'utf8');
const before = html.length;
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>\s*/, '')
  .replace('<script type="module" src="./main.js"></script>', () => `<script>${js}</script>`)
  .replace(/<link rel="manifest"[^>]*>/, '');
if (html.length - before < js.length * 0.9) throw new Error('bundle was not inlined: check the script tag in index.html');
mkdirSync('www/assets', { recursive: true });
writeFileSync('www/index.html', html);
copyFileSync('assets/icon.svg', 'www/assets/icon.svg');
console.log(`www/index.html ${(html.length / 1024) | 0} KB`);
