# TODO — après la migration vers Kirigami

La migration est en ligne depuis le 2026-10-02. Ce qui reste. Retirer une
ligne dès qu'elle est faite.

## 1. Essai dans Kiri Studio (0.5.5, site sur core 3.2.10)

- [ ] Comités : ajouter un comité (vraie adresse, vrai compte Instagram) : épingle, logo et liste dans l'aperçu, sans rien saisir (clé lue dans le `.bin` publié, voir [SCRIPTS.md §4](SCRIPTS.md#4-clés-google))
- [ ] Galeries : déposer une photo dans `galeries/<dossier>/` avec le gestionnaire d'images : elle apparaît dans le carrousel de l'aperçu (core 3.2.10)
- [ ] Médias : ajouter un article avec son lien : sa vignette apparaît toute seule dans l'aperçu
- [ ] Publier : le commit contient `geocodage.json`, la photo Instagram, `vignettes.json` et l'image de l'article ; la CI déploie sans refaire ces recherches
