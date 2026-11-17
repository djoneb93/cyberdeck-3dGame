// Rendu : moteur Three.js, matériaux, façades, enseignes, lueurs, sprites pixel des personnages.
'use strict';

/* ===================== RENDU ===================== */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false});
renderer.setPixelRatio(1);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0a0d1a);
scene.fog=new THREE.FogExp2(0x101428,0.024);
const camera=new THREE.PerspectiveCamera(48,1,0.1,220);
let PIX=2;
try{const p=+localStorage.getItem('neobxl-pix2');if(p>=1&&p<=4)PIX=p}catch(e){}
let composer=null,bloom=null,mirror=null;
function lowSize(){return [Math.max(1,Math.floor(innerWidth/PIX)),Math.max(1,Math.floor(innerHeight/PIX))]}
function resize(){const [lw,lh]=lowSize();renderer.setSize(lw,lh,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  if(composer){composer.setSize(lw,lh)}if(mirror)mirror.getRenderTarget().setSize(lw,lh)}
addEventListener('resize',resize);

const hemi=new THREE.HemisphereLight(0x5a6ab0,0x0a0a16,0.8);scene.add(hemi);
const moon=new THREE.DirectionalLight(0x7a8cff,0.3);moon.position.set(-20,40,30);scene.add(moon);

const matCache={};
function mat(color,emis){const k=color+(emis?'e':'');if(!matCache[k])matCache[k]=emis?new THREE.MeshBasicMaterial({color}):new THREE.MeshLambertMaterial({color});return matCache[k]}
const boxGeo=new THREE.BoxGeometry(1,1,1);
function box(w,h,d,color,x,y,z,parent,emis){const m=new THREE.Mesh(boxGeo,mat(color,emis));m.scale.set(w,h,d);m.position.set(x,y,z);(parent||scene).add(m);return m}
function nearestTex(c,rep){const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}return t}

let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
const pick=a=>a[Math.floor(rnd()*a.length)];
const PALS=[['#ffcf7a','#ffcf7a','#6fe8ff','#dfe8ff'],['#6fe8ff','#6fe8ff','#ff6fb3','#ffcf7a'],['#ff6fb3','#ffcf7a','#dfe8ff','#b48cff'],['#dfe8ff','#6fe8ff','#ffcf7a','#ffcf7a']];
const facades=PALS.map((pal,vi)=>{
  const c=document.createElement('canvas'),e=document.createElement('canvas');c.width=e.width=32;c.height=e.height=64;
  const g=c.getContext('2d'),ge=e.getContext('2d');
  g.fillStyle=['#1d2331','#22222c','#1b2129','#252131'][vi%4];g.fillRect(0,0,32,64);ge.fillStyle='#000';ge.fillRect(0,0,32,64);
  for(let f=0;f<4;f++){const y=f*16;
    g.fillStyle='#2b3344';g.fillRect(0,y+14,32,2);g.fillStyle='#161b26';g.fillRect(0,y+13,32,1);
    for(let k=0;k<4;k++){const x=k*8+2,lit=rnd()<.42,col=lit?(rnd()<.62?pick(['#ffd9a0','#ffe6c0','#ffcf8a']):pick(pal)):'#121824';
      g.fillStyle='#0c1017';g.fillRect(x-1,y+3,6,10);g.fillStyle=col;g.fillRect(x,y+4,4,8);
      if(lit){ge.fillStyle=col;ge.fillRect(x,y+4,4,8);ge.fillStyle='rgba(0,0,0,.55)';ge.fillRect(x,y+4,4,2);if(rnd()<.4){ge.fillRect(x+2,y+6,2,6)}}
      else{g.fillStyle='#1f2a3a';g.fillRect(x,y+4,1,3)}
    }}
  return {c,e};
});
const roofMat=new THREE.MeshLambertMaterial({color:0x1a1f2b});
const camBlockers=[];
function facadeMat(v,rx,ry){const f=facades[v%facades.length];const t=nearestTex(f.c,true),te=nearestTex(f.e,true);t.repeat.set(rx,ry);te.repeat.set(rx,ry);return new THREE.MeshLambertMaterial({map:t,emissive:0xffffff,emissiveMap:te,emissiveIntensity:.72})}

