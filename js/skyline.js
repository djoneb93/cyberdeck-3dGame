// Les bords de la ville : une rangée continue d'immeubles le long des avenues extérieures (nord, est, sud),
// et une seconde rangée plus haute derrière. Le côté ouest (le port, le fleuve) reste ouvert.
// Les immeubles voisins se ressemblent : on les construit par « quartiers » de 3 à 5 qui partagent le style,
// la teinte et une hauteur proche. Les fenêtres allumées montrent une pièce en profondeur (js/architecture.js).
'use strict';

function buildPerimeter(){
  let s=4242;const r=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}; // hasard à part : la ville ne change pas
  const rp=a=>a[Math.floor(r()*a.length)];
  const boxes={};const B=(c,e,x,y,z,w,h,d)=>{const k=c+(e?'!':'');(boxes[k]=boxes[k]||[]).push([x,y,z,w,h,d])};
  // un pas dans le repère de la rangée : a = le long de la rue, o = en s'éloignant de la rue (vers l'extérieur)
  const SIDES=[
    {name:'nord',a0:9.8,a1:92,line:-.05,P:(a,o)=>[a,-o],ry:0,front:[0,1]},       // rue au sud de la rangée
    {name:'est',a0:-14,a1:90,line:92.05,P:(a,o)=>[92.05+o,a],ry:-Math.PI/2,front:[-1,0]},
    {name:'sud',a0:9.8,a1:92,line:76.05,P:(a,o)=>[a,76.05+o],ry:Math.PI,front:[0,-1]}];
  const DISTRICTS=[ // style, teintes de rez-de-chaussée, néon : des quartiers cohérents
    // toute la bordure partage la même matière (béton photographié) : seules changent les fenêtres et la hauteur, pour un raccord sans couture
    {st:['concrete'],sc:['#2a2a30','#1e2a30'],neon:'#ffb13b',h:[10,16]},
    {st:['concrete'],sc:['#1e2a30','#2a2430'],neon:'#39e6ff',h:[12,20]},
    {st:['concrete'],sc:['#2a2430','#2a2a30'],neon:'#b98cff',h:[14,24]}];
  const gapN=a=>a>23.5&&a<32.5; // côté nord : on laisse passer le viaduc du TGV
  const mk=(S,a,o,w,d,h,style,v,ry,y0)=>{const [x,z]=S.P(a,o),X=Math.abs(Math.sin(ry))>.5;addMesh(new THREE.BoxGeometry(w,h,d),boxMats(style,w,h,d,v),x,(y0||0)+h/2,z,ry);return {x,z,X}};
  SIDES.forEach((S,si)=>{
    let a=S.a0,k=0;
    while(a<S.a1){
      const D=DISTRICTS[Math.floor(r()*DISTRICTS.length)],n=3+Math.floor(r()*3),v=Math.floor(r()*3),hBase=D.h[0]+r()*(D.h[1]-D.h[0]);
      for(let i=0;i<n&&a<S.a1;i++,k++){
        const w=Math.round(4+r()*4);if(S.name==='nord'&&gapN(a+w/2)){a=32.5;continue}
        const style=D.st[i%D.st.length],h=Math.round(hBase*(.82+r()*.36)),d=8+Math.round(r()*4),am=a+w/2;
        const sb=r()<.35&&h>11; // retrait en haut (gradins)
        const hb=sb?Math.round(h*.65):h;
        const L=mk(S,am,d/2,w,d,hb,style,v,S.ry);
        if(sb){const w2=w-1.2,d2=d-2,h2=h-hb;mk(S,am,d/2+1,w2,d2,h2,style,v,S.ry,hb);const [x2,z2]=S.P(am,d/2+1);
          B('#2a3242',false,x2,hb+.08,z2,L.X?d:w+.2,.16,L.X?w+.2:d)}
        // rez-de-chaussée sur la rue : vitrine lumineuse, auvent, liseré néon ; parfois une enseigne verticale
        const [fx,fz]=S.P(am,-.04),[ax,az]=S.P(am,-.3),[nx,nz]=S.P(am,-.55),fw=w*.74,sc=rp(D.sc);
        B(sc,true,fx,.95,fz,L.X?.06:fw,1.3,L.X?fw:.06);B('#1d2430',false,ax,2.05,az,L.X?.55:fw+.3,.1,L.X?fw+.3:.55);B(D.neon,true,nx,2,nz,L.X?.05:fw+.3,.05,L.X?fw+.3:.05);
        if(r()<.3&&hb>8){const [vx,vz]=S.P(am+w/2-.6,-.25);B('#14181f',false,vx,hb*.55,vz,L.X?.4:.12,hb*.45,L.X?.12:.4);const [ex,ez]=S.P(am+w/2-.6,-.33);B(rp(['#ff4fa3','#39e6ff','#ffb547',D.neon]),true,ex,hb*.55,ez,L.X?.04:.06,hb*.4,L.X?.06:.04)}
        // toit : corniche, climatiseurs, parfois un château d'eau ou une antenne
        const [cx,cz]=S.P(am,d/2);B('#2a3242',false,cx,hb+.08,cz,L.X?d+.2:w+.2,.16,L.X?w+.2:d+.2);
        for(let j=0;j<2;j++){const [ux,uz]=S.P(am+(r()-.5)*w*.6,d/2+(r()-.5)*d*.5);B('#3a4252',false,ux,(sb?h:hb)+.3,uz,.8,.5,.7)}
        if(r()<.25){const [tx,tz]=S.P(am,d*.7);const t=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,1.3,12),mat('#4a4f58'));t.position.set(tx,(sb?h:hb)+1.1,tz);scene.add(t)}
        if(r()<.15){const [tx,tz]=S.P(am,d*.4);B('#8899aa',false,tx,(sb?h:hb)+2,tz,.08,4,.08);beacons.push(box(.2,.2,.2,'#ff3b4e',tx,(sb?h:hb)+4.1,tz,null,true))}
        // escalier de secours sur les façades de brique
        if(style==='brick'&&hb>7){for(let y=3;y<hb-1;y+=2.4){const [ex,ez]=S.P(am-w*.15,-.45);B('#2a2e36',false,ex,y,ez,L.X?.8:1.4,.06,L.X?1.4:.8)}}
        a+=w+(r()<.25?.4:0);
      }
    }
    // seconde rangée, plus haute et plus sombre : la silhouette de la ville qui continue
    for(let b=S.a0-8;b<S.a1+8;){const w=6+Math.round(r()*6),h=24+Math.round(r()*26),o=13+r()*4,st='concrete';
      if(!(S.name==='nord'&&gapN(b+w/2))){mk(S,b+w/2,o+5,w,10,h,st,Math.floor(r()*3),S.ry);
        if(r()<.4){const [tx,tz]=S.P(b+w/2,o+5);beacons.push(box(.24,.24,.24,'#ff3b4e',tx,h+.4,tz,null,true))}}
      b+=w+1+r()*2}
  });
  // le sol au-delà de la grille (trottoir et cours), sous les deux rangées
  const gt=groundTex("paving");

  [[9.8,-34,92,0],[92,-34,130,76],[9.8,76,130,110]].forEach(([x0,z0,x1,z1])=>{const t=gt.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;const pl=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),new THREE.MeshLambertMaterial({map:t,color:0x8a8f9a}));t.repeat.set((x1-x0)/4,(z1-z0)/4);
    pl.rotation.x=-Math.PI/2;pl.position.set((x0+x1)/2,-.02,(z0+z1)/2);scene.add(pl)});
  // ---- les trottoirs extérieurs : arbres, lampadaires, bancs, poubelles, tous centrés sur le trottoir ----
  const leafM=new THREE.MeshLambertMaterial({color:0x2c5a34,flatShading:true}),leafM2=new THREE.MeshLambertMaterial({color:0x3a6e3c,flatShading:true});
  const tree=(x,z)=>{B('#4a4f58',false,x,.2,z,.9,.4,.9);B('#2a2218',false,x,.42,z,.7,.04,.7);B('#4a3524',false,x,1.2,z,.14,1.6,.14);
    [[0,2.4,0,.75,leafM],[.3,2.1,.2,.5,leafM2],[-.28,2.2,-.15,.55,leafM2],[0,2.85,.05,.5,leafM]].forEach(([dx,y,dz,rr,m])=>{const f=new THREE.Mesh(new THREE.IcosahedronGeometry(rr,1),m);f.position.set(x+dx,y,z+dz);f.rotation.y=r()*6;scene.add(f)});FURN.push([x,z,.48])};
  // dx, dz : la direction de la chaussée (la crosse du lampadaire penche vers elle, le dossier du banc lui tourne le dos)
  const lamp=(x,z,ax,dx,dz)=>{B('#2a2e36',false,x,2,z,.1,4,.1);B('#2a2e36',false,x+dx*.35,4,z+dz*.35,ax?.8:.08,.08,ax?.08:.8);B('#fff1d6',true,x+dx*.7,3.93,z+dz*.7,.3,.05,.3);
    glow(x+dx*.7,z+dz*.7,2.4,'#ffd9a0',.22);FURN.push([x,z,.16])};
  const bench=(x,z,ax,dx,dz)=>{B('#5a4030',false,x,.45,z,ax?.45:1.5,.06,ax?1.5:.45);B('#2a2e36',false,x,.22,z,ax?.35:1.3,.44,ax?1.3:.35);B('#5a4030',false,x-dx*.2,.72,z-dz*.2,ax?.06:1.5,.4,ax?1.5:.06);FURN.push([x,z,.6])};
  const bin=(x,z)=>{B('#3a5a46',false,x,.45,z,.42,.9,.42);B('#7cf29a',true,x,.86,z,.44,.04,.44);FURN.push([x,z,.25])};
  // nord : trottoir de 2 m (z de 0 à 2), est : x de 88 à 92, sud : z de 72 à 76 ; on suit chaque trottoir en son milieu
  // le trottoir nord est étroit : seulement des lampadaires et des poubelles, pour laisser passer de chaque côté
  const wide=['tree','bench','lamp','bin'],narrow=['lamp',null,'bin',null];
  const runs=[{x0:19,x1:86,P:a=>[a,1],ax:false,d:[0,1],it:narrow,skip:a=>a>23&&a<33},{x0:3,x1:72,P:a=>[90,a],ax:true,d:[-1,0],it:wide,skip:()=>false},{x0:19,x1:86,P:a=>[a,74],ax:false,d:[0,-1],it:wide,skip:()=>false}];
  // une place libre : pas sur la chaussée, pas dans un mur, pas collée à un autre objet ou à un lampadaire (évite que deux objets s'interpénètrent)
  const free=(x,z,rr)=>{const t=tile[I(Math.floor(x),Math.floor(z))];if(t===2||t===5||isSolid(x,z))return false;
    if(FURN.some(f=>Math.hypot(f[0]-x,f[1]-z)<f[2]+rr+.15))return false;if(LAMPS.some(([lx,lz])=>Math.hypot(lx+.5-x,lz+.5-z)<rr+.5))return false;return true};
  runs.forEach(R=>{let i=0;for(let a=R.x0;a<=R.x1;a+=4.6,i++){if(R.skip(a))continue;const [x,z]=R.P(a),kind=i%4,[dx,dz]=R.d;
    const t=R.it[kind];if(!t||!free(x,z,t==='tree'?.5:t==='bench'?.6:.25))continue;
    if(t==='tree')tree(x,z);else if(t==='lamp')lamp(x,z,R.ax,dx,dz);else if(t==='bench')bench(x,z,R.ax,dx,dz);else if(t==='bin')bin(x,z)}});
  // ---- garde-corps le long du quai et des pontons : on ne tombe pas à l'eau ----
  const pierGap=z=>PIERS.some(p=>z>p-.3&&z<p+2.3);
  for(let z=.3;z<75.8;z+=1.2){if(pierGap(z))continue;B('#3a4048',false,9.82,.5,z,.06,1,.06);B('#5a6470',false,9.82,1,z+.6,.05,.05,1.2);B('#5a6470',false,9.82,.55,z+.6,.03,.03,1.2)}
  PIERS.forEach(p=>{[p-.02,p+2.02].forEach(zz=>{for(let x=2.6;x<9.6;x+=1.2){B('#3a4048',false,x,.62,zz,.05,.9,.05);B('#5a6470',false,x+.6,1.06,zz,1.2,.05,.05)}});
    B('#5a6470',false,2.05,1.06,p+1,.05,.05,2.1);for(let zz=p;zz<=p+2;zz+=1)B('#3a4048',false,2.05,.62,zz,.05,.9,.05);B('#ffb547',true,2.05,1.1,p+1,.08,.04,.4)});
  // ---- de grands écrans publicitaires sur la bordure, tournés vers la ville : la ville vit aussi le jour ----
  [[38,.02,0],[58,.02,0],[78,.02,0],[92.02,20,-Math.PI/2],[92.02,48,-Math.PI/2],[40,76.02,Math.PI],[66,76.02,Math.PI]].forEach(([x,z,ry],i)=>adScreen(x,6.4+(i%2)*1.1,z,ry,4.6,2.6));
  for(const k in boxes){const e=k.endsWith('!');instBoxes(boxes[k],e?k.slice(0,-1):k,e)}
  buildGroundDetails(free);
}

