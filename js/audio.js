// Ambiance sonore, effets et musique, entièrement générés par le navigateur (Web Audio) : aucun fichier son.
// · Pluie douce (seulement quand il pleut), vent, tonnerre : sons globaux.
// · Sons de proximité (voitures, voitures volantes, moto, foule, TGV, mer, club) : on ne les entend qu'à 3 m au plus,
//   placés à gauche ou à droite selon leur direction ; ils s'éteignent dans les intérieurs.
// · Musique : au menu principal et en pause ; dans la planque quand la radio est allumée ; un autre morceau, plus dansant, dans le club Ondes.
// · Petits sons de dialogue pendant que le texte s'affiche.
// Les volumes se règlent dans Paramètres → Son ; ils sont bas par défaut et gardés dans ce navigateur.
'use strict';

const AUD={ctx:null,vol:{master:.5,music:.22,amb:.55,sfx:.45},N:{},L:{}};
try{Object.assign(AUD.vol,JSON.parse(localStorage.getItem('neobxl-audio')||'{}'))}catch(e){}
function saveAudio(){try{localStorage.setItem('neobxl-audio',JSON.stringify(AUD.vol))}catch(e){}}
const HEAR=3; // portée des sons de proximité, en mètres

function noiseBuf(c,sec,brown){const n=c.sampleRate*sec,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let last=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;if(brown){last=(last+.02*w)/1.02;d[i]=last*3.5}else d[i]=w}return b}
function impulse(c,sec){const n=c.sampleRate*sec,b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3)}return b}
const now=()=>AUD.ctx.currentTime,setG=(node,v,t)=>(node.g||node).gain.setTargetAtTime(Math.max(0,v||0),now(),t||.4);
const near=d=>Math.max(0,1-d/HEAR); // 1 tout près, 0 à 3 m et au-delà

function audioInit(){
  if(AUD.ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const c=AUD.ctx=new AC(),N=AUD.N;
  N.master=c.createGain();N.master.connect(c.destination);
  N.mus=c.createGain();N.mus.gain.value=0;N.mus.connect(N.master);
  N.sfx=c.createGain();N.sfx.connect(N.master);
  N.amb=c.createGain();N.amb.gain.value=0;N.muffle=c.createBiquadFilter();N.muffle.type='lowpass';N.muffle.frequency.value=18000;N.amb.connect(N.muffle);N.muffle.connect(N.master);
  N.rev=c.createConvolver();N.rev.buffer=impulse(c,2.6);const rg=c.createGain();rg.gain.value=.45;N.rev.connect(rg);rg.connect(N.mus);
  applyVolumes();
  AUD.white=noiseBuf(c,3,false);AUD.brown=noiseBuf(c,4,true);
  // chaque source de proximité passe par un panoramique (gauche / droite)
  const pan=g=>{const p=c.createStereoPanner?c.createStereoPanner():null;if(p){g.connect(p);p.connect(N.amb)}else g.connect(N.amb);return p};
  const layer=(buf,type,f,q)=>{const s=c.createBufferSource();s.buffer=buf;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);const pn=pan(g);s.start(0,Math.random()*2);return {g,fl,pn}};
  const drone=(type,f,ft,ff)=>{const fl=c.createBiquadFilter();fl.type=ft;fl.frequency.value=ff;const g=c.createGain();g.gain.value=0;fl.connect(g);const pn=pan(g);
    const os=[1,1.008].map(k=>{const o=c.createOscillator();o.type=type;o.frequency.value=f*k;o.connect(fl);o.start();return o});return {g,fl,os,pn}};
  const L=AUD.L;
  L.rain=layer(AUD.white,'bandpass',2600,.45);L.rainLow=layer(AUD.brown,'lowpass',600,.5);L.wind=layer(AUD.brown,'bandpass',320,.8);
  L.crowd=layer(AUD.brown,'bandpass',650,1.4);L.city=layer(AUD.brown,'lowpass',150,.7);L.sea=layer(AUD.brown,'lowpass',520,.7);
  L.train=layer(AUD.brown,'lowpass',240,.9);L.cars=layer(AUD.white,'bandpass',800,1.6);
  L.fly=drone('sawtooth',92,'lowpass',380);L.moto=drone('triangle',62,'lowpass',260);L.club=drone('sine',46,'lowpass',160);
  // brouhaha de conversations (deux bandes de voix), qui ne passe pas par le filtre des intérieurs : on l'entend dans le bar ou le Bazar
  N.room=c.createGain();N.room.gain.value=0;N.room.connect(N.master);
  // la laverie : le tambour des machines qui tourne (souffle grave, rythmé) et le ronron des moteurs
  {const s=c.createBufferSource();s.buffer=AUD.brown;s.loop=true;const fl=c.createBiquadFilter();fl.type='bandpass';fl.frequency.value=220;fl.Q.value=1.2;const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(N.room);s.start();L.wash={g,fl};
   const o=c.createOscillator();o.frequency.value=52;const g2=c.createGain();g2.gain.value=0;o.connect(g2);g2.connect(N.room);o.start();L.washMotor={g:g2}}
  L.babble=['900',' 2100'].map((f,i)=>{const s=c.createBufferSource();s.buffer=AUD.brown;s.loop=true;const fl=c.createBiquadFilter();fl.type='bandpass';fl.frequency.value=+f;fl.Q.value=i?2:1.3;const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(N.room);s.start(0,Math.random()*3);return {g,fl}});
  startMusic();
}
function applyVolumes(){const N=AUD.N;if(!AUD.ctx)return;N.master.gain.value=AUD.vol.master;N.sfx.gain.value=AUD.vol.sfx}
// le son ne peut démarrer qu'après un geste de l'utilisateur (règle des navigateurs)
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{audioInit();if(AUD.ctx&&AUD.ctx.state==='suspended')AUD.ctx.resume()},{passive:true}));

