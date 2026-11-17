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
    const tr=new THREE.Group();R.g.add(tr);const body=new THREE.MeshPhongMaterial({color:0xb8c0c8,shininess:80,specular:0x667788});
    for(let k=0;k<3;k++){const cx=-10+k*10;const b=new THREE.Mesh(boxGeo,body);b.scale.set(9.6,2.6,2.2);b.position.set(cx,1.45,-d/2+1.3);tr.add(b);
      box(9.2,.7,.02,'#ffe9b0',cx,1.9,-d/2+2.42,tr,true);box(9.62,.12,.02,'#39e6ff',cx,.95,-d/2+2.42,tr,true);for(let i=-1;i<=1;i++)box(.9,1.7,.03,'#2a3140',cx+i*3.2,1.2,-d/2+2.43,tr)}
    box(.05,.3,2,'#eaf6ff',15.1,1.6,-d/2+1.3,tr,true);
    R.anims.push({k:0,f:t=>{const c=t%30;tr.position.x=c<6?-40+40*(1-Math.pow(1-c/6,2)):c<14?0:c<20?40*Math.pow((c-14)/6,2):60}}); // arrive, s'arrête 8 s, repart
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
  }};
