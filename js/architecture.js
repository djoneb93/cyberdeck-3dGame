// Architecture de la ville : façades réalistes (verre, béton, brique, métal, résidentiel) et formes variées
// (gradins, cylindres, octogones, angles coupés, tours torsadées, bâtiments en L, balcons), couronnements, passerelles.
'use strict';

const STYLES=['glass','concrete','brick','metal','resi'];
// textures photo CC0 (ambientCG, voir assets/textures/CREDITS.md) ; si une image manque, on garde la texture peinte
const TEXIMG={};
function loadTextures(){return Promise.all(['asphalt','paving','concrete','brick','corrugated','metal'].flatMap(n=>[n,n+'_n']).map(n=>new Promise(r=>{const i=new Image();i.onload=()=>{TEXIMG[n]=i;r()};i.onerror=()=>r();i.src='assets/textures/'+n+'.jpg'})))}
// une photo en fond de façade, assombrie pour la nuit (tuile 4 × 4 unités, répétée en hauteur)
function photoBase(g,name,tint,dark){const ph=TEXIMG[name];if(!ph)return false;for(let y=0;y<128;y+=64)g.drawImage(ph,0,y,64,64);if(tint){g.globalAlpha=.55;g.fillStyle=tint;g.fillRect(0,0,64,128);g.globalAlpha=1}g.fillStyle='rgba(8,12,22,'+(dark||.5)+')';g.fillRect(0,0,64,128);return true}
function photoMat(name,rx,ry,dark){const ph=TEXIMG[name];if(!ph)return null;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.drawImage(ph,0,0,256,256);g.fillStyle='rgba(8,12,22,'+(dark||.45)+')';g.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.minFilter=THREE.LinearMipmapLinearFilter;const n=normalTex(name,1,rx,ry);
  return new THREE.MeshPhongMaterial({map:t,normalMap:n,normalScale:new THREE.Vector2(1,1),shininess:24,specular:0x2a3038})}
// relief (normal map) : la même image répétée comme la photo de couleur ; tiles=2 pour une tuile de façade (2 photos en hauteur)
const NCACHE={};
function normalTex(name,tiles,rx,ry){const ph=TEXIMG[name+'_n'];if(!ph)return null;const k=name+tiles;
  if(!NCACHE[k]){const c=document.createElement('canvas');c.width=256;c.height=256*tiles;const g=c.getContext('2d');for(let i=0;i<tiles;i++)g.drawImage(ph,0,i*256,256,256);NCACHE[k]=c}
  const t=new THREE.CanvasTexture(NCACHE[k]);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.minFilter=THREE.LinearMipmapLinearFilter;return t}
