/* ===================== Roman Urdu text for Study mode ===================== */
let SLANG='en';
const UI={
 en:{tabs:['Learn','Try with your code','Source code'],simple:'In simple words',what:'What it is',demo:'Worked example',how:'How it works',terms:'Key terms',tryx:'Try these examples',tip:'Exam tip',topics:'C topics this compiler supports',inp:'Input',outp:'Output of this phase',run:'Run in compiler',ok:'Output',err:'Error',prog:'Your program',pipe:'Pipeline',stdin:'Program input (for scanf)',phases:'Compiler phases',lang:'Roman Urdu',watch:'Watch',
  lead:'Edit the program, every phase updates instantly. Click a phase below to see what it receives and what it produces.',
  code:'This is the real code that runs this phase. It is the same code that compiles your program right now.',
  gram:'The source code is not processed by code of its own. The language it must follow is described by this grammar, and the parser implements it.'},
 ru:{tabs:['Seekhein','Apne code ke saath','Source code'],simple:'Aasan lafzon mein',what:'Ye kya hai',demo:'Misaal',how:'Ye kaise kaam karta hai',terms:'Ahem lafz',tryx:'Khud try karein',tip:'Exam tip',topics:'C ke topics jo ye compiler samajhta hai',inp:'Input',outp:'Is phase ka output',run:'Compiler mein chalayein',ok:'Output',err:'Error',prog:'Aapka program',pipe:'Pipeline',stdin:'Program ka input (scanf ke liye)',phases:'Compiler ke phases',lang:'English',watch:'Dekhein',
  lead:'Program edit karein, har phase foran update hoga. Neeche kisi phase par click karke dekhein ke wo kya leta hai aur kya deta hai.',
  code:'Ye wahi asli code hai jo is phase ko chalata hai. Isi code se abhi aapka program compile ho raha hai.',
  gram:'Source code ko koi alag code process nahi karta. Jis language ko ye follow karta hai wo is grammar mein likhi hai, aur parser isay implement karta hai.'}};
