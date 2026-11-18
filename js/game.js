// Déplacement, interactions, boîte de dialogue, HUD, pluie, boucle de jeu et démarrage.
'use strict';

/* ===================== DÉPLACEMENT ===================== */
const R=.27;
function blocked(x,z){
  const zo=zoneOf();if(zo){const Z=ZONES[zo];if(Math.abs(x-Z.x)>Z.hw||Math.abs(z-Z.z)>Z.hd)return true;if(npcs.some(n=>n.zone===zo&&(n.mesh.position.x-x)**2+(n.mesh.position.z-z)**2<.36))return true;return Z.blocks.some(([cx,cz,hx,hz])=>Math.abs(x-cx)<hx+R&&Math.abs(z-cz)<hz+R)}
  if(motoBlocks(x,z))return true; // la moto garée
  if(isSolid(x-R,z-R)||isSolid(x+R,z-R)||isSolid(x-R,z+R)||isSolid(x+R,z+R))return true;
  for(const n of npcs){const dx=n.mesh.position.x-x,dz=n.mesh.position.z-z;if(dx*dx+dz*dz<.36)return true}
  for(const s of statics){const dx=s.position.x-x,dz=s.position.z-z;if(dx*dx+dz*dz<.36)return true}
  if(!zoneOf()&&(player.userData.jy||0)<.55&&FURN.some(([fx,fz,r])=>Math.hypot(x-fx,z-fz)<r+R*.6))return true; // mobilier urbain (on peut sauter par-dessus)
  return false;
}
function distTo(o){const p=o.mesh?o.mesh.position:o;return Math.hypot(p.x-player.position.x,p.z-player.position.z)}

// montée / descente d'escalier : le personnage suit les marches
let climb=null;
function climbStairs(up){if(climb)return;leaveMoto();const a={x:GX-1.62,y:0,z:GZ1+.5},b={x:GX-1.62,y:QUAI_Y,z:QUAI_END-.35};
  climb={from:up?a:b,to:up?b:a,t:0,up};overlayOpen=true;target=null;pendingTalk=null}
