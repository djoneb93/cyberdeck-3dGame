# NEO-BXL Voxel

Jeu d'exploration en 3D dans l'univers de **NEO-BXL** (Bruxelles, 2089) : une ville néon en voxels, des personnages en pixel art, une caméra 3D libre.
Tu te réveilles sans trois ans de souvenirs ; Mira t'aide à recoller les morceaux en parlant aux gens de la Zone Zéro.

Le jeu reprend l'univers de l'appli Android **Cyberdeck** (dépôt `djoneb/Cyber-punk-launcher-`) :
la carte de la ville, les fiches des contacts (`dossiers.json`) et les histoires écrites en Ink (`ink/stories.json`), jouées ici avec inkjs.

## Jouer

- En ligne : la version publiée sur claude.ai (privée pour l'instant).
- En local, sur Windows, sans rien installer :

```
powershell -NoProfile -ExecutionPolicy Bypass -File tools/serve.ps1
```

puis ouvre http://localhost:8765/.

## Commandes

- **ZQSD** ou flèches : marcher · **clic** au sol : aller
- **glisser** : tourner et incliner la caméra · **A / E** : pivoter · **molette** : zoom
- **Espace** : parler, examiner, continuer · **1 2 3** : choisir une réponse · **P** : taille des pixels

## Contenu

- Chapitre 1 « Réveil » : retrouver trois fragments de mémoire auprès de Vasko, Doc Ferrant et Okoro.
- Chapitre 2 « Alliés » : les 15 histoires des contacts (Ink), réputation, amitié et fiches qui se dévoilent.
- La ville de la carte de l'appli : 9 lieux, la gare Zéro et son viaduc, le port, le périphérique, le toit de la tour Zéro.

## Organisation

- `index.html` : le jeu (Three.js r128 depuis un CDN, aucune étape de build).
- `tools/serve.ps1` : petit serveur local.
- `.claude/launch.json` : configuration de prévisualisation pour Claude Code.
