// Le port : des bateaux quittent leur quai, font un tour en mer et reviennent s'amarrer.
// L'un d'eux, la navette « Mouette », prend des passagers : depuis le ponton, E pour monter à bord, et l'on fait le tour avec lui.
// Les autres font la même chose de leur côté (on ne peut pas y monter).
'use strict';

let harbor=[],boatRide=null;
// tracé d'une sortie en mer depuis un quai : on recule, on vire, on file vers le large, on fait une boucle, on revient
function seaPath(x,z,side,far){const P=[[x,z],[x-3,z],[-4,z+side*1.5],[-14,z+side*5],[-far,z+side*7],[-far-9,z],[-far,z-side*7],[-14,z-side*4],[-4,z-side*1.2],[x-3.5,z],[x,z]];
  return new THREE.CatmullRomCurve3(P.map(([a,b])=>new THREE.Vector3(a,0,b)),false,'catmullrom',.35)}
function buildHarbor(){
  const moored=boats.filter(b=>!b.mv);if(!moored.length)return;
  // le yacht de la Marina Zéro (js/marina.js) : c'est lui qu'on prend ; quatre bateaux de pêche partent aussi en balade
  buildMarina();buildGulls();buildNightMarket();buildWaves();
  harbor.push({g:yacht,home:{x:MARINA.x,z:MARINA.z,ry:Math.PI/2},ride:true,yacht:true,T:80,curve:yachtPath(),wait:1e9,t:0,out:false});
  const pick=[[2,62,30],[0,80,34],[5,70,28],[4,90,38]]; /* (pas le dernier ponton : son chemin passerait par le yacht) */
  pick.forEach(([i,T,far],k)=>{const b=moored[i];if(!b)return;const g=b.g,home={x:g.position.x,z:g.position.z,ry:g.rotation.y};
    const side=k%2?1:-1;harbor.push({b,g,home,ride:false,T,curve:seaPath(home.x,home.z,side,far),wait:12+k*20,t:0,out:false})});
  OBJECTS.push({id:'o_boat',x:.5,z:MARINA.pz,r:1.6,get label(){return navDocked()?'Monter à bord du Neo-Mouette · tour en mer':'Le yacht est en mer'},
    act:()=>{if(navDocked())boardBoat();else openDlg({n1:{s:'nar',t:'Le Neo-Mouette est parti faire le tour de la baie. Il revient bientôt à ce ponton.'}})}});
}
const navDocked=()=>{const h=harbor.find(h=>h.ride);return h&&!h.out&&!boatRide};
function boardBoat(){const h=harbor.find(h=>h.ride);if(!h||h.out)return;leaveMoto();if(seated)standUp();
  fadeThen(()=>{boatRide={h,back:{x:player.position.x,z:player.position.z}};h.out=true;h.t=0;overlayOpen=true;target=null;pendingTalk=null;distT=Math.max(distT,9);
    toast('Tu montes à bord du Neo-Mouette avec les autres passagers. Les amarres sont larguées.','');if(typeof sfx==='function')try{sfx('door')}catch(_){}})}
function endBoatRide(){const R=boatRide;fadeThen(()=>{boatRide=null;overlayOpen=false;player.userData.sit=false;player.position.set(R.back.x,0,R.back.z);player.userData.ry=Math.PI/2;
  focus.set(R.back.x,1.5,R.back.z);toast('Retour au port. Tu redescends sur le ponton.','');save()})}
// ---- circulation sur l'eau : chaque bateau a sa boîte (orientée comme lui) ; s'il y a quelqu'un dans la zone juste devant lui, il s'arrête ----
// Face à face, c'est la priorité qui tranche (bateaux de passage, puis le yacht, puis les bateaux de pêche) : jamais de blocage, jamais de collision.
function boatSize(g){const r=g.rotation.y,p=g.position.clone();g.rotation.y=0;g.position.set(0,0,0);g.updateMatrixWorld(true);const b=new THREE.Box3();
  g.traverse(o=>{if(o.isMesh&&o.material&&!o.material.transparent&&o.geometry.type!=='PlaneGeometry')b.expandByObject(o)});g.rotation.y=r;g.position.copy(p);g.updateMatrixWorld(true);
  return {hx:(b.max.x-b.min.x)/2,hz:(b.max.z-b.min.z)/2,ox:(b.max.x+b.min.x)/2}}
const obb=(cx,cz,a,hx,hz)=>({cx,cz,ux:Math.cos(a),uz:-Math.sin(a),hx,hz});
function obbHit(A,B){for(const [lx,lz] of [[A.ux,A.uz],[-A.uz,A.ux],[B.ux,B.uz],[-B.uz,B.ux]]){
    const ra=A.hx*Math.abs(A.ux*lx+A.uz*lz)+A.hz*Math.abs(-A.uz*lx+A.ux*lz),rb=B.hx*Math.abs(B.ux*lx+B.uz*lz)+B.hz*Math.abs(-B.uz*lx+B.ux*lz);
    if(Math.abs((B.cx-A.cx)*lx+(B.cz-A.cz)*lz)>ra+rb)return false}return true}
