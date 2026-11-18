// L'île de Néo-Récif, développée : le bunker K-SITE 0 (porte à code, intérieur), le bar du Récif sur une passerelle,
// le ferrailleur, des habitants à qui parler, et des lumières qui se voient depuis la ville.
// Le code de la porte est 208 961 : le numéro du conteneur rouge KRGN de l'entrepôt 7, au port de la ville.
'use strict';

// ---- K-SITE 0 : le bunker de Kurogane, sous la colline ----
IN_NAMES.ksite='K-SITE 0 · bunker de Kurogane';
const KS_DOOR=()=>({x:ISLE.bunker.x+2.1,z:ISLE.bunker.z,ry:Math.PI/2}); // on ressort en haut de l'escalier enterré
IN_DEF.ksite={w:14,d:10,h:3.6,trim:'#ff2a3a',light:[0xff3040,0x39e6ff],fog:0x0a0608,entries:[],exitZone:'ile',get exit(){return KS_DOOR()},
  floor:canvasMat(32,32,(g,W,H)=>{g.fillStyle='#2a2c30';g.fillRect(0,0,W,H);g.fillStyle='#232528';g.fillRect(0,0,W,1);g.fillRect(0,0,1,H);for(let i=0;i<20;i++){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(Math.random()*W,Math.random()*H,2,1)}},7,5),
  wall:null,
  build(R){const w=R.w,d=R.d;
    // baies de serveurs qui clignotent, le long des murs
    for(let i=0;i<5;i++)[-1,1].forEach(s=>{const x=-w/2+1.6+i*2.6,z=s*(d/2-.7);if(Math.abs(x)<1.5)return; /* ni devant l’écran ni devant la porte */R.S(1.1,2.4,.7,'#15171c',x,1.2,z);
      const leds=[];for(let k=0;k<6;k++)leds.push(R.B(.8,.03,.02,k%2?'#39e6ff':'#ff2a3a',x,.5+k*.33,z-s*.36,true));R.anims.push({k:0,f:t=>leds.forEach((l,k)=>l.visible=Math.sin(t*7+k*1.7+i)>-.3)})});
    // le fauteuil du protocole Léthé : sangles, casque, bras articulé
    R.S(.9,.5,1.6,'#3a3c42',-3,.45,-.2);R.B(.9,.8,.15,'#3a3c42',-3,1.1,-.95);R.B(.7,.08,.4,'#c83030',-3,.74,.2);R.B(.7,.08,.3,'#c83030',-3,.74,-.5);
    R.B(.06,1.6,.06,'#8a8f98',-2.2,1.6,-1.1);R.B(.9,.06,.06,'#8a8f98',-2.6,2.4,-1.1);
    const helm=new THREE.Mesh(new THREE.SphereGeometry(.28,14,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhongMaterial({color:0xc8d0d8,shininess:120}));helm.position.set(-3,1.85,-.95);helm.rotation.x=Math.PI;R.g.add(helm);
    // le caisson cryogénique, vide, marqué de ton numéro
    const pod=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,2.2,20,1,true),new THREE.MeshPhongMaterial({color:0x9fd8ff,transparent:true,opacity:.25,shininess:140,side:THREE.DoubleSide,depthWrite:false}));pod.position.set(3.4,1.2,-1.6);R.g.add(pod);
    R.S(1.5,.2,1.5,'#2a2e36',3.4,.1,-1.6);R.B(1.5,.2,1.5,'#2a2e36',3.4,2.35,-1.6);R.B(.4,.12,.02,'#39e6ff',3.4,.6,-.92,true);R.sign('SUJET 0447','#39e6ff',3.4,2.7,-.86,0,.03);
    const mist=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x9fe8ff,transparent:true,opacity:.3,depthWrite:false}));mist.scale.set(1.4,2,1);mist.position.set(3.4,1,-1.6);R.g.add(mist);
    R.anims.push({k:0,f:t=>{mist.material.opacity=.2+Math.sin(t*1.3)*.08}});
    // le grand écran : le registre des sujets, qui défile
    R.screen(0,1.9,-d/2+.08,0,4.2,1.8,(g,W,H,t)=>{g.fillStyle='#08020a';g.fillRect(0,0,W,H);g.font='bold 10px monospace';g.fillStyle='#ff3b4e';g.fillText('PROTOCOLE LÉTHÉ · REGISTRE DES SUJETS',6,13);
      const L=['0412 · M. ADJANI · 730 j · RÉINSÉRÉ','0429 · K. VOSS · 1460 j · DÉCÉDÉ','0436 · L. « NÉON » · REFUSÉ','0441 · DR E. VEX · PERSONNEL','0447 · [ TOI ] · 1095 j · ÉVADÉ','0452 · R. KADE · EN ATTENTE','0458 · ███████ · EN COURS'];
      for(let i=0;i<6;i++){const k=(Math.floor(t*.7)+i)%L.length;g.fillStyle=L[k].includes('TOI')?'#ffd23f':'#c8b0b4';g.fillText(L[k],8,30+i*13)}},200);
    // le casier du gardien
    R.S(.7,1.9,.5,'#3a3026',w/2-1,.95,1.2);R.B(.05,.4,.02,'#ffb547',w/2-1.36,1.2,1.2,true);
    R.sign('K-SITE 0','#ff2a3a',0,3.2,d/2-.08,Math.PI,.05);
    R.obj(0,-d/2+1.4,1.6,'Lire le registre',lines(['« Sujet 0447. Effacement : 1 095 jours. Motif : témoin. Statut : ÉVADÉ. » Évadé. Tu t’es enfui d’ici.','« Sujet 0452 · R. Kade · en attente. » Kade… comme Mira Kade.','« 0441 · Dr E. Vex · personnel. » La co-conceptrice de Léthé a travaillé ici.']));
    R.obj(-3,.7,1.4,'Examiner le fauteuil',()=>'Les sangles sont usées à l’endroit des poignets. Sur l’accoudoir, gravées à l’ongle, quatre lettres : MOTH. Quelqu’un pensait à Mira, assis ici.');
    R.obj(3.4,-.6,1.3,'Examiner le caisson',()=>'Le caisson est vide et froid. Sur la vitre, de l’intérieur, une trace de main. La tienne, sans doute. Tu as dormi ici combien de temps ?');
    R.obj(w/2-1.8,1.2,1.2,'Ouvrir le casier',()=>{if(S.flags.ksiteLoot)return 'Le casier est vide. Tu as déjà tout pris.';S.flags.ksiteLoot=true;earn(60,'casier du gardien');addItem('fragment');
      if(typeof phoneMsg==='function')phoneMsg('neura','Fragment Léthé récupéré. Il contient une date : celle de ton effacement. Garde-le précieusement.');
      return 'Dans le casier : une liasse d’eddies oubliée par un gardien, et une puce rouge marquée « LÉTHÉ · 0447 ». La tienne. Tu la ranges dans ton sac.'});
  }};

