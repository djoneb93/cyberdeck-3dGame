// PROTOTYPE · l'île de Néo-Récif, au large. Le yacht de la Marina Zéro peut y aller et en revenir.
// Sur l'île : un ponton, une place, un bunker caché dans la colline, et une petite ville connectée où les tours se rejoignent
// par des passerelles. On marche au sol, puis on prend les ascenseurs pour se promener de passerelle en passerelle, en hauteur.
'use strict';

const ISLE={x:-130,z:38,dock:{x:-101,z:34.4,ry:Math.PI},pier:{x:-99,z:38},level:1,surf:[],built:false};
const GROUND=1.0,LA=7,LB=13; // hauteurs : le sol de l'île, les passerelles, les passerelles hautes
// surfaces praticables : rectangles horizontaux (x0,x1,z0,z1,y) ; le joueur reste sur celle de son niveau
function isleSurf(x0,x1,z0,z1,y){ISLE.surf.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),y})}
function isleHere(x,z,lvl){let best=null;for(const s of ISLE.surf){if(x<s.x0||x>s.x1||z<s.z0||z>s.z1)continue;if(Math.abs(s.y-lvl)<.6&&(!best||Math.abs(s.y-lvl)<Math.abs(best.y-lvl)))best=s}return best}
ZONES.ile={x:ISLE.x,z:ISLE.z,hw:60,hd:40,get y(){const s=isleHere(player.position.x,player.position.z,ISLE.level);return s?s.y:ISLE.level},blocks:[],
  walk:(x,z)=>!!isleHere(x,z,ISLE.level)&&!ZONES.ile.blocks.some(([cx,cz,hx,hz])=>Math.abs(x-cx)<hx+.27&&Math.abs(z-cz)<hz+.27)};

