// Où sont les personnages, et où mènent leurs pistes, selon l'épisode de leur histoire.
// Le premier épisode garde les lieux d'origine (dehors). Ensuite, chacun se déplace là où son histoire continue :
// le métro, l'entrepôt du port, le club, le bunker, le hall de la tour, la laverie, le Néon Noir…
// Quand quelqu'un change de lieu, il t'envoie un message sur le téléphone. NEURA écrit aussi quand un souvenir revient.
'use strict';

// lieux des personnages : [épisode 1, épisode 2, épisode 3] ; null = sa place d'origine
const HAUNTS={
  mira:[null,{zone:'in_roofs',dx:-1.5,dz:-1,lab:'dans le hall de la tour des Toits'},{zone:'in_bunker',dx:-2,dz:-1,lab:'au Bunker Zéro'}],
  vasko:[null,{zone:'in_metro',dx:-6,dz:1.5,lab:'sur le quai du métro'},{zone:'in_port',dx:-5.2,dz:-2.6,lab:'à l’entrepôt 7 du port'}],
  doc:[null,{zone:'in_market',dx:2,dz:-1,lab:'au Bazar souterrain'},{zone:'in_metro',dx:6,dz:1.5,lab:'sur le quai du métro'}],
  lou:[null,{zone:'in_club',dx:-2,dz:-2,lab:'sur la piste du club Ondes'},{zone:'in_arcade',dx:2,dz:-1.5,lab:'à l’Arcade Pixel'}],
  okoro:[null,{zone:'in_laundry',dx:-2.5,dz:0,lab:'à la laverie 24/7'},{zone:'in_bar',dx:3,dz:-.5,lab:'au Néon Noir'}]};
// pistes des épisodes 2 et 3 (le premier garde SPOTS, dans js/map.js)
const EP_SPOTS_DEF={
  vasko:[null,[{zone:'in_metro',dx:9,dz:-3,lab:'Le quai du métro'},{zone:'in_bar',dx:-3,dz:1,lab:'Une table au Néon Noir'},{x:()=>GX+1.3,z:()=>GZ1-1.6,lab:'Le casier du quai 6'}],
    [{zone:'in_port',dx:-3.5,dz:-6,lab:'Le quai de chargement · entrepôt 7'},{zone:'in_port',dx:3.3,dz:3.2,lab:'Le conteneur KRGN'},{x:()=>METRO_W.x+1.6,z:()=>METRO_W.z,lab:'La sortie du métro, derrière la tour'}]],
  mira:[null,[{x:()=>9.3+HX,z:()=>4.4+HZ,lab:'Ton terminal'},{zone:'in_roofs',dx:2,dz:0,lab:'Le hall de la tour des Toits'},{roof:true,x:()=>ROOF.x+1,z:()=>ROOF.z+1.1,lab:'L’antenne du toit'}],
    [{zone:'in_bunker',dx:2,dz:-2,lab:'La salle des serveurs du Bunker'},{zone:'in_arcade',dx:-3,dz:-2,lab:'Une borne de l’Arcade Pixel'},{roof:true,x:()=>ROOF.x+1,z:()=>ROOF.z+1.1,lab:'L’antenne du toit'}]],
  doc:[null,[{zone:'in_market',dx:-3,dz:-1,lab:'Le Bazar souterrain'},{zone:'in_laundry',dx:2,dz:-1,lab:'La laverie 24/7'},{fp:['lab',1.3,2.6],lab:'Devant le parking-labo'}],
    [{zone:'in_market',dx:3,dz:1,lab:'La clinique du Bazar souterrain'},{zone:'in_metro',dx:-9,dz:-3,lab:'Le quai du métro'},{fp:['market',1.2,-3],lab:'L’allée du Bazar'}]],
  lou:[null,[{zone:'in_club',dx:-3,dz:-2,lab:'La piste du club Ondes'},{zone:'in_port',dx:-8,dz:-4,lab:'Les rayonnages de l’entrepôt 7'},{zone:'in_arcade',dx:3,dz:1,lab:'L’Arcade Pixel'}],
    [{zone:'in_bar',dx:4,dz:-2,lab:'Le juke-box du Néon Noir'},{zone:'in_club',dx:2,dz:-3,lab:'La cabine du DJ'},{roof:true,x:()=>ROOF.x-1,z:()=>ROOF.z+1.4,lab:'Le toit de la tour des Toits'}]],
  okoro:[null,[{zone:'in_laundry',dx:-2,dz:-1.5,lab:'L’arrière-salle de la laverie'},{fp:['comm',1.3,-1.2],lab:'L’ancien commissariat'},{zone:'in_metro',dx:13,dz:-3,lab:'Le bout du quai du métro'}],
    [{fp:['comm',1.3,1.2],lab:'L’arrière-cour du commissariat'},{zone:'in_port',dx:8.4,dz:-4.2,lab:'Le quai 8 de l’entrepôt'},{zone:'in_bar',dx:-2,dz:2,lab:'Le Néon Noir'}]]};

