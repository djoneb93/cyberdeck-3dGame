// Le téléphone : touche F pour le sortir ou le ranger (E reste la touche des interactions).
// NEURA OS : un écran d'accueil et six applications — Carte (mini-carte), Musique (baladeur), Son (volumes),
// Contacts (les gens que tu as rencontrés), NEURA (ton IA : objectif en cours, souvenirs, conseils) et Moto (la rappeler).
'use strict';

let phoneOpen=false,phApp=null;
function togglePhone(force){phoneOpen=force!=null?force:!phoneOpen;$('phone').hidden=!phoneOpen;overlayOpen=phoneOpen;if(phoneOpen){target=null;pendingTalk=null;phOpen(null)}}
addEventListener('keydown',e=>{if(e.code!=='KeyF'||!started||dlgOpen||cine||!$('pause').hidden||!$('intro').hidden||!$('settings').hidden)return;if(overlayOpen&&!phoneOpen)return;e.preventDefault();togglePhone()});
addEventListener('keydown',e=>{if(!phoneOpen)return;if(e.code==='Escape'||e.code==='Backspace'){e.stopImmediatePropagation();e.preventDefault();if(phApp)phOpen(null);else togglePhone(false)}},true);
const TRACKS={calm:'Néons sous la pluie',club:'Nuit au club Ondes',lofi:'Pluie sur Midi (lo-fi)',drive:'Autoroute néon',bar:'Cocktail au Néon Noir',arcade:'Pixel Rush (arcade)',bazar:'Souk de minuit (Bazar)'},TRACK_ORDER=Object.keys(TRACKS);
const PH_APPS={help:'Aide',msgs:'Messages',map:'Carte',music:'Musique',sound:'Son',contacts:'Contacts',journal:'Journal',neura:'NEURA',photo:'Photo',moto:'Moto · garage'};
const NEURA_TIPS=['Entre dans un lieu en marchant simplement dans sa porte.','À moto, tu vas deux fois plus vite. E pour monter, E pour descendre.',
  'Le taxi volant t’emmène où tu veux dans la Zone Zéro.','Le métro relie l’ancien commissariat à l’arrière de la tour des Toits.','Le club Ondes n’ouvre que la nuit, de 20 h à 5 h.',
  'Du toit de la tour des Toits, la vue sur la ville est imprenable.','Le stand Nouilles Zéro, à la gare, sert le meilleur ramen noir du quartier.','Si tu es coincé, le bouton « Débloquer » te dégage.'];
const phEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function phClock(){const h=S.hour||0;return String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor((h%1)*60)).padStart(2,'0')}
function phGreet(){const h=S.hour||0;return h<5||h>=21?'Bonne nuit':h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir'}
function phOpen(app){phApp=app;$('phHome').hidden=!!app;$('phApp').hidden=!app;renderPhone()}
function renderPhone(){
  $('phTime').textContent=phClock();
  if(!phApp){$('phHint').textContent=phGreet()+'. '+NEURA_TIPS[Math.floor(Date.now()/9000)%NEURA_TIPS.length];
    document.querySelectorAll('#phHome [data-app]').forEach(b=>b.classList.toggle('on',(b.dataset.app==='map'&&!!S.minimap)||(b.dataset.app==='music'&&!!S.walkman)));
    const un=(S.msgs||[]).filter(m=>!m.r).length,bd=$('phBadge');bd.hidden=!un;bd.textContent=un;return}
  $('phAppT').textContent=PH_APPS[phApp];const B=$('phBody');let h='';
  if(phApp==='map')h='<button type="button" class="phWide" data-act="bigmap">Ouvrir la carte plein écran</button>'+
    '<div class="phRow"><span>Mini-carte à l’écran</span><button type="button" class="phSw'+(S.minimap?' on':'')+'" data-act="map"><i></i></button></div>'+
    (S.wp?'<div class="phRow"><span>Repère posé · '+Math.round(Math.hypot(player.position.x-S.wp.x,player.position.z-S.wp.z))+' m</span><button type="button" data-act="wpclear">Effacer</button></div>':'')+
    '<p class="phNote">Sur la carte plein écran, touche un endroit pour y poser un repère : une colonne de lumière s’élève là-bas, et la mini-carte t’indique la direction.</p>';
  else if(phApp==='msgs'){const L=(S.msgs||[]).slice().reverse();
    h=L.length?L.map(m=>'<div class="phMsg'+(m.r?'':' new')+'"><i style="background:'+(COLORS[m.f]||'#39e6ff')+'">'+(m.f==='neura'?'<img src="assets/img/neura.png" alt="">':phEsc((NAMES[m.f]||'?').charAt(0)))+'</i><div><b style="color:'+(COLORS[m.f]||'#39e6ff')+'">'+phEsc(NAMES[m.f]||m.f)+'<u>'+String(Math.floor(m.h)).padStart(2,'0')+':'+String(Math.floor(m.h%1*60)).padStart(2,'0')+'</u></b><p>'+phEsc(m.t)+'</p></div></div>').join('')
      :'<p class="phNote">Aucun message. Les gens que tu aides t’écriront ici.</p>';
    (S.msgs||[]).forEach(m=>m.r=true);save()}
  else if(phApp==='journal'){const q=S.q||{};let rows='';
    Q_ORDER.forEach(id=>{if(!S.met[id])return;const ep=epOf(id),qa=q[id]||{},n=epCount();let li='';
      for(let e=0;e<n;e++){const done=e<ep,cur=e===ep&&qa.active;if(!done&&!cur)continue;li+='<li class="'+(done?'ok':'cur')+'">'+(done?'✓ ':'◆ ')+phEsc(EP_TITLES[id][e])+(cur?' · piste '+Math.min(3,qa.b+1)+' / 3':'')+'</li>'}
      rows+='<div class="phJr"><b style="color:'+COLORS[id]+'">'+phEsc(NAMES[id])+'</b><em>'+friendLabel(S.friend[id]||0)+'</em><ul>'+(li||'<li>Pas encore commencé.</li>')+'</ul></div>'});
    const mem=[...(S.frags||[]).map(f=>FRAG_NAMES[f]),...(S.mems||[]).map(k=>MEMS[k]?'Souvenir · '+NAMES[k]:null).filter(Boolean)];
    h='<div class="phCard"><em>Souvenirs retrouvés</em>'+(mem.length?mem.map(phEsc).join('<br>'):'Aucun pour l’instant.')+'</div>'+(rows||'<p class="phNote">Ton journal se remplit à mesure que tu rencontres des gens.</p>');}
  else if(phApp==='help'){h='<button type="button" class="phWide" data-act="unstuck">Me débloquer</button><p class="phNote">Si ton personnage est coincé dans un décor, ce bouton le replace sur un endroit libre, juste à côté.</p>'+
    '<div class="phCard"><em>Tes touches</em>'+KEY_ACTIONS.map(([a,l])=>'<b>'+keyName(keyOf(a))+'</b> · '+l).join('<br>')+'<br><b>Flèches</b> · marcher</div><p class="phNote">Tu peux changer les touches dans Réglages → Commandes.</p>'}
  else if(phApp==='photo'){let ph=[];try{ph=JSON.parse(localStorage.getItem('neobxl-photos')||'[]')}catch(_){}
    h='<button type="button" class="phWide" data-act="camera">Ouvrir l’appareil photo</button><p class="phNote">L’interface disparaît : tourne la caméra, zoome, puis Espace pour déclencher. La photo s’enregistre ici et sur ton ordinateur.</p>'+
      (ph.length?'<div class="phGal">'+ph.map((u,i)=>'<button type="button" data-photo="'+i+'"><img src="'+u+'" alt="Photo '+(i+1)+'"></button>').join('')+'</div>':'');}
  else if(phApp==='music'){const cur=S.wmTrack||'calm';
    h='<div class="phNow"><div class="phEq'+(S.walkman?' on':'')+'"><i></i><i></i><i></i><i></i><i></i></div><div><b>'+phEsc(TRACKS[cur])+'</b><span>'+(S.walkman?'En lecture':'En pause')+'</span></div>'+
      '<button type="button" class="phBig" data-act="play">'+(S.walkman?'❚❚':'▶')+'</button></div><div class="phList">'+
      TRACK_ORDER.map(k=>'<button type="button" class="'+(k===cur?'on':'')+'" data-track="'+k+'"><i>'+(k===cur&&S.walkman?'♫':'▸')+'</i>'+phEsc(TRACKS[k])+'</button>').join('')+'</div>';}
  else if(phApp==='sound')h=[['master','Volume général'],['music','Musique'],['amb','Ambiance'],['sfx','Effets et dialogues']].map(([k,l])=>
    '<label class="phSl"><span>'+l+'<b>'+Math.round((typeof AUD!=='undefined'?AUD.vol[k]:1)*100)+'%</b></span><input type="range" min="0" max="1" step="0.05" data-vol="'+k+'" value="'+(typeof AUD!=='undefined'?AUD.vol[k]:1)+'"></label>').join('');
  else if(phApp==='contacts'){const met=Object.keys(S.met).filter(k=>S.met[k]&&k!=='neura'&&NAMES[k]);
    h=met.length?met.map(k=>{const v=S.friend[k]||0;let hs='';for(let i=0;i<7;i++)hs+=i<v?'♥':'·';
      return '<button type="button" class="phCt" data-k="'+k+'"><i style="background:'+COLORS[k]+'">'+phEsc(NAMES[k].charAt(0))+'</i><span><b style="color:'+COLORS[k]+'">'+phEsc(NAMES[k])+'</b><em>'+friendLabel(v)+' · <span class="hearts">'+hs+'</span></em></span><u>▸</u></button>'}).join('')
      :'<p class="phNote">Personne pour l’instant. Parle aux gens de la Zone Zéro.</p>';}
  else if(phApp==='neura'){const o=$('obj')?$('obj').innerText.replace(/^[▸◆✓]\s*/gm,'').trim():'',f=$('frags')?$('frags').textContent:'';
    h='<div class="phNeura"><img src="assets/img/neura.png" alt=""><b>NEURA</b><span>ton IA de compagnie</span></div>'+
      '<div class="phCard"><em>Objectif en cours</em>'+phEsc(o||'Explore la Zone Zéro.').replace(/\n/g,'<br>')+'</div>'+(f?'<div class="phCard"><em>Mémoire</em>'+phEsc(f)+'</div>':'')+
      '<div class="phCard"><em>Conseil</em>'+phEsc(NEURA_TIPS[Math.floor(Math.random()*NEURA_TIPS.length)])+'</div>';}
  else if(phApp==='moto'){const far=typeof moto!=='undefined'&&moto?Math.round(Math.hypot(player.position.x-moto.position.x,player.position.z-moto.position.z)):0,inside=!!zoneOf();
    h='<div class="phCard"><em>État</em>'+(typeof riding!=='undefined'&&riding?'Tu es en selle.':inside?'Garée dehors.':'À '+far+' m de toi.')+'<br>Cœur à fusion : 99 %</div>'+
      '<button type="button" class="phWide" data-act="recall"'+(typeof riding!=='undefined'&&riding?' disabled':'')+'>Rappeler devant la planque</button>'+
      '<div class="phCard"><em>Garage · néons</em><div class="phSw2">'+MOTO_NEON.map(([n,c])=>'<button type="button" title="'+n+'" data-neon="'+c+'" class="'+(((S.motoStyle||{}).a||'#39e6ff')===c?'on':'')+'" style="--c:'+c+'"></button>').join('')+'</div>'+
      '<em>Néons secondaires</em><div class="phSw2">'+MOTO_NEON.map(([n,c])=>'<button type="button" title="'+n+'" data-neon2="'+c+'" class="'+(((S.motoStyle||{}).b||'#ff3b8d')===c?'on':'')+'" style="--c:'+c+'"></button>').join('')+'</div>'+
      '<em>Carrosserie</em><div class="phList">'+MOTO_BODY.map(([n,c])=>'<button type="button" data-body="'+c+'" class="'+(((S.motoStyle||{}).body||'#ffffff')===c?'on':'')+'"><i>'+(((S.motoStyle||{}).body||'#ffffff')===c?'●':'○')+'</i>'+n+'</button>').join('')+'</div></div>';}
  B.innerHTML=h;
}
$('phone').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.app==='sac'){togglePhone(false);toggleInv(true);return}
  if(t.dataset.app==='settings'){togglePhone(false);openSettings();overlayOpen=true;renderKeySettings();return}
  if(t.dataset.app)return phOpen(t.dataset.app);
  const a=t.dataset.act;
  if(a==='map'){S.minimap=!S.minimap;save();$('minimap').hidden=!S.minimap}
  else if(a==='play'){S.walkman=!S.walkman;save();if(typeof audioInit==='function')audioInit()}
  else if(a==='recall'){recallMoto()}
  else if(a==='unstuck'){togglePhone(false);unstuck();return}
  else if(a==='bigmap'){togglePhone(false);openBigMap();return}
  else if(a==='wpclear'){S.wp=null;save()}
  else if(a==='camera'){togglePhone(false);startPhoto();return}
  else if(t.dataset.photo!=null){let ph=[];try{ph=JSON.parse(localStorage.getItem('neobxl-photos')||'[]')}catch(_){}const u=ph[+t.dataset.photo];if(u){const l=document.createElement('a');l.href=u;l.download='neo-bxl-photo.jpg';l.click()}return}
  else if(t.dataset.neon||t.dataset.neon2||t.dataset.body){S.motoStyle=S.motoStyle||{};if(t.dataset.neon)S.motoStyle.a=t.dataset.neon;if(t.dataset.neon2)S.motoStyle.b=t.dataset.neon2;if(t.dataset.body)S.motoStyle.body=t.dataset.body;save();applyMotoStyle()}
  else if(t.dataset.track){if(S.wmTrack===t.dataset.track)S.walkman=!S.walkman;else{S.wmTrack=t.dataset.track;S.walkman=true}save();if(typeof audioInit==='function')audioInit()}
  else if(t.dataset.k){togglePhone(false);openFiche(t.dataset.k);return}
  else return;
  renderPhone()});
