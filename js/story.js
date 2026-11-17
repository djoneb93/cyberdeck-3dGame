// Dialogues écrits pour le jeu, et moteur des histoires des contacts (Ink, avec repli sur le JSON).
'use strict';

/* ===================== DIALOGUES ===================== */
const DLG={
  wake:{n1:{s:'nar',t:'Tu ouvres les yeux. Un plafond. Le tien, tu crois.',next:'n2'},
    n2:{s:'neura',t:'Redémarrage du deck… Bonjour. Je suis NEURA, ton IA de compagnie. Ta mémoire présente une lacune de 1 095 jours.',next:'n3',fx:{met:'neura'}},
    n3:{s:'neura',t:'Ton deck a gardé des morceaux. Je les déchiffrerai à mesure que tu avanceras. Quelqu’un attend près de la porte.'}},
  mira_intro:{
    n1:{s:'mira',t:'Hé. Doucement. Tu t’es effondré devant ta porte il y a trois jours. Je t’ai traîné jusqu’ici.',next:'n2'},
    n2:{s:'mira',t:'Tu me regardes comme si tu me voyais pour la première fois.',ch:[
      {t:'Désolé… je ne sais pas qui tu es.',next:'n3'},
      {t:'Ton visage me dit quelque chose.',fx:{friend:{mira:1}},next:'n3b'},
      {t:'Qu’est-ce que tu fais chez moi ?',fx:{friend:{mira:-1}},next:'n3c'}]},
    n3:{s:'mira',t:'Mira Kade. Moth, pour ceux que j’apprécie. On a bossé ensemble, toi et moi.',next:'n4',fx:{met:'mira'}},
    n3b:{s:'mira',t:'C’est déjà ça. Mira Kade. Moth. On a bossé ensemble, toi et moi.',next:'n4',fx:{met:'mira'}},
    n3c:{s:'mira',t:'Chez toi ? Tu ne savais même plus où était ta clé. Mira Kade. Moth. Tu peux me remercier plus tard.',next:'n4',fx:{met:'mira'}},
    n4:{s:'mira',t:'On est en quelle année, d’après toi ?',ch:[{t:'2086.',next:'n5'},{t:'Aucune idée.',next:'n5'}]},
    n5:{s:'mira',t:'On est en 2089. Il te manque trois ans. Et je ne suis pas la bonne personne pour te les rendre.',next:'n6'},
    n6:{s:'mira',t:'Mais je sais qui a pu te croiser. Vasko, à la Gare Zéro. Doc Ferrant, au Bazar Néon. Le Sergent Okoro, devant la laverie d’en face. Et Lou, au club Ondes, si elle daigne descendre de sa cabine.',next:'n7'},
    n7:{s:'mira',t:'Parle, écoute, rends service. Dans la Zone Zéro, ta réputation ouvre plus de portes qu’un passe-partout. Reviens me voir quand tu auras du concret.',fx:{flag:'started'}}},
  mira_wait:{
    n1:{s:'mira',t:'Vasko, le Doc, Okoro. Trois personnes, trois morceaux de toi. Je t’attends ici.',ch:[
      {t:'Pourquoi tu m’aides ?',cond:()=>!S.flags.mira_why,fx:{flag:'mira_why',friend:{mira:1}},next:'n2'},
      {t:'J’y vais.'}]},
    n2:{s:'mira',t:'Parce que la dernière fois que j’ai eu besoin de quelqu’un, c’est toi qui es venu. Tu ne t’en souviens pas. Moi, si.'}},
  mira_end:{
    n1:{s:'mira',t:'Alors ? Tu as l’air d’avoir vu un fantôme.',next:'n2'},
    n2:{s:'you',t:'Un contrat signé Kurogane. Un implant mémoire retiré dans un labo. Un dossier de disparition classé par une sécurité privée.',next:'n3'},
    n3:{s:'mira',t:'Kurogane. Évidemment. Ils t’ont fait passer par Léthé, leur programme d’effacement. Trois ans, envolés.',ch:[{t:'Tu le savais ?',next:'n4a'},{t:'On fait quoi, maintenant ?',fx:{friend:{mira:1}},next:'n4b'}]},
    n4a:{s:'mira',t:'Je m’en doutais. Je voulais que tu l’entendes d’autres bouches que la mienne. Tu m’aurais crue ?',next:'n5'},
    n4b:{s:'mira',t:'Maintenant, tu te reposes. Pour de vrai, cette fois.',next:'n5'},
    n5:{s:'mira',t:'Demain, on commence à creuser. Et cette fois, tu ne disparais pas sans moi.',fx:{flag:'chapter1'}}},
  vasko:{
    n1:{s:'vasko',t:'Tiens. Le fantôme du quai 3.',next:'n2',fx:{met:'vasko'}},
    n2:{s:'vasko',t:'Trois ans sans nouvelles. La dernière fois, tu es reparti d’ici avec un contrat. Un gros. Signé Kurogane.',ch:[
      {t:'Je ne m’en souviens pas. Aide-moi.',fx:{friend:{vasko:1}},next:'n3'},
      {t:'Je te dois quelque chose ?',next:'n3b'},
      {t:'Kurogane ? Tu mens.',fx:{friend:{vasko:-1},rep:-5},next:'n3c'}]},
    n3:{s:'vasko',t:'Une parole tenue vaut plus que mille eddies. Tu étais réglo, avant. Je m’en souviens pour deux.',next:'n4'},
    n3b:{s:'vasko',t:'Une avance de 2 000 eddies. On en reparlera quand tu auras retrouvé ta mémoire. Et ton portefeuille.',next:'n4'},
    n3c:{s:'vasko',t:'Je ne mens jamais. Je choisis ce que je dis. Nuance.',next:'n4'},
    n4:{s:'vasko',t:'Le contrat parlait d’aller chercher quelque chose dans la tour. Personne n’est jamais revenu m’en parler. Pas même toi.',ch:[
      {t:'Je finirai ce contrat. Promis.',fx:{friend:{vasko:1},rep:10,frag:'contrat'}},
      {t:'Merci pour l’info.',fx:{rep:5,frag:'contrat'}}]}},
  doc:{
    n1:{s:'doc',t:'Ah ! Toi ! Assieds-toi. Non, reste debout, tu as une tête à tomber.',next:'n2',fx:{met:'doc'}},
    n2:{s:'doc',t:'Tourne-toi… Hm. Derrière ton oreille. Une cicatrice d’implant mémoire. Retiré proprement.',ch:[
      {t:'Tu peux réparer ça ?',next:'n3'},
      {t:'Qui fait ce genre de travail ?',fx:{friend:{doc:1}},next:'n3b'}]},
    n3:{s:'doc',t:'Réparer un trou ? Non. Mais les souvenirs laissent des traces ailleurs. Chez les gens, surtout.',next:'n4'},
    n3b:{s:'doc',t:'Pas un charcudoc de rue, crois-moi. C’est du travail de labo. Matériel corpo, outils stériles.',next:'n4'},
    n4:{s:'doc',t:'Tiens, une tisane. Le meilleur implant du monde, c’est une bonne nuit de sommeil.',ch:[
      {t:'Merci, Doc.',fx:{friend:{doc:1},rep:5,frag:'implant'}},
      {t:'Je n’ai pas le temps.',fx:{frag:'implant'}}]}},
  okoro:{
    n1:{s:'okoro',t:'Je t’ai reconnu de loin. Tu marches toujours pareil.',next:'n2',fx:{met:'okoro'}},
    n2:{s:'okoro',t:'En 2086, ton nom est apparu dans un dossier. Personne disparue. Classé en quarante-huit heures, sur ordre d’en haut.',ch:[
      {t:'Qui a demandé ça ?',next:'n3'},
      {t:'Pourquoi tu me le dis ?',fx:{friend:{okoro:1}},next:'n3b'}]},
    n3:{s:'okoro',t:'Le tampon venait de la sécurité privée d’une corpo. Je ne dirai pas laquelle en pleine rue.',next:'n4'},
    n3b:{s:'okoro',t:'Un badge, ça se rend. Un serment, non. J’avais juré de retrouver les gens.',next:'n4'},
    n4:{s:'okoro',t:'Fais attention à qui tu poses des questions, petit. Dans ce quartier, les murs ont des caméras.',ch:[
      {t:'Je serai prudent.',fx:{friend:{okoro:1},rep:5,frag:'dossier'}},
      {t:'Je n’ai plus rien à perdre.',fx:{rep:10,frag:'dossier'}}]}},
  vasko_pre:{n1:{s:'vasko',t:'Je ne parle pas aux gens qui ne savent pas pourquoi ils sont là. Reviens quand tu le sauras.'}},
  doc_pre:{n1:{s:'doc',t:'Tu as une sale mine, toi. Va d’abord parler à la fille qui t’a ramené chez toi.'}},
  okoro_pre:{n1:{s:'okoro',t:'Circule… Attends. Je te connais, toi. Non. Reviens plus tard, j’ai du linge qui tourne.'}},
  vasko_done:{n1:{s:'vasko',t:'Le contrat ne va pas se finir tout seul.'}},
  doc_done:{n1:{s:'doc',t:'Bois la tisane. Dors. Et reviens si tu entends des voix. D’autres que la tienne.'}},
  okoro_done:{n1:{s:'okoro',t:'Les murs ont des caméras, petit. Rappelle-t’en.'}},
  mira_ch2:{
    n1:{s:'neura',t:'Fragment déchiffré : « LÉTHÉ ». Protocole d’effacement mémoriel, propriété Kurogane. Sujet : toi.',next:'n2'},
    n2:{s:'mira',t:'Ton deck se réveille, on dirait. Bien. On ne s’attaque pas à Léthé seul, ni à Kurogane.',next:'n3'},
    n3:{s:'mira',t:'Il nous faut des alliés. Vasko, le Doc, Okoro, Lou : chacun a un problème en ce moment. Rends-leur service, et ils t’ouvriront leurs portes. Et leurs souvenirs de toi.',ch:[
      {t:'Et toi, Mira ? Tu as besoin d’aide ?',fx:{friend:{mira:1},flag:'ch2'},next:'n4'},
      {t:'Je m’en occupe.',fx:{flag:'ch2'}}]},
    n4:{s:'mira',t:'… Tu as toujours su lire en moi. Oui. Parle-moi encore une fois quand tu seras prêt.'}},
  mira_end2:{
    n1:{s:'mira',t:'Toute la Zone Zéro parle de toi. Vasko, le Doc, Okoro, Lou… Tu as plus d’amis qu’avant ta disparition.',next:'n2'},
    n2:{s:'neura',t:'Recoupement des souvenirs déchiffrés. Un nom apparaît dans les archives de Léthé : Dr Eliane Vex. Co-conceptrice du protocole.',next:'n3'},
    n3:{s:'mira',t:'Vex ? Elle a fui la tour, il paraît. On dit qu’elle travaille sur l’inverse de Léthé, quelque part sous le Bazar. Mnémosyne.',ch:[
      {t:'Alors on la trouve.',fx:{friend:{mira:1}},next:'n4'},
      {t:'Et si elle travaillait encore pour eux ?',next:'n4b'}]},
    n4:{s:'mira',t:'On la trouve. Ensemble. Le chapitre 3 commence sous le Bazar.',fx:{flag:'chapter2'}},
    n4b:{s:'mira',t:'Alors on le saura vite. Mais je parie qu’elle a autant de regrets que toi de trous. Le chapitre 3 commence sous le Bazar.',fx:{flag:'chapter2'}}},
  mira_after2:{n1:{s:'mira',t:'Le Dr Vex, sous le Bazar. On y va quand le chapitre 3 sera écrit.'}},
  lou_meet:{
    n1:{s:'lou',t:'Attends… TOI ? Trois ans sans un message et tu débarques devant mon club comme si de rien n’était ?',next:'n2',fx:{met:'lou'}},
    n2:{s:'lou',t:'… T’as une tête bizarre. Tu me reconnais même pas, hein ?',ch:[
      {t:'Désolé. J’ai perdu trois ans.',fx:{friend:{lou:1}},next:'n3'},
      {t:'Tu es la fille de l’hologramme.',next:'n3b'}]},
    n3:{s:'lou',t:'Lou. Néon, pour la foule. Bon. Je mixe ce soir, mais passe me voir quand tu auras la tête plus claire.'},
    n3b:{s:'lou',t:'« La fille de l’hologramme »… Lou. Néon. On était potes, toi et moi. Reviens quand tu t’en souviendras.'}},
  lou_wait:{n1:{s:'lou',t:'Le set commence bientôt. Va faire ce que t’as à faire, je bouge pas.'}},
  o_terminal:{n1:{s:'nar',t:'Ton terminal. Dernière connexion : 14 mars 2086. Mot de passe requis. Tu ne t’en souviens pas.'}},
  o_bed:{n1:{s:'nar',t:'Tu as assez dormi. Trois jours, d’après ce qu’on dirait.'}},
  o_poster:{n1:{s:'nar',t:'Une affiche : « BXL 2086 ». La dernière année dont tu te souviens.'}},
  o_moto:{n1:{s:'nar',t:'Ta moto. Batterie à plat, carénage rayé. Un problème pour plus tard.'}},
  o_atomium:{n1:{s:'nar',t:'Une réplique chromée de l’Atomium. Sur une des sphères, quelqu’un a tagué une phalène cyan.'}},
  o_holo:{n1:{s:'nar',t:'Lou « Néon », vingt mètres de lumière au-dessus de la place. Ce soir, elle joue au Club Ondes.'}}
};


