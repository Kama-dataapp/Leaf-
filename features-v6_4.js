/* Kamiś 6.4: nakładka na wersję 6.3; dotychczasowe funkcje i zapis kamis-v2 pozostają. */
(() => {
'use strict';
const meals64=['Śniadanie','Obiad','Kolacja','Przekąska','Deser'];
const mode64=[['balanced','🍽️ Zbilansowane'],['protein','💪 Więcej białka'],['low','🥗 Lżejsze propozycje'],['vegetables','🥦 Więcej warzyw'],['quick','⏱️ Szybkie dania'],['budget','💰 Oszczędnie'],['carbs','🍚 Więcej węglowodanów'],['variety','🌈 Różnorodnie']];
const options64={
 kcal:[2500,3000,3500,4000,4500],
 p:[60,90,120,150,180,210],
 f:[50,70,90,110,130,150],
 c:[150,200,250,300,350,400,450,500]
};
const macro64={kcal:'Energia',p:'Białko',f:'Tłuszcze',c:'Węglowodany'};
const cfg64=data.v63||{};
if(!data.mealChoices64 || typeof data.mealChoices64!=='object'||Array.isArray(data.mealChoices64))data.mealChoices64={};
if(!mode64.some(([m])=>m===data.mode))data.mode='balanced'; // 'Siłownia' nie jest już aktywnym celem. Stare zapisy nie są modyfikowane.
const old64={wizard,generate,planView,tabs,home,render,goBack,summary};
const recipe64=id=>recipes.find(r=>r.id===Number(id));
const cap64=(x,min,max)=>Math.max(min,Math.min(max,x));
const db64=window.kamis62Data;
function selectedMeals64(day){
 const list=data.mealChoices64[String(day)];
 return Array.isArray(list)?meals64.filter(m=>list.includes(m)):meals64.slice();
}
window.kamis64ToggleMeal=(day,meal)=>{
 const index=Number(day),chosen=selectedMeals64(index);
 if(!DAYS[index]||!meals64.includes(meal))return;
 if(chosen.includes(meal)&&chosen.length<=1){alert('Wybierz przynajmniej jeden posiłek na ten dzień.');return;}
 data.mealChoices64[String(index)]=chosen.includes(meal)?chosen.filter(m=>m!==meal):meals64.filter(m=>chosen.includes(m)||m===meal);
 persist();render();
};
function dayControls64(){return `<section class="v64-days"><h3>🍽️ Ile posiłków w poszczególnych dniach?</h3><p class="muted">Dla każdego wybranego dnia zaznacz, jakie posiłki chcesz zaplanować. Możesz wybrać od 1 do 5. Każdy dzień może wyglądać inaczej.</p>${data.days.length?data.days.map(day=>{
 const chosen=selectedMeals64(day);
 return `<div class="v64-day"><div class="v64-dayhead"><strong>${DAYS[day]}</strong><span class="pill">${chosen.length} ${chosen.length===1?'posiłek':chosen.length<5?'posiłki':'posiłków'}</span></div><div class="v64-mealchips">${meals64.map(m=>`<button type="button" class="chip ${chosen.includes(m)?'selected':''}" aria-pressed="${chosen.includes(m)}" onclick="kamis64ToggleMeal(${day},'${m}')">${chosen.includes(m)?'✓ ':''}${m}</button>`).join('')}</div></div>`;}).join(''):'<p class="notice">Wybierz przynajmniej jeden dzień powyżej.</p>'}</section>`;}
function goalControls64(){return `<h2>Jaki jest Twój cel?</h2><p class="muted">To preferencje doboru przepisów, a nie obowiązkowe ograniczenia. Możesz zmienić cel przy kolejnym planowaniu.</p><div class="chips v64-goals">${mode64.map(([m,name])=>`<button class="chip ${data.mode===m?'selected':''}" aria-pressed="${data.mode===m}" onclick="chooseMode('${m}')">${name}</button>`).join('')}</div><p class="notice">Dopasowanie jest orientacyjne i uwzględnia dostępne informacje o przepisach.</p>`;}
function planReview64(){return `<section class="v64-review"><h3>Twoje posiłki według dni</h3>${data.days.map(day=>`<div><b>${DAYS[day]}:</b> ${selectedMeals64(day).join(', ')} (${selectedMeals64(day).length})</div>`).join('')}</section>`;}
wizard=function(){let html=old64.wizard();
 if(step===0)html=html.replace('<div class="actions">',dayControls64()+'<div class="actions">');
 if(step===1){const start=html.indexOf('<h2>Jaki jest Twój cel?</h2>');const end=html.indexOf('<section class="v63-settings">',start);
  // Stary element wyboru i opis celu znajduje się przed ustawieniami 6.3.
  if(start>=0&&end>start)html=html.slice(0,start)+goalControls64()+html.slice(end);
 }
 if(step===4){html=html.replace(/<p><b>Cel:<\/b>[\s\S]*?<\/p>/,`<p><b>Cel:</b> ${mode64.find(([m])=>m===data.mode)?.[1]||'Zbilansowane'}</p>`).replace(/<b>Posiłków dziennie:<\/b> 5/,`<b>Łącznie posiłków:</b> ${data.days.reduce((n,d)=>n+selectedMeals64(d).length,0)}`);
  html=html.replace('<div class="actions">',planReview64()+'<div class="actions">');
 }
 return html;};
function optionsSelect64(k,current){
 const options=options64[k];
 const value=Number(current);const hasValue=current!==''&&current!=null&&Number.isFinite(value)&&value>0;
 const extra=hasValue&&!options.includes(value)?`<option value="${value}" selected>Poprzednie ustawienie: ${value} ${k==='kcal'?'kcal':'g'}</option>`:'';
 return `<select class="v64-macroselect" aria-label="${macro64[k]}" onchange="kamis64SetPreset('${k}',this.value)"><option value="" ${!hasValue?'selected':''}>Bez ustawienia</option>${options.map(x=>`<option value="${x}" ${hasValue&&x===value?'selected':''}>${x} ${k==='kcal'?'kcal':'g'}</option>`).join('')}${extra}</select>`;
}
window.kamis64SetPreset=(key,value)=>{if(!options64[key])return;window.kamis63Target(key,value);render()};
function adjustAdvanced64(){
 document.querySelectorAll('.v63-fieldgrid').forEach(root=>{
  const fields=root.querySelectorAll('.v63-control');
  ['kcal','p','f','c'].forEach((key,i)=>{
   const field=fields[i];if(!field)return;
   const input=field.querySelector('input');
   if(input){input.insertAdjacentHTML('afterend',optionsSelect64(key,cfg64.targets?.[key]));input.remove()}
  });
  const ancestor=root.closest('.v63-settings');
  if(ancestor){const p=ancestor.querySelector('.muted');
   if(p)p.textContent='Wybierz opcjonalne wartości z list. Są to ustawienia do porównywania posiłków, nie zalecane normy żywienia. Możesz zostawić wszystko bez ustawienia.';
  }
 });
}
function kitchenOK64(r){if(!cfg64.limitDevices)return true;const text=(r.name+' '+(r.steps||[]).join(' ')).toLocaleLowerCase('pl');
 const required=[];if(/air ?fryer|frytkownic[ay] beztłuszczow/.test(text))required.push('air');
 if(/piekarnik|rozgrzej piekarnik|piec w \d|piecz w \d|blach[ae]|naczyni[ue] żaroodporn/.test(text))required.push('oven');
 if(/blender|zblenduj|blenduj/.test(text))required.push('blender');
 if(/mikser|ubij mikserem/.test(text))required.push('mixer');
 if(/patelni|patelnię|na patelni|smaż|podsmaż/.test(text))required.push('stove');
 if(/w garnku|zagotuj|gotuj|wrzątek|gotując/.test(text))required.push('pot');
 return required.every(d=>cfg64.devices.includes(d));
}
function quickScore64(r,goal,usedKinds){
 const n=db64?.nutrition(r)||{c:0,coverage:0};const names=r.ingredients.map(i=>i[0]).join(' ').toLowerCase();
 if(goal==='quick')return -Number(r.minutes||35)*1.8;
 if(goal==='budget')return -(db64?.cost(r)||price(r))*2;
 if(goal==='carbs')return (n.coverage>.35?n.c:(r.calories||350)/8)-Math.max(0,(r.minutes||35)-35)*.2;
 if(goal==='vegetables')return (names.match(/papryk|szpinak|brokuł|marchew|pomidor|cukini|ogórek|sałat|kapust|fasol|ciecierzyc|burak|rzodkiew|awokado|cebula|grzyb|kukurydz|kalafior|bakłażan/g)||[]).length*15;
 if(goal==='variety')return (usedKinds.has(r.kind)?0:20)+(r.ingredients.length*1.5);
 return 0;
}
function reopt64(entry){if(!data.plan?.personalized||!entry.ids.length)return;
 const targets=data.plan.targets63||{};const keys=['kcal','p','f','c'].filter(k=>Number(targets[k])>0);
 if(!keys.length)return;
 const factors=entry.portionFactors||entry.ids.map(()=>1);
 const nutrients=entry.ids.map(id=>db64?.nutrition(recipe64(id))||{kcal:0,p:0,f:0,c:0});
 const evaluate=()=>{let score=0;for(const k of keys){const total=nutrients.reduce((n,r,i)=>n+(Number(r[k])||0)*factors[i],0);score+=Math.pow(Math.log(Math.max(.01,total)/targets[k]),2)*(k==='kcal'?1.5:1)}return score+factors.reduce((n,v)=>n+.14*Math.pow(v-1,2),0)};
 for(let step=0;step<3;step++)for(let i=0;i<factors.length;i++){let best=factors[i],loss=evaluate();for(let x=0;x<=10;x++){factors[i]=.85+x*.05;const now=evaluate();if(now<loss){best=factors[i];loss=now}}factors[i]=Math.round(best*100)/100}
 entry.portionFactors=factors;
}
generate=function(){
 const days=data.days.slice();
 if(days.some(d=>selectedMeals64(d).length===0)){alert('Wybierz przynajmniej jeden posiłek dla każdego dnia.');return;}
 const previous=data.plan;
 old64.generate();
 if(!data.plan||data.plan===previous)return;
 // Wybór dotyczy wyłącznie nowego planu; dawne dane i identyfikatory pozostają nietknięte.
 const already=new Set();
 for(const e of data.plan.entries){
  const all=e.ids.slice(),oldFactors=e.portionFactors?.slice()||[];
  const selected=selectedMeals64(e.day);const slots=selected.map(meal=>meals64.indexOf(meal));
  e.ids=slots.map(i=>all[i]);e.portionFactors=slots.map(i=>oldFactors[i]??1);
  if(['quick','budget','carbs','vegetables','variety'].includes(data.mode)){
   e.ids=e.ids.map((id,i)=>{
    const meal=selected[i];const pool=recipes.filter(r=>r.meal===meal&&allowed(r)&&kitchenOK64(r)&&(!data.timeFilter||Number(r.minutes||35)<=Number(data.timeFilter))&&!already.has(r.id));
    if(!pool.length){already.add(id);return id}
    pool.sort((a,b)=>quickScore64(b,data.mode,new Set([...already].map(x=>recipe64(x)?.kind)))-quickScore64(a,data.mode,new Set([...already].map(x=>recipe64(x)?.kind))));
    const best=pool[0];already.add(best.id);return best.id;
   });
  }else e.ids.forEach(id=>already.add(id));
  reopt64(e);
 }
 data.plan.mealSelection64=Object.fromEntries(data.plan.entries.map(e=>[e.day,e.ids.map(id=>recipe64(id)?.meal)]));
 data.checked={};persist();render();
};
planView=function(){const html=old64.planView();if(!data.plan)return html;
 const n=data.plan.entries.reduce((s,e)=>s+e.ids.length,0);
 const restored=html.replace(/\d+ dni · 5 posiłków\/dzień/,`${data.plan.entries.length} ${data.plan.entries.length===1?'dzień':'dni'} · ${n} ${n===1?'posiłek':n<5?'posiłki':'posiłków'} łącznie`);
 // Zapis planów jest zachowany, lecz osobny katalog "Zapisane" znika z menu.
 const loader=data.saved?.length?`<div class="v64-load"><label>Wczytaj wcześniejszy plan <select aria-label="Wczytaj wcześniejszy plan" onchange="kamis64Restore(this.value)"><option value="">Wybierz zapisany plan…</option>${data.saved.map((s,i)=>`<option value="${i}">${esc(s.name)} (${new Date(s.date).toLocaleDateString('pl-PL')})</option>`).join('')}</select></label></div>`:'';
 const root=document.createElement('div');root.innerHTML=restored;root.querySelectorAll('.v6-extraactions').forEach(el=>el.remove());return root.innerHTML+loader;
};
const originalSave64=savePlan;savePlan=function(){const count=data.saved.length;originalSave64();if(data.saved.length!==count)render()};
window.kamis64Restore=i=>{if(i==='')return;const idx=Number(i);if(Number.isInteger(idx)&&idx>=0&&idx<data.saved.length)restore(idx)};
// Menu: usunięte są tylko wskazane strony. Dane i funkcje archiwalne nie są kasowane.
tabs=function(){old64.tabs();$('tabs').querySelectorAll('button').forEach(b=>{const js=b.getAttribute('onclick')||'';if(js.includes("'saved'")||js.includes("'mealprep'"))b.remove();else if(b.textContent.includes('Ustawienia 6.3'))b.textContent='⚙️ Ustawienia'})};
const oldSetPage64=setPage;
setPage=function(name){if(name==='saved'||name==='mealprep')name='plan';oldSetPage64(name)};
function backupControls64(){return `<section class="panel v64-backup"><h3>💾 Kopia danych</h3><p class="muted">Zachowaj swoje wcześniej zapisane jadłospisy i ustawienia przed aktualizacjami. To nie jest osobna zakładka „Zapisane”.</p><div class="actions">${btn('Eksportuj kopię danych','exportData()','btn alt')}<label class="btn alt">Importuj kopię <input type="file" accept="application/json" onchange="importData(event)" style="display:none"></label></div></section>`}
function releaseNotes64(){return `<section class="panel v64-updates" aria-label="Co nowego w wersji 6.4"><div class="step">AKTUALNA WERSJA • 6.4</div><h2>✨ Nowości w Kamiś 6.4</h2><ul><li>Wybierasz od 1 do 5 posiłków osobno dla każdego dnia.</li><li>Gotowe listy wartości energii i makroskładników w ustawieniach zaawansowanych.</li><li>Więcej celów planowania, bez „Siłowni”.</li><li>50 dodatkowych prostych przepisów.</li><li>Uproszczone menu: bez osobnych stron „Zapisane” i „Na kilka dni”.</li></ul><p class="muted">Pozostałe funkcje Kamiś są zachowane. Dane zapisane lokalnie nie zostały usunięte.</p></section>`}
home=function(){
 const root=document.createElement('div');root.innerHTML=old64.home();
 root.querySelectorAll('.v6-home,.v63-home').forEach(el=>el.remove());root.querySelectorAll('section.panel').forEach(el=>{if(Array.from(el.querySelectorAll('h2')).some(h=>/Nowe w Kamiś 6\.[0-3]/.test(h.textContent)))el.remove()});
 // Wcześniejsze wzmianki o aktualizacjach nie są pokazywane na ekranie głównym.
 return root.innerHTML+releaseNotes64();
};
const oldSummary64=summary;
summary=function(){return oldSummary64()};
goBack=function(){if(page==='saved'||page==='mealprep'){setPage('plan');return}old64.goBack()};
render=function(){old64.render();adjustAdvanced64();if(page==='nutrition63')$('content').insertAdjacentHTML('beforeend',backupControls64());document.querySelectorAll('#content .step').forEach(el=>{if(el.textContent==='KAMIŚ 6.3')el.textContent='KAMIŚ 6.4'});document.querySelectorAll('#content .v63-review').forEach(el=>{el.innerHTML=el.innerHTML.replace('Tryb Kamiś 6.3','Tryb Kamiś 6.4')});};
window.kamis64Version='6.4';
render();
})();
