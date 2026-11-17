// Rues et sol : asphalte et dalles texturés, flaques qui reflètent les néons, plaques d'égout, grilles, flèches au sol,
// mobilier urbain, feux tricolores (respectés par les voitures), câbles et lampions au-dessus des avenues, tags.
'use strict';

let srnd_s=7331;const srnd=()=>{srnd_s=(srnd_s*16807)%2147483647;return (srnd_s-1)/2147483646};
const FURN=[],trafficLights=[],puddles=[],BENCHES=[];let wetness=-1; // BENCHES : bancs où l’on peut s’asseoir (fx, fz : direction du regard)
// ---------- textures du sol (tuile de 4 × 4 unités, appliquée selon la position dans le monde) ----------
function groundTex(kind){
  const ph=TEXIMG[kind==='asphalt'?'asphalt':'paving'];if(ph){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.drawImage(ph,0,0,256,256);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,0,256,256);
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;return t}
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  const sp=(n,cols,s)=>{for(let i=0;i<n;i++){g.fillStyle=cols[i%cols.length];g.fillRect((srnd()*128)|0,(srnd()*128)|0,s||1,s||1)}};
  if(kind==='asphalt'){g.fillStyle='#d6d9e0';g.fillRect(0,0,128,128);sp(5200,['#c4c8d0','#e2e5ea','#b8bcc6','#cfd3da']);
    for(let p=0;p<3;p++){g.fillStyle='rgba(60,64,74,.18)';g.fillRect((srnd()*100)|0,(srnd()*100)|0,14+((srnd()*20)|0),10+((srnd()*16)|0))} // rapiéçages
    g.strokeStyle='rgba(40,44,52,.55)';g.lineWidth=1;for(let k=0;k<5;k++){let x=srnd()*128,y=srnd()*128;g.beginPath();g.moveTo(x,y);for(let s=0;s<6;s++){x+=(srnd()-.5)*16;y+=(srnd()-.5)*16;g.lineTo(x,y)}g.stroke()} // fissures
  }else{g.fillStyle='#d2d5dc';g.fillRect(0,0,128,128);
    for(let ty=0;ty<4;ty++)for(let tx=0;tx<4;tx++){const v=200+((srnd()*40)|0);g.fillStyle='rgb('+v+','+(v+2)+','+(v+8)+')';g.fillRect(tx*32+1,ty*32+1,30,30)} // dalles
    sp(2600,['#b8bcc6','#e6e9ee','#c4c8d0']);g.fillStyle='rgba(30,34,42,.55)';for(let i=0;i<=4;i++){g.fillRect(i*32,0,1,128);g.fillRect(0,i*32,128,1)}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;return t;
}
function worldUVMaterial(map,kind){ // la texture suit la position au sol : pas de motif identique d'une case à l'autre
  const nm=kind?normalTex(kind,1,1,1):null;
  const m=new THREE.MeshPhongMaterial({map,normalMap:nm,normalScale:new THREE.Vector2(1.3,1.3),shininess:40,specular:0x2a3040,transparent:true,opacity:mirror?.86:1});
  m.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_INSTANCING\n vUv=(modelMatrix*instanceMatrix*vec4(position,1.0)).xz*.25;\n#endif')};
  return m;
}
function buildGround(){
  const grp=new THREE.Group();scene.add(grp);ground=grp;
  const base=['#2a2f3a','#3a404c','#1e2129','#5a3d2b','#323642','#1a323c'];
  const kinds={asphalt:[],paving:[],other:[]};
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){const t=tile[I(x,z)];(t===2?kinds.asphalt:(t===0||t===1||t===4)?kinds.paving:kinds.other).push([x,z,t])}
  const geo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),m4=new THREE.Matrix4(),col=new THREE.Color();
  [['asphalt',worldUVMaterial(groundTex('asphalt'),'asphalt')],['paving',worldUVMaterial(groundTex('paving'),'paving')],['other',new THREE.MeshLambertMaterial({transparent:true,opacity:mirror?.86:1})]].forEach(([k,mt])=>{
    const L=kinds[k],gm=new THREE.InstancedMesh(geo,mt,L.length);
    L.forEach(([x,z,t],i)=>{m4.makeTranslation(x+.5,0,z+.5);gm.setMatrixAt(i,m4);col.set(base[t]);let j=(rnd()-.5)*.02;if(t===3&&z%2)j-=.04;col.offsetHSL(0,0,j);gm.setColorAt(i,col)});
    grp.add(gm)});
}
// ---------- accumulation de petites pièces ----------
const SD={};const sd=(c,e,x,y,z,w,h,d)=>{const k=c+(e?'!':'');(SD[k]=SD[k]||[]).push([x,y,z,w,h,d])};
function instDisc(list,r,h,color,emis){if(!list.length)return;const m=new THREE.InstancedMesh(new THREE.CylinderGeometry(r,r,h,16),mat(color,emis),list.length),m4=new THREE.Matrix4();list.forEach(([x,y,z],i)=>{m4.makeTranslation(x,y,z);m.setMatrixAt(i,m4)});scene.add(m)}
const nearCross=(x,z,d)=>AVE.some(a=>Math.abs(x-UX(a))<d)&&AVE.some(b=>Math.abs(z-UZ(b))<d);
const onTile=(x,z,t)=>{const cx=Math.floor(x),cz=Math.floor(z);return cx>=0&&cz>=0&&cx<W&&cz<H&&tile[I(cx,cz)]===t&&!solid[I(cx,cz)]};
function buildStreets(){
  // plaques d'égout et grilles d'évacuation le long des trottoirs
  const holes=[],rims=[];
  // jamais une plaque sous une flèche peinte (les flèches sont à 5 m des carrefours, voir plus bas)
  const nearArrow=(x,z)=>AVE.some(a=>AVE.some(b=>{const cx=UX(a),cz=UZ(b);return [[cx-.8,cz-5],[cx+.8,cz+5],[cx-5,cz+.8],[cx+5,cz-.8]].some(([ax,az])=>Math.hypot(ax-x,az-z)<1.5)}));
  AVE.forEach(a=>{for(let t=.08;t<.98;t+=.14){[[UX(a)+(srnd()<.5?.8:-.8),UZ(t)],[UX(t),UZ(a)+(srnd()<.5?.8:-.8)]].forEach(([x,z])=>{if(onTile(x,z,2)&&!nearCross(x,z,2.8)&&!nearArrow(x,z)){holes.push([x,.012,z]);rims.push([x,.008,z])}})}
    for(let t=.05;t<.98;t+=.09)[[UX(a)+1.45,UZ(t),.2,.7],[UX(a)-1.45,UZ(t)+1.3,.2,.7],[UX(t),UZ(a)+1.45,.7,.2],[UX(t)+1.3,UZ(a)-1.45,.7,.2]].forEach(([x,z,w,d])=>{if(onTile(x,z,2)&&!nearCross(x,z,2.6)){sd('#0c0f14',false,x,.012,z,w,.02,d);for(let i=-1;i<=1;i++)sd('#2a3038',false,x+(w<d?0:i*.2),.016,z+(w<d?i*.2:0),w<d?.18:.04,.01,w<d?.04:.18)}})});
  instDisc(rims,.5,.012,'#3a414c');instDisc(holes,.42,.014,'#1a1e25');
  // flèches au sol avant chaque carrefour, dans le sens de la voie (on roule à droite)
  const ac=document.createElement('canvas');ac.width=32;ac.height=64;const ag=ac.getContext('2d');ag.fillStyle='rgba(230,236,244,.85)';ag.fillRect(12,22,8,40);ag.beginPath();ag.moveTo(4,26);ag.lineTo(16,4);ag.lineTo(28,26);ag.fill();
  const am=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(ac),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),ag2=new THREE.PlaneGeometry(.55,1.1).rotateX(-Math.PI/2),arrows=[];
  AVE.forEach(a=>AVE.forEach(b=>{const cx=UX(a),cz=UZ(b);[[cx-.8,cz-5,Math.PI],[cx+.8,cz+5,0],[cx-5,cz+.8,-Math.PI/2],[cx+5,cz-.8,Math.PI/2]].forEach(([x,z,r])=>{if(onTile(x,z,2))arrows.push([x,z,r])})}));
  // la flèche pointe vers le carrefour (sens de circulation)
  const im=new THREE.InstancedMesh(ag2,am,arrows.length),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  arrows.forEach(([x,z,r],i)=>{q.setFromEuler(e.set(0,r,0));m4.compose(new THREE.Vector3(x,.016,z),q,new THREE.Vector3(1,1,1));im.setMatrixAt(i,m4)});scene.add(im);
  // mobilier urbain côté bordure, jamais aux carrefours ni devant une entrée
  const place=(x,z,along)=>{if(!onTile(x,z,1)||nearCross(x,z,3.4)||nearEntrance(Math.floor(x),Math.floor(z))||Math.hypot(x-TAXI_STAND.x,z-TAXI_STAND.z)<3||LAMPS.some(([lx,lz])=>Math.hypot(lx+.5-x,lz+.5-z)<1.3)||(x<UX(.2)&&z>UZ(.72)))return;
    const r=srnd(),X=along==='z';
    if(r<.32){sd('#2a313c',false,x,.42,z,.46,.84,.46);sd('#3a4252',false,x,.87,z,.5,.06,.5);sd('#7dffb0',true,x+(X?.24:0),.7,z+(X?0:.24),X?.02:.12,.06,X?.12:.02);FURN.push([x,z,.32])}
    else if(r<.46){sd('#4a3526',false,x,.42,z,X?.38:1.4,.08,X?1.4:.38);sd('#4a3526',false,x+(X?.17:0),.66,z+(X?0:.17),X?.05:1.4,.34,X?1.4:.05);sd('#2a3140',false,x,.2,z,X?.3:1.2,.38,X?1.2:.3);FURN.push([x,z,.6]);BENCHES.push({x,z,fx:X?-1:0,fz:X?0:-1})}
    else if(r<.68){sd('#2a2f38',false,x,.25,z,.9,.5,.9);sd(pick(['#39e6ff','#ff4fa3','#7dffb0']),true,x,.51,z,.92,.04,.92);sd('#3a2a20',false,x,1.2,z,.12,1.5,.12);
      const fol=pick([['#1f4a32','#2a5a3a'],['#244a3e','#2c5a46'],['#2a5a3a','#356a42']]); // une seule teinte de feuillage par arbre (plus de mauve qui perce le vert)
      [[0,2.1,0,1.1,0],[.25,2.5,.15,.8,1],[-.2,2.6,-.1,.7,1]].forEach(([dx,y,dz,s,k])=>sd(fol[k],false,x+dx,y,z+dz,s,s*.8,s));FURN.push([x,z,.55])}
    else if(r<.78){sd('#d8a020',false,x,.3,z,.26,.6,.26);sd('#e8b030',false,x,.64,z,.32,.08,.32);sd('#d8a020',false,x,.4,z,.42,.08,.1);FURN.push([x,z,.25])}
    else if(r<.9){[-.5,.5].forEach(o=>{const bx=x+(X?0:o),bz=z+(X?o:0);sd('#3a414c',false,bx,.35,bz,.14,.7,.14);sd('#ffb547',true,bx,.66,bz,.16,.04,.16);FURN.push([bx,bz,.15])})}
    else{sd('#20262f',false,x,.6,z,.34,1.2,.26);sd('#39e6ff',true,x+(X?.18:0),.85,z+(X?0:.18),X?.02:.2,.3,X?.2:.02);FURN.push([x,z,.3])}};
  AVE.forEach(a=>{for(let t=.02;t<1;t+=.052){[-1,1].forEach(s=>{place(UX(a)+s*1.74,UZ(t)+srnd()*.6,'z');place(UX(t)+srnd()*.6,UZ(a)+s*1.74,'x')})}});
  // feux tricolores : deux par carrefour, l'un pour l'axe nord-sud, l'autre pour l'axe est-ouest
  AVE.forEach(a=>AVE.forEach(b=>{const cx=UX(a),cz=UZ(b);
    [[cx+2,cz+2,'z',-1,0],[cx-2,cz-2,'x',0,1]].forEach(([x,z,axis,dx,dz])=>{if(!onTile(x,z,1)&&!onTile(x,z,0))return;
      const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box(.14,3.3,.14,'#2a3140',0,1.65,0,g);
      const ax=dx?-1:0,az=dz?1:0;box(ax?1.6:.1,.1,az?1.6:.1,'#2a3140',ax*.8,3.2,az*.8,g);
      const hx=ax*1.5,hz=az*1.5;box(.3,.9,.3,'#14181f',hx,2.8,hz,g);
      const L=['#ff3b4e','#ffb547','#5dff9a'].map((c,i)=>box(.34,.17,.34,c,hx,3.08-i*.28,hz,g,true));
      trafficLights.push({axis,L});FURN.push([x,z,.2])})}));
  // câbles et lampions tendus au-dessus des avenues
  const cm=new THREE.LineBasicMaterial({color:0x05070b});
  AVE.forEach((a,ai)=>{for(let t=.15+ai*.02;t<.95;t+=.25){[['z',UX(a),UZ(t)],['x',UX(t),UZ(a)]].forEach(([ax,p,q])=>{if(nearCross(ax==='z'?p:q,ax==='z'?q:p,4))return;const pts=[],y0=7+srnd()*2;
    for(let i=0;i<=12;i++){const s=i/12,o=-3.4+6.8*s,y=y0-Math.sin(s*Math.PI)*1.1;pts.push(ax==='z'?new THREE.Vector3(p+o,y,q):new THREE.Vector3(q,y,p+o))}
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),cm));
    [3,6,9].forEach(i=>{const v=pts[i];sd(pick(['#ff4fa3','#ffb547','#39e6ff','#ff3b4e']),true,v.x,v.y-.25,v.z,.22,.3,.22)})})}});
  // tags sur les murs bas des immeubles en brique et en béton (façade est, au-dessus des vitrines)
  const TAGS=['MOTH','LÉTHÉ = MENSONGE','ZONE ZÉRO','NEURA ♥','BXL 2089','KUROGANE DEHORS','OÙ SONT-ILS ?'];
  TOWERS.forEach((b,k)=>{if(!b.box||b.comm||!['brick','concrete','resi'].includes(b.style)||k%2)return;const x=UX(b.u),z=UZ(b.v),w=2*b.s*MS;
    const c=document.createElement('canvas');c.width=128;c.height=48;const g=c.getContext('2d'),txt=TAGS[k%TAGS.length],col=pick(['#ff4fa3','#39e6ff','#7dffb0','#ffb547','#c88bff']);
    g.font='bold 20px Silkscreen, monospace';g.textAlign='center';g.textBaseline='middle';g.lineWidth=5;g.strokeStyle='rgba(0,0,0,.55)';g.strokeText(txt,64,25,120);g.fillStyle=col;g.fillText(txt,64,24,120);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w*.7,2.6),.95),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),transparent:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4,emissive:0x222222}));
    m.position.set(x+w/2+.03,2.95,z+w*.12);m.rotation.y=Math.PI/2;scene.add(m)});
  // flaques : elles brillent davantage quand il pleut, et reflètent les couleurs des néons voisins
  const pc=document.createElement('canvas');pc.width=pc.height=64;const pg=pc.getContext('2d');
  for(let i=0;i<7;i++){const gr=pg.createRadialGradient(32+(srnd()-.5)*26,32+(srnd()-.5)*26,0,32,32,12+srnd()*14);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');pg.fillStyle=gr;pg.fillRect(0,0,64,64)}
  const ptex=new THREE.CanvasTexture(pc);
  for(let i=0;i<46;i++){const a=AVE[Math.floor(srnd()*4)],t=.04+srnd()*.92,s=srnd()<.5,x=s?UX(a)+(srnd()-.5)*3.6:UX(t),z=s?UZ(t):UZ(a)+(srnd()-.5)*3.6;if(!onTile(x,z,2)&&!onTile(x,z,1))continue;
    const sz=1.2+srnd()*1.8,col=new THREE.Color(pick(['#ff4fa3','#39e6ff','#b98cff','#ffb547','#7dffb0']));
    const dark=new THREE.Mesh(new THREE.PlaneGeometry(sz,sz*.7).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:ptex,color:0x03060c,transparent:true,opacity:.5,depthWrite:false}));dark.position.set(x,.018,z);dark.rotation.y=srnd()*3;scene.add(dark);
    const glint=new THREE.Mesh(new THREE.PlaneGeometry(sz*.8,sz*.5).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:ptex,color:col,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false}));glint.position.set(x,.022,z);glint.rotation.y=dark.rotation.y;scene.add(glint);
    puddles.push({dark,glint,ph:srnd()*6})}
  for(const k in SD){const e=k.endsWith('!');instBoxes(SD[k],e?k.slice(0,-1):k,e)}
}
// cycle des feux : 7 s vert nord-sud, 1 s orange, 7 s vert est-ouest, 1 s orange
function lightState(axis){const p=tAcc%16,zg=p<7,zy=p>=7&&p<8,xg=p>=8&&p<15,xy=p>=15;return axis==='z'?(zg?2:zy?1:0):(xg?2:xy?1:0)}
function updateStreets(dt){
  trafficLights.forEach(t=>{const s=lightState(t.axis);t.L.forEach((m,i)=>m.visible=(2-i)===s)});
  // sol mouillé seulement quand il pleut (pas sous le soleil, ni dans une tempête de sable) : reflets, flaques et brillance suivent
  const w=typeof WEATHERS!=='undefined'?WEATHERS[weatherIdx]:null,wantWet=w&&w.rain>0&&!w.sand?1:0;if(wetness<0)wetness=wantWet;wetness+=(wantWet-wetness)*Math.min(1,dt*.25);const wet=wetness;
  if(mirror)mirror.visible=wet>.02;if(ground)ground.children.forEach(m=>{const M=m.material;M.opacity=1-.14*wet;M.transparent=wet>.02;if(M.shininess!==undefined)M.shininess=8+32*wet});
  puddles.forEach(p=>{p.dark.material.opacity=.6*wet;p.glint.material.opacity=.32*wet*(.8+.2*Math.sin(tAcc*1.7+p.ph))});
}
