/* Kamiś 6.2: dodatkowy moduł. Nie zmienia istniejących przepisów, ID ani klucza danych kamis-v2. */
(() => {
'use strict';
const previous={card,showRecipe,home,tabs,planView,summary,shopping,copyShopping,render,goBack,price};
const $62 = id => document.getElementById(id);
const getR=id=>recipes.find(r=>r.id===Number(id));
const round=(n,d=0)=>Number(Number(n||0).toFixed(d));
const clean=s=>String(s||'').toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').trim();
const e62=esc;
const sanitizeNum=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||min));
if(!data.v62 || typeof data.v62!=='object' || Array.isArray(data.v62)) data.v62={};
const x62=data.v62;
if(!x62.substitutions || typeof x62.substitutions!=='object')x62.substitutions={};
if(!x62.pantryGrams || typeof x62.pantryGrams!=='object')x62.pantryGrams={};
if(!Number.isFinite(Number(x62.servings)))x62.servings=data.people||1;

// Dane żywieniowe są przybliżonymi wartościami na 100 g produktu, bez certyfikowanej bazy etykiet.
// [białko, węglowodany, tłuszcze] w g. Kcal wyliczane współczynnikami 4/4/9.
const foodDB=[
[/piers.*kurcz|filet.*kurcz|filet.*indy|indyk.*filet/i,[23,0,2]],
[/udk.*kurcz|mieso.*udka/i,[19,0,8]],
[/mielon.*indy|indy.*mielon/i,[19,0,8]],
[/wolow|łopatk.*wieprz|lopatk.*wieprz/i,[19,0,12]],
[/poledwic|polędwic/i,[22,0,5]],
[/wieprz|szynk|boczek/i,[18,1,12]],
[/losos|łosoś/i,[20,0,13]],
[/tunczyk|tuńczyk|dorsz|mintaj|morszczuk|ryb/i,[20,0,3]],
[/jajk/i,[13,1,10]],
[/skyr/i,[11,4,0.4]],
[/twarog|twaróg/i,[17,3,5]],
[/serek wiejski/i,[11,3,5]],
[/jogurt grecki/i,[6,5,6]],
[/jogurt/i,[4,5,3]],
[/ser.*(cheddar|gouda|parmezan|grana)|cheddar|gouda|parmezan/i,[26,1,27]],
[/mozzarella/i,[19,2,17]],
[/ser feta|feta/i,[14,4,21]],
[/śmietan|smietan/i,[3,4,18]],
[/maslo orzech|masło orzech/i,[25,20,50]],
[/maslo|masło/i,[1,1,82]],
[/oliw|olej/i,[0,0,100]],
[/mleczko kokosowe/i,[2,4,19]],
[/mleko/i,[3.4,5,2]],
[/ryz|ryż|kuskus|bulgur|kasz|quinoa|komosa/i,[8,75,2]],
[/makaron|noodle|spaghett/i,[12,72,2]],
[/platki|płatki ows|granola|musli/i,[12,64,7]],
[/maka|mąka/i,[10,75,1]],
[/chleb|pieczywo|bułka|bulka|bajgiel|tortilla|pita/i,[9,52,5]],
[/ziemniak|batat/i,[2,19,0.1]],
[/fasol|soczewic|ciecierzyc|groch/i,[8,21,1]],
[/tofu/i,[12,2,7]],
[/awokado/i,[2,9,15]],
[/orzech|migda|nerkow|pistac|pestk|siemi|chia/i,[17,20,50]],
[/czekolad|kakao/i,[14,40,25]],
[/miod|miód|cukier|syrop/i,[0,82,0]],
[/banan/i,[1,23,0.3]],
[/mango|winogron|ananas/i,[1,15,0.3]],
[/malin|truskawk|jagod|borow|borów|jablk|jabłk|gruszk|brzoskwin|pomarancz|pomarańcz/i,[0.8,12,0.3]],
[/kukurydz/i,[3.5,19,1.5]],
[/marchewk|burak|cebula|czosnek|papryk|pomidor|ogorek|ogórek|cukini|brokul|brokuł|kalafior|pieczark|kapust|szpinak|salat|sałat|rukol|por|seler|baklazan|bakłażan/i,[1.5,6,0.3]],
[/sos sojowy/i,[8,5,0]],
[/passata|koncentrat pomidor/i,[1.5,7,0.2]],
[/pasta curry|musztarda|keczup|ketchup/i,[2,12,3]],
[/imbir|bazyl|oregano|kumin|papryka slodka|przypraw|kolendra|cynamon|kurkum|pieprz|sól|sol|limonka|cytryn/i,[1,7,1]]
];
function nutritionOf(name){const row=foodDB.find(([re])=>re.test(clean(name)));return row?row[1]:null}
const alternatives=[
[/ryz|ryż basmati/i,[['Kasza bulgur',1.05,.76,'Ugotuj zgodnie z opakowaniem.'],['Kasza gryczana',1,.92,'Pasuje do dań wytrawnych.']]],
[/makaron/i,[['Makaron pełnoziarnisty',1,1.05,'Gotuj zgodnie z opakowaniem.'],['Ryż',.9,.86,'Osobno ugotuj przed dodaniem.']]],
[/piers.*kurcz|filet.*kurcz/i,[['Filet z indyka',1,1.15,'Smaż lub piecz aż osiągnie 74°C.'],['Tofu naturalne',1.25,.76,'Odsącz i podsmaż na złoto. Zmienia smak dania.']]],
[/filet.*indy/i,[['Pierś z kurczaka',1,.88,'Smaż lub piecz aż osiągnie 74°C.'],['Tofu naturalne',1.2,.74,'Odsącz i podsmaż na złoto.']]],
[/śmietan|smietan/i,[['Jogurt grecki',1,.7,'Dodawaj na małym ogniu, żeby się nie zwarzył.'],['Mleczko kokosowe',1.1,1.15,'Zmieni smak na kokosowy.']]],
[/jogurt grecki/i,[['Skyr naturalny',1,1.12,'Gęstsza, bardziej białkowa propozycja.'],['Jogurt naturalny',1.1,.78,'Rzadsza konsystencja.']]],
[/jogurt naturalny/i,[['Skyr naturalny',1,1.1,'Gęstsza konsystencja.'],['Jogurt grecki',.85,1.15,'Bardziej kremowa konsystencja.']]],
[/mleko(?! kokos)/i,[['Napój owsiany',1,1.15,'Sprawdź wersję bez dodatku cukru.'],['Napój sojowy',1,1.2,'Sprawdź alergeny na etykiecie.']]],
[/ser.*cheddar|cheddar/i,[['Ser gouda',1,.85,'Łagodniejszy smak.'],['Mozzarella',1,.95,'Delikatniejszy smak.']]],
[/parmezan/i,[['Grana Padano',1,1,'Ser o podobnym zastosowaniu.']]],
[/mozzarella/i,[['Ser gouda',.85,.85,'Mocniejszy smak.']]],
[/płatki owsiane|platki owsiane/i,[['Płatki jaglane',1.05,1.03,'Gotuj nieco dłużej, sprawdzając konsystencję.']]],
[/miód|miod/i,[['Syrop klonowy',1,1.35,'Podobna słodycz, inny aromat.']]],
[/szpinak/i,[['Jarmuż',1,1.25,'Usuń twarde łodygi i duś dłużej.']]],
[/pieczark/i,[['Cukinia',1.1,.9,'Pokrój w półplasterki i krótko podsmaż.']]],
[/masło orzechowe|maslo orzechowe/i,[['Pasta z pestek słonecznika',1,1.2,'Sprawdź alergeny i możliwe ślady orzechów.']]],
[/orzechy włoskie/i,[['Pestki dyni',.85,.9,'Inna tekstura. Sprawdź etykietę.']]],
[/migdał|migdal/i,[['Pestki słonecznika',1,.6,'Inna tekstura. Sprawdź etykietę.']]],
[/tortilla/i,[['Tortilla kukurydziana',1,1.12,'Sprawdź skład i rozmiar placka.']]],
[/chleb|pieczywo/i,[['Pieczywo żytnie',1,1.05,'Sprawdź alergeny.']]],
[/ziemniak/i,[['Bataty',1,1.3,'Pieczenie może potrwać dłużej.']]],
[/cukinia/i,[['Bakłażan',1,1.1,'Podsmaż przed dodaniem.']]],
[/fasola czerwona/i,[['Ciecierzyca',1,1.08,'Odsącz i opłucz.']]]
];
function optionsFor(name,r){const item=alternatives.find(([re])=>re.test(clean(name)));return (item?item[1]:[]).filter(([next])=>{
 const trial={kind:'veg',ingredients:[[next,100,0]]};
 return allowed(trial)&&clean(next)!==clean(name);
});}
function substFor(r,oldName){const key=String(r.id);const opts=optionsFor(oldName,r);return opts.find(o=>o[0]===(x62.substitutions[key]||{})[oldName])||null}
function ingredients(r){return r.ingredients.map(([name,grams,cost])=>{const sub=substFor(r,name);return {original:name,name:sub?sub[0]:name,qty:grams*(sub?sub[1]:1),cost:Number(cost||0)*(sub?sub[2]:1),hint:sub?sub[3]:'',substituted:!!sub}})}
function cost62(r){return ingredients(r).reduce((s,i)=>s+i.cost,0)}
price=function(r){return cost62(r)*data.people}; // wyłącznie koszty zatwierdzonych zamienników
function isEggPiece(name,qty){return /jajk/i.test(clean(name)) && Number(qty)>0 && Number(qty)<=12}
function asGrams(name,qty){return isEggPiece(name,qty)?qty*55:qty}
function nutrition62(r){let p=0,c=0,f=0,known=0,total=0;for(const i of ingredients(r)){
  const grams=asGrams(i.name,i.qty);total+=Math.abs(grams);const n=nutritionOf(i.name);if(!n)continue;
  known+=Math.abs(grams);p+=n[0]*grams/100;c+=n[1]*grams/100;f+=n[2]*grams/100;
 }
 const coverage=total?known/total:0;
 // Nie udajemy zweryfikowanej sumy, gdy baza nie zna części składników.
 return {p:round(p,1),c:round(c,1),f:round(f,1),kcal:round(p*4+c*4+f*9),coverage};
}
window.kamis62Data={nutrition:nutrition62,ingredients,asGrams,cost:cost62};
function serving(){return sanitizeNum(x62.servings||data.people,1,12)}
function summaryNutrition(r){const n=nutrition62(r);return `<div class="v62-macros"><div><b>${n.kcal} kcal</b><small>energia</small></div><div><b>${n.p} g</b><small>białko</small></div><div><b>${n.c} g</b><small>węglowodany</small></div><div><b>${n.f} g</b><small>tłuszcze</small></div></div><p class="muted">Szacunek dla 1 porcji z rozpoznanych składników (${Math.round(n.coverage*100)}% masy). ${n.coverage<.97?'Niepełne dane — rzeczywista wartość może być wyższa.':'Wartości orientacyjne, nie z etykiet producentów.'}</p>`}
function difficulty(r){const n=ingredients(r).length;const min=Number(r.minutes)||25;const steps=r.steps?.length||0;const score=(n>=9?2:n>=6?1:0)+(min>70?2:min>35?1:0)+(steps>=8?2:steps>=5?1:0)+(/redukuj|marynuj|blansz|faszer|zapieka|wyrabiaj|ferment/i.test(r.steps.join(' '))?1:0);return score>=5?{name:'Zaawansowane',icon:'🔴'}:score>=3?{name:'Średnie',icon:'🟡'}:{name:'Łatwe',icon:'🟢'}}

