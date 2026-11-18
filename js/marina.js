// Le bas du port : la Marina Zéro et son yacht, le « Neo-Mouette ».
// Un ponton part du quai jusqu'au yacht ; un kiosque vend les billets ; des passagers attendent. Depuis le bout du ponton,
// E pour monter à bord : le yacht largue les amarres avec ses passagers, fait une grande boucle sur l'océan et revient à quai.
// Aussi ici : les mouettes au-dessus du port, et le marché de nuit qui s'installe sur le quai de 20 h à 3 h.
'use strict';

const MARINA={x:-3,z:67.5,pz:68.75}; // le yacht (cap au nord quand il est à quai) et l'axe du ponton
let yacht=null,yachtPax=[];
// ---- le yacht : coque blanche à étrave fine, bande sombre, pont en teck, deux niveaux de superstructure vitrée, arceau radar ----
function yachtModel(){
  const g=new THREE.Group(),L=14,B=4.4;
  const P=(c,s,sp,e)=>new THREE.MeshPhongMaterial({color:c,shininess:s||60,specular:sp||0x555555,emissive:e||0});
  const white=P(0xf2f4f6,90,0x888888,0x0a0a0c),navy=P(0x141a28,70,0x445566),teak=P(0x9a6a3e,20,0x222222),glass=P(0x0c1824,140,0xaaccff),chrome=P(0xc8d0d8,140,0xffffff);
  // contour du pont, vu de dessus : étrave pointue à l'avant (+x), tableau arrière droit
  const deck=(len,beam)=>{const s=new THREE.Shape(),h=beam/2;s.moveTo(-len/2,-h);s.lineTo(len*.18,-h);s.quadraticCurveTo(len*.42,-h*.9,len/2,0);s.quadraticCurveTo(len*.42,h*.9,len*.18,h);s.lineTo(-len/2,h);s.closePath();return s};
  const slab=(len,beam,th,m,y,bev)=>{const geo=new THREE.ExtrudeGeometry(deck(len,beam),{depth:th,bevelEnabled:!!bev,bevelThickness:bev||0,bevelSize:bev||0,bevelSegments:3,curveSegments:16});
    geo.rotateX(-Math.PI/2);const o=new THREE.Mesh(geo,m);o.position.y=y;g.add(o);return o};
  slab(L*.97,B*.92,.6,navy,-.55,.08);            // carène sombre sous la flottaison
  slab(L,B,1.0,white,.05,.12);                     // coque blanche
  slab(L*.99,B*.99,.08,navy,.62,0);               // bande sombre le long de la coque
  slab(L*.95,B*.9,.06,teak,1.17,0);               // pont en teck
  // bandeau lumineux cyan sous le liston, et feux de navigation
  [-1,1].forEach(s=>{box(L*.62,.05,.04,'#39e6ff',-L*.12,.42,s*(B/2+.02),g,true)});box(.12,.12,.12,'#ff3b4e',.5,1.4,-B/2+.1,g,true);box(.12,.12,.12,'#5dff9a',.5,1.4,B/2-.1,g,true);
  // superstructure moderne : volumes aux coins arrondis, avant galbé (pas de pointe), baies vitrées fumées tout autour,
  // toits débordants soulignés de LED, arceau radar en arc ; c'est un yacht de luxe, il brille la nuit
  const cabin=(len,beam,sw)=>{const s=new THREE.Shape(),h=beam/2,r=Math.min(.5,h*.4);s.moveTo(-len/2+r,-h);s.lineTo(len/2-sw,-h);s.quadraticCurveTo(len/2,-h*.85,len/2,-h*.25);
    s.lineTo(len/2,h*.25);s.quadraticCurveTo(len/2,h*.85,len/2-sw,h);s.lineTo(-len/2+r,h);s.quadraticCurveTo(-len/2,h,-len/2,h-r);s.lineTo(-len/2,-h+r);s.quadraticCurveTo(-len/2,-h,-len/2+r,-h);return s};
  const vol=(len,beam,sw,th,m,y,x,bev)=>{const geo=new THREE.ExtrudeGeometry(cabin(len,beam,sw),{depth:th,bevelEnabled:!!bev,bevelThickness:bev||0,bevelSize:bev||0,bevelSegments:3,curveSegments:14});
    geo.rotateX(-Math.PI/2);const o=new THREE.Mesh(geo,m);o.position.set(x,y,0);g.add(o);return o};
  const led=(len,beam,sw,y,x,c)=>{const pts=cabin(len,beam,sw).getSpacedPoints(60).map(p=>new THREE.Vector3(p.x+x,y,-p.y));const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),120,.025,5,true),mat(c,true));g.add(m);return m};
  const X1=-L*.1,X2=-L*.14;
  vol(L*.5,B*.8,1.6,.34,white,1.23,X1,.06);                 // pied du salon
  vol(L*.5,B*.8,1.6,.62,glass,1.57,X1,.04);                 // baie vitrée fumée qui fait le tour
  vol(L*.56,B*.88,1.9,.12,white,2.2,X1-.1,.05);             // toit débordant du salon
  led(L*.56+.1,B*.88+.1,1.9,2.26,X1-.1,'#eaf6ff');          // liseré de LED blanches sous le toit
  vol(L*.32,B*.62,1.3,.3,white,2.37,X2,.05);vol(L*.32,B*.62,1.3,.42,glass,2.67,X2,.03); // timonerie et ses vitres
  vol(L*.4,B*.74,1.6,.1,white,3.1,X2-.3,.05);led(L*.4+.1,B*.74+.1,1.6,3.15,X2-.3,'#39e6ff'); // hard-top et LED cyan
  // arceau radar en arc, incliné vers l'arrière
  const arch=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI;arch.push(new THREE.Vector3(-L*.24-Math.sin(a)*.5,3.2+Math.sin(a)*1.2,-Math.cos(a)*B*.34))}
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arch),40,.09,8,false),white));
  const rad=box(.9,.06,.16,'#222630',-L*.24-.5,4.5,0,g);box(.05,.4,.05,'#c8d0d8',-L*.24-.5,4.7,0,g);box(.1,.1,.1,'#fff2c0',-L*.24-.5,4.95,0,g,true); // radar, mât, feu de tête
  [-1,1].forEach(s=>{box(.14,.1,.1,'#ffffff',-L*.24-.2,4.0,s*.7,g,true);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffffff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));sp.scale.set(1.2,1.2,1);sp.position.set(-L*.24,4,s*.7);g.add(sp)}); // projecteurs de l'arceau
  // lumières de luxe : salon chaud, hublots dans la coque, spots sous-marins bleus, liseré rose au pont, éclairage du pont
  box(L*.46,.04,B*.7,'#ffd8a0',X1,2.15,0,g,true);
  [-1,1].forEach(s=>{for(let i=0;i<7;i++)box(.32,.12,.02,'#ffe2b0',-L*.32+i*1.25,.62,s*(B/2+.03),g,true); // hublots des cabines
    for(let i=0;i<5;i++){const u=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x3aa8ff,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));u.scale.set(1.8,1.1,1);u.position.set(-L*.4+i*2.6,-.1,s*(B/2+.15));g.add(u)} // spots sous-marins
    box(L*.8,.03,.03,'#ff4fa3',-L*.05,1.24,s*(B*.47),g,true)});
  for(let i=0;i<5;i++)box(.08,.02,.08,'#fff0d0',-L*.42+i*.5,1.22,0,g,true); // spots encastrés du pont arrière
  // plage avant : bains de soleil ; plage arrière : banquette, plateforme de bain, échelle
  [-1,1].forEach(s=>{box(1.6,.18,.8,'#e8ecf0',L*.22,1.32,s*.55,g);box(.5,.3,.8,'#e8ecf0',L*.22+.85,1.42,s*.55,g)});
  box(.6,.5,B*.7,'#e8ecf0',-L*.43,1.45,0,g);box(1.2,.12,B*.86,teak.color?'#9a6a3e':'#9a6a3e',-L/2-.5,.35,0,g); // banquette arrière, plateforme de bain
  // garde-corps en inox tout autour du pont
  const rail=[];for(let i=0;i<=14;i++){const u=i/14,x=-L/2+.3+u*(L*.85);const hw=x>L*.18?(B/2-.15)*(1-(x-L*.18)/(L*.33))*.98:B/2-.15;[-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.6,6),chrome);p.position.set(x,1.5,s*hw);g.add(p);rail.push([x,s*hw])})}
  [-1,1].forEach(s=>{const pts=[];for(let i=0;i<=14;i++){const u=i/14,x=-L/2+.3+u*(L*.85),hw=x>L*.18?(B/2-.15)*(1-(x-L*.18)/(L*.33))*.98:B/2-.15;pts.push(new THREE.Vector3(x,1.8,s*hw))}
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.03,6,false),chrome))});
  // nom sur la coque
  [-1,1].forEach(s=>{const t=signTexture('NEO-MOUETTE','#0c1824'),m=new THREE.Mesh(new THREE.PlaneGeometry(t.w*.03,t.h*.03),new THREE.MeshBasicMaterial({map:t.tex,transparent:true}));m.position.set(L*.12,.85,s*(B/2+.03));m.rotation.y=s>0?0:Math.PI;g.add(m)});
  // halo cyan sous la coque (le yacht est équipé de stabilisateurs à induction)
  const hal=new THREE.Mesh(new THREE.PlaneGeometry(L*1.1,B*1.8),new THREE.MeshBasicMaterial({map:glowTex,color:0x39e6ff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));hal.rotation.x=-Math.PI/2;hal.position.y=-.2;g.add(hal);
  const wake=new THREE.Mesh(new THREE.PlaneGeometry(L*1.3,B*1.6),new THREE.MeshBasicMaterial({map:glowTex,color:0xdff2ff,transparent:true,opacity:0,depthWrite:false}));wake.rotation.x=-Math.PI/2;wake.position.set(-L*.9,.03,0);g.add(wake);
  g.userData={radar:rad,wake,L,B};return g}

