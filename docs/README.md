# docs/

Notes de travail pour faire passer mouvei.quebec (ce dépôt,
`meiquebec/meiquebec.github.io`) de sa chaîne d'outils maison
(`chokibasic` + `sharp`) à un site construit **entièrement** par
[Kirigami](https://github.com/php-kirigami/kirigami).

> Convention de ce dépôt : **tout est en français** (code, commentaires,
> documentation, messages de commit), par exception à la règle habituelle
> des projets Kirigami.

| Fichier | Contenu |
|---|---|
| [AUDIT.md](AUDIT.md) | État du projet au 2026-10-02 : inventaire, chaîne d'outils, défauts, sécurité, dette |
| [MIGRATION.md](MIGRATION.md) | Architecture cible, correspondance `chokibasic` → Kirigami, `kirigami.yaml` cible, plan par étapes |
| [SCRIPTS.md](SCRIPTS.md) | Spécifications des scripts PHP exécutés avant le build (comités : géocodage et logos Instagram, une seule fois puis en cache ; galeries ; clés de la carte) |
| [KIRIGAMI-MANQUES.md](KIRIGAMI-MANQUES.md) | Ce qui manque à Kirigami lui-même pour cette migration — à régler dans le monorepo |
| [TODO.md](TODO.md) | Actions ordonnées, à cocher |

Source auditée : commit `e6aae70` (« Collaborations »), 126 commits.
Versions Kirigami de référence : core 3.2.7, php-prepros 3.2.4, cli 0.1.14.