const RU={
 simple:['Ye sirf aapke program ka text hai. Abhi na kuch check hua hai na chala hai.','Lexer aapke code ko chhote tukron (tokens) mein kaat deta hai, jaise jumle ko lafzon mein kaatna.','Parser grammar check karta hai aur parse tree banata hai. AST usi tree ka chhota version hai.','Ab compiler matlab check karta hai: har naam declare hua hai? types aapas mein milte hain?','Tree ko chhote chhote ek-ek step wale instructions mein badla jata hai, jaise recipe ke chhote steps.','Compiler in steps ko saaf karta hai: aasan hisaab pehle hi kar leta hai aur faltu kaam hata deta hai.','Har chhota step machine ke instruction mein badal jata hai (registers, LOAD, STORE, JUMP).','Aakhir mein program chalta hai, output print karta hai aur exit code deta hai.'],
 intro:['Source code wo program hai jo developer high-level language mein likhta hai. Ye sirf text hota hai, compiler ne abhi kuch samjha nahi hota.',
  'Lexical analysis (scanning) characters ko ek ek karke parhta hai aur unhe tokens mein group karta hai. Token sabse chhota matlab wala hissa hai: keyword, naam, number, string ya symbol.',
  'Syntax analysis (parsing) check karta hai ke tokens language ki grammar ke mutabiq hain. Ye parse tree banata hai jisme har grammar rule (jaise E → E + T) ek node hota hai. Compiler phir uski chhoti copy AST rakhta hai jisme sirf zaroori cheezein hoti hain.',
  'Semantic analysis program ke matlab ko check karta hai. Grammar theek ho sakti hai phir bhi program galat ho sakta hai, jaise aisa variable use karna jo declare hi nahi hua.',
  'Compiler AST ko intermediate representation mein badalta hai. Yahan ye three-address code hai: har instruction mein sirf ek operator hota hai, isliye bade expressions temporaries (t1, t2, ...) ke saath chhote steps mein tootte hain.',
  'Optimizer code ko behtar banata hai bina program ka matlab badle, taake wo tez chale ya kam memory le. Ye AST par kaam karta hai aur phir IR dobara banti hai.',
  'Code generation optimized intermediate code ko target instructions mein badalta hai. Ye compiler ek asaan assembly jaisi language banata hai jisme registers R0, R1 use hote hain.',
  'Aakhri step wo program banata hai jo asal mein chalta hai. Yahan optimized IR ek chhoti virtual machine chalati hai, taake aap asli output aur exit code dekh saken.'],
 steps:[['Developer high-level language (jaise C) mein statements likhta hai.','Text compiler ko diya jata hai.','Abhi kuch nahi chalta. Baqi phases isi text par ya isse bani cheezon par kaam karte hain.'],
  ['Characters ko left se right parha jata hai.','Spaces aur comments skip ho jate hain, compiler ko unki zaroorat nahi.','Sabse lamba match dhoondte hain jo kisi pattern (regular expression) se milta ho, jaise digits mil kar NUMBER ban jate hain.','Token <TYPE, lexeme> ban jata hai aur agla lexeme parha jata hai.','Agar kuch bhi match na ho to lexical error aata hai.'],
  ['Lexer se tokens ka stream liya jata hai.','Sabse upar wale rule (Program) se shuru karke tokens ko grammar rules se milaya jata hai.','Jo rule match ho wo parse tree ka node ban jata hai. E, T aur F expressions ke rules hain, aur har token ek leaf hai.','Precedence rules se aati hai: * aur / T sambhalta hai jo tree mein + aur - (E) se neeche hota hai.','Parse tree ko chhota karke AST banate hain: rule nodes aur punctuation hata dete hain, operators node rehte hain aur naam ya numbers leaves.','Agar koi token kisi rule mein fit na ho to line number ke saath syntax error aata hai.'],
  ['Pehle saare functions ke naam aur signatures jama kiye jate hain.','AST par chalte hue scopes (global, function, block) ka stack rakha jata hai.','Har variable symbol table mein daala jata hai, aur ek hi scope mein dobara declare karna reject hota hai.','Har expression ka type nikala jata hai aur operators check hote hain (string - string ghalat hai).','Function calls (arguments ki ginti aur type), return type aur break/continue ki jagah check hoti hai.'],
  ['AST ko function by function dekha jata hai.','Pehle chhote expressions evaluate hote hain aur har result naye temporary mein jata hai.','if / while / for labels aur jumps (ifFalse ... goto L1) mein badal jate hain.','Calls param instructions aur phir call mein badalti hain.','Har function return par khatam hota hai.'],
  ['Constant folding: constant expressions compile time par hi hal ho jate hain (2 * 3 ban jata hai 6).','Constant propagation: variable ki jagah uski maloom constant value rakh di jati hai.','Algebraic simplification: x * 1 ban jata hai x, x + 0 ban jata hai x.','Dead code removal: if (0) wali branch aur return ya break ke baad ka code hata diya jata hai.','Loops mein ehtiyat: jo values loop ke andar badalti hain unhe propagate nahi kiya jata.'],
  ['IR instructions ek ek karke dekhe jate hain.','Operands registers mein load hote hain (LOAD / MOV).','Operation (ADD, SUB, CMP, ...) hota hai aur result STORE hota hai.','Labels aur jumps (JMP, JE) tarjuma hote hain.','String constants .data section mein jate hain aur functions ke liye CALL likha jata hai.'],
  ['IR ke saare functions aur labels dhoondhe jate hain.','main() se shuru hota hai (pehle global variables set hote hain).','Instruction ek ek karke chalta hai. Har call ke liye naye local variables bante hain.','printf output mein text jorta hai.','return par ruk jata hai. Step limit infinite loops ko rok deti hai.']],
 terms:[[['Statement','Ek mukammal hukm, aam taur par ; par khatam'],['Expression','Jis ki value ho, jaise 5 + 10'],['Grammar','Wo rules jo batate hain konsa program durust hai']],
  [['Lexeme','Asal text, jaise count'],['Token','Category aur lexeme, jaise <ID, count>'],['Pattern','Regular expression jo token ki qism batati hai'],['Longest match','== ek token hai, do = nahi']],
  [['Parse tree','Har istemal hua grammar rule (E, T, F ...) aur har token dikhata hai'],['AST','Chhota tree: operator node hota hai, operands bachhe'],['Nonterminal','Grammar ka symbol jaise E, T ya F jo dusre symbols se badla jata hai'],['Terminal','Token jo leaf ban kar rehta hai, jaise x, 5 ya +'],['Recursive descent','Har grammar rule ke liye ek function, jo ek doosre ko bulate hain'],['Precedence','Kaunsa operator zyada tight bandhta hai, jaise * pehle + se']],
  [['Symbol table','Naamon ki table: type, kind aur scope ke saath'],['Scope','Wo jagah jahan naam nazar aata hai'],['Type checking','Ye dekhna ke operators ko mutabiq types mile'],['Narrowing','float ko int mein rakhne se fraction chali jati hai (warning)']],
  [['Three-address code','x = y op z jaisi instructions'],['Temporary','Compiler ka banaya variable, jaise t1'],['Label','Jump ka target, jaise L1:'],['Machine independent','Kisi khaas CPU se bandha nahi']],
  [['Constant folding','Constant expressions ko pehle hi hal kar lena'],['Propagation','Variable ki jagah uski constant value'],['Dead code','Wo code jo kabhi nahi chalta'],['Safe optimization','Program ka nateeja wahi rehna chahiye']],
  [['Register','CPU ke andar tez storage, jaise R0'],['Instruction selection','Har IR step ke liye machine instruction chunna'],['Data section','Constants (jaise strings) ki memory'],['Calling convention','Arguments aur return value kaise bheje jate hain']],
  [['Executable','Aakhri chalne wala program'],['Virtual machine','Software jo instructions chalata hai'],['Exit code','main() ka return kiya hua number'],['Runtime error','Chalte waqt ki galti, jaise zero se taqseem']]],
 tip:['Exam tip: compiler ka front end = lexical + syntax + semantic analysis. Back end = optimization + code generation.','Exam tip: lexer regular expressions / finite automata se bana hota hai. Ye sirf lexical errors pakadta hai (jaise ghalat character), grammar ki ghaltiyan nahi.','Exam tip: grammar E → E + T | T, T → T * F | F, F → id ho to A + B ke parse tree mein sabse upar E hota hai aur left par E → T → F → A ki chain. AST sirf + hai jiske do bachhe A aur B hain.','Exam tip: scope rules, type checking aur symbol table is phase ke asal kaam hain. Semantic errors parsing ke baad milte hain.','Exam tip: forms yaad rakhein: x = y op z, x = y, goto L, ifFalse x goto L, param, call, return. Quadruples, triples aur indirect triples TAC store karne ke tareeqe hain.','Exam tip: optimizations machine independent (folding, dead code, loop optimization) ya machine dependent (register use, instruction choice) hoti hain.','Exam tip: code generator ke teen kaam: instruction selection, register allocation aur instruction ordering.','Exam tip: compiler ek baar translate karta hai phir machine code chalta hai. Interpreter program seedha chalata hai. Virtual machine in dono ke beech hai.'],
 exl:[['Ek bada program'],['Anjaan symbol (error)','Khatam na hone wali string (error)'],['Semicolon missing (error)','Adhoora expression (error)','Durust expression (trees dekhein)'],['Declare nahi hua variable (error)','Type mismatch (error)','Arguments ki ginti ghalat (error)'],['Temporaries','Loop labels mein badal jata hai'],['Folding aur propagation','Dead code'],['Function call'],['Loop ke saath output','Zero se taqseem (runtime error)','Infinite loop (runtime error)']],
 fns:[[],['Har token class ke liye ek group wali ek sticky regular expression. Loop agla lexeme match karta hai, line number nikalta hai aur token push karta hai. Jo character kisi se na mile wo lexical error deta hai.','Token ka display naam deta hai, jaise INTEGER ya FLOAT.','Token ka dikhane wala text deta hai (strings quotes ke saath).'],
  ['Recursive-descent parser. Chhote functions ki ek chain (or, and, equality, relational, additive, term, unary, postfix) har precedence level sambhalti hai. stmt() declarations, if, while, do-while, for, switch, return aur assignments sambhalta hai.','Parse tree banata hai. ptE, ptT aur ptF grammar rules E, T, F hain, ptC comparisons sambhalta hai, aur har token ek leaf hai.','Chhota AST banata hai: operators node ban jate hain aur naam ya numbers leaves.','Tree ko text mein ├── aur └── lines ke saath chhapta hai.'],
  ['Symbol table banata hai aur har expression node par uska type (e.ty) likhta hai. ty() type nikalta hai, asgOK() assignment check karta hai aur st() statements par chalta hai.'],
  ['AST par chalta hai. ex() us temporary ka naam deta hai jisme expression ka result hai. g() statements ke liye code banata hai, aur loops/ifs L() se labels banate hain.','Ek instruction ko text mein likhta hai.','Poori instruction list ko text mein likhta hai.'],
  ['Ek expression ko env ke maloom constants se fold karta hai aur har tabdeeli gintaa hai.','Ek statement optimize karta hai. if / while / for un variables ko bhool jate hain jo unke andar badalte hain.','Har function aur global variable par optimizer chalata hai.'],
  ['Har IR instruction ko assembly ki ek ya zyada lines mein badalta hai. ld() operand register mein load karta hai, sv() result store karta hai, aur OP aur CM tables operators ko mnemonics se milati hain.'],
  ['Ek chhoti virtual machine. Program counter ke saath instruction list chalati hai, har call ke liye local variables, printf formatter aur step limit rakhti hai.','Arithmetic aur comparisons karta hai. Optimizer aur virtual machine isay share karte hain.']],
 topics:['Data types (int, float, double, char)','Variables aur constants','Input / Output (printf, scanf)','Arithmetic operators','Relational operators','Logical operators','Assignment operators','If statement','If-else statement','Nested if-else','Switch statement','For loop','While loop','Do-while loop','Break aur continue','Arrays (1D aur 2D)','Strings (char arrays)','Functions','Recursion','Pointers (basic)','Structures (basic)','Comments','Type casting']};