$('phone').addEventListener('input',e=>{const k=e.target.dataset.vol;if(!k||typeof AUD==='undefined')return;AUD.vol[k]=+e.target.value;audioInit();applyVolumes();saveAudio();
  const s=document.getElementById({master:'volMaster',music:'volMusic',amb:'volAmb',sfx:'volSfx'}[k]);if(s)s.value=e.target.value; // les Paramètres restent d’accord
  e.target.previousElementSibling.querySelector('b').textContent=Math.round(e.target.value*100)+'%'});
$('phBack').onclick=()=>phOpen(null);
$('phClose').onclick=()=>togglePhone(false);

// ---- la mini-carte : la ville vue de haut (rues, trottoirs, immeubles, eau), les lieux, ta position et ton regard ----
let mmBase=null,mmT=0;
function buildMinimap(){
  const c=document.createElement('canvas'),k=2;c.width=W*k;c.height=H*k;const g=c.getContext('2d');
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){const t=tile[I(x,z)];g.fillStyle=solid[I(x,z)]?(t===5?'#0d2f5e':'#11141c'):t===2?'#3a404c':t===1?'#5a6070':t===5?'#0d2f5e':'#4a505c';g.fillRect(x*k,z*k,k,k)}
  for(const id in PL){const p=PL[id],P=PLACE[id];if(!P)continue;g.fillStyle=P.c;g.fillRect((p.x-p.hw)*k,(p.z-p.hd)*k,p.hw*2*k,p.hd*2*k);g.globalAlpha=.35;g.fillStyle='#000';g.fillRect((p.x-p.hw)*k+2,(p.z-p.hd)*k+2,p.hw*2*k-4,p.hd*2*k-4);g.globalAlpha=1}
  g.fillStyle='#7cf29a';g.fillRect((HX+2)*k,(HZ+2)*k,10*k,8*k); // ta planque
  mmBase=c;$('minimap').hidden=!S.minimap;
}
// la mini-carte est ronde et centrée sur toi : elle défile pendant que tu te déplaces (le nord reste en haut)
let mmLast=null;
function updateMinimap(dt){
  const show=!!(mmBase&&S.minimap&&started&&!$('hudL').hidden);$('mmWrap').hidden=!show;$('minimap').hidden=!show;if(!show)return;mmT+=dt;if(mmT<.12)return;mmT=0;
  const cv=$("minimap"),g=cv.getContext("2d"),R=cv.width/2,k=2,s=.95,z=zoneOf(),inRoom=!!(z&&String(z).startsWith('in_'));
  if(!inRoom&&!z)mmLast={x:player.position.x,z:player.position.z};const c=inRoom||!mmLast?(mmLast||{x:W/2,z:H/2}):mmLast; // dans une pièce : la carte reste là où tu es entré
  const px=x=>R+(x-c.x)*k*s,pz=zz=>R+(zz-c.z)*k*s;
  g.clearRect(0,0,cv.width,cv.height);g.save();g.beginPath();g.arc(R,R,R-1,0,7);g.clip();g.fillStyle='#07090e';g.fillRect(0,0,cv.width,cv.height);
  g.imageSmoothingEnabled=false;g.drawImage(mmBase,px(0),pz(0),mmBase.width*s,mmBase.height*s);
  if(typeof moto!=='undefined'&&moto){g.fillStyle='#c8ccd6';g.fillRect(px(moto.position.x)-3,pz(moto.position.z)-3,6,6)}
  if(typeof taxi!=='undefined'&&taxi){g.fillStyle='#ffe14d';g.fillRect(px(taxi.g.position.x)-3,pz(taxi.g.position.z)-3,6,6)}
  // les gens à aller voir (petit bonhomme à leur couleur) et les pistes en cours (losange) ; s'ils sont dans un lieu, on les montre à sa porte
  const atDoor=(z,x,zz)=>{if(!z)return {x,z:zz};if(z==='roof')return {x:ROOF.x,z:ROOF.z};if(z==='in_metro')return METRO_E;const id=String(z).slice(3);return PL[id]?FP(id,1.2,0):{x,z:zz}};
  const edge=(x,z)=>{let wx=px(x)-R,wz=pz(z)-R;const L=Math.hypot(wx,wz),M=R-9;if(L>M){wx*=M/L;wz*=M/L}return [R+wx,R+wz]};
  npcs.forEach(n=>{if(!questTarget(n.id))return;const p=atDoor(n.zone,n.mesh.position.x,n.mesh.position.z),[qx,qz]=edge(p.x,p.z);g.fillStyle=COLORS[n.id];g.beginPath();g.arc(qx,qz-4,2.6,0,7);g.fill();g.fillRect(qx-2.5,qz-1,5,6);g.strokeStyle='#000';g.lineWidth=1;g.strokeRect(qx-2.5,qz-1,5,6)});
  for(const id in S.q){const q=S.q[id];if(!q.active||q.b>=3)continue;const s=spotOf(id,q.b),p=atDoor(s.zone||(s.roof?'roof':null),s.x,s.z),[qx,qz]=edge(p.x,p.z);g.save();g.translate(qx,qz);g.rotate(Math.PI/4);g.fillStyle=COLORS[id];g.fillRect(-3.5,-3.5,7,7);g.strokeStyle='#fff';g.strokeRect(-3.5,-3.5,7,7);g.restore()}
  if(S.wp){let wx=px(S.wp.x)-R,wz=pz(S.wp.z)-R;const L=Math.hypot(wx,wz),M=R-10;if(L>M){wx*=M/L;wz*=M/L}g.fillStyle='#ffb547';g.beginPath();g.arc(R+wx,R+wz,L>M?4:6,0,7);g.fill()} // le repère (au bord si loin)
  const va=Math.atan2(-Math.cos(yaw),-Math.sin(yaw)),a=player.userData.ry||0; // le regard de la caméra, puis toi
  g.translate(px(c.x),pz(c.z));g.fillStyle='rgba(57,230,255,.2)';g.beginPath();g.moveTo(0,0);g.arc(0,0,30,va-.5,va+.5);g.fill();
  g.rotate(-a+Math.PI);g.fillStyle='#39e6ff';g.beginPath();g.moveTo(0,-6);g.lineTo(5,5);g.lineTo(-5,5);g.closePath();g.fill();g.restore();
  g.strokeStyle='rgba(57,230,255,.6)';g.lineWidth=2;g.beginPath();g.arc(R,R,R-1,0,7);g.stroke();g.fillStyle='#cfe8ff';g.font='bold 10px monospace';g.textAlign='center';g.fillText('N',R,12);
  $('mmLabel').textContent=inRoom?(IN_NAMES[z.slice(3)]||'Intérieur'):z==='ile'?'Néo-Récif':'Zone Zéro';
}