function signTexture(text,color,vertical){
  const c=document.createElement('canvas');const g=c.getContext('2d');const F='16px Silkscreen, monospace';g.font=F;
  if(vertical){const chars=[...text];c.width=28;c.height=chars.length*20+12;g.font=F;g.fillStyle='#07090e';g.fillRect(0,0,c.width,c.height);
    g.strokeStyle=color;g.lineWidth=2;g.strokeRect(2,2,c.width-4,c.height-4);g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';
    chars.forEach((ch,i)=>g.fillText(ch,14,17+i*20));}
  else{const tw=Math.ceil(g.measureText(text).width);c.width=tw+22;c.height=30;g.font=F;
    g.fillStyle='#07090e';g.fillRect(0,0,c.width,c.height);g.strokeStyle=color;g.lineWidth=2;g.strokeRect(2,2,c.width-4,c.height-4);
    g.fillStyle=color;g.textBaseline='middle';g.fillText(text,11,16);}
  const t=nearestTex(c);t.minFilter=THREE.LinearFilter;return {tex:t,w:c.width/2,h:c.height/2};
}
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');const gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})();
const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');const gr=g.createRadialGradient(8,8,0,8,8,8);gr.addColorStop(0,'rgba(0,0,0,.75)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,16,16);return new THREE.CanvasTexture(c)})();
function glow(x,z,r,color,op){const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:glowTex,color,transparent:true,opacity:op||.5,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.04,z);scene.add(m);return m}
function sign(text,color,x,y,z,ry,both,light,k,vertical,maxW){
  const s=signTexture(text,color,vertical);k=k||.085;if(maxW&&s.w*k>maxW)k=maxW/s.w;const w=s.w*k,h=s.h*k;
  // l'enseigne est montée sur un caisson sombre, et dessinée « par-dessus » : aucune texture ne peut la traverser
  const back=box(w+.08,h+.08,both?.06:.05,'#07090e',x,y,z);back.rotation.y=ry;
  const sm=new THREE.MeshBasicMaterial({map:s.tex,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
  const mk=r=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),sm);m.position.set(x+Math.sin(r)*.045,y,z+Math.cos(r)*.045);m.rotation.y=r;scene.add(m)};
  mk(ry);if(both)mk(ry+Math.PI);
  if(light!==false){const l=new THREE.PointLight(color,2.4,12,1.6);l.position.set(x+Math.sin(ry)*1.4,y-.6,z+Math.cos(ry)*1.4);scene.add(l)}
}

/* ===================== SPRITES PIXEL ===================== */
// Planche 96×256 : 3 images (immobile, pas A, pas B) × 4 directions (face, gauche, droite, dos). Une case = 32×64 pixels.
const SHC={};
function sh(c,f){const k=c+f;if(SHC[k])return SHC[k];const n=parseInt(c.slice(1),16);const cl=v=>Math.max(0,Math.min(255,Math.round(v*f)));
  return SHC[k]='#'+((1<<24)|(cl(n>>16&255)<<16)|(cl(n>>8&255)<<8)|cl(n&255)).toString(16).slice(1)}
