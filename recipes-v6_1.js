/* Kamiś 6.1: WYŁĄCZNIE nowe przepisy i instrukcje dotychczasowych dań.
   Nie zmieniamy identyfikatorów, nazw, składników, ocen, historii ani funkcji Kamiś 6.0. */
(() => {
'use strict';
const oldCount=recipes.length;
const allOriginalIds=new Set(recipes.map(r=>r.id));
const is=(v,re)=>re.test(String(v||''));
const label=r=>r.ingredients.map(i=>i[0]).join(' ').toLocaleLowerCase('pl');
const ingred=(r,i)=>r.ingredients[i]?.[0]||'';
const clean=(s)=>s.replace(/\s+/g,' ').trim();
const ingredientsList=(r)=>r.ingredients.map(x=>x[0]);
const contains=(r,s)=>r.ingredients.some(x=>x[0].toLowerCase().includes(s.toLowerCase()));
const finish='Podaj od razu na czystym talerzu. Podane minuty są orientacyjne: kieruj się stopniem przygotowania produktów i temperaturą w środku potrawy.';
const common='Przygotuj i odmierz wszystkie składniki z listy. Warzywa opłucz pod bieżącą wodą, a surowe produkty zwierzęce trzymaj osobno od żywności gotowej do spożycia.';
function meatCook(name){
 const n=name.toLocaleLowerCase('pl');
 const acc={'łopatka wieprzowa':'łopatkę wieprzową','wołowina na gulasz':'wołowinę na gulasz','wołowina':'wołowinę','polędwiczka wieprzowa':'polędwiczkę wieprzową','szynka':'szynkę','mozzarella':'mozzarellę'}[n]||n;
 if(/mięso mielone z indyka|mielon|indyk mielony/.test(n))return [
  `Rozdrobnij ${acc} na patelni; smaż na średnim ogniu przez około 8–11 minut, często mieszając, aż nie będzie surowych fragmentów.`,
  'Zmierz temperaturę w środku porcji: mielony drób musi osiągnąć co najmniej 74°C. Odłóż mięso na czysty talerz.'
 ];
 if(/kurczak|indyk|drobi|mięso z udka/.test(n))return [
  `Pokrój ${acc} w kawałki o zbliżonej grubości (około 1,5–2 cm). Nie opłukuj surowego drobiu.`,
  `Na dobrze rozgrzanej nieprzywierającej patelni przygotuj mięso partiami na średnim ogniu przez około ${/udka/.test(n)?'9–13':'7–10'} minut, obracając co 2–3 minuty. Dodaj łyżkę wody, jeśli zaczyna przywierać.`,
  'Sprawdź termometrem, czy drób osiągnął przynajmniej 74°C w środku; przełóż na czysty talerz.'
 ];
 if(/łopatk|na gulasz/.test(n))return [
  `Pokrój ${acc} w kostkę około 2 cm. Obsmaż w garnku przez 5–7 minut, obracając.`,
  'Wlej tyle wody, aby przykryła około połowę mięsa, przykryj i duś na małym ogniu około 75–110 minut. Mieszaj co 15 minut i uzupełniaj wodę; mięso musi dać się łatwo podzielić widelcem.',
  'Odłóż gotowe mięso; kilka łyżek płynu z duszenia można wykorzystać do sosu. Samo krótkie smażenie tego rodzaju mięsa nie wystarczy.'
 ];
 if(/polędwiczk/.test(n))return [
  `Oczyść ${acc} z twardych błon i pokrój w plastry grubości około 1,5 cm.`,
  'Smaż na rozgrzanej patelni około 3–4 minut na stronę (zależnie od grubości). Sprawdź temperaturę wewnętrzną co najmniej 63°C i odstaw na 3 minuty przed krojeniem.'
 ];
 if(/wołow/.test(n))return [
  `Pokrój ${acc} w cienkie paski w poprzek włókien. Jeśli to kawałek na gulasz, zamiast krótkiego smażenia duś go pod przykryciem 75–110 minut do miękkości.`,
  'Jeśli to delikatny, niemielony kawałek na szybkie smażenie, smaż około 3–5 minut, sprawdź 63°C w środku i odstaw na 3 minuty. W każdym wariancie przełóż gotowe mięso na czysty talerz.'
 ];
 if(/szynka/.test(n))return [`Pokrój ${acc} w cienkie paski lub niewielką kostkę. Jeśli jest gotową wędliną, dodawaj ją pod koniec przygotowania, żeby nie wyschła.`];
 if(/tuńczyk/.test(n))return [`Jeżeli używasz tuńczyka z puszki, odsącz go na sitku i rozdziel widelcem. Jeżeli jest świeży, przygotuj go termicznie do co najmniej 63°C przed dodaniem do potrawy.`];
 if(/łosoś/.test(n))return [`Sprawdź, czy łosoś jest surowy czy już wędzony. Surowy filet piecz około 12–16 minut w 190°C do temperatury 63°C, następnie podziel na kawałki. Wędzony łosoś jest już gotowy do dodania.`];
 if(/ciecierzyc|fasola/.test(n))return [`Jeśli używasz ${name.toLowerCase()} z puszki, odsącz i przepłucz; jeżeli jest sucha, przygotuj ją wcześniej zgodnie z instrukcją na opakowaniu aż do pełnego ugotowania.`];
 if(/tofu/.test(n))return [`Osusz tofu i pokrój je w kostkę około 1,5 cm. Na nieprzywierającej patelni podrumień przez 6–8 minut, przewracając, aż będzie złote.`];
 if(/mozzarella/.test(n))return [`Odsącz mozzarellę z zalewy, pokrój lub porwij ją na kawałki; dodaj pod koniec przygotowania lub podczas zapiekania.`];
 return [`Przygotuj ${name.toLowerCase()} zgodnie z opisem i zaleceniami producenta produktu.`];
}

// 32 oddzielne sposoby przygotowania rodzin obiadów. Dla każdego wariantu
// osobno dobierana jest technika obróbki wskazanego w składnikach mięsa.
const lunchMethods=[
 ['Ryż basmati zalej odpowiednią ilością wody i gotuj pod przykryciem 10–12 minut; odstaw na 5 minut.','Cebulę pokrój w drobną kostkę, paprykę w cienkie paski, czosnek i imbir drobno posiekaj.','Cebulę smaż 3 minuty, dodaj czosnek, imbir i pastę curry; mieszaj przez 45 sekund.','Dodaj paprykę i mleczko kokosowe, gotuj delikatnie 6–8 minut, aż papryka zmięknie.','Do sosu dodaj wcześniej przygotowane mięso oraz szpinak. Podgrzewaj 2–3 minuty, aby wszystko było gorące.','Dopraw sokiem z limonki i podaj na ugotowanym ryżu.'],
 ['Ryż ugotuj na sypko zgodnie z opakowaniem; fasolę i kukurydzę odsącz.','Cebulę czerwoną drobno posiekaj, paprykę pokrój w kostkę około 1 cm.','Warzywa smaż na patelni 4–5 minut, dodaj kumin, passatę i 2 łyżki wody.','Wymieszaj z fasolą, kukurydzą i wcześniej przygotowanym mięsem, podgrzewaj 4–5 minut do zgęstnienia.','Tortillę ogrzej przez 30 sekund z każdej strony. Rozsmaruj jogurt, rozłóż ryż i farsz na środku.','Zawiń boki tortilli, potem zroluj ją dość ciasno. Podpiecz złączeniem w dół 1–2 minuty.'],
 ['Ugotuj makaron pełnoziarnisty w osolonej wodzie al dente, zwykle 8–11 minut; zachowaj kilka łyżek wody.','Cukinię pokrój w półplasterki, pomidorki przekrój na połówki, a czosnek posiekaj.','Na oliwie smaż cukinię 4 minuty; dodaj czosnek na ostatnie 30 sekund, a następnie pomidorki na kolejne 2 minuty.','Zmniejsz ogień, wmieszaj pesto i 2–3 łyżki wody po makaronie. Nie gotuj pesto na dużym ogniu.','Dodaj makaron i wcześniej przygotowane mięso, podgrzewaj 1–2 minuty, posyp parmezanem i rukolą.'],
 ['Ryż jaśminowy ugotuj w proporcjach z opakowania, zwykle 12–15 minut.','Brokuł podziel na różyczki około 3 cm, marchew pokrój w cienkie słupki; imbir i czosnek posiekaj.','Sos przygotuj z sosu sojowego, miodu, octu ryżowego i 3 łyżek wody.','Warzywa smaż na patelni około 3 minut, dolej 3 łyżki wody i duś pod przykryciem jeszcze 4–5 minut.','Dodaj imbir, czosnek i sos; gotuj 2–3 minuty do lekkiego zgęstnienia.','Wymieszaj ze wcześniej przygotowanym mięsem i podawaj z ryżem, posypując sezamem.'],
 ['Kaszę gryczaną gotuj około 15 minut do miękkości i odsącz.','Cebulę posiekaj, pieczarki pokrój w plastry, paprykę w kostkę, a czosnek drobno.','Cebulę podsmaż na oleju 3 minuty, dodaj pieczarki na 5 minut, następnie paprykę, czosnek i wędzoną paprykę na kolejne 2 minuty.','Wlej bulion i passatę, doprowadź do wrzenia i gotuj 7–10 minut, aż sos lekko zgęstnieje.','Dodaj wcześniej przygotowane mięso i podgrzej je w sosie przez 3 minuty. Podawaj z kaszą.'],
 ['Kaszę bulgur ugotuj zgodnie z opakowaniem, zwykle 12–15 minut, i lekko ostudź.','Ogórka i pomidora pokrój w kostkę, czerwoną cebulę w cienkie półplasterki.','Na tzatziki zetrzyj połowę ogórka, odciśnij wodę i wymieszaj z jogurtem oraz czosnkiem.','Fetę pokrusz, cytrynę wyciśnij i dodaj odrobinę soku do gotowego mięsa razem z oregano.','Na kaszy ułóż warzywa, przygotowane mięso i fetę; dodaj sos tzatziki tuż przed jedzeniem.'],
 ['Nagrzej piekarnik do 190°C. Ziemniaki pokrój w cienkie plastry 3–4 mm i podgotuj 8–10 minut.','Brokuł rozdziel na małe różyczki i obgotuj 3 minuty; cebulę drobno posiekaj.','Cebulę podsmaż 3 minuty, potem dodaj czosnek na 30 sekund.','Śmietankę wymieszaj z musztardą i tymiankiem; dodaj 2–3 łyżki wody, jeśli sos jest zbyt gęsty.','W naczyniu ułóż ziemniaki, brokuł, cebulę, wcześniej przygotowane mięso i sos. Posyp mozzarellą.','Piecz 20–25 minut do miękkości ziemniaków, gorącego środka zapiekanki (74°C) i złotego sera.'],
 ['Makaron ryżowy namocz lub ugotuj według opakowania, następnie odsącz.','Marchew, kapustę pekińską i żółtą paprykę pokrój w cienkie paski, imbir drobno posiekaj.','Masło orzechowe rozmieszaj z sosem sojowym, sokiem z limonki i 3–4 łyżkami ciepłej wody.','Na dużej patelni smaż marchew i paprykę 3 minuty, dodaj kapustę i imbir na kolejne 2 minuty.','Dodaj wcześniej przygotowane mięso, makaron i sos; mieszaj na średnim ogniu około 2 minut.','Posyp orzeszkami ziemnymi; podaj od razu.'],
 ['Piekarnik nagrzej do 200°C. Bakłażana i cukinię pokrój w kostkę 2 cm, paprykę w paski.','Rozłóż warzywa na blasze, skrop oliwą i piecz 20–25 minut; w połowie przemieszaj.','Kuskus zalej wrzątkiem według opakowania, przykryj na 5 minut i spulchnij widelcem.','Pomidorki przekrój na pół, oliwki pokrój w plasterki, fetę pokrusz.','Kuskus połącz z pieczonymi warzywami, oliwkami, pomidorkami i sokiem z cytryny.','Na wierzchu ułóż przygotowane mięso i fetę; podawaj ciepłe.'],
 ['Ryż ugotuj na sypko zgodnie z opakowaniem.','Kapustę czerwoną bardzo cienko poszatkuj, ogórka pokrój w półplasterki, pomidora w kostkę.','Czosnek rozgnieć i wymieszaj z jogurtem greckim oraz sokiem z cytryny.','Przygotowane mięso wymieszaj z papryką słodką i kuminem, podgrzej przez 1–2 minuty na patelni.','Ułóż w misce ryż, kapustę, ogórka, pomidora i mięso; polej sosem jogurtowym.'],
 ['Batata obierz i pokrój w kostkę 1,5 cm; cebulę i paprykę pokrój w drobną kostkę.','Cebulę smaż na patelni 3 minuty, dodaj paprykę wędzoną i kumin na 30 sekund.','Dodaj batata, pomidory krojone i 100 ml wody; gotuj pod przykryciem 12–15 minut do miękkości.','Wmieszaj odsączoną fasolę i kukurydzę; gotuj kolejne 3–4 minuty.','Dodaj wcześniej przygotowane mięso, dokładnie podgrzej, podawaj z porcją jogurtu.'],
 ['Bulion podgrzej w osobnym garnku i utrzymuj gorący.','Cebulę i czosnek drobno posiekaj, pieczarki pokrój w plasterki.','Na maśle smaż cebulę 3 minuty, pieczarki 5 minut; czosnek dodaj na 30 sekund.','Wsyp suchy ryż arborio i mieszaj przez 1 minutę. Dolewaj bulion po jednej chochelce, czekając aż wsiąknie.','Po około 15 minutach dodaj groszek, a po następnych 4–5 minutach wcześniej przygotowane mięso.','Gdy ryż jest kremowy i miękki (łącznie około 20–25 minut), wyłącz palnik i wmieszaj parmezan.'],
 ['Cebulę posiekaj, suszone pomidory pokrój w paski, czosnek drobno.','Cebulę podsmaż 3 minuty, czosnek dołóż na 30 sekund, a następnie suchy makaron orzo.','Mieszaj orzo przez minutę, stopniowo wlewaj gorący bulion. Gotuj około 10–12 minut, mieszając co chwilę.','Dodaj śmietankę i pokrojone suszone pomidory; gotuj jeszcze 2–3 minuty.','Dołóż szpinak i wcześniej przygotowane mięso; podgrzewaj do zwiędnięcia szpinaku.','Posyp parmezanem i podawaj od razu.'],
 ['Sałatę rzymską umyj i dobrze osusz; porwij na niewielkie kawałki.','Z jogurtu greckiego, musztardy, drobno posiekanego czosnku i soku z cytryny zrób sos.','Wcześniej przygotowane mięso pokrój na paski; zetrzyj parmezan.','Tortillę podgrzej na suchej patelni przez 20–30 sekund z każdej strony.','Rozsmaruj sos na środku, połóż sałatę, mięso, grzanki i parmezan.','Zawiń dolną krawędź, schowaj boki i zroluj wrap.'],
 ['Nagrzej piekarnik do 190°C. Do klopsików mięso musi być drobno zmielone lub bardzo drobno posiekane.','Wymieszaj mięso z jajkiem, bułką tartą, połową drobno posiekanej cebuli i czosnkiem.','Uformuj klopsiki średnicy około 3 cm. Piecz około 15–20 minut, do temperatury 74°C dla drobiu lub 71°C dla mielonej wołowiny i wieprzowiny.','W garnku smaż pozostałą cebulę 3 minuty, dodaj passatę i gotuj 8 minut.','Klopsiki przełóż do sosu i duś 3 minuty; ugotuj spaghetti al dente osobno.','Na makaron nałóż klopsiki w sosie, bazylię i parmezan.'],
 ['Czerwoną i żółtą paprykę pokrój w paski, czerwoną cebulę w piórka.','Na dużej patelni smaż warzywa 5–7 minut, aż zmiękną, ale będą lekko chrupiące.','Dodaj wcześniej przygotowane mięso, kumin i wędzoną paprykę, podgrzej całość 2 minuty.','Awokado rozgnieć widelcem i wymieszaj z sokiem z limonki.','Tortille podgrzej na suchej patelni 30 sekund z każdej strony.','Napełnij tortille warzywami, mięsem, awokado i jogurtem; zwiń.'],
 ['Jajko włóż do wrzącej wody na około 9 minut, następnie schłodź i obierz.','Marchew pokrój w cienkie słupki, pieczarki w plasterki; szczypiorek drobno posiekaj.','Bulion zagotuj z imbirem i sosem sojowym, dodaj marchew i pieczarki, gotuj 6–8 minut.','Makaron ramen ugotuj osobno według opakowania, odsącz.','Dodaj do bulionu wcześniej przygotowane mięso oraz szpinak, podgrzewaj około 2 minut.','Do miski przełóż makaron, zalej zupą, dodaj połówki jajka i szczypiorek.'],
 ['Ryż basmati ugotuj na sypko zgodnie z instrukcją na opakowaniu.','Jogurt wymieszaj z garam masala; w tym sosie obtocz wcześniej przygotowane mięso bez ponownego marynowania.','Cebulę drobno posiekaj; smaż 3–4 minuty, dodaj czosnek i imbir na 45 sekund.','Wlej passatę i gotuj 8 minut, następnie zmniejsz ogień i wmieszaj śmietankę.','Do sosu dołóż mięso z jogurtem i podgrzewaj 3–4 minuty bez gwałtownego gotowania.','Podaj z ryżem, posypaną świeżą kolendrą.'],
 ['Komosę ryżową wypłucz na sitku i gotuj około 12–15 minut, a potem ostudź.','Gotowanego buraka pokrój w małą kostkę, jabłko w cienkie plasterki, kozi ser pokrusz.','Wymieszaj musztardę, miód i sok z cytryny na dressing.','Orzechy włoskie posiekaj na niewielkie kawałki.','Na sałacie rozłóż komosę, buraka, jabłko, przygotowane mięso i kozi ser.','Posyp orzechami i polej dressingiem tuż przed podaniem.'],
 ['Piekarnik nagrzej do 190°C. Cebulę posiekaj, marchew zetrzyj, cukinię pokrój w drobną kostkę.','Cebulę podsmaż 3 minuty, dorzuć marchew i cukinię na kolejne 5 minut, wlej passatę i gotuj 6 minut.','Dodaj wcześniej przygotowane, drobno pokrojone lub rozdrobnione mięso.','W rondelku rozpuść masło, wsyp mąkę i mieszaj przez minutę; porcjami wlewaj mleko, aż sos beszamelowy zgęstnieje.','Ułóż w naczyniu naprzemiennie płaty lasagne, sos z mięsem i beszamel, kończąc sosem i mozzarellą.','Piecz około 30–35 minut według instrukcji płatów, do miękkości makaronu i temperatury 74°C w środku.'],
 ['Cebulę i paprykę pokrój w kostkę, czosnek posiekaj, natkę drobno porwij.','Cebulę smaż około 3 minut, dodaj paprykę i kumin na kolejne 4 minuty.','Wlej pomidory krojone i dodaj czosnek; gotuj 8–10 minut, aż sos lekko zgęstnieje.','Wmieszaj wcześniej przygotowane mięso i podgrzej około 2 minuty.','Zrób wgłębienia w sosie, wbij jajka i przykryj patelnię na 5–8 minut do całkowitego ścięcia jajek.','Posyp pokruszoną fetą oraz natką, podaj z pieczywem.'],
 ['Cebulę i czosnek drobno posiekaj, pomidorki przekrój na pół.','Cebulę smaż 3 minuty, dodaj czosnek na 30 sekund, następnie passatę i pomidorki na 6–8 minut.','Gnocchi gotuj w lekko osolonej wodzie do wypłynięcia, zwykle 2–3 minuty.','Dodaj do sosu szpinak i przygotowane mięso, podgrzewaj 2–3 minuty.','Delikatnie wmieszaj gnocchi, porwaną mozzarellę i bazylię, chwilę podgrzej do stopienia sera.'],
 ['Cebulę pokrój w kostkę, marchew zetrzyj, morele suszone potnij w paski.','Ryż przepłucz na sitku aż woda będzie przejrzysta.','W garnku smaż cebulę i marchew 4 minuty, dodaj kurkumę i cynamon na 30 sekund.','Wsyp ryż, dodaj bulion zgodnie z proporcją i przykryj. Gotuj około 12–15 minut.','W połowie czasu dodaj rodzynki, morele i wcześniej przygotowane mięso, a po ugotowaniu odstaw na 5 minut.','Migdały podpraż na suchej patelni około 2 minut i posyp gotowy pilaw.'],
 ['Rozgrzej piekarnik do 200°C. Ziemniaki pokrój w kostkę 2 cm, marchew w półplasterki, cukinię i paprykę na podobnej wielkości kawałki.','Ziemniaki i marchew wymieszaj z połową oliwy i wędzoną papryką; piecz 15 minut.','Dodaj cukinię, paprykę i odsączoną ciecierzycę; piecz kolejne 15–20 minut do miękkości.','Na upieczone warzywa ułóż wcześniej przygotowane mięso.','Podaj z hummusem i sokiem z cytryny.'],
 ['Makaron świderki ugotuj al dente, zwykle 8–11 minut, odsącz.','Cebulę posiekaj, pieczarki pokrój w plasterki, ogórka kiszonego w drobną kostkę.','Cebulę smaż 3 minuty, dodaj pieczarki na 5–6 minut, następnie paprykę słodką.','Wlej bulion, wmieszaj musztardę i ogórka kiszonego; gotuj na małym ogniu 4 minuty.','Dodaj wcześniej przygotowane mięso oraz śmietankę, mieszaj na małym ogniu 2 minuty bez silnego wrzenia.','Połącz z makaronem i posyp natką.'],
 ['Ryż ugotuj na sypko, zwykle 12–15 minut.','Marchew pokrój w słupki, ogórka w cienkie paski, pieczarki w plasterki.','Pieczarki smaż 4 minuty, marchew 3 minuty, a szpinak krótko podduś; odłóż osobno.','Jajko usmaż do ścięcia białka i żółtka.','Na ryżu ułóż osobno warzywa i przygotowane mięso.','Dołóż jajko, pastę gochujang, sos sojowy i sezam.'],
 ['Piekarnik nagrzej do 190°C. Użyj mięsa mielonego lub bardzo drobno zmiel mięso z listy składników.','Cebulę zetrzyj, połącz z mięsem, bułką tartą, kuminem i mieloną kolendrą.','Uformuj 4 podłużne kofty. Piecz około 18–22 minut, do bezpiecznej temperatury w środku (drób 74°C, mielona wołowina lub wieprzowina 71°C).','Kuskus perłowy gotuj zgodnie z opakowaniem, zwykle 10–12 minut.','Ogórka pokrój w kostkę, miętę posiekaj i wymieszaj oba składniki z jogurtem.','Podaj kofty z kuskusem, pomidorem i sosem miętowym.'],
 ['Rozgrzej piekarnik do 190°C. Cebulę pokrój w kostkę, paprykę w małe paski.','Cebulę smaż 3 minuty, dodaj paprykę i kumin na 4 minuty.','Dodaj odsączoną fasolę, kukurydzę, połowę passaty i przygotowane mięso; podgrzej 3–4 minuty.','Nałóż farsz na tortille, zwiń ciasno i ułóż złączeniem w dół w naczyniu.','Polej resztą passaty, posyp cheddarem, zapiekaj 15–20 minut do zarumienienia i gorącego środka.','Nałóż jogurt już po wyjęciu potrawy z piekarnika.'],
 ['Ryż okrągły przepłucz tylko jeśli producent tego wymaga.','Paprykę pokrój w paski, pomidory w kostkę, cebulę i czosnek drobno posiekaj.','Cebulę smaż 3 minuty, dodaj czosnek na 30 sekund, paprykę na 4 minuty, pomidory i paprykę wędzoną na 2 minuty.','Wsyp suchy ryż i zalej gorącym bulionem; gotuj na małym ogniu 16–20 minut bez częstego mieszania.','Na ostatnie 5 minut dodaj groszek i przygotowane mięso. Odstaw pod przykryciem na 4 minuty.','Skrop cytryną i podaj z patelni.'],
 ['Makaron kokardki ugotuj al dente, odsącz i ostudź.','Ogórka pokrój w półplasterki, pomidorki na połówki, kukurydzę odsącz.','Jogurt wymieszaj z musztardą i miodem; fetę pokrusz.','W dużej misce połącz makaron, sałatę, warzywa i wcześniej przygotowane, przestudzone mięso.','Dodaj sos i fetę dopiero przed podaniem, delikatnie wymieszaj.'],
 ['Rozgrzej piekarnik do 210°C. Pieczarki pokrój na cienkie plasterki, paprykę w paski, cebulę w piórka.','Tortillę rozłóż na blasze z papierem; posmaruj passatą i posyp oregano.','Rozłóż wcześniej przygotowane mięso, pieczarki, paprykę, cebulę i kawałki mozzarelli.','Piecz 8–11 minut do chrupiącego spodu i całkowitego rozpuszczenia sera.','Po wyjęciu posyp rukolą; podziel na kawałki.'],
 ['Marchew pokrój w cienkie półplasterki, pieczarki w plastry, paprykę w paski, imbir zetrzyj.','Bulion zagotuj z imbirem; wrzuć marchew i pieczarki na 6 minut.','Dodaj paprykę na 3 minuty, a następnie mleczko kokosowe i wcześniej przygotowane mięso.','Zagotuj łagodnie, po 2–3 minutach wyłącz palnik.','Makaron ryżowy przygotuj oddzielnie według opakowania. Rozdziel do misek, zalej zupą, skrop limonką i posyp kolendrą.']
];
if(lunchMethods.length!==32)throw new Error('Niekompletne instrukcje obiadowe');
for(const r of recipes){
 if(r.id>=0&&r.id<224){
  const family=Math.floor(r.id/7);
  // Klopsiki i kofty formuje się z surowego mięsa: nie obsmażaj go wcześniej.
  const proteinPrep=([14,26].includes(family))?[]:meatCook(ingred(r,0));
  r.steps=[common,...proteinPrep,...lunchMethods[family],finish];
  if(/łopatk|na gulasz/.test(ingred(r,0).toLowerCase()))r.minutes=Math.max(110,Number(r.minutes)||0);
 }
}

// Śniadania i kolacje z wersji 4.0: 24 rodzaje potraw, z poprawnym
// przygotowaniem każdego z 10 różnych dodatków (łącznie 240 przepisów).
function vegPrep(name){
 const n=name.toLowerCase();
 if(/mango/.test(n))return 'Mango obierz, oddziel miąższ od pestki i pokrój w niewielką kostkę.';
 if(/borówk|malin|truskaw/.test(n))return `Owoce ${name.toLowerCase()} opłucz na sitku i delikatnie osusz.`;
 if(/banan/.test(n))return 'Banana obierz i pokrój w cienkie plasterki.';
 if(/ogórek/.test(n))return 'Ogórka opłucz, obierz jeśli skórka jest twarda, i pokrój w cienkie półplasterki.';
 if(/szpinak/.test(n))return 'Liście szpinaku opłucz, osusz i usuń twarde łodyżki; duże liście porwij.';
 if(/bazylia/.test(n))return 'Bazylię opłucz, osusz i porwij listki na mniejsze kawałki.';
 if(/koperek/.test(n))return 'Koperek opłucz, osusz i drobno posiekaj.';
 if(/cebula|por/.test(n))return `Obierz ${name.toLowerCase().replace('cebula','cebulę').replace('por','pora')} i posiekaj w drobną kostkę.`;
 if(/kukurydza|fasola/.test(n))return `Odsącz ${name.toLowerCase()}, jeśli jest z puszki; jeśli sucha, ugotuj ją wcześniej do miękkości.`;
 if(/pieczark/.test(n))return `Oczyść ${name.toLowerCase()} i pokrój w cienkie plasterki.`;
 if(/brokuł/.test(n))return `Podziel ${name.toLowerCase()} na małe różyczki i obgotuj 3–4 minuty, aby nie pozostał surowy.`;
 if(/cukini/.test(n))return `Pokrój ${name.toLowerCase()} w cienkie półplasterki.`;
 if(/ziemniak|batat/.test(n))return `Umyj ${name.toLowerCase()}, obierz i pokrój w kostkę około 1,5–2 cm.`;
 if(/pomidor/.test(n))return `Opłucz ${name.toLowerCase()} i pokrój w drobną kostkę.`;
 if(/papryk/.test(n))return `Opłucz ${name.toLowerCase()}, usuń gniazdo nasienne i pokrój w paski około 5 mm.`;
 return `Przygotuj ${name.toLowerCase()}: opłucz, jeśli to świeże warzywo, i podziel na małe kawałki.`;
}
const v4Methods=[
 ['Rozbij jajka do miski, wlej mleko i roztrzep widelcem około 30 sekund.','Na patelni ogrzej oliwę przez 30–40 sekund, dodaj posiekaną cebulę na 2 minuty, a następnie przygotowane dodatki.','Wlej jajka i smaż na średnio-małym ogniu około 4–5 minut, aż jajka się zetną; złóż omlet na pół i podaj.'],
 ['Pieczywo ułóż na blasze z papierem, piekarnik nagrzej do 190°C.','Na kromkach rozłóż przygotowane dodatki, posiekaną cebulę i porwaną mozzarellę.','Skrop oliwą i zapiekaj 8–10 minut, aż ser się roztopi, a pieczywo będzie rumiane.'],
 ['Sałatę opłucz i osusz; jogurt wymieszaj z porcją przypraw.','Tortillę ogrzej 20–30 sekund z każdej strony na suchej patelni.','Pośrodku rozsmaruj jogurt, ułóż sałatę, przygotowany składnik główny, warzywa i cebulę.','Złóż dolną część, schowaj boki i ciasno zwiń; podpiecz 1 minutę z każdej strony.'],
 ['Ziemniaki pokrój w plasterki 3–4 mm i obgotuj 8 minut, a potem odsącz.','Cebulę posiekaj i podsmaż na nieprzywierającej patelni 3 minuty, dodaj ziemniaki, wcześniej przygotowane dodatki i przyprawy.','Jajka roztrzep, zalej nimi zawartość patelni i przełóż do naczynia do pieczenia.','Piecz w 185°C przez 16–22 minuty, do całkowitego ścięcia środka (około 71°C).'],
 ['Bajgla przekrój na pół i podpiecz 2–3 minuty na suchej patelni.','Umyj rukolę, osusz i posiekaj cebulę w drobną kostkę.','Obie połówki posmaruj serkiem śmietankowym; dołóż przygotowany składnik główny, warzywa i cebulę.','Złóż bajgla, podaj od razu.'],
 ['Cebulę drobno posiekaj i podduś na patelni z 2 łyżkami wody przez 3–4 minuty.','Wlej passatę, dodaj przyprawy i przygotowane dodatki; gotuj na małym ogniu 6–8 minut.','Zrób dwa wgłębienia i wbij jajka do sosu. Przykryj i gotuj około 6–8 minut, aż jajka będą ścięte.','Dodaj przygotowany składnik główny i podaj na gorąco.'],
 ['Piekarnik nagrzej do 190°C. Pomidora pokrój w cienkie plasterki, cebulę posiekaj.','Na pieczywie żytnim rozłóż przygotowane dodatki, pomidora i ser gouda.','Piecz 7–10 minut do roztopienia sera; jeśli używasz tosta złożonego, odwróć w połowie pieczenia.'],
 ['Płatki owsiane zmiel na mąkę lub rozdrobnij. Jajka wymieszaj z jogurtem i płatkami; odstaw na 5 minut.','Cebulę posiekaj, przygotowane dodatki pokrój drobno i wmieszaj do masy.','Na suchej nieprzywierającej patelni nakładaj małe placki i smaż na średnio-małym ogniu około 3–4 minuty z każdej strony.','Przy jajkach sprawdź całkowite ścięcie ciasta, a przy mięsie użyj wyłącznie wcześniej w pełni przygotowanego.'],
 ['Ryż ugotuj według opakowania, zwykle 12–15 minut. Ogórka umyj i pokrój w cienkie półplasterki.','Jajko ugotuj na twardo przez około 9 minut i pokrój na ćwiartki.','Do miski nałóż ryż, przygotowany składnik główny, warzywa i jajko; posyp przyprawami.'],
 ['Rozgrzej piekarnik do 190°C. Paprykę pokrój w cienkie paski, cebulę posiekaj.','Na połowie tortilli rozłóż przygotowane dodatki, paprykę, cebulę i mozzarellę.','Złóż tortillę na pół, przełóż na blachę i piecz 8–10 minut do zarumienienia i roztopienia sera.'],
 ['Twaróg rozdrobnij widelcem, dodaj jogurt i mieszaj przez minutę do uzyskania kremowej konsystencji.','Cebulę posiekaj bardzo drobno; przygotowane dodatki drobno pokrój i wymieszaj z pastą.','Pieczywo podpiecz 1–2 minuty i rozsmaruj na nim pastę.'],
 ['Bułkę pełnoziarnistą przekrój wzdłuż i podpiecz na suchej patelni 1–2 minuty.','Jajko usmaż na nieprzywierającej patelni do ścięcia białka i żółtka.','Sałatę umyj i osusz; przygotowane dodatki oraz cebulę pokrój na kawałki odpowiednie do bułki.','Włóż do bułki sałatę, przygotowany składnik główny, warzywa i jajko.'],
 ['Umyj i dokładnie osusz mix sałat. Pomidora pokrój w cząstki, cebulę w cienkie półplasterki.','W miseczce wymieszaj oliwę z przyprawami na dressing.','Połącz sałatę, pomidora, przygotowany składnik główny i warzywa; dodaj dressing bezpośrednio przed jedzeniem.'],
 ['Makaron ugotuj w osolonej wodzie al dente (zwykle 8–11 minut); odsącz.','Cebulę posiekaj; czosnek drobno rozgnieć i podgrzewaj z 2 łyżkami wody przez 30 sekund.','Dodaj passatę, cebulę i przygotowane warzywa. Gotuj 6–8 minut na średnio-małym ogniu.','Dodaj wcześniej przygotowany składnik główny, wymieszaj z makaronem i podgrzewaj jeszcze około minuty.'],
 ['Paprykę pokrój w drobne paski, cebulę posiekaj.','Przygotowane dodatki połącz z papryką, cebulą i startym cheddarem.','Rozłóż farsz na jednej połowie tortilli i złóż ją na pół.','Smaż na suchej patelni na średnio-małym ogniu po około 2–3 minuty z każdej strony, aż ser się rozpuści.'],
 ['Kaszę bulgur gotuj 12–15 minut zgodnie z opakowaniem i odsącz.','Ogórka pokrój w drobną kostkę, cebulę w cienkie półplasterki.','Jogurt wymieszaj z przyprawami, a kaszę z przygotowanym składnikiem głównym i warzywami.','Ułóż w misce; dodaj sos jogurtowy bezpośrednio przed podaniem.'],
 ['Piekarnik nagrzej do 200°C. Ziemniaki pokrój na cienkie plasterki 3 mm i podgotuj przez 8–10 minut.','Cebulę posiekaj i podduś przez 3 minuty na patelni z odrobiną wody.','W naczyniu ułóż warstwami ziemniaki, cebulę, przygotowany składnik główny i dodatki.','Posyp mozzarellą; piecz 20–25 minut do miękkości ziemniaków i temperatury co najmniej 74°C w środku zapiekanki.'],
 ['Pieczywo tostowe podpiecz na suchej patelni lub w tosterze przez 2–3 minuty.','Sałatę i pomidora umyj, osusz; pomidora pokrój w cienkie plasterki.','Na pieczywie ułóż kolejno sałatę, przygotowany składnik główny, cebulę i pomidor.','Przykryj kolejną kromką, przetnij na dwie połówki i podawaj.'],
 ['Ryż ugotuj zgodnie z opakowaniem i przygotuj do smażenia bez długiego przetrzymywania w temperaturze pokojowej.','Cebulę posiekaj, przygotowane warzywa drobno pokrój.','Na dużej patelni smaż warzywa z 2 łyżkami wody przez 3–4 minuty, dodaj ugotowany ryż i mieszaj 2 minuty.','Wbij jajko, mieszaj na średnim ogniu do całkowitego ścięcia; dodaj sos sojowy i przygotowany składnik główny.','Jeśli przechowujesz ryż na później, szybko go ostudź i schowaj do lodówki; nie podgrzewaj wielokrotnie.'],
 ['Marchew i ziemniaki obierz i pokrój w kostkę około 1,5 cm; cebulę posiekaj.','Zagotuj bulion warzywny; wrzuć marchew i ziemniaki, gotuj 18–22 minuty do miękkości.','Ostrożnie zblenduj warzywa z częścią bulionu, stopniowo rozrzedzaj zupę do pożądanej konsystencji.','Przygotowany składnik główny i dodatki ułóż na gorącej zupie; nie miksuj ich wraz z warzywami.'],
 ['Piekarnik nagrzej do 180°C. Pitę podgrzej 3–4 minuty, żeby stała się elastyczna.','Sałatę umyj, osusz; posiekaj cebulę i pokrój przygotowane dodatki.','Jogurt wymieszaj z przyprawami. Natnij pitę wzdłuż krawędzi i ostrożnie otwórz kieszonkę.','Wypełnij sałatą, przygotowanym składnikiem głównym i dodatkami; polej sosem.'],
 ['Nagrzej piekarnik do 190°C. Ryż ugotuj na sypko według opakowania.','Paprykę przekrój wzdłuż, usuń pestki i połóż połówki w naczyniu.','Cebulę posiekaj i wymieszaj z ryżem, przygotowanym składnikiem głównym, warzywami i połową passaty.','Wypełnij papryki farszem, polej resztą passaty i dolej 2–3 łyżki wody na dno naczynia.','Piecz 25–30 minut, aż papryka zmięknie, a nadzienie będzie bardzo gorące w środku.'],
 ['Piekarnik rozgrzej do 200°C. Umyj bataty, przekrój wzdłuż na pół i nakłuj widelcem w kilku miejscach.','Piecz około 30–45 minut, aż środek da się łatwo rozgnieść widelcem.','Przygotowane dodatki i cebulę pokrój na drobne kawałki; jogurt wymieszaj z przyprawami.','Na bataty nałóż przygotowany składnik główny i dodatki, polej jogurtem; rukolę dodaj na koniec.'],
 ['Kuskus wsyp do miski, zalej odpowiednią ilością wrzątku zgodnie z opakowaniem, przykryj na 5 minut i spulchnij.','Ogórka i pomidora umyj, pokrój w drobną kostkę; cebulę posiekaj.','Kuskus wymieszaj z przygotowanym składnikiem głównym i warzywami, dopraw przyprawami z listy.','Podawaj na talerzu po ułożeniu składników obok siebie lub wymieszaniu.']
];
if(v4Methods.length!==24)throw Error('Brakuje instrukcji do śniadań i kolacji');
for(const r of recipes){
 if(r.id<1000||r.id>=1240)continue;
 const family=Math.floor((r.id-1000)/10);
 const topping=ingred(r,4),main=ingred(r,3);
 const safeMain=meatCook(main);
 const extra=vegPrep(topping);
 const prepped=[common,extra,`Obierz i drobno posiekaj cebulę (${ingred(r,5)}).`,...safeMain];
 r.steps=[...prepped,...v4Methods[family],finish];
 if(/wołow/.test(main.toLowerCase())&&r.minutes<45)r.minutes=45;
}

// Pierwotne osiem przepisów: pełne czynności zamiast skrótów.
const originalExtras={
 224:['Płatki owsiane wsyp do miseczki, dodaj jogurt i wymieszaj.','Owoce umyj, odsącz, większe pokrój na kawałki około 1 cm.','Płatki z jogurtem odstaw na 10–15 minut, aby zmiękły; owoce dołóż tuż przed jedzeniem.'],
 225:['Pomidor umyj i pokrój w małą kostkę; pieczywo przygotuj do podania.','Jajka rozbij do miseczki i roztrzep widelcem około 20 sekund.','Rozgrzej nieprzywierającą patelnię na średnio-małym ogniu, wlej jajka i mieszaj powoli przez około 3–5 minut do całkowitego ścięcia.','Jajecznicę przełóż na talerz, dodaj pomidora i pieczywo.'],
 226:['Sałatę opłucz i dokładnie osusz.','Pieczywo podpiecz na suchej patelni przez 1–2 minuty, jeśli wolisz chrupiące.','Na pieczywie ułóż sałatę i plastry gotowej wędliny z indyka. Złóż kanapki i podaj.'],
 227:['Banan obierz i pokrój w plasterki o grubości około 5 mm.','Orzechy posiekaj na mniejsze kawałki, jeżeli nie są już rozdrobnione.','Skyr przełóż do miski, ułóż banana na wierzchu i posyp orzechami.'],
 228:['Ogórka umyj i pokrój w drobną kostkę lub zetrzyj na tarce, a następnie odciśnij nadmiar wody.','Twaróg rozgnieć widelcem i dokładnie wymieszaj z ogórkiem oraz przyprawami według smaku.','Podawaj ze świeżym pieczywem; pastę przygotuj tuż przed podaniem.'],
 229:['Tuńczyka z puszki odsącz i podziel widelcem na mniejsze kawałki.','Sałatę opłucz i osusz, pomidora pokrój w cząstki.','Połącz tuńczyka z sałatą i pomidorem, delikatnie wymieszaj. Podawaj z pieczywem.'],
 230:['Paprykę umyj, usuń pestki i pokrój w kostkę około 5 mm. Ser zetrzyj lub drobno pokrój.','Jajka rozbij do miski i roztrzep 30 sekund; połącz z papryką i serem.','Wylej na nieprzywierającą patelnię, smaż pod przykryciem na małym ogniu około 6–8 minut do pełnego ścięcia jajek.'],
 231:['Pierś z kurczaka pokrój w kostkę około 1,5 cm. Smaż na nieprzywierającej patelni około 7–10 minut, obracając, do 74°C w środku.','Sałatę umyj i osusz, jogurt przełóż do miseczki.','Tortillę podgrzej na suchej patelni przez około 30 sekund na stronę.','Ułóż sałatę i przygotowanego kurczaka na środku, polej jogurtem i zawiń brzegi tortilli.']
};
for(const r of recipes){if(originalExtras[r.id])r.steps=[...originalExtras[r.id],finish]}

// Pięć przekąsek i pięć grup deserów ze starszej wersji.
const snackSteps={
 2000:['Borówki opłucz i dokładnie odsącz na sitku.','Przełóż jogurt naturalny do miseczki i delikatnie wymieszaj łyżką.','Dodaj borówki i posyp pestkami dyni. Podaj od razu.'],
 2001:['Ogórka umyj, pokrój w cienkie półplasterki.','Pieczywo ułóż na talerzu i rozsmaruj na nim hummus.','Na wierzchu ułóż plasterki ogórka, podaj od razu.'],
 2002:['Rzodkiewki umyj, osusz, odetnij końce i pokrój w cienkie plasterki.','Serek wiejski przełóż do miseczki, dodaj rzodkiewki.','Dokładnie wymieszaj i podaj schłodzone.'],
 2003:['Jabłko dokładnie opłucz, usuń gniazdo nasienne i pokrój na około 8 cząstek.','Masło orzechowe rozmieszaj łyżeczką, jeśli się rozwarstwiło.','Podawaj kawałki jabłka z masłem orzechowym jako dipem.'],
 2004:['Awokado przekrój, usuń pestkę i wyjmij miąższ łyżką.','Miąższ rozgnieć widelcem na pastę.','Pieczywo tostowe podpiecz na suchej patelni przez 1–2 minuty z każdej strony.','Posmaruj tosty pastą z awokado i zjedz od razu.']
};
for(const r of recipes){
 if(r.id<2000||r.id>2054)continue;
 if(snackSteps[r.id]){r.steps=[...snackSteps[r.id],finish];continue;}
 const fruit=ingred(r,1);const n=fruit.toLocaleLowerCase('pl');
 const fruitPrep=/wiśn|śliw|brzoskwin/.test(n)
   ?`Owoce (${n}) umyj, usuń pestki i pokrój na małe kawałki (około 1 cm).`
   :/banan/.test(n)?'Banana obierz i pokrój w plasterki około 5 mm.'
   :/mango/.test(n)?'Mango obierz, oddziel miąższ od pestki i pokrój w drobną kostkę.'
   :/jabłk|gruszk/.test(n)?`Umyj ${n}, usuń gniazdo nasienne i pokrój w kostkę około 1 cm.`
   :`Umyj ${n}, odsącz i pokrój większe owoce na kawałki około 1 cm.`;
 const f=Math.floor((r.id-2005)/10);
 let rest;
 if(f===0)rest=['Jogurt grecki i jogurt naturalny połącz w miseczce, mieszając przez około minutę.','W pucharku układaj naprzemiennie warstwę jogurtu i przygotowanych owoców, aż skończą się składniki.','Wstaw na 10–15 minut do lodówki przed podaniem.'];
 else if(f===1)rest=['Piekarnik nagrzej do 180°C. Ułóż przygotowane owoce w małym naczyniu do zapiekania.','Płatki owsiane podpraż na suchej patelni 2–3 minuty, mieszając, aż nabiorą złotego koloru.','Owoce piecz 15–22 minuty do miękkości; wyjmij i lekko przestudź.','Podawaj z jogurtem i chrupiącymi płatkami na wierzchu. Płatki dodaj dopiero po pieczeniu, by nie rozmiękły.'];
 else if(f===2)rest=['Połowę przygotowanych owoców rozgnieć widelcem na puree; druga połowa posłuży do podania.','Mąkę owsianą wymieszaj z jogurtem naturalnym i owocowym puree. Odstaw ciasto na 5 minut; ma być gęste, ale łatwe do nakładania łyżką.','Rozgrzej nieprzywierającą patelnię na średnio-małym ogniu. Nakładaj małe placki średnicy 6–7 cm.','Smaż 3–4 minuty z jednej strony, ostrożnie obróć i smaż kolejne 3 minuty, aż będą ścięte w środku. Podaj z pozostałymi owocami.'];
 else if(f===3)rest=['Nasiona chia wsyp do szklanki, wlej mleko i dokładnie wymieszaj przez minutę.','Odstaw na 5 minut, potem wymieszaj ponownie, aby nasiona nie utworzyły grudek.','Przykryj i włóż do lodówki na minimum 2 godziny (najlepiej na noc).','Przed podaniem zamieszaj pudding i ułóż na nim przygotowane owoce.'];
 else rest=['Twaróg rozkrusz do miseczki, dodaj jogurt naturalny i rozcieraj widelcem przez około 2 minuty, aż powstanie jednolity krem.','Połowę owoców delikatnie wmieszaj do kremu, resztę ułóż na wierzchu.','Przed podaniem schłodź w lodówce 10–15 minut.'];
 r.steps=[fruitPrep,...rest,finish];
}

// W instrukcjach na ekranie przepisu pokaż dokładnie te etapy, bez
// dotychczasowego automatycznego dopisywania błędnych, ogólnych poleceń.
detailedSteps = function(r){return r.steps;};

// 76 NOWYCH dań: osobne tytuły, listy składników i szczegółowe kroki.
// Szacunkowe ceny, kalorie i białko liczone z tabeli porcji pomocniczych.
const portions={
 'Pierś z kurczaka':[150,10,110,23],'Filet z indyka':[150,12,105,23],
 'Mięso z udka kurczaka bez kości':[150,9,145,18],'Polędwiczka wieprzowa':[150,13,135,21],
 'Łopatka wieprzowa':[150,9,215,17],'Wołowina na gulasz':[150,18,185,20],
 'Wołowina':[150,19,170,22],'Mięso mielone z indyka':[150,12,160,19],
 'Wędlina z indyka':[80,5,110,18],'Szynka':[80,5,145,19],
 'Łosoś':[140,16,210,20],'Łosoś wędzony':[70,9,155,20],
 'Tuńczyk w puszce':[120,8,115,25],'Tofu':[150,8,120,13],
 'Jajka':[2,3.6,75,6], 'Twaróg':[150,4,120,18], 'Skyr':[180,4,65,11],
 'Serek wiejski':[150,4,100,12],'Jogurt naturalny':[110,1.8,62,4],
 'Jogurt grecki':[90,2.3,110,8],'Mozzarella':[60,4.5,250,18],
 'Feta':[55,4.5,260,14],'Parmezan':[20,3,380,31],
 'Cheddar':[45,3.6,400,25],'Mleko':[150,1.2,50,3.3],
 'Ryż basmati':[80,1.4,350,7],'Ryż jaśminowy':[80,1.6,350,7],
 'Ryż':[80,1.4,350,7],'Kasza bulgur':[75,1.5,340,12],
 'Kasza gryczana':[80,1.6,345,12],'Komosa ryżowa':[75,3.4,370,14],
 'Makaron pełnoziarnisty':[85,2.2,345,12],'Makaron orzo':[85,2.8,350,11],
 'Makaron ryżowy':[75,3,350,6],'Płatki owsiane':[65,1.5,365,13],
 'Pieczywo pełnoziarniste':[90,2.1,245,9],'Pieczywo żytnie':[90,2,230,7],
 'Bułka pełnoziarnista':[85,2.2,250,9], 'Tortilla':[80,2.3,300,9],
 'Tortilla pełnoziarnista':[80,2.5,290,10], 'Pita':[80,2.6,275,9],
 'Ziemniaki':[220,1.5,75,2],'Bataty':[180,4.2,85,1.6],
 'Ciecierzyca konserwowa':[100,2.5,120,7],'Fasola czerwona':[100,2,110,7],
 'Fasola czarna':[100,2.3,110,7],
 'Pomidor':[120,1.8,18,1],'Pomidorki koktajlowe':[100,3.5,20,1],
 'Passata':[130,2.1,30,1.4],'Papryka':[100,2.5,29,1],
 'Papryka czerwona':[100,2.7,29,1],'Papryka żółta':[100,2.8,28,1],
 'Cebula':[60,0.8,40,1],'Cebula czerwona':[60,1.2,40,1],
 'Czosnek':[9,0.8,145,6],'Cukinia':[120,2.8,16,1.2],
 'Szpinak':[80,3,23,2.8],'Brokuł':[140,3,34,2.8],
 'Pieczarki':[120,3.2,22,3],'Kapusta czerwona':[80,1.4,31,1.4],
 'Sałata':[70,2,14,1.5], 'Mix sałat':[70,3,15,1],
 'Rukola':[45,3,25,2.5],'Ogórek':[110,1.6,14,0.6],
 'Marchew':[110,1,40,1],'Por':[80,2,30,1.5],
 'Burak gotowany':[110,2.3,43,1.6], 'Kalafior':[150,3.2,25,2],
 'Zielony groszek':[90,2,80,5], 'Kukurydza':[80,1.7,85,3],
 'Mango':[100,5.5,60,0.8], 'Banan':[120,1.8,90,1.1],
 'Jabłko':[120,1.6,52,0.3], 'Gruszka':[120,2.2,57,0.3],
 'Truskawki':[120,5,33,0.7], 'Maliny':[100,6,50,1.2],
 'Borówki':[100,6,55,0.7], 'Brzoskwinia':[110,3,40,1],
 'Orzechy włoskie':[18,2.7,650,15],'Migdały':[18,2.8,580,21],
 'Pestki dyni':[17,1.8,570,28], 'Nasiona chia':[25,2.8,485,17],
 'Masło orzechowe':[25,2.2,600,25],
 'Miód':[18,1.4,310,0],'Kakao':[12,1.5,240,20],
 'Mąka owsiana':[65,1.8,360,12],
 'Mleczko kokosowe':[115,3.5,170,2], 'Śmietanka 12%':[90,2,130,3],
 'Jogurt pitny':[150,2.5,60,3], 'Oliwa':[12,1.1,880,0],
 'Olej rzepakowy':[12,0.7,880,0], 'Musztarda':[16,0.6,70,4],
 'Sos sojowy':[18,1,50,7], 'Pesto bazyliowe':[35,4,400,5],
 'Tahini':[25,2.5,600,18], 'Pasta curry':[20,2,120,2],
 'Garam masala':[4,0.8,300,10], 'Papryka wędzona':[3,0.5,280,13],
 'Kumin':[3,0.5,370,18], 'Cynamon':[3,0.3,250,4],
 'Imbir':[14,1,80,2], 'Cytryna':[45,1.7,25,1],
 'Limonka':[40,2,30,1], 'Natka pietruszki':[15,1,35,3],
 'Koperek':[14,1.3,40,3.5], 'Bazylia':[13,1.6,23,3],
 'Kolendra świeża':[12,1.5,23,2], 'Szczypiorek':[20,1.5,32,2],
 'Sezam':[15,1,570,18], 'Orzeszki ziemne':[18,1.7,570,25],
 'Bulion':[280,1.8,7,1], 'Bulion warzywny':[280,1.8,5,0.5],
 'Sos pomidorowy':[150,2.4,35,2], 'Suszone pomidory':[40,3.2,210,5],
 'Oregano':[4,0.6,260,9], 'Awokado':[75,4,160,2]
};
const cookedProtein=name=>/kurczak|indyk|polędwiczk|łopatk|wołowin|łosoś$|tofu|tuńczyk w puszce|wędlina|szynka/i.test(name);
function prepareCarb(name){
 if(/ryż/i.test(name))return `Wsyp ${name.toLowerCase()} do garnka i ugotuj w wodzie według proporcji z opakowania, zazwyczaj 12–15 minut; odstaw pod przykryciem na 5 minut.`;
 if(/makaron/i.test(name))return `Ugotuj ${name.toLowerCase()} w lekko osolonej wodzie al dente zgodnie z opakowaniem, zwykle 8–12 minut; zachowaj 2 łyżki wody z gotowania.`;
 if(/kasza|komosa/i.test(name))return `Ugotuj ${name.toLowerCase()} według instrukcji na opakowaniu, zwykle 12–18 minut, a następnie spulchnij widelcem.`;
 if(/tortilla|pita|pieczywo|bułka/i.test(name))return `Podgrzej ${name.toLowerCase()} na suchej patelni, po około 30–60 sekundach z każdej strony; bułkę lub pieczywo możesz podpiec 2–3 minuty.`;
 if(/ziemniaki|bataty/i.test(name))return `Umyj i obierz ${name.toLowerCase()}, pokrój w kostkę około 2 cm; gotuj w wodzie 12–18 minut do miękkości.`;
 if(/płatki/i.test(name))return `Wsyp ${name.toLowerCase()} do rondelka, zalej mlekiem lub wodą (jeżeli są w składnikach), gotuj na małym ogniu 4–6 minut, mieszając.`;
 return `Przygotuj ${name.toLowerCase()} zgodnie z instrukcją na opakowaniu.`;
}
function mainForNew(name){
 if(/łosoś wędzony/i.test(name))return ['Łososia wędzonego wyjmij z opakowania, podziel na niewielkie kawałki i dodaj do gotowej potrawy bez smażenia.'];
 if(cookedProtein(name))return meatCook(name);
 if(/jajk/i.test(name))return ['Jajka rozbij do miseczki, wymieszaj widelcem przez około 20 sekund. Przygotuj je na średnio-małym ogniu do pełnego ścięcia (dania jajeczne co najmniej 71°C).'];
 if(/skyr|jogurt|twaróg|serek wiejski/i.test(name))return [`${name} przełóż do czystej miski i rozmieszaj łyżką lub widelcem do jednolitej konsystencji.`];
 return [`Przygotuj ${name.toLowerCase()} zgodnie z zasadami bezpiecznego przygotowania tego produktu.`];
}
function extraPrep(n){
 if(/ryż|makaron|kasza|ziemniaki/i.test(n))return prepareCarb(n);
 if(/fasola|ciecierzyca/i.test(n))return `Odsącz ${n.toLowerCase()} z puszki i przepłucz; jeśli składnik jest suchy, ugotuj go wcześniej do miękkości.`;
 if(/awokado/i.test(n))return 'Awokado przekrój, usuń pestkę, wyjmij miąższ łyżką i pokrój w cienkie plasterki.';
 if(/feta|mozzarella|cheddar|parmezan/i.test(n))return `Przygotuj ${n.toLowerCase()}: pokrusz, porwij lub zetrzyj ser i odłóż do podania.`;
 if(/orzeszki|orzechy|migdały|sezam|pestki/i.test(n))return `Drobno posiekaj ${n.toLowerCase()} (jeśli są duże), a dla wyraźniejszego aromatu podpraż na suchej patelni około 1–2 minut.`;
 if(/natka|szczypiorek|bazylia|kolendra|koperek/i.test(n))return `Opłucz ${n.toLowerCase()}, dokładnie osusz i drobno posiekaj.`;
 if(/cytryna|limonka/i.test(n))return `Umyj ${n.toLowerCase()}, przekrój na pół, skrop potrawę świeżo wyciśniętym sokiem przed podaniem.`;
 return `Odmierz ${n.toLowerCase()} i dodaj do dania w ostatniej fazie przygotowania.`;
}
function newSteps(style,items){
 const [a,b,c,d,e,f,g,h]=items;
 const extras=[f,g,h].filter(Boolean);
 const finalExtras=extras.length?`Dołóż przygotowane dodatki (${extras.join(', ')}), wymieszaj lub rozłóż na wierzchu tuż przed podaniem.`:'';
 const extrasPrep=extras.map(extraPrep);
 const initial=[common,vegPrep(c),vegPrep(d)];
 if(style==='smoothie')return ['Owoce umyj, usuń pestki lub gniazda nasienne, a następnie pokrój w kostkę około 1–2 cm.',`Do wysokiego naczynia przełóż ${[a,b,c,d,e].filter(Boolean).join(', ')}.`, 'Miksuj blenderem około 60–90 sekund do gładkiej konsystencji.','Jeśli napój jest zbyt gęsty, dolej odrobinę wody i ponownie krótko wymieszaj. Podawaj od razu.'];
 if(style==='dessert')return ['Owoce umyj, usuń ewentualne pestki, pokrój w drobną kostkę.',`W miseczce połącz ${a} i ${b}, wymieszaj dokładnie przez około minutę.`,`Dodaj ${c} i ${d}; wymieszaj lub ułóż warstwami w pucharku.`,`${/miód|masło orzechowe/i.test(e)?'Polej':'Posyp'} ${e.toLowerCase()} i wstaw na 10–15 minut do lodówki przed podaniem.`];
 if(style==='porridge')return [`${prepareCarb(a)}`,'Owoce umyj, usuń pestki lub gniazda nasienne i pokrój na małe kawałki.',`Do owsianki dodaj przygotowane ${c.toLowerCase()} i ${d.toLowerCase()}; delikatnie wymieszaj.`,'Mieszaj 1–2 minuty na małym ogniu, jeśli podajesz na ciepło; w innym przypadku schłodź w lodówce.',`Na końcu dodaj ${e.toLowerCase()} i podaj.`];
 if(style==='egg'){const meatExtras=extras.filter(x=>/kurczak|indyk|wołow|wieprz|łosoś|mięso/i.test(x));return [common,'Rozbij jajka do miski i roztrzep widelcem przez około 30 sekund.',vegPrep(c),vegPrep(d),...meatExtras.flatMap(meatCook),`Warzywa podduś na patelni 3–4 minuty, dodaj ${b.toLowerCase()} i wymieszaj.`,`Dodaj roztrzepane jajka, ${e.toLowerCase()}${meatExtras.length?' i wcześniej przygotowane mięso':''}; smaż na małym ogniu 5–7 minut lub piecz 12–15 minut w 185°C do pełnego ścięcia jajek (71°C).`,`Podaj na czystym talerzu${extras.filter(x=>!meatExtras.includes(x)).length?', dodając '+extras.filter(x=>!meatExtras.includes(x)).join(' i '):''}.`];}
 if(style==='salad')return [...initial,...mainForNew(a),prepareCarb(b),...extrasPrep,...extrasPrep,`Przygotuj dressing: wymieszaj ${e.toLowerCase()} z 1–2 łyżkami wody, jeżeli jest zbyt gęsty.`,`Na talerzu ułóż ${b.toLowerCase()}, oba warzywa i wcześniej przygotowany składnik główny (${a.toLowerCase()}).`,finalExtras,'Dodaj sos tuż przed podaniem, aby warzywa pozostały chrupiące.'].filter(Boolean);
 if(style==='sandwich')return [...initial,...mainForNew(a),prepareCarb(b),...extrasPrep,...extrasPrep,`Pokrój przygotowany składnik główny w małe kawałki i nałóż na ${b.toLowerCase()}.`,`Dodaj warzywa, następnie rozprowadź ${e.toLowerCase()}.`,finalExtras,'Złóż kanapkę lub tortillę i podaj bezpośrednio po przygotowaniu.'].filter(Boolean);
 if(style==='soup')return [...initial,...mainForNew(a),...extrasPrep,`W garnku zagotuj ${b.toLowerCase()} i dodaj przygotowane warzywa.`,`Gotuj pod przykryciem na średnio-małym ogniu 12–18 minut, aż twardsze warzywa zmiękną.`,`Dodaj ${e.toLowerCase()} i wcześniej przygotowany składnik główny; podgrzewaj 3–4 minuty.`,finalExtras,'Wlej zupę do miski i podaj na gorąco.'].filter(Boolean);
 if(style==='bake')return [...initial,...mainForNew(a),prepareCarb(b),...extrasPrep,...extrasPrep,'Piekarnik nagrzej do 190°C, naczynie do zapiekania lekko zwilż wodą.',`Ułóż warstwowo ${b.toLowerCase()}, przygotowane warzywa i ${a.toLowerCase()}; rozprowadź ${e.toLowerCase()}.`,'Piecz 15–22 minuty, aż całość będzie gorąca w środku (zapiekanki 74°C) i wierzch lekko się zarumieni.',finalExtras].filter(Boolean);
 if(style==='stew')return [...initial,...mainForNew(a),prepareCarb(b),...extrasPrep,...extrasPrep,`Na patelni podduś warzywa 4–5 minut, dodaj ${e.toLowerCase()} i 3 łyżki wody.`,'Gotuj pod przykryciem 7–10 minut, aż sos zgęstnieje. Dodaj wcześniej przygotowany składnik główny na ostatnie 3 minuty.',`Podawaj z ${b.toLowerCase()}, ${finalExtras}`].filter(Boolean);
 if(style==='pasta')return [...initial,...mainForNew(a),prepareCarb(b),...extrasPrep,...extrasPrep,`Warzywa smaż w szerokim rondlu z 2–3 łyżkami wody przez 5–6 minut.`,`Dodaj ${e.toLowerCase()} i 2 łyżki wody z gotowania makaronu; mieszaj 2–3 minuty.`,`Dodaj ugotowany makaron i wcześniej przygotowany składnik główny; podgrzewaj 1–2 minuty.`,finalExtras].filter(Boolean);
 if(style==='stir')return [...initial,...mainForNew(a),prepareCarb(b),...extrasPrep,...extrasPrep,`Na dużej patelni smaż warzywa około 4–5 minut, często mieszając i dodając łyżkę wody, jeśli przywierają.`,`Wlej ${e.toLowerCase()} oraz 2 łyżki wody, podgrzewaj jeszcze 2 minuty.`,`Wymieszaj z przygotowanym składnikiem głównym i ${b.toLowerCase()}; podgrzej 1–2 minuty.`,finalExtras].filter(Boolean);
 return [...initial,...mainForNew(a),prepareCarb(b),...extrasPrep,`Połącz ${a.toLowerCase()} i ${b.toLowerCase()} z przygotowanymi warzywami.`,`Dodaj ${e.toLowerCase()} i podgrzewaj 2–3 minuty, mieszając.`,finalExtras,finish].filter(Boolean);
}
function newDish(meal,name,style,source){
 const components=source.split('|').map(x=>x.trim()).filter(Boolean);
 for(const k of components)if(!portions[k])throw Error('Brak składnika w tabeli: '+k+' w '+name);
 if(components.length<5)throw Error('Przepis ma za mało składników: '+name);
 const ingredientPairs=components.map(k=>[k,portions[k][0],portions[k][1]]);
 let calories=0,protein=0;
 for(const k of components){const [q,p,c,pr]=portions[k];const factor=(k==='Jajka')?q:q/100;calories+=c*factor;protein+=pr*factor;}
 const category=/kurczak|indyk|drobi|wędlina/i.test(components[0])?'chicken':/wołow/i.test(components[0])?'beef':/wieprz|polędwiczk|łopatk/i.test(components[0])?'pork':/łosoś|tuńczyk/i.test(components[0])?'fish':meal==='Śniadanie'?'breakfast':'veg';
 const cookingTime={egg:22,sandwich:25,porridge:15,stir:35,stew:40,pasta:40,bake:55,soup:40,salad:35,dessert:20,smoothie:10}[style]||35;
 const hasSlow=components.some(k=>/łopatk|na gulasz/i.test(k));
 const r={id:3000+recipes.length-oldCount,name,meal,kind:category,calories:Math.round(calories),protein:Math.round(protein),ingredients:ingredientPairs,steps:newSteps(style,components),minutes:hasSlow?Math.max(120,cookingTime):cookingTime,image:images[category]||images.veg};
 if(allOriginalIds.has(r.id)||recipes.some(x=>x.id===r.id))throw Error('Duplikat ID '+r.id);
 recipes.push(r);
}

const newEntries=[
// ŚNIADANIA (16)
['Śniadanie','Wytrawny omlet z indykiem, szpinakiem i fetą','egg','Jajka|Feta|Szpinak|Cebula|Jogurt naturalny|Filet z indyka|Natka pietruszki'],
['Śniadanie','Kanapka klubowa z kurczakiem i rukolą','sandwich','Pierś z kurczaka|Pieczywo pełnoziarniste|Rukola|Pomidor|Musztarda|Mozzarella'],
['Śniadanie','Tortilla z indykiem, papryką i sosem jogurtowym','sandwich','Filet z indyka|Tortilla pełnoziarnista|Papryka czerwona|Sałata|Jogurt naturalny|Szczypiorek'],
['Śniadanie','Bajeczna owsianka bananowo-orzechowa','porridge','Płatki owsiane|Mleko|Banan|Masło orzechowe|Cynamon'],
['Śniadanie','Tosty z łososiem wędzonym i serkiem','sandwich','Łosoś wędzony|Pieczywo żytnie|Ogórek|Rukola|Serek wiejski|Koperek'],
['Śniadanie','Bułka z szynką, mozzarellą i pomidorem','sandwich','Szynka|Bułka pełnoziarnista|Pomidor|Sałata|Mozzarella|Bazylia'],
['Śniadanie','Jajecznica z pieczarkami i indykiem','egg','Jajka|Jogurt naturalny|Pieczarki|Cebula|Feta|Filet z indyka'],
['Śniadanie','Tortilla z kurczakiem, awokado i sałatą','sandwich','Pierś z kurczaka|Tortilla|Sałata|Pomidor|Jogurt grecki|Awokado|Cytryna'],
['Śniadanie','Grzanki z twarożkiem, rzodkiewką i szczypiorkiem','sandwich','Twaróg|Pieczywo pełnoziarniste|Ogórek|Pomidor|Jogurt naturalny|Szczypiorek'],
['Śniadanie','Ciepła pita z indykiem i czerwonym pesto','sandwich','Wędlina z indyka|Pita|Papryka|Szpinak|Pesto bazyliowe|Mozzarella'],
['Śniadanie','Jajka z kurczakiem, brokułem i pomidorami','egg','Jajka|Mozzarella|Brokuł|Pomidor|Jogurt naturalny|Pierś z kurczaka'],
['Śniadanie','Owsianka z gruszką, migdałami i cynamonem','porridge','Płatki owsiane|Mleko|Gruszka|Migdały|Cynamon'],
['Śniadanie','Tost z szynką, fetą i pieczarkami','sandwich','Szynka|Pieczywo pełnoziarniste|Pieczarki|Rukola|Feta|Musztarda'],
['Śniadanie','Miska śniadaniowa z indykiem i bulgurem','salad','Filet z indyka|Kasza bulgur|Ogórek|Papryka|Jogurt naturalny|Natka pietruszki'],
['Śniadanie','Jajka zapiekane z pomidorami i mozzarellą','egg','Jajka|Mozzarella|Pomidor|Szpinak|Passata|Bazylia'],
['Śniadanie','Skyr z mango i orzechami włoskimi','dessert','Skyr|Jogurt naturalny|Mango|Orzechy włoskie|Nasiona chia'],
// OBIADY (32)
['Obiad','Kurczak po tajsku z mango i ryżem jaśminowym','stir','Pierś z kurczaka|Ryż jaśminowy|Papryka żółta|Mango|Sos sojowy|Limonka|Orzeszki ziemne'],
['Obiad','Indyk w kremowym sosie porowym z kaszą','stew','Filet z indyka|Kasza gryczana|Por|Pieczarki|Śmietanka 12%|Natka pietruszki'],
['Obiad','Wołowina duszona z marchewką i bulgurem','stew','Wołowina na gulasz|Kasza bulgur|Marchew|Cebula|Passata|Papryka wędzona'],
['Obiad','Polędwiczka z pieczarkami i ziemniakami','stew','Polędwiczka wieprzowa|Ziemniaki|Pieczarki|Cebula|Śmietanka 12%|Natka pietruszki'],
['Obiad','Makaron z kurczakiem, pesto i brokułem','pasta','Pierś z kurczaka|Makaron pełnoziarnisty|Brokuł|Pomidorki koktajlowe|Pesto bazyliowe|Parmezan'],
['Obiad','Orzo z indykiem i suszonymi pomidorami','pasta','Filet z indyka|Makaron orzo|Suszone pomidory|Szpinak|Śmietanka 12%|Bazylia'],
['Obiad','Penne z wołowiną i pieczoną papryką','pasta','Wołowina|Makaron pełnoziarnisty|Papryka czerwona|Cebula|Passata|Parmezan'],
['Obiad','Makaron z łososiem, cukinią i koperkiem','pasta','Łosoś|Makaron pełnoziarnisty|Cukinia|Szpinak|Jogurt naturalny|Koperek'],
['Obiad','Curry z kurczakiem i kalafiorem','stew','Pierś z kurczaka|Ryż basmati|Kalafior|Szpinak|Mleczko kokosowe|Pasta curry|Imbir'],
['Obiad','Curry z indykiem, brokułem i limonką','stew','Filet z indyka|Ryż basmati|Brokuł|Papryka|Mleczko kokosowe|Limonka|Pasta curry'],
['Obiad','Curry z wołowiną i batatem','stew','Wołowina na gulasz|Bataty|Cebula|Papryka czerwona|Mleczko kokosowe|Garam masala'],
['Obiad','Curry z tofu, groszkiem i pomidorami','stew','Tofu|Ryż basmati|Zielony groszek|Pomidor|Mleczko kokosowe|Pasta curry'],
['Obiad','Bowl z kurczakiem, komosą i pieczonym burakiem','salad','Pierś z kurczaka|Komosa ryżowa|Burak gotowany|Rukola|Jogurt grecki|Orzechy włoskie'],
['Obiad','Bowl z indykiem, fasolą i papryką','salad','Filet z indyka|Ryż|Papryka czerwona|Fasola czerwona|Jogurt naturalny|Kumin'],
['Obiad','Bowl z łososiem, szpinakiem i cytryną','salad','Łosoś|Kasza bulgur|Szpinak|Ogórek|Jogurt grecki|Cytryna'],
['Obiad','Bowl z wołowiną, kapustą i sezamem','salad','Wołowina|Ryż jaśminowy|Kapusta czerwona|Marchew|Sos sojowy|Sezam'],
['Obiad','Kurczak zapiekany z ziemniakami i fetą','bake','Pierś z kurczaka|Ziemniaki|Papryka czerwona|Cukinia|Feta|Oregano'],
['Obiad','Indyk zapiekany z brokułem i mozzarellą','bake','Filet z indyka|Ziemniaki|Brokuł|Cebula|Mozzarella|Musztarda'],
['Obiad','Zapiekanka z wieprzowiną i batatami','bake','Polędwiczka wieprzowa|Bataty|Szpinak|Cebula|Mozzarella|Papryka wędzona'],
['Obiad','Zapiekane orzo z kurczakiem i pomidorami','bake','Pierś z kurczaka|Makaron orzo|Pomidorki koktajlowe|Cukinia|Mozzarella|Bazylia'],
['Obiad','Zupa kokosowa z indykiem i ryżem','soup','Filet z indyka|Bulion|Marchew|Pieczarki|Mleczko kokosowe|Ryż jaśminowy|Imbir'],
['Obiad','Zupa paprykowa z kurczakiem i fasolą','soup','Pierś z kurczaka|Bulion warzywny|Papryka|Fasola czerwona|Passata|Natka pietruszki'],
['Obiad','Zupa gulaszowa z wołowiną i ziemniakami','soup','Wołowina na gulasz|Bulion|Ziemniaki|Marchew|Passata|Papryka wędzona'],
['Obiad','Rozgrzewający rosół z indykiem i warzywami','soup','Filet z indyka|Bulion|Marchew|Por|Oliwa|Natka pietruszki'],
['Obiad','Kurczak teriyaki z chrupiącym brokułem','stir','Mięso z udka kurczaka bez kości|Ryż jaśminowy|Brokuł|Marchew|Sos sojowy|Miód|Sezam'],
['Obiad','Indyk z papryką, orzeszkami i ryżem','stir','Filet z indyka|Ryż basmati|Papryka żółta|Cebula|Sos sojowy|Orzeszki ziemne'],
['Obiad','Polędwiczka z cukinią, imbirem i ryżem','stir','Polędwiczka wieprzowa|Ryż|Cukinia|Papryka|Sos sojowy|Imbir'],
['Obiad','Wołowina stir-fry z kapustą i marchewką','stir','Wołowina|Makaron ryżowy|Kapusta czerwona|Marchew|Sos sojowy|Sezam'],
['Obiad','Wrap z kurczakiem, fasolą i kukurydzą','sandwich','Pierś z kurczaka|Tortilla|Fasola czarna|Kukurydza|Jogurt naturalny|Kumin'],
['Obiad','Wrap z indykiem, pomidorem i rukolą','sandwich','Filet z indyka|Tortilla pełnoziarnista|Pomidor|Rukola|Jogurt grecki|Musztarda'],
['Obiad','Pita z wołowiną i sosem tahini','sandwich','Wołowina|Pita|Kapusta czerwona|Ogórek|Tahini|Cytryna'],
['Obiad','Tortilla z łososiem, szpinakiem i fetą','sandwich','Łosoś|Tortilla|Szpinak|Pomidor|Jogurt naturalny|Feta'],
// KOLACJE (18)
['Kolacja','Sałatka z indykiem, burakiem i fetą','salad','Filet z indyka|Kasza bulgur|Burak gotowany|Rukola|Jogurt grecki|Feta'],
['Kolacja','Sałatka z kurczakiem, mango i orzeszkami','salad','Pierś z kurczaka|Ryż|Mango|Mix sałat|Jogurt naturalny|Orzeszki ziemne'],
['Kolacja','Sałatka z wołowiną, ogórkiem i sezamem','salad','Wołowina|Kasza bulgur|Ogórek|Kapusta czerwona|Sos sojowy|Sezam'],
['Kolacja','Sałatka z łososiem, ziemniakami i koperkiem','salad','Łosoś|Ziemniaki|Ogórek|Mix sałat|Jogurt naturalny|Koperek'],
['Kolacja','Tortilla z kurczakiem, brokułem i cheddarem','sandwich','Pierś z kurczaka|Tortilla|Brokuł|Papryka|Jogurt naturalny|Cheddar'],
['Kolacja','Pita z indykiem, ogórkiem i sosem czosnkowym','sandwich','Filet z indyka|Pita|Ogórek|Sałata|Jogurt grecki|Czosnek'],
['Kolacja','Tost z szynką, papryką i mozzarellą','sandwich','Szynka|Pieczywo pełnoziarniste|Papryka|Pomidor|Mozzarella|Bazylia'],
['Kolacja','Kanapka z łososiem wędzonym i rukolą','sandwich','Łosoś wędzony|Pieczywo żytnie|Rukola|Ogórek|Serek wiejski|Koperek'],
['Kolacja','Makaron z indykiem, szpinakiem i czosnkiem','pasta','Filet z indyka|Makaron pełnoziarnisty|Szpinak|Cebula|Jogurt naturalny|Czosnek'],
['Kolacja','Orzo z kurczakiem, cukinią i bazylią','pasta','Pierś z kurczaka|Makaron orzo|Cukinia|Pomidor|Passata|Bazylia'],
['Kolacja','Ryż z wołowiną, brokułem i sezamem','stir','Wołowina|Ryż|Brokuł|Marchew|Sos sojowy|Sezam'],
['Kolacja','Kasza z polędwiczką i pieczarkami','stew','Polędwiczka wieprzowa|Kasza gryczana|Pieczarki|Por|Jogurt naturalny|Natka pietruszki'],
['Kolacja','Krem pomidorowy z indykiem i mozzarellą','soup','Filet z indyka|Bulion warzywny|Pomidor|Cebula|Passata|Mozzarella'],
['Kolacja','Zupa brokułowa z kurczakiem i pestkami','soup','Pierś z kurczaka|Bulion|Brokuł|Ziemniaki|Jogurt naturalny|Pestki dyni'],
['Kolacja','Krem z kalafiora z szynką i szczypiorkiem','soup','Szynka|Bulion warzywny|Kalafior|Ziemniaki|Jogurt grecki|Szczypiorek'],
['Kolacja','Zupa z łososiem, porem i ziemniakami','soup','Łosoś|Bulion|Por|Ziemniaki|Śmietanka 12%|Koperek'],
['Kolacja','Zapiekany kurczak z brokułem i fetą','bake','Pierś z kurczaka|Bataty|Brokuł|Cebula|Feta|Papryka wędzona'],
['Kolacja','Zapiekanka z indykiem, cukinią i mozzarellą','bake','Mięso mielone z indyka|Ziemniaki|Cukinia|Szpinak|Mozzarella|Czosnek'],
// PRZEKĄSKI (4)
['Przekąska','Serek wiejski z ogórkiem i pestkami','salad','Serek wiejski|Pieczywo żytnie|Ogórek|Rukola|Jogurt naturalny|Pestki dyni'],
['Przekąska','Kanapeczka z indykiem i pomidorem','sandwich','Wędlina z indyka|Pieczywo pełnoziarniste|Pomidor|Sałata|Musztarda|Szczypiorek'],
['Przekąska','Koktajl bananowo-truskawkowy','smoothie','Banan|Mleko|Truskawki|Skyr|Miód'],
['Przekąska','Pucharek skyr z malinami i migdałami','dessert','Skyr|Jogurt naturalny|Maliny|Migdały|Miód'],
// DESERY (6)
['Deser','Krem czekoladowy z twarogu i kakao','dessert','Twaróg|Jogurt naturalny|Banan|Kakao|Miód'],
['Deser','Pucharek malinowy z chia i skyrem','dessert','Skyr|Jogurt naturalny|Maliny|Nasiona chia|Miód'],
['Deser','Deser brzoskwiniowo-orzechowy','dessert','Jogurt grecki|Skyr|Brzoskwinia|Orzechy włoskie|Miód'],
['Deser','Krem mango z jogurtem i chia','dessert','Skyr|Jogurt naturalny|Mango|Nasiona chia|Miód'],
['Deser','Deser gruszkowy z kakao i migdałami','dessert','Jogurt grecki|Twaróg|Gruszka|Kakao|Migdały'],
['Deser','Kakaowy pucharek z bananem i orzechami','dessert','Skyr|Jogurt naturalny|Banan|Masło orzechowe|Kakao']
];
for(const [meal,name,style,source] of newEntries)newDish(meal,name,style,source);
if(recipes.length!==oldCount+newEntries.length)throw Error('Nie zgadza się liczba nowych przepisów');
if(new Set(recipes.map(r=>r.id)).size!==recipes.length)throw Error('Duplikaty identyfikatorów');
for(const r of recipes){if(!Array.isArray(r.steps)||r.steps.length<3)throw Error('Niepoprawna instrukcja: '+r.name)}
})();
