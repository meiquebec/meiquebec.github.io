<?php
/**
 * @name        nos-comites
 * @title       Nos comités
 * @abstract    Trouvez le comité près de chez vous grâce à la carte, et contactez-nous par nos différents canaux (courriel, réseaux sociaux, etc.).
 * @comites     ../_data/comites/comites.yaml
 * @geocodage   ../_data/comites/geocodage.json
 * @nousjoindre ../_data/comites/nous-joindre.md
 */

// Saisie de l'équipe + coordonnées et logos des caches (src/_plugins/comites.php).
$actifs = comites_actifs($comites, $geocodage ?? []);
$pointes = array_values(array_filter($actifs, fn($c) => $c->position));
?>
<section class="nos-comites">
    <div>
        <h2>Nos comités</h2>
        <h3>Des comités à travers tout le Québec!</h3>
        <?php if ($carte->cle ?? ''): ?>
        <carte-mei data-config="<?= base64_encode(OBF::encode(['cle' => $carte->cle, 'mapid' => $carte->mapid])) ?>" data-comites="<?= htmlspecialchars(json_encode($pointes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) ?>"></carte-mei>
        <?php endif; ?>
        <h3>Liste des comités</h3>
        <ul>
            <?php foreach ($actifs as $comite): ?>
            <li><a target="_blank" rel="noopener noreferrer" href="<?= $comite->instagram ?>"><?= $comite->nom ?></a></li>
            <?php endforeach; ?>
        </ul>
    </div>
</section>

<section class="nous-joindre">
    <div><?= $nousjoindre ?></div>
</section>
