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
  exits:[{at:(lx,lz)=>lx>15.1&&Math.abs(lz-2)<1.3,to:{x:METRO_E.x,z:METRO_E.z+2.4,ry:0}},{at:(lx,lz)=>lx<-15.1&&Math.abs(lz-2)<1.3,to:{x:METRO_W.x-2.3,z:METRO_W.z,ry:-Math.PI/2}}],
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
    // la rame : le même train que le TGV du viaduc, agrandi à la taille du quai (on récupère le modèle existant)
    const tr=new THREE.Group();R.g.add(tr);R.metro=tr;const tz=-d/2+1.3,K=1.55;
    const tgv=buildTrain(0,0);tr.add(tgv);tgv.scale.setScalar(K);tgv.rotation.y=Math.PI/2;tgv.position.set(TGV.LEN*K/2,.05,tz);
    R.anims.push({k:0,every:true,f:t=>{const c=t%30;tr.position.x=c<6?-50+50*(1-Math.pow(1-c/6,2)):c<14?0:c<20?60*Math.pow((c-14)/6,2):70}}); // arrive, s’arrête 8 s, repart (caché dans les tunnels avant et après)
    R.metroStopped=()=>{const c=tAcc%30;return c>=6&&c<14};
    // les tunnels aux deux bouts de la voie : le mur du fond est percé d'une arche, et derrière, un vrai tunnel noir qui s'enfonce
    // (voûte, parois, rails qui continuent, petites lampes), comme la sortie du TGV dehors
    R.g.children.filter(m=>m.isMesh&&m.geometry.type==='PlaneGeometry'&&Math.abs(Math.abs(m.position.x)-w/2)<.01&&Math.abs(m.position.y-R.h/2)<.01).forEach(m=>R.g.remove(m));
    const ew=R.o.wall.clone();ew.map=R.o.wall.map.clone();ew.map.needsUpdate=true;ew.map.repeat.set(8/d,1.6/R.h);
    const RA=1.45,YS=2.2,blk=new THREE.MeshBasicMaterial({color:0x020204,fog:false,side:THREE.DoubleSide});
    const TL=new THREE.Group();R.g.add(TL);[-1].forEach(s=>{ // le tunnel de gauche, puis son reflet exact à droite
      const sh=new THREE.Shape();sh.moveTo(-d/2,0);sh.lineTo(d/2,0);sh.lineTo(d/2,R.h);sh.lineTo(-d/2,R.h);sh.closePath();
      const hx=s<0?-tz:tz,hole=new THREE.Path();hole.moveTo(hx-RA,0);hole.lineTo(hx-RA,YS);hole.absarc(hx,YS,RA,Math.PI,0,true);hole.lineTo(hx+RA,0);hole.closePath();sh.holes.push(hole);
      const sx=s<0?-2:2,st=new THREE.Path();st.moveTo(sx-1.22,.03);st.lineTo(sx+1.22,.03);st.lineTo(sx+1.22,R.h-.12);st.lineTo(sx-1.22,R.h-.12);st.closePath();sh.holes.push(st); /* le passage de l'escalier */
      const wall=new THREE.Mesh(new THREE.ShapeGeometry(sh,24),ew);wall.position.set(s*w/2,0,0);wall.rotation.y=-s*Math.PI/2;TL.add(wall);
      const L=9,cxT=s*(w/2+L/2); // le tunnel derrière le mur
      const vault=new THREE.Mesh(new THREE.CylinderGeometry(RA,RA,L,24,1,true,0,Math.PI),blk);vault.rotation.z=Math.PI/2;vault.position.set(cxT,YS,tz);TL.add(vault);
      [-1,1].forEach(k=>{const pl=new THREE.Mesh(new THREE.PlaneGeometry(L,YS),blk);pl.position.set(cxT,YS/2,tz+k*RA);TL.add(pl)});
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(L,2*RA),new THREE.MeshBasicMaterial({color:0x0a0b0e}));fl.rotation.x=-Math.PI/2;fl.position.set(cxT,.005,tz);TL.add(fl);
      const end=new THREE.Mesh(new THREE.PlaneGeometry(2*RA,YS+RA),blk);end.position.set(s*(w/2+L),(YS+RA)/2,tz);end.rotation.y=-s*Math.PI/2;TL.add(end);
      for(const z of [tz-.5,tz+.5])box(L,.04,.08,'#4a5058',cxT,.03,z,TL);
      for(let i=1;i<5;i++)box(.04,.06,.3,'#ffb547',s*(w/2+i*1.8),1.7,tz-RA+.05,TL,true);
      // encadrement de l'arche, côté station : béton sombre, liseré néon rose
      const g=new THREE.Group();g.position.set(s*(w/2-.02),0,tz);g.rotation.y=-s*Math.PI/2;TL.add(g);
      const fr=new THREE.Mesh(new THREE.TorusGeometry(RA+.14,.14,8,28,Math.PI),mat('#2a2e36'));fr.position.set(0,YS,.08);g.add(fr);
      const ne=new THREE.Mesh(new THREE.TorusGeometry(RA+.02,.03,6,40,Math.PI),mat('#ff4fa3',true));ne.position.set(0,YS,.14);g.add(ne);
      [-1,1].forEach(k=>{box(.28,YS,.16,'#2a2e36',k*(RA+.14),YS/2,.08,g);box(.04,YS,.04,'#ff4fa3',k*(RA+.02),YS/2,.16,g,true)})});
    { const TR=TL.clone(true);TR.scale.x=-1;R.g.add(TR);TR.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.side=THREE.DoubleSide}})} // le même tunnel, en miroir, à droite
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
    // on les gravit vraiment (la hauteur du personnage suit les marches), elles traversent le mur et continuent de monter
    // dans une cage d'escalier éclairée, jusqu'à la lueur de la ville tout en haut
    [-1,1].forEach(s=>{for(let i=0;i<24;i++){const x=s*(12.6+i*.4),y=(i+1)*.42;R.B(.4,y,2.4,i<8?'#7a8088':'#6a7078',x,y/2,2);R.B(.4,.03,2.4,'#ffd23f',x-s*.18,y+.01,2,true)}
      const sl=Math.atan2(.42,.4);[-1,1].forEach(k=>{const r=R.B(9.8,.05,.05,'#8a929c',s*(12.4+4.6),1.05*4.6+.9,2+k*1.2);r.rotation.z=s*sl; /* rampes qui suivent la pente */
        for(let j=0;j<5;j++){const x=s*(12.8+j*2.2);R.B(.04,1,.04,'#8a929c',x,(Math.abs(x)-12.4)/.4*.42+.5,2+k*1.2)}});
      // la cage, derrière le mur : parois, plafond en pente, néons, et la sortie lumineuse en haut
      const X0=s*(w/2),L=6;[.78,3.22].forEach(z=>{R.B(L+2,13,.08,'#3a4048',X0+s*(L/2+.5),6.5,z);});
      const ce=R.B(L+4,.1,2.5,'#2a3038',X0+s*(L/2),1.05*(16+L/2-12.4)+2.7,2);ce.rotation.z=s*sl;
      for(let j=0;j<3;j++){const x=X0+s*(1+j*2),y=(Math.abs(x)-12.4)/.4*.42+2.6;const n=R.B(1.2,.04,.1,'#eaf6ff',x,y,2,true);n.rotation.z=s*sl}
      R.B(.08,3,2.4,'#fff6e0',s*(12.4+24*.4+.1),24*.42+1.4,2,true); // la lueur de la rue, tout en haut des marches
      const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xfff0d0,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));gl.scale.set(5,5,1);gl.position.set(s*(12.4+24*.4),24*.42+1.2,2);R.g.add(gl);
      const g2=gl.clone();g2.material=gl.material.clone();g2.material.opacity=.45;g2.scale.set(3.2,2.6,1);g2.position.set(s*(w/2+1.6),3.9,2);R.g.add(g2)}); /* la lumière d’en haut qui descend dans l’ouverture */
    R.stairY=(lx,lz)=>Math.abs(lz-2)<1.25&&Math.abs(lx)>12.4?Math.min(24,(Math.abs(lx)-12.4)/.4)*.42:0; // hauteur des marches sous les pieds
    // ---- quand il pleut dehors, l'eau descend les escaliers : filets qui ruissellent sur les marches, gouttes, flaque en bas ----
    const wc=document.createElement('canvas');wc.width=32;wc.height=128;const wg=wc.getContext('2d');wg.clearRect(0,0,32,128);
    for(let i=0;i<14;i++){const x=Math.random()*32,l=10+Math.random()*30,y=Math.random()*128;const gr=wg.createLinearGradient(0,y,0,y+l);gr.addColorStop(0,'rgba(170,210,255,0)');gr.addColorStop(.5,'rgba(190,225,255,.85)');gr.addColorStop(1,'rgba(170,210,255,0)');wg.fillStyle=gr;wg.fillRect(x,y,1.5,l)}
    const wt=new THREE.CanvasTexture(wc);wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(3,4);wt.center.set(.5,.5);wt.rotation=Math.PI/2; /* les filets suivent la pente */
    const wm=new THREE.MeshBasicMaterial({map:wt,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    const fx=new THREE.Group();R.g.add(fx);R.rainFx=fx;const slope=Math.atan2(.42,.4),SL=Math.hypot(9.6,10.08);
    [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(SL,2.2),wm);p.rotation.x=-Math.PI/2;const q=new THREE.Group();q.add(p);q.position.set(s*(12.4+4.8),5.04+.47,2);q.rotation.z=s*slope;
      if(s<0)p.rotation.z=Math.PI;fx.add(q); // la nappe d'eau posée sur les nez de marche, qui coule vers le bas
      const pud=new THREE.Mesh(new THREE.CircleGeometry(1.3,24),new THREE.MeshPhongMaterial({color:0x2a3a4a,transparent:true,opacity:.6,shininess:160,specular:0xbfe0ff,depthWrite:false}));pud.rotation.x=-Math.PI/2;pud.scale.set(1.4,1,1);pud.position.set(s*11.4,.015,2);fx.add(pud);
      const n=40,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=s*(12.6+Math.random()*3.4);pos[i*3+1]=Math.random()*4;pos[i*3+2]=.9+Math.random()*2.2}
      const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));const dr=new THREE.Points(gg,new THREE.PointsMaterial({color:0xcfe6ff,size:.06,transparent:true,opacity:.7,depthWrite:false}));dr.userData.s=s;fx.add(dr)});
    R.anims.push({k:0,every:true,f:t=>{const on=!!(wx&&wx.rain>.08);fx.visible=on;if(!on)return;wt.offset.y=1-(t*.9)%1; /* l’eau descend les marches */
      fx.children.forEach(o=>{if(!o.isPoints)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const lx=Math.abs(p.getX(i)),floor=lx>12.4?(lx-12.4)/.4*.42:0;let y=p.getY(i)-.12;if(y<floor){y=floor+3+Math.random()*1.2}p.setY(i,y)}p.needsUpdate=true})}});
    // ---- annonces sonores : un carillon à l’arrivée et au départ de la rame ----
    let lastC=0;R.anims.push({k:0,every:true,f:t=>{const c=t%30;if(zoneOf()==='in_metro'){if(lastC<3&&c>=3)metroAnnounce('Rame de la ligne M en approche, station Zone Zéro. Veuillez vous éloigner de la bordure du quai.');
      if(lastC<12.5&&c>=12.5)metroAnnounce('Attention à la fermeture des portes. Prochain arrêt : nulle part.')}lastC=c}});
    // ---- de la vie sur le quai ----
    for(let i=-2;i<=2;i++){const x=i*5.2;R.S(.5,R.h,.5,'#5a6068',x,R.h/2,-.6);[.9,2.6].forEach(y=>R.B(.54,.06,.54,i%2?'#ff4fa3':'#39e6ff',x,y,-.6,true))} // piliers à bagues néon
    [-6,6].forEach((x,k)=>{R.B(2.4,.7,.12,'#101418',x,3.5,.6);R.B(.03,.5,.03,'#2a2e36',x-.9,4.05,.6);R.B(.03,.5,.03,'#2a2e36',x+.9,4.05,.6);
      R.screen(x,3.5,.67,0,2.2,.56,(g,W,H,t)=>{const c=t%30,left=c<6?6-c:c<14?0:36-c;g.fillStyle='#05080c';g.fillRect(0,0,W,H);g.font='bold 11px monospace';g.fillStyle='#ffb547';
        g.fillText('LIGNE M  →  '+(k?'TOUR DES TOITS':'COMMISSARIAT'),4,13);g.fillStyle=left?'#7dffb0':'#ff4fa3';g.fillText(left?'PROCHAINE RAME  '+String(Math.ceil(left)).padStart(2,'0')+' s':'RAME À QUAI · NE MONTEZ PAS',4,28)},160)}); // panneaux des départs
    [-9,9].forEach((x,k)=>R.screen(x,2.6,-d/2+.06,0,2.6,1.4,(g,W,H,t)=>{const ph=Math.floor(t/5+k)%3;const A=[['ONDES COLA','#ff4fa3','#2a0a20'],['NEURA v4','#7dffb0','#06201a'],['KUROGANE · SÉCURITÉ','#ff3b4e','#1a0608']][ph];
      g.fillStyle=A[2];g.fillRect(0,0,W,H);g.fillStyle=A[1];g.font='bold 16px monospace';g.fillText(A[0],8,H/2+4);g.fillRect(8,H-14,(t*30)%(W-16),3)},128)); // écrans publicitaires au-dessus de la voie
    [[-15,-5.2],[15,-5.2],[-15,5.2],[15,5.2]].forEach(([x,z],i)=>{R.B(.18,.14,.26,'#20242c',x,R.h-.3,z);const led=R.B(.04,.04,.04,'#ff2a3a',x,R.h-.38,z+(z<0?.14:-.14),true);
      R.anims.push({k:0,every:true,f:t=>{led.visible=Math.floor(t*1.5+i)%2===0}})}); // caméras de surveillance
    [[-11,4.6],[1,4.6],[12,-1.6]].forEach(([x,z])=>{R.S(.4,.7,.4,'#2a5a3a',x,.35,z);R.B(.42,.05,.42,'#1a3a26',x,.72,z)}); // poubelles de tri
    const busk=R.who(-1.5,3.6,Math.PI,{...randomSpec(),top:'#ff8a3d'},'sway');R.B(.5,.12,.3,'#6a3a1a',-1.0,.06,3.9);R.B(.08,.04,.08,'#ffd23f',-1.0,.13,3.9,true); // un musicien et l'étui de sa guitare
    R.obj(-1.5,3.0,1.2,'Écouter le musicien',lines(['Il gratte une vieille guitare électrique branchée sur un ampli de poche. Une mélodie lente, qui résonne sous la voûte.','« Une pièce pour la musique ? Non ? Alors une chanson pour rien. C’est la plus belle. »']));
    const rob=new THREE.Group();R.g.add(rob);box(.5,.14,.5,'#d8dce2',0,.1,0,rob);box(.3,.06,.3,'#39e6ff',0,.2,0,rob,true);box(.06,.04,.2,'#7dffb0',.26,.12,0,rob,true); // robot nettoyeur
    R.anims.push({k:0,every:true,f:t=>{const u=(t*.07)%2,x=-8.5+17*(u<1?u:2-u);rob.position.set(x,0,1.5);rob.rotation.y=u<1?0:Math.PI;rob.children[1].material.color.setHSL(.5,.9,.5+Math.sin(t*4)*.15)}});
    R.who(-6,-1.6,0,null,'sway');R.who(2,-1.4,Math.PI*.1);R.who(6.5,-1.7,-.2,null,'sway');R.who(-8.6,d/2-1.8,Math.PI,{...randomSpec(),coat:'#1e5a8a'});R.who(10,1,Math.PI/2,null,'sway');
    R.obj(4.5,-d/2+4,1.3,'Distributeur de tickets',()=>'« LIGNE M · service de nuit perturbé. Les rames ne s’arrêtent qu’à Zone Zéro jusqu’à nouvel ordre. » Le distributeur avale une pièce et ne rend rien.');
    R.obj(-8.6,d/2-2.1,1.3,'Kiosque à journaux',lines(['« Le Courrier de BXL ? Il n’en reste plus. Les gens lisent tout sur leurs implants, maintenant. »','« Tu prends la M ? Elle passe toutes les trente secondes, mais elle ne va nulle part. Personne ne sait pourquoi. »']));
    R.obj(-4,-d/2+4.2,1.3,'Regarder le quai',()=>'Le quai sent l’huile et l’ozone. Sur le mur d’en face, quelqu’un a peint un papillon de nuit, en cyan.');
    R.obj(0,-d/2+3.2,1.4,'Monter dans le métro',()=>R.metroStopped()?'Les portes restent closes. À côté, un lecteur clignote en rouge : « LIGNE M · carte d’accès requise ». Il va falloir en trouver une.':'Le quai est vide. Au fond du tunnel, une lueur annonce la prochaine rame. De toute façon, sans carte d’accès, les portes ne s’ouvriront pas.');
  }};
// dans les escaliers du métro, le personnage monte avec les marches
function stairLift(){const R=ROOMS.metro;if(!R||zoneOf()!=='in_metro'||!R.stairY)return 0;return R.stairY(player.position.x-R.cx,player.position.z-R.cz)}
// annonce dans la station : trois notes de carillon, au volume des effets (pas de voix de synthèse)
function metroAnnounce(text){if(!AUD.ctx)return;const c=AUD.ctx,t=c.currentTime;[784,659,523].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(0,t+i*.32);g.gain.linearRampToValueAtTime(.07,t+i*.32+.02);g.gain.exponentialRampToValueAtTime(.0008,t+i*.32+.9);o.connect(g);g.connect(AUD.N.sfx||c.destination);o.start(t+i*.32);o.stop(t+i*.32+1)});
}
