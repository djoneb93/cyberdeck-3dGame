// Circulation dans le centre-ville : de temps en temps, une voiture emprunte une avenue en roulant à droite,
// s'arrête pour les piétons et garde ses distances. Elle disparaît au bout de l'avenue, hors du champ de la caméra.
'use strict';

const aveCars=[];
const LANE=.8;
function buildTraffic(){
  for(let i=0;i<6;i++){const g=carModel(pick(['#2a3a5a','#6a2a3a','#2a2a30','#d8dee8','#2f5a4a','#4a3a6a','#5a4a2a']),pick(['#39e6ff','#ff4fa3','#7dffb0','#ffb547']),0,.3,0,0,false);
    g.visible=false;aveCars.push({g,on:false,wait:2+i*4+rnd()*6,v:0})}
}
function startAveCar(c){
  // une avenue, un sens ; on roule à droite : voie décalée de LANE à droite du sens de marche
  const ax=rnd()<.5?'z':'x',a=AVE[Math.floor(rnd()*4)],dir=rnd()<.5?1:-1;
  c.ax=ax;c.dir=dir;c.lat=ax==='z'?UX(a)-dir*LANE:UZ(a)+dir*LANE;
  c.s=dir>0?(ax==='z'?UZ(-.04):UX(-.04)):(ax==='z'?UZ(1.04):UX(1.04));c.end=dir>0?(ax==='z'?UZ(1.04):UX(1.04)):(ax==='z'?UZ(-.04):UX(-.04));
  if(aveCars.some(o=>o!==c&&o.on&&o.ax===ax&&Math.abs(o.lat-c.lat)<.5&&Math.abs(o.s-c.s)<10))return false;
  c.sp=4+rnd()*2.5;c.v=c.sp;c.on=true;c.stk=0;c.g.visible=true;c.g.rotation.set(0,ax==='z'?(dir>0?-Math.PI/2:Math.PI/2):(dir>0?0:Math.PI),0);return true;
}
let camFrustum=null;
function inView(p){if(!camFrustum)camFrustum=new THREE.Frustum();camFrustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));return camFrustum.containsPoint(p)}
function updateTraffic(dt){
  aveCars.forEach(c=>{
    if(!c.on){c.wait-=dt;if(c.wait<=0&&!startAveCar(c))c.wait=2;return}
    const X=c.ax==='x',px=X?c.s:c.lat,pz=X?c.lat:c.s;
    // obstacle devant ? piétons, personnages, joueur, autres voitures de la même voie, taxi posé
    let free=1e9;const look=(x,z)=>{const along=((X?x:z)-c.s)*c.dir,side=Math.abs((X?z:x)-c.lat);if(along>0&&along<free&&side<1.05)free=along};
    look(player.position.x,player.position.z);walkers.forEach(w=>look(w.m.position.x,w.m.position.z));statics.forEach(s=>look(s.position.x,s.position.z));npcs.forEach(n=>look(n.mesh.position.x,n.mesh.position.z));
    aveCars.forEach(o=>{if(o!==c&&o.on&&o.ax===c.ax&&o.dir===c.dir&&Math.abs(o.lat-c.lat)<.5){const along=(o.s-c.s)*c.dir;if(along>0&&along<free+3)free=Math.min(free,along-2.2)}});
    if(taxi&&taxi.state==='wait')look(taxi.g.position.x,taxi.g.position.z);
    // feux tricolores : arrêt avant le passage piéton au rouge (et à l'orange si on a encore le temps)
    AVE.forEach(b=>{const cc=X?UX(b):UZ(b),d=(cc-c.s)*c.dir,st=lightState(c.ax);if(d>2.6&&d<7&&st!==2&&!(st===1&&d<3.6))free=Math.min(free,d-2.4)});
    const want=free<2.6?0:free<6?c.sp*(free-2.6)/3.4:c.sp;c.v+=(want-c.v)*Math.min(1,dt*3);c.s+=c.dir*c.v*dt;
    c.g.position.set(X?c.s:c.lat,.32+Math.sin(tAcc*3+c.s)*.04,X?c.lat:c.s);
    c.stk=c.v<.2?c.stk+dt:0;
    const done=(c.s-c.end)*c.dir>=0;
    if(done||(c.stk>10&&!inView(c.g.position))){if(done&&inView(c.g.position)&&(c.s-c.end)*c.dir<8)return;c.on=false;c.g.visible=false;c.wait=6+rnd()*14}
  });
}
