/* ===================== UI ===================== */
function buildSteps(){
  $('steps').innerHTML=PH.map((p,i)=>`<button data-i="${i}" style="background:${p.c}" aria-label="${p.n}" title="${p.n}">${i+1}</button>${i<7?`<u style="background:${PH[i+1].c}"></u>`:''}`).join('');
  $('steps').querySelectorAll('button').forEach(b=>b.onclick=()=>sel(+b.dataset.i));
}
function markSteps(){const nm=$('stname');if(nm){nm.textContent=PH[act].n;nm.style.color=PH[act].pc}$('steps').querySelectorAll('button').forEach((b,i)=>b.classList.toggle('on',i===act))}
let treeMode='pt',treeSel=-1;
const nodeCount=n=>1+n.c.reduce((a,c)=>a+nodeCount(c),0);
function curItem(){const it=R.items||[];if(!it.length)return null;if(treeSel>=0&&treeSel<it.length)return it[treeSel];
  if(it.length>1&&nodeCount(it[0].pt)>150){const k=it.findIndex(x=>x.label.includes('›'));return it[k>0?k:1]}return it[0]}
function showOut(o,i){
  if(i===2&&R.st[2]===1&&R.items&&R.items.length){const it=curItem();
    if(treeMode==='text'){o.className='treebox mono';o.textContent=treeText(it.ast)}
    else{o.className='treebox'+(o.id==='sy-out'?' big':'');o.innerHTML=treeSVG(treeMode==='pt'?it.pt:it.ast)}}
  else{o.className=(i===2?'treebox mono ':'')+(R.st[i]===2?'er':'');o.textContent=R.outs[i]||'—'}}
function treeCtl(){return '<div class="seg"><button data-tv="pt">Parse tree</button><button data-tv="ast">AST</button><button data-tv="text">Text</button><button data-tv="zout" aria-label="Zoom out">−</button><button data-tv="zin" aria-label="Zoom in">+</button><button data-tv="big">Enlarge</button></div><select class="tvsel" aria-label="Choose what to draw"></select><div class="legend"></div><p class="cap2"></p>'}
function syncTreeCtl(){const it=R.items||[],ci=it.indexOf(curItem());
  document.querySelectorAll('.tvsel').forEach(s=>{s.innerHTML=it.map((x,k)=>`<option value="${k}"${k===ci?' selected':''}>${esc(x.label)}</option>`).join('');s.style.display=it.length?'':'none'});
  document.querySelectorAll('[data-tv]').forEach(b=>{if(['pt','ast','text'].includes(b.dataset.tv))b.classList.toggle('on',b.dataset.tv===treeMode)});
  const dot=(c,t)=>`<span><i style="background:${c}"></i>${t}</span>`;
  document.querySelectorAll('.legend').forEach(l=>{l.innerHTML=treeMode==='pt'?dot(TCL.blue,'top')+dot(TCL.pink,'grammar rule')+dot(TCL.green,'token')+dot(TCL.orange,'value'):treeMode==='ast'?dot(TCL.blue,'top')+dot(TCL.pink,'statement')+dot(TCL.purple,'operator')+dot(TCL.green,'name')+dot(TCL.orange,'value'):''});
  document.querySelectorAll('.cap2').forEach(c=>{c.textContent=treeMode==='pt'?'Parse tree: every grammar rule that was used (E, T, F ...) is a node, and every token is a leaf.':treeMode==='ast'?'AST: only what matters. Operators are the nodes, names and numbers are the leaves.':'The AST written as text.'})}
function refreshTrees(){const o=$('out');if(o&&act===2)showOut(o,2);const y=$('sy-out');if(y&&sIdx===2)showOut(y,2);syncTreeCtl()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-tv]');if(!b)return;const v=b.dataset.tv;if(v==='big'){openStudy(2,'yours');return}if(v==='zin'||v==='zout'){treeZoom=Math.max(.4,Math.min(2.4,treeZoom*(v==='zin'?1.25:.8)));refreshTrees();return}treeMode=v;refreshTrees()});
document.addEventListener('change',e=>{if(e.target.classList&&e.target.classList.contains('tvsel')){treeSel=+e.target.value;refreshTrees()}});
function fill(){
  const o=$('out');if(!o)return;
  showOut(o,act);if(act===2)syncTreeCtl();
  const n=$('in');if(n&&act>0)n.textContent=R.ins[act]||'—';
}
function showPanel(){
  const p=PH[act],P=$('panel');P.hidden=!openP;
  P.innerHTML=`<div class="grip">⋮⋮⋮</div><div class="plabel">Phase ${act+1} of 8</div><button class="x" id="px" aria-label="Close">×</button><span class="dot" style="background:${p.pc}"></span><h2>${p.n}</h2><div class="sub">${p.s}</div><p>${p.d}</p>
  <h4>Transformation</h4><div class="lb"><i style="background:#fbbf24"></i>Input</div>${act===0?'<textarea id="srcbox" spellcheck="false" autocapitalize="off" aria-label="Source code"></textarea>':'<pre id="in"></pre>'}
  <button class="go" id="nx" aria-label="Next phase" ${act===7?'disabled':''}>→</button>
  ${act===7?'<div class="lb"><i style="background:#60a5fa"></i>Program input (for scanf)</div><textarea id="stdin" spellcheck="false" aria-label="Program input"></textarea>':''}
  <div class="lb"><i style="background:#34d399"></i>Output</div>${act===2?treeCtl()+'<div id="out" class="treebox"></div>':'<pre id="out"></pre>'}
  <div class="acts"><button id="st1">Study this phase</button><button id="st2">View its code</button><button id="st3" class="wide">Watch it animate</button></div>
  <h4>Deep dive</h4><div class="card"><b>What is it?</b><p>${p.w2}</p><ul>${p.k.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  $('px').onclick=()=>{openP=false;foc=false;P.hidden=true;shift()};
  $('nx').onclick=()=>sel(Math.min(act+1,7));$('st1').onclick=()=>openStudy(act,'learn');$('st2').onclick=()=>openStudy(act,'code');$('st3').onclick=()=>openWatch(act);
  if(act===0){const t=$('srcbox');t.value=SRC;let tm;t.oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>{SRC=t.value;R=compile(SRC);fill();drawAll();buildTokens()},200)}}
  if(act===2)syncTreeCtl();
  if(act===7){const q=$('stdin');q.value=STDIN;q.oninput=()=>{STDIN=q.value;R=compile(SRC);drawAll();fill()}}
  fill();
}
function sel(i){act=i;openP=true;foc=true;showPanel();markSteps();ping(SCL[i],.12);runTo(i)}