function drawFigure(g,sp,dir,fr,ox,oy){
  const R=(x,y,w,h,c)=>{if(!c||w<=0||h<=0)return;g.fillStyle=c;g.fillRect(ox+x,oy+y,w,h)};
  const P=(x,y,c)=>R(x,y,1,1,c);
  const hs=sp.hs,hair=sp.hair,skin=sp.skin,head=sp.head||skin,top=sp.top,pants=sp.pants,shoes=sp.shoes;
  const sl=sp.sleeve||sp.coat||top,hand=sp.hand||skin,hand2=sp.hand2||hand,coat=sp.coat;
  if(dir===0||dir===3){
    const lL=fr===1?2:0,lR=fr===2?2:0;
    // jambes et chaussures
    R(12,39,3,20-lL,pants);R(14,39,1,20-lL,sh(pants,.72));R(17,39,3,20-lR,pants);R(17,39,1,20-lR,sh(pants,.72));
    R(11,59-lL,4,3,shoes);R(11,61-lL,4,1,sh(shoes,.55));R(17,59-lR,4,3,shoes);R(17,61-lR,4,1,sh(shoes,.55));
    R(11,36,10,3,pants);R(11,38,10,1,sh(pants,.8));
    // buste
    if(coat){R(10,19,12,24,coat);R(9,42,14,7,coat);R(20,19,2,24,sh(coat,.78));R(21,42,2,7,sh(coat,.78));R(10,19,1,24,sh(coat,1.12));
      if(dir===0){R(14,19,4,14,top);R(15,33,2,16,sh(coat,.62))}else R(16,30,1,19,sh(coat,.7));}
    else{R(10,19,12,6,top);R(11,25,10,11,top);R(19,19,3,6,sh(top,.78));R(19,25,2,11,sh(top,.78));R(10,19,1,6,sh(top,1.15));R(11,34,10,2,sh(top,.85))}
    // bras (balancier léger)
    const aL=fr===2?2:0,aR=fr===1?2:0;
    R(8,20,2,16-aL,sl);R(8,20,1,16-aL,sh(sl,1.12));R(8,36-aL,2,3,hand);
    R(22,20,2,16-aR,sl);R(23,20,1,16-aR,sh(sl,.75));R(22,36-aR,2,3,hand2);
    // tête
    R(15,17,2,2,sh(skin,.78));
    if((hs==='long'||hs==='asym')&&dir===0){R(10,6,3,15,sh(hair,.8));if(hs==='long')R(19,6,3,15,sh(hair,.8))}
    R(12,6,8,9,head);R(13,15,6,2,head);R(19,7,1,8,sh(head,.82));R(18,15,1,2,sh(head,.82));
    R(11,10,1,3,sh(head,.88));R(20,10,1,3,sh(head,.78));
    if(dir===0&&hs!=='helmet'){
      R(13,9,2,1,sh(hair,.85));R(17,9,2,1,sh(hair,.85));
      P(13,11,'#eef2f4');P(14,11,sp.eyes);P(17,11,sp.eyes);P(18,11,'#eef2f4');
      P(16,13,sh(head,.78));R(15,15,2,1,sh(head,.62));
      if(sp.beard){R(12,14,8,3,sp.beard);R(14,13,4,1,sp.beard);R(13,17,6,1,sp.beard);R(15,15,2,1,sh(sp.beard,.55))}
      if(sp.stubble)R(12,15,8,2,sp.stubble);
    }
    const H=hair,HL=sh(hair,1.3);
    if(hs==='helmet'){R(11,3,10,12,H);R(12,3,6,1,sh(H,1.4));if(dir===0)R(12,9,8,3,sp.visor)}
    else if(dir===3){
      R(11,3,10,13,H);R(12,3,6,1,HL);
      if(hs==='long'||hs==='asym')R(10,6,12,16,H);
      if(hs==='bob')R(10,4,12,12,H);
      if(hs==='buzz'){R(11,6,10,10,head);R(12,4,8,3,H)}
      if(hs==='cap'){R(11,3,10,5,sp.capC)}
      if(sp.beard)R(12,15,8,1,sh(head,.8));
    }else{
      if(hs==='short'){R(12,3,8,1,H);R(11,4,10,4,H);R(13,4,4,1,HL);R(11,6,1,5,H);R(20,6,1,5,H)}
      if(hs==='slick'){R(12,3,8,5,H);R(13,4,6,1,HL);R(11,5,1,5,H);R(20,5,1,5,H)}
      if(hs==='asym'){R(12,3,8,5,H);R(10,4,4,4,H);R(10,6,3,15,H);R(20,6,1,4,sh(head,.7));R(13,4,3,1,HL)}
      if(hs==='long'){R(12,3,8,5,H);R(11,4,1,6,H);R(20,4,1,6,H);R(13,4,4,1,HL);R(10,6,2,20,H);R(20,6,2,20,H)}
      if(hs==='bob'){R(11,3,10,5,H);R(10,5,2,11,H);R(20,5,2,11,H);R(12,8,8,1,H);R(13,4,4,1,HL)}
      if(hs==='messy'){R(11,2,10,5,H);R(10,4,2,4,H);R(20,4,2,4,H);P(11,1,H);P(15,1,H);P(19,1,H);P(21,3,H);R(13,3,4,1,HL)}
      if(hs==='buzz'){R(12,4,8,2,H);R(12,6,1,2,H);R(19,6,1,2,H)}
      if(hs==='cap'){R(11,3,10,5,sp.capC);R(11,8,10,1,sh(sp.capC,.7));R(12,4,4,1,sh(sp.capC,1.3))}
    }
    (dir===0?sp.f:sp.b||[]).forEach(e=>R(e[0],e[1],e[2],e[3],e[4]));
  }else{
    // profil tourné vers la droite (dir 2) ; la gauche est dessinée en miroir
    const bp=sh(pants,.68),bs=sh(shoes,.68);
    if(fr===0){R(15,39,3,20,bp);R(15,59,5,3,bs);R(14,39,3,20,pants);R(14,59,6,3,shoes);R(14,61,6,1,sh(shoes,.55))}
    else if(fr===1){R(13,39,3,10,bp);R(11,49,3,10,bp);R(9,59,5,3,bs);R(16,39,3,10,pants);R(18,49,3,10,pants);R(18,59,6,3,shoes);R(18,61,6,1,sh(shoes,.55))}
    else{R(15,39,3,17,bp);R(15,56,5,3,bs);R(14,39,3,20,pants);R(14,59,6,3,shoes);R(14,61,6,1,sh(shoes,.55))}
    R(13,36,7,3,pants);
    if(coat){R(12,19,9,24,coat);R(11,42,10,7,coat);R(12,19,2,24,sh(coat,.78));R(20,19,1,24,sh(coat,1.12))}
    else{R(13,19,7,17,top);R(13,19,2,17,sh(top,.78));R(19,19,1,17,sh(top,1.12))}
    (sp.s||[]).forEach(e=>R(e[0],e[1],e[2],e[3],e[4]));
    const s=fr===1?-1:fr===2?1:0;
    R(15,20,3,9,sl);R(15,20,1,9,sh(sl,.8));R(15+s*2,29,3,8,sl);R(15+s*2,37,3,3,hand2);
    R(16,17,2,2,sh(skin,.78));
    R(13,6,8,9,head);R(14,15,6,2,head);R(21,10,1,3,head);R(13,7,1,8,sh(head,.82));R(15,10,2,3,sh(head,.82));
    const H=hair,HL=sh(hair,1.3);
    if(hs==='helmet'){R(12,3,9,12,H);R(17,9,5,3,sp.visor)}
    else{
      R(18,9,2,1,sh(H,.85));P(18,11,'#eef2f4');P(19,11,sp.eyes);P(20,14,sh(head,.62));
      if(sp.beard){R(16,13,5,4,sp.beard);R(15,17,5,1,sp.beard)}
      if(sp.stubble)R(16,15,5,2,sp.stubble);
      if(hs==='cap'){R(12,3,9,5,sp.capC);R(19,7,5,1,sh(sp.capC,.7));R(12,6,3,5,H)}
      else if(hs==='buzz'){R(13,4,8,2,H);R(13,6,2,3,H)}
      else{R(12,3,9,4,H);R(12,6,4,6,H);R(14,3,5,1,HL);
        if(hs==='asym'||hs==='long')R(11,6,5,16,H);
        if(hs==='bob')R(11,5,6,11,H);
        if(hs==='messy'){P(13,2,H);P(17,2,H);P(21,4,H);R(11,5,2,4,H)}
        if(hs==='slick')R(12,6,3,4,H);}
    }
  }
}
function makeSheet(sp){
  const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d');
  for(let fr=0;fr<3;fr++){drawFigure(g,sp,0,fr,fr*32,0);drawFigure(g,sp,3,fr,fr*32,192);drawFigure(g,sp,2,fr,fr*32,128);
    const t=document.createElement('canvas');t.width=32;t.height=64;drawFigure(t.getContext('2d'),sp,2,fr,0,0);
    g.save();g.translate(fr*32+32,64);g.scale(-1,1);g.drawImage(t,0,0);g.restore();}
  // 4e colonne : assis sur un banc, les jambes tendues devant soi (le haut du corps descend à hauteur d'assise)
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(96+x,y,w,h)},pants=sp.pants,shoes=sp.shoes,dk=sh(pants,.72);
  [0,64,128,192].forEach(y0=>g.drawImage(c,0,y0,32,39,96,y0+11,32,39));
  R(11,48,10,3,pants);R(12,51,3,7,pants);R(14,51,1,7,dk);R(17,51,3,7,pants);R(17,51,1,7,dk);R(11,58,4,4,shoes);R(17,58,4,4,shoes); // de face : jambes vues de bout
  R(13,176,15,4,pants);R(13,179,15,1,dk);R(27,173,4,7,shoes);R(27,179,4,1,sh(shoes,.55)); // de profil (vers la droite), rangée 128
  const yL=64;g.fillStyle=pants;g.fillRect(96+4,yL+48,15,4);g.fillStyle=dk;g.fillRect(96+4,yL+51,15,1);g.fillStyle=shoes;g.fillRect(96+1,yL+45,4,7); // de profil (vers la gauche)
  return c;
}
const PXK=1.9/64;
const sprites=[];
function makeChar(sp,opts){
  opts=opts||{};
  const root=new THREE.Group();const tex=nearestTex(makeSheet(sp));tex.repeat.set(1/4,1/4);tex.offset.set(0,.75);
  const m=opts.holo?new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.55,color:0xa8f0ff,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})
    :new THREE.MeshLambertMaterial({map:tex,alphaTest:.5,side:THREE.DoubleSide,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.13});
  const s=(sp.scale||1)*(opts.scale||1);
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(32*PXK*s,64*PXK*s),m);plane.position.y=32*PXK*s;root.add(plane);
  if(!opts.holo){const sh=new THREE.Mesh(new THREE.PlaneGeometry(.9,.6),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.03;root.add(sh)}
  const hit=new THREE.Mesh(new THREE.BoxGeometry(.9,2.1,.9),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1;root.add(hit);
  root.userData={tex,plane,hit,phase:0,ry:0,moving:false};
  scene.add(root);sprites.push(root);return root;
}
const tmpV=new THREE.Vector3();
function updateSprite(c,dt){
  const ud=c.userData;
  const ca=Math.atan2(camera.position.x-c.position.x,camera.position.z-c.position.z);
  ud.plane.rotation.y=ca;
  let rel=((ca-ud.ry+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
  const a=Math.abs(rel);const dir=a<Math.PI/4?0:a>Math.PI*3/4?3:(rel>0?1:2);
  let fr=0;if(ud.moving&&!ud.sit){ud.phase+=dt*8;fr=[1,0,2,0][Math.floor(ud.phase)%4]}
  if(ud.sit)fr=3; // assis : 4e colonne de la planche (assis, jambes tendues)
  ud.tex.offset.set(fr/4,1-(dir+1)/4);
}

const SKINS=['#f1c7a5','#d9b08c','#c99a7a','#a8754f','#7a4e32','#5a3a28'];
const HAIRS=['#111216','#3a2a20','#6b4a2a','#c9a24a','#e8e8e4','#ff4fa3','#39e6ff','#b46bff','#7a2e22'];
const TOPS=['#3a2a4a','#1e3a4a','#5a2a2a','#2a4a3a','#ff8a3d','#c9b7ff','#d8d8d8','#ffb547','#2b2d31','#7a2e22','#39506a','#ff4fa3'];
const PANTS=['#1b1d24','#23262c','#2a3140','#3a2f28','#141018','#2a2a3a'];
function randomSpec(){
  const hs=pick(['short','long','bob','cap','buzz','messy','short']);const top=pick(TOPS);
  const sp={skin:pick(SKINS),hair:pick(HAIRS),hs,top,pants:pick(PANTS),shoes:pick(['#d8d8d8','#141414','#39e6ff','#5a4030']),eyes:'#111',capC:pick(['#ff3b4e','#1e3a4a','#ffb547','#161616']),f:[],s:[],scale:.9+rnd()*.18};
  if(rnd()<.3)sp.coat=pick(['#2b2d31','#3a3f4c','#5a4a3a','#1e2a44']);
  if(rnd()<.35){const a=pick(['#39e6ff','#ff4fa3','#ffb547','#b46bff']);sp.f.push([10,27,12,2,a]);sp.s.push([13,27,7,2,a])}
  if(rnd()<.25){const gc=pick(['#39e6ff','#ff3b4e','#111']);sp.f.push([12,11,8,1,gc]);sp.s.push([17,11,5,1,gc])} // visière / lunettes
  if(rnd()<.2)sp.beard=sh(sp.hair,.9);
  return sp;
}

const SPECS={
  you:{skin:'#c99a7a',hair:'#3a2a20',hs:'short',top:'#4a4f58',pants:'#23262c',shoes:'#d8d8d8',eyes:'#2a1a12',
    f:[[11,18,10,2,'#3d424b'],[10,26,12,2,'#ff8a3d'],[15,20,1,5,'#d8d8d8'],[17,20,1,4,'#d8d8d8']],
    b:[[11,17,10,5,'#3d424b'],[10,26,12,2,'#ff8a3d']],
    s:[[13,26,7,2,'#ff8a3d'],[12,17,3,4,'#3d424b'],[15,9,2,2,'#e8e2d6']]},
  mira:{skin:'#d9b08c',hair:'#0b0d12',hs:'asym',top:'#0f1218',pants:'#15171c',shoes:'#2a2e36',eyes:'#39e6ff',
    f:[[13,3,3,2,'#39e6ff'],[11,18,10,2,'#1a1e26'],[12,20,1,14,'#5a6472'],[19,20,1,14,'#5a6472'],[11,33,10,2,'#5a6472'],[18,17,1,2,'#39e6ff'],[8,34,2,1,'#39e6ff'],[22,34,2,1,'#39e6ff']],
    b:[[11,33,10,2,'#5a6472'],[12,20,1,13,'#5a6472'],[19,20,1,13,'#5a6472']],
    s:[[13,33,7,2,'#5a6472'],[18,17,1,2,'#39e6ff']]},
  vasko:{skin:'#c9a184',hair:'#9a9a96',hs:'slick',beard:'#a8a8a2',top:'#3a3d44',coat:'#2b2d31',pants:'#2b2d31',shoes:'#141414',eyes:'#7a8a94',
    f:[[11,17,10,4,'#7a2e22'],[18,21,2,10,'#7a2e22'],[18,30,2,1,'#5a1e16']],b:[[11,17,10,4,'#7a2e22']],s:[[13,17,8,4,'#7a2e22'],[19,21,2,7,'#7a2e22']]},
  doc:{skin:'#d7a98a',hair:'#e8e8e4',hs:'messy',stubble:'#d8d4cc',top:'#8fb59a',coat:'#ece7da',pants:'#7a6a55',shoes:'#cfd2cf',eyes:'#3a2a1a',hand2:'#c0c8d0',
    f:[[12,7,8,2,'#6b4a36'],[13,7,2,2,'#bfe8ff'],[17,7,2,2,'#bfe8ff'],[13,18,6,4,'#8fb59a'],[13,27,6,17,'#6b4a36']],b:[[13,18,6,3,'#8fb59a']],s:[[17,7,4,2,'#6b4a36'],[20,7,1,2,'#bfe8ff'],[14,18,5,3,'#8fb59a']]},
  okoro:{skin:'#5a3a28',hair:'#8a8a8a',hs:'buzz',beard:'#8a8a8a',top:'#1e2a44',coat:'#c8b48e',pants:'#3a3a3a',shoes:'#1a1410',eyes:'#1a1010',scale:1.08,hand:'#f2f2ee',
    f:[[15,20,2,12,'#202020'],[10,33,12,2,'#a8946e']],b:[[10,33,12,2,'#a8946e']],s:[[12,33,9,2,'#a8946e']]},
  lou:{skin:'#c98e64',hair:'#ff4fa3',hs:'bob',top:'#c9b7ff',pants:'#141018',shoes:'#39e6ff',eyes:'#2a1a12',
    f:[[11,3,10,1,'#39e6ff'],[10,9,2,5,'#39e6ff'],[20,9,2,5,'#39e6ff'],[17,4,3,2,'#39e6ff'],[10,28,12,2,'#ff4fa3']],s:[[14,9,3,5,'#39e6ff']]},
  guard:{skin:'#2a2e36',head:'#2a2e36',hair:'#2a2e36',hs:'helmet',visor:'#ff3b4e',top:'#1a1d24',sleeve:'#2a2e36',pants:'#1a1d24',shoes:'#111318',eyes:'#ff3b4e',hand:'#2a2e36',scale:1.1,
    f:[[8,19,4,4,'#3a3f4c'],[20,19,4,4,'#3a3f4c'],[10,28,12,1,'#ff3b4e']],s:[[14,19,5,4,'#3a3f4c'],[13,28,7,1,'#ff3b4e']]}
};
