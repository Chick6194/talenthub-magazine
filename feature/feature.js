(()=>{const $=s=>document.querySelector(s),f=$('#f'),steps=[...f.querySelectorAll('.step')];let cur=0,imgs=[];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function show(){steps.forEach((s,i)=>s.hidden=i!==cur);$('#bar').style.width=((cur+1)/steps.length*100)+'%';$('#stepinfo').textContent=`Step ${cur+1} of ${steps.length}: ${steps[cur].dataset.title}`;$('#back').hidden=cur===0;$('#next').hidden=cur===steps.length-1;$('#make').hidden=cur!==steps.length-1;$('#err').textContent=''}
function valid(){let bad=[];steps[cur].querySelectorAll('[required]').forEach(el=>{const ok=el.value.trim()!=='';el.setAttribute('aria-invalid',!ok);if(!ok)bad.push(el)});
 if(cur===0&&!imgs.length){$('#err').textContent='Add at least one photo to continue.';if(!bad.length){$('#photos').focus();return false}}
 if(bad.length){$('#err').textContent='Fill in the required fields: '+bad.map(e=>e.parentElement.firstChild.textContent.trim()).join(', ')+'.';bad[0].focus();return false}return true}
$('#next').onclick=()=>{if(valid()){cur++;show();steps[cur].querySelector('input,textarea').focus()}};$('#back').onclick=()=>{cur--;show()};
function renderPrev(){$('#previews').innerHTML=imgs.map((d,i)=>`<figure><img src="${d}" alt="Photo ${i+1}${i?'':' (cover)'}"><button type="button" data-i="${i}" aria-label="Remove photo ${i+1}">Remove</button></figure>`).join('')}
$('#previews').onclick=e=>{const i=e.target.dataset.i;if(i!==undefined){imgs.splice(+i,1);renderPrev()}};
$('#photos').onchange=e=>{const files=[...e.target.files].filter(x=>x.type.startsWith('image/'));let room=4-imgs.length;if(files.length>room)$('#err').textContent='You can add up to 4 photos. Extra photos were skipped.';
 Promise.all(files.slice(0,room).map(file=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(file)}))).then(d=>{imgs.push(...d);renderPrev();e.target.value=''})};
const pick=(arr,seed)=>arr[seed%arr.length];
const paras=t=>esc(t.trim()).split(/\n\s*\n|\n/).filter(Boolean).map(p=>`<p>${p}</p>`).join('');
const sentences=t=>(t.match(/[^.!?]+[.!?]*/g)||[]).map(s=>s.trim()).filter(s=>s.length>20&&s.length<200);
function build(d){const seed=[...d.name].reduce((a,c)=>a+c.charCodeAt(0),0),n=esc(d.name),roles=esc(d.roles),g=esc(d.genre),h=esc(d.hometown);
 const what=g||roles.toLowerCase();
 const heads=[`${n}, in their own words`,`The rise of ${n}`,`${n} on art, purpose and what comes next`,`Meet ${n}`];
 const deks=[`${n}${h?' of '+h:''} on how it began, the mission behind the work, and the dreams still ahead.`,`From first steps to proudest moments, ${n} tells the story behind the work.`,`A Spotlight profile${h?' with roots in '+h:''}, told by the artist.`];
 const all=['started','mission','proud','growth','message','future','advice'].map(k=>d[k]||'').join(' ');
 const ss=sentences(all);const short=ss.filter(s=>/^I\b/.test(s)&&s.length<110);const quote=(short[0]||ss.sort((a,b)=>a.length-b.length)[0]||d.mission).replace(/[.!]$/,'');
 const kick=pick(['Cultural soundscape','Creative force','In the studio','On the rise'],seed);
 const sec=(title,...ts)=>ts.some(t=>t&&t.trim())?`<h2>${title}</h2>${ts.map(t=>t?paras(t):'').join('')}`:'';
 const ph=i=>imgs[i]?`<figure class="inline"><img src="${imgs[i]}" alt="${n}, photo ${i+1}"></figure>`:'';
 const words=all.split(/\s+/).length,mins=Math.max(1,Math.round(words/220)),date=new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
 const links=d.links.split(/\s+/).filter(Boolean).map(u=>{const url=/^https?:\/\//i.test(u)?u:(/\./.test(u)?'https://'+u:null);return url?`<li><a href="${esc(url)}" rel="noopener">${esc(u)}</a></li>`:`<li>${esc(u)}</li>`}).join('');
 return `<header class="cover"><img src="${imgs[0]}" alt="${n}"><div><p class="kicker">${roles}</p><h1>${pick(heads,seed)}</h1><p class="dek">${pick(deks,seed)}</p><p class="byline">${n}, ${roles}. By Spotlight, TalentHub Online. ${date}. ${mins} min read.</p></div></header>
<div class="body"><div class="prose"><h2>${kick}</h2>${paras(d.started)}${d.growth?paras(d.growth):''}
<blockquote class="pq">“${esc(quote)}”<cite>${n}</cite></blockquote>
${sec(pick(['Mission behind my art','Why I create','The mission'],seed),d.mission)}${ph(1)}
${sec(pick(['What makes me unique','My sound, my story','Where I come from'],seed+1),d.unique)}
${sec(pick(['Staying grounded','Keeping balance','Turning points'],seed),d.grounded)}
${sec(pick(['Daily life','A day in my life','The routine'],seed+2),d.daily)}${ph(2)}
${sec(pick(['Milestones achieved','Proudest moments','High points'],seed),d.proud,d.message)}
${sec(pick(['Future aspirations','On the vision board',"What's next"],seed+1),d.future,d.advice)}${ph(3)}
${links?`<h2>Find ${n}</h2><ul>${links}</ul>`:''}</div>
<dl class="facts"><dt>Artist</dt><dd>${n}</dd><dt>Work</dt><dd>${roles}</dd>${g?`<dt>Genre</dt><dd>${g}</dd>`:''}${h?`<dt>Hometown</dt><dd>${h}</dd>`:''}</dl></div>`}
f.onsubmit=e=>{e.preventDefault();if(!valid())return;const d=Object.fromEntries(new FormData(f));$('#art').innerHTML=build(d);$('#builder').hidden=true;$('#result').hidden=false;scrollTo(0,0);$('#art').focus()};
$('#ed').onclick=()=>{$('#result').hidden=true;$('#builder').hidden=false};$('#pr').onclick=()=>print();
const say=m=>{$('#msg').textContent=m;setTimeout(()=>$('#msg').textContent='',3000)};
$('#cp').onclick=()=>navigator.clipboard.writeText($('#art').innerText).then(()=>say('Article text copied.'),()=>say('Copy failed. Select the text and copy it manually.'));
$('#dl').onclick=async()=>{let css='';for(const h of ['../style.css','feature.css']){try{css+=await (await fetch(h)).text()}catch(e){}}
 const name=new FormData(f).get('name').trim();const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name)} — TalentHub Magazine</title><link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,700&family=Oswald:wght@500;700&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap" rel="stylesheet"><style>${css}</style></head><body><article class="art">${$('#art').innerHTML}</article></body></html>`;
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download=(name.replace(/[^\w-]+/g,'-')||'feature')+'-talenthub-feature.html';a.click();say('Download started.')};
show()})();
