// Le taxi volant : il attend à sa station près de ta planque, part parfois faire un tour à vide,
// et t'emmène pour une visite commentée de la ville quand tu montes dedans.
'use strict';

let taxi=null,taxiRide=false;
const TAXI_PAD={x:UX(AVE[2]),z:UZ(.93)},TAXI_STAND={x:UX(AVE[2])+2.3,z:UZ(.93)};
function buildTaxi(){
  const A=AVE.map(UX),Z=AVE.map(UZ),y=12;
  // itinéraire au-dessus des avenues (aucune tour sur le chemin), avec un détour par le port et la gare
  const P=[[A[2],.5,TAXI_PAD.z],[A[2],5,TAXI_PAD.z-3],[A[2],y,Z[3]],[A[2],y,Z[2]],[A[2],y,Z[1]],[A[2],y,Z[0]+3],[A[2]+4,y,Z[0]],[A[3]-4,y,Z[0]],[A[3],y,Z[0]+4],
    [A[3],y,Z[2]],[A[3],y,Z[3]-4],[A[3]-4,y,Z[3]],[A[1]+4,y,Z[3]],[A[1],y,Z[3]-4],[A[1],y+4,Z[2]],[A[1],y+8,PL.roofs.z],[A[1],y+3,Z[1]+4],[A[1]-4,y,Z[1]],
    [A[0],y,Z[1]],[12,y-2,Z[1]],[7,y-2,Z[1]+6],[7,y-2,UZ(.62)],[8,y-1,UZ(.9)],[A[0],y,UZ(.93)],[GX,y,UZ(.93)],[A[1],y-1,UZ(.95)],[A[2]-4,8,UZ(.95)],[A[2],3,TAXI_PAD.z-1],[A[2],.5,TAXI_PAD.z]];
  const curve=new THREE.CatmullRomCurve3(P.map(p=>new THREE.Vector3(p[0],p[1],p[2])),false,'centripetal');
  const len=curve.getLength();
  const g=taxiModel();g.position.set(TAXI_PAD.x,.45,TAXI_PAD.z);g.rotation.y=Math.PI/2;
  solid[I(Math.floor(TAXI_STAND.x),Math.floor(TAXI_STAND.z))]=1;
  // station : borne, enseigne, aire d'atterrissage lumineuse
  const sx=TAXI_STAND.x,sz=TAXI_STAND.z;box(.14,3,.14,'#2a3140',sx,1.5,sz);sign('TAXI','#ffe14d',sx,3.15,sz,-Math.PI/2,true,false,.07);
  box(.5,1.2,.4,'#2a313c',sx,.6,sz-.7);box(.04,.3,.3,'#ffe14d',sx-.27,.95,sz-.7,null,true);
  const pad=[];for(let a=0;a<16;a++){const t=a/16*Math.PI*2;pad.push([TAXI_PAD.x+Math.cos(t)*1.8,.013,TAXI_PAD.z+Math.sin(t)*1.8,.3,.02,.3])}instBoxes(pad,'#ffe14d',true);
  glow(TAXI_PAD.x,TAXI_PAD.z,2.6,'#ffe14d',.25);
  const STOPS=[['club','À droite, le club Ondes : ce soir, Lou mixe jusqu’à l’aube.'],['arcade','L’Arcade Pixel. Une gamine y détient tous les records.'],['laundry','La laverie 24/7 : elle n’a jamais fermé, pas même une nuit.'],
    ['lab','Le parking-labo. On dit qu’une chercheuse s’y cache.'],['market','Le Bazar Néon : épices, implants d’occasion, et le Doc au fond.'],['bunker','Le Bunker Zéro, où se retrouvent les meilleurs runners.'],
    ['roofs','La tour des Toits. Tout en haut, l’antenne et l’hologramme de Lou.'],['port','Les Docks Noirs : barges, grues et contrebande.'],['gare','La gare Zéro. Le TGV descend du haut de la ville.'],['home','Et voilà ta planque. Fin de la visite.']];
  const pos=id=>id==='gare'?[GX,GZ0+4]:id==='home'?[HX+7,HZ+6]:[PL[id].x,PL[id].z];
  taxi={g,curve,len,state:'wait',u:0,t:0,stops:STOPS.map(([id,txt])=>({p:pos(id),txt,done:false})),from:null};
  OBJECTS.push({id:'o_taxi',x:TAXI_STAND.x,z:TAXI_STAND.z+.3,r:1.6,label:'Taxi',act:taxiAct});
}
function taxiAct(){
  if(!taxi)return;
  if(taxi.state==='wait')startRide();
  else if(taxi.state==='solo'){taxi.state='come';taxi.t=0;taxi.from=taxi.g.position.clone();toast('Taxi appelé · il arrive','')}
}
function fadeThen(fn){const f=$('fade');f.style.opacity=1;overlayOpen=true;setTimeout(()=>{fn();f.style.opacity=0;overlayOpen=false},380)}
function startRide(){
  fadeThen(()=>{taxiRide=true;taxi.state='ride';taxi.u=0;player.visible=false;target=null;pendingTalk=null;taxi.stops.forEach(s=>s.done=false);
    distT=10;pitchT=.32;toast('Visite de NEO-BXL · Espace pour descendre','mem')});
}
function endRide(){
  fadeThen(()=>{taxiRide=false;taxi.state='wait';taxi.t=0;taxi.g.position.set(TAXI_PAD.x,.45,TAXI_PAD.z);taxi.g.rotation.set(0,Math.PI/2,0);
    player.visible=true;player.position.set(TAXI_STAND.x+.2,0,TAXI_STAND.z+1.2);S.px=player.position.x;S.pz=player.position.z;S.roof=false;save()});
}
function placeOnCurve(u){
  const c=taxi.curve,p=c.getPointAt(Math.min(1,u)),tg=c.getTangentAt(Math.min(1,u));
  taxi.g.position.copy(p);taxi.g.rotation.set(0,Math.atan2(-tg.z,tg.x),0);
  const tg2=c.getTangentAt(Math.min(1,u+.01));taxi.g.rotation.x=Math.max(-.3,Math.min(.3,(tg2.x*tg.z-tg2.z*tg.x)*-6)); // inclinaison dans les virages
  return tg;
}
function updateTaxi(dt){
  if(!taxi)return;const T=taxi,o=OBJECTS.find(o=>o.id==='o_taxi');T.t+=dt;
  if(T.state==='wait'){T.g.position.y=.45+Math.sin(tAcc*2)*.05;o.label='Monter dans le taxi · visite de la ville';
    if(T.t>75&&Math.hypot(player.position.x-TAXI_STAND.x,player.position.z-TAXI_STAND.z)>18){T.state='solo';T.u=0}}
  else if(T.state==='solo'){o.label='Appeler le taxi';T.u+=4.5*dt/T.len;placeOnCurve(T.u);if(T.u>=1){T.state='wait';T.t=0}}
  else if(T.state==='come'){o.label='Le taxi arrive…';const k=Math.min(1,T.t/5),e=k*k*(3-2*k);
    T.g.position.set(T.from.x+(TAXI_PAD.x-T.from.x)*e,T.from.y+(.45-T.from.y)*e+Math.sin(k*Math.PI)*4,T.from.z+(TAXI_PAD.z-T.from.z)*e);
    T.g.rotation.y=Math.atan2(-(TAXI_PAD.z-T.from.z),TAXI_PAD.x-T.from.x);if(k>=1){T.state='wait';T.t=0;T.g.rotation.set(0,Math.PI/2,0)}}
  else if(T.state==='ride'){
    T.u+=6*dt/T.len;const tg=placeOnCurve(T.u);player.position.copy(T.g.position);
    if(!pd)yawT=lerpAngle(yawT,Math.atan2(-tg.x,-tg.z),Math.min(1,dt*1.2));
    T.stops.forEach(s=>{if(!s.done&&Math.hypot(s.p[0]-T.g.position.x,s.p[1]-T.g.position.z)<15){s.done=true;toast(s.txt,'mem')}});
    if(T.u>=1)endRide();
  }
}
