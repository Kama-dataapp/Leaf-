
/* ACT III — uses the same canvas, grid movement and dialogue system as Act I.
   This source is injected inside the main Marlenka game closure. */
function act3Objects(){
 const z=state.act3.zone,p=state.act3.phase;
 const o=(id,name,x,y)=>({id,name,x,y,hx:x-.7,hy:y-1.1,hw:1.5,hh:2});
 if(z==='car')return [o('a3door','Drzwi samochodu',11,6)];
 if(z==='street')return [o('a3entry','Wejście do McDonalda',11,4),o('a3car','Samochód',3,7)].concat(p===7?[o('a3road','Szymon',8,6)]:[]);
 return [
  o('a3order','Kasa — zamów jedzenie',11,3),
  o('a3table','Wspólny stolik',7,6),
  o('a3exit','Wyjście z McDonalda',7,8),
  o('a3szymon','Szymon',4,5),o('a3piasek','Piasek',10,6),
  o('a3natalka','Natalka',3,7),o('a3karolina','Karolina',12,6)
 ];
}
function act3CanWalk(){return true}
function act3Quest(){
 const content=[
 ['01','Pomysł Marlenki','Rozmowa w samochodzie przed spotkaniem.','a3door'],
 ['02','Idźcie do McDonalda','Wysiadacie i ruszacie do restauracji.','a3entry'],
 ['03','Zamówcie jedzenie','Przy kasie wybierzcie i zamówcie coś do jedzenia.','a3order'],
 ['04','Usiądźcie z ekipą','Szymon, Piasek, Natalka i Karolina są na miejscu.','a3table'],
 ['05','Porozmawiaj z Szymonem','Kamiś wybiera się do samochodu po liquid.','a3szymon'],
 ['06','W drogę!','Teraz sterujesz Kamisiem. Wyjdź z restauracji.','a3exit'],
 ['07','Liquid z samochodu','Podejdź do samochodu, z którego trzeba go zabrać.','a3car'],
 ['08','Pytanie Szymona','W drodze powrotnej Szymon chce o coś zapytać.','a3road'],
 ['09','Wracajcie do Maka','Wróć razem z Szymonem do reszty.','a3entry'],
 ['10','Znajomi czekają','Podejdź ponownie do wspólnego stolika.','a3table'],
 ['✓','Akt III ukończony!','To wspomnienie jest zapisane. Możesz nadal spacerować.','a3table']
 ];
 const q=content[Math.min(10,state.act3.phase)];
 return {num:q[0],title:q[1],desc:q[2],hint:'Ruch jak w Akcie I: WASD, strzałki lub dotyk; E — interakcja.',target:act3Objects().some(o=>o.id===q[3])?[q[3]]:[]}
}
function act3Phase(n){state.act3.phase=n;updateUI();save()}
function act3Move(z,x,y){
 state.act3.zone=z;state.act3.pos={x,y};
 player={x,y,fromX:x,fromY:y,toX:x,toY:y,movedAt:0,face:'down'};
 path=[];pressed.clear();$('memoryOverlay').hidden=true;updateUI();save()
}
function act3Dialogue(lines,done){showDialogue(lines.map(a=>({who:a[0],text:a[1]})),done)}
function act3CarIntro(){
 act3Dialogue([
 ['Narrator','AKT III. Po osiemnastce Szymona jedziecie razem samochodem na spotkanie z ekipą w McDonaldzie.'],
 ['Marlenka','A może będziemy dalej udawać, że jesteśmy parą? Spróbujmy jeszcze raz nabrać znajomych!'],
 ['Kamiś','Dobra, spróbujmy. Zobaczymy, czy się wkręcą.'],
 ['Narrator','Na miejscu są Szymon, Piasek, Natalka i Karolina. Najpierw wysiadacie z samochodu, a potem idziecie do McDonalda.']
 ],()=>{act3Phase(1);act3Move('street',3,7);notify('Podejdź do wejścia do McDonalda.')})
}
function startAct3(){
 if(!state.birthday?.rideFinished){notify('Najpierw ukończ osiemnastkę Szymona.');return}
 started=true;state.started=true;state.scene='act3';state.act3.visited=true;
 for(const id of ['endingScreen','kissScreen','startScreen','panelModal','dialogOverlay'])$(id).hidden=true;
 $('memoryOverlay').hidden=true;
 const v=state.act3.pos||{x:8,y:6};
 act3Move(state.act3.zone,v.x,v.y);
 if(state.act3.phase===0)act3CarIntro()
}
function act3Interact(id){
 const a=state.act3,p=a.phase;
 const say=(txt)=>act3Dialogue([['Narrator',txt]]);
 if(id==='a3door'){if(p===0)act3CarIntro();else act3Move('street',3,7);return}
 if(id==='a3entry'){
  if(p===1){act3Phase(2);act3Move('inside',7,7);say('W McDonaldzie są już Szymon, Piasek, Natalka i Karolina. Wy pamiętacie swój plan: dalej udawać związek. Najpierw zamawiacie jedzenie.')}
  else if(p===8){act3Phase(9);act3Move('inside',7,8);say('Kamiś i Szymon wracają do reszty znajomych.')}
  else act3Move('inside',7,8);
  return
 }
 if(id==='a3order'){
  if(p===2)act3Dialogue([
   ['Narrator','Podchodzicie do kasy, wybieracie jedzenie i składacie zamówienie.'],
   ['Narrator','Po odebraniu jedzenia idziecie razem do stolika.']
  ],()=>{act3Phase(3);notify('Podejdź do wspólnego stolika.')});
  else say('Tutaj już zamówiliście jedzenie.');
  return
 }
 if(id==='a3table'){
  if(p===3)act3Dialogue([
   ['Narrator','Siedzicie i jecie z Szymonem, Piaskiem, Natalką i Karoliną.'],
   ['Narrator','Ty i Marlenka nadal udajecie, że jesteście razem.'],
   ['Kamiś','Idę po liquid do samochodu.']
  ],()=>{act3Phase(4);notify('Szymon chce dołączyć. Porozmawiaj z nim.')});
  else if(p===9)act3Dialogue([
   ['Narrator','Wracacie z Szymonem do wspólnego spotkania. Wasz żart się udał — Szymon uwierzył w udawany związek.'],
   ['Księga Wspomnień','Rozmowa w aucie, McDonald, jedzenie z ekipą, liquid z samochodu i Szymon wkręcony w żart. 💗']
  ],()=>{a.finished=true;act3Phase(10);if(!a.reward){a.reward=true;state.hearts+=40;sound('win')}save();notify('Nowe wspomnienie zapisane!')});
  else say('Wspólny stolik. To tutaj wszyscy razem jedliście.');
  return
 }
 if(id==='a3szymon'){
  if(p===4)act3Dialogue([
   ['Szymon','Idziesz po liquid do samochodu? Mogę pójść z tobą?'],
   ['Myśli Kamisia','Jako człowiek przystojny, odważny, śmiały i ponadprzeciętnie inteligentny — oczywiście się zgadzam.']
  ],()=>{act3Phase(5);notify('Teraz sterujesz Kamisiem. Idź do wyjścia.')});
  else say('Szymon jest dzisiaj na spotkaniu z całą ekipą.');
  return
 }
 if(id==='a3exit'){
  if(p===5){act3Phase(6);act3Move('street',11,5);notify('Idź do samochodu po liquid — Szymon idzie razem z Tobą.')}
  else if(p<5)notify('Najpierw dokończ jedzenie i rozmowę z Szymonem.');
  else act3Move('street',11,5);
  return
 }
 if(id==='a3car'){
  if(p===6)act3Dialogue([
   ['Narrator','Kamiś podchodzi do zaparkowanego auta i zabiera z niego liquid.'],
   ['Narrator','Szymon idzie razem z Kamisiem. Teraz ruszają z powrotem do McDonalda.']
  ],()=>{a.liquid=true;act3Phase(7);notify('W drodze powrotnej porozmawiaj z Szymonem.')});
  else say('To samochód, którym przyjechaliście do McDonalda.');
  return
 }
 if(id==='a3road'){
  if(p===7)act3Dialogue([
   ['Szymon','A Ty coś kręcisz z Marlenką?'],
   ['Narrator','Chwila rozmowy i Kamiś daje do zrozumienia, że coś między nimi jest — w ramach Waszego żartu.'],
   ['Narrator','Szymon daje się nabrać. Wierzy, że jesteście parą.']
  ],()=>{a.fooled=true;act3Phase(8);notify('Wracaj razem z Szymonem do McDonalda.')});
  else say('Szymon idzie razem z Kamisiem.');
  return
 }
 const names={a3piasek:'Piasek',a3natalka:'Natalka',a3karolina:'Karolina'};
 if(names[id])say(names[id]+' jest z Wami w McDonaldzie.');
}
function act3Person(x,y,type,scale=1){
 const colors={
  kamis:['#a48760','#5e7998','#f0c5af','#478bbd'],
  szymon:['#6b504c','#8fa59f','#edc3aa','#665e62'],
  piasek:['#b49a6a','#d49b74','#edc2a9','#5f5b6e'],
  natalka:['#58484c','#ab92cf','#eec3b2','#574a66'],
  karolina:['#99745c','#c4ae7b','#f1c4a7','#4c7771'],
  marlena:['#755047','#d995b2','#f5c6aa','#5a4559']
 };
 const c=colors[type]||colors.kamis;
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 ellipse(0,25,19,6,'#7b617555');
 drawRounded(-14,0,13,24,4,'#69627e');drawRounded(3,0,13,24,4,'#69627e');
 drawRounded(-21,-32,43,38,9,c[1]);
 ellipse(-23,-11,6,13,c[1]);ellipse(23,-11,6,13,c[1]);
 ellipse(0,-51,21,23,c[2]);ellipse(-9,-53,2.8,3.4,c[3]);ellipse(9,-53,2.8,3.4,c[3]);
 line(-5,-42,6,-42,'#b6727a',2);
 ellipse(0,-72,23,12,c[0]);drawRounded(-21,-70,42,9,4,c[0]);
 if(['marlena','natalka','karolina'].includes(type)){drawRounded(-22,-71,8,31,5,c[0]);drawRounded(16,-71,8,31,5,c[0])}
 ctx.restore()
}
function act3Title(label,x,y){
 ctx.textAlign='center';ctx.font='bold 12px system-ui';
 const w=ctx.measureText(label).width+16;
 drawRounded(x-w/2,y-98,w,18,9,'#fffcf7ee');
 ctx.fillStyle='#765267';ctx.fillText(label,x,y-85)
}
function act3Scene(time){
 const z=state.act3.zone,p=state.act3.phase;
 ctx.fillStyle=z==='street'?'#d9efd3':'#f7ece7';ctx.fillRect(0,0,W,H);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  ctx.fillStyle=z==='street'?((x+y)%2?'#daedd2':'#dfefd7'):((x+y)%2?'#f9f0e9':'#f4e8e0');
  ctx.fillRect(x*TILE,y*TILE,TILE,TILE)
 }
 if(z==='car'){
  drawRounded(34,32,892,245,24,'#9db8c5');
  drawRounded(58,52,844,207,18,'#c5dce0');
  for(let j=0;j<9;j++)ellipse(84+j*100,229,55,33,'#acc8b4');
  drawRounded(35,315,890,262,28,'#e2cabe');
  drawRounded(65,369,370,165,20,'#f8e9e1');
  drawRounded(520,369,360,165,20,'#f8e9e1');
  drawRounded(436,389,88,147,13,'#bbabb0');
  act3Person(264,464,'kamis',2);
  act3Person(680,464,'marlena',2);
  ctx.fillStyle='#69566b';ctx.font='bold 22px system-ui';ctx.textAlign='center';
  ctx.fillText('W drodze do McDonalda',W/2,346);
  return
 }
 if(z==='street'){
  drawRounded(0,258,960,134,15,'#f0e2d9');
  for(let x=0;x<960;x+=65)line(x,296,x+29,296,'#e2c9bd',2);
  drawRounded(572,28,340,217,20,'#f5e3d9','#d4b7b3',5);
  drawRounded(563,17,362,57,12,'#c65b68');
  drawRounded(592,90,91,110,10,'#bddbdf');
  drawRounded(694,90,94,110,10,'#bddbdf');
  drawRounded(804,87,83,151,12,'#8eabb1');
  line(843,93,843,232,'#f7f1e9',6);
  ctx.textAlign='center';ctx.fillStyle='#fff8ed';ctx.font='bold 23px system-ui';ctx.fillText('McDONALD',745,52);
  drawRounded(94,487,254,109,20,'#b6cbd7');
  drawRounded(124,457,195,56,22,'#95a9b7');
  drawRounded(122,530,51,55,9,'#687687');drawRounded(265,530,51,55,9,'#687687');
  drawRounded(147,466,130,39,11,'#d6e8eb');
  ellipse(91,530,12,12,'#fff5c6');ellipse(349,530,12,12,'#fff5c6');
  for(const x of [100,340,485]){
   line(x,250,x,146,'#917b81',8);ellipse(x,136,38,36,'#f0bfcf');ellipse(x+23,147,28,30,'#eab1c8');
  }
  if(p===1){act3Person(260,395,'kamis');act3Title('Kamiś',260,395)}
  if(p>=6&&p<=8){act3Person((player.x+.5)*TILE+55,(player.y+.5)*TILE+7,'szymon',.87)}
  if(p===7){act3Person(8.5*TILE,6.4*TILE,'szymon');act3Title('Szymon',8.5*TILE,6.4*TILE)}
 }else{
  drawRounded(29,21,900,181,19,'#ecd0c5');drawRounded(45,38,870,140,11,'#f7e5d6');
  for(let i=0;i<4;i++){drawRounded(84+i*215,77,174,90,8,'#bfd9d9');line(171+i*215,79,171+i*215,166,'#fff9ef',5)}
  drawRounded(516,47,386,134,12,'#c99480');
  for(let i=0;i<3;i++){drawRounded(550+i*111,36,101,42,8,'#4e6572');ctx.textAlign='center';ctx.fillStyle='#f8edcc';ctx.font='bold 12px system-ui';ctx.fillText('MENU',600+i*111,61)}
  ellipse(457,388,163,94,'#987e8e50');drawRounded(355,326,240,112,28,'#e1b591');
  drawRounded(366,335,218,94,23,'#f9d7ae');
  for(let i=0;i<4;i++){drawRounded(385+i*45,366,34,20,4,'#fcf1d7');ellipse(402+i*45,367,13,6,'#e8ae61')}
  drawRounded(400,556,149,78,12,'#bfd3d0');line(474,557,474,638,'#fff9f0',5);
  const people=[['szymon',4,5],['piasek',10,6],['natalka',3,7],['karolina',12,6]];
  for(const item of people){
   const x=(item[1]+.5)*TILE,y=(item[2]+.5)*TILE;
   act3Person(x,y,item[0]);act3Title(item[0].charAt(0).toUpperCase()+item[0].slice(1),x,y)
  }
 }
}
