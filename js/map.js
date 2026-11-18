// La carte de la ville : grille, avenues, lieux, tours, port, gare, planque, collisions, étapes des histoires.
'use strict';

/* ===================== CARTE ===================== */
// La ville reprend la carte de l'appli (zonemaps) : u,v ∈ [0,1] → x = MOX + u·MS, z = MO + v·MS. À gauche du périphérique : le port.
const W=92,H=76,MS=64,MO=5,MOX=21;
const solid=new Uint8Array(W*H), tile=new Uint8Array(W*H); // tile: 0 béton,1 trottoir,2 asphalte,3 parquet,4 dalles,5 eau
const I=(x,z)=>z*W+x;
function fill(arr,x0,z0,x1,z1,v){for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)if(x>=0&&z>=0&&x<W&&z<H)arr[I(x,z)]=v}
const UX=u=>MOX+u*MS,UZ=v=>MO+v*MS;
const HX=41,HZ=57; // la planque (construite en coordonnées locales 2–11 × 2–9) est posée au point vert de la carte
const AVE=[0,3,6,9].map(i=>(i+.5)/12);
const PLACE={bar:{n:'LE NÉON NOIR',c:'#ff4fa3'},market:{n:'BAZAR NÉON',c:'#f6b35c'},club:{n:'CLUB ONDES',c:'#b98cff'},roofs:{n:'TOITS DE ZONE ZÉRO',c:'#6ff3f0'},laundry:{n:'LAVERIE 24/7',c:'#7cf29a'},arcade:{n:'ARCADE PIXEL',c:'#5ce1e6'},port:{n:'PORT FLUVIAL',c:'#8fb7ff'},lab:{n:'PARKING-LABO',c:'#e8505b'},bunker:{n:'BUNKER ZÉRO',c:'#ff2e3e'},comm:{n:'ANCIEN COMMISSARIAT',c:'#8fb7ff'}};
const HZF=h=>Math.max(2.4,h/.46*MS*.55);
// Lieux de la carte, recalés dans leur pâté de maisons : jamais sur une avenue, entrée toujours tournée vers une avenue
const PL={
  bar:{u:.2017,v:.6317,s:.045,h:.07,face:'+x'},
  roofs:{u:.3867,v:.4467,s:.05,h:.44,face:'+z'},
  market:{u:.6527,v:.68,s:.066,h:.02,face:'-x'},
  laundry:{u:.70,v:.438,s:.04,h:.05,face:'+z'},
  lab:{u:.9067,v:.6767,s:.07,h:.03,face:'+z'},
  club:{u:.6417,v:.1917,s:.055,h:.08,face:'-x'},
  arcade:{u:.8817,v:.20,s:.045,h:.07,face:'-x'},
  bunker:{u:.4167,v:.6967,s:.05,h:.05,face:'+z'}
};
for(const id in PL){const p=PL[id];p.x=UX(p.u);p.z=UZ(p.v);p.hw=p.hd=p.s*MS}
PL.port={x:13.4,z:UZ(.22),hw:2.2,hd:3.4,h:.06,face:'+x'};
function front(id,off,lat){const p=PL[id];off=off==null?1.3:off;lat=lat||0;
  return p.face==='+x'?[p.x+p.hw+off,p.z+lat]:p.face==='-x'?[p.x-p.hw-off,p.z-lat]:p.face==='+z'?[p.x+lat,p.z+p.hd+off]:[p.x-lat,p.z-p.hd-off]}