function updatePlayer(dt){
  if(taxiRide)return; // dans le taxi : c'est lui qui te déplace
  if(climb){const c=climb,ud=player.userData;c.t=Math.min(1,c.t+dt/1.6);const e=c.t;
    player.position.set(c.from.x+(c.to.x-c.from.x)*e,c.from.y+(c.to.y-c.from.y)*Math.min(1,Math.max(0,(e-.08)/.84)),c.from.z+(c.to.z-c.from.z)*e);
    ud.ry=Math.atan2(c.to.x-c.from.x,c.to.z-c.from.z);ud.moving=true;
    if(c.t>=1){S.roof=c.up?'quai':false;climb=null;overlayOpen=false;ud.moving=false;S.px=player.position.x;S.pz=player.position.z}return}
  if(dancing>0&&danceStep(dt))return; // on danse au club
  // assis sur un banc : on se relève dès qu'on veut marcher (touches ou clic)
  if(seated){const go=!dlgOpen&&!overlayOpen&&(target||['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys[k]));
    if(!go){player.userData.moving=false;return}standUp()}
  let mx=0,mz=0;
  if(!dlgOpen&&!overlayOpen){
    const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
    const r=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
    if(f||r){target=null;pendingTalk=null;mx=-Math.sin(yaw)*f+Math.cos(yaw)*r;mz=-Math.cos(yaw)*f-Math.sin(yaw)*r;}
    else if(target){const dx=target.x-player.position.x,dz=target.z-player.position.z,d=Math.hypot(dx,dz);
      if(pendingTalk&&distTo(pendingTalk)<1.6){const n=pendingTalk;target=null;pendingTalk=null;talkTo(n)}
      else if(d<.12)target=null;else{mx=dx/d;mz=dz/d}}
  }
  const len=Math.hypot(mx,mz);const ud=player.userData;
  if(len>0){
    mx/=len;mz/=len;const sp=(riding?4*MOTO_SPEED:4)*dt; // à moto : 1,5 fois plus vite
    const ox=player.position.x,oz=player.position.z;
    if(!blocked(ox+mx*sp,oz))player.position.x+=mx*sp;
    if(!blocked(player.position.x,oz+mz*sp))player.position.z+=mz*sp;
    const moved=Math.hypot(player.position.x-ox,player.position.z-oz);
    if(target){if(moved<sp*.2){stuck+=dt;if(stuck>.35){target=null;pendingTalk=null;stuck=0}}else stuck=0}
    ud.ry=Math.atan2(mx,mz);ud.moving=moved>sp*.2;
  }else ud.moving=false;
  const J=player.userData;if(J.jv||J.jy){J.jv=(J.jv||0)-22*dt;J.jy=Math.max(0,(J.jy||0)+J.jv*dt);if(J.jy===0)J.jv=0}
  player.position.y=zoneY()+(J.jy||0)+(riding?.58:0)+(boatRide?1.22:0)+stairLift(); // en selle, un peu plus haut ; sur le pont du bateau
  if(!boatRide){S.px=player.position.x;S.pz=player.position.z;S.ry=ud.ry} /* en mer, la sauvegarde garde le ponton */
}
const lerp=(a,b,t)=>a+(b-a)*t;
function lerpAngle(a,b,t){let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*t}

/* ===================== INTERACTIONS ===================== */
function nearest(){
  if(taxiRide)return {kind:'taxi',label:'Descendre du taxi'};
  let best=null,bd=1e9;
  npcs.forEach(n=>{const d=npcZone(n)!==zoneOf()?99:distTo(n);if(d<1.9&&d<bd){bd=d;best={kind:'npc',n,label:'Parler à '+(S.met[n.id]?NAMES[n.id]:'???')}}});
  for(const id in S.q){const q=S.q[id];if(!q.active||q.b>=3)continue;const s=spotOf(id,q.b);if(itemZone(s)!==zoneOf())continue;const d=distTo(s);if(d<1.5&&d<bd+.6){bd=d-.6;best={kind:'spot',id,label:'Enquêter · '+spotLab(id,q.b)}}}
  OBJECTS.forEach(o=>{if(itemZone(o)!==zoneOf())return;const d=distTo(o);if(d<o.r&&d<bd-.4){bd=d;best={kind:'obj',o,label:o.label}}});
  return best;
}
function interact(){const t=nearest();if(!t)return;if(t.kind==='taxi'){endRide();return}if(t.kind==='npc')talkTo(t.n);else if(t.kind==='spot')openDlg(beatDlg(t.id));else if(t.o.act)t.o.act();else openDlg(t.o.dyn?{n1:{s:'nar',t:t.o.dyn()}}:t.o.id)}
// monter sur le toit / redescendre : fondu au noir, puis on réapparaît de l'autre côté de la porte
function goRoof(up){leaveMoto();const f=$('fade');f.style.opacity=1;overlayOpen=true;target=null;pendingTalk=null;
  setTimeout(()=>{S.roof=up?'roof':false;const p=up?{x:ROOF.x+1.9,z:ROOF.z-.45}:FP('roofs',1.6,0);player.position.set(p.x,up?ROOF.y:0,p.z);player.userData.ry=up?0:0;
    focus.set(p.x,player.position.y+1.5,p.z);save();f.style.opacity=0;overlayOpen=false;toast(up?'Toit de la tour Zéro':'Rue · Toits de Zone Zéro','')},380)}
function talkTo(n){
  let id=n.id;talking=n;
  if(S.flags.chapter1){ // chapitre 2
    if(id==='mira'){
      if(!S.flags.ch2)return openDlg('mira_ch2');
      const q=S.q.mira;
      if(!S.flags.chapter2&&wins()>=3&&!(q&&q.active))return openDlg('mira_end2');
      if(S.flags.chapter2&&!(q&&q.active)&&!epLeft('mira'))return openDlg('mira_after2');
    }
    if(!S.flags.ch2)return openDlg({n1:{s:id,t:id==='lou'&&!S.met.lou?'Hé ! Toi ! … On en parle plus tard, va d’abord voir Mira.':'Mira te cherche. Va la voir à ta planque, on causera après.',fx:{met:id}}});
    return openDlg(storyDlg(id));
  }
  if(id==='mira'){id=!S.flags.started?'mira_intro':S.frags.length>=3?'mira_end':'mira_wait'}
  else if(id==='lou'){id=S.met.lou?'lou_wait':'lou_meet'}
  else{const fr={vasko:'contrat',doc:'implant',okoro:'dossier'}[id];id=!S.flags.started?id+'_pre':S.frags.includes(fr)?id+'_done':id}
  openDlg(id);
}


/* ===================== BOÎTE DE DIALOGUE ===================== */
let cur=null,node=null,shown=0,full='';
function openDlg(id){cur=typeof id==='string'?DLG[id]:id;dlgOpen=true;target=null;pendingTalk=null;$('prompt').hidden=true;$('dlg').hidden=false;$('help').hidden=true;$('cam').hidden=true;showNode('n1')}
function showNode(k){
  node=cur[k];if(node.fx)applyFx(node.fx);if(node.vfx)vfx(node.vfx);
  const s=node.s;$('dlg').style.setProperty('--k',COLORS[s]);
  $('dlgName').textContent=s==='nar'?'':(s==='you'?'Toi':(S.met[s]?NAMES[s]:'???'));
  $('dlgName').hidden=s==='nar';$('dlgPic').hidden=s!=='neura'; /* le visage de NEURA quand elle parle */
  $('dlgText').style.fontStyle=s==='nar'?'italic':'normal';
  full=node.t;shown=0;$('dlgText').textContent='';
  $('dlgChoices').innerHTML='';$('dlgNext').hidden=true;
}
function renderChoices(){
  const bx=$('dlgChoices');bx.innerHTML='';
  if(node.ch){node.ch.filter(c=>!c.cond||c.cond()).forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<b>'+(i+1)+'</b>';b.appendChild(document.createTextNode(c.t));
    b.onclick=ev=>{ev.stopPropagation();if(c.fx)applyFx(c.fx);if(c.next)showNode(c.next);else closeDlg()};bx.appendChild(b)});}
  else $('dlgNext').hidden=false;
}
function dlgAdvance(){
  if(shown<full.length){shown=full.length;$('dlgText').textContent=full;renderChoices();return}
  if(node.ch)return;
  if(node.next)showNode(node.next);else closeDlg();
}
$('dlg').addEventListener('click',dlgAdvance);
function closeDlg(){dlgOpen=false;$('dlg').hidden=true;$('help').hidden=false;$('cam').hidden=false;talking=null;cur=null;
  if(S.flags.chapter1&&!S.flags.endShown){S.flags.endShown=true;save();showEnding(1)}
  else if(S.flags.chapter2&&!S.flags.end2Shown){S.flags.end2Shown=true;save();showEnding(2)}
  updateHUD();}
