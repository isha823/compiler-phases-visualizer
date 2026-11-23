/* ===================== Phases ===================== */
const PH=[
 {n:'Source Code',s:'Input Program',c:'#0aa346',pc:'#22c55e',w:4.2,h:2.2,x:0,y:5.6,d:'The original high-level program written by the developer.',w2:'The Source Code phase is the initial input. Edit the code in the box above and every other phase updates for your program.',k:['Types: int, float, double, char, const, #define, type casting','if / else, switch, for, while, do-while, break, continue','Arrays (1D, 2D), char strings, functions, recursion, printf, scanf','Pointers (basic), structures (basic), typedef, malloc, sizeof']},
 {n:'Lexical Analysis',s:'Tokenization',c:'#0d4fc4',pc:'#3b82f6',w:4,h:2.4,x:-2.6,y:2,d:'Converts the sequence of characters into a sequence of tokens.',w2:'Lexical Analysis (scanning) is the first phase of compilation. It groups the raw stream of characters into meaningful sequences called lexemes and labels each as a token.',k:['Removes whitespace and comments','Classifies keywords, identifiers, numbers, operators','Reports invalid characters']},
 {n:'Syntax Analysis',s:'Parsing',c:'#a0125f',pc:'#ec4899',w:2.2,h:1.7,x:1.2,y:2,d:'Checks that the tokens follow the grammar and builds a parse tree.',w2:'The parser checks the order of tokens against the language grammar and builds an Abstract Syntax Tree (AST) showing the structure of the program.',k:['Checks grammar rules','Builds the AST','Reports syntax errors']},
 {n:'Semantic Analysis',s:'Type Checking',c:'#b34510',pc:'#f97316',w:1.5,h:1.2,x:3.3,y:2,d:'Checks that the program makes sense: declarations, types and scope.',w2:'Semantic analysis uses the AST and a symbol table to verify meaning: variables must be declared before use, and types must be compatible.',k:['Builds the symbol table','Type checking','Declaration and scope checks']},
 {n:'Intermediate Code',s:'IR Generation',c:'#7a3ad4',pc:'#a78bfa',w:1.7,h:1.4,x:3.3,y:-.8,d:'Generates a machine-independent intermediate representation.',w2:'The compiler turns the AST into three-address code: each instruction has at most one operator and uses temporaries (t1, t2) for sub-results.',k:['Three-address code','Introduces temporaries','Independent of the target machine']},
 {n:'Code Optimization',s:'Optimization',c:'#b0132a',pc:'#ef4444',w:2.4,h:1.7,x:1.2,y:-.8,d:'Improves the intermediate code so it runs faster or uses less memory.',w2:'The optimizer rewrites the IR without changing what the program does. Here it applies constant folding, constant propagation and algebraic simplification.',k:['Constant folding (5 + 10 → 15)','Constant propagation','Removes useless temporaries']},
 {n:'Code Generation',s:'Assembly',c:'#0b3a94',pc:'#3b82f6',w:4,h:2.4,x:-2.6,y:-1,d:'Translates the optimized IR into target machine instructions.',w2:'Code generation maps each IR operation to machine instructions and decides which registers hold which values.',k:['Instruction selection','Register allocation','Emits assembly']},
 {n:'Target Code',s:'Execution',c:'#0a8f3e',pc:'#22c55e',w:4.2,h:2.2,x:0,y:-4.6,d:'The final program runs and produces its result.',w2:'The assembly is assembled and linked into an executable. Here the optimized program is run so you can see the final value of each variable.',k:['Assembler and linker','Machine code','Program output']}
];
const SAMPLE='#include <stdio.h>\n#define SIZE 3\n\nstruct Student {\n  int id;\n  float marks;\n};\n\nvoid swap(int *a, int *b) {\n  int t = *a;\n  *a = *b;\n  *b = t;\n}\n\nint main() {\n  struct Student s[SIZE] = {{1, 70.5}, {2, 85}, {3, 92.25}};\n  float sum = 0;\n  for (int i = 0; i < SIZE; i++) {\n    sum += s[i].marks;\n  }\n  printf("Average = %.2f\\n", sum / SIZE);\n\n  int x = 5, y = 9;\n  swap(&x, &y);\n  printf("x = %d, y = %d\\n", x, y);\n  return 0;\n}';
const HS=(()=>{try{const m=/^#p([A-Za-z0-9_-]+)$/.exec(location.hash);if(!m)return null;let b=m[1].replace(/-/g,'+').replace(/_/g,'/');b+='='.repeat((4-b.length%4)%4);return JSON.parse(decodeURIComponent(escape(atob(b))))}catch(e){return null}})();
let STDIN=HS&&typeof HS.i==='string'?HS.i:'',SRC=HS&&typeof HS.s==='string'&&HS.s?HS.s:SAMPLE,R=compile(SRC),act=0,mute=true,openP=true;
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const $=id=>document.getElementById(id);
$('mute').innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"/></svg>';
$('mute').onclick=()=>{mute=!mute;mute?stopMusic():startMusic();$('mute').innerHTML=mute?'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"/></svg>':'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>'};
/* cheerful lo-fi style music (WebAudio): major chords, soft bass, bell arpeggio and a light beat */
const CH=[[60,64,67,72],[55,59,62,67],[57,60,64,69],[53,57,60,65]],PAT=[0,1,2,3,2,1,2,3],SCL=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51],MEL=[72,74,76,79,81,84],mf=m=>440*Math.pow(2,(m-69)/12);
let AC,mst,rev,dly,nz,mt,nt=0,stp=0;
function startMusic(){try{
  if(!AC){AC=new AudioContext();mst=AC.createGain();mst.gain.value=0;
    const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;const cp=AC.createDynamicsCompressor();mst.connect(lp);lp.connect(cp);cp.connect(AC.destination);
    const n=AC.sampleRate*1.6,ir=AC.createBuffer(2,n,AC.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3)}
    rev=AC.createConvolver();rev.buffer=ir;const rg=AC.createGain();rg.gain.value=.25;rev.connect(rg);rg.connect(mst);
    dly=AC.createDelay(1);dly.delayTime.value=.45;const fb=AC.createGain();fb.gain.value=.25;dly.connect(fb);fb.connect(dly);const dg=AC.createGain();dg.gain.value=.22;dly.connect(dg);dg.connect(mst);
    const m=AC.sampleRate*.3;nz=AC.createBuffer(1,m,AC.sampleRate);const nd=nz.getChannelData(0);for(let i=0;i<m;i++)nd[i]=Math.random()*2-1}
  AC.resume();mst.gain.cancelScheduledValues(AC.currentTime);mst.gain.linearRampToValueAtTime(.75,AC.currentTime+1.5);
  if(!mt){nt=AC.currentTime+.15;stp=0;mt=setInterval(sched,150)}
}catch(e){}}
function stopMusic(){try{mst.gain.cancelScheduledValues(AC.currentTime);mst.gain.linearRampToValueAtTime(0,AC.currentTime+.6)}catch(e){}clearInterval(mt);mt=null}
function pluck(f,t,v,d){d=d||1.1;const o=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain(),g2=AC.createGain();o.type='sine';o.frequency.value=f;o2.type='sine';o2.frequency.value=f*4;g2.gain.value=.14;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(mst);g.connect(dly);g.connect(rev);o.start(t);o2.start(t);o.stop(t+d+.1);o2.stop(t+d+.1)}
function padNote(f,t,d){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.03,t+1);g.gain.setValueAtTime(.03,t+d-.6);g.gain.linearRampToValueAtTime(0,t+d+.8);
  o.connect(g);g.connect(mst);g.connect(rev);o.start(t);o.stop(t+d+.9)}
function kick(t){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g);g.connect(mst);o.start(t);o.stop(t+.3)}
function hat(t,v){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=nz;f.type='highpass';f.frequency.value=7500;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);s.connect(f);f.connect(g);g.connect(mst);s.start(t);s.stop(t+.08)}
function sched(){while(nt<AC.currentTime+.6){const s=stp%16,ch=CH[(stp/16|0)%4];
  if(s===0)ch.slice(0,3).forEach(m=>padNote(mf(m-12),nt,4.8));
  if(s===0||s===8)pluck(mf(ch[0]-24),nt,.16,.55);
  if(s%4===0)kick(nt);
  if(s%2===1)hat(nt,.03);
  if(s%2===0&&Math.random()>.1)pluck(mf(ch[PAT[(s/2)%8]]),nt,.05,1);
  else if(s%2===1&&Math.random()<.35)pluck(mf(MEL[Math.random()*MEL.length|0]),nt,.04,.9);
  nt+=.3;stp++}}
function ping(f,v){if(!AC||!mst||mute)return;try{pluck(f,AC.currentTime,(v||.1)*.6,.9)}catch(e){}}
