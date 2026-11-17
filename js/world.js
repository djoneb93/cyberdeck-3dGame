// Construction du monde 3D : sol, ciel, tours, lieux, port, gare et rame, véhicules, planque et immeuble.
'use strict';

/* ===================== MONDE ===================== */
const beacons=[];let holo=null,holoLight=null;
let clubBeams=[],hazards=[],train=null,ringCars=[],boats=[];
function instBoxes(list,color,emis){ // beaucoup de petites boîtes identiques en une seule fois
  if(!list.length)return;const m=new THREE.InstancedMesh(boxGeo,mat(color,emis),list.length),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),ps=new THREE.Vector3();
  list.forEach(([x,y,z,w,h,d],i)=>{ps.set(x,y,z);sc.set(w,h,d);m4.compose(ps,q,sc);m.setMatrixAt(i,m4)});scene.add(m);return m}
let adScreens=[],homeShell=null,barriers=[];
function tower(x,z,w,d,h,v,neon,place){
  // tours en gradins : socle, corniche, partie haute en retrait
  const setback=!place&&h>13,h1=setback?h*.62:h;
  const mk=(ww,dd,hh,y0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(ww,hh,dd),[facadeMat(v,dd/4,hh/8),facadeMat(v,dd/4,hh/8),roofMat,roofMat,facadeMat(v,ww/4,hh/8),facadeMat(v,ww/4,hh/8)]);m.position.set(x,y0+hh/2,z);scene.add(m);camBlockers.push(m);return m};
  const m=mk(w,d,h1,0);box(w+.24,.18,d+.24,'#2a3242',x,h1,z);
  const tw=setback?w*.72:w,td=setback?d*.72:d;
  if(setback){mk(tw,td,h-h1,h1);box(tw+.2,.16,td+.2,'#2a3242',x,h,z)}
  box(tw+.1,.1,.1,neon,x,h+.1,z+td/2,null,true);box(.1,.1,td+.1,neon,x+tw/2,h+.1,z,null,true);
  if(!place){
    // toit : climatiseurs, château d'eau, antenne et feu clignotant
    const nb=Math.floor(tw*td/14)+1;for(let i=0;i<nb;i++){const ax=x-tw/2+.7+rnd()*(tw-1.4),az=z-td/2+.7+rnd()*(td-1.4);box(.8,.5,.6,'#3a4252',ax,h+.25,az);box(.5,.04,.4,'#556070',ax,h+.52,az)}
    if(rnd()<.45){const t=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.1,12),mat('#4a4f58'));t.position.set(x+tw/4,h+1.15,z-td/4);scene.add(t);const c=new THREE.Mesh(new THREE.ConeGeometry(.55,.4,12),mat('#3a3f48'));c.position.set(x+tw/4,h+1.9,z-td/4);scene.add(c);
      [[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].forEach(([a,b])=>box(.07,.6,.07,'#2a3140',x+tw/4+a,h+.3,z-td/4+b))}
    if(h>12){box(.08,2.4,.08,'#8899aa',x-tw/4,h+1.2,z+td/4);beacons.push(box(.22,.22,.22,'#ff3b4e',x-tw/4,h+2.45,z+td/4,null,true))}
    // rez-de-chaussée : vitrines éclairées et auvent, sur les deux façades visibles
    const sc=pick(['#3e2e1a','#14323a','#3a1c2c','#1a3424','#2a2240']);
    box(w*.72,1.3,.06,sc,x,.95,z+d/2+.04,null,true);box(.06,1.3,d*.72,sc,x+w/2+.04,.95,z,null,true);
    box(w+.3,.1,.55,'#1d2430',x,2.05,z+d/2+.22);box(.55,.1,d+.3,'#1d2430',x+w/2+.22,2.05,z);
    box(w+.3,.05,.05,neon,x,2.0,z+d/2+.5,null,true);
  }
  return m;
}
// écran publicitaire animé (un canevas qui change de réclame toutes les quelques secondes)
const ADS=[['ONDES COLA','#ff4fa3','#2a0a20'],['NEURA v4 · TA MÉMOIRE, EN MIEUX','#7dffb0','#06201a'],['KUROGANE · VOTRE SÉCURITÉ','#ff3b4e','#1a0608'],['LOU NÉON · CLUB ONDES','#c88bff','#160a28'],['NOUILLES ZÉRO · 24/7','#ffb547','#201406']];
function adScreen(x,y,z,ry,w,h){const c=document.createElement('canvas');c.width=128;c.height=Math.round(128*h/w);const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));m.position.set(x+Math.sin(ry)*.08,y,z+Math.cos(ry)*.08);m.rotation.y=ry;scene.add(m);
  box(w+.2,h+.2,.08,'#14181f',x-Math.sin(ry)*.05,y,z-Math.cos(ry)*.05).rotation.y=ry;
  const a={c,t,i:Math.floor(rnd()*ADS.length),k:rnd()*4};adScreens.push(a);drawAd(a);return m}
function drawAd(a){const g=a.c.getContext('2d'),[txt,fg,bg]=ADS[a.i%ADS.length],W2=a.c.width,H2=a.c.height;
  g.fillStyle=bg;g.fillRect(0,0,W2,H2);g.strokeStyle=fg;g.lineWidth=3;g.strokeRect(2,2,W2-4,H2-4);
  g.fillStyle=fg;g.font='bold 15px Silkscreen, monospace';g.textAlign='center';g.textBaseline='middle';
  const words=txt.split(' · ');words.forEach((wd,k)=>g.fillText(wd,W2/2,H2/2+(k-(words.length-1)/2)*18,W2-12));
  for(let y=0;y<H2;y+=3){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,y,W2,1)}a.t.needsUpdate=true}
