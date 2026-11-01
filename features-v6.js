/* Kamiś 6.0 — sześć dodatków. Baza danych i kod Kamiś 5.0 pozostają nietknięte. */
(() => {
'use strict';
const base = {
  render, tabs, home, card, showRecipe, recipesView, updateRecipes,
  showAllRecipes, planView, swap, doSwap, goBack
};
const mealNames=['Śniadanie','Obiad','Kolacja','Przekąska','Deser'];
let showAll=false;
let pantryDraft='';
let batchPreview=null;
let cooking={id:null,step:0,origin:'recipes',remaining:0,end:0,running:false,interval:null};
if(!Array.isArray(data.favorites)) data.favorites=[];
if(!data.ratings || typeof data.ratings!=='object' || Array.isArray(data.ratings)) data.ratings={};
if(!Array.isArray(data.pantryItems)) data.pantryItems=[];
if(!Number.isFinite(+data.timeFilter)) data.timeFilter=0;
if(![2,3].includes(+data.mealprepDays)) data.mealprepDays=2;

const get=id=>recipes.find(r=>r.id===Number(id));
const fav=r=>data.favorites.includes(r.id);
const rating=r=>Math.min(5,Math.max(0,Number(data.ratings[r.id]||0)));
const toMoney=n=>money(Number(n)||0);
const minutes=r=>{
  if(Number(r.minutes)>0)return Number(r.minutes);
  const t=r.steps.join(' ').toLowerCase(), hits=[...t.matchAll(/(\d+)\s*(?:[-–]\s*(\d+))?\s*(?:minut(?:y|ę)?|min\b)/g)];
  const instruction=hits.reduce((s,m)=>s+Number(m[2]||m[1]),0);
  const baseTime={'Śniadanie':20,'Obiad':40,'Kolacja':25,'Przekąska':10,'Deser':25}[r.meal]||30;
  return Math.min(150,Math.max(baseTime,instruction+8));
};
const timeOK=r=>!Number(data.timeFilter)||minutes(r)<=Number(data.timeFilter);
const recipeOK=r=>allowed(r)&&timeOK(r);
const matched=r=>!search.trim() || [r.name,...r.ingredients.map(x=>x[0])].join(' ').toLocaleLowerCase('pl').includes(search.toLocaleLowerCase('pl').trim());
const modeScore=(r,mode)=>{
  if(mode==='protein')return r.protein*.8+100*(r.protein/Math.max(r.calories,1));
  if(mode==='gym')return r.protein*.9+Math.min(20,r.calories/75);
  if(mode==='low')return -r.calories/17 + r.protein/5;
  return -Math.abs(r.calories-(['Obiad'].includes(r.meal)?650:400))/75+r.protein*.18;
};
const bonus=r=>(fav(r)?18:0)+rating(r)*3;
const timeOptions=()=>[0,15,30,45,60,90,120].map(n=>`<option value="${n}" ${Number(data.timeFilter)===n?'selected':''}>${n?`do ${n} min`:'Dowolny czas'}</option>`).join('');
const timePicker=()=>`<label class="v6-time">⏱️ Maksymalny czas przygotowania <select aria-label="Czas przygotowania" onchange="kamisTimeFilter(this.value)">${timeOptions()}</select></label>`;
const favButton=r=>`<button class="btn alt v6-mini" aria-label="${fav(r)?'Usuń z ulubionych':'Dodaj do ulubionych'}" onclick="kamisFavorite(${r.id})">${fav(r)?'❤️ Ulubione':'♡ Ulubione'}</button>`;
const cookButton=r=>`<button class="btn alt v6-mini" onclick="kamisCook(${r.id})">👩‍🍳 Gotuj krok po kroku</button>`;
const smallCardAdd=r=>`<div class="v6-cardactions">${favButton(r)}${cookButton(r)}<span class="v6-small">⏱️ ~${minutes(r)} min ${rating(r)?`· ⭐ ${rating(r)}/5`:''}</span></div>`;
const controlPanel=(heading='Szukaj przepisu')=>`<div class="v6-filter"><label class="field"><span>${heading}</span><input type="text" id="searchBox" placeholder="Nazwa potrawy lub składnik…" value="${esc(search)}" oninput="kamisSearch(this.value)"></label>${timePicker()}</div>`;
const tabsFilter=()=>`<div class="chips" style="margin:12px 0">${['Wszystkie',...mealNames].map(f=>`<button class="chip ${filter===f?'selected':''}" onclick="kamisCategory('${f}')">${f}</button>`).join('')}</div>`;
const fullFilter=r=>recipeOK(r)&&(filter==='Wszystkie'||r.meal===filter)&&matched(r);
function displayRecipeGrid(list){return `<div id="recipeGrid" class="grid">${list.slice(0,showAll?list.length:48).map(r=>card(r)).join('')||'<p>Brak wyników dla tych filtrów.</p>'}</div>${list.length>48&&!showAll?`<div class="actions">${btn('Pokaż więcej ('+(list.length-48)+')','showAllRecipes()','btn alt')}</div>`:''}`}

// Wszystkie istniejące zakładki i strony zostają; dodajemy tylko nowe.
tabs=function(){
  base.tabs();
  const ext=[['fridge','🥕 Moja lodówka'],['mealprep','🍱 Na kilka dni'],['favorites','❤️ Ulubione']];
  $('tabs').insertAdjacentHTML('beforeend',ext.map(([p,n])=>`<button class="tab ${page===p?'active':''}" onclick="setPage('${p}')">${n}</button>`).join(''));
  if(page==='cook') $('tabs').insertAdjacentHTML('beforeend','<span class="tab active" aria-current="page">👩‍🍳 Tryb gotowania</span>');
};
home=function(){return base.home()+`<section class="panel v6-home"><h2>Nowe w Kamiś 6.0</h2><div class="grid"><div class="v6-feature"><h3>🥕 Co mam w lodówce?</h3><p class="muted">Znajdź przepisy na podstawie dostępnych składników.</p>${btn('Sprawdź lodówkę',"setPage('fridge')",'btn alt')}</div><div class="v6-feature"><h3>🍱 Gotuj na 2–3 dni</h3><p class="muted">Zaplanuj przygotowanie kilku porcji na kolejne dni.</p>${btn('Otwórz planer',"setPage('mealprep')",'btn alt')}</div><div class="v6-feature"><h3>❤️ Ulubione przepisy</h3><p class="muted">Oceny i zapisane dania w jednym miejscu.</p>${btn('Zobacz ulubione',"setPage('favorites')",'btn alt')}</div></div></section>`};
card=function(r,actions=true){const original=base.card(r,actions);const position=original.lastIndexOf('</div></article>');return position===-1?original:original.slice(0,position)+smallCardAdd(r)+original.slice(position)};
showRecipe=function(id){base.showRecipe(id);const r=get(id);if(!r)return;const stars=[1,2,3,4,5].map(n=>`<button class="v6-star ${rating(r)===n?'selected':''}" aria-label="Oceń ${n} z 5" onclick="kamisRate(${r.id},${n})">${n} ★</button>`).join('');$('dialogBody').insertAdjacentHTML('beforeend',`<section class="v6-recipeextras"><h3>Twoja ocena przepisu</h3><div class="v6-stars">${stars}</div><div class="actions">${favButton(r)}${cookButton(r)}</div><p class="muted">⏱️ Szacowany czas przygotowania: około ${minutes(r)} minut.</p></section>`)};
planView=function(){if(!data.plan)return `<section class="panel"><h2>Twój jadłospis</h2><p>Najpierw wygeneruj jadłospis.</p>${btn('Zaplanuj',"setPage('wizard')")}</section>`;return base.planView().replace('</section>',`<div class="actions v6-extraactions">${btn('🍱 Gotowanie na 2–3 dni',"setPage('mealprep')",'btn alt')}</div><p class="muted">Przycisk „Zmień” proponuje zamienniki z uwzględnieniem trybu planu, budżetu, wykluczeń i czasu przygotowania.</p></section>`)};

// Inteligentne zamiany: ten sam rodzaj posiłku, bez wykluczonych składników,
// z oceną budżetu, parametrów potrawy, czasu oraz własnych ulubionych.
function candidates(){
  if(!swapTarget || !data.plan)return [];
  const entry=data.plan.entries.find(e=>e.day===swapTarget.day), current=get(entry?.ids[swapTarget.index]);
  if(!current)return [];
  const otherIds=new Set(data.plan.entries.flatMap(e=>e.ids));
  const planMode=data.plan.mode||data.mode;
  const room=(Number(data.plan.budget)||0)-planCost()+price(current);
  return recipes.filter(r=>r.meal===current.meal&&r.id!==current.id&&recipeOK(r)&&matched(r)).map(r=>{
    const estimated=price(r), over=Math.max(0,estimated-room);
    const score=modeScore(r,planMode)*1.3+bonus(r)-(otherIds.has(r.id)?26:0)-over*1.7-Math.abs(estimated-price(current))*.12;
    return {r,score,over,estimated};
  }).sort((a,b)=>b.score-a.score);
}
function swapView(){
  const e=data.plan?.entries.find(e=>e.day===swapTarget.day), current=get(e?.ids[swapTarget.index]);
  if(!current)return '<section class="panel"><p>Nie znaleziono posiłku do zmiany.</p></section>';
  const candidatesList=candidates();const planMode=({protein:'dużo białka',gym:'siłownia',low:'lżejsze potrawy',balanced:'zbilansowane'}[data.plan.mode||data.mode]);
  return `<section class="panel"><h2>🔄 Inteligentna zamiana posiłku</h2><p>Wymieniasz <b>${esc(current.name)}</b> (${current.meal}) z dnia <b>${DAYS[swapTarget.day]}</b>.</p><p class="notice">Dobieram tylko ${current.meal.toLowerCase()}: cel „${planMode}”, wykluczenia, orientacyjny budżet oraz dostępny czas. Zmieni się tylko wskazany posiłek.</p>${controlPanel('Znajdź zamiennik')}<p class="muted" id="swapCount">${candidatesList.length} zgodnych propozycji · pierwsze są najlepiej dopasowane.</p>${swapGrid(candidatesList)}</section>`;
}
function swapGrid(list){return `<div id="recipeGrid" class="grid">${list.slice(0,showAll?list.length:36).map(({r,over})=>`<article class="card"><img class="food" loading="lazy" src="${r.image}" alt="Zdjęcie poglądowe" onerror="this.style.display='none'"><div class="inside"><h3>${esc(r.name)}</h3><p class="muted">${r.meal} · ~${r.calories} kcal · ~${r.protein} g białka · ~${minutes(r)} min</p><p class="price">~${toMoney(price(r))}</p>${over>0?`<p class="v6-warning">Może przekroczyć budżet o ~${toMoney(over)}</p>`:'<p class="v6-success">✓ Mieści się w pozostałym budżecie (szacunek)</p>'}<div class="actions">${btn('Wybierz zamiennik',`doSwap(${r.id})`)}${btn('Przepis',`showRecipe(${r.id})`,'btn alt')}${favButton(r)}</div></div></article>`).join('')||'<p>Brak zamienników przy aktualnych filtrach. Zwiększ czas albo zmień wykluczenia.</p>'}</div>${list.length>36&&!showAll?`<div class="actions">${btn('Pokaż wszystkie propozycje','showAllRecipes()','btn alt')}</div>`:''}`}
swap=function(day,index){
  if(!data.plan)return;
  const e=data.plan.entries.find(e=>e.day===day),r=get(e?.ids[index]);if(!r)return;
  swapTarget={day,index};page='recipes';filter=r.meal;search='';showAll=false;
  render();window.scrollTo(0,0);
};
doSwap=function(id){
  if(!swapTarget||!data.plan)return;
  const e=data.plan.entries.find(e=>e.day===swapTarget.day),before=get(e?.ids[swapTarget.index]),after=get(id);
  if(!e||!before||!after||before.meal!==after.meal||!allowed(after)||!timeOK(after)){alert('Ten zamiennik nie spełnia wybranych warunków.');return}
  e.ids[swapTarget.index]=after.id;persist();swapTarget=null;setPage('plan');
};
recipesView=function(){
  if(swapTarget)return swapView();
  const list=recipes.filter(fullFilter);
  return `<section class="panel"><h2>Baza przepisów (${list.length})</h2><p class="muted">Wszystkie wcześniejsze przepisy zostały zachowane. Zdjęcia są poglądowe. Czas przygotowania jest szacunkowy.</p>${controlPanel()}${tabsFilter()}${displayRecipeGrid(list)}</section>`;
};
updateRecipes=function(){
  const grid=$('recipeGrid');if(!grid)return;
  if(swapTarget){const list=candidates();const wrap=document.createElement('div');wrap.innerHTML=swapGrid(list);
    grid.innerHTML=wrap.querySelector('#recipeGrid')?.innerHTML||'<p>Brak dopasowanych zamienników.</p>';
    if($('swapCount'))$('swapCount').textContent=list.length+' zgodnych propozycji · pierwsze są najlepiej dopasowane.';
    return}
  const list=page==='favorites'?recipes.filter(r=>fav(r)&&recipeOK(r)&&matched(r)).sort((a,b)=>rating(b)-rating(a)):recipes.filter(fullFilter);
  grid.innerHTML=list.slice(0,showAll?list.length:48).map(r=>card(r)).join('')||'<p>Brak wyników.</p>';
};
showAllRecipes=function(){showAll=true;render()};

// Oceny 1–5 i ulubione używają tego samego lokalnego zapisu danych co dotychczas.
window.kamisFavorite=id=>{const r=get(id);if(!r)return;data.favorites=fav(r)?data.favorites.filter(x=>x!==r.id):[...data.favorites,r.id];persist();
  if($('recipeDialog').open){$('recipeDialog').close();showRecipe(id)}render()};
window.kamisRate=(id,val)=>{const r=get(id);if(!r)return;data.ratings[id]=Math.max(1,Math.min(5,Number(val)));persist();if($('recipeDialog').open){$('recipeDialog').close();showRecipe(id)}render()};
window.kamisCategory=f=>{filter=f;showAll=false;render()};
window.kamisTimeFilter=n=>{data.timeFilter=Math.max(0,Number(n)||0);persist();showAll=false;render()};
window.kamisSearch=s=>{search=s;showAll=false;updateRecipes()};
function favoritesView(){const list=recipes.filter(r=>fav(r)&&recipeOK(r)&&matched(r)).sort((a,b)=>rating(b)-rating(a));return `<section class="panel"><h2>❤️ Ulubione i oceny</h2><p class="muted">Zapisane na tym urządzeniu: ${data.favorites.length} ulubionych. Kliknij „Przepis”, aby ocenić danie od 1 do 5 gwiazdek.</p>${controlPanel('Szukaj w ulubionych')}${displayRecipeGrid(list)}</section>`}

// Lodówka: porównywanie nazw, bez zgadywania ilości lub szczegółowych alergenów.
function normalized(v){return String(v).toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
const synonyms=[
  ['kurczak','kurczaka','piers z kurczaka','filet z kurczaka'],['indyk','indyka','filet z indyka'],
  ['wolowina','wolowiny','wolowine'],['wieprzowina','wieprzowiny','schab'],
  ['jajko','jajka','jajek','jaja'],['pomidor','pomidory','pomidorki','passata'],
  ['ziemniak','ziemniaki','ziemniakow'],['pieczarka','pieczarki','grzyby'],
  ['ryz','ryzu','ryz basmati','ryz jasminowy'],['platki owsiane','owsianka','owsiane'],
  ['mleko','mleka'],['jogurt','jogurt naturalny','jogurt grecki'],
  ['ser','sery','gouda','cheddar','mozzarella'],['twarog','twarogu'],
  ['papryka','papryki'],['cebula','cebuli'],['czosnek','czosnku'],
  ['ogorek','ogorki','ogorka'],['makaron','makaronu'],['szpinak','szpinaku'],
  ['mieso mielone','mielone'],['salata','salaty'],['losos','lososia'],['banan','banana']
].map(a=>a.map(normalized));
function tokens(s){const stop=new Set(['z','ze','do','i','na','w','od','oraz','sos','sosie','maly','duzy','swiezy','naturalny','krojony','suszone','suszony','czerwona','zielona','biala','czarna','bez','dla']);return normalized(s).split(' ').filter(x=>x.length>=3&&!stop.has(x))}
function canonical(v){const n=normalized(v);const group=synonyms.find(s=>s.some(y=>n===y||n.includes(' '+y+' ')||n.startsWith(y+' ')||n.endsWith(' '+y)));return group?group[0]:n}
function ingredientsMatch(needed,available){const a=canonical(needed),b=canonical(available);if(a===b||a.includes(b+' ')||b.includes(a+' '))return true;const ta=tokens(a),tb=tokens(b);return ta.some(x=>tb.some(y=>x===y||(x.length>4&&y.length>4&&x.slice(0,5)===y.slice(0,5))))}
function pantryScore(r){const have=r.ingredients.filter(([n])=>data.pantryItems.some(p=>ingredientsMatch(n,p)));const missing=r.ingredients.filter(([n])=>!data.pantryItems.some(p=>ingredientsMatch(n,p)));return {r,have,missing,ratio:have.length/r.ingredients.length};}
function fridgeView(){const ranked=data.pantryItems.length?recipes.filter(recipeOK).map(pantryScore).filter(x=>x.have.length>0).sort((a,b)=>a.missing.length-b.missing.length||b.ratio-a.ratio||rating(b.r)-rating(a.r)).slice(0,36):[];
  return `<section class="panel"><h2>🥕 Co mam w lodówce?</h2><p>Wpisz składniki, które masz pod ręką. Kamiś wskaże potrawy, do których brakuje najmniej produktów.</p><label class="field"><span>Produkty oddziel przecinkiem, np. kurczak, ryż, papryka</span><input id="pantryInput" type="text" value="${esc(pantryDraft)}" oninput="kamisPantryDraft(this.value)" onkeydown="if(event.key==='Enter')kamisAddPantry()" placeholder="np. jajka, pomidor, ser…"></label><div class="actions">${btn('Dodaj składniki','kamisAddPantry()')}${btn('Wyczyść listę','kamisClearPantry()','btn alt')}</div><div class="chips" style="margin-top:14px">${data.pantryItems.map((s,i)=>`<button class="chip selected" onclick="kamisRemovePantry(${i})" aria-label="Usuń ${esc(s)}">${esc(s)} ×</button>`).join('')||'<span class="muted">Nie dodano jeszcze żadnych produktów.</span>'}</div><div class="v6-filter">${timePicker()}</div><p class="notice">Porównuję nazwy składników, nie ich gramaturę. Sprawdź ilości, alergeny i świeżość przed gotowaniem. Przepisy uwzględniają dotychczasowe wykluczenia.</p><h3>Propozycje (${ranked.length})</h3><div class="grid">${ranked.map(({r,have,missing})=>`<article class="card"><img class="food" src="${r.image}" alt="Zdjęcie poglądowe" loading="lazy" onerror="this.style.display='none'"><div class="inside"><h3>${esc(r.name)}</h3><span class="pill">Masz ${have.length} z ${r.ingredients.length} składników</span><p class="small">⏱️ ~${minutes(r)} min · ${r.meal}</p><p class="muted"><b>Do dokupienia:</b> ${missing.length?missing.map(x=>esc(x[0])).join(', '):'Brak według nazw składników'}</p><div class="actions">${btn('Przepis',`showRecipe(${r.id})`,'btn alt')}${cookButton(r)}${favButton(r)}</div></div></article>`).join('')||'<p class="muted">Dodaj składniki, aby zobaczyć propozycje. Jeśli nic nie pasuje, zmień produkty lub limit czasu.</p>'}</div></section>`;
}
window.kamisPantryDraft=v=>{pantryDraft=v};
window.kamisAddPantry=()=>{const el=$('pantryInput');const txt=el?el.value:pantryDraft;const names=txt.split(/[,;\n]+/).map(x=>x.trim().slice(0,55)).filter(Boolean);for(const n of names){if(!data.pantryItems.some(x=>normalized(x)===normalized(n)))data.pantryItems.push(n)}data.pantryItems=data.pantryItems.slice(0,50);pantryDraft='';persist();render()};
window.kamisRemovePantry=i=>{data.pantryItems.splice(i,1);persist();render()};
window.kamisClearPantry=()=>{if(!data.pantryItems.length)return;if(confirm('Wyczyścić listę produktów w lodówce?')){data.pantryItems=[];persist();render()}};

// Meal-prep: podgląd nie narusza dotychczasowego planu. Zmiana dopiero po potwierdzeniu.
function consecutiveGroups(entries,n){const groups=[];let run=[];for(const item of entries){if(run.length&&item.day!==run[run.length-1].day+1){for(let j=0;j<run.length;j+=n)if(run.slice(j,j+n).length>1)groups.push(run.slice(j,j+n));run=[]}run.push(item)}for(let j=0;j<run.length;j+=n)if(run.slice(j,j+n).length>1)groups.push(run.slice(j,j+n));return groups}
function prepEligible(r){return r&&allowed(r)&&['chicken','beef','pork','veg'].includes(r.kind)&&!/(sałatk|surow|tatar|sushi|carpaccio)/i.test(r.name)}
function createBatchPreview(){if(!data.plan)return null;const size=Number(data.mealprepDays)||2;const entries=data.plan.entries.map(e=>({day:e.day,ids:[...e.ids]}));const groups=consecutiveGroups(entries,size);const batches=[];
  for(const group of groups){for(const slot of [1,2]){const first=get(group[0].ids[slot]);if(!first)continue;let selected=prepEligible(first)?first:null;if(!selected){const options=recipes.filter(r=>r.meal===first.meal&&prepEligible(r));options.sort((a,b)=>modeScore(b,data.plan.mode||data.mode)-modeScore(a,data.plan.mode||data.mode));selected=options[0]}if(!selected)continue;
    for(const day of group){const target=entries.find(e=>e.day===day.day);target.ids[slot]=selected.id}
    batches.push({days:group.map(e=>e.day),id:selected.id,slot,servings:group.length*data.people});}}
  return {entries,batches,created:Date.now(),source:JSON.stringify(data.plan.entries)};
}
function mealprepView(){if(!data.plan)return `<section class="panel"><h2>🍱 Gotowanie na kilka dni</h2><p>Najpierw ułóż jadłospis; na jego podstawie przygotuję porcje obiadu i kolacji na 2 lub 3 kolejne dni.</p>${btn('Ułóż jadłospis',"setPage('wizard')")}</section>`;
  const preview=batchPreview;return `<section class="panel"><h2>🍱 Gotowanie na kilka dni</h2><p>Przygotuj za jednym razem obiad i kolację na kilka kolejnych dni. Śniadania, przekąski i desery pozostają bez zmian.</p><label class="field"><span>Na ile kolejnych dni?</span><select onchange="kamisBatchDays(this.value)"><option value="2" ${Number(data.mealprepDays)===2?'selected':''}>2 dni</option><option value="3" ${Number(data.mealprepDays)===3?'selected':''}>3 dni</option></select></label><div class="actions">${btn('Zaproponuj gotowanie','kamisBatchGenerate()')}${btn('Wróć do planu',"setPage('plan')",'btn alt')}</div><p class="notice">To tylko podgląd — Twój jadłospis nie zmieni się, dopóki nie zatwierdzisz propozycji. Grupowane są wyłącznie następujące po sobie wybrane dni, żeby nie planować długiego przechowywania jedzenia.</p>${preview?`<h3>Plan wspólnego gotowania</h3>${preview.batches.length?preview.batches.map(b=>{const r=get(b.id);return `<div class="v6-prepitem"><h3>${esc(r.name)}</h3><p class="muted">${r.meal} · ${b.days.map(x=>DAYS[x]).join(' + ')} · <b>${b.servings} porcji</b> łącznie</p><p>Przygotuj ${b.servings} porcji, podziel na szczelne pojemniki i oznacz dniami.</p><div class="actions">${btn('Przepis',`showRecipe(${r.id})`,'btn alt')}${cookButton(r)}</div></div>`}).join(''):`<p class="muted">W aktualnym planie nie ma co najmniej dwóch kolejnych dni. Wybierz sąsiadujące dni w planerze, by skorzystać z tej funkcji.</p>`}<div class="notice"><b>Bezpieczne przechowywanie:</b> Schłodź porcje możliwie szybko, włóż do lodówki w ciągu 2 godzin, przechowuj w temperaturze do 4°C. Większość ugotowanych dań z mięsem zużyj w 3–4 dni lub zamroź; odgrzewaj dokładnie. Ryż schładzaj szczególnie szybko.</div>${preview.batches.length?`<div class="actions">${btn('✓ Zastosuj do jadłospisu','kamisBatchApply()')}${btn('Odrzuć propozycję','kamisBatchDiscard()','btn alt')}</div>`:''}`:''}</section>`;
}
window.kamisBatchDays=n=>{data.mealprepDays=[2,3].includes(Number(n))?Number(n):2;batchPreview=null;persist();render()};
window.kamisBatchGenerate=()=>{batchPreview=createBatchPreview();render()};
window.kamisBatchDiscard=()=>{batchPreview=null;render()};
window.kamisBatchApply=()=>{
  if(!data.plan||!batchPreview||!batchPreview.batches.length)return;
  if(JSON.stringify(data.plan.entries)!==batchPreview.source){alert('Jadłospis zmienił się od wygenerowania propozycji. Przygotuj nową propozycję.');batchPreview=null;render();return}
  if(!confirm('Zastosować gotowanie na kilka dni? Zmienią się wyłącznie wskazane obiady i kolacje w bieżącym jadłospisie. Zapisane wcześniej plany pozostaną bez zmian.'))return;
  data.plan.entries=batchPreview.entries.map(e=>({day:e.day,ids:[...e.ids]}));
  data.checked={};persist();batchPreview=null;setPage('plan');
};

// Tryb gotowania z niezależnym minutnikiem, nie modyfikuje treści przepisu.
function cookSteps(){const r=get(cooking.id);return r?detailedSteps(r):[]}
function extractTimer(s){let m=s.match(/(\d+)\s*(?:[-–]\s*(\d+))?\s*(?:minut(?:y|ę)?|min\b)/i);return m?Number(m[2]||m[1])*60:5*60}
function cookingView(){const r=get(cooking.id);if(!r)return '<section class="panel"><h2>Tryb gotowania</h2><p>Wybierz przepis.</p></section>';const steps=cookSteps();const s=steps[Math.min(cooking.step,steps.length-1)]||'';return `<section class="panel v6-cook"><div class="row"><div><div class="step">TRYB GOTOWANIA</div><h2>${esc(r.name)}</h2></div><span class="pill">Krok ${cooking.step+1} z ${steps.length}</span></div><div class="v6-progress"><div style="width:${((cooking.step+1)/steps.length)*100}%"></div></div><p class="v6-instruction">${esc(s)}</p><div class="actions">${btn('← Poprzedni krok','kamisCookStep(-1)','btn alt')}${btn(cooking.step===steps.length-1?'✓ Zakończ gotowanie':'Następny krok →','kamisCookStep(1)')}</div><div class="v6-clock"><h3>⏱️ Minutnik</h3><div id="kamisTimerText" class="v6-clocktime" role="timer" aria-live="off">${formatSeconds(timerSeconds())}</div><div class="chips">${[1,3,5,10,15,30].map(n=>`<button class="chip" onclick="kamisTimerSet(${n})">${n} min</button>`).join('')}<button class="chip" onclick="kamisTimerSuggest()">Czas z kroku</button></div><div class="actions">${btn(cooking.running?'⏸ Pauza':'▶ Start','kamisTimerToggle()')}${btn('Reset','kamisTimerReset()','btn alt')}</div><p class="muted">Minutnik działa, gdy aplikacja jest otwarta. iOS może ograniczać działanie w tle — sprawdzaj czas także na zegarze.</p></div><div class="actions">${btn('Wróć do przepisu','kamisCookExit()','btn alt')}</div></section>`}
function timerSeconds(){return cooking.running?Math.max(0,Math.ceil((cooking.end-Date.now())/1000)):Math.max(0,cooking.remaining)}
function formatSeconds(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
function timerTick(){if(!cooking.running)return;if(Date.now()>=cooking.end){cooking.running=false;cooking.remaining=0;clearInterval(cooking.interval);cooking.interval=null;const el=$('kamisTimerText');if(el){el.textContent='00:00';el.classList.add('v6-done')}if(navigator.vibrate)navigator.vibrate([160,80,160]);alert('⏰ Minutnik zakończony!');return}const el=$('kamisTimerText');if(el)el.textContent=formatSeconds(timerSeconds())}
function timerStop(){if(cooking.interval){clearInterval(cooking.interval);cooking.interval=null}if(cooking.running){cooking.remaining=timerSeconds();cooking.running=false}}
window.kamisCook=id=>{if(!get(id))return;if($('recipeDialog').open)$('recipeDialog').close();timerStop();cooking={id:Number(id),step:0,origin:['cook','home'].includes(page)?'recipes':page,remaining:300,end:0,running:false,interval:null};page='cook';render();window.scrollTo(0,0)};
window.kamisCookStep=delta=>{const steps=cookSteps();if(delta===1&&cooking.step===steps.length-1){window.kamisCookExit();return}cooking.step=Math.max(0,Math.min(steps.length-1,cooking.step+delta));timerStop();cooking.remaining=extractTimer(steps[cooking.step]||'');render()};
window.kamisTimerSet=min=>{timerStop();cooking.remaining=Math.max(1,Math.min(180,Number(min)||5))*60;render()};
window.kamisTimerSuggest=()=>{timerStop();cooking.remaining=extractTimer(cookSteps()[cooking.step]||'');render()};
window.kamisTimerToggle=()=>{if(cooking.running){timerStop();render();return}if(timerSeconds()<=0)cooking.remaining=extractTimer(cookSteps()[cooking.step]||'');cooking.end=Date.now()+cooking.remaining*1000;cooking.running=true;cooking.interval=setInterval(timerTick,500);render()};
window.kamisTimerReset=()=>{timerStop();cooking.remaining=extractTimer(cookSteps()[cooking.step]||'');render()};
window.kamisCookExit=()=>{timerStop();const dest=cooking.origin;page=dest==='cook'?'recipes':dest;render();window.scrollTo(0,0)};

// Przejścia i nawigacja. Bazowych funkcji planowania, zakupów i zapisów nie dotykamy.
goBack=function(){if(page==='cook'){window.kamisCookExit();return}if(['fridge','mealprep','favorites'].includes(page)){setPage('home');return}base.goBack()};
render=function(){
  if(['fridge','mealprep','favorites','cook'].includes(page)){
    tabs();$('content').innerHTML=page==='fridge'?fridgeView():page==='mealprep'?mealprepView():page==='favorites'?favoritesView():cookingView();
  }else base.render();
};
// W szczególności nie zmieniamy KEY='kamis-v2', receptur, dni, wykluczeń i starych zapisów.
render();
})();
