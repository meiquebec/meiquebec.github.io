<?php

/**
 * Galerie d'images : le nom d'un dossier de assets/images/galeries/.
 *
 *   {% galerie rever-le-pays %}
 *
 * Toutes les photos du dossier, dans l'ordre de leurs noms. L'équipe ajoute
 * ou retire des photos avec le gestionnaire d'images de Kiri Studio ; l'aperçu
 * suit en direct (le watch de Kirigami re-rend les pages quand une image de
 * image.source change, core 3.2.10).
 *
 * Tout se fait ici, quand la balise est analysée : PREPROS::mount() donne les
 * fichiers réellement présents dans le dossier, et chaque photo passe par
 * IMG::asset() — une grande image (1280×960, contain) et une vignette
 * (240×320, cover), générées seulement si elles manquent ou sont périmées.
 * Sans JavaScript, chaque vignette mène à sa grande image ; gallery.js en fait
 * un carrousel Swiper.
 */
MD::registerPlugin('galerie', function (array $args, string $body): string {
    $nom = trim($args[0] ?? '');
    if ($nom === '' || str_contains($nom, '..')) return '<!-- galerie : nom de dossier manquant -->';

    $source = rtrim(PREPROS::$config->image->source ?? 'assets/images', '/');
    $photos = array_filter(
        array_map('basename', PREPROS::mount("{$source}/galeries/{$nom}/*") ?: []),
        fn($f) => preg_match('/\.(jpe?g|png|gif|webp|avif|heic)$/i', $f)
    );
    natcasesort($photos);
    if (!$photos) {
        error_log("Galerie « {$nom} » : dossier {$source}/galeries/{$nom}/ vide ou introuvable");
        return '<!-- galerie « ' . htmlspecialchars($nom, ENT_QUOTES, 'UTF-8') . ' » vide -->';
    }

    $cartes = [];
    foreach ($photos as $photo) {
        $chemin = "galeries/{$nom}/{$photo}";
        try {
            $grande   = IMG::asset($chemin, 1280, 960, false, PREPROS::$file);
            $vignette = IMG::asset($chemin, 240, 320, true, PREPROS::$file);
        } catch (Throwable $e) {
            error_log("Galerie « {$nom} » : image illisible « {$photo} » ({$e->getMessage()})");
            continue;
        }
        $cartes[] = '<a class="galerie__carte" href="' . htmlspecialchars($grande, ENT_QUOTES, 'UTF-8') . '">'
            . '<img src="' . htmlspecialchars($vignette, ENT_QUOTES, 'UTF-8') . '" alt="" loading="lazy"></a>';
    }

    return $cartes ? '<div class="galerie">' . implode('', $cartes) . '</div>' : '<!-- galerie vide -->';
});
