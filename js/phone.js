// Le téléphone : touche F pour le sortir ou le ranger (E reste la touche des interactions).
// NEURA OS : un écran d'accueil et six applications — Carte (mini-carte), Musique (baladeur), Son (volumes),
// Contacts (les gens que tu as rencontrés), NEURA (ton IA : objectif en cours, souvenirs, conseils) et Moto (la rappeler).
'use strict';

let phoneOpen=false,phApp=null;
function togglePhone(force){phoneOpen=force!=null?force:!phoneOpen;$('phone').hidden=!phoneOpen;overlayOpen=phoneOpen;if(phoneOpen){target=null;pendingTalk=null;phOpen(null)}}
addEventListener('keydown',e=>{if(e.code!=='KeyF'||!started||dlgOpen||cine||!$('pause').hidden||!$('intro').hidden||!$('settings').hidden)return;if(overlayOpen&&!phoneOpen)return;e.preventDefault();togglePhone()});
addEventListener('keydown',e=>{if(!phoneOpen)return;if(e.code==='Escape'||e.code==='Backspace'){e.stopImmediatePropagation();e.preventDefault();if(phApp)phOpen(null);else togglePhone(false)}},true);
const TRACKS={calm:'Néons sous la pluie',club:'Nuit au club Ondes',lofi:'Pluie sur Midi (lo-fi)',drive:'Autoroute néon',bar:'Cocktail au Néon Noir',arcade:'Pixel Rush (arcade)'},TRACK_ORDER=Object.keys(TRACKS);
const PH_APPS={map:'Carte',music:'Musique',sound:'Son',contacts:'Contacts',neura:'NEURA',moto:'Moto'};
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
    document.querySelectorAll('#phHome [data-app]').forEach(b=>b.classList.toggle('on',(b.dataset.app==='map'&&!!S.minimap)||(b.dataset.app==='music'&&!!S.walkman)));return}
  $('phAppT').textContent=PH_APPS[phApp];const B=$('phBody');let h='';
  if(phApp==='map')h='<div class="phRow"><span>Mini-carte à l’écran</span><button type="button" class="phSw'+(S.minimap?' on':'')+'" data-act="map"><i></i></button></div>'+
    '<p class="phNote">Ronde, centrée sur toi, le nord en haut. Les lieux sont en couleur, ta planque en vert, ta moto en gris et le taxi en jaune.</p>';
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
      '<p class="phNote">Elle revient se garer sur sa place réservée, devant ta planque.</p>';}
  B.innerHTML=h;
}
$('phone').addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.app)return phOpen(t.dataset.app);
  const a=t.dataset.act;
  if(a==='map'){S.minimap=!S.minimap;save();$('minimap').hidden=!S.minimap}
  else if(a==='play'){S.walkman=!S.walkman;save();if(typeof audioInit==='function')audioInit()}
  else if(a==='recall'){recallMoto()}
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
  const va=Math.atan2(-Math.cos(yaw),-Math.sin(yaw)),a=player.userData.ry||0; // le regard de la caméra, puis toi
  g.translate(px(c.x),pz(c.z));g.fillStyle='rgba(57,230,255,.2)';g.beginPath();g.moveTo(0,0);g.arc(0,0,30,va-.5,va+.5);g.fill();
  g.rotate(-a+Math.PI);g.fillStyle='#39e6ff';g.beginPath();g.moveTo(0,-6);g.lineTo(5,5);g.lineTo(-5,5);g.closePath();g.fill();g.restore();
  g.strokeStyle='rgba(57,230,255,.6)';g.lineWidth=2;g.beginPath();g.arc(R,R,R-1,0,7);g.stroke();g.fillStyle='#cfe8ff';g.font='bold 10px monospace';g.textAlign='center';g.fillText('N',R,12);
  $('mmLabel').textContent=inRoom?(IN_NAMES[z.slice(3)]||'Intérieur'):'Zone Zéro';
}
