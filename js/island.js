// L'île de Néo-Récif, au large. Le yacht de la Marina Zéro y va et en revient.
// Au centre, une place en béton entourée de quatre tours (boutiques au rez-de-chaussée), reliées en hauteur par des passerelles.
// Autour, du sable ; dans le sable, à l'ouest, l'escalier enterré du bunker. On monte aux passerelles par deux escaliers
// extérieurs qui longent les tours, ou par les ascenseurs (porte qui s'ouvre, choix du niveau 0, 1 ou 2).
'use strict';

const ISLE={x:-130,z:38,dock:{x:-101,z:34.4,ry:Math.PI},pier:{x:-99,z:38},level:1,surf:[],built:false,doors:[]};
const GROUND=1.0,LA=7,LB=13; // niveau 0 : la place ; niveau 1 : les passerelles ; niveau 2 : la passerelle haute
ISLE.bunker={x:ISLE.x-22,z:ISLE.z+3};
// surfaces praticables : des rectangles plats (y) ou des volées de marches (y qui monte le long d'un axe)
function isleSurf(x0,x1,z0,z1,y){ISLE.surf.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),h:()=>y})}
function isleRamp(x0,x1,z0,z1,ax,ya,yb){const s={x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1)};
  s.h=ax==='x'?(x=>ya+(yb-ya)*(x-x0)/(x1-x0)):((x,z)=>ya+(yb-ya)*(z-z0)/(z1-z0));ISLE.surf.push(s)}
// la surface sous les pieds : la plus haute qu'on peut atteindre d'une marche (on monte les escaliers, on ne saute pas sur les passerelles)
function isleHere(x,z,lvl){let best=null,bh=-1e9;for(const s of ISLE.surf){if(x<s.x0||x>s.x1||z<s.z0||z>s.z1)continue;const h=s.h(x,z);if(h<=lvl+.45&&h>=lvl-.75&&h>bh){bh=h;best=s}}return best}
ZONES.ile={x:ISLE.x,z:ISLE.z,hw:60,hd:40,get y(){const p=player.position,s=isleHere(p.x,p.z,ISLE.level);if(s)ISLE.level=s.h(p.x,p.z);return ISLE.level},blocks:[],
  walk:(x,z)=>!!isleHere(x,z,ISLE.level)&&!ZONES.ile.blocks.some(([cx,cz,hx,hz,y0,y1])=>(y0==null||(ISLE.level>=y0-.3&&ISLE.level<=y1))&&Math.abs(x-cx)<hx+.27&&Math.abs(z-cz)<hz+.27)};
const isleBlock=(x,z,hx,hz,y0,y1)=>ZONES.ile.blocks.push([x,z,hx,hz,y0,y1]); // (y0, y1 : seulement à ces hauteurs)

