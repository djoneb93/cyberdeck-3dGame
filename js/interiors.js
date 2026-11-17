// Intérieurs des lieux importants : de vraies pièces en 3D, construites loin sous la ville.
// On y entre par la porte du lieu (E / F) ; un fondu au noir, et on se retrouve dedans.
// Chaque pièce est une « zone » (comme le toit ou le quai) : ses murs et ses meubles bloquent le passage.
'use strict';

const IY=-60;                    // les pièces sont sous la ville, et hors de la carte : rien ne les voit depuis la rue
const ROOMS={};let inLights=null,inCur=null;
const IN_NAMES={bar:'Le Néon Noir',arcade:'Arcade Pixel',club:'Club Ondes',laundry:'Laverie 24/7',bunker:'Bunker Zéro',port:'Entrepôt des Docks'};

// ---------- outils ----------
const rpick=a=>a[Math.floor(Math.random()*a.length)]; // hasard qui ne touche pas à la graine de la ville
function canvasMat(w,h,draw,rx,ry,emis){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.magFilter=THREE.NearestFilter;
  return emis?new THREE.MeshBasicMaterial({map:t}):new THREE.MeshLambertMaterial({map:t})}
function meshBox(w,h,d,material,x,y,z,parent){const m=new THREE.Mesh(boxGeo,material);m.scale.set(w,h,d);m.position.set(x,y,z);parent.add(m);return m}
// une phrase au hasard, sans répéter la précédente
function lines(list){let last=-1;return ()=>{let k;do{k=Math.floor(Math.random()*list.length)}while(list.length>1&&k===last);last=k;return list[k]}}

function makeRoom(id,o,cx,cz){
  const g=new THREE.Group();g.position.set(cx,IY,cz);scene.add(g);
  const w=o.w,d=o.d,h=o.h||3.4,blocks=[],anims=[],chars=[];
  const R={id,g,cx,cz,w,d,h,blocks,anims,chars,o,
    B:(bw,bh,bd,c,x,y,z,e)=>box(bw,bh,bd,c,x,y,z,g,e),
    S:(bw,bh,bd,c,x,y,z,e)=>{blocks.push([cx+x,cz+z,bw/2,bd/2]);return box(bw,bh,bd,c,x,y,z,g,e)}, // meuble qui bloque
    block:(x,z,hx,hz)=>blocks.push([cx+x,cz+z,hx,hz]),
    sign:(t,c,x,y,z,ry,k)=>sign(t,c,cx+x,IY+y,cz+z,ry||0,false,false,k||.06),
    who:(x,z,ry,spec,anim)=>{const m=makeChar(spec||randomSpec());m.position.set(cx+x,IY,cz+z);m.userData.ry=ry||0;blocks.push([cx+x,cz+z,.22,.22]);chars.push({m,anim,ph:Math.random()*6});return m},
    obj:(x,z,r,label,talk)=>OBJECTS.push({id:'in_'+id+'_'+OBJECTS.length,x:cx+x,z:cz+z,r,zone:'in_'+id,label,dyn:talk}),
    screen:(x,y,z,ry,sw,sh,draw,res)=>{const c=document.createElement('canvas');c.width=res||96;c.height=Math.round((res||96)*sh/sw);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(sw,sh),new THREE.MeshBasicMaterial({map:t,fog:false}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);
      const a={k:Math.random(),f:tt=>{draw(c.getContext('2d'),c.width,c.height,tt);t.needsUpdate=true}};a.f(0);anims.push(a);return m}};
  // sol, plafond, murs (épais : la caméra s'arrête devant), porte de sortie au sud
  meshBox(w,.1,d,o.floor,0,-.05,0,g);
  // murs et plafond « en coupe » : des plans tournés vers l'intérieur, invisibles de dos.
  // Quand la caméra recule derrière un mur, il s'efface et on voit la pièce comme une maison de poupée.
  const plane=(pw,ph,m,x,y,z,rx,ry)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),m);p.position.set(x,y,z);p.rotation.set(rx||0,ry||0,0);g.add(p);return p};
  plane(w,d,mat(o.ceil||'#0a0b10'),0,h,0,Math.PI/2,0);
  const wm=o.wall;plane(w,h,wm,0,h/2,-d/2,0,0);plane(w,h,wm,0,h/2,d/2,0,Math.PI);plane(d,h,wm,-w/2,h/2,0,0,Math.PI/2);plane(d,h,wm,w/2,h/2,0,0,-Math.PI/2);
  R.B(w,.14,.04,o.trim,0,.07,-d/2+.02,true);R.B(w,.14,.04,o.trim,0,.07,d/2-.02,true); // plinthes lumineuses
  R.B(.04,.14,d,o.trim,-w/2+.02,.07,0,true);R.B(.04,.14,d,o.trim,w/2-.02,.07,0,true);
  // la porte de sortie : elle s'efface avec le mur sud quand la caméra passe derrière
  const so=R.south=new THREE.Group();so.position.z=d/2-.06;g.add(so);
  const dp=new THREE.Mesh(new THREE.PlaneGeometry(1.7,2.5),mat('#05070b'));dp.position.y=1.25;dp.rotation.y=Math.PI;so.add(dp);
  box(.08,2.6,.1,o.trim,-.89,1.3,-.02,so,true);box(.08,2.6,.1,o.trim,.89,1.3,-.02,so,true);box(1.86,.08,.1,o.trim,0,2.6,-.02,so,true);
  const st=signTexture('SORTIE','#7dffb0'),sp=new THREE.Mesh(new THREE.PlaneGeometry(st.w*.035,st.h*.035),new THREE.MeshBasicMaterial({map:st.tex,fog:false}));sp.position.set(0,2.95,-.04);sp.rotation.y=Math.PI;so.add(sp);
  R.B(1.4,.02,.7,o.trim,0,.01,d/2-.5,true); // tapis lumineux devant la porte
  OBJECTS.push({id:'in_'+id+'_exit',x:cx,z:cz+d/2-.75,r:1.25,zone:'in_'+id,label:'Sortir · retour dans la rue',act:()=>exitRoom(id)});
  ZONES['in_'+id]={x:cx,z:cz,hw:w/2-.45,hd:d/2-.45,y:IY,blocks,room:id};
  ROOMS[id]=R;o.build(R);
  // la porte de la rue
  const f=FP(id,.95,0);OBJECTS.push({id:'en_'+id,x:f.x,z:f.z,r:1.25,label:'Entrer · '+IN_NAMES[id],act:()=>enterRoom(id)});
}