const FACE_RY={'+x':Math.PI/2,'-x':-Math.PI/2,'+z':0,'-z':Math.PI};
// panneau posé à plat sur la façade d'entrée d'un lieu (w : largeur le long de la façade)
function faceBox(id,w,h,y,lat,color,emis,out){const [x,z]=front(id,out==null?.03:out,lat||0),X=PL[id].face[1]==='x';return box(X?.1:w,h,X?w:.1,color,x,y,z,null,emis)}
function faceSign(id,text,c,y,lat,k,light){const [x,z]=front(id,.08,lat||0),p=PL[id],fw=2*(p.face[1]==='x'?p.hd:p.hw)-2*Math.abs(lat||0)-.5;sign(text,c,x,y,z,FACE_RY[p.face],false,light!==false,k,false,fw)}
function buildWorld(){
  // sol de la ville : dalles légèrement transparentes posées sur un miroir → sol mouillé qui reflète les néons
  const n=W*H;const gm=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({transparent:true,opacity:mirror?.86:1}),n);
  const m4=new THREE.Matrix4(),col=new THREE.Color();
  const base=['#1d222c','#2c313d','#14161e','#5a3d2b','#252832','#0d2f5e'];
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){
    const i=I(x,z),t=tile[i];m4.makeTranslation(x+.5,0,z+.5);gm.setMatrixAt(i,m4);
    col.set(base[t]);let j=(rnd()-.5)*.025;if(t===4&&(x+z)%2)j-=.02;if(t===3&&z%2)j-=.04;if(t===5)j=(rnd()-.5)*.02;
    col.offsetHSL(0,0,j);gm.setColorAt(i,col);
  }
  scene.add(gm);ground=gm;
  // ciel : dégradé nocturne avec la lueur de la ville à l'horizon, et des étoiles
  const skc=document.createElement('canvas');skc.width=2;skc.height=256;const sg=skc.getContext('2d'),sgr=sg.createLinearGradient(0,0,0,256);
  sgr.addColorStop(0,'#020309');sgr.addColorStop(.36,'#070a18');sgr.addColorStop(.47,'#1c1236');sgr.addColorStop(.5,'#3a1a48');sgr.addColorStop(.53,'#160d22');sgr.addColorStop(1,'#05060a');sg.fillStyle=sgr;sg.fillRect(0,0,2,256);
  const sky=skyMesh=new THREE.Mesh(new THREE.SphereGeometry(200,24,16),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(skc),side:THREE.BackSide,fog:false,depthWrite:false}));sky.position.set(W/2,0,H/2);sky.renderOrder=-1;scene.add(sky);
  const sp=[];for(let i=0;i<500;i++){const a=rnd()*Math.PI*2,e=.18+rnd()*1.3;sp.push(W/2+Math.cos(a)*Math.cos(e)*190,Math.sin(e)*190,H/2+Math.sin(a)*Math.cos(e)*190)}
  const sgeo=new THREE.BufferGeometry();sgeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  scene.add(new THREE.Points(sgeo,new THREE.PointsMaterial({color:0xcfd8ff,size:1.3,sizeAttenuation:false,fog:false,transparent:true,opacity:.7})));
  // bordures de trottoir et passages piétons
  const kb=[];for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++){if(tile[I(x,z)]!==1)continue;
    if(tile[I(x+1,z)]===2)kb.push([x+1,.06,z+.5,.12,.12,1]);if(tile[I(x-1,z)]===2)kb.push([x,.06,z+.5,.12,.12,1]);
    if(tile[I(x,z+1)]===2)kb.push([x+.5,.06,z+1,1,.12,.12]);if(tile[I(x,z-1)]===2)kb.push([x+.5,.06,z,1,.12,.12])}
  instBoxes(kb,'#4a5263');
  const zb=[];AVE.forEach(a=>AVE.forEach(b=>{const cx=UX(a),cz=UZ(b);for(let s=-1.2;s<=1.21;s+=.6)zb.push([cx+s,.014,cz-2.4,.3,.02,1.1],[cx+s,.014,cz+2.4,.3,.02,1.1],[cx-2.4,.014,cz+s,1.1,.02,.3],[cx+2.4,.014,cz+s,1.1,.02,.3])}));
  instBoxes(zb,'#b8bec8');
  // au-delà de la carte : un sol continu jusqu'à l'horizon, et le fleuve à gauche
  const far=new THREE.Mesh(new THREE.PlaneGeometry(800,800).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x15181f}));far.position.set(W/2,-.03,H/2);scene.add(far);
  const river=new THREE.Mesh(new THREE.PlaneGeometry(400,800).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x0b2448}));river.position.set(-199.5,-.005,H/2);scene.add(river);
  // marquages : tirets rouges au milieu des avenues et du périphérique (comme sur la carte)
  const dash=[];
  AVE.forEach(a=>{for(let t=-.03;t<1.03;t+=.035){dash.push([UX(a),.012,UZ(t),.08,.02,.7]);dash.push([UX(t),.012,UZ(a),.7,.02,.08])}});
  const mA=-.024,mB=1.024;for(let t=mA;t<mB;t+=.035){dash.push([UX(t),.012,UZ(mA),.7,.02,.08],[UX(t),.012,UZ(mB),.7,.02,.08],[UX(mA),.012,UZ(t),.08,.02,.7],[UX(mB),.012,UZ(t),.08,.02,.7])}
  instBoxes(dash,'#7a2a34',true);
  const kerb=[];for(let t=-.04;t<1.045;t+=.083){kerb.push([UX(t),.15,UZ(1.045),.25,.3,.25],[UX(1.045),.15,UZ(t),.25,.3,.25],[UX(t),.15,UZ(-.045),.25,.3,.25])}
  instBoxes(kerb,'#ffe2b0',true);

  // tours de la ville (même disposition que la carte)
  TOWERS.forEach((b,k)=>{const w=2*b.s*MS,h=HZF(b.h);tower(UX(b.u),UZ(b.v),w,w,h,k%4,b.comm?'#8fb7ff':b.neon,b.comm);
    if(!b.comm&&h>9&&k%2===0){const aw=Math.min(w*.62,3.4);adScreen(UX(b.u),Math.min(h*.62*.6,7)+1.5,UZ(b.v)+w/2+.08,0,aw,aw*.55)}});
  // tours lointaines tout autour (pas sur le fleuve ni sur le viaduc)
  for(let i=0;i<70;i++){
    const side=i%3;let x,z;const dd=6+rnd()*26;
    if(side===0){x=W+dd;z=-20+rnd()*(H+40)}else if(side===1){x=-5+rnd()*(W+30);z=-dd}else{x=-5+rnd()*(W+30);z=H+dd}
    if(Math.abs(x-GX)<6&&z<0)continue;
    const w=3+rnd()*5,d=3+rnd()*5,h=14+rnd()*34,v=Math.floor(rnd()*4);
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[facadeMat(v,d/4,h/8),facadeMat(v,d/4,h/8),roofMat,roofMat,facadeMat(v,w/4,h/8),facadeMat(v,w/4,h/8)]);
    m.position.set(x,h/2,z);scene.add(m);if(rnd()<.3)box(.3,.3,.3,pick(['#ff3b4e','#39e6ff']),x,h+.3,z,null,true);
  }

  // ===== les lieux de la carte, entrée face à une avenue =====
  for(const id in PL){
    const p=PL[id],P=PLACE[id],x=p.x,z=p.z,w=2*p.hw,h=HZF(p.h||.05);
    if(id==='comm'){faceSign(id,P.n,P.c,3.4,0,.07);faceBox(id,1.6,2.2,1.1,0,'#14202e',true);faceBox(id,2.4,.12,2.3,0,P.c,true,.06);continue}
    const [gx,gz]=front(id,1.4);glow(gx,gz,3,P.c,.3);
    if(id==='market'){
      const cols=['#ff4fa3','#39e6ff','#f6b35c','#7cf29a'];
      STALLS.forEach(([sx,sz],k)=>{const c=cols[k%4];
        box(1.3,.9,.7,'#2a2420',sx,.45,sz);box(1.35,.06,.75,'#4a3a2a',sx,.92,sz);
        [[-.7,-.45],[.7,-.45],[-.7,.45],[.7,.45]].forEach(([dx,dz])=>box(.06,2,.06,'#2a3140',sx+dx,1,sz+dz));
        box(1.7,.06,1.3,'#1b3346',sx,2.02,sz);
        box(1.75,.07,.07,c,sx,2.06,sz-.65,null,true);box(1.75,.07,.07,c,sx,2.06,sz+.65,null,true);box(.07,.07,1.3,c,sx-.87,2.06,sz,null,true);box(.07,.07,1.3,c,sx+.87,2.06,sz,null,true);
        for(let i=0;i<3;i++)box(.22,.18,.22,pick(['#ffb547','#d0353f','#7cf29a','#c9b7ff','#e8e8e4']),sx-.4+i*.4,1.04,sz+.1);
      });
      const [dx,dz]=STALLS[7];box(.5,.14,.02,'#5dff9a',dx,2.5,dz+.66,null,true);box(.14,.5,.02,'#5dff9a',dx,2.5,dz+.66,null,true);
      const [ax,az]=front(id,.3);sign(P.n,P.c,ax,4.2,az,FACE_RY[p.face],true,true,.12);
      [-4,4].forEach(o=>{const [qx,qz]=front(id,.3,o);box(.16,4.2,.16,'#2a3140',qx,2.1,qz)});
      continue;
    }
    if(id==='club'){
      const r=p.hw;const dm=new THREE.Mesh(new THREE.SphereGeometry(r,20,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0x1b2a40}));dm.position.set(x,0,z);scene.add(dm);camBlockers.push(dm);
      for(let k=0;k<5;k++){const rb=new THREE.Mesh(new THREE.TorusGeometry(r+.02,.06,4,32,Math.PI),mat(P.c,true));rb.position.set(x,0,z);rb.rotation.y=k*Math.PI/5;scene.add(rb)}
      const ring=new THREE.Mesh(new THREE.TorusGeometry(r+.02,.08,4,40),mat(P.c,true));ring.rotation.x=Math.PI/2;ring.position.set(x,.1,z);scene.add(ring);
      for(let k=0;k<3;k++){const g=new THREE.Group();g.position.set(x,r-.2,z);scene.add(g);
        const b=new THREE.Mesh(new THREE.CylinderGeometry(.15,1.4,16,8,1,true),new THREE.MeshBasicMaterial({color:P.c,transparent:true,opacity:.13,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
        b.position.y=8;g.add(b);clubBeams.push({g,k})}
      // sas d'entrée tourné vers l'avenue
      const [vx,vz]=front(id,-.5);const vb=box(1.8,2.8,3.2,'#2a1050',vx,1.4,vz);vb.rotation.y=FACE_RY[p.face]+Math.PI/2;camBlockers.push(vb);
      const [dx,dz]=front(id,.42);const db=box(.08,2.2,1.4,P.c,dx,1.1,dz,null,true);db.rotation.y=FACE_RY[p.face]+Math.PI/2;
      const [sx,sz]=front(id,.46);sign(P.n,P.c,sx,3.4,sz,FACE_RY[p.face],false,true,.1);
      continue;
    }
    const v=['bar','arcade'].includes(id)?2:id==='laundry'?3:id==='roofs'?1:0;
    if(id==='lab'){
      // parking à étages : dalles, piliers, néons de plafond, voitures garées ; une petite croix sur la façade
      const L=4,lh=2.4;
      for(let l=0;l<=L;l++){const y=l*lh;const s=box(w,.3,w,'#3a4048',x,y+.15,z);if(l>0)camBlockers.push(s);
        if(l===L){box(w+.1,.12,.12,P.c,x,y+.36,z+w/2,null,true);break}
        for(const a of [-1,0,1])for(const b of [-1,0,1])if(a||b)box(.35,lh,.35,'#2e343c',x+a*(w/2-.3),y+lh/2+.15,z+b*(w/2-.3));
        box(w-.6,.05,.1,'#cfe8ff',x,y+lh-.03,z-w/5,null,true);box(w-.6,.05,.1,'#cfe8ff',x,y+lh-.03,z+w/5,null,true);
        if(l>0){[[w,.12,0,w/2-.06],[w,.12,0,-w/2+.06]].forEach(([ww,dd,ox,oz])=>{box(ww,.55,dd,'#4a525c',x+ox,y+.57,z+oz);box(ww,.07,dd+.02,'#ffb547',x+ox,y+.86,z+oz,null,true)});
          box(.12,.55,w,'#4a525c',x+w/2-.06,y+.57,z);box(.12,.55,w,'#4a525c',x-w/2+.06,y+.57,z)}
        for(let k=0;k<3;k++)if(rnd()<.7)carModel(pick(['#3a4a6a','#6a2a3a','#2a2a30','#d8dee8','#2f5a4a']),pick(['#39e6ff','#ff4fa3','#7dffb0']),x-w/3+k*w/3,y+.62,z-w/5,Math.PI/2,false,true);
      }
      sign('NIVEAUX 0 · 1 · 2 · 3','#cfe8ff',x,lh*L+1.1,z+w/2+.1,0,false,false,.06);
      faceBox(id,.6,.16,1.75,0,P.c,true,-.08);faceBox(id,.16,.6,1.75,0,P.c,true,-.08); // petite croix sur le pilier d'entrée
      const [bx,bz]=front(id,.4,-1.6);box(.3,1,.3,'#ffb547',bx-1.4,.5,bz);const arm=new THREE.Group();arm.position.set(bx-1.3,.95,bz);scene.add(arm);
      for(let i=0;i<5;i++)box(.5,.12,.1,i%2?'#ff3b4e':'#f2f2ee',.25+i*.5,0,0,arm);barriers.push(arm);
    }else tower(x,z,w,2*p.hd,h,v,P.c,true);
    if(id==='roofs'){
      // toit praticable : grande antenne en treillis, paraboles, garde-corps lumineux, cabine d'ascenseur
      box(w-.2,.05,w-.2,'#2c313d',x,h+.03,z);
      for(const [a,b] of [[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]])box(.08,9,.08,'#8899aa',x+a,h+4.5,z+b);
      for(let k=1;k<9;k++)box(.62,.05,.62,'#6a7688',x,h+k,z);
      box(1.8,.06,.06,'#8899aa',x,h+6.2,z);box(.06,.06,1.8,'#8899aa',x,h+7.4,z);
      const bc=box(.5,.5,.5,'#ff3b4e',x,h+9.3,z,null,true);beacons.push(bc);beacons.push(box(.22,.22,.22,'#ff3b4e',x+.9,h+6.2,z,null,true));
      const dish=(dx,dy,dz,rx,ry,r)=>{const d=new THREE.Mesh(new THREE.SphereGeometry(r,12,6,0,Math.PI*2,0,Math.PI/3),new THREE.MeshLambertMaterial({color:0xc8d0dc,side:THREE.DoubleSide}));d.position.set(x+dx,h+dy,z+dz);d.rotation.set(rx,ry,0);scene.add(d)};
      dish(-2.3,.95,-2.2,-1.1,.7,.55);box(.08,.8,.08,'#5a6472',x-2.3,h+.4,z-2.2);dish(.45,7,0,0,0,.4);dish(-.45,5,0,0,0,.35);
      [[0,w/2-.05,w,.06],[0,-w/2+.05,w,.06]].forEach(([ox,oz,ww,dd])=>{box(ww,.9,dd,'#2a3140',x+ox,h+.45,z+oz);box(ww,.05,.09,'#6ff3f0',x+ox,h+.92,z+oz,null,true)});
      [[w/2-.05,0],[-w/2+.05,0]].forEach(([ox,oz])=>{box(.06,.9,w,'#2a3140',x+ox,h+.45,z+oz);box(.09,.05,w,'#6ff3f0',x+ox,h+.92,z+oz,null,true)});
      box(1.6,2.4,1.6,'#2a3140',x+1.9,h+1.2,z-1.9);box(1,1.9,.05,'#6ff3f0',x+1.9,h+1,z-1.08,null,true);box(1.8,.12,1.8,'#3a4252',x+1.9,h+2.46,z-1.9);
      sign('ASCENSEUR','#6ff3f0',x+1.9,h+2.15,z-1.06,0,false,false,.035);
      box(2.4,.3,2.4,'#2a3140',x-1.6,h+.15,z+1.6);box(2,.06,2,'#39e6ff',x-1.6,h+.33,z+1.6,null,true);
      holo=makeChar(SPECS.lou,{holo:true,scale:5});holo.position.set(x-1.6,h+.35,z+1.6);holo.userData.ry=0;holo.userData.baseY=h+.35;
      holoLight=new THREE.PointLight(0xff4fa3,3,22,1.4);holoLight.position.set(x-1.6,h+5,z+4);scene.add(holoLight);
      portal(id,1.8,2.5);
      faceSign(id,'LOU NÉON · CE SOIR AU CLUB ONDES','#ff4fa3',5.1,0,.05,false);faceSign(id,P.n,P.c,3.95,0,.07);
    }
    if(id==='bar'){portal(id,1.8,2.4);faceSign(id,P.n,P.c,3.75,0,.1);
      adScreen(x+1.2,2.6,z+p.hd+.1,0,3.2,1.8)} // panneau publicitaire, sur la façade sud
    if(id==='laundry'){faceBox(id,w-1,1.8,1.2,0,'#0d3a46',true);for(let i=0;i<4;i++){faceBox(id,.9,.9,.9,-2.1+i*1.4,'#cfd8de',false,.1);faceBox(id,.5,.5,.95,-2.1+i*1.4,'#6fe8ff',true,.2)}faceSign(id,P.n,P.c,h-.7,0,.09)}
    if(id==='lab')faceSign(id,P.n,P.c,3.05,-1.2,.08,false);
    if(id==='arcade'){portal(id,1.8,2.4);[-1,1].forEach(s=>{faceBox(id,.9,.7,1.5,s*2.05,pick(['#ff4fa3','#39e6ff','#ffb547']),true,.06)});faceSign(id,P.n,P.c,3.75,0,.1)}
    if(id==='bunker'){faceBox(id,2.6,2,1,0,'#2a2a2a',false);for(let i=0;i<6;i++)faceBox(id,.4,2,1,-1+i*.4,i%2?'#ffb547':'#15171c',false,.08);
      hazards.push(box(.5,.3,.5,'#ff2e3e',x,h+.3,z,null,true));faceSign(id,P.n,P.c,2.5,0,.07)}
    if(id==='port'){portal(id,2.2,2.6);faceSign(id,P.n,P.c,h+.6,0,.08)}
  }

  // ===== le port : quai, pontons, grue, conteneurs, bateaux =====
  const qk=[];for(let z=UZ(-.04);z<UZ(1.04);z+=.9){if(!PIERS.some(p=>z>p-.5&&z<p+2))qk.push([9.6,.2,z,.2,.4,.6])}instBoxes(qk,'#3a4252');
  PIERS.forEach(pz=>{box(7.2,.12,1.9,'#4a3526',5.6,.06,pz+1);for(let x=2.5;x<9.5;x+=2.2){box(.2,.7,.2,'#2a1e14',x,.2,pz+.1);box(.2,.7,.2,'#2a1e14',x,.2,pz+1.9)}box(.25,.25,.25,'#ffb547',2.3,.6,pz+1,null,true)});
  const [cx,cz]=CRANE;box(.45,12,.45,'#f6b35c',cx,6,cz);box(10,.38,.38,'#f6b35c',cx-4.2,12,cz);box(.06,4.5,.06,'#8a7040',cx-7.5,9.6,cz);box(1.2,.6,1.2,'#3a3f4c',cx-7.5,7.2,cz);box(.3,.3,.3,'#ff3b4e',cx,12.4,cz,null,true);
  const cc=['#d0353f','#2a6f7a','#ffb547','#3a4a8a','#7a2e22'];
  for(let i=0;i<3;i++)for(let k=0;k<2;k++)for(let l=0;l<(i===1?3:2);l++)box(1.9,1.2,2.8,cc[(i*2+k+l)%5],CONT[0]+1+i*1.4*1.0+k*.0,.6+l*1.22,CONT[1]+1.5+k*3.1);
  const boat=(x,z,len,c,big)=>{const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
    box(len,.8,big?2.6:1.5,c,0,.15,0,g);box(len*.92,.12,(big?2.6:1.5)*.9,'#2a2e36',0,.6,0,g);box(len*.3,big?1.2:.8,(big?2:1.1),'#d8d8d8',-len*.25,1.1,0,g);
    box(len*.28,.25,(big?2:1.1)+.02,'#6fdcff',-len*.25,1.25,0,g,true);box(.12,.12,.12,'#ff3b4e',len/2-.1,.75,0,g,true);box(.12,.12,.12,'#5dff9a',-len/2+.1,.75,0,g,true);
    if(big)for(let i=0;i<3;i++)box(1.2,.8,1.8,cc[i],len*.1+i*1.3,1,0,g);
    boats.push({g,ph:x*1.7+z});return g};
  PIERS.forEach((pz,i)=>{boat(5.8,pz-1.2,i%2?4.6:3.6,i%2?'#2a3a5a':'#5a2a2a');boat(5,pz+3.1,3.2,'#1e3a4a')});
  // sur le fleuve, des bateaux passent de temps en temps (ils remontent ou descendent le courant)
  [[-12,UZ(.35),12,'#22303e',true,1.1],[-26,UZ(.75),14,'#2a2a34',true,-.8],[-6,UZ(.1),3,'#5a2a2a',false,2.2],[-18,UZ(.6),4,'#2a3a5a',false,-1.7]].forEach(([x,z,l,c,big,sp])=>{
    const g=boat(x,z,l,c,big);g.rotation.y=sp>0?-Math.PI/2:Math.PI/2;boats[boats.length-1].mv=sp;
    box(.12,.12,.12,'#fff2c0',l/2-.05,big?1.9:1.5,0,g,true)});
  sign('DOCKS NOIRS','#8fb7ff',13.6,6.2,UZ(-.03),0,true,true,.12);[11.8,15.4].forEach(x=>box(.16,6.2,.16,'#2a3140',x,3.1,UZ(-.03)));

  // ===== gare Zéro : viaduc qui file au loin derrière la ville, halle voûtée, rame =====
  const RY=2.6,ZS=-150;
  box(1.5,.3,GZ1-ZS,'#2a3a48',GX,RY,(ZS+GZ1)/2);box(.06,.04,GZ1-ZS,'#ff4fa3',GX,RY+.17,(ZS+GZ1)/2,null,true);
  PILLARS.forEach(z=>box(.5,RY,.5,'#1c2a36',GX,RY/2,Math.floor(z)+.5));
  box(2.4,.4,.4,'#ff3b4e',GX,RY+.3,GZ1-.3,null,true);
  const rib=(zz,bright)=>{const R=GHW,Hh=7,b0=.2,N=12;for(let a=0;a<N;a++){const t0=Math.PI*a/N,t1=Math.PI*(a+1)/N;
    const x0=GX+Math.cos(t0)*R,y0=b0+Math.sin(t0)*Hh,x1=GX+Math.cos(t1)*R,y1=b0+Math.sin(t1)*Hh;
    const m=box(Math.hypot(x1-x0,y1-y0)+.05,bright?.16:.1,bright?.16:.1,bright?'#c8d4e0':'#6a7688',(x0+x1)/2,(y0+y1)/2,zz);m.rotation.z=Math.atan2(y1-y0,x1-x0)}};
  for(let k=0;k<=8;k++)rib(GZ0+(GZ1-GZ0)*k/8,k%4===0);
  box(.12,.12,GZ1-GZ0,'#c8d4e0',GX,7.2,(GZ0+GZ1)/2);
  sign('GARE ZÉRO','#ffb547',GX,8.2,GZ1+.2,0,true,true,.14);
  sign('QUAI 3','#ffb547',GX+GHW+.3,2.6,GZ0+4,Math.PI/2,true,false,.07,true);
  glow(GX,(GZ0+GZ1)/2,6,'#ffb547',.22);
  buildStation();
  train=buildTrain(RY,ZS);

  // voitures du périphérique
  for(let k=0;k<12;k++){const g=carModel(pick(['#2a3a5a','#6a2a3a','#2a2a30','#d8dee8','#2f5a4a','#4a3a6a']),pick(['#39e6ff','#ff4fa3','#7dffb0','#ffb547']),0,.3,0,0,false);
    ringCars.push({g,dir:k%2,sp:2.4+(k%3)*.9,d:k*23})}

  // ===== planque (construite en coordonnées locales, puis décalée au point vert) =====
  const n0=scene.children.length;
  const wallC='#2c3140';
  const wb=(w,h,d,x,y,z)=>{const m=box(w,h,d,wallC,x,y,z);camBlockers.push(m)};
  for(let x=2;x<=11;x++){wb(1,2.6,1,x+.5,1.3,2.5);if(x!==6&&x!==7)box(1,1,1,wallC,x+.5,.5,9.5)}
  for(let z=3;z<=8;z++){wb(1,1.6,1,2.5,.8,z+.5);wb(1,1.6,1,11.5,.8,z+.5)}
  box(10,.08,1.04,'#3a4256',7,2.64,2.5);
  box(1.8,1,.06,'#13305a',4.5,1.7,3.02,null,true);box(.06,1,.08,'#2c3140',4.5,1.7,3.04);
  sign('BXL 2086','#ff4fa3',8.7,2.1,3.03,0,false,false,.045);
  box(2,.4,3,'#3b3027',4,.2,4.5);box(1.85,.22,2.8,'#d9d4c8',4,.5,4.5);box(1.9,.16,1.6,'#2a6f7a',4,.66,5.1);box(.9,.14,.45,'#f2efe8',4,.66,3.4);
  box(3,.1,.9,'#4a3526',9.5,.8,3.5);[8.1,10.9].forEach(x=>box(.1,.8,.8,'#4a3526',x,.4,3.5));
  box(.9,.6,.08,'#1a1e27',9.5,1.2,3.35);box(.8,.5,.02,'#3dff9a',9.5,1.2,3.4,null,true);box(.5,.05,.25,'#2a2e36',9.5,.87,3.7);
  box(.5,.1,.5,'#3a3f4c',9.5,.45,4.5);box(.5,.5,.08,'#3a3f4c',9.5,.75,4.78);box(.08,.45,.08,'#3a3f4c',9.5,.22,4.5);
  box(.5,.5,.5,'#6b4a36',10.5,.25,8.5);box(.7,.5,.7,'#2f7a3e',10.5,.75,8.5);box(.4,.4,.4,'#3d9a50',10.4,1.15,8.4);
  box(3,.02,2.4,'#3b2a4a',6.5,.015,6.2);
  const home=new THREE.PointLight(0xffb070,1.4,9,1.5);home.position.set(6.5,2.6,6);scene.add(home);
  glow(9.5,4,1.2,'#3dff9a',.25);glow(6.5,10.6,2.2,'#7cf29a',.3);
  // l'immeuble : deux étages fermés autour de la planque. Il disparaît quand tu es à l'intérieur (vue en coupe).
  homeShell=new THREE.Group();scene.add(homeShell);
  const HH=6.6,wc='#3a3346',sw=(w,h,d,x,y,z,c)=>{const m=box(w,h,d,c||wc,x,y,z,homeShell);camBlockers.push(m);return m};
  sw(10.6,HH,.3,7,HH/2,1.85);sw(.3,HH,8.6,1.85,HH/2,6);sw(.3,HH,8.6,12.15,HH/2,6);
  sw(4.3,HH,.3,3.85,HH/2,10.15);sw(4.3,HH,.3,10.15,HH/2,10.15);sw(2,HH-2.6,.3,7,2.6+(HH-2.6)/2,10.15);
  sw(10.9,.3,8.9,7,HH+.15,6,'#2a2533');
  box(10.9,.12,.12,'#7cf29a',7,HH+.36,10.4,homeShell,true);box(.12,.12,8.9,'#7cf29a',12.4,HH+.36,6,homeShell,true);
  box(11,.18,.45,'#4a4458',7,3.3,10.4,homeShell);box(.45,.18,8.9,'#4a4458',12.4,3.3,6,homeShell);
  const win=(x,y,z,w,h,side,lit)=>{const X=side==='x';box(X?.06:w+.16,h+.16,X?w+.16:.06,'#1a1620',x,y,z,homeShell);box(X?.07:w,h,X?w:.07,lit?pick(['#a87a52','#9a6e4e','#4e8494']):'#202838',X?x+.01:x,y,X?z:z+.01,homeShell,lit)};
  [3.4,10.6].forEach(x=>win(x,1.5,10.32,1.5,1,'z',true));[3.4,10.6].forEach(x=>win(x,4.9,10.32,1.4,1.2,'z',x<5));
  [3.6,6,8.4].forEach(z=>{win(12.32,1.6,z,1.2,1,'x',z!==6);win(12.32,4.9,z,1.2,1.2,'x',z===8.4)});
  // balcon de l'étage, avec plantes
  box(3.2,.14,1.1,'#4a4458',7,3.55,10.85,homeShell);box(3.2,.05,.05,'#7cf29a',7,4.4,11.38,homeShell,true);
  [6.1,7.9].forEach(x=>box(.05,.85,.05,'#2a2533',x,3.98,11.38,homeShell));box(1.2,1.6,.06,'#9a7048',7,4.5,10.32,homeShell,true);
  [6.2,7.8].forEach(x=>{box(.35,.35,.35,'#6b4a36',x,3.8,10.7,homeShell);box(.45,.45,.45,'#2f7a3e',x,4.2,10.7,homeShell)});
  // porte d'entrée encadrée de néon vert, numéro, boîte aux lettres, climatiseurs, antenne
  box(.12,2.7,.12,'#7cf29a',5.94,1.35,10.33,homeShell,true);box(.12,2.7,.12,'#7cf29a',8.06,1.35,10.33,homeShell,true);box(2.24,.12,.12,'#7cf29a',7,2.7,10.33,homeShell,true);
  box(.5,.32,.05,'#14181f',8.6,1.9,10.33,homeShell);box(.36,.18,.02,'#7cf29a',8.6,1.9,10.36,homeShell,true);
  box(.4,.5,.25,'#3a4252',5.2,1.1,10.45,homeShell);
  [[12.5,5.4,4.4],[12.5,2.2,7.6]].forEach(([x,y,z])=>{box(.4,.6,.9,'#5a6070',x,y,z,homeShell);box(.02,.4,.4,'#2a2e36',x+.21,y,z,homeShell)});
  box(.08,2.6,.08,'#8899aa',3.5,HH+1.3,4,homeShell);beacons.push(box(.2,.2,.2,'#ff3b4e',3.5,HH+2.6,4,homeShell,true));
  const wt=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.2,12),mat('#4a4f58'));wt.position.set(10,HH+.9,4);homeShell.add(wt);
  buildHome();
  const moto=new THREE.Group();moto.position.set(10,0,10.5);scene.add(moto);
  box(.5,.5,.18,'#15171c',-.75,.25,0,moto);box(.5,.5,.18,'#15171c',.75,.25,0,moto);
  box(1.6,.35,.32,'#ff8a3d',0,.6,0,moto);box(.7,.12,.3,'#15171c',-.2,.84,0,moto);box(.2,.3,.3,'#ff8a3d',.75,.9,0,moto);box(.06,.12,.2,'#fff4c8',.88,.9,0,moto,true);box(.06,.08,.2,'#ff3b4e',-.82,.66,0,moto,true);
  for(let i=n0;i<scene.children.length;i++){const o=scene.children[i];o.position.x+=HX;o.position.z+=HZ}

  // réverbères
  LAMPS.forEach(([x,z],i)=>{const c=i%3===2?'#39e6ff':'#ffd59a';box(.16,3.2,.16,'#2a3140',x+.5,1.6,z+.5);box(.35,.12,.35,c,x+.5,3.15,z+.5,null,true);glow(x+.5,z+.5,2.2,c,.28)});
}
let ground=null;

