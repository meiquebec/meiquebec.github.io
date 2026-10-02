# TODO — après la migration vers Kirigami

La migration est en ligne depuis le 2026-10-02. Ce qui reste. Retirer une
ligne dès qu'elle est faite.

## 1. Essai dans Kiri Studio (0.5.5)

- [ ] Ouvrir le site dans Studio, ajouter un comité et une photo de galerie : épingle, logo et photo visibles dans l'aperçu, sans rien saisir (clé lue dans le `.bin` publié, voir [SCRIPTS.md §3](SCRIPTS.md#3-clés-google))
- [ ] Publier : vérifier que le commit contient aussi `geocodage.json` et la photo Instagram, et que la CI déploie sans refaire le géocodage

## 2. Ménage

- [ ] `CLAUDE.md` (en français) à partir de `docs/template-CLAUDE.md` du monorepo
- [ ] Réécrire `README.md` (installation, `npm run serve`, scripts, clés, Kiri Studio)
- [ ] Supprimer le dossier local `src/test/` (brouillon) : il ajoute `/test/` au `sitemap.xml` à chaque build local
- [ ] Remonter K1, K2, K4, K5, K6 et K10 de [KIRIGAMI-MANQUES.md](KIRIGAMI-MANQUES.md) dans la feuille de route du monorepo