// ---------- entrer, sortir ----------
function enterRoom(id){const R=ROOMS[id];
  if(id==='bunker'&&S.rep<10){openDlg({n1:{s:'nar',t:'La porte blindée ne bouge pas. Une caméra pivote vers toi, te détaille, puis se détourne. Ici, on n’ouvre qu’aux visages connus de la Zone Zéro (réputation « Visage connu »).'}});return}
  fadeThen(()=>{S.roof='in_'+id;player.position.set(R.cx,IY,R.cz+R.d/2-2.2);player.userData.ry=Math.PI;player.userData.jy=0;player.userData.jv=0;
  target=null;pendingTalk=null;yaw=yawT=0;distT=Math.min(distT,6.5);pitchT=Math.max(pitchT,.45);focus.set(player.position.x,IY+1.5,player.position.z);save();toast(IN_NAMES[id],'')})}
function exitRoom(id){fadeThen(()=>{S.roof=false;const p=FP(id,1.7,0);player.position.set(p.x,0,p.z);player.userData.ry=FACE_RY[PL[id].face];
  target=null;pendingTalk=null;focus.set(p.x,1.5,p.z);save()})}

// ---------- les pièces ----------
const IN_DEF={
  bar:{w:11,d:9,h:3.4,trim:'#ff4fa3',light:[0xff4fa3,0xffb070],fog:0x1a0814,
    floor:canvasMat(64,64,(g,W,H)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#2a1812':'#311c15';g.fillRect(0,i*8,W,8);g.fillStyle='rgba(0,0,0,.35)';g.fillRect((i*23)%W,i*8,1,8)}},5,4),
    wall:canvasMat(64,64,(g,W,H)=>{g.fillStyle='#1d0c18';g.fillRect(0,0,W,H);for(let x=0;x<W;x+=8){g.fillStyle='#26101f';g.fillRect(x,0,4,H)}g.fillStyle='#3a1630';g.fillRect(0,40,W,3)},6,2),
    build(R){const d=R.d,w=R.w;
      // comptoir, étagères de bouteilles, tabourets
      R.S(7,1.05,.7,'#2a1420',0,.52,-2.6);R.B(7.1,.06,.8,'#43263a',0,1.07,-2.6);R.B(7,.05,.05,'#ff4fa3',0,1.0,-2.24,true);
      for(let s=0;s<2;s++){R.B(7,.05,.35,'#2a1a14',0,1.4+s*.55,-d/2+.25);
        for(let i=0;i<16;i++)if(Math.random()<.85)R.B(.12,.3+Math.random()*.12,.12,pick(['#7cf29a','#ffb547','#39e6ff','#ff4fa3','#c9b7ff','#e8e8e4']),-3.3+i*.44,1.6+s*.55,-d/2+.25,true)}
      R.B(7.2,.04,.04,'#ffb070',0,3.02,-d/2+.3,true);R.sign('LE NÉON NOIR','#ff4fa3',0,2.75,-d/2+.08,0,.07);
      for(let i=0;i<6;i++){const x=-2.9+i*1.16;R.S(.36,.06,.36,'#ff4fa3',x,.72,-1.75,true);R.B(.08,.7,.08,'#3a3f4c',x,.36,-1.75)}
      // banquettes et tables le long du mur ouest
      [-.4,2.2].forEach(z=>{R.S(1.1,.06,1,'#3a2030',-w/2+1.3,.78,z);R.B(.12,.75,.12,'#2a2a30',-w/2+1.3,.38,z);R.S(.5,.5,1.6,'#5a1e3a',-w/2+.4,.25,z);R.B(.12,.8,1.6,'#5a1e3a',-w/2+.2,.65,z);
        R.B(.1,.1,.1,'#ffb070',-w/2+1.3,.88,z,true)});
      // juke-box et lampes suspendues
      R.S(.9,1.6,.6,'#2a1a30',w/2-.6,.8,.8);R.B(.7,.7,.05,'#ffb547',w/2-.6,1.15,.48,true);R.B(.75,.12,.06,'#ff4fa3',w/2-.6,1.62,.48,true);
      for(let i=0;i<3;i++){R.B(.02,.6,.02,'#222',-2.4+i*2.4,R.h-.3,-1.4);R.B(.3,.18,.3,'#ffb070',-2.4+i*2.4,R.h-.65,-1.4,true)}
      R.screen(w/2-.04,2,-1.6,-Math.PI/2,1.8,1,(g,W,H,t)=>{g.fillStyle='#120612';g.fillRect(0,0,W,H);g.fillStyle='#ff4fa3';g.font='bold 9px monospace';g.textAlign='center';
        g.fillText('HAPPY HOUR',W/2,18);g.fillStyle=Math.sin(t*4)>0?'#ffb547':'#7cf29a';g.fillText('2089 ¢ LE VERRE',W/2,34);g.fillStyle='rgba(255,79,163,.4)';g.fillRect(0,H-8,(t*30)%W,3)});
      // le barman et les clients
      R.who(.6,-3.5,0,{...randomSpec(),coat:'#111216'});R.who(-1.6,-1.4,Math.PI);R.who(1.9,-1.35,Math.PI*.9);R.who(-w/2+1.9,-.4,-Math.PI/2);R.who(-w/2+1.9,2.4,-Math.PI/2,null,'sway');R.who(w/2-1.2,1.9,-2.4,null,'sway');
      R.obj(.6,-1.9,1.3,'Parler au barman',lines(['« Qu’est-ce que je te sers ? La maison offre le premier verre aux gens qui ont l’air perdus. Tu as l’air perdu. »',
        '« Kurogane ? Ici on ne prononce pas ce nom trop fort. Les murs ont des oreilles, et certaines oreilles ont un implant. »',
        '« Lou passe parfois après son set au club Ondes. Elle commande toujours la même chose : un truc bleu qui brille. »',
        '« Trois ans, tu dis ? Il s’en passe, des choses, en trois ans. Le Néon Noir, lui, n’a pas bougé. »']));
      R.obj(w/2-1.2,.8,1.1,'Juke-box',lines(['Le juke-box hésite, puis lance un vieux morceau de synthwave bruxelloise. Quelqu’un tape du pied au fond.','Une chanson de 2071, « Pluie sur Midi ». Tu connais les paroles. Tu ne sais pas d’où.']));
      R.obj(-w/2+1.9,1.1,1.1,'Écouter la conversation',lines(['« … un convoi entier, disparu entre la gare et le port. Personne n’a rien vu. Évidemment. »','« … elle dit que ses souvenirs ont été vendus. Vendus, tu te rends compte ? »']));
    }},
  arcade:{w:12,d:10,h:3.4,trim:'#5ce1e6',light:[0x5ce1e6,0xff4fa3],fog:0x06141a,
    floor:canvasMat(32,32,(g,W,H)=>{g.fillStyle='#0a0f1a';g.fillRect(0,0,W,H);g.fillStyle='#1a2a4a';g.fillRect(0,0,W,1);g.fillRect(0,0,1,H);g.fillStyle='#ff4fa3';g.fillRect(14,14,3,3)},12,10),
    wall:canvasMat(64,64,(g,W,H)=>{g.fillStyle='#0b1620';g.fillRect(0,0,W,H);for(let i=0;i<30;i++){g.fillStyle=rpick(['#ff4fa3','#39e6ff','#ffb547','#7cf29a']);g.globalAlpha=.35;g.fillRect(Math.random()*W,Math.random()*H,2,2)}g.globalAlpha=1},4,2),
    build(R){const w=R.w,d=R.d;
      const game=(k)=>(g,W,H,t)=>{g.fillStyle='#000';g.fillRect(0,0,W,H);const c=['#ff4fa3','#39e6ff','#ffb547','#7cf29a'][k%4];
        if(k%3===0){for(let i=0;i<6;i++){g.fillStyle=c;g.fillRect((i*17+t*40*(1+i%2))%W,10+i*12,8,4)}g.fillStyle='#fff';g.fillRect(W/2-3,H-14,6,6)}
        else if(k%3===1){g.strokeStyle=c;g.beginPath();for(let x=0;x<W;x+=4)g.lineTo(x,H/2+Math.sin(x*.12+t*5)*H*.3);g.stroke();g.fillStyle='#fff';g.fillText(String(Math.floor(t*130)%99999),6,12)}
        else{for(let y=0;y<4;y++)for(let x=0;x<6;x++)if((x+y+Math.floor(t*3))%3)g.fillStyle=c,g.fillRect(8+x*13,10+y*10,10,6);g.fillStyle='#fff';g.fillRect((t*50)%W,H-10,10,3)}};
      const cab=(x,z,ry,k)=>{const sx=Math.sin(ry),sz=Math.cos(ry);R.S(.8,1.8,.7,pick(['#14202a','#1e1430','#20141a']),x,.9,z);
        R.screen(x+sx*.36,1.25,z+sz*.36,ry,.62,.5,game(k),64);R.B(.82,.2,.74,['#ff4fa3','#39e6ff','#ffb547','#7cf29a'][k%4],x,1.72,z,true);R.B(.7,.08,.3,'#2a2a3a',x+sx*.45,.95,z+sz*.45)};
      for(let i=0;i<4;i++){cab(-w/2+.55,-3.2+i*1.3,Math.PI/2,i);cab(w/2-.55,-3.2+i*1.3,-Math.PI/2,i+2)}
      for(let i=0;i<3;i++){cab(-1.2+i*1.2,-.2,0,i+1);cab(-1.2+i*1.2,-.9,Math.PI,i+3)}
      // le grand écran des records
      R.screen(0,2.3,-d/2+.08,0,4.2,1.6,(g,W,H,t)=>{g.fillStyle='#02060a';g.fillRect(0,0,W,H);g.fillStyle='#5ce1e6';g.font='bold 10px monospace';g.textAlign='center';g.fillText('HALL OF FAME · NEON RUN',W/2,14);
        const L=[['PXL',999999],['PXL',990120],['MOTH',870400],['LOU',812000],['K-9',640000]];g.font='7px monospace';
        L.forEach(([n,s],i)=>{g.fillStyle=i===0&&Math.sin(t*6)>0?'#ffb547':'#cfe8ff';g.fillText((i+1)+'. '+n+'  '+String(s).padStart(6,'0'),W/2,25+i*8.5)})},160);
      R.B(4.4,1.8,.06,'#14181f',0,2.3,-d/2+.04);R.sign('ARCADE PIXEL','#5ce1e6',0,3.25,-d/2+.06,0,.045);
      // comptoir des jetons et distributeur de peluches
      R.S(1.8,1,.6,'#1e1430',w/2-1.6,.5,d/2-1.4);R.B(1.8,.05,.05,'#ffb547',w/2-1.6,1.02,d/2-1.7,true);
      R.S(.9,1.9,.9,'#2a1a40',-w/2+1,.95,d/2-1.4);R.B(.8,.9,.8,'#39e6ff',-w/2+1,1.4,d/2-1.4,true);
      R.who(-w/2+1.5,-1.9,-Math.PI/2,{...randomSpec(),scale:.78},'sway');R.who(w/2-1.5,-.6,Math.PI/2,null,'sway');R.who(-1.2,.55,Math.PI,{...randomSpec(),scale:.75});R.who(w/2-1.6,d/2-2.1,0,{...randomSpec(),coat:'#2a1a40'});
      R.obj(-1.2,1,1.2,'Jouer à NEON RUN',()=>{const s=Math.floor(20000+Math.random()*600000);S.arcadeBest=Math.max(S.arcadeBest||0,s);save();
        return 'Tu glisses un jeton. Trois minutes de néons et de réflexes plus tard : '+s.toLocaleString('fr-BE')+' points. Ton record : '+S.arcadeBest.toLocaleString('fr-BE')+'. Loin des 999 999 de « PXL ».'});
      R.obj(0,-d/2+1.1,1.4,'Regarder les records',()=>'« PXL » occupe la première place depuis des mois. On dit que c’est une gamine du quartier, qui ne parle à personne et qui ne perd jamais.');
      R.obj(w/2-1.6,d/2-2.3,1.2,'Parler au gérant',lines(['« Les jetons, c’est au comptoir. Les crédits Kurogane ne passent pas ici, on accepte le liquide et le troc. »','« La petite qui détient le record ? Elle vient la nuit. Si tu la bats, je t’offre un mois de jetons. »']));
    }},
  club:{w:13,d:11,h:4.6,trim:'#b98cff',light:[0xb98cff,0x39e6ff],fog:0x0e0618,
    floor:canvasMat(32,32,(g,W,H)=>{g.fillStyle='#0c0a14';g.fillRect(0,0,W,H);g.fillStyle='#181424';g.fillRect(0,0,W,2)},10,8),
    wall:canvasMat(64,64,(g,W,H)=>{g.fillStyle='#120a1e';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=8)for(let x=(y/8)%2*8;x<W;x+=16){g.fillStyle='#1a1028';g.fillRect(x,y,8,8)}},6,3),
    build(R){const w=R.w,d=R.d;
      // piste de danse lumineuse
      R.tiles=[];for(let i=0;i<6;i++)for(let j=0;j<5;j++){const m=new THREE.Mesh(boxGeo,new THREE.MeshBasicMaterial({color:0x000000}));m.scale.set(.92,.04,.92);m.position.set(-2.75+i*1.1,.02,-1.4+j*1.1);R.g.add(m);R.tiles.push({m,i,j})}
      R.anims.push({k:0,f:t=>R.tiles.forEach(({m,i,j})=>{const v=Math.sin(t*3+i*.9+j*1.3)+Math.sin(t*1.7-i*.6);m.material.color.setHSL(((i+j)*.07+t*.05)%1,.9,Math.max(.05,v*.25))})});
      // cabine du DJ, enceintes, boule à facettes, lasers
      R.S(3.2,1.1,.9,'#1a1028',0,.55,-d/2+1.4);R.B(3.2,.08,.95,'#b98cff',0,1.12,-d/2+1.4,true);R.B(3,.7,.05,'#39e6ff',0,.55,-d/2+1.87,true);
      R.B(.5,.06,.4,'#e8e8e4',-.7,1.18,-d/2+1.3);R.B(.5,.06,.4,'#e8e8e4',.7,1.18,-d/2+1.3);
      [-1,1].forEach(s=>{for(let k=0;k<3;k++){R.S(1,.9,.9,'#0a0a10',s*(w/2-.8),.45+k*.92,-d/2+1);R.B(.5,.5,.04,'#222',s*(w/2-.8),.45+k*.92,-d/2+1.46);R.B(.2,.2,.05,'#b98cff',s*(w/2-.8),.45+k*.92,-d/2+1.47,true)}});
      const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.4,1),new THREE.MeshPhongMaterial({color:0xcfd8e8,flatShading:true,shininess:100,specular:0xffffff,emissive:0x221a33}));ball.position.set(0,R.h-.8,.8);R.g.add(ball);
      const las=new THREE.Group();las.position.set(0,R.h-.2,.8);R.g.add(las);
      for(let k=0;k<8;k++){const l=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,9),new THREE.MeshBasicMaterial({color:[0xb98cff,0x39e6ff,0xff4fa3,0x7dffb0][k%4],transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
        l.rotation.set(.5,k*Math.PI/4,0);las.add(l)}
      R.anims.push({k:0,f:t=>{ball.rotation.y=t*.8;las.rotation.y=t*.6;las.rotation.z=Math.sin(t*.7)*.3}});
      R.screen(0,3.4,-d/2+.08,0,4.4,1,(g,W,H,t)=>{g.fillStyle='#000';g.fillRect(0,0,W,H);for(let x=0;x<W;x+=4){const v=Math.abs(Math.sin(x*.15+t*6)*Math.sin(t*2+x*.03));g.fillStyle=x%8?'#b98cff':'#39e6ff';g.fillRect(x,H-v*H,3,v*H)}},128);
      R.sign('ONDES','#b98cff',0,2.55,-d/2+.08,0,.06);
      // petit bar à l'est, banquettes à l'ouest
      R.S(.7,1.05,3.4,'#1a1028',w/2-1,.52,1.4);R.B(.05,.05,3.4,'#39e6ff',w/2-1.36,1,1.4,true);
      R.S(.6,.5,4,'#3a1a5a',-w/2+.5,.25,1.4);R.B(.15,.9,4,'#3a1a5a',-w/2+.25,.7,1.4);
      R.who(0,-d/2+.6,0,{...randomSpec(),hair:'#b46bff'},'bob');R.who(w/2-.4,1.4,-Math.PI/2);
      [[-2,-.6],[-.5,0],[1.2,-1],[2.3,.4],[-1.3,1.4],[.6,1.6],[-2.6,.9]].forEach(([x,z])=>R.who(x,z,Math.random()*6,null,'dance'));
      R.obj(0,-d/2+2.3,1.3,'Parler au DJ',lines(['Le DJ retire un écouteur : « Lou ? Elle joue plus tard. Ce soir, c’est moi qui chauffe la salle. »','« Tu sens la basse dans ta poitrine ? C’est ça, Ondes. Pas besoin d’implant pour ressentir. »']));
      R.obj(.5,.4,1.4,'Danser',lines(['Tu te laisses porter par la basse. Pendant quelques minutes, tu oublies que tu as oublié.','Les dalles changent de couleur sous tes pieds. Quelqu’un te sourit dans la lumière violette.']));
      R.obj(w/2-1.8,1.4,1.2,'Commander au bar',lines(['« Un Bleu Néon, comme Lou ? » Le verre brille dans le noir. Ça a le goût de menthe et de pile électrique.','« Ici, l’eau est gratuite. C’est la règle de la maison. »']));
    }},
  laundry:{w:10,d:8,h:3.2,trim:'#7cf29a',light:[0x9fd8c8,0x4fb8cc],fog:0x0a1614,
    floor:canvasMat(16,16,(g,W,H)=>{g.fillStyle='#7a868a';g.fillRect(0,0,8,8);g.fillRect(8,8,8,8);g.fillStyle='#2e3a40';g.fillRect(8,0,8,8);g.fillRect(0,8,8,8)},10,8),
    wall:canvasMat(32,32,(g,W,H)=>{g.fillStyle='#16302e';g.fillRect(0,0,W,H);g.fillStyle='#1d3c3a';g.fillRect(0,0,W,1);g.fillRect(0,0,1,H)},8,3),
    build(R){const w=R.w,d=R.d;R.drums=[];
      const mac=(x,y,z,ry)=>{const sx=Math.sin(ry),sz=Math.cos(ry);const b=R.B(.85,.9,.75,'#6a767c',x,y,z);b.rotation.y=ry;
        const dr=new THREE.Group();dr.position.set(x+sx*.39,y+.05,z+sz*.39);dr.rotation.y=ry;R.g.add(dr);
        const ring=new THREE.Mesh(new THREE.TorusGeometry(.27,.04,6,16),mat('#8a969c'));dr.add(ring);
        const glass=new THREE.Mesh(new THREE.CircleGeometry(.25,16),new THREE.MeshBasicMaterial({color:pick([0x6fe8ff,0x9fd0ff,0x7cf29a,0xffb0d0])}));glass.position.z=-.01;dr.add(glass);
        const blade=new THREE.Mesh(new THREE.PlaneGeometry(.4,.07),new THREE.MeshBasicMaterial({color:0x0a2a30}));blade.position.z=.005;dr.add(blade);R.drums.push({blade,sp:2+Math.random()*4});
        R.B(.3,.06,.02,'#7cf29a',x+sx*.38-sz*.2,y+.36,z+sz*.38+sx*.2,true)};
      for(let i=0;i<6;i++)mac(-3.4+i*1.2,.45,-d/2+.5,0);R.block(0,-d/2+.5,3.9,.4);
      for(let i=0;i<3;i++){mac(w/2-.5,.45,-1.4+i*1.1,-Math.PI/2);mac(w/2-.5,1.36,-1.4+i*1.1,-Math.PI/2)}R.block(w/2-.5,-.3,.4,1.7);
      R.anims.push({k:0,f:t=>R.drums.forEach(D=>D.blade.rotation.z=t*D.sp)});
      // banc, table à plier, distributeur, tube qui grésille
      R.S(3,.45,.5,'#3a4a50',-.6,.22,.6);R.S(1.6,.9,.8,'#8a969c',-w/2+1.2,.45,1.8);R.B(.6,.2,.4,'#e8e8e4',-w/2+1.1,.98,1.8);
      R.S(.9,1.9,.7,'#1a2a30',-w/2+.6,.95,-1.2);R.B(.6,1.2,.05,'#7cf29a',-w/2+.97,1.2,-1.2,true).rotation.y=Math.PI/2;
      const tube=R.B(3,.06,.12,'#e8fff4',0,R.h-.08,-.5,true);R.anims.push({k:0,f:t=>{tube.visible=!(Math.sin(t*23)>.94||Math.sin(t*7.3)>.985)}});
      R.sign('LAVERIE 24/7','#7cf29a',0,2.5,-d/2+.08,0,.06);R.sign('NE PAS LAISSER LE LINGE SANS SURVEILLANCE','#cfe8ff',-w/2+.08,2.2,1.6,Math.PI/2,.022);
      R.who(-1.6,1.05,Math.PI);R.who(.3,1.05,Math.PI*.95,{...randomSpec(),coat:'#d8c49c'});R.who(-w/2+1.5,2.6,0,null,'sway');
      R.obj(-2.2,-d/2+1.3,1.2,'Regarder les machines',lines(['Le linge tourne derrière le hublot. Le bruit régulier est presque apaisant. Pas étonnant que des gens dorment ici.','Une machine affiche « ERREUR 2086 ». Quelqu’un a scotché un mot : « NE PAS UTILISER. VRAIMENT. »']));
      R.obj(-.6,1.5,1.2,'Parler aux clients',lines(['« Okoro ? Il passe chaque soir, toujours à la même heure. Il plie son linge avec une précision de flic. »','« Ici, la nuit, c’est le seul endroit chaud et éclairé du quartier. Personne ne te pose de questions. »']));
      R.obj(-w/2+.9,-1.2,1.1,'Distributeur',()=>'Le distributeur propose de la lessive, des barres protéinées et… des puces mémoire d’occasion. Tu préfères ne pas savoir d’où elles viennent.');
    }},
  bunker:{w:12,d:10,h:3.2,trim:'#ff2e3e',light:[0xff2e3e,0xffb547],fog:0x140606,
    floor:canvasMat(32,32,(g,W,H)=>{g.fillStyle='#2a2c30';g.fillRect(0,0,W,H);for(let i=0;i<40;i++){g.fillStyle=rpick(['#25272b','#303236','#1f2124']);g.fillRect(Math.random()*W,Math.random()*H,2,2)}g.fillStyle='#1a1b1e';g.fillRect(0,0,W,1)},6,5),
    wall:null,
    build(R){const w=R.w,d=R.d;
      // table tactique avec la carte de la ville, au centre
      R.S(3.2,.9,2,'#1a1c20',0,.45,-.6);
      R.screen(0,.92,-.6,0,3,1.8,(g,W,H,t)=>{g.fillStyle='#120406';g.fillRect(0,0,W,H);g.strokeStyle='rgba(255,46,62,.5)';
        AVE.forEach(a=>{g.beginPath();g.moveTo(a*W,0);g.lineTo(a*W,H);g.stroke();g.beginPath();g.moveTo(0,a*H);g.lineTo(W,a*H);g.stroke()});
        const r=(t*40)%(W*.8);g.strokeStyle='rgba(255,180,71,.7)';g.beginPath();g.arc(W*.42,H*.7,r,0,7);g.stroke();
        [[.2,.63],[.65,.68],[.7,.46],[.88,.2],[.11,.9]].forEach(([u,v],i)=>{g.fillStyle=(Math.floor(t*2)+i)%3?'#ff2e3e':'#ffb547';g.fillRect(u*W-2,v*H-2,4,4)})},128).rotation.x=-Math.PI/2;
      // casiers à l'ouest, baies de serveurs à l'est
      for(let i=0;i<6;i++){R.B(.6,2,.55,'#3a3f46',-w/2+.35,1,-3+i*.65);R.B(.04,1.6,.04,'#15171c',-w/2+.64,1,-3+i*.65)}R.block(-w/2+.35,-1.4,.3,2);
      R.leds=[];for(let k=0;k<4;k++){R.S(.7,2.2,.9,'#101216',w/2-.45,1.1,-3+k*1.1);for(let r=0;r<10;r++){const l=R.B(.03,.04,.04,pick(['#7dffb0','#ff2e3e','#ffb547']),w/2-.81,.3+r*.18,-3.2+k*1.1+Math.random()*.4,true);R.leds.push(l)}}
      R.anims.push({k:0,f:t=>R.leds.forEach((l,i)=>l.visible=Math.sin(t*(3+i%5)+i)>-.3)});
      // bandes de danger, gyrophare, porte blindée au nord
      for(let i=0;i<10;i++)R.B(.4,.4,.04,i%2?'#ffb547':'#15171c',-1.8+i*.4,2.9,-d/2+.04);
      R.S(2,2.6,.3,'#3a3f46',0,1.3,-d/2+.15);R.B(.5,.5,.05,'#5a6068',0,1.3,-d/2+.32);R.sign('BUNKER ZÉRO','#ff2e3e',0,3.0,-d/2+.36,0,.04);
      const gyro=R.B(.25,.2,.25,'#ff2e3e',w/2-1,R.h-.15,d/2-1,true);R.anims.push({k:0,f:t=>{gyro.visible=Math.sin(t*8)>0}});
      R.S(2.2,.5,.6,'#2a2c30',-2.6,.25,2.6);R.S(2.2,.5,.6,'#2a2c30',2.6,.25,2.6);
      R.who(-1.4,.9,Math.PI*.8,{...randomSpec(),coat:'#1e2a44'});R.who(1.5,.8,-Math.PI*.8);R.who(1.9,-1.9,-.5,{...randomSpec(),hs:'buzz'});R.who(-2.6,2.2,0,null,'sway');
      R.obj(0,.75,1.5,'Consulter la table tactique',()=>'La carte de la Zone Zéro, en rouge. Cinq points clignotent : la gare, le port, le Bazar, la laverie… et ta planque. Quelqu’un suit tes déplacements, ou te protège.');
      R.obj(1.5,1.4,1.2,'Parler à une runneuse',lines(['« Ici, on ne vend rien et on n’achète rien. On court. Données, colis, personnes. Le reste ne nous regarde pas. »','« Tu étais des nôtres, avant. Tu ne t’en souviens pas ? Tu courais vite. Très vite. »','« Kurogane a posé des capteurs sur toutes les avenues. Nous, on passe par les toits. »']));
      R.obj(w/2-1.2,-1.4,1.2,'Examiner les serveurs',()=>'Des baies de serveurs bricolées, refroidies par un ventilateur d’usine. Un écran affiche : « MIROIR LÉTHÉ · 12 % ». Tu ne sais pas ce que ça veut dire. Pas encore.');
    }},
  port:{w:14,d:11,h:5,trim:'#8fb7ff',light:[0xffd8a0,0x8fb7ff],fog:0x0c1218,
    floor:canvasMat(32,32,(g,W,H)=>{g.fillStyle='#30343a';g.fillRect(0,0,W,H);for(let i=0;i<30;i++){g.fillStyle=rpick(['#2a2e33','#383c42']);g.fillRect(Math.random()*W,Math.random()*H,3,1)}g.fillStyle='#ffb547';g.fillRect(0,30,W,2)},7,5),
    wall:null,
    build(R){const w=R.w,d=R.d;
      // rayonnages chargés de caisses
      [-4.5,-1.5].forEach(z=>{for(let i=0;i<2;i++){const x=-3.6+i*7.2*.5*1.4;R.S(3.6,.1,1.1,'#3a4252',x,0,z);
        for(let l=0;l<3;l++){R.B(3.6,.06,1.1,'#ffb547',x,l*1.3+.05,z);for(let k=0;k<3;k++)if(Math.random()<.8)R.B(1,.9,.9,pick(['#7a5a3a','#5a4630','#2a6f7a','#7a2e22']),x-1.2+k*1.2,l*1.3+.53,z)}
        [-1.75,1.75].forEach(dx=>[-.5,.5].forEach(dz=>R.B(.08,3.9,.08,'#3a6aff',x+dx,1.95,z+dz)))}});
      // chariot élévateur qui fait des allers-retours
      const fk=new THREE.Group();R.g.add(fk);box(1,.6,1.6,'#d8a020',0,.5,0,fk);box(.9,.6,.7,'#222',0,1.1,.2,fk);box(.08,2,.08,'#333',-.3,1,-.9,fk);box(.08,2,.08,'#333',.3,1,-.9,fk);
      box(.8,.06,.8,'#555',0,.3,-1.2,fk);box(.7,.6,.7,'#7a5a3a',0,.65,-1.2,fk);box(.12,.12,.04,'#fff2c0',.3,.6,-.82,fk,true);box(.12,.12,.04,'#fff2c0',-.3,.6,-.82,fk,true);
      fk.rotation.y=Math.PI/2;R.anims.push({k:0,f:t=>{const u=Math.sin(t*.35);fk.position.set(u*4.4,0,.4);fk.rotation.y=Math.cos(t*.35)>0?-Math.PI/2:Math.PI/2}});
      R.block(0,.4,5.4,.9); // l'allée du chariot est interdite
      // lampes suspendues, bureau vitré, caisse marquée
      for(let i=0;i<4;i++){R.B(.02,1,.02,'#222',-4.5+i*3,R.h-.5,-3);R.B(.6,.12,.6,'#ffd8a0',-4.5+i*3,R.h-1.05,-3,true)}
      R.S(3,2.6,2.2,'#2a3140',w/2-1.6,1.3,d/2-1.8);R.B(2.2,.9,.05,'#ffd8a0',w/2-1.6,1.7,d/2-2.92,true);R.sign('BUREAU','#8fb7ff',w/2-1.6,2.45,d/2-2.94,Math.PI,.035);
      R.S(1.2,1,1.2,'#1a1a1a',-w/2+1.4,.5,d/2-2);R.B(.9,.5,.02,'#ff2e3e',-w/2+1.4,.6,d/2-1.39,true);R.sign('K','#ff2e3e',-w/2+1.4,.6,d/2-1.37,0,.06);
      R.sign('DOCKS NOIRS · ENTREPÔT 7','#8fb7ff',0,4.3,-d/2+.08,0,.06);
      R.who(-2.6,2.3,Math.PI/2,{...randomSpec(),top:'#ff8a3d'});R.who(3.4,2.4,-Math.PI/2,{...randomSpec(),top:'#ff8a3d',hs:'cap'});R.who(w/2-1.6,d/2-3.3,0,{...randomSpec(),coat:'#3a3f4c'});
      R.obj(-w/2+1.4,d/2-2.6,1.3,'Examiner la caisse noire',()=>'Une caisse noire, sans étiquette de douane. Juste une lettre rouge peinte au pochoir : K. Le cadenas est neuf. Quelqu’un l’a entreposée ici il y a peu.');
      R.obj(-2.6,2.9,1.2,'Parler aux dockers',lines(['« On décharge, on ne pose pas de questions. Les barges de nuit, surtout, on ne pose pas de questions. »','« Le chariot ? Il roule tout seul depuis la mise à jour. On préfère ne pas être sur son chemin. »']));
      R.obj(w/2-1.6,d/2-3.6,1.2,'Parler au contremaître',lines(['« Entrepôt 7. Si tu cherches du travail, reviens demain à l’aube. Si tu cherches autre chose, ne reviens pas. »','« Les registres de 2086 ? Brûlés. Une fuite de gaz, officiellement. »']));
    }}
};

