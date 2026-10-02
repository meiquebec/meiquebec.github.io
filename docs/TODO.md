# TODO — migration vers Kirigami

Dans l'ordre du plan de [MIGRATION.md §8](MIGRATION.md#8-plan-par-étapes).
Retirer une ligne dès qu'elle est faite.

## 1. Sécurité (console Google Cloud)

- [ ] Créer une clé **navigateur** : Maps JavaScript API seulement, référents `https://mouvei.quebec/*`, `http://127.0.0.1:*/*`, `http://localhost:*/*`
- [ ] Créer une clé **géocodage** : Geocoding API seulement
- [ ] Ajouter le secret `GEOCODING_API_KEY` au dépôt GitHub ; supprimer `GOOGLE_API_KEY` et `MAP_ID` une fois la phase 5 déployée
- [ ] Faire une rotation de l'ancienne clé (elle est publique depuis le début)

## 2. Bascule de l'outil

- [ ] `npm install -D @kirigami/cli` ; retirer `chokibasic`
- [ ] `kirigami.yaml` : `esbuild`/`sass`, `author`/`email`/`repo`, retirer la tâche `conf` commentée
- [ ] Déplacer `scripts/banner.txt` → `banner.txt`, utiliser les jetons de bannière
- [ ] Supprimer `scripts/build.js`, `watch.js`, `export.js`, `test.js`, `src/test/`, `src/_pxpros.json`
- [ ] Scripts npm : `serve`, `build`, `export` → `kiri …`
- [ ] Nouveau `.github/workflows/pages.yml` (kiribuild@v2 + recommit)
- [ ] Vider `dist/` ou y créer `.kirigami-export` avant le premier `kiri export`
- [ ] `.vscode/` : retirer Live Server et la tâche de watch, recommander l'extension Kirigami, Intelephense → `@kirigami/php-prepros`
- [ ] Vérifier que le rendu est identique (diff du HTML de `dist/` avant/après)

## 3. Gabarits et SEO

- [ ] Bloc `seo:` (organisation, adresse, `sameAs`) ; retirer OG/JSON-LD/`<title>` écrits à la main
- [ ] Retirer les `<link>`/`<script>` de `mei.core.min.*` du header
- [ ] Réseaux, boutique, formulaire dans `kirigami.yaml`
- [ ] Liens relatifs (`$relroot`) partout, gabarits et JS
- [ ] Footer : liens sociaux réparés, `rel="noopener noreferrer"`
- [ ] `_index.php` : `z` égaré, « Qui sommes-nous » (corriger dans le `.md` lors du passage à `_data/`)
- [ ] `<?= ?>` au lieu de `<? echo`

## 4. Images

- [ ] Rapatrier toutes les sources dans `assets/images/` (équipe, médias, comités, og, affiche de l'intro)
- [ ] Renommer les fichiers à espaces / extensions en majuscules
- [ ] `<img asset>` dans équipe (sans `style=`), médias, comités, affiche
- [ ] Supprimer les `.webp` faits à la main de `src/images/`, ajouter `src/images/` au `.gitignore` (ou décider de les commiter depuis la CI)
- [ ] Ménage de `assets/` (`.url`, `.eps`, `Thumbs.db`, `potato.png`, `videos/old/`…) ; `shemas/` → `schemas/`

## 5. Scripts et données

- [ ] `src/_data/` : un `.md` par bloc `<markdown>` actuel, YAML déplacés (`equipe/equipe.yaml`, `medias/articles.yaml`, `comites/comites.yaml`), annotations relatives à la page (modèle humainhumain)
- [ ] Convertir l'actuel `comites.json` en `_data/comites/comites.yaml` (saisie seulement) + `geocodage.json` (coordonnées existantes, clé = adresse normalisée) ; `comites.schema.json`
- [ ] `src/_plugins/comites.php` : clé d'adresse normalisée + `comites_actifs()`, partagés par le script et la page
- [ ] `scripts/preparer-comites.php` : géocodage une fois par adresse, photo Instagram une fois par compte ; entrée `scripts:` ; `secrets.local.yaml` au `.gitignore`
- [ ] Image de remplacement pour un comité sans logo ; supprimer les 26 `.webp` faits à la main de `src/images/comites/`
- [ ] Kirigami : publier K8 (php-mdhtml 0.1.6 → rebuild php-wasm), K7 (php-prepros) et K9 (Kiri Studio) — corrigés le 2026-10-02
- [ ] Galeries : `assets/galleries/` → `assets/images/galeries/`, plugin `{% galerie %}` qui lit les codes `{% img-asset %}` de son bloc et appelle `IMG::asset()` (grande + vignette) ; retirer `sharp`, `scripts/galleries.js`, `src/data/galleries.json`, `src/images/galeries/`
- [ ] Carte : config + comités dans `<carte-mei>` ; supprimer `secrets.js`, `install.js`, `postinstall`, `bt1oh97j7X.bin`, l'entrée `export.ignore`
- [ ] Sortir `mapstyle.js`/`cssdoc.js` dans `scripts/mei.mapstyle.js` (`head: false`)
- [ ] `_data/medias/articles.yaml` : dates ISO, formatées au rendu

## 6. Kiri Studio

- [ ] Bloc `studio:` (images, exclude `geocodage.json` et `instagram.json`, labels)
- [ ] Schémas complets en français : `equipe`, `articles`, `comites` (dates, URI, descriptions ; `comites` sans aucun champ calculé)
- [ ] Vérifier au premier déploiement que la CI arrive à récupérer une photo Instagram (sinon : build local pour les nouveaux comités)
- [ ] Galeries de l'accueil écrites dans les `.md` de `_data/accueil/` (titre + bloc `{% galerie %}`)
- [ ] Messages d'erreur des scripts compréhensibles par l'équipe
- [ ] Essai de bout en bout : ajouter un comité + une photo de galerie dans Studio → CI géocode, récupère le logo, recommit, déploie

## 7. Ménage

- [ ] `CLAUDE.md` (en français) à partir de `docs/template-CLAUDE.md` du monorepo
- [ ] Réécrire `README.md` (installation, `kiri serve`, scripts, secrets, Kiri Studio)
- [ ] Remonter [KIRIGAMI-MANQUES.md](KIRIGAMI-MANQUES.md) dans la feuille de route du monorepo
