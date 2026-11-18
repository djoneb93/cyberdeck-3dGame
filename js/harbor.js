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
  buildMarina();buildGulls();buildNightMarket();
  harbor.push({g:yacht,home:{x:MARINA.x,z:MARINA.z,ry:Math.PI/2},ride:true,yacht:true,T:80,curve:yachtPath(),wait:1e9,t:0,out:false});
  const pick=[[2,62,30],[0,80,34],[5,70,28],[6,90,38]];
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
function updateHarbor(dt){if(!buildHarbor.done){buildHarbor.done=true;buildHarbor()}
  updateGulls(dt);updateNightMarket(dt);
  harbor.forEach(h=>{const g=h.g;if(h.yacht)updateMarinaBoat(dt,h);
    if(!h.out){h.wait-=dt;if(h.wait<=0&&!h.ride){h.out=true;h.t=0}return}
    const hi=harbor.indexOf(h),R0=h.yacht?9:5.5,others=[...boats.filter(o=>o.mv).map(o=>o.g),...harbor.filter((k,j)=>j<hi&&k.out).map(k=>k.g)]; // priorité : bateaux qui passent, puis le yacht
    const near=h.t>3&&h.t<h.T-4&&others.some(o=>o!==g&&Math.hypot(o.position.x-g.position.x,o.position.z-g.position.z)<R0);
    const sl=h.slow==null?1:h.slow;h.slow=sl+((near?0:1)-sl)*Math.min(1,dt*1.5);h.t+=dt*Math.max(.02,h.slow); /* on laisse passer les autres bateaux */
    const u=Math.min(1,h.t/h.T),e=u<.5?2*u*u:1-2*(1-u)*(1-u), /* démarre et accoste en douceur */s=Math.min(.999,e);
    const p=h.curve.getPointAt(s),tg=h.curve.getTangentAt(s);g.position.x=p.x;g.position.z=p.z;
    let want=Math.atan2(-tg.z,tg.x);if(s<.06&&!h.yacht)want+=Math.PI; // les bateaux de pêche sortent du quai en marche arrière (le yacht part droit devant)
    if(u>=1){want=h.home.ry}
    g.rotation.y=lerpAngle(g.rotation.y,want,Math.min(1,dt*1.6));
    if(u>=1){h.out=false;h.t=0;g.position.set(h.home.x,g.position.y,h.home.z);h.wait=h.ride?1e9:35+Math.random()*40;if(h.ride&&boatRide)endBoatRide()}});
  if(boatRide){overlayOpen=true;const g=boatRide.h.g,a=g.rotation.y; // à l'arrière du yacht, face au sillage (pas de commandes pendant la traversée)
    onDeck(-5.2,0,player,1.22);player.userData.ry=a+Math.PI/2;player.userData.moving=false;player.userData.sit=false}
}
