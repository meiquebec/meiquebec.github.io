# mouvei.quebec
Mouvement Étudiant Indépendantiste \
https://mouvei.quebec


## Installation

### Dépendances
Les applications suivantes doivent être disponibles dans les paths d'environnement.
* PHP (https://www.php.net/)
* NodeJS (https://nodejs.org/)

### Extensions VS Code recommandées
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (Serveur web intégré)

### Démarrer le projet

```bash
git clone https://github.com/meiquebec/meiquebec.github.io.git
cd meiquebec.github.io
npm install
code .
```

### Commandes NPM

#### npm run watch

Cette commande permet de démarrer le watcher qui compile automatiquement les fichiers Javascript, les feuilles de styles et les templates PHP.

```bash
npm run watch 
```

À noter que cette commande est configurée pour démarrer automatiquement lorsque le projet démarre.

##### .vscode/tasks.json

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"label": "build:watch",
			"type": "shell",
			"command": "node ./scripts/watch.js",
			"isBackground": true,
			"runOptions": {
				"runOn": "folderOpen",
				"instanceLimit": 1
			},
			"presentation": {
				"panel": "shared",
				"group": "build-watch",
				"reveal": "always",
				"showReuseMessage": false
			},
			"problemMatcher": []
		}
	]
}
```

#### npm run build

Cette commande permet de tout recompiler les fichiers sources. (js, scss, php, sitemap.xml)

```bash
npm run build 
```

#### npm run export

Cette commande exporte le projet `src/` vers `dist/` en ne copiant que les fichiers nécéssaires à l'environnement de production.

```bash
npm run export 
```

#### npm run galleries

Cette commande exporte et optimise les galeries photos `assets/images/galleries/*` vers `src/images/galeries/*`

```bash
npm run galleries 
```


#### npm run comites

Cette commande permet de compléter le fichier `src/data/comites.json` avec les informations de géolocalisation nécéssaires à la carte des comités. 

```bash
npm run comites 
```

## À propos
Le Mouvement Étudiant Indépendantiste (MÉI) est une organisation parapluie regroupant plus d’une vingtaine de comités souverainistes dans les cégeps et universités à travers le tout Québec. L’organisation mobilise et représente tous les étudiants en vu de construire un Québec pays.
Le code est ouvert (open source) afin de favoriser la transparence, la réutilisation et les contributions de la communauté.

- Contribuer : propose des idées et correctifs via Issues et Pull Requests.
- Licence : voir le fichier [LICENSE](LICENSE).
- Contact : ouvre une Issue ou [écris-nous ✉](mailto:mouvement.ei@gmail.com).
