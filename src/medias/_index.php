<?php
/**
 * @name     medias
 * @title    Médias
 * @abstract Retrouvez les articles, entrevues et reportages qui parlent du Mouvement Étudiant Indépendantiste : presse, radio, télé et web.
 * @articles _articles.yaml
 */
?>
<section class="medias">
    <div>
        <h2>Médias</h2>
        <div>
            <?php foreach($articles as $article): ?><a target="_blank" noopener noreferrer title="<?php echo $article->titre; ?>" href="<?php echo $article->lien; ?>">
                <img src="../images/medias/<?php echo $article->image; ?>">
                <div><?php echo $article->titre; ?></div>
                <div>
                    <div><?php echo $article->media; ?></div>
                    <div><?php echo $article->date; ?></div>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>