/* ===================== Watch it compile (animation) ===================== */
const WS={i:0,k:0,plan:null,tm:null,sp:1};
const tkc=t=>({KEYWORD:'kw',ID:'id',NUMBER:'nm',STRING:'st',CHAR:'st',PREPROC:'pp'}[t.k]||'op');
function lexPlan(){const toks=lex(SRC),Ls=SRC.split('\n'),ls=[];let o=0;Ls.forEach(l=>{ls.push(o);o+=l.length+1});
  const P=toks.map(t=>({t,s:ls[t.l-1]+t.c-1}));
  return{n:P.length,delay:230,
    init:b=>{b.innerHTML='<div class="lexsrc" id="lsrc"></div><div class="chips" id="lchips"></div>'},
    render:k=>{let h='',p=0;
      P.forEach((x,j)=>{if(x.s<p)return;const e=x.s+x.t.len;
        h+=`<span class="${j<k?'seen':'rest'}">${esc(SRC.slice(p,x.s))}</span><span class="${j<k?'tk '+tkc(x.t):'rest'}${j===k-1?' cur':''}">${esc(SRC.slice(x.s,e))}</span>`;p=e});
      h+=`<span class="rest">${esc(SRC.slice(p))}</span>`;$('lsrc').innerHTML=h;
      const c=$('lchips');c.innerHTML=P.slice(0,k).map(x=>`<span class="chip ${tkc(x.t)}"><b>${esc(tokName(x.t))}</b>${esc(tokVal(x.t))}</span>`).join('');c.scrollTop=c.scrollHeight},
    cap:k=>k?`The lexer reads ${tokVal(P[k-1].t)} and makes the token <${tokName(P[k-1].t)}>`:'The lexer starts at the first character of your program.'}}
