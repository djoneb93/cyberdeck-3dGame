// Le téléphone : touche F pour le sortir ou le ranger (E reste la touche des interactions).
// Deux applications pour commencer : la mini-carte (affichée en bas à droite de l'écran) et le baladeur (musique partout en ville).
'use strict';

let phoneOpen=false;
function togglePhone(force){phoneOpen=force!=null?force:!phoneOpen;$('phone').hidden=!phoneOpen;overlayOpen=phoneOpen;if(phoneOpen){target=null;pendingTalk=null;renderPhone()}}
addEventListener('keydown',e=>{if(e.code!=='KeyF'||!started||dlgOpen||cine||!$('pause').hidden||!$('intro').hidden||!$('settings').hidden)return;if(overlayOpen&&!phoneOpen)return;e.preventDefault();togglePhone()});
addEventListener('keydown',e=>{if(e.code==='Escape'&&phoneOpen){e.stopImmediatePropagation();togglePhone(false)}},true);
const TRACKS={calm:'Néons sous la pluie',club:'Nuit au club Ondes'};
function renderPhone(){
  const h=S.hour||0,hh=String(Math.floor(h)).padStart(2,'0'),mm=String(Math.floor((h%1)*60)).padStart(2,'0');
  $('phTime').textContent=hh+':'+mm;$('phMap').classList.toggle('on',!!S.minimap);$('phMapState').textContent=S.minimap?'affichée':'masquée';
  $('phPlay').textContent=S.walkman?'❚❚':'▶';$('phTrack').textContent=TRACKS[S.wmTrack||'calm'];$('phMusic').classList.toggle('on',!!S.walkman);
}
$('phMap').onclick=()=>{S.minimap=!S.minimap;save();renderPhone();$('minimap').hidden=!S.minimap};
$('phPlay').onclick=()=>{S.walkman=!S.walkman;save();renderPhone();if(typeof audioInit==='function')audioInit()};
$('phNext').onclick=()=>{S.wmTrack=(S.wmTrack||'calm')==='calm'?'club':'calm';save();renderPhone()};
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
function updateMinimap(dt){
  const show=!!(mmBase&&S.minimap&&started&&!$('hudL').hidden);$('mmWrap').hidden=!show;$('minimap').hidden=!show;if(!show)return;mmT+=dt;if(mmT<.15)return;mmT=0;const cv=$('minimap'),g=cv.getContext('2d'),k=2,z=zoneOf();
  g.clearRect(0,0,cv.width,cv.height);g.drawImage(mmBase,0,0);
  if(typeof moto!=='undefined'&&moto){g.fillStyle='#ff8a3d';g.fillRect(moto.position.x*k-2,moto.position.z*k-2,4,4)}
  if(typeof taxi!=='undefined'&&taxi){g.fillStyle='#ffe14d';g.fillRect(taxi.g.position.x*k-2,taxi.g.position.z*k-2,4,4)}
  if(z&&String(z).startsWith('in_')){$('mmLabel').textContent=(IN_NAMES[z.slice(3)]||'Intérieur');return}
  $('mmLabel').textContent='Zone Zéro';const p=player.position,a=player.userData.ry||0;
  const va=Math.atan2(-Math.cos(yaw),-Math.sin(yaw)); // là où regarde la caméra
  g.save();g.translate(p.x*k,p.z*k);g.fillStyle='rgba(57,230,255,.18)';g.beginPath();g.moveTo(0,0);g.arc(0,0,22,va-.5,va+.5);g.fill();
  g.rotate(-a+Math.PI);g.fillStyle='#39e6ff';g.beginPath();g.moveTo(0,-5);g.lineTo(4,4);g.lineTo(-4,4);g.closePath();g.fill();g.restore();
}
