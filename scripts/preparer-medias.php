<?php
/**
 * Vignettes des articles de la page Médias (trigger: before-build, relancé
 * dès que articles.yaml change : watch dans kirigami.yaml).
 *
 * L'équipe ne saisit que le titre, le lien, le média et la date. Pour chaque
 * lien jamais vu, le script lit l'image de partage de l'article (og:image,
 * JSON-LD… via SCRAPER) UNE seule fois, la télécharge dans
 * assets/images/medias/ et la note dans src/_data/medias/vignettes.json
 * { "<lien>": { "image": "medias/<fichier>", "date" } } — le cache que lit la
 * page. Un lien sans image trouvée est noté aussi (« echec »), réessayé au
 * plus une fois par semaine ; la page affiche alors l'article sans vignette.
 *
 *   npx kiri run preparer-medias           complète le cache
 *   npx kiri run preparer-medias reprendre  réessaie tout de suite les échecs
 */

const SOURCE   = '/project/src/_data/medias/articles.yaml';
const CACHE_F  = '/project/src/_data/medias/vignettes.json';
const DOSSIER  = '/project/assets/images/medias';
const DELAI    = 7 * 86400;

$reprendre = ($argv[2] ?? '') === 'reprendre';

$articles = YAML::parseFile(SOURCE);
if (!is_array($articles)) STD::error('articles.yaml doit être une liste d\'articles.');

$cache = is_file(CACHE_F) ? (json_decode(file_get_contents(CACHE_F), true) ?: []) : [];
$modifie = false;
$trouvees = 0;
$sans = [];

foreach ($articles as $i => $a) {
    $lien = trim((string) ($a->lien ?? ''));
    $titre = $a->titre ?? ('n° ' . ($i + 1));
    if ($lien === '') STD::error("Article « {$titre} » : le champ « lien » est obligatoire.");

    $entree = $cache[$lien] ?? null;
    if (isset($entree['image'])) continue;   // déjà trouvée une fois : jamais redemandée
    if ($entree && !$reprendre && time() - strtotime($entree['date']) < DELAI) {
        $sans[] = $titre;
        continue;
    }

    $image = null;
    try {
        $metas = SCRAPER::get($lien);
        $image = $metas && !empty($metas->image) ? $metas->image : null;
    } catch (Throwable $e) {
        $image = null;
    }

    if ($image) {
        // Extension d'après l'URL de l'image ; .jpg par défaut (GD lit le contenu, pas le nom).
        $ext = strtolower(pathinfo(parse_url($image, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'], true)) $ext = 'jpg';
        $fichier = STR::shorthash($lien) . ".{$ext}";
        if (!is_dir(DOSSIER)) mkdir(DOSSIER, 0777, true);
        if (CURL::getContents($image, DOSSIER . "/{$fichier}") && @getimagesize(DOSSIER . "/{$fichier}")) {
            PREPROS::exportFile(DOSSIER . "/{$fichier}");
            $cache[$lien] = ['image' => "medias/{$fichier}", 'date' => date('Y-m-d')];
            $modifie = true;
            $trouvees++;
            echo "Vignette trouvée : {$titre}\n";
            continue;
        }
        @unlink(DOSSIER . "/{$fichier}");
    }

    $cache[$lien] = ['echec' => $image ? 'image illisible' : 'aucune image de partage trouvée', 'date' => date('Y-m-d')];
    $modifie = true;
    $sans[] = $titre;
    echo "Avertissement : pas de vignette pour « {$titre} » ; l'article s'affiche sans image.\n";
}

if ($modifie) {
    ksort($cache);
    file_put_contents(CACHE_F, json_encode((object) $cache, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n");
    PREPROS::exportFile(CACHE_F);
}

printf("%d articles, %d vignette(s) trouvée(s)%s\n", count($articles), $trouvees, $sans ? ', sans vignette : ' . implode(' ; ', $sans) : '');
