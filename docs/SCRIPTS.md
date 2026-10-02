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

Le site étant édité dans Kiri Studio, c'est presque toujours **la CI** qui
exécutera ce script après l'ajout d'un comité, puis recommitera
`geocodage.json`. Ses messages d'erreur sont le seul retour qu'aura
l'équipe : ils nomment le comité, le champ et la correction attendue, en
français (« Comité « Oui Rimouski » : adresse introuvable par Google —
vérifiez l'adresse dans la fiche du comité »).

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
  semaine. Un logo manquant **ne fait pas échouer le build** : la page
  affiche une image de remplacement (logo du MÉI) et le script l'affiche
  en avertissement.
- **Champ `logo` du YAML** : s'il est rempli, il gagne, et Instagram n'est
  pas appelé pour ce comité.

> ⚠️ **Risque en CI.** Instagram sert souvent sa page de connexion aux
> adresses IP de serveurs (GitHub Actions), et c'est la CI qui construit
> quand l'équipe ajoute un comité dans Studio. Non testable d'ici. Si la
> CI est bloquée : le comité s'affiche avec l'image de remplacement, et un
> build local (`npx kiri run preparer-comites`) récupère la photo, qui est
> ensuite commitée. À vérifier au premier déploiement (voir TODO).

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

**Plus de script.** Les galeries sont écrites dans le texte de la page
avec les codes `{% img-asset %}` que Kiri Studio insère quand on choisit
une image. Chaque image passe par `IMG::asset()`, pour la grande image
comme pour la vignette. Ça supprime `sharp`, `scripts/galleries.js`,
`src/data/galleries.json`, `src/images/galeries/` commité, et la liste de
dossier (plus besoin de `PREPROS::mount()` sur les sources).

### Ce que l'équipe écrit (dans Kiri Studio)

```markdown
## Rêver le pays

{% galerie
{% img-asset "galeries/rever-le-pays/IMG_2738.JPG" 1280 %}
{% img-asset "galeries/rever-le-pays/IMG_3958.JPG" 1280 %}
{% img-asset "galeries/rever-le-pays/photo (1).jpeg" 1280 %}
%}
```

- Les sources sont dans `assets/images/` (= `image.source`), sous
  `galeries/<nom>/` par convention ; l'équipe les dépose avec le
  gestionnaire d'images de Studio. Le dossier n'a plus de rôle technique :
  c'est la liste des codes qui fait la galerie, dans l'ordre écrit.
- Ajouter une photo = la déposer, puis insérer son code dans le bloc.
  Retirer une photo = supprimer sa ligne. Pas de développeur.
- Le titre de la galerie est un titre Markdown normal au-dessus du bloc :
  plus de `_galeries.yaml`.

### Ce que fait `{% galerie %}` (`src/_plugins/md.plugins.php`)

Le plugin reçoit le corps du bloc **brut** (vérifié : les codes
`{% img-asset %}` qu'il contient ne sont pas encore rendus). Pour chaque
ligne `{% img-asset <chemin> [largeur] … %}` :

- grande image : `IMG::asset($chemin, 1280, 960)` — *contain*, comme
  aujourd'hui ;
- vignette : `IMG::asset($chemin, 240, 320, true)` — *cover*.

La largeur écrite dans le code est ignorée : les deux formats de la galerie
sont fixés par le plugin, pour que toutes les galeries se ressemblent quoi
que Studio insère. `IMG::asset()` ne régénère que si la source est plus
récente que la sortie. Une ligne invalide (chemin introuvable) devient un
commentaire HTML et l'erreur est signalée au build avec le chemin fautif.

Balisage produit (chemins relatifs fournis par `IMG::asset()`, encodés
pour l'URL) :

```html
<div class="galerie">
    <a class="galerie__carte" href="../images/galeries/rever-le-pays/IMG_2738-1280x960.webp">
        <img src="../images/galeries/rever-le-pays/IMG_2738-240x320-cover.webp" alt="" loading="lazy">
    </a>
</div>
```

Sans JavaScript, chaque vignette mène quand même à la grande image.
`gallery.js` monte Swiper et la modale sur ce balisage au lieu de
construire les cartes à partir du JSON.

### Correctifs Kirigami nécessaires (faits le 2026-10-02, pas encore publiés)

Testés le 2026-10-02 sur le core 3.2.7, trois points empêchaient ce
modèle. Ils sont corrigés dans les dépôts, mais il faut une publication
avant de pouvoir les utiliser dans le site :

1. **Bloc contenant des `{% … %}` (K8)** — `php-mdhtml` 0.1.6 : le bloc se
   ferme sur le `%}` qui équilibre son propre `{%`, et le corps arrive brut
   au plugin. Publication : tag `v0.1.6`, rebuild de `@kirigami/php-wasm`,
   puis php-prepros / core / cli.
2. **Chemins avec espaces (K9)** — Kiri Studio met maintenant le chemin
   entre guillemets (`{% img-asset "galeries/photo (1).jpeg" 800 %}`).
   Publication : prochaine version de Kiri Studio.
3. **`src` non encodés (K7)** — `IMG::asset()` renvoie une URL encodée
   segment par segment (`photo%20%281%29-240x320-cover.webp`) ; les noms
   de fichiers sur disque ne changent pas. Couvre aussi `<img asset>` et
   `{% img-asset %}`. Publication : prochaine version de php-prepros.

Le plugin `{% galerie %}` n'a donc rien à encoder lui-même.

Qualité : `IMG` encode en WebP à 82 par défaut (sharp : 85). Écart
négligeable ; voir K6 si la différence se voit.

---

## 3. Clés de la carte

**Plus de script, plus de fichier `.bin`.**

La clé de la Maps JavaScript API est publique par nature : Google la
protège par la **restriction de référent HTTP**, pas par le secret. Une
fois la clé navigateur restreinte (H1 dans [AUDIT.md](AUDIT.md)), elle peut
vivre dans `kirigami.yaml` (`kirigami.carte.cle`, `kirigami.carte.mapid`)
et être rendue dans la page des comités :

```php
<carte-mei data-config="<?= OBF::encode(['cle' => $carte->cle, 'mapid' => $carte->mapid]) ?>"
           data-comites="<?= htmlspecialchars(json_encode($actifs, JSON_UNESCAPED_UNICODE)) ?>"></carte-mei>
```

- `OBF::encode()` produit exactement le format actuel du `.bin` (JSON →
  base64 → ROT13 → gzip sans les deux octets d'en-tête) : le décodeur de
  `secrets.js` se réutilise tel quel, en base64 au lieu d'un `fetch`
  binaire. L'obfuscation reste optionnelle — elle ne fait qu'écarter les
  robots qui moissonnent les clés `AIza…`.
- Ce qui disparaît : `scripts/install.js` et le `postinstall`,
  `src/bt1oh97j7X.bin`, l'étape « Obfuscation » de la CI, l'entrée
  `export.ignore`, les secrets `GOOGLE_API_KEY` / `MAP_ID` du dépôt GitHub
  (remplacés par le seul `GEOCODING_API_KEY`).
- Si on préfère ne pas commiter la clé navigateur, la mettre aussi dans
  `secrets.local.yaml` et la lire depuis la page — mais alors la CI doit
  l'écrire elle aussi, et le rendu des pages doit pouvoir lire ce fichier
  (le monter via `PREPROS::mount()` dans la page). Plus de pièces pour un
  gain nul : non recommandé.

---

## 4. Ce qui reste manuel

- **Vidéo d'introduction** (`assets/videos/` → `src/videos/intro.{webm,mp4}`) :
  encodages faits à la main, gardés tels quels. `@kirigami/plugin-clip`
  vise un lecteur vidéo, pas une boucle d'arrière-plan muette.
- **Style de la carte** : `_mapstyle/` génère `carte-style-mei.json`, qui
  est collé à la main dans la console Google Cloud (Map ID). Aucun
  changement.
