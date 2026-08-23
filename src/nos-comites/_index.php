<?php
/**
 * @name     nos-comites
 * @title    Nos comités
 * @abstract Trouvez le comité près de chez vous grâce à la carte, et contactez-nous par nos différents canaux (courriel, réseaux sociaux, etc.).
 * @comites  comites.json
 */
?>
<section class="nos-comites">
    <div>
        <h2>Nos comités</h2>
        <h3>Des comités à travers tout le Québec!</h3>
        <carte-mei></carte-mei>
        <h3>Liste des comités</h3>
        <ul>
            <?php foreach($comites as $comite):?>
                <li><a target="_blank" noopener noreferrer href="<?php echo $comite->instagram; ?>"><?php echo $comite->name; ?></a></li>
            <?php endforeach; ?>
        </ul>    
    </div>
</section>

<section class="nous-joindre">
    <div>
        <markdown>
            ## Nous joindre
            Pour nous joindre, veuillez nous écrire à  l’adresse: [mouvement.ei@gmail.com](mailto:mouvement.ei@gmail.com).

            ### Nos coordonnées
            Nos locaux sont situés dans la bâtisse de la [Société Saint-Jean-Baptiste](https://ssjb.com/) à l'adresse suivante:
            [82 Rue Sherbrooke Ouest, Montréal, QC H2X 1X3](https://maps.app.goo.gl/TZQZsPi8hs53USj96)
        </markdown>
    </div>
</section>