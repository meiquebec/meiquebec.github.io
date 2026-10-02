# TODO — migration vers Kirigami

La migration est faite sur la branche `kirigami` (non fusionnée, non
déployée). Ce qui reste, dans l'ordre. Retirer une ligne dès qu'elle est
faite.

## 1. Clés Google (console Google Cloud)

- [ ] Créer une clé **navigateur** : Maps JavaScript API seulement, référents `https://mouvei.quebec/*`, `http://127.0.0.1:*/*`, `http://localhost:*/*` ; la mettre dans `kirigami.yaml` → `kirigami.carte.cle` (tant qu'elle est vide, la carte n'est pas affichée)
- [ ] Créer une clé **géocodage** : Geocoding API seulement ; secret `GEOCODING_API_KEY` du dépôt GitHub, `secrets.local.yaml` chez les développeurs, « Clés du site » dans Kiri Studio
- [ ] Faire une rotation de l'ancienne clé (publique depuis le début) ; supprimer les secrets `GOOGLE_API_KEY` et `MAP_ID` du dépôt

## 2. Publications Kirigami

- [ ] Publier core 3.2.9 (`scripts[].watch`, chemins `mount`/`watch` non intégrés, schéma `studio.secrets`/`studio.publish`) et la cascade cli/mcp/vscode
- [ ] Publier Kiri Studio 0.5.5 (« Clés du site », publication des caches)
- [ ] Monter `@kirigami/cli` du site à la version qui embarque core 3.2.9 : d'ici là, `kirigami.yaml` (avec `watch`, `secrets`, `publish`) n'est valide qu'avec le core du monorepo

## 3. Vérifications avant de fusionner

- [ ] `npm run serve` et contrôle visuel des quatre pages : carrousels des galeries, photos de l'équipe, vignettes des médias, carte (avec la clé navigateur), infobulles des comités
- [ ] Ouvrir `src/_mapstyle/index.html` après un build : le bouton télécharge bien `carte-style-mei.json`
- [ ] Vider `dist/` (ou y créer `.kirigami-export`) avant le premier `npm run export`

## 4. Après la fusion dans `main`

- [ ] Premier déploiement : vérifier que la CI ne géocode rien (tout est en cache) et recommite seulement ce qui a changé
- [ ] Essai de bout en bout dans Studio : ajouter un comité et une photo de galerie → épingle et logo dans l'aperçu → publier → la CI déploie sans refaire le travail

## 5. Ménage

- [ ] `CLAUDE.md` (en français) à partir de `docs/template-CLAUDE.md` du monorepo
- [ ] Réécrire `README.md` (installation, `npm run serve`, scripts, clés, Kiri Studio)
- [ ] Remonter K1, K2, K4, K5, K6 et K10 de [KIRIGAMI-MANQUES.md](KIRIGAMI-MANQUES.md) dans la feuille de route du monorepo
