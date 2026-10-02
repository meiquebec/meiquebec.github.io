<?php
/**
 * Prépare les comités avant le build (trigger: before-build) :
 *  - géocode chaque adresse UNE seule fois (cache _data/comites/geocodage.json) ;
 *  - récupère la photo de profil Instagram de chaque compte UNE seule fois
 *    (cache assets/images/comites/instagram/<compte>.jpg).
 * Rien de calculé n'est écrit dans comites.yaml. Voir docs/SCRIPTS.md §1.
 *
 *   npx kiri run preparer-comites          complète les caches
 *   npx kiri run preparer-comites logos    reprend toutes les photos Instagram
 *   npx kiri run preparer-comites purger   retire du cache les adresses inutilisées
 */

const SOURCE       = '/project/src/_data/comites/comites.yaml';
const GEOCODAGE    = '/project/src/_data/comites/geocodage.json';
const ECHECS_INSTA = '/project/src/_data/comites/instagram.json';
const SECRETS      = '/project/secrets.local.yaml';
const LOGOS        = '/project/assets/images/comites/instagram';
const DELAI_INSTA  = 7 * 86400; // nouvel essai d'un compte en échec au plus une fois par semaine

$mode = $argv[2] ?? '';


function ecrire_json(string $fichier, array $donnees): void
{
    ksort($donnees);
    file_put_contents($fichier, json_encode((object) $donnees, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n");
    PREPROS::exportFile($fichier);
}


// --- Lecture et validation de la saisie -------------------------------------

$comites = YAML::parseFile(SOURCE);
if (!is_array($comites)) STD::error('comites.yaml doit être une liste de comités.');

foreach ($comites as $i => $c) {
    $nom = $c->nom ?? ('n° ' . ($i + 1));
    foreach (['nom', 'adresse', 'instagram'] as $champ) {
        if (empty($c->$champ)) STD::error("Comité « {$nom} » : le champ « {$champ} » est obligatoire.");
    }
    if (!comites_compte_instagram($c->instagram)) {
        STD::error("Comité « {$nom} » : le lien Instagram « {$c->instagram} » n'est pas une adresse de compte Instagram.");
    }
}


// --- Géocodage : une seule fois par adresse ----------------------------------

$cache = is_file(GEOCODAGE) ? (json_decode(file_get_contents(GEOCODAGE), true) ?: []) : [];
$ajouts = 0;
$erreur = null;

// La clé vient de comites_cles() (src/_plugins/comites.php) : secrets.local.yaml
// en CI, sinon le .bin publié par le déploiement (aperçu de Kiri Studio, clone
// frais). Si elle manque quand même (site hors ligne), une nouvelle adresse
// n'est pas géocodée : simple avertissement, le comité sera placé au
// déploiement. La CI écrit « obligatoire: true » pour qu'un secret manquant
// y fasse échouer le build au lieu de publier une carte incomplète.
$cles = comites_cles();
$cle = $cles->geocodage;
$cleObligatoire = $cles->obligatoire;
$enAttente = [];

$geocoder = function (string $adresse) use ($cle): array {
    $url = 'https://maps.googleapis.com/maps/api/geocode/json?' . http_build_query([
        'address' => $adresse, 'key' => $cle, 'region' => 'ca', 'language' => 'fr',
    ]);
    $reponse = json_decode((string) CURL::getContents($url));
    $statut = $reponse->status ?? 'PAS_DE_REPONSE';
    if ($statut === 'OK') {
        $position = $reponse->results[0]->geometry->location;
        return ['adresse' => $adresse, 'lat' => $position->lat, 'lng' => $position->lng, 'date' => date('Y-m-d')];
    }
    // Échec définitif : gardé, pour ne pas redemander cette adresse.
    if ($statut === 'ZERO_RESULTS') return ['adresse' => $adresse, 'statut' => $statut, 'date' => date('Y-m-d')];
    // Échec passager (réseau, quota, clé) : rien n'est gardé, on réessaiera.
    throw new Exception("Géocodage impossible pour « {$adresse} » : {$statut}. Rien n'a été gardé ; le prochain build réessaiera.");
};

try {
    foreach ($comites as $c) {
        $k = comites_cle_adresse($c->adresse);
        if (isset($cache[$k])) continue;   // déjà demandée une fois : jamais redemandée
        if (!$cle) {
            if ($cleObligatoire) throw new Exception('Une nouvelle adresse doit être géocodée, mais le secret GEOCODING_API_KEY est vide.');
            $enAttente[] = $c->nom;
            echo "Avertissement : « {$c->nom} » sera placé sur la carte au déploiement (pas de clé de géocodage ici).\n";
            continue;
        }
        $cache[$k] = $geocoder($c->adresse);
        $ajouts++;
        echo "Géocodé : {$c->adresse}\n";
    }
} catch (Throwable $e) {
    $erreur = $e->getMessage();
}

if ($mode === 'purger') {
    $utilisees = array_map(fn($c) => comites_cle_adresse($c->adresse), $comites);
    $avant = count($cache);
    $cache = array_intersect_key($cache, array_flip($utilisees));
    echo ($avant - count($cache)) . " adresse(s) inutilisée(s) retirée(s) du cache.\n";
    $ajouts += $avant - count($cache);
}

// Garder ce qui a été payé, même si une erreur suit.
if ($ajouts) ecrire_json(GEOCODAGE, $cache);
if ($erreur) STD::error($erreur);

foreach ($comites as $c) {
    if (($c->actif ?? true) === false || in_array($c->nom, $enAttente, true)) continue;
    $entree = $cache[comites_cle_adresse($c->adresse)] ?? [];
    if (!isset($entree['lat'], $entree['lng'])) {
        STD::error("Comité « {$c->nom} » : adresse introuvable par Google (« {$c->adresse} ») — vérifiez l'adresse dans la fiche du comité.");
    }
}


// --- Logos : photo de profil Instagram, une seule fois par compte ------------

$echecs = is_file(ECHECS_INSTA) ? (json_decode(file_get_contents(ECHECS_INSTA), true) ?: []) : [];
$echecsModifies = false;
$recuperes = 0;
$manquants = [];

foreach ($comites as $c) {
    if (!empty($c->logo)) continue;   // logo imposé dans le YAML : Instagram n'est pas appelé
    $compte = comites_compte_instagram($c->instagram);
    $source = FS::pathJoin(PREPROS::$config->image->source, comites_logo_instagram($compte));

    if ($mode !== 'logos' && PREPROS::fstat($source)) continue;
    if ($mode !== 'logos' && isset($echecs[$compte]) && time() - strtotime($echecs[$compte]['date']) < DELAI_INSTA) {
        $manquants[] = $c->nom;
        continue;
    }

    $page = (string) CURL::getContents("https://www.instagram.com/{$compte}/");
    $image = preg_match('/<meta property="og:image" content="([^"]+)"/', $page, $m) ? html_entity_decode($m[1]) : null;
    $fichier = LOGOS . "/{$compte}.jpg";

    if (!is_dir(LOGOS)) mkdir(LOGOS, 0777, true);
    // L'URL d'Instagram est signée et expire : l'image est téléchargée tout de suite.
    if ($image && CURL::getContents($image, $fichier) && @getimagesize($fichier)) {
        PREPROS::exportFile($fichier);
        if (isset($echecs[$compte])) {
            unset($echecs[$compte]);
            $echecsModifies = true;
        }
        $recuperes++;
        echo "Logo Instagram récupéré : {$compte}\n";
    } else {
        @unlink($fichier);
        $echecs[$compte] = ['date' => date('Y-m-d'), 'raison' => $image ? 'image illisible' : 'photo de profil introuvable (page de connexion, compte privé ou supprimé)'];
        $echecsModifies = true;
        $manquants[] = $c->nom;
        echo "Avertissement : logo Instagram introuvable pour « {$c->nom} » ({$compte}) ; image de remplacement affichée.\n";
    }
}

if ($echecsModifies) ecrire_json(ECHECS_INSTA, $echecs);

printf("%d comités, %d adresse(s) géocodée(s), %d logo(s) récupéré(s)%s\n",
    count($comites), $ajouts, $recuperes, $manquants ? ', sans logo : ' . implode(', ', $manquants) : '');