// ---- le clavier de la porte blindée ----
let kpOpen=false,kpCode='';
function openKeypad(){kpOpen=true;kpCode='';overlayOpen=true;target=null;$('keypad').hidden=false;drawKeypad()}
function closeKeypad(){kpOpen=false;$('keypad').hidden=true;overlayOpen=false}
function drawKeypad(msg){$('kpScreen').textContent=(kpCode+'······').slice(0,6).replace(/(...)/,'$1 ');$('kpMsg').textContent=msg||'Six chiffres. Un numéro qui voyage dans des boîtes rouges.'}
function kpPress(k){if(k==='del'){kpCode=kpCode.slice(0,-1);return drawKeypad()}
  if(k==='ok'){if(kpCode==='208961'){S.flags.ksite=true;save();closeKeypad();toast('Accès autorisé · K-SITE 0','mem');setTimeout(()=>enterRoom('ksite',{spawn:[0,3.6],ry:Math.PI}),300)}else{kpCode='';drawKeypad('ACCÈS REFUSÉ. Le clavier bipe trois fois.')}return}
  if(kpCode.length<6){kpCode+=k;drawKeypad()}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-kp]');if(b)kpPress(b.dataset.kp);if(e.target.id==='kpClose')closeKeypad()});
addEventListener('keydown',e=>{if(!kpOpen)return;e.preventDefault();e.stopImmediatePropagation();const m=e.code.match(/^(?:Digit|Numpad)(\d)$/);
  if(m)kpPress(m[1]);else if(e.code==='Backspace')kpPress('del');else if(e.code==='Enter'||e.code==='NumpadEnter')kpPress('ok');else if(e.code==='Escape')closeKeypad()},true);

