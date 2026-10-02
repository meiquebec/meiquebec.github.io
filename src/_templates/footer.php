
        <section class="reseaux-sociaux">
            <div>
                <h2>Réseaux sociaux</h2>
                <p>Suivez-nous sur les différentes plateformes pour les dernières actualités, vidéos et annonces.</p>
                <p class="reseaux-sociaux-liens">
                    <?php foreach (['facebook' => $facebook, 'instagram' => $instagram, 'youtube' => $youtube] as $reseau => $lien): ?>
                    <a class="<?= $reseau ?>" target="_blank" rel="noopener noreferrer" href="<?= $lien ?>" title="<?= ucfirst($reseau) ?>"></a>
                    <?php endforeach; ?>
                </p>
            </div>
        </section>
    </main>
    <footer title="Tous droits réservés © <?= $project ?>, ###YEAR###">
        © Tous droits réservés<br><?= $project ?>, ###YEAR###
    </footer>
</body>
</html>