function treePlan(){const it=curItem(),tr=treeMode==='ast'?it.ast:it.pt,labels=[],walk=n=>{labels.push(n.l);n.c.forEach(walk)};walk(tr);
  return{n:labels.length,delay:150,init:b=>{b.innerHTML=`<div class="cap2">${treeMode==='ast'?'AST':'Parse tree'} of: ${esc(it.label)}. Change it with the dropdown in the Syntax panel.</div><div class="treebox big" id="wtree">${treeSVG(tr,true)}</div>`},
    render:k=>{document.querySelectorAll('#wtree [data-o]').forEach(e=>{const o=+e.dataset.o;e.classList.toggle('on',o<k);e.classList.toggle('cur',o===k-1)});
      const cur=document.querySelector('#wtree .nd.cur');if(cur&&cur.scrollIntoView)cur.scrollIntoView({block:'nearest',inline:'nearest'})},
    cap:k=>k?`The parser creates the node "${labels[k-1]}"`:'The parser starts with an empty tree.'}}
function optPlan(){const ev=R.optlog||[],n=ev.length+1,KL={fold:'Calculated',prop:'Replaced',alg:'Simplified',dead:'Removed'};
  return{n,delay:900,init:b=>{b.innerHTML='<ol class="evs" id="wev"></ol><div class="io" id="wcmp" hidden><div><div class="lb"><i style="background:#f87171"></i>Before</div><pre id="wb4"></pre></div><div><div class="lb"><i style="background:#34d399"></i>After</div><pre id="waf"></pre></div></div>'},
    render:k=>{$('wev').innerHTML=ev.slice(0,Math.min(k,ev.length)).map((e,j)=>`<li class="${e.k}${j===k-1?' cur':''}"><i>${KL[e.k]}</i>${esc(e.t)}</li>`).join('')||(k>=n?'<li class="none">Nothing to optimize here: the code is already simple.</li>':'');
      const c=$('wcmp');c.hidden=k<n;if(k>=n){$('wb4').textContent=R.outs[4];$('waf').textContent=R.outs[5]}},
    cap:k=>k===0?'The optimizer looks for work it can do early...':k<n?ev[k-1].t:'Done. Compare the code before and after.'}}
