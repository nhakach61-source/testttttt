(function(){
/* MUSIC: plays automatically on load. Browsers block sound until the visitor's first tap/click/key, so it also starts on that first touch. Change SRC to use another file. */
const SRC='audio/music.mp3',VOL=0.8;
const a=new Audio(SRC);a.loop=true;a.preload='auto';a.volume=0;
let started=false,fadeT=0,wasOn=false;
function ramp(to,ms,done){cancelAnimationFrame(fadeT);const from=a.volume,t0=performance.now();(function f(n){const p=Math.min(1,(n-t0)/ms),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;a.volume=from+(to-from)*e;if(p<1)fadeT=requestAnimationFrame(f);else if(done)done()})(t0)}
function fade(){ramp(VOL,2200)}
function play(){return a.play().then(()=>{started=true;fade();off()}).catch(()=>{})}
function start(e){if(started)return;play()}
const ev=['pointerdown','pointerup','touchend','click','keydown','mousedown'];
function off(){ev.forEach(e=>removeEventListener(e,start,true))}
ev.forEach(e=>addEventListener(e,start,true));
document.addEventListener('visibilitychange',()=>{if(document.hidden){wasOn=!a.paused;a.pause()}else if(wasOn){a.play().catch(()=>{})}});
play();
})();
const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('on');else x.target.classList.remove('on')}),{threshold:[0,.15]});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* PHOTO SLIDER: starts only when the visitor scrolls to it (and stops when they leave). Smooth cross-fade, delay is 4200 (ms). Next photos are preloaded so a slide never fades in blank. */
(function(){const s=[...document.querySelectorAll('.sl')];if(!s.length)return;let i=-1;
const ui=document.createElement('div');ui.className='sl-ui';ui.innerHTML='<span class="sl-count"></span><span class="sl-bar"><i></i></span>';document.querySelector('.sl-track').appendChild(ui);
const cnt=ui.firstChild,bar=ui.querySelector('i');
function pre(n){const im=s[(n+s.length)%s.length].querySelector('img');if(im){im.loading='eager';if(im.decode)im.decode().catch(()=>{})}}
function go(n){const old=s[i];i=(n+s.length)%s.length;
s.forEach(e=>{if(e!==old&&e!==s[i])e.className='sl'});
if(old&&old!==s[i])old.className='sl p';
s[i].className='sl c';
cnt.textContent=String(i+1).padStart(2,'0')+' / '+String(s.length).padStart(2,'0');bar.style.animation='none';void bar.offsetWidth;bar.style.animation='';
pre(i+1);pre(i+2);
if(old&&old!==s[i])setTimeout(()=>{if(old!==s[i])old.className='sl'},1300)}
go(0);let tm=0;
function run(){clearInterval(tm);tm=setInterval(()=>go(i+1),4200)}
const fr=document.querySelector('.sl-track');
if('IntersectionObserver' in window&&fr)new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){go(i);run()}else clearInterval(tm)}),{threshold:.4}).observe(fr);else run();
})();

/* GOOGLE MAP BOX: edit address (shown on the map) and link (opened by the button; leave '' to use the address) */
(function(){const MAP={address:'',link:'https://maps.app.goo.gl/9dpF9BxSAyNDHojN9?g_st=ic'};
const q=encodeURIComponent(MAP.address);
document.getElementById('mapaddr').textContent=MAP.address;
document.getElementById('maplink').href=MAP.link||'https://www.google.com/maps/search/?api=1&query='+q;})();

/* ITINERARY (optimised for phones): measurements are cached, nothing is read from the layout while scrolling, and only transforms are written. Draws icons, fills the line while scrolling, highlights the current row. */
(function(){const tl=document.querySelector('.tl');if(!tl)return;const rows=[...tl.querySelectorAll('.row')];
rows.forEach((r,k)=>r.style.transitionDelay=(k*.12)+'s');
tl.querySelectorAll('svg *').forEach(e=>e.setAttribute('pathLength','1'));
const fill=document.createElement('i');fill.className='fill';tl.insertBefore(fill,tl.firstChild);
const spark=tl.querySelector('.spark');
let top=0,h=1,mids=[],vh=innerHeight,cur=null,lastP=-1,tick=false;
function ot(el){let y=0;while(el){y+=el.offsetTop;el=el.offsetParent}return y}
function measure(){vh=innerHeight;top=ot(tl);h=tl.offsetHeight||1;mids=rows.map(r=>ot(r)+r.offsetHeight/2);upd()}
function upd(){const y=scrollY,mid=vh*.6,t=top-y,p=Math.max(0,Math.min(1,(mid-t)/h));
if(Math.abs(p-lastP)>.0005){lastP=p;fill.style.transform='scaleY('+p+')';if(spark)spark.style.transform='translate3d(0,'+(p*(h+28))+'px,0)'}
let best=null,bd=1e9;for(let k=0;k<rows.length;k++){const d=Math.abs(mids[k]-y-mid);if(d<bd){bd=d;best=rows[k]}}
const n=(t<mid&&t+h>mid*.6)?best:null;
if(n!==cur){if(cur)cur.classList.remove('cur');if(n)n.classList.add('cur');cur=n}}
function req(){if(tick)return;tick=true;requestAnimationFrame(()=>{tick=false;upd()})}
addEventListener('scroll',req,{passive:true});
addEventListener('resize',measure);addEventListener('load',measure);
if('ResizeObserver' in window)new ResizeObserver(measure).observe(tl);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
measure();})();

