// État de la partie, sauvegarde, noms et couleurs des personnages, réglages des histoires.
'use strict';

const $=id=>document.getElementById(id);
const SAVE_KEY='neobxl-voxel-save-v1';

/* ===================== ÉTAT ===================== */
const NEW_STATE=()=>({flags:{},friend:{},rep:0,frags:[],met:{},q:{},mems:[],px:47.2,pz:62.6,ry:0,hour:22,mapv:5});
let S=NEW_STATE();
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function loadSave(){try{const r=localStorage.getItem(SAVE_KEY);return r?JSON.parse(r):null}catch(e){return null}}

const NAMES={mira:'Mira « Moth »',vasko:'Vasko',doc:'Doc Ferrant',okoro:'Sergent Okoro',lou:'Lou « Néon »',neura:'NEURA',you:'Toi',nar:''};
const COLORS={mira:'#39e6ff',vasko:'#e26b55',doc:'#8fb59a',okoro:'#d8c49c',lou:'#c88bff',neura:'#7dffb0',you:'#ff8a3d',nar:'#8296a4'};
const FRAG_NAMES={contrat:'Contrat Kurogane',implant:'Cicatrice d’implant',dossier:'Dossier classé'};

const DOSS_ID={doc:'ferrant'};
const STORY_ID={doc:'ferrant'};
// paliers de la fiche (l'appli : 5/10/20/30/40/55/80 points ; ici à l'échelle des cœurs du jeu)
const FICHE_LV={bio1:1,traits:2,bio2:3,gouts:4,bio3:5,toi:7};
const STORY_TITLE={vasko:'Le rat de la gare',mira:'Le faux Moth',doc:'Implants défectueux',lou:'Le morceau volé',okoro:'Le dossier oublié'};
// lieux des trois étapes de chaque histoire dans la Zone Zéro
let SPOTS={}; // posées sur la carte plus bas, devant les entrées des lieux
// souvenirs que NEURA déchiffre après chaque histoire réussie (propositions, à ajuster)
const MEMS={
  vasko:'2086, quai 3. Tu signes un contrat sur la table pliante de Vasko. Il te dit : « Celui-là, tu ne le prends pas pour l’argent. »',
  mira:'Hiver 2087. Mira pleure sur un toit, et tu lui promets qu’« ils » ne l’auront pas. Tu ne sais plus qui sont « ils ».',
  doc:'2088. Une salle blanche, une lumière froide. Une voix compte à rebours en japonais. Puis plus rien.',
  lou:'Printemps 2087. Le club Ondes, trois heures du matin. Lou te passe un casque : « Écoute. C’est toi qui m’as inspiré ce morceau. »',
  okoro:'Été 2088. Tu remets une clé USB à Okoro sous la pluie. « Si je disparais, ouvre-la. » Il ne l’a jamais ouverte.'
};