function linesPlan(i){const lines=(i===0?SRC:R.outs[i]).split('\n');
  return{n:lines.length,delay:150,init:b=>{b.innerHTML=`<div class="io"><div><div class="lb"><i style="background:#fbbf24"></i>${i===0?'The developer writes':'Input'}</div><pre id="wl-in"></pre></div><div><div class="lb"><i style="background:#34d399"></i>${i===0?'Line by line':'Output'}</div><pre id="wl-out"></pre></div></div>`;$('wl-in').textContent=i===0?'// the program is just text':R.ins[i]||''},
    render:k=>{const o=$('wl-out');o.textContent=lines.slice(0,k).join('\n');o.scrollTop=o.scrollHeight},
    cap:k=>k?`Line ${k} of ${lines.length}`:'The result is produced line by line.'}}
const errPlan=i=>({n:1,delay:500,init:b=>{b.innerHTML='<pre class="er" id="werr"></pre>'},render:()=>{$('werr').textContent=R.outs[i]||'—'},cap:()=>'This phase did not finish.'});
function makePlan(){const i=WS.i;if(R.st[i]===2||(i>0&&R.st[i]===0))return errPlan(i);
  try{if(i===1)return lexPlan();if(i===2)return treePlan();if(i===5)return optPlan();return linesPlan(i)}catch(e){return errPlan(i)}}
function stopW(){clearInterval(WS.tm);WS.tm=null;const b=$('wplay');if(b)b.textContent='▶'}
function wgo(k){const pl=WS.plan;k=Math.max(0,Math.min(pl.n,k));WS.k=k;pl.render(k);$('wcap').textContent=pl.cap(k);const r=$('wprog');r.max=pl.n;r.value=k;$('wcount').textContent=`${k} / ${pl.n}`;if(k>=pl.n)stopW()}
function playW(){if(WS.k>=WS.plan.n)wgo(0);clearInterval(WS.tm);WS.tm=setInterval(()=>wgo(WS.k+1),WS.plan.delay/WS.sp);$('wplay').textContent='⏸'}
function buildWatch(){stopW();const p=PH[WS.i],W=$('watch');
  W.innerHTML=`<div class="wbox" style="--ph:${p.pc}"><div class="whead"><div><div class="plabel">Watch · Phase ${WS.i+1} of 8</div><h2>${p.n}</h2></div><div class="hbtns"><button data-wp="-1" aria-label="Previous phase"${WS.i===0?' disabled':''}>‹</button><button data-wp="1" aria-label="Next phase"${WS.i===7?' disabled':''}>›</button><button id="wclose" aria-label="Close">×</button></div></div>
  <div class="wcap" id="wcap" aria-live="polite"></div><div class="wbody" id="wbody"></div>
  <div class="wctl"><button data-w="restart" aria-label="Restart">⏮</button><button data-w="back" aria-label="Step back">◀</button><button data-w="play" id="wplay" aria-label="Play or pause">▶</button><button data-w="fwd" aria-label="Step forward">▶|</button><input type="range" id="wprog" min="0" max="1" value="0" aria-label="Progress"><span id="wcount"></span><select id="wspeed" aria-label="Speed"><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></div></div>`;
  WS.plan=makePlan();WS.plan.init($('wbody'));$('wspeed').value=String(WS.sp);wgo(0);setTimeout(playW,350)}