// ---- la marina : ponton, portique, kiosque, bollards, passagers qui attendent ----
function buildMarina(){
  const z0=MARINA.pz;
  for(let x=0;x<=9;x++)for(let z=68;z<=69;z++){solid[I(x,z)]=0;tile[I(x,z)]=4} // le ponton est praticable
  const wood=new THREE.MeshLambertMaterial({color:0x6a4a2e});
  for(let i=0;i<20;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.48,.08,1.9),wood);p.position.set(.0+i*.5,.1,z0);scene.add(p)}
  for(let x=0;x<=9;x+=1.5)[-1,1].forEach(s=>{box(.16,1.2,.16,'#3a2a1e',x,-.4,z0+s*.98);box(.06,.06,.06,'#7dffb0',x,.75,z0+s*.98,null,true)}); // pieux et balises
  [-1,1].forEach(s=>box(9.6,.04,.04,'#c8d0d8',4.8,.7,z0+s*.98)); // main courante
  box(1,.08,2.2,'#c8d0d8',-.6,.2,z0).rotation.z=-.35; // passerelle vers le yacht
  // portique d'entrée, sur le quai
  [-1,1].forEach(s=>box(.25,3.4,.25,'#20262e',10.1,1.7,z0+s*1.15));box(.3,.5,2.6,'#20262e',10.1,3.5,z0);
  sign('MARINA ZÉRO · NEO-MOUETTE','#7dffb0',10.25,3.5,z0,Math.PI/2,true,true,.04);
  // billetterie : un guichet ouvert sur le ponton (mur du fond, côtés, comptoir, auvent), éclairé, avec la guichetière derrière
  box(1.7,2.4,.1,'#20262e',11.8,1.2,64.95);[10.95,12.65].forEach(x=>box(.1,2.4,1.7,'#20262e',x,1.2,65.8)); // fond et côtés
  box(1.7,1.0,.14,'#2a3140',11.8,.5,66.6);box(1.9,.06,.42,'#c8d0d8',11.8,1.03,66.62); // comptoir et sa tablette inox
  box(2.0,.1,2.2,'#20262e',11.8,2.45,65.9);box(2.04,.05,.05,'#7dffb0',11.8,2.38,67.0,null,true); // auvent et liseré lumineux
  box(1.2,.03,.5,'#a89a80',11.8,2.38,65.3,null,true); // plafonnier (lumière douce, au fond)
  const kg=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xfff0d0,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false}));kg.scale.set(1.6,1.0,1);kg.position.set(11.8,2.3,65.3);scene.add(kg);
  const dc=document.createElement('canvas');dc.width=128;dc.height=64;const dg=dc.getContext('2d');dg.fillStyle='#04121a';dg.fillRect(0,0,128,64);dg.fillStyle='#7dffb0';dg.font='bold 11px monospace';
  ['NEO-MOUETTE','TOUR DE LA BAIE','DÉPART : À QUAI','TARIF : OFFERT'].forEach((l,i)=>dg.fillText(l,6,14+i*14));
  const ds=new THREE.Mesh(new THREE.PlaneGeometry(.9,.45),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(dc)}));ds.position.set(11.8,1.75,65.02);scene.add(ds); // écran des départs, au fond
  box(.3,.2,.25,'#15171c',12.3,1.15,66.55);box(.2,.12,.02,'#39e6ff',12.3,1.2,66.69,null,true); // terminal de paiement
  [-.4,.1].forEach((dx,i)=>box(.22,.02,.3,'#f0ead8',11.8+dx,1.07,66.5+i*.05)); // billets posés sur le comptoir
  sign('BILLETS','#7dffb0',11.8,2.75,67.0,0,false,true,.03);
  const agent=makeChar({...randomSpec(Math.random),coat:'#1e5a8a',hs:'cap'});agent.position.set(11.8,0,65.85);agent.userData.ry=0; // la guichetière, face au ponton
  [[11,65],[12,65],[11,66],[12,66]].forEach(([x,z])=>solid[I(x,z)]=1);
  [64.6,66.7,70.6].forEach(z=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,.45,10),mat('#2a2e36'));b.position.set(9.9,.22,z);scene.add(b);FURN.push([9.9,z,.2])}); // bollards
  // passagers qui attendent sur le ponton (ils montent avec toi)
  yachtPax=[[2.2,-.4],[3,.4],[3.8,-.2],[5.2,.3]].map(([x,dz],i)=>{const m=makeChar(randomSpec(Math.random));m.position.set(x,0,z0+dz);m.userData.ry=-Math.PI/2;return {m,home:{x,z:z0+dz},deck:[[-5.6,-1.2],[-5.6,1.2],[3.6,-.6],[4.6,.5]][i]}});
  yacht=yachtModel();yacht.position.set(MARINA.x,0,MARINA.z);yacht.rotation.y=Math.PI/2;scene.add(yacht);
  const cap=makeChar({...randomSpec(Math.random),coat:'#f0f0f0',hs:'cap'});yacht.userData.cap=cap; // le capitaine, au fly-bridge
  OBJECTS.push({id:'o_kiosk',x:11.8,z:67.2,r:1.2,label:'Parler à la guichetière',dyn:lines(['« Le Neo-Mouette fait le tour de la baie. Embarquement au bout du ponton, c’est offert par la Marina ce soir. »','« Le capitaine ? Ancien de la marine marchande. Il dit que la mer est le seul endroit sans caméras. »'])});
}
function yachtPath(){const x=MARINA.x,z=MARINA.z,P=[[x,z],[x-1,z-7],[-12,z-15],[-30,z-17],[-46,z-6],[-46,z+8],[-30,z+15],[-13,z+12],[x-1.5,z+7],[x,z]];
  return new THREE.CatmullRomCurve3(P.map(([a,b])=>new THREE.Vector3(a,0,b)),false,'catmullrom',.4)}
