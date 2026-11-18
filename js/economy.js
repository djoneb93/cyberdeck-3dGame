// L'économie de la Zone Zéro : des eddies (ED) gagnés en aidant les gens (chaque point de réputation rapporte aussi un peu d'argent),
// dépensés pour manger, boire, prendre le yacht ou le TGV. Un inventaire (touche I) garde la nourriture à emporter et les objets
// ramassés dans les rues, qu'on revend au Bazar souterrain ou au marché de nuit.
'use strict';

const ITEMS={
  ramen:{n:'Ramen noir',ic:'🍜',k:'food',p:8,d:'Bouillon de seiche, nouilles maison. Encore chaud.'},
  gyoza:{n:'Gyozas',ic:'🥟',k:'food',p:5,d:'Six raviolis grillés, sauce soja-piment.'},
  yakitori:{n:'Brochettes yakitori',ic:'🍢',k:'food',p:6,d:'Calamar ou champignon : la sauce, elle, est vraie.'},
  soupe:{n:'Soupe du Bazar',ic:'🥣',k:'food',p:6,d:'Bouillon noir et nouilles de riz. Le cuisinier ne dit rien.'},
  barre:{n:'Barre protéinée',ic:'🍫',k:'food',p:2,d:'Goût « fraise de synthèse ». Ça cale.'},
  bubble:{n:'Thé aux bulles néon',ic:'🧋',k:'drink',p:5,d:'Perles de tapioca phosphorescentes.'},
  cocktail:{n:'Néon Sour',ic:'🍸',k:'drink',p:12,d:'Le cocktail maison du Néon Noir. Il brille un peu.'},
  bleu:{n:'Bleu Néon',ic:'🥃',k:'drink',p:10,d:'Menthe et pile électrique, comme le boit Lou.'},
  cafe:{n:'Café noir',ic:'☕',k:'drink',p:3,d:'Un café de distributeur, brûlant et amer.'},
  cola:{n:'Ondes Cola',ic:'🥤',k:'drink',p:3,d:'La boisson de la Zone Zéro. Rose et pétillante.'},
  veste:{n:'Veste LED',ic:'🧥',k:'obj',p:40,s:15,d:'Elle clignote quand tu as peur.'},
  lunettes:{n:'Lunettes anti-reconnaissance',ic:'🕶',k:'obj',p:25,s:10,d:'Elles marchent une fois sur deux.'},
  puce:{n:'Puce mémoire d’occasion',ic:'💾',k:'loot',s:12,d:'Il reste peut-être des souvenirs dedans.'},
  cable:{n:'Câble de cuivre',ic:'🧵',k:'loot',s:5,d:'Du vrai cuivre. Ça se revend bien.'},
  pile:{n:'Pile à fusion usagée',ic:'🔋',k:'loot',s:18,d:'Encore un peu chargée. Ne pas mordre.'},
  vinyle:{n:'Vinyle rayé',ic:'💿',k:'loot',s:9,d:'Synthwave de 2071. Une face sur deux est lisible.'},
  implant:{n:'Implant cassé',ic:'🦾',k:'loot',s:22,d:'Un doigt bionique. Le Doc dirait : « recyclable ».'},
  disque:{n:'Disque dur Kurogane',ic:'🗄',k:'loot',s:35,d:'Le logo est rayé. Quelqu’un voulait s’en débarrasser.'}};
