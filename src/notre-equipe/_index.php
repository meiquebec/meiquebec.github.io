<?php
/**
 * @name     notre-equipe
 * @title    Notre équipe
 * @abstract Découvrez l’équipe du Mouvement Étudiant Indépendantiste : porte-paroles, responsables et bénévoles, ainsi que leurs rôles et parcours.
 * @equipe   ../_data/equipe/equipe.yaml
 */
?>
<section class="notre-equipe">
    <div>
        <h2>Notre équipe</h2>
        <?php foreach ($equipe as $membre): ?>
        <div>
            <img asset="<?= htmlspecialchars($membre->photo) ?>" width="240" alt="<?= htmlspecialchars($membre->nom) ?>" loading="lazy">
            <div>
                <div><?= $membre->nom ?></div>
                <div><?= $membre->poste ?></div>
                <div><?= $membre->bio ?></div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>
