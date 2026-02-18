<!DOCTYPE html>
<html lang="fr-CA" data-page="<?php echo $this->name; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta property="og:locale" content="fr_CA">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<? echo $this->title; ?> | <?php echo $this->project; ?>">
    <meta property="og:description" content="<?php echo STR::htmlesc($this->abstract); ?>">
    <meta property="og:url" content="<?php echo $this->baseurl . $this->absurl; ?>">
    <meta property="og:image" content="<?php echo $this->baseurl; ?>/images/ogimage.webp">
    <link rel="icon" type="image/x-icon" href="<?php echo $this->relroot; ?>favicon.ico">
    <link rel="stylesheet" href="<?php echo $this->relroot; ?>styles/mei.core.min.css?###TIMESTAMP###">
    <script src="<?php echo $this->relroot; ?>scripts/mei.core.min.js??###TIMESTAMP###"></script>
    <title><? echo $this->title; ?> | <?php echo $this->project; ?></title>
   <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://exemple.org/#organisation",
        "name": "Mouvement Étudiant Indépendantiste",
        "url": "https://mouvei.quebec/",
        "logo": "https://mouvei.quebec/images/ogimage.webp",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "82 Sherbrooke St W 2e étage",
            "addressLocality": "Montréal",
            "addressRegion": "QC",
            "postalCode": "H2X 1X3",
            "addressCountry": "CA"
        },
        "email": "mouvement.ei@gmail.com",
        "sameAs": [
            "https://www.instagram.com/mouv.ei/",
            "https://www.youtube.com/@mouv_ei/"
        ]
    }
    </script>
</head>
<body>
     <header>
        <div>
            <h1 title="Mouvement Étudiant Indépendantiste">
                <a class="brand" href="/#">
                    <div>MOUVEMENT</div>
                    <div>ÉTUDIANT</div>
                    <div>INDÉPENDANTISTE</div>
                </a>
            </h1>
            <nav class="menu">
                <a data-page="medias" href="/medias/">Médias</a>
                <a data-page="notre-equipe" href="/notre-equipe/">Notre équipe</a>
                <a data-page="nous-joindre" href="/nous-joindre/">Nous joindre</a>
                <a target="_blank" href="https://50plus1.quebec/collections/collection-mei-mouvement-etudiant-independantiste">Boutique</a>
                <div class="menu__social-medias">
                    <a target="_blank" href="https://www.instagram.com/mouv.ei/" title="Instagram">
                        <div class="menu__social-medias__instagram"></div>
                    </a>
                    <a target="_blank" href="https://www.youtube.com/@mouv_ei/" title="Youtube">
                        <div class="menu__social-medias__youtube"></div>
                    </a>
                </div>
            </nav>
            <div class="burger"></div>
        </div>
    </header>
    <main>