// à bord : positions sur le pont, dans le repère du yacht (avant = +x)
function onDeck(lx,lz,m,y){const a=yacht.rotation.y,c=Math.cos(a),s=Math.sin(a);m.position.set(yacht.position.x+lx*c+lz*s,(y||0)+yacht.position.y,yacht.position.z-lx*s+lz*c)}
function updateMarinaBoat(dt,h){
  const ud=yacht.userData;ud.radar.rotation.y+=dt*1.8;yacht.position.y=-.28+Math.sin(tAcc*.9)*.05;yacht.rotation.z=Math.sin(tAcc*.7)*(h.out?.02:.008); /* il tangue doucement */onDeck(-4.8,0,ud.cap,2.32);ud.cap.userData.ry=yacht.rotation.y+Math.PI/2;
  ud.wake.material.opacity=h.out?.25:0;
  yachtPax.forEach(p=>{if(h.out){onDeck(p.deck[0],p.deck[1],p.m,1.2);p.m.userData.ry=yacht.rotation.y+Math.PI/2+(p.deck[0]<0?Math.PI:0)*.5}else{p.m.position.set(p.home.x,0,p.home.z);p.m.userData.ry=-Math.PI/2}});
}

// ---- les mouettes : elles tournent au-dessus des quais, planent, battent des ailes ----
const gulls=[];
function buildGulls(){const wm=new THREE.MeshLambertMaterial({color:0xf0f2f4,side:THREE.DoubleSide}),bm=new THREE.MeshLambertMaterial({color:0xe8eaec}),tip=new THREE.MeshLambertMaterial({color:0x2a2e36,side:THREE.DoubleSide});
  for(let i=0;i<11;i++){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.42,.12,.12),bm);g.add(b);box(.1,.05,.05,'#ffb547',.25,0,0,g);
    const wing=s=>{const w=new THREE.Group();const p=new THREE.Mesh(new THREE.PlaneGeometry(.26,.5),wm);p.rotation.x=-Math.PI/2;p.position.z=s*.26;w.add(p);const t=new THREE.Mesh(new THREE.PlaneGeometry(.2,.18),tip);t.rotation.x=-Math.PI/2;t.position.set(-.03,0,s*.58);w.add(t);g.add(w);return w};
    const wl=wing(1),wr=wing(-1);scene.add(g);
    gulls.push({g,wl,wr,cx:-6+Math.random()*20,cz:12+Math.random()*58,r:3+Math.random()*8,y:4+Math.random()*7,sp:(.35+Math.random()*.4)*(i%2?1:-1),ph:Math.random()*6,fl:Math.random()*6})}}