// ---- habitants, bar du Récif, ferrailleur (chacun à un niveau : on ne parle pas à travers une passerelle) ----
const atLvl=(lvl,r)=>Math.abs(ISLE.level-lvl)<.5?r:0;
function developIsland(){const X=ISLE.x,Z=ISLE.z;
  ITEMS.fragment={n:'Fragment Léthé',ic:'🔴',k:'obj',d:'Une puce rouge marquée « LÉTHÉ · 0447 ». Ta mémoire est quelque part là-dedans.'};
  ITEMS.recif={n:'Récif bleu',ic:'🍹',k:'drink',p:9,d:'Le cocktail de l’île : rhum de synthèse et algues lumineuses.'};
  ITEMS.algues={n:'Bol d’algues grillées',ic:'🥗',k:'food',p:6,d:'Croustillant et salé. Ça sent la mer.'};
  SHOP_DEFS.recif={title:'Le Récif · bar de la passerelle',buy:['recif','algues','cola']};SHOP_DEFS.ferraille={title:'Le ferrailleur de Néo-Récif',buy:['lunettes'],sells:true};
  const T0={x:X-9,z:Z-7},T3={x:X+8,z:Z+7};
  // le bar du Récif, sur la terrasse de la tour nord-ouest
  const bx=T0.x+4.9,bz=T0.z-3.5;box(.6,1,2,'#3a2a3a',bx,LA+.5,bz);box(.8,.06,2.2,'#ff4fa3',bx,LA+1.03,bz,null,true);box(1.6,.08,2.4,'#20262e',bx-.3,LA+2.4,bz);
  sign('LE RÉCIF','#ff4fa3',bx+.1,LA+2.7,bz,Math.PI/2,true,true,.035);
  const barman=makeChar(randomSpec(Math.random));barman.position.set(bx-.5,LA,bz);barman.userData.ry=Math.PI/2;ZONES.ile.blocks.push([bx,bz,.35,1.05]);
  OBJECTS.push({id:'o_isle_bar',x:bx+.9,z:bz,zone:'ile',get r(){return atLvl(LA,1.3)},label:'Le Récif · commander',act:()=>{SHOP_DEFS.recif.hello=lines(['« Bienvenue sur la passerelle. Ici, on boit au-dessus du vide, c’est meilleur. »','« Kurogane ? Pas sur l’île. Ils ont essayé, une fois. Le Récif s’en souvient. »','« Le code du vieux bunker ? Demande au ferrailleur. Il dit que les nombres voyagent dans des boîtes rouges. »']);openShop(SHOP_DEFS.recif)}});
  // le ferrailleur, sur la place, au pied de la tour sud-est
  const fx=T3.x-4.2,fz=T3.z-2;box(1.6,.9,.8,'#4a3a2a',fx,GROUND+.45,fz);for(let i=0;i<5;i++)box(.25,.2,.25,rpick(['#8a8f98','#39e6ff','#c83030','#ffb547']),fx-.6+i*.3,GROUND+1,fz,null,i%2===0);
  const fer=makeChar({...randomSpec(Math.random),coat:'#5a4a3a',hs:'cap'});fer.position.set(fx,GROUND,fz-.7);fer.userData.ry=0;ZONES.ile.blocks.push([fx,fz,.85,.45]);
  OBJECTS.push({id:'o_isle_fer',x:fx,z:fz+.9,zone:'ile',get r(){return atLvl(GROUND,1.3)},label:'Le ferrailleur · vendre, acheter',act:()=>{SHOP_DEFS.ferraille.hello=lines(['« Tout ce qui vient de la ville, je le rachète. Ici, rien ne se jette. »','« Le bunker sous la colline ? Six chiffres. Les gens de Kurogane les recopiaient sur leurs conteneurs, ces idiots. Des conteneurs rouges, KRGN quelque chose. »','« Tu cherches un code ? Va voir ce qu’ils ont débarqué dans l’entrepôt 7, au port de ta ville. »']);openShop(SHOP_DEFS.ferraille)}});
  // des habitants à qui parler, au sol et sur les passerelles
  [[X+4,Z-1,GROUND,'Parler à la pêcheuse',['« Néo-Récif, c’est une ville libre. On a construit les passerelles nous-mêmes, avec la ferraille des barges. »','« La nuit, on voit les néons de la Zone Zéro, là-bas. D’ici, on dirait presque que c’est joli. »']],
   [X-4,Z+1.5,GROUND,'Parler au gamin',['« T’es venu avec le yacht ? Moi je l’ai jamais pris. Je monte juste sur les passerelles et je compte les bateaux. »','« Le bunker ? Ma mère dit qu’il faut pas y aller. Moi je dis qu’il y a un trésor dedans. »']],
   [X+15,Z+2,GROUND,'Parler au gardien du ponton',['« Le Neo-Mouette fait la navette quand tu veux. Le capitaine ne pose pas de questions. »','« Les barges sans feux passent au large toutes les nuits. Elles vont vers le quai 9 de ta ville. »']],
   [X-11.5,Z-11.4,LA,'Parler au guetteur',['« D’ici, je vois tout le large. Si une vedette de Kurogane approche, je sonne la cloche. »','« Tu vois la colline ? Il y a eu de la lumière dans le bunker, la semaine dernière. Personne n’en parle. »']],
   [X+8,Z+.5,LA,'Parler à la peintre',['« Je peins les passerelles en néon. Rose pour l’aube, cyan pour la nuit. »','« Tu veux un conseil ? Monte sur la passerelle haute au coucher du soleil. »']],
   [X+7.4,Z-1,LB,'Parler à l’ancien',['« J’ai travaillé pour Kurogane, avant. Au K-SITE. On effaçait des gens. Je n’en suis pas fier. »','« Le sujet 0447… il s’est enfui une nuit de tempête. On ne l’a jamais retrouvé. » Il te regarde un peu trop longtemps.']]].forEach(([x,z,lv,lab,talk],i)=>{
    OBJECTS.push({id:'o_isle_npc'+i,x,z:z+.8,zone:'ile',get r(){return atLvl(lv,1.2)},label:lab,dyn:lines(talk)})});
  // la porte du bunker : le clavier, puis l'entrée
  const door=OBJECTS.find(o=>o.id==='o_isle_bunker');if(door){delete door.dyn;Object.defineProperty(door,'label',{configurable:true,get(){return S.flags.ksite?'Entrer dans le K-SITE 0':'Descendre · taper le code de la porte'}});
    door.act=()=>{if(S.flags.ksite)enterRoom('ksite',{spawn:[0,3.6],ry:Math.PI});else openKeypad()}}
  // ---- l'île se voit de loin : feux au sommet des tours, halo violet, hologramme géant ----
  [[X-9,Z-7,24,0xff4fa3],[X+8,Z-7,32,0x39e6ff],[X-9,Z+7,20,0xb98cff],[X+8,Z+7,28,0xffb547]].forEach(([x,z,h,c])=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:c,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
    s.scale.set(5,5,1);s.position.set(x,GROUND+h+1.5,z);s.userData.noLod=true;scene.add(s)});
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x6a4aff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));halo.scale.set(70,30,1);halo.position.set(X,18,Z);halo.userData.noLod=true;scene.add(halo);
  const holoS=signTexture('NÉO-RÉCIF','#39e6ff'),hs=new THREE.Mesh(new THREE.PlaneGeometry(holoS.w*.12,holoS.h*.12),new THREE.MeshBasicMaterial({map:holoS.tex,transparent:true,fog:false,side:THREE.DoubleSide,depthWrite:false}));
  hs.position.set(X+8,GROUND+38,Z-7);hs.rotation.y=Math.PI/2;hs.userData.noLod=true;scene.add(hs);ISLE.holoSign=hs}

