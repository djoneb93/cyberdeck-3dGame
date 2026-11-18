// Touches personnalisables (Paramètres → Commandes). Chaque action a une touche par défaut ; si le joueur en choisit une autre,
// on traduit la touche pressée vers la touche par défaut de l'action, avant que le reste du jeu ne la voie. Les flèches marchent toujours.
'use strict';

const KEY_ACTIONS=[
  ['up','Avancer','KeyW'],['down','Reculer','KeyS'],['left','Aller à gauche','KeyA'],['right','Aller à droite','KeyD'],
  ['interact','Parler, examiner, acheter','KeyE'],['jump','Sauter','Space'],['phone','Téléphone','KeyF'],['inv','Inventaire','KeyI'],
  ['rotL','Pivoter la caméra à gauche','KeyQ'],['rotR','Pivoter la caméra à droite','KeyR'],['pix','Taille des pixels','KeyP']];
let KEYMAP={};try{KEYMAP=JSON.parse(localStorage.getItem('neobxl-keys')||'{}')}catch(_){KEYMAP={}}
const keyOf=a=>KEYMAP[a]||KEY_ACTIONS.find(k=>k[0]===a)[2];
const KEY_LABEL={}; // noms affichés des touches (ce que le clavier écrit vraiment : Z sur un clavier AZERTY)
try{Object.assign(KEY_LABEL,JSON.parse(localStorage.getItem('neobxl-keylabels')||'{}'))}catch(_){}
function keyName(code){if(KEY_LABEL[code])return KEY_LABEL[code];
  const D={KeyW:'Z',KeyS:'S',KeyA:'Q',KeyD:'D',KeyQ:'A',KeyE:'E',KeyF:'F',KeyI:'I',KeyR:'R',KeyP:'P',Space:'Espace'}; // clavier AZERTY
  return D[code]||code.replace(/^Key|^Digit/,'')}
function remapped(code){ // touche pressée → touche que le jeu attend (null : à ignorer)
  for(const [a,,def] of KEY_ACTIONS){if(keyOf(a)===code)return def}
  if(KEY_ACTIONS.some(([a,,def])=>def===code&&keyOf(a)!==code))return null; // sa touche par défaut a été réattribuée ailleurs
  return code}
let keyCapture=null; // en attente d'une nouvelle touche pour une action
['keydown','keyup'].forEach(type=>addEventListener(type,e=>{
  if(e._nbx)return;
  if(keyCapture&&type==='keydown'){e.preventDefault();e.stopImmediatePropagation();const a=keyCapture;keyCapture=null;
    if(e.code!=='Escape'){KEY_ACTIONS.forEach(([b])=>{if(b!==a&&keyOf(b)===e.code)KEYMAP[b]=keyOf(a)}); // échange avec l'action qui l'avait
      KEYMAP[a]=e.code;if(e.key&&e.key.length===1)KEY_LABEL[e.code]=e.key.toUpperCase();else if(e.key===' ')KEY_LABEL[e.code]='Espace';
      try{localStorage.setItem('neobxl-keys',JSON.stringify(KEYMAP));localStorage.setItem('neobxl-keylabels',JSON.stringify(KEY_LABEL))}catch(_){}}
    if(typeof renderKeySettings==='function')renderKeySettings();return}
  if(e.code.startsWith('Arrow')||e.code==='Escape'||e.code==='Enter'||/^(Digit|Numpad)/.test(e.code))return;
  const to=remapped(e.code);if(to===e.code)return;
  e.preventDefault();e.stopImmediatePropagation();if(!to)return;
  const ev=new KeyboardEvent(type,{code:to,key:e.key,bubbles:true,cancelable:true,repeat:e.repeat});ev._nbx=true;dispatchEvent(ev)},true));
function renderKeySettings(){const el=document.getElementById('keyMap');if(!el)return;
  el.innerHTML=KEY_ACTIONS.map(([a,l])=>'<div class="kmRow"><span>'+l+'</span><button type="button" data-km="'+a+'" class="'+(keyCapture===a?'wait':'')+'">'+(keyCapture===a?'Appuie sur une touche…':keyName(keyOf(a)))+'</button></div>').join('')+
    '<div class="kmRow"><span></span><button type="button" id="kmReset">Touches par défaut</button></div>'}
document.addEventListener('click',e=>{const b=e.target.closest('[data-km]');if(b){keyCapture=b.dataset.km;renderKeySettings();return}
  if(e.target.id==='kmReset'){KEYMAP={};try{localStorage.removeItem('neobxl-keys')}catch(_){}renderKeySettings()}});
renderKeySettings();
