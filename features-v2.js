/* Kamiś 2.0 — interfejs, wyposażenie, katalog, plan. Bez zmiany klucza zapisów kamis-v2. */
(()=>{
'use strict';
const previous={home,tabs,wizard,recipesView,planView,showRecipe,doSwap,render,goBack,generate,detailedSteps};
const mealOrder=['Śniadanie','Obiad','Kolacja','Przekąska','Deser'];
const equipOptions=[['air','🍟 Air fryer'],['stove','🍳 Patelnia i palnik'],['pot','🥘 Garnek i palnik'],['oven','♨️ Piekarnik'],['micro','📻 Mikrofalówka'],['kettle','🫖 Czajnik'],['blender','🥤 Blender'],['mixer','🧁 Mikser']];
const cfg=data.v63||{};
if(!data.v20||typeof data.v20!=='object')data.v20={};
const state=data.v20;
if(!Array.isArray(state.recent))state.recent=[];
if(!['any','meat','fast','simple','budget'].includes(state.quick))state.quick='any';
if(!Number.isFinite(Number(state.maxResults)))state.maxResults=36;
const escape=esc;
const get=id=>recipes.find(r=>r.id===Number(id));
const num=v=>Number(v)||0;
const cost=r=>window.kamis62Data?.cost(r)||r.ingredients.reduce((s,i)=>s+num(i[2]),0);
const duration=r=>Math.max(1,num(r.minutes)||30);
const devText=d=>equipOptions.find(e=>e[0]===d)?.[1]||d;
const selected=()=>Array.isArray(cfg.devices)?cfg.devices:[];
// Correct legacy ingredient matching so turkey ham is not treated as pork and nut butter is not dairy.
allowed=function(r){const names=r.ingredients.map(x=>x[0]).join(' ').toLocaleLowerCase('pl');const excl=data.excluded||[];
 const contains={pork:r.kind==='pork'||/wieprz|boczek|szynka(?!\s+z\s+indyka)/.test(names),beef:r.kind==='beef'||/wołow/.test(names),chicken:r.kind==='chicken'||/kurczak|indyk|drobi/.test(names),fish:r.kind==='fish'||/ryb|łosoś|tuńczyk|makrela|śledź|sardynk|dorsz/.test(names),nuts:/orzech|migdał|arachid|nerkow|pistacj/.test(names),dairy:/mleko|jogurt|skyr|ser|twaróg|śmietan|mozzarella|cheddar|parmezan|gouda|feta|masło(?!\s+(orzechowe|migdałowe))/.test(names),eggs:/jajk/.test(names),gluten:/chleb|pieczywo|makaron|tortilla|bułka|pita|bajgiel|kuskus|bulgur|płatki|mąka|krakers|granola|kasza jęczmienna/.test(names),soy:/tofu|sos sojowy|soja/.test(names),mushrooms:/pieczark|grzyb/.test(names)};
 return !excl.some(k=>contains[k]);
};

function required(r){
 if(Array.isArray(r.equipment))return r.equipment;
 const txt=(r.name+' '+(r.steps||[]).join(' ')).toLocaleLowerCase('pl');
 const needs=new Set();
 if(/air\s?fryer|beztłuszczow|frytkownic/.test(txt))needs.add('air');
 if(/piekarnik|blacha|żaroodporn|wstaw do pieca/.test(txt))needs.add('oven');
 if(/mikrofal|mikrofali/.test(txt))needs.add('micro');
 if(/czajnik/.test(txt))needs.add('kettle');
 if(/blender|zblenduj|blenduj/.test(txt))needs.add('blender');
 if(/mikserem|miksera|ubij mikserem/.test(txt))needs.add('mixer');
 if(/patelni|patelnię|smaż|podsmaż|obsmaż|opiekaj na/.test(txt))needs.add('stove');
 if(/garnek|garnku|zagotuj|ugotuj|gotuj|wrzącej wodzie|bulion doprowadź/.test(txt))needs.add('pot');
 // Uncertain historical methods should not be labelled as doable with air fryer alone.
 if(needs.size===0 && /piecz|wypie|smaż|gotuj|duś|mięs[oa]|filet surow|jajecznic|surow[ea] jaj/i.test(txt))needs.add('stove');
 return [...needs];
}
function equipOK(r){return !cfg.limitDevices||required(r).every(x=>selected().includes(x))}
function matches(r){return allowed(r)&&equipOK(r)&&(!num(data.timeFilter)||duration(r)<=num(data.timeFilter))}
function selections(day){const s=data.mealChoices64?.[String(day)];return Array.isArray(s)?mealOrder.filter(k=>s.includes(k)):mealOrder.slice()}
function devicePanel(){const restricted=!!cfg.limitDevices;return `<section class="v20-equipment" aria-label="Twój sprzęt kuchenny"><div class="v20-titleline"><h3>🍳 Co masz w kuchni?</h3><span class="v20-note">Wybieraj dowolną kombinację</span></div><label class="v20-toggle"><input type="checkbox" ${restricted?'checked':''} onchange="kamis20EnableEquipment(this.checked)"> Dopasowuj przepisy do mojego sprzętu</label>${restricted?`<div class="v20-equipment-grid">${equipOptions.map(([key,txt])=>`<button type="button" class="v20-equipment-chip ${selected().includes(key)?'on':''}" aria-pressed="${selected().includes(key)}" onclick="kamis20Device('${key}')">${selected().includes(key)?'✓ ':''}${txt}</button>`).join('')}</div><p class="muted">Dostaniesz przepisy możliwe do przygotowania na wybranym sprzęcie. Jeśli niczego nie zaznaczysz, pokażemy potrawy bez urządzeń grzewczych. Nóż, deska i miska są traktowane jako podstawowe przybory.</p><div class="v20-example"><b>Przykładowa liczba dostępnych dań:</b> ${recipes.filter(r=>matches(r)).length} (przy obecnych wykluczeniach i limicie czasu)</div>`:'<p class="muted">Bez ograniczenia sprzętowego. Każdy przepis nadal pokazuje wymagane urządzenia.</p>'}</section>`}
window.kamis20EnableEquipment=v=>{cfg.limitDevices=!!v;persist();render()};
window.kamis20Device=id=>{if(!equipOptions.some(([v])=>v===id))return;cfg.limitDevices=true;cfg.devices=selected().includes(id)?selected().filter(v=>v!==id):[...selected(),id];persist();render()};
function replaceDevices(html){const el=document.createElement('div');el.innerHTML=html;const old=[...el.querySelectorAll('.v63-settings')].find(x=>x.querySelector('h3')?.textContent?.includes('Wyposażenie kuchni'));if(old)old.outerHTML=devicePanel();return el.innerHTML}
// Same 5 planner steps, only equipment picker is improved.
wizard=function(){return replaceDevices(previous.wizard())};
const releaseNotes=`<section class="v20-release"><div class="v20-kicker">AKTUALNA WERSJA • 2.0</div><h2>Co nowego w Kamiś 2.0?</h2><p>1000 przepisów, sprzęt dopasowany do całego sposobu przygotowania, prostsza nawigacja, szybkie wyszukiwanie i przenoszenie dań między dniami.</p></section>`;
home=function(){const count=recipes.length;const last=state.recent.map(get).filter(Boolean).slice(0,4);return `<section class="v20-hero"><div><span class="v20-kicker">TWÓJ KUCHARZ W KIESZENI</span><h1>Co dziś ugotujemy? 🌿</h1><p>Wybierz dni, ulubione smaki i to, co masz w kuchni. Kamiś przygotuje jadłospis i listę zakupów.</p><div class="actions"><button class="btn v20-main-cta" onclick="setPage('wizard')">✨ Ułóż jadłospis</button><button class="btn alt" onclick="setPage('recipes')">🔎 Znajdź przepis</button></div></div><div class="v20-hero-badge"><b>${count}</b><small>przepisów</small></div></section>${data.plan?`<section class="v20-current"><div><span>Twój ostatni jadłospis</span><h3>${data.plan.entries.length} dni · ${data.plan.entries.reduce((s,x)=>s+x.ids.length,0)} posiłków</h3></div><button class="btn" onclick="setPage('plan')">Otwórz plan →</button></section>`:''}<section class="v20-shortcuts"><h2>Na skróty</h2><div class="v20-shortcut-grid"><button onclick="kamis20Fast()"><b>⏱️ Nie mam czasu</b><small>Szybkie dania</small></button><button onclick="setPage('fridge')"><b>🥕 Mam w lodówce</b><small>Gotuj z tego, co masz</small></button><button onclick="setPage('favorites')"><b>❤️ Ulubione</b><small>Twoje zapisane przepisy</small></button><button onclick="setPage('nutrition63')"><b>🍳 Mój sprzęt i ustawienia</b><small>Dopasuj swoją kuchnię</small></button><button onclick="setPage('budget62')"><b>💰 Oszczędzaj</b><small>Sprawdź tańsze zamienniki</small></button><button onclick="setPage('shopping')"><b>🛒 Zakupy</b><small>Lista z jadłospisu</small></button></div></section>${last.length?`<section class="panel"><h2>Ostatnio oglądane</h2><div class="v20-recent">${last.map(r=>`<button onclick="showRecipe(${r.id})"><img src="${r.image}" alt="Ilustracja potrawy"><span>${escape(r.name)}</span></button>`).join('')}</div></section>`:''}${releaseNotes}`};
// Four persistent tabs; secondary features remain available through Start and settings.
tabs=function(){const nav=[['home','⌂','Start'],['wizard','▦','Planuj'],['recipes','♨','Przepisy'],['shopping','☷','Zakupy']];$('tabs').innerHTML=nav.map(([p,ico,txt])=>`<button class="v20-navbtn ${page===p||(p==='wizard'&&['plan','summary'].includes(page))?'active':''}" onclick="setPage('${p}')"><span aria-hidden="true">${ico}</span><b>${txt}</b></button>`).join('')};
const keywords=r=>[r.name,...r.ingredients.map(x=>x[0]),...required(r).map(devText)].join(' ').toLocaleLowerCase('pl');
const easy=r=>r.steps.length<=6&&duration(r)<=25;
function listFiltered(){let xs=recipes.filter(r=>(filter==='Wszystkie'||r.meal===filter)&&matches(r)&&keywords(r).includes(search.toLocaleLowerCase('pl').trim())&&(!window.kamis63MatchesMacro||window.kamis63MatchesMacro(r)));
 if(state.quick==='meat')xs=xs.filter(r=>r.kind==='chicken'||r.kind==='beef'||r.kind==='pork'||/(kurczak|indyka|szynka|wołowina|wieprzowina|boczek)/i.test(r.name));
 if(state.quick==='fast')xs=xs.filter(r=>duration(r)<=20);
 if(state.quick==='simple')xs=xs.filter(easy);
 if(state.quick==='budget')xs.sort((a,b)=>cost(a)-cost(b));
 else if(state.quick==='fast')xs.sort((a,b)=>duration(a)-duration(b));
 return xs;
}
const eqSummary=()=>!cfg.limitDevices?'Dowolny sprzęt':selected().length?selected().map(devText).join(' + '):'Bez urządzeń';
const quickNames=[['any','Wszystkie'],['meat','🥩 Mięsne'],['fast','⏱️ Do 20 min'],['simple','👌 Łatwe'],['budget','💰 Tanie']];
const categories=['Wszystkie',...mealOrder];
function v20Card(r){const fav=(data.favorites||[]).includes(r.id);return `<article class="v20-recipe-card"><button class="v20-image-button" onclick="showRecipe(${r.id})"><img loading="lazy" src="${r.image}" alt="Ilustracja składników potrawy"></button><div class="v20-cardbody"><div class="v20-tags"><span>${r.meal}</span><span>⏱ ${duration(r)} min</span>${required(r).length?`<span>${required(r).map(devText).join(' + ')}</span>`:'<span>Bez gotowania</span>'}</div><h3>${escape(r.name)}</h3><p>${r.ingredients.slice(0,3).map(x=>escape(x[0])).join(' · ')}</p><div class="v20-cardactions"><button class="btn" onclick="showRecipe(${r.id})">Przepis →</button><button class="btn alt" title="${fav?'Usuń z ulubionych':'Dodaj do ulubionych'}" onclick="kamisFavorite(${r.id})">${fav?'♥':'♡'}</button></div></div></article>`}
function gridHtml(xs){const total=xs.length,display=xs.slice(0,state.maxResults);return `<div id="recipeGrid" class="v20-recipes-grid">${display.map(v20Card).join('')||'<p class="notice">Brak wyników dla tej kombinacji filtrów. Spróbuj innego rodzaju posiłku, czasu lub składnika.</p>'}</div>${total>display.length?`<div class="actions"><button class="btn alt" onclick="kamis20More()">Pokaż kolejne (${total-display.length})</button></div>`:''}`}
const searchControl=()=>`<input id="searchBox" type="search" placeholder="Np. kurczak, air fryer, maliny…" value="${escape(search)}" oninput="kamis20Search(this.value)">`;
function swapView20(){const entry=data.plan?.entries.find(e=>e.day===swapTarget.day);const original=get(entry?.ids[swapTarget.index]);if(!original)return '<section class="panel">Nie znaleziono posiłku do zamiany.</section>';
 const pool=recipes.filter(r=>r.meal===original.meal&&r.id!==original.id&&matches(r));const remain=num(data.plan.budget)-(typeof planCost==='function'?num(planCost()):0)+cost(original);pool.sort((a,b)=>{
 const sa=(data.favorites||[]).includes(a.id)?20:0,sb=(data.favorites||[]).includes(b.id)?20:0;
 return (sb+num(data.ratings?.[b.id])*3-Math.max(0,cost(b)-remain)*2)-(sa+num(data.ratings?.[a.id])*3-Math.max(0,cost(a)-remain)*2);
 });
 const items=pool.slice(0,Math.min(state.maxResults,90));return `<section class="panel v20-recipes"><h2>🔄 Zmień tylko ten posiłek</h2><p>Zamieniasz <b>${escape(original.name)}</b> (${DAYS[swapTarget.day]}). Pozostałe dania w planie zostają bez zmian.</p><p class="notice">Propozycje uwzględniają wykluczenia, sprzęt i czas. Koszty są orientacyjne.</p><div class="v20-recipes-grid">${items.map(r=>`<article class="v20-recipe-card"><img class="food" src="${r.image}" alt="Ilustracja składników"><div class="v20-cardbody"><h3>${escape(r.name)}</h3><p>${duration(r)} min · ~${money(cost(r))}</p><div class="v20-cardactions"><button class="btn" onclick="doSwap(${r.id})">Wybierz</button><button class="btn alt" onclick="showRecipe(${r.id})">Przepis</button></div></div></article>`).join('')||'<p>Brak zgodnych dań. Spróbuj zmienić czas lub wykluczenia, ale sprzętu nie pomijam.</p>'}</div>${pool.length>items.length?`<button class="btn alt" onclick="kamis20More()">Pokaż więcej</button>`:''}</section>`;
}
recipesView=function(){if(swapTarget)return swapView20();const xs=listFiltered();return `<section class="panel v20-recipes"><div class="v20-titleline"><div><div class="v20-kicker">BIBLIOTEKA KAMIŚ</div><h2>Przepisy <span class="v20-total">${xs.length}</span></h2></div><button class="btn alt" onclick="setPage('nutrition63')">⚙️ Sprzęt</button></div><p class="muted">Pokażemy tylko dania zgodne z wykluczeniami, czasem i wybranym wyposażeniem. Obrazy to ilustracje, nie fotografie.</p><div class="v20-search">${searchControl()}</div><div class="v20-chips">${categories.map(m=>`<button class="chip ${filter===m?'selected':''}" onclick="kamis20Category('${m}')">${m}</button>`).join('')}</div><div class="v20-chips">${quickNames.map(([k,l])=>`<button class="chip ${state.quick===k?'selected':''}" onclick="kamis20Quick('${k}')">${l}</button>`).join('')}</div><div class="v20-refine"><label>Maks. czas <select onchange="kamisTimeFilter(this.value)">${[0,15,30,45,60,90,120].map(x=>`<option value="${x}" ${num(data.timeFilter)===x?'selected':''}>${x?x+' min':'Dowolny'}</option>`).join('')}</select></label><span>🍳 ${escape(eqSummary())}</span></div>${gridHtml(xs)}</section>`};
window.kamis20Search=s=>{search=s;state.maxResults=36;const list=listFiltered();const target=document.getElementById('recipeGrid');if(target){target.innerHTML=list.slice(0,state.maxResults).map(v20Card).join('')||'<p class="notice">Brak wyników dla tych filtrów.</p>';const more=target.nextElementSibling;if(more?.classList.contains('actions'))more.style.display=list.length>state.maxResults?'':'none';}const title=document.querySelector('.v20-total');if(title)title.textContent=String(list.length)};
window.kamis20Category=k=>{filter=k;state.maxResults=36;render()};
window.kamis20Quick=k=>{state.quick=k;state.maxResults=36;persist();render()};
window.kamis20More=()=>{state.maxResults=Math.min(1200,state.maxResults+48);render()};
window.kamis20Fast=()=>{state.quick='fast';filter='Wszystkie';search='';setPage('recipes')};
// Existing detailed recipe, macro panel, ratings and cooking mode are retained.
detailedSteps=function(r){return r.v20family?r.steps:previous.detailedSteps(r)};
showRecipe=function(id){previous.showRecipe(id);const r=get(id);if(!r)return;state.recent=[r.id,...state.recent.filter(x=>x!==r.id)].slice(0,16);persist();const dialog=document.getElementById('dialogBody');if(!dialog)return;const d=required(r);const equip=`<section class="v20-recipeequipment"><b>Sprzęt:</b> ${d.length?d.map(devText).join(', '):'Tylko podstawowe przybory, bez gotowania'} <span class="pill">${duration(r)} min</span><p class="muted">Przed rozpoczęciem sprawdź sprzęt i instrukcję każdego etapu; czas zależy od urządzenia i ilości porcji.</p>${data.plan?`<div class="v20-add"><label>Dodaj lub zamień w planie <select id="v20AddDay"><option value="">Wybierz dzień…</option>${data.plan.entries.map(e=>`<option value="${e.day}">${DAYS[e.day]}</option>`).join('')}</select></label><button class="btn" onclick="kamis20AddToPlan(${r.id})">Dodaj do planu</button></div>`:''}</section>`;dialog.insertAdjacentHTML('afterbegin',equip);};
window.kamis20AddToPlan=id=>{const r=get(id);if(!r||!data.plan)return;const day=num(document.getElementById('v20AddDay')?.value);const selectedValue=document.getElementById('v20AddDay')?.value;if(!selectedValue)return alert('Najpierw wybierz dzień.');if(!allowed(r)||!equipOK(r))return alert('Danie nie pasuje do wykluczeń lub posiadanego sprzętu.');const entry=data.plan.entries.find(e=>e.day===day);if(!entry)return;const exists=entry.ids.findIndex(x=>get(x)?.meal===r.meal);if(exists>=0){if(!confirm(`Zamienić ${r.meal.toLowerCase()} w ${DAYS[day]} na „${r.name}”?`))return;entry.ids[exists]=id;}else{if(entry.ids.length>=5)return alert('Ten dzień ma już pięć rodzajów posiłków. Zastąp istniejący posiłek.');entry.ids.push(id);entry.ids.sort((a,b)=>mealOrder.indexOf(get(a)?.meal)-mealOrder.indexOf(get(b)?.meal));entry.portionFactors=entry.ids.map(()=>1);}data.plan.mealSelection64=data.plan.mealSelection64||{};data.plan.mealSelection64[day]=entry.ids.map(x=>get(x)?.meal);data.checked={};persist();document.getElementById('recipeDialog').close();setPage('plan');};
// Enforce equipment even on intelligent swaps from existing code.
doSwap=function(id){const r=get(id);if(!r||!equipOK(r))return alert('Ten zamiennik wymaga urządzeń, których nie zaznaczono w ustawieniach.');previous.doSwap(id)};
// Keep generated meal slots exactly as chosen on each day. No device-incompatible fallbacks.
function pick(meal,used,room){let xs=recipes.filter(r=>r.meal===meal&&matches(r));if(!xs.length)return null;
 let available=xs.filter(r=>!used.has(r.id));if(!available.length)available=xs;
 const goal=data.mode||'balanced';const rank=r=>{
 const p=r.protein||0, kcal=r.calories||0;let score=(data.favorites||[]).includes(r.id)?22:0;
 score+=num(data.ratings?.[r.id])*3;
 if(goal==='protein')score+=p*.9;
 if(goal==='quick')score-=duration(r);
 if(goal==='budget')score-=cost(r)*3;
 if(goal==='vegetables')score+=r.ingredients.filter(i=>/papryka|pomidor|brokuł|ogórek|marchew|sałata|cukinia|szpinak|burak/i.test(i[0])).length*7;
 if(goal==='variety')score+=used.has(r.id)?-25:8;
 if(goal==='carbs')score+=Math.min(40,kcal/20);
 if(room&&cost(r)>room)score-=Math.min(45,(cost(r)-room)*2);
 return score+Math.random()*12;
 };available.sort((a,b)=>rank(b)-rank(a));return available[Math.floor(Math.random()*Math.min(5,available.length))];}
generate=function(){const days=[...data.days].sort((a,b)=>a-b);if(!days.length){alert('Wybierz przynajmniej jeden dzień.');return}
 const selectedSlots=days.map(day=>[day,selections(day)]);const slots=selectedSlots.flatMap(([,list])=>list);
 const impossible=[...new Set(slots)].filter(meal=>!recipes.some(r=>r.meal===meal&&matches(r)));
 if(impossible.length){alert('Nie znalazłam pasujących przepisów dla: '+impossible.join(', ')+'. Sprawdź wykluczenia i limit czasu w ustawieniach; nie proponuję dań wymagających innego sprzętu.');return}
 const entries=[],used=new Set();let room=num(data.budget),left=slots.length;
 for(const [day,meals] of selectedSlots){const ids=[];for(const meal of meals){const r=pick(meal,used,room/Math.max(1,left));if(!r)continue;ids.push(r.id);used.add(r.id);room-=cost(r)*(num(data.people)||1);left--;}
 entries.push({day,ids,portionFactors:ids.map(()=>1)});}
 const targets={};if(cfg.planning==='advanced')for(const k of ['kcal','p','f','c']){const v=num(cfg.targets?.[k]);if(v>0)targets[k]=v;}
 const personalized=cfg.planning==='advanced'&&Object.keys(targets).length>0;
 if(personalized){const db=window.kamis62Data;for(const e of entries){let factors=e.ids.map(()=>1);for(let repeat=0;repeat<2;repeat++){const n=e.ids.map(id=>db?.nutrition(get(id))||{kcal:0,p:0,f:0,c:0});const total=k=>n.reduce((s,x,i)=>s+num(x[k])*factors[i],0);const desired=Object.keys(targets);for(let i=0;i<factors.length;i++){let best=factors[i],error=Infinity;for(const mul of [.85,.9,1,1.1,1.2,1.3,1.35]){factors[i]=mul;const err=desired.reduce((s,k)=>s+Math.pow(Math.log((total(k)+1)/(targets[k]+1)),2),0)+.16*Math.abs(mul-1);if(err<error){error=err;best=mul}}factors[i]=best;}}e.portionFactors=factors;}}
 data.plan={entries,created:new Date().toISOString(),mode:data.mode,people:data.people,budget:data.budget,personalized,targets63:targets,mode63:cfg.planning,mealSelection64:Object.fromEntries(entries.map(e=>[e.day,e.ids.map(id=>get(id)?.meal)]))};
 data.checked={};persist();page='plan';render();window.scrollTo(0,0);
};
function movePanel(){if(!data.plan||data.plan.entries.length<2)return '';
 const rows=data.plan.entries.flatMap(e=>e.ids.map((id,i)=>({day:e.day,i,r:get(id)}))).filter(x=>x.r);
 return `<section class="panel v20-mover"><h2>↔ Przenieś posiłek między dniami</h2><p class="muted">Wybierz posiłek i dzień docelowy. Jeśli dany rodzaj posiłku już jest w docelowym dniu, dania zamienią się miejscami.</p><div class="v20-movegrid"><label>Posiłek <select id="v20MoveSource">${rows.map(o=>`<option value="${o.day}:${o.i}">${DAYS[o.day]} · ${o.r.meal} · ${escape(o.r.name)}</option>`).join('')}</select></label><label>Docelowy dzień <select id="v20MoveDay">${data.plan.entries.map(o=>`<option value="${o.day}">${DAYS[o.day]}</option>`).join('')}</select></label></div><button class="btn" onclick="kamis20Move()">Przenieś lub zamień</button></section>`}
window.kamis20Move=()=>{if(!data.plan)return;const a=(document.getElementById('v20MoveSource')?.value||'').split(':').map(Number),to=Number(document.getElementById('v20MoveDay')?.value);const source=data.plan.entries.find(x=>x.day===a[0]),target=data.plan.entries.find(x=>x.day===to);if(!source||!target||source===target)return alert('Wybierz inny dzień docelowy.');const id=source.ids[a[1]],r=get(id);if(!r)return;const index=target.ids.findIndex(x=>get(x)?.meal===r.meal);if(index<0&&target.ids.length>=5)return alert('W tym dniu jest już pięć posiłków.');if(!confirm('Zastosować zmianę w aktualnym planie?'))return;
 if(index>=0){source.ids[a[1]]=target.ids[index];target.ids[index]=id;}else{source.ids.splice(a[1],1);target.ids.push(id);target.ids.sort((a,b)=>mealOrder.indexOf(get(a)?.meal)-mealOrder.indexOf(get(b)?.meal));}
 for(const e of [source,target]){e.portionFactors=e.ids.map(()=>1);data.plan.mealSelection64[e.day]=e.ids.map(x=>get(x)?.meal);}
 data.checked={};persist();render()};
planView=function(){return previous.planView()+movePanel()};
// Only current release information. Old release notes remain in old modules, hidden in new Home.
const renderOld=previous.render;
render=function(){renderOld();const stepLabel=document.querySelector('#content .step');if(stepLabel&&/KAMIŚ 6\./.test(stepLabel.textContent))stepLabel.textContent='KAMIŚ 2.0';for(const el of document.querySelectorAll('#content .v63-settings')){if(el.querySelector('h3')?.textContent?.includes('Wyposażenie kuchni'))el.outerHTML=devicePanel()}
 const nav=document.querySelector('#tabs');if(nav)tabs();
 const head=document.getElementById('count');if(head)head.textContent=`${recipes.length} przepisów · 2.0`;
 const settingsBtn=document.getElementById('v20SettingsBtn');if(settingsBtn)settingsBtn.style.display=page==='nutrition63'?'none':'inline-flex';
};
window.kamis20CheckUpdate=async()=>{if(!('serviceWorker'in navigator)){alert('Ta przeglądarka nie obsługuje aktualizacji PWA.');return}try{const reg=await navigator.serviceWorker.getRegistration();if(reg){await reg.update();alert('Sprawdzono aktualizację. Zamknij i ponownie otwórz aplikację, aby użyć opublikowanej wersji.')}else alert('Uruchom stronę przez HTTPS i zainstaluj aplikację.') }catch{alert('Nie udało się sprawdzić aktualizacji. Spróbuj po połączeniu z internetem.')}};
window.kamis20Required=required;window.kamis20EquipmentOK=equipOK;window.kamis20CurrentVersion='2.0';
render();
})();
