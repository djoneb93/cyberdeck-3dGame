// Ambiance sonore et musique, entièrement générées par le navigateur (Web Audio) : aucun fichier son.
// Pluie, vent, orage (tonnerre à chaque éclair), rumeur de la foule, bourdonnement de la ville, ressac près du quai,
// TGV qui passe, voitures et voitures volantes, moteur de la moto, basse du club la nuit ; tout est étouffé dans les intérieurs.
// La musique : une boucle synthwave sombre (basse, nappes, arpèges, batterie douce) en la mineur.
// Les volumes se règlent dans le menu pause ; ils sont bas par défaut et gardés dans ce navigateur.
'use strict';

const AUD={ctx:null,vol:{master:.5,music:.22,amb:.55},N:{},L:{}};
try{Object.assign(AUD.vol,JSON.parse(localStorage.getItem('neobxl-audio')||'{}'))}catch(e){}
function saveAudio(){try{localStorage.setItem('neobxl-audio',JSON.stringify(AUD.vol))}catch(e){}}

function noiseBuf(c,sec,brown){const n=c.sampleRate*sec,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let last=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;if(brown){last=(last+.02*w)/1.02;d[i]=last*3.5}else d[i]=w}return b}
function impulse(c,sec){const n=c.sampleRate*sec,b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3)}return b}
const now=()=>AUD.ctx.currentTime,setG=(node,v,t)=>(node.g||node).gain.setTargetAtTime(Math.max(0,v||0),now(),t||.4);

function audioInit(){
  if(AUD.ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const c=AUD.ctx=new AC(),N=AUD.N;
  N.master=c.createGain();N.master.connect(c.destination);
  N.mus=c.createGain();N.mus.connect(N.master);
  N.amb=c.createGain();N.muffle=c.createBiquadFilter();N.muffle.type='lowpass';N.muffle.frequency.value=18000;N.amb.connect(N.muffle);N.muffle.connect(N.master);
  N.rev=c.createConvolver();N.rev.buffer=impulse(c,2.6);const rg=c.createGain();rg.gain.value=.45;N.rev.connect(rg);rg.connect(N.mus);
  applyVolumes();
  AUD.white=noiseBuf(c,3,false);AUD.brown=noiseBuf(c,4,true);
  // chaque source passe par un panoramique : on l'entend à gauche ou à droite selon sa place autour de la caméra
  const pan=g=>{const p=c.createStereoPanner?c.createStereoPanner():null;if(p){g.connect(p);p.connect(N.amb)}else g.connect(N.amb);return p};
  const layer=(buf,type,f,q)=>{const s=c.createBufferSource();s.buffer=buf;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);const pn=pan(g);s.start(0,Math.random()*2);return {g,fl,pn}};
  const drone=(type,f,ft,ff)=>{const fl=c.createBiquadFilter();fl.type=ft;fl.frequency.value=ff;const g=c.createGain();g.gain.value=0;fl.connect(g);const pn=pan(g);
    const os=[1,1.008].map(k=>{const o=c.createOscillator();o.type=type;o.frequency.value=f*k;o.connect(fl);o.start();return o});return {g,fl,os,pn}};
  const L=AUD.L;
  L.rain=layer(AUD.white,'bandpass',2600,.45);L.rainLow=layer(AUD.brown,'lowpass',600,.5); /* pluie douce : un bruissement, pas une averse */L.wind=layer(AUD.brown,'bandpass',320,.8);
  L.crowd=layer(AUD.brown,'bandpass',650,1.4);L.city=layer(AUD.brown,'lowpass',160,.7);L.sea=layer(AUD.brown,'lowpass',520,.7);
  L.train=layer(AUD.brown,'lowpass',240,.9);L.cars=layer(AUD.white,'bandpass',800,1.6);
  L.fly=drone('sawtooth',92,'lowpass',380);L.moto=drone('sawtooth',55,'lowpass',650);L.club=drone('sine',46,'lowpass',160);
  startMusic();
}
function applyVolumes(){const N=AUD.N;if(!AUD.ctx)return;N.master.gain.value=AUD.vol.master;N.mus.gain.value=AUD.vol.music;N.amb.gain.value=ambienceOn()?AUD.vol.amb:0}
// le son ne peut démarrer qu'après un geste de l'utilisateur (règle des navigateurs)
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{audioInit();if(AUD.ctx&&AUD.ctx.state==='suspended')AUD.ctx.resume()},{passive:true}));

