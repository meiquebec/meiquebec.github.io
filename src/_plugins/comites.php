<?php

/**
 * Comités : fonctions partagées par scripts/preparer-comites.php et la page
 * nos-comites/_index.php, pour qu'ils calculent les mêmes clés.
 *
 * Les données saisies par l'équipe sont dans _data/comites/comites.yaml ;
 * les coordonnées et les logos viennent de caches générés (voir
 * docs/SCRIPTS.md §1).
 */


// Clé du cache de géocodage : l'adresse en NFC, sans espaces superflus, en
// minuscules. Les accents sont gardés : Google ne les traite pas comme
// équivalents non plus.
function comites_cle_adresse(string $adresse): string
{
    $adresse = Normalizer::normalize($adresse, Normalizer::FORM_C) ?: $adresse;
    return mb_strtolower(preg_replace('/\s+/u', ' ', trim($adresse)));
}


// Identifiant du compte Instagram tiré de l'URL du comité, ou null.
function comites_compte_instagram(string $url): ?string
{
    return preg_match('#instagram\.com/([A-Za-z0-9._]+)#', $url, $m) ? strtolower($m[1]) : null;
}


// Chemin (relatif à image.source) de la photo de profil Instagram en cache.
function comites_logo_instagram(string $compte): string
{
    return "comites/instagram/{$compte}.jpg";
}


// Les comités actifs, triés par nom, prêts pour la liste et la carte :
// nom, instagram, position {lat, lng} (ou null) et logo (URL relative à la
// page, générée par IMG::asset()).
function comites_actifs(array $comites, $geocodage): array
{
    $geocodage = (array) $geocodage;
    $actifs = [];

    foreach ($comites as $c) {
        if (($c->actif ?? true) === false) continue;

        $geo = (array) ($geocodage[comites_cle_adresse($c->adresse)] ?? []);
        $compte = comites_compte_instagram($c->instagram ?? '');

        $source = $c->logo ?? null;
        if (!$source && $compte && PREPROS::fstat(FS::pathJoin(PREPROS::$config->image->source, comites_logo_instagram($compte)))) {
            $source = comites_logo_instagram($compte);
        }

        $actifs[] = (object) [
            'nom'       => $c->nom,
            'instagram' => $c->instagram,
            'position'  => isset($geo['lat'], $geo['lng']) ? ['lat' => $geo['lat'], 'lng' => $geo['lng']] : null,
            'logo'      => $source ? IMG::asset($source, 100, 100, true, PREPROS::$file) : null,
        ];
    }

    usort($actifs, fn($a, $b) => strcmp(STR::normalize(mb_strtolower($a->nom)), STR::normalize(mb_strtolower($b->nom))));
    return $actifs;
}
