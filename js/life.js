// La ville vivante : enseignes verticales qui grésillent, liserés néon sur les tours, projecteurs sur les toits,
// drones, vapeur qui monte des grilles, fenêtres qui s'allument et s'éteignent.
'use strict';

const blades=[],searchlights=[],drones=[],vents=[],windowMats=[];
const BLADE_WORDS=['HÔTEL','RAMEN','KARAOKÉ','FRITERIE','PHARMA','BIÈRES','NUIT','CYBER','GAUFRES','24H','KEBAB','DANCING','MOTEL','IMPLANTS','PACHINKO','TATOUAGE'];
const NEON_COLS=['#ff2e9a','#39e6ff','#b98cff','#ffb13b','#7cf29a','#ff3b4e'];
function blade(text,color,a,f,top,side){ // a : position le long de la façade, f : plan de la façade, top : hauteur, side : 'z' (façade sud) ou 'x' (façade est)
  const s=signTexture(text,color,true),k=.08,w=s.w*k,h=s.h*k,y=h/2+2.6;if(y+h/2>top-.3)return false;
  const g=new THREE.Group();scene.add(g);if(side==='x'){g.position.set(f+w/2+.18,y,a);g.rotation.y=Math.PI/2}else g.position.set(a,y,f+w/2+.18);
  box(.1,h+.16,w+.16,'#07090e',0,0,0,g);
  const mt=new THREE.MeshBasicMaterial({map:s.tex,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
  [1,-1].forEach(d=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mt);p.position.x=d*.06;p.rotation.y=d*Math.PI/2;g.add(p)});
  box(.06,.06,.7,'#2a3140',0,h/2-.2,-w/2-.3,g);box(.06,.06,.7,'#2a3140',0,-h/2+.2,-w/2-.3,g); // potences
  blades.push({mt,ph:rnd()*10,bad:rnd()<.3});return true;
}
function buildLife(){
  // tours : enseignes verticales côté avenue, liserés néon verticaux, bandeaux lumineux
  TOWERS.forEach((b,k)=>{if(b.comm)return;const x=UX(b.u),z=UZ(b.v),w=2*b.s*MS,h=HZF(b.h),c=NEON_COLS[k%NEON_COLS.length];
    const hh=h>13?h*.62:h;
    box(.08,hh-.4,.08,c,x+w/2+.02,hh/2+.2,z+w/2+.02,null,true);
    if(k%3===0)box(.08,hh-.4,.08,NEON_COLS[(k+2)%6],x-w/2-.02,hh/2+.2,z+w/2+.02,null,true);
    if(k%2===1)for(let y=4;y<hh-1;y+=4)box(w+.06,.06,.06,c,x,y,z+w/2+.03,null,true);
    const word=BLADE_WORDS[k%BLADE_WORDS.length],col=NEON_COLS[(k+1)%6],i=Math.round(b.u*12-.5);
    if(b.j%3===2)blade(word,col,x+w/2-.45,z+w/2,hh,'z');else if(i%3===2)blade(word,col,z+w/2-.45,x+w/2,hh,'x');
  });
  // projecteurs qui balaient le ciel depuis les plus hautes tours
  TOWERS.filter(b=>b.h>.3).slice(0,5).forEach((b,i)=>{const h=HZF(b.h),g=new THREE.Group();g.position.set(UX(b.u),h+.4,UZ(b.v));scene.add(g);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.18,3.2,60,14,1,true),new THREE.MeshBasicMaterial({color:i%2?0x9fd8ff:0xc8a8ff,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    beam.position.y=30;g.add(beam);box(.6,.4,.6,'#3a4252',0,-.2,0,g);searchlights.push({g,ph:i*1.7})});
  // drones de livraison et de surveillance
  for(let i=0;i<14;i++){const g=new THREE.Group();scene.add(g);box(.42,.1,.42,'#20262f',0,0,0,g);
    [[.3,.3],[-.3,.3],[.3,-.3],[-.3,-.3]].forEach(([a,b])=>{const r=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.02,10),new THREE.MeshBasicMaterial({color:0x8899aa,transparent:true,opacity:.5}));r.position.set(a,.06,b);g.add(r)});
    const l=box(.08,.08,.08,i%3?'#ff3b4e':'#7dffb0',0,-.08,0,g,true);if(i%4===0)box(.2,.2,.2,'#ffb547',0,-.25,0,g);
    const a=AVE[i%4],v=AVE[(i+1)%4];drones.push({g,l,cx:UX(a),cz:UZ(v),r:4+rnd()*9,y:5+rnd()*8,sp:(.25+rnd()*.35)*(i%2?1:-1),ph:rnd()*6})}
  // vapeur qui monte des grilles de la chaussée
  const vm=new THREE.PointsMaterial({color:0xb8c4d8,size:1.6,map:glowTex,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending});
  LAMPS.filter((_,i)=>i%5===2).slice(0,12).forEach(([x,z])=>{const n=26,pos=new Float32Array(n*3),sp=[];for(let i=0;i<n;i++){pos[i*3]=x+.5+(rnd()-.5)*.6;pos[i*3+1]=rnd()*3.2;pos[i*3+2]=z+1.4+(rnd()-.5)*.6;sp.push(.5+rnd()*.7)}
    const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));scene.add(new THREE.Points(gg,vm));box(.7,.02,.5,'#3a414c',x+.5,.012,z+1.4);vents.push({gg,pos,sp,x:x+.5,z:z+1.4})});
  // fenêtres : un quart des façades « respire » (des appartements s'allument et s'éteignent)
  const seen=new Set();scene.traverse(o=>{if(o.isMesh&&Array.isArray(o.material)&&o.material[0].emissiveMap)o.material.forEach(m=>{if(m.emissiveMap&&!seen.has(m)){seen.add(m);if(rnd()<.28)windowMats.push({m,base:m.emissiveIntensity,ph:rnd()*20,sp:.15+rnd()*.5})}})});
}
function updateLife(dt){
  blades.forEach(b=>{const f=b.bad?(Math.random()<.06?.25:1):(Math.random()<.004?.4:1);b.mt.color.setScalar(f)});
  searchlights.forEach(s=>{s.g.rotation.z=Math.sin(tAcc*.35+s.ph)*.55;s.g.rotation.x=Math.cos(tAcc*.27+s.ph)*.45});
  drones.forEach(d=>{const a=tAcc*d.sp+d.ph;d.g.position.set(d.cx+Math.cos(a)*d.r,d.y+Math.sin(tAcc*1.3+d.ph)*.3,d.cz+Math.sin(a)*d.r);d.g.rotation.y=-a;d.l.visible=Math.sin(tAcc*6+d.ph)>0});
  vents.forEach(v=>{const p=v.pos;for(let i=0;i<v.sp.length;i++){p[i*3+1]+=v.sp[i]*dt;p[i*3]+=Math.sin(tAcc+i)*.003;if(p[i*3+1]>3.4){p[i*3+1]=0;p[i*3]=v.x+(Math.random()-.5)*.6}}v.gg.attributes.position.needsUpdate=true});
  windowMats.forEach(w=>{w.m.emissiveIntensity=w.base*(.45+.55*(.5+.5*Math.sin(tAcc*w.sp+w.ph)))});
}
