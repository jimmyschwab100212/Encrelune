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

// Micro (mode rituel) : le plugin @capgo/capacitor-speech-recognition passe le son en mode enregistrement
// (.playAndRecord + .measurement ou .spokenAudio) et ne le rétablit jamais : après la formule, le son du jeu
// devient faible, sort parfois par l'écouteur et change de timbre. On mémorise le mode audio avant le micro
// et on le rétablit à la fin de chaque écoute ; pendant l'écoute, le son reste sur le haut-parleur.
const SR = path.resolve(__dirname, '..', 'node_modules', '@capgo', 'capacitor-speech-recognition', 'ios', 'Sources', 'SpeechRecognitionPlugin');
function patchSwift(file, edits) {
  const f = path.join(SR, file);
  let s = fs.readFileSync(f, 'utf8');
  if (s.includes('EncAudioRestore')) return;
  for (const [re, rep, needed] of edits) {
    if (!re.test(s)) { if (needed) throw new Error(`patch-ios : motif introuvable dans ${file} : ${re}`); console.warn(`patch-ios : motif facultatif absent dans ${file} : ${re}`); continue; }
    s = s.replace(re, rep);
  }
  fs.writeFileSync(f, s);
}
patchSwift('SpeechRecognitionPlugin.swift', [
  [/(private func configureAudioSession\(\) throws \{)/, '$1\n        EncAudioRestore.save()', true],
  [/(private func finalizeFinishedSession\([^)]*\) \{\s*clearLegacyRecognitionResources\(\))/, '$1\n        EncAudioRestore.restore()', true],
  [/\s*$/, `

// Encrelune : rétablit le mode audio d'avant le micro (sinon le son du jeu reste faible / dans l'écouteur).
enum EncAudioRestore {
    static var saved: (AVAudioSession.Category, AVAudioSession.Mode, AVAudioSession.CategoryOptions)?
    static func save() {
        guard saved == nil else { return }
        let s = AVAudioSession.sharedInstance()
        saved = (s.category, s.mode, s.categoryOptions)
    }
    static func restore() {
        let s = AVAudioSession.sharedInstance()
        var target = saved ?? (.playback, .default, [])
        saved = nil
        if target.0 == .playAndRecord || target.0 == .record { target = (.playback, .default, []) }
        do {
            try s.setCategory(target.0, mode: target.1, options: target.2)
            try s.setActive(true)
        } catch {
            try? s.setCategory(.playback, mode: .default, options: [])
            try? s.setActive(true)
        }
    }
}
`, true]
]);
patchSwift('SpeechAnalyzerRecognitionSession.swift', [
  [/(private func configureAudioSession\(\) throws \{)/, '$1\n        EncAudioRestore.save()', true],
  [/options: \[\.duckOthers, \.allowBluetoothHFP\]/, 'options: [.duckOthers, .allowBluetoothHFP, .defaultToSpeaker]', false]
]);
console.log('iOS : micro du mode rituel — mode audio rétabli après l\'écoute');
