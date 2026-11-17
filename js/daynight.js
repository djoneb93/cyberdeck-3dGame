// Cycle jour / nuit : une journée de NEO-BXL dure 24 minutes réelles (1 minute = 1 heure).
// Touche N : passer au moment suivant (aube, jour, crépuscule, nuit). L'heure est sauvegardée avec la partie.
// La météo (js/weather.js) donne le brouillard et la teinte du ciel ; ici on y ajoute la lumière du soleil.
'use strict';

const DAY_MIN=24,PHASES=[[6,'AUBE'],[12,'JOUR'],[19,'CRÉPUSCULE'],[23,'NUIT']];
let dnStars=null,dnLights=[],dnEmis=[],dnSkip=null,dnLevel=0;
const C_NIGHT_BG=new THREE.Color(0x0a0d1a),C_DAY=new THREE.Color(0x9ab2c8),C_DUSK=new THREE.Color(0xd88a64),
  C_HEMI_N=new THREE.Color(0x5a6ab0),C_HEMI_D=new THREE.Color(0xe4ecff),C_GND_N=new THREE.Color(0x0a0a16),C_GND_D=new THREE.Color(0x5a5650),
  C_MOON=new THREE.Color(0x7a8cff),C_SUN=new THREE.Color(0xfff0d8),C_SUNSET=new THREE.Color(0xff9a60),tmpC=new THREE.Color();

function setupDayNight(){
  if(S.hour==null)S.hour=22;
  dnStars=scene.children.find(o=>o.isPoints&&o.material.size===1.3)||null;
  if(skyMesh){skyMesh.material.transparent=true}scene.add(moon.target);
  buildDaySky();
  // on retient l'intensité d'origine des lampes et des fenêtres, pour les baisser en plein jour
  scene.traverse(o=>{
    if(o.isPointLight&&!(inLights||[]).includes(o))dnLights.push([o,o.intensity]);
    const m=o.material;if(m&&!Array.isArray(m)&&m.emissive&&m.emissiveIntensity>.2&&!dnEmis.some(e=>e[0]===m))dnEmis.push([m,m.emissiveIntensity]);
  });
}
// ---- deux ciels : celui de la nuit (étoiles, lueur de la ville, js/world.js) et celui du jour (bleu, nuages), en fondu ----
let daySky=null,sunSpr=null,moonSpr=null;
function buildDaySky(){
  const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,'#1f4f9a');gr.addColorStop(.3,'#4f86c8');gr.addColorStop(.44,'#9cc0e0');gr.addColorStop(.5,'#e4e2d6');gr.addColorStop(.53,'#8a8c90');gr.addColorStop(1,'#4a4c50');
  g.fillStyle=gr;g.fillRect(0,0,512,256);
  // nuages : des amas de bulles douces, raccordés sur les bords pour faire le tour du ciel
  const puff=(x,y,r,a)=>{for(const dx of [-512,0,512]){const q=g.createRadialGradient(x+dx,y,0,x+dx,y,r);q.addColorStop(0,'rgba(255,255,255,'+a+')');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.beginPath();g.arc(x+dx,y,r,0,7);g.fill()}};
  for(let k=0;k<26;k++){const x=Math.random()*512,y=40+Math.random()*78,s=.5+Math.random();for(let i=0;i<7;i++)puff(x+(Math.random()-.5)*60*s,y+(Math.random()-.5)*10*s,(10+Math.random()*16)*s*(1-(y-40)/200),.38)}
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;
  daySky=new THREE.Mesh(new THREE.SphereGeometry(196,32,16),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,fog:false,depthWrite:false,transparent:true,opacity:0}));
  daySky.position.set(W/2,0,H/2);daySky.renderOrder=-1;scene.add(daySky);
  sunSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xfff2c8,fog:false,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending}));sunSpr.scale.set(46,46,1);sunSpr.renderOrder=-1;scene.add(sunSpr);
  const mc=document.createElement('canvas');mc.width=mc.height=64;const m=mc.getContext('2d');m.fillStyle='#e8ecf4';m.beginPath();m.arc(32,32,26,0,7);m.fill();
  m.fillStyle='rgba(150,160,180,.5)';[[22,24,6],[38,36,8],[28,42,4],[42,20,4]].forEach(([x,y,r])=>{m.beginPath();m.arc(x,y,r,0,7);m.fill()});
  moonSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(mc),fog:false,depthWrite:false,transparent:true}));moonSpr.scale.set(12,12,1);moonSpr.renderOrder=-1;scene.add(moonSpr);
}
function updateSky(h,d,gld){
  if(!daySky)return;const a=(h-6)/12*Math.PI,cp=camera.position,cx=cp.x,cz=cp.z+40;
  daySky.position.set(cp.x,0,cp.z);if(skyMesh)skyMesh.position.set(cp.x,0,cp.z); // les ciels suivent la caméra : jamais coupés par la distance d’affichage
  const out=!String(zoneOf()||"").startsWith("in_");[daySky,sunSpr,moonSpr,skyMesh,dnStars].forEach(o=>{if(o)o.visible=out}); // dans une pièce : pas de ciel
  daySky.material.opacity=Math.max(d,gld*.75);daySky.material.color.copy(wx.sky).lerp(C_DUSK,gld*.65);daySky.rotation.y+=.0004;
  sunSpr.position.set(cx-Math.cos(a)*140,Math.sin(a)*100+8,cz-50);sunSpr.material.opacity=Math.max(0,Math.min(1,Math.sin(a)*3+.3))*(wx.rain>.5?.35:1);sunSpr.material.color.copy(C_SUN).lerp(C_SUNSET,gld);
  moonSpr.position.set(cx+Math.cos(a)*140,-Math.sin(a)*100+8,cz-50);moonSpr.material.opacity=Math.max(0,Math.min(1,-Math.sin(a)*3))*(1-d);
}
// lumière du jour (0 la nuit, 1 en plein jour) et lueur dorée de l'aube et du crépuscule
function daylight(h){return Math.max(0,Math.min(1,Math.sin((h-6)/12*Math.PI)*1.7))}
function goldenHour(h){return Math.min(1,Math.exp(-Math.pow(h-6.6,2)/1.2)+Math.exp(-Math.pow(h-18.4,2)/1.2))}
function phaseName(h){return h>=5&&h<8?'AUBE':h>=8&&h<17.5?'JOUR':h>=17.5&&h<20.5?'CRÉPUSCULE':'NUIT'}