function canvasTex(draw,rx,ry){const c=document.createElement('canvas');c.width=c.height=128;draw(c.getContext('2d'),128);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
function rrect(w2,d2,r){const s=new THREE.Shape();s.moveTo(-w2+r,-d2);s.lineTo(w2-r,-d2);s.quadraticCurveTo(w2,-d2,w2,-d2+r);s.lineTo(w2,d2-r);s.quadraticCurveTo(w2,d2,w2-r,d2);s.lineTo(-w2+r,d2);s.quadraticCurveTo(-w2,d2,-w2,d2-r);s.lineTo(-w2,-d2+r);s.quadraticCurveTo(-w2,-d2,-w2+r,-d2);return s}

function buildIsland(){ISLE.built=true;const X=ISLE.x,Z=ISLE.z,add=o=>{scene.add(o);return o};
  const P=(c,s,e)=>new THREE.MeshPhongMaterial({color:c,shininess:s||10,emissive:e||0});
  // ---- le relief : un socle rocheux, du sable dessus, une place en béton au centre ----
  const W2=27,D2=19,outer=rrect(W2,D2,8);
  const rock=new THREE.ExtrudeGeometry(outer,{depth:3,bevelEnabled:true,bevelThickness:.6,bevelSize:1.6,bevelSegments:3,curveSegments:10});rock.rotateX(-Math.PI/2);
  add(new THREE.Mesh(rock,P(0x3a3630,6))).position.set(X,GROUND-3.62,Z); // son dessus arrive juste sous le sable
  const sand=canvasTex((g,n)=>{g.fillStyle='#c8b080';g.fillRect(0,0,n,n);for(let i=0;i<900;i++){g.fillStyle=rpick(['#bca274','#d4bc8c','#b49a6c','#dcc89c']);g.fillRect(Math.random()*n,Math.random()*n,1+Math.random()*2,1)}
    g.strokeStyle='rgba(120,100,60,.25)';for(let i=0;i<6;i++){g.beginPath();g.moveTo(0,i*22+10);g.bezierCurveTo(40,i*22,80,i*22+20,128,i*22+8);g.stroke()}},10,7);
  const sandM=new THREE.MeshLambertMaterial({map:sand,color:0xd8c8a0});
  add(new THREE.Mesh(new THREE.ShapeGeometry(outer,12).rotateX(-Math.PI/2),sandM)).position.set(X,GROUND-.012,Z);
  const shore=add(new THREE.Mesh(new THREE.ShapeGeometry(rrect(W2+2.2,D2+2.2,9),12).rotateX(-Math.PI/2),P(0x8a7a5a,4)));shore.position.set(X,.06,Z); // sable mouillé au bord de l'eau
  const PW=17.5,PD=13,plaza=rrect(PW,PD,3);
  const pave=groundTex('paving');pave.wrapS=pave.wrapT=THREE.RepeatWrapping;pave.repeat.set(9,7);
  add(new THREE.Mesh(new THREE.ShapeGeometry(plaza,8).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:pave,color:0x9a9ea8}))).position.set(X,GROUND-.004,Z);
  const curb=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(plaza.getSpacedPoints(80).map(p=>new THREE.Vector3(X+p.x,GROUND+.03,Z-p.y)),true),160,.09,4,true),P(0x8a8f98,20));add(curb); // bordure de la place
  isleSurf(X-W2+1.6,X+W2-1.6,Z-D2+1.6,Z+D2-1.6,GROUND);
  // quelques dunes et des palmiers de fer sur le sable
  [[-24,-12,3],[-23,13,2.6],[22,-14,2.2],[24,13,2.8],[-6,-17,2],[8,17,2.2]].forEach(([a,b,r])=>{const d=add(new THREE.Mesh(new THREE.SphereGeometry(r,14,8,0,Math.PI*2,0,Math.PI/2),sandM));d.scale.y=.28;d.position.set(X+a,GROUND-.05,Z+b);isleBlock(X+a,Z+b,r*.7,r*.7)});
  [[-20,-9],[-13,15],[14,-15],[20,10]].forEach(([a,b])=>{const x=X+a,z=Z+b;box(.16,4.2,.16,'#4a4f58',x,GROUND+2.1,z);for(let k=0;k<6;k++){const f=box(1.8,.04,.24,'#2f8a5a',x+Math.cos(k)*.8,GROUND+4.1,z+Math.sin(k)*.8,null,true);f.rotation.y=-k;f.rotation.z=.35}isleBlock(x,z,.25,.25)});
  // ---- le ponton, à l'est : on y débarque du yacht ----
  const px0=X+W2-2,px1=ISLE.pier.x+1.2;add(new THREE.Mesh(new THREE.BoxGeometry(px1-px0,.16,2.6),P(0x6a4a2e,8))).position.set((px0+px1)/2,GROUND-.09,ISLE.pier.z);
  for(let x=px0;x<px1;x+=2)[-1,1].forEach(s=>{box(.2,2,.2,'#2a1e14',x,GROUND-1,ISLE.pier.z+s*1.2);box(.06,.06,.06,'#7dffb0',x,GROUND+.75,ISLE.pier.z+s*1.2,null,true)});
  isleSurf(px0-1,px1,ISLE.pier.z-1.2,ISLE.pier.z+1.2,GROUND);
  sign('NÉO-RÉCIF','#39e6ff',X+W2-1.2,GROUND+3.4,ISLE.pier.z,Math.PI/2,true,true,.07);[-1.4,1.4].forEach(dz=>box(.2,3.4,.2,'#20262e',X+W2-1.2,GROUND+1.7,ISLE.pier.z+dz));
  // ---- les tours, aux angles de la place ; boutiques au rez-de-chaussée, terrasses aux niveaux des passerelles ----
  const T=ISLE.towers=[{dx:-9,dz:-7,w:6,d:6,h:24},{dx:8,dz:-7,w:7,d:6,h:32},{dx:-9,dz:7,w:6,d:7,h:20},{dx:8,dz:7,w:6,d:6,h:28}];
  const neon=['#ff4fa3','#39e6ff','#b98cff','#ffb547'],shops=[['RAMEN DU RÉCIF',2],['PIÈCES & PUCES',4],['CAFÉ MARÉE',5],['FRIPERIE DU LARGE',3]];
  T.forEach((t,i)=>{t.x=X+t.dx;t.z=Z+t.dz;const m=new THREE.Mesh(new THREE.BoxGeometry(t.w,t.h,t.d),boxMats(i%2?'concrete':'brick',t.w,t.h,t.d,i%3));m.position.set(t.x,GROUND+t.h/2,t.z);add(m);camBlockers.push(m);
    isleBlock(t.x,t.z,t.w/2,t.d/2);
    box(t.w+.3,.25,t.d+.3,'#2a3242',t.x,GROUND+t.h+.12,t.z);mast(t.x+t.w*.25,GROUND+t.h,t.z-t.d*.2,5+i*2);
    for(let y=4;y<t.h-2;y+=4.5)[[0,1],[0,-1],[1,0],[-1,0]].forEach(([fx,fz])=>box(fx?.04:t.w*.9,.06,fz?.04:t.d*.9,neon[(i+y)%4],t.x+fx*(t.w/2+.03),GROUND+y,t.z+fz*(t.d/2+.03),null,true));
    // la vitrine, côté place, avec un auvent et une enseigne
    const fz=t.dz<0?1:-1,wz=t.z+fz*(t.d/2+.02);shopWindow(t.x,GROUND+1.2,wz,t.w*.72,1.9,0,fz,shops[i][1]);
    box(t.w*.8,.08,.9,'#1d2430',t.x,GROUND+2.35,t.z+fz*(t.d/2+.45));box(t.w*.8,.05,.05,neon[i],t.x,GROUND+2.3,t.z+fz*(t.d/2+.9),null,true);
    sign(shops[i][0],neon[i],t.x,GROUND+2.75,t.z+fz*(t.d/2+.06),fz>0?0:Math.PI,false,true,.032);
    // terrasses tout autour de la tour, aux niveaux des passerelles
    const deck=(y,c)=>{const R=1.9;box(t.w+R*2,.2,t.d+R*2,'#2a2f38',t.x,y-.1,t.z);[[0,1],[0,-1],[1,0],[-1,0]].forEach(([qx,qz])=>{
        box(qx?.05:t.w+R*2,.05,qz?.05:t.d+R*2,c,t.x+qx*(t.w/2+R),y+1,t.z+qz*(t.d/2+R),null,true);
        box(qx?.04:t.w+R*2,1,qz?.04:t.d+R*2,'#3a4048',t.x+qx*(t.w/2+R),y+.5,t.z+qz*(t.d/2+R)).material=new THREE.MeshBasicMaterial({color:0x8fd8ff,transparent:true,opacity:.12,depthWrite:false})});
      isleSurf(t.x-t.w/2-R,t.x+t.w/2+R,t.z-t.d/2-R,t.z+t.d/2+R,y)};
    deck(LA,neon[i]);if(i%2)deck(LB,'#7dffb0')});
  // ---- passerelles couvertes entre les terrasses ----
  const bridge=(ax,az,bx,bz,y,c)=>{const L=Math.hypot(bx-ax,bz-az),along=Math.abs(bx-ax)>Math.abs(bz-az),cx=(ax+bx)/2,cz=(az+bz)/2,Wd=2.2;
    box(along?L:Wd,.18,along?Wd:L,'#20252e',cx,y-.09,cz);
    [-1,1].forEach(s=>{box(along?L:.1,.1,along?.1:L,c,cx+(along?0:s*Wd/2),y+.04,cz+(along?s*Wd/2:0),null,true);box(along?L:.06,.06,along?.06:L,c,cx+(along?0:s*Wd/2),y+1.05,cz+(along?s*Wd/2:0),null,true)});
    for(let k=0;k<L;k+=2.5){const g2=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:new THREE.Color(c),transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));g2.scale.set(2.6,1.4,1);g2.position.set(along?Math.min(ax,bx)+k:cx,y-.4,along?cz:Math.min(az,bz)+k);add(g2)}
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(Wd/2+.15,Wd/2+.15,L,16,1,true,0,Math.PI),new THREE.MeshPhongMaterial({color:0x9fd8ff,transparent:true,opacity:.3,shininess:120,specular:0xffffff,side:THREE.DoubleSide,depthWrite:false}));
    if(along){tube.rotation.z=Math.PI/2;tube.rotation.x=-Math.PI/2}else{tube.rotation.x=Math.PI/2;tube.rotation.y=Math.PI/2}tube.position.set(cx,y+.2,cz);add(tube);
    isleSurf(along?Math.min(ax,bx):cx-Wd/2,along?Math.max(ax,bx):cx+Wd/2,along?cz-Wd/2:Math.min(az,bz),along?cz+Wd/2:Math.max(az,bz),y)};
  const e=(t,side)=>side==='x+'?t.x+t.w/2+1.9:side==='x-'?t.x-t.w/2-1.9:side==='z+'?t.z+t.d/2+1.9:t.z-t.d/2-1.9;
  bridge(e(T[0],'x+'),T[0].z,e(T[1],'x-'),T[0].z,LA,'#ff4fa3');bridge(e(T[2],'x+'),T[2].z,e(T[3],'x-'),T[2].z,LA,'#39e6ff');
  bridge(T[0].x,e(T[0],'z+'),T[0].x,e(T[2],'z-'),LA,'#b98cff');bridge(T[1].x,e(T[1],'z+'),T[1].x,e(T[3],'z-'),LA,'#ffb547');
  bridge(T[1].x,e(T[1],'z+'),T[1].x,e(T[3],'z-'),LB,'#7dffb0');
  // ---- escaliers extérieurs : deux volées qui longent la tour, un palier, puis la terrasse du niveau 1 ----
  const stairs=(t,sx,sz)=>{ // sx, sz : côté de l'escalier (vers l'extérieur de l'île)
    const zf=t.z+sz*(t.d/2+1.9+1.15),xa=t.x-sx*(t.w/2+1.9),xb=t.x+sx*(t.w/2+1.9+1.15),ym=(GROUND+LA)/2,zc=t.z+sz*.5;
    isleRamp(xa,xb-sx*1.15,zf-1.1,zf+1.1,'x',GROUND,ym);isleSurf(xb-sx*1.15,xb+sx*1.15,zf-1.15,zf+1.15,ym); // volée 1 et palier
    isleRamp(xb-1.1,xb+1.1,zf-sz*1.15,zc,'z',ym,LA);isleSurf(xb+sx*1.15,t.x+sx*(t.w/2+1.9),zc-sz*1.2,zc+sz*1.2,LA); // volée 2 et pont vers la terrasse
    const step=(x,z,y,w,d)=>{box(w,.12,d,'#3a4048',x,y-.06,z);box(w,.03,.04,'#ffd23f',x,y+.01,z,null,true)};
    const n1=Math.round(Math.abs(xb-sx*1.15-xa)/.36);for(let k=0;k<n1;k++){const f=(k+.5)/n1,x=xa+(xb-sx*1.15-xa)*f;step(x,zf,GROUND+(ym-GROUND)*f,.38,2.2)}
    box(2.3,.14,2.3,'#2a2f38',xb,ym-.07,zf);
    const n2=Math.round(Math.abs(zc-(zf-sz*1.15))/.36);for(let k=0;k<n2;k++){const f=(k+.5)/n2,z=zf-sz*1.15+(zc-(zf-sz*1.15))*f;step(xb,z,ym+(LA-ym)*f,2.2,.38)}
    box(Math.abs(xb+sx*1.15-(t.x+sx*(t.w/2+1.9))),.16,2.4,'#2a2f38',(xb+sx*1.15+t.x+sx*(t.w/2+1.9))/2,LA-.08,zc);
    const rail=(p0,p1,c)=>{const v=new THREE.Vector3().subVectors(p1,p0),m=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,v.length(),6),mat(c,true));m.position.copy(p0).add(p1).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());add(m)};
    [-1,1].forEach(k=>{rail(new THREE.Vector3(xa,GROUND+1,zf+k*1.1),new THREE.Vector3(xb-sx*1.15,ym+1,zf+k*1.1),'#39e6ff');rail(new THREE.Vector3(xb+k*1.1,ym+1,zf-sz*1.15),new THREE.Vector3(xb+k*1.1,LA+1,zc),'#39e6ff')});
    for(let k=0;k<=4;k++){const f=k/4;box(.06,(ym-GROUND)*f+1,.06,'#3a4048',xa+(xb-sx*1.15-xa)*f,GROUND+((ym-GROUND)*f+1)/2,zf+sz*1.1)}};
  stairs(T[0],-1,-1);stairs(T[3],1,1);
  // ---- ascenseurs : une cabine contre chaque tour, côté place ; à chaque niveau une porte qui s'ouvre ----
  T.forEach((t,i)=>{const fx=t.dx<0?1:-1,sx=t.x+fx*(t.w/2+.45),top=(i%2?LB:LA)+3.2,levels=i%2?[GROUND,LA,LB]:[GROUND,LA];
    box(.8,top-GROUND,1.7,'#1a1e26',sx,GROUND+(top-GROUND)/2,t.z);[-.86,.86].forEach(dz=>box(.05,top-GROUND,.05,'#7dffb0',sx+fx*.41,GROUND+(top-GROUND)/2,t.z+dz,null,true));
    isleBlock(sx,t.z,.4,.85);
    levels.forEach(lv=>{const dg=new THREE.Group();dg.position.set(sx+fx*.42,lv,t.z);add(dg);const L=box(.05,2.2,.6,'#9aa4b0',0,1.1,-.3,dg),Rd=box(.05,2.2,.6,'#9aa4b0',0,1.1,.3,dg);
      box(.06,.12,1.3,'#7dffb0',0,2.32,0,dg,true);const ind=box(.04,.18,.18,'#ffd23f',0,2.55,0,dg,true);
      const px=sx+fx*1.35;ISLE.doors.push({L,R:Rd,lv,x:px,z:t.z,open:0,ind});
      OBJECTS.push({id:'o_lift'+i+'_'+lv,x:px,z:t.z,zone:'ile',get r(){return Math.abs(ISLE.level-lv)<.5?1.25:0},label:'Ascenseur · choisir un niveau',act:()=>liftMenu(t,lv,px,levels)})})});
  // ---- la place : lampadaires, fontaine holographique, câbles entre les tours, habitants ----
  [[-3,-3],[3,-3],[-3,3],[3,3]].forEach(([a,b])=>{box(.1,3.6,.1,'#2a2e36',X+a,GROUND+1.8,Z+b);box(.4,.06,.4,'#fff1d6',X+a,GROUND+3.6,Z+b,null,true);isleBlock(X+a,Z+b,.12,.12)});
  const holo=add(new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.6,3,20,1,true),new THREE.MeshBasicMaterial({color:0x39e6ff,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})));holo.position.set(X,GROUND+1.6,Z);ISLE.holo=holo;
  box(2.6,.4,2.6,'#2a2e36',X,GROUND+.2,Z);isleBlock(X,Z,1.3,1.3);
  for(let i=0;i<8;i++){const a=T[i%4],b=T[(i+1)%4],y=GROUND+16+i%3*2,pts=[];for(let k=0;k<=10;k++){const f=k/10;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*f,y-Math.sin(f*Math.PI)*2.5,a.z+(b.z-a.z)*f))}
    add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,.03,4,false),mat('#15171c')))}
  const who=(x,z,y,ry)=>{const m=makeChar(randomSpec(Math.random));m.position.set(x,y,z);m.userData.ry=ry;isleBlock(x,z,.25,.25,y,y+.5)};
  [[X+4,Z-1,GROUND,-Math.PI/2],[X-4,Z+1.5,GROUND,Math.PI/2],[X+15,Z+2,GROUND,Math.PI],[X-11.5,Z-10.6,LA,Math.PI],[X+8,Z+.5,LA,0],[X+7.4,Z-1,LB,0]].forEach(a=>who(...a));
  // ---- l'entrée du bunker, enterrée dans le sable à l'ouest : un escalier qui s'enfonce, une margelle de béton, des aérations ----
  const B=ISLE.bunker;stairPit(scene,B.x,GROUND-.01,B.z,Math.PI/2,'#ff2a3a');
  for(let i=0;i<9;i++)box(.06,.12,.2,i%2?'#ffb547':'#15171c',B.x+1.35,GROUND+.06,B.z-.8+i*.2);
  [[-1.8,1.6],[-1.6,-1.8]].forEach(([a,b])=>{const v=add(new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1.2,10),P(0x6a6c70,30)));v.position.set(B.x+a,GROUND+.6,B.z+b);box(.5,.12,.5,'#4a4c50',B.x+a,GROUND+1.25,B.z+b);isleBlock(B.x+a,B.z+b,.25,.25)});
  const dune=add(new THREE.Mesh(new THREE.SphereGeometry(3.4,16,8,0,Math.PI*2,0,Math.PI/2),sandM));dune.scale.set(1,.3,1.2);dune.position.set(B.x-3.2,GROUND-.05,B.z);
  const lamp=box(.2,.2,.2,'#ff2a3a',B.x+1.4,GROUND+.9,B.z+1.4,null,true);box(.06,.8,.06,'#2a2e36',B.x+1.4,GROUND+.45,B.z+1.4);ISLE.lamp=lamp;
  sign('K-SITE 0','#ff2a3a',B.x+1.5,GROUND+1.45,B.z-1.4,Math.PI/2,false,true,.03);
  isleBlock(B.x,B.z,1.3,.9);isleBlock(B.x-3.2,B.z,2.2,2.6);
  OBJECTS.push({id:'o_isle_bunker',x:B.x+1.9,z:B.z,r:1.4,zone:'ile',get label(){return 'Examiner l’escalier enterré'},dyn:()=>'Un escalier s’enfonce dans le sable vers une porte blindée. Pochoir effacé : « K-SITE 0 ». Un clavier à six chiffres, éteint.'});
  OBJECTS.push({id:'o_isle_holo',x:X+1.8,z:Z,r:1.4,zone:'ile',label:'Regarder la fontaine holographique',dyn:()=>'Une colonne de lumière qui tourne lentement. Des noms défilent dedans : les gens qui vivent ici. Le tien n’y est pas. Pas encore.'});
  OBJECTS.push({id:'o_isle_back',x:ISLE.pier.x+.4,z:ISLE.pier.z,r:1.5,zone:'ile',label:'Rentrer en ville · Neo-Mouette',act:()=>boardBack()});
  developIsland(); /* js/island_dev.js */
}
// le menu de l'ascenseur : on choisit le niveau, la cabine monte ou descend, les portes s'ouvrent à l'arrivée
const LV_NAME={[GROUND]:'Niveau 0 · la place',[LA]:'Niveau 1 · les passerelles',[LB]:'Niveau 2 · la passerelle haute'};
function liftMenu(t,from,px,levels){openDlg({n1:{s:'nar',t:'Les portes s’ouvrent. Dans la cabine, un panneau lumineux : « Où allez-vous ? »',ch:levels.filter(l=>l!==from).map(l=>({t:LV_NAME[l],fx:{call:()=>setTimeout(()=>liftTo(px,t.z,l),60)}})).concat([{t:'Rester ici'}])}})}
function liftTo(x,z,lv){fadeThen(()=>{ISLE.level=lv;player.position.set(x,lv,z);focus.set(x,lv+1.5,z);toast(LV_NAME[lv],'')})}
function updateIsland(dt){if(!ISLE.built)return;if(ISLE.holo)ISLE.holo.rotation.y+=dt*.4;if(ISLE.lamp)ISLE.lamp.visible=Math.floor(tAcc*1.5)%2===0;
  if(zoneOf()!=='ile')return;const p=player.position;
  ISLE.doors.forEach(d=>{const near=Math.abs(ISLE.level-d.lv)<.5&&Math.hypot(p.x-d.x,p.z-d.z)<2.4;d.open+=((near?1:0)-d.open)*Math.min(1,dt*5);d.L.position.z=-.3-d.open*.55;d.R.position.z=.3+d.open*.55;d.ind.visible=near})} // les portes s'écartent quand on approche
function arriveIsland(){fadeThen(()=>{boatRide=null;overlayOpen=false;S.roof='ile';ISLE.level=GROUND;player.userData.sit=false;player.position.set(ISLE.pier.x-.5,GROUND,ISLE.pier.z);player.userData.ry=-Math.PI/2;
  focus.set(player.position.x,GROUND+1.5,player.position.z);toast('Néo-Récif','mem')})}