function buildIsland(){ISLE.built=true;const X=ISLE.x,Z=ISLE.z,add=(o)=>{scene.add(o);return o};
  const P=(c,s,e)=>new THREE.MeshPhongMaterial({color:c,shininess:s||10,emissive:e||0});
  // ---- le relief : un plateau rocheux aux bords arrondis, une plage, une colline à l'ouest ----
  const sh=new THREE.Shape(),W2=23,D2=16,r=6;sh.moveTo(-W2+r,-D2);sh.lineTo(W2-r,-D2);sh.quadraticCurveTo(W2,-D2,W2,-D2+r);sh.lineTo(W2,D2-r);sh.quadraticCurveTo(W2,D2,W2-r,D2);sh.lineTo(-W2+r,D2);sh.quadraticCurveTo(-W2,D2,-W2,D2-r);sh.lineTo(-W2,-D2+r);sh.quadraticCurveTo(-W2,-D2,-W2+r,-D2);
  const rock=new THREE.ExtrudeGeometry(sh,{depth:3,bevelEnabled:true,bevelThickness:.8,bevelSize:2.2,bevelSegments:3,curveSegments:10});rock.rotateX(-Math.PI/2);
  const land=add(new THREE.Mesh(rock,P(0x2a2e34,6)));land.position.set(X,GROUND-3,Z);
  const top=add(new THREE.Mesh(new THREE.ShapeGeometry(sh,10).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:(()=>{const t=groundTex('paving');t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12,8);return t})(),color:0x9a9ea8})));top.position.set(X,GROUND+.01,Z);
  const beach=add(new THREE.Mesh(new THREE.ShapeGeometry(sh,10).rotateX(-Math.PI/2),P(0x8a7a5a,4)));beach.scale.set(1.18,1,1.25);beach.position.set(X,.05,Z);
  const hill=add(new THREE.Mesh(new THREE.SphereGeometry(9,18,10,0,Math.PI*2,0,Math.PI/2),P(0x2c3a30,4)));hill.scale.set(1,.45,1.2);hill.position.set(X-17,GROUND-.5,Z);
  isleSurf(X-W2+1,X+W2-1,Z-D2+1,Z+D2-1,GROUND);ZONES.ile.blocks.push([X-17,Z,6.5,8]); // la colline ne se traverse pas
  // ---- le ponton, à l'est : on y débarque du yacht ----
  const px0=X+W2-1,px1=ISLE.pier.x+1.2;add(new THREE.Mesh(new THREE.BoxGeometry(px1-px0,.16,2.6),P(0x6a4a2e,8))).position.set((px0+px1)/2,GROUND-.08,ISLE.pier.z);
  for(let x=px0;x<px1;x+=2)[-1,1].forEach(s=>{box(.2,2,.2,'#2a1e14',x,GROUND-1,ISLE.pier.z+s*1.2);box(.06,.06,.06,'#7dffb0',x,GROUND+.75,ISLE.pier.z+s*1.2,null,true)});
  isleSurf(px0-1,px1,ISLE.pier.z-1.2,ISLE.pier.z+1.2,GROUND);
  sign('NÉO-RÉCIF','#39e6ff',X+W2-1.5,GROUND+3.4,ISLE.pier.z,Math.PI/2,true,true,.07);[-1.4,1.4].forEach(dz=>box(.2,3.4,.2,'#20262e',X+W2-1.5,GROUND+1.7,ISLE.pier.z+dz));
  // ---- la ville connectée : quatre tours aux angles de la place, reliées par des passerelles couvertes ----
  const T=[{dx:-9,dz:-7,w:6,d:6,h:24},{dx:8,dz:-7,w:7,d:6,h:32},{dx:-9,dz:7,w:6,d:7,h:20},{dx:8,dz:7,w:6,d:6,h:28}];
  const neon=['#ff4fa3','#39e6ff','#b98cff','#ffb547'];
  T.forEach((t,i)=>{t.x=X+t.dx;t.z=Z+t.dz;const m=new THREE.Mesh(new THREE.BoxGeometry(t.w,t.h,t.d),boxMats(i%2?'concrete':'brick',t.w,t.h,t.d,i%3));m.position.set(t.x,GROUND+t.h/2,t.z);add(m);camBlockers.push(m);
    ZONES.ile.blocks.push([t.x,t.z,t.w/2,t.d/2]);
    box(t.w+.3,.25,t.d+.3,'#2a3242',t.x,GROUND+t.h+.12,t.z);mast(t.x+t.w*.25,GROUND+t.h,t.z-t.d*.2,5+i*2); // corniche et antenne
    for(let y=3;y<t.h-2;y+=4.5)[[0,1],[0,-1],[1,0],[-1,0]].forEach(([fx,fz])=>box(fx?.04:t.w*.9,.06,fz?.04:t.d*.9,neon[(i+y)%4],t.x+fx*(t.w/2+.03),GROUND+y,t.z+fz*(t.d/2+.03),null,true)); // bandeaux néon
    const vs=box(.12,t.h*.4,.6,'#14181f',t.x+(t.dx<0?t.w/2:-t.w/2)+(t.dx<0?.07:-.07),GROUND+t.h*.55,t.z);box(.05,t.h*.36,.5,neon[i],t.x+(t.dx<0?t.w/2:-t.w/2)+(t.dx<0?.14:-.14),GROUND+t.h*.55,t.z,null,true); // enseigne verticale
    // terrasse qui fait le tour de la tour, au niveau des passerelles
    const deck=(y,c)=>{const R=1.9;box(t.w+R*2,.2,t.d+R*2,'#2a2f38',t.x,y-.1,t.z);[[0,1],[0,-1],[1,0],[-1,0]].forEach(([fx,fz])=>{
        box(fx?.05:t.w+R*2,.05,fz?.05:t.d+R*2,c,t.x+fx*(t.w/2+R),y+1,t.z+fz*(t.d/2+R),null,true);box(fx?.04:t.w+R*2,1,fz?.04:t.d+R*2,'#3a4048',t.x+fx*(t.w/2+R),y+.5,t.z+fz*(t.d/2+R)).material=new THREE.MeshBasicMaterial({color:0x8fd8ff,transparent:true,opacity:.12,depthWrite:false})});
      isleSurf(t.x-t.w/2-R,t.x+t.w/2+R,t.z-t.d/2-R,t.z+t.d/2+R,y)};
    deck(LA,neon[i]);if(i%2)deck(LB,'#7dffb0');t.decked=true});
  // passerelles : un tablier, un liseré lumineux, une verrière en demi-tube ; elles relient les terrasses
  const bridge=(ax,az,bx,bz,y,c)=>{const L=Math.hypot(bx-ax,bz-az),along=Math.abs(bx-ax)>Math.abs(bz-az),cx=(ax+bx)/2,cz=(az+bz)/2,Wd=2.2;
    box(along?L:Wd,.18,along?Wd:L,'#20252e',cx,y-.09,cz);[-1,1].forEach(s=>{box(along?L:.1,.1,along?.1:L,c,cx+(along?0:s*Wd/2),y+.04,cz+(along?s*Wd/2:0),null,true);box(along?L:.06,.06,along?.06:L,c,cx+(along?0:s*Wd/2),y+1.05,cz+(along?s*Wd/2:0),null,true)}); /* liserés au sol et main courante lumineuse */
    for(let k=0;k<L;k+=2.5){const g2=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:new THREE.Color(c),transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));g2.scale.set(2.6,1.4,1);g2.position.set(along?Math.min(ax,bx)+k:cx,y-.4,along?cz:Math.min(az,bz)+k);add(g2)} /* lumière sous le tablier */
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(Wd/2+.15,Wd/2+.15,L,16,1,true,0,Math.PI),new THREE.MeshPhongMaterial({color:0x9fd8ff,transparent:true,opacity:.3,shininess:120,specular:0xffffff,side:THREE.DoubleSide,depthWrite:false}));
    if(along){tube.rotation.z=Math.PI/2;tube.rotation.x=-Math.PI/2}else{tube.rotation.x=Math.PI/2;tube.rotation.y=Math.PI/2}tube.position.set(cx,y+.2,cz);add(tube);
    for(let k=1;k<L/2;k++){const f=k/(Math.ceil(L/2));box(along?.08:Wd+.3,.08,along?Wd+.3:.08,'#3a4252',along?ax+(bx-ax)*f:cx,y+Wd/2+.25,along?cz:az+(bz-az)*f)} // arceaux
    isleSurf(along?Math.min(ax,bx):cx-Wd/2,along?Math.max(ax,bx):cx+Wd/2,along?cz-Wd/2:Math.min(az,bz),along?cz+Wd/2:Math.max(az,bz),y)};
  const e=(t,side)=>side==='x+'?t.x+t.w/2+1.9:side==='x-'?t.x-t.w/2-1.9:side==='z+'?t.z+t.d/2+1.9:t.z-t.d/2-1.9;
  bridge(e(T[0],'x+'),T[0].z,e(T[1],'x-'),T[0].z,LA,'#ff4fa3');bridge(e(T[2],'x+'),T[2].z,e(T[3],'x-'),T[2].z,LA,'#39e6ff');
  bridge(T[0].x,e(T[0],'z+'),T[0].x,e(T[2],'z-'),LA,'#b98cff');bridge(T[1].x,e(T[1],'z+'),T[1].x,e(T[3],'z-'),LA,'#ffb547');
  bridge(T[1].x,e(T[1],'z+'),T[1].x,e(T[3],'z-'),LB,'#7dffb0'); // la passerelle haute, entre les deux grandes tours
  // ascenseurs : au pied de chaque tour (côté place), sur les terrasses, et vers les passerelles hautes
  const lift=(t,from,to,label)=>{const fx=t.dx<0?1:-1,x=t.x+fx*(t.w/2+.9),z=t.z;box(1.2,2.4,.1,'#14181f',t.x+fx*(t.w/2+.06),from+1.2,z).rotation.y=Math.PI/2;box(.06,2.2,1,'#7dffb0',t.x+fx*(t.w/2+.08),from+1.1,z,null,true);
    OBJECTS.push({id:'o_lift'+OBJECTS.length,x,z,zone:'ile',get r(){return Math.abs(ISLE.level-from)<.5?1.2:0},label,act:()=>{fadeThen(()=>{ISLE.level=to;player.position.set(x,to,z);focus.set(x,to+1.5,z);toast(to===GROUND?'Rez-de-chaussée':to===LA?'Passerelles · niveau 1':'Passerelles hautes · niveau 2','')})}})};
  T.forEach((t,i)=>{lift(t,GROUND,LA,'Ascenseur · monter aux passerelles');lift(t,LA,GROUND,'Ascenseur · redescendre sur la place');if(i%2){lift(t,LA,LB,'Ascenseur · passerelles hautes');lift(t,LB,LA,'Ascenseur · redescendre au niveau 1')}});
  // ---- la place : lampadaires, fontaine holographique, quelques habitants, câbles suspendus entre les tours ----
  [[-3,-3],[3,-3],[-3,3],[3,3]].forEach(([a,b])=>{box(.1,3.6,.1,'#2a2e36',X+a,GROUND+1.8,Z+b);box(.4,.06,.4,'#fff1d6',X+a,GROUND+3.6,Z+b,null,true)});
  const holo=add(new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.6,3,20,1,true),new THREE.MeshBasicMaterial({color:0x39e6ff,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})));holo.position.set(X,GROUND+1.6,Z);ISLE.holo=holo;
  box(2.6,.4,2.6,'#2a2e36',X,GROUND+.2,Z);ZONES.ile.blocks.push([X,Z,1.3,1.3]);
  for(let i=0;i<8;i++){const a=T[i%4],b=T[(i+1)%4],y=GROUND+16+i%3*2,pts=[];for(let k=0;k<=10;k++){const f=k/10;pts.push(new THREE.Vector3(a.x+(b.x-a.x)*f,y-Math.sin(f*Math.PI)*2.5,a.z+(b.z-a.z)*f))}
    add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,.03,4,false),mat('#15171c')))}
  const R=()=>randomSpec(Math.random);[[X+4,Z-1,-Math.PI/2],[X-4,Z+1.5,Math.PI/2],[X+15,Z+2,Math.PI]].forEach(([x,z,ry])=>{const m=makeChar(R());m.position.set(x,GROUND,z);m.userData.ry=ry;ZONES.ile.blocks.push([x,z,.25,.25])});
  [[T[0].x+4.5,T[0].z,LA],[T[3].x,T[3].z-6.5,LA],[T[1].x-.6,T[1].z+6,LB]].forEach(([x,z,y])=>{const m=makeChar(R());m.position.set(x,y,z);m.userData.ry=0;ZONES.ile.blocks.push([x,z,.25,.25])});
  // ---- le bunker caché, à moitié enterré dans la colline ----
  const bx=X-12.5,bz=Z+4.2;box(3.4,2.6,3,'#4a4c50',bx,GROUND+1.1,bz);box(3.8,.4,3.4,'#3a3c40',bx,GROUND+2.5,bz);box(1.6,2,.2,'#2a2c30',bx+1.75,GROUND+1,bz).rotation.y=Math.PI/2;
  for(let i=0;i<8;i++)box(.2,.18,.06,i%2?'#ffb547':'#15171c',bx+1.82,GROUND+2.2,bz-.7+i*.2).rotation.y=Math.PI/2;
  const lamp=box(.2,.2,.2,'#ff2a3a',bx+1.85,GROUND+2.35,bz+.9,null,true);ISLE.lamp=lamp;ZONES.ile.blocks.push([bx,bz,1.9,1.7]);
  OBJECTS.push({id:'o_isle_bunker',x:bx+2.6,z:bz,r:1.3,zone:'ile',get label(){return 'Examiner la porte blindée'},dyn:()=>'Une porte blindée, à moitié couverte de lierre synthétique. Pochoir effacé : « K-SITE 0 ». Un clavier à six chiffres, éteint. Quelqu’un l’a fermée de l’intérieur… et ce n’était pas il y a longtemps.'});
  OBJECTS.push({id:'o_isle_holo',x:X+1.8,z:Z,r:1.4,zone:'ile',label:'Regarder la fontaine holographique',dyn:()=>'Une colonne de lumière qui tourne lentement. Des noms défilent dedans : les gens qui vivent ici. Le tien n’y est pas. Pas encore.'});
  // ---- le retour : depuis le ponton, on rappelle le yacht ----
  OBJECTS.push({id:'o_isle_back',x:ISLE.pier.x+.4,z:ISLE.pier.z,r:1.5,zone:'ile',label:'Rentrer en ville · Neo-Mouette',act:()=>boardBack()});
  developIsland(); /* js/island_dev.js */
}
function updateIsland(dt){if(!ISLE.built)return;if(ISLE.holo)ISLE.holo.rotation.y+=dt*.4;if(ISLE.lamp)ISLE.lamp.visible=Math.floor(tAcc*1.5)%2===0}
// arrivée et départ
function arriveIsland(){fadeThen(()=>{boatRide=null;overlayOpen=false;S.roof='ile';ISLE.level=GROUND;player.userData.sit=false;player.position.set(ISLE.pier.x-.5,GROUND,ISLE.pier.z);player.userData.ry=-Math.PI/2;
  focus.set(player.position.x,GROUND+1.5,player.position.z);toast('Néo-Récif · prototype de l’île','mem')})}