function updateDayNight(dt){
  if(!started)return;
  // passage rapide vers le moment demandé (touche N), sinon l'horloge avance doucement
  if(dnSkip!=null){const left=((dnSkip-S.hour)%24+24)%24,step=Math.min(left,dt*6);S.hour=(S.hour+step)%24;if(left<.01)dnSkip=null}
  else S.hour=(S.hour+dt*24/(DAY_MIN*60))%24;
  const h=S.hour,d=daylight(h),gld=goldenHour(h)*(1-d*.6);dnLevel=d;
  // brouillard et fond : la brume du jour prend la teinte de la météo
  tmpC.copy(C_DAY).multiply(wx.sky).lerp(C_DUSK,gld*.6);
  scene.fog.color.lerp(tmpC,Math.max(d*.9,gld*.5));
  scene.background.copy(C_NIGHT_BG).lerp(scene.fog.color,Math.max(d,gld*.6));
  scene.fog.density*=1-d*.35;
  if(skyMesh)skyMesh.material.opacity=1-Math.max(d,gld*.5);updateSky(h,d,gld);
  if(dnStars)dnStars.material.opacity=.7*(1-Math.min(1,d*2+gld));
  // ciel et sol, soleil (ou lune)
  hemi.intensity+=d*.8+gld*.25;hemi.color.copy(C_HEMI_N).lerp(C_HEMI_D,d);hemi.groundColor.copy(C_GND_N).lerp(C_GND_D,d);
  const a=(h-6)/12*Math.PI;moon.position.set(W/2+Math.cos(a)*-60,Math.max(8,Math.sin(a)*70),H/2+30);moon.target.position.set(W/2,0,H/2);
  moon.color.copy(C_MOON).lerp(C_SUN,d).lerp(C_SUNSET,gld*.7);moon.intensity=.3+d*1.05+gld*.4;
  // les néons restent, mais les fenêtres et les lampes comptent moins en plein jour
  const lk=1-d*.7;dnLights.forEach(([l,b])=>l.intensity=b*lk);dnEmis.forEach(([m,b])=>m.emissiveIntensity=b*(1-d*.6));
  if(bloom){bloom.strength=1.15-d*.6;bloom.threshold=.6+d*.25}
}
function skipPhase(){const fw=p=>((p-S.hour)%24+24)%24,next=PHASES.filter(([p])=>fw(p)>.5).sort((x,y)=>fw(x[0])-fw(y[0]))[0];
  dnSkip=next[0];toast('Le temps passe… · '+next[1],'')}
addEventListener('keydown',e=>{if(e.code!=='KeyN'||dlgOpen||overlayOpen||!started)return;skipPhase()});

// l'heure s'affiche sous la météo
const _meteoHUD=updateMeteoHUD;
updateMeteoHUD=function(){_meteoHUD();const el=$('meteo');if(!el||S.hour==null)return;const h=S.hour,hh=Math.floor(h),mm=Math.floor((h-hh)*60);
  el.insertAdjacentHTML('beforeend','<span class="clock"><b>'+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+'</b> '+phaseName(h)+' · N</span>')};
