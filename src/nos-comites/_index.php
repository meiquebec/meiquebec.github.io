<?php
/**
 * @name     nos-comites
 * @title    Nos comités
 * @abstract Trouvez le comité près de chez vous grâce à la carte, et contactez-nous par nos différents canaux (courriel, réseaux sociaux, etc.).
 * @indent   8
 */

$comites = json_decode(file_get_contents(__DIR__ . '/comites.json'));
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
        <h2>Nous joindre</h2>
        <p>Pour nous joindre, veuillez nous écrire à  l’adresse: <a href="mailto:mouvement.ei@gmail.com">mouvement.ei@gmail.com</a>.</p>
        <h3>Nos coordonnées</h3>
        <p>Nos locaux sont situés dans la bâtisse de la <a target="_blank" noopener noreferrer href="https://ssjb.com/">Société Saint-Jean-Baptiste</a> à l'adresse suivante:<br><a target="_blank" noopener noreferrer href="https://maps.app.goo.gl/TZQZsPi8hs53USj96">82 Rue Sherbrooke Ouest, Montréal, QC H2X 1X3</a></p>
    </div>
</section>