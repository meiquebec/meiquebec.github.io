# Scripts exécutés avant le build

Ce que faisaient `scripts/comites.js`, `scripts/galleries.js`,
`scripts/install.js` et l'étape « Obfuscation » de la CI, refait avec
Kirigami.

## Rappel : comment Kirigami exécute un script

- Un script est un fichier PHP `scripts/<nom>.php`, déclaré dans
  `kirigami.yaml` sous `scripts:`. Il tourne dans le même PHP-WASM que le
  rendu des pages, avec toute la bibliothèque php-prepros (`YAML`, `CURL`,
  `IMG`, `OBF`, `STR`, `FS`, `CACHE`, …) et le bloc `kirigami:` dans
  `PREPROS::$config->data`.
- `trigger: before-build` → exécuté au début de `kiri build`, de
  `kiri export` et du build initial de `kiri serve`. Lancement manuel :
  `npx kiri run <nom>`.
- **Le watch ne relance pas les scripts.** Modifier `_data/comites/comites.yaml` pendant
  un `kiri serve` ne re-géocode rien : relancer `kiri serve` ou faire
  `npx kiri run preparer-comites` (voir [KIRIGAMI-MANQUES.md](KIRIGAMI-MANQUES.md)).
- Le script voit une **copie** du projet : `kirigami.root` (`src/`, seulement
  `.php .json .yaml .yml .md .db .txt`) plus les fichiers listés dans
  `mount:`. Un fichier écrit n'est recopié sur le disque que s'il est
  déclaré avec `PREPROS::exportFile($chemin)`.
- Une exception non attrapée fait échouer le script, donc le build ; un
  `STD::error('message')` aussi, avec un message propre.
- Le réseau (`CURL`) n'est disponible qu'avec `prepros.network: true`.
- `getenv()` ne voit **pas** les variables d'environnement du processus
  Node : un secret doit passer par un fichier monté (voir §1).

---

## 1. Comités : géocodage et logos

**Règle : chaque appel externe ne se fait qu'une seule fois, et son
résultat est gardé.** Google n'est appelé que pour une adresse jamais vue,
Instagram que pour un compte dont on n'a pas encore la photo. Tout le
reste vient des caches, sur tous les postes et en CI.

**Script :** `scripts/preparer-comites.php`, `trigger: before-build`,
`mount: [secrets.local.yaml]`. Il complète deux caches — les coordonnées
(`geocodage.json`) et les photos de profil Instagram (§ « Logos ») — et
ne produit aucun autre fichier : la page lit le YAML et les caches, et les
fusionne au rendu.

### Entrée — `src/_data/comites/comites.yaml` (éditée dans Kiri Studio)

```yaml
# yaml-language-server: $schema=../../../assets/schemas/comites.schema.json
- nom: Collectif indépendantiste de McGill
  adresse: 845 Rue Sherbrooke O, Montréal, QC H3A 0G4
  instagram: https://www.instagram.com/cimcgill/

- nom: Comité indépendantiste de l'Université Laval
  adresse: 1045 Av. de la Médecine, Québec, QC G1V 0A6
  instagram: https://www.instagram.com/comite_independantiste_ul/
  actif: false
```

**Le YAML ne contient que ce que l'équipe saisit.** Aucune coordonnée,
aucun champ technique : pas de latitude/longitude, pas d'`id`, pas de
date de géocodage. Tout ce qui est calculé vit dans le cache ci-dessous,
que Studio ne montre pas.

| Champ | Requis | Défaut | Rôle |
|---|---|---|---|
| `nom` | oui | — | Nom affiché (liste, infobulle de la carte) |
| `adresse` | oui | — | Adresse envoyée au géocodage ; c'est aussi la clé du cache |
| `instagram` | oui | — | Lien de la liste et de l'infobulle |
| `actif` | non | `true` | `false` : retiré de la carte et de la liste |
| `logo` | non | photo de profil Instagram du compte (§ « Logos ») | À remplir seulement pour imposer une autre image : chemin relatif à `assets/images/`, choisi dans le gestionnaire d'images de Kiri Studio |

Le dossier `_data/` commence par `_` : il n'est jamais exporté. Un schéma
`assets/schemas/comites.schema.json` (à créer, sur le modèle des deux
existants) donne l'autocomplétion dans VS Code et dans Kiri Studio.

### Cache — `src/_data/comites/geocodage.json` (généré, **commité**)

```json
{
    "845 rue sherbrooke o, montréal, qc h3a 0g4": {
        "adresse": "845 Rue Sherbrooke O, Montréal, QC H3A 0G4",
        "lat": 45.5063178,
        "lng": -73.5767035,
        "date": "2026-10-02"
    },
    "123 rue inexistante, nulle-part, qc": {
        "adresse": "123 rue Inexistante, Nulle-Part, QC",
        "statut": "ZERO_RESULTS",
        "date": "2026-10-02"
    }
}
```

- **Clé = adresse normalisée** : `Normalizer` NFC, espaces de début et de
  fin retirés, espaces multiples réduits à un, minuscules
  (`mb_strtolower`). `845 Rue Sherbrooke O` et `845  rue sherbrooke o`
  sont donc la même adresse. Les accents sont gardés (« Québec » ≠
  « Quebec » pour Google aussi). La fonction de normalisation vit dans
  `src/_plugins/comites.php` (chargé par `prepros.includes`), partagée par
  le script et la page pour qu'ils calculent la même clé.
- **Indépendant des comités** : renommer un comité, changer son logo, le
  désactiver ou le supprimer puis le remettre ne déclenche aucun appel.
  Seule une adresse *modifiée* (donc une nouvelle clé) est géocodée.
- **Jamais expiré, jamais purgé** automatiquement : une adresse ne bouge
  pas, et une entrée inutilisée ne coûte que quelques octets. Purge
  manuelle possible : `npx kiri run preparer-comites purger` retire les
  entrées qu'aucun comité n'utilise.
- **Les échecs définitifs sont aussi gardés** (`"statut": "ZERO_RESULTS"`) :
  une adresse que Google ne trouve pas n'est pas redemandée à chaque
  build ; le build échoue avec un message clair jusqu'à ce que l'équipe
  corrige l'adresse (nouvelle clé). Les erreurs passagères (réseau,
  `OVER_QUERY_LIMIT`, `REQUEST_DENIED`, `UNKNOWN_ERROR`) ne sont **pas**
  gardées : on réessaiera au build suivant.
- **Correction manuelle** (adresse introuvable ou point mal placé par
  Google) : un développeur édite l'entrée du cache — `lat`/`lng` à la main
  et `"manuel": true`. Le script ne touche jamais une entrée existante,
  donc la correction tient. Rien de tout ça n'apparaît dans le YAML.
- **Pourquoi un JSON commité et pas `CACHE` (`.cache.db`)** : `.cache.db`
  n'est pas suivi par git et la CI repart d'un clone neuf à chaque
  déploiement — elle re-géocoderait tout, à chaque fois. Le JSON commité
  est partagé par tous les postes et par la CI, et il est lisible dans les
  diffs.
- Clés triées, indenté à 4 espaces, écrit **seulement s'il change** (pas
  de commit vide en CI). Exclu de Kiri Studio (`studio.exclude`).

### Algorithme

1. Lire `comites.yaml` (`YAML::parseFile`), valider les champs requis ; un
   comité invalide → `STD::error` avec son nom et le champ en cause.
2. Lire `geocodage.json` (vide s'il n'existe pas).
3. Pour chaque comité dont la clé d'adresse est **absente** du cache :
   appeler
   `https://maps.googleapis.com/maps/api/geocode/json?address=…&key=…&region=ca&language=fr`
   avec `CURL::getContents()`.
   - `OK` → garder `results[0].geometry.location` ;
   - `ZERO_RESULTS` → garder l'échec ;
   - autre statut ou pas de réponse → ne rien garder, échouer.
   Une même adresse partagée par deux comités n'est demandée qu'une fois.
