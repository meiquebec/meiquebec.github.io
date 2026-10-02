# Audit — mouvei.quebec, 2026-10-02

But de l'audit : recenser tout ce qui doit changer pour que le site soit
construit **entièrement par Kirigami** (plus de `chokibasic`, plus de
`sharp`, plus de scripts de build Node maison), et noter chaque défaut
trouvé en chemin.

Gravité : **H** haute (rendu cassé, sécurité), **M** moyenne (comportement
incorrect, dette qui bloque la migration), **B** basse (cosmétique, ménage).

---

## 1. Le site

- Site statique du Mouvement Étudiant Indépendantiste (MÉI), servi par
  GitHub Pages à `https://mouvei.quebec` (`src/CNAME`).
- 4 pages publiques : accueil (`src/_index.php`), `medias/`,
  `notre-equipe/`, `nos-comites/` ; plus `404.html` (écrite à la main,
  autonome).
- 2 pages-outils internes dans des dossiers préfixés `_` (jamais exportées) :
  `src/_mapstyle/` (génère le JSON de style Google Maps à partir des
  variables CSS) et `src/_marque/` (fiche de marque statique).
- Données : `notre-equipe/_equipe.yaml` (6 membres),
  `medias/_articles.yaml` (≈ 15 articles), `nos-comites/comites.json`
  (26 comités, dont 4 inactifs), `data/galleries.json` (généré, 3 galeries).
- Front-end : un bundle esbuild (`scripts/mei.core.js` → helpers, menu,
  modale, galeries Swiper, carte Google Maps des comités, outil de style de
  carte) et un bundle Sass (`styles/mei.core.scss`, 10 partiels).

## 2. Chaîne d'outils actuelle

