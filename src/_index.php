<?php
/**
 * @name         index
 * @title        MÉI
 * @abstract     Le Mouvement Étudiant Indépendantiste (MÉI) est une organisation parapluie regroupant plus d’une vingtaine de comités souverainistes dans les cégeps et universités à travers tout le Québec. L’organisation mobilise et représente tous les étudiants en vue de construire un Québec pays.
 *
 * @quisommesnous      _data/accueil/qui-sommes-nous.md
 * @grandsursaut       _data/accueil/le-grand-sursaut-2.md
 * @nosmissions        _data/accueil/nos-missions.md
 * @reverlepays        _data/accueil/rever-le-pays.md
 * @noscollaborateurs  _data/accueil/nos-collaborateurs.md
 * @unpaysenmarche     _data/accueil/un-pays-en-marche.md
 */
?>
<section class="intro-video">
    <div>
        <a target="_blank" rel="noopener noreferrer" href="<?= $formulaire ?>">
            <video playsinline webkit-playsinline autoplay muted loop preload="metadata" poster="<?= IMG::asset('intro.webp') ?>">
                <source src="<?= $relroot ?>videos/intro.webm" type="video/webm">
                <source src="<?= $relroot ?>videos/intro.mp4" type="video/mp4">
            </video>
            <div>
                <div>Embarque</div>
                <div>dans le</div>
                <div>mouvement</div>
            </div>
        </a>
    </div>
</section>
<section class="right qui-sommes-nous">
    <div><?= $quisommesnous ?></div>
</section>
<section>
    <div><?= $grandsursaut ?></div>
</section>
<section class="left nos-missions">
    <div><?= $nosmissions ?></div>
</section>
<section>
    <div><?= $reverlepays ?></div>
</section>
<section class="right nos-collaborateurs">
    <div><?= $noscollaborateurs ?></div>
</section>
<section class="left">
    <div><?= $unpaysenmarche ?></div>
</section>
