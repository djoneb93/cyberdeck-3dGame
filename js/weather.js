// Météo dynamique, comme dans l'appli : elle change toutes les 3 heures (heure réelle).
// Ciel clair, pluie acide, orage (éclairs), tempête de sable, tempête magnétique (aurores). Touche M : aperçu de la suivante.
'use strict';

const WEATHERS=[
  {n:'CIEL CLAIR',ico:'☾',rain:0,fogC:0x101428,fogD:.02,hemi:.8,tint:0xffffff,sky:0xffffff},
  {n:'PLUIE ACIDE',ico:'☂',rain:.75,rainC:0x7cf2c8,slant:.1,speed:1,fogC:0x0e1a22,fogD:.028,hemi:.72,sky:0xc8e8e0},
  {n:'ORAGE',ico:'ϟ',rain:1,rainC:0xbfd8ff,slant:.3,speed:1.35,fogC:0x0a0f1c,fogD:.032,hemi:.6,sky:0x8a9ab8,storm:true},
  {n:'TEMPÊTE DE SABLE',ico:'≋',rain:.85,rainC:0xf2c27b,sand:true,fogC:0x5a3e22,fogD:.05,hemi:.95,sky:0xd8a868},
  {n:'TEMPÊTE MAGNÉTIQUE',ico:'⌁',rain:0,fogC:0x170a32,fogD:.026,hemi:.75,sky:0xb898ff,aurora:true}
];
const SLOT=3*3600e3;
let weatherIdx=0,weatherPreview=null,wx=null,rain=null,hemiBase=.8,flash=0,boltT=0,bolt=null,auroras=[],skyMesh=null;
const wHash=n=>{let h=(n*2654435761)>>>0;h^=h>>>15;h=Math.imul(h,2246822519)>>>0;h^=h>>>13;return h>>>0};
function weatherNow(){return weatherPreview!=null?weatherPreview:wHash(Math.floor(Date.now()/SLOT))%WEATHERS.length}
function setupWeather(){
  weatherIdx=weatherNow();const w=WEATHERS[weatherIdx];
  wx={rain:w.rain,fogD:w.fogD,fogC:new THREE.Color(w.fogC),hemi:w.hemi,sky:new THREE.Color(w.sky||0xffffff),rainC:new THREE.Color(w.rainC||0x8fb8e8),aur:w.aurora?1:0};
  // aurores : rubans de lumière au-dessus de la ville
  const c=document.createElement('canvas');c.width=4;c.height=64;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,64);
  gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.6,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,1)');g.fillStyle=gr;g.fillRect(0,0,4,64);
  const tex=new THREE.CanvasTexture(c);
  [[0x5cffb0,0],[0xb98cff,1.3],[0x39e6ff,2.4]].forEach(([col,ph],i)=>{const geo=new THREE.PlaneGeometry(260,26,48,1);
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    m.position.set(W/2,48+i*9,H/2-60-i*25);m.rotation.x=-.25;scene.add(m);auroras.push({m,ph,base:geo.attributes.position.array.slice()})});
  // éclair
  bolt=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xeaf4ff,transparent:true,opacity:0,fog:false}));scene.add(bolt);
  updateMeteoHUD();
}
function makeRain(){const N=2600,pos=new Float32Array(N*6);rain={N,pos,sp:new Float32Array(N)};
  for(let i=0;i<N;i++){const x=(Math.random()-.5)*44,y=Math.random()*16,z=(Math.random()-.5)*44;pos.set([x,y,z,x+.05,y+.5,z],i*6);rain.sp[i]=15+Math.random()*8}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  rain.mesh=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x8fb8e8,transparent:true,opacity:.32}));scene.add(rain.mesh)}
function updateRain(dt){
  const w=WEATHERS[weatherIdx],p=rain.pos,sand=!!w.sand,sl=w.slant||0,spd=w.speed||1;
  for(let i=0;i<rain.N;i++){const o=i*6;
    if(sand){const dx=rain.sp[i]*1.1*dt;p[o]+=dx;p[o+3]=p[o]-.7;p[o+1]-=dt*.6;p[o+4]=p[o+1]+.02;
      if(p[o]>22||p[o+1]<0){const x=-22,y=Math.random()*6,z=(Math.random()-.5)*44;p[o]=x+Math.random()*4;p[o+1]=y;p[o+2]=z;p[o+3]=p[o]-.7;p[o+4]=y;p[o+5]=z}}
    else{const dy=rain.sp[i]*spd*dt;p[o+1]-=dy;p[o+4]=p[o+1]+.5;p[o]-=dy*sl;p[o+3]=p[o]+.05+sl*.5;
      if(p[o+1]<0){const x=(Math.random()-.5)*44,z=(Math.random()-.5)*44,y=14+Math.random()*3;p[o]=x;p[o+1]=y;p[o+2]=z;p[o+3]=x+.05;p[o+4]=y+.5;p[o+5]=z}}}
  rain.mesh.geometry.attributes.position.needsUpdate=true;rain.mesh.position.set(focus.x,focus.y-1.5,focus.z);
  rain.mesh.geometry.setDrawRange(0,Math.floor(rain.N*wx.rain)*2);rain.mesh.visible=wx.rain>.01;rain.mesh.material.color.copy(wx.rainC);rain.mesh.material.opacity=sand?.45:.32;
}
let meteoT=0;
function updateWeather(dt){
  const idx=weatherNow();if(idx!==weatherIdx){weatherIdx=idx;toast('Météo · '+WEATHERS[idx].n,'')}
  const w=WEATHERS[weatherIdx],k=Math.min(1,dt*.6);
  wx.rain+=(w.rain-wx.rain)*k;wx.fogD+=(w.fogD-wx.fogD)*k;wx.fogC.lerp(new THREE.Color(w.fogC),k);wx.hemi+=(w.hemi-wx.hemi)*k;
  wx.sky.lerp(new THREE.Color(w.sky||0xffffff),k);wx.rainC.lerp(new THREE.Color(w.rainC||0x8fb8e8),Math.min(1,dt*2));wx.aur+=((w.aurora?1:0)-wx.aur)*k;
  scene.fog.color.copy(wx.fogC);scene.fog.density=wx.fogD;if(skyMesh)skyMesh.material.color.copy(wx.sky);
  // orage : éclairs au hasard, la ville s'illumine un instant
  if(w.storm){boltT-=dt;if(boltT<=0){boltT=5+Math.random()*9;flash=1;const b=TOWERS[Math.floor(Math.random()*TOWERS.length)],x=UX(b.u),z=UZ(b.v),top=HZF(b.h)+.2;
    const pts=[];let px=x+(Math.random()-.5)*20,py=70;pts.push(new THREE.Vector3(px,py,z-10));for(let i=1;i<=9;i++){px+=(x-px)/(10-i)+(Math.random()-.5)*4;py=70-(70-top)*i/9;pts.push(new THREE.Vector3(px,py,z-10+i*10/9))}
    bolt.geometry.setFromPoints(pts)}}
  flash=Math.max(0,flash-dt*3.2);bolt.material.opacity=flash>.4?1:0;
  hemi.intensity=wx.hemi+flash*2.4;
  // tempête magnétique : aurores ondulantes
  auroras.forEach(a=>{a.m.material.opacity=wx.aur*(.35+.15*Math.sin(tAcc*.7+a.ph));if(wx.aur>.01){const p=a.m.geometry.attributes.position.array;
    for(let i=0;i<p.length;i+=3)p[i+1]=a.base[i+1]+Math.sin(a.base[i]*.04+tAcc*.6+a.ph)*4;a.m.geometry.attributes.position.needsUpdate=true}});
  meteoT+=dt;if(meteoT>1){meteoT=0;updateMeteoHUD()}
}
function updateMeteoHUD(){
  const el=$('meteo');if(!el)return;const w=WEATHERS[weatherIdx],left=SLOT-(Date.now()%SLOT),h=Math.floor(left/3600e3),m=Math.floor(left%3600e3/60000);
  el.innerHTML='<span class="mi">'+w.ico+'</span><span><b>'+w.n+'</b><i>'+(weatherPreview!=null?'aperçu · M pour continuer':'change dans '+(h?h+' h ':'')+String(m).padStart(2,'0')+' min')+'</i></span>';
}
addEventListener('keydown',e=>{if(e.code!=='KeyM'||dlgOpen||overlayOpen||!started)return;
  const real=wHash(Math.floor(Date.now()/SLOT))%WEATHERS.length,next=((weatherPreview!=null?weatherPreview:real)+1)%WEATHERS.length;
  weatherPreview=next===real?null:next;updateWeather(0);updateMeteoHUD()});