(function(){
function parts(t,km){return t.split(/(\s+)/).filter(Boolean).map(x=>({t:x,w:!/^\s+$/.test(x)}))}
function split(el){const km=!!el.closest('[lang="km"]');let i=0;const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),L=[];
while(tw.nextNode())L.push(tw.currentNode);
L.forEach(nd=>{if(!nd.nodeValue.trim())return;const f=document.createDocumentFragment();
parts(nd.nodeValue,km).forEach(p=>{if(p.w){const s=document.createElement('span');s.className='w';s.style.setProperty('--i',i++);s.textContent=p.t;f.appendChild(s)}else f.appendChild(document.createTextNode(p.t))});
nd.replaceWith(f)});el.classList.add('wv')}
const io2=new IntersectionObserver(e=>e.forEach(x=>{if(x.intersectionRatio>=.2||(x.isIntersecting&&x.target.classList.contains('on')))x.target.classList.add('on');else if(!x.isIntersecting)x.target.classList.remove('on')}),{threshold:[0,.2]});
document.querySelectorAll('.story h2,.story .kh,.iti h2,.when b,.when span,.loc h2,.loc .kh,footer').forEach(el=>{split(el);io2.observe(el)});
[['.names',400],['.tag',3000]].forEach(([q,d])=>{const el=document.querySelector(q);if(el){split(el);let t=setTimeout(()=>el.classList.add('on'),d);new IntersectionObserver(e=>e.forEach(x=>{clearTimeout(t);if(x.isIntersecting)t=setTimeout(()=>el.classList.add('on'),d>1000?1200:300);else el.classList.remove('on')}),{threshold:0}).observe(el)}});
})();

/* STORY SLIDER: swipe / drag with finger or mouse, tap the dots, auto-plays every 2.5s ONLY while it is on screen, loops seamlessly */
(function(){const box=document.querySelector('.hs');if(!box)return;
const tr=box.querySelector('.hs-track'),n=tr.children.length,d=[...box.querySelectorAll('.hs-dots i')];
tr.appendChild(tr.children[0].cloneNode(true));
let i=0,x0=0,dx=0,drag=false,t;
function snap0(){tr.classList.add('snap');i=0;tr.style.transform='translateX(0%)';void tr.offsetWidth;tr.classList.remove('snap')}
function set(k){i=Math.max(0,Math.min(n,k));tr.style.transform='translateX(-'+i*100+'%)';d.forEach((e,j)=>e.className=j==(i%n)?'c':'');
if(i===n)setTimeout(()=>{if(i===n&&!drag)snap0()},950)}
let vis=false;
function auto(){clearInterval(t);if(!vis)return;t=setInterval(()=>{if(i>=n)snap0();set(i+1)},2500)}
set(0);
if('IntersectionObserver' in window)new IntersectionObserver(es=>es.forEach(e=>{vis=e.isIntersecting;if(vis)auto();else clearInterval(t)}),{threshold:.5}).observe(box);else{vis=true;auto()}
box.addEventListener('pointerdown',e=>{if(i===n)snap0();drag=true;x0=e.clientX;dx=0;box.classList.add('drag');try{box.setPointerCapture(e.pointerId)}catch(_){}clearInterval(t)});
box.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-x0;let o=dx;if((i==0&&dx>0)||(i==n&&dx<0))o=dx*.3;tr.style.transform='translateX(calc(-'+i*100+'% + '+o+'px))'});
function end(){if(!drag)return;drag=false;box.classList.remove('drag');set(Math.abs(dx)>box.clientWidth*.15?i+(dx<0?1:-1):i);auto()}
['pointerup','pointercancel'].forEach(ev=>box.addEventListener(ev,end));
d.forEach((e,j)=>e.addEventListener('click',ev=>{ev.stopPropagation();set(j);auto()}));
})();


/* MAP CARD: gentle 3D tilt + road parallax on hover */
(function(){const c=document.getElementById('mapcard');if(!c||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
c.style.setProperty('--ry',x*10+'deg');c.style.setProperty('--rx',-y*10+'deg');c.style.setProperty('--mx',-x*14+'px');c.style.setProperty('--my',-y*10+'px')});
c.addEventListener('pointerleave',()=>['--rx','--ry','--mx','--my'].forEach(k=>c.style.removeProperty(k)))})();

