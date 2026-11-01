/* Kamiś 6.3 — osobny, opcjonalny moduł. Istniejące 603 receptur, ich ID i klucz kamis-v2 są bez zmian. */
(() => {
'use strict';
const old={home,wizard,generate,choose,planCost,planView,recipesView,card,showRecipe,summary,tabs,render,goBack,doSwap};
const byId=id=>recipes.find(r=>r.id===Number(id));
const db=window.kamis62Data;
const fmt=n=>Math.round(Number(n)||0).toLocaleString('pl-PL');
const decimal=n=>Number(Number(n||0).toFixed(1));
const cap=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
const targetKeys=['kcal','p','f','c'];
const macroNames={kcal:'Energia (kcal)',p:'Białko (g)',f:'Tłuszcze (g)',c:'Węglowodany (g)'};
const fractions={'Śniadanie':.24,'Obiad':.34,'Kolacja':.24,'Przekąska':.09,'Deser':.09};
const devices=[['stove','Patelnia / kuchenka'],['pot','Garnek'],['oven','Piekarnik'],['air','Air fryer'],['blender','Blender'],['mixer','Mikser']];
if(!data.v63 || typeof data.v63!=='object' || Array.isArray(data.v63))data.v63={};
const cfg=data.v63;
if(!['simple','advanced'].includes(cfg.planning))cfg.planning='simple';
if(!cfg.targets || typeof cfg.targets!=='object')cfg.targets={};
if(!Array.isArray(cfg.devices))cfg.devices=[];
if(typeof cfg.limitDevices!=='boolean')cfg.limitDevices=false;
if(!['any','highp','highc','lowc','lowf'].includes(cfg.macroFilter))cfg.macroFilter='any';
const getNutrition=r=>db?.nutrition(r)||{kcal:r.calories||0,p:r.protein||0,f:0,c:0,coverage:0};
const getIngredients=r=>db?.ingredients(r)||r.ingredients.map(([name,qty,cost])=>({name,qty,cost}));
const asGrams=(name,qty)=>db?.asGrams(name,qty)||qty;
const planFactor=(entry,idx)=>data.plan?.personalized?cap(Number(entry.portionFactors?.[idx])||1,.85,1.35):1;
window.kamis63Factor=planFactor;
window.kamis63PlanLine=(entry,idx,r)=>{
 if(!data.plan?.personalized)return `~${r.calories} kcal · ${r.protein} g białka · ${money(price(r))}`;
 const n=getNutrition(r),factor=planFactor(entry,idx),cost=(db?.cost(r)||r.ingredients.reduce((s,x)=>s+x[2],0))*factor*(data.plan.people||1);
 return `~${fmt(n.kcal*factor)} kcal · ~${decimal(n.p*factor)} g białka · ~${money(cost)} · ${decimal(factor)}× porcji`;
};
function availableTargets(){const out={};for(const k of targetKeys){const v=Number(cfg.targets[k]);if(cfg.targets[k]!==''&&cfg.targets[k]!=null&&Number.isFinite(v)&&v>0)out[k]=v;}return out;}
function requiredDevices(r){const text=(r.name+' '+(r.steps||[]).join(' ')).toLocaleLowerCase('pl');const out=new Set();
 if(/air ?fryer|frytkownic[ay] beztłuszczow/.test(text))out.add('air');
 if(/piekarnik|rozgrzej piekarnik|piec w \d|piecz w \d|blach[ae]|naczyni[ue] żaroodporn/.test(text))out.add('oven');
 if(/blender|zblenduj|blenduj/.test(text))out.add('blender');
 if(/mikser|ubij mikserem/.test(text))out.add('mixer');
 if(/patelni|patelnię|na patelni|smaż|podsmaż/.test(text))out.add('stove');
 if(/w garnku|zagotuj|gotuj|wrzątek|gotując/.test(text))out.add('pot');
 return [...out];
}
function kitchenMatch(r){return !cfg.limitDevices || requiredDevices(r).every(d=>cfg.devices.includes(d))}
function tags(r){const n=getNutrition(r);if(n.coverage<.45 || n.kcal<20)return [];
 const res=[];
 if(n.p>=24 || (n.p*4/n.kcal>.27&&n.p>=14))res.push(['highp','Wysokobiałkowe']);
 if(n.c>=48 || (n.c*4/n.kcal>.53&&n.c>=24))res.push(['highc','Wysokowęglowodanowe']);
 if(n.c<=18 && n.c*4/n.kcal<.28)res.push(['lowc','Niskowęglowodanowe']);
 if(n.f<=12 && n.f*9/n.kcal<.27)res.push(['lowf','Niskotłuszczowe']);
 return res;
}
window.kamis63MatchesMacro=r=>cfg.macroFilter==='any'||tags(r).some(([key])=>key===cfg.macroFilter);
window.kamis63SetPlanning=mode=>{cfg.planning=mode==='advanced'?'advanced':'simple';persist();render()};
window.kamis63Target=(key,value)=>{if(!targetKeys.includes(key))return;const n=Number(value);cfg.targets[key]=value===''?'':Number.isFinite(n)&&n>0?Math.min(100000,decimal(n)):'';persist()};
window.kamis63LimitDevices=checked=>{cfg.limitDevices=Boolean(checked);persist();render()};
window.kamis63ToggleDevice=(id)=>{if(!devices.some(([d])=>d===id))return;cfg.devices=cfg.devices.includes(id)?cfg.devices.filter(x=>x!==id):[...cfg.devices,id];persist();render()};
window.kamis63MacroFilter=id=>{cfg.macroFilter=['any','highp','highc','lowc','lowf'].includes(id)?id:'any';persist();render()};
function selectHtml(k){return `<label class="v63-control"><span>${macroNames[k]}</span><input type="number" inputmode="decimal" min="0" step="1" placeholder="Opcjonalnie" value="${cfg.targets[k]??''}" onchange="kamis63Target('${k}',this.value)"></label>`}
function controlPanel(){return `<section class="v63-settings"><div class="v63-topline"><h3>⚙️ Tryb planowania</h3><span class="pill">Opcjonalne</span></div><div class="v63-segments"><button type="button" class="chip ${cfg.planning==='simple'?'selected':''}" onclick="kamis63SetPlanning('simple')">🌿 Prosty</button><button type="button" class="chip ${cfg.planning==='advanced'?'selected':''}" onclick="kamis63SetPlanning('advanced')">📊 Zaawansowany</button></div>${cfg.planning==='advanced'?`<p class="muted">Wpisz samodzielnie wartości, które chcesz porównać z jadłospisem. Możesz zostawić dowolne pole puste. Kamiś dobierze przepisy i elastycznie dopasuje porcje, ale nie zagwarantuje dokładnego wyniku.</p><div class="v63-fieldgrid">${targetKeys.map(selectHtml).join('')}</div><p class="v63-hint">Nie wyliczamy zapotrzebowania na podstawie wagi ani nie narzucamy limitów. Przeliczenia są orientacyjne, bo baza składników nie jest pełna.</p>`:`<p class="muted">Bez liczenia kalorii i makroskładników — jak w poprzedniej wersji. Wybierasz dni, preferencje, budżet i generujesz jadłospis.</p>`}</section>`}
function equipmentPanel(){return `<section class="v63-settings"><h3>🍳 Wyposażenie kuchni</h3><label class="v63-check"><input type="checkbox" ${cfg.limitDevices?'checked':''} onchange="kamis63LimitDevices(this.checked)"> Dopasowuj przepisy do sprzętów, które mam</label>${cfg.limitDevices?`<div class="v63-equipment">${devices.map(([id,name])=>`<button type="button" class="chip ${cfg.devices.includes(id)?'selected':''}" onclick="kamis63ToggleDevice('${id}')">${cfg.devices.includes(id)?'✓ ':''}${name}</button>`).join('')}</div><p class="muted">Wybór na podstawie słów w instrukcjach. Jeśli aplikacja nie rozpozna sprzętu, wynik może wymagać sprawdzenia przepisu.</p>`:'<p class="muted">Domyślnie wszystkie dotychczasowe przepisy są dostępne. Ta opcja niczego nie usuwa z bazy.</p>'}</section>`}
function settingsView(){return `<section class="panel"><div class="step">KAMIŚ 6.3</div><h2>Ustawienia planowania</h2><p class="muted">Tryb prosty jest ustawiony domyślnie. Wybór trybu zaawansowanego nie zmienia Twoich wcześniejszych zapisów.</p>${controlPanel()}${equipmentPanel()}<div class="actions">${btn('🗓️ Przejdź do planowania',"setPage('wizard')")}${btn('← Strona główna',"setPage('home')",'btn alt')}</div></section>`}
const origSetPage=setPage;
// Zachowujemy dotychczasowe 5 kroków; nowe opcje pojawiają się na ekranie celu i w osobnym panelu.
wizard=function(){let html=old.wizard();if(step===1)html=html.replace('<div class="actions">',controlPanel()+equipmentPanel()+'<div class="actions">');
 if(step===4){const settings=`<section class="v63-review"><b>Tryb Kamiś 6.3:</b> ${cfg.planning==='advanced'?'Zaawansowany':'Prosty'}${cfg.planning==='advanced'?`<br>Własne orientacyjne ustawienia: ${Object.entries(availableTargets()).map(([k,v])=>`${macroNames[k]} ${fmt(v)}`).join(' · ')||'Nie podano — wybór jak wcześniej'}`:''}<br>Dobór do sprzętu: ${cfg.limitDevices?cfg.devices.map(d=>devices.find(x=>x[0]===d)?.[1]).join(', ')||'Bez wskazanych sprzętów':'Wyłączony'}</section>`;html=html.replace('<div class="actions">',settings+'<div class="actions">');}
 return html;};
function preferenceScore(r,desired,weight,remaining){const n=getNutrition(r);const frac=weight||.2;let loss=0;let factor=1;
 if(desired.kcal&&n.kcal>0)factor=cap(desired.kcal*frac/n.kcal,.85,1.35);
 let nFactors=0;
 for(const k of targetKeys){const t=desired[k];if(!t||n[k]<=0)continue;const ideal=Math.max(.01,t*frac),actual=Math.max(.01,n[k]*factor);const d=Math.log(actual/ideal);loss+=d*d*(k==='kcal'?1.6:1);nFactors++;}
 if(nFactors===0)loss+=Math.abs((n.kcal||r.calories)-(["Obiad"].includes(r.meal)?650:380))/650;
 const priceNow=(db?.cost(r)||r.ingredients.reduce((s,i)=>s+Number(i[2]||0),0))*(data.people||1)*factor;
 if(priceNow>remaining)loss+=1.5;
 if(n.coverage<.55)loss+=.25;
 if(data.mode==='protein'||data.mode==='gym')loss-=Math.min(.4,n.p/100);
 return {loss,factor};}
function optimizedFactors(entry,target){const factors=entry.ids.map(()=>1);if(!Object.keys(target).length)return factors;
 const nutrients=entry.ids.map(id=>getNutrition(byId(id)));
 const keys=Object.keys(target).filter(k=>target[k]>0);
 function evaluate(){const totals={kcal:0,p:0,f:0,c:0};nutrients.forEach((n,i)=>{for(const k of targetKeys)totals[k]+=(n[k]||0)*factors[i];});let score=0;for(const k of keys){const ratio=Math.max(.03,totals[k])/target[k];score+=Math.pow(Math.log(ratio),2)*(k==='kcal'?1.5:1)}score+=factors.reduce((s,f)=>s+Math.pow(f-1,2)*.14,0);return score;}
 for(let iter=0;iter<3;iter++)for(let i=0;i<factors.length;i++){let best=factors[i],bestScore=evaluate();for(let j=0;j<=10;j++){factors[i]=decimal(.85+j*.05);const current=evaluate();if(current<bestScore-1e-9){bestScore=current;best=factors[i];}}factors[i]=best;}
 return factors.map(x=>decimal(x));
}
// Opcjonalny dobór w zaawansowanym trybie. Tryb prosty wywołuje dokładnie starą funkcję.
generate=function(){if(cfg.planning!=='advanced'&&!cfg.limitDevices)return old.generate();
 if(cfg.limitDevices){for(const meal of ['Śniadanie','Obiad','Kolacja','Przekąska','Deser']){if(!recipes.some(r=>r.meal===meal&&allowed(r)&&kitchenMatch(r))){alert('Brakuje zgodnych przepisów dla: '+meal+'. Zaznacz dodatkowy sprzęt albo wyłącz filtr wyposażenia.');return;}}}
 const allTargets=availableTargets();const chosen=[];const oldPick=choose;
 choose=function(meal,used,remaining){
  let pool=recipes.filter(r=>r.meal===meal && allowed(r) && !used.has(r.id) && kitchenMatch(r) && (!data.timeFilter||Number(r.minutes||35)<=Number(data.timeFilter)));
  if(!pool.length)pool=recipes.filter(r=>r.meal===meal && allowed(r) && kitchenMatch(r));
  if(!pool.length){const fallback=oldPick(meal,used,remaining);chosen.push(fallback);return fallback;}
  const scored=pool.map(r=>({r,s:preferenceScore(r,allTargets,fractions[meal]||.2,remaining)}));scored.sort((a,b)=>a.s.loss-b.s.loss);
  const item=scored[0];used.add(item.r.id);chosen.push(item.r.id);return item.r.id;
 };
 const before=data.plan;
 try{old.generate()}finally{choose=oldPick}
 if(data.plan===before||!data.plan)return;
 data.plan.personalized=true;data.plan.mode63=cfg.planning;data.plan.targets63=structuredClone(allTargets);
 for(const entry of data.plan.entries)entry.portionFactors=optimizedFactors(entry,allTargets);
 data.checked={};persist();render();
};
planCost=function(){if(!data.plan?.personalized)return old.planCost();let total=0;for(const entry of data.plan.entries)entry.ids.forEach((id,idx)=>{const r=byId(id);if(r)total+=(db?.cost(r)||0)*(data.plan.people||1)*planFactor(entry,idx)});return total};
function dailySummary(entry){const sums={kcal:0,p:0,c:0,f:0,coverage:0,cost:0};entry.ids.forEach((id,idx)=>{const r=byId(id);if(!r)return;const n=getNutrition(r),factor=planFactor(entry,idx);for(const k of targetKeys)sums[k]+=Number(n[k]||0)*factor;sums.coverage+=n.coverage/Math.max(1,entry.ids.length);sums.cost+=(db?.cost(r)||0)*factor*(data.plan?.people||1)});return sums;}
const metricChips=n=>`<div class="v63-stats">${targetKeys.map(k=>`<div><b>${fmt(n[k])}${k==='kcal'?' kcal':' g'}</b><small>${macroNames[k].replace(/ \(.+\)/,'')}</small></div>`).join('')}</div>`;
planView=function(){let html=old.planView();if(!data.plan?.personalized)return html;
 const rows=data.plan.entries.map(e=>`<div class="v63-day-total"><strong>${DAYS[e.day]}</strong>${metricChips(dailySummary(e))}</div>`).join('');
 const section=`<section class="v63-planinfo"><h3>📊 Dopasowanie posiłków i porcji</h3><p class="muted">Szacunkowe wartości dla jednej osoby. Gramatury w zakupach są przeliczone według indywidualnych porcji z tego planu, również po wczytaniu zapisanego jadłospisu. Mnożniki przy posiłkach oznaczają ilość jednej standardowej porcji.</p>${rows}<div class="v63-hint">Wartości mogą odbiegać od wpisanych ustawień. Przy brakujących danych o składnikach dokładne dopasowanie nie jest możliwe.</div></section>`;
 // Dotychczasowa karta planu zostaje, ale stare ogólne podsumowanie zastępujemy sumą porcji.
 html=html.replace(/<div class="notice"><b>Podsumowanie:<\/b>[\s\S]*?<\/div>/,`<div class="notice"><b>Podsumowanie:</b> ${data.plan.entries.length} dni · ${data.plan.entries.reduce((n,e)=>n+e.ids.length,0)} posiłków · koszt ~${money(planCost())}. Indywidualne wartości dzienne w panelu poniżej.</div>`);
 return html+section;
};
const oldDoSwap=doSwap;
doSwap=function(id){const t=swapTarget?{...swapTarget}:null;oldDoSwap(id);if(t&&data.plan?.personalized){const e=data.plan.entries.find(x=>x.day===t.day);if(e){e.portionFactors=optimizedFactors(e,data.plan.targets63||{});persist();render()}}};
if(typeof window.kamis62ApplyBudget==='function'){const originalBudgetSwap=window.kamis62ApplyBudget;window.kamis62ApplyBudget=(...args)=>{const snapshot=JSON.stringify(data.plan?.entries?.map(e=>e.ids));originalBudgetSwap(...args);if(data.plan?.personalized&&snapshot!==JSON.stringify(data.plan.entries.map(e=>e.ids))){data.plan.entries.forEach(e=>e.portionFactors=optimizedFactors(e,data.plan.targets63||{}));persist();render();}};}
if(typeof window.kamisBatchApply==='function'){const originalBatch=window.kamisBatchApply;window.kamisBatchApply=(...args)=>{const snapshot=JSON.stringify(data.plan?.entries?.map(e=>e.ids));originalBatch(...args);if(data.plan?.personalized&&snapshot!==JSON.stringify(data.plan.entries.map(e=>e.ids))){data.plan.entries.forEach(e=>e.portionFactors=optimizedFactors(e,data.plan.targets63||{}));persist();render();}};}
function filterControls(){return `<div class="v63-filter"><label>Filtr według szacowanego składu: <select aria-label="Filtr makroskładników" onchange="kamis63MacroFilter(this.value)">${[['any','Wszystkie przepisy'],['highp','Wysokobiałkowe'],['highc','Wysokowęglowodanowe'],['lowc','Niskowęglowodanowe'],['lowf','Niskotłuszczowe']].map(([k,t])=>`<option value="${k}" ${cfg.macroFilter===k?'selected':''}>${t}</option>`).join('')}</select></label></div>`}
recipesView=function(){const html=old.recipesView();return swapTarget?html:html.replace(/(<div class="v6-filter">)/,filterControls()+'$1')};
card=function(r,actions=true){const html=old.card(r,actions);const tagHtml=tags(r).slice(0,2).map(([,name])=>`<span class="v63-tag">${name}</span>`).join('');return tagHtml?html.replace('<div class="inside">',`<div class="inside"><div class="v63-tags">${tagHtml}</div>`):html;};
showRecipe=function(id){old.showRecipe(id);const r=byId(id);if(!r)return;const labels=tags(r).map(([,s])=>s).join(' · ');let additional='';
 if(data.plan?.personalized){const found=data.plan.entries.flatMap(e=>e.ids.map((rid,idx)=>({entry:e,idx,rid}))).find(x=>x.rid===r.id);
 if(found){const factor=planFactor(found.entry,found.idx);additional=`<div class="v63-serving-note"><h3>⚖️ Ilości dla wygenerowanego jadłospisu (${DAYS[found.entry.day]})</h3><p class="muted">Przelicznik ${decimal(factor)}× standardowej porcji × ${data.plan.people||1} os. Pozostała lista składników w przepisie służy ogólnemu przeliczaniu.</p><ul>${getIngredients(r).map(i=>`<li>${esc(i.name)} — ${decimal(i.qty*factor*(data.plan.people||1))} ${/jajk/i.test(i.name)&&i.qty<10?'szt.':'g'}</li>`).join('')}</ul></div>`;}}
 $('dialogBody').insertAdjacentHTML('beforeend',`<section class="v63-recipeinfo">${labels?`<p>📌 ${esc(labels)}</p>`:''}${additional}<p class="muted">Oznaczenia żywieniowe opierają się na szacunkowych danych z rozpoznanych składników. Nie są danymi producentów.</p></section>`);
};
summary=function(){if(!data.plan?.personalized)return old.summary();
 const entries=data.plan.entries;const days=entries.length;const daily=entries.map(e=>dailySummary(e));const avg={kcal:0,p:0,c:0,f:0};for(const n of daily)for(const k of targetKeys)avg[k]+=n[k]/Math.max(1,days);
 const goal=data.plan.targets63||{};
 return `<section class="panel"><h2>📊 Podsumowanie jadłospisu</h2><p><b>${days} dni</b> · ${entries.reduce((s,e)=>s+e.ids.length,0)} posiłków · ${data.plan.people||1} os.</p><p>Szacowany koszt: <strong>${money(planCost())}</strong> · budżet: ${money(data.plan.budget)}</p><h3>Średnie wartości dziennie, na osobę</h3>${metricChips(avg)}${Object.keys(goal).length?`<div class="v63-goals"><h3>Twoje wpisane orientacyjne wartości</h3>${metricChips(goal)}<p class="muted">To wartości porównawcze, a nie obowiązkowe limity. Rzeczywiste proporcje zależą od marki produktów, przygotowania i dokładności bazy.</p></div>`:''}<h3>Wybrane dni</h3>${entries.map(e=>`<div class="v63-day-total"><strong>${DAYS[e.day]}</strong>${metricChips(dailySummary(e))}</div>`).join('')}<h3>Wykluczone składniki</h3><p>${(data.excluded||[]).map(x=>EXCLUSIONS.find(y=>y[0]===x)?.[1]).join(', ')||'Brak'}</p><p class="muted">Wszystkie wartości są szacunkowe i mogą być niekompletne. Sprawdzaj alergeny na etykietach.</p>${btn('← Wróć do planu',"setPage('plan')",'btn alt')}</section>`;
};
const oldHome=home;
home=function(){return old.home()+`<section class="panel v63-home"><h2>🌿 Kamiś 6.3 — planowanie po Twojemu</h2><p>Wybierz tryb prosty albo dobrowolnie ustaw własne wartości. Możesz też dopasować przepisy do wyposażenia kuchni.</p><div class="actions">${btn('⚙️ Ustawienia planowania',"setPage('nutrition63')")}${btn('🗓️ Zaplanuj posiłki',"setPage('wizard')",'btn alt')}</div></section>`};
const oldTabs=tabs;
tabs=function(){old.tabs();$('tabs').insertAdjacentHTML('beforeend',`<button class="tab ${page==='nutrition63'?'active':''}" onclick="setPage('nutrition63')">⚙️ Ustawienia 6.3</button>`)};
const oldGoBack=goBack;
goBack=function(){if(page==='nutrition63'){setPage('home');return}old.goBack()};
const oldRender=render;
render=function(){if(page==='nutrition63'){tabs();$('content').innerHTML=settingsView();$('backBtn').style.display='inline-block'}else oldRender();};
render();
})();