// Autorskie ilustracje lokalne, dopasowane do rodzaju potrawy; nie udają fotografii.
function visualRecipe(r){
 const n=clean(r.name),items=clean(r.ingredients.map(x=>x[0]).join(' '));
 let style='plate';
 if(/zupa|krem z |rosol|rosół|ramen|pho\b/.test(n))style='soup';
 else if(/kanapk|tost|bajgiel|grzank|burger|wrap|burrito|tortill|quesadill/.test(n))style='sandwich';
 else if(/salatk|sałatk|bowl|poke|tabbouleh/.test(n))style='salad';
 else if(/koktajl|smoothie|shake|mus |deser|pucharek|jogurt|owsiank|chia|pudding|krem czekolad/.test(n))style='dessert';
 else if(/makaron|spaghett|tagliatelle|penne|lasagne|klus|gnocchi/.test(n))style='pasta';
 else if(/omlet|jajecznic|jajk|szakszuk/.test(n))style='egg';
 let accent=/kurcz|indy|drob/.test(n)?'#d69d56':/wolow|wołow|wieprz|bocz|mielon/.test(n)?'#a55c3e':/ryb|losos|łosoś|tuncz|tuńczyk/.test(n)?'#e68e75':/szpinak|rukol|warzyw/.test(n)?'#669d62':'#d1a569';
 if(/truskaw|malin|wiśni|wisni/.test(n))accent='#b4546d';else if(/czekolad|kakao/.test(n))accent='#704a3b';
 const seed=(Number(r.id)||1)*31;const rnd=i=>(Math.sin(seed*1.47+i*35.89)*43758.5453)%1;const r01=i=>Math.abs(rnd(i));
 const herbs=/szpinak|rukol|salat|sałat|brokul|brokuł|bazyl|kolendr|natka|cukini/.test(items);
 const tomato=/pomidor|passata|papryk/.test(items);
 const text=esc(r.name.length>42?r.name.slice(0,40)+'…':r.name);
 const bits=Array.from({length:20},(_,i)=>{let a=i*2.399+seed*.033;let radius=13+Math.sqrt(r01(i+20))*66;const xx=210+Math.cos(a)*radius, yy=107+Math.sin(a)*radius*.51;const col=(i%5===0&&herbs)?'#407a43':(i%6===0&&tomato)?'#d3583f':(i%7===0)?'#e3d4a7':accent;return `<ellipse cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" rx="${(10+r01(i+33)*16).toFixed(0)}" ry="${(6+r01(i+39)*8).toFixed(0)}" transform="rotate(${(i*31)%175} ${xx} ${yy})" fill="${col}" opacity=".95"/>`}).join('');
 const soup=`<ellipse cx="210" cy="105" rx="132" ry="77" fill="#e5e4dd"/><ellipse cx="210" cy="105" rx="109" ry="60" fill="${tomato?'#c87546':'#d6ab67'}"/>${bits}`;
 const salad=`<ellipse cx="210" cy="105" rx="136" ry="78" fill="#e7e6e0"/><ellipse cx="210" cy="105" rx="115" ry="62" fill="#6d9d5c"/>${bits}`;
 const dessert=`<path d="M141 49h138l-19 113h-98z" fill="#fbf6e8" stroke="#d7cbb5" stroke-width="4"/><path d="M155 91h112l-13 66h-86z" fill="${accent}" opacity=".85"/><ellipse cx="210" cy="75" rx="68" ry="28" fill="#fff4dc"/><g>${bits}</g>`;
 const sandwich=`<ellipse cx="210" cy="111" rx="140" ry="80" fill="#f0eee7"/><path d="M121 105q88-92 178 0l-9 27H134z" fill="#d8a35b"/><path d="M132 109q80-26 160 0v16H132z" fill="#58924c"/><path d="M137 124h150v13H137z" fill="${accent}"/><path d="M121 138q89 45 179 0l-10 20H135z" fill="#e8b974"/>`;
 const pasta=`<ellipse cx="210" cy="110" rx="141" ry="79" fill="#ebece3"/><ellipse cx="210" cy="109" rx="118" ry="62" fill="#f5e2a0"/>${Array.from({length:18},(_,i)=>{const x=145+120*r01(i+40),y=72+74*r01(i+50);return `<path d="M${x} ${y}q35 -20 40 8t30 2" stroke="#d99e51" stroke-width="8" fill="none" stroke-linecap="round"/>`}).join('')}${bits}`;
 const egg=`<ellipse cx="210" cy="111" rx="141" ry="79" fill="#e9e5db"/><path d="M117 102q10-59 104-51 91 5 99 58-13 63-110 56-88 0-93-63z" fill="#fff9e3"/><ellipse cx="201" cy="111" rx="37" ry="31" fill="#e5b345"/>${bits}`;
 const main=`<ellipse cx="210" cy="109" rx="141" ry="79" fill="#f1efe6"/><ellipse cx="210" cy="109" rx="116" ry="60" fill="#e0d0a4"/>${bits}`;
 const middle={soup,salad,dessert,sandwich,pasta,egg,plate:main}[style];
 return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 234"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#e5eee3"/><stop offset="1" stop-color="#c7d7c2"/></linearGradient><radialGradient id="shine"><stop stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="420" height="234" fill="url(#bg)"/><ellipse cx="210" cy="112" rx="155" ry="88" fill="#7c947b" opacity=".18"/>${middle}<rect x="0" y="191" width="420" height="43" fill="#173f32" opacity=".95"/><text x="210" y="217" font-family="Arial,sans-serif" font-size="15" font-weight="bold" text-anchor="middle" fill="#fff">${text}</text></svg>`)}`;
}
for(const r of recipes)r.image=visualRecipe(r);
// Wybrane przez użytkownika rzeczywiste zdjęcia są przechowywane osobno (IndexedDB),
// nie są umieszczane w przepisach źródłowych ani wysyłane na serwer.
const photoDBName='kamis-v62-recipe-photos';
function openPhotoDB(){return new Promise((resolve,reject)=>{
 if(!('indexedDB' in window)){reject(new Error('Brak IndexedDB'));return}
 const request=indexedDB.open(photoDBName,1);
 request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('photos'))request.result.createObjectStore('photos')};
 request.onsuccess=()=>resolve(request.result);
 request.onerror=()=>reject(request.error);
})}
async function savePhoto(id,imageData){const db=await openPhotoDB();return new Promise((resolve,reject)=>{
 const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(imageData,String(id));
 tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};
})}
async function loadPhotos(){try{const db=await openPhotoDB();const tx=db.transaction('photos','readonly');const req=tx.objectStore('photos').getAllKeys();
 req.onsuccess=async()=>{const keys=req.result||[];const dataReq=keys.map(key=>new Promise(resolve=>{const q=tx.objectStore('photos').get(key);q.onsuccess=()=>resolve([key,q.result]);q.onerror=()=>resolve(null)}));
 const all=await Promise.all(dataReq);db.close();for(const pair of all){if(!pair)continue;const r=getR(pair[0]);if(r&&typeof pair[1]==='string')r.image=pair[1]}
 if(!document.getElementById('recipeDialog').open)render();};
 req.onerror=()=>db.close();}catch{} }
