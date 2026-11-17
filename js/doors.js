// Portes des lieux importants : portail en relief avec auvent et néons, portes vitrées coulissantes
// qui s'ouvrent quand tu t'approches, et une fausse vue intérieure animée derrière.
'use strict';

const portals=[];
const DOOR_THEMES={
  bar:{c:'#ff4fa3',draw:drawBarInside},roofs:{c:'#6ff3f0',draw:drawLobbyInside},
  arcade:{c:'#5ce1e6',draw:drawArcadeInside},port:{c:'#8fb7ff',draw:drawDockInside}
};
function portal(id,ow,oh){
  const T=DOOR_THEMES[id],p=PL[id],[x,z]=front(id,0,0),D=.8;ow=ow||1.8;oh=oh||2.4;
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=FACE_RY[p.face];scene.add(g);
  const fc='#1c2028';
  // encadrement, linteau, marche, joues du renfoncement
  box(.36,oh+.45,D,fc,-(ow/2+.18),(oh+.45)/2,D/2,g);box(.36,oh+.45,D,fc,ow/2+.18,(oh+.45)/2,D/2,g);
  box(ow+.72,.45,D,fc,0,oh+.22,D/2,g);box(ow+1,.12,D+.5,'#2c313d',0,.06,(D+.5)/2,g);
  box(.04,oh,D-.1,'#0c0f14',-ow/2+.02,oh/2,D/2,g);box(.04,oh,D-.1,'#0c0f14',ow/2-.02,oh/2,D/2,g);
  // filets néon autour de l'ouverture, auvent avec bandeau lumineux, appliques
  box(.05,oh,.05,T.c,-ow/2-.02,oh/2,D+.01,g,true);box(.05,oh,.05,T.c,ow/2+.02,oh/2,D+.01,g,true);box(ow+.09,.05,.05,T.c,0,oh+.02,D+.01,g,true);
  box(ow+1.5,.1,1,'#2a3140',0,oh+.52,D+.42,g);box(ow+1.5,.04,.04,T.c,0,oh+.47,D+.92,g,true);
  [-1,1].forEach(s=>{box(.16,.34,.12,'#14181f',s*(ow/2+.62),1.8,D+.06,g);box(.1,.24,.04,'#ffe9b0',s*(ow/2+.62),1.8,D+.13,g,true)});
  box(ow*.8,.02,.6,T.c,0,.13,D+.3,g,true); // tapis lumineux
  // vue intérieure (canevas animé) au fond du renfoncement
  const c=document.createElement('canvas');c.width=96;c.height=128;const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;
  const inside=new THREE.Mesh(new THREE.PlaneGeometry(ow,oh),new THREE.MeshBasicMaterial({map:t,fog:false}));inside.position.set(0,oh/2,.1);g.add(inside);
  // portes vitrées coulissantes
  const glassM=new THREE.MeshPhongMaterial({color:0x6fdcff,transparent:true,opacity:.22,specular:0xffffff,shininess:120,depthWrite:false});
  const panes=[-1,1].map(s=>{const q=new THREE.Group();q.position.set(s*ow/4,oh/2,D-.14);g.add(q);
    q.add(new THREE.Mesh(new THREE.BoxGeometry(ow/2-.02,oh-.06,.04),glassM));
    box(.05,oh-.06,.06,'#3a4252',-s*(ow/4-.02),0,0,q);box(ow/2,.05,.06,'#3a4252',0,(oh-.06)/2,0,q);box(ow/2,.05,.06,'#3a4252',0,-(oh-.06)/2,0,q);
    return {q,s}});
  const P={g,c,t,T,ow,oh,panes,open:0,k:0,tt:Math.random()*10};portals.push(P);T.draw(P.c.getContext('2d'),96,128,0);t.needsUpdate=true;
}
function updateDoors(dt){
  portals.forEach(P=>{
    const d=Math.hypot(player.position.x-P.g.position.x,player.position.z-P.g.position.z),near=d<3.2&&!zoneOf();
    P.open+=((near?1:0)-P.open)*Math.min(1,dt*5);P.panes.forEach(({q,s})=>q.position.x=s*(P.ow/4+P.open*P.ow/2*.92));
    if(d<34){P.k+=dt;P.tt+=dt;if(P.k>.1){P.k=0;P.T.draw(P.c.getContext('2d'),96,128,P.tt);P.t.needsUpdate=true}}
  });
}
// ---- intérieurs peints en perspective ----
function room(g,W,H,wall,floor,ceil){ // fond de pièce, sol, plafond et murs en perspective
  const bx0=W*.26,bx1=W*.74,by0=H*.2,by1=H*.62;
  g.fillStyle=ceil;g.beginPath();g.moveTo(0,0);g.lineTo(W,0);g.lineTo(bx1,by0);g.lineTo(bx0,by0);g.fill();
  g.fillStyle=floor;g.beginPath();g.moveTo(0,H);g.lineTo(W,H);g.lineTo(bx1,by1);g.lineTo(bx0,by1);g.fill();
  g.fillStyle=wall;g.beginPath();g.moveTo(0,0);g.lineTo(bx0,by0);g.lineTo(bx0,by1);g.lineTo(0,H);g.fill();g.beginPath();g.moveTo(W,0);g.lineTo(bx1,by0);g.lineTo(bx1,by1);g.lineTo(W,H);g.fill();
  g.fillStyle=shade(wall,.75);g.fillRect(bx0,by0,bx1-bx0,by1-by0);
  return {bx0,bx1,by0,by1};
}
function shade(hex,f){const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,Math.round(v*f)));return 'rgb('+c(n>>16)+','+c((n>>8)&255)+','+c(n&255)+')'}
function guy(g,x,y,s,col){g.fillStyle=col||'#05060a';g.beginPath();g.arc(x,y-s*1.55,s*.32,0,7);g.fill();g.fillRect(x-s*.42,y-s*1.22,s*.84,s*1.22)}
function glass(g,W,H){const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,'rgba(255,255,255,.10)');gr.addColorStop(.45,'rgba(255,255,255,0)');gr.addColorStop(.55,'rgba(255,255,255,.06)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,W,H)}
function drawBarInside(g,W,H,t){ // escalier qui descend vers un bar rose, silhouettes qui dansent
  const r=room(g,W,H,'#2a0c22','#12060e','#0a0408');
  for(let i=0;i<7;i++){const y=H-i*9,w=W-i*7;g.fillStyle=i%2?'#1e0a18':'#2a0f22';g.fillRect((W-w)/2,y-9,w,9);g.fillStyle='rgba(255,79,163,.5)';g.fillRect((W-w)/2,y-9,w,1)}
  const fl=.75+.25*Math.sin(t*9)*(Math.random()<.1?0:1);
  g.fillStyle='rgba(255,79,163,'+(.35*fl)+')';g.fillRect(r.bx0,r.by0,r.bx1-r.bx0,r.by1-r.by0);
  g.fillStyle='#ff4fa3';g.font='bold 9px monospace';g.textAlign='center';g.globalAlpha=fl;g.fillText('BAR',W/2,r.by0+10);g.globalAlpha=1;
  for(let i=0;i<6;i++){g.fillStyle=['#7cf29a','#ffb547','#39e6ff'][i%3];g.fillRect(r.bx0+4+i*7,r.by0+16,3,7)}
  for(let i=0;i<3;i++)guy(g,r.bx0+10+i*14+Math.sin(t*3+i)*3,r.by1+2,9,'#14040e');
  glass(g,W,H);
}
function drawLobbyInside(g,W,H,t){ // hall de la tour : sol en damier, ascenseur, hôtesse holographique
  const r=room(g,W,H,'#14262c','#1c2a30','#0c161a');
  g.strokeStyle='rgba(111,243,240,.18)';for(let i=0;i<=6;i++){const f=i/6;g.beginPath();g.moveTo(r.bx0+(r.bx1-r.bx0)*f,r.by1);g.lineTo(W*f,H);g.stroke()}
  for(let j=1;j<5;j++){const y=r.by1+(H-r.by1)*Math.pow(j/5,1.6),k=(y-r.by1)/(H-r.by1);g.beginPath();g.moveTo(r.bx0*(1-k),y);g.lineTo(r.bx1+(W-r.bx1)*k,y);g.stroke()}
  const ex=W/2,ew=16;g.fillStyle='#5a6672';g.fillRect(ex-ew,r.by0+8,ew*2,r.by1-r.by0-8);g.fillStyle='#3a444e';g.fillRect(ex-1,r.by0+8,2,r.by1-r.by0-8);
  g.fillStyle='#6ff3f0';g.font='bold 8px monospace';g.textAlign='center';g.fillText(String(1+Math.floor(t*.7)%40).padStart(2,'0'),ex,r.by0+6);
  const a=.4+.2*Math.sin(t*5)+(Math.random()<.05?-.3:0);g.globalAlpha=Math.max(0,a);guy(g,r.bx0+8,r.by1+6,10,'#6ff3f0');g.globalAlpha=1;
  g.fillStyle='#2f7a3e';g.beginPath();g.arc(r.bx1-6,r.by1-4,6,0,7);g.fill();g.fillStyle='#4a3526';g.fillRect(r.bx1-9,r.by1-2,6,6);
  glass(g,W,H);
}
function drawArcadeInside(g,W,H,t){ // rangées de bornes aux écrans qui clignotent, grand écran des records
  const r=room(g,W,H,'#0a1a20','#06101a','#04080c');
  g.fillStyle='#000';g.fillRect(r.bx0+3,r.by0+3,r.bx1-r.bx0-6,14);g.fillStyle='#5ce1e6';g.font='bold 7px monospace';g.textAlign='center';
  g.fillText('HI '+String(990000-Math.floor(t*37)%9000),W/2,r.by0+13);
  [-1,1].forEach(s=>{for(let i=0;i<4;i++){const k=i/4,x=s<0?k*r.bx0:W-k*(W-r.bx1),y=H-k*(H-r.by1),h=34*(1-k*.6),w=12*(1-k*.6);
    g.fillStyle='#14202a';g.fillRect(s<0?x:x-w,y-h,w,h);const col=['#ff4fa3','#39e6ff','#ffb547','#7cf29a'][(i+Math.floor(t*4+i))%4];
    g.fillStyle=col;g.fillRect(s<0?x+2:x-w+2,y-h+3,w-4,h*.35)}});
  guy(g,W/2-8+Math.sin(t)*2,H-10,14,'#020406');guy(g,W/2+14,H-24,9,'#03060a');
  glass(g,W,H);
}
function drawDockInside(g,W,H,t){ // entrepôt : caisses, lampes suspendues, chariot élévateur qui passe
  const r=room(g,W,H,'#18222c','#10161c','#0a0e12');
  for(let i=0;i<3;i++){const x=r.bx0+8+i*16;g.fillStyle='rgba(255,226,170,.16)';g.beginPath();g.moveTo(x,r.by0);g.lineTo(x-9,r.by1);g.lineTo(x+9,r.by1);g.fill();g.fillStyle='#ffe2aa';g.fillRect(x-2,r.by0,4,2)}
  [[4,H-30,22,24,'#7a2e22'],[8,H-48,16,18,'#2a6f7a'],[W-28,H-26,24,22,'#ffb547'],[W-22,H-42,16,16,'#3a4a8a']].forEach(([x,y,w,h,c])=>{g.fillStyle=c;g.fillRect(x,y,w,h);g.strokeStyle='rgba(0,0,0,.4)';g.strokeRect(x+.5,y+.5,w-1,h-1)});
  const fx=r.bx0+((t*12)%(r.bx1-r.bx0+30))-15;g.fillStyle='#d8a020';g.fillRect(fx,r.by1-9,12,7);g.fillStyle='#222';g.fillRect(fx+9,r.by1-16,2,9);g.fillStyle='#fff2c0';g.fillRect(fx+12,r.by1-7,2,2);
  glass(g,W,H);
}