// ---- tonnerre : un grondement grave, quelques instants après l'éclair ----
function thunder(){const c=AUD.ctx,t=now()+.4+Math.random()*1.4,s=c.createBufferSource();s.buffer=AUD.brown;const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(900,t);fl.frequency.exponentialRampToValueAtTime(120,t+3);
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9,t+.08);g.gain.exponentialRampToValueAtTime(.001,t+4.5);s.connect(fl);fl.connect(g);g.connect(AUD.N.amb);s.start(t,Math.random());s.stop(t+5)}

// ---- mise à jour, dix fois par seconde ----
// Dans le menu, en pause ou pendant le réveil : seulement la musique. L'ambiance démarre une fois réveillé, dans la ville.
// Chaque source est placée à gauche ou à droite selon sa direction par rapport à la caméra, et s'éteint avec la distance :
// on distingue la mer, le train, une voiture qui passe, la foule, sans que tout se mélange.
let audT=0,lastFlash=0,lastTrainZ=null;
function ambienceOn(){const hid=id=>{const e=document.getElementById(id);return !e||e.hidden};return started&&S.flags.woke&&!cine&&hid('intro')&&hid('pause')&&hid('quit')}
function panTo(layer,x,z){if(!layer.pn)return;const p=player.position,dx=x-p.x,dz=z-p.z,l=Math.hypot(dx,dz)||1,r=(dx*Math.cos(yaw)-dz*Math.sin(yaw))/l;layer.pn.pan.setTargetAtTime(Math.max(-.85,Math.min(.85,r)),now(),.2)}
function updateAudio(dt){
  if(!AUD.ctx)return;audT+=dt;if(audT<.1)return;const D=audT;audT=0;
  const on=ambienceOn();AUD.N.amb.gain.setTargetAtTime(on?AUD.vol.amb:0,now(),.8);AUD.N.mus.gain.setTargetAtTime(AUD.vol.music*(on?.75:1),now(),.8); // la musique se fait plus discrète en jeu
  if(!on)return;
  const L=AUD.L,p=player.position,z=zoneOf(),inside=!!(z&&String(z).startsWith('in_')),out=inside?0:1;
  AUD.N.muffle.frequency.setTargetAtTime(inside?480:18000,now(),.25);
  // météo : une pluie douce (seulement quand il pleut), le vent, le tonnerre à chaque éclair
  const w=WEATHERS[weatherIdx],rain=w.sand?0:Math.max(0,wx.rain-.02);
  setG(L.rain,rain*.06,1);setG(L.rainLow,rain*.05,1);setG(L.wind,w.sand?.22:((w.storm?.07:0)+(S.roof==='roof'?.08:0)),1);
  if(typeof flash==='number'){if(flash>.9&&lastFlash<.5)thunder();lastFlash=flash}
  // la foule : un murmure au centre, selon le nombre de passants autour de soi ; la ville, un fond très bas
  const crowd=walkers.filter(o=>Math.hypot(o.m.position.x-p.x,o.m.position.z-p.z)<10).length;setG(L.crowd,out*Math.min(.08,crowd*.013));
  setG(L.city,inside?.02:.05);
  // le ressac : du côté du quai, plus fort quand on s'en approche, avec des vagues lentes
  const sea=Math.max(0,1-Math.max(0,p.x-9)/14);setG(L.sea,out*sea*.26*(.65+.35*Math.sin(tAcc*.5)),.6);L.sea.fl.frequency.setTargetAtTime(380+260*Math.max(0,Math.sin(tAcc*.5)),now(),.5);panTo(L.sea,8,p.z);
  // le TGV : grondement selon sa distance et sa vitesse, du côté de la voie
  if(train){const tz=train.position.z,v=lastTrainZ==null?0:Math.abs(tz-lastTrainZ)/D;lastTrainZ=tz;const cz=Math.max(tz-40,Math.min(tz,p.z)),d=Math.hypot(GX-p.x,cz-p.z);
    setG(L.train,out*Math.max(0,1-d/40)*Math.min(.35,.02+v*.035));L.train.fl.frequency.setTargetAtTime(150+v*8,now(),.3);panTo(L.train,GX,cz)}
  // voitures au sol et voitures volantes : la plus proche, à sa place
  let cd=1e9,cq=null;aveCars.forEach(c=>{const q=c.g.position,d=Math.hypot(q.x-p.x,q.z-p.z);if(d<cd){cd=d;cq=q}});setG(L.cars,out*Math.max(0,.07*(1-cd/11)),.2);if(cq)panTo(L.cars,cq.x,cq.z);
  let fd=1e9,fy=null;flyers.forEach(f=>{const d=f.g.position.distanceTo(p);if(d<fd){fd=d;fy=f}});setG(L.fly,out*Math.max(0,.05*(1-fd/26)),.3);
  if(fy){L.fly.os.forEach((o,i)=>o.frequency.setTargetAtTime((80+fd*.8)*(i?1.008:1),now(),.3));panTo(L.fly,fy.g.position.x,fy.g.position.z)}
  // la moto : régime selon qu'on roule ou non
  const mv=typeof riding!=='undefined'&&riding;setG(L.moto,mv?(player.userData.moving?.08:.03):0,.15);L.moto.os.forEach((o,i)=>o.frequency.setTargetAtTime((mv&&player.userData.moving?98:52)*(i?1.008:1),now(),.25));
  // la basse du club Ondes, la nuit, quand on passe devant
  const dc=Math.hypot(PL.club.x-p.x,PL.club.z-p.z),open=typeof clubOpen==='function'&&clubOpen();
  setG(L.club,(z==='in_club'?.3:out*Math.max(0,.18*(1-dc/22)))*(open?1:0)*(.6+.4*Math.max(0,Math.sin(tAcc*Math.PI*2*128/60))),.05);panTo(L.club,PL.club.x,PL.club.z);
}