// ---- tonnerre : un grondement grave, quelques instants après l'éclair ----
function thunder(){const c=AUD.ctx,t=now()+.4+Math.random()*1.4,s=c.createBufferSource();s.buffer=AUD.brown;const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(900,t);fl.frequency.exponentialRampToValueAtTime(120,t+3);
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.7,t+.08);g.gain.exponentialRampToValueAtTime(.001,t+4.5);s.connect(fl);fl.connect(g);g.connect(AUD.N.amb);s.start(t,Math.random());s.stop(t+5)}

// ---- petits sons de dialogue : un « bip » doux par syllabe, plus grave ou plus aigu selon qui parle ----
const VOICE={mira:660,vasko:300,doc:360,okoro:250,lou:740,neura:880,you:480,nar:420};let blipT=0;
function talkBlip(who){if(!AUD.ctx||AUD.ctx.state!=='running')return;const t=now();if(t-blipT<.06)return;blipT=t;
  const c=AUD.ctx,o=c.createOscillator(),g=c.createGain(),f=(VOICE[who]||420)*(.92+Math.random()*.16);o.type=who==='neura'?'square':'triangle';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.85,t+.06);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(who==='nar'?.025:.05,t+.008);g.gain.exponentialRampToValueAtTime(.0005,t+.07);o.connect(g);g.connect(AUD.N.sfx);o.start(t);o.stop(t+.08)}

// ---- où en est-on : menu ou pause, cinématique, ou en jeu ----
function hid(id){const e=document.getElementById(id);return !e||e.hidden}
function inMenu(){return !started||!hid('intro')||!hid('pause')||!hid('quit')||!hid('settings')}
function ambienceOn(){return started&&S.flags.woke&&!cine&&!inMenu()}
function inPlanque(){const p=player.position,lx=p.x-HX,lz=p.z-HZ;return (!zoneOf()&&lx>1.8&&lx<12.2&&lz>1.8&&lz<10.4)||zoneOf()==='in_home'}
function panTo(layer,x,z){if(!layer.pn)return;const p=player.position,dx=x-p.x,dz=z-p.z,l=Math.hypot(dx,dz)||1,r=(dx*Math.cos(yaw)-dz*Math.sin(yaw))/l;layer.pn.pan.setTargetAtTime(Math.max(-.85,Math.min(.85,r)),now(),.2)}