const STYLE_PHOTO={concrete:'concrete',brick:'brick',metal:'metal',resi:'concrete'};
let archSeed=20891;const arnd=()=>{archSeed=(archSeed*16807)%2147483647;return (archSeed-1)/2147483646};
const apick=a=>a[Math.floor(arnd()*a.length)];
const WARM=['#e8b878','#d8a868','#f0c080','#c89058'],COOL=['#bfe8ff','#9fd8ff','#e8f4ff'];
// Une tuile de façade = 4 unités de large × 8 de haut = 4 étages de 2 unités (64 × 128 pixels).
function paintFacade(style){
  const c=document.createElement('canvas'),e=document.createElement('canvas');c.width=e.width=128;c.height=e.height=256; // double résolution
  const g=c.getContext('2d'),x=e.getContext('2d');g.scale(2,2);x.scale(2,2);x.fillStyle='#000';x.fillRect(0,0,64,128);
  const lit=(px,py,w,h,col,a)=>{g.fillStyle=col;g.fillRect(px,py,w,h);x.globalAlpha=a==null?1:a;x.fillStyle=col;x.fillRect(px,py,w,h);x.globalAlpha=1};
  const speck=(n,cols)=>{for(let i=0;i<n;i++){g.fillStyle=cols[i%cols.length];g.fillRect((arnd()*64)|0,(arnd()*128)|0,1,1)}};
  if(style==='glass'){
    const gr=g.createLinearGradient(0,0,64,128);gr.addColorStop(0,'#123247');gr.addColorStop(.45,'#0c2232');gr.addColorStop(.55,'#1b4258');gr.addColorStop(1,'#0a1c2a');g.fillStyle=gr;g.fillRect(0,0,64,128);
    for(let f=0;f<4;f++)for(let col=0;col<4;col++){const px=col*16+1,py=f*32+2;
      if(arnd()<.38){const w=8+((arnd()*6)|0),h=12+((arnd()*10)|0);lit(px+((arnd()*(14-w))|0),py+26-h,w,h,apick(arnd()<.7?WARM:COOL),.85);
        g.fillStyle='rgba(10,30,45,.55)';g.fillRect(px,py,14,28)} // reflets par-dessus l'intérieur
      g.fillStyle='rgba(160,220,255,.08)';g.fillRect(px,py,3,28)}
    g.fillStyle='#0a141c';for(let i=0;i<=4;i++)g.fillRect(i*16,0,1,128);for(let f=0;f<4;f++){g.fillStyle='#07101a';g.fillRect(0,f*32+30,64,2);g.fillStyle='#2a4a5e';g.fillRect(0,f*32+29,64,1)}
  }else if(style==='concrete'){
    if(!photoBase(g,'concrete',null,.45)){g.fillStyle='#3a3d44';g.fillRect(0,0,64,128);speck(900,['#34373e','#42454c','#2e3138','#474a51'])}
    for(let f=0;f<4;f++){const y=f*32;g.fillStyle='#2c2f35';g.fillRect(0,y+30,64,2);
      for(let col=0;col<4;col++){const px=col*16+3;g.fillStyle='#1d2026';g.fillRect(px-1,y+7,12,18);
        if(arnd()<.42)lit(px,y+8,10,16,apick(WARM),.9);else{g.fillStyle='#141a24';g.fillRect(px,y+8,10,16);g.fillStyle='#22303e';g.fillRect(px+1,y+9,2,6)}
        g.fillStyle='#4a4d54';g.fillRect(px-1,y+25,12,1);if(arnd()<.3){g.fillStyle='#8a929c';g.fillRect(px+2,y+27,6,3)}}}
  }else if(style==='brick'){
    if(!photoBase(g,'brick',null,.55)){g.fillStyle='#3e211b';g.fillRect(0,0,64,128);
    for(let y=0;y<128;y+=3)for(let bx=-(y%6?3:0);bx<64;bx+=6){g.fillStyle=apick(['#6a3428','#5e2e24','#73392b','#572a21']);g.fillRect(bx,y,5,2)}}
    for(let f=0;f<4;f++){const y=f*32;g.fillStyle='#8a7a68';g.fillRect(0,y+30,64,2);
      for(let col=0;col<4;col++){const px=col*16+4;g.fillStyle='#9a8a76';g.fillRect(px-1,y+4,10,2);g.fillStyle='#1a1014';g.fillRect(px,y+6,8,20);
        if(arnd()<.45){lit(px+1,y+7,6,18,apick(WARM),.9);g.fillStyle='rgba(40,20,10,.5)';g.fillRect(px+1,y+15,6,1);g.fillRect(px+4,y+7,1,18)}
        g.fillStyle='#7a6a58';g.fillRect(px-1,y+26,10,1)}}
  }else if(style==='metal'){
    if(!photoBase(g,'metal',null,.6)){g.fillStyle='#22262d';g.fillRect(0,0,64,128)}
    else for(let y=0;y<128;y+=16)g.fillRect(0,y,0,0);
    if(!TEXIMG.metal)for(let y=0;y<128;y+=16)for(let px=0;px<64;px+=16){g.fillStyle=arnd()<.5?'#262b33':'#1f232a';g.fillRect(px+1,y+1,14,14);g.fillStyle='#2e343d';g.fillRect(px+1,y+1,14,1)}
    for(let f=0;f<4;f++){const y=f*32+12;g.fillStyle='#0e1218';g.fillRect(0,y-1,64,10);
      for(let s=0;s<8;s++){if(arnd()<.5)lit(s*8+1,y,6,8,apick(['#7af3ff','#ff8ac8','#e8f4ff','#ffd9a0']),.8);else{g.fillStyle='#141c26';g.fillRect(s*8+1,y,6,8)}}}
  }else{ // résidentiel : enduit délavé, petites fenêtres à stores
    const tint=apick(['#4c4252','#435257','#55493e','#3f4856']);if(!photoBase(g,'concrete',tint,.35)){g.fillStyle=tint;g.fillRect(0,0,64,128)}speck(600,['rgba(0,0,0,.18)','rgba(255,255,255,.06)']);
    for(let f=0;f<4;f++){const y=f*32;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,y+30,64,2);
      for(let col=0;col<4;col++){const px=col*16+3;g.fillStyle='#1e1a22';g.fillRect(px-1,y+9,11,15);
        if(arnd()<.5){lit(px,y+10,9,13,apick(WARM.concat(['#ff9ab8','#9dffb0'])),.85);g.fillStyle='rgba(0,0,0,.35)';for(let k=0;k<4;k++)g.fillRect(px,y+11+k*3,9,1)}
        else{g.fillStyle='#161420';g.fillRect(px,y+10,9,13)}}}
  }
  // salissures : coulures sous les fenêtres, pied de façade plus sombre
  for(let i=0;i<10;i++){const sx=(arnd()*64)|0;g.fillStyle='rgba(0,0,0,.12)';g.fillRect(sx,(arnd()*96)|0,1,10+((arnd()*24)|0))}
  return {c,e};
}
let FACADES=null; // peintes au premier usage, une fois les photos chargées
function facadesOf(s){if(!FACADES){FACADES={};STYLES.forEach(st=>FACADES[st]=[0,1,2].map(()=>paintFacade(st)))}return FACADES[s]}
function facTex(cv,rx,ry){const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
// Fenêtres en profondeur (« interior mapping ») : derrière chaque fenêtre allumée, le shader dessine une petite pièce
// en perspective (mur du fond, sol, plafond éclairé, murs de côté, un meuble, un écran ou un tableau) qui bouge avec le point de vue.
// Une case de fenêtre fait 1 × 2 unités (la texture de façade fait 4 colonnes × 4 étages pour 4 × 8 unités).
const INTERIOR_GLSL=`
#include <emissivemap_fragment>
#if defined(USE_EMISSIVEMAP)
{
  float lum=max(totalEmissiveRadiance.r,max(totalEmissiveRadiance.g,totalEmissiveRadiance.b));
  if(lum>0.015){
    vec3 pos=-vViewPosition;vec3 N=normalize(vNormal);
    vec3 dp1=dFdx(pos),dp2=dFdy(pos);vec2 du1=dFdx(vUv),du2=dFdy(vUv);
    vec3 p2=cross(dp2,N),p1=cross(N,dp1);vec3 T=normalize(p2*du1.x+p1*du2.x+1e-6),B=normalize(p2*du1.y+p1*du2.y+1e-6);
    vec3 rd=normalize(pos);vec3 d=vec3(dot(rd,T),dot(rd,B),max(-dot(rd,N),.06));
    vec2 cl=vUv*4.;vec2 id=floor(cl);vec2 f=fract(cl);
    vec3 p=vec3(f.x,f.y*2.,0.),sz=vec3(1.,2.,1.25);
    vec3 t3=vec3(d.x>0.?(sz.x-p.x)/d.x:-p.x/d.x, d.y>0.?(sz.y-p.y)/d.y:-p.y/d.y, sz.z/d.z);
    float t=min(t3.x,min(t3.y,t3.z));vec3 h=p+d*t;
    float hs=fract(sin(dot(id,vec2(12.9898,78.233)))*43758.5453),hs2=fract(hs*17.31);
    vec3 c;
    if(t==t3.z){
      c=mix(vec3(.8,.7,.58),vec3(.55,.62,.78),hs)*(.75+.35*h.y/sz.y);
      if(hs2>.5&&mod(floor(h.x*9.),2.)==0.)c*=.88;
      if(h.y<.78&&abs(h.x-.3-hs*.4)<.3)c=vec3(.12,.09,.1);
      if(hs2>.72&&(length(vec2(h.x-.62,h.y-1.32))<.1||(abs(h.x-.62)<.13&&h.y<1.2&&h.y>.55)))c=vec3(.04,.03,.05);
      if(abs(h.x-.72+hs2*.4)<.13&&abs(h.y-1.25)<.11)c=hs>.55?vec3(.3,1.1,1.4):vec3(1.1,.6,.35);
      if(hs2<.3&&abs(h.y-1.05)<.025)c*=.35;
    }else if(t==t3.y)c=d.y<0.?vec3(.2,.14,.1):vec3(1.,.95,.85)*(1.5-length(h.xz-vec2(.5,.6))*1.1);
    else c=vec3(.36,.33,.31)*(1.-.4*h.z/sz.z);
    float sh=1.-.5*h.z/sz.z;
    vec3 room=c*sh*(totalEmissiveRadiance/lum)*lum*1.6;
    float fr=pow(1.-clamp(-dot(rd,N),0.,1.),3.);room=mix(room,vec3(.32,.42,.58)*lum*1.3,fr*.55);
    if(abs(f.x-.5)<.014)room*=.25;
    float sw=f.x-f.y*.45;if(abs(sw-.12)<.035||abs(sw-.2)<.012)room+=vec3(.1,.12,.14)*lum;
    totalEmissiveRadiance=room;
  }
}
#endif`;
function interiorShader(s){s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',INTERIOR_GLSL)}
const MATC={};
function styleMat(style,rx,ry,variant){
  const key=style+'|'+((variant||0)%3)+'|'+rx.toFixed(2)+'|'+ry.toFixed(2);if(MATC[key])return MATC[key]; // façades identiques : un seul matériau
  const f=facadesOf(style)[(variant||0)%3],t=facTex(f.c,rx,ry),te=facTex(f.e,rx,ry);let m;
  if(style==='glass')m=new THREE.MeshPhongMaterial({map:t,emissive:0xffffff,emissiveMap:te,emissiveIntensity:.5,specular:0x5a7a96,shininess:70});
  else{const nm=STYLE_PHOTO[style]&&TEXIMG[STYLE_PHOTO[style]]?normalTex(STYLE_PHOTO[style],2,rx,ry):null; // relief de la matière photo
    m=new THREE.MeshPhongMaterial({map:t,emissive:0xffffff,emissiveMap:te,emissiveIntensity:style==='metal'?.5:.48,normalMap:nm,normalScale:new THREE.Vector2(1.2,1.2),specular:style==='metal'?0x3a4048:0x14181e,shininess:style==='metal'?30:10})}
  m.extensions={derivatives:true};m.onBeforeCompile=interiorShader;return MATC[key]=m;
}
// remplace la façade d'origine : les lieux aussi profitent des nouvelles textures
function facadeMat(v,rx,ry){return styleMat(STYLES[v%STYLES.length],rx,ry,v)}

// petits détails répétés, regroupés par couleur et dessinés en une seule fois
const DET={};
function det(color,emis,x,y,z,w,h,d){const k=color+(emis?'!':'');(DET[k]=DET[k]||[]).push([x,y,z,w,h,d])}
function flushDetails(){for(const k in DET){const e=k.endsWith('!');instBoxes(DET[k],e?k.slice(0,-1):k,e)}}
function addMesh(geo,mats,x,y,z,ry){const m=new THREE.Mesh(geo,mats);m.position.set(x,y,z);if(ry)m.rotation.y=ry;scene.add(m);camBlockers.push(m);return m}
function boxMats(style,w,h,d,v){const s1=styleMat(style,d/4,h/8,v),s2=styleMat(style,w/4,h/8,v);return [s1,s1,roofMat,roofMat,s2,s2]}

// ---------- une tour de la ville ----------
function archTower(b,k){
  const x=UX(b.u),z=UZ(b.v),w=2*b.s*MS,h=HZF(b.h),tall=h>13,neon=b.comm?'#8fb7ff':b.neon;
  const type=b.comm?'box':(tall?['setback','cyl','chamfer','twist','oct','setback']:['box','balcony','lshape','box','oct','chamfer','balcony'])[tall?(k*7+3)%6:(k*5+2)%7];
  const style=b.comm?'concrete':tall?['glass','metal','glass','concrete','glass'][k%5]:['brick','concrete','resi','brick','metal','resi'][k%6];
  b.type=type;b.box=['box','balcony','setback','chamfer'].includes(type);b.style=style;
  let top=h,tw=w; // sommet et largeur du dernier étage, pour les couronnements
  if(type==='box'||type==='balcony'){addMesh(new THREE.BoxGeometry(w,h,w),boxMats(style,w,h,w,k),x,h/2,z);det('#2a3242',false,x,h,z,w+.24,.18,w+.24)}
  if(type==='balcony'){for(let y=3.2;y<h-.8;y+=2){[[x,z+w/2+.24,w*.86,.46,true],[x+w/2+.24,z,.46,w*.86,false]].forEach(([bx,bz,bw,bd,front])=>{
    det('#565d68',false,bx,y,bz,bw,.08,bd);det('#20252d',false,front?bx:bx+.22,y+.2,front?bz+.22:bz,front?bw:.03,.32,front?.03:bw);
    if(arnd()<.25)det('#2f7a3e',false,bx+(front?(arnd()-.5)*bw*.8:0),y+.2,bz+(front?0:(arnd()-.5)*bw*.8),.3,.3,.3)})}}
  if(type==='setback'){let y=0;[[1,.5],[.8,.8],[.58,1]].forEach(([s,f])=>{const ww=w*s,hh=h*f-y;addMesh(new THREE.BoxGeometry(ww,hh,ww),boxMats(style,ww,hh,ww,k),x,y+hh/2,z);det('#2a3242',false,x,y+hh,z,ww+.24,.18,ww+.24);y+=hh;tw=ww})}
  if(type==='cyl'||type==='oct'){const seg=type==='cyl'?28:8,r=w/2*(type==='cyl'?.97:1),side=styleMat(style,2*Math.PI*r/4,h/8,k);
    const m=addMesh(new THREE.CylinderGeometry(r,r,h,seg,1),[side,roofMat,roofMat],x,h/2,z,type==='oct'?Math.PI/8:0);
    for(let y=4;y<h-1;y+=5){const t=new THREE.Mesh(new THREE.TorusGeometry(r+.03,.045,4,seg===8?8:40),mat(neon,true));t.rotation.x=Math.PI/2;if(seg===8)t.rotation.z=Math.PI/8;t.position.set(x,y,z);scene.add(t)}
    const lob=new THREE.Mesh(new THREE.CylinderGeometry(r+.06,r+.06,2.2,seg,1,true),new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:.18,side:THREE.DoubleSide}));lob.position.set(x,1.1,z);if(seg===8)lob.rotation.y=Math.PI/8;scene.add(lob);
    tw=w*.7}
  if(type==='chamfer'){const a=w/2,c=w*.18,s=new THREE.Shape();[[-a+c,-a],[a-c,-a],[a,-a+c],[a,a-c],[a-c,a],[-a+c,a],[-a,a-c],[-a,-a+c]].forEach(([px,py],i)=>i?s.lineTo(px,py):s.moveTo(px,py));
    const geo=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false});geo.rotateX(-Math.PI/2);addMesh(geo,[roofMat,styleMat(style,.25,.125,k)],x,0,z);
    [[a-c/2,a-c/2],[-a+c/2,a-c/2],[a-c/2,-a+c/2]].forEach(([ox,oz])=>det(neon,true,x+ox,h/2,z+oz,.06,h-.4,.06));tw=w*.7}
  if(type==='twist'){const n=Math.max(6,Math.round(h/2.6)),sh=h/n,sw=w*.7,ms=boxMats(style,sw,sh,sw,k);addMesh(new THREE.BoxGeometry(w*.46,h,w*.46),[roofMat,roofMat,roofMat,roofMat,roofMat,roofMat],x,h/2,z);
    for(let i=0;i<n;i++){addMesh(new THREE.BoxGeometry(sw,sh-.14,sw),ms,x,i*sh+sh/2,z,i*.075);det(neon,true,x,i*sh+sh-.02,z,w*.5,.04,w*.5)}tw=sw}
  if(type==='lshape'){const hb=h*.7;addMesh(new THREE.BoxGeometry(w,h,w/2),boxMats(style,w,h,w/2,k),x,h/2,z-w/4);addMesh(new THREE.BoxGeometry(w/2,hb,w/2),boxMats(style,w/2,hb,w/2,k+1),x+w/4,hb/2,z+w/4);
    addMesh(new THREE.BoxGeometry(w/2,2.4,w/2),boxMats(style,w/2,2.4,w/2,k+2),x-w/4,1.2,z+w/4); // terrasse sur le petit bloc
    for(let i=0;i<4;i++)det(apick(['#2f7a3e','#3d9a50','#25603a']),false,x-w/4+(arnd()-.5)*w*.36,2.6,z+w/4+(arnd()-.5)*w*.36,.4,.4+arnd()*.5,.4);det('#ffd59a',true,x-w/4,2.42,z+w/2-.05,w*.48,.05,.05)}
  // rez-de-chaussée commerçant sur les façades planes
  if(b.box&&!b.comm){const sc=apick(['#3e2e1a','#14323a','#3a1c2c','#1a3424','#2a2240']);const fw=type==='chamfer'?w*.6:w*.72;
    det(sc,true,x,.95,z+w/2+.04,fw,1.3,.06);det(sc,true,x+w/2+.04,.95,z,.06,1.3,fw);
    det('#1d2430',false,x,2.05,z+w/2+.22,fw+.3,.1,.55);det('#1d2430',false,x+w/2+.22,2.05,z,.55,.1,fw+.3);det(neon,true,x,2,z+w/2+.5,fw+.3,.05,.05)}
  // façades : climatiseurs, conduites, escaliers de secours
  if(b.box&&style!=='glass'&&!b.comm&&type!=='balcony'){for(let i=0;i<5;i++){const y=4+((arnd()*(Math.max(1,h-6)))|0),o=-w*.35+arnd()*w*.4;det('#8a929c',false,x+w/2+.16,y,z+o,.3,.34,.5)}
    det('#4a5058',false,x+w/2+.1,h/2,z-w/2+.35,.12,h-.2,.12)}
  if(style==='brick'&&b.box&&h>6)for(let y=3;y<h-1;y+=2){det('#2a2e36',false,x+w/2+.45,y,z-w*.15,.8,.06,1.3);det('#2a2e36',false,x+w/2+.82,y+.5,z-w*.15,.04,1,1.3)}
  // couronnements
  if(tall){const v=k%3;
    if(v===0){const sp=new THREE.Mesh(new THREE.ConeGeometry(tw*.16,h*.22,8),mat('#5a6472'));sp.position.set(x,top+h*.11,z);scene.add(sp);beacons.push(box(.24,.24,.24,'#ff3b4e',x,top+h*.22+.1,z,null,true))}
    else if(v===1){const ring=new THREE.Mesh(new THREE.TorusGeometry(tw*.36,.07,6,40),mat(neon,true));ring.rotation.x=Math.PI/2;ring.position.set(x,top+1.6,z);scene.add(ring);
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;det('#3a414c',false,x+Math.cos(a)*tw*.36,top+.8,z+Math.sin(a)*tw*.36,.14,1.6,.14)}beacons.push(box(.2,.2,.2,'#ff3b4e',x,top+2.2,z,null,true))}
    else{const pad=new THREE.Mesh(new THREE.CylinderGeometry(tw*.36,tw*.36,.16,24),mat('#2c313d'));pad.position.set(x,top+.1,z);scene.add(pad);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(tw*.33,.04,4,40),mat('#7dffb0',true));ring.rotation.x=Math.PI/2;ring.position.set(x,top+.2,z);scene.add(ring);
      det('#f2f2ee',true,x-.35,top+.19,z,.12,.02,.9);det('#f2f2ee',true,x+.35,top+.19,z,.12,.02,.9);det('#f2f2ee',true,x,top+.19,z,.7,.02,.12)}}
  else{ // petits toits : climatiseurs, château d'eau, jardin, paraboles
    const rt=type==='lshape'?h:top;for(let i=0;i<3;i++)det('#3a4252',false,x+(arnd()-.5)*tw*.6,rt+.25,z+(arnd()-.5)*tw*.6,.8,.5,.6);
    if(style==='resi')for(let i=0;i<5;i++)det(apick(['#2f7a3e','#3d9a50']),false,x+(arnd()-.5)*tw*.6,rt+.2,z+(arnd()-.5)*tw*.6,.5,.4,.5);
    if(arnd()<.5){const t=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.1,12),mat('#4a4f58'));t.position.set(x+tw/4,rt+1.15,z-tw/4);scene.add(t);det('#2a3140',false,x+tw/4,rt+.3,z-tw/4,.7,.6,.7)}}
  // liseré néon sur le sommet des tours à faces planes
  if(b.box)det(neon,true,x,top+.1,z+tw/2,tw+.1,.1,.1);
}
// passerelles vitrées entre deux grandes tours voisines
function skyBridges(){
  TOWERS.forEach(a=>TOWERS.forEach(c=>{
    const ia=Math.round(a.u*12-.5),ic=Math.round(c.u*12-.5),ja=Math.round(a.v*12-.5),jc=Math.round(c.v*12-.5);
    if(ja!==jc||ic!==ia+1||HZF(a.h)<13||HZF(c.h)<13)return;
    const x0=UX(a.u)+a.s*MS,x1=UX(c.u)-c.s*MS,y=Math.min(HZF(a.h),HZF(c.h))*.52,zz=UZ(a.v),len=x1-x0+.6;if(len<.8)return;
    addMesh(new THREE.BoxGeometry(len,1.3,1.5),[mat('#2a3140'),mat('#2a3140'),mat('#3a414c'),mat('#1a1f2b'),mat('#2a3140'),mat('#2a3140')],(x0+x1)/2,y,zz);
    det('#bfe8ff',true,(x0+x1)/2,y+.1,zz+.76,len-.3,.45,.02);det('#bfe8ff',true,(x0+x1)/2,y+.1,zz-.76,len-.3,.45,.02);det(a.neon,true,(x0+x1)/2,y-.67,zz,len,.05,1.52);
  }));
}
