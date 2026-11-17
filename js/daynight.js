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
  // on retient l'intensité d'origine des lampes et des fenêtres, pour les baisser en plein jour
  scene.traverse(o=>{
    if(o.isPointLight&&!(inLights||[]).includes(o))dnLights.push([o,o.intensity]);
    const m=o.material;if(m&&!Array.isArray(m)&&m.emissive&&m.emissiveIntensity>.2&&!dnEmis.some(e=>e[0]===m))dnEmis.push([m,m.emissiveIntensity]);
  });
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
  if(skyMesh)skyMesh.material.opacity=1-Math.max(d,gld*.5);
  if(dnStars)dnStars.material.opacity=.7*(1-Math.min(1,d*2+gld));
  // ciel et sol, soleil (ou lune)
  hemi.intensity+=d*1.05+gld*.25;hemi.color.copy(C_HEMI_N).lerp(C_HEMI_D,d);hemi.groundColor.copy(C_GND_N).lerp(C_GND_D,d);
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
