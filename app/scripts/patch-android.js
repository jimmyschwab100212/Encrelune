// Réglages Android appliqués après « cap add android » : portrait, numéro de version, pas de sauvegarde cloud.
const fs = require('fs'), path = require('path');
const A = path.resolve(__dirname, '..', 'android', 'app');
const man = path.join(A, 'src', 'main', 'AndroidManifest.xml');
let m = fs.readFileSync(man, 'utf8');
if (!/screenOrientation/.test(m)) m = m.replace(/<activity\b/, '<activity\n            android:screenOrientation="portrait"');
m = m.replace(/android:allowBackup="true"/, 'android:allowBackup="false"');
fs.writeFileSync(man, m);
for (const f of ['build.gradle', 'build.gradle.kts']) {
  const g = path.join(A, f); if (!fs.existsSync(g)) continue;
  let s = fs.readFileSync(g, 'utf8');
  const vc = process.env.VERSION_CODE || '1', vn = process.env.VERSION_NAME || '1.0';
  s = s.replace(/versionCode\s*=?\s*\d+/, `versionCode ${vc}`).replace(/versionName\s*=?\s*"[^"]*"/, `versionName "${vn}"`);
  fs.writeFileSync(g, s);
}
console.log('Android : portrait, allowBackup=false, version appliquée');
