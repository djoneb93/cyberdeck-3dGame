// Véhicules : voitures flottantes profilées (berline, sportive, utilitaire), taxi, et la rame TGV de la gare Zéro.
'use strict';

// ---------- voitures flottantes ----------
// Chaque modèle : une caisse basse extrudée avec des bords arrondis, et un habitacle vitré plus étroit posé dessus.
const CAR_KINDS={
  sedan:{lower:[[-1.5,.2],[1.35,.2],['q',1.66,.22,1.62,.42],['q',1.45,.58,1,.62],[-1.25,.64],['q',-1.56,.6,-1.58,.4],['q',-1.57,.2,-1.5,.2]],
    glass:[[.95,.6],['q',.4,1,-.3,.98],['q',-1,.96,-1.25,.62],[.95,.6]],front:1.78,rear:-1.72,roof:[-.3,.99,.95]},
  sport:{lower:[[-1.55,.2],[1.35,.2],['q',1.78,.22,1.72,.36],['q',1.4,.5,.8,.54],[-1.35,.56],['q',-1.62,.52,-1.62,.34],['q',-1.6,.2,-1.55,.2]],
    glass:[[.75,.52],['q',.15,.86,-.45,.8],['q',-1.05,.74,-1.3,.55],[.75,.52]],front:1.86,rear:-1.76,roof:null},
  van:{lower:[[-1.5,.2],[1.4,.2],['q',1.65,.22,1.64,.45],[1.5,.66],[-1.5,.68],['q',-1.6,.66,-1.6,.45],['q',-1.6,.2,-1.5,.2]],
    glass:[[1.45,.64],['q',1.2,1.2,.6,1.22],[-1.42,1.22],[-1.5,.66],[1.45,.64]],front:1.78,rear:-1.74,roof:[-.4,1.25,2.1]}
};
function pathShape(pts){const s=new THREE.Shape();pts.forEach((p,i)=>{if(i===0)s.moveTo(p[0],p[1]);else if(p[0]==='q')s.quadraticCurveTo(p[1],p[2],p[3],p[4]);else s.lineTo(p[0],p[1])});return s}
const CAR_GEO={};
function carGeo(kind){
  if(CAR_GEO[kind])return CAR_GEO[kind];const K=CAR_KINDS[kind];
  const lo=new THREE.ExtrudeGeometry(pathShape(K.lower),{depth:1.02,bevelEnabled:true,bevelThickness:.14,bevelSize:.12,bevelSegments:3,curveSegments:10});lo.translate(0,0,-.51);
  const gl=new THREE.ExtrudeGeometry(pathShape(K.glass),{depth:.86,bevelEnabled:true,bevelThickness:.08,bevelSize:.05,bevelSegments:2,curveSegments:10});gl.translate(0,0,-.43);
  return CAR_GEO[kind]={lo,gl};
}
const podGeo=new THREE.CylinderGeometry(.2,.24,.14,14),podGlowGeo=new THREE.CylinderGeometry(.17,.17,.02,14);
const glassMat=new THREE.MeshPhongMaterial({color:0x0c1824,emissive:0x081a26,specular:0x9fc8e8,shininess:110});
const podMat=new THREE.MeshLambertMaterial({color:0x15181f});
function carModel(body,glowC,x,y,z,ry,parked,noGlow,kind){
  kind=kind||pick(['sedan','sedan','sport','van']);const K=CAR_KINDS[kind],G=carGeo(kind);
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);
  const bm=new THREE.MeshPhongMaterial({color:body,specular:0x8a96a8,shininess:100}); // peinture métallisée
  g.add(new THREE.Mesh(G.lo,bm));g.add(new THREE.Mesh(G.gl,glassMat));
  if(K.roof){const r=box(K.roof[2],.05,.82,body,K.roof[0],K.roof[1],0,g);r.material=bm}
  // phares : bandeau LED à l'avant, feux arrière sur toute la largeur
  box(.04,.05,.92,'#eaf6ff',K.front,.42,0,g,true);box(.05,.04,.18,'#eaf6ff',K.front-.02,.5,.38,g,true);box(.05,.04,.18,'#eaf6ff',K.front-.02,.5,-.38,g,true);
  box(.04,.06,1.12,'#ff2a3a',K.rear,.5,0,g,true);
  // liseré néon sur les flancs, poignées affleurantes
  box(2.5,.03,.02,glowC,0,.35,.67,g,true);box(2.5,.03,.02,glowC,0,.35,-.67,g,true);
  // détails : bas de caisse sombre, lignes de carrosserie, filet lumineux sous les vitres, anneaux autour des patins
  box(2.95,.09,1.2,'#14161c',-.05,.22,0,g);[.6,-.6].forEach(s=>{box(2.4,.014,.014,'#0a0c10',-.05,.5,s*1.105,g);box(1.9,.018,.018,glowC,-.2,(K.roof?.62:.55),s*.47,g,true)});
  [[1,.5],[1,-.5],[-1,.5],[-1,-.5]].forEach(([a,b])=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(.25,.018,4,18),mat(glowC,true));ring.rotation.x=Math.PI/2;ring.position.set(a,.1,b);g.add(ring)});
  if(kind==='sport'){const sp=box(.34,.04,1.16,body,K.rear+.2,.74,0,g);sp.material=bm;[-.42,.42].forEach(z=>box(.05,.18,.05,'#2a2e36',K.rear+.24,.64,z,g));for(let i=-2;i<=2;i++)box(.2,.12,.03,'#0a0c10',K.rear+.05,.26,i*.2,g)} // aileron, diffuseur
  if(kind==='sedan')box(.6,.04,.1,glowC,-.25,1.02,0,g,true); // rampe lumineuse sur le toit
  if(kind==='van'){box(.05,.3,1.0,'#20242c',-1.73,.5,0,g);box(.04,.04,.9,glowC,-1.75,.7,0,g,true)}
  [.68,-.68].forEach(s=>{box(.14,.08,.16,body,K.front*.32,.74,s*1.02,g).material=bm;box(.02,.06,.12,'#9ab4c8',K.front*.32-.08,.74,s*1.02,g)}); // rétroviseurs
  box(.02,.13,.36,'#e8e4d0',K.rear-.012,.3,0,g,true);box(.02,.13,.36,'#e8e4d0',K.front+.012,.3,0,g); // plaques
  // patins de sustentation aux quatre coins, avec leur lueur
  [[1,.5],[1,-.5],[-1,.5],[-1,-.5]].forEach(([a,b])=>{const p=new THREE.Mesh(podGeo,podMat);p.position.set(a,.12,b);g.add(p);const q=new THREE.Mesh(podGlowGeo,mat(glowC,true));q.position.set(a,.04,b);g.add(q)});
  if(!noGlow){const gp=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2),new THREE.MeshBasicMaterial({map:glowTex,color:glowC,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false}));gp.rotation.x=-Math.PI/2;gp.position.y=-y+.05;g.add(gp)}
  g.userData={kind,body:bm};return g;
}
// le taxi : berline jaune, damier sur les flancs, lanterne « TAXI » sur le toit
function taxiModel(){
  const g=carModel('#f2c230','#ffe14d',0,.45,0,0,false,false,'sedan');
  for(let i=0;i<10;i++)[.6,-.6].forEach(s=>box(.2,.08,.02,i%2?'#15171c':'#f2f2ee',-1+i*.22,.5,s*1.12,g));
  const c=document.createElement('canvas');c.width=64;c.height=20;const x=c.getContext('2d');x.fillStyle='#ffe14d';x.fillRect(0,0,64,20);x.fillStyle='#15171c';x.font='bold 15px Silkscreen, monospace';x.textAlign='center';x.textBaseline='middle';x.fillText('TAXI',32,11);
  const t=new THREE.CanvasTexture(c);const lm=new THREE.MeshBasicMaterial({map:t});
  const lan=new THREE.Mesh(new THREE.BoxGeometry(.62,.2,.3),[mat('#ffe14d',true),mat('#ffe14d',true),mat('#ffe14d',true),mat('#ffe14d',true),lm,lm]);lan.rotation.y=Math.PI/2;lan.position.set(-.2,1.12,0);g.add(lan);
  return g;
}