/* ===================== CHAPITRE 2 : HISTOIRES DES CONTACTS ===================== */
const Q_ORDER=['vasko','doc','okoro','lou','mira'];
const DONE_LINE={vasko:'Tu as tenu parole sur toute la ligne. Mon carnet n’a plus de page pour toi : tu es dedans pour de bon.',mira:'On a fait le tour, toi et moi. Pour l’instant. Le Net, lui, ne dort jamais.',
  doc:'Le Bazar va mieux, grâce à toi. Et toi, tu dors, oui ? Ordonnance du Doc.',lou:'T’as été là à chaque fois. Le prochain morceau, c’est pour toi.',okoro:'Le dossier est bouclé. Quinze ans… Merci, collègue.'};
const EP_TITLES={vasko:['Le rat de la gare','Le frère effacé','Quai 9'],mira:['Le faux Moth','La copie','Libérer la copie'],doc:['Implants défectueux','Le rappel','La clinique gratuite'],
  lou:['Le morceau volé','La rave de Rouillebourg','Dernier set'],okoro:['Le dossier oublié','Le témoin','Dernière ligne droite']};
const AREA={vasko:['Quai 4','Abords du Néon Noir','Quai 6'],mira:['Ton terminal','Toit de la tour Zéro','Bunker Zéro'],doc:['Allée du Bazar','Cœur du Bazar','Devant le parking-labo'],
  lou:['Devant le club Ondes','Arcade Pixel','Le Néon Noir'],okoro:['Ruelle de la laverie','Ancien commissariat','Ancien commissariat, arrière-cour']};
