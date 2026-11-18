// Le port fluvial : l'entrepôt 7 des Docks Noirs, refait en grand.
// Un vrai hangar où l'on se promène : quai de chargement ouvert sur le fleuve (rideau métallique à moitié levé, butoirs, bandes de danger),
// rayonnages à palettes sur trois niveaux, conteneur maritime ouvert, pont roulant qui va et vient, lampes industrielles,
// bureau du contremaître, et un chariot élévateur détaillé (mât, fourches qui montent et descendent, gyrophare, « blue spot » au sol).
'use strict';

// ---- chariot élévateur : vers +x, roues au sol (y = 0) ; userData.carriage monte et descend, userData.beacon clignote ----
function forkliftModel(withLoad){
  const g=new THREE.Group();
  const P=(c,s,sp)=>new THREE.MeshPhongMaterial({color:c,shininess:s||40,specular:sp||0x333333});
  const yel=P(0xe8b320,70,0x665522),dark=P(0x23262c,30),grey=P(0x5a606a,60),chrome=P(0xb8c0c8,120,0xffffff),rub=P(0x111214,8),seatM=P(0x1a1b1f,20);
  const add=(geo,m,x,y,z,par)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(par||g).add(o);return o};
  const B=(w,h,d,m,x,y,z,par)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,par);
  // bandes de danger peintes sur le contrepoids
  const hc=document.createElement('canvas');hc.width=64;hc.height=16;const hg=hc.getContext('2d');hg.fillStyle='#e8b320';hg.fillRect(0,0,64,16);hg.fillStyle='#15171c';
  for(let i=-2;i<10;i++){hg.beginPath();hg.moveTo(i*8,16);hg.lineTo(i*8+4,16);hg.lineTo(i*8+12,0);hg.lineTo(i*8+8,0);hg.fill()}
  const haz=new THREE.MeshPhongMaterial({map:new THREE.CanvasTexture(hc),shininess:40});
  // châssis, contrepoids arrondi, capot moteur à ouïes
  B(1.5,.42,1.02,yel,.05,.42,0);
  B(.42,.78,1.06,yel,-.72,.62,0);
  const cw=add(new THREE.CylinderGeometry(.53,.53,.78,20,1,false,Math.PI,Math.PI),yel,-.93,.62,0);
  B(.06,.14,1.08,haz,-.93-.5,.36,0).rotation.y=0;
  B(.9,.28,.92,dark,-.3,.77,0);for(let i=0;i<6;i++)B(.5,.015,.03,grey,-.3,.92,-.3+i*.12);
  B(.25,.2,1.04,dark,.66,.56,0); // tablier avant
  // marchepied, siège, colonne de direction, volant
  B(.4,.05,.3,grey,.35,.24,.5);B(.4,.05,.3,grey,.35,.24,-.5);
  B(.42,.1,.46,seatM,-.32,1.0,0);const back=B(.08,.44,.46,seatM,-.53,1.24,0);back.rotation.z=-.12;
  const col=B(.06,.5,.06,dark,.24,1.05,0);col.rotation.z=.5;
  const wh=add(new THREE.TorusGeometry(.15,.022,8,20),dark,.15,1.28,0);wh.rotation.set(0,Math.PI/2,0);wh.rotateX(-.45);
  B(.1,.1,.1,dark,.12,1.18,.22); // levier hydraulique
  // arceau de protection : montants avant inclinés, toit à lattes
  [-1,1].forEach(z=>{const f=B(.06,1.3,.06,dark,.42,1.52,z*.45);f.rotation.z=-.12;B(.06,1.32,.06,dark,-.62,1.5,z*.45)});
  B(1.15,.05,.06,dark,-.1,2.16,.45);B(1.15,.05,.06,dark,-.1,2.16,-.45);for(let i=0;i<6;i++)B(.04,.04,.96,dark,-.6+i*.2,2.17,0);
  // roues : grosses à l'avant, petites et directrices à l'arrière
  const wheel=(x,z,r,wd)=>{const t=add(new THREE.CylinderGeometry(r,r,wd,20),rub,x,r,z);t.rotation.x=Math.PI/2;
    const rim=add(new THREE.CylinderGeometry(r*.55,r*.55,wd+.01,14),grey,x,r,z);rim.rotation.x=Math.PI/2;
    const hub=add(new THREE.CylinderGeometry(r*.2,r*.2,wd+.03,8),chrome,x,r,z);hub.rotation.x=Math.PI/2};
  wheel(.45,.44,.3,.24);wheel(.45,-.44,.3,.24);wheel(-.8,.4,.22,.18);wheel(-.8,-.4,.22,.18);
  // mât : montants extérieurs fixes, montants intérieurs, vérin chromé, chaînes
  [-1,1].forEach(z=>{B(.08,2.3,.1,dark,.86,1.27,z*.32);B(.06,2.2,.07,grey,.9,1.3,z*.24);
    for(let i=0;i<12;i++)B(.015,.06,.015,chrome,.93,.3+i*.17,z*.12)});
  B(.1,.1,.74,dark,.86,2.38,0);B(.1,.1,.74,dark,.86,.25,0);
  add(new THREE.CylinderGeometry(.05,.05,1.9,10),chrome,.82,1.15,0);
  // tablier porte-fourches : il monte et descend
  const car=new THREE.Group();car.position.set(.98,0,0);g.add(car);
  B(.06,.42,.86,dark,0,.38,0,car);for(let i=0;i<5;i++)B(.03,.7,.03,dark,0,.95,-.36+i*.18,car);B(.04,.04,.86,dark,0,1.3,0,car); // dosseret grillagé
  [-1,1].forEach(z=>{B(.05,.5,.12,grey,.03,.3,z*.25,car);B(1.1,.05,.12,grey,.58,.06,z*.25,car)});
  if(withLoad){ // palette en bois chargée de caisses filmées
    const pal=new THREE.Group();pal.position.set(.62,.09,0);car.add(pal);const wood=P(0x8a6a42,10);
    for(let i=0;i<5;i++)B(1.0,.03,.14,wood,0,.12,-.42+i*.21,pal);[-.42,0,.42].forEach(z=>B(1.0,.1,.12,wood,0,.05,z,pal));
    const wrap=new THREE.MeshPhongMaterial({color:0x9fc8d8,transparent:true,opacity:.35,shininess:120,specular:0xffffff});
    [[-.25,-.22,'#7a5a3a'],[.25,-.22,'#5a4630'],[-.25,.22,'#5a4630'],[.25,.22,'#7a5a3a']].forEach(([x,z,c])=>B(.48,.5,.42,P(new THREE.Color(c).getHex(),15),x,.4,z,pal));
    B(.48,.4,.42,P(0x2a6f7a,20),0,.85,-.2,pal);B(1.02,1.1,.96,wrap,0,.66,0,pal)}
  // feux : phares sur l'arceau, feux arrière, gyrophare orange, point bleu de sécurité projeté devant
  [-1,1].forEach(z=>{B(.06,.08,.1,mat('#fff2c0',true),.47,1.95,z*.45);B(.03,.06,.1,mat('#ff2a3a',true),-1.46,.8,z*.38)});
  const bc=add(new THREE.CylinderGeometry(.06,.07,.1,12),mat('#ff8a1f',true),-.5,2.25,0);
  const bs=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff8a1f,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));bs.scale.set(.6,.6,1);bs.position.set(-.5,2.27,0);g.add(bs);
  const spot=add(new THREE.PlaneGeometry(.9,.9),new THREE.MeshBasicMaterial({map:glowTex,color:0x3a7bff,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}),2.6,.02,0);spot.rotation.x=-Math.PI/2;
  g.userData={carriage:car,beacon:bs,beaconCore:bc};return g}