function openWatch(i){WS.i=i;$('watch').hidden=false;buildWatch()}
function closeWatch(){stopW();$('watch').hidden=true}
$('watch').addEventListener('click',e=>{if(e.target===$('watch'))return closeWatch();const b=e.target.closest('button');if(!b)return;
  if(b.id==='wclose')closeWatch();
  else if(b.dataset.wp){WS.i=Math.max(0,Math.min(7,WS.i+ +b.dataset.wp));buildWatch()}
  else if(b.dataset.w==='play'){WS.tm?stopW():playW()}
  else if(b.dataset.w==='restart'){stopW();wgo(0);playW()}
  else if(b.dataset.w==='back'){stopW();wgo(WS.k-1)}
  else if(b.dataset.w==='fwd'){stopW();wgo(WS.k+1)}});
$('watch').addEventListener('input',e=>{if(e.target.id==='wprog'){stopW();wgo(+e.target.value)}});
$('watch').addEventListener('change',e=>{if(e.target.id==='wspeed'){WS.sp=+e.target.value;if(WS.tm)playW()}});
document.addEventListener('keydown',e=>{if($('watch').hidden)return;if(e.key==='Escape')closeWatch();else if(e.key===' '&&e.target.tagName!=='SELECT'&&e.target.tagName!=='BUTTON'){e.preventDefault();WS.tm?stopW():playW()}else if(e.key==='ArrowRight'){stopW();wgo(WS.k+1)}else if(e.key==='ArrowLeft'){stopW();wgo(WS.k-1)}});

