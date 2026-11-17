// Personnages, objets à examiner, passants, voitures et marqueurs des étapes.
'use strict';

/* ===================== ENTITÉS ===================== */
let player, npcs=[], flyers=[], statics=[], walkers=[];
const NPC_DEF=[
  {id:'mira',x:6.5+HX,z:7.3+HZ,ry:Math.PI},
  {id:'vasko',x:GX+GHW+1.3,z:(GZ0+GZ1)/2,ry:-Math.PI/2},
  {id:'doc',x:STALLS[7][0],z:STALLS[7][1]+1.5,ry:0},
  {id:'okoro',...FP('laundry',1.3,0),ry:0},
  {id:'lou',...FP('club',1.4,0),ry:-Math.PI/2}];
const OBJECTS=[
  {id:'o_terminal',x:9.5,z:3.7,r:1.3,label:'Examiner le terminal'},
  {id:'o_bed',x:4,z:4.3,r:1.4,label:'Examiner le lit'},
  {id:'o_poster',x:8.7,z:3.2,r:1.1,label:'Regarder l’affiche'},
  {id:'o_board',x:6.7,z:3.3,r:1.4,label:'Consulter le tableau d’enquête',dyn:()=>{
    if(!S.frags.length)return 'Un tableau de liège. Des punaises, une ficelle rouge, et au centre une photo de toi, floue. Tu as dû t’en servir, avant. Pour enquêter sur qui ?';
    const L={contrat:'Contrat Kurogane (Vasko, Gare Zéro)',implant:'Cicatrice d’implant (Doc Ferrant, Bazar Néon)',dossier:'Dossier classé (Sergent Okoro, Laverie 24/7)'};
    return 'Tu as épinglé ce que tu sais. '+S.frags.map(f=>L[f]).join(' · ')+'. La ficelle rouge relie tout à ta photo.'+(S.frags.length>=3?' Un nom revient partout : Kurogane.':' Il reste des punaises vides.')}},
  {id:'o_photo',x:5.6,z:3.6,r:1.1,label:'Regarder la photo',dyn:()=>S.met.mira
    ?'Toi et Mira, sur un toit de la Zone Zéro, sous la pluie. Au dos : « Juin 2087 ». Tu n’as aucun souvenir de ce jour-là. Elle, si.'
    :'Toi et une femme aux cheveux noirs, sur un toit, sous la pluie. Au dos : « Juin 2087 ». Une année que tu as perdue.'},
  {id:'o_wardrobe',x:3.9,z:6.5,r:1.2,label:'Ouvrir la penderie',dyn:()=>S.frags.includes('implant')
    ?'Dans le miroir de la penderie, tu tournes la tête. La cicatrice derrière ton oreille. « Retiré proprement », a dit le Doc.'
    :'Dans le miroir de la penderie, un visage plus maigre que dans ton souvenir. Derrière ton oreille, une cicatrice que tu ne connais pas.'},
  {id:'o_sofa',x:3.9,z:8,r:1.1,label:'Examiner le canapé',dyn:()=>'Une couverture pliée, un oreiller creusé. Quelqu’un a dormi ici pendant que tu étais inconscient.'+(S.met.mira?' Mira, sans doute.':'')},
  {id:'o_kitchen',x:10,z:5,r:1.2,label:'Écouter la radio',dyn:()=>'La radio grésille. « …ce soir au Club Ondes, Lou Néon aux platines. Et rappel de Kurogane Sécurité : tout rassemblement après minuit en Zone Zéro sera dispersé. »'},
  {id:'o_fridge',x:10,z:6.5,r:1.1,label:'Ouvrir le frigo',dyn:()=>'Presque vide. Une boîte de nouilles, une canette d’Ondes Cola, et une barquette de frites froides datée d’avant-hier. Mira fait les courses, apparemment.'},
  {id:'o_safe',x:10,z:7.5,r:1.1,label:'Examiner le coffre',dyn:()=>'Un coffre-fort mural. Code à quatre chiffres. Tu poses les doigts sur le clavier… et rien ne vient. Ce que tu y as caché, tu l’as caché aussi à toi-même.'},
  {id:'o_cat',x:4,z:5.6,r:1.3,label:'Caresser le chat',dyn:()=>{const first=!S.flags.cat;S.flags.cat=true;save();
    return first?'Un chat gris roulé en boule au pied du lit. Il ouvre un œil, te reconnaît visiblement, et se met à ronronner. Lui n’a rien oublié.'
      :'Le chat ronronne. '+(S.met.mira?'Mira l’appelle Frite. Tu ne sais pas qui a choisi ce nom.':'Il n’a pas de collier. Juste une habitude : toi.')}},
  {id:'o_moto',x:10,z:10.5,r:1.6,label:'Examiner la moto'},
  {id:'o_bar',...FP('bar',1.3,0),r:1.2,label:'Regarder · Le Néon Noir',dyn:()=>AMB.bar},
  {id:'o_roofs',...FP('roofs',1.3,1.8),r:1.3,label:'Regarder · Toits de Zone Zéro',dyn:()=>AMB.roofs+' Tout en haut, l’hologramme de Lou « Néon » tourne lentement : ce soir, elle joue au club Ondes.'},
  {id:'o_market',...FP('market',1.2,3),r:1.3,label:'Regarder · Bazar Néon',dyn:()=>AMB.market},
  {id:'o_laundry',...FP('laundry',1.3,-2.4),r:1.2,label:'Regarder · Laverie 24/7',dyn:()=>AMB.laundry},
  {id:'o_lab',...FP('lab',1.3,-2),r:1.3,label:'Regarder · Parking-labo',dyn:()=>AMB.lab+(S.flags.chapter2?' Une plaque sur la porte : « Dr E. Vex ». C’est ici que commencera le chapitre 3.':' La porte est verrouillée.')},
  {id:'o_club',...FP('club',1.3,2.4),r:1.2,label:'Regarder · Club Ondes',dyn:()=>AMB.club},
  {id:'o_arcade',...FP('arcade',1.3,-1.8),r:1.2,label:'Regarder · Arcade Pixel',dyn:()=>AMB.arcade},
  {id:'o_port',...FP('port',1.3,0),r:1.4,label:'Regarder · Port fluvial',dyn:()=>AMB.port},
  {id:'o_bunker',...FP('bunker',1.3,-1.8),r:1.2,label:'Regarder · Bunker Zéro',dyn:()=>AMB.bunker+' Pour l’instant, la porte blindée reste fermée pour toi.'},
  {id:'o_stairs_up',x:GX-1.62,z:GZ1+.6,r:1.2,label:'Monter sur le quai',act:()=>climbStairs(true)},
  {id:'o_stairs_down',x:GX-1.62,z:QUAI_END-.3,r:1,zone:'quai',label:'Descendre l’escalier',act:()=>climbStairs(false)},
  {id:'o_tgv',x:GX-1.2,z:(GZ0+QUAI_END)/2,r:1.3,zone:'quai',label:'Regarder le TGV',dyn:()=>Math.abs(train.position.z-(GZ1-.6))<.5?'Le TGV est à quai. Portes fermées : réservé aux voyageurs munis d’un billet pour Nova Prime. Un jour, peut-être.':'La voie est vide. Le prochain TGV arrive du haut de la ville, par le viaduc.'},
  {id:'o_up',...FP('roofs',1.2,0),r:1.2,label:'Entrer · monter sur le toit',act:()=>goRoof(true)},
  {id:'o_down',x:ROOF.x+1.9,z:ROOF.z-.5,r:1.1,roof:true,label:'Ascenseur · redescendre',act:()=>goRoof(false)},
  {id:'o_antenna',x:ROOF.x+.2,z:ROOF.z+.9,r:1.2,roof:true,label:'Regarder l’antenne',dyn:()=>'La grande antenne de la tour Zéro. Tout en haut, le feu rouge clignote pour les voitures volantes. D’ici, on capte tout le Net de la ville.'+(S.met.mira?' Mira dit que c’est ici qu’elle écoute la ville, la nuit.':'')},
  {id:'o_view',x:ROOF.x+ROOF.hw-.9,z:ROOF.z+ROOF.hd-.9,r:1.3,roof:true,label:'Regarder la ville',dyn:()=>AMB.roofs},
  {id:'o_holoroof',x:ROOF.x-.1,z:ROOF.z+2.3,r:1,roof:true,label:'Regarder l’hologramme',dyn:()=>'De près, l’hologramme de Lou n’est qu’un nuage de lumière qui grésille. Vingt mètres de « Néon » pour annoncer son set au club Ondes.'},
  {id:'o_gare',x:GX+GHW+1.3,z:GZ0+.6,r:1.3,label:'Regarder · Gare Zéro',dyn:()=>'La gare Zéro. Une rame arrive de loin par le viaduc, s’arrête sous les arches, puis repart. Les quais vides ont été repris par ceux que personne ne voulait en haut.'}];
