// Les lieux importants ont chacun leur silhouette et leur animation :
// salle de concert du club Ondes, marché couvert du Bazar, bar à l'ancienne, façade en pixels de l'Arcade,
// hublot géant de la laverie, entrepôt à toit en dents de scie, bunker brutaliste, gyrophares du commissariat.
'use strict';

const LM={eq:[],chase:[],mosaic:null,porthole:null,pulse:[],lasers:[],sirens:[],steam:[]};
// renvoie true si le lieu a été construit ici (sinon : tour classique)
function landmark(id,x,z,w,d,h,v,P){
  const p=PL[id];
  if(id==='port'){ // entrepôt : socle en tôle, toit en dents de scie avec verrières
    const hb=3.4,mats=[facadeMat(3,d/4,hb/8),facadeMat(3,d/4,hb/8),roofMat,roofMat,facadeMat(3,w/4,hb/8),facadeMat(3,w/4,hb/8)];
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,hb,d),mats);m.position.set(x,hb/2,z);scene.add(m);camBlockers.push(m);
    const n=4,tz=d/n,tri=new THREE.Shape();tri.moveTo(0,0);tri.lineTo(tz,0);tri.lineTo(tz,1.2);tri.closePath();
    for(let i=0;i<n;i++){const g=new THREE.ExtrudeGeometry(tri,{depth:w,bevelEnabled:false});g.rotateY(-Math.PI/2);const t=new THREE.Mesh(g,mat('#3a414c'));t.position.set(x+w/2,hb,z-d/2+i*tz);scene.add(t);
      const gl=box(w-.1,1.12,.04,'#9fd8ff',x,hb+.58,z-d/2+(i+1)*tz-.03,null,true);gl.material=new THREE.MeshBasicMaterial({color:0x6fb8d8,transparent:true,opacity:.55})}
    for(let i=0;i<3;i++)box(.1,.1,d+.1,'#ffb547',x+w/2+.02,.9+i*.9,z,null,true); // bandes de signalisation
    return true}
  if(id==='bunker'){ // béton brutaliste aux murs inclinés, encadrement de porte, bandes de danger, périscopes
    const rb=w/Math.SQRT2,rt=rb*.8;const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,4,1),[facadeMat(1,w/4,h/8),roofMat,roofMat]);m.rotation.y=Math.PI/4;m.position.set(x,h/2,z);scene.add(m);camBlockers.push(m);
    const fz=z+w/2;box(3.4,h,.7,'#3a3d44',x,h/2,fz-.45);box(3.6,.3,.9,'#2e3138',x,h+.1,fz-.45);
    for(let i=0;i<12;i++)box(.3,.22,.05,i%2?'#ffb547':'#15171c',x-1.65+i*.3,.12,fz+.17);
    [[-1.2,.9],[1.4,-.6],[.2,-1.4]].forEach(([a,b])=>{box(.12,1.4,.12,'#5a6472',x+a,h+.7,z+b);box(.4,.14,.14,'#3a414c',x+a+.14,h+1.4,z+b)});
    return true}
  if(id==='arcade'){ tower(x,z,w,d,h,v,P.c,true); // façade en pixels animée sur le flanc sud, joystick géant sur le toit
    const c=document.createElement('canvas');c.width=48;c.height=32;const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;
    const mo=new THREE.Mesh(new THREE.PlaneGeometry(w-.6,h-1.6),new THREE.MeshBasicMaterial({map:t,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));mo.position.set(x,h/2+.5,z+d/2+.07);scene.add(mo);
    box(w-.4,h-1.4,.06,'#07090e',x,h/2+.5,z+d/2+.03);LM.mosaic={c,t,k:0,f:0};
    box(1.4,.4,1.4,'#2a3140',x,h+.2,z);box(.18,1.6,.18,'#c8d0dc',x,h+1.1,z);const ball=new THREE.Mesh(new THREE.SphereGeometry(.42,12,10),mat('#ff3b4e',true));ball.position.set(x,h+2.1,z);scene.add(ball);
    [[.5,'#39e6ff'],[-.5,'#ffb547']].forEach(([o,c2])=>box(.32,.12,.32,c2,x+o,h+.46,z+.45,null,true));
    return true}
  if(id==='bar'){ tower(x,z,w,d,h,v,P.c,true); // bar à l'ancienne : ampoules chenillards autour de la façade d'entrée, panneau « COCKTAILS » sur le toit
    const fx=x+w/2+.07,groups=[[],[],[]];let n=0;
    for(let zz=z-d/2+.2;zz<=z+d/2-.2;zz+=.32){groups[n++%3].push(box(.08,.08,.08,'#ffe9b0',fx,h-.15,zz,null,true))}
    for(let yy=h-.45;yy>2.9;yy-=.32){groups[n++%3].push(box(.08,.08,.08,'#ffe9b0',fx,yy,z-d/2+.2,null,true));groups[n++%3].push(box(.08,.08,.08,'#ffe9b0',fx,yy,z+d/2-.2,null,true))}
    LM.chase.push(groups);
    [[-1.4],[1.4]].forEach(([o])=>box(.1,1.8,.1,'#2a3140',x+.4,h+.9,z+o));sign('COCKTAILS','#ff4fa3',x+.4,h+1.6,z,Math.PI/2,true,false,.07);
    return true}
  if(id==='laundry'){ tower(x,z,w,d,h,v,P.c,true); // hublot géant qui tourne, sur le flanc est ; vapeur sur le toit
    const g=new THREE.Group();g.position.set(x+w/2+.12,2.6,z);g.rotation.y=Math.PI/2;scene.add(g);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.8,.1,8,28),mat('#cfd8de'));g.add(ring);const glass=new THREE.Mesh(new THREE.CircleGeometry(.72,28),new THREE.MeshBasicMaterial({color:0x2a6f8a}));glass.position.z=-.02;g.add(glass);
    const drum=new THREE.Group();g.add(drum);for(let i=0;i<5;i++){const b2=box(.18,.18,.02,pick(['#ff4fa3','#ffb547','#7cf29a','#e8e8e4','#39e6ff']),Math.cos(i*1.26)*.4,Math.sin(i*1.26)*.4,.01,drum,true)}
    const glo=new THREE.Mesh(new THREE.TorusGeometry(.92,.04,6,32),mat(P.c,true));g.add(glo);LM.porthole=drum;
    const sm=new THREE.PointsMaterial({color:0xc8d4e8,size:1.8,map:glowTex,transparent:true,opacity:.25,depthWrite:false,blending:THREE.AdditiveBlending});
    [[-1,-1],[1,.6]].forEach(([a,b])=>{const vx=x+a,vz=z+b;box(.5,.6,.5,'#5a6070',vx,h+.3,vz);const N=20,pos=new Float32Array(N*3),sp=[];for(let i=0;i<N;i++){pos[i*3]=vx;pos[i*3+1]=h+.6+Math.random()*3;pos[i*3+2]=vz;sp.push(.5+Math.random()*.6)}
      const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));scene.add(new THREE.Points(gg,sm));LM.steam.push({gg,pos,sp,x:vx,z:vz,y:h+.6})});
    return true}
  if(id==='roofs'){ tower(x,z,w,d,h,v,P.c,true); // arêtes lumineuses sur toute la hauteur
    [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([a,b])=>box(.09,h-.4,.09,'#6ff3f0',x+a*(w/2+.02),h/2,z+b*(d/2+.02),null,true));
    for(let y=6;y<h;y+=6)box(w+.1,.07,.07,'#6ff3f0',x,y,z+d/2+.03,null,true);
    return true}
  return false;
}
// après la construction : marché couvert, salle de concert, gyrophares du commissariat
function buildLandmarks(){
  // Bazar Néon : charpente métallique, verrière en deux pans, guirlandes de lampions
  const M=PL.market,a=M.hw+.15;
  [[-a,-a],[a,-a],[-a,a],[a,a]].forEach(([dx,dz])=>{box(.22,4.6,.22,'#3a414c',M.x+dx,2.3,M.z+dz);solid[I(Math.floor(M.x+dx),Math.floor(M.z+dz))]=1});
  [-1,1].forEach(s=>{const pnl=new THREE.Mesh(new THREE.PlaneGeometry(2*a+.4,a+.3),new THREE.MeshBasicMaterial({color:0xff7ab8,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));
    pnl.rotation.x=-Math.PI/2+s*.22;pnl.position.set(M.x,4.75,M.z+s*(a/2));scene.add(pnl);box(2*a+.4,.06,.06,'#ff4fa3',M.x,4.62,M.z+s*(a+.05),null,true)});
  box(2*a+.4,.12,.12,'#3a414c',M.x,5.15,M.z);
  for(let k=-1;k<=1;k++){const pts=[];for(let i=0;i<=10;i++){const s=i/10;pts.push(new THREE.Vector3(M.x-a+2*a*s,4.3-Math.sin(s*Math.PI)*.7,M.z+k*1.8))}
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x05070b})));
    for(let i=1;i<10;i+=2){const v=pts[i];LM.pulse.push(box(.2,.26,.2,pick(['#ff4fa3','#ffb547','#7cf29a','#39e6ff']),v.x,v.y-.2,v.z,null,true))}}
  // club Ondes : anneau d'égaliseur autour du dôme, lasers au sommet
  const C=PL.club,r=C.hw+.35;
  for(let i=0;i<28;i++){const ang=i/28*Math.PI*2,bx=C.x+Math.cos(ang)*r,bz=C.z+Math.sin(ang)*r;if(Math.abs(bx-(C.x-C.hw))<1.8&&Math.abs(bz-C.z)<2)continue; // pas devant l'entrée
    const b=box(.28,1,.28,i%2?'#b98cff':'#39e6ff',bx,.5,bz,null,true);LM.eq.push({b,ph:i*.7})}
  for(let k=0;k<4;k++){const l=new THREE.Mesh(new THREE.PlaneGeometry(.06,24),new THREE.MeshBasicMaterial({color:[0x7dffb0,0xff4fa3,0x39e6ff,0xb98cff][k],transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    l.geometry.translate(0,12,0);l.position.set(C.x,C.hw+.1,C.z);scene.add(l);LM.lasers.push({l,k})}
  // ancien commissariat : rampe de gyrophares sur le toit
  const cb=TOWERS.find(b=>b.comm);if(cb){const hx=UX(cb.u),hz=UZ(cb.v),hh=HZF(cb.h);box(1.6,.16,.4,'#2a3140',hx,hh+.1,hz);
    LM.sirens.push(box(.6,.22,.34,'#3b6bff',hx-.45,hh+.29,hz,null,true),box(.6,.22,.34,'#ff3b4e',hx+.45,hh+.29,hz,null,true))}
}
function updateLandmarks(dt){
  const beat=(tAcc*128/60)%1,kick=Math.pow(1-beat,3);
  LM.eq.forEach(e=>{const s=.35+Math.abs(Math.sin(tAcc*3.1+e.ph))*1.4*(.5+kick);e.b.scale.y=s;e.b.position.y=s/2});
  LM.lasers.forEach(o=>{o.l.rotation.z=Math.sin(tAcc*.9+o.k*1.6)*.9;o.l.rotation.y=tAcc*.6+o.k*Math.PI/2;o.l.material.opacity=.15+.3*kick});
  const ch=Math.floor(tAcc*6)%3;LM.chase.forEach(gs=>gs.forEach((g,i)=>g.forEach(b=>b.visible=i!==ch)));
  LM.pulse.forEach((b,i)=>b.visible=Math.sin(tAcc*2+i)>-.6);
  if(LM.porthole)LM.porthole.rotation.z-=dt*4;
  LM.sirens.forEach((s,i)=>s.visible=Math.floor(tAcc*4+i*2)%4<2);
  LM.steam.forEach(v=>{const p=v.pos;for(let i=0;i<v.sp.length;i++){p[i*3+1]+=v.sp[i]*dt;p[i*3]+=Math.sin(tAcc+i)*.004;if(p[i*3+1]>v.y+3.5){p[i*3+1]=v.y;p[i*3]=v.x}}v.gg.attributes.position.needsUpdate=true});
  if(LM.mosaic){const M=LM.mosaic;M.k+=dt;if(M.k>.15){M.k=0;M.f++;drawMosaic(M)}}
}
// façade de l'Arcade : envahisseurs qui défilent, vaisseau, score
const INV=['00100000100','00010001000','00111111100','01101110110','11111111111','10111111101','10100000101','00011011000'];
function drawMosaic(M){const g=M.c.getContext('2d'),f=M.f;g.fillStyle='#04060c';g.fillRect(0,0,48,32);
  const ox=(f%24)-6,cols=['#ff4fa3','#39e6ff','#7cf29a'];
  for(let k=0;k<3;k++){g.fillStyle=cols[k];INV.forEach((row,yy)=>{for(let xx=0;xx<11;xx++)if(row[xx]==='1'&&(yy<6||f%2))g.fillRect(ox+k*14+xx,3+yy+(k%2)*1,1,1)})}
  g.fillStyle='#ffb547';const sx=10+Math.round(Math.sin(f*.2)*14)+14;g.fillRect(sx,27,5,2);g.fillRect(sx+2,25,1,2);if(f%6<3){g.fillStyle='#fff';g.fillRect(sx+2,14+(f%6)*3,1,2)}
  g.fillStyle='#5ce1e6';g.fillRect(0,31,48,1);M.t.needsUpdate=true}
