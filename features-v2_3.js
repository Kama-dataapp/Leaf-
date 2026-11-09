/* Kamiś 2.3 — moduł addytywny: brak zmian w 1000 recepturach, ich identyfikatorach i kluczu kamis-v2. */
(()=>{'use strict';
const prev={home,render,shopping,planView,showRecipe,detailedSteps,goBack};
const state=(data.v23 && typeof data.v23==='object')?data.v23:(data.v23={});
if(!Array.isArray(state.pantry))state.pantry=[];
if(!state.cook || typeof state.cook!=='object')state.cook={id:null,idx:0,done:[]};
if(!Array.isArray(state.cook.done))state.cook.done=[];
const find=id=>recipes.find(r=>Number(r.id)===Number(id));
const lower=s=>String(s??'').toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
const safe=s=>esc(String(s??''));
const money23=n=>Number(n||0).toFixed(2).replace('.',',')+' zł';
const round=n=>Math.round((Number(n)||0)*10)/10;
const mealOrder=['Śniadanie','Obiad','Kolacja','Przekąska','Deser'];
let timer={running:false,until:0,remaining:0,handle:null};
const stopTimer=()=>{if(timer.handle)clearInterval(timer.handle);timer.handle=null;timer.running=false};
const deviceAllowed=r=>!window.kamis20EquipmentOK||window.kamis20EquipmentOK(r);
const canEat=r=>allowed(r)&&deviceAllowed(r);
function ingredientRef(name){
 const n=lower(name);
 const alias=[[/kurczak|kurczaka|kurcz/i,'kurcz'],[/indyk|indyka|indyc/i,'indyk'],[/wołowin|wolowin/i,'wolow'],[/wieprzow/i,'wieprz'],[/czosnek|czosnku/i,'czosn'],[/cebula|cebuli/i,'cebul'],[/jogurt/i,'jogurt'],[/cytryn/i,'cytryn'],[/limonk/i,'limonk'],[/zioła|ziół|koperek|natka|pietruszka/i,'zio'],[/płatki|płatków/i,'platk'],[/ziemniak/i,'ziemniak'],[/tortill/i,'tortill'],[/ser/i,'ser'],[/jajka|jajko|jajek/i,'jaj'],[/ryż|ryzu|ryżu/i,'ryz'],[/szpinak/i,'szpinak'],[/mleko|mleka/i,'mlek']];
 for(const [re,k] of alias)if(re.test(n))return k;
 return n.split(/\s+/).find(w=>w.length>=5)||n;
}
const meatWords=/\b(mięso|filet|filety|pierś|piers|kurczak|indyk|wołowina|wieprzowina)\b/i;
function stepIngredients(r,step){
 const s=lower(step);
 const m=[];
 for(const x of r.ingredients){
  const n=lower(x[0]),root=ingredientRef(x[0]);
  const aliases=[root,...n.split(/\W+/).filter(w=>w.length>=5).map(w=>w.slice(0,5))];
  let found=aliases.some(a=>a.length>=3 && s.includes(a));
  if(!found&&meatWords.test(step)&&/kurcz|indyk|wolow|wieprz|mieso|mięso|ryb|łoso|tunczyk/.test(n))found=true;
  if(!found&&/\b(jogurt|sos)\b/i.test(step)&&/jogurt/.test(n))found=true;
  if(!found&&/zioł|ziół|przypraw/i.test(step)&&/koperek|natka|oregano|zioła|bazylia|tymianek/.test(n))found=true;
  if(found && !m.some(y=>y[0]===x[0]))m.push(x);
 }
 return m.slice(0,7);
}
function quantity(x){
 let q=round(Number(x[1])||0)*(Number(data.people)||1);
 const label=x[0];
 const unit=/jajka?$/i.test(label)?(q>=40?`ok. ${round(q/55)} szt. (${round(q)} g)`:`${q} g`):`${q} g`;
 const garlic=/czosnek/i.test(label)?` (około ${Math.max(1,Math.round(q/4))} ząbki/ząbków, zależnie od wielkości)` : '';
 return `${label.toLocaleLowerCase('pl')} — ${unit}${garlic}`;
}
function enhancedSteps(r){
 const all=r.ingredients||[];
 const list=Array.isArray(r.steps)?r.steps:[];
 const result=[`Przed rozpoczęciem przygotuj i odmierz składniki podane w recepturze: ${all.map(quantity).join('; ')}. Ilości dotyczą ${Number(data.people)||1} os.`,
  'Umyj warzywa i owoce. Przygotuj deskę, nóż i wymagany sprzęt. Surowy drób trzymaj oddzielnie od produktów gotowych do jedzenia; nie myj surowego mięsa.'];
 for(let i=0;i<list.length;i++){
  let s=String(list[i]).trim();if(!s)continue;
  const items=stepIngredients(r,s);
  if(items.length){
   const q=items.map(quantity).join('; ');
   s=`${s.replace(/[.\s]+$/,'')}. W tym etapie przygotuj: ${q}.`;
  }
  // Do not invent arbitrary frying durations for beef stew or larger cuts.
  if(/smaż|podsmaż/i.test(s)&&!/\d+\s*(?:–|-)?\s*\d*\s*min/i.test(s)){
   s+=' Smaż na umiarkowanym ogniu i obserwuj stopień przygotowania; czas zależy od wielkości kawałków.';
  }
  if(/gotuj|duś|piec|piecz/i.test(s)&&!/\d+\s*(?:–|-)?\s*\d*\s*min/i.test(s)){
   s+=' Czas przygotowania zależy od produktu i urządzenia; sprawdź konsystencję oraz gotowość.';
  }
  result.push(s);
 }
 const combined=all.map(x=>lower(x[0])).join(' ');
 if(/kurcz|indyk|dr[oó]b/.test(combined))result.push('Sprawdź termometrem kuchennym, że drób osiągnął co najmniej 74°C w środku.');
 if(/mielon/.test(combined))result.push('Mięso mielone przygotuj do bezpiecznej temperatury wewnętrznej; dla drobiowego co najmniej 74°C.');
 result.push('Podawaj na czystym talerzu. Czas i temperatura podane w przepisie są orientacyjne; kieruj się również wyglądem dania i bezpieczeństwem żywności.');
 return result;
}
detailedSteps=enhancedSteps;
// 90 oddzielnych lokalnych ilustracji, nie fotografii; istniejące 10 fotografii pozostaje nietknięte.
const illustrated=window.kamis23Illustrations||{};
for(const r of recipes){if(illustrated[r.id]&&!r.k22Photo){r.k23OriginalIllustration=r.image;r.image=illustrated[r.id];r.k23Illustration=true;}}
function release(html){
 const section='<section class="v20-release"><div class="v20-kicker">AKTUALNA WERSJA • 2.3</div><h2>Nowości Kamiś 2.3</h2><p>Dokładniejsze instrukcje ze składnikami i gramaturami, gotowanie krok po kroku, lodówka z terminami, propozycje z resztek, zakupy według kategorii oraz 90 nowych ilustracji przypisanych do konkretnych dań.</p></section>';
 return /<section class="v20-release">[\s\S]*?<\/section>/.test(html)?html.replace(/<section class="v20-release">[\s\S]*?<\/section>/,section):html+section;
}
home=function(){let html=release(prev.home());return html+`<section class="panel"><h2>🧺 Kuchnia bez marnowania</h2><p class="muted">Zapisz produkty wraz z terminem przydatności i dobierz przepisy z dostępnych składników.</p><div class="actions"><button class="btn" onclick="setPage('fridge23')">🧊 Lodówka i terminy</button><button class="btn alt" onclick="setPage('leftovers23')">🍱 Pomysły na resztki</button><button class="btn alt" onclick="setPage('quality23')">🛠️ Kontrola aplikacji</button></div></section>`};
function itemCategory(name){
 const s=lower(name);
 if(/kurcz|indy|wołow|wolow|wieprz|mielon|kielbas|wędl|szynk|łoso|ryb|tuńczy|tunczyk/.test(s))return 'Mięso i ryby';
 if(/jogurt|mlek|śmietan|ser|twar|skyr|masło|maslo|kefir|jaj/.test(s))return 'Nabiał i jajka';
 if(/ryz|ryż|makaron|kasz|platk|płatk|mąk|mak|chleb|buł|tortilla|pita/.test(s))return 'Pieczywo i produkty suche';
 if(/olej|oliw|cynamon|sol|sól|pieprz|papryk.*(słod|wędz)|kumin|kurkum|imbir|oregano|majeran|musztard|ocet|kakao|przypraw|sos/.test(s))return 'Przyprawy i dodatki';
 if(/jabł|jabl|trusk|malin|banan|borów|borow|cytryn|limonk|pomidor|cebula|cebul|czosn|papryk|broku|marchew|ziemniak|ogór|ogor|szpinak|sałat|salat|cukini|dyni|awok|bruk|grusz|grzyb|pieczark|fasol|ciecierzyc|kukurydz/.test(s))return 'Warzywa i owoce';
 return 'Pozostałe produkty';
}
shopping=function(){const html=prev.shopping();if(!data.plan)return html;
 const container=document.createElement('div');container.innerHTML=html;
 const products=[...container.querySelectorAll('.v62-shopitem')];if(!products.length)return html;
 const groups=new Map();for(const product of products){const label=product.querySelector('label.shopping');const title=label?.querySelector('b')?.textContent||label?.querySelector('.item')?.textContent||'';const cat=itemCategory(title);if(!groups.has(cat))groups.set(cat,[]);groups.get(cat).push(product);}
 const section=container.querySelector('section.panel')||container;
 const anchor=document.createElement('div');anchor.className='k23-shoppinggroups';
 const order=['Warzywa i owoce','Mięso i ryby','Nabiał i jajka','Pieczywo i produkty suche','Przyprawy i dodatki','Pozostałe produkty'];
 for(const category of order){const items=groups.get(category);if(!items?.length)continue;const details=document.createElement('details');details.open=true;details.className='k23-shopgroup';const summary=document.createElement('summary');summary.textContent=`${category} (${items.length})`;details.append(summary);for(const node of items)details.append(node);anchor.append(details);}
 const firstActions=section.querySelector('.actions');if(firstActions)firstActions.before(anchor);else section.append(anchor);
 return container.innerHTML;
};
function pantryList(){return state.pantry.map((p,i)=>({i,name:p.name,qty:Math.max(0,Number(p.qty)||0),expiry:p.expiry||''}));}
function fridgePage(){const today=new Date().toISOString().slice(0,10);
 return `<section class="panel"><h2>🧊 Moja lodówka 2.0</h2><p>Wpisz ilości i daty produktów. Kamiś najpierw proponuje wykorzystanie tych, których termin jest najbliższy. Zawsze oceniaj bezpieczeństwo produktów i sprawdzaj etykiety.</p><div class="k23-entry"><label>Nazwa produktu<input id="k23PantryName" type="text" maxlength="65" placeholder="np. pierś z kurczaka"></label><label>Ilość (g)<input id="k23PantryQty" type="number" min="0" max="50000" value="250"></label><label>Termin z opakowania<input id="k23PantryDate" type="date" min="2020-01-01"></label><button class="btn" onclick="kamis23AddPantry()">Dodaj produkt</button></div><p class="muted">Dla produktów z oznaczeniem „należy spożyć do” przestrzegaj terminu — nie wykorzystuj ich po jego upływie.</p><div class="k23-pantrylist">${pantryList().map(p=>`<div class="shopping"><div class="item"><b>${safe(p.name)}</b><small class="small">${round(p.qty)} g · ${p.expiry?'Termin: '+safe(p.expiry):'bez wpisanego terminu'}</small></div>${p.expiry&&p.expiry<today?'<span class="k23-warning">Po terminie — nie proponuję</span>':`<button class="btn alt" onclick="kamis23FindPantry(${p.i})">Znajdź przepisy</button>`}<button class="btn alt" onclick="kamis23RemovePantry(${p.i})">Usuń</button></div>`).join('')||'<p>Nie wpisano jeszcze żadnych produktów.</p>'}</div></section>`;
}
window.kamis23AddPantry=()=>{const n=document.getElementById('k23PantryName')?.value.trim().slice(0,65);const qty=Math.max(0,Number(document.getElementById('k23PantryQty')?.value)||0);const expiry=document.getElementById('k23PantryDate')?.value||'';if(!n||!qty){alert('Podaj nazwę i ilość produktu.');return;}state.pantry.push({name:n,qty,expiry});
 if(!data.pantryItems.some(x=>lower(x)===lower(n)))data.pantryItems.push(n);
 if(data.v62?.pantryGrams)data.v62.pantryGrams[lower(n)]=qty;
 persist();render();};
window.kamis23RemovePantry=i=>{state.pantry.splice(Number(i),1);persist();render()};
function matchedIngredients(r,phrase){const p=lower(phrase).split(' ')[0];return r.ingredients.some(x=>lower(x[0]).includes(p)||p.includes(lower(x[0]).split(' ')[0]))}
window.kamis23FindPantry=i=>{const x=pantryList()[Number(i)];if(!x)return;page='leftovers23';state.focus=x.name;persist();render();};
function pantryMatches(r){const today=new Date().toISOString().slice(0,10);return state.pantry.filter(x=>(!x.expiry||x.expiry>=today)&&matchedIngredients(r,x.name));}
function leftoverCandidates(){const focused=state.focus;const list=recipes.filter(canEat).filter(r=>pantryMatches(r).length>0 && (!focused||matchedIngredients(r,focused)));
 return list.sort((a,b)=>{const A=pantryMatches(a),B=pantryMatches(b);const first=(q)=>q.reduce((sum,x)=>sum+(x.expiry?Math.max(0,30-Math.max(0,(new Date(x.expiry)-new Date())/86400000)):0),0);return first(B)-first(A)||B.length-A.length||a.minutes-b.minutes}).slice(0,15)};
function leftoversPage(){const list=leftoverCandidates();return `<section class="panel"><h2>🍱 Pomysły na resztki i dostępne produkty</h2><p>Propozycje wykorzystania składników, które już masz, przed kolejnymi zakupami. Sprawdź, czy przechowywane jedzenie jest nadal bezpieczne. Gotowe potrawy przechowuj w lodówce i podgrzewaj właściwie.</p>${state.focus?`<p class="pill">Produkt: ${safe(state.focus)} <button class="btn alt" onclick="kamis23ResetFocus()">Wszystkie</button></p>`:''}${list.length?list.map(r=>`<div class="k23-suggestion"><img src="${r.image}" loading="lazy" alt="${r.k22Photo?'Fotografia':'Ilustracja'} potrawy"><div><b>${safe(r.name)}</b><p class="muted">Z Twoich zapasów: ${pantryMatches(r).map(x=>safe(x.name)).join(', ')}. ${r.meal} · ok. ${r.minutes||30} min.</p><button class="btn alt" onclick="showRecipe(${r.id})">Przepis</button></div></div>`).join(''):'<p class="notice">Dodaj składniki w lodówce, aby zobaczyć propozycje. Nie dopasowuję przepisów do produktów po terminie.</p>'}<div class="actions"><button class="btn alt" onclick="setPage('fridge23')">Edytuj lodówkę</button></div></section>`};
window.kamis23ResetFocus=()=>{state.focus='';persist();render()};
// Proponuj wymianę tylko na kompatybilny typ posiłku, bez ingerencji w inne dni.
function suggestionsFor(source){const known=state.pantry.map(x=>lower(x.name));return recipes.filter(r=>r.meal===source.meal&&r.id!==source.id&&canEat(r))
 .map(r=>({r,score:r.ingredients.filter(x=>known.some(n=>matchedIngredients(r,n)&&lower(x[0]).includes(n.split(' ')[0]))).length*5-Math.abs((r.minutes||30)-(source.minutes||30))*.08+Number(data.ratings?.[r.id]||0)}))
 .sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.r)};
function swapSection(){if(!data.plan)return '';
 const first=data.plan.entries.find(e=>e.ids?.length);if(!first)return '';
 const choices=data.plan.entries.map(e=>e.ids.map((id,i)=>({day:e.day,i,r:find(id)}))).flat().filter(x=>x.r);
 return `<section class="panel"><h2>🔄 Podmień jedno danie</h2><p class="muted">Zamienniki zachowują typ posiłku i sprawdzają wykluczenia oraz dostępny sprzęt. Inne dania zostają bez zmian.</p><label>Posiłek do zmiany <select id="k23SwapSlot" onchange="kamis23SlotPreview()">${choices.map(({day,i,r})=>`<option value="${day}:${i}">${safe(DAYS[day])}: ${safe(r.name)}</option>`).join('')}</select></label><div id="k23SwapChoices"></div></section>`;
}
window.kamis23SlotPreview=()=>{const raw=document.getElementById('k23SwapSlot')?.value||'';const [day,idx]=raw.split(':').map(Number);const entry=data.plan?.entries.find(e=>e.day===day),source=find(entry?.ids[idx]);const el=document.getElementById('k23SwapChoices');if(!source||!el)return;el.innerHTML=suggestionsFor(source).map(r=>`<div class="shopping"><div class="item"><b>${safe(r.name)}</b><small class="small">${r.minutes||30} min · orientacyjnie ${money23((window.kamis62Data?.cost(r)||0))} za porcję</small></div><button class="btn alt" onclick="kamis23Swap(${day},${idx},${r.id})">Wybierz</button></div>`).join('')||'<p>Brak dopasowanych zamienników przy obecnych ograniczeniach.</p>';};
window.kamis23Swap=(day,idx,id)=>{const e=data.plan?.entries.find(x=>x.day===Number(day)),r=find(id),old=find(e?.ids[Number(idx)]);if(!e||!r||!old||r.meal!==old.meal||!canEat(r))return alert('Danie nie spełnia ustawień.');if(!confirm(`Zamienić tylko „${old.name}” na „${r.name}”?`))return;swapTarget={day:Number(day),index:Number(idx)};doSwap(r.id);};
function savedIngredients(r){return (r?.ingredients||[]).map(x=>lower(x[0])).filter(Boolean);}
function overlap(a,b){const x=savedIngredients(a),y=savedIngredients(b);return x.filter(n=>y.some(m=>n===m||n.includes(m)||m.includes(n))).length;}
function leftoverForPlan(){if(!data.plan||data.plan.entries.length<2)return '';
 const entries=[...data.plan.entries].sort((a,b)=>a.day-b.day), suggestions=[];
 for(let d=0;d<entries.length-1;d++){
  const from=entries[d],to=entries[d+1],source=from.ids.map(find).find(r=>r?.meal==='Obiad'||r?.meal==='Kolacja');
  if(!source)continue;
  const targetIdx=to.ids.findIndex(id=>{const r=find(id);return r?.meal==='Kolacja'||r?.meal==='Obiad'});
  if(targetIdx<0)continue;
  const current=find(to.ids[targetIdx]);if(!current)continue;
  const best=recipes.filter(r=>r.meal===current.meal&&r.id!==current.id&&canEat(r))
   .map(r=>({r,n:overlap(source,r)})).filter(x=>x.n>=2).sort((a,b)=>b.n-a.n).slice(0,1)[0];
  if(best){suggestions.push({from,to,targetIdx,source,replacement:best.r,common:best.n});}
  if(suggestions.length>=3)break;
 }
 if(!suggestions.length)return '';
 return `<section class="panel"><h2>🍱 Wykorzystaj składniki kolejnego dnia</h2><p class="muted">Przygotuj część składników na dwa posiłki, zamiast kupować wszystko ponownie. Zmiana jadłospisu tylko po zatwierdzeniu.</p>${suggestions.map(s=>`<div class="shopping"><div class="item"><b>${safe(DAYS[s.from.day])}: ${safe(s.source.name)}</b><small class="small">${safe(DAYS[s.to.day])}: proponuję ${safe(s.replacement.name)} · ${s.common} wspólnych składników</small></div><button class="btn alt" onclick="kamis23Swap(${s.to.day},${s.targetIdx},${s.replacement.id})">Podmień</button></div>`).join('')}<p class="muted">Przechowuj przygotowane składniki w odpowiednich warunkach, przestrzegaj terminów i zasad bezpiecznego podgrzewania.</p></section>`;
}

planView=function(){let html=prev.planView();if(data.plan)html+=swapSection()+leftoverForPlan();return html;};
function cookingPage(){const r=find(state.cook.id);if(!r)return `<section class="panel"><h2>Tryb gotowania</h2><p>Otwórz przepis i wybierz „Gotuj krok po kroku”.</p></section>`;
 const steps=enhancedSteps(r),count=steps.length,idx=Math.max(0,Math.min(state.cook.idx||0,count-1));state.cook.idx=idx;
 return `<section class="panel k23-cook"><button class="btn alt" onclick="kamis23ExitCooking()">← Wróć do przepisu</button><h2>🍳 ${safe(r.name)}</h2><img class="k23-cookphoto" src="${r.image}" alt="${r.k22Photo?'Fotografia poglądowa':'Ilustracja poglądowa'}"><p class="muted">${r.k22Photo?'Fotografia poglądowa':'Ilustracja poglądowa'} · ${count} kroków · ${r.ingredients.length} składników</p><div class="row"><b>Krok ${idx+1} z ${count}</b><span>${state.cook.done.length} wykonano</span></div><progress value="${state.cook.done.length}" max="${count}"></progress><article class="k23-cookstep"><h3>${idx===0?'Przygotuj wszystko':`Etap ${idx}`}</h3><p>${safe(steps[idx])}</p><label><input type="checkbox" ${state.cook.done.includes(idx)?'checked':''} onchange="kamis23FinishStep(${idx},this.checked)"> Wykonane</label></article><div class="k23-timer"><b>⏱️ Minutnik</b><div id="k23TimerClock" class="k23-timerclock">00:00</div><div class="actions"><button class="btn alt" onclick="kamis23TimerStart(60)">1 min</button><button class="btn alt" onclick="kamis23TimerStart(300)">5 min</button><button class="btn alt" onclick="kamis23TimerStart(600)">10 min</button><button class="btn alt" onclick="kamis23TimerPause()">Pauza</button><button class="btn alt" onclick="kamis23TimerReset()">Reset</button></div><p class="muted">Minutnik działa, kiedy strona pozostaje otwarta; w tle system telefonu może go wstrzymać.</p></div><div class="actions k23-cooknav"><button class="btn alt" ${idx===0?'disabled':''} onclick="kamis23CookStep(-1)">← Poprzedni</button><button class="btn" ${idx===count-1?'disabled':''} onclick="kamis23CookStep(1)">Następny →</button></div></section>`;
}
window.kamis23BeginCooking=id=>{const r=find(id);if(!r)return;state.cook={id:r.id,idx:0,done:[]};state.previousPage=page;persist();document.getElementById('recipeDialog')?.close();page='cook23';render();window.scrollTo(0,0)};
window.kamis23ExitCooking=()=>{stopTimer();const id=state.cook.id;page=state.previousPage||'recipes';render();if(find(id))showRecipe(id)};
window.kamis23CookStep=delta=>{const r=find(state.cook.id);if(!r)return;state.cook.idx=Math.min(enhancedSteps(r).length-1,Math.max(0,state.cook.idx+Number(delta)));persist();render()};
window.kamis23FinishStep=(idx,checked)=>{const x=Number(idx);state.cook.done=checked?[...new Set([...state.cook.done,x])]:state.cook.done.filter(i=>i!==x);persist();render()};
const tick=()=>{const x=document.getElementById('k23TimerClock');if(!x)return;const seconds=timer.running?Math.max(0,Math.ceil((timer.until-Date.now())/1000)):timer.remaining;x.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;if(timer.running&&seconds<=0){stopTimer();timer.remaining=0;x.textContent='Gotowe!';}};
window.kamis23TimerStart=seconds=>{stopTimer();timer.remaining=Number(seconds);timer.until=Date.now()+timer.remaining*1000;timer.running=true;timer.handle=setInterval(tick,350);tick()};
window.kamis23TimerPause=()=>{if(timer.running){timer.remaining=Math.max(0,Math.ceil((timer.until-Date.now())/1000));stopTimer();}else if(timer.remaining){timer.until=Date.now()+timer.remaining*1000;timer.running=true;timer.handle=setInterval(tick,350);}tick()};
window.kamis23TimerReset=()=>{stopTimer();timer.remaining=0;tick()};
showRecipe=function(id){prev.showRecipe(id);const r=find(id);if(!r)return;const p=document.getElementById('dialogBody');if(!p)return;const oldCook=[...p.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes('kamisCook('));if(oldCook){oldCook.setAttribute('onclick',`kamis23BeginCooking(${r.id})`);oldCook.textContent='🍳 Gotuj krok po kroku 2.3';}else p.insertAdjacentHTML('beforeend',`<div class="actions"><button class="btn" onclick="kamis23BeginCooking(${r.id})">🍳 Gotuj krok po kroku 2.3</button></div>`);p.insertAdjacentHTML('beforeend','<p class="muted">Instrukcje uwzględniają gramatury składników z receptury. Nie dopisujemy przypadkowych czasów smażenia.</p>');};
function qualityPage(){const ids=new Set(recipes.map(r=>r.id));const valid=recipes.filter(r=>r.name && r.meal && r.ingredients.length && r.steps?.length);const exact=recipes.filter(r=>r.k22Photo).length;const drawn=recipes.filter(r=>r.k23Illustration).length;return `<section class="panel"><h2>🛠️ Raport aplikacji Kamiś 2.3</h2><div class="grid"><div class="notice"><b>${recipes.length}</b><br>Wszystkie przepisy</div><div class="notice"><b>${ids.size}</b><br>Unikalne identyfikatory</div><div class="notice"><b>${valid.length}</b><br>Receptury ze składnikami i krokami</div><div class="notice"><b>${exact}</b><br>Fotografie</div><div class="notice"><b>${drawn}</b><br>Nowe ilustracje</div></div><p class="muted">Raport sprawdza strukturę lokalnej bazy w tej przeglądarce. Nie oznacza testu smakowego ani weryfikacji gramatur przez dietetyka.</p><button class="btn alt" onclick="kamis23CheckCache()">Sprawdź pliki offline</button><div id="k23CacheState" class="notice">Bez testu pamięci offline</div></section>`;};
window.kamis23CheckCache=async()=>{const node=document.getElementById('k23CacheState');if(!node)return;try{const cache=await caches.match('./index.html');node.textContent=cache?'Główna aplikacja jest w pamięci offline. Dodatkowe pliki sprawdź po pierwszym uruchomieniu online.':'Nie odnaleziono aplikacji w pamięci offline — otwórz ją przez HTTPS i odśwież.';}catch{node.textContent='Nie można sprawdzić pamięci offline w tym środowisku.'}};
render=function(){if(page==='fridge23'){$('content').innerHTML=fridgePage();$('backBtn').style.display='inline-block';}else if(page==='leftovers23'){$('content').innerHTML=leftoversPage();$('backBtn').style.display='inline-block';}else if(page==='cook23'){$('content').innerHTML=cookingPage();$('backBtn').style.display='inline-block';tick()}else if(page==='quality23'){$('content').innerHTML=qualityPage();$('backBtn').style.display='inline-block'}else{prev.render();if(page==='plan')window.kamis23SlotPreview();}
 const count=document.getElementById('count');if(count)count.textContent=`${recipes.length} przepisów · 2.3`;
 if(page==='recipes'){const label=document.querySelector('#content .v20-kicker');if(label&&label.textContent.includes('KATALOG KAMIŚ'))label.textContent='KATALOG KAMIŚ 2.3';}
};
goBack=function(){if(page==='cook23'){window.kamis23ExitCooking();return;}if(['fridge23','leftovers23','quality23'].includes(page)){setPage('home');return;}prev.goBack();};
window.kamis20CurrentVersion='2.3';render();
})();
