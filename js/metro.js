// Les sous-sols de la ville : une station de métro, la ligne M, et une galerie de commerces souterraine.
// On y descend par une trémie sur la place à côté de l'ancien commissariat, et on ressort derrière la tour des Toits
// (ou l'inverse). Une rame passe régulièrement le long du quai.
'use strict';

const METRO_E={x:77.3,z:34,ry:0},METRO_W={x:47.5,z:28.5,ry:-Math.PI/2}; // les deux trémies, dans la ville
IN_NAMES.metro='Métro · station Zone Zéro';
IN_DEF.metro={w:32,d:12,h:4.4,trim:'#39e6ff',light:[0xcfe8ff,0x39e6ff],fog:0x0a1018,noDoor:true,pos:[W+60,H/2+60],
  floor:canvasMat(32,32,(g,W,H)=>{g.fillStyle='#5a6068';g.fillRect(0,0,W,H);g.fillStyle='#646a72';g.fillRect(1,1,14,14);g.fillRect(17,17,14,14);g.fillStyle='#565c64';g.fillRect(17,1,14,14);g.fillRect(1,17,14,14)},16,6),
  wall:canvasMat(64,64,(g,W,H)=>{g.fillStyle='#c8ccd0';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=8)for(let x=(y/8)%2*8;x<W;x+=16){g.fillStyle='#d4d8dc';g.fillRect(x+1,y+1,14,6)}
    g.fillStyle='#1e5a8a';g.fillRect(0,40,W,6);g.fillStyle='#39e6ff';g.fillRect(0,46,W,1);g.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<10;i++)g.fillRect(Math.random()*W,Math.random()*H,1,6)},8,1.6),
  // entrées depuis la ville : à l'est (commissariat) on arrive au bout est de la station, à l'ouest (tour des Toits) au bout ouest
  entries:[{x:METRO_E.x,z:METRO_E.z+.7,r:.5,spawn:[11,2],ry:-Math.PI/2},{x:METRO_W.x-.7,z:METRO_W.z,r:.5,spawn:[-11,2],ry:Math.PI/2}],
  exits:[{at:(lx,lz)=>lx>12&&Math.abs(lz-2)<1.3,to:{x:METRO_E.x,z:METRO_E.z+2.4,ry:0}},{at:(lx,lz)=>lx<-12&&Math.abs(lz-2)<1.3,to:{x:METRO_W.x-2.3,z:METRO_W.z,ry:-Math.PI/2}}],
  outside(){ // les deux trémies dans la ville, avec un mât et l'enseigne du métro
    [[METRO_E,'MÉTRO · LIGNE M'],[METRO_W,'MÉTRO · LIGNE M']].forEach(([M,txt])=>{const g=stairPit(scene,M.x,0,M.z,M.ry,'#39e6ff');g.updateMatrixWorld(true);
      const post=g.localToWorld(new THREE.Vector3(0,0,-1.6));box(.08,2.4,.08,'#2a3140',post.x,1.2,post.z);box(.5,.5,.06,'#1e5a8a',post.x,2.6,post.z,null,true);
      sign(txt,'#39e6ff',post.x,2.05,post.z,M.ry,true,false,.022);
      const v=new THREE.Vector3();for(let b=-1.2;b<=1.21;b+=.35)[.8,-.8].forEach(a=>{g.localToWorld(v.set(a,0,b));FURN.push([v.x,v.z,.16])});
      for(let a=-.8;a<=.81;a+=.4){g.localToWorld(v.set(a,0,-1.27));FURN.push([v.x,v.z,.16])}})},
  build(R){const w=R.w,d=R.d;
    // la voie, au nord : fosse sombre, rails, bord du quai jaune ; on ne peut pas y descendre
    R.B(w,.02,2.6,'#15171c',0,.01,-d/2+1.3);for(const z of [-d/2+.8,-d/2+1.8])R.B(w,.04,.08,'#8a929c',0,.03,z);R.B(w,.03,.12,'#ffd23f',0,.02,-d/2+2.7,true);R.block(0,-d/2+1.3,w/2,1.35);
    // la rame : trois voitures, vitres éclairées, qui arrivent de l'ouest, s'arrêtent, puis repartent à l'est
    // la rame : trois voitures au profil arrondi (même principe que le TGV, nez court et bombé), vitres éclairées par des néons intérieurs
    const tr=new THREE.Group();R.g.add(tr);R.metro=tr;
    const tz=-d/2+1.3,mm=new THREE.MeshPhongMaterial({vertexColors:true,specular:0x667788,shininess:80});
    const col=(x,y,t,c)=>{if(y>1.38&&y<2.02)c.set('#10161e');else if(Math.abs(y-.92)<.07)c.set('#39e6ff');else if(y<.3)c.set('#2a3038');else c.set('#c4ccd4')};
    const ic=document.createElement('canvas');ic.width=256;ic.height=32;const ig=ic.getContext('2d');ig.fillStyle='#e8f4ff';ig.fillRect(0,0,256,32);ig.fillStyle='#cfe0ee';ig.fillRect(0,0,256,5);
    for(let i=0;i<16;i++){ig.fillStyle='#1e5a8a';ig.fillRect(i*16+3,18,10,14);ig.fillStyle='#20242c';if(Math.random()<.45){ig.beginPath();ig.arc(i*16+8,14,3.5,0,7);ig.fill();ig.fillRect(i*16+5,17,6,10)}}
    for(let i=0;i<8;i++){ig.fillStyle='#1a2028';ig.fillRect(i*32+30,0,3,32)}
    const im=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(ic)});
    // chaque voiture est fermée et arrondie à ses deux bouts (nez long et bombé en tête et en queue, bouts courts entre voitures)
    for(let k=0;k<3;k++){const L=9.4,cx=-10+k*10,front=k===2,back=k===0,e1=front?1.9:.6,e0=back?1.9:.6;const rings=[],zs=[];
      for(let i=0;i<=40;i++){const u=i/40,z=-L/2+u*L;let t=0,nose=false;if(z>L/2-e1){t=(z-(L/2-e1))/e1;nose=front}else if(z<-L/2+e0){t=(-L/2+e0-z)/e0;nose=back}
        const sw=Math.sqrt(Math.max(.0006,1-t*t)),sh=Math.sqrt(Math.max(.0006,1-Math.pow(t,nose?3:2.2))),mid=nose?1.15+.25*t:1.36,hh=1.24*sh;
        rings.push(superRing(36,1.05*sw+.01,Math.max(.1,mid-hh),mid+hh*(nose?.92:1),.42));zs.push(z)}
      const car=new THREE.Mesh(loft(rings,zs,col),mm);car.rotation.y=Math.PI/2;car.position.set(cx,0,tz);tr.add(car);
      const wl=L-e0-e1-.3;[-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(wl,.6),im);w.position.set(cx+(e0-e1)/2,1.7,tz+s*1.065);w.rotation.y=s>0?0:Math.PI;tr.add(w)});
      box(wl,.04,.04,'#eaf6ff',cx+(e0-e1)/2,2.58,tz,tr,true);if(k<2)box(.9,1.9,1.5,'#22262e',cx+5,1.3,tz,tr)} // soufflet entre deux voitures
    box(.06,.2,.7,'#eaf6ff',14.62,1.25,tz,tr,true);box(.06,.16,.5,'#ff2a3a',-14.62,1.25,tz,tr,true); // phares, feux arrière
    R.anims.push({k:0,f:t=>{const c=t%30;tr.position.x=c<6?-40+40*(1-Math.pow(1-c/6,2)):c<14?0:c<20?40*Math.pow((c-14)/6,2):60}}); // arrive, s'arrête 8 s, repart
    R.metroStopped=()=>{const c=tAcc%30;return c>=6&&c<14};
    // les tunnels aux deux bouts de la voie : le mur du fond est percé d'une arche, et derrière, un vrai tunnel noir qui s'enfonce
    // (voûte, parois, rails qui continuent, petites lampes), comme la sortie du TGV dehors
    R.g.children.filter(m=>m.isMesh&&m.geometry.type==='PlaneGeometry'&&Math.abs(Math.abs(m.position.x)-w/2)<.01&&Math.abs(m.position.y-R.h/2)<.01).forEach(m=>R.g.remove(m));
    const ew=R.o.wall.clone();ew.map=R.o.wall.map.clone();ew.map.needsUpdate=true;ew.map.repeat.set(8/d,1.6/R.h);
    const RA=1.45,YS=2.2,blk=new THREE.MeshBasicMaterial({color:0x020204,fog:false,side:THREE.DoubleSide});
    [-1,1].forEach(s=>{
      const sh=new THREE.Shape();sh.moveTo(-d/2,0);sh.lineTo(d/2,0);sh.lineTo(d/2,R.h);sh.lineTo(-d/2,R.h);sh.closePath();
      const hx=s<0?-tz:tz,hole=new THREE.Path();hole.moveTo(hx-RA,0);hole.lineTo(hx-RA,YS);hole.absarc(hx,YS,RA,Math.PI,0,true);hole.lineTo(hx+RA,0);hole.closePath();sh.holes.push(hole);
      const wall=new THREE.Mesh(new THREE.ShapeGeometry(sh,24),ew);wall.position.set(s*w/2,0,0);wall.rotation.y=-s*Math.PI/2;R.g.add(wall);
      const L=9,cxT=s*(w/2+L/2); // le tunnel derrière le mur
      const vault=new THREE.Mesh(new THREE.CylinderGeometry(RA,RA,L,24,1,true,0,Math.PI),blk);vault.rotation.z=Math.PI/2;vault.position.set(cxT,YS,tz);R.g.add(vault);
      [-1,1].forEach(k=>{const pl=new THREE.Mesh(new THREE.PlaneGeometry(L,YS),blk);pl.position.set(cxT,YS/2,tz+k*RA);R.g.add(pl)});
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(L,2*RA),new THREE.MeshBasicMaterial({color:0x0a0b0e}));fl.rotation.x=-Math.PI/2;fl.position.set(cxT,.005,tz);R.g.add(fl);
      const end=new THREE.Mesh(new THREE.PlaneGeometry(2*RA,YS+RA),blk);end.position.set(s*(w/2+L),(YS+RA)/2,tz);end.rotation.y=-s*Math.PI/2;R.g.add(end);
      for(const z of [tz-.5,tz+.5])box(L,.04,.08,'#4a5058',cxT,.03,z,R.g);
      for(let i=1;i<5;i++)box(.04,.06,.3,'#ffb547',s*(w/2+i*1.8),1.7,tz-RA+.05,R.g,true);
      // encadrement de l'arche, côté station : béton sombre, liseré néon rose
      const g=new THREE.Group();g.position.set(s*(w/2-.02),0,tz);g.rotation.y=-s*Math.PI/2;R.g.add(g);
      const fr=new THREE.Mesh(new THREE.TorusGeometry(RA+.14,.14,8,28,Math.PI),mat('#2a2e36'));fr.position.set(0,YS,.08);g.add(fr);
      const ne=new THREE.Mesh(new THREE.TorusGeometry(RA+.02,.03,6,40,Math.PI),mat('#ff4fa3',true));ne.position.set(0,YS,.14);g.add(ne);
      [-1,1].forEach(k=>{box(.28,YS,.16,'#2a2e36',k*(RA+.14),YS/2,.08,g);box(.04,YS,.04,'#ff4fa3',k*(RA+.02),YS/2,.16,g,true)})});
    // néons au plafond de la station
    for(let i=-3;i<=3;i++)R.B(3,.05,.12,'#eaf6ff',i*4.4,R.h-.06,-1.4,true);
    // les commerces, au sud : vitrines en profondeur, comptoir de presse, distributeurs de tickets
    [-8,-2.5,3,8.5].forEach((x,i)=>shopWindow(R.cx+x,IY+1.25,R.cz+d/2-.06,4.2,1.9,0,-1,[2,4,5,3][i]));
    R.S(2.4,1,.7,'#2a3140',-12.6+4,.5,d/2-1.1);R.B(2.4,.05,.75,'#39e6ff',-8.6,1.02,d/2-1.1,true);
    for(let i=0;i<3;i++){R.S(.7,1.8,.5,'#1a1e28',4.5+i*.9-1,.9,-d/2+3.4);R.B(.5,.7,.04,'#39e6ff',3.5+i*.9,1.2,-d/2+3.66,true)}
    R.S(3,.45,.5,'#3a4048',-4,.22,-d/2+3.5);R.S(3,.45,.5,'#3a4048',9,.22,-d/2+3.5);
    // signalétique : nom de la station, sorties
    R.sign('ZONE ZÉRO · LIGNE M','#39e6ff',0,3.4,-d/2+.08,0,.06);
    R.sign('SORTIE · COMMISSARIAT →','#7dffb0',9,3.3,d/2-.08,Math.PI,.035);R.sign('← SORTIE · TOUR DES TOITS','#7dffb0',-9,3.3,d/2-.08,Math.PI,.035);
    // les escaliers vers la ville, aux deux bouts : de vraies marches qui montent vers une lueur
    [-1,1].forEach(s=>{for(let i=0;i<8;i++){const x=s*(12.6+i*.4);R.B(.4,(i+1)*.42,2.4,'#7a8088',x,(i+1)*.21,2);R.B(.4,.03,2.4,'#ffd23f',x-s*.18,(i+1)*.42+.01,2,true)}
      R.block(s*14.2,2,1.6,1.25);R.B(.06,1.6,2.6,'#dfeeff',s*(w/2-.03),3.5,2,true);[-1,1].forEach(k=>R.B(3.4,.05,.05,'#8a929c',s*13.9,1.6+0,2+k*1.25))});
    R.who(-6,-1.6,0,null,'sway');R.who(2,-1.4,Math.PI*.1);R.who(6.5,-1.7,-.2,null,'sway');R.who(-8.6,d/2-1.8,Math.PI,{...randomSpec(),coat:'#1e5a8a'});R.who(10,1,Math.PI/2,null,'sway');
    R.obj(4.5,-d/2+4,1.3,'Distributeur de tickets',()=>'« LIGNE M · service de nuit perturbé. Les rames ne s’arrêtent qu’à Zone Zéro jusqu’à nouvel ordre. » Le distributeur avale une pièce et ne rend rien.');
    R.obj(-8.6,d/2-2.1,1.3,'Kiosque à journaux',lines(['« Le Courrier de BXL ? Il n’en reste plus. Les gens lisent tout sur leurs implants, maintenant. »','« Tu prends la M ? Elle passe toutes les trente secondes, mais elle ne va nulle part. Personne ne sait pourquoi. »']));
    R.obj(-4,-d/2+4.2,1.3,'Regarder le quai',()=>'Le quai sent l’huile et l’ozone. Sur le mur d’en face, quelqu’un a peint un papillon de nuit, en cyan.');
    R.obj(0,-d/2+3.2,1.4,'Monter dans le métro',()=>R.metroStopped()?'Les portes restent closes. À côté, un lecteur clignote en rouge : « LIGNE M · carte d’accès requise ». Il va falloir en trouver une.':'Le quai est vide. Au fond du tunnel, une lueur annonce la prochaine rame. De toute façon, sans carte d’accès, les portes ne s’ouvriront pas.');
  }};