let audT=0,lastFlash=0,lastTrainZ=null;
function updateAudio(dt){
  if(!AUD.ctx)return;audT+=dt;if(audT<.1)return;const D=audT;audT=0;
  // la musique : menu et pause (morceau calme) · radio de la planque · club Ondes (morceau dansant) ; sinon, pas de musique
  const z=zoneOf(),club=z==='in_club',radio=!!S.radio&&inPlanque();
  let mv=0;if(inMenu()||cine){mv=1;MUS.want="calm"}else if(club){mv=1;MUS.want="club"}else if(S.walkman){mv=.8;MUS.want=S.wmTrack||"calm"}else if(radio){mv=.6;MUS.want="calm"} // le baladeur du téléphone passe avant la radio
  AUD.N.mus.gain.setTargetAtTime(AUD.vol.music*mv,now(),.6);
  const on=ambienceOn();AUD.N.amb.gain.setTargetAtTime(on?AUD.vol.amb:0,now(),.8);AUD.N.room.gain.setTargetAtTime(on?AUD.vol.amb:0,now(),.8);
  if(!on)return;
  const L=AUD.L,p=player.position,inside=!!(z&&String(z).startsWith('in_')),out=inside?0:1;
  AUD.N.muffle.frequency.setTargetAtTime(inside?480:18000,now(),.25);
  // sons globaux : pluie douce seulement quand il pleut, vent, tonnerre à chaque éclair
  // sons de la ville (pluie, vent, orage, rumeur) : on ne les entend pas dans une pièce fermée, ni dans le métro, ni dans sa planque
  const sheltered=inside||inPlanque(),w=WEATHERS[weatherIdx],rain=sheltered||w.sand?0:Math.max(0,wx.rain-.02);
  setG(L.rain,rain*.06,1);setG(L.rainLow,rain*.05,1);setG(L.wind,sheltered?0:(w.sand?.2:((w.storm?.06:0)+(S.roof==='roof'?.07:0))),1);
  if(typeof flash==='number'){if(flash>.9&&lastFlash<.5&&!sheltered)thunder();lastFlash=flash}
  setG(L.city,sheltered?0:.035);
  // conversations : au Bazar Néon (dehors et au sous-sol) et au Néon Noir seulement ; on entend les gens à moins de 3 m parler entre eux
  const M=PL.market,inMk=!z&&Math.abs(p.x-M.x)<M.hw+1&&Math.abs(p.z-M.z)<M.hd+1;if(z==='in_bar'||z==='in_market'||inMk)chatter(D,z);
  // ambiances de lieux : les machines de la laverie, les bornes de l'arcade
  const wash=z==='in_laundry';setG(L.wash,wash?.05*(.6+.4*Math.sin(tAcc*2.6)):0,.15);setG(L.washMotor,wash?.025:0,.5);
  if(z==='in_arcade')arcadeBleeps(D);
  portSounds(D,!z&&p.x<20&&p.z>UZ(.12)&&p.z<UZ(.66));
  // sons de proximité, 3 m au plus : le passant le plus proche, la mer, le TGV, une voiture, une voiture volante, le club
  let wd=1e9,wq=null;walkers.forEach(o=>{const q=o.m.position,d=Math.hypot(q.x-p.x,q.z-p.z);if(d<wd){wd=d;wq=q}});setG(L.crowd,out*near(wd)*.07,.3);if(wq)panTo(L.crowd,wq.x,wq.z);
  const ds=Math.max(0,p.x-9.8);setG(L.sea,out*near(ds)*.24*(.65+.35*Math.sin(tAcc*.5)),.6);L.sea.fl.frequency.setTargetAtTime(380+260*Math.max(0,Math.sin(tAcc*.5)),now(),.5);panTo(L.sea,8,p.z);
  if(train){const tz=train.position.z,v=lastTrainZ==null?0:Math.abs(tz-lastTrainZ)/D;lastTrainZ=tz;const cz=Math.max(tz-40,Math.min(tz,p.z)),d=Math.hypot(GX-p.x,cz-p.z)-1.4;
    setG(L.train,(z==='quai'?1:out)*near(Math.max(0,d))*Math.min(.3,.03+v*.03));L.train.fl.frequency.setTargetAtTime(150+v*8,now(),.3);panTo(L.train,GX,cz)}
  // la rame du métro : son grondement, quand on est à moins de 3 m de la voie
  const MR=ROOMS.metro;if(z==='in_metro'&&MR&&MR.metro){const tx=MR.metro.position.x,v=MR.lastX==null?0:Math.abs(tx-MR.lastX)/D;MR.lastX=tx;const lx=p.x-MR.cx,lz=p.z-MR.cz;
    const along=Math.max(0,Math.abs(lx-tx)-15),dd=Math.hypot(along,Math.max(0,Math.abs(lz-(-MR.d/2+1.3))-1.1));setG(L.train,near(dd)*Math.min(.35,.04+v*.02));L.train.fl.frequency.setTargetAtTime(130+v*6,now(),.3);panTo(L.train,MR.cx+tx,p.z-2)}
  let cd=1e9,cq=null;aveCars.forEach(c=>{const q=c.g.position,d=Math.hypot(q.x-p.x,q.z-p.z);if(d<cd){cd=d;cq=q}});setG(L.cars,out*near(cd)*.06,.15);if(cq)panTo(L.cars,cq.x,cq.z);
  let fd=1e9,fy=null;flyers.forEach(f=>{const d=f.g.position.distanceTo(p);if(d<fd){fd=d;fy=f}});setG(L.fly,out*near(fd)*.05,.3);if(fy)panTo(L.fly,fy.g.position.x,fy.g.position.z);
  // la moto : un ronronnement doux et discret
  const mo=typeof riding!=='undefined'&&riding;setG(L.moto,mo?(player.userData.moving?.035:.015):0,.25);L.moto.os.forEach((o,i)=>o.frequency.setTargetAtTime((mo&&player.userData.moving?84:58)*(i?1.008:1),now(),.4));
  // devant le club Ondes, la nuit : la basse qui s'échappe de la porte (dedans, c'est la musique du club)
  const fc=FP('club',.3,0),dc=Math.hypot(fc.x-p.x,fc.z-p.z),open=typeof clubOpen==='function'&&clubOpen();
  setG(L.club,out*near(dc)*.18*(open?1:0)*(.6+.4*Math.max(0,Math.sin(tAcc*Math.PI*2*124/60))),.05);panTo(L.club,fc.x,fc.z);
}