/* HERO DATE: count-up numbers + soft 3D tilt */
(function(){const d=document.querySelector('.date');if(!d||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
d.querySelectorAll('b').forEach((b,k)=>{const t=parseInt(b.textContent,10);b.textContent='00';
setTimeout(()=>{const s=performance.now();(function f(n){const p=Math.min(1,(n-s)/1500),e=1-Math.pow(1-p,3);
b.textContent=String(Math.round(t*e)).padStart(2,'0');if(p<1)requestAnimationFrame(f)})(s)},900+k*250)});
const h=document.querySelector('.hero');
h.addEventListener('pointermove',e=>{const r=h.getBoundingClientRect();d.style.setProperty('--ay',((e.clientX-r.left)/r.width-.5)*10+'deg');d.style.setProperty('--ax',-((e.clientY-r.top)/r.height-.5)*8+'deg')});
h.addEventListener('pointerleave',()=>{d.style.removeProperty('--ax');d.style.removeProperty('--ay')})})();

/* HERO NAMES: split into letters (for the entrance + light wave) and add sparkles */
(function(){const n=document.querySelector('.names');if(!n)return;let c=0;
n.querySelectorAll('.w').forEach(w=>{const t=w.textContent;w.textContent='';[...t].forEach(ch=>{const s=document.createElement('span');s.className='ch';s.style.setProperty('--c',c++);s.textContent=ch;w.appendChild(s)})});
n.setAttribute('aria-label',n.textContent);
[[6,20,10,2.6],[22,-8,7,3.4],[40,6,9,4.1],[58,-6,6,3],[76,14,10,3.8],[93,0,8,4.6],[14,92,7,3.2],[84,88,9,4.2]].forEach(([l,t,s,d])=>{const i=document.createElement('i');i.className='sp';i.style.cssText='left:'+l+'%;top:'+t+'%;--s:'+s+'px;--d:'+d+'s';n.appendChild(i)})})();

/* LAG FIX: pause looping animations of sections that are not on screen */
(function(){const t=document.querySelectorAll('header.hero,.slider,.story,.iti,.loc,footer');if(!t.length||!('IntersectionObserver' in window))return;
const o=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('idle',!e.isIntersecting)),{rootMargin:'80px 0px'});
t.forEach(el=>o.observe(el))})();


/* KHQR POP-UP: red button opens the square QR photo; close with x, tapping outside, or Esc */
(function(){const b=document.getElementById('khqrBtn'),p=document.getElementById('qrPop'),x=document.getElementById('qrX');if(!b||!p)return;
function open(){p.hidden=false;void p.offsetWidth;p.classList.add('open');document.body.style.overflow='hidden';x.focus()}
function close(){p.classList.remove('open');document.body.style.overflow='';setTimeout(()=>{if(!p.classList.contains('open'))p.hidden=true},320);b.focus()}
b.addEventListener('click',open);x.addEventListener('click',close);
p.addEventListener('click',e=>{if(e.target===p)close()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!p.hidden)close()})})();


/* COUPLE NAMES: play the entrance when the block scrolls into view */
(function(){const c=document.querySelector('.cpl');if(!c)return;
if(!('IntersectionObserver' in window)){c.classList.add('on');return}
const o=new IntersectionObserver(e=>{if(e[0].intersectionRatio>=.4)c.classList.add('on');else if(!e[0].isIntersecting)c.classList.remove('on')},{threshold:[0,.4]});o.observe(c)})();


/* KHQR BUTTON: soft 3D tilt toward the finger / mouse */
(function(){const b=document.getElementById('khqrBtn');if(!b||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
b.style.setProperty('--ry',x*22+'deg');b.style.setProperty('--rx',-y*22+'deg');b.style.setProperty('--mx',x*8+'px');b.style.setProperty('--my',y*6+'px')});
['pointerleave','pointerup','pointercancel'].forEach(t=>b.addEventListener(t,()=>['--rx','--ry','--mx','--my'].forEach(k=>b.style.removeProperty(k))))})();

/* LOCATION PHOTO SLIDER: swipe with a finger, drag with the mouse, arrow buttons or keyboard arrows.
   Auto-plays with a fixed 3.5 s rhythm (one photo every 3500 ms) and a smooth eased glide between photos. */