function typeTick(dt){if(!dlgOpen||shown>=full.length)return;const before=Math.floor(shown/3);shown=Math.min(full.length,shown+dt*70);if(Math.floor(shown/3)>before&&node&&typeof talkBlip==="function")talkBlip(node.s); /* petit son de voix toutes les 3 lettres */$('dlgText').textContent=full.slice(0,Math.floor(shown));if(shown>=full.length)renderChoices()}

function vfx(k){if(k!=='glitch')return;const b=document.body;b.classList.remove('glitch');void b.offsetWidth;b.classList.add('glitch');setTimeout(()=>b.classList.remove('glitch'),450)}
function applyFx(fx){
  if(fx.met&&!S.met[fx.met]){S.met[fx.met]=true;if(!(fx.met in S.friend))S.friend[fx.met]=0}
  if(fx.friend)for(const k in fx.friend){const v=fx.friend[k];S.met[k]=true;S.friend[k]=(S.friend[k]||0)+v;toast((v>0?'♥ +':'♥ ')+v+' Amitié · '+NAMES[k],'fr')}
  if(fx.rep){S.rep=Math.max(0,S.rep+fx.rep);toast((fx.rep>0?'+':'')+fx.rep+' Réputation','rp')}
  if(fx.frag&&!S.frags.includes(fx.frag)){S.frags.push(fx.frag);toast('NEURA · souvenir retrouvé · '+FRAG_NAMES[fx.frag],'mem');drawBoard()}
  if(fx.flag)S.flags[fx.flag]=true;
  if(fx.quest){const o=S.q[fx.quest]||{};S.q[fx.quest]={active:true,b:0,sc:0,won:!!o.won,ep:o.ep||0,wins:o.wins||0};toast('Nouvelle histoire · '+title(fx.quest),'mem')}
  if(fx.beat){const [id,sc]=fx.beat,q=S.q[id];if(q&&q.active){q.sc+=sc;q.b++;toast(title(id)+' · piste '+q.b+' / 3','')}}
  if(fx.resolve){const id=fx.resolve,q=S.q[id];if(q&&q.active){q.active=false;const ep=q.ep||0;
    if(q.sc>=4){q.won=true;q.lost=false;q.wins=(q.wins||0)+1;q.ep=ep+1;const r=ep===0?8:5;S.friend[id]=(S.friend[id]||0)+2;S.rep+=r;if(ep===0&&!S.mems.includes(id))S.mems.push(id);
      toast('♥ +2 Amitié · '+NAMES[id],'fr');toast('+'+r+' Réputation','rp');if(ep===0)toast('NEURA · souvenir déchiffré','mem')}
    else{q.lost=true;S.rep+=1;toast('Histoire ratée · tu pourras réessayer','')}}}
  save();updateHUD();
}