// ---------- la rame TGV ----------
// Section « super-ellipse » (presque un rectangle aux angles très arrondis), lissée en un maillage continu.
function superRing(N,w,yb,yt,e){const pts=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
  pts.push([w*Math.sign(c)*Math.pow(Math.abs(c),e),yb+(yt-yb)*(.5+.5*Math.sign(s)*Math.pow(Math.abs(s),e))])}return pts}
function loft(rings,zs,colorFn){
  const N=rings[0].length,pos=[],col=[],idx=[],c=new THREE.Color();
  rings.forEach((r,k)=>r.forEach(([x,y])=>{pos.push(x,y,zs[k]);colorFn(x,y,k/(rings.length-1),c);col.push(c.r,c.g,c.b)}));
  for(let k=0;k<rings.length-1;k++)for(let i=0;i<N;i++){const a=k*N+i,b=k*N+(i+1)%N,cc=(k+1)*N+i,d=(k+1)*N+(i+1)%N;idx.push(a,b,cc,b,d,cc)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g}
const TGV={W:.7,YB:.08,YT:1.25,E:.55,N:48,NOSE:4.4,CAR:3.7,GAP:.14,CARS:4};
TGV.LEN=TGV.NOSE*2+TGV.CARS*(TGV.CAR+TGV.GAP);
// livrée : argent, jupe sombre, filet rose néon, vitres noires
function tgvColor(x,y,t,c,nose){
  if(y<.3)return c.set('#262b34');
  if(y<.4)return c.set('#ff4fa3');
  if(nose&&t>.12&&t<.56&&y>.62)return c.set('#0a0f16');
  if(!nose&&y>.6&&y<.88)return c.set('#141a24');
  return c.set(y>1.05?'#a9b2be':'#8f99a6');
}
function buildTrain(RY,ZS){
  const g=new THREE.Group();scene.add(g);const T=TGV,m=new THREE.MeshPhongMaterial({vertexColors:true,specular:0x4a5260,shininess:70});
  // nez : la section se resserre et s'abaisse jusqu'à une pointe en bec de canard
  const rings=[],zs=[];for(let i=0;i<=16;i++){const t=i/16,w=T.W*Math.pow(Math.max(0,1-Math.pow(t,2.1)),.55)+.015,yb=T.YB+.14*Math.pow(t,3),yt=T.YT-(T.YT-.4)*Math.pow(t,1.3);
    rings.push(superRing(T.N,w,yb,Math.max(yb+.08,yt),T.E));zs.push(t*T.NOSE)}
  const noseGeo=loft(rings,zs,(x,y,t,c)=>tgvColor(x,y,t,c,true));
  const head=new THREE.Mesh(noseGeo,m);head.position.z=-T.NOSE;g.add(head);
  const tail=new THREE.Mesh(noseGeo,m);tail.scale.z=-1;tail.position.z=-T.LEN+T.NOSE;g.add(tail);
  const ring=superRing(T.N,T.W,T.YB,T.YT,T.E);
  for(let k=0;k<T.CARS;k++){const z1=-T.NOSE-k*(T.CAR+T.GAP)-T.GAP/2,z0=z1-T.CAR;
    g.add(new THREE.Mesh(loft([ring,ring],[z0,z1],(x,y,t,c)=>tgvColor(x,y,t,c,false)),m));
    // fenêtres éclairées, portes, intercirculation
    for(let w=0;w<6;w++)[-1,1].forEach(s=>box(.02,.18,.42,'#ffe3b0',s*(T.W+.004),.75,z0+.45+w*.56,g,true));
    [-1,1].forEach(s=>box(.02,.62,.5,'#2a313c',s*(T.W+.003),.66,z0+.3,g));
    const gw=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,T.GAP+.06,14),mat('#15181f'));gw.rotation.x=Math.PI/2;gw.position.set(0,.68,z1+T.GAP/2);g.add(gw);
    box(.9,.12,T.CAR*.8,'#3a414c',0,T.YT+.04,z0+T.CAR/2,g); // équipements de toit
    box(.05,.02,T.CAR*.8-.2,'#39e6ff',0,T.YT+.11,z0+T.CAR/2,g,true); // filet lumineux, voiture par voiture
    if(k===1){[[-.3,.5],[.3,.5]].forEach(([a,b])=>{const r=box(.04,.04,.9,'#8a96a8',a,T.YT+.45,z0+1.6,g);r.rotation.x=b});box(.7,.04,.06,'#c8d0dc',0,T.YT+.82,z0+1.6,g)} // pantographe
  }
  // phares, feux, bandeau lumineux du nez
  [-1,1].forEach(s=>{box(.03,.06,.35,'#eaf6ff',s*.415,.34,-.95,g,true);box(.03,.05,.35,'#ff3b4e',s*.415,.34,-T.LEN+.95,g,true)});
  g.position.set(GX,RY+.15,ZS);return g;
}
