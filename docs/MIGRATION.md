# Migration vers Kirigami

Cible : `npx kiri serve` en développement, `kiri export` en CI (action
`php-kirigami/kiribuild@v2`), **aucun** script Node maison, aucune
dépendance native. Tout ce qui se faisait dans `scripts/*.js` devient soit
de la configuration Kirigami, soit un script PHP `scripts/<nom>.php` exécuté
par Kirigami (voir [SCRIPTS.md](SCRIPTS.md)), soit du rendu au build.

---

## 1. Correspondance chokibasic → Kirigami

| Aujourd'hui | Avec Kirigami |
|---|---|
| `scripts/build.js` (`buildJS/CSS/PHP/Sitemap`) | `kiri build` — tâches `esbuild` + `sass` + tâche `prepros` implicite (rendu + `sitemap.xml`) |
| `scripts/watch.js` + tâche VS Code au démarrage | `kiri serve` (watch + rechargement à chaud) ou l'extension VS Code Kirigami |
| Live Server (port 5504) | serveur de `kiri serve` (`http://127.0.0.1:4321`) |
| `scripts/export.js` (`exportDist`) | `kiri export` → `dist/` (exclut PHP, Sass, maps, fichiers `_`/`.`) |
| `scripts/banner.txt` | `kirigami.banner` avec les jetons `###AUTHOR###`, `###EMAIL###`, `###REPO###`, `###DATE###` |
| `src/_pxpros.json` | bloc `kirigami:` de `kirigami.yaml` (supprimer le fichier) |
| `scripts/galleries.js` (sharp) | bloc `{% galerie %}` de codes `{% img-asset %}`, chaque image rendue au build par `IMG::asset()` (voir [SCRIPTS.md §2](SCRIPTS.md#2-galeries)) |
| `scripts/comites.js` (en place, JSON) + logos de comités faits à la main | `scripts/preparer-comites.php`, `trigger: before-build` : caches de géocodage (une fois par adresse) et de photos Instagram (une fois par compte) ; le YAML ne contient que la saisie de l'équipe (voir [SCRIPTS.md §1](SCRIPTS.md#1-comités--géocodage-et-logos)) |
| `scripts/install.js` + étape « Obfuscation » de la CI | supprimés — la clé navigateur est rendue dans la page (voir [SCRIPTS.md §3](SCRIPTS.md#3-clés-de-la-carte)) |
| Images converties à la main dans `src/images/` | sources dans `assets/images/`, sorties générées par `<img asset>` / `IMG::asset()` |
| `<head>` écrit à la main (OG, JSON-LD, `<link>`, `<script>`) | bloc `seo:` (META + LD) + injection automatique des sorties de tâches |
| `scripts/test.js`, `src/test/` | supprimés |

## 2. Arborescence cible

```text
kirigami.yaml
package.json            devDependencies: @kirigami/cli ; dependencies: swiper
banner.txt              (déplacé depuis scripts/, qui ne contient plus que du PHP)
secrets.local.yaml      NON SUIVI — clé de géocodage (voir SCRIPTS.md)
scripts/
  preparer-comites.php  before-build
assets/
  images/               = image.source
    equipe/  medias/  galeries/<nom>/  ogimage.png  intro.jpg
    comites/instagram/<compte>.jpg   GÉNÉRÉ une fois par compte par preparer-comites (commité)
  schemas/              (renommé depuis shemas/) articles, equipe, comites
  fonts/  videos/  cartes/
src/
  _templates/  _plugins/
  _data/                        TOUT le contenu éditable (modèle humainhumain), jamais exporté
    accueil/
      qui-sommes-nous.md  nos-missions.md  nos-collaborateurs.md
      le-grand-sursaut-2.md  rever-le-pays.md  un-pays-en-marche.md   (titre + bloc {% galerie %})
    equipe/equipe.yaml
    medias/articles.yaml
    comites/
      comites.yaml              SOURCE éditée dans Studio — seulement ce que l'équipe saisit
      geocodage.json            CACHE des coordonnées, une entrée par adresse (commité, exclu de Studio)
      instagram.json            échecs de récupération des logos (commité, exclu de Studio)
      nous-joindre.md
  _index.php                    structure seulement : sections + <?= $quisommesnous ?> …
  medias/_index.php
  notre-equipe/_index.php
  nos-comites/_index.php
  _mapstyle/  _marque/          outils internes, jamais exportés
  scripts/  styles/  videos/  images/ (sorties générées)
  404.html  CNAME  robots.txt  favicon.ico
```

Règle (comme sur humainhumain.com) : **aucun texte dans les `_index.php`**.
Chaque bloc `<markdown>` actuel devient un fichier `.md` dans
`src/_data/<page>/`, chargé par annotation, avec un chemin relatif à la
page :

```php
<?php
/**
 * @name            index
 * @title           MÉI
 * @abstract        …
 * @quisommesnous   _data/accueil/qui-sommes-nous.md
 * @grandsursaut    _data/accueil/le-grand-sursaut-2.md
 * @nosmissions     _data/accueil/nos-missions.md
 */
?>
<section class="right qui-sommes-nous">
    <div><?= $quisommesnous ?></div>
</section>
<section>
    <div><?= $grandsursaut ?></div>
</section>
```

(depuis `nos-comites/_index.php` : `@nousjoindre ../_data/comites/nous-joindre.md`.)
Les `.md` sont rendus par php-prepros à l'annotation (`MD::toHtml()`), ce
qui exécute aussi les blocs `{% galerie %}` qu'ils contiennent. Les YAML de
données suivent le même chemin (`@equipe ../_data/equipe/equipe.yaml`).
Kiri Studio liste chaque fichier sous le `@title` de sa page.

## 3. `kirigami.yaml` cible

```yaml
# yaml-language-server: $schema=https://cdn.jsdelivr.net/gh/php-kirigami/kirigami@main/packages/kirigami/kirigami.schema.json
kirigami:
  project: Mouvement Étudiant Indépendantiste
  baseurl: https://mouvei.quebec
  root:    src
  banner:  banner.txt
  author:  Maxime Larrivée-Roy
  email:   mouvement.ei@gmail.com
  repo:    https://github.com/meiquebec/meiquebec.github.io
  boutique: https://50plus1.quebec/collections/collection-mei-mouvement-etudiant-independantiste
  formulaire: https://docs.google.com/forms/d/1lmEXvZz6tyVQA2FYvYILfyLLc0NhkWgiAepPkSg5w-U
  reseaux:
    instagram: https://www.instagram.com/mouv.ei/
    youtube:   https://www.youtube.com/@mouv_ei/
    facebook:  https://www.facebook.com/mouvei/
  carte:
    cle:   AIza…            # clé NAVIGATEUR, restreinte par référent (publique par nature)
    mapid: …

seo:
  lang: fr-CA
  # organisation, adresse, sameAs : voir le schéma (bloc seo) — remplace le JSON-LD écrit à la main

prepros:
  before:   _templates/header.php
  after:    _templates/footer.php
  format:   true
  network:  true          # requis par preparer-comites (CURL)
  includes: [_plugins/md.plugins.php]

image:
  format: webp
  source: assets/images
  dest:   images

export:
  path: dist

scripts:
  - name: preparer-comites
    trigger: before-build
    mount: [secrets.local.yaml]

tasks:
  - { name: js-core,     type: esbuild, entry: scripts/mei.core.js }
  - { name: scss-core,   type: sass,    entry: styles/mei.core.scss }
  - { name: js-mapstyle, type: esbuild, entry: scripts/mei.mapstyle.js, head: false }

studio:                     # voir §7 — le contenu est édité par l'équipe du MÉI dans Kiri Studio
  images: assets/images
  exclude:                             # caches générés : jamais montrés à l'équipe
    - src/_data/comites/geocodage.json
    - src/_data/comites/instagram.json
  labels:
    src/_data/equipe/equipe.yaml:   Équipe
    src/_data/medias/articles.yaml: Médias
    src/_data/comites/comites.yaml: Comités
```

Notes :

- Les clés libres du bloc `kirigami:` deviennent des variables PHP
  (`$reseaux->instagram`, `$carte->cle`, …) : les URL des réseaux, de la
  boutique et du formulaire sortent des gabarits et ne sont écrites qu'une
  fois.
- `prepros.network: true` active aussi le réseau pendant le rendu des
  pages ; aucune page n'en a besoin, mais c'est le seul interrupteur
  (voir [KIRIGAMI-MANQUES.md](KIRIGAMI-MANQUES.md)).
- La tâche `js-mapstyle` (`head: false`) n'est pas injectée dans le
  `<head>` des pages publiques ; seule `_mapstyle/_index.php` l'inclut.

## 4. Gabarits

### `_templates/header.php`

- Supprimer les balises OG, `<title>` et le JSON-LD écrits à la main : le
  bloc `seo:` les génère à partir de `$project`, `@title`, `@abstract`,
  `@image` (corrige H2, M3, B2).
- Supprimer les `<link>`/`<script>` de `mei.core.min.*` : Kirigami les
  injecte avec `$relroot` et `?###TIMESTAMP###` (corrige B1).
- Liens du menu : `<?= $relroot ?>medias/`, etc. Boutique et réseaux depuis
  `kirigami.yaml`.
- Garder `data-page="<?= $name ?>"` (utilisé par le CSS du menu).

### `_templates/footer.php`

- Réécrire les liens sociaux (M4) en boucle sur `$reseaux`, avec
  `rel="noopener noreferrer"`.

### Pages

- `_index.php` : tous les textes partent dans `_data/accueil/*.md` (§2) ;
  retirer le `z` (M5), « Qui sommes-nous » (B4), `rel="noopener noreferrer"`
  (B3), vidéo et affiche via `$relroot` ; l'affiche peut devenir
  `IMG::asset('intro.jpg', 1280)`.
- `notre-equipe/_index.php` : `@equipe ../_data/equipe/equipe.yaml` ;
  `<img asset="<?= $membre->photo ?>" width="…" height="…" cover alt="<?= $membre->nom ?>">`
  au lieu du `style=` en ligne (M8) ; `photo` est un chemin de
  `assets/images/` (ex. `equipe/leonard-vidal.jpg`).
- `medias/_index.php` : `@articles ../_data/medias/articles.yaml` ;
  `<img asset="<?= $article->image ?>" width="…" loading="lazy">` ;
  passer `date` en ISO (`2025-10-30`) dans le YAML et la formater au rendu,
  ce qui permet aussi de trier.
- `nos-comites/_index.php` : `@comites ../_data/comites/comites.yaml`,
  `@geocodage ../_data/comites/geocodage.json` (fusionnés au rendu, voir
  [SCRIPTS.md §1](SCRIPTS.md#1-comités--géocodage-et-logos)),
  `@nousjoindre ../_data/comites/nous-joindre.md` ; ne lister que les
  comités actifs (M6, déjà corrigé dans le site actuel) ; intégrer les
  données de la carte dans la page (voir plus bas).
- `_mapstyle/_index.php` : inclure `<?= $relroot ?>scripts/mei.mapstyle.min.js`.

## 5. JavaScript front-end

- Sortir `mapstyle.js` + `cssdoc.js` du bundle principal vers
  `scripts/mei.mapstyle.js` (B10).
- Ne plus télécharger `galleries.json` ni `comites.json` (M11) : les
  données arrivent dans le HTML.
  - Galerie : le bloc `{% galerie %}` produit directement le balisage
    (grandes images et vignettes générées par `IMG::asset()`) ;
    `gallery.js` ne fait plus que monter Swiper et la modale sur ce
    balisage.
  - Carte : `<carte-mei>` reçoit les comités actifs et la configuration de
    la carte (voir [SCRIPTS.md §3](SCRIPTS.md#3-clés-de-la-carte)) ;
    `carte.js` lit ses attributs au lieu de `SECRETS` et du `fetch`.
  - Supprimer `secrets.js` et `loadJsonProperties()` s'il n'a plus
    d'usage.
- Plus aucun chemin absolu dans le JS (M7) : les logos de comités (photo
  Instagram en cache, ou `logo` du YAML) sont générés par `IMG::asset()`
  au rendu et passés à la carte avec leur chemin relatif.

## 6. CI — `.github/workflows/pages.yml`

Remplacer le workflow par celui des gabarits Kirigami (`kiribuild@v2`,
recommit des fichiers régénérés, upload de `dist/`), avec une étape de plus
avant `kiribuild` pour la clé de géocodage :

```yaml
      - name: Clé de géocodage
        env:
          GEOCODING_API_KEY: ${{ secrets.GEOCODING_API_KEY }}
        run: printf 'geocodage: "%s"\n' "$GEOCODING_API_KEY" > secrets.local.yaml
```

Le recommit est nécessaire : si l'équipe ajoute un comité sans passer par
un build local (ex. Kiri Studio), c'est la CI qui géocode et va chercher
la photo Instagram. `geocodage.json`, `instagram.json` et
`assets/images/comites/instagram/` doivent revenir dans le dépôt pour ne
jamais refaire ces appels. Permissions du workflow : `contents: write`.

Quand Kirigami saura passer des variables d'environnement aux scripts
(voir [KIRIGAMI-MANQUES.md](KIRIGAMI-MANQUES.md)), cette étape disparaît.

## 7. Kiri Studio

Le site sera édité par l'équipe du MÉI dans
[Kiri Studio](https://github.com/php-kirigami/kiri-studio) : pas de
terminal, pas de build local, publication par l'API GitHub. Tout ce qui
est contenu doit donc être éditable sans toucher au PHP, et tout ce qui
est généré doit se régénérer **en CI**. Conséquences :

- **La CI fait tout.** Un comité ajouté dans Studio n'a ni position ni
  logo : c'est la CI qui géocode et récupère la photo Instagram. Le secret
  `GEOCODING_API_KEY` et l'étape de recommit des caches sont donc
  obligatoires, pas optionnels.
- **Studio ne montre que la saisie.** `comites.yaml` ne contient que ce
  que l'équipe tape (nom, adresse, Instagram, actif) ; coordonnées et
  logos vivent dans des caches générés (`geocodage.json`,
  `instagram.json`, `assets/images/comites/instagram/`), exclus par
  `studio.exclude`.
- **Schémas obligatoires** pour les trois fichiers de données
  (`equipe`, `articles`, `comites`) : Studio valide pendant la frappe,
  explique les erreurs en clair et propose les clés. Descriptions en
  français, champs en français, `format: date` pour les dates des médias,
  `format: uri` pour les liens. Studio les trouve par `yaml.schemas` de
  `.vscode/settings.json` (penser à y corriger `shemas/` → `schemas/`) ou
  par une ligne `# yaml-language-server: $schema=…` en tête de fichier.
- **Images déposées par l'équipe.** Le gestionnaire d'images de Studio
  travaille dans `assets/images/` (= `image.source`) et permet de créer des
  sous-dossiers. Donc :
  - une galerie = un bloc `{% galerie … %}` qui contient les codes
    `{% img-asset %}` insérés par Studio ; chaque image passe par
    `IMG::asset()` (grande image + vignette). L'équipe dépose la photo
    puis insère son code dans le bloc (voir
    [SCRIPTS.md §2](SCRIPTS.md#2-galeries)) ;
  - les noms de fichiers viendront de téléphones (`IMG_2738.JPG`,
    `photo (1).jpeg`, HEIC) : Studio met ces chemins entre guillemets,
    `IMG::asset()` renvoie des `src` encodés, et `IMG` lit le HEIC via
    Imagick (K7/K9 dans [KIRIGAMI-MANQUES.md](KIRIGAMI-MANQUES.md)) ;
  - les champs d'image des YAML (`photo` de l'équipe, `image` des médias)
    sont des chemins relatifs à `assets/images/` que l'équipe choisit dans
    le gestionnaire — pas des noms de `.webp` générés à la main.
- **Logos des comités automatiques.** Plus de logo fait à la main ni de
  convention de nom : la photo de profil Instagram du comité est récupérée
  une fois et gardée ; un champ `logo` facultatif permet d'en imposer une
  autre (voir [SCRIPTS.md §1](SCRIPTS.md#1-comités--géocodage-et-logos)).
  Risque : Instagram peut bloquer la CI — à vérifier au premier
  déploiement.
- **Aucun texte dans les `_index.php`.** Studio ne peut pas éditer le PHP :
  chaque bloc `<markdown>` devient un `.md` de `src/_data/<page>/` chargé
  par annotation (§2, modèle humainhumain), et Studio le liste sous le
  titre de la page. Les galeries vivent dans ces mêmes fichiers (titre
  `##` + bloc `{% galerie %}`). Ajouter une galerie *nouvelle* demande
  encore une section dans le PHP ; modifier une galerie existante, non.
- **Rien de secret dans ce que Studio voit.** `secrets.local.yaml` est à la
  racine, hors `src/`, non suivi et jamais référencé par une page : Studio
  ne le voit pas. La clé navigateur dans `kirigami.yaml` n'est pas un
  secret (restreinte au domaine).
- **Erreurs lisibles par des non-développeurs.** Un build qui échoue en CI
  (adresse introuvable, champ manquant) doit dire *quel comité* et *quoi
  corriger*, en français : c'est le seul retour qu'aura l'équipe.

## 8. Plan par étapes

Chaque étape laisse le site déployable.

1. **Sécurité d'abord (hors code)** — créer les deux clés Google (H1),
   restreindre la clé navigateur, faire une rotation de l'ancienne.
2. **Bascule de l'outil** — `@kirigami/cli` en devDependency, corriger
   `kirigami.yaml` (M1), retirer `chokibasic` et les `scripts/*.js`
   build/watch/export, nouveau workflow CI, `.vscode/` (B13). Gabarits
   inchangés sauf ce qui casse (H2).
3. **Gabarits et SEO** — `seo:`, header/footer, liens relatifs, défauts
   M3–M8, B1–B4.
4. **Images** — rapatrier les sources dans `assets/images/`, `<img asset>`
   partout, supprimer `src/images/` commité (M9, B7, B8).
5. **Scripts pré-build** — `preparer-comites.php`, galeries au rendu,
   clés de la carte dans la page ; retirer `sharp`, `install.js`,
   `bt1oh97j7X.bin`.
6. **Kiri Studio** — bloc `studio:`, schémas complets en français, textes
   de l'accueil en Markdown avec leurs galeries (§7) ; essai
   complet : ajouter un comité et une photo depuis Studio, vérifier que la
   CI géocode, recommit et déploie.
7. **Ménage** — `CLAUDE.md` (en français), `README.md`, décision sur le
   HTML commité (B12).
