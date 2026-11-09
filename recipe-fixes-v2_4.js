/* Kamiś 2.4 — poprawki zgodności receptur. Nie zmienia ID ani zapisów użytkownika. */
(()=>{'use strict';
const changes=[];const make=(r,reason)=>{if(!changes.some(x=>x.id===r.id))changes.push({id:r.id,name:r.name,reason})};
const norm=s=>String(s||'').toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
const has=(r,pat)=>r.ingredients.some(i=>pat.test(norm(i[0])));
const item=(r,pat)=>r.ingredients.find(i=>pat.test(norm(i[0])));
const q=(r,pat)=>Number(item(r,pat)?.[1]||0);
const ingr=(r,pat)=>item(r,pat)?.[0]||'';
const fmt=n=>Number(n).toLocaleString('pl-PL',{maximumFractionDigits:1});
const amount=(r,pat)=>`${fmt(q(r,pat))} ${/\bjajka?\b/.test(norm(ingr(r,pat))) && q(r,pat)<=12?'szt.':'g'}`;
const update=(r,steps,why)=>{r.steps=steps;r.k24Checked=true;make(r,why)};
const setIngredient=(r,pat,name,qty,price)=>{const i=r.ingredients.findIndex(x=>pat.test(norm(x[0])));if(i>=0){const old=r.ingredients[i];r.ingredients[i]=[name,qty,Number.isFinite(price)?price:old[2]];}}
function meatStep(r){
 const meat=item(r,/pier[sś]|kurcz|indy|wolow|wieprz|mielon|losos|tunczyk|szynka|kielbasa|tofu|ciecierzyc|fasola|mozzarella|feta|ser/);
 if(!meat)return [];
 const n=norm(meat[0]),g=fmt(meat[1]);
 if(/pier[sś]|kurcz|indy/.test(n)&&!/szynk|wedzon/.test(n))return [`${g} g mięsa (${meat[0].toLowerCase()}) pokrój w kostkę 1,5–2 cm. Nie myj surowego drobiu; po kontakcie umyj dłonie i przybory.`, `Na rozgrzanej patelni smaż mięso na średnim ogniu około 7–10 minut, obracając, aż temperatura w środku osiągnie 74°C. Przełóż na czysty talerz.`];
 if(/wolow/.test(n))return [`${g} g wołowiny pokrój w cienkie paski w poprzek włókien. Dla mięsa gulaszowego użyj zamiast tego pokrojonych kawałków i duś 75–110 minut do miękkości.`, `Krótko smaż wyłącznie miękkie kawałki przeznaczone na patelnię; stopień dopieczenia sprawdź termometrem. Gotowe mięso przełóż na talerz.`];
 if(/wieprz/.test(n))return [`${g} g wieprzowiny pokrój na drobne, równe kawałki. Użyj miękkiego kawałka do szybkiego smażenia; twardszy duś do miękkości.`, `Podsmaż mięso, następnie dogotuj do bezpiecznej temperatury właściwej dla użytego kawałka; nie podawaj niedopieczonego.`];
 if(/losos|ryb/.test(n))return [`${g} g ryby przygotuj oddzielnie, usuwając ości. Piecz lub smaż do bezpiecznej temperatury wewnętrznej 63°C.`];
 if(/tunczyk/.test(n))return [`${g} g tuńczyka z puszki dokładnie odsącz z zalewy.`];
 if(/ciecierzyc|fasola/.test(n))return [`${g} g ${meat[0].toLowerCase()} (ugotowanej lub z puszki) opłucz i odsącz; przy suchej najpierw ugotuj zgodnie z opakowaniem.`];
 if(/tofu/.test(n))return [`${g} g tofu osusz ręcznikiem, pokrój w kostkę i podsmaż na suchej lub lekko natłuszczonej patelni około 5–7 minut.`];
 if(/ser|feta|mozzarella/.test(n))return [`${g} g ${meat[0].toLowerCase()} pokrusz lub pokrój na kawałki do posypania gotowej potrawy.`];
 return [`${g} g ${meat[0].toLowerCase()} pokrój lub odcedź odpowiednio do produktu; przy mięsie surowym ugotuj je bezpiecznie przed podaniem.`];
}
// Dodatkowa kontrola wszystkich receptur: skoryguj nadmiar świeżych ziół i połącz zduplikowane składniki.
for(const r of recipes){
 const n=norm(r.name);
 for(const ing of r.ingredients){
  const key=norm(ing[0]);
  if(/^(bazylia|koperek|mieta|natka pietruszki|szczypiorek|swieza kolendra)$/.test(key)&&ing[1]>35){
   const old=ing[1];ing[1]=15;ing[2]=Math.round((Number(ing[2])||0)*15/old*100)/100;
   make(r,'Zbyt duża ilość świeżych ziół; poprawiono gramaturę');
  }
  if(/^rukola$/.test(key)&&n.includes('bajgiel')&&ing[1]>40){
   const old=ing[1];ing[1]=25;ing[2]=Math.round((Number(ing[2])||0)*25/old*100)/100;
   make(r,'Zmniejszono ilość rukoli w bajglu do realnej porcji');
  }
 }
 // Duplikaty składników pochodzą z generatora wariantów; sumowanie ilości zachowuje skład.
 const seen=new Map(),arr=[];let hadDup=false;
 for(const ing of r.ingredients){const key=norm(ing[0]);if(seen.has(key)){
    const i=seen.get(key);arr[i][1]+=Number(ing[1])||0;arr[i][2]+=(Number(ing[2])||0);hadDup=true;
  }else{seen.set(key,arr.length);arr.push([...ing]);}}
 if(hadDup){
  if(/^(frittata|szakszuka)/.test(n)){
   const onion=arr.find(i=>norm(i[0])==='cebula');
   if(onion&&onion[1]>90){const old=onion[1];onion[1]=70;onion[2]=Math.round(onion[2]*70/old*100)/100;}
  }
  r.ingredients=arr;
  make(r,'Scalono powtarzające się produkty na liście składników');
 }
}
for(const r of recipes){
 const name=norm(r.name);
 if(name==='omlet bananowo-owsiany'){
  update(r,[`Odmierz ${amount(r,/platki/)} płatków owsianych i zmiel je blenderem na mąkę albo rozdrobnij w młynku. Jeśli nie masz blendera, użyj płatków błyskawicznych i odstaw masę dłużej.`,`Obierz ${amount(r,/banan/)} banana; rozgnieć widelcem na jednolite puree bez dużych kawałków.`,`Rozbij ${amount(r,/jajk/)} jajek do miski, roztrzep, dodaj puree bananowe i rozdrobnione płatki. Wymieszaj trzepaczką do powstania gęstej, jednolitej masy. Odstaw na 5–8 minut, żeby płatki nasiąkły.`,`Rozprowadź ${amount(r,/oliw/)} oliwy na małej patelni (18–20 cm) i rozgrzej ją na małym ogniu. Wylej masę, przykryj pokrywką i smaż około 5–7 minut, aż spód się zetnie.`,`Gdy wierzch niemal się zetnie, obróć omlet przy pomocy talerza lub szerokiej łopatki i smaż jeszcze 1–2 minuty. Podaj jako zwarty, miękki omlet, nie mieszaj na patelni.`],'Omlet ma powstać ze zwartej masy, a nie jajecznicy');
  r.minutes=Math.max(20,r.minutes||0);
 }else if(name==='krem kakaowo-bananowy'){
  update(r,[`Obierz ${amount(r,/banan/)} dojrzałego banana i dokładnie rozgnieć widelcem.`,`Dodaj ${amount(r,/skyr/)} schłodzonego skyru naturalnego i ${amount(r,/kakao/)} kakao. Zblenduj 30–45 sekund do całkowicie gładkiej konsystencji kremu. Bez blendera rozcieraj energicznie widelcem 2–3 minuty.`,`Przełóż do pucharka i wstaw do lodówki na 15–20 minut, aby zgęstniał. To gęsty deser jogurtowo-owocowy, a nie pieczony krem czy budyń.`],'Gładki krem z trzech składników, nie sucha mieszanka');r.minutes=Math.max(22,r.minutes||0);
 }else if(name.startsWith('zupa krem z dodatkami')){
  setIngredient(r,/bulion warzywny/,'Woda lub gotowy bulion warzywny',350,1.5);
  const veg=item(r,/papryk|szpinak|pieczark|pomidor|cukini|kukurydz|fasola|feta|tofu|losos|tunczyk|brokul|mozzarella|ciecierzyc|koperek|bazylia/);
  const garnish=veg?`${fmt(veg[1])} g ${veg[0].toLowerCase()}`:'dodatki z listy';
  update(r,[`Obierz i umyj ${amount(r,/marchew/)} marchewki, ${amount(r,/ziemniak/)} ziemniaków i ${amount(r,/cebul/)} cebuli. Pokrój warzywa w kostkę około 1,5 cm.`,`Wlej do garnka ${fmt(q(r,/woda lub gotowy bulion/))} ml wody albo gotowego bulionu warzywnego (nie obydwu). Jeśli używasz wody, włóż do niej posiekaną cebulę, marchew i przyprawy z listy; zagotuj i gotuj około 8 minut, aby powstała warzywna baza zupy.`,`Dodaj ziemniaki, przykryj garnek i gotuj na małym ogniu 15–20 minut, aż ziemniaki i marchew będą całkiem miękkie. W wersji z gotowym bulionem wykonaj te same czynności, lecz bez wstępnego gotowania bazy na wodzie.`,`Zdejmij garnek z ognia. Zblenduj warzywa wraz z płynem na jednolity krem; jeśli jest za gęsty, dolej niewielką ilość przegotowanej wody, mieszając.`,...meatStep(r),`Osobno przygotuj dodatek „${veg?.[0]||"warzywa"}” w ilości ${veg?fmt(veg[1]):"podanej w przepisie"} g: jeśli jest to warzywo, oczyść, pokrój i podduś 3–6 minut do miękkości; zioła opłucz i posiekaj bez smażenia, ser dodaj po zdjęciu z ognia. Nie dodawaj surowego mięsa do gotowego kremu.`,`Przelej krem do miski, na wierzch ułóż bezpiecznie przygotowane mięso lub inne dodatki. Dopraw do smaku przyprawami z listy.`],'Zupa krem: prawidłowa ilość płynu, gotowanie, blendowanie i przygotowanie dodatków');r.minutes=Math.max(35,r.minutes||0);
 }else if(name.startsWith('placuszki owocowe')){
  if(!has(r,/jajk/)){r.ingredients.push(['Jajko',55,1.2]);r.calories=(Number(r.calories)||0)+75;r.protein=(Number(r.protein)||0)+6;}
  const fruit=r.ingredients.find(i=>!/maka|jogurt|jajk/.test(norm(i[0])))||['Owoce',100];
  update(r,[`Przygotuj owoce „${fruit[0]}” (${fmt(fruit[1])} g): owoce ze skórką umyj, banana obierz, usuń gniazda nasienne lub pestki, jeśli występują. Połowę rozgnieć na puree, drugą część pokrój do podania.`,`Roztrzep 1 jajko (${amount(r,/jajk/)}) z ${amount(r,/jogurt/)} jogurtu naturalnego, wsyp ${amount(r,/maka/)} mąki owsianej i wymieszaj na gęste ciasto bez grudek.`,`Dodaj połowę owoców, delikatnie wymieszaj i odstaw ciasto na 5 minut. Nie dolewaj wody, jeśli konsystencja pozwala nakładać placki łyżką.`,`Rozgrzej nieprzywierającą patelnię na średnio-małym ogniu. Nakładaj małe porcje ciasta (po 1–2 łyżki), pozostawiając odstępy.`,`Smaż około 3–4 minuty z pierwszej strony, a gdy brzegi się zetną, obróć łopatką i smaż kolejne 2–3 minuty. Podaj z pozostałymi owocami.`],'Placuszki: kompletne ciasto, spoiwo i realna technika smażenia');
 }else if(name.startsWith('placki jogurtowe')){
  const names=r.ingredients.slice(4).map(i=>`${fmt(i[1])} g ${i[0].toLowerCase()}`);
  update(r,[`W jednej misce wymieszaj ${amount(r,/maka/)} mąki pszennej z dodatkami suchymi, np. kakao, jeśli występuje na liście.`,`W drugiej misce roztrzep ${amount(r,/jajk/)} jajek z ${amount(r,/jogurt/)} jogurtu naturalnego. Nie dodawaj mleka — tego składnika nie ma w tej recepturze.`,`Połącz masę mokrą z mąką i wymieszaj krótko trzepaczką, tylko aż znikną grudki. Dodaj składniki wariantu: ${names.join(' oraz ')}; owoce pokrój w małe kawałki.`,`Rozgrzej na patelni ${amount(r,/olej/)} oleju na średnio-małym ogniu. Nakładaj po 1–2 łyżki ciasta na placuszek.`,`Smaż około 2–3 minuty, aż brzegi będą ścięte i pojawią się pęcherzyki; obróć i smaż jeszcze około 2 minuty. W środku nie powinno pozostać surowe ciasto.`],'Placki jogurtowe: usunięto nieistniejące mleko z instrukcji');
 }else if(name.startsWith('omlet puszysty')){
  const eggs=q(r,/jajk/),milk=q(r,/mlek/),oil=q(r,/oliw/);const toppings=r.ingredients.slice(3);
  update(r,[`Przygotuj ${fmt(eggs)} g jajek (około ${Math.max(1,Math.round(eggs/55))} szt.). Oddziel białka od żółtek do dwóch czystych misek.`,`Do żółtek wlej ${fmt(milk)} g mleka i wymieszaj widelcem. Białka ubij trzepaczką lub mikserem na lekką, sztywną pianę.`,`Dodaj do żółtek najpierw 1/3 piany, potem pozostałą część, delikatnie mieszając szpatułką od dołu, aby nie stracić puszystości.`,`Dodatki: ${toppings.map(i=>fmt(i[1])+' g '+i[0].toLowerCase()).join(', ')}. Warzywa umyj i pokrój drobno, sery pokrusz. Wilgotne warzywa osusz, by omlet nie był wodnisty.`,`Na małej patelni rozgrzej ${fmt(oil)} g oliwy, wlej masę jajeczną, rozłóż dodatki, przykryj i smaż na bardzo małym ogniu około 5–7 minut. Nie mieszaj masy podczas smażenia.`,`Gdy omlet jest ścięty w środku, ostrożnie złóż go na pół i przełóż na talerz. Jeśli spód brązowieje za szybko, zmniejsz moc kuchenki.`],'Omlet puszysty: napowietrzenie przez ubite białka');
 }else if(name.startsWith('pieczone owoce pod kruszonka')){
  if(!has(r,/maslo|olej|oliw/)){r.ingredients.push(['Masło',12,0.7]);r.calories=(Number(r.calories)||0)+86;}
  const fruit=r.ingredients.find(i=>!/platki|jogurt|maslo/.test(norm(i[0])))||['Owoce',110];
  update(r,[`Rozgrzej piekarnik do 180°C. Umyj ${fmt(fruit[1])} g ${fruit[0].toLowerCase()}, usuń pestki lub gniazda nasienne i pokrój większe owoce na równe kawałki.`,`Przełóż owoce do małej foremki żaroodpornej.`,`W miseczce połącz ${amount(r,/platki/)} płatków owsianych z ${amount(r,/maslo/)} zimnego masła; rozcieraj palcami, aż powstanie sypka kruszonka.`,`Posyp owoce przygotowaną kruszonką. Piecz 18–22 minuty, aż owoce zmiękną, a wierzch zrobi się złocisty.`,`Odczekaj 5 minut i podawaj z ${amount(r,/jogurt/)} jogurtu naturalnego.`],'Kruszonka musi mieć spoiwo, nie tylko suche płatki');
 }else if(name.startsWith('ramen domowy z ')){
  setIngredient(r,/^bulion$/,'Woda lub gotowy bulion',450,3);
  const meat=meatStep(r);
  update(r,[`Przygotuj ${fmt(q(r,/jajk/))} g jajka (około 1 szt.): włóż do wrzątku i gotuj 8–9 minut, następnie schłodź, obierz i przekrój na pół.`,...meat,`Umyj i pokrój w cienkie paski ${amount(r,/marchew/)} marchewki, ${amount(r,/pieczark/)} pieczarek oraz ${amount(r,/szpinak/)} szpinaku. Zetrzyj ${amount(r,/imbir/)} imbiru; szczypiorek posiekaj.`,`Wlej do garnka ${fmt(q(r,/woda lub gotowy bulion/))} ml wody lub gotowego bulionu. Jeśli używasz wody, dodaj marchew, pieczarki, imbir i ${amount(r,/sos sojowy/)} sosu sojowego. Doprowadź do wrzenia i gotuj 8–10 minut; warzywa utworzą lekki wywar.`,`Jeżeli masz gotowy bulion, zagotuj go z imbirem, sosem sojowym i warzywami; gotuj około 6–8 minut. W obu wariantach dodaj szpinak na ostatnie 2 minuty.`,`Ugotuj osobno ${amount(r,/makaron/)} makaronu ramen zgodnie z opakowaniem (zwykle 3–5 minut), odcedź i rozdziel do misek.`,`Wlej gorącą zupę do miski z makaronem. Ułóż ugotowane mięso lub inne dodatki, jajko i posyp szczypiorkiem. Sprawdź, czy wszystkie składniki wymagające gotowania są bezpiecznie przygotowane.`], 'Ramen: przygotowanie bazy bulionu/wody i wszystkich dodatków');
 }else if(name.startsWith('zupa kokosowa z ')){
  setIngredient(r,/^bulion$/,'Woda lub gotowy bulion',300,2);
  r.steps=r.steps.map(s=>s.replace(/Bulion zagotuj z imbirem/i, 'Zagotuj 300 ml wody lub gotowego bulionu z 12 g startego imbiru; przy wodzie najpierw gotuj przez 8 minut także marchew i pieczarki, aby powstała warzywna baza. W wersji z gotowym bulionem zagotuj go razem z imbirem'));
  make(r, 'Zupa kokosowa: wyjaśniono przygotowanie wywaru i użycie bulionu');
 }else if(name.startsWith('omlet z ')){
  const egg=item(r,/jajk/);if(egg && egg[1]<=2){egg[1]=3;egg[2]=Math.round(egg[2]*1.5*100)/100;r.calories=(r.calories||0)+75;r.protein=(r.protein||0)+6;}
  const milk=item(r,/mlek/);if(milk&&milk[1]>40){const old=milk[1];milk[1]=30;milk[2]=Math.round((milk[2]||0)*30/old*100)/100;}
  const veg=r.ingredients.filter(i=>/szpinak|papryk|cebul|pieczark|cukini|pomidor|brokul|kukurydz|koper|bazyl|feta/.test(norm(i[0])));
  update(r,[`Rozbij ${fmt(q(r,/jajk/))} jajka do miski, dodaj ${amount(r,/mlek/)} mleka i ubij widelcem przez 45 sekund na jednolitą masę.`,...meatStep(r),`Warzywa i dodatki (${veg.map(i=>fmt(i[1])+' g '+i[0].toLowerCase()).join(', ')}) umyj i pokrój, a grubsze lub bardzo wilgotne dodatki krótko podduś na patelni, aby odparowała woda.`,`Rozgrzej ${amount(r,/oliw/)} oliwy na małej nieprzywierającej patelni. Wlej masę jajeczną i rozłóż równomiernie przygotowane dodatki.`,`Smaż bez mieszania pod przykryciem na małym ogniu około 6–9 minut, aż wierzch się zetnie. W razie potrzeby delikatnie obróć omlet łopatką i dosmaż 1–2 minuty.`,`Złóż gotowy omlet na pół lub podawaj płasko. To ma być jeden zwarty placek jajeczny, nie jajecznica.`], 'Omlet: poprawione proporcje jajek do płynu i technika bez mieszania');
 }else if(name.startsWith('frittata z ')){
  const egg=item(r,/jajk/);if(egg&&egg[1]<=2){egg[1]=3;egg[2]=Math.round(egg[2]*1.5*100)/100;r.calories=(r.calories||0)+75;r.protein=(r.protein||0)+6;}
  const add=r.ingredients.filter(i=>!/jajk|ziemniak|cebul|przypraw/.test(norm(i[0])));
  update(r,[`Rozgrzej piekarnik do 185°C. Obierz i pokrój ${amount(r,/ziemniak/)} ziemniaków w cienkie plasterki (3–4 mm), obgotuj 8 minut, po czym odsącz.`,...meatStep(r),`Pokrój ${amount(r,/cebul/)} cebuli w drobną kostkę i podsmaż około 3 minuty na nieprzywierającej patelni z łyżką wody. Dodaj ziemniaki i gotowe dodatki: ${add.map(i=>fmt(i[1])+' g '+i[0].toLowerCase()).join(', ')}.`,`W misce roztrzep ${fmt(q(r,/jajk/))} jajka z przyprawami podanymi w składnikach. Nie dodawaj mleka ani mąki — nie ma ich w tej recepturze.`,`Przełóż mieszankę do małego naczynia do zapiekania lub patelni przeznaczonej do piekarnika i zalej równomiernie masą jajeczną.`,`Piecz w 185°C przez 16–22 minuty, aż środek frittaty będzie całkowicie ścięty. Odczekaj 3 minuty przed krojeniem, żeby nie rozpadła się na jajecznicę.`],'Frittata: poprawiono proporcję jajek i wyraźnie opisano pieczenie');
 }else if(name.startsWith('krem skyr z ')){
  const extras=r.ingredients.filter(i=>!/skyr|miod/.test(norm(i[0])));
  update(r,[`Przełóż ${amount(r,/skyr/)} schłodzonego skyru naturalnego do miseczki.`,`Dodaj ${amount(r,/miod/)} miodu i mieszaj trzepaczką 30–45 sekund, aż masa będzie jednolita.`,`Przygotuj dodatki: ${extras.map(i=>fmt(i[1])+' g '+i[0].toLowerCase()).join(' oraz ')}. Owoce umyj i wypestkuj, jeżeli to konieczne; kakao wsyp bezpośrednio do masy.`,`Połącz skyr z odpowiednimi dodatkami i zmiksuj blenderem 30 sekund albo rozetrzyj widelcem do gładkiej konsystencji.`,`Schłodź 10–15 minut; przed podaniem dołóż ewentualne kawałki owoców na wierzch.`],'Skyr: instrukcja bez losowych składników jogurt/twaróg/orzechy');
 }else if(name.startsWith('jogurtowy deser warstwowy')){
  const extras=r.ingredients.filter(i=>!/jogurt|granola/.test(norm(i[0])));
  update(r,[`Odmierz ${amount(r,/jogurt/)} jogurtu greckiego i ${amount(r,/granola/)} granoli.`,`Przygotuj dodatki z listy: ${extras.map(i=>fmt(i[1])+' g '+i[0].toLowerCase()).join(' oraz ')}. Owoce umyj, osusz i ewentualnie pokrój, kakao rozetrzyj z częścią jogurtu.`,`W przezroczystej szklance ułóż 1/3 jogurtu, warstwę owoców oraz 1/3 granoli; powtórz, aż skończą się składniki.`,`Ostatnią część granoli wysyp bezpośrednio przed jedzeniem, aby pozostała chrupiąca. Nie dodawaj orzechów ani innych posypek, jeżeli nie ma ich w składnikach.`],'Deser warstwowy: tylko faktycznie wymienione składniki');
 }else if(name.startsWith('skyr w misce')){
  const originalSteps=r.steps.join(' | ');r.steps=r.steps.map(s=>s.replace(/jogurtem naturalnym|jogurtem|jogurt naturalny/gi,'skyrem naturalnym'));if(originalSteps!==r.steps.join(' | '))make(r,'Zgodność instrukcji ze składnikiem skyr');
 }else if(name.startsWith('placki owsiane z')){
  const meat=r.ingredients.find(i=>/kurcz|indyk|wolow|wieprz|losos|tunczyk|szynka|feta|tofu|ciecierzyc|fasola/.test(norm(i[0])));
  const veg=r.ingredients.filter(i=>/szpinak|papryk|cebul|pieczark|cukini|pomidor|brokul|kukurydz/.test(norm(i[0])));
  update(r,[`Rozdrobnij ${amount(r,/platki/)} płatków owsianych blenderem lub młynkiem do konsystencji grubej mąki.`,`Roztrzep ${amount(r,/jajk/)} jajek i wymieszaj z ${amount(r,/jogurt/)} jogurtu; dodaj płatki i odstaw masę na 8 minut.`,...meatStep(r),`Dodatki warzywne (${veg.map(i=>fmt(i[1])+' g '+i[0].toLowerCase()).join(', ')}) umyj, pokrój w drobną kostkę i krótko podduś, aż odparuje nadmiar płynu.`,`Przygotowany składnik „${meat?meat[0]:"dodatki"}” pokrój drobno i wymieszaj z ciastem. Masa ma być gęsta i nadawać się do nakładania łyżką.`,`Smaż niewielkie placuszki na nieprzywierającej patelni na małym ogniu około 3–4 minuty z każdej strony, aż zetną się w środku; nie mieszaj masy jak jajecznicy.`],'Placki owsiane: rzeczywiste ciasto i bezpiecznie przygotowane dodatki');
 }
}
// Uzupełnij osiem brakujących orientacyjnych czasów z prostych receptur bazowych.
const times={224:18,225:10,226:5,227:5,228:8,229:8,230:12,231:20};
for(const r of recipes){if(!r.minutes && Number.isFinite(times[r.id])){r.minutes=times[r.id];make(r,'Uzupełniono brakujący orientacyjny czas przygotowania');}}
// Kontrola nie usuwa żadnej receptury. Zostawia podgląd ilościowy i weryfikuje jej podstawową strukturę.
const idset=new Set(recipes.map(r=>Number(r.id)));
const missing=recipes.filter(r=>!r.name || !Array.isArray(r.ingredients)||!r.ingredients.length || !Array.isArray(r.steps)||r.steps.length<2 || r.ingredients.some(i=>!i[0]||!Number.isFinite(Number(i[1]))||Number(i[1])<=0));
const duplicated=recipes.length-idset.size;
const audit={version:'2.4',checked:recipes.length,unique:idset.size,missing:missing.map(r=>({id:r.id,name:r.name})),duplicated,corrected:changes.length,modifications:changes};
window.kamis24Audit=audit;
// Wyświetlaj dawki w prawidłowych jednostkach: jajka w sztukach dla ilości 1–10, w gramach dla 50–500.
function unitFor(i){const n=norm(i[0]),q=Number(i[1]);if(/\bjajka?\b/.test(n)){if(q<=12)return `${fmt(q)} szt.`;return `${fmt(q)} g (około ${Math.max(1,Math.round(q/55))} szt.)`;}if(/bulion|woda|mleko|sok|passata/.test(n))return `${fmt(q)} ml`;return `${fmt(q)} g`;}
const fullSteps=detailedSteps;
detailedSteps=function(r){const base=r.k24Checked?r.steps:fullSteps(r);if(r.k24Checked){return [`Przygotuj wszystkie składniki w ilościach: ${r.ingredients.map(i=>`${i[0]} — ${unitFor(i)}`).join('; ')}. Liczby dotyczą jednej porcji; przelicz je proporcjonalnie dla większej liczby osób.`,...base];}return base;};
// Moduł gotowania 2.3 wczytuje funkcję detailedSteps na bieżąco, więc automatycznie korzysta z poprawek.
const oldHome=home;home=function(){return oldHome().replace(/<section class="v20-release">[\s\S]*?<\/section>/,`<section class="v20-release"><div class="v20-kicker">AKTUALNA WERSJA • 2.4</div><h2>Nowości Kamiś 2.4</h2><p>Poprawione instrukcje wybranych rodzin dań: omlety, placuszki, zupy krem, desery i kruszonki. Naprawiona lista zakupów 2.0 — nazwy produktów, ilości i pola „W domu” ponownie są razem. Pozostałe funkcje bez zmian.</p></section>`);};
const oldRender=render;render=function(){oldRender();const count=document.getElementById('count');if(count)count.textContent=`${recipes.length} przepisów · 2.4`;};
window.kamis20CurrentVersion='2.4';
try{render()}catch(e){console.warn('Kamiś 2.4 render:',e)}
})();