let traffic=null;
function boatTraffic(){
  if(!traffic){traffic=[];boats.filter(b=>b.mv).forEach(b=>traffic.push({g:b.g,pass:b,pr:3,...boatSize(b.g)}));
    harbor.forEach((h,i)=>traffic.push({g:h.g,h,pr:h.yacht?2:1-i*.01,...boatSize(h.g)}))}
  const moving=new Set(),box={},ahead={};
  traffic.forEach(t=>{const g=t.g,a=g.rotation.y,ca=Math.cos(a),sa=Math.sin(a),cx=g.position.x+t.ox*ca,cz=g.position.z-t.ox*sa;
    const mv=t.pass?true:!!(t.h&&t.h.out);if(!t.pass&&!(t.h&&(t.h.out||t.h.yacht)))return; // les bateaux de pêche à quai sont rangés le long des pontons
    box[t.g.uuid]=obb(cx,cz,a,t.hx+.5,t.hz+.5);if(!mv)return;moving.add(t);
    // sens de la marche : la vitesse réelle (les bateaux de pêche sortent en marche arrière), sinon l'étrave
    let dx=g.position.x-(t.px==null?g.position.x:t.px),dz=g.position.z-(t.pz==null?g.position.z:t.pz);const L=Math.hypot(dx,dz);t.px=g.position.x;t.pz=g.position.z;
    if(L>1e-4){t.dx=dx/L;t.dz=dz/L}if(t.dx==null){t.dx=ca;t.dz=-sa}
    const A=t.h&&t.h.yacht?6:3.2,da=Math.atan2(-t.dz,t.dx),reach=Math.abs(t.hx*(t.dx*ca-t.dz*sa))+Math.abs(t.hz*(t.dx*sa+t.dz*ca));
    ahead[t.g.uuid]=obb(cx+t.dx*(reach+A/2),cz+t.dz*(reach+A/2),da,A/2,Math.max(t.hx,t.hz)*.3+t.hz+.4)});
  const waits=new Map();moving.forEach(t=>{const w=[];traffic.forEach(o=>{if(o===t||!box[o.g.uuid])return;if(obbHit(ahead[t.g.uuid],box[o.g.uuid]))w.push(o)});waits.set(t,w)});
  const stopped=new Set();moving.forEach(t=>{const w=waits.get(t);if(w.some(o=>!(moving.has(o)&&waits.get(o).includes(t)&&t.pr>o.pr)))stopped.add(t.g)});
  traffic.forEach(t=>{if(t.pass){const k=t.pass.go==null?1:t.pass.go;t.pass.go=k+((stopped.has(t.g)?0:1)-k)*.08}}); // les bateaux de passage ralentissent puis repartent
  return stopped}
function updateHarbor(dt){if(!buildHarbor.done){buildHarbor.done=true;buildHarbor()}
  updateGulls(dt);updateNightMarket(dt);updateWaves();
  const block=boatTraffic();
  harbor.forEach(h=>{const g=h.g;if(h.yacht)updateMarinaBoat(dt,h);
    if(!h.out){h.wait-=dt;if(h.wait<=0&&!h.ride){h.out=true;h.t=0}return}
    const stop=h.t>3&&h.t<h.T-4&&block.has(g); // un bateau devant : on attend qu'il bouge
    const sl=h.slow==null?1:h.slow;h.slow=sl+((stop?0:1)-sl)*Math.min(1,dt*2);h.t+=dt*Math.max(0,h.slow);
    const u=Math.min(1,h.t/h.T),e=u<.5?2*u*u:1-2*(1-u)*(1-u), /* démarre et accoste en douceur */s=Math.min(.999,e);
    const p=h.curve.getPointAt(s),tg=h.curve.getTangentAt(s);g.position.x=p.x;g.position.z=p.z;
    let want=Math.atan2(-tg.z,tg.x);if(s<.06&&!h.yacht)want+=Math.PI; // les bateaux de pêche sortent du quai en marche arrière (le yacht part droit devant)
    if(u>=1){want=h.home.ry}
    g.rotation.y=lerpAngle(g.rotation.y,want,Math.min(1,dt*1.6));
    if(u>=1){h.out=false;h.t=0;g.position.set(h.home.x,g.position.y,h.home.z);h.wait=h.ride?1e9:35+Math.random()*40;if(h.ride&&boatRide)endBoatRide()}});
  if(boatRide){overlayOpen=true;const g=boatRide.h.g,a=g.rotation.y; // à l'arrière du yacht, face au sillage (pas de commandes pendant la traversée)
    onDeck(-6.6,0,player,1.22);player.userData.ry=a+Math.PI/2;player.userData.moving=false;player.userData.sit=false}
}