/* ===================== HUD ===================== */
function tier(r){return r>=45?'Respecté':r>=25?'Fiable':r>=10?'Visage connu':'Inconnu'}
function friendLabel(v){return v<0?'Méfiant':v>=5?'Proche':v>=2?'Ami':'Connaissance'}
function updateHUD(){
  $('repTier').textContent=tier(S.rep);$('repVal').textContent=S.rep+' / 60';$('repBar').style.width=Math.min(100,S.rep/60*100)+'%';
  const met=Object.keys(S.met).filter(k=>S.met[k]&&k!=='neura'&&NAMES[k]);
  $('contacts').innerHTML=met.length?met.map(k=>{const v=S.friend[k]||0;let h='';for(let i=0;i<7;i++)h+=i<v?'♥':'·';
    return '<button type="button" class="ct" data-k="'+k+'"><b style="color:'+COLORS[k]+'">'+NAMES[k]+'</b><span class="hearts" style="color:'+(v<0?'#8296a4':'#ff4fa3')+'">'+h+'</span><span>'+friendLabel(v)+' · fiche ▸</span></button>'}).join(''):'<div class="empty">Personne pour l’instant.</div>';
  const o=$('obj');
  if(!S.flags.started)o.innerHTML='<div class="o"><i>▸</i>Parle à la personne près de la porte.</div>';
  else if(S.flags.chapter1&&!S.flags.ch2)o.innerHTML='<div class="o"><i>▸</i>Chapitre 2 · Parle à Mira, à ta planque.</div>';
  else if(S.flags.chapter1){
    const rows=Q_ORDER.map(id=>{const q=S.q[id]||{},a=q.active,ep=epOf(id),left=epLeft(id);
      if(!a&&!left)return '<div class="o done"><i>✓</i>'+NAMES[id]+' · toutes ses histoires</div>';
      const t=NAMES[id]+' · '+title(id)+(epCount()>1?' ('+(ep+1)+'/'+epCount()+')':'')+(a?(q.b<3?' · piste '+(q.b+1)+' : '+spotLab(id,q.b):' · retourne le voir'):(q.lost?' · à retenter':''));
      return '<div class="o"><i>'+(a?'◆':'▸')+'</i>'+t+'</div>'}).join('');
    o.innerHTML=(S.flags.chapter2?'<div class="o done"><i>✓</i>Chapitre 2 terminé. Les histoires continuent.</div>':'')+rows+(!S.flags.chapter2&&wins()>=3?'<div class="o"><i>◆</i>Retourne voir Mira à ta planque.</div>':'');
    $('frags').textContent=(S.flags.chapter2?'':'Contacts aidés : '+wins()+' / 3 requis · ')+'Souvenirs NEURA : '+(S.frags.length+S.mems.length);
    return;
  }  else if(S.frags.length>=3)o.innerHTML='<div class="o"><i>▸</i>Retourne voir Mira à ta planque.</div>';
  else o.innerHTML=[['contrat','Vasko · Gare Zéro'],['implant','Doc Ferrant · Bazar Néon'],['dossier','Sergent Okoro · Laverie 24/7']].map(([f,t])=>{const d=S.frags.includes(f);return '<div class="o'+(d?' done':'')+'"><i>'+(d?'✓':'▸')+'</i>'+t+'</div>'}).join('');
  $('frags').textContent='Souvenirs : '+S.frags.length+' / 3'+(S.frags.length?' · '+S.frags.map(f=>FRAG_NAMES[f]).join(', '):'');
}
$('btnContacts').onclick=()=>{$('contacts').hidden=!$('contacts').hidden};
$('contacts').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b)openFiche(b.dataset.k)});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function openFiche(k){
  const d=DOSS[DOSS_ID[k]||k];if(!d)return;const v=S.friend[k]||0;
  const sec=(lv,html)=>v>=lv?html:'<div class="lock">▒▒▒▒▒▒ Amitié '+lv+' requise</div>';
  $('ficheBody').innerHTML='<div class="lbl" style="color:'+COLORS[k]+'">Fiche contact · '+esc(d.alias)+'</div>'+
    '<h2 style="color:'+COLORS[k]+'">'+esc(NAMES[k])+'</h2>'+
    '<dl><dt>Âge</dt><dd>'+esc(d.age)+'</dd><dt>Lieu</dt><dd>'+esc(d.lieu)+'</dd><dt>Métier</dt><dd>'+esc(d.metier)+'</dd></dl>'+
    sec(FICHE_LV.bio1,'<p>'+esc(d.bio[0])+'</p>')+
    sec(FICHE_LV.traits,'<p><span class="lbl">Signe</span> '+esc(d.signe)+'</p><p class="cit">« '+esc(d.citation)+' »</p>')+
    sec(FICHE_LV.bio2,'<p>'+esc(d.bio[1])+'</p>')+
    sec(FICHE_LV.gouts,'<p><span class="lbl">Aime</span> '+esc(d.aime)+'</p><p><span class="lbl">Déteste</span> '+esc(d.deteste)+'</p>')+
    sec(FICHE_LV.bio3,'<p>'+esc(d.bio[2])+'</p>')+
    sec(FICHE_LV.toi,'<p class="toi"><span class="lbl">Toi et '+esc(NAMES[k])+'</span> '+esc(d.toi)+'</p>');
  $('fiche').hidden=false;overlayOpen=true;
}
function closeFiche(){$('fiche').hidden=true;overlayOpen=false}
$('ficheClose').onclick=closeFiche;
$('fiche').addEventListener('click',e=>{if(e.target===$('fiche'))closeFiche()});
function toast(t,cls,ms){const d=document.createElement('div');d.className='toast panel '+cls;d.textContent=t;$('toasts').appendChild(d);setTimeout(()=>d.remove(),ms||(t.length>40?5200:2600))}

