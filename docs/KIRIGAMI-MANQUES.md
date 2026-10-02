# Ce qui manque à Kirigami

Points relevés pendant l'audit, à régler dans le monorepo
`php-kirigami/kirigami` (et à reporter dans son `docs/ROADMAP.md` /
`docs/TODO.md`). K7, K8 et K9 (galeries en codes `{% img-asset %}` dans
Kiri Studio) sont corrigés et attendent leur publication ; les autres ont
un contournement documenté ici.

| # | Manque | Effet sur ce site | Contournement actuel | Proposition |
|---|---|---|---|---|
| K8 | ✅ **Corrigé le 2026-10-02, à publier.** Un bloc de plugin Markdown ne pouvait pas contenir d'autres codes `{% … %}` : `mdhtml` fermait le bloc au premier `%}` | Impossible d'écrire une galerie comme une suite de codes `{% img-asset %}` | — | `php-mdhtml` 0.1.6 : le bloc se ferme sur le `%}` qui équilibre son `{%` ; corps transmis brut. Reste : tag `v0.1.6`, rebuild de `@kirigami/php-wasm`, publication |
| K7 | ✅ **Corrigé le 2026-10-02, à publier.** `IMG::asset()` renvoyait un chemin non encodé (espaces, parenthèses) | Les `src` des photos de téléphone contenaient des espaces | — | php-prepros : URL encodée segment par segment ; noms sur disque inchangés (Sass et plugins média gardent la même convention). Test `test/asset-url.test.js` |
| K9 | ✅ **Corrigé le 2026-10-02, à publier.** Kiri Studio insérait `{% img-asset photo (1).jpeg 800 %}` sans guillemets ; l'argument était coupé à l'espace | Une photo au nom avec espace cassait le code | — | Kiri Studio : chemin entre guillemets dès qu'il contient un espace ou un guillemet (`imageCode()`, testé) |
| K1 | Les scripts (`runenv`) ne voient pas les variables d'environnement du processus | La clé de géocodage ne peut pas venir directement d'un secret GitHub | La CI écrit `secrets.local.yaml`, monté par `mount:` | `scripts[].env: [GEOCODING_API_KEY]` : liste blanche de variables passées au PHP (`getenv()`), jamais tout l'environnement |
| K2 | `prepros.network` est un seul interrupteur pour le rendu **et** les scripts | Activer le réseau pour le géocodage l'active aussi pour toutes les pages | Accepter `network: true` | `scripts[].network: true` indépendant de `prepros.network` |
| K3 | Le watch (`kiri serve` / `kiri watch`) ne relance jamais les scripts `before-build` | Modifier `_data/comites/comites.yaml` en dev ne met pas la carte à jour | `npx kiri run preparer-comites` ou relancer `kiri serve` | `scripts[].watch: [globs]` : relancer le script quand ces fichiers changent, puis re-rendre ce qui dépend de ses sorties |
| K5 | Pas de galerie d'images prête à l'emploi | Le site garde son propre plugin Markdown + Swiper | Plugin `{% galerie %}` local | Éventuel `@kirigami/plugin-gallery` reprenant ce modèle (bloc de codes `{% img-asset %}` → vignettes + grandes images via `IMG::asset()`, modale) — ce site en serait le premier client |
| K6 | La qualité d'encodage de `IMG::asset()` n'est pas réglable | WebP 82 au lieu de 85 pour les galeries | Accepter | Paramètre `image.quality` (global) et/ou argument `quality` |
| K4 | Aucun moyen de lister un dossier depuis PHP sans le copier dans le sandbox | Plus aucun effet depuis que les galeries listent leurs images en codes `{% img-asset %}` | — | `PREPROS::glob($motif)` côté Node (comme `fstat`) ; utile ailleurs, plus pour ce site |