const EAT_LINE={food:['Tu manges sur place, au comptoir. Ça fait du bien.','Tu manges en regardant la rue. Délicieux.'],drink:['Tu bois une gorgée. La ville paraît moins dure.','Tu bois lentement. Le néon danse au fond du verre.']};
function econInit(){if(S.cash==null)S.cash=40;S.inv=S.inv||{}}
function addItem(id,n){S.inv[id]=(S.inv[id]||0)+(n||1);save();renderInv()}
function pay(n){econInit();if(S.cash<n){toast('Pas assez d’eddies ('+S.cash+' ED).','');return false}S.cash-=n;save();updCash();return true}
function earn(n,why){econInit();S.cash+=n;save();updCash();toast('+'+n+' ED'+(why?' · '+why:''),'rp')}
function updCash(){let el=$('cash');if(!el){const r=$('rep');if(!r)return;el=document.createElement('div');el.id='cash';r.appendChild(el)}el.innerHTML='Eddies <b>'+(S.cash||0)+' ED</b>'}
// chaque point de réputation gagné rapporte 3 ED (les missions paient)
let repSeen=null;
function updateEconomy(dt){if(!started)return;econInit();if(repSeen==null)repSeen=S.rep;if(S.rep>repSeen)earn((S.rep-repSeen)*3,'mission');repSeen=S.rep;
  if(!updateEconomy.init){updateEconomy.init=true;hookShops();buildPickups();updCash()}updatePickups(dt)}

// ---- boutiques : on achète, on mange sur place ou on emporte ; certains rachètent les objets ----
let shopOpen=null;
function openShop(def){econInit();shopOpen=def;target=null;pendingTalk=null;overlayOpen=true;$('shop').hidden=false;renderShop()}
function closeShop(){shopOpen=null;$('shop').hidden=true;overlayOpen=false}
function renderShop(msg){const d=shopOpen;if(!d)return;
  let h='<div class="lbl">'+d.title+'</div><p class="shVendor">'+(msg||d.hello())+'</p><div class="shCash">Tes eddies : <b>'+S.cash+' ED</b></div>';
  if(d.buy&&d.buy.length)h+='<div class="shList">'+d.buy.map(id=>{const it=ITEMS[id],cons=it.k==='food'||it.k==='drink';
    return '<div class="shRow"><span class="ic">'+it.ic+'</span><span class="nm"><b>'+it.n+'</b><i>'+it.d+'</i></span><span class="pr">'+it.p+' ED</span>'+
      (cons?'<button type="button" data-eat="'+id+'">'+(it.k==='drink'?'Boire ici':'Manger ici')+'</button>':'')+'<button type="button" data-take="'+id+'">'+(cons?'Emporter':'Acheter')+'</button></div>'}).join('')+'</div>';
  if(d.sells){const own=Object.keys(S.inv).filter(id=>S.inv[id]>0&&ITEMS[id]&&ITEMS[id].s);
    h+='<div class="lbl" style="margin-top:8px">Revendre</div>'+(own.length?'<div class="shList">'+own.map(id=>{const it=ITEMS[id];return '<div class="shRow"><span class="ic">'+it.ic+'</span><span class="nm"><b>'+it.n+' × '+S.inv[id]+'</b><i>'+it.d+'</i></span><span class="pr">'+it.s+' ED</span><button type="button" data-sell="'+id+'">Vendre</button></div>'}).join('')+'</div>'
      :'<p class="shNote">Tu n’as rien à revendre. Les rues de la Zone Zéro sont pleines de choses que les gens jettent…</p>')}
  h+='<div class="acts"><button type="button" class="pri" id="shClose">Partir · Échap</button></div>';$('shopBox').innerHTML=h}
document.addEventListener('click',e=>{if(!shopOpen)return;const b=e.target.closest('button');if(!b||!$('shop').contains(b))return;
  if(b.id==='shClose')return closeShop();
  const id=b.dataset.eat||b.dataset.take||b.dataset.sell,it=ITEMS[id];if(!it)return;
  if(b.dataset.sell){S.inv[id]--;if(S.inv[id]<=0)delete S.inv[id];S.cash+=it.s;save();updCash();return renderShop('« '+it.n+' ? Je t’en donne '+it.s+'. Marché conclu. »')}
  if(!pay(it.p))return renderShop('« Il te manque des eddies, l’ami. Reviens quand tu auras de quoi payer. »');
  if(b.dataset.eat)return renderShop(rpick(EAT_LINE[it.k]));
  addItem(id);renderShop('« '+it.n+', à emporter. Bonne route. »')});
