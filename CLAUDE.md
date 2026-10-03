# CLAUDE.md

Contexte et conventions de travail pour Claude et les contributeurs.
Gardé court exprès : le détail vit dans `docs/`.

| Fichier | Contenu |
|---|---|
| [docs/SCRIPTS.md](docs/SCRIPTS.md) | Comités (géocodage, logos Instagram), galeries, vignettes des médias, clés Google : comment ça marche |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Architecture, `kirigami.yaml`, ce qui a remplacé chokibasic, Kiri Studio |
| [docs/AUDIT.md](docs/AUDIT.md) | État du projet avant la migration (2026-10-02) et défauts trouvés |
| [docs/KIRIGAMI-MANQUES.md](docs/KIRIGAMI-MANQUES.md) | Ce qui manquait à Kirigami pour ce site, et ce qui a été corrigé |
| [docs/TODO.md](docs/TODO.md) | Ce qui reste à faire |

---

## Ce qu'est ce projet

- **Nom :** Mouvement Étudiant Indépendantiste (MÉI), `kirigami.project`.
- **Genre :** vrai site, édité par l'équipe du MÉI dans
  [Kiri Studio](https://github.com/php-kirigami/kiri-studio) (pas de terminal,
  pas de Git pour eux).
- **Dépôt :** `meiquebec/meiquebec.github.io` (`origin`, branche `main`).
- **En ligne :** GitHub Pages, <https://mouvei.quebec> (`src/CNAME`), construit en
  CI par [`php-kirigami/kiribuild`](https://github.com/php-kirigami/kiribuild).
- **Construit avec [Kirigami](https://github.com/php-kirigami/kirigami)** :
  des gabarits de page PHP compilés en HTML statique par PHP 8.5 dans
  WebAssembly, sous Node. Un seul `kirigami.yaml` à la racine pilote tout.
- Dépôt public : jamais de secret dans un fichier suivi (voir « Clés »).

---

## Conventions

- **Tout est en français dans ce dépôt** : code, commentaires, documentation,
  textes du site, messages de commit. Exception voulue par le mainteneur à la
  règle habituelle des projets Kirigami (2026-10-02).
- **Node `>= 24.0.0`**, ESM (`"type": "module"`) pour tout JS ajouté.
- **Indentation 4 espaces** (PHP, HTML, SCSS) ; le JS existant utilise des tabulations.
- **Rester léger** : pas de dépendance quand `node:`, une classe PHP de
  Kirigami ou ~30 lignes suffisent. Aucune dépendance native (`sharp` est parti).
- **HTML mince** : l'équipe écrit le moins de HTML possible. Du Markdown dans
  `src/_data/`, une balise (`{% galerie %}`), du YAML ; pas de `style=""` (des
  classes), des `em`/`rem` jamais des `px`, `::before`/`::after` plutôt que du
  balisage en plus.
- **Liens relatifs** (`$relroot`), jamais le domaine : il ne vit que dans
  `baseurl`.
- **Poste de dev sous Windows** (PowerShell) : attention aux séparateurs de chemin.
- **Rien dans les `_index.php` que de la structure** : tout texte est dans un
  `.md` de `src/_data/<page>/`, que Kiri Studio peut éditer.

---

## Structure

```
.
├── kirigami.yaml            # la seule configuration (seo, scripts, tasks, studio…)
├── banner.txt               # bannière des fichiers exportés
├── package.json             # @kirigami/cli, swiper
├── secrets.local.yaml       # NON SUIVI : clés Google locales (voir « Clés »)
├── assets/
│   ├── images/              # = image.source : TOUTES les images d'origine
│   │   ├── galeries/<dossier>/   # une galerie = un dossier
│   │   ├── equipe/  medias/  comites/instagram/   # ces deux derniers : générés (commités)
│   ├── schemas/             # JSON Schemas des YAML (Studio et VS Code)
│   └── fonts/  cartes/
├── scripts/
│   ├── preparer-comites.php # géocodage + logos Instagram, avant le build
│   └── preparer-medias.php  # vignette (og:image) de chaque nouvel article
└── src/                     # = kirigami.root
    ├── _templates/          # header.php / footer.php
    ├── _plugins/            # {% galerie %} ; comites.php, fonctions.php
    ├── _data/               # TOUT le contenu éditable, jamais exporté
    │   ├── accueil/*.md     #   textes et galeries de l'accueil
    │   ├── equipe/  medias/  comites/   # YAML + caches générés
    ├── _index.php  medias/  notre-equipe/  nos-comites/   # pages (structure seulement)
    ├── _mapstyle/  _marque/ # outils internes, jamais exportés
    ├── scripts/  styles/    # JS (esbuild) et Sass : mei.core.*, mei.mapstyle.*
    └── images/              # = image.dest : GÉNÉRÉ par IMG::asset, jamais édité
```

- `_nom.php` est une page ; elle compile en `nom.html` à côté.
- `src/_data/<page>/*.md`, `.yaml` : les données, chargées par annotation
  (`@quisommesnous _data/accueil/qui-sommes-nous.md`, chemin relatif à la page).
- `kiri export` copie `src/` dans `dist/` sans PHP, Sass, `.map`, fichiers `_`/`.`.

## Commandes

Via `@kirigami/cli` : `npm run serve` (serveur local, `http://127.0.0.1:4321`),
`npm run build`, `npm run export`, `npm run comites` (`kiri run preparer-comites`).
Dans VS Code, l'extension `php-kirigami.kirigami-vscode` fait la même chose.

---

## Ce qui est automatique (ne pas refaire à la main)

Détails et raisons dans [docs/SCRIPTS.md](docs/SCRIPTS.md).

- **Galeries** : `{% galerie <dossier> %}` liste `assets/images/galeries/<dossier>/`
  et génère grande image + vignette (`IMG::asset`). Rien à lister.
- **Comités** : `comites.yaml` ne contient que nom, adresse, Instagram, `actif`.
  Les coordonnées (`geocodage.json`, **une fois par adresse**) et les logos
  (photo de profil Instagram, **une fois par compte**) sont calculés par
  `scripts/preparer-comites.php` et commités. Ne jamais les saisir à la main
  dans le YAML.
- **Médias** : `articles.yaml` ne contient pas d'image ; la vignette de chaque
  nouveau lien est cherchée une fois (`preparer-medias.php`, `vignettes.json`).
- **Images** : `src/images/` est généré par `<img asset>` / `IMG::asset()` à partir
  de `assets/images/`. Ne jamais y déposer une image à la main.
- **Kiri Studio** : les scripts sont relancés dès qu'un fichier surveillé change
  (`scripts[].watch`), et les fichiers qu'ils calculent partent avec la
  publication (`studio.publish`). Les caches sont exclus de l'éditeur
  (`studio.exclude`).

## Clés Google

Jamais dans un fichier suivi. `comites_cles()` (`src/_plugins/comites.php`)
les prend dans `secrets.local.yaml` s'il existe (la CI l'écrit à partir du
secret `GOOGLE_API_KEY`), sinon dans le `bt1oh97j7X.bin` que chaque
déploiement publie (le mécanisme de l'ancien `postinstall`). L'aperçu de Kiri
Studio marche ainsi sans rien saisir. **Ne pas toucher aux clés** : le
mainteneur n'a pas accès à la console Google pour les changer. Voir
[docs/SCRIPTS.md §4](docs/SCRIPTS.md#4-clés-google).

## Déploiement

`.github/workflows/pages.yml` : à chaque push sur `main`, écrit les clés,
lance `kiribuild@v2` (`kiri export`), republie le `.bin`, recommite ce que le
build a régénéré (caches des comités, images) puis publie `dist/` sur GitHub
Pages. Garder `@kirigami/cli` en `devDependencies`.

## Fichiers qui peuvent être commités

- `src/**/index.html` rendus, `src/images/`, les caches (`geocodage.json`,
  `instagram.json`, `vignettes.json`) et les images qu'ils référencent
  (`assets/images/comites/instagram/`, `assets/images/medias/`).
- Un `?###TIMESTAMP###` littéral dans le HTML est normal (seul l'export le remplace).
- `secrets.local.yaml`, `.cache.db`, `.node.db`, `.cookie.txt`, `dist/` : jamais.
- Un `src/test/` local (brouillon) est ignoré par git.

## Référence

Lire les README installés plutôt que deviner une API :

| Sujet | Où |
|---|---|
| `kirigami.yaml`, tâches, export, fonctions Sass, `studio:` | `node_modules/@kirigami/kirigami/README.md` |
| Commandes `kiri` | `node_modules/@kirigami/cli/README.md` |
| Pages, annotations, balises, classes PHP (`MD`, `YAML`, `IMG`, `CACHE`, `CURL`, `SCRAPER`, `OBF`…) | `node_modules/@kirigami/php-prepros/README.md` |
| Guides | <https://php-kirigami.github.io> |

## Licence

MIT (voir `LICENSE`). Les paquets Kirigami sont en GPL-3.0-or-later (PHP-WASM
GPL-2.0-or-later), ce qui ne change pas la licence d'un site construit avec eux.