const FRAG_OF={vasko:'contrat',doc:'implant',okoro:'dossier'};
function questTarget(id){
  if(!S.flags.started)return id==='mira';
  if(S.flags.chapter1){
    if(!S.flags.ch2)return id==='mira';
    const q=S.q[id];
    if(id==='mira'&&!S.flags.chapter2&&wins()>=3&&!(q&&q.active))return true;
    if(q&&q.active)return q.b>=3;
    return epLeft(id);
  }  if(id==='lou')return false;
  if(S.frags.length>=3)return id==='mira';
  return !!FRAG_OF[id]&&!S.frags.includes(FRAG_OF[id]);
}
const v3=new THREE.Vector3();
function updateLabels(){
  npcs.forEach(n=>{
    const d=distTo(n);v3.set(n.mesh.position.x,2.05*(SPECS[n.id].scale||1),n.mesh.position.z).project(camera);
    if(d>16||v3.z>1||npcZone(n)!==zoneOf()){n.label.hidden=true;return}
    n.label.hidden=false;n.label.style.left=((v3.x+1)/2*innerWidth)+'px';n.label.style.top=((1-v3.y)/2*innerHeight)+'px';
    const html=(questTarget(n.id)?'<em>◆</em>':'')+(S.met[n.id]?NAMES[n.id]:'???');if(n.label._h!==html){n.label.innerHTML=html;n.label._h=html}
  });
  const t=(!dlgOpen&&!overlayOpen)?nearest():null;const p=$('prompt');
  if(t){const h='<kbd>E</kbd> · '+t.label;if(p._h!==h){p.innerHTML=h;p._h=h}p.hidden=false}else p.hidden=true;
}
$('prompt').addEventListener('click',interact);

/* (la pluie et la météo sont dans js/weather.js) */

/* ===================== BOUCLE ===================== */
const clock=new THREE.Clock();let tAcc=0,saveT=0;
const camDir=new THREE.Vector3();
function updateCamera(dt){
  if(cineCam(dt)||trainCam(dt)||viewCam(dt))return; // menu principal, cinématique ou voyage en TGV : la caméra est pilotée
  yaw=lerp(yaw,yawT,Math.min(1,dt*8));pitch=lerp(pitch,pitchT,Math.min(1,dt*8));dist=lerp(dist,distT,Math.min(1,dt*8));
  focus.x=lerp(focus.x,player.position.x,Math.min(1,dt*7));focus.z=lerp(focus.z,player.position.z,Math.min(1,dt*7));focus.y=lerp(focus.y,player.position.y+1.5,Math.min(1,dt*5));
  camDir.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
  // la caméra se rapproche quand un mur est entre elle et toi
  ray.set(focus,camDir);ray.far=dist;const hit=ray.intersectObjects(camBlockers).find(h=>h.object.visible&&(!h.object.parent||h.object.parent.visible));ray.far=Infinity;
  const want=hit?Math.max(1.2,hit.distance-.35):dist;
  camD=want<camD?want:lerp(camD,want,Math.min(1,dt*3));
  camera.position.copy(focus).addScaledVector(camDir,camD);
  camera.lookAt(focus.x,focus.y+.2,focus.z);
}
function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,clock.getDelta());tAcc+=dt;
  if(started){updatePlayer(dt);typeTick(dt)}
  updateWalkers(dt);
  npcs.forEach(n=>{const d=distTo(n);let want=n.baseRy;if(d<3.2||talking===n)want=Math.atan2(player.position.x-n.mesh.position.x,player.position.z-n.mesh.position.z);
    n.mesh.userData.ry=lerpAngle(n.mesh.userData.ry,want,Math.min(1,dt*5));});
  updateCity(dt);updateStation(dt);updateLife(dt);updateTaxi(dt);updateTraffic(dt);updateStreets(dt);updateLandmarks(dt);updateWeather(dt);updateDoors(dt);updateFlyers(dt);updateDayNight(dt);updateShops();
  beacons.forEach(b=>b.visible=Math.sin(tAcc*3)>-.2);updateMarkers();updateHaunts(dt);updateWaypoint();updateHarbor(dt);updateEconomy(dt);updateVignettes(dt);if(bmOpen&&Math.random()<.1)drawBigMap();
  if(cat)cat.userData.body.scale.y=1+Math.sin(tAcc*2.2)*.06;
  if(holo){holo.position.y=holo.userData.baseY+Math.sin(tAcc*1.3)*.08;const hm=holo.userData.plane.material;hm.opacity=.45+Math.sin(tAcc*9)*.04+(Math.random()<.02?-.25:0);holo.userData.moving=false;}
  updateCamera(dt);
  sprites.forEach(s=>updateSprite(s,dt));
  updateRain(dt);updateInteriors(dt);updateMoto(dt);updateAudio(dt);updateMinimap(dt);
  if(started)updateLabels();
  saveT+=dt;if(started&&saveT>4){saveT=0;save()}
  if(composer)composer.render();else renderer.render(scene,camera);
}

