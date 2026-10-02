<!DOCTYPE html>
<html lang="fr-CA" data-page="<?= $name ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="icon" type="image/x-icon" href="<?= $relroot ?>favicon.ico">
</head>
<body>
     <header>
        <div>
            <h1 title="<?= $project ?>">
                <a class="brand" href="<?= $relroot ?>">
                    <div>MOUVEMENT</div>
                    <div>ÉTUDIANT</div>
                    <div>INDÉPENDANTISTE</div>
                </a>
            </h1>
            <nav class="menu">
                <a data-page="medias" href="<?= $relroot ?>medias/">Médias</a>
                <a data-page="notre-equipe" href="<?= $relroot ?>notre-equipe/">Notre équipe</a>
                <a data-page="nos-comites" href="<?= $relroot ?>nos-comites/">Nos comités</a>
                <a target="_blank" rel="noopener noreferrer" href="<?= $boutique ?>">Boutique</a>
                <div class="menu__social-medias">
                    <a target="_blank" rel="noopener noreferrer" href="<?= $instagram ?>" title="Instagram">
                        <div class="menu__social-medias__instagram"></div>
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href="<?= $youtube ?>" title="Youtube">
                        <div class="menu__social-medias__youtube"></div>
                    </a>
                </div>
            </nav>
            <div class="burger"></div>
        </div>
    </header>
    <main>