// point libre le plus proche dans une pièce (pas dans un meuble, pas contre un mur)
function freeIn(zone,x,z){const Z=ZONES[zone];if(!Z)return {x,z};
  const ok=(px,pz)=>Math.abs(px-Z.x)<Z.hw-.3&&Math.abs(pz-Z.z)<Z.hd-.3&&!Z.blocks.some(([cx,cz,hx,hz])=>Math.abs(px-cx)<hx+.5&&Math.abs(pz-cz)<hz+.5);
  if(ok(x,z))return {x,z};for(let r=.3;r<6;r+=.3)for(let k=0;k<16;k++){const a=k/16*Math.PI*2,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(ok(px,pz))return {x:px,z:pz}}return {x,z}}
let EP_SPOTS=null;
function epSpots(){if(EP_SPOTS)return EP_SPOTS;EP_SPOTS={};
  for(const id in EP_SPOTS_DEF)EP_SPOTS[id]=EP_SPOTS_DEF[id].map(list=>list&&list.map(s=>{
    if(s.zone){const Z=ZONES[s.zone],p=freeIn(s.zone,Z.x+s.dx,Z.z+s.dz);return {zone:s.zone,x:p.x,z:p.z,lab:s.lab}}
    if(s.fp){const p=FP(...s.fp);return {x:p.x,z:p.z,lab:s.lab}}
    return {x:s.x(),z:s.z(),roof:s.roof,lab:s.lab}}));
  return EP_SPOTS}
// la piste b de l'épisode en cours
function spotOf(id,b){const ep=epOf(id);if(ep===0||!EP_SPOTS_DEF[id])return SPOTS[id][b];const L=epSpots()[id][Math.min(ep,2)];return L?L[b]:SPOTS[id][b]}

// ---- les personnages se déplacent ----
const npcZone=n=>n.zone||null;
function hauntOf(id){const ep=Math.min(epOf(id),2);if(id==='mira'&&!S.flags.chapter2)return null; // Mira reste à la planque tant que le chapitre 2 n'est pas fini
  return HAUNTS[id]&&HAUNTS[id][ep]}
function placeNpc(n){const h=hauntOf(n.id),key=h?h.zone+h.dx:'home';if(n._hk===key)return false;const first=n._hk==null;n._hk=key;
  if(!h){n.zone=null;n.mesh.position.set(n.x,0,n.z);n.baseRy=n.ry}
  else{const Z=ZONES[h.zone],p=freeIn(h.zone,Z.x+h.dx,Z.z+h.dz);n.zone=h.zone;n.mesh.position.set(p.x,Z.y,p.z);n.baseRy=Math.atan2(Z.x-p.x,Z.z+Z.hd-p.z)} // tourné vers l'entrée
  n.mesh.userData.ry=n.baseRy;n.mesh.visible=true;
  if(!first&&h&&S.met[n.id])phoneMsg(n.id,MOVE_LINES[n.id](h.lab));
  return true}
const MOVE_LINES={
  mira:l=>'Je ne suis plus à la planque. Rejoins-moi '+l+'. Viens seul·e.',
  vasko:l=>'Changement de quai. Je t’attends '+l+'. Pas de questions au téléphone.',
  doc:l=>'Mon cabinet a bougé. Tu me trouveras '+l+'. Ordonnance du Doc : viens vite.',
  lou:l=>'Nouveau spot ! Je suis '+l+'. Ramène tes oreilles.',
  okoro:l=>'Collègue. Rendez-vous '+l+'. Je t’expliquerai sur place.'};

// ---- messages du téléphone ----
function phoneMsg(from,text){S.msgs=S.msgs||[];S.msgs.push({f:from,t:text,h:S.hour||0,r:false});if(S.msgs.length>40)S.msgs.shift();save();
  toast('✉ Message · '+(NAMES[from]||from),'mem');if(typeof renderPhone==='function'&&phoneOpen)renderPhone()}
let hauntT=0,lastFrags=null;
function updateHaunts(dt){hauntT+=dt;if(hauntT<.5||!started)return;hauntT=0;
  const ms=JSON.stringify(S.motoStyle||{});if(ms!==updateHaunts.ms){updateHaunts.ms=ms;applyMotoStyle()} /* la couleur de la moto, après un chargement */
  npcs.forEach(placeNpc);
  const n=(S.frags||[]).length+(S.mems||[]).length;if(lastFrags!=null&&n>lastFrags)phoneMsg('neura','Un nouveau souvenir vient d’être déchiffré. Je l’ai rangé dans ton journal. Tu te rapproches.');lastFrags=n;
  if(!S.flags.msgHello&&S.flags.started){S.flags.msgHello=true;phoneMsg('neura','Bonjour. Je reste avec toi sur ce téléphone. Touche F pour me retrouver, et ouvre le Journal pour suivre ce que tu as vécu.')}
}
