// Petites scènes de vie dans la ville : des clients qui mangent au stand Nouilles Zéro, des gens qui discutent par deux
// (avec des bulles qui alternent), d'autres qui boivent un café devant le distributeur. Les passants les contournent.
'use strict';

const VIGN={built:false,chat:[],eat:[],sip:[]};
function bubbleTex(t){const c=document.createElement('canvas');c.width=64;c.height=40;const g=c.getContext('2d');g.fillStyle='rgba(240,244,250,.95)';
  g.beginPath();g.moveTo(10,2);g.lineTo(54,2);g.quadraticCurveTo(62,2,62,10);g.lineTo(62,24);g.quadraticCurveTo(62,32,54,32);g.lineTo(26,32);g.lineTo(16,39);g.lineTo(18,32);g.lineTo(10,32);g.quadraticCurveTo(2,32,2,24);g.lineTo(2,10);g.quadraticCurveTo(2,2,10,2);g.fill();
  g.fillStyle='#1a1d26';g.font='bold 18px sans-serif';g.textAlign='center';g.fillText(t,32,24);const tx=new THREE.CanvasTexture(c);return tx}
const BUBBLES=['…','?!','haha','♪','!','…?','♥','¥€'].map(bubbleTex);
function spotNear(x,z,r){for(let k=0;k<60;k++){const a=Math.random()*6.28,d=Math.random()*r,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  const ok=(qx,qz)=>!isSolid(qx,qz)&&tile[I(Math.floor(qx),Math.floor(qz))]!==2&&!FURN.some(f=>Math.hypot(f[0]-qx,f[1]-qz)<f[2]+.45)&&!npcs.some(n=>Math.hypot(n.mesh.position.x-qx,n.mesh.position.z-qz)<1.2)&&!statics.some(s=>Math.hypot(s.position.x-qx,s.position.z-qz)<.8);
  if(ok(px,pz)&&ok(px+.95,pz))return {x:px,z:pz}}return null}
function buildVignettes(){VIGN.built=true;const R=()=>randomSpec(Math.random);
  // au comptoir des nouilles : deux clients assis sur les tabourets, un bol fumant devant chacun
  if(NOODLE_POS){const X=NOODLE_POS.x,ZF=NOODLE_POS.z-.9;[-.6,.6].forEach((dx,i)=>{const m=makeChar(R());m.position.set(X+dx,.2,ZF+.45);m.userData.ry=Math.PI;m.userData.sit=true;
    const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.11,.07,.08,12),mat('#e8e4d8'));bowl.position.set(X+dx,1.1,ZF-.02);scene.add(bowl);box(.2,.02,.02,'#c8a070',X+dx+.05,1.17,ZF-.02);
    const st=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xeef2f8,transparent:true,opacity:.25,depthWrite:false}));st.scale.set(.35,.5,1);st.position.set(X+dx,1.35,ZF-.02);scene.add(st);
    VIGN.eat.push({m,st,ph:i*2})})}
  // des gens qui discutent par deux, devant les lieux animés
  [FP('laundry',2.2,-1.5),FP('bar',2.4,3),FP('club',2.6,3.2),{x:GX+GHW+2.2,z:GZ0+3.5},FP('arcade',2.4,-3),FP('market',2.6,4),{x:PL.port.x+4,z:PL.port.z+5}].forEach((a,k)=>{const s=spotNear(a.x,a.z,1.6);if(!s)return;
    const A=makeChar(R()),B=makeChar(R());A.position.set(s.x,0,s.z);B.position.set(s.x+.95,0,s.z);A.userData.ry=Math.PI/2;B.userData.ry=-Math.PI/2;statics.push(A,B);
    const bub=new THREE.Sprite(new THREE.SpriteMaterial({map:BUBBLES[0],transparent:true,depthWrite:false}));bub.scale.set(.55,.35,1);scene.add(bub);
    VIGN.chat.push({A,B,bub,t:Math.random()*3,who:0,ph:k})});
  // devant le distributeur du Bunker : deux personnes, un gobelet de café à la main
  [[54.3,50.4,-Math.PI/2],[54.5,51.9,-Math.PI*.6]].forEach(([x,z,ry],i)=>{if(isSolid(x,z))return;const m=makeChar(R());m.position.set(x,0,z);m.userData.ry=ry;statics.push(m);
    const cup=box(.07,.11,.07,'#f4f0e6',x-.18,1.0,z+.05);VIGN.sip.push({m,cup,y0:1.0,ph:i*1.7})});
}
function updateVignettes(dt){if(!started)return;if(!VIGN.built)buildVignettes();const t=tAcc;
  VIGN.chat.forEach(c=>{c.t-=dt;if(c.t<=0){c.who^=1;c.t=2+Math.random()*2.5;c.bub.material.map=BUBBLES[Math.floor(Math.random()*BUBBLES.length)];c.bub.material.needsUpdate=true}
    const sp=c.who?c.B:c.A,on=c.t>.5;c.bub.visible=on&&!zoneOf();c.bub.position.set(sp.position.x,2.25+Math.sin(t*3)*.03,sp.position.z);
    c.A.userData.ry=Math.PI/2+Math.sin(t*.7+c.ph)*.25;c.B.userData.ry=-Math.PI/2+Math.sin(t*.6+c.ph+1)*.25}); // ils bougent la tête en parlant
  VIGN.eat.forEach(e=>{e.st.material.opacity=.15+Math.sin(t*2+e.ph)*.1;e.st.position.y=1.35+((t*.4+e.ph)%1)*.3;e.m.userData.ry=Math.PI+Math.sin(t*1.5+e.ph)*.15});
  VIGN.sip.forEach(s=>{const k=Math.max(0,Math.sin(t*.5+s.ph));s.cup.position.y=s.y0+k*k*.45}); // une gorgée de temps en temps
}