function updateGulls(dt){gulls.forEach(q=>{const a=tAcc*q.sp+q.ph,x=q.cx+Math.cos(a)*q.r,z=q.cz+Math.sin(a)*q.r;q.g.position.set(x,q.y+Math.sin(tAcc*.7+q.ph)*.8,z);
  q.g.rotation.y=Math.atan2(-Math.cos(a)*Math.sign(q.sp),-Math.sin(a)*Math.sign(q.sp))+Math.PI/2;
  const glide=Math.sin(tAcc*.4+q.fl)>.3,f=glide?.12:Math.sin(tAcc*9+q.fl)*.7;q.wl.rotation.x=f;q.wr.rotation.x=-f});
  // un cri de temps en temps, quand on est sur les quais
  const p=player.position;if(!zoneOf()&&p.x<20&&AUD.ctx&&Math.random()<dt*.18)gullCry()}
function gullCry(){const c=AUD.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain(),pan=c.createStereoPanner();o.type='triangle';
  const f0=1400+Math.random()*500;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*.55,t+.35);o.frequency.setValueAtTime(f0*.95,t+.4);o.frequency.exponentialRampToValueAtTime(f0*.5,t+.7);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.025,t+.03);g.gain.linearRampToValueAtTime(.005,t+.36);g.gain.linearRampToValueAtTime(.02,t+.42);g.gain.linearRampToValueAtTime(0,t+.72);
  pan.pan.value=Math.random()*1.6-.8;o.connect(g);g.connect(pan);pan.connect(AUD.N.amb);o.start(t);o.stop(t+.75)}

