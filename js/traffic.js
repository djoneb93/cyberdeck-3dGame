// Circulation dans le centre-ville : les voitures sont toujours là, elles roulent en boucle sur le réseau
// des avenues intérieures (entre les carrefours), à droite, tournent aux carrefours, respectent les feux,
// gardent leurs distances et s'arrêtent pour les piétons. Elles ne vont jamais au bord de la carte.
'use strict';

const aveCars=[],LANE=.8;
const NODE=(i,j)=>({i,j,x:UX(AVE[i]),z:UZ(AVE[j])});
// sortie d'un carrefour vers un voisin (di,dj) ; on ne fait demi-tour que si c'est la seule issue
function nextDir(c){const ok=([di,dj])=>{const i=c.i+di,j=c.j+dj;return i>=0&&i<4&&j>=0&&j<4};
  const straight=[c.di,c.dj],right=[-c.dj,c.di],left=[c.dj,-c.di],back=[-c.di,-c.dj];
  // tout droit ou à droite (on ne coupe jamais la voie d'en face) ; à gauche seulement si c'est la seule issue
  const a=[straight,right].filter(ok);if(a.length)return a[Math.floor(Math.random()*a.length)];if(ok(left))return left;return back}
function buildTraffic(){
  const used=new Set();
  for(let k=0;k<8;k++){const g=carModel(pick(['#2a3a5a','#6a2a3a','#2a2a30','#d8dee8','#2f5a4a','#4a3a6a','#5a4a2a']),pick(['#39e6ff','#ff4fa3','#7dffb0','#ffb547']),0,.3,0,0,false);
    let i,j,di,dj,key;do{i=Math.floor(rnd()*4);j=Math.floor(rnd()*4);[di,dj]=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(rnd()*4)];key=i+','+j+','+di+','+dj}while(used.has(key)||i+di<0||i+di>3||j+dj<0||j+dj>3);used.add(key);
    const c={g,i,j,di,dj,t:.2+rnd()*.5,v:0,sp:3.6+rnd()*1.6,turn:null};segment(c);aveCars.push(c)}
  setupFlyers();
}
// point de voie : centre + décalage à droite du sens de marche
const laneP=(x,z,dx,dz,o)=>[x-dz*LANE+dx*o,z+dx*LANE+dz*o];
function segment(c){const A=NODE(c.i,c.j),B=NODE(c.i+c.di,c.j+c.dj),dx=c.di,dz=c.dj;
  c.p0=laneP(A.x,A.z,dx,dz,4.2);c.p1=laneP(B.x,B.z,dx,dz,-4.2);/* ligne d'arrêt avant le passage piéton */c.len=Math.hypot(c.p1[0]-c.p0[0],c.p1[1]-c.p0[1]);c.node=B}
function carPos(c){
  if(c.turn){const T=c.turn,u=T.u,a=1-u;return [a*a*T.p0[0]+2*a*u*T.k[0]+u*u*T.p1[0],a*a*T.p0[1]+2*a*u*T.k[1]+u*u*T.p1[1]]}
  return [c.p0[0]+(c.p1[0]-c.p0[0])*c.t,c.p0[1]+(c.p1[1]-c.p0[1])*c.t]}
let camFrustum=null;
function inView(p){if(!camFrustum)camFrustum=new THREE.Frustum();camFrustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));return camFrustum.containsPoint(p)}
// voitures volantes : circuits fermés au-dessus des avenues (elles ne quittent jamais la ville)
const FLY_LOOPS=[[0,0,3,3,14],[1,1,2,2,11],[0,1,2,3,12.5],[1,0,3,2,10]];
function setupFlyers(){flyers.forEach((f,k)=>{const [a,b,c2,d,y]=FLY_LOOPS[k%FLY_LOOPS.length];f.loop={x0:UX(AVE[a]),z0:UZ(AVE[b]),x1:UX(AVE[c2]),z1:UZ(AVE[d]),y};f.d=k*37;f.sp=5+k;f.dir=k%2?-1:1})}
function updateFlyers(dt){flyers.forEach(f=>{const L=f.loop;if(!L)return;const sx=L.x1-L.x0,sz=L.z1-L.z0,per=2*(sx+sz);f.d=((f.d+f.dir*f.sp*dt)%per+per)%per;
  let d=f.d,x,z,hx,hz;if(d<sx){x=L.x0+d;z=L.z0;hx=1;hz=0}else if((d-=sx)<sz){x=L.x1;z=L.z0+d;hx=0;hz=1}else if((d-=sz)<sx){x=L.x1-d;z=L.z1;hx=-1;hz=0}else{d-=sx;x=L.x0;z=L.z1-d;hx=0;hz=-1}
  if(f.dir<0){hx=-hx;hz=-hz}f.g.position.set(x,L.y+Math.sin(tAcc*1.5+f.sp)*.25,z);f.g.rotation.y=lerpAngle(f.g.rotation.y,Math.atan2(-hz,hx),Math.min(1,dt*4))})}