// ---- musique : deux morceaux générés ----
// « calm » : synthwave sombre en la mineur, 88 BPM (menu, pause, radio). « club » : morceau dansant en ré mineur, 124 BPM, quatre temps au sol.
const MUS={step:0,next:0,want:'calm',track:'calm',
  calm:{bpm:88,chords:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]},club:{bpm:124,chords:[[50,53,57],[46,50,53],[53,57,60],[48,52,55]]},
  lofi:{bpm:72,chords:[[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]]},drive:{bpm:104,chords:[[52,55,59],[48,52,55],[55,59,62],[50,54,57]]}}; // lofi : douce et lente ; drive : synthwave de route, rapide
const mtof=m=>440*Math.pow(2,(m-69)/12);
function startMusic(){MUS.next=now()+.3;setInterval(()=>{if(!AUD.ctx||AUD.ctx.state!=='running')return;
  while(MUS.next<now()+.25){if(MUS.step%16===0&&MUS.track!==MUS.want){MUS.track=MUS.want;MUS.step=0} // on change de morceau au début d'une mesure
    playStep(MUS.step,MUS.next);MUS.next+=60/MUS[MUS.track].bpm/4;MUS.step++}},60)}
function note(type,f,t,dur,vol,cut,wet){const c=AUD.ctx,o=c.createOscillator();o.type=type;o.frequency.value=f;const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=cut;
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(fl);fl.connect(g);g.connect(AUD.N.mus);if(wet)g.connect(AUD.N.rev);o.start(t);o.stop(t+dur+.05)}
function pad(ch,t,dur,lvl){const c=AUD.ctx;ch.forEach(m=>[-.06,.06].forEach(dt=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=mtof(m);o.detune.value=dt*100;
  const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(500,t);fl.frequency.linearRampToValueAtTime(1100,t+dur*.6);const g=c.createGain();
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lvl||.018,t+dur*.35);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(fl);fl.connect(g);g.connect(AUD.N.mus);g.connect(AUD.N.rev);o.start(t);o.stop(t+dur+.1)}))}
function drum(t,kind,lvl){const c=AUD.ctx,g=c.createGain();g.connect(AUD.N.mus);lvl=lvl||1;
  if(kind==='kick'){const o=c.createOscillator();o.frequency.setValueAtTime(115,t);o.frequency.exponentialRampToValueAtTime(42,t+.16);g.gain.setValueAtTime(.32*lvl,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);o.start(t);o.stop(t+.32);return}
  const s=c.createBufferSource();s.buffer=AUD.white;const fl=c.createBiquadFilter();fl.type='highpass';fl.frequency.value=kind==='hat'?7000:1600;s.connect(fl);fl.connect(g);
  const d=kind==='hat'?.05:.18;g.gain.setValueAtTime((kind==='hat'?.035:.09)*lvl,t);g.gain.exponentialRampToValueAtTime(.001,t+d);if(kind!=='hat')g.connect(AUD.N.rev);s.start(t,Math.random());s.stop(t+d+.02)}
