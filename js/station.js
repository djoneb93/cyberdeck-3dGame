// La gare Zéro en détail : quais surélevés, verrière, escalier, tableau des départs, horloge, distributeurs, kiosque.
'use strict';

let departBoard=null,stationClock=null;
const DESTS=[['NOVA PRIME','QUAI 3'],['ROUILLEBOURG','QUAI 4'],['RING 14 · BADLANDS','QUAI 3'],['TOUR KUROGANE','QUAI 4'],['NÉCROPOLE NORD','QUAI 3'],['DOCKS NOIRS','QUAI 4']];
function buildStation(){
  const PY=2.6,z0=GZ0-.6,z1=GZ1,zc=(z0+z1)/2,L=z1-z0;
  // quais surélevés de part et d'autre de la voie, bord de sécurité jaune, éclairage sous le quai
  [-1,1].forEach(s=>{const xc=GX+s*1.68,ze=s<0?QUAI_END:z1,L=ze-z0,zc=(z0+ze)/2;
    box(1.55,.22,L,'#3a414c',xc,PY,zc);box(1.5,.02,L,'#4a525e',xc,PY+.12,zc);
    box(.12,.03,L,'#ffcf3a',GX+s*.98,PY+.13,zc,null,true);
    box(.04,.04,L,'#cfe8ff',xc,PY-.13,zc,null,true);
    for(let z=z0+1;z<ze-.5;z+=2.4){box(.06,1.1,.06,'#2a3140',xc+s*.5,PY+.66,z);box(.5,.3,.04,'#14181f',xc+s*.5,PY+1.3,z);box(.44,.22,.05,'#7cf29a',xc+s*.5,PY+1.3,z,null,true)} // écrans de quai
    if(s<0){for(let z=z0+1;z<ze-.5;z+=2.4)ZONES.quai.blocks.push([xc+s*.5,z,.08,.08]);for(let z=z0+2;z<ze-1;z+=3.2)ZONES.quai.blocks.push([xc+s*.52,z,.18,.48])}
    for(let z=z0+2;z<ze-1;z+=3.2){box(.32,.08,.9,'#4a3526',xc+s*.5,PY+.42,z);box(.05,.32,.9,'#4a3526',xc+s*.66,PY+.6,z);[-.4,.4].forEach(o=>box(.28,.3,.05,'#2a3140',xc+s*.5,PY+.26,z+o))} // bancs
  });
  // verrière courbe entre les arceaux
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(1,1,L,28,1,true,Math.PI/2,Math.PI),new THREE.MeshBasicMaterial({color:0x6fdcff,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false,fog:false}));
  glass.rotation.x=Math.PI/2;glass.scale.set(GHW,1,7);glass.position.set(GX,.2,zc);scene.add(glass);
  // suspensions lumineuses sous la verrière
  for(let z=z0+1;z<z1;z+=1.6){box(.03,.6,.03,'#2a3140',GX,6.6,z);box(.5,.08,.5,'#ffe9b0',GX,6.25,z,null,true)}
  // escalier vers le quai ouest (au sud de la halle)
  const st=QUAI_Y/9,sd=(GZ1-.2-QUAI_END)/9;
  for(let i=0;i<9;i++){const zz=GZ1-.2-(i+.5)*sd;box(1.2,(i+1)*st,sd,'#3a414c',GX-1.62,(i+1)*st/2,zz); /* une seule pièce par marche : plus de faces superposées */box(1.18,.025,.05,'#ffcf3a',GX-1.62,st*(i+1)+.01,zz+sd/2-.03,null,true)}
  const ang=Math.atan2(QUAI_Y,GZ1-.2-QUAI_END),rl=Math.hypot(QUAI_Y,GZ1-.2-QUAI_END);
  [-1,1].forEach(s=>{const r=box(.05,.05,rl,'#cfe8ff',GX-1.62+s*.62,QUAI_Y/2+.95,(GZ1-.2+QUAI_END)/2,null,true);r.rotation.x=ang;
    for(let i=0;i<=3;i++)box(.04,.95,.04,'#3a4252',GX-1.62+s*.62,st*9*i/3+.47,GZ1-.2-(GZ1-.2-QUAI_END)*i/3)});
  sign('QUAI 3','#ffb547',GX-GHW-.25,4.4,zc,-Math.PI/2,false,false,.09);box(.08,3.6,.08,'#2a3140',GX-GHW-.2,2.4,zc-1.2);box(.08,3.6,.08,'#2a3140',GX-GHW-.2,2.4,zc+1.2); // panneau sur le flanc gauche de la gare
  // tableau des départs, sur le flanc est de la halle
  const c=document.createElement('canvas');c.width=256;c.height=112;const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;
  const bm=new THREE.Mesh(new THREE.PlaneGeometry(4.4,1.92),new THREE.MeshBasicMaterial({map:t,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
  bm.rotation.y=Math.PI/2;bm.position.set(GX+GHW+.32,4.6,zc);scene.add(bm);box(.1,2.1,4.6,'#14181f',GX+GHW+.24,4.6,zc);
  [-2,2].forEach(o=>box(.08,4,.08,'#2a3140',GX+GHW+.24,2,zc+o));
  departBoard={c,t,k:99};drawBoardDeparts();
  // horloge numérique sous l'enseigne
  const cc=document.createElement('canvas');cc.width=96;cc.height=32;const ct=new THREE.CanvasTexture(cc);ct.minFilter=THREE.LinearFilter;
  const cm=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.6),new THREE.MeshBasicMaterial({map:ct,fog:false}));cm.position.set(GX,7,GZ1+.32);scene.add(cm);box(1.95,.72,.08,'#14181f',GX,7,GZ1+.25);
  stationClock={c:cc,t:ct,s:''};drawStationClock();
  // distributeurs de billets et kiosque à nouilles, côté est
  [[GX+GHW+.6,GZ0+2],[GX+GHW+.6,GZ0+3]].forEach(([x,z])=>{box(.6,1.6,.7,'#2a313c',x,.8,z);box(.04,.5,.45,'#39e6ff',x-.32,1.15,z,null,true);box(.04,.08,.3,'#ffb547',x-.32,.7,z,null,true)});
  box(2.2,2.2,1.6,'#3a1c20',GX+GHW+3.4,1.1,GZ1-1.1);box(2.4,.12,1.9,'#ff4fa3',GX+GHW+3.4,2.25,GZ1-1.1,null,true);
  box(2,.6,.05,'#ffb547',GX+GHW+3.4,1.7,GZ1-.28,null,true);box(1.8,.1,.4,'#4a3526',GX+GHW+3.4,1,GZ1-.2);
  sign('NOUILLES ZÉRO','#ffb547',GX+GHW+3.4,2.65,GZ1-.25,0,false,false,.05);
  box(.7,1.7,.6,'#1e3a4a',GX+GHW+1.8,.85,GZ1-.6);box(.5,1.1,.05,'#7dffb0',GX+GHW+1.8,1,GZ1-.28,null,true); // distributeur de boissons
  // voyageurs qui attendent sur les quais (décor)
  [[-1,z0+1.3,Math.PI/2],[-1,z0+3.5,Math.PI/2],[1,z0+3.6,-Math.PI/2],[1,z0+7.2,-Math.PI/2],[1,z0+1.2,Math.PI]].forEach(([s,z,ry])=>{const m=makeChar(randomSpec());const px=GX+s*(s<0?2.2:1.9);m.position.set(px,PY+.12,z);m.userData.ry=ry;if(s<0)ZONES.quai.blocks.push([px,z,.14,.2])});
  // balises lumineuses le long du viaduc, jusqu'à l'horizon
  const bl=[];for(let z=-140;z<GZ0;z+=2.4)bl.push([GX-.78,2.78,z,.08,.06,.08],[GX+.78,2.78,z,.08,.06,.08]);instBoxes(bl,'#ff4fa3',true);
}
function drawBoardDeparts(){
  const b=departBoard;if(!b)return;const g=b.c.getContext('2d'),d=new Date();
  g.fillStyle='#060a10';g.fillRect(0,0,256,112);g.fillStyle='#ffb547';g.font='bold 12px Silkscreen, monospace';g.textBaseline='top';
  g.fillText('DÉPARTS · GARE ZÉRO',8,6);g.fillStyle='#2a3140';g.fillRect(8,22,240,1);
  for(let i=0;i<4;i++){const m=new Date(d.getTime()+(i*11+4)*60000),hh=String(m.getHours()).padStart(2,'0')+':'+String(Math.floor(m.getMinutes()/5)*5).padStart(2,'0');
    const [dest,q]=DESTS[(Math.floor(d.getTime()/600000)+i)%DESTS.length],y=30+i*20;
    g.fillStyle='#eaf0f6';g.font='10px Silkscreen, monospace';g.fillText(hh,8,y);g.fillText(dest,52,y);
    g.fillStyle=i===0&&Math.floor(d.getTime()/700)%2?'#7cf29a':i===0?'#0a3a1e':'#7cf29a';g.fillText(i===0?'EMBARQUEMENT':q,180,y)}
  b.t.needsUpdate=true;
}
function drawStationClock(){
  const k=stationClock;if(!k)return;const d=new Date(),s=String(d.getHours()).padStart(2,'0')+(d.getSeconds()%2?':':' ')+String(d.getMinutes()).padStart(2,'0');
  if(s===k.s)return;k.s=s;const g=k.c.getContext('2d');g.fillStyle='#060a10';g.fillRect(0,0,96,32);g.fillStyle='#ffb547';g.font='bold 22px Silkscreen, monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(s,48,17);k.t.needsUpdate=true;
}
function updateStation(dt){if(!departBoard)return;departBoard.k+=dt;if(departBoard.k>.7){departBoard.k=0;drawBoardDeparts()}drawStationClock()}