/* ===================== Share link and report ===================== */
const UK='cp_user';
const getU=()=>{try{return JSON.parse(localStorage.getItem(UK))||{}}catch(e){return{}}};
const setU=u=>{try{localStorage.setItem(UK,JSON.stringify(u))}catch(e){}};
const b64u=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const shareLink=()=>location.href.split('#')[0]+'#p'+b64u(JSON.stringify({s:SRC,i:STDIN}));
function buildReport(u){const it=curItem(),now=new Date().toLocaleString();
  const sec=PH.map((p,i)=>{let body;
    if(i===2&&R.st[2]===1&&it)body=`<p class="note">Drawn for: ${esc(it.label)}</p><h4>Parse tree</h4><div class="tr">${treeSVG(it.pt)}</div><h4>AST</h4><div class="tr">${treeSVG(it.ast)}</div><h4>AST as text</h4><pre>${esc(R.outs[2])}</pre>`;
    else body=(i>0?`<h4>Input</h4><pre>${esc(R.ins[i]||'')}</pre>`:'')+`<h4>Output</h4><pre class="${R.st[i]===2?'er':''}">${esc(R.outs[i])}</pre>`;
    return `<section><h3><span style="background:${p.c}">${i+1}</span>${esc(p.n)} <small>${esc(p.s)}</small></h3><p>${esc(p.d)}</p>${body}</section>`}).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Compiler Phases report</title><style>body{font:15px/1.6 system-ui,sans-serif;max-width:900px;margin:0 auto;padding:28px;color:#111}h1{margin:0 0 4px}h3{display:flex;align-items:center;gap:10px;margin:0 0 4px}h3 span{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;color:#fff;font-size:14px}h3 small{color:#666;font-weight:400}h4{margin:14px 0 4px;color:#444}pre{background:#f4f5f7;border:1px solid #ddd;border-radius:8px;padding:10px 12px;white-space:pre-wrap;word-break:break-word;font:13px/1.5 ui-monospace,Consolas,monospace}pre.er{color:#b42318;background:#fef3f2}.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:4px 24px;margin:14px 0 22px;padding:12px 16px;border:1px solid #ddd;border-radius:10px}section{margin-top:26px;page-break-inside:avoid}.tr{overflow:auto;border:1px solid #ddd;border-radius:8px;padding:6px;background:#fff}.tr svg{max-width:100%;height:auto}.note{color:#666;font-size:13px}footer{margin-top:30px;color:#888;font-size:12px}@media print{body{padding:0}}</style></head><body><h1>Compiler Phases report</h1><div class="meta"><div><b>Name:</b> ${esc(u.n||'-')}</div><div><b>CMS ID:</b> ${esc(u.c||'-')}</div><div><b>Section:</b> ${esc(u.s||'-')}</div><div><b>Date:</b> ${esc(now)}</div></div><section><h3>Source code</h3><pre>${esc(SRC)}</pre>${STDIN?`<h4>Program input</h4><pre>${esc(STDIN)}</pre>`:''}</section>${sec}<footer>Made with Compiler Phases by Isha &amp; Rabia</footer></body></html>`}
function copyTxt(t,el,msg){const done=()=>{el.textContent=msg},fb=()=>{el.textContent='Select the text and copy it with Ctrl+C.'};
  try{navigator.clipboard.writeText(t).then(done,fb)}catch(e){fb()}}
function openShare(){const u=getU(),S=$('share');
  S.innerHTML=`<div class="shbox"><div class="whead"><div><div class="plabel">Share · Report</div><h2>Share your work</h2></div><button id="shclose" aria-label="Close">×</button></div>
  <h3>Share your program</h3><p>Anyone who opens this link sees your program already loaded.</p><div class="shrow"><input id="shlink" readonly aria-label="Share link"><button id="shcopy">Copy link</button></div><p class="hint2" id="shnote"></p>
  <h3>Download a report</h3><p>One page with your code and the output of all 8 phases, with your name and CMS ID. Open it and press Ctrl+P to save it as a PDF.</p>
  <div class="shgrid"><label>Name<input id="rn" autocomplete="off"></label><label>CMS ID<input id="rc" autocomplete="off"></label><label>Section<input id="rs" autocomplete="off"></label></div>
  <div class="shrow"><button id="rdl" class="prim">Download report</button><button id="rcode">Copy my code</button></div><p class="hint2" id="rnote"></p></div>`;
  S.hidden=false;$('shlink').value=shareLink();$('rn').value=u.n||'';$('rc').value=u.c||'';$('rs').value=u.s||'';
  $('shnote').textContent=location.protocol==='file:'?'This link opens on this computer only. Host the folder (for example on Vercel) to share it with others.':'Tip: the link carries your code inside it.'}
async function saveReport(){const u={n:$('rn').value.trim(),c:$('rc').value.trim(),s:$('rs').value.trim()};setU(u);
  const html=buildReport(u),fn='compiler-report'+(u.c?'-'+u.c.replace(/[^\w-]/g,''):'')+'.html',note=$('rnote');
  try{const d=window.claude&&claude.use?await claude.use('downloads'):null;
    if(d){await d.save({filename:fn,data:html});note.textContent='Report ready. Open it and press Ctrl+P to make a PDF.';return}}
  catch(e){if(e&&e.code==='declined'){note.textContent='Download cancelled.';return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download=fn;document.body.appendChild(a);a.click();a.remove();
  note.textContent='Report downloaded. Open it and press Ctrl+P to make a PDF.'}
$('share').addEventListener('click',e=>{if(e.target===$('share'))return $('share').hidden=true;const b=e.target.closest('button');if(!b)return;
  if(b.id==='shclose')$('share').hidden=true;
  else if(b.id==='shcopy')copyTxt($('shlink').value,$('shnote'),'Link copied.');
  else if(b.id==='rcode')copyTxt(SRC,$('rnote'),'Your code is copied.');
  else if(b.id==='rdl')saveReport()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('share').hidden)$('share').hidden=true});
$('shb').onclick=openShare;
