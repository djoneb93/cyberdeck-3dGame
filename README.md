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
- **Espace** : parler, examiner, continuer · **1 2 3** : choisir une réponse · **P** : taille des pixels · **M** : aperçu de la météo suivante

## Contenu

- Chapitre 1 « Réveil » : retrouver trois fragments de mémoire auprès de Vasko, Doc Ferrant et Okoro.
- Chapitre 2 « Alliés » : les 15 histoires des contacts (Ink), réputation, amitié et fiches qui se dévoilent.
- La ville de la carte de l'appli : 9 lieux, la gare Zéro et son viaduc, le port, le périphérique, le toit de la tour Zéro.

## Organisation

Aucune étape de build : Three.js r128 et inkjs viennent d'un CDN, les scripts sont chargés dans l'ordre par `index.html`
et partagent la même portée globale.

- `index.html` : la page (HUD, boîtes de dialogue, écrans d'intro et de fin) et l'ordre de chargement des scripts.
- `css/style.css` : l'interface.
- `js/data/app-data.js` : données reprises de l'appli (fiches contacts, histoires, histoires Ink compilées, ambiances des lieux).
- `js/core.js` : état de la partie, sauvegarde, noms et couleurs des personnages.
- `js/map.js` : la carte (grille, avenues, lieux, tours, port, gare, planque, collisions, étapes des histoires).
- `js/render.js` : moteur 3D, matériaux, façades, enseignes, sprites pixel des personnages.
- `js/architecture.js` : façades réalistes (verre, béton, brique, métal, résidentiel) et formes variées des tours.
- `js/landmarks.js` : silhouettes et animations des lieux importants (salle de concert, marché couvert, bar, arcade, laverie, entrepôt, bunker, commissariat).
- `js/world.js` : construction du monde (sol, ciel, bâtiments, port, viaduc, immeuble de la planque).
- `js/streets.js` : rues et sol (asphalte et dalles texturés, flaques, plaques d'égout, mobilier urbain, feux tricolores, câbles, tags).
- `js/vehicles.js` : voitures flottantes (berline, sportive, utilitaire), taxi, rame TGV.
- `js/station.js` : la gare Zéro en détail (quais, verrière, tableau des départs, horloge, kiosque).
- `js/life.js` : la ville vivante (enseignes verticales, liserés néon, projecteurs, drones, vapeur, fenêtres).
- `js/taxi.js` : le taxi volant et sa visite commentée de la ville.
- `js/weather.js` : la météo, qui change toutes les 3 heures (touche M : aperçu).
- `js/doors.js` : portes des lieux importants (portes vitrées coulissantes, vue intérieure animée).
- `js/story.js` : dialogues du jeu et moteur des histoires des contacts (Ink).
- `js/entities.js` : personnages, objets à examiner, passants, voitures, marqueurs.
- `js/game.js` : déplacement, interactions, HUD, boucle de jeu, démarrage.
- `tools/serve.ps1` : petit serveur local.
- `.claude/launch.json` : configuration de prévisualisation pour Claude Code.