// ---- la mini-carte, quand on est sur l'île : le plan de Néo-Récif ----
function drawIsleMinimap(g,R){const X=ISLE.x,Z=ISLE.z,k=2.6,p=player.position,px=x=>R+(x-p.x)*k,pz=z=>R+(z-p.z)*k;
  g.fillStyle='#0a1a2a';g.fillRect(0,0,2*R,2*R);g.fillStyle='#3a3e46';g.fillRect(px(X-23),pz(Z-16),46*k,32*k);g.fillStyle='#2c3a30';g.beginPath();g.ellipse(px(X-17),pz(Z),7*k,8*k,0,0,7);g.fill();
  g.fillStyle='#6a4a2e';g.fillRect(px(X+22),pz(ISLE.pier.z-1.2),(ISLE.pier.x+1.2-X-22)*k,2.4*k);
  [[-9,-7,6,6,'#ff4fa3'],[8,-7,7,6,'#39e6ff'],[-9,7,6,7,'#b98cff'],[8,7,6,6,'#ffb547']].forEach(([a,b,w,d,c])=>{g.fillStyle=c;g.fillRect(px(X+a-w/2),pz(Z+b-d/2),w*k,d*k)});
  g.strokeStyle='rgba(57,230,255,.7)';g.lineWidth=2;g.strokeRect(px(X-9),pz(Z-7),17*k,14*k); // la boucle des passerelles
  g.fillStyle='#ff2a3a';g.fillRect(px(X-12.5)-3,pz(Z+4.2)-3,6,6); // le bunker
  if(yacht){g.fillStyle='#f0f4ff';g.fillRect(px(yacht.position.x)-5,pz(yacht.position.z)-2,10,4)}
  g.save();g.translate(R,R);g.rotate(-(player.userData.ry||0)+Math.PI);g.fillStyle='#39e6ff';g.beginPath();g.moveTo(0,-6);g.lineTo(5,5);g.lineTo(-5,5);g.closePath();g.fill();g.restore()}
