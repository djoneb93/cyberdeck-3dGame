// Menu principal (la ville tourne en fond), menu pause (Échap), écran de fin de session,
// et la cinématique du réveil : pensées dans le noir, paupières qui s'ouvrent, on se lève, le logo NEO-BXL apparaît.
'use strict';

let cine=null;
const WAKE_LINES=['…','Ta tête bourdonne. Une douleur sourde, derrière l’oreille.','Tu as l’impression d’avoir fait un rêve. Un très long rêve.','Quelqu’un prononce ton nom. Très loin.'];
// ---------- caméra pilotée ----------
const camA=new THREE.Vector3(),camB=new THREE.Vector3(),lookA=new THREE.Vector3(),lookB=new THREE.Vector3();
function cineCam(dt){
  if(!cine)return false;cine.t+=dt;const t=cine.t;
  if(cine.mode==='menu'){const a=t*.045+.6;camera.position.set(W/2+Math.cos(a)*58,24+Math.sin(t*.1)*3,H/2+Math.sin(a)*58);camera.lookAt(W/2,5,H/2);return true}
  // réveil : allongé dans le lit, on regarde la pièce ; puis on se redresse et la caméra rejoint sa place derrière toi
  const L=(x,y,z,v)=>v.set(HX+x,y,HZ+z);
  if(t<cine.t1){L(4,1.05,3.75,camera.position);camera.lookAt(HX+5.6+Math.sin(t*.4)*.25,1.35+Math.sin(t*.7)*.08,HZ+8.2);return true}
  const k=Math.min(1,(t-cine.t1)/3.2),e=k*k*(3-2*k);
  L(4,1.05,3.75,camA);L(5.6,.95,8.2,lookA);
  camB.set(player.position.x+Math.sin(yaw)*Math.cos(pitch)*dist,player.position.y+1.5+Math.sin(pitch)*dist,player.position.z+Math.cos(yaw)*Math.cos(pitch)*dist);
  lookB.set(player.position.x,player.position.y+1.7,player.position.z);
  camera.position.lerpVectors(camA,camB,e);camera.position.y+=Math.sin(e*Math.PI)*1.2;lookA.lerp(lookB,e);camera.lookAt(lookA);
  if(k>.25)player.visible=true;
  if(k>=1){cine=null;camD=dist;focus.set(player.position.x,player.position.y+1.5,player.position.z);finishWake()}
  return true;
}
// ---------- cinématique du réveil ----------
function playWake(){
  overlayOpen=true;player.visible=false;$('labels').hidden=true;['hudL','hudR','cam','help'].forEach(id=>$(id).hidden=true);
  const box=$('cine'),txt=$('cineTxt');box.hidden=false;box.classList.remove('lift');txt.textContent='';$('cineSkip').hidden=false;
  cine={mode:'wake',t:0,t1:1e9,step:0};let i=0;
  const next=()=>{if(!cine||cine.mode!=='wake'||cine.skipped)return;if(i>=WAKE_LINES.length){openEyes();return}
    typeLine(txt,WAKE_LINES[i++],()=>setTimeout(next,i===1?600:1300))};
  setTimeout(next,700);
}
function typeLine(el,s,done){let n=0;el.classList.remove('fade');const tick=()=>{if(!cine||cine.skipped)return;el.textContent=s.slice(0,++n);if(n<s.length)setTimeout(tick,34);else done&&done()};tick()}
function openEyes(){
  if(!cine||cine.skipped)return;cine.t=0;cine.t1=4.2;const box=$('cine');$('cineTxt').classList.add('fade');
  setTimeout(()=>{box.classList.add('lift');$('c').classList.add('wakeBlur')},500);
  setTimeout(()=>{$('logoFlash').hidden=false;requestAnimationFrame(()=>$('logoFlash').classList.add('show'))},cine.t1*1000+600);
}
function finishWake(){
  $('cine').hidden=true;$('cineSkip').hidden=true;$('c').classList.remove('wakeBlur');
  setTimeout(()=>{$('logoFlash').classList.remove('show');setTimeout(()=>$('logoFlash').hidden=true,900)},2600);
  overlayOpen=false;$('labels').hidden=false;['hudL','hudR','cam','help'].forEach(id=>$(id).hidden=false);updateHUD();
  setTimeout(()=>{if(started&&!dlgOpen)openDlg('wake')},3300);
}
function skipWake(){if(!cine||cine.mode!=='wake')return;cine.skipped=true;cine.t1=0;cine.t=3.19;$('cine').hidden=true;$('c').classList.remove('wakeBlur')}
$('cineSkip').onclick=skipWake;
// ---------- menus ----------
function showMenu(){
  started=false;overlayOpen=true;cine={mode:'menu',t:0};player.visible=true;
  ['hudL','hudR','cam','help','prompt','dlg','pause','quit'].forEach(id=>$(id).hidden=true);npcs.forEach(n=>n.label.hidden=true);dlgOpen=false;
  const acts=$('introActs');acts.innerHTML='';const saved=loadSave(),mk=(t,fn,pri)=>{const b=document.createElement('button');b.type='button';b.textContent=t;if(pri)b.className='pri';b.onclick=fn;acts.appendChild(b)};
  if(saved&&saved.flags&&saved.flags.woke)mk('Continuer',()=>begin(false),true);
  // pas de confirm() : les fenêtres du navigateur sont bloquées dans la page publiée. On confirme par un second clic.
  mk('Nouvelle partie',e=>{const b=e.currentTarget;if(saved&&saved.flags&&saved.flags.woke&&!b.dataset.sure){b.dataset.sure='1';b.textContent='Confirmer : effacer la partie et recommencer';b.classList.add('warn');return}begin(true)},!(saved&&saved.flags&&saved.flags.woke));
  mk('Paramètres',()=>openSettings());
  mk('Quitter',quitGame);
  $('intro').hidden=false;
}
function togglePause(on){$('pause').hidden=!on;overlayOpen=on;if(on){keys&&Object.keys(keys).forEach(k=>keys[k]=false);save()}}
function quitGame(){save();['intro','pause'].forEach(id=>$(id).hidden=true);$('quit').hidden=false;overlayOpen=true;started=false}
$('pResume').onclick=()=>togglePause(false);
$('pMenu').onclick=()=>{save();togglePause(false);showMenu()};
$('pQuit').onclick=()=>{togglePause(false);quitGame()};
$('qBack').onclick=()=>{$('quit').hidden=true;showMenu()};
addEventListener('keydown',e=>{
  if(e.code==='Escape'&&!$('settings').hidden){$('settings').hidden=true;return} // Échap ferme d'abord les paramètres
  if(cine&&cine.mode==='wake'&&['Space','Enter','Escape'].includes(e.code)){e.preventDefault();skipWake();return}
  if(e.code!=='Escape'||!started||dlgOpen||!$('fiche').hidden||!$('ending').hidden||taxiRide||climb)return;
  e.preventDefault();togglePause($('pause').hidden);
});
// ---- paramètres : deux onglets, Commandes et Son (ouverts depuis le menu principal ou la pause) ----
function openSettings(tab){$('settings').hidden=false;setTab(tab||'keys')}
function setTab(t){$('setKeys').hidden=t!=='keys';$('soundSet').hidden=t!=='sound';$('tabKeys').classList.toggle('on',t==='keys');$('tabSound').classList.toggle('on',t==='sound')}
$('tabKeys').onclick=()=>setTab('keys');$('tabSound').onclick=()=>setTab('sound');$('setClose').onclick=()=>{$('settings').hidden=true};
$('pSettings').onclick=()=>openSettings();
