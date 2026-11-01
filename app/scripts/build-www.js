// Copie index.html et uniquement les médias qu'il référence, du dépôt (racine) vers app/www.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..'), out = path.resolve(__dirname, '..', 'www');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const media = /\.(mp4|webm|jpg|jpeg|png|webp|mp3|ogg|m4a|svg|woff2?)$/i;
const files = fs.readdirSync(root).filter(f => media.test(f) && html.includes(f));
let page = html;
if (process.env.ENC_TEST === '1') { // APK de test : garde l'interrupteur de test (paliers ouverts, aperçus), sans achat
  page = page.replace('<script>', '<script>window.ENC_TEST=true;</script>\n<script>');
  console.log('www : build de TEST (paliers ouverts, interrupteur visible)');
}
fs.writeFileSync(path.join(out, 'index.html'), page);
let total = 0;
for (const f of files) { fs.copyFileSync(path.join(root, f), path.join(out, f)); total += fs.statSync(path.join(root, f)).size; }
console.log(`www : index.html + ${files.length} médias (${(total / 1048576).toFixed(1)} Mo)`);