/* ===================== DÉMARRAGE ===================== */
function setupFX(){
  const [lw,lh]=lowSize();
  try{
    if(THREE.Reflector){
      mirror=new THREE.Reflector(new THREE.PlaneGeometry(W,H),{textureWidth:lw,textureHeight:lh,color:0x8890a0,clipBias:.003});
      mirror.rotation.x=-Math.PI/2;mirror.position.set(W/2,-.01,H/2);scene.add(mirror);
      const orig=mirror.onBeforeRender;
      mirror.onBeforeRender=function(){if(ground)ground.visible=false;if(rain)rain.mesh.visible=false;orig.apply(this,arguments);if(ground)ground.visible=true;if(rain)rain.mesh.visible=true};
    }
  }catch(e){mirror=null}
  try{
    if(THREE.EffectComposer&&THREE.UnrealBloomPass){
      composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));
      bloom=new THREE.UnrealBloomPass(new THREE.Vector2(lw,lh),1.15,.55,.6);composer.addPass(bloom);
    }
  }catch(e){composer=null}
}
function placePlayer(){const y0=zoneY();player.position.set(S.px,y0,S.pz);player.userData.ry=S.ry||0;focus.set(S.px,y0+1.5,S.pz);yaw=yawT=0}
function begin(fresh){
  if(fresh){S=NEW_STATE();save()}
  cine=null;placePlayer();drawBoard();
  $('intro').hidden=true;overlayOpen=false;started=true;
  if(fresh||!S.flags.woke){S.flags.woke=true;save();playWake();return}
  ['hudL','hudR','cam','help'].forEach(id=>$(id).hidden=false);
  updateHUD();
}function showEnding(n){
  const friends=Object.keys(S.met).filter(k=>k!=='neura'&&(S.friend[k]||0)>=2).length;
  if(n===2){$('endLbl').textContent='Fin du chapitre 2 · Alliés';$('endH').textContent='Un nouveau nom : le Dr Eliane Vex';
    $('endP').textContent='Tu as aidé la Zone Zéro, et la Zone Zéro se souvient de toi. Quelque part sous le Bazar, la co-conceptrice de Léthé travaille sur Mnémosyne. Le chapitre 3 reste à écrire.'}
  else{$('endLbl').textContent='Fin du chapitre 1 · Réveil';$('endH').textContent='Un nom revient dans les trois récits : Kurogane';
    $('endP').textContent='Tu as retrouvé trois fragments de ta mémoire, et un mot : Léthé. Parle à Mira pour ouvrir le chapitre 2.'}
  $('endStats').innerHTML='<div><span class="lbl">Réputation</span><b>'+tier(S.rep)+'</b></div><div><span class="lbl">Souvenirs</span><b>'+(S.frags.length+S.mems.length)+'</b></div><div><span class="lbl">Amis</span><b>'+friends+'</b></div>';
  $('ending').hidden=false;overlayOpen=true;
}
$('endClose').onclick=()=>{$('ending').hidden=true;overlayOpen=false};