function updateTraffic(dt){
  aveCars.forEach(c=>{
    const [x,z]=carPos(c);const hx=c.turn?c.turn.hx:c.di,hz=c.turn?c.turn.hz:c.dj;
    // obstacles devant : joueur, passants, personnages, autres voitures, taxi posé
    let free=1e9;const look=(ox,oz,r)=>{const along=(ox-x)*hx+(oz-z)*hz,side=Math.abs(-(ox-x)*hz+(oz-z)*hx);if(along>0&&side<(r||1.05))free=Math.min(free,along)};
    const onRd=(px,pz)=>tile[I(Math.floor(px),Math.floor(pz))]===2; // seuls les piétons sur la chaussée comptent
    look(player.position.x,player.position.z);walkers.forEach(w=>{if(onRd(w.m.position.x,w.m.position.z))look(w.m.position.x,w.m.position.z)});npcs.forEach(n=>{if(onRd(n.mesh.position.x,n.mesh.position.z))look(n.mesh.position.x,n.mesh.position.z)});
    aveCars.forEach(o=>{if(o===c)return;const ohx=o.turn?o.turn.hx:o.di,ohz=o.turn?o.turn.hz:o.dj;if(ohx*hx+ohz*hz<.3)return; // seulement les voitures qui vont dans le même sens (les feux règlent les croisements)
      const [ox,oz]=carPos(o);const along=(ox-x)*hx+(oz-z)*hz,side=Math.abs(-(ox-x)*hz+(oz-z)*hx);if(along>0&&side<1.2)free=Math.min(free,along-2.2)});
    if(taxi&&taxi.state==='wait')look(taxi.g.position.x,taxi.g.position.z,1.4);
    // feu rouge : on s'arrête avant le passage piéton du prochain carrefour
    if(!c.turn){const rem=(1-c.t)*c.len,st=lightState(c.di?'x':'z');if(st!==2&&!(st===1&&rem<1.2)&&rem<5)free=Math.min(free,rem+.2)}
    const want=free<1.4?0:free<5?c.sp*(free-1.4)/3.6:c.sp;c.v+=(want-c.v)*Math.min(1,dt*3);const step=c.v*dt;
    if(c.turn){const T=c.turn;T.u+=step/T.len;if(T.u>=1){c.turn=null;c.t=0;segment(c)}}
    else{c.t+=step/c.len;if(c.t>=1){ // au carrefour : on choisit la suite et on tourne en douceur
      const N=c.node,[ndi,ndj]=nextDir({i:N.i,j:N.j,di:c.di,dj:c.dj});const p0=c.p1,p1=laneP(N.x,N.z,ndi,ndj,4.2);
      const straight=ndi===c.di&&ndj===c.dj,k=straight?[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2]:(ndi===-c.di&&ndj===-c.dj)?[N.x+c.di*5,N.z+c.dj*5]:(c.di?[(p1[0]+N.x)/2,(p0[1]+N.z)/2]:[(p0[0]+N.x)/2,(p1[1]+N.z)/2]); // coin des deux voies, ramené vers le centre : le virage reste sur la chaussée
      c.i=N.i;c.j=N.j;c.di=ndi;c.dj=ndj;c.turn={p0,p1,k,u:0,len:Math.max(1,Math.hypot(p1[0]-p0[0],p1[1]-p0[1])*1.15),hx:0,hz:0}}}
    const [nx,nz]=carPos(c);if(c.turn){const dxh=nx-x,dzh=nz-z,l=Math.hypot(dxh,dzh);if(l>1e-4){c.turn.hx=dxh/l;c.turn.hz=dzh/l}}
    const hhx=c.turn?c.turn.hx:c.di,hhz=c.turn?c.turn.hz:c.dj;
    c.g.position.set(nx,.32+Math.sin(tAcc*3+nx)*.04,nz);const want2=Math.atan2(-hhz,hhx);c.g.rotation.y=lerpAngle(c.g.rotation.y,want2,Math.min(1,dt*8));
  });
}