window.kamis62Photo=async(event,id)=>{const file=event.target.files?.[0];if(!file)return;
 if(!file.type.startsWith('image/')){alert('Wybierz plik ze zdjęciem.');return}
 if(file.size>12*1024*1024){alert('Wybierz zdjęcie mniejsze niż 12 MB.');return}
 try{const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const ratio=Math.min(1,960/bitmap.width,650/bitmap.height);
 canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
 const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const encoded=canvas.toDataURL('image/webp',.82);await savePhoto(id,encoded);getR(id).image=encoded;
 if($62('recipeDialog').open){$62('recipeDialog').close();showRecipe(id)}render();}catch(err){alert('Nie udało się zapisać zdjęcia lokalnie: '+(err.message||err))}
};
loadPhotos();

// Substytucje są per przepis i nie zmieniają źródłowego r.ingredients.
window.kamis62SetSub=(id,oldName,nextName)=>{
 const r=getR(id);if(!r)return;
 const i=r.ingredients.find(x=>x[0]===oldName);if(!i)return;
 const key=String(r.id);x62.substitutions[key]||={};
 if(nextName==='')delete x62.substitutions[key][oldName];
 else if(optionsFor(oldName,r).some(o=>o[0]===nextName))x62.substitutions[key][oldName]=nextName;
 persist();if($62('recipeDialog').open){$62('recipeDialog').close();showRecipe(id)}render();
};
window.kamis62Servings=(number,id)=>{x62.servings=sanitizeNum(number,1,12);persist();if($62('recipeDialog').open){$62('recipeDialog').close();showRecipe(id)}render()};
function ingredientPanel(r){
 const qty=serving();const priceEstimate=cost62(r)*qty;
 return `<section class="v62-recipe"><div class="row" style="align-items:center"><h3>⚖️ Dokładne proporcje</h3><label class="v62-servings">Porcje <select aria-label="Liczba porcji" onchange="kamis62Servings(this.value,${r.id})">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${i+1===qty?'selected':''}>${i+1}</option>`).join('')}</select></label></div><p class="muted">Ilości i szacunkowy koszt przeliczone dla ${qty} ${qty===1?'porcji':'porcji'}: <b>~${money(priceEstimate)}</b>. Nie zmienia to liczby osób w istniejącym planie.</p><ul class="v62-ing-list">${ingredients(r).map(i=>{const opts=optionsFor(i.original,r);return `<li><div><b>${e62(i.name)}</b>${i.substituted?'<span class="pill">zamiennik</span>':''} — ~${round(i.qty*qty,1)} ${isEggPiece(i.name,i.qty)?'szt.':'g'} <span class="muted">(~${money(i.cost*qty)})</span></div>${opts.length?`<label class="muted">Zamiennik <select aria-label="Zamiennik ${e62(i.original)}" onchange="kamis62SetSub(${r.id},decodeURIComponent('${encodeURIComponent(i.original)}'),this.value)"><option value="">Bez zamiany (${e62(i.original)})</option>${opts.map(o=>`<option value="${e62(o[0])}" ${i.name===o[0]?'selected':''}>${e62(o[0])}</option>`).join('')}</select></label>`:''}${i.hint?`<small>${e62(i.hint)}</small>`:''}</li>`}).join('')}</ul><div class="v62-notice">Zamienniki zmieniają smak i mogą wymagać zmiany czasu gotowania. Przy alergiach sprawdzaj etykiety i ślady alergenów — algorytm nie gwarantuje bezpieczeństwa.</div><h3>📊 Wartości odżywcze na porcję</h3>${summaryNutrition(r)}<div class="pill">${difficulty(r).icon} ${difficulty(r).name} · ${r.steps.length} kroków · ~${r.minutes||'20–45'} min</div><p class="muted">Jeżeli dodasz własną fotografię, zastąpi ona ilustrację także bez internetu. Zapis jest tylko na tym urządzeniu (nie w eksporcie JSON).</p><label class="v62-photo-upload">📷 Dodaj dokładne zdjęcie tej potrawy <input type="file" accept="image/*" onchange="kamis62Photo(event,${r.id})"></label></section>`;
}
showRecipe=function(id){const r=getR(id);if(!r)return;previous.showRecipe(id);const root=$62('dialogBody');if(!root)return;
 // Własne gramatury zastępują TYLKO wyświetlaną listę; źródłowy przepis pozostaje bez zmian.
 const heads=[...root.querySelectorAll('h3')];const header=heads.find(h=>h.textContent.trim().startsWith('Składniki ('));
 if(header){const originalList=header.nextElementSibling;if(originalList&&originalList.tagName==='UL')originalList.remove();header.remove()}
 const h=heads.find(h=>h.textContent.trim()==='Przygotowanie');
 if(h)h.insertAdjacentHTML('beforebegin',ingredientPanel(r));
 const im=root.querySelector('img.food');if(im){im.alt='Zdjęcie własne potrawy lub autorska ilustracja dopasowana do przepisu';im.setAttribute('loading','lazy')}
 const p=root.querySelector('p.muted');if(p&&p.textContent.includes('Zdjęcie poglądowe'))p.textContent=p.textContent.replace('Zdjęcie poglądowe','Ilustracja potrawy');const notice=root.querySelector('p.notice');if(notice)notice.textContent=notice.textContent.replace('Zdjęcie ilustruje typ potrawy, nie konkretny przepis.','Domyślny rysunek jest dopasowany do rodzaju dania; możesz dodać własne zdjęcie.');
};

// Cztery makroskładniki na kartach. Wartości historycznych danych pozostają nietknięte.
card=function(r,actions=true){const html=previous.card(r,actions);const marker='<div class="inside">';const n=nutrition62(r);const tag=`<div class="v62-cardmeta">${difficulty(r).icon} ${difficulty(r).name} · ~${n.p} g białka · ~${n.c} g węgl. · ~${n.f} g tł.</div>`;return html.replace(marker,marker+tag).replaceAll('Zdjęcie poglądowe kategorii dania','Ilustracja potrawy');};

// Ostrożne scalanie: łączymy tylko oczywiste równoważne nazwy, nie różne alergeny.
const canonicalGroups=[['Jogurt naturalny','jogurt naturalny','jogurt zwykły'],['Ryż','ryż','ryz'],['Ryż basmati','ryż basmati','ryz basmati'],['Pierś z kurczaka','pierś z kurczaka','filet z kurczaka'],['Pomidor','pomidor','pomidory'],['Jajka','jajka','jajko'],['Oliwa z oliwek','oliwa z oliwek','oliwa'],['Cebula','cebula','cebule'],['Czosnek','czosnek','ząbki czosnku']];
function canon(name){let key=clean(name);for(const [label,...names] of canonicalGroups){if(names.some(a=>clean(a)===key))return label;}return name}
function pantryQty(name){const direct=x62.pantryGrams[clean(canon(name))];return Math.max(0,Number(direct)||0)}
function packSize(name){const n=clean(name);if(/jajka|jajko/.test(n))return 10;if(/mleko|passata|jogurt|skyr|kefir/.test(n))return 500;if(/olej|oliwa/.test(n))return 500;if(/czosnek|imbir|pasta curry|przypraw|kumin|oregano|cynamon|papryka slodka/.test(n))return 50;if(/makaron|ryz|ryż|kasz|platki|płatki|maka|mąka/.test(n))return 500;if(/ser|mozzarella|twarog|twaróg|szpinak/.test(n))return 200;if(/mieso|mięso|kurczak|indyk|wołow|wolow|wieprz|ryb|losos|łosoś/.test(n))return 500;return 250;}
function shoppingList(){if(!data.plan)return [];const ppl=sanitizeNum(data.plan.people||data.people,1,12);const map=new Map();for(const entry of data.plan.entries){entry.ids.forEach((id,idx)=>{const r=getR(id);if(!r)return;const factor=(window.kamis63Factor?.(entry,idx)||1);for(const item of ingredients(r)){const n=canon(item.name);const key=clean(n);const v=map.get(key)||{name:n,qty:0,cost:0};v.qty+=asGrams(item.name,item.qty)*ppl*factor;v.cost+=item.cost*ppl*factor;map.set(key,v)}})}return [...map.values()].map(it=>{const have=Math.min(it.qty,pantryQty(it.name));const missing=Math.max(0,it.qty-have);const usableCost=it.qty?it.cost*(missing/it.qty):0;const size=packSize(it.name);const packs=missing?Math.ceil(missing/size):0;const packageCost=missing?usableCost*(packs*size/missing):0;return {...it,have,missing,packs,size,usableCost,packageCost}}).sort((a,b)=>a.name.localeCompare(b.name,'pl'));}
window.kamis62PantryQty=(key,v)=>{x62.pantryGrams[clean(decodeURIComponent(key))]=Math.min(100000,Math.max(0,Number(v)||0));persist();requestAnimationFrame(()=>render())};
shopping=function(){if(!data.plan)return previous.shopping();const list=shoppingList(),used=list.reduce((s,x)=>s+x.usableCost,0),packageTotal=list.reduce((s,x)=>s+x.packageCost,0);
 return `<section class="panel"><h2>🛒 Lista zakupów 2.0</h2><p class="muted">Scalone składniki na cały plan • ilości dla ${data.plan.people||data.people} os. • ceny orientacyjne, nie oferty sklepów.</p><div class="v62-macros"><div><b>~${money(used)}</b><small>zużywane składniki do dokupienia</small></div><div><b>~${money(packageTotal)}</b><small>orientacyjnie pełne opakowania</small></div></div><p class="v62-notice">Wpisz przy produktach, ile gramów już masz w domu. Wtedy Kamiś odejmie tę ilość. Dla produktów liczonych w sztukach opakowania są bardzo przybliżone.</p>${list.map(it=>{const key=encodeURIComponent(canon(it.name));return `<div class="v62-shopitem"><label class="shopping"><input type="checkbox" ${data.checked[it.name]?'checked':''} onchange="checkItem(decodeURIComponent('${key}'),this.checked)"><span class="item" style="${data.checked[it.name]?'text-decoration:line-through;opacity:.5':''}"><b>${e62(it.name)}</b><br><small>Potrzeba ${round(it.qty,1)} g · Masz ${round(it.have,1)} g · Dokup ${round(it.missing,1)} g</small></span><span class="price">~${money(it.usableCost)}</span></label><div class="v62-shopmeta"><label>W domu (g) <input aria-label="Ile masz ${e62(it.name)}" type="number" min="0" step="10" value="${round(pantryQty(it.name),1)}" onchange="kamis62PantryQty('${key}',this.value)"></label><small>~${it.packs} × ${it.size} g/opak. · ~${money(it.packageCost)}</small></div></div>`}).join('')}<div class="actions">${btn('Kopiuj listę','copyShopping()','btn alt')}${btn('Odznacz wszystko','clearChecks()','btn alt')}</div></section>`;
};
copyShopping=function(){if(!data.plan)return;const t='Kamiś 6.2 — zakupy\n'+shoppingList().filter(i=>i.missing>0).map(i=>`${i.name}: potrzeba ${round(i.qty,1)} g; masz ${round(i.have,1)} g; dokup ${round(i.missing,1)} g (~${money(i.usableCost)})`).join('\n');if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>alert('Skopiowano listę.')).catch(()=>prompt('Skopiuj listę:',t));else prompt('Skopiuj listę:',t)};

// Zaproponuj wyłącznie alternatywy z tej samej kategorii posiłku i bez wykluczeń.
function candidateSavings(){if(!data.plan)return [];const currentCost=data.plan.entries.flatMap(e=>e.ids).reduce((s,id)=>{const r=getR(id);return s+(r?cost62(r)*data.plan.people:0)},0);const pool=[];for(const entry of data.plan.entries){entry.ids.forEach((id,idx)=>{const old=getR(id);if(!old)return;const oldCost=cost62(old);const opts=recipes.filter(r=>r.meal===old.meal&&r.id!==old.id&&allowed(r)&&(!data.timeFilter || Number(r.minutes||35)<=data.timeFilter)&&((data.plan.mode==='protein'||data.plan.mode==='gym')?r.protein>=old.protein*.8:true)&&(data.plan.mode==='low'?r.calories<=old.calories*1.1:true)).map(r=>({r,saving:(oldCost-cost62(r))*data.plan.people})).filter(x=>x.saving>=2).sort((a,b)=>b.saving-a.saving).slice(0,2);for(const o of opts)pool.push({day:entry.day,index:idx,old,new:o.r,saving:o.saving,newTotal:currentCost-o.saving})});}return pool.sort((a,b)=>b.saving-a.saving).slice(0,12)}
function budgetView(){if(!data.plan)return `<section class="panel"><h2>💰 Inteligentny budżet</h2><p>Najpierw wygeneruj plan.</p>${btn('Zaplanuj',"setPage('wizard')")}</section>`;
 const current=data.plan.entries.flatMap(e=>e.ids).reduce((s,id)=>s+cost62(getR(id))*data.plan.people,0);const suggestions=candidateSavings();
 return `<section class="panel"><h2>💰 Inteligentny budżet</h2><p>Sprawdź tańsze zamienniki posiłków bez usuwania pozostałych dań. Żadna zmiana nie zostanie wprowadzona automatycznie.</p><div class="v62-macros"><div><b>${money(current)}</b><small>koszt składników w planie</small></div><div><b>${money(data.plan.budget)}</b><small>Twój budżet</small></div><div><b>${money(Math.max(0,current-data.plan.budget))}</b><small>ew. przekroczenie</small></div></div><p class="muted">Wyliczenia dotyczą składników zużytych do porcji, nie pełnych opakowań. Alternatywy mogą mieć inny skład i wartości odżywcze; sprawdź je przed zaakceptowaniem.</p>${suggestions.length?suggestions.map(s=>`<div class="v62-budgetitem"><div><strong>${e62(DAYS[s.day])}: ${e62(s.old.name)}</strong><p class="muted">Zamiast tego: <b>${e62(s.new.name)}</b> · oszczędność ~${money(s.saving)} · ${difficulty(s.new).name}</p></div><div class="actions">${btn('Zobacz przepis',`showRecipe(${s.new.id})`,'btn alt')}${btn('Zmień tylko ten posiłek',`kamis62ApplyBudget(${s.day},${s.index},${s.new.id})`)}</div></div>`).join(''):'<p class="notice">Nie znaleziono obecnie tańszych zgodnych zamienników.</p>'}<div class="actions">${btn('← Wróć do jadłospisu',"setPage('plan')",'btn alt')}</div></section>`;
}
window.kamis62ApplyBudget=(day,index,id)=>{if(!data.plan)return;const entry=data.plan.entries.find(e=>e.day===Number(day));const r=getR(id),old=getR(entry?.ids[index]);if(!entry||!r||!old||old.meal!==r.meal||!allowed(r))return;
 if(!confirm(`Zamienić tylko ten posiłek: ${old.name} → ${r.name}?`))return;
 entry.ids[index]=r.id;data.checked={};persist();setPage('plan');
};

planView=function(){return previous.planView().replace('</section>',`${data.plan?`<div class="actions"><button class="btn" onclick="setPage('budget62')">💰 Inteligentny budżet</button></div>`:''}</section>`)};
summary=function(){let html=previous.summary();if(!data.plan)return html;const ids=data.plan.entries.flatMap(e=>e.ids).map(getR).filter(Boolean);const totals=ids.reduce((v,r)=>{const n=nutrition62(r);return {p:v.p+n.p,c:v.c+n.c,f:v.f+n.f,kcal:v.kcal+n.kcal,coverage:v.coverage+n.coverage}}, {p:0,c:0,f:0,kcal:0,coverage:0});const dayCount=Math.max(1,data.plan.entries.length);
 const block=`<section class="panel"><h2>📊 Makroskładniki — dodatkowe szacunki</h2><p>Średnio na jeden zaplanowany dzień, dla jednej osoby. To podsumowanie składników z bazy, bez narzucania celów energetycznych.</p><div class="v62-macros"><div><b>${Math.round(totals.kcal/dayCount)} kcal</b><small>energia</small></div><div><b>${round(totals.p/dayCount,1)} g</b><small>białko</small></div><div><b>${round(totals.c/dayCount,1)} g</b><small>węglowodany</small></div><div><b>${round(totals.f/dayCount,1)} g</b><small>tłuszcze</small></div></div><p class="muted">Dane przybliżone. Rozpoznana masa składników: ~${Math.round(totals.coverage/Math.max(1,ids.length)*100)}%. Rzeczywiste wartości zależą od marki, obróbki i porcji.</p></section>`;return html+block};

tabs=function(){previous.tabs();const selected=page==='budget62'?'active':'';$62('tabs').insertAdjacentHTML('beforeend',`<button class="tab ${selected}" onclick="setPage('budget62')">💰 Budżet</button>`);};
home=function(){return previous.home()+`<section class="panel"><h2>✨ Nowe w Kamiś 6.2</h2><p>Przeliczanie porcji, zamienniki produktów, makroskładniki, inteligentne zakupy i dobór tańszych posiłków.</p><div class="actions">${btn('💰 Sprawdź budżet',"setPage('budget62')")}${btn('🛒 Zakupy 2.0',"setPage('shopping')",'btn alt')}${btn('🍳 Przepisy i gramatury',"setPage('recipes')",'btn alt')}</div><div class="v62-offline">📱 <span id="kamis62Status">Dostęp offline po pierwszym poprawnym uruchomieniu na HTTPS i zapisaniu plików.</span></div></section>`};
goBack=function(){if(page==='budget62'){setPage('plan');return}previous.goBack()};
render=function(){if(page==='budget62'){tabs();$62('content').innerHTML=budgetView();$62('backBtn').style.display='inline-block'}else previous.render();const s=$62('kamis62Status');if(s)s.textContent=navigator.onLine?'Pliki aplikacji są przechowywane do działania offline. Zdjęcia zastąpiono lokalnymi ilustracjami.':'Działasz offline: przepisy i zapisane dane są dostępne lokalnie.';};
window.addEventListener('online',()=>{const s=$62('kamis62Status');if(s)s.textContent='Połączenie internetowe przywrócone.'});
window.addEventListener('offline',()=>{const s=$62('kamis62Status');if(s)s.textContent='Działasz offline: przepisy i zapisane dane są dostępne lokalnie.'});
render();
})();
