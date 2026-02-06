<?php
const RN = "\r\n";
const EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'webp'];

$SRCDIR = realpath(__DIR__ . '/../assets/galleries') . '/';
$DSTDIR = realpath(__DIR__ . '/../src/images/galeries') . '/';
$JSONFILE = realpath(__DIR__ . '/../src'). '/galleries.json';

rrmdir($DSTDIR, false);


$galleries = [];

foreach(glob($SRCDIR . '*', GLOB_ONLYDIR) as $dir) {
    $gallery_name = strtolower(pathinfo($dir, PATHINFO_FILENAME));
    mkdir($DSTDIR . $gallery_name, 0777, true);

    $files = [];
    foreach(glob($dir . '/*') as $src) {
        if(!in_array(strtolower(pathinfo($src, PATHINFO_EXTENSION)), EXTENSIONS)) continue;
        $dst = $DSTDIR . $gallery_name . '/' . pathinfo($src, PATHINFO_FILENAME) . '.webp';
        $dsttb = $DSTDIR . $gallery_name . '/' . pathinfo($src, PATHINFO_FILENAME) . '_tb.webp';
        
        echo $src.RN;
        gdresize($src, $dst, 800, 600, false);
        gdresize($src, $dsttb, 300, 400, true);
        
        $files[] = [
            'src' => '/images/galeries/' . $gallery_name . '/' . pathinfo($dst, PATHINFO_BASENAME),
            'tbn' => '/images/galeries/' . $gallery_name . '/' . pathinfo($dsttb, PATHINFO_BASENAME),
        ];
    }

    $galleries[] = [
        'name' => $gallery_name,
        'files' => $files
    ];
}

file_put_contents($JSONFILE, json_encode($galleries, JSON_PRETTY_PRINT));


/**
 * Resize GD en gardant le ratio.
 *
 * - $cover=true  => scale "cover": l'image devient assez grande pour couvrir (CSS cover rognera)
 * - $cover=false => scale "contain": l'image fit dans la boîte sans dépasser
 *
 * Output = image redimensionnée (dimensions calculées), pas un canvas fixe.
 */
function gdresize(string $srcPath, string $outPath, int $dstW, int $dstH, bool $cover = true): bool
{
    if ($dstW <= 0 || $dstH <= 0) return false;
    if (!is_file($srcPath) || !is_readable($srcPath)) return false;

    $info = @getimagesize($srcPath);
    if (!$info) return false;

    [$srcW, $srcH, $type] = $info;
    if ($srcW <= 0 || $srcH <= 0) return false;

    // ---- Load source
    $src = match ($type) {
        IMAGETYPE_JPEG => @imagecreatefromjpeg($srcPath),
        IMAGETYPE_PNG  => @imagecreatefrompng($srcPath),
        IMAGETYPE_GIF  => @imagecreatefromgif($srcPath),
        IMAGETYPE_WEBP => (function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($srcPath) : null),
        default => null,
    };
    if (!$src) return false;

    $srcRatio = $srcW / $srcH;
    $dstRatio = $dstW / $dstH;

    if ($cover) {
        // ===== COVER: crop dans la source pour matcher le ratio, puis resize en dstW x dstH
        if ($srcRatio > $dstRatio) {
            // source trop large -> crop gauche/droite
            $cropH = $srcH;
            $cropW = (int) round($srcH * $dstRatio);
        } else {
            // source trop haute -> crop haut/bas
            $cropW = $srcW;
            $cropH = (int) round($srcW / $dstRatio);
        }

        $srcX = (int) max(0, floor(($srcW - $cropW) / 2));
        $srcY = (int) max(0, floor(($srcH - $cropH) / 2));

        $outW = $dstW;
        $outH = $dstH;

        $dst = imagecreatetruecolor($outW, $outH);
        if (!$dst) return false;

        _gdPrepareCanvas($dst, $type);

        $ok = imagecopyresampled(
            $dst, $src,
            0, 0,
            $srcX, $srcY,
            $outW, $outH,
            $cropW, $cropH
        );

    } else {
        // ===== CONTAIN: aucun crop, l'image finale fit dans dstW x dstH (output = newW x newH)
        $scale = min($dstW / $srcW, $dstH / $srcH);

        $outW = (int) max(1, round($srcW * $scale));
        $outH = (int) max(1, round($srcH * $scale));

        $dst = imagecreatetruecolor($outW, $outH);
        if (!$dst) return false;

        _gdPrepareCanvas($dst, $type);

        $ok = imagecopyresampled(
            $dst, $src,
            0, 0,
            0, 0,
            $outW, $outH,
            $srcW, $srcH
        );
    }

    if (!$ok) return false;

    // ---- Ensure output dir
    $dir = dirname($outPath);
    if ($dir && !is_dir($dir)) @mkdir($dir, 0775, true);

    // ---- Save based on outPath extension (fallback to source type)
    $ext = strtolower(pathinfo($outPath, PATHINFO_EXTENSION));
    $saved = _gdSave($dst, $outPath, $ext, $type);

    // Libération mémoire: PHP 8+ va GC; unset est suffisant (imagedestroy déprécié en 8.5)
    unset($src, $dst);

    return $saved;
}

function _gdPrepareCanvas($img, int $type): void
{
    $hasAlpha = in_array($type, [IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF], true);

    if ($hasAlpha) {
        imagealphablending($img, false);
        imagesavealpha($img, true);
        $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
        imagefilledrectangle($img, 0, 0, imagesx($img), imagesy($img), $transparent);
    } else {
        // fond blanc pour jpeg
        $white = imagecolorallocate($img, 255, 255, 255);
        imagefilledrectangle($img, 0, 0, imagesx($img), imagesy($img), $white);
    }
}

function _gdSave($img, string $outPath, string $ext, int $srcType): bool
{
    return match ($ext) {
        'jpg', 'jpeg' => imagejpeg($img, $outPath, 85),
        'png'         => imagepng($img, $outPath, 6),
        'gif'         => imagegif($img, $outPath),
        'webp'        => (function_exists('imagewebp') ? imagewebp($img, $outPath, 85) : false),
        default       => match ($srcType) {
            IMAGETYPE_JPEG => imagejpeg($img, $outPath, 85),
            IMAGETYPE_PNG  => imagepng($img, $outPath, 6),
            IMAGETYPE_GIF  => imagegif($img, $outPath),
            IMAGETYPE_WEBP => (function_exists('imagewebp') ? imagewebp($img, $outPath, 85) : false),
            default        => false,
        }
    };
}


function rrmdir(string $dir, bool $removeSelf = true): bool
{
    if (!file_exists($dir)) return true;

    // Si c'est un fichier ou un lien, on unlink (et removeSelf n'a pas vraiment de sens ici)
    if (is_file($dir) || is_link($dir)) {
        return @unlink($dir);
    }

    $items = @scandir($dir);
    if ($items === false) return false;

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;

        $path = $dir . DIRECTORY_SEPARATOR . $item;

        // Important: si c'est un symlink, on le traite comme un fichier (on ne descend pas dedans)
        if (is_dir($path) && !is_link($path)) {
            if (!rrmdir($path, true)) return false; // on supprime toujours les sous-dossiers eux-mêmes
        } else {
            if (!@unlink($path)) return false;
        }
    }

    return $removeSelf ? @rmdir($dir) : true;
}