// ---- l'entrepôt ----
IN_DEF.port={w:22,d:15,h:6.5,trim:'#8fb7ff',light:[0xffd8a0,0x8fb7ff],fog:0x0c1218,
  floor:canvasMat(64,64,(g,W,H)=>{g.fillStyle='#3a3d42';g.fillRect(0,0,W,H);for(let i=0;i<140;i++){g.fillStyle=rpick(['#33363b','#41444a','#2e3135','#46494e']);g.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*4,1)}
    for(let i=0;i<5;i++){g.fillStyle='rgba(10,10,12,.18)';g.beginPath();g.arc(Math.random()*W,Math.random()*H,3+Math.random()*7,0,7);g.fill()} // taches d'huile
    g.fillStyle='#2b2e32';g.fillRect(0,63,W,1);g.fillRect(63,0,1,H)},11,7.5), // dalles de béton
  wall:null,
  build(R){const w=R.w,d=R.d,h=R.h,G=R.g;
    const P=(c,s)=>new THREE.MeshPhongMaterial({color:c,shininess:s||20});
    const add=(geo,m,x,y,z,par)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(par||G).add(o);return o};
    // marquages au sol : allées jaunes, zone hachurée devant le quai
    const line=(x,z,lx,lz,c)=>{const m=add(new THREE.PlaneGeometry(lx,lz),new THREE.MeshBasicMaterial({color:c||0xe8b320}),x,.012,z);m.rotation.x=-Math.PI/2};
    line(.5,-.15,15.5,.1);line(.5,1.75,15.5,.1);line(-1.2,6,.1,2.6,0x8fb7ff);line(1.2,6,.1,2.6,0x8fb7ff);
    for(let i=0;i<9;i++){const m=add(new THREE.PlaneGeometry(.18,1.6),new THREE.MeshBasicMaterial({color:i%2?0x15171c:0xe8b320}),-6.6+i*.6,.013,-6.3);m.rotation.set(-Math.PI/2,0,.6)}
    // ---- quai de chargement au nord : rideau à moitié levé, le fleuve de nuit derrière ----
    const rc=document.createElement('canvas');rc.width=256;rc.height=128;const rg=rc.getContext('2d');
    let gr=rg.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#0a1226');gr.addColorStop(.55,'#1a2a4a');gr.addColorStop(.56,'#0b1a2a');gr.addColorStop(1,'#050a12');rg.fillStyle=gr;rg.fillRect(0,0,256,128);
    for(let i=0;i<26;i++){const x=Math.random()*256,c=rpick(['#ff4fa3','#39e6ff','#ffb547','#ffffff']);rg.fillStyle=c;rg.fillRect(x,40+Math.random()*28,2,2);rg.globalAlpha=.35;rg.fillRect(x,74+Math.random()*40,2,6+Math.random()*10);rg.globalAlpha=1} // lumières de l'autre rive et leurs reflets
    rg.fillStyle='#0d1018';for(let i=0;i<9;i++){const bw=14+Math.random()*24,bh=10+Math.random()*30;rg.fillRect(i*30,70-bh,bw,bh)}
    rg.fillStyle='#202a36';rg.fillRect(0,110,256,18); // le bord du quai dehors
    const view=add(new THREE.PlaneGeometry(5,3.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(rc),fog:false}),-3.5,1.7,-d/2+.03);
    const shutter=c=>{const s=new THREE.Group();for(let i=0;i<16;i++)box(5.1,.14,.06,i%2?'#4a525e':'#59616d',0,i*.15,0,s);return s};
    const sh=shutter();sh.position.set(-3.5,2.3,-d/2+.08);G.add(sh); // le rideau ouvert laisse voir le fleuve en bas
    box(5.4,.25,.3,'#2a2e36',-3.5,4.55,-d/2+.15,G);[-1,1].forEach(s=>{box(.2,4.6,.3,'#2a2e36',-3.5+s*2.7,2.3,-d/2+.15,G);box(.25,.5,.35,'#111',-3.5+s*2.2,.5,-d/2+.2,G)}); // cadre et butoirs
    const sh2=shutter();sh2.position.set(5,.05,-d/2+.08);G.add(sh2);box(5.4,.25,.3,'#2a2e36',5,4.55,-d/2+.15,G);[-1,1].forEach(s=>box(.2,4.6,.3,'#2a2e36',5+s*2.7,2.3,-d/2+.15,G));
    box(.5,.8,.2,'#c83030',8.1,1.4,-d/2+.15,G);box(.3,.3,.05,'#ff3b3b',8.1,1.5,-d/2+.27,G,true); // boîtier de commande du rideau
    R.sign('QUAI 7 · CHARGEMENT','#ffb547',-3.5,5.1,-d/2+.1,0,.05);R.sign('QUAI 8','#8fb7ff',5,5.1,-d/2+.1,0,.05);
    R.block(-3.5,-d/2+.6,2.8,.5);R.block(5,-d/2+.4,2.8,.3);
    // ---- rayonnages à palettes le long du mur ouest, et une rangée double au centre ----
    const wood=P(0x8a6a42,8),crate=['#7a5a3a','#5a4630','#2a6f7a','#7a2e22','#3a5a3a','#6a6a72'];
    const pallet=(x,y,z,par,ry)=>{const p=new THREE.Group();p.position.set(x,y,z);p.rotation.y=ry||0;(par||G).add(p);
      for(let i=0;i<5;i++)add(new THREE.BoxGeometry(1.1,.03,.14),wood,0,.13,-.44+i*.22,p);[-.44,0,.44].forEach(zz=>add(new THREE.BoxGeometry(1.1,.1,.12),wood,0,.05,zz,p));
      const k=Math.random();if(k<.45){add(new THREE.BoxGeometry(1,.7+Math.random()*.4,.95),P(new THREE.Color(rpick(crate)).getHex()),0,.55,0,p)}
      else if(k<.75){for(let i=0;i<4;i++)add(new THREE.BoxGeometry(.48,.45,.44),P(new THREE.Color(rpick(crate)).getHex()),(i%2-.5)*.5,.38+Math.floor(i/2)*0,(i<2?-.23:.23),p);
        add(new THREE.BoxGeometry(1.04,.52,.98),new THREE.MeshPhongMaterial({color:0x9fc8d8,transparent:true,opacity:.3,shininess:120}),0,.4,0,p)}
      else{[-.25,.25].forEach(xx=>[-.23,.23].forEach(zz=>add(new THREE.CylinderGeometry(.21,.21,.75,14),P(rpick([0x2a4a8a,0x8a2a2a,0x2a6a4a])),xx,.52,zz,p)))} // fûts
      return p};
    const rack=(x,z,len,along)=>{const lv=[0,1.6,3.2],n=Math.round(len/1.4);
      for(let i=0;i<=n;i++){const a=-len/2+i*len/n;[-.55,.55].forEach(o=>box(.09,4.6,.09,'#2f5bd8',along?x+a:x+o,2.3,along?z+o:z+a,G))} // montants bleus
      lv.forEach((y,l)=>{if(l)[-.55,.55].forEach(o=>box(along?len:.12,.14,along?.12:len,'#e8702a',along?x:x+o,y,along?z+o:z+a0,G));
        for(let i=0;i<n;i++){const a=-len/2+(i+.5)*len/n;if(Math.random()<.85)pallet(along?x+a:x,y+.07,along?z:z+a,G,along?0:Math.PI/2)}});
      R.block(x,z,along?len/2:.6,along?.6:len/2)};
    const a0=0;
    rack(-w/2+.9,-1.4,10,false);rack(3.8,-3.1,9.8,true);
    // ---- conteneur maritime ouvert, au sud-est ----
    const cc=document.createElement('canvas');cc.width=128;cc.height=64;const cg=cc.getContext('2d');cg.fillStyle='#a8322a';cg.fillRect(0,0,128,64);
    for(let i=0;i<32;i++){cg.fillStyle=i%2?'#932a23':'#b8392f';cg.fillRect(i*4,0,2,64)}cg.fillStyle='#f0e6d8';cg.font='bold 13px monospace';cg.fillText('KRGN 208 961',8,20);cg.font='9px monospace';cg.fillText('MAX GROSS 30480 KG',8,34);
    cg.fillStyle='rgba(60,30,10,.35)';for(let i=0;i<12;i++)cg.fillRect(Math.random()*128,Math.random()*64,3+Math.random()*10,2); // rouille
    const ct=new THREE.CanvasTexture(cc),cm=new THREE.MeshPhongMaterial({map:ct,shininess:25}),cin=P(0x1a1410,5);
    const C=new THREE.Group();C.position.set(7,0,4.9);G.add(C);
    add(new THREE.BoxGeometry(6,.12,2.4),cin,0,.06,0,C);add(new THREE.BoxGeometry(6,.12,2.4),cm,0,2.54,0,C);
    [-1,1].forEach(s=>add(new THREE.BoxGeometry(6,2.6,.08),cm,0,1.3,s*1.16,C));add(new THREE.BoxGeometry(.08,2.6,2.4),cm,3,1.3,0,C);
    [-1,1].forEach(s=>{const door=add(new THREE.BoxGeometry(.06,2.5,1.15),cm,-3.0-.45,1.28,s*1.55,C);door.rotation.y=s*1.35; /* portes battantes ouvertes */
      [-.3,.3].forEach(dz=>add(new THREE.BoxGeometry(.04,2.3,.04),P(0x8a8f98,80),-3.04-.45,1.28,s*1.55+dz,C).rotation.y=s*1.1)});
    for(let i=0;i<3;i++)add(new THREE.BoxGeometry(.9,.8,.9),P(new THREE.Color(rpick(crate)).getHex()),1.8-i*1.1,.52,(i%2-.5)*.8,C);
    R.block(7,4.9,3.1,1.3);
    // la caisse noire marquée K, posée devant le conteneur
    R.S(1.1,1,1.1,'#141418',1.4,.5,4.2);R.B(.9,.5,.02,'#ff2e3e',1.4,.6,4.77,true);R.sign('K','#ff2e3e',1.4,.6,4.79,0,.06);
    // ---- bureau du contremaître, au sud-ouest : ouvert (muret à hauteur d'appui, sans vitre ni toit), quelqu'un y travaille ----
    const ox=-7.6,oz=5.2;
    R.S(4.6,1.1,.14,'#2a3140',ox,.55,oz-1.7);R.B(4.7,.06,.4,'#4a3a2a',ox,1.13,oz-1.7); // muret et sa tablette de comptoir
    [-2.3,2.3].forEach(dx=>R.B(.1,2.8,.1,'#3a4252',ox+dx,1.4,oz-1.7));R.B(4.7,.12,.12,'#3a4252',ox,2.8,oz-1.7); // poteaux et linteau (pas de carreau)
    R.S(.14,1.1,2.2,'#2a3140',ox+2.3,.55,oz+.6);R.sign('BUREAU · ENTREPÔT 7','#8fb7ff',ox,3.05,oz-1.72,Math.PI,.03);
    R.S(1.8,.08,.9,'#5a4632',ox-.3,.78,oz+.1);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>R.B(.05,.78,.05,'#2a2e36',ox-.3+a*.82,.39,oz+.1+b*.38)); // table de travail
    R.B(.04,.36,.5,'#14161c',ox-.3,1.06,oz+.48);R.screen(ox-.3,1.07,oz+.455,Math.PI,.48,.32,(g,W,H,t)=>{g.fillStyle='#03110c';g.fillRect(0,0,W,H);g.fillStyle='#7dffb0';g.font='9px monospace';
      ['ARRIVÉES QUAI 7','BARGE K-12  02:40','BARGE K-15  04:10','CONTENEUR KRGN','> INSPECTION…'].forEach((l,i)=>g.fillText(l,4,11+i*11));if(Math.floor(t*2)%2)g.fillRect(4+((t*20)%60),60,6,2)},96); // écran du planning
    R.B(.36,.02,.14,'#202228',ox-.25,.83,oz-.05); // clavier
    const lamp=box(.04,.4,.04,'#222',ox+.45,1.0,oz+.35,G);box(.22,.1,.14,'#2a2e36',ox+.42,1.2,oz+.3,G);box(.18,.03,.1,'#fff0c0',ox+.42,1.15,oz+.3,G,true); // lampe de bureau
    const lg=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffd8a0,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));lg.scale.set(1.2,1.2,1);lg.position.set(ox+.42,1.05,oz+.3);G.add(lg);
    box(.1,.12,.1,'#e8e2d0',ox-.85,.88,oz-.05,G);[0,1,2].forEach(i=>box(.24,.02,.32,'#f0ead8',ox+.15,.83+i*.02,oz-.1,G)); // tasse de café, pile de bons de livraison
    R.S(.5,.6,.5,'#2a2e36',ox-1.45,.3,oz+.1); // chaise
    R.S(.6,1.5,.5,'#5a606a',ox-2.0,.75,oz+1.3);for(let i=0;i<3;i++)R.B(.5,.04,.02,'#8a9098',ox-2.0,.4+i*.45,oz+1.04); // armoire à tiroirs
    R.B(.12,1.6,1.8,'#3a3026',ox-2.25,1.9,oz-.3);for(let l=0;l<3;l++)for(let k=0;k<6;k++)R.B(.1,.34,.06,pick(['#c83030','#2a5ad8','#e8b320','#3a8a4a','#e8e2d0']),ox-2.18,1.32+l*.55,oz-1.0+k*.12+(k>2?.5:0)); // étagère de classeurs
    R.B(1.2,.8,.03,'#6a4a2a',ox+.4,2.0,oz+1.62);[[-.3,.1,'#f0ead8'],[.05,-.12,'#ffd23f'],[.35,.15,'#f0ead8'],[-.1,-.2,'#9fd8ff']].forEach(([a,b,c])=>R.B(.22,.28,.01,c,ox+.4+a,2.0+b,oz+1.6)); // tableau de liège et ses papiers
    const clk=R.screen(ox-1.2,2.3,oz+1.62,Math.PI,.36,.36,(g,W,H,t)=>{g.fillStyle='#e8e2d0';g.beginPath();g.arc(W/2,H/2,W/2-1,0,7);g.fill();g.strokeStyle='#15171c';g.lineWidth=2;
      const hh=(S.hour||0)%12,mm=((S.hour||0)%1)*60;[[hh/12,.25],[mm/60,.38]].forEach(([u,L])=>{const a=u*Math.PI*2-Math.PI/2;g.beginPath();g.moveTo(W/2,H/2);g.lineTo(W/2+Math.cos(a)*W*L,H/2+Math.sin(a)*W*L);g.stroke()})},48); // horloge à l'heure du jeu
    const radio=box(.3,.16,.12,'#3a3026',ox+1.6,1.22,oz-1.7,G);box(.08,.08,.02,'#ffb547',ox+1.52,1.22,oz-1.77,G,true); // radio posée sur le comptoir
    const boss=R.who(ox-1.4,oz+.1,Math.PI/2,{...randomSpec(),coat:'#3a3f4c',hs:'cap'});boss.userData.sit=true;boss.position.y=IY+.12; // le contremaître, assis devant son écran
    R.anims.push({k:0,f:t=>{boss.userData.ry=Math.PI/2+Math.sin(t*.4)*.6}}); // il tourne la tête entre l'écran et l'entrepôt
    R.block(ox,oz+.4,2.4,1.5);
    // ---- stockage en vrac : fûts, palettes au sol, transpalette ----
    [[-3.6,-5.1],[-2.3,-5.1],[-3.0,-3.9]].forEach(([x,z])=>pallet(x,0,z,G));R.block(-3,-4.6,1.4,1.1);
    [[9.6,-1.2],[10,-.4],[9.4,-.2],[10.2,-1.4]].forEach(([x,z])=>add(new THREE.CylinderGeometry(.3,.3,.9,14),P(rpick([0x2a4a8a,0x8a2a2a,0x2a6a4a]),30),x,.45,z));R.block(9.8,-.8,.7,.8);
    const pj=new THREE.Group();pj.position.set(-1.8,0,-4.4);pj.rotation.y=.7;G.add(pj); // transpalette manuel
    box(.9,.06,.15,'#c83030',.3,.08,.2,pj);box(.9,.06,.15,'#c83030',.3,.08,-.2,pj);box(.25,.3,.55,'#c83030',-.25,.2,0,pj);const ha=box(.04,1,.04,'#222',-.38,.65,0,pj);ha.rotation.z=.35;
    // ---- pont roulant : deux rails sous le toit, une poutre qui va et vient, un crochet ----
    [-5.6,3].forEach(z=>{box(w-.4,.25,.25,'#e8b320',0,h-.5,z,G)});
    const br=new THREE.Group();G.add(br);box(.4,.45,9.2,'#e8b320',0,h-.75,-1.3,br);
    for(let i=0;i<8;i++)box(.42,.04,.04,'#15171c',0,h-.55,-5.3+i*1.15,br);
    const tr=new THREE.Group();br.add(tr);box(.7,.4,.6,'#3a3f48',0,h-1.15,0,tr);const cab=box(.02,2.2,.02,'#222',0,h-2.45,0,tr);
    box(.25,.15,.12,'#c83030',0,h-3.6,0,tr);const hook=new THREE.Mesh(new THREE.TorusGeometry(.12,.03,6,12,Math.PI*1.4),P(0x8a8f98,80));hook.position.set(0,h-3.8,0);tr.add(hook);
    R.anims.push({every:true,k:0,f:t=>{br.position.x=Math.sin(t*.12)*7.5;tr.position.z=-1.3+Math.sin(t*.21)*3}});
    // ---- lampes industrielles suspendues ----
    for(let i=0;i<4;i++)for(let j=0;j<2;j++){const x=-7.5+i*5,z=-3.2+j*5.4;box(.02,1.2,.02,'#222',x,h-.6,z,G);
      const sd=add(new THREE.CylinderGeometry(.12,.45,.32,16,1,true),P(0x2a2e36,40),x,h-1.35,z);sd.material.side=THREE.DoubleSide;
      box(.3,.05,.3,'#fff0d0',x,h-1.5,z,G,true);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffd8a0,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.set(1.6,1.6,1);s.position.set(x,h-1.55,z);G.add(s)}
    R.sign('DOCKS NOIRS · ENTREPÔT 7','#8fb7ff',0,h-.9,d/2-.1,Math.PI,.06);
    box(.8,1.2,.3,'#c83030',w/2-.25,1.2,-1,G);R.sign('EXTINCTEUR','#ff8a8a',w/2-.12,2.0,-1,-Math.PI/2,.025); // extincteur
    // ---- le chariot élévateur : il va chercher une palette au rayonnage, la soulève, recule et repart ----
    const fk=forkliftModel(true);fk.scale.setScalar(1.05);G.add(fk);const car=fk.userData.carriage;
    R.anims.push({every:true,k:0,f:t=>{const T=24,u=(t%T)/T,sm=x=>x*x*(3-2*x);let x,lift,dir;
      if(u<.35){x=-5.6+sm(u/.35)*11.2;lift=.12;dir=0}           // roule vers l'est, fourches basses
      else if(u<.5){x=5.6;lift=.12+sm((u-.35)/.15)*1.5;dir=0}    // lève la palette
      else if(u<.85){x=5.6-sm((u-.5)/.35)*11.2;lift=1.62-sm((u-.5)/.35)*1.5;dir=1} // recule vers l'ouest en redescendant
      else{x=-5.6;lift=.12;dir=1}
      fk.position.set(x,0,.8);fk.rotation.y=0;car.position.y=lift;
      const on=Math.floor(t*3)%2;fk.userData.beacon.material.opacity=on?.95:.25;fk.userData.beaconCore.material=mat(on?'#ffb05a':'#7a3a10',true)}});
    R.block(0,.8,7.4,1.1); // l'allée du chariot est interdite
    // ---- les gens du dock ----
    R.who(-4.6,-3.6,Math.PI*.8,{...randomSpec(),top:'#ff8a3d',hs:'cap'});R.who(3.2,2.6,-Math.PI/2,{...randomSpec(),top:'#ff8a3d'});R.who(ox+1.2,oz-2.4,0,{...randomSpec(),coat:'#3a3f4c'});
    R.who(8.4,-5.3,Math.PI,{...randomSpec(),top:'#e8b320',hs:'cap'});
    R.obj(1.4,3.4,1.3,'Examiner la caisse noire',()=>'Une caisse noire, sans étiquette de douane. Juste une lettre rouge peinte au pochoir : K. Le cadenas est neuf. Elle vient du conteneur KRGN… Kurogane.');
    R.obj(-4.6,-3.0,1.2,'Parler au docker',lines(['« On décharge, on ne pose pas de questions. Les barges de nuit, surtout, on ne pose pas de questions. »','« Le chariot ? Il roule tout seul depuis la mise à jour. Reste derrière les lignes jaunes. »']));
    R.obj(ox+1.2,oz-3,1.2,'Parler au contremaître',lines(['« Entrepôt 7. Si tu cherches du travail, reviens demain à l’aube. Si tu cherches autre chose, ne reviens pas. »','« Les registres de 2086 ? Brûlés. Une fuite de gaz, officiellement. »']));
    R.obj(-3.5,-6.4,1.4,'Regarder le fleuve',()=>'Par le rideau à moitié levé, le fleuve noir. Une barge sans feux glisse vers le quai 9. Sur l’autre rive, les néons de Rouillebourg tremblent dans l’eau.');
    R.obj(3.3,3.4,1.3,'Regarder dans le conteneur',()=>'Le conteneur KRGN 208 961 est presque vide. Quelques caisses, de la paille, et l’odeur du sel. Sur la porte, un tampon : « Inspecté · Kurogane Sécurité ».');
  }};

// ---- dehors : un chariot garé au nord du hangar, à côté d'une pile de palettes (entre le quai et les promeneurs) ----
(function portYard(){
  const fk=forkliftModel(false);fk.position.set(11.7,0,13.4);fk.rotation.y=Math.PI/2;scene.add(fk); // il regarde vers le nord
  fk.userData.beacon.material.opacity=.15;fk.userData.carriage.position.y=.12;
  const wood=new THREE.MeshLambertMaterial({color:0x7a5c3a});
  for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(1.1,.14,1.1),wood);p.position.set(10.5,.07+i*.15,14.6);p.rotation.y=(i%2)*.06;scene.add(p)}
  box(.9,.8,.9,'#5a4630',10.5,1.2,14.6);
  [[11,11],[12,11],[11,12],[11,13],[11,14],[12,12],[12,13],[12,14],[10,14]].forEach(([x,z])=>solid[I(x,z)]=1); // on ne traverse pas le chariot
})();