| Besoin | Comment c'est fait aujourd'hui |
|---|---|
| Bundle JS | `chokibasic.buildJS()` depuis `scripts/build.js` / `scripts/watch.js` |
| Bundle CSS | `chokibasic.buildCSS()` |
| PHP → HTML | `chokibasic.buildPHP()` (qui délègue déjà au php-prepros de Kirigami) |
| Sitemap | `chokibasic.buildSitemap()` |
| Export vers `dist/` | `chokibasic.exportDist()` + `scripts/banner.txt` |
| Watch | `chokibasic.createWatchers()`, lancé par une tâche VS Code à l'ouverture du dossier |
| Aperçu | Live Server de VS Code sur `src/`, port 5504 |
| Galeries | `npm run galleries` → `scripts/galleries.js` (**sharp**) : `assets/galleries/<nom>/*` → `src/images/galeries/<nom>/NN.webp` (contain 1280×960) + `NN_tb.webp` (cover 240×320) + `src/data/galleries.json` |
| Géocodage des comités | `npm run comites` → `scripts/comites.js` : complète les `location` manquantes de `comites.json` via l'API Geocoding de Google, sur place |
| Clés de la carte | La CI écrit `{GOOGLE_API_KEY, MAP_ID}` → base64 → ROT13 → gzip (en-tête retiré) → `dist/bt1oh97j7X.bin` ; le navigateur le télécharge et le décode (`includes/secrets.js`) |
| Clés en local | `postinstall` → `scripts/install.js` télécharge le `bt1oh97j7X.bin` **de production** dans `src/` |
| Autres images (équipe, médias, comités, og, affiche de l'intro) | Converties à la main en `.webp` et commitées dans `src/images/` |
| Déploiement | `.github/workflows/pages.yml` : `npm install`, `npm run build`, `npm run export`, étape d'obfuscation, upload de `dist/` |

`kirigami.yaml` existe déjà mais **aucune commande ne l'utilise**, et il
n'est plus valide selon le schéma actuel (voir M1).

Dépendances : `chokibasic`, `sharp` (natif), `swiper`. `scripts/test.js`
importe `@kirigami/struct-walker`, qui n'est pas déclaré.

## 3. Constats

### Sécurité

- **H1 — La clé Google est publique dans les faits, et probablement sans
  restriction.** `bt1oh97j7X.bin` est publié à la racine du site et décodé
  dans le navigateur de chaque visiteur ; l'obfuscation (le même algorithme
  que la classe `OBF` de Kirigami, dont la doc dit qu'elle « ne protège pas
  les jetons d'API ») ne cache la clé qu'aux robots naïfs. La **même**
  `GOOGLE_API_KEY` sert à `scripts/comites.js` contre le *service web*
  Geocoding, qui n'accepte pas de restriction par référent HTTP — donc, pour
  que ce script fonctionne, la clé ne peut pas être verrouillée au domaine.
  Une clé publique capable d'appeler des API Google payantes depuis
  n'importe où est un risque de facturation. Correctif : deux clés — une
  **clé navigateur** (Maps JavaScript API seulement, restreinte par référent
  à `mouvei.quebec/*` et `localhost`) livrée au site, et une **clé de
  géocodage** (Geocoding API seulement, jamais livrée, gardée dans un
  fichier local non suivi / un secret de CI). Faire une rotation de la clé
  actuelle.
- **M2 — `npm install` télécharge depuis la production.** `postinstall`
  va chercher `https://mouvei.quebec/bt1oh97j7X.bin` sans vérification
  d'intégrité ; chaque clone et chaque install en CI dépend du site en
  ligne. Disparaît avec la migration (voir
  [SCRIPTS.md](SCRIPTS.md#3-clés-google)).

### Rendu cassé ou incorrect

- **H2 — L'URL `og:image` est cassée sous Kirigami.** `header.php` écrit
  `$baseurl . 'images/ogimage.webp'`. Kirigami retire la barre oblique
  finale de `baseurl` (et `kirigami.yaml` n'en a pas), ce qui donne
  `https://mouvei.quebecimages/ogimage.webp`. Le bloc `seo:` générerait
  cette balise correctement.
- **M3 — Le `@id` du JSON-LD est un exemple :** `"https://exemple.org/#organisation"`.
- **M4 — Liens sociaux du pied de page malformés :** le `<a>` Facebook n'est
  jamais fermé, donc les liens Instagram/YouTube sont imbriqués dedans (HTML
  invalide, cible du clic imprévisible). Faute dans la classe
  `reseaux-socaux-liens`.
- **M5 — Un `z` égaré** après `</div>` dans la section « Rêver le pays » de
  `src/_index.php` (affiché tel quel).
- **B1 — `<script src="…mei.core.min.js??###TIMESTAMP###">`** — `?` en double.
- **B2 — Balises courtes `<? echo $title; ?>`** dans `header.php` (deux
  fois). Ne fonctionne que si `short_open_tag` est actif ; utiliser `<?= ?>`.
- **B3 — `noopener noreferrer` écrits comme attributs nus** sur des `<a>`
  (accueil, comités, médias) : sans effet ; il faut
  `rel="noopener noreferrer"`.
- **B4 — Coquille :** « Qui somme-nous » → « Qui sommes-nous ».
- **M6 — La liste des comités affichait les comités inactifs.** La carte
  filtre sur `active`, la `<ul>` de la page non. Décision : seuls les
  comités actifs sont listés. Corrigé le 2026-10-02 dans
  `nos-comites/_index.php` (filtre sur `active`) ; à conserver lors de la
  migration (`actif`).

### Conventions (Kirigami / règles du projet)

- **M7 — Liens absolus partout** (`href="/medias/"`, `/images/intro.webp`,
  `/videos/intro.webm`, `/#`, et dans le JS : `/images/comites/…`,
  `/images/galeries/…`, `/bt1oh97j7X.bin`). Les sites Kirigami utilisent
  `$relroot` ; le domaine ne vit que dans `baseurl`. Les chemins du JS
  doivent être résolus à partir d'une base fournie par la page (voir
  [MIGRATION.md](MIGRATION.md#javascript-front-end)).
- **M8 — Style en ligne** dans `notre-equipe/_index.php`
  (`style="background-image: url(…)"`). Remplacer par un
  `<img asset … cover>` stylé par une classe.
- **B5 — `<head>` écrit à la main** : balises OG, titre, JSON-LD et les
  `<link>`/`<script>` sont tous écrits à la main. Le bloc `seo:` de Kirigami
  (META + LD) et l'injection automatique des sorties de tâches dans le
  `<head>` couvrent tout ça.
- **B6 — `src/_pxpros.json`** est un reste de l'outil `pxpros` d'avant
  Kirigami ; `.vscode/settings.json` pointe encore Intelephense vers
  `node_modules/pxpros/src`.

### Images et dette du pipeline

- **M9 — Les images générées sont commitées et leurs sources sont
  éparpillées.** `src/images/galeries/` (56 fichiers) est généré par
  `sharp` ; `equipe/`, `medias/`, `comites/`, `intro.webp`, `ogimage.webp`
  ont été convertis à la main. Les sources existent pour certaines
  (`assets/images/equipe/*.jpg`, quelques PNG de médias,
  `assets/images/ogimage.png`) et manquent pour d'autres (les 26 logos de
  comités, la plupart des vignettes de médias). Le pipeline d'images de
  Kirigami (`<img asset>`, `IMG::asset()`) régénère à la demande à partir
  de `assets/`.
- **B7 — Mauvais noms de fichiers sources :**
  `assets/images/equipe/catherine-lamoureux-schmidt .jpg` (espace final),
  `assets/galleries/rever-le-pays/65884833-… 2.JPG` (espace), extensions en
  casse mixte (`.JPG`, `.JPEG`).
- **B8 — Fichiers inutiles dans `assets/` :** un raccourci `.url`, un
  `.eps`, des `Thumbs.db`, `potato.png`, `image1.png`/`image2.jpg`,
  `videos/old/`. `assets/` pèse 103 Mo et `.git` 150 Mo.
- **B9 — `assets/shemas/`** (coquille) — les schémas sont bons et déjà
  branchés dans `yaml.schemas` ; renommer en `schemas/`.
- **M10 — Données et sortie mélangées dans un même fichier :**
  `nos-comites/comites.json` est à la fois la source éditée à la main et la
  sortie géocodée, réécrite sur place (triée, réindentée) par le script.
  Les éditeurs doivent écrire du JSON à la main.
- **M11 — `data/galleries.json` et `comites.json` sont téléchargés à
  l'exécution** (chemins cachés avec `atob()`), alors que chaque page est
  rendue par du PHP qui pourrait y intégrer les données directement. Une
  requête + un décodage par page vue pour des données connues au build.
- **B10 — L'outil de style de carte part en production.**
  `includes/mapstyle.js` (240 lignes) et `cssdoc.js` sont dans le bundle
  principal mais ne servent qu'à `_mapstyle/`. Une tâche esbuild séparée
  avec `head: false` règle ça.
- **B11 — `scripts/test.js`, `src/test/`** — fichiers de brouillon.
- **B12 — Le HTML généré est commité** (`src/index.html`,
  `medias/index.html`, …) alors que la CI reconstruit tout. Sans danger,
  mais ça pollue les diffs ; décider si on les garde (les gabarits Kirigami
  les recommitent depuis la CI) ou si on les ignore.

### Outillage

- **M1 — `kirigami.yaml` est invalide aujourd'hui :** les types de tâches
  `js` / `scss` s'appellent maintenant `esbuild` / `sass` ; la tâche
  `type: conf` commentée n'existe plus.
- **B13 — Configuration VS Code** bâtie autour de Live Server + une tâche de
  watch au démarrage. Kirigami remplace les deux par `kiri serve` ou
  l'extension VS Code Kirigami (serveur de dev dans la barre d'état).
- **B14 — `banner.txt`** code en dur les lignes date/auteur/dépôt que les
  jetons de bannière de Kirigami (`###AUTHOR###`, `###EMAIL###`,
  `###REPO###`) remplissent.
- **B15 — Pas de `CLAUDE.md`** — les dépôts de sites Kirigami en ont un,
  basé sur `docs/template-CLAUDE.md` du monorepo (à adapter : ce projet est
  en français).

## 4. Ce qui colle déjà à Kirigami

- La structure des pages (`_index.php` par dossier, en-têtes PHPDOC,
  fichiers de données chargés automatiquement avec
  `@articles _articles.yaml`, `@equipe _equipe.yaml`,
  `@comites comites.json`) est déjà le modèle de php-prepros.
- `prepros.before/after`, `format`, `includes` (le plugin Markdown
  `{% galerie %}`) sont déjà déclarés.
- Les blocs `<markdown>` servent déjà pour les sections de texte.
- Les schémas JSON des données YAML existent déjà — réutilisables tels
  quels par Kiri Studio (`studio:` lit `yaml.schemas` dans
  `.vscode/settings.json`).
- Les jetons `###TIMESTAMP###` / `###YEAR###` sont ceux de Kirigami.
