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
function build(d){const seed=[...d.name].reduce((a,c)=>a+c.charCodeAt(0),0),n=esc(d.name),g=esc(d.genre),h=esc(d.hometown),three=esc(d.three);
 const heads=[`${n}, in their own words`,`Meet ${n}`,`${n} is just getting started`,`The making of ${n}`];
 const deks=[`The ${g} artist${h?' from '+h:''} on how it began, what it sounds like, and where it goes from here.`,`${three}: that's how ${n} describes the sound. Here's the story behind it.`,`A ${g} profile${h?' with roots in '+h:''}, told by the artist.`];
 const qs=[...sentences(d.proud),...sentences(d.started),...sentences(d.next)];const quote=qs.sort((a,b)=>Math.abs(a.length-90)-Math.abs(b.length-90))[0]||d.three;
 const sec=(title,txt,lead)=>txt.trim()?`<h2>${title}</h2>${lead?`<p>${lead}</p>`:''}${paras(txt)}`:'';
 const links=d.links.split(/\s+/).filter(Boolean).map(u=>{const url=/^https?:\/\//i.test(u)?u:(/\./.test(u)?'https://'+u:null);return url?`<li><a href="${esc(url)}" rel="noopener">${esc(u)}</a></li>`:`<li>${esc(u)}</li>`}).join('');
 return `<header class="cover"><img src="${imgs[0]}" alt="${n}"><div><p class="kicker">${g} profile</p><h1>${pick(heads,seed)}</h1><p class="dek">${pick(deks,seed)}</p><p class="byline">TalentHub Magazine artist feature</p></div></header>
<div class="body"><div>${sec(pick(['Where it started','The beginning','First steps'],seed),d.started,`Asked how it all began, ${n} put it this way:`)}
${sec('Three words',d.three,`Asked to sum up the music in three words, ${n} chose these:`)}
${sec(pick(['The influences','Who shaped the sound','Heroes and inspirations'],seed+1),d.influences,`On the artists and ideas behind the music:`)}
${sec('The latest release',d.release,`On the story behind the newest work:`)}
${sec(pick(['The proudest moment','A moment to remember','High point'],seed+2),d.proud,'')}
${sec('Off the record',d.secret,`Something fans might not know about ${n}:`)}
${sec(pick(["What's next","Up next","The road ahead"],seed),d.next,'')}</div>
<dl class="facts"><dt>Artist</dt><dd>${n}</dd><dt>Genre</dt><dd>${g}</dd>${h?`<dt>Hometown</dt><dd>${h}</dd>`:''}<dt>The sound</dt><dd>${three}</dd></dl></div>
<blockquote>“${esc(quote)}”<br><small style="font-family:'Bricolage Grotesque',sans-serif;font-size:18px">${n}</small></blockquote>
${imgs.length>1?`<h2 style="padding:0 5%">Gallery</h2><div class="gallery">${imgs.slice(1).map((s,i)=>`<img src="${s}" alt="${n}, photo ${i+2}">`).join('')}</div>`:''}
${links?`<div class="links"><h2>Find ${n}</h2><ul>${links}</ul></div>`:''}`}
f.onsubmit=e=>{e.preventDefault();if(!valid())return;const d=Object.fromEntries(new FormData(f));$('#art').innerHTML=build(d);$('#builder').hidden=true;$('#result').hidden=false;scrollTo(0,0);$('#art').focus()};
$('#ed').onclick=()=>{$('#result').hidden=true;$('#builder').hidden=false};$('#pr').onclick=()=>print();
const say=m=>{$('#msg').textContent=m;setTimeout(()=>$('#msg').textContent='',3000)};
$('#cp').onclick=()=>navigator.clipboard.writeText($('#art').innerText).then(()=>say('Article text copied.'),()=>say('Copy failed. Select the text and copy it manually.'));
$('#dl').onclick=async()=>{let css='';for(const h of ['../style.css','feature.css']){try{css+=await (await fetch(h)).text()}catch(e){}}
 const name=new FormData(f).get('name').trim();const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name)} — TalentHub Magazine</title><link href="https://fonts.googleapis.com/css2?family=Anton&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,800&display=swap" rel="stylesheet"><style>${css}</style></head><body><article class="art">${$('#art').innerHTML}</article></body></html>`;
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download=(name.replace(/[^\w-]+/g,'-')||'feature')+'-talenthub-feature.html';a.click();say('Download started.')};
show()})();