const FP=(id,off,lat)=>{const [x,z]=front(id,off,lat);return {x,z}};
// le toit de la tour des Toits : on y monte par la porte, on s'y promène autour de l'antenne
const ROOF={x:PL.roofs.x,z:PL.roofs.z,hw:PL.roofs.hw,hd:PL.roofs.hd,y:HZF(PL.roofs.h)};
const ROOF_BLOCK=[[ROOF.x,ROOF.z,.5,.5],[ROOF.x-1.6,ROOF.z+1.6,1.25,1.25],[ROOF.x+1.9,ROOF.z-1.9,.85,.85],[ROOF.x-2.3,ROOF.z-2.2,.45,.45]];
// Générateur de Kotlin (XorWow) : même disposition des tours que la carte du téléphone
class KRandom{
  constructor(seed,isInt){const lo=seed|0,hi=isInt?(lo>>31):Math.floor(seed/4294967296)|0;
    this.x=lo;this.y=hi;this.z=0;this.w=0;this.v=~lo;this.addend=(lo<<10)^(hi>>>4);for(let i=0;i<64;i++)this.nextInt()}
  nextInt(){let t=this.x;t^=t>>>2;this.x=this.y;this.y=this.z;this.z=this.w;const v0=this.v;this.w=v0;t=(t^(t<<1))^v0^(v0<<4);this.v=t|0;this.addend=(this.addend+362437)|0;return (t+this.addend)|0}
  nextBits(n){return n===0?0:this.nextInt()>>>(32-n)}
  nextIntUntil(n){if((n&-n)===n)return this.nextBits(31-Math.clz32(n));let bits,v;do{bits=this.nextInt()>>>1;v=bits%n}while(((bits-v+(n-1))|0)<0);return v}
  nextFloat(){return this.nextBits(24)/16777216}
}
const APP_SPOTS=[[.22,.62],[.34,.4],[.58,.7],[.7,.52],[.82,.74],[.62,.28],[.78,.2],[.14,.24],[.46,.52]];
const TOWERS=(()=>{const r=new KRandom(2089,true),n=12,out=[];const NEONS=['#ff2e9a','#39e6ff','#b98cff','#ffb13b','#7cf29a'];
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){
    if(i%3===0||j%3===0)continue;
    const u=(i+.5)/n,v=(j+.5)/n;
    if(APP_SPOTS.some(([x,y])=>Math.abs(x-u)<.075&&Math.abs(y-v)<.075))continue;
    if(r.nextIntUntil(100)<12)continue;
    const tall=r.nextIntUntil(100)<22;
    const s=.028+r.nextFloat()*.01,h=tall?.18+r.nextFloat()*.22:.03+r.nextFloat()*.09;
    const neon=NEONS[r.nextIntUntil(5)];r.nextInt();
    if((u<.22&&v>.72)||u<.17)continue; // place de la gare et viaduc
    if(u>.3&&u<.52&&v>.82)continue; // ta planque
    if(Object.values(PL).some(p=>p.u!=null&&Math.abs(p.u-u)<p.s+s+.012&&Math.abs(p.v-v)<p.s+s+.012))continue; // un lieu a pris la place
    out.push({u,v,s,h,neon,j});
  }return out})();
// l'ancien commissariat : une tour dont la façade sud donne sur une avenue, près de la laverie
(()=>{const c=TOWERS.filter(t=>t.j%3===2).sort((a,b)=>Math.hypot(a.u-.72,a.v-.45)-Math.hypot(b.u-.72,b.v-.45))[0];c.comm=true;
  PL.comm={x:UX(c.u),z:UZ(c.v),hw:c.s*MS,hd:c.s*MS,face:'+z'}})();
function solidCells(x0,z0,x1,z1){fill(solid,Math.floor(x0+.3),Math.floor(z0+.3),Math.floor(x1-.3),Math.floor(z1-.3),1)}
// sol
for(let z=0;z<H;z++)for(let x=0;x<W;x++){
  const u=(x+.5-MOX)/MS,v=(z+.5-MO)/MS,i=I(x,z);
  const inRing=u>-.042&&u<1.042&&v>-.042&&v<1.042,inCity=u>-.006&&u<1.006&&v>-.006&&v<1.006;
  let t=0;
  if(inRing){if(!inCity)t=2;else{const d=Math.min(...AVE.map(a=>Math.min(Math.abs(u-a),Math.abs(v-a))));t=d<.025?2:d<.045?1:0}}
  else if(u<=-.042&&v>-.042&&x>0&&x<18)t=x<9.5?5:4; // le port : bassin et quai (jusqu’au bord sud : on arrive directement à l’eau)
  else solid[i]=1;
  if(t===5)solid[i]=1;
  tile[i]=t;
}
// trottoirs extérieurs, au pied des immeubles qui ferment la ville (nord, est, sud) : on peut s’y promener
for(let z=0;z<H;z++)for(let x=18;x<W;x++){if(z<2||z>=72||x>=88){solid[I(x,z)]=0;tile[I(x,z)]=1}}
const PIERS=[.3,.5,.7,.9].map(UZ);
PIERS.forEach(pz=>{fill(tile,2,Math.floor(pz),9,Math.floor(pz)+1,4);fill(solid,2,Math.floor(pz),9,Math.floor(pz)+1,0)});
// tours et lieux
TOWERS.forEach(b=>{const x=UX(b.u),z=UZ(b.v),s=b.s*MS;solidCells(x-s,z-s,x+s,z+s)});
const STALLS=[];
for(const id in PL){const p=PL[id];if(id==='comm')continue;
  if(id==='market'){for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const x=p.x+i*3.6,z=p.z+j*3.6;STALLS.push([x,z]);fill(solid,Math.floor(x-.5),Math.floor(z-.3),Math.floor(x+.5),Math.floor(z+.3),1)}
    fill(tile,Math.floor(p.x-p.hw),Math.floor(p.z-p.hd),Math.floor(p.x+p.hw),Math.floor(p.z+p.hd),4);continue}
  if(id==='club'){const k=p.hw*.78;solidCells(p.x-k,p.z-k,p.x+k,p.z+k);const [vx,vz]=front('club',-.5);solidCells(vx-.9,vz-1.6,vx+.9,vz+1.6);continue}
  solidCells(p.x-p.hw,p.z-p.hd,p.x+p.hw,p.z+p.hd)}
