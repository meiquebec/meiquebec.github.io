<?php

$desc = htmlspecialchars($this->abstract, ENT_QUOTES, 'UTF-8');
$path = ltrim(str_replace('\\', '/', pathinfo(str_replace(realpath($this->root), '', realpath($this->file)), PATHINFO_DIRNAME)), '/');
if($path) $path .= '/';



?><!DOCTYPE html>
<html lang="fr-CA" data-page="<?php echo $this->name; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta property="og:locale" content="fr_ca">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<? echo $this->title; ?> | <?php echo $this->project; ?>">
    <meta property="og:description" content="<?php echo $desc; ?>">
    <meta property="og:url" content="<?php echo $this->baseurl . $path; ?>">
    <meta property="og:image" content="<?php echo $this->baseurl; ?>images/ogimage.webp">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="stylesheet" href="/styles/mei.core.min.css?<?php echo time(); ?>">
    <script src="/scripts/mei.core.min.js?<?php echo time(); ?>"></script>
    <title><? echo $this->title; ?> | <?php echo $this->project; ?></title>
</head>
<body>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "<?php echo $this->baseurl . $path; ?>",
        "name": "<?php echo $this->title; ?> | <?php echo $this->project; ?>",
        "description": "<?php echo $desc; ?>"
    }
    </script>
    <header>
        <div>
            <a class="brand" href="/#">
                <div>MOUVEMENT</div>
                <div>ÉTUDIANT</div>
                <div>INDÉPENDANTISTE</div>
            </a>
            <nav class="menu">
                <a data-page="medias" href="/medias/">Médias</a>
                <a data-page="notre-equipe" href="/notre-equipe/">Notre équipe</a>
                <a data-page="nous-joindre" href="/nous-joindre/">Nous joindre</a>
                <a target="_blank" href="https://50plus1.quebec/collections/collection-mei-mouvement-etudiant-independantiste">Boutique</a>
                <div class="menu__social-medias">
                    <a target="_blank" href="https://www.instagram.com/mouv.ei/" title="Instagram"><div class="menu__social-medias__instagram"></div></a>
                    <a target="_blank" href="https://www.youtube.com/@mouv_ei/" title="Youtube"><div class="menu__social-medias__youtube"></div></a>
                </div>
            </nav>
            <div class="burger"></div>
        </div>
    </header>
    <main>