// ---- petits détails au sol sur les places et les trottoirs trop vides ----
// Des marques plates (taches d'huile, grilles, bandes podotactiles, feuilles, LED au sol) et quelques objets (caisses, cartons, bacs à plantes,
// distributeurs, chariots à nouilles, bornes holographiques). Rien près des entrées, rien sur la chaussée, rien qui touche un autre objet.
function buildGroundDetails(free){
  let s=777;const r=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
  const decal=(draw)=>{const c=document.createElement('canvas');c.width=c.height=64;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);return t};
  const DEC=[
    decal(g=>{const q=g.createRadialGradient(32,32,2,32,32,30);q.addColorStop(0,'rgba(8,8,12,.75)');q.addColorStop(.7,'rgba(20,10,30,.35)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,64,64);g.fillStyle='rgba(120,60,200,.18)';g.beginPath();g.ellipse(36,28,14,6,.4,0,7);g.fill()}), // tache d'huile irisée
    decal(g=>{g.fillStyle='#1a1d22';g.fillRect(8,8,48,48);g.fillStyle='#050608';for(let i=0;i<8;i++)g.fillRect(12+i*5.5,12,3,40)}), // grille d'évacuation
    decal(g=>{g.fillStyle='#b89a3a';g.fillRect(4,20,56,24);g.fillStyle='#8a7228';for(let i=0;i<7;i++)for(let j=0;j<3;j++){g.beginPath();g.arc(9+i*8,26+j*7,2,0,7);g.fill()}}), // bande podotactile
    decal(g=>{for(let i=0;i<14;i++){g.fillStyle=['#7a4a1e','#9a6a28','#5a3a1a','#b07a30'][i%4];g.save();g.translate(8+Math.random()*48,8+Math.random()*48);g.rotate(Math.random()*6);g.beginPath();g.ellipse(0,0,4,2,0,0,7);g.fill();g.restore()}}), // feuilles mortes
    decal(g=>{g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=1.5;g.beginPath();let x=4,y=30;g.moveTo(x,y);for(let i=0;i<8;i++){x+=7;y+=(Math.random()-.5)*12;g.lineTo(x,y)}g.stroke()}), // fissure
    decal(g=>{g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,26,64,12);g.fillStyle='#39e6ff';g.fillRect(0,30,64,4)}), // bande LED encastrée
    decal(g=>{g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=3;g.beginPath();g.moveTo(32,8);g.lineTo(32,50);g.moveTo(18,36);g.lineTo(32,52);g.lineTo(46,36);g.stroke()})]; // flèche peinte
  const lists=DEC.map(()=>[]);
  const props=[];
  const [PX,PZ]=front("market",-1.6,1.8),keep=[[PX,PZ,2.2],[64.2,61.5,3.6],...NPC_DEF.map(n=>[n.x,n.z,1.6])]; // trémie du Bazar, place du taxi, personnages
  for(let z=1;z<H-1;z++)for(let x=11;x<W-1;x++){const t=tile[I(x,z)];if((t!==0&&t!==1&&t!==4)||solid[I(x,z)])continue;if(nearEntrance(x,z)||keep.some(([a,b,rr])=>Math.hypot(x+.5-a,z+.5-b)<rr))continue;
    const cx=x+.2+r()*.6,cz=z+.2+r()*.6;
    if(r()<.07){const k=t===1?[0,1,3,4][Math.floor(r()*4)]:Math.floor(r()*DEC.length);if(k===5&&t===1)continue;lists[k].push([cx,cz,r()*6,.6+r()*.7])}
    else if(t===0&&r()<.012){let ok=true;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const tt=tile[I(x+a,z+b)];if(tt===2||solid[I(x+a,z+b)])ok=false}if(ok&&free(cx,cz,.6))props.push([cx,cz,Math.floor(r()*6),r()*6])}}
  DEC.forEach((tx,k)=>{const L=lists[k];if(!L.length)return;const m=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,opacity:k===5?.9:.85,blending:k===5?THREE.AdditiveBlending:THREE.NormalBlending}),L.length);
    const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sc=new THREE.Vector3(),p=new THREE.Vector3();
    L.forEach(([x,z,a,s2],i)=>{e.set(0,a,0);q.setFromEuler(e);p.set(x,.017+k*.001,z);sc.set(s2,1,s2);m4.compose(p,q,sc);m.setMatrixAt(i,m4)});m.renderOrder=1;scene.add(m)});
  // les objets : chacun bloque le passage et ne touche rien d'autre
  props.forEach(([x,z,k,a])=>{
    if(k===0){box(.7,.6,.7,'#6a4a2a',x,.3,z).rotation.y=a;box(.5,.45,.5,'#7a5a34',x+.1,.82,z-.05).rotation.y=a+.3;FURN.push([x,z,.5])} // caisses
    else if(k===1){box(.6,.4,.5,'#9a7a4e',x,.2,z).rotation.y=a;box(.45,.35,.4,'#a8885a',x+.35,.18,z+.3).rotation.y=a+.6;FURN.push([x+.15,z+.15,.55])} // cartons
    else if(k===2){box(1.2,.5,.5,'#3a4048',x,.25,z).rotation.y=a;const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.4,1),new THREE.MeshLambertMaterial({color:0x2f6a3a,flatShading:true}));f.position.set(x,.75,z);f.scale.set(1.4,.8,.8);f.rotation.y=a;scene.add(f);FURN.push([x,z,.65])} // bac à plantes
    else if(k===3){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=a;scene.add(g);box(.8,1.9,.6,'#1a1e28',0,.95,0,g);box(.64,1.1,.04,pick(['#39e6ff','#ff4fa3','#7dffb0']),0,1.2,.31,g,true);box(.3,.1,.05,'#ffb547',.15,.45,.31,g,true);FURN.push([x,z,.55])} // distributeur
    else if(k===4){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=a;scene.add(g);box(1.2,.8,.7,'#7a2e22',0,.55,0,g);box(1.4,.06,.9,'#ffb547',0,1.9,0,g,true);[-.6,.6].forEach(dx=>box(.05,1.1,.05,'#2a2e36',dx,1.35,.4,g));
      [-.4,.4].forEach(dx=>{const w2=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.06,12),mat('#15171c'));w2.rotation.x=Math.PI/2;w2.position.set(dx,.16,.36);g.add(w2)});box(.3,.25,.3,'#d0d4d8',.3,1.08,0,g);FURN.push([x,z,.75])} // chariot à nouilles
    else{const c=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,1.6,12),mat('#14181f'));c.position.set(x,.8,z);scene.add(c);
      const h2=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.1,16,1,true),new THREE.MeshBasicMaterial({color:pick([0x39e6ff,0xff4fa3,0xb98cff]),transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));h2.position.set(x,2.2,z);scene.add(h2);
      box(.36,.04,.36,'#39e6ff',x,1.62,z,null,true);FURN.push([x,z,.3])} // borne holographique
  });
}