function buildInteriors(){
  inLights=[new THREE.PointLight(0xffffff,0,15,1.4),new THREE.PointLight(0xffffff,0,13,1.4)];inLights.forEach(l=>scene.add(l));
  const wallOf={bunker:()=>photoMat('concrete',3,1,.5),port:()=>photoMat('corrugated',4,1.4,.45)};
  let k=0;for(const id in IN_DEF){const o=IN_DEF[id];if(!o.wall)o.wall=(wallOf[id]&&wallOf[id]())||mat('#2a2e34');makeRoom(id,o,W+60+k*22,H/2);k++}
}
function updateInteriors(dt){
  const z=zoneOf(),Z=z&&ZONES[z],R=Z&&Z.room?ROOMS[Z.room]:null;
  if(R!==inCur){inCur=R;inLights.forEach((l,i)=>{if(!R){l.intensity=0;return}l.color.setHex(R.o.light[i]);l.intensity=i?1.1:1.6;l.position.set(R.cx+(i?R.w/4:-R.w/5),IY+R.h-.5,R.cz+(i?R.d/5:-R.d/5))})}
  if(!R)return;
  if(distT>8)distT=8; // la caméra reste près de la pièce
  R.south.visible=camera.position.z<R.cz+R.d/2-.1;
  // dans une pièce : pas de pluie, pas de brouillard de la rue
  if(rain)rain.mesh.visible=false;scene.fog.color.setHex(R.o.fog);scene.background.setHex(R.o.fog);scene.fog.density=.012;hemi.intensity=.6;
  R.anims.forEach(a=>{a.k+=dt;if(a.k>.08){a.k=0;a.f(tAcc)}});
  R.chars.forEach(c=>{if(!c.anim)return;c.ph+=dt;const m=c.m;
    if(c.anim==='dance'){m.position.y=IY+Math.abs(Math.sin(c.ph*4))*.18;m.userData.ry+=dt*1.2*(c.ph%2>1?1:-1);m.userData.moving=Math.sin(c.ph*2)>0}
    else if(c.anim==='bob'){m.position.y=IY+Math.abs(Math.sin(c.ph*4.2))*.06}
    else if(c.anim==='sway'){m.userData.moving=Math.sin(c.ph*.7)>.6}});
}