const HOME_OBJ=['o_terminal','o_bed','o_poster','o_board','o_photo','o_wardrobe','o_sofa','o_kitchen','o_fridge','o_safe','o_cat','o_moto'];
OBJECTS.forEach(o=>{if(HOME_OBJ.includes(o.id)){o.x+=HX;o.z+=HZ}});
function spawn(){
  player=makeChar(SPECS.you);
  NPC_DEF.forEach(d=>{const m=makeChar(SPECS[d.id]);m.position.set(d.x,0,d.z);m.userData.ry=d.ry;
    const el=document.createElement('div');el.className='nl';el.style.color=COLORS[d.id];$('labels').appendChild(el);
    npcs.push({...d,mesh:m,baseRy:d.ry,label:el})});
  // patrouille Kurogane au carrefour, curieux au pied des Toits, clients du Bazar, dockers
  const R1=FP('roofs',2.8,1),R2=FP('roofs',3.2,-.6),R3=FP('roofs',2.4,3.4),M=PL.market;
  [[UX(AVE[2])-1.7,UZ(AVE[1])-2.4,0,'guard'],[UX(AVE[2])+1.7,UZ(AVE[1])+2.4,Math.PI,'guard'],[R1.x,R1.z,Math.PI/2,null],[R2.x,R2.z,Math.PI/2,null],[R3.x,R3.z,Math.PI*.7,null],
   [M.x-1.8,M.z+1.8,Math.PI/2,null],[M.x+1.8,M.z+5.4,Math.PI,null],[M.x-5.4,M.z-1.8,0,null],[15.6,UZ(.6),-Math.PI/2,null],[11.4,UZ(.31),Math.PI/2,null]].forEach(([x,z,ry,k])=>{
    if(isSolid(x,z))return;const m=makeChar(k?SPECS[k]:randomSpec());m.position.set(x,0,z);m.userData.ry=ry;statics.push(m)});
  // passants sur les trottoirs des avenues et sur le quai
  const lanes=[{ax:'x',c:UZ(AVE[2])+2.3,a0:UX(-.03),a1:UX(1.03),side:1,n:6},{ax:'x',c:UZ(AVE[1])+2.3,a0:UX(-.03),a1:UX(1.03),side:1,n:5},{ax:'x',c:UZ(AVE[3])+2.3,a0:UX(-.03),a1:UX(1.03),side:1,n:5},
    {ax:'z',c:UX(AVE[1])-2.3,a0:UZ(-.03),a1:UZ(1.03),side:-1,n:5},{ax:'z',c:UX(AVE[2])+2.3,a0:UZ(-.03),a1:UZ(1.03),side:1,n:5},{ax:'z',c:UX(AVE[3])-2.3,a0:UZ(-.03),a1:UZ(1.03),side:-1,n:4},
    {ax:'z',c:13.6,a0:UZ(.0),a1:UZ(1),side:1,n:4}];
  lanes.forEach(L=>{for(let i=0;i<L.n;i++){let a=0;for(let t=0;t<12;t++){a=L.a0+rnd()*(L.a1-L.a0);if(!(L.ax==='x'?isSolid(a,L.c):isSolid(L.c,a)))break}
    const m=makeChar(randomSpec());if(L.ax==='x')m.position.set(a,0,L.c);else m.position.set(L.c,0,a);
    walkers.push({m,L,v:(rnd()<.5?-1:1)*(1.1+rnd()*.8),off:0})}});
  [[ '#5a2a6a','#ff4fa3',14,UZ(AVE[1]),7],[ '#1e3a4a','#39e6ff',12,UZ(AVE[2]),-5],[ '#4a3a1a','#ffb547',10,UZ(AVE[3]),9],[ '#2a2a2a','#ff3b4e',13,UZ(AVE[0])+2,6]].forEach(([b,c,y,z,v],i)=>{
    const g=carModel(b,c,-10+i*16,y,z,v>0?0:Math.PI,false);flyers.push({g,v})});
}
function updateWalkers(dt){
  const obs=[player.position,...npcs.map(n=>n.mesh.position),...statics.map(s=>s.position)];
  walkers.forEach(w=>{
    const p=w.m.position,L=w.L,X=L.ax==='x';let block=false,want=0;const pa=X?p.x:p.z;
    for(const o of obs){const da=(X?o.x:o.z)-pa,db=(X?o.z:o.x)-(L.c+w.off);if(Math.sign(da)===Math.sign(w.v)&&Math.abs(da)<1.3&&Math.abs(db)<.7){want=.8*L.side;if(Math.abs(da)<.5&&Math.abs(db)<.45)block=true}}
    for(const [lx,lz] of LAMPS){const la=(X?lx:lz)+.5,lb=(X?lz:lx)+.5;if(Math.abs(lb-L.c)<.6&&Math.sign(la-pa)===Math.sign(w.v)&&Math.abs(la-pa)<1.2)want=.7*L.side}
    w.off=lerp(w.off,want,Math.min(1,dt*4));
    if(block){w.st=(w.st||0)+dt;if(w.st>1.4){w.v=-w.v;w.st=0}}else w.st=0; // jamais coincé : demi-tour
    let na=pa+(block?0:w.v*dt);const ah=na+Math.sign(w.v)*.45,bb=L.c+w.off;
    if(na>L.a1||na<L.a0||(X?isSolid(ah,bb):isSolid(bb,ah))){w.v=-w.v;na=pa}
    if(X){p.x=na;p.z=bb}else{p.z=na;p.x=bb}
    w.m.userData.ry=X?(w.v>0?Math.PI/2:-Math.PI/2):(w.v>0?0:Math.PI);w.m.userData.moving=!block;
  });
}
function updateCity(dt){
  // rame de la gare Zéro : arrive de loin par le viaduc, s'arrête à quai, puis repart au loin derrière la ville
  if(train){const cyc=40,s0=(tAcc%cyc)/cyc,ease=x=>x*x*(3-2*x),STOP=GZ1-.6,FAR=-140;
    train.position.z=s0<.35?FAR+(STOP-FAR)*ease(s0/.35):s0<.6?STOP:STOP-(STOP-FAR+30)*Math.pow((s0-.6)/.4,2)}
  clubBeams.forEach(b=>{b.g.rotation.z=Math.sin(tAcc*1.3+b.k*2)*.6;b.g.rotation.x=Math.cos(tAcc*.9+b.k)*.25});
  hazards.forEach(h=>h.visible=Math.sin(tAcc*4)>0);
  boats.forEach(b=>{b.g.position.y=Math.sin(tAcc*1.1+b.ph)*.06;b.g.rotation.z=Math.sin(tAcc*.8+b.ph)*.025;
    if(b.mv){b.g.position.z+=b.mv*dt;if(b.g.position.z>H+70)b.g.position.z=-70;if(b.g.position.z<-70)b.g.position.z=H+70}});
  adScreens.forEach(a=>{a.k+=dt;if(a.k>4.5){a.k=0;a.i++;drawAd(a)}});
  barriers.forEach(b=>{b.rotation.z=Math.max(0,Math.sin(tAcc*.5))*1.3});
  if(homeShell){const lx=player.position.x-HX,lz=player.position.z-HZ;homeShell.visible=!(lx>1.8&&lx<12.2&&lz>1.8&&lz<9.9)}
  // voitures du périphérique : tournent autour de la ville, dans les deux sens ; elles s'arrêtent devant toi
  const xa=UX(-.024),xb=UX(1.024),za=UZ(-.024),zb=UZ(1.024),sx=xb-xa,sz=zb-za,per=2*(sx+sz);
  const md=d=>((d%per)+per)%per;
  ringCars.forEach(c=>{const o=c.dir?-.9:.9;
    const pt=d=>{d=md(d);if(d<sx)return [xa+d,za-o,0];d-=sx;if(d<sz)return [xb+o,za+d,-Math.PI/2];d-=sz;if(d<sx)return [xb-d,zb+o,Math.PI];d-=sx;return [xa-o,zb-d,Math.PI/2]};
    // la voiture devant, dans le même sens : on garde ses distances, on ralentit derrière elle
    let gap=1e9,ahead=null;ringCars.forEach(e=>{if(e===c||e.dir!==c.dir)return;const g=c.dir?md(c.d-e.d):md(e.d-c.d);if(g<gap){gap=g;ahead=e}});
    let want=c.sp*1.2;if(gap<9)want=Math.min(want,Math.max(0,(gap-4)/5)*c.sp*1.2+(ahead?Math.min(ahead.v||0,want)*.3:0));if(gap<4.2)want=0;
    const [nx,nz]=pt(c.d+(c.dir?-2.2:2.2));if(Math.hypot(nx-player.position.x,nz-player.position.z)<1.6)want=0;
    c.v=(c.v||0)+(want-(c.v||0))*Math.min(1,dt*2.5);c.d+=(c.dir?-1:1)*c.v*dt;
    // une voiture coincée réapparaît plus loin, seulement quand la caméra ne la voit pas
    c.stk=(c.v<.2)?(c.stk||0)+dt:0;
    if(c.stk>6){c.g.updateMatrixWorld();const f=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      if(!f.containsPoint(c.g.position)){const ds=ringCars.filter(e=>e.dir===c.dir&&e!==c).map(e=>md(e.d)).sort((a,b)=>a-b);let best=0,bg=0;
        ds.forEach((d,i)=>{const n=i<ds.length-1?ds[i+1]:ds[0]+per,g=n-d;if(g>bg){bg=g;best=d+g/2}});c.d=md(best);c.stk=0;c.v=c.sp}}
    const [x,z,r]=pt(c.d);c.g.position.set(x,.32+Math.sin(tAcc*3+c.d)*.04,z);c.g.rotation.y=r+(c.dir?Math.PI:0)});
}/* ===================== CAMÉRA / ENTRÉES ===================== */
let yaw=0,yawT=0,pitch=.36,pitchT=.36,dist=7.5,distT=7.5,camD=7.5;
const focus=new THREE.Vector3(5.6,1.5,4.6);
const keys={};
let target=null,pendingTalk=null,stuck=0;
let dlgOpen=false,started=false,overlayOpen=true,talking=null;

addEventListener('keydown',e=>{
  if(!$('fiche').hidden&&['Escape','Space','Enter'].includes(e.code)){e.preventDefault();closeFiche();return}
  if(overlayOpen)return;
  if(dlgOpen){
    if(['Space','Enter','KeyF'].includes(e.code)){e.preventDefault();dlgAdvance()}
    const n={Digit1:0,Digit2:1,Digit3:2,Numpad1:0,Numpad2:1,Numpad3:2}[e.code];
    if(n!==undefined){const b=$('dlgChoices').querySelectorAll('button')[n];if(b)b.click()}
    return;
  }
  keys[e.code]=true;
  if(e.code==='KeyQ')yawT+=Math.PI/4;
  if(e.code==='KeyE')yawT-=Math.PI/4;
  if(e.code==='KeyP'){PIX=PIX%4+1;try{localStorage.setItem('neobxl-pix2',PIX)}catch(_){}resize();toast('Pixels : '+PIX+'×','')}
  if(['Space','Enter','KeyF'].includes(e.code)){e.preventDefault();interact()}
  if(e.code.startsWith('Arrow'))e.preventDefault();
});
addEventListener('keyup',e=>{keys[e.code]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});

let pd=null;
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{pd={x:e.clientX,y:e.clientY,yaw:yawT,pitch:pitchT,moved:false,btn:e.button};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!pd)return;const dx=e.clientX-pd.x,dy=e.clientY-pd.y;if(Math.abs(dx)>6||Math.abs(dy)>6)pd.moved=true;
  if(pd.moved){yawT=pd.yaw-dx*.008;pitchT=Math.min(1.15,Math.max(.06,pd.pitch+dy*.005))}});