4. Écrire `geocodage.json` (+ `PREPROS::exportFile`) si une entrée a été
   ajoutée — **avant** de signaler une erreur, pour ne pas perdre les
   résultats déjà payés.
5. Échouer si un comité actif n'a pas de coordonnées en cache (adresse
   introuvable), en le nommant.
6. Afficher un résumé : `26 comités, 1 adresse géocodée, 25 en cache`.

La clé n'est lue qu'au besoin : si toutes les adresses sont en cache, le
script réussit même sans `secrets.local.yaml` (clone frais, CI sans
secret). S'il faut géocoder et que la clé manque → erreur explicite
(« ajoutez la clé de géocodage dans secrets.local.yaml »).

Ses messages sont le seul retour qu'aura l'équipe : ils nomment le comité,
le champ et la correction attendue, en français (« Comité « Oui Rimouski » :
adresse introuvable par Google — vérifiez l'adresse dans la fiche du
comité »).

### Qui exécute le script, et quand

| Où | Quand | Clé de géocodage | Résultat |
|---|---|---|---|
| **Aperçu de Kiri Studio** (poste du client) | Au démarrage de l'aperçu, puis **à chaque modification de `comites.yaml`** (`watch`) | Lue toute seule dans le `.bin` publié par le déploiement (§4) — rien à saisir | Épingle et logo visibles tout de suite dans l'aperçu ; à la publication, Studio envoie aussi les caches remplis (`studio.publish`) |
| **CI** (GitHub Actions) | À chaque déploiement | Secret `GOOGLE_API_KEY`, **obligatoire** | Filet de sécurité : ne fait que ce que l'aperçu n'a pas fait (aperçu jamais lancé, hors ligne), puis recommite les caches |
| **Poste d'un développeur** | `npm run serve` / `npm run build` / `npm run comites` | `secrets.local.yaml` s'il existe, sinon le `.bin` publié | Comme l'aperçu |

Si la clé manque malgré tout (poste hors ligne), une nouvelle adresse
n'est **pas** une erreur : le comité apparaît dans la liste, son logo
arrive, et un avertissement dit qu'il sera placé sur la carte au
déploiement. En CI, la clé est obligatoire (`obligatoire: true` dans le
fichier écrit par le workflow) : une nouvelle adresse sans clé y fait
échouer le build plutôt que de publier une carte incomplète.

### Logos — photo de profil Instagram, récupérée une seule fois

