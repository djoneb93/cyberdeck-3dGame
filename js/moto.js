// La moto : une hoverbike de 2089. Monocoque profilée gris anthracite et noir carbone, roues sans moyeu couchées à plat
// (des patins de sustentation, comme les voitures), cœur à fusion visible sous le réservoir, bandeaux de lumière qui suivent les lignes du carénage,
// phare en fente, double propulseur à plasma et bulle fumée. Elle plane à quelques centimètres du sol.
// Près d'elle, E pour monter dessus : on roule deux fois plus vite qu'à pied. E de nouveau pour descendre.
// Si on s'en éloigne, le bouton « Moto » la ramène à sa place de stationnement, devant la planque (une case réservée, rien ne la gêne).
'use strict';

const MOTO_PARK={x:44.7,z:68.45,ry:0},MOTO_SPEED=2; // à moto, deux fois plus vite qu’à pied
let moto=null,riding=false;

function motoModel(){
  const g=new THREE.Group();scene.add(g);
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  // ── livrée peinte, calée sur le profil du carénage (x de -1,1 à 1,0 ; y de 0,3 à 1,1) ──
  const lc=document.createElement('canvas');lc.width=512;lc.height=224;const L=lc.getContext('2d');
  const X=x=>(x+1.1)/2.1*512,Y=y=>(1.1-y)/.8*224;
  let gr=L.createLinearGradient(0,0,0,224);gr.addColorStop(0,'#6a6e78');gr.addColorStop(.45,'#34363e');gr.addColorStop(1,'#16171c');L.fillStyle=gr;L.fillRect(0,0,512,224);
  // partie basse en carbone noir, découpe en biseau
  L.fillStyle='#101116';L.beginPath();L.moveTo(0,Y(.64));L.lineTo(X(-.2),Y(.6));L.lineTo(X(.3),Y(.66));L.lineTo(X(.62),Y(.6));L.lineTo(512,Y(.66));L.lineTo(512,224);L.lineTo(0,224);L.fill();
  L.globalAlpha=.18;L.strokeStyle='#3a3d48';for(let i=-30;i<60;i++){L.beginPath();L.moveTo(i*10,224);L.lineTo(i*10+60,Y(.62));L.stroke()}L.globalAlpha=1; // tissage carbone
  L.strokeStyle='#39e6ff';L.lineWidth=2;L.beginPath();L.moveTo(0,Y(.64)-4);L.lineTo(X(-.2),Y(.6)-4);L.lineTo(X(.3),Y(.66)-4);L.lineTo(X(.62),Y(.6)-4);L.lineTo(512,Y(.66)-4);L.stroke();
  // reflet laqué en haut, bande noire fuyante, décors
  gr=L.createLinearGradient(0,Y(1.02),0,Y(.84));gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');L.fillStyle=gr;L.fillRect(X(.05),Y(1.02),X(.7)-X(.05),Y(.84)-Y(1.02));
  L.fillStyle='#101116';L.beginPath();L.moveTo(X(-1.1),Y(.78));L.lineTo(X(-.3),Y(.74));L.lineTo(X(.15),Y(.86));L.lineTo(X(.1),Y(.8));L.lineTo(X(-.32),Y(.7));L.lineTo(X(-1.1),Y(.72));L.fill();
  L.fillStyle='#f4f4ee';L.font='bold 20px Rajdhani, sans-serif';L.fillText('NEO-BXL',X(-.86),Y(.66));
  L.font='bold 13px JetBrains Mono, monospace';L.fillStyle='#ffd23f';L.fillText('▲ HV 880',X(.66),Y(.71));
  L.fillStyle='#f4f4ee';L.beginPath();L.arc(X(.3),Y(.78),17,0,Math.PI*2);L.fill();L.fillStyle='#101116';L.font='bold 24px Rajdhani, sans-serif';L.fillText('77',X(.3)-12,Y(.78)+8);
  for(let i=0;i<14;i++){L.fillStyle='#f4f4ee';L.fillRect(X(-.3)+i*4,Y(.56),i%3?2:1,10)} // code-barres
  L.fillStyle='#ffd23f';for(let i=0;i<4;i++){L.beginPath();const x0=X(-1.02)+i*11;L.moveTo(x0,Y(.6));L.lineTo(x0+6,Y(.6));L.lineTo(x0+12,Y(.56));L.lineTo(x0+6,Y(.52));L.lineTo(x0,Y(.52));L.lineTo(x0+6,Y(.56));L.fill()} // chevrons
  const lt=new THREE.CanvasTexture(lc);lt.repeat.set(1/2.1,1/.8);lt.offset.set(1.1/2.1,-.3/.8);
  const paint=new THREE.MeshPhongMaterial({map:lt,shininess:110,specular:0x8a92a4,emissive:0x060608}),
    red=new THREE.MeshPhongMaterial({color:0x2c2e36,shininess:110,specular:0x8a92a4,emissive:0x060608}),
    carbon=new THREE.MeshPhongMaterial({color:0x15161c,shininess:60,specular:0x3a3d48}),
    metal=new THREE.MeshPhongMaterial({color:0x6f7682,shininess:120,specular:0xffffff}),
    rubber=new THREE.MeshPhongMaterial({color:0x0c0d10,shininess:12}),
    cyan=new THREE.MeshBasicMaterial({color:0x39e6ff}),pink=new THREE.MeshBasicMaterial({color:0xff3b8d}), /* à elle seule : le garage les recolore */redL=mat('#ff1f3d',true),white=mat('#eaf6ff',true);
  const add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x||0,y||0,z||0);g.add(o);return o};
  const bar=(a,b,t,m)=>{const d=V(b[0]-a[0],b[1]-a[1],b[2]-a[2]),o=add(new THREE.BoxGeometry(d.length(),t,t),m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);
    o.quaternion.setFromUnitVectors(V(1,0,0),d.normalize());return o};
  const tube=(pts,r,m)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>V(...p))),48,r,6,false),m);
  const extr=(pts,depth,bev,m,z)=>{const s=new THREE.Shape();pts.forEach((p,i)=>p.length>2?s.quadraticCurveTo(p[0],p[1],p[2],p[3]):i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));
    return add(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:4,curveSegments:14}),m,0,0,(z||0)-depth/2)};
  // ── monocoque vue de profil : queue effilée, creux de selle, réservoir bombé, nez plongeant ──
  extr([[-1.08,.74],[-1.0,.8],[-.72,.86,-.46,.8],[-.14,.76],[0,.77,.12,.92],[.36,1.04,.62,.93],[.86,.83,1.0,.6],[.98,.56],[.72,.56,.52,.52],[.3,.4],[-.34,.4],[-.56,.58,-.92,.64]],.3,.05,paint);
  extr([[-.36,.44],[.3,.44],[.24,.24],[-.24,.24]],.2,.03,carbon); // carter inférieur
  extr([[-.5,.79],[-.12,.76],[-.1,.82],[-.3,.85,-.5,.86]],.26,.04,carbon); // selle
  [-1,1].forEach(z=>{const p=add(new THREE.BoxGeometry(.3,.12,.02),carbon,.36,.72,z*.205);p.rotation.z=.12}); // grilles d'aération
  for(let i=0;i<4;i++)[-1,1].forEach(z=>add(new THREE.BoxGeometry(.2,.012,.012),cyan,.36,.68+i*.03,z*.218));
  // ── cœur à fusion sous le réservoir, cerclé d'ailettes ──
  const core=add(new THREE.CylinderGeometry(.085,.085,.24,20),cyan,0,.3,0);core.rotation.x=Math.PI/2;
  for(let i=-2;i<=2;i++){const r=add(new THREE.TorusGeometry(.1,.018,6,20),metal,0,.3,i*.05)}
  const cg=add(new THREE.PlaneGeometry(.5,.5),new THREE.MeshBasicMaterial({map:glowTex,color:0x39e6ff,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}),0,.3,0);cg.rotation.x=0;
  // ── roues sans moyeu couchées à plat : l'anneau tourne, les bras le tiennent par l'intérieur ──
  const R=.34,WY=.12;
  const wheels=[.78,-.78].map((x,k)=>{const hd=new THREE.Group();hd.position.set(x,WY,0);hd.rotation.x=Math.PI/2;g.add(hd);const w=new THREE.Group();hd.add(w); /* roues couchées à plat : des patins de sustentation, comme les voitures */
    w.add(new THREE.Mesh(new THREE.TorusGeometry(R,.068,12,40),rubber));
    const rim=new THREE.Mesh(new THREE.TorusGeometry(R-.07,.028,8,40),metal);w.add(rim);
    [-1,1].forEach(z=>{const lr=new THREE.Mesh(new THREE.TorusGeometry(R-.045,.008,4,48),cyan);lr.position.z=z*.05;w.add(lr)});
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2,d=new THREE.Mesh(new THREE.BoxGeometry(.05,.012,.13),i%2?pink:cyan);d.position.set(Math.cos(a)*(R-.1),Math.sin(a)*(R-.1),0);d.rotation.z=a+Math.PI/2;w.add(d)} // repères qui tournent
    return w});
  // fourche avant inclinée et bras oscillant arrière, accrochés à la jante intérieure
  [-1,1].forEach(z=>{bar([.62,.9,z*.13],[.66,.36,z*.13],.05,metal);bar([.66,.36,z*.13],[.6,WY+.03,z*.13],.04,carbon);
    bar([-.22,.38,z*.13],[-.58,WY+.03,z*.13],.06,carbon);bar([-.3,.3,z*.13],[-.56,WY+.02,z*.13],.035,metal)});
  // ── bandeaux de lumière qui épousent le carénage ──
  [-1,1].forEach(z=>{const Z=z*.216;
    tube([[.99,.58,Z],[.75,.63,Z],[.4,.67,Z],[0,.62,Z],[-.4,.6,Z],[-.8,.68,Z],[-1.06,.75,Z]],.009,cyan);
    tube([[.42,.47,Z],[.1,.43,Z],[-.3,.43,Z]],.007,pink)});
  tube([[.97,.64,0],[.82,.84,0],[.6,.96,0],[.36,1.07,0],[.14,.96,0]],.008,cyan); // arête du réservoir
  tube([[-.52,.88,0],[-.74,.89,0],[-1.02,.83,0]],.008,cyan);
  // ── avant : phare en fente, feux de jour, bulle fumée, guidons bracelets, affichage holo ──
  add(new THREE.BoxGeometry(.03,.024,.3),white,1.0,.58,0);
  [-1,1].forEach(z=>{add(new THREE.BoxGeometry(.03,.05,.03),cyan,.96,.66,z*.12);bar([.55,.97,z*.13],[.47,.95,z*.27],.035,carbon);add(new THREE.CylinderGeometry(.022,.022,.08,10),rubber,.47,.95,z*.29).rotation.x=Math.PI/2});
  const hl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xeaf6ff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));hl.scale.set(.7,.3,1);hl.position.set(1.06,.58,0);g.add(hl);
  const ws=add(new THREE.CylinderGeometry(.21,.21,.32,20,1,true,Math.PI/2-.95,1.9),new THREE.MeshPhongMaterial({color:0x2a3a48,transparent:true,opacity:.5,side:THREE.DoubleSide,shininess:140,specular:0xffffff}),.66,1.03,0);ws.rotation.z=-.75;
  const hc=document.createElement('canvas');hc.width=128;hc.height=64;const hg=hc.getContext('2d');hg.strokeStyle='#39e6ff';hg.lineWidth=2;hg.strokeRect(2,2,124,60);
  hg.fillStyle='#39e6ff';hg.font='bold 22px JetBrains Mono, monospace';hg.fillText('088',8,30);hg.font='10px JetBrains Mono, monospace';hg.fillText('KM/H  CORE 99%',8,46);for(let i=0;i<9;i++)hg.fillRect(70+i*6,26-i*2,4,4+i*2);hg.fillStyle='#ff3b8d';hg.fillRect(8,52,80,4);
  const holo=add(new THREE.PlaneGeometry(.24,.12),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(hc),transparent:true,opacity:.85,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}),.5,1.1,0);holo.rotation.y=-Math.PI/2;holo.rotation.x=-.35;
  // ── arrière : barre de feu, ailerons, double propulseur ──
  add(new THREE.BoxGeometry(.03,.03,.38),redL,-1.08,.77,0);
  [-1,1].forEach(z=>{const f=add(new THREE.BoxGeometry(.3,.12,.02),red,-.92,.9,z*.15);f.rotation.z=-.35;f.rotation.x=z*.25;add(new THREE.BoxGeometry(.26,.012,.012),redL,-.93,.95,z*.165).rotation.z=-.35});
  const flames=[-1,1].map(z=>{const n=add(new THREE.CylinderGeometry(.06,.075,.2,16,1,true),metal,-1.0,.52,z*.11);n.rotation.z=Math.PI/2;n.material=metal;
    add(new THREE.CircleGeometry(.055,16),pink,-1.09,.52,z*.11).rotation.y=-Math.PI/2;
    const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff3b8d,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));fl.scale.set(.6,.35,1);fl.position.set(-1.22,.52,z*.11);g.add(fl);return fl});
  // ── sustentation : halo cyan sous la caisse, disques sous chaque roue ──
  const gl=add(new THREE.PlaneGeometry(2.6,1.1),new THREE.MeshBasicMaterial({map:glowTex,color:0x39e6ff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}),0,-.26,0);gl.rotation.x=-Math.PI/2;
  [.78,-.78].forEach(x=>{const d=add(new THREE.PlaneGeometry(.8,.5),new THREE.MeshBasicMaterial({map:glowTex,color:0xff3b8d,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}),x,-.25,0);d.rotation.x=-Math.PI/2});
  g.userData.wheels=wheels;g.userData.flames=flames;g.userData.flame=flames[0];g.userData.core=cg;
  const A=[],Bm=[];g.traverse(o=>{const m=o.material;if(!m||!m.color)return;const hx=m.color.getHex();if(hx===0x39e6ff&&!A.includes(m))A.push(m);else if(hx===0xff3b8d&&!Bm.includes(m))Bm.push(m)});
  g.userData.neonA=A;g.userData.neonB=Bm;g.userData.paint=[paint,red];return g}
// garage : couleur des néons (principal, secondaire) et teinte de la carrosserie, gardées dans la sauvegarde
const MOTO_NEON=[["Cyan","#39e6ff"],["Magenta","#ff3b8d"],["Vert acide","#7dffb0"],["Ambre","#ffb547"],["Violet","#b98cff"],["Blanc","#eaf6ff"],["Rouge","#ff2a3a"]],
  MOTO_BODY=[["Gris-noir","#ffffff"],["Graphite bleuté","#9fb8ff"],["Rouge sang","#ff6a6a"],["Or","#ffd27a"],["Vert militaire","#a8c890"],["Blanc perle","#f0f4ff"]];
function applyMotoStyle(){if(!moto)return;const st=S.motoStyle||{};const a=new THREE.Color(st.a||"#39e6ff"),b=new THREE.Color(st.b||"#ff3b8d"),bo=new THREE.Color(st.body||"#ffffff");
  moto.userData.neonA.forEach(m=>m.color.copy(a));moto.userData.neonB.forEach(m=>m.color.copy(b));
  const blanc=(st.body||"#ffffff")==="#f0f4ff";moto.userData.paint.forEach(m=>{m.color.copy(bo);if(blanc){m.color.multiplyScalar(2.4)}})}

function buildMoto(){
  moto=motoModel();parkMoto();applyMotoStyle();
  // la place de stationnement : marquage au sol, et un « P » peint
  const P=MOTO_PARK;[[0,.62,2.6,.05],[0,-.62,2.6,.05],[1.3,0,.05,1.29],[-1.3,0,.05,1.29]].forEach(([dx,dz,w,d])=>box(w,.01,d,'#e8e8e4',P.x+dx,.014,P.z+dz));
  OBJECTS.push({id:'o_moto',get x(){return moto.position.x},get z(){return moto.position.z},r:1.5,get label(){return riding?'Descendre de la moto':'Monter sur la moto'},act:()=>riding?dismount():mount()});
  // la borne de rappel, au bord du trottoir à côté de la place : E ou F pour faire revenir la moto, où qu'elle soit
  const bx=P.x-2.3,bz=P.z-.1;box(.22,1.1,.18,'#1a1e28',bx,.55,bz);box(.16,.2,.02,'#39e6ff',bx,.88,bz+.1,null,true);box(.26,.06,.22,'#ff8a3d',bx,1.13,bz,null,true);FURN.push([bx,bz,.2]);
  OBJECTS.push({id:'o_motocall',x:bx,z:bz+.5,r:1.1,label:'Borne · rappeler la moto',act:()=>{if(riding)return;
    if(Math.hypot(moto.position.x-P.x,moto.position.z-P.z)<.5){toast('Ta moto est déjà sur sa place.','');return}recallMoto()}});
  $('btnMoto').onclick=recallMoto;$('btnUnstuck').onclick=unstuck;
}
function parkMoto(){const P=MOTO_PARK;moto.position.set(P.x,0,P.z);moto.rotation.set(0,P.ry,0)}
function mount(){if(seated)standUp();riding=true;target=null;pendingTalk=null;const ud=player.userData;
  player.position.set(moto.position.x,0,moto.position.z);ud.ry=moto.rotation.y+Math.PI/2;ud.sit=true;toast('En selle · E pour descendre','')}
function dismount(quiet){if(!riding)return;riding=false;const ud=player.userData;ud.sit=false;
  const a=moto.rotation.y,sx=Math.sin(a),sz=Math.cos(a); // on descend sur le côté gauche de la moto
  // à gauche si c'est libre, sinon à droite, sinon la place libre la plus proche
  let p=[[1,1.1],[-1,1.1],[1,1.6],[-1,1.6]].map(([s,k])=>[moto.position.x+sx*s*k,moto.position.z+sz*s*k]).find(([x,z])=>!blocked(x,z));if(!p)p=unstuckSpot();
  player.position.x=p[0];player.position.z=p[1];if(!quiet)toast('Moto garée.','')}
// « Débloquer » : la place libre la plus proche, à 2 m au plus
function unstuckSpot(){const P=player.position;for(let r=.3;r<=2;r+=.2)for(let k=0;k<16;k++){const a=k/16*Math.PI*2,x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r;if(!blocked(x,z))return [x,z]}return [P.x,P.z]}
function unstuck(){if(riding||climb)return;const p=unstuckSpot();player.position.x=p[0];player.position.z=p[1];target=null;toast('Débloqué.','')}
function leaveMoto(){if(riding)dismount(true)} // entrer quelque part, prendre le taxi ou le train : la moto reste garée là
function recallMoto(){if(riding)return;parkMoto();toast('Ta moto t’attend devant la planque.','')}
// la moto garée est un obstacle (on en fait le tour)
function motoBlocks(x,z){if(!moto||riding||zoneOf())return false;const a=moto.rotation.y,cx=Math.cos(a),cz=-Math.sin(a),dx=x-moto.position.x,dz=z-moto.position.z;
  const along=dx*cx+dz*cz,side=-dx*cz+dz*cx;return Math.abs(along)<1.15&&Math.abs(side)<.45}
