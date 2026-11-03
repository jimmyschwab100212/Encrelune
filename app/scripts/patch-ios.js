// Réglages iOS appliqués après « cap add ios » : portrait sur iPhone, numéros de version, chiffrement déclaré (aucun).
const fs = require('fs'), path = require('path');
const A = path.resolve(__dirname, '..', 'ios', 'App');
const plist = path.join(A, 'App', 'Info.plist');
let m = fs.readFileSync(plist, 'utf8');
// iPhone : portrait uniquement
m = m.replace(/(<key>UISupportedInterfaceOrientations<\/key>\s*<array>)[\s\S]*?(<\/array>)/, '$1\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t$2');
if (!/ITSAppUsesNonExemptEncryption/.test(m)) m = m.replace(/<\/dict>\s*<\/plist>\s*$/, '\t<key>ITSAppUsesNonExemptEncryption</key>\n\t<false/>\n</dict>\n</plist>\n');
// micro + reconnaissance vocale (mode rituel : prononcer la formule)
for (const [k, v] of [['NSMicrophoneUsageDescription', 'Le micro sert uniquement à entendre la formule que tu prononces pour lancer un sort. Rien n\'est enregistré.'], ['NSSpeechRecognitionUsageDescription', 'La reconnaissance vocale sert à vérifier que tu as bien prononcé la formule du sort.']]) {
  if (!m.includes(k)) m = m.replace(/<\/dict>\s*<\/plist>\s*$/, `\t<key>${k}</key>\n\t<string>${v}</string>\n</dict>\n</plist>\n`);
}
fs.writeFileSync(plist, m);
const pbx = path.join(A, 'App.xcodeproj', 'project.pbxproj');
let p = fs.readFileSync(pbx, 'utf8');
const bn = process.env.BUILD_NUMBER || '1', vn = process.env.VERSION_NAME || '1.0';
p = p.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${bn};`).replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${vn};`);
fs.writeFileSync(pbx, p);
console.log(`iOS : portrait iPhone, chiffrement déclaré, version ${vn} (${bn})`);