// petits bâtiments voisins : une pharmacie à côté de la laverie, un cybercafé à côté de l'Arcade (alignés sur la façade du lieu)
const ANNEX=[{x0:59.4,z0:32.3,x1:62.7,z1:35.3,h:3.4,face:'+z',n:'PHARMACIE',c:'#7cf29a',cross:true},{x0:74.7,z0:11.5,x1:77.9,z1:14.4,h:3.6,face:'-x',n:'CYBERCAFÉ',c:'#5ce1e6'}];
ANNEX.forEach(a=>solidCells(a.x0,a.z0,a.x1,a.z1));
// port : grue et conteneurs sur le quai
const CRANE=[10.6,UZ(.4)],CONT=[12.5,UZ(.44)-2,16.5,UZ(.56)-3.2]; /* les conteneurs, décalés pour laisser la place au marché de nuit */
solid[I(Math.floor(CRANE[0]),Math.floor(CRANE[1]))]=1;solidCells(CONT[0],CONT[1],CONT[2],CONT[3]);
// gare Zéro : halle voûtée sur la place, viaduc qui part vers le haut de la ville
const GX=UX(.11),GZ0=UZ(.835),GZ1=UZ(.985),GHW=2.6;
fill(tile,Math.floor(GX-GHW),Math.floor(GZ0),Math.floor(GX+GHW),Math.floor(GZ1),4);
const onRoadV=v=>AVE.some(a=>Math.abs(v-a)<.034)||(v>-.046&&v<-.002);
const PILLARS=[];for(let z=-110;z<GZ0-1;z+=3.84){if(!onRoadV((z-MO)/MS))PILLARS.push(z)}
PILLARS.forEach(z=>{if(z>=0)solid[I(Math.floor(GX),Math.floor(z))]=1});
for(let k=0;k<=8;k+=2){const z=Math.floor(GZ0+(GZ1-GZ0)*k/8);solid[I(Math.floor(GX-GHW),z)]=1;solid[I(Math.floor(GX+GHW),z)]=1}
fill(solid,Math.floor(GX),Math.floor(GZ0),Math.floor(GX),Math.floor(GZ1),1);
fill(solid,Math.floor(GX-2.3),Math.floor(GZ1-3.4),Math.floor(GX-1.1),Math.floor(GZ1-.2),1); // escalier du quai ouest
// niveaux où l'on peut monter : le toit de la tour Zéro, le quai ouest de la gare (par l'escalier)
const QUAI_Y=2.71,QUAI_END=GZ1-3.75;
const ZONES={roof:{x:ROOF.x,z:ROOF.z,hw:ROOF.hw-.5,hd:ROOF.hd-.5,y:ROOF.y,blocks:ROOF_BLOCK},
  quai:{x:GX-1.62,z:(GZ0-.6+QUAI_END)/2,hw:.52,hd:(QUAI_END-GZ0+.6)/2-.25,y:QUAI_Y,blocks:[]}};
const zoneOf=()=>S.roof===true?'roof':(S.roof||null);
const zoneY=()=>{const z=zoneOf();return z?ZONES[z].y:0};
const itemZone=o=>o.zone||(o.roof?'roof':null);
[[GX+GHW+.6,GZ0+2],[GX+GHW+.6,GZ0+3],[GX+GHW+.24,(GZ0-.6+GZ1)/2+2],[GX+GHW+.24,(GZ0-.6+GZ1)/2-2],[GX+GHW+1.8,GZ1-.6]].forEach(([x,z])=>{solid[I(Math.floor(x),Math.floor(z))]=1}); // distributeurs, piliers du tableau
fill(solid,Math.floor(GX+GHW+2.3),Math.floor(GZ1-1.9),Math.floor(GX+GHW+4.5),Math.floor(GZ1-.3),1); // kiosque
// (la borne de la station de taxis est posée dans js/taxi.js)
// planque
fill(tile,2+HX,2+HZ,11+HX,9+HZ,3);
const hs=(x,z)=>{solid[I(x+HX,z+HZ)]=1},hf=(x0,z0,x1,z1)=>fill(solid,x0+HX,z0+HZ,x1+HX,z1+HZ,1);
for(let x=2;x<=11;x++){hs(x,2);if(x!==6&&x!==7)hs(x,9)}
for(let z=2;z<=9;z++){hs(2,z);hs(11,z)}
hf(3,3,4,5);hf(8,3,10,3);hs(10,8);hf(10,4,10,7);hf(3,6,3,8);hs(5,3);hs(4,8);
// (la moto n'est plus figée devant la porte : voir js/moto.js)
// murs extérieurs de l'immeuble (2 étages) autour de la planque ; seule la porte reste ouverte
for(let z=1;z<=10;z++){hs(1,z);hs(12,z)}for(let x=1;x<=12;x++){hs(x,1);if(x!==6&&x!==7)hs(x,10)}
const isSolid=(x,z)=>{const cx=Math.floor(x),cz=Math.floor(z);if(cx<0||cz<0||cx>=W||cz>=H)return true;return solid[I(cx,cz)]===1};
// réverbères le long des avenues et du quai
const LAMPS=[];
// jamais de réverbère devant une entrée ou une enseigne
const nearEntrance=(x,z)=>Object.keys(PL).some(id=>{const [fx,fz]=front(id,1.3);return Math.hypot(fx-x-.5,fz-z-.5)<6.2})||Math.hypot(PL.bar.x-x-.5,PL.bar.z+PL.bar.hd+1-z-.5)<3;
AVE.forEach(a=>{for(let t=.03;t<.99;t+=.085){[[UX(a)+2.6,UZ(t)],[UX(t),UZ(a)+2.6]].forEach(([x,z])=>{const cx=Math.floor(x),cz=Math.floor(z);if(!isSolid(cx,cz)&&tile[I(cx,cz)]!==2&&!isSolid(cx+1,cz)&&!isSolid(cx,cz+1)&&!nearEntrance(cx,cz))LAMPS.push([cx,cz])})}});
for(let z=UZ(.05);z<UZ(.98);z+=7){const cz=Math.floor(z);if(!isSolid(10,cz)&&!PIERS.some(p=>Math.abs(p-cz)<2))LAMPS.push([10,cz])}
// étapes des histoires, posées devant les entrées
SPOTS={
  vasko:[{x:GX-1.3,z:GZ0+2.5,lab:'Le vendeur de câbles · quai 4'},{x:PL.bar.x+1.2,z:PL.bar.z+PL.bar.hd+1.3,lab:'Le panneau publicitaire'},{x:GX+1.3,z:GZ1-1.6,lab:'Le casier du quai 6'}],
  mira:[{x:9.3+HX,z:4.4+HZ,lab:'Ton terminal'},{x:ROOF.x+1,z:ROOF.z+1.1,roof:true,lab:'L’antenne du toit'},{...FP('bunker',1.3,1.8),lab:'Le serveur du Bunker Zéro'}],
  doc:[{...FP('market',1.2,-3),lab:'Le patient du Bazar'},{x:PL.market.x+1.8,z:PL.market.z-1.8,lab:'Le stand à moitié prix'},{...FP('lab',1.3,2.6),lab:'Le coursier de la filiale'}],
  lou:[{...FP('club',1.3,-2.4),lab:'La radio du club'},{...FP('arcade',1.3,1.8),lab:'Le serveur du label · Arcade Pixel'},{...FP('bar',1.3,-2.4),lab:'Le juke-box du Néon Noir'}],
  okoro:[{...FP('laundry',1.3,2.6),lab:'Le chef de la bande'},{...FP('comm',1.3,-1.2),lab:'Les archives brûlées'},{...FP('comm',1.3,1.2),lab:'La salle des scellés'}]
};