// ---- carte plein écran : toute la Zone Zéro, les lieux, les pistes en cours ; un clic pose un repère ----
let bmOpen=false;
function openBigMap(){bmOpen=true;$('bigMap').hidden=false;overlayOpen=true;target=null;drawBigMap()}
function closeBigMap(){bmOpen=false;$('bigMap').hidden=true;overlayOpen=false}
function bmFit(){const cv=$('bmCv'),k=Math.min(cv.width/W,cv.height/H);return {cv,k,ox:(cv.width-W*k)/2,oy:(cv.height-H*k)/2}}
function drawBigMap(){if(!bmOpen||!mmBase)return;const {cv,k,ox,oy}=bmFit(),g=cv.getContext('2d'),X=x=>ox+x*k,Z=z=>oy+z*k;
  g.fillStyle='#05070c';g.fillRect(0,0,cv.width,cv.height);g.imageSmoothingEnabled=false;g.drawImage(mmBase,ox,oy,W*k,H*k);
  g.strokeStyle='rgba(57,230,255,.08)';g.lineWidth=1;for(let i=0;i<=W;i+=8){g.beginPath();g.moveTo(X(i),oy);g.lineTo(X(i),Z(H));g.stroke()}for(let i=0;i<=H;i+=8){g.beginPath();g.moveTo(ox,Z(i));g.lineTo(X(W),Z(i));g.stroke()}
  g.textAlign='center';g.font='bold 12px Rajdhani, sans-serif';
  for(const id in PL){const P=PLACE[id];if(!P)continue;const p=PL[id];g.fillStyle='#000a';const t=P.n,tw=g.measureText(t).width+10;g.fillRect(X(p.x)-tw/2,Z(p.z)-8,tw,16);g.fillStyle=P.c;g.fillText(t,X(p.x),Z(p.z)+4)}
  g.fillStyle='#7dffb0';g.fillText('TA PLANQUE',X(HX+7),Z(HZ+6)+4);
  [[METRO_E,'MÉTRO'],[METRO_W,'MÉTRO']].forEach(([m,t])=>{g.fillStyle='#39e6ff';g.beginPath();g.arc(X(m.x),Z(m.z),5,0,7);g.fill();g.fillText(t,X(m.x),Z(m.z)-9)});
  // pistes en cours (dans une pièce : à la porte du lieu)
  for(const id in S.q){const q=S.q[id];if(!q.active||q.b>=3)continue;let s=spotOf(id,q.b);const z=s.zone&&String(s.zone).slice(3);if(z&&PL[z])s=FP(z,1.2,0);else if(z==='metro')s=METRO_E;
    g.fillStyle=COLORS[id];g.save();g.translate(X(s.x),Z(s.z));g.rotate(Math.PI/4);g.fillRect(-6,-6,12,12);g.restore();g.font='11px JetBrains Mono, monospace';g.fillText(NAMES[id],X(s.x),Z(s.z)+20);g.font='bold 12px Rajdhani, sans-serif'}
  if(moto){g.fillStyle='#c8ccd6';g.fillRect(X(moto.position.x)-4,Z(moto.position.z)-4,8,8)}
  if(S.wp){g.strokeStyle='#ffb547';g.lineWidth=3;g.beginPath();g.arc(X(S.wp.x),Z(S.wp.z),10,0,7);g.stroke();g.fillStyle='#ffb547';g.fillText('REPÈRE',X(S.wp.x),Z(S.wp.z)-15)}
  const zo=zoneOf(),pp=zo&&String(zo).startsWith('in_')&&mmLast?mmLast:player.position;
  g.save();g.translate(X(pp.x),Z(pp.z));g.rotate(-(player.userData.ry||0)+Math.PI);g.fillStyle='#39e6ff';g.shadowColor='#39e6ff';g.shadowBlur=12;g.beginPath();g.moveTo(0,-10);g.lineTo(8,8);g.lineTo(-8,8);g.closePath();g.fill();g.restore();
  g.fillStyle='#cfe8ff';g.font='bold 14px JetBrains Mono, monospace';g.fillText('N',cv.width/2,18)}