const lc=s=>s[0].toLowerCase()+s.slice(1);
const epOf=id=>(S.q[id]&&S.q[id].ep)||0;
const epCount=()=>window.inkjs?3:1;
const epLeft=id=>epOf(id)<epCount();
const title=(id,ep)=>EP_TITLES[id][ep==null?epOf(id):ep];
const spotLab=(id,b)=>epOf(id)===0?SPOTS[id][b].lab:AREA[id][b];
function wins(){return Object.values(S.q).filter(q=>q.won).length}
// --- moteur Ink ---
let INK=null;
function ink(){if(!INK)INK=new inkjs.Story(INK_JSON);return INK}
function spk(tags,def){for(const t of tags||[]){if(t==='narrator')return 'nar';if(t.startsWith('speaker:')){const s=t.slice(8);return s==='ferrant'?'doc':s}}return def}
function vfxTag(tags){for(const t of tags||[])if(t.startsWith('fx:'))return t.slice(3);return null}
const EP_CACHE={};
function epData(id,ep){
  const k=id+ep;if(EP_CACHE[k])return EP_CACHE[k];
  const sid=STORY_ID[id]||id;let d=null;
  if(window.inkjs){try{
    const st=ink(),knot='ep_'+sid+'_'+ep;
    const run=p=>{st.ChoosePathString(p);const L=[];while(st.canContinue){const t=st.Continue().trim();if(t)L.push({s:spk(st.currentTags,id),t,fx:vfxTag(st.currentTags)})}return L};
    d={intro:run(knot+'.intro'),beats:[],win:run(knot+'.win'),lose:run(knot+'.lose')};
    for(let b=0;b<3;b++){const lines=run(knot+'.b'+b),n=st.currentChoices.length,ch=[];
      for(let i=0;i<n;i++){run(knot+'.b'+b);const label=st.currentChoices[i].text;st.variablesState.score=0;st.ChooseChoiceIndex(i);
        const res=[];while(st.canContinue){const t=st.Continue().trim();if(t)res.push(t)}ch.push({t:label,sc:+st.variablesState.score||0,res:res.join(' ')})}
      d.beats.push({lines,ch})}
    if(!d.intro.length||d.beats.some(b=>!b.ch.length))d=null;
  }catch(e){d=null}}
  if(!d&&ep===0){const s=STORY[sid];d={intro:[{s:id,t:s.intro}],beats:s.beats.map(b=>({lines:[{s:'nar',t:b.t}],ch:b.c.map(c=>({t:c[0],sc:c[1],res:c[2]}))})),win:[{s:id,t:s.win}],lose:[{s:id,t:s.lose}]}}
  return EP_CACHE[k]=d;
}
function chain(lines,lastExtra,firstExtra){const d={};lines.forEach((l,i)=>{d['n'+(i+1)]={s:l.s,t:l.t,vfx:l.fx,next:i<lines.length-1?'n'+(i+2):null}});
  if(lines.length){Object.assign(d['n'+lines.length],lastExtra||{});Object.assign(d.n1,firstExtra||{})}return d}