function playStep(s,t){
  const T=MUS[MUS.track],bar=Math.floor(s/16)%4,ch=T.chords[bar],i=s%16,section=Math.floor(s/64)%4;
  if(MUS.track==='lofi'){ // accords de piano électrique, basse ronde, batterie feutrée et un peu décalée
    if(i===0)pad(ch,t,60/T.bpm*4,.01);if(i===0||i===6||i===10)ch.forEach((m,j)=>note('triangle',mtof(m+12),t+j*.012,.6,.012,1800,true));
    if(i===0||i===8)note('sine',mtof(ch[0]-24),t,.5,.12,400);if(i===0||i===10)drum(t,'kick',.6);if(i===8)drum(t,'snare',.45);if(i%4===2)drum(t+.03,'hat',.7);return}
  if(MUS.track==='drive'){ // basse en croches, arpège qui monte, quatre temps : l'autoroute la nuit
    if(i===0)pad(ch,t,60/T.bpm*4,.014);if(i%2===0)note('sawtooth',mtof(ch[0]-24+(i%4===2?12:0)),t,.16,.08,650);
    note('square',mtof(ch[i%3]+12+(i>7?12:0)),t,.09,.014,2600,true);if(i%4===0)drum(t,'kick');if(i===4||i===12)drum(t,'snare',.9);if(i%2===1)drum(t,'hat',.8);return}
  if(MUS.track==='club'){ // quatre temps au sol, charleston en contretemps, basse qui saute, arpège lumineux
    if(i===0)pad(ch,t,60/T.bpm*4,.012);
    if(i%4===0)drum(t,'kick',1.1);if(i%4===2)drum(t,'hat',1.4);if(i===4||i===12)drum(t,'snare',.8);
    if(i%4===2||i%4===3)note('sawtooth',mtof(ch[0]-24+(i%8===7?12:0)),t,.14,.08,700);
    if(i%2===0)note('square',mtof(ch[(i>>1)%3]+12+(section%2?12:0)),t,.1,.02,3000,true);
    return}
  if(i===0)pad(ch,t,60/T.bpm*4);
  if(i%2===0)note('sawtooth',mtof(ch[0]-24+(i%8===6?12:0)),t,.22,.07,520);
  if(section>0&&i%2===1&&Math.random()<.75)note('square',mtof(ch[(i>>1)%3]+12),t,.14,.018,2200,true);
  if(section>1){if(i===0||i===8||(i===10&&bar===3))drum(t,'kick');if(i===4||i===12)drum(t,'snare');if(i%2===0)drum(t,'hat')}
  else if(i===0)drum(t,'kick');
}