(function(){const w=document.querySelector('.loc .photo');if(!w)return;const t=w.querySelector('.ls');if(!t)return;
[...t.querySelectorAll('.ls-s img')].forEach(m=>{m.classList.add('fg');if(m.dataset.fit!=='contain')return;const b=new Image();b.className='bg';b.alt='';b.setAttribute('aria-hidden','true');b.draggable=false;b.src=m.currentSrc||m.src;m.parentNode.insertBefore(b,m)});
const n=t.children.length,c=w.querySelector('.ls-count'),pv=w.querySelector('.ls-prev'),nx=w.querySelector('.ls-next');
const DELAY=3500,GLIDE=900;let cur=0,raf=0;
const idx=()=>Math.max(0,Math.min(n-1,Math.round(t.scrollLeft/t.clientWidth)));
const upd=()=>{cur=idx();if(c)c.textContent=(cur+1)+' / '+n};
const ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;            /* easeInOutCubic */
const cancel=()=>{if(raf){cancelAnimationFrame(raf);raf=0}t.classList.remove('anim')};
/* smooth eased glide to photo i (same feel everywhere: auto-play, arrows, end of a swipe) */
const go=(i,dur)=>{i=Math.max(0,Math.min(n-1,i));cancel();const from=t.scrollLeft,to=i*t.clientWidth,d=to-from;if(Math.abs(d)<1)return;
const ms=dur||GLIDE;t.classList.add('anim');const t0=performance.now();
const tick=now=>{const p=Math.min(1,(now-t0)/ms);t.scrollLeft=from+d*ease(p);if(p<1)raf=requestAnimationFrame(tick);else{raf=0;t.classList.remove('anim');t.scrollLeft=to;upd()}};
raf=requestAnimationFrame(tick)};
/* after the last photo: soft fade back to the first one (no fast rewind across all photos) */
let wrapping=false;
const wrap=()=>{if(wrapping)return;wrapping=true;cancel();t.style.transition='opacity .45s ease';t.style.opacity='0';
setTimeout(()=>{t.classList.add('anim');t.scrollLeft=0;upd();t.classList.remove('anim');t.style.opacity='1';setTimeout(()=>{t.style.transition='';wrapping=false},460)},470)};
const next=()=>{cur>=n-1?wrap():go(cur+1)};
t.addEventListener('scroll',()=>{if(!raf)requestAnimationFrame(upd)},{passive:true});
pv&&pv.addEventListener('click',()=>{go(cur-1);bump()});nx&&nx.addEventListener('click',()=>{next();bump()});
t.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1)}else if(e.key==='ArrowRight'){e.preventDefault();next()}});
/* mouse drag (touch already scrolls natively) */
let d=false,sx=0,sl=0;
t.addEventListener('pointerdown',e=>{cancel();if(e.pointerType!=='mouse'||e.button!==0)return;d=true;sx=e.clientX;sl=t.scrollLeft;t.classList.add('drag');try{t.setPointerCapture(e.pointerId)}catch(_){}});
t.addEventListener('pointermove',e=>{if(!d)return;t.scrollLeft=sl-(e.clientX-sx)});
const end=e=>{if(!d)return;d=false;t.classList.remove('drag');const dx=e.clientX-sx,base=Math.round(sl/t.clientWidth);go(dx<-40?base+1:dx>40?base-1:base,650)};
t.addEventListener('pointerup',end);t.addEventListener('pointercancel',end);
t.addEventListener('wheel',cancel,{passive:true});
window.addEventListener('resize',()=>{cancel();t.classList.add('anim');t.scrollLeft=cur*t.clientWidth;t.classList.remove('anim')});
/* AUTO-PLAY: exactly one photo every 3.5 s (timer is re-aimed at a fixed target time, so it never drifts).
   Pauses while the visitor touches / drags / hovers, then starts a fresh 3.5 s after they let go. */
let vis=false,hold=0,tm=0,nextAt=0;
const fire=()=>{tm=0;if(!vis)return;if(!hold&&!d&&!wrapping)next();nextAt+=DELAY;const now=performance.now();if(nextAt<now)nextAt=now+DELAY;tm=setTimeout(fire,nextAt-now)};
const start=()=>{stop();nextAt=performance.now()+DELAY;tm=setTimeout(fire,DELAY)};
const stop=()=>{if(tm){clearTimeout(tm);tm=0}};
function bump(){if(vis)start()}
['touchstart','pointerdown'].forEach(ev=>t.addEventListener(ev,()=>{hold++}));
['touchend','touchcancel','pointerup','pointercancel'].forEach(ev=>t.addEventListener(ev,()=>{hold=Math.max(0,hold-1);bump()}));
w.addEventListener('mouseenter',()=>{hold++});w.addEventListener('mouseleave',()=>{hold=Math.max(0,hold-1);bump()});
t.addEventListener('focusin',()=>{hold++});t.addEventListener('focusout',()=>{hold=Math.max(0,hold-1);bump()});
if('IntersectionObserver' in window&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis)start();else stop()},{threshold:.35}).observe(w)}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(vis)start()});
upd();})();
