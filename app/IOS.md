# Encrelune — publication iPhone (App Store)

Le dépôt construit déjà l'application iOS sur un Mac du cloud GitHub (workflow `.github/workflows/ios.yml`, Xcode 26, iOS 15 minimum).
Sans clés Apple, il vérifie seulement que l'application se compile (simulateur). Avec les clés ci-dessous, il signe, archive et envoie le build à TestFlight.

## Ce qu'il faut côté Apple (à faire par Jimmy)
1. **Compte Apple Developer Program** (≈ 99 €/an) : developer.apple.com/programs. « Individuel / entrepreneur individuel » suffit (pas de D-U-N-S) ; le nom affiché sur la fiche sera alors le nom du compte.
2. **App Store Connect** (appstoreconnect.apple.com) → Apps → « + » → Nouvelle app : plateforme iOS, nom « Encrelune », langue principale français, **identifiant de bundle `com.jimmyschwab.encrelune`** (à créer dans Certificates, Identifiers & Profiles → Identifiers si absent), SKU `encrelune`.
3. **Achat intégré** (Monétisation → Achats intégrés) : type **Non consommable**, identifiant produit **`grand_grimoire`** (exactement), prix 4,99 €, nom « Le Grand Grimoire », capture d'écran de l'achat à fournir pour la validation Apple.
4. **Clé d'API App Store Connect** : Utilisateurs et accès → Intégrations → Clés App Store Connect → « + », rôle **App Manager** ; télécharger le fichier `.p8` (une seule fois), noter l'**ID de la clé** et l'**Issuer ID**. Noter aussi l'**ID d'équipe** (Team ID) : developer.apple.com → Compte → Appartenance.

## Secrets GitHub à créer (dépôt Encrelune → Settings → Secrets and variables → Actions)
| Secret | Valeur |
|---|---|
| `APPSTORE_KEY_ID` | ID de la clé |
| `APPSTORE_ISSUER_ID` | Issuer ID |
| `APPSTORE_KEY_P8_B64` | contenu du `.p8` encodé en base64 (`base64 -i AuthKey_XXXX.p8` ; sur Windows : `certutil -encode`) |
| `APPLE_TEAM_ID` | Team ID |

Ensuite, chaque push (ou « Run workflow ») envoie un build à TestFlight (compter 10-30 min de traitement côté Apple).

## Tester sur l'iPhone
App **TestFlight** (App Store) → accepter l'invitation (App Store Connect → TestFlight → testeurs internes). Pour tester l'achat sans payer : App Store Connect → Utilisateurs et accès → Sandbox → testeur ; se connecter avec ce compte dans Réglages → App Store → Compte Sandbox.

## Avant la soumission à l'examen Apple
Fiche (description, captures iPhone 6,9″ et 6,5″, mots-clés), URL de confidentialité (https://jimmyschwab100212.github.io/Encrelune/privacy.html), questionnaire « confidentialité de l'app » (aucune donnée collectée), classification d'âge, contact jimmysch.app@gmail.com, achat intégré joint à la version.
