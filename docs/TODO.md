# TODO — migration vers Kirigami

La migration est faite sur la branche `kirigami` (non fusionnée, non
déployée). Ce qui reste, dans l'ordre. Retirer une ligne dès qu'elle est
faite.

## 1. Clés Google (recommandé, ne bloque plus rien)

La clé actuelle sert à la carte et au géocodage, sans être commitée : la
CI la prend dans les secrets existants (`GOOGLE_API_KEY`), les postes dans
`secrets.local.yaml` (voir [SCRIPTS.md §3](SCRIPTS.md#3-clés-de-la-carte)).

- [ ] Créer une clé **navigateur** (Maps JavaScript API seulement, référents `https://mouvei.quebec/*`, `http://127.0.0.1:*/*`, `http://localhost:*/*`) et la mettre dans le secret `GOOGLE_API_KEY`
- [ ] Créer une clé **géocodage** (Geocoding API seulement) : nouveau secret `GEOCODING_API_KEY`
- [ ] Faire une rotation de l'ancienne clé (publique depuis le début) ; supprimer le secret `MAP_ID`, devenu inutile
- [ ] Saisir les deux clés dans « Clés du site » de Kiri Studio, sur le poste de l'équipe

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