addEventListener('keydown',e=>{if(shopOpen&&(e.code==='Escape'||e.code==='KeyE')){e.preventDefault();e.stopImmediatePropagation();closeShop()}},true);
const SHOP_DEFS={
  noodles:{title:'Nouilles Zéro · gare',buy:['ramen','gyoza','cola']},
  bazar:{title:'Soupe du Bazar souterrain',buy:['soupe','cafe']},
  chips:{title:'Étal des puces mémoire · on rachète tout',buy:['puce'],sells:true},
  bar:{title:'Le Néon Noir · au comptoir',buy:['cocktail','bleu','cola']},
  club:{title:'Club Ondes · bar',buy:['bleu','cola']},
  laundry:{title:'Distributeur de la laverie',buy:['barre','cola','cafe']},
  yakitori:{title:'Marché de nuit · brochettes',buy:['yakitori','cola']},
  parts:{title:'Marché de nuit · pièces détachées',buy:[],sells:true},
  bubble:{title:'Marché de nuit · thé aux bulles',buy:['bubble']},
  fripe:{title:'Marché de nuit · friperie',buy:['veste','lunettes']},
  vending:{title:'Distributeur',buy:['cafe','cola','barre']}};
SHOP_DEFS.chips.buy=[]; // (les puces de l'étal sont des souvenirs : on ne les vend qu'aux gens qui savent)
// les objets existants deviennent des boutiques : leur réplique devient la phrase d'accueil du vendeur
function shopify(match,key){OBJECTS.filter(match).forEach(o=>{const talk=o.dyn,label0=o.label;o.act=()=>{const d=SHOP_DEFS[key];d.hello=()=>typeof talk==='function'?talk():'« Qu’est-ce que je te sers ? »';openShop(d)}})}
function hookShops(){
  shopify(o=>o.id==='o_noodles','noodles');
  shopify(o=>o.zone==='in_market'&&o.label==='Manger des nouilles','bazar');
  shopify(o=>o.zone==='in_market'&&o.label==='Étal des puces mémoire','chips');
  shopify(o=>o.zone==='in_bar'&&o.label==='Parler au barman','bar');
  shopify(o=>o.zone==='in_club'&&o.label==='Commander au bar','club');
  shopify(o=>o.zone==='in_laundry'&&o.label==='Distributeur','laundry');
  const nm=OBJECTS.filter(o=>String(o.id).startsWith('o_nm'));['yakitori','parts','bubble','fripe'].forEach((k,i)=>{if(nm[i])shopify(o=>o===nm[i],k)});
  OBJECTS.push({id:'o_vending',x:53.3,z:51.15,r:1.2,label:'Distributeur · café et Ondes Cola',act:()=>{SHOP_DEFS.vending.hello=()=>'L’écran clignote : « BONJOUR CITOYEN. PAIEMENT EN EDDIES UNIQUEMENT. »';openShop(SHOP_DEFS.vending)}});
  // les trajets payants : le yacht et le TGV
  if(typeof boardBoat==='function'){const b0=boardBoat;boardBoat=function(){if(!navDocked())return b0();if(!pay(15)){openDlg({n1:{s:'nar',t:'La guichetière secoue la tête : « Le tour de la baie, c’est 15 eddies. Reviens quand tu les auras. »'}});return}toast('−15 ED · billet du Neo-Mouette','');b0()}}
  if(typeof boardTrain==='function'){const t0=boardTrain;boardTrain=function(){if(!trainAtQuai())return t0();if(!pay(25)){openDlg({n1:{s:'nar',t:'Le portique clignote en rouge : « BILLET TGV · 25 ED · SOLDE INSUFFISANT ». '}});return}toast('−25 ED · billet de TGV','');t0()}}
}