// ---- le marché de nuit : il s'installe sur le quai à 20 h et se replie à 3 h ----
const NIGHT_MARKET={stalls:[],open:null};
const marketOpen=()=>{const h=S.hour||0;return h>=20||h<3};
function buildNightMarket(){
  const defs=[[39.5,'BROCHETTES · YAKITORI','#ffb547',true,['« Brochette de calamar ou de champignon ? Les deux sont à moitié synthétiques, mais la sauce est vraie. »','« Le marché de nuit ? On s’installe à vingt heures, on replie à trois. Les flics de Kurogane ne viennent jamais jusqu’au quai. »']],
    [46.5,'PIÈCES DÉTACHÉES','#39e6ff',false,['« Des puces de mémoire d’occasion. Certaines ont encore des souvenirs dedans. Pas les tiens, normalement. »','« Un écran de poignet, comme neuf. Il ne marche pas, mais il est comme neuf. »']],
    [53.5,'THÉ AUX BULLES NÉON','#ff4fa3',true,['« Thé au lait, perles de tapioca phosphorescentes. Ça brille dans le noir, et dans l’estomac aussi un peu. »','« Mira passe souvent prendre un thé ici, après minuit. Toujours le même : sans sucre, perles bleues. »']],
    [60.5,'FRIPERIE · VESTES LED','#b98cff',false,['« Une veste à LED, taille unique. Elle clignote quand tu as peur. Pratique, dans le quartier. »','« J’ai aussi des lunettes anti-reconnaissance faciale. Elles marchent une fois sur deux. Comme tout. »']]];
  defs.forEach(([z,name,c,food,talk])=>{const g=new THREE.Group();g.position.set(11.6,0,z);scene.add(g);
    // auvent rayé, poteaux, comptoir, marchandises, guirlande de lampions
    const cc=document.createElement('canvas');cc.width=64;cc.height=16;const x=cc.getContext('2d');for(let i=0;i<8;i++){x.fillStyle=i%2?c:'#f0ece4';x.fillRect(i*8,0,8,16)}
    const aw=new THREE.Mesh(new THREE.BoxGeometry(2.4,.08,3.4),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cc)}));aw.position.y=2.35;aw.rotation.z=.12;g.add(aw);
    [[-1,-1.6],[1,-1.6],[-1,1.6],[1,1.6]].forEach(([a,b])=>box(.07,2.35,.07,'#2a2e36',a*.95,1.17,b,g));
    box(.9,.9,3,'#3a3026',-.3,.45,0,g);box(1,.05,3.1,'#5a4632',-.3,.92,0,g);
    for(let i=0;i<7;i++)box(.2,.12+Math.random()*.15,.2,rpick(['#ff4fa3','#39e6ff','#ffb547','#7dffb0','#e8e2d0']),-.3+(Math.random()-.5)*.5,1.0,-1.2+i*.4,g,Math.random()<.5);
    for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),mat(rpick(['#ff4fa3','#ffb547','#39e6ff']),true));l.position.set(.95,2.1-Math.sin(i/5*Math.PI)*.25,-1.5+i*.6);g.add(l)}
    const lg=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:new THREE.Color(c),transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));lg.scale.set(3.4,3.4,1);lg.position.set(.4,1.6,0);g.add(lg);
    const sg=signTexture(name,c),sm=new THREE.Mesh(new THREE.PlaneGeometry(sg.w*.022,sg.h*.022),new THREE.MeshBasicMaterial({map:sg.tex,transparent:true}));sm.position.set(1.0,2.65,0);sm.rotation.y=Math.PI/2;g.add(sm);
    let steam=null;if(food){const n=24,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=-.3+(Math.random()-.5)*.4;pos[i*3+1]=1+Math.random()*1.2;pos[i*3+2]=(Math.random()-.5)*1.6}
      const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));steam=new THREE.Points(gg,new THREE.PointsMaterial({color:0xdde6ee,size:.22,transparent:true,opacity:.35,depthWrite:false}));g.add(steam)}
    const ven=makeChar(randomSpec(Math.random));ven.position.set(11.6-.95,0,z);ven.userData.ry=Math.PI/2;
    const cus=[0,1].map(k=>{const m=makeChar(randomSpec(Math.random));m.position.set(12.8,0,z-.7+k*1.4);m.userData.ry=-Math.PI/2;return m});
    const tiles=[];for(let tx=10;tx<=12;tx++)for(let tz=Math.floor(z-1.7);tz<=Math.floor(z+1.7);tz++)tiles.push([tx,tz]);
    NIGHT_MARKET.stalls.push({g,ven,cus,steam,tiles});
    OBJECTS.push({id:'o_nm'+z,x:13.0,z,get r(){return marketOpen()?1.3:0},label:'Marché de nuit · '+name.toLowerCase(),dyn:lines(talk)})});
}
function updateNightMarket(dt){const open=marketOpen()&&started;
  if(open!==NIGHT_MARKET.open){NIGHT_MARKET.open=open;if(open&&started)toast('Le marché de nuit s’installe sur le quai du port.','');
    NIGHT_MARKET.stalls.forEach(s=>{s.g.visible=open;s.ven.visible=open;s.cus.forEach(m=>m.visible=open);s.tiles.forEach(([x,z])=>solid[I(x,z)]=open?1:0)})}
  if(!open)return;NIGHT_MARKET.stalls.forEach(s=>{if(!s.steam)return;const p=s.steam.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)+dt*.5;if(y>2.4)y=1;p.setY(i,y)}p.needsUpdate=true})}



