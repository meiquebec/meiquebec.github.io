<?php
/**
 * @name     notre-equipe
 * @title    Notre équipe
 * @abstract Découvrez l’équipe du Mouvement Étudiant Indépendantiste : porte-paroles, responsables et bénévoles, ainsi que leurs rôles et parcours.
 * @equipe   _equipe.yaml
 */
?>
<section class="notre-equipe">
    <div>
        <h2>Notre équipe</h2>
        <?php foreach($equipe as $membre): ?>
        <div>
            <div style="background-image: url(../images/equipe/<?php echo $membre->photo; ?>)"></div>
            <div>
                <div><?php echo $membre->nom; ?></div>
                <div><?php echo $membre->poste; ?></div>
                <div><?php echo $membre->bio; ?></div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>