let motoLast=null;
function updateMoto(dt){
  if(!moto)return;const btn=$('btnMoto');
  if(riding){const ud=player.userData,want=ud.ry-Math.PI/2;moto.rotation.y=lerpAngle(moto.rotation.y,want,Math.min(1,dt*10));
    const p=player.position,d=motoLast?Math.hypot(p.x-motoLast.x,p.z-motoLast.z):0;moto.position.set(p.x,0,p.z);motoLast={x:p.x,z:p.z};
    moto.userData.wheels.forEach(w=>w.rotation.z-=d/.34);
    const turn=((want-moto.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;moto.rotation.x=Math.max(-.25,Math.min(.25,turn*.8)); // on penche dans les virages
  }else{motoLast=null;moto.rotation.x=0}
  moto.position.y=.28+Math.sin(tAcc*2.4)*.04; // elle plane
  {const go=riding&&player.userData.moving;(moto.userData.flames||[]).forEach(f=>{f.scale.set(go?1+Math.random()*.35:.45,go?.42:.26,1);f.material.opacity=go?.9:.4});const c=moto.userData.core;if(c)c.material.opacity=.4+Math.sin(tAcc*(go?9:3))*.15} // le propulseur s’allume quand on roule
  if(btn){const far=!riding&&!zoneOf()&&Math.hypot(player.position.x-MOTO_PARK.x,player.position.z-MOTO_PARK.z)>6&&Math.hypot(player.position.x-moto.position.x,player.position.z-moto.position.z)>6;
    const show=started&&far&&$('hudL')&&!$('hudL').hidden;if(btn.hidden===show)btn.hidden=!show}
}