function storyDlg(id){
  const q=S.q[id],ep=epOf(id);
  if(!q||!q.active){
    if(!epLeft(id))return {n1:{s:id,t:DONE_LINE[id]}};
    const d=epData(id,ep);if(!d)return {n1:{s:id,t:DONE_LINE[id]}};
    const lines=(q&&q.lost&&!q.active?[{s:id,t:'On réessaie ?'}]:[]).concat(d.intro);
    const dl=chain(lines,{ch:[{t:'Je m’en occupe.',fx:{quest:id},next:'go'},{t:'Pas maintenant.'}]});
    dl.go={s:'nar',t:'Nouvelle histoire : « '+title(id,ep)+' ». Trois pistes, marquées d’une colonne de lumière dans la ville. Tes choix décident de l’issue.'};
    return dl;
  }
  if(q.b<3)return {n1:{s:id,t:'Ne traîne pas. Prochaine piste : '+lc(spotLab(id,q.b))+'.'}};
  const d=epData(id,ep),win=q.sc>=4;
  const dl=chain(win?d.win:d.lose,win?{next:'mem'}:{},{fx:{resolve:id}});
  if(win)dl.mem=ep===0&&MEMS[id]?{s:'neura',t:'Souvenir déchiffré. '+MEMS[id]}:{s:'neura',t:'Lien renforcé avec '+NAMES[id]+'. Sa fiche contact se dévoile un peu plus.'};
  return dl;
}
function beatDlg(id){
  const q=S.q[id],d=epData(id,epOf(id)),beat=d.beats[q.b],last=q.b===2;
  const dl=chain(beat.lines,{ch:beat.ch.map((c,i)=>({t:c.t,fx:{beat:[id,c.sc]},next:'r'+i}))});
  beat.ch.forEach((c,i)=>dl['r'+i]={s:'nar',t:c.res+(last?' Retourne voir '+NAMES[id]+'.':' Prochaine piste : '+lc(spotLab(id,q.b+1))+'.')});
  return dl;
}const markers={};
function makeMarkers(){
  Q_ORDER.forEach(id=>{const g=new THREE.Group(),c=new THREE.Color(COLORS[id]);
    const am=o=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,6,8,1,true),am(.22));beam.position.y=3;g.add(beam);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.45,.6,20),am(.7));ring.rotation.x=-Math.PI/2;ring.position.y=.04;g.add(ring);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.18),new THREE.MeshBasicMaterial({color:c}));gem.position.y=1.7;g.add(gem);
    g.userData={gem,ring};g.visible=false;scene.add(g);markers[id]=g});
}
function updateMarkers(){
  Q_ORDER.forEach(id=>{const m=markers[id];if(!m)return;const q=S.q[id];
    if(started&&q&&q.active&&q.b<3){const s=SPOTS[id][q.b];m.position.set(s.x,itemZone(s)?ZONES[itemZone(s)].y:0,s.z);m.visible=true;
      m.userData.gem.rotation.y=tAcc*2;m.userData.gem.position.y=1.7+Math.sin(tAcc*2.5)*.12;const k=1+Math.sin(tAcc*3)*.12;m.userData.ring.scale.set(k,k,k)}
    else m.visible=false});
}
