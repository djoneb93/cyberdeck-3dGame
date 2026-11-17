// La moto : un modèle détaillé (carénage profilé, réservoir, selle, fourche, roues à jantes lumineuses, échappement).
// Près d'elle, E ou F pour monter dessus : on roule 1,5 fois plus vite qu'à pied. E ou F de nouveau pour descendre.
// Si on s'en éloigne, le bouton « Moto » la ramène à sa place de stationnement, devant la planque (une case réservée, rien ne la gêne).
'use strict';

const MOTO_PARK={x:44.7,z:68.45,ry:0},MOTO_SPEED=1.5;
let moto=null,riding=false;

function motoModel(){
  const g=new THREE.Group();scene.add(g);
  // livrée peinte sur les flancs : orange, bande noire, numéro, « NEO-BXL » en cyan
  const lc=document.createElement('canvas');lc.width=256;lc.height=96;const L=lc.getContext('2d');
  const lg=L.createLinearGradient(0,0,0,96);lg.addColorStop(0,'#ffa25a');lg.addColorStop(1,'#d8641e');L.fillStyle=lg;L.fillRect(0,0,256,96);
  L.fillStyle='#15171c';L.beginPath();L.moveTo(0,58);L.lineTo(256,40);L.lineTo(256,54);L.lineTo(0,72);L.fill();
  L.fillStyle='#39e6ff';L.fillRect(0,73,256,3);L.font='bold 30px Silkscreen, monospace';L.fillStyle='#f4f4ee';L.fillText('0',150,38);L.font='bold 12px Silkscreen, monospace';L.fillStyle='#15171c';L.fillText('NEO-BXL',40,30);
  const lt=new THREE.CanvasTexture(lc);lt.repeat.set(1/1.84,1/.6);lt.offset.set(1/1.84*1.02,-.4/.6);
  const body=new THREE.MeshPhongMaterial({map:lt,shininess:90,specular:0x664433}),dark=new THREE.MeshPhongMaterial({color:0x1a1c22,shininess:30}),
    chrome=new THREE.MeshPhongMaterial({color:0xb8c0c8,shininess:120,specular:0xffffff});
  // bulle de pare-brise teintée et rétroviseurs
  const ws=new THREE.Mesh(new THREE.PlaneGeometry(.34,.3),new THREE.MeshPhongMaterial({color:0x39e6ff,transparent:true,opacity:.35,side:THREE.DoubleSide,shininess:120,specular:0xffffff}));
  ws.position.set(.6,1.13,0);ws.rotation.set(0,Math.PI/2,0);ws.rotateX(-.55);g.add(ws);
  [-1,1].forEach(z=>{box(.02,.14,.02,'#2a2e36',.58,1.1,z*.27,g);box(.03,.06,.1,'#9ab4c8',.58,1.18,z*.29,g)});
  // carénage vu de profil (extrudé sur la largeur) : arrière effilé, selle, réservoir galbé, tête de fourche
  const s=new THREE.Shape();[[-.98,.6],[-.62,.76],[-.14,.78],[.04,.94],[.42,.99],[.64,.84],[.56,.6],[.2,.44],[-.36,.46],[-.86,.52]].forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
  const sh=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.3,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:3,curveSegments:8}),body);sh.position.z=-.15;g.add(sh);
  box(.52,.07,.3,'#14161b',-.36,.81,0,g); // selle
  const eng=box(.38,.3,.26,'#2a2e36',-.04,.42,0,g);eng.material=dark;
  [-1,1].forEach(z=>{const f=box(.05,.62,.05,'#b8c0c8',.7,.6,z*.11,g);f.material=chrome;f.rotation.z=.2; // fourche
    const a=box(.7,.06,.06,'#2a2e36',-.38,.34,z*.12,g);a.rotation.z=-.08}); // bras oscillant
  box(.06,.04,.62,'#2a2e36',.6,1.03,0,g);[-1,1].forEach(z=>box(.1,.06,.06,'#14161b',.6,1.03,z*.32,g)); // guidon et poignées
  box(.08,.13,.22,'#eaf6ff',.8,.84,0,g,true);box(.04,.05,.24,'#ff2a3a',-.99,.62,0,g,true); // phare, feu arrière
  const ex=new THREE.Mesh(new THREE.CylinderGeometry(.05,.065,.62,12),chrome);ex.rotation.z=Math.PI/2+.12;ex.position.set(-.55,.38,.19);g.add(ex);
  [-1,1].forEach(z=>box(1.15,.025,.025,'#39e6ff',-.05,.47,z*.17,g,true)); // néon sous le carénage
  // roues : pneu, jante, enjoliveur lumineux
  const wheels=[.74,-.74].map(x=>{const w=new THREE.Group();w.position.set(x,.32,0);g.add(w);
    w.add(new THREE.Mesh(new THREE.TorusGeometry(.26,.075,10,24),dark));const rim=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.07,18),chrome);rim.rotation.x=Math.PI/2;w.add(rim);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.2,.012,4,24),mat('#39e6ff',true));w.add(ring);
    for(let i=0;i<5;i++){const sp=box(.03,.36,.02,'#2a2e36',0,0,0,w);sp.rotation.z=i*Math.PI/5}return w});
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),new THREE.MeshBasicMaterial({map:glowTex,color:0x39e6ff,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));gl.rotation.x=-Math.PI/2;gl.position.y=.03;g.add(gl);
  g.userData.wheels=wheels;return g}

function buildMoto(){
  moto=motoModel();parkMoto();
  // la place de stationnement : marquage au sol, et un « P » peint
  const P=MOTO_PARK;[[0,.62,2.6,.05],[0,-.62,2.6,.05],[1.3,0,.05,1.29],[-1.3,0,.05,1.29]].forEach(([dx,dz,w,d])=>box(w,.01,d,'#e8e8e4',P.x+dx,.014,P.z+dz));
  OBJECTS.push({id:'o_moto',get x(){return moto.position.x},get z(){return moto.position.z},r:1.5,get label(){return riding?'Descendre de la moto':'Monter sur la moto'},act:()=>riding?dismount():mount()});
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
    moto.userData.wheels.forEach(w=>w.rotation.z-=d/.32);
    const turn=((want-moto.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;moto.rotation.x=Math.max(-.25,Math.min(.25,turn*.8)); // on penche dans les virages
  }else{motoLast=null;moto.rotation.x=0}
  if(btn){const far=!riding&&!zoneOf()&&Math.hypot(player.position.x-MOTO_PARK.x,player.position.z-MOTO_PARK.z)>6&&Math.hypot(player.position.x-moto.position.x,player.position.z-moto.position.z)>6;
    const show=started&&far&&$('hudL')&&!$('hudL').hidden;if(btn.hidden===show)btn.hidden=!show}
}