// ---- l'inventaire (touche I) ----
let invOpen=false;
function toggleInv(f){invOpen=f!=null?f:!invOpen;$('inv').hidden=!invOpen;overlayOpen=invOpen||phoneOpen;if(invOpen){target=null;renderInv()}}
function renderInv(){if(!invOpen)return;econInit();const ids=Object.keys(S.inv).filter(id=>S.inv[id]>0&&ITEMS[id]);
  $('invBody').innerHTML='<div class="shCash">Eddies : <b>'+S.cash+' ED</b></div>'+(ids.length?'<div class="invGrid">'+ids.map(id=>{const it=ITEMS[id],cons=it.k==='food'||it.k==='drink';
    return '<div class="invCell"><span class="ic">'+it.ic+'</span><b>'+it.n+'</b><em>× '+S.inv[id]+'</em><i>'+it.d+'</i>'+(cons?'<button type="button" data-use="'+id+'">'+(it.k==='drink'?'Boire':'Manger')+'</button>':it.s?'<i class="sv">Se revend '+it.s+' ED</i>':'')+'</div>'}).join('')+'</div>'
    :'<p class="shNote">Ton sac est vide. Achète à manger dans les stands, ou ramasse ce qui traîne dans les rues (les objets qui brillent).</p>')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-use]');if(b){const id=b.dataset.use;S.inv[id]--;if(S.inv[id]<=0)delete S.inv[id];save();toast(rpick(EAT_LINE[ITEMS[id].k]),'');renderInv()}
  if(e.target.id==='invClose')toggleInv(false)});
addEventListener('keydown',e=>{if(e.code==='KeyI'&&started&&!dlgOpen&&!shopOpen&&!cine&&$('pause').hidden&&$('settings').hidden){if(overlayOpen&&!invOpen)return;e.preventDefault();toggleInv()}
  else if(e.code==='Escape'&&invOpen){e.stopImmediatePropagation();e.preventDefault();toggleInv(false)}},true);

// ---- objets à ramasser dans les rues : ils brillent un peu ; ils reviennent quelques heures plus tard, ailleurs ----
const pickups=[];
function freeStreetSpot(){for(let k=0;k<200;k++){const x=11+Math.random()*(W-14),z=3+Math.random()*(H-6),cx=Math.floor(x),cz=Math.floor(z),t=tile[I(cx,cz)];
  if((t===0||t===1||t===4)&&!isSolid(x,z)&&!nearEntrance(cx,cz)&&!FURN.some(f=>Math.hypot(f[0]-x,f[1]-z)<f[2]+.5)&&!(x>HX&&x<HX+13&&z>HZ&&z<HZ+11))return {x,z}}return null}
function placePickup(p){const s=freeStreetSpot();if(!s){p.g.visible=false;return}p.x=s.x;p.z=s.z;p.g.position.set(s.x,0,s.z);p.id=rpick(['puce','cable','cable','pile','vinyle','implant','vinyle','cable','disque','puce']);p.g.visible=true;p.away=0}
function buildPickups(){for(let i=0;i<12;i++){const g=new THREE.Group();scene.add(g);box(.22,.08,.16,'#2a2e36',0,.05,0,g);box(.12,.03,.08,'#39e6ff',0,.1,0,g,true);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x7dffb0,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));sp.scale.set(.7,.7,1);sp.position.y=.2;g.add(sp);
  const p={g,sp,x:0,z:0,id:'cable',away:0};placePickup(p);pickups.push(p);
  OBJECTS.push({id:'o_pick'+i,get x(){return p.x},get z(){return p.z},get r(){return p.g.visible?1:0},get label(){return 'Ramasser · '+ITEMS[p.id].n.toLowerCase()},
    act:()=>{addItem(p.id);toast(ITEMS[p.id].ic+' '+ITEMS[p.id].n+' · dans ton sac (I)','');p.g.visible=false;p.away=180+Math.random()*240}})}}
function updatePickups(dt){pickups.forEach(p=>{if(!p.g.visible){if(p.away>0){p.away-=dt;if(p.away<=0)placePickup(p)}return}p.sp.material.opacity=.35+Math.sin(tAcc*3+p.x)*.25})}