function start(hotData){
  const saved=(hotData&&hotData.S)||loadSave();
  if(saved){if(saved.mapv!==5){const n=NEW_STATE();saved.px=n.px;saved.pz=n.pz;saved.ry=0;saved.roof=false;saved.mapv=5}S=Object.assign(NEW_STATE(),saved);for(const k in S.q){const q=S.q[k];if(q.ep==null){q.ep=q.won?1:0;q.wins=q.won?1:0}}}
  setupFX();buildWorld();buildPerimeter();spawn();buildLife();buildTaxi();buildTraffic();buildInteriors();registerBenches();buildMoto();buildMinimap();registerNoodles();makeMarkers();makeRain();setupWeather();setupDayNight();resize();placePlayer();
  $('loading').remove();
  if(hotData&&hotData.S&&hotData.running)begin(false);else showMenu();  try{window.claude&&window.claude.hot&&window.claude.hot.snapshot&&window.claude.hot.snapshot(()=>({S,running:started}))}catch(e){}
  frame();
}
const boot=()=>{try{if(window.claude&&window.claude.hot&&window.claude.hot.ready)window.claude.hot.ready(start);else start(window.claude&&window.claude.hot&&window.claude.hot.data||{})}catch(e){console.error('Démarrage :',e)}};
const fontWait=(document.fonts&&document.fonts.load)?Promise.race([document.fonts.load('8px Silkscreen'),new Promise(r=>setTimeout(r,1500))]):Promise.resolve();
// on attend que tous les scripts soient chargés (le menu est dans intro.js, chargé après ce fichier)
const ready=()=>Promise.all([fontWait,loadTextures()]).then(boot,boot);
if(document.readyState==='loading')addEventListener('DOMContentLoaded',ready);else ready();

/* ===================== BANCS : S'ASSEOIR ===================== */
// Chaque banc de la ville (rues et trottoirs extérieurs) devient un objet : E ou F pour s'asseoir, encore une fois (ou marcher) pour se lever.
let seated=null;
function sitOn(b){if(seated===b){standUp();return}if(b.occ){toast("Quelqu’un est déjà assis sur ce banc.","");return}target=null;pendingTalk=null;seated=b;const ud=player.userData;
  player.position.set(b.x+b.fx*.12,0,b.z+b.fz*.12); /* un peu en avant : les jambes passent devant l’assise */ud.ry=Math.atan2(b.fx,b.fz);ud.moving=false;ud.sit=true}
function standUp(){const b=seated;if(!b)return;seated=null;player.userData.sit=false;player.position.x=b.x+b.fx*.85;player.position.z=b.z+b.fz*.85}
function registerBenches(){BENCHES.forEach((b,i)=>OBJECTS.push({id:'bench_'+i,x:b.x+b.fx*.6,z:b.z+b.fz*.6,r:1.1,get label(){return seated===b?'Se lever':'S’asseoir sur le banc'},act:()=>sitOn(b)}))}

/* ===================== LE TGV : MONTER À BORD ===================== */
// Quand la rame est à quai, on peut monter (E ou F). La caméra suit le train qui quitte la ville ; dans le tunnel,
// tout devient noir : on s'endort, une voix dit que la ville ne nous laissera pas partir, et on se réveille dans sa planque.
let trainRide=null;
const TRAIN_STOP=()=>GZ1-.6;
function trainAtQuai(){return train&&Math.abs(train.position.z-TRAIN_STOP())<.5&&!trainRide}
function boardTrain(){if(!trainAtQuai())return;leaveMoto();fadeThen(()=>{trainRide={t:0,phase:'ride'};player.visible=false;target=null;pendingTalk=null;toast('Tu montes à bord. Les portes se referment.','')})}
function trainCam(dt){
  if(!trainRide)return false;const R=trainRide;R.t+=dt;
  if(R.phase==='ride'){const z=TRAIN_STOP()-(TRAIN_STOP()+170)*Math.pow(Math.min(1,R.t/16),2);train.position.z=z;
    camera.position.set(GX+7,9,z+14);camera.lookAt(GX,3,z-8);
    if(z<26&&!R.dark){R.dark=true;dreamSequence()} /* le noir tombe avant que la caméra ne voie au-delà de la ville */}
  else{camera.position.set(GX+7,9,-20);camera.lookAt(GX,3,-40)}
  return true}
function dreamSequence(){
  const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:30;background:#000;display:grid;place-items:center;opacity:0;transition:opacity 1.2s;font:16px/1.6 var(--f-m,monospace);color:#cfe8ff;text-align:center;padding:0 24px';
  document.body.appendChild(d);overlayOpen=true;requestAnimationFrame(()=>d.style.opacity=1);
  const lines=['Le roulis du train te berce. Dans le noir du tunnel, tes paupières se ferment…','Une voix sans visage, tout près de ton oreille : « Tu ne quitteras pas NEO-BXL. Pas encore. »','Quelque chose te retient dans cette ville.'];
  let i=0;const next=()=>{if(i<lines.length){d.textContent=lines[i++];setTimeout(next,3400);return}
    // réveil dans la planque
    trainRide=null;S.roof=false;const n=NEW_STATE();player.position.set(n.px,0,n.pz);player.userData.ry=0;player.visible=true;focus.set(n.px,1.5,n.pz);yaw=yawT=0;save();
    d.style.opacity=0;setTimeout(()=>{d.remove();overlayOpen=false;toast('Tu te réveilles dans ta planque, le cœur battant.','mem')},1300)};
  setTimeout(next,1200);
}