// ---- musique : synthwave sombre en la mineur (la m · fa · do · sol), 88 battements par minute ----
const MUS={bpm:88,step:0,next:0,chords:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]};
const mtof=m=>440*Math.pow(2,(m-69)/12);
function startMusic(){MUS.next=now()+.3;setInterval(()=>{if(!AUD.ctx||AUD.ctx.state!=='running')return;while(MUS.next<now()+.25){playStep(MUS.step,MUS.next);MUS.next+=60/MUS.bpm/4;MUS.step++}},60)}
function note(type,f,t,dur,vol,cut,wet){const c=AUD.ctx,o=c.createOscillator();o.type=type;o.frequency.value=f;const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=cut;
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(fl);fl.connect(g);g.connect(AUD.N.mus);if(wet)g.connect(AUD.N.rev);o.start(t);o.stop(t+dur+.05)}
function pad(ch,t,dur){const c=AUD.ctx;ch.forEach(m=>[-.06,.06].forEach(dt=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=mtof(m)*(1+dt/100);o.detune.value=dt*100;
  const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(500,t);fl.frequency.linearRampToValueAtTime(1100,t+dur*.6);const g=c.createGain();
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.018,t+dur*.35);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(fl);fl.connect(g);g.connect(AUD.N.mus);g.connect(AUD.N.rev);o.start(t);o.stop(t+dur+.1)}))}
function drum(t,kind){const c=AUD.ctx,g=c.createGain();g.connect(AUD.N.mus);
  if(kind==='kick'){const o=c.createOscillator();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(42,t+.16);g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);o.start(t);o.stop(t+.32);return}
  const s=c.createBufferSource();s.buffer=AUD.white;const fl=c.createBiquadFilter();fl.type='highpass';fl.frequency.value=kind==='hat'?7000:1600;s.connect(fl);fl.connect(g);
  const d=kind==='hat'?.05:.18;g.gain.setValueAtTime(kind==='hat'?.035:.09,t);g.gain.exponentialRampToValueAtTime(.001,t+d);if(kind!=='hat')g.connect(AUD.N.rev);s.start(t,Math.random());s.stop(t+d+.02)}
function playStep(s,t){
  const bar=Math.floor(s/16)%4,ch=MUS.chords[bar],i=s%16,section=Math.floor(s/64)%4; // l'intensité varie d'un passage à l'autre
  if(i===0)pad(ch,t,60/MUS.bpm*4);
  if(i%2===0)note('sawtooth',mtof(ch[0]-24+(i%8===6?12:0)),t,.22,.07,520);
  if(section>0&&i%2===1&&Math.random()<.75)note('square',mtof(ch[(i>>1)%3]+12),t,.14,.018,2200,true);
  if(section>1){if(i===0||i===8||(i===10&&bar===3))drum(t,'kick');if(i===4||i===12)drum(t,'snare');if(i%2===0)drum(t,'hat')}
  else if(i===0)drum(t,'kick');
}
// réglages du son, dans le menu pause
[['volMaster','master'],['volMusic','music'],['volAmb','amb']].forEach(([id,k])=>{const el=document.getElementById(id);if(!el)return;el.value=AUD.vol[k];
  el.addEventListener('input',()=>{AUD.vol[k]=+el.value;audioInit();applyVolumes();saveAudio()})});