// ---- les vagues : une surface d'eau qui ondule sur le bassin et au large, avec des reflets ----
let waves=null;
function buildWaves(){const W0=-70,W1=9.55,Z0=-25,Z1=105,geo=new THREE.PlaneGeometry(W1-W0,Z1-Z0,44,66);geo.rotateX(-Math.PI/2);geo.translate((W0+W1)/2,0,(Z0+Z1)/2);
  const m=new THREE.MeshPhongMaterial({color:0x1a4a68,transparent:true,opacity:.5,shininess:140,specular:0xbfe6ff,flatShading:true,depthWrite:false});
  waves=new THREE.Mesh(geo,m);waves.renderOrder=1;scene.add(waves);waves.userData.base=Float32Array.from(geo.attributes.position.array)}
function updateWaves(){if(!waves)return;updateWaves.k=(updateWaves.k||0)+1;if(updateWaves.k%2)return; /* une image sur deux suffit */waves.visible=!zoneOf()||zoneOf()==='quai'||zoneOf()==='ile';if(!waves.visible)return;const p=waves.geometry.attributes.position,b=waves.userData.base,t=tAcc;
  for(let i=0;i<p.count;i++){const x=b[i*3],z=b[i*3+2],calm=Math.min(1,Math.max(.25,(9.6-x)/14)); // plus calme le long du quai
    p.array[i*3+1]=.04+calm*(.045*Math.sin(x*.33+t*1.3)+.03*Math.sin(z*.47-t*1.05)+.018*Math.sin((x+z)*.9+t*2.1))}p.needsUpdate=true}