/* ===================== DANSER (club Ondes) ===================== */
// Le personnage se balance, sautille et tourne sur lui-même pendant une dizaine de secondes ; il s'arrête dès qu'on marche.
let dancing=0;
function startDance(){if(dancing>0){dancing=0;return}dancing=12;target=null;pendingTalk=null;toast('Tu te laisses porter par la basse…','')}
function danceStep(dt){const ud=player.userData;
  if(['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys[k])||target||dlgOpen){dancing=0;return false}
  dancing-=dt;if(dancing<=0){dancing=0;return false}
  const b=tAcc*124/60*Math.PI; // sur le tempo du club
  ud.ry+=dt*(Math.sin(tAcc*.9)>0?2.2:-2.2);ud.moving=Math.sin(b*2)>0;player.position.y=zoneY()+Math.abs(Math.sin(b))*.14;return true}

/* ===================== LA VUE DEPUIS LE TOIT ===================== */
// Sur le toit de la tour des Toits, « Observer la vue » : un lent panoramique sur la ville (du sud vers la mer, puis vers le nord),
// la caméra s'élève doucement au-dessus du parapet. Une touche ou un clic l'arrête.
let viewShot=null;
function startView(){if(viewShot)return;viewShot={t:0,hud:['hudL','hudR','help','cam','prompt'].filter(id=>!$(id).hidden)};viewShot.hud.forEach(id=>$(id).hidden=true);overlayOpen=true;target=null}
function endView(){if(!viewShot)return;viewShot.hud.forEach(id=>$(id).hidden=false);viewShot=null;overlayOpen=false}
// plan « observer la vue » : au bord du toit, le regard plonge sur les rues en contrebas, balaie vers la gauche, puis vers la droite, et revient
function viewCam(dt){if(!viewShot)return false;const V=viewShot;V.t+=dt;const T=22,t=V.t,sm=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
  const base=Math.atan2(44-ROOF.z,W*.6-ROOF.x), /* face au cœur de la ville */
    yaw=base-1.15*sm(t/5)+2.3*sm((t-5)/10)-1.15*sm((t-16)/5),
    lean=sm(t/3), // on s'avance jusqu'au bord
    ex=Math.cos(base),ez=Math.sin(base),edge=Math.min(ROOF.hw,ROOF.hd)-.4,
    out=edge*.3+(edge+1.6-edge*.3)*lean,cx=ROOF.x+ex*out,cz=ROOF.z+ez*out,cy=ROOF.y+3.2-.6*lean+Math.sin(t*.7)*.05, /* on passe au-dessus du parapet */
    d=24+5*Math.sin(t*.35),ty=ROOF.y*(.65-.55*lean); // le regard descend vers les rues
  camera.position.set(cx,cy,cz);camera.lookAt(cx+Math.cos(yaw)*d,Math.max(.5,ty),cz+Math.sin(yaw)*d);if(t>=T)endView();return true}
['keydown','pointerdown'].forEach(ev=>addEventListener(ev,()=>{if(viewShot&&viewShot.t>.4)endView()}));

/* ===================== LE STAND NOUILLES ZÉRO (gare) ===================== */
const NOODLE_LINES=['« Un ramen noir ? Bouillon de seiche, nouilles maison. Le meilleur de la Zone Zéro, et le moins cher. »','Le cuisinier pose un bol fumant devant toi. « Comme d’habitude, hein ? » Tu ne savais pas que tu avais une habitude.',
  '« Les voyageurs du TGV passent tous par ici avant de partir. Enfin… ceux qui partent vraiment. »','« Kurogane ? Ils viennent manger ici aussi. Les nouilles, ça ne fait pas de politique. »','Le gyoza est brûlant. Le cuisinier rit : « Souffle d’abord, petit. Ça fait trois ans que je te le dis. »'];
let noodleK=0;
function registerNoodles(){if(!NOODLE_POS)return;OBJECTS.push({id:'o_noodles',x:NOODLE_POS.x,z:NOODLE_POS.z,r:1.5,label:'Commander des nouilles',dyn:()=>NOODLE_LINES[noodleK++%NOODLE_LINES.length]})}
