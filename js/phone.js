// Le téléphone : touche F pour le sortir ou le ranger (E reste la touche des interactions).
// Deux applications pour commencer : la mini-carte (affichée en bas à droite de l'écran) et le baladeur (musique partout en ville).
'use strict';

let phoneOpen=false;
function togglePhone(force){phoneOpen=force!=null?force:!phoneOpen;$('phone').hidden=!phoneOpen;overlayOpen=phoneOpen;if(phoneOpen){target=null;pendingTalk=null;renderPhone()}}
addEventListener('keydown',e=>{if(e.code!=='KeyF'||!started||dlgOpen||cine||!$('pause').hidden||!$('intro').hidden||!$('settings').hidden)return;if(overlayOpen&&!phoneOpen)return;e.preventDefault();togglePhone()});
addEventListener('keydown',e=>{if(e.code==='Escape'&&phoneOpen){e.stopImmediatePropagation();togglePhone(false)}},true);
const TRACKS={calm:'Néons sous la pluie',club:'Nuit au club Ondes',lofi:'Pluie sur Midi (lo-fi)',drive:'Autoroute néon',bar:'Cocktail au Néon Noir',arcade:'Pixel Rush (arcade)'},TRACK_ORDER=Object.keys(TRACKS);
function renderPhone(){
  const h=S.hour||0,hh=String(Math.floor(h)).padStart(2,'0'),mm=String(Math.floor((h%1)*60)).padStart(2,'0');
  $('phTime').textContent=hh+':'+mm;$('phMap').classList.toggle('on',!!S.minimap);$('phMapState').textContent=S.minimap?'affichée':'masquée';
  $('phPlay').textContent=S.walkman?'❚❚':'▶';$('phTrack').textContent=TRACKS[S.wmTrack||'calm'];$('phMusic').classList.toggle('on',!!S.walkman);
}
$('phMap').onclick=()=>{S.minimap=!S.minimap;save();renderPhone();$('minimap').hidden=!S.minimap};
$('phPlay').onclick=()=>{S.walkman=!S.walkman;save();renderPhone();if(typeof audioInit==='function')audioInit()};
$('phNext').onclick=()=>{const i=TRACK_ORDER.indexOf(S.wmTrack||'calm');S.wmTrack=TRACK_ORDER[(i+1)%TRACK_ORDER.length];save();renderPhone()};
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