$('bmCv').addEventListener('click',e=>{const {cv,k,ox,oy}=bmFit(),r=cv.getBoundingClientRect(),x=((e.clientX-r.left)*cv.width/r.width-ox)/k,z=((e.clientY-r.top)*cv.height/r.height-oy)/k;
  if(x<0||z<0||x>W||z>H)return;S.wp={x,z};save();toast('Repère posé.','');drawBigMap()});
$('bmClear').onclick=()=>{S.wp=null;save();drawBigMap()};$('bmClose').onclick=closeBigMap;
addEventListener('keydown',e=>{if(bmOpen&&(e.code==='Escape'||e.code==='KeyF')){e.stopImmediatePropagation();e.preventDefault();closeBigMap()}},true);

// ---- le repère dans la ville : une colonne de lumière ambre, qui disparaît quand on l'atteint ----
let wpBeam=null;
function updateWaypoint(){if(!wpBeam){wpBeam=new THREE.Group();const m=new THREE.Mesh(new THREE.CylinderGeometry(.25,.5,40,12,1,true),new THREE.MeshBasicMaterial({color:0xffb547,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.y=20;wpBeam.add(m);
    const r=new THREE.Mesh(new THREE.RingGeometry(.6,.8,24),new THREE.MeshBasicMaterial({color:0xffb547,transparent:true,opacity:.8,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.05;wpBeam.add(r);scene.add(wpBeam)}
  const on=!!(S.wp&&started&&!zoneOf());wpBeam.visible=on;if(!on)return;wpBeam.position.set(S.wp.x,0,S.wp.z);wpBeam.children[1].scale.setScalar(1+Math.sin(tAcc*3)*.15);
  if(Math.hypot(player.position.x-S.wp.x,player.position.z-S.wp.z)<2.2){S.wp=null;save();toast('Repère atteint.','')}}

// ---- appareil photo : l'interface s'efface, Espace déclenche, la photo s'enregistre ----
let photoMode=false,photoHud=[];
const PHOTO_HIDE=['hudL','hudR','help','cam','prompt','mmWrap','labels','toasts'];
function startPhoto(){photoMode=true;photoHud=PHOTO_HIDE.filter(id=>$(id)&&!$(id).hidden);photoHud.forEach(id=>$(id).hidden=true);$('photoUI').hidden=false;
  $('pfInfo').textContent=(zoneOf()&&String(zoneOf()).startsWith('in_')?IN_NAMES[String(zoneOf()).slice(3)]:'Zone Zéro')+' · '+phClock()}
function stopPhoto(){photoMode=false;photoHud.forEach(id=>$(id).hidden=false);$('photoUI').hidden=true}
function takePhoto(){if(composer)composer.render();else renderer.render(scene,camera);const c=renderer.domElement;let full;try{full=c.toDataURL('image/jpeg',.92)}catch(_){return}
  const l=document.createElement('a');l.href=full;l.download='neo-bxl-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.jpg';l.click();
  const t=document.createElement('canvas'),w=320;t.width=w;t.height=Math.round(w*c.height/c.width);t.getContext('2d').drawImage(c,0,0,t.width,t.height);
  let ph=[];try{ph=JSON.parse(localStorage.getItem('neobxl-photos')||'[]')}catch(_){}ph.unshift(t.toDataURL('image/jpeg',.8));ph=ph.slice(0,9);try{localStorage.setItem('neobxl-photos',JSON.stringify(ph))}catch(_){}
  const f=$('pfFlash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');if(typeof sfx==='function')try{sfx('click')}catch(_){}}
$('pfShot').onclick=takePhoto;$('pfExit').onclick=stopPhoto;
addEventListener('keydown',e=>{if(!photoMode)return;if(e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();takePhoto()}else if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();stopPhoto()}},true);
