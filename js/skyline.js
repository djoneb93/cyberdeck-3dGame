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
    {name:'nord',a0:17,a1:92,line:-.05,P:(a,o)=>[a,-o],ry:0,front:[0,1]},       // rue au sud de la rangée
    {name:'est',a0:-14,a1:90,line:92.05,P:(a,o)=>[92.05+o,a],ry:-Math.PI/2,front:[-1,0]},
    {name:'sud',a0:17,a1:92,line:76.05,P:(a,o)=>[a,76.05+o],ry:Math.PI,front:[0,-1]}];
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

  [[17,-34,92,0],[92,-34,130,76],[17,76,130,110]].forEach(([x0,z0,x1,z1])=>{const t=gt.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;const pl=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),new THREE.MeshLambertMaterial({map:t,color:0x8a8f9a}));t.repeat.set((x1-x0)/4,(z1-z0)/4);
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
  runs.forEach(R=>{let i=0;for(let a=R.x0;a<=R.x1;a+=4.6,i++){if(R.skip(a))continue;const [x,z]=R.P(a),kind=i%4,[dx,dz]=R.d;
    const t=R.it[kind];if(t==='tree')tree(x,z);else if(t==='lamp')lamp(x,z,R.ax,dx,dz);else if(t==='bench')bench(x,z,R.ax,dx,dz);else if(t==='bin')bin(x,z)}});
  for(const k in boxes){const e=k.endsWith('!');instBoxes(boxes[k],e?k.slice(0,-1):k,e)}
}
