/* Kamiś 2.2.1 — funkcje zatwierdzone dla 2.1, dodane do 2.2.
   Nie zmienia istniejących przepisów, ID, zdjęć ani klucza localStorage kamis-v2. */
(() => {
'use strict';
const prior = {render, home, generate, showRecipe, doSwap};
const cfg = data.v63 || (data.v63={});
const db = window.kamis62Data;
if (!data.v221 || typeof data.v221 !== 'object' || Array.isArray(data.v221)) data.v221={};
const st=data.v221;
if (!st.macros || typeof st.macros !== 'object') st.macros={};
if (!st.custom || typeof st.custom !== 'object') st.custom={};
if (!Array.isArray(st.profiles)) st.profiles=[];
const names={p:'Białko',c:'Węglowodany',f:'Tłuszcze'};
const keys=['p','c','f'];
const modes=['minimum','balanced','maximum','custom'];
const modesText={minimum:'Minimum',balanced:'Zbilansowane',maximum:'Maksimum',custom:'Własna wartość'};
const num=x=>Number.isFinite(Number(x))?Number(x):0;
const round=x=>Math.round((Number(x)||0)*10)/10;
const rById=id=>recipes.find(r=>r.id===Number(id));
const deep=x=>JSON.parse(JSON.stringify(x));
const nutrients=new Map();
function nutrition(r){if(!r)return {p:0,c:0,f:0,kcal:0,coverage:0};
  // Substitutions may change nutrition. Avoid stale cache where ingredient substitutions exist.
  if(data.v62?.substitutions?.[String(r.id)])return db?.nutrition(r)||{p:0,c:0,f:0,kcal:0,coverage:0};
  if(!nutrients.has(r.id))nutrients.set(r.id,db?.nutrition(r)||{p:0,c:0,f:0,kcal:0,coverage:0});
  return nutrients.get(r.id);
}
for(const k of keys){
  if(!modes.includes(st.macros[k])){
    const previous=num(cfg.targets?.[k]);
    st.macros[k]=previous>0?'custom':'balanced';
    if(previous>0)st.custom[k]=previous;
  }
  if(!Number.isFinite(Number(st.custom[k])))st.custom[k]='';
}
function syncTargets(){
  cfg.targets=cfg.targets||{};
  for(const k of keys)cfg.targets[k]=st.macros[k]==='custom'&&num(st.custom[k])>0?num(st.custom[k]):'';
}
syncTargets();
function quality(r){const n=nutrition(r);return {
  known:Number.isFinite(n.coverage)?Math.max(0,Math.min(1,n.coverage)):0,
  reliable:n.coverage>=.75 && n.kcal>0,
  label:n.coverage>=.75?'Szacunek z większości składników':n.coverage>=.4?'Dane żywieniowe niepełne':'Za mało danych do wiarygodnego porównania'
};}
function safe(s){return esc(String(s??''));}
window.kamis221SetMacro=(k,v)=>{
 if(!keys.includes(k)||!modes.includes(v))return;
 st.macros[k]=v;syncTargets();persist();render();
};
window.kamis221SetCustom=(k,v)=>{
 if(!keys.includes(k))return;
 const x=num(v);st.custom[k]=v===''?'':x>0&&x<=1500?round(x):'';
 syncTargets();persist();
};
function macroChoicesHtml(k){
 const m=st.macros[k]||'balanced';
 return `<div class="k221-macro" role="group" aria-label="${names[k]}"><div class="k221-label">${names[k]}</div><div class="k221-choices">${modes.map(x=>`<button type="button" class="chip ${x===m?'selected':''}" aria-pressed="${x===m}" onclick="kamis221SetMacro('${k}','${x}')">${modesText[x]}</button>`).join('')}</div>${m==='custom'?`<label class="k221-own">Wpisz własną orientacyjną wartość (g/dzień)<input type="number" inputmode="decimal" min="1" max="1500" step="1" value="${safe(st.custom[k]||'')}" placeholder="Własna wartość" onchange="kamis221SetCustom('${k}',this.value)"></label>`:''}</div>`;
}
function macroInfo(){return `<p class="muted k221-note">Minimum, Zbilansowane i Maksimum oznaczają <strong>względny priorytet w doborze różnorodnych posiłków</strong> — nie nakaz ograniczania składników ani sztywne dzienne limity. Własne wartości i obliczenia są orientacyjne. Nie zastępują porady dietetycznej.</p>`;}
function enhanceMacroPanels(){
 for(const grid of document.querySelectorAll('.v63-fieldgrid')){
  for(const field of [...grid.querySelectorAll('.v63-control')]){
   const title=field.querySelector('span')?.textContent||'';
   const key=/Białko/.test(title)?'p':/Tłuszcze/.test(title)?'f':/Węglowodany/.test(title)?'c':null;
   if(key)field.outerHTML=macroChoicesHtml(key);
  }
  if(!grid.querySelector('.k221-note'))grid.insertAdjacentHTML('afterend',macroInfo());
  const section=grid.closest('.v63-settings');
  const p=section?.querySelector('.muted');
  if(p)p.textContent='Energię wybierz jak dotychczas. Dla makroskładników wybierz preferencję albo wpisz własną wartość. Ustawienia są opcjonalne.';
 }
 for(const summary of document.querySelectorAll('.v63-review')){
   if(summary.querySelector('.k221-pref-summary'))continue;
   const text=keys.map(k=>`${names[k]}: ${modesText[st.macros[k]]}${st.macros[k]==='custom'&&num(st.custom[k])>0?' ('+round(st.custom[k])+' g)':''}`).join(' · ');
   summary.insertAdjacentHTML('beforeend',`<div class="k221-pref-summary">${safe(text)}</div>`);
 }
}
function snapshotProfile(){return {planning:cfg.planning||'simple',targets:deep(cfg.targets||{}),macroMode:deep(st.macros),custom:deep(st.custom),limitDevices:!!cfg.limitDevices,devices:deep(cfg.devices||[]),macroFilter:cfg.macroFilter||'any',mode:data.mode,days:deep(data.days||[]),mealChoices64:deep(data.mealChoices64||{}),excluded:deep(data.excluded||[]),timeFilter:num(data.timeFilter),budget:num(data.budget),people:num(data.people)};}
window.kamis221SaveProfile=()=>{
 const field=document.getElementById('k221ProfileName');
 const name=(field?.value||'').trim().slice(0,60);
 if(!name){alert('Wpisz nazwę profilu.');return;}
 if(st.profiles.some(p=>p.name.toLocaleLowerCase('pl')===name.toLocaleLowerCase('pl'))){alert('Profil o tej nazwie już istnieje. Nadaj inną nazwę.');return;}
 st.profiles.push({name,at:new Date().toISOString(),settings:snapshotProfile()});persist();render();
};
window.kamis221LoadProfile=i=>{
 const p=st.profiles[Number(i)];if(!p?.settings)return;
 const s=p.settings;
 if(!confirm(`Wczytać profil „${p.name}” i zastąpić bieżące ustawienia planowania? Zapisane jadłospisy pozostaną bez zmian.`))return;
 cfg.planning=s.planning;cfg.targets=deep(s.targets||{});cfg.limitDevices=!!s.limitDevices;cfg.devices=deep(s.devices||[]);cfg.macroFilter=s.macroFilter||'any';
 st.macros=deep(s.macroMode||{});st.custom=deep(s.custom||{});
 for(const k of keys)if(!modes.includes(st.macros[k]))st.macros[k]='balanced';syncTargets();
 data.mode=s.mode;data.days=deep(s.days||[]);data.mealChoices64=deep(s.mealChoices64||{});data.excluded=deep(s.excluded||[]);data.timeFilter=num(s.timeFilter);data.budget=num(s.budget);data.people=num(s.people)||1;
 persist();render();
};
window.kamis221RemoveProfile=i=>{
 const p=st.profiles[Number(i)];if(!p)return;
 if(confirm(`Usunąć profil ustawień „${p.name}”? Nie usunie to żadnych jadłospisów.`)){st.profiles.splice(Number(i),1);persist();render();}
};
function profilePanel(){return `<section class="v63-settings k221-profiles"><h3>🔖 Moje profile planowania</h3><p class="muted">Zapisz wybrane dni, cele, budżet, wykluczenia, sprzęt i preferencje żywieniowe. Szybko odtworzysz je później bez zmieniania zapisanych jadłospisów.</p><div class="k221-newprofile"><input id="k221ProfileName" maxlength="60" placeholder="Np. szybkie kolacje" aria-label="Nazwa nowego profilu"><button type="button" class="btn" onclick="kamis221SaveProfile()">Zapisz profil</button></div>${st.profiles.length?`<div class="k221-profilelist">${st.profiles.map((p,i)=>`<div><span>${safe(p.name)}</span><button type="button" class="btn alt" onclick="kamis221LoadProfile(${i})">Wczytaj</button><button type="button" class="btn alt" onclick="kamis221RemoveProfile(${i})" aria-label="Usuń profil ${safe(p.name)}">Usuń</button></div>`).join('')}</div>`:'<p class="muted">Nie masz jeszcze zapisanych profili.</p>'}</section>`;}
function enhanceProfiles(){
 if(!((page==='wizard'&&step===1)||page==='nutrition63'))return;
 const sections=[...document.querySelectorAll('#content .v63-settings')];
 const first=sections.find(x=>x.querySelector('h3')?.textContent.includes('Tryb planowania'));
 if(first&&!document.querySelector('.k221-profiles'))first.insertAdjacentHTML('afterend',profilePanel());
}
function matchEquipment(r){return !window.kamis20EquipmentOK||window.kamis20EquipmentOK(r);}
function match(r){return allowed(r)&&matchEquipment(r)&&(!num(data.timeFilter)||num(r.minutes||30)<=num(data.timeFilter));}
function totals(entry){const out={p:0,c:0,f:0,kcal:0,coverage:0};let count=0;
 entry.ids.forEach((id,i)=>{const r=rById(id);if(!r)return;const n=nutrition(r),factor=num(entry.portionFactors?.[i])||1;
  for(const k of ['p','c','f','kcal'])out[k]+=num(n[k])*factor;
  out.coverage+=num(n.coverage);count++;
 });
 out.coverage/=Math.max(1,count);return out;
}
const wanted=()=>({kcal:num(cfg.targets?.kcal),...Object.fromEntries(keys.map(k=>[k,st.macros[k]==='custom'?num(st.custom[k]):0]))});
function density(r,key){const n=nutrition(r);if(n.coverage<.45)return 0;return Math.min(1,Math.max(0,num(n[key])*(key==='f'?9:4)/Math.max(1,num(n.kcal))));}
function baseScore(r,already){
 const q=quality(r),n=nutrition(r);
 let score=q.known*3;
 score+=(data.favorites||[]).includes(r.id)?3:0;
 score+=num(data.ratings?.[r.id])*.4;
 if(data.mode==='quick')score-=num(r.minutes||30)*.07;
 if(data.mode==='budget')score-=num(db?.cost(r))*0.12;
 if(data.mode==='vegetables')score+=(r.ingredients||[]).filter(x=>/szpinak|brokuł|marchew|papryk|cukini|pomid|ogórek|sałat|burak|kapust|kalafior/i.test(x[0])).length*.6;
 if(already?.has(r.id))score-=5;
 for(const k of keys){if(q.known<.5)continue;
  const ratio=density(r,k),mode=st.macros[k];
  if(mode==='maximum')score+=ratio*7;
  else if(mode==='minimum')score+=Math.max(0,.35-Math.abs(ratio-.25))*3; // Preferencja łagodna, bez minimalizowania spożycia.
  else if(mode==='balanced')score+=Math.max(0,.32-Math.abs(ratio-(k==='f'?.28:.3)))*2.5;
 }
 return score;
}
function dayScore(entry,used){
 const n=totals(entry);let score=0;
 const goals=wanted();
 for(const k of ['kcal',...keys])if(goals[k]>0&&n[k]>0&&n.coverage>=.45){
   const ratio=Math.max(.05,n[k])/goals[k];score-=Math.min(10,Math.pow(Math.log(ratio),2)*(k==='kcal'?2.2:1.1));
 }
 const rs=entry.ids.map(rById).filter(Boolean);
 score+=rs.reduce((s,r)=>s+baseScore(r,used),0);
 const families=rs.map(r=>r.kind);
 score-=families.length-new Set(families).size>0? (families.length-new Set(families).size)*1.8:0;
 const veggie=rs.filter(r=>r.ingredients.some(x=>/papryk|szpinak|brokuł|marchew|ogórek|pomid|cukini|sałat|jabłk|banan|truskawk|malin/i.test(x[0]))).length;
 score+=Math.min(3,veggie)*1.5;
 const budgetPerDay=num(data.budget)/Math.max(1,data.days.length);const price=rs.reduce((s,r)=>s+num(db?.cost(r))*(num(data.people)||1),0);
 if(budgetPerDay>0&&price>budgetPerDay)score-=Math.min(15,(price-budgetPerDay)*.35);
 return score;
}
function optimizeDay(entry,globalUsed){
 if(!entry?.ids?.length)return;
 for(let pass=0;pass<2;pass++){
  for(let i=0;i<entry.ids.length;i++){
   const oldId=entry.ids[i],meal=rById(oldId)?.meal;
   if(!meal)continue;
   const usedElse=new Set([...globalUsed,...entry.ids.filter((_,index)=>index!==i)]);
   const pool=recipes.filter(r=>r.meal===meal&&match(r)&&!usedElse.has(r.id));
   // Evaluate a diverse set of best-scoring alternatives, keeping the original.
   pool.sort((a,b)=>baseScore(b,usedElse)-baseScore(a,usedElse));
   const candidates=[rById(oldId),...pool.slice(0,26)].filter(Boolean);
   let best=oldId,bestScore=dayScore(entry,globalUsed);
   for(const r of candidates){entry.ids[i]=r.id;const s=dayScore(entry,globalUsed);
    if(s>bestScore+.05){bestScore=s;best=r.id;}}
   entry.ids[i]=best;
  }
 }
}
function optimizeFactors(entry){
 if(!data.plan?.personalized)return;
 const targets=data.plan.targets63||{};
 const keysActive=['kcal',...keys].filter(k=>num(targets[k])>0);
 if(!keysActive.length){entry.portionFactors=entry.ids.map(()=>1);return;}
 entry.portionFactors=entry.ids.map((_,i)=>num(entry.portionFactors?.[i])||1);
 function loss(){const n=totals(entry);let result=0;for(const k of keysActive){const val=Math.max(.1,n[k]);result+=Math.pow(Math.log(val/targets[k]),2)*(k==='kcal'?1.8:1);}
   result+=entry.portionFactors.reduce((s,x)=>s+Math.pow(x-1,2)*.24,0);return result;}
 for(let pass=0;pass<2;pass++)for(let i=0;i<entry.ids.length;i++){
  let best=entry.portionFactors[i],score=loss();
  for(const mul of [.85,.9,.95,1,1.05,1.1,1.15,1.2,1.25,1.3,1.35]){entry.portionFactors[i]=mul;const val=loss();if(val<score){score=val;best=mul;}}
  entry.portionFactors[i]=best;
 }
}
function updateAfterEdit(){if(!data.plan)return;for(const e of data.plan.entries){
 if(!Array.isArray(e.portionFactors)||e.portionFactors.length!==e.ids.length)e.portionFactors=e.ids.map(()=>1);
 optimizeFactors(e);
 }data.checked={};persist();render();}
generate=function(){
 syncTargets();const before=data.plan;
 prior.generate();
 if(!data.plan||data.plan===before)return;
 if(cfg.planning==='advanced'){
  const globallyUsed=new Set();
  for(const entry of data.plan.entries){optimizeDay(entry,globallyUsed);entry.ids.forEach(id=>globallyUsed.add(id));}
  data.plan.targets63=wanted();
  data.plan.targets63=Object.fromEntries(Object.entries(data.plan.targets63).filter(([,value])=>value>0));
  data.plan.personalized=Object.keys(data.plan.targets63).length>0;
  for(const entry of data.plan.entries)optimizeFactors(entry);
 }
 data.plan.k221Preferences=deep(st.macros);
 data.checked={};persist();render();
};
doSwap=function(id){const before=data.plan?JSON.stringify(data.plan.entries):'';prior.doSwap(id);if(data.plan&&JSON.stringify(data.plan.entries)!==before)updateAfterEdit();};
for(const action of ['kamis20AddToPlan','kamis20Move','kamis62ApplyBudget','kamisBatchApply']){
 const previous=window[action];if(typeof previous!=='function')continue;
 window[action]=function(...args){const before=data.plan?JSON.stringify(data.plan.entries.map(x=>x.ids)):'';
  const result=previous(...args);
  if(data.plan&&JSON.stringify(data.plan.entries.map(x=>x.ids))!==before)updateAfterEdit();return result;
 };
}
function why(r){const reasons=[];
 if(cfg.limitDevices)reasons.push('Pasuje do zaznaczonego sprzętu');
 if(data.mode==='quick'||num(data.timeFilter)>0)reasons.push('Uwzględnia czas przygotowania');
 if(data.mode==='budget')reasons.push('Uwzględnia budżet');
 if((data.excluded||[]).length)reasons.push('Zgodne z wykluczeniami');
 if(cfg.planning==='advanced'){
  if(st.macros.p==='maximum'&&quality(r).reliable)reasons.push('Źródło białka');
  else if(st.macros.c==='maximum'&&quality(r).reliable)reasons.push('Źródło węglowodanów');
  else if(st.macros.f==='maximum'&&quality(r).reliable)reasons.push('Źródło tłuszczów');
  else reasons.push('Wpisuje się w preferencje dnia');
 }
 if(!reasons.length)reasons.push('Różnorodne składniki i prosty plan');
 return reasons.slice(0,2).join(' · ');
}
function annotatePlan(){if(page!=='plan'||!data.plan)return;
 const days=[...document.querySelectorAll('#content .day')];
 data.plan.entries.forEach((entry,index)=>{
  const div=days[index];if(!div)return;
  [...div.querySelectorAll('.meal')].forEach((item,i)=>{
   const r=rById(entry.ids[i]);if(!r)return;
   const desc=item.querySelector('.desc');if(!desc||desc.querySelector('.k221-why'))return;
   desc.insertAdjacentHTML('beforeend',`<small class="k221-why">✨ Dlaczego to danie? ${safe(why(r))}</small>`);
  });
 });
}
function annotateQuality(){
 if(page!=='recipes')return;
 for(const node of document.querySelectorAll('.k22-recipe-card')){
  const call=node.querySelector('button[onclick^="showRecipe"]')?.getAttribute('onclick')||'';
  const id=Number(call.match(/\((\d+)\)/)?.[1]);const r=rById(id);
  if(!r||quality(r).reliable)continue;
  const tags=node.querySelector('.v20-tags');if(tags)tags.insertAdjacentHTML('beforeend',`<span class="k221-uncertain" title="Wartości odżywcze są szacunkowe i niepełne">⚠️ Dane niepełne</span>`);
 }
}
showRecipe=function(id){prior.showRecipe(id);
 const r=rById(id),d=document.getElementById('dialogBody');if(!r||!d)return;
 const q=quality(r);
 d.insertAdjacentHTML('beforeend',`<section class="k221-recipeinfo"><b>Wiarygodność danych żywieniowych</b><p>${safe(q.label)} (${Math.round(q.known*100)}% masy składników rozpoznane w uproszczonej bazie). Wartości są szacunkowe, nie pochodzą z etykiet.</p></section>`);
};
function enhance(){enhanceMacroPanels();enhanceProfiles();annotatePlan();annotateQuality();}
render=function(){prior.render();enhance();
 const count=document.getElementById('count');if(count)count.textContent=`${recipes.length} przepisów · 2.2.1`;
 const stepLabel=document.querySelector('#content .step');if(stepLabel&&/KAMIŚ 2\.2/.test(stepLabel.textContent))stepLabel.textContent=stepLabel.textContent.replace('KAMIŚ 2.2','KAMIŚ 2.2.1');
 if(page==='home'){const el=document.querySelector('#content .v20-release .v20-kicker');if(el)el.textContent='AKTUALNA WERSJA • 2.2.1';}
};
home=function(){const html=prior.home();
 const notes='<section class="v20-release"><div class="v20-kicker">AKTUALNA WERSJA • 2.2.1</div><h2>Co nowego w Kamiś 2.2.1?</h2><p>Dołączyliśmy uzgodnione funkcje planowania 2.1: cztery ustawienia makroskładników, inteligentniejszą ocenę całego dnia, profile planowania, aktualizowanie porcji i zakupów po zamianie, oznaczanie niepełnych danych oraz krótkie uzasadnienia doboru dań. Zachowany jest katalog 1000 przepisów i fotografie z 2.2.</p></section>';
 return html.replace(/<section class="v20-release">[\s\S]*?<\/section>/,notes);
};
window.kamis20CurrentVersion='2.2.1';
persist();render();
})();