// ---- réglages du son (Paramètres → Son) ----
[['volMaster','master'],['volMusic','music'],['volAmb','amb'],['volSfx','sfx']].forEach(([id,k])=>{const el=document.getElementById(id);if(!el)return;el.value=AUD.vol[k];
  el.addEventListener('input',()=>{AUD.vol[k]=+el.value;audioInit();applyVolumes();saveAudio()})});

// ---- le port : corne de bateau au loin, chocs de conteneurs, grincements d'amarres (seulement sur le quai, près des docks) ----
let portT={horn:8,clank:3,creak:5};
function portSounds(D,here){if(!here){return}for(const k in portT)portT[k]-=D;const c=AUD.ctx,t=now(),out=AUD.N.amb;
  const env=(g,a,peak,dec)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+a+dec)};
  if(portT.horn<=0){portT.horn=30+Math.random()*25;[98,147].forEach(f=>{const o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;fl.type='lowpass';fl.frequency.value=420;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.5);g.gain.setValueAtTime(.05,t+2.2);g.gain.linearRampToValueAtTime(0,t+3.2);o.connect(fl);fl.connect(g);g.connect(out);o.start(t);o.stop(t+3.3)})}
  if(portT.clank<=0){portT.clank=5+Math.random()*5;const s=c.createBufferSource();s.buffer=AUD.white;const fl=c.createBiquadFilter();fl.type='bandpass';fl.frequency.value=1600+Math.random()*900;fl.Q.value=3;const g=c.createGain();env(g,.005,.09,.35);s.connect(fl);fl.connect(g);g.connect(out);s.start(t,Math.random());s.stop(t+.5);
    const o=c.createOscillator(),g2=c.createGain();o.frequency.value=420+Math.random()*200;env(g2,.005,.03,.9);o.connect(g2);g2.connect(out);o.start(t);o.stop(t+1)}
  if(portT.creak<=0){portT.creak=7+Math.random()*6;const o=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.type='sawtooth';o.frequency.value=120;l.frequency.value=7;lg.gain.value=25;l.connect(lg);lg.connect(o.frequency);
    fl.type='bandpass';fl.frequency.value=700;fl.Q.value=4;env(g,.15,.03,.7);o.connect(fl);fl.connect(g);g.connect(out);o.start(t);l.start(t);o.stop(t+1);l.stop(t+1)}
}

// ---- des voix : des « phrases » de syllabes (une voix grave, deux médiums, une aiguë), avec des voyelles et une intonation ----
const SPK=[{p:115,n:0},{p:175,n:.8},{p:150,n:1.7},{p:225,n:2.6}],VOW=[[800,1200],[400,2000],[300,2300],[500,900],[350,800],[600,1700]];
function murmur(D,lvl){if(!(lvl>0))return;const t0=now();SPK.forEach(s=>{s.n-=D;if(s.n>0)return;
  const n=3+Math.floor(Math.random()*7);let t=t0+.05;for(let i=0;i<n;i++){const dur=.09+Math.random()*.12;syl(t,dur,s.p*(1+.12*Math.sin(i*1.3))*(i===n-1?.85:1),lvl);t+=dur+.02+Math.random()*.05}
  s.n=(t-t0)+.8+Math.random()*2.8})}
