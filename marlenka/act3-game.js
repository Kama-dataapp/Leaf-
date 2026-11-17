(function(){
'use strict';
const KEY='marlenka-act3-mcdonald-world-v1';
const A=window.MarlenkaArt3;
if(!A){console.error('Marlenka Act III: art module not loaded');return}
const $=id=>document.getElementById(id);
const W=2450,H=1500,IW=1900,IH=1240;
const start=()=>({zone:'outside',x:363,y:908,phase:0,met:[],olejek:false,fooled:false,finished:false,firstVisit:true,reward:false,thought:''});
let st;try{st=Object.assign(start(),JSON.parse(localStorage.getItem(KEY)||'{}'));if(!['outside','inside'].includes(st.zone))st.zone='outside'}catch(e){st=start()}
let active=false,dialogue=null,dialogueHistory=[],keys=new Set(),goal=null,canvas,ctx,pane,minimap,quest,dlg,who,body,actions,toast,thoughts,notes,camX=0,camY=0,last=0,clock=0,prevOverflow='',previousStartHidden=true;
const friendly={marlena:'Marlenka',kamis:'Kamiś',szymon:'Szymon',piasek:'Piasek',natalka:'Natalka',karolina:'Karolina'};
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function clamp(a,min,max){return Math.max(min,Math.min(max,a))}
function hint(t){toast.textContent=t;toast.hidden=false;clearTimeout(hint.timer);hint.timer=setTimeout(()=>{toast.hidden=true},3200)}
function say(name,text,choices){
 if(dialogue)dialogueHistory.push(dialogue);else dialogueHistory=[];
 dialogue={name,text,choices:choices||[['Dalej →',dismiss]]};keys.clear();goal=null;drawDialogue();
}
function dismiss(){dialogue=null;dialogueHistory=[];dlg.hidden=true}
function previousDialogue(){if(!dialogueHistory.length)return;dialogue=dialogueHistory.pop();drawDialogue()}
function beat(name,text,next){say(name,text,[['Dalej →',next||dismiss]])}
function drawDialogue(){
 dlg.hidden=!dialogue;if(!dialogue)return;
 who.textContent=dialogue.name;body.textContent=dialogue.text;
 actions.replaceChildren();
 if(dialogueHistory.length){const back=document.createElement('button');back.type='button';back.textContent='← Poprzedni dialog';back.style.background='#eee0ea';back.style.color='#76546f';back.addEventListener('click',previousDialogue);actions.append(back)}
 dialogue.choices.forEach((a,i)=>{let b=document.createElement('button');b.textContent=a[0];b.type='button';b.addEventListener('click',a[1]);actions.append(b)});
}
function step(n){st.phase=Math.max(st.phase,n);save();hud()}
function questText(){
 switch(st.phase){
 case 0:return ['01 / 07','Porozmawiaj z Marlenką','W drodze do McDonalda pojawia się nowy pomysł…'];
 case 1:return ['02 / 07','Wejdź do McDonalda','Szymon, Piasek, Natalka i Karolina czekają na wspólne spotkanie.'];
 case 2:return ['03 / 07','Poznaj całą ekipę','Podejdź i porozmawiaj z każdym ze znajomych. Spotkano: '+st.met.length+'/4'];
 case 3:return ['04 / 07','Czas na jedzenie','Podejdź do stolika z zamówieniem w środku restauracji.'];
 case 4:return ['05 / 07','Wyprawa z Szymonem','Podejdź do Szymona. Zaproponuje Ci wspólny spacer po olejek.'];
 case 5:return ['06 / 07','Znajdź olejek do auta','Wyjdź na ulicę i odwiedź sklep z akcesoriami samochodowymi.'];
 case 6:return ['07 / 07','Sekretna rozmowa','W drodze powrotnej Szymon zapyta, czy coś jest między Wami.'];
 case 7:return ['FINAŁ','Wróć do ekipy','Wejdź do McDonalda i zakończ nowe wspomnienie przy stoliku.'];
 default:return ['UKOŃCZONE','Wielki żart zaliczony!','Świat nadal jest otwarty. Możesz swobodnie spacerować, rozmawiać i wracać do znajomych.'];
 }
}
function hud(){
 if(!active)return;const q=questText();
 quest.querySelector('small').textContent='AKT III · '+q[0];
 quest.querySelector('h3').textContent=q[1];
 quest.querySelector('p').textContent=q[2];
 $('m3-zone').textContent=st.zone==='inside'?'MC DONALD • WNĘTRZE':'MIASTECZKO • ULICE';
 $('m3-bag').textContent=st.olejek?'W plecaku: olejek do samochodu':'Wskazówka: dotknij postaci albo użyj klawisza E';
}
function enter(){
 if(st.zone==='outside'){
  st.zone='inside';st.x=1003;st.y=989;
  if(st.phase===1)step(2);
  save();beat('Narrator','W środku McDonalda czekają już Szymon, Piasek, Natalka i Karolina. Każdy przyjechał na wspólne jedzenie. A Wy pamiętacie, że nadal udajecie związek.');
 }else{
  st.zone='outside';st.x=1173;st.y=814;save();hint('Wróciłaś przed McDonalda. Ulica i sklep są otwarte.')
 }
 hud();
}
function marlena(){
 if(st.phase===0){
  beat('Marlenka','Może będziemy dalej udawać, że jesteśmy razem? I spróbujemy jeszcze raz nabrać znajomych?',()=>{
   beat('Kamiś','No dobra! To będzie nasza mała tajemnica.',()=>{step(1);dismiss();hint('Misja: wejdźcie do McDonalda i spotkajcie ekipę.')})
  });
 }else beat('Marlenka',st.finished?'Dobrze się bawiliśmy z tym całym udawaniem.':'Pamiętaj, to wciąż nasz żart. Zobaczymy, czy się uda.');
}
function friend(id){
 const responses={
  szymon:'Szymon dołącza do spotkania. Rozmowy przy stole dopiero się zaczynają.',
  piasek:'Piasek jest już na miejscu. Wszyscy zaraz siądą do jedzenia.',
  natalka:'Natalka przyjechała z ekipą. Nie zdradzacie jej wcześniej swojego planu.',
  karolina:'Karolina także jest na spotkaniu. Dzień zapowiada się wesoło.'
 };
 if(st.phase===2){
  if(!st.met.includes(id))st.met.push(id);
  if(st.met.length===4)step(3);save();
  beat(friendly[id],responses[id],()=>{dismiss();hud()});return;
 }
 if(id==='szymon'&&st.phase===4){
  beat('Szymon','Idziesz po olejek do samochodu? To pójdę z tobą!',()=>{
   beat('Myśli Kamisia','Jako nieprzeciętnie przystojny, odważny, śmiały i ponadprzeciętnie inteligentny człowiek… zgadzam się. 😎',()=>{
    step(5);dismiss();hint('Teraz idź do sklepu po olejek. Szymon Ci towarzyszy.')
   })
  });return;
 }
 beat(friendly[id],id==='szymon'?'Ale się ciekawie zapowiada ten dzień.':'Dobrze, że udało się spotkać całą ekipą.');
}
function table(){
 if(st.phase<3){beat('Narrator','Najpierw przywitaj się z ekipą. Znajomi są przy stolikach.');return}
 if(st.phase===3){
  beat('Narrator','Siedzicie razem w McDonaldzie, jecie i rozmawiacie. Marlenka i Kamiś kontynuują udawanie pary.',()=>{
   beat('Kamiś','Idę po olejek do samochodu.',()=>{
    beat('Narrator','Szymon słyszy to i proponuje, że pójdzie razem.',()=>{step(4);dismiss();hint('Porozmawiaj z Szymonem i ruszcie po olejek.')})
   })
  });return;
 }
 if(st.phase===7){
  beat('Narrator','Wracacie do reszty znajomych w McDonaldzie. Wyprawa z Szymonem kończy się sukcesem Waszego żartu.',()=>{
   if(!st.finished){
    st.finished=true;step(8);
    const b=window.MarlenkaBridge;
    if(!st.reward&&b?.getState){b.getState().hearts+=45;b.save?.();st.reward=true;save()}
   }
   beat('Księga Wspomnień','Akt III zapisany! Po osiemnastce udawaliście dalej parę. W McDonaldzie byli Szymon, Piasek, Natalka i Karolina. Kamiś i Szymon wyszli po olejek, a w drodze powrotnej Szymon wkręcił się w żart. 💞',dismiss)
  });return;
 }
 beat('Narrator',st.finished?'Wspomnienie zapisane. Możesz nadal zwiedzać miasto.':'Dokończ wyprawę z Szymonem. Potem wróćcie do ekipy.');
}
function shop(){
 if(st.phase<5){beat('Narrator','Sklep z akcesoriami samochodowymi jest otwarty. Jeszcze macie spotkanie w restauracji.');return}
 if(st.phase===5){
  beat('Narrator','Kamiś wychodzi po olejek do samochodu. Szymon mu towarzyszy.',()=>{
   st.olejek=true;step(6);dismiss();hint('Olejek zdobyty! Porozmawiaj z Szymonem w drodze powrotnej.')
  });return;
 }
 beat('Narrator','Olejek jest już u Kamisia. Można wracać.');
}
function roadside(){
 if(st.phase===6){
  beat('Szymon','Ej, a Ty coś kręcisz z Marlenką?',()=>{
   beat('Kamiś','A jak myślisz? 😏',()=>{
    beat('Narrator','Rozmowa trwa chwilę. Szymon daje się nabrać: wierzy w Wasz udawany związek.',()=>{
     st.fooled=true;step(7);dismiss();hint('Szymon się nabrał! Wróć do wspólnego stolika w McDonaldzie.')
    })
   })
  });return
 }
 beat('Szymon','Chodź, niedaleko jest sklep. Potem wrócimy do McDonalda.');
}
function characters(){
 if(st.zone==='outside')return [
 {id:'mar',x:493,y:919,label:'Marlenka',person:'marlena',act:marlena},
 {id:'door',x:1183,y:797,label:'Wejście do McDonalda',act:enter},
 {id:'shop',x:2056,y:797,label:'Olejek w sklepie',act:shop},
 ...(st.phase>=5&&st.phase<=6?[{id:'road',x:1835,y:924,label:'Szymon',person:'szymon',act:roadside}]:[]),
 {id:'auto',x:378,y:1110,label:'Samochód',act:()=>beat('Narrator','W drodze do McDonalda Marlenka zaproponowała kontynuowanie udawanego związku.')}
 ];
 return [
 {id:'szymon',x:760,y:622,label:'Szymon',person:'szymon',act:()=>friend('szymon')},
 {id:'piasek',x:1215,y:557,label:'Piasek',person:'piasek',act:()=>friend('piasek')},
 {id:'natalka',x:1255,y:765,label:'Natalka',person:'natalka',act:()=>friend('natalka')},
 {id:'karolina',x:723,y:775,label:'Karolina',person:'karolina',act:()=>friend('karolina')},
 {id:'table',x:964,y:815,label:'Stolik z jedzeniem',act:table},
 {id:'door',x:1010,y:1022,label:'Wyjście',act:enter}
 ];
}
function near(){return characters().map(a=>({obj:a,d:distance(st,a)})).filter(a=>a.d<132).sort((a,b)=>a.d-b.d)[0]?.obj}
function interact(){if(dialogue)return;const n=near();if(n)n.act();else hint('Podejdź do bohatera lub obiektu. E — rozmowa, dotknij — podejdź.')}
function blocked(x,y){
 if(st.zone==='outside'){
  if(x<75||y<85||x>W-75||y>H-80)return true;
  if(x>833&&x<1517&&y>262&&y<758)return true;
  if(x>1775&&x<2285&&y>264&&y<765)return true;
  if(x>230&&x<524&&y>1135&&y<1280)return true;
 }else{
  if(x<145||y<180||x>IW-146||y>IH-80)return true;
  if(x>862&&x<1106&&y>585&&y<731)return true;
 }
 return false;
}
function move(dx,dy,seconds){
 if(dialogue||$('m3-notes')?.hidden===false)return;
 const len=Math.hypot(dx,dy);if(!len)return;
 const sx=dx/len*255*seconds,sy=dy/len*255*seconds;
 if(!blocked(st.x+sx,st.y))st.x+=sx;
 if(!blocked(st.x,st.y+sy))st.y+=sy;
 clock+=seconds*9;
}
function redraw(time){
 if(!active)return;
 let dt=Math.min(.055,(time-last)/1000||.015);last=time;
 const x=(keys.has('right')?1:0)-(keys.has('left')?1:0),y=(keys.has('down')?1:0)-(keys.has('up')?1:0);
 if(x||y){goal=null;move(x,y,dt)}else if(goal&&!dialogue){
  const dx=goal.x-st.x,dy=goal.y-st.y;
  if(Math.hypot(dx,dy)>13)move(dx,dy,dt);else{const a=goal.actor;goal=null;if(a&&distance(st,a)<145)a.act()}
 }
 const w=st.zone==='outside'?W:IW,h=st.zone==='outside'?H:IH;
 camX=clamp(st.x-canvas.width/2,0,w-canvas.width);camY=clamp(st.y-canvas.height/2,0,h-canvas.height);
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(-camX,-camY);
 if(st.zone==='outside')A.outside(ctx,time/1000);else A.inside(ctx,time/1000);
 characters().filter(a=>a.person).sort((a,b)=>a.y-b.y).forEach(a=>{
  A.human(ctx,a.x,a.y,a.person,time/1000,.76,false);
  A.r(ctx,a.x-61,a.y-179,122,28,9,'#fffaf3ee');A.label(ctx,a.label,a.x,a.y-164,15,'#584258');
 });
 if(st.zone==='outside'&&st.phase<5)A.human(ctx,st.x-73,st.y+33,'kamis',time/1000,.70,false);
 if(st.zone==='outside'&&st.phase>=5)A.human(ctx,st.x+75,st.y+41,'kamis',time/1000,.71,false);
 A.human(ctx,st.x,st.y,'marlena',time/1000,.83,!!goal||keys.size>0);
 // task markers, a readable visual hint; characters are illustrated rather than emojis.
 characters().filter(a=>{
  if(a.id==='mar')return st.phase===0;
  if(a.id==='door')return st.zone==='outside'&&st.phase===1;
  if(a.id==='table')return [3,7].includes(st.phase);
  if(a.id==='szymon')return st.phase===4;
  if(a.id==='road')return st.phase===6;
  if(a.id==='shop')return st.phase===5;
  return false;
 }).forEach(a=>{A.ellipse(ctx,a.x,a.y-205,20,22,'#fff8df');A.label(ctx,'!',a.x,a.y-207,26,'#b36492',900)});
 ctx.restore();
 const n=near();$('m3-near').hidden=!!dialogue||!n;if(n)$('m3-near').textContent='E • '+n.label;
 const m=minimap.getContext('2d');m.clearRect(0,0,180,115);
 m.fillStyle=st.zone==='outside'?'#b8d0b5':'#ecdbca';m.fillRect(0,0,180,115);
 if(st.zone==='outside'){m.fillStyle='#bf7472';m.fillRect(61,21,48,34);m.fillStyle='#789494';m.fillRect(131,21,38,35);m.fillStyle='#9aa6a8';m.fillRect(0,64,180,21)}
 else{m.fillStyle='#d9ad86';m.fillRect(75,49,42,20)}
 A.ellipse(m,st.x/w*180,st.y/h*115,5,5,'#bf427b');
 redraw.counter=(redraw.counter||0)+1;if(redraw.counter%120===0)save();
 requestAnimationFrame(redraw);
}
function keyHandler(e,isUp){
 if(!active)return;const element=document.activeElement;
 if(element&&(element.matches('input,textarea,select')||element.isContentEditable))return;
 const dirs={KeyW:'up',ArrowUp:'up',KeyA:'left',ArrowLeft:'left',KeyS:'down',ArrowDown:'down',KeyD:'right',ArrowRight:'right'};
 if(dirs[e.code]){e.preventDefault();e.stopImmediatePropagation();if(isUp)keys.delete(dirs[e.code]);else keys.add(dirs[e.code]);return}
 if(!isUp&&['KeyE','Space','Enter'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();if(dialogue){actions.lastElementChild?.click()}else interact();return}
 if(!isUp&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(dialogue)dismiss();else close()}
}
function clickMap(e){
 if(dialogue)return;
 const b=canvas.getBoundingClientRect();
 const p={x:(e.clientX-b.left)/b.width*canvas.width+camX,y:(e.clientY-b.top)/b.height*canvas.height+camY};
 const actor=characters().map(a=>({a,d:distance(a,p)})).filter(v=>v.d<95).sort((a,b)=>a.d-b.d)[0]?.a;
 if(actor){if(distance(st,actor)<132)actor.act();else goal={x:actor.x+(st.x>actor.x?68:-68),y:actor.y+53,actor}}
 else goal=p;
}
function openNotes(){$('m3-notes').hidden=false;notes.value=st.thought||'';keys.clear()}
function saveNotes(){
 const t=notes.value.trim().slice(0,850);if(!t){hint('Najpierw wpisz myśl.');return}
 st.thought=t;save();$('m3-notes').hidden=true;
 const cloud=window.MarlenkaCloud;
 if(cloud?.isMarlena?.()){
  cloud.saveThought({key:'act3-mcdonald',title:'Akt III — Wspólne jedzenie w McDonaldzie',text:t})
  .then(r=>hint(r?.ok?'Wpis zapisany i przesłany do panelu Kamisia.':'Zapisano lokalnie. Chmura: '+(r?.error||'brak połączenia')))
  .catch(()=>hint('Zapisano na telefonie. Synchronizację można spróbować ponownie.'));
 }else hint('Zapisano lokalnie. Zaloguj konto Marlenki i ponownie zapisz, aby Kamiś mógł to odczytać.');
}
function close(){if(!active)return;active=false;keys.clear();goal=null;save();pane.hidden=true;document.body.style.overflow=prevOverflow;$('m3-notes').hidden=true;if($('startScreen'))$('startScreen').hidden=previousStartHidden}
function open(){
 if(active)return;
 active=true;prevOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
 previousStartHidden=$('startScreen')?.hidden??true;if($('startScreen'))$('startScreen').hidden=true;
 if($('panelModal'))$('panelModal').hidden=true;
 pane.hidden=false;hud();last=performance.now();
 canvas.width=window.innerWidth<800?760:1100;canvas.height=window.innerWidth<800?940:700;
 requestAnimationFrame(redraw);
 if(st.firstVisit){
  st.firstVisit=false;save();beat('Narrator','AKT III — OTWARTY ŚWIAT. Po osiemnastce Szymona wybieracie się na wspólne jedzenie w McDonaldzie. Możesz swobodnie spacerować po mapie, rozmawiać z bohaterami i wybierać miejsca, które odwiedzisz.',dismiss)
 }
}
function setup(){
 if($('m3'))return;
 pane=document.createElement('div');pane.id='m3';pane.hidden=true;
 pane.innerHTML='<div id="m3-top"><div><small>MARLENKA · ROZDZIAŁ III</small><strong>♡ McDonald i wielki żart</strong></div><div style="display:flex;gap:6px"><button id="m3-open-notes" type="button">💭 Myśli</button><button id="m3-exit" type="button">← Wróć</button></div></div>'+
 '<div id="m3-main"><div id="m3-stage"><canvas id="m3-canvas" width="1100" height="700" aria-label="Interaktywny otwarty świat. Spaceruj po okolicy i rozmawiaj z postaciami."></canvas><div id="m3-near" hidden></div><div id="m3-controls"><button data-dir="up">↑</button><button data-dir="left">←</button><button data-dir="right">→</button><button data-dir="down">↓</button><button id="m3-action">E · Gadaj</button></div></div>'+
 '<aside id="m3-side"><div class="m3-card" id="m3-mission"><small></small><h3></h3><p></p></div><div class="m3-card" id="m3-mapcard"><div id="m3-zone">MIASTECZKO</div><canvas id="m3-mini" width="180" height="115"></canvas><div id="m3-bag"></div><p style="font-size:11px;color:#94768d">WASD / strzałki — ruch. E — rozmowa. Kliknij na mapę, by podejść.</p></div></aside>'+
 '<div id="m3-dialog" hidden><div class="m3-speaker" id="m3-who"></div><p id="m3-body"></p><div id="m3-dialog-buttons"></div></div><div id="m3-toast" hidden></div>'+
 '<section id="m3-notes" hidden><h3>💭 Myśli Marlenki · Akt III</h3><p>Napisz, jak naprawdę pamiętasz spotkanie. Zalogowana Marlenka może przesłać to bezpośrednio do panelu Kamisia.</p><textarea id="m3-thought" maxlength="850" placeholder="Co wtedy myślałam? Jak zapamiętałam te chwile?"></textarea><button id="m3-save">Zapisz i wyślij, jeśli zalogowano</button><button class="secondary" id="m3-hide-notes">Wróć do gry</button></section></div>'+
 '<div id="m3-footer"><span>WASD / strzałki · E · dotyk</span><span>Dialogi są rekonstrukcją, nie dosłownymi cytatami. Zapis automatyczny.</span></div>';
 document.body.append(pane);
 canvas=$('m3-canvas');ctx=canvas.getContext('2d');quest=$('m3-mission');minimap=$('m3-mini');dlg=$('m3-dialog');who=$('m3-who');body=$('m3-body');actions=$('m3-dialog-buttons');toast=$('m3-toast');notes=$('m3-thought');
 $('m3-exit').onclick=close;$('m3-open-notes').onclick=openNotes;$('m3-hide-notes').onclick=()=>{$('m3-notes').hidden=true};$('m3-save').onclick=saveNotes;
 $('m3-action').onclick=()=>dialogue?dismiss():interact();
 canvas.addEventListener('click',clickMap);
 pane.querySelectorAll('[data-dir]').forEach(b=>{
  const dir=b.dataset.dir;
  b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(dir);try{b.setPointerCapture(e.pointerId)}catch(_){}});
  for(let event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{keys.delete(dir)})
 });
 window.addEventListener('keydown',e=>keyHandler(e,false),true);
 window.addEventListener('keyup',e=>keyHandler(e,true),true);
 window.addEventListener('blur',()=>{keys.clear();save()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();save()}});
 const launcher=document.createElement('button');launcher.id='m3-launch';launcher.textContent='🗺️ AKT III · Otwarty świat';launcher.hidden=true;launcher.addEventListener('click',open);document.body.append(launcher);
 const startCard=document.querySelector('#startScreen .start-card');
 if(startCard){let b=document.createElement('button');b.id='m3-start';b.className='ghost-btn';b.textContent='🗺️ Akt III — Otwarty świat';b.hidden=true;b.onclick=open;startCard.append(b)}
 function updateEntrances(){const unlocked=!!window.MarlenkaBridge?.birthdayFinished?.();launcher.hidden=!unlocked;if($('m3-start'))$('m3-start').hidden=!unlocked}
 updateEntrances();document.addEventListener('click',updateEntrances,true);
}
window.MarlenkaWorld={open,close,progress:()=>({finished:!!st.finished,phase:st.phase,zone:st.zone})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();