canvas.addEventListener('pointerup',e=>{if(pd&&!pd.moved&&pd.btn===0&&!dlgOpen&&!overlayOpen)clickAt(e.clientX,e.clientY);pd=null});
canvas.addEventListener('wheel',e=>{e.preventDefault();distT=Math.min(18,Math.max(3,distT+Math.sign(e.deltaY)*1.2))},{passive:false});
$('camL').onclick=()=>yawT+=Math.PI/4;$('camR').onclick=()=>yawT-=Math.PI/4;
$('camIn').onclick=()=>distT=Math.max(3,distT-2);$('camOut').onclick=()=>distT=Math.min(18,distT+2);

const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function clickAt(cx,cy){
  ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(ndc,camera);
  const hits=ray.intersectObjects(npcs.map(n=>n.mesh.userData.hit));
  if(hits.length&&!zoneOf()){const n=npcs.find(n=>n.mesh.userData.hit===hits[0].object);
    if(distTo(n)<1.9){talkTo(n);return}
    target={x:n.mesh.position.x,z:n.mesh.position.z};pendingTalk=n;return}
  const d=ray.ray.direction,o=ray.ray.origin;if(d.y>=0)return;const t=(zoneY()-o.y)/d.y;
  target={x:o.x+d.x*t,z:o.z+d.z*t};pendingTalk=null;
}
