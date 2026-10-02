<?php

/**
 * Galerie d'images, écrite dans Kiri Studio comme un bloc de codes
 * {% img-asset %} (ceux que Studio insère quand on choisit une image) :
 *
 *   {% galerie
 *   {% img-asset "galeries/rever-le-pays/IMG_2738.JPG" 800 %}
 *   {% img-asset "galeries/rever-le-pays/photo (1).jpeg" 800 %}
 *   %}
 *
 * Chaque image passe par IMG::asset() : une grande image (1280×960, contain)
 * et une vignette (240×320, cover). La largeur écrite dans le code est
 * ignorée, pour que toutes les galeries se ressemblent. Sans JavaScript, chaque
 * vignette mène à sa grande image ; gallery.js en fait un carrousel Swiper.
 * Demande php-wasm 8.5.11-4 (un bloc peut contenir d'autres codes {% %}).
 */
MD::registerPlugin('galerie', function (array $args, string $body): string {
    preg_match_all('/\{%\s*img-asset\s+("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|\S+)/', $body, $codes);

    $cartes = [];
    foreach ($codes[1] as $arg) {
        $chemin = in_array($arg[0], ['"', "'"], true) ? stripslashes(substr($arg, 1, -1)) : $arg;
        try {
            $grande   = IMG::asset($chemin, 1280, 960, false, PREPROS::$file);
            $vignette = IMG::asset($chemin, 240, 320, true, PREPROS::$file);
        } catch (Throwable $e) {
            error_log("Galerie : image introuvable « {$chemin} » ({$e->getMessage()})");
            $cartes[] = '<!-- galerie : image introuvable ' . htmlspecialchars($chemin, ENT_QUOTES, 'UTF-8') . ' -->';
            continue;
        }
        $cartes[] = '<a class="galerie__carte" href="' . htmlspecialchars($grande, ENT_QUOTES, 'UTF-8') . '">'
            . '<img src="' . htmlspecialchars($vignette, ENT_QUOTES, 'UTF-8') . '" alt="" loading="lazy"></a>';
    }

    if (!$cartes) return '<!-- galerie vide -->';
    return '<div class="galerie">' . implode('', $cartes) . '</div>';
});
