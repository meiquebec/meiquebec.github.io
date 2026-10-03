# mouvei.quebec

Site du Mouvement Étudiant Indépendantiste (MÉI) : <https://mouvei.quebec>

Le MÉI est une organisation parapluie regroupant plus d’une vingtaine de
comités souverainistes dans les cégeps et universités à travers tout le
Québec. Le code est ouvert pour favoriser la transparence, la réutilisation et
les contributions de la communauté.

Le site est construit avec [Kirigami](https://github.com/php-kirigami/kirigami) :
des gabarits PHP compilés en HTML statique, sans serveur PHP. Le contenu
(textes, équipe, médias, comités, photos) s'édite dans
[Kiri Studio](https://github.com/php-kirigami/kiri-studio), sans terminal ni Git.

## Démarrer

Il faut [Node.js](https://nodejs.org/) 24 ou plus ; PHP n'est pas à installer.

```bash
git clone https://github.com/meiquebec/meiquebec.github.io.git
cd meiquebec.github.io
npm install
npm run serve
```

Le site est alors sur <http://127.0.0.1:4321> et se recharge à chaque
modification. Extension VS Code recommandée :
[Kirigami](https://marketplace.visualstudio.com/items?itemName=php-kirigami.kirigami-vscode)
(construction, aperçu, scripts depuis la barre d'état).

### Commandes

| Commande | Rôle |
|---|---|
| `npm run serve` | Construit, puis sert le site et le recharge à chaque changement |
| `npm run build` | Une construction de développement (HTML à côté des sources) |
| `npm run export` | Construction de production dans `dist/` |
| `npm run comites` | Complète les coordonnées et les logos des comités |

## Où modifier quoi

| Je veux changer… | Je modifie… |
|---|---|
| Un texte de l'accueil | `src/_data/accueil/*.md` |
| Une galerie de photos | déposer les photos dans `assets/images/galeries/<dossier>/` (le Markdown ne contient que `{% galerie <dossier> %}`) |
| L'équipe | `src/_data/equipe/equipe.yaml` |
| Les articles de presse | `src/_data/medias/articles.yaml` (titre, lien, média, date : la vignette se trouve toute seule) |
| Les comités | `src/_data/comites/comites.yaml` (nom, adresse, Instagram : la position sur la carte et le logo se trouvent tout seuls) |
| L'apparence | `src/styles/` (Sass) |

Les images d'origine sont dans `assets/images/` ; `src/images/` est généré,
il ne s'édite jamais à la main.

## Clés Google (carte et géocodage)

Aucune clé n'est dans le dépôt. En CI, elles viennent du secret GitHub
`GOOGLE_API_KEY` ; ailleurs, le site lit celle que chaque déploiement publie.
Un développeur peut aussi créer un fichier `secrets.local.yaml`, ignoré par
git :

```yaml
geocodage: "AIza…"
carte: "AIza…"
```

## Déploiement

Chaque push sur `main` déclenche le workflow
`.github/workflows/pages.yml`, qui construit le site et le publie sur GitHub
Pages.

## Documentation

Le détail du fonctionnement est dans [`docs/`](docs/README.md), et les
conventions du projet dans [`CLAUDE.md`](CLAUDE.md).

## Contribuer

- Proposer des idées et des correctifs avec des
  [Issues](https://github.com/meiquebec/meiquebec.github.io/issues) et des
  Pull Requests.
- Licence : voir le fichier [LICENSE](LICENSE).
- Contact : [mouvement.ei@gmail.com](mailto:mouvement.ei@gmail.com).