Plus de logos faits à la main : le script va chercher la photo de profil
du compte Instagram de chaque comité (le champ `instagram` du YAML,
qu'il faut déjà remplir).

- **Compte** = l'identifiant tiré de l'URL (`https://www.instagram.com/cimcgill/`
  → `cimcgill`).
- **Source** : la page publique du compte, balise `og:image`, lue avec
  `CURL::getContents()` (testé le 2026-10-02 sur `cimcgill` et `mv.oui` :
  la photo est bien là, en **100×100**, la taille des logos actuels —
  suffisant pour l'usage du site, confirmé le 2026-10-02 : pas besoin de
  chercher une version HD).
  L'URL Instagram est signée et **expire** : l'image est téléchargée tout
  de suite, jamais liée telle quelle.
- **Cache = le fichier lui-même** :
  `assets/images/comites/instagram/<compte>.jpg`, commité. S'il existe
  (vérifié avec `PREPROS::fstat()`, sans le copier dans le sandbox),
  Instagram n'est pas appelé. Écrit sur disque par `PREPROS::exportFile()`.
- **Affichage** : `IMG::asset('comites/instagram/<compte>.jpg', 100, 100, true)`
  à la page (WebP, chemin relatif).
- **Jamais rafraîchi automatiquement.** Si un comité change sa photo :
  supprimer le fichier (il sera repris au prochain build), ou
  `npx kiri run preparer-comites logos` pour tout reprendre.
- **Échecs** (page de connexion au lieu du profil, compte privé ou
  supprimé, réseau) : notés avec leur date dans
  `src/_data/comites/instagram.json` (exclu de Studio), pour ne pas
  rappeler Instagram à chaque build — nouvel essai au plus une fois par
  semaine. Un logo manquant **ne fait pas échouer le build** : l'infobulle
  de la carte s'affiche sans image, et le script le signale en
  avertissement.
- **Champ `logo` du YAML** : s'il est rempli, il gagne, et Instagram n'est
  pas appelé pour ce comité.

> **Instagram et la CI.** Instagram sert souvent sa page de connexion aux
> adresses IP de serveurs (GitHub Actions). C'est pourquoi la photo est
> d'abord récupérée **depuis le poste de l'équipe**, par l'aperçu de
> Studio, et publiée avec ses modifications (`studio.publish`). La CI ne
> s'en charge que si l'aperçu ne l'a pas fait ; si elle est bloquée,
> l'infobulle reste sans image jusqu'au prochain aperçu ou build local.
> Testé le 2026-10-02 depuis un poste : 26 photos sur 26.

### Lecture dans la page

`nos-comites/_index.php` charge les fichiers et appelle la même fonction
partagée :

```php
<?php
/**
 * @comites   ../_data/comites/comites.yaml
 * @geocodage ../_data/comites/geocodage.json
 */
$actifs = comites_actifs($comites, $geocodage);   // src/_plugins/comites.php : actifs, coordonnées du cache, logo (YAML, sinon Instagram, sinon remplacement)
?>
```

La liste et `<carte-mei>` (voir §3) sont construites à partir de
`$actifs`. Aucun fichier intermédiaire.

### Secret — `secrets.local.yaml` (non suivi)

```yaml
geocodage: AIza…   # clé Geocoding API, jamais publiée
```

- Ajouté au `.gitignore`. Pas de point initial : le fichier doit pouvoir
  être monté par `mount:`.
- En CI, écrit à partir du secret `GEOCODING_API_KEY` (voir
  [MIGRATION.md §6](MIGRATION.md#6-ci--githubworkflowspagesyml)).
- Lu dans le script par `/project/secrets.local.yaml` si `is_file()`.

### Esquisse

```php
<?php
// Complète le cache de géocodage : une adresse n'est demandée à Google qu'une fois.

$source = '/project/src/_data/comites/comites.yaml';
$fichier = '/project/src/_data/comites/geocodage.json';

$cache = is_file($fichier) ? json_decode(file_get_contents($fichier), true) : [];
$ajouts = 0;

$cle = null;
$geocoder = function (string $adresse) use (&$cle): array {
    if ($cle === null) {
        $secrets = is_file('/project/secrets.local.yaml') ? YAML::parseFile('/project/secrets.local.yaml') : null;
        $cle = $secrets->geocodage ?? STD::error('Clé de géocodage absente de secrets.local.yaml.');
    }
    $url = 'https://maps.googleapis.com/maps/api/geocode/json?' . http_build_query([
        'address' => $adresse, 'key' => $cle, 'region' => 'ca', 'language' => 'fr',
    ]);
    $rep = json_decode(CURL::getContents($url));
    $statut = $rep->status ?? 'PAS_DE_REPONSE';
    if ($statut === 'OK') {
        $loc = $rep->results[0]->geometry->location;
        return ['adresse' => $adresse, 'lat' => $loc->lat, 'lng' => $loc->lng, 'date' => date('Y-m-d')];
    }
    if ($statut === 'ZERO_RESULTS') return ['adresse' => $adresse, 'statut' => $statut, 'date' => date('Y-m-d')];
    throw new Exception("Géocodage impossible pour « {$adresse} » : {$statut} (erreur passagère ou clé invalide, rien n'est gardé).");
};

$erreur = null;
try {
    foreach (YAML::parseFile($source) as $c) {
        // … validation des champs requis …
        $k = comites_cle_adresse($c->adresse);          // src/_plugins/comites.php
        if (isset($cache[$k])) continue;                  // déjà demandé une fois : jamais redemandé
        $cache[$k] = $geocoder($c->adresse);
        $ajouts++;
    }
} catch (Throwable $e) {
    $erreur = $e->getMessage();
}

if ($ajouts) {                                            // garder ce qui a été payé, même en cas d'erreur
    ksort($cache);
    file_put_contents($fichier, json_encode($cache, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n");
    PREPROS::exportFile($fichier);
}
if ($erreur) STD::error($erreur);
// … puis : échec si un comité actif n'a pas de coordonnées en cache ; résumé …
```

### Migration des données

Convertir une fois le `comites.json` actuel :

- en `_data/comites/comites.yaml` (champs renommés en français, sans
  `location`, sans `id`, sans `logo` : les logos viendront d'Instagram ;
  les 26 `.webp` faits à la main sont supprimés) ;
- et en `_data/comites/geocodage.json`, en recopiant chaque `location`
  existante sous la clé de son adresse.

Aucun des 26 comités n'est donc re-géocodé au premier passage. Le
premier passage local récupère les 26 photos Instagram (une requête par
compte, puis plus jamais).

---

## 2. Galeries

**Une galerie = un dossier. Rien d'autre à faire pour le client.**

Dans le Markdown, le titre et le nom du dossier :

```markdown
## Rêver le pays

{% galerie rever-le-pays %}
```

Les photos sont dans `assets/images/galeries/rever-le-pays/`. Pour ajouter
ou retirer une photo, le client la dépose dans ce dossier avec le
gestionnaire d'images de Kiri Studio : la galerie suit, dans l'aperçu comme
après publication. Aucune liste à tenir, aucun code à insérer.

- **Sur l'accueil**, trois fichiers `src/_data/accueil/galerie-1.md`,
  `galerie-2.md`, `galerie-3.md`, affichés « Galerie 1 », « Galerie 2 »,
  « Galerie 3 » dans Studio (`studio.labels`). Le titre **et** le dossier se
  changent dans le Markdown : pour montrer un autre dossier, changer le nom
  dans `{% galerie … %}`.
- **Tout se fait quand la balise est analysée**
  (`src/_plugins/md.plugins.php`, aucun script) : `PREPROS::mount()` donne
  les fichiers réellement présents dans le dossier, et chaque photo passe par
  `IMG::asset()` — une grande image (1280×960, *contain*) et une vignette
  (240×320, *cover*), générées seulement si elles manquent ou sont périmées.
  Un nom avec espaces ou parenthèses (photo de téléphone) donne une adresse
  encodée.
- **Aperçu en direct** : le watch de Kirigami suit `image.source`
  (`assets/images/`) ; ajouter, remplacer ou retirer une image re-rend toutes
  les pages. Demande **core 3.2.10** (voir ci-dessous).
- Sans JavaScript, chaque vignette mène à sa grande image ; `gallery.js` en
  fait un carrousel Swiper et la modale d'agrandissement.
- Un dossier vide ou inexistant ne casse rien : la galerie est omise et un
  avertissement le dit dans le journal.
- Qualité : `IMG` encode en WebP à 82 par défaut (sharp : 85). Écart
  négligeable ; voir K6 si la différence se voit.

> Les codes `{% img-asset %}` dans un bloc `{% galerie %}` (php-wasm
> 8.5.11-4, Kiri Studio 0.5.4) ont été essayés puis abandonnés : trop
> compliqués pour l'équipe, qui ne veut avoir que le nom du dossier à donner.
> Ces correctifs restent utiles ailleurs (`{% img-asset %}` avec des noms de
> fichiers à espaces).

---

## 3. Médias : la vignette de chaque article

**Le client ne saisit que le titre, le lien, le média et la date.** La
vignette (l'image de partage de l'article) est trouvée toute seule.

`scripts/preparer-medias.php` (`trigger: before-build`, relancé dès que
`articles.yaml` change) :

- pour chaque lien **jamais vu**, lit sa page avec `SCRAPER::get()` (JSON-LD,
  Open Graph, `<meta>`), télécharge l'image dans `assets/images/medias/` et la
  note dans `src/_data/medias/vignettes.json` (`{ "<lien>": { image, date } }`) ;
- **une seule fois par lien** : trouvée, elle n'est jamais redemandée ;
- **les 14 vignettes actuelles sont conservées** (`vignettes.json` a été
  rempli à partir de l'ancien champ `image`, puis ce champ a été retiré) ;
- un lien sans image trouvée n'est pas une erreur : noté (`echec`, réessayé au
  plus une fois par semaine, ou tout de suite avec
  `npx kiri run preparer-medias reprendre`), et l'article s'affiche sans
  vignette ;
- `vignettes.json` et les images sont dans `studio.publish` : l'aperçu les
  calcule sur le poste du client et elles partent avec la publication ; elles
  sont exclues de Studio (`studio.exclude`).

La page (`src/medias/_index.php`) charge `articles.yaml` et `vignettes.json`,
et passe l'image par `<img asset>` (640 px de large, WebP).

---

## 4. Clés Google

**Aucune clé dans le dépôt, rien à saisir nulle part.** On garde la clé
actuelle (secret GitHub `GOOGLE_API_KEY`) ; elle n'est pas à changer.

`comites_cles()` (`src/_plugins/comites.php`) donne la clé à la page (carte)
et au script (géocodage), dans cet ordre :

1. **`secrets.local.yaml`** à la racine, s'il existe (non suivi par git) :
   ```yaml
   geocodage: "AIza…"
   carte:     "AIza…"
   ```
   La CI l'écrit à partir de ses secrets (`obligatoire: true` en plus) ; un
   développeur peut en avoir un.
2. **Sinon, le `bt1oh97j7X.bin` publié par le déploiement**
   (`https://mouvei.quebec/bt1oh97j7X.bin`), gardé un jour en cache — le
   mécanisme de l'ancien `postinstall`. La CI le régénère à chaque
   déploiement (étape « Clés publiées », depuis `GOOGLE_API_KEY` et
   `MAP_ID`), au format OBF (JSON → base64 → ROT13 → gzip sans ses deux
   octets d'en-tête).

C'est la voie 2 qui fait marcher **l'aperçu de Kiri Studio chez le client**
et un clone frais : carte affichée, nouveaux comités géocodés, sans aucune
saisie. Vérifié le 2026-10-02 : sans `secrets.local.yaml`, le build rend la
carte et le script trouve la clé de géocodage.

- La page des comités rend la clé dans `<carte-mei data-config>`, encodée
  avec `OBF::encode()` puis base64 ; `carte.js` la décode. Sans clé, pas de
  carte ; la liste reste.
- Le `MAP_ID` (`7a4f282a9b2f394eb458f2ee`) n'est pas un secret : il est dans
  `kirigami.yaml` (`kirigami.carte.mapid`).
- La clé n'est jamais en clair dans le dépôt : un `AIza…` en clair serait
  repéré par les scanners de GitHub et de Google. Encodée, elle est aussi
  visible qu'avant la migration (le `.bin` était déjà public), sans motif
  reconnaissable.
- Ce qui a disparu : `scripts/install.js` et le `postinstall` (remplacés par
  la voie 2), `secrets.js` et le `fetch` du `.bin` dans le navigateur.

---

## 5. Ce qui reste manuel

- **Vidéo d'introduction** (`src/videos/intro.{webm,mp4}`, 10 Mo) : encodages
  faits à la main, gardés tels quels. `@kirigami/plugin-clip` vise un lecteur
  vidéo, pas une boucle d'arrière-plan muette. Les sources et les autres
  encodages (58 Mo, ancien `assets/videos/`) ont été **sortis du dépôt** le
  2026-10-02 : Kiri Studio télécharge le dépôt (97 → 39 Mo), et rien ne s'en
  servait. Ils restent dans l'historique git (`git show e6aae70:assets/videos/…`).
- **Style de la carte** : `_mapstyle/` génère `carte-style-mei.json`, qui
  est collé à la main dans la console Google Cloud (Map ID). Aucun
  changement.
