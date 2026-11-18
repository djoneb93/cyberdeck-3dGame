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
  // la navette : le bateau du 2e ponton ; trois autres partent aussi en balade, à des moments différents
  const pick=[[2,true,62,30],[0,false,80,34],[5,false,70,28],[6,false,90,38]]; /* navette = bateau du 2e ponton */
  pick.forEach(([i,ride,T,far],k)=>{const b=moored[i];if(!b)return;const g=b.g,home={x:g.position.x,z:g.position.z,ry:g.rotation.y};
    const side=k%2?1:-1;harbor.push({b,g,home,ride,T:ride?55:T,curve:seaPath(home.x,home.z,side,far),wait:ride?1e9:12+k*20,t:0,out:false});
    if(ride){const s=sign('NAVETTE · TOUR EN MER','#7dffb0',home.x+.8,1.9,PIERS[1]+.95,0,false,false,.05)}});
  const nav=harbor.find(h=>h.ride);if(!nav)return;
  OBJECTS.push({id:'o_boat',x:nav.home.x+.6,z:PIERS[1]+.35,r:1.7,get label(){return navDocked()?'Monter à bord · tour en mer':'La navette est en mer'},
    act:()=>{if(navDocked())boardBoat();else openDlg({n1:{s:'nar',t:'La navette « Mouette » est partie faire son tour. Elle revient bientôt à ce ponton.'}})}});
}
const navDocked=()=>{const h=harbor.find(h=>h.ride);return h&&!h.out&&!boatRide};
function boardBoat(){const h=harbor.find(h=>h.ride);if(!h||h.out)return;leaveMoto();if(seated)standUp();
  fadeThen(()=>{boatRide={h,back:{x:player.position.x,z:player.position.z}};h.out=true;h.t=0;overlayOpen=true;target=null;pendingTalk=null;distT=Math.max(distT,9);
    toast('Tu montes à bord de la « Mouette ». Les amarres sont larguées.','');if(typeof sfx==='function')try{sfx('door')}catch(_){}})}
function endBoatRide(){const R=boatRide;fadeThen(()=>{boatRide=null;overlayOpen=false;player.userData.sit=false;player.position.set(R.back.x,0,R.back.z);player.userData.ry=Math.PI/2;
  focus.set(R.back.x,1.5,R.back.z);toast('Retour au port. Tu redescends sur le ponton.','');save()})}
function updateHarbor(dt){if(!buildHarbor.done){buildHarbor.done=true;buildHarbor()}
  harbor.forEach(h=>{const g=h.g;
    if(!h.out){h.wait-=dt;if(h.wait<=0&&!h.ride){h.out=true;h.t=0}return}
    const hi=harbor.indexOf(h),near=boats.some(o=>o.g!==g&&(o.mv||harbor.some((k,j)=>j<hi&&k.g===o.g&&k.out))&&Math.hypot(o.g.position.x-g.position.x,o.g.position.z-g.position.z)<5.5&&h.t>3&&h.t<h.T-4);
    const sl=h.slow==null?1:h.slow;h.slow=sl+((near?0:1)-sl)*Math.min(1,dt*1.5);h.t+=dt*Math.max(.02,h.slow); /* on laisse passer les autres bateaux */
    const u=Math.min(1,h.t/h.T),e=u<.5?2*u*u:1-2*(1-u)*(1-u), /* démarre et accoste en douceur */s=Math.min(.999,e);
    const p=h.curve.getPointAt(s),tg=h.curve.getTangentAt(s);g.position.x=p.x;g.position.z=p.z;
    let want=Math.atan2(-tg.z,tg.x);if(s<.06)want+=Math.PI; // on sort du quai en marche arrière
    if(u>=1){want=h.home.ry}
    g.rotation.y=lerpAngle(g.rotation.y,want,Math.min(1,dt*1.6));
    if(u>=1){h.out=false;h.t=0;g.position.set(h.home.x,g.position.y,h.home.z);h.wait=h.ride?1e9:35+Math.random()*40;if(h.ride&&boatRide)endBoatRide()}});
  if(boatRide){overlayOpen=true;const g=boatRide.h.g,a=g.rotation.y,L=1.3; // sur le pont avant, face au large (pas de commandes pendant la traversée)
    player.position.x=g.position.x+Math.cos(a)*L;player.position.z=g.position.z-Math.sin(a)*L;player.userData.ry=a+Math.PI/2;player.userData.moving=false;player.userData.sit=false}
}