/* ===================== PLANQUE ===================== */
let boardCanvas=null,boardTex=null,cat=null;
function drawBoard(){
  if(!boardCanvas)return;const g=boardCanvas.getContext('2d');const Wb=48,Hb=28;
  g.fillStyle='#3a2a1c';g.fillRect(0,0,Wb,Hb);g.fillStyle='#8a6a44';g.fillRect(2,2,Wb-4,Hb-4);
  let s=3;for(let i=0;i<70;i++){s=(s*73+19)%997;g.fillStyle=i%2?'#7a5a38':'#9a7a50';g.fillRect(2+s%(Wb-4),2+(s>>3)%(Hb-4),1,1)}
  // photo floue au centre : toi, sans visage
  g.fillStyle='#d8d4c8';g.fillRect(20,9,8,10);g.fillStyle='#4a4f58';g.fillRect(22,13,4,6);g.fillStyle='#c99a7a';g.fillRect(23,10,2,3);
  g.fillStyle='#ff3b4e';g.fillRect(23,8,2,1);
  const slots={contrat:[4,4,'#ffb547'],implant:[36,5,'#39e6ff'],dossier:[19,21,'#ff4fa3']};
  for(const k in slots){const [x,y,c]=slots[k];
    if(S.frags.includes(k)){
      g.strokeStyle='#d0202a';g.lineWidth=1;g.beginPath();g.moveTo(x+4.5,y+3.5);g.lineTo(24.5,13.5);g.stroke();
      g.fillStyle='#efe9d8';g.fillRect(x,y,9,7);g.fillStyle=c;g.fillRect(x,y,9,2);g.fillStyle='#6a6458';g.fillRect(x+1,y+3,7,1);g.fillRect(x+1,y+5,5,1);
      g.fillStyle='#ff3b4e';g.fillRect(x+4,y,1,1);
    }else{g.fillStyle='#6a4e30';g.fillRect(x+3,y+2,3,3);g.fillStyle='#c0c0c0';g.fillRect(x+4,y+3,1,1)}
  }
  if(boardTex)boardTex.needsUpdate=true;
}
function buildHome(){
  // tableau d'enquête sur le mur du fond
  boardCanvas=document.createElement('canvas');boardCanvas.width=48;boardCanvas.height=28;boardTex=nearestTex(boardCanvas);drawBoard();
  const bm=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1),new THREE.MeshLambertMaterial({map:boardTex,emissive:0xffffff,emissiveMap:boardTex,emissiveIntensity:.25}));
  bm.position.set(6.7,1.55,3.03);scene.add(bm);
  // néons et guirlande sur le mur du fond
  box(7.8,.05,.05,'#ff4fa3',7,2.5,3.06,null,true);
  for(let x=3.4;x<10.8;x+=.45)box(.07,.07,.07,['#ffb547','#39e6ff','#ff4fa3'][Math.round(x*2)%3],x,2.3-Math.sin((x-3.4)/7.4*Math.PI)*.15,3.08,null,true);
  // table de nuit, lampe et photo
  box(.7,.5,.7,'#4a3526',5.5,.25,3.5);box(.18,.3,.18,'#ffcf7a',5.3,.65,3.4,null,true);box(.12,.08,.12,'#4a3526',5.3,.52,3.4);
  box(.28,.34,.04,'#1a1e27',5.7,.68,3.4);box(.22,.26,.02,'#9fc8e8',5.7,.68,3.43,null,true);
  const nl=new THREE.PointLight(0xffcf7a,.9,4,1.8);nl.position.set(5.3,1,3.8);scene.add(nl);
  // coin cuisine : comptoir, plaque, nouilles, radio, frigo
  box(.9,.9,1.9,'#3a3f4c',10.5,.45,5);box(.95,.06,1.95,'#5a6070',10.5,.92,5);
  box(.5,.04,.5,'#15171c',10.5,.96,4.4);box(.36,.01,.36,'#ff3b4e',10.5,.985,4.4,null,true);
  box(.16,.2,.16,'#f2efe8',10.35,1.05,5.1);box(.16,.04,.16,'#d0353f',10.35,1.17,5.1);box(.16,.2,.16,'#f2efe8',10.6,1.05,5.3);box(.16,.04,.16,'#ffb547',10.6,1.17,5.3);
  box(.3,.2,.16,'#2a2e36',10.5,1.05,5.75);box(.12,.06,.02,'#39e6ff',10.45,1.07,5.84,null,true);
  box(.9,1.9,.9,'#7d8794',10.5,.95,6.5);box(.92,.02,.92,'#5a6472',10.5,1.25,6.5);box(.04,.5,.06,'#8a96a8',10.03,1.55,6.85);box(.04,.3,.06,'#8a96a8',10.03,.8,6.85);box(.03,.03,.03,'#3dff9a',10.03,1.8,6.2,null,true);
  // coffre-fort
  box(.7,.7,.7,'#4a4f58',10.5,.35,7.5);box(.02,.5,.5,'#3a3f4c',10.14,.35,7.5);box(.02,.14,.2,'#ffb547',10.13,.45,7.5,null,true);box(.02,.08,.08,'#8a96a8',10.13,.25,7.6);
  // penderie avec miroir
  box(.9,2,.9,'#4a3526',3.5,1,6.5);box(.02,1.8,.02,'#2a1e14',3.96,1,6.5);box(.02,1.4,.36,'#9fb8c8',3.96,1.1,6.27,null,true);
  // vêtements au sol
  box(.6,.06,.4,'#4a4f58',4.4,.03,6.9);box(.4,.06,.3,'#7a2e22',4.6,.07,7.1);
  // canapé, couverture pliée, caisse-table et canettes
  box(.9,.45,1.9,'#2a5a6a',3.5,.22,8);box(.25,.55,1.9,'#244e5c',3.12,.6,8);box(.9,.3,.2,'#244e5c',3.5,.5,7.1);box(.9,.3,.2,'#244e5c',3.5,.5,8.9);
  box(.4,.12,.5,'#ff4fa3',3.6,.5,7.6);box(.5,.12,.4,'#7a2e22',3.6,.5,8.4);
  box(.7,.4,.7,'#6b5a3a',4.5,.2,8.5);box(.72,.04,.72,'#7a6a48',4.5,.42,8.5);box(.08,.14,.08,'#b46bff',4.4,.5,8.4);box(.08,.14,.08,'#39e6ff',4.6,.5,8.6);
  const sl=new THREE.PointLight(0xff4fa3,.8,4,1.6);sl.position.set(3.8,1.4,8.2);scene.add(sl);
  // câbles au sol, chaussures, digicode de la porte
  box(.04,.02,1.8,'#111318',9.2,.012,4.4);box(1.6,.02,.04,'#111318',8.4,.012,5.3);
  box(.24,.08,.12,'#d8d8d8',5.3,.04,8.6);box(.24,.08,.12,'#d8d8d8',5.35,.04,8.4);
  box(.12,.18,.04,'#1a1e27',5.75,.75,8.98);box(.08,.06,.02,'#39e6ff',5.75,.78,8.95,null,true);
  // le chat, roulé en boule au pied du lit
  cat=new THREE.Group();cat.position.set(4,.74,5.5);scene.add(cat);
  const body=new THREE.Group();cat.add(body);
  box(.42,.18,.3,'#8a8a90',0,.09,0,body);box(.2,.16,.18,'#9a9aa0',.2,.14,.06,body);
  box(.05,.06,.04,'#9a9aa0',.16,.25,.02,body);box(.05,.06,.04,'#9a9aa0',.26,.25,.02,body);
  box(.03,.02,.01,'#2a2a2a',.24,.16,.155,body);box(.36,.06,.06,'#6a6a70',-.04,.05,.17,body);
  cat.userData.body=body;
}

