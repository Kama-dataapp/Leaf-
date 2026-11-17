(function(){
'use strict';
const styles={
 marlena:{hair:'#574044',hair2:'#84605d',eyes:'#665668',skin:'#f5c8b0',shirt:'#cf91b7',dark:'#ab6b92',pants:'#755875',shoe:'#5c4761'},
 kamis:{hair:'#987653',hair2:'#c7a67c',eyes:'#428fcb',skin:'#eec3ac',shirt:'#718ba1',dark:'#4b627d',pants:'#41516a',shoe:'#27384a'},
 szymon:{hair:'#604944',hair2:'#91736d',eyes:'#5e666b',skin:'#edc1a8',shirt:'#7c9a94',dark:'#52786f',pants:'#586577',shoe:'#374559'},
 piasek:{hair:'#a58755',hair2:'#d1bb81',eyes:'#68595a',skin:'#f0c7ad',shirt:'#dba077',dark:'#b77d56',pants:'#65727e',shoe:'#435162'},
 natalka:{hair:'#493a40',hair2:'#74515a',eyes:'#5e5778',skin:'#f5c7b6',shirt:'#9888c7',dark:'#7063a7',pants:'#74648c',shoe:'#514465'},
 karolina:{hair:'#9b654d',hair2:'#c89472',eyes:'#5d7965',skin:'#eec4a7',shirt:'#b8a26d',dark:'#947d4b',pants:'#637f78',shoe:'#405b53'}
};
const r=(g,x,y,w,h,rad,color)=>{g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,rad);g.fill()};
const ellipse=(g,x,y,rx,ry,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);g.fill()};
const lin=(g,x,y,ex,ey,color,width=2)=>{g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke()};
const poly=(g,points,color)=>{g.fillStyle=color;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill()};
function label(g,str,x,y,size=20,color='#4f4054',weight=750){g.font=weight+' '+size+'px system-ui';g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';g.fillText(str,x,y)}
function human(g,x,y,kind,t,scale=.82,walking=false){
 const s=styles[kind]||styles.kamis,sw=walking?Math.sin(t*10+x)*9:0,bob=walking?Math.abs(Math.sin(t*10))*3:Math.sin(t*2+x)*.9;
 g.save();g.translate(x,y+bob);g.scale(scale,scale);
 ellipse(g,0,9,33,11,'#44505a48');
 lin(g,-12,-45,-14-sw,1,s.pants,18);lin(g,12,-45,14+sw,1,s.pants,18);
 r(g,-29-sw,-8,29,16,7,s.shoe);r(g,2+sw,-8,29,16,7,s.shoe);
 r(g,-32,-117,64,78,19,s.dark);r(g,-27,-116,54,74,18,s.shirt);
 lin(g,-30,-103,-42,-61,s.dark,18);lin(g,29,-103,42,-61,s.dark,18);
 lin(g,-42,-61,-47,-35,s.skin,12);lin(g,42,-61,45,-37,s.skin,12);
 ellipse(g,-47,-33,7,9,s.skin);ellipse(g,45,-34,7,9,s.skin);
 r(g,-10,-136,20,35,8,s.skin);
 ellipse(g,-34,-162,7,12,s.skin);ellipse(g,34,-162,7,12,s.skin);
 ellipse(g,0,-165,35,46,s.skin);
 ellipse(g,-24,-155,9,5,'#e9aeb1');ellipse(g,24,-155,9,5,'#e9aeb1');
 ellipse(g,-12,-173,5,5,s.eyes);ellipse(g,12,-173,5,5,s.eyes);
 ellipse(g,-10.5,-174.5,2,2,'#fff');ellipse(g,13.5,-174.5,2,2,'#fff');
 lin(g,-6,-148,6,-148,'#b57e78',2);
 ellipse(g,0,-199,36,20,s.hair);
 poly(g,[[-37,-197],[-31,-173],[-24,-188],[-15,-192],[-5,-182],[5,-193],[17,-184],[28,-194],[37,-181],[35,-208]],s.hair);
 poly(g,[[-27,-202],[-6,-213],[13,-207],[31,-204],[12,-200],[-1,-193],[-12,-199]],s.hair2);
 if(['marlena','natalka','karolina'].includes(kind)){r(g,-39,-174,12,53,7,s.hair);r(g,28,-173,12,52,7,s.hair)}
 poly(g,[[-14,-114],[0,-93],[14,-114]],'#fff6ef');lin(g,0,-103,0,-49,'#eedbdc',2);
 lin(g,-25,-88,-25,-68,'#ffffff70',2);lin(g,23,-88,23,-68,'#ffffff70',2);
 g.restore();
}
function auto(g,x,y,color){
 g.save();g.translate(x,y);ellipse(g,0,37,146,35,'#3d4b5540');
 r(g,-148,-34,296,86,24,color);
 poly(g,[[-94,-34],[-60,-92],[51,-92],[92,-34]],'#7992a1');
 poly(g,[[-80,-40],[-52,-83],[-4,-83],[-4,-40]],'#cfe8e8');
 poly(g,[[6,-40],[6,-83],[44,-83],[75,-40]],'#bee1e4');
 r(g,-105,41,58,26,8,'#34424b');r(g,49,41,58,26,8,'#34424b');
 r(g,-136,-17,22,19,6,'#fff4bd');r(g,114,-17,21,19,6,'#fff4bd');
 lin(g,-112,29,109,29,'#fff5dd90',3);g.restore();
}
function tree(g,x,y,scale=1){
 g.save();g.translate(x,y);g.scale(scale,scale);
 ellipse(g,0,12,68,19,'#35483b46');
 r(g,-11,-128,22,143,7,'#796657');
 for(let j=0;j<7;j++){const dx=Math.sin(j*1.7)*39,dy=Math.cos(j*1.8)*23;ellipse(g,dx,-151+dy,55,37,j%2?'#87ae89':'#a4c4a0')}
 for(let j=0;j<7;j++){ellipse(g,Math.sin(j*4.3)*47,-149+Math.cos(j*6.8)*32,5,4,'#edc2d4')}g.restore();
}
function lamp(g,x,y){
 ellipse(g,x,y,34,12,'#48584e55');lin(g,x,y,x,y-165,'#6e7074',9);
 ellipse(g,x,y-167,24,27,'#ffefbcaa');ellipse(g,x,y-167,13,16,'#fbe1a4');
}
function outside(g,t){
 const W=2450,H=1500;
 g.fillStyle='#bfd4b4';g.fillRect(0,0,W,H);
 for(let j=0;j<270;j++){const x=54+(j*137)%2340,y=47+(j*241)%1390;ellipse(g,x,y,1+(j%4),1.4,j%3?'#73997870':'#f9e9d8b8')}
 // distant homes, windows and roofs
 for(let j=0;j<8;j++){const x=36+j*300;
  r(g,x,155,222,160,12,j%2?'#d6bfbd':'#d2c8b9');
  poly(g,[[x-17,160],[x+107,80],[x+240,160]],'#927c84');
  for(let i=0;i<2;i++)for(let k=0;k<2;k++)r(g,x+31+i*110,177+k*62,47,42,6,'#a6c7cf');
 }
 // street, pavement and zebra crossing
 r(g,-8,837,W+16,267,4,'#929da2');
 r(g,0,806,W,35,4,'#e7daca');r(g,0,1103,W,37,4,'#e7daca');
 for(let i=0;i<18;i++)r(g,i*139+27,965,77,9,4,'#fdf9e5ac');
 for(let i=0;i<8;i++)r(g,1108+i*23,818,12,96,2,'#fffae0');
 for(let x=0;x<W;x+=63){lin(g,x,814,x+24,814,'#beb09d',2);lin(g,x,1118,x+21,1118,'#beb09d',2)}
 for(let j=0;j<11;j++)tree(g,96+j*218,502+(j%2)*120,.47+(j%3)*.11);
 tree(g,690,1280,1.1);tree(g,1540,1330,1.06);tree(g,2370,1260,1.15);
 for(let i=0;i<12;i++){ellipse(g,87+i*188,1193+(i%4)*43,28,14,'#8db599')}
 // McDonald building
 r(g,830,259,695,486,25,'#a78780');r(g,845,273,662,445,19,'#f1dfd0');
 r(g,818,251,716,75,14,'#bd5253');
 r(g,890,371,232,209,12,'#7395a1');r(g,1203,371,230,209,12,'#7395a1');
 for(let x of [898,1211]){r(g,x+7,379,210,191,8,'#b6d5d9');lin(g,x+112,377,x+112,574,'#fff1e2',8)}
 r(g,1086,607,201,138,9,'#789099');r(g,1097,615,180,121,7,'#c2dcdf');
 lin(g,1187,611,1187,740,'#f6f1e7',8);
 r(g,1018,268,352,50,14,'#ffefe5');label(g,'McDONALD',1194,293,29,'#704e55',850);
 label(g,'RESTAURACJA',1164,351,20,'#845f65');
 // shop for olejek
 r(g,1773,264,520,491,22,'#798e8e');r(g,1788,280,491,459,17,'#e2e7d9');
 r(g,1761,253,541,73,12,'#4b7075');r(g,1853,261,361,57,12,'#faf2e0');
 label(g,'AUTO · AKCESORIA',2034,288,27,'#48666b');
 for(let x of [1832,1979,2135]){r(g,x,379,115,188,10,'#93b7c0');r(g,x+10,388,95,170,6,'#d5edf0')}
 r(g,1985,608,153,143,11,'#96b6b6');lin(g,2061,609,2061,744,'#f5f1e5',7);
 label(g,'OLEJEK',1892,660,19,'#62757b');
 for(let x of [659,1678,2329])lamp(g,x,813);
 r(g,576,804,162,17,5,'#af8670');lin(g,592,821,592,841,'#8e6b60',8);lin(g,721,821,721,841,'#8e6b60',8);
 auto(g,373,1215,'#9db1c5');auto(g,834,1355,'#b3a1b5');auto(g,1662,1234,'#d5b39a');
}
function inside(g,t){
 const W=1900,H=1240;g.fillStyle='#eee0d2';g.fillRect(0,0,W,H);
 for(let y=151;y<H-90;y+=100)for(let x=145;x<W-140;x+=100){r(g,x+3,y+3,95,95,3,(x/100+y/100)%2?'#e5d3c5':'#f3e9dc')}
 r(g,112,112,1680,70,12,'#c75b51');r(g,117,175,48,955,10,'#d4a9a1');r(g,1743,175,48,955,10,'#d4a9a1');
 for(let i=0;i<6;i++){let x=241+i*240;r(g,x,192,191,143,14,'#a1c2c1');r(g,x+12,201,166,122,8,'#d0e9e9');lin(g,x+88,200,x+88,323,'#fff',6)}
 r(g,531,312,840,122,19,'#ab7e72');r(g,550,298,800,95,10,'#f5e4d7');
 for(let x of [626,852,1078]){r(g,x,237,190,62,8,'#44586b');label(g,'MENU',x+95,269,25,'#f5e4b9')}
 const tables=[[970,666,130],[474,446,99],[1538,947,101]];
 for(let [x,y,rad] of tables){
  ellipse(g,x+5,y+16,rad+18,60,'#7e64613a');
  for(let j=0;j<4;j++){const a=j*1.57+.78;r(g,x+Math.cos(a)*(rad+30)-30,y+Math.sin(a)*96-26,60,52,9,'#a0b4b6')}
  ellipse(g,x,y,rad,62,'#dba883');ellipse(g,x,y-7,rad*.92,52,'#efcbad')
 }
 for(let x of [926,994,1060]){r(g,x-20,635,42,19,4,'#ede2ca');ellipse(g,x,638,17,8,'#a66d43');ellipse(g,x,635,22,4,'#ecc179');r(g,x+21,630,14,27,3,'#bc6162');lin(g,x+27,625,x+27,615,'#fff5e9',2)}
 r(g,918,1054,184,139,13,'#8badb1');r(g,932,1064,156,117,9,'#d2e9e8');lin(g,1010,1055,1010,1192,'#fff',5);
}
window.MarlenkaArt3={outside,inside,human,label,ellipse,r,styles};
})();