function syl(t,dur,f0,lvl){const c=AUD.ctx,o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f0*(.9+Math.random()*.2),t+dur);
  const v=VOW[Math.floor(Math.random()*VOW.length)],g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(lvl,t+.025);g.gain.linearRampToValueAtTime(0,t+dur);
  v.forEach((F,i)=>{const b=c.createBiquadFilter();b.type='bandpass';b.frequency.value=F;b.Q.value=5;const bg=c.createGain();bg.gain.value=i?.5:1;o.connect(b);b.connect(bg);bg.connect(g)});
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1700;g.connect(lp);lp.connect(AUD.N.room);o.start(t);o.stop(t+dur+.03)}

// ---- l'arcade : bips de bornes façon console portable, et de temps en temps une pièce qui tombe ----
let arcT=0,coinT=4;const PENTA=[0,3,5,7,10];
function arcadeBleeps(D){arcT-=D;coinT-=D;const c=AUD.ctx,t=now();
  if(arcT<=0){arcT=.12+Math.random()*.25;const n=72+PENTA[Math.floor(Math.random()*5)]+12*Math.floor(Math.random()*2),o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=mtof(n);
    g.gain.setValueAtTime(.018,t);g.gain.exponentialRampToValueAtTime(.0005,t+.07);o.connect(g);g.connect(AUD.N.room);o.start(t);o.stop(t+.08)}
  if(coinT<=0){coinT=5+Math.random()*7;[88,95].forEach((n,i)=>{const o=c.createOscillator(),g=c.createGain(),tt=t+i*.08;o.type='square';o.frequency.value=mtof(n);
    g.gain.setValueAtTime(.025,tt);g.gain.exponentialRampToValueAtTime(.0005,tt+.18);o.connect(g);g.connect(AUD.N.room);o.start(tt);o.stop(tt+.2)})}}

// ---- conversations entre passants : le même petit son de voix que les dialogues, par phrases, pour chaque personne à moins de 3 m ----
const CHAT={},CHAT_V=['vasko','doc','okoro','mira','lou','you','nar'];
function voiceBlip(who,vol){if(!AUD.ctx)return;const c=AUD.ctx,t=now(),o=c.createOscillator(),g=c.createGain(),f=(VOICE[who]||420)*(.9+Math.random()*.2);o.type='triangle';
  o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.85,t+.06);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0005,t+.07);
  o.connect(g);g.connect(AUD.N.room);o.start(t);o.stop(t+.08)}
function chatter(D,z){const p=player.position;let ms;
  if(z==='in_bar'||z==='in_market'){const R=ROOMS[z.slice(3)];ms=R?R.chars.map(c=>c.m):[]}
  else{const M=PL.market;ms=[...statics,...walkers.map(w=>w.m),...npcs.map(n=>n.mesh)].filter(m=>Math.abs(m.position.x-M.x)<M.hw+2&&Math.abs(m.position.z-M.z)<M.hd+2)}
  ms.forEach(m=>{const d=Math.hypot(m.position.x-p.x,m.position.z-p.z);if(d>HEAR)return;const st=CHAT[m.uuid]||(CHAT[m.uuid]={n:Math.random()*2.5,v:CHAT_V[Math.floor(Math.random()*CHAT_V.length)]});
    st.n-=D;if(st.n>0)return;const n=3+Math.floor(Math.random()*6),vol=.035*near(d);for(let i=0;i<n;i++)setTimeout(()=>voiceBlip(st.v,vol),i*(75+Math.random()*55));st.n=1.6+Math.random()*4})}
