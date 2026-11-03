/* Kamiś 2.2 — czytelny katalog wszystkich 1000 receptur i zdjęcia przypisane do konkretnych ID.
   Nie zmienia receptur, kosztów, kaloryczności ani zapisanych jadłospisów. */
(()=>{
'use strict';
const photos = window.kamis22PhotoAssets||{};
const photoIds=new Set(Object.keys(photos).map(Number));
for (const recipe of recipes){
  const photo=photos[recipe.id];
  if(!photo)continue;
  recipe.k22Illustration=recipe.image;
  recipe.k22Photo=true;
  recipe.image=photo;
}
window.kamis22Photos=photos;
// Restore a recipe's original illustration if a photograph cannot be read or cached.
document.addEventListener('error',event=>{
  const img=event.target;
  if(!(img instanceof HTMLImageElement)||img.dataset.k22Fallback==='true')return;
  const recipe=recipes.find(r=>r.k22Photo && img.src===String(r.image));
  if(recipe&&recipe.k22Illustration){img.dataset.k22Fallback='true';img.src=recipe.k22Illustration;}
},true);

const previousRecipesView=recipesView;
const previousHome=home;
const previousShowRecipe=showRecipe;
const mealOrder=['Śniadanie','Obiad','Kolacja','Przekąska','Deser'];
const availableQuick=[['any','Wszystkie'],['meat','Mięsne'],['fast','Do 20 min'],['simple','Łatwe'],['budget','Tanie']];
const v20data=data.v20||{};
if(!data.v22||typeof data.v22!=='object'||Array.isArray(data.v22))data.v22={};
const preferences=data.v22;
preferences.catalogMode=preferences.catalogMode==='matching'?'matching':'all';
preferences.catalogTime=Number.isFinite(Number(preferences.catalogTime))?Number(preferences.catalogTime):0;
let catalogPage=1;
const perPage=36;
const safe=v=>esc(String(v??''));
const getRecipe=id=>recipes.find(r=>r.id===Number(id));
const num=v=>Number(v)||0;
const lower=v=>String(v??'').toLocaleLowerCase('pl');
const altText=r=>r.k22Photo?`Poglądowa fotografia: ${r.name}`:`Ilustracja: ${r.name}`;
function equipAllowed(r){
  const cfg=data.v63||{};
  if(!cfg.limitDevices)return true;
  let equipment=r.equipment;
  if(!Array.isArray(equipment)){
    const content=lower(r.name+' '+(r.steps||[]).join(' '));
    equipment=[];
    if(/air.?fryer|frytkownic|beztłuszczow/.test(content))equipment.push('air');
    if(/piekarnik|blacha|żaroodporn/.test(content))equipment.push('oven');
    if(/mikrofal/.test(content))equipment.push('micro');
    if(/czajnik/.test(content))equipment.push('kettle');
    if(/blender|blenduj/.test(content))equipment.push('blender');
    if(/mikser/.test(content))equipment.push('mixer');
    if(/patelni|smaż|podsmaż|obsmaż/.test(content))equipment.push('stove');
    if(/garnek|garnku|zagotuj|ugotuj/.test(content))equipment.push('pot');
    if(equipment.length===0&&/piec|smaż|gotuj|duś|mięso surow/.test(content))equipment.push('stove');
  }
  return equipment.every(e=>(cfg.devices||[]).includes(e));
}
function matchesProfile(r){
 return allowed(r) && equipAllowed(r) && (!num(data.timeFilter)||num(r.minutes||30)<=num(data.timeFilter)) && (!window.kamis63MatchesMacro||window.kamis63MatchesMacro(r));
}
function resultList(){
 let list=recipes.filter(r=>filter==='Wszystkie'||r.meal===filter);
 const query=lower(search).trim();
 if(query)list=list.filter(r=>lower([r.name,...(r.ingredients||[]).map(i=>i[0])].join(' ')).includes(query));
 if(preferences.catalogMode==='matching')list=list.filter(matchesProfile);
 const quick=v20data.quick||'any';
 if(quick==='meat')list=list.filter(r=>['chicken','beef','pork'].includes(r.kind)||/kurczak|indyk|indyka|wołow|wieprz|szynka|boczek|kiełbasa|tuńczyk|łosoś/.test(lower(r.name)));
 if(quick==='fast')list=list.filter(r=>num(r.minutes||30)<=20);
 if(quick==='simple')list=list.filter(r=>(r.steps||[]).length<=6&&num(r.minutes||30)<=25);
 if(preferences.catalogTime)list=list.filter(r=>num(r.minutes||30)<=preferences.catalogTime);
 if(quick==='budget')list.sort((a,b)=>approxCost(a)-approxCost(b));
 if(quick==='fast')list.sort((a,b)=>num(a.minutes||30)-num(b.minutes||30));
 return list;
}
function approxCost(r){return r.ingredients.reduce((s,i)=>s+num(i[2]),0)}
function photoTag(r){return r.k22Photo?'<span class="k22-photo-tag">Zdjęcie poglądowe</span>':'<span class="k22-illustration-tag">Ilustracja</span>'}
function itemCard(r){
 const loved=(data.favorites||[]).includes(r.id);
 return `<article class="v20-recipe-card k22-recipe-card"><button class="v20-image-button" onclick="showRecipe(${r.id})"><img loading="lazy" decoding="async" src="${r.image}" alt="${safe(altText(r))}">${photoTag(r)}</button><div class="v20-cardbody"><div class="v20-tags"><span>${safe(r.meal)}</span><span>⏱ ${num(r.minutes||30)} min</span></div><h3>${safe(r.name)}</h3><p>${r.ingredients.slice(0,3).map(i=>safe(i[0])).join(' · ')}</p><div class="v20-cardactions"><button class="btn" onclick="showRecipe(${r.id})">Przepis →</button><button class="btn alt" title="${loved?'Usuń z ulubionych':'Dodaj do ulubionych'}" onclick="kamisFavorite(${r.id})">${loved?'♥':'♡'}</button></div></div></article>`;
}
function refreshList(){
 const list=resultList();
 const pages=Math.max(1,Math.ceil(list.length/perPage));
 catalogPage=Math.max(1,Math.min(catalogPage,pages));
 const first=(catalogPage-1)*perPage;
 const current=list.slice(first,first+perPage);
 const grid=document.getElementById('k22Grid');
 const counter=document.getElementById('k22Results');
 const pager=document.getElementById('k22Pager');
 if(counter)counter.textContent=`${list.length} z ${recipes.length} przepisów · wyświetlane ${list.length?first+1:0}–${first+current.length}`;
 if(grid)grid.innerHTML=current.map(itemCard).join('')||'<p class="notice">Brak dań spełniających wybrane filtry. Włącz „Cała baza” i wyczyść wyszukiwanie, aby zobaczyć wszystkie przepisy.</p>';
 if(pager){
   const select='<label for="k22PageSelect">Strona</label><select id="k22PageSelect" aria-label="Strona katalogu" onchange="kamis22Page(this.value)">'+Array.from({length:pages},(_,i)=>`<option value="${i+1}" ${catalogPage===i+1?'selected':''}>${i+1} z ${pages}</option>`).join('')+'</select>';
   pager.innerHTML=`<button class="btn alt" ${catalogPage<=1?'disabled':''} onclick="kamis22Page(${catalogPage-1})">← Poprzednia</button>${select}<button class="btn alt" ${catalogPage>=pages?'disabled':''} onclick="kamis22Page(${catalogPage+1})">Następna →</button>`;
 }
}
window.kamis22Search=v=>{search=v;catalogPage=1;refreshList()};
window.kamis22Meal=v=>{filter=v;catalogPage=1;render()};
window.kamis22Quick=v=>{v20data.quick=v;catalogPage=1;persist();render()};
window.kamis22Mode=v=>{preferences.catalogMode=v==='matching'?'matching':'all';catalogPage=1;persist();render()};
window.kamis22Time=v=>{preferences.catalogTime=Math.max(0,num(v));catalogPage=1;persist();render()};
window.kamis22Reset=()=>{search='';filter='Wszystkie';v20data.quick='any';preferences.catalogTime=0;preferences.catalogMode='all';catalogPage=1;persist();render()};
window.kamis22Page=v=>{catalogPage=Math.floor(num(v))||1;refreshList();document.getElementById('k22Results')?.scrollIntoView({block:'start',behavior:'auto'})};
const cats=['Wszystkie',...mealOrder];
recipesView=function(){
 if(swapTarget)return previousRecipesView();
 const quick=v20data.quick||'any';
 // Data is not truncated. Only 36 cards are loaded per page for responsiveness.
 return `<section class="panel v20-recipes k22-library"><div class="v20-titleline"><div><div class="v20-kicker">KATALOG KAMIŚ 2.2</div><h2>Przepisy <span class="k22-grand-total">${recipes.length}</span></h2></div><button class="btn alt" onclick="kamis22Reset()">Wyczyść filtry</button></div><p class="muted">W katalogu masz dostęp do całych ${recipes.length} przepisów. Wyświetlamy po 36 kart na stronę, żeby telefon działał płynnie. Tylko zgodne z ustawieniami to osobny, dobrowolny filtr.</p><div class="k22-modes"><button class="chip ${preferences.catalogMode==='all'?'selected':''}" onclick="kamis22Mode('all')">📚 Cała baza (${recipes.length})</button><button class="chip ${preferences.catalogMode==='matching'?'selected':''}" onclick="kamis22Mode('matching')">✅ Tylko zgodne z moimi ustawieniami</button></div><label class="k22-search-label" for="k22Search">Szukaj po nazwie lub składnikach</label><input type="search" id="k22Search" placeholder="Np. kurczak, truskawki, tortilla…" value="${safe(search)}" oninput="kamis22Search(this.value)"><div class="v20-chips">${cats.map(m=>`<button class="chip ${filter===m?'selected':''}" onclick="kamis22Meal('${m}')">${m}</button>`).join('')}</div><div class="v20-chips">${availableQuick.map(([key,title])=>`<button class="chip ${quick===key?'selected':''}" onclick="kamis22Quick('${key}')">${title}</button>`).join('')}</div><div class="k22-controls"><label>Maksymalny czas <select onchange="kamis22Time(this.value)">${[0,15,30,45,60,90,120].map(n=>`<option value="${n}" ${preferences.catalogTime===n?'selected':''}>${n?n+' min':'Bez limitu'}</option>`).join('')}</select></label><span class="muted">Zdjęcia są poglądowe; pozostałe dania mają ilustracje.</span></div><div id="k22Results" class="k22-resultcount" aria-live="polite"></div><div id="k22Grid" class="v20-recipes-grid"></div><nav id="k22Pager" class="k22-pager" aria-label="Strony przepisów"></nav></section>`;
};
const priorRender=render;
render=function(){priorRender();if(page==='recipes'&&!swapTarget)refreshList();const header=document.getElementById('count');if(header)header.textContent=`${recipes.length} przepisów · 2.2`;const step=document.querySelector('#content .step');if(step&&/KAMIŚ 2\.0/.test(step.textContent))step.textContent=step.textContent.replace('KAMIŚ 2.0','KAMIŚ 2.2')};
showRecipe=function(id){
  previousShowRecipe(id);
  const r=getRecipe(id);if(!r)return;
  const panel=document.getElementById('dialogBody');
  if(panel){const image=panel.querySelector('img.food, img');if(image){image.setAttribute('alt',altText(r));image.setAttribute('loading','eager');}
    const caption=document.createElement('p');caption.className='k22-photo-caption';caption.textContent=r.k22Photo?'Fotografia poglądowa — dodatki i sposób podania mogą nieznacznie różnić się od przepisu.':'Ilustracja poglądowa. Ten przepis nie ma jeszcze przypisanej fotografii.';
    (image||panel.firstElementChild)?.insertAdjacentElement('afterend',caption);
  }
};
home=function(){
 const html=previousHome();
 const notes='<section class="v20-release"><div class="v20-kicker">AKTUALNA WERSJA • 2.2</div><h2>Co nowego w Kamiś 2.2?</h2><p>Pełny katalog 1000 przepisów z wygodnym podziałem na strony, osobny filtr zgodności z ustawieniami oraz pierwsze fotografie potraw. Pozostałe przepisy nadal mają ilustracje.</p></section>';
 return html.replace(/<section class="v20-release">[\s\S]*?<\/section>/,notes);
};
window.kamis20CurrentVersion='2.2';
if(page==='home'||page==='recipes')render();
})();
