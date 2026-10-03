<?php
/**
 * @name      medias
 * @title     Médias
 * @abstract  Retrouvez les articles, entrevues et reportages qui parlent du Mouvement Étudiant Indépendantiste : presse, radio, télé et web.
 * @articles  ../_data/medias/articles.yaml
 * @vignettes ../_data/medias/vignettes.json
 */

// Du plus récent au plus ancien, quel que soit l'ordre de saisie.
usort($articles, fn($a, $b) => strcmp((string) $b->date, (string) $a->date));

// Vignette de chaque article : trouvée une fois par scripts/preparer-medias.php.
$vignettes = (array) ($vignettes ?? []);
$vignette = fn($article) => ((array) ($vignettes[$article->lien] ?? []))['image'] ?? null;
?>
<section class="medias">
    <div>
        <h2>Médias</h2>
        <div>
            <?php foreach ($articles as $article): ?><a target="_blank" rel="noopener noreferrer" title="<?= htmlspecialchars($article->titre) ?>" href="<?= $article->lien ?>">
                <?php if ($image = $vignette($article)): ?>
                <img asset="<?= htmlspecialchars($image) ?>" width="640" alt="" loading="lazy">
                <?php endif; ?>
                <div><?= $article->titre ?></div>
                <div>
                    <div><?= $article->media ?></div>
                    <div><?= date_fr((string) $article->date) ?></div>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
