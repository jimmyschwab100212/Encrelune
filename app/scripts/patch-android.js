// Réglages Android appliqués après « cap add android » : portrait, numéro de version, pas de sauvegarde cloud.
const fs = require('fs'), path = require('path');
const A = path.resolve(__dirname, '..', 'android', 'app');
const man = path.join(A, 'src', 'main', 'AndroidManifest.xml');
let m = fs.readFileSync(man, 'utf8');
if (!/screenOrientation/.test(m)) m = m.replace(/<activity\b/, '<activity\n            android:screenOrientation="portrait"');
m = m.replace(/android:allowBackup="true"/, 'android:allowBackup="false"');
for (const perm of ['POST_NOTIFICATIONS', 'RECEIVE_BOOT_COMPLETED', 'RECORD_AUDIO']) {
  if (!m.includes('android.permission.' + perm)) m = m.replace(/<application\b/, `<uses-permission android:name="android.permission.${perm}" />\n    <application`);
}
// Android 11+ : l'appli doit déclarer qu'elle cherche un service de reconnaissance vocale
if (!m.includes('android.speech.RecognitionService')) m = m.replace(/<application\b/, `<queries>\n        <intent>\n            <action android:name="android.speech.RecognitionService" />\n        </intent>\n    </queries>\n    <application`);
fs.writeFileSync(man, m);
for (const f of ['build.gradle', 'build.gradle.kts']) {
  const g = path.join(A, f); if (!fs.existsSync(g)) continue;
  let s = fs.readFileSync(g, 'utf8');
  const vc = process.env.VERSION_CODE || '1', vn = process.env.VERSION_NAME || '1.0';
  s = s.replace(/versionCode\s*=?\s*\d+/, `versionCode ${vc}`).replace(/versionName\s*=?\s*"[^"]*"/, `versionName "${vn}"`);
  fs.writeFileSync(g, s);
}
console.log('Android : portrait, allowBackup=false, version appliquée');

// icône de notification (croissant de lune, monochrome : Android la teinte lui-même)
const dr = path.join(A, 'src', 'main', 'res', 'drawable');
fs.mkdirSync(dr, { recursive: true });
fs.writeFileSync(path.join(dr, 'ic_stat_encrelune.xml'), `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
  <path android:fillColor="#FFFFFFFF" android:pathData="M12.5,2.5C7.5,3 4,7.2 4,12c0,5 4,9 9,9c3.2,0 6,-1.7 7.6,-4.2c-0.9,0.3 -1.8,0.5 -2.8,0.5c-4.4,0 -8,-3.6 -8,-8C9.8,7 10.8,4.4 12.5,2.5z"/>
</vector>
`);
console.log('Android : icône de notification ajoutée');
