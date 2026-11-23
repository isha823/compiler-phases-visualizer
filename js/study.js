/* ===================== Study mode: detailed notes, live examples and the real source of every phase ===================== */
const SGRAM="program    -> ( function | declaration )*\nfunction   -> type ID '(' [ params ] ')' block\nblock      -> '{' statement* '}'\nstatement  -> declaration | assignment | if | while | do-while | for\n            | return | break | continue | call ';' | block\ndeclaration-> type ID [ '=' expr ] ( ',' ID [ '=' expr ] )* ';'\nassignment -> ID ( '=' | '+=' | '-=' | '*=' | '/=' | '%=' ) expr | ID ( '++' | '--' )\nexpr       -> C ( '?' expr ':' expr )?\nC          -> C ( '||' | '&&' | '==' | '!=' | '<' | '>' | '<=' | '>=' ) C | E\nE          -> E ( '+' | '-' ) T | T\nT          -> T ( '*' | '/' | '%' ) F | F\nF          -> NUMBER | STRING | ID | ID '(' args ')' | F '[' expr ']' | F '.' ID | F '->' ID\n            | '(' expr ')' | ( '-' | '!' | '*' | '&' ) F | '(' type ')' F | sizeof ( type )";
const TOPICS=[
{n:'Data types (int, float, double, char)',c:'int a = 7;\nfloat b = 2.5;\ndouble c = 3.14159;\nchar d = \'A\';\nprintf("%d %.1f %.3f %c\\n", a, b, c, d);'},
{n:'Variables & constants',c:'#define R 2\nconst float PI = 3.14;\nprintf("%.2f\\n", PI * R * R);'},
{n:'Input / Output (printf, scanf)',c:'int n;\nprintf("Enter a number: ");\nscanf("%d", &n);\nprintf("Double = %d\\n", n * 2);',i:'21'},
{n:'Arithmetic operators',c:'int a = 17, b = 5;\nprintf("%d %d %d %d %d\\n", a + b, a - b, a * b, a / b, a % b);'},
{n:'Relational operators',c:'int a = 4, b = 9;\nprintf("%d %d %d %d\\n", a < b, a > b, a == b, a != b);'},
{n:'Logical operators',c:'int a = 1, b = 0;\nprintf("%d %d %d\\n", a && b, a || b, !a);'},
{n:'Assignment operators',c:'int x = 10;\nx += 5;\nx *= 2;\nx -= 4;\nx /= 2;\nx %= 5;\nx++;\nprintf("%d\\n", x);'},
{n:'If statement',c:'int age = 20;\nif (age >= 18) {\n  printf("Adult\\n");\n}'},
{n:'If-else statement',c:'int n = 7;\nif (n % 2 == 0)\n  printf("Even\\n");\nelse\n  printf("Odd\\n");'},
{n:'Nested if-else',c:'int m = 72;\nif (m >= 50) {\n  if (m >= 80) printf("A\\n");\n  else printf("B\\n");\n} else {\n  printf("Fail\\n");\n}'},
{n:'Switch statement',c:'int d = 3;\nswitch (d) {\n  case 1: printf("Mon\\n"); break;\n  case 3: printf("Wed\\n"); break;\n  default: printf("Other\\n");\n}'},
{n:'For loop',c:'for (int i = 1; i <= 5; i++) {\n  printf("%d ", i);\n}'},
{n:'While loop',c:'int i = 1;\nwhile (i <= 5) {\n  printf("%d ", i);\n  i++;\n}'},
{n:'Do-while loop',c:'int i = 1;\ndo {\n  printf("%d ", i);\n  i++;\n} while (i <= 5);'},
{n:'Break & continue',c:'for (int i = 1; i <= 10; i++) {\n  if (i == 3) continue;\n  if (i == 7) break;\n  printf("%d ", i);\n}'},
{n:'Arrays (1D & 2D)',c:'int a[5] = {4, 8, 15, 16, 23};\nint m[2][2] = {{1, 2}, {3, 4}};\nint s = 0;\nfor (int i = 0; i < 5; i++) s += a[i];\nprintf("%d %d\\n", s, m[1][0]);'},
{n:'Strings (char arrays)',c:'char name[20] = "isha";\nchar t[30];\nstrcpy(t, name);\nstrcat(t, " & rabia");\nprintf("%s has %d letters\\n", t, strlen(t));'},
{n:'Functions',c:'int add(int a, int b) {\n  return a + b;\n}\nint main() {\n  printf("%d\\n", add(3, 4));\n  return 0;\n}'},
{n:'Recursion',c:'int fact(int n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}\nint main() {\n  printf("%d\\n", fact(5));\n}'},
{n:'Pointers (basic)',c:'void swap(int *a, int *b) {\n  int t = *a;\n  *a = *b;\n  *b = t;\n}\nint main() {\n  int x = 5, y = 9;\n  int *p = &x;\n  *p = *p + 1;\n  swap(&x, &y);\n  printf("%d %d\\n", x, y);\n}'},
{n:'Structures (basic)',c:'struct Student {\n  int id;\n  char name[20];\n  float marks;\n};\nint main() {\n  struct Student s = {1, "Isha", 88.5};\n  struct Student *p = &s;\n  p->marks = 90;\n  printf("%d %s %.1f\\n", s.id, s.name, p->marks);\n  return 0;\n}'},
{n:'Comments',c:'// single line comment\n/* multi\n   line comment */\nint x = 5; // x is five\nprintf("%d\\n", x);'},
{n:'Type casting',c:'int a = 7, b = 2;\nprintf("%d %.2f\\n", a / b, (float)a / b);'}
];
const STUDY=[
{intro:'Source code is the program written by the developer in a high-level language. It is only text: the compiler has not understood anything yet.',
 steps:['The developer writes statements in a language such as C.','The text is given to the compiler.','Nothing runs yet. Every later phase works on this text or on something built from it.'],
 terms:[['Statement','One complete instruction, usually ending with ;'],['Expression','Anything that has a value, like 5 + 10'],['Grammar','The rules that say which programs are valid']],
 ex:[{l:'A bigger program',c:'int a = 10;\nint b = 3;\nprintf("%d %d\\n", a / b, a % b);'}],
 tip:'Exam tip: the front end of a compiler = lexical + syntax + semantic analysis. The back end = optimization + code generation.',fns:[]},
{intro:'Lexical analysis (scanning) reads the characters one by one and groups them into tokens. A token is the smallest meaningful unit: a keyword, name, number, string or symbol.',
 steps:['Read the characters from left to right.','Skip spaces and comments, the compiler does not need them.','Match the longest text that fits a pattern (a regular expression), for example digits become a NUMBER.','Create a token <TYPE, lexeme> and continue.','If nothing matches, report a lexical error.'],
 terms:[['Lexeme','The real text, such as count'],['Token','Category plus lexeme, such as <ID, count>'],['Pattern','A regular expression that describes a token class'],['Longest match','== is one token, not two = tokens']],
 ex:[{l:'Unknown symbol (error)',c:'int x = 5 @ 3;'},{l:'Unterminated string (error)',c:'printf("hello);'}],
 tip:'Exam tip: the lexer is built from regular expressions / finite automata. It only finds lexical errors such as illegal characters, not grammar mistakes.',
 fns:[['lex','One sticky regular expression with a group for every token class. The loop matches the next lexeme, finds its line number and pushes a token. A character that matches nothing throws a lexical error.'],['tokName','Gives the display name of a token, such as INTEGER or FLOAT.'],['tokVal','Gives the text shown for a token (strings are shown with quotes).']]},
{intro:'Syntax analysis (parsing) checks that the tokens follow the grammar of the language. While it does this it builds a parse tree: every grammar rule that is used, like E → E + T, becomes a node. The compiler then keeps a smaller copy of that tree, the AST, which contains only what matters.',
 steps:['Take the token stream from the lexer.','Start from the top rule (Program) and match the tokens with the grammar rules.','Every rule that matches becomes a node of the parse tree. E, T and F are the rules for expressions, and every token becomes a leaf.','Precedence comes from the rules: * and / are handled by T, which sits deeper in the tree than + and - (E).','Simplify the parse tree into the AST: drop the rule nodes and the punctuation, keep the operators as nodes and the names or numbers as leaves.','If a token fits no rule, report a syntax error with the line number.'],
 terms:[['Parse tree','Shows every grammar rule that was used (E, T, F ...) and every token'],['AST','A compact tree: the operator is the node, its operands are the children'],['Nonterminal','A grammar symbol such as E, T or F that is replaced by other symbols'],['Terminal','A token that stays in the tree as a leaf, like x, 5 or +'],['Recursive descent','One function per grammar rule, calling each other'],['Precedence','Which operator binds tighter, e.g. * before +']],
 ex:[{l:'Missing semicolon (error)',c:'int main() {\n  int x = 5\n  return x;\n}'},{l:'Incomplete expression (error)',c:'int x = 3 + ;'},{l:'A valid expression (see the trees)',c:'int a = 1, b = 2, c = 3;\nint r = a + b * c;\nprintf("%d\\n", r);'}],
 tip:'Exam tip: for the grammar E → E + T | T, T → T * F | F, F → id, the parse tree of A + B has E at the top and the chain E → T → F → A on the left. The AST is just + with the children A and B.',
 fns:[['parse','A recursive-descent parser. A chain of small functions (or, and, equality, relational, additive, term, unary, primary) handles one precedence level each. stmt() handles declarations, if, while, do-while, for, return and assignments. Functions and global variables are collected at the top level.'],['ptF','Builds the parse tree. ptE, ptT and ptF are the grammar rules E, T and F, ptC handles comparisons, and every token becomes a leaf.'],['mkAst','Builds the compact AST: operators become nodes and names or numbers become leaves.'],['treeText','Prints a tree as text with the ├── and └── branch lines.']]},
{intro:'Semantic analysis checks the meaning of the program. The grammar can be correct and the program still wrong, for example using a variable that was never declared.',
 steps:['Collect all function names and signatures first.','Walk the AST and keep a stack of scopes (global, function, block).','Put every variable in the symbol table and reject duplicates in the same scope.','Find the type of each expression and check the operators (string - string is illegal).','Check calls (argument count and types), return types and break/continue placement.'],
 terms:[['Symbol table','Table of names with their type, kind and scope'],['Scope','The region where a name is visible'],['Type checking','Making sure operators get compatible types'],['Narrowing','Storing a float in an int loses the fraction (warning)']],
 ex:[{l:'Undeclared variable (error)',c:'int main() {\n  y = 5;\n  return 0;\n}'},{l:'Type mismatch (error)',c:'int main() {\n  int a = "hi";\n  return 0;\n}'},{l:'Wrong argument count (error)',c:'int add(int a, int b) { return a + b; }\nint main() { add(1); }'}],
 tip:'Exam tip: scope rules, type checking and the symbol table are the main jobs of this phase. Semantic errors appear only after parsing succeeds.',
 fns:[['sem','Builds the symbol table and annotates every expression node with its type (e.ty). ty() finds the type of an expression, chk() checks an assignment and st() walks the statements.']]},
{intro:'The compiler translates the AST into an intermediate representation. Here it is three-address code: every instruction has at most one operator, so big expressions are broken into small steps that use temporaries (t1, t2, ...).',
 steps:['Walk the AST function by function.','Evaluate sub-expressions first and keep each result in a new temporary.','Turn if / while / for into labels and jumps (ifFalse ... goto L1).','Turn calls into param instructions followed by call.','End every function with return.'],
 terms:[['Three-address code','Instructions like x = y op z'],['Temporary','A variable made by the compiler, like t1'],['Label','A jump target such as L1:'],['Machine independent','Not tied to a particular CPU']],
 ex:[{l:'Temporaries',c:'int a = 2;\nint b = 3;\nint c = a * b + 4;\nprintf("%d\\n", c);'},{l:'A loop becomes labels',c:'int i = 0;\nwhile (i < 3) {\n  i++;\n}'}],
 tip:'Exam tip: learn the forms x = y op z, x = y, goto L, ifFalse x goto L, param, call, return. Quadruples, triples and indirect triples are ways to store TAC.',
 fns:[['genTAC','Walks the AST. ex() returns the name of the temporary that holds an expression result. g() emits code for statements, and loops and ifs create labels with L().'],['fi','Formats one instruction as text.'],['tacText','Formats the whole instruction list.']]},
{intro:'The optimizer improves the code without changing what the program does, so it runs faster or uses less memory. Here it works on the AST and then the IR is generated again.',
 steps:['Constant folding: compute constant expressions at compile time (2 * 3 becomes 6).','Constant propagation: replace a variable with its known constant value.','Algebraic simplification: x * 1 becomes x, x + 0 becomes x.','Dead code removal: delete if (0) branches and code after return or break.','Loops are handled with care: values that change inside a loop are not propagated.'],
 terms:[['Constant folding','Evaluating constant expressions early'],['Propagation','Replacing a variable with its constant value'],['Dead code','Code that can never run'],['Safe optimization','The result of the program must stay the same']],
 ex:[{l:'Folding and propagation',c:'int x = 2 * 3 + 4;\nint y = x * 1 + 0;\nprintf("%d %d\\n", x, y);'},{l:'Dead code',c:'int x = 1;\nif (0) {\n  x = 99;\n}\nwhile (0) { x = 5; }\nprintf("%d\\n", x);'}],
 tip:'Exam tip: optimizations are machine independent (folding, dead code, loop optimization) or machine dependent (register use, instruction choice).',
 fns:[['fold','Folds one expression using the constants known in env and counts every change.'],['optS','Optimizes one statement. if / while / for forget the variables that change inside them.'],['optimize','Runs the optimizer over every function and global variable.']]},
{intro:'Code generation turns the optimized intermediate code into target instructions. This compiler makes a simple assembly-like language that uses registers R0 and R1.',
 steps:['Go through the IR instructions one by one.','Load the operands into registers (LOAD / MOV).','Emit the operation (ADD, SUB, CMP, ...) and STORE the result.','Translate labels and jumps (JMP, JE).','Put string constants in a .data section and emit CALL for functions.'],
 terms:[['Register','Fast storage inside the CPU, like R0'],['Instruction selection','Choosing the machine instruction for each IR step'],['Data section','Memory area for constants such as strings'],['Calling convention','How arguments and return values are passed']],
 ex:[{l:'A function call',c:'int square(int n) {\n  return n * n;\n}\nint main() {\n  printf("%d\\n", square(7));\n}'}],
 tip:'Exam tip: the three jobs of a code generator are instruction selection, register allocation and instruction ordering.',
 fns:[['asm','Translates each IR instruction into one or more assembly lines. ld() loads an operand into a register, sv() stores the result, and the OP and CM tables map operators to mnemonics.']]},
{intro:'The last step produces the program that really runs. Here the optimized IR is executed by a small virtual machine, so you can see the real output and the exit code.',
 steps:['Find all functions and labels in the IR.','Start at main() (global variables are set first).','Execute instruction by instruction. A call creates a new set of local variables.','printf adds text to the output.','Stop at return. A step limit stops infinite loops.'],
 terms:[['Executable','The final runnable program'],['Virtual machine','Software that runs instructions'],['Exit code','The number returned by main()'],['Runtime error','A failure while running, such as division by zero']],
 ex:[{l:'A loop with output',c:'int main() {\n  for (int i = 1; i <= 5; i++) {\n    printf("%d ", i * i);\n  }\n  return 0;\n}'},{l:'Division by zero (runtime error)',c:'int main() {\n  int a = 5;\n  int b = 0;\n  printf("%d", a / b);\n}'},{l:'Infinite loop (runtime error)',c:'int main() {\n  while (1) { }\n}'}],
 tip:'Exam tip: a compiler translates once and then the machine code runs. An interpreter runs the program directly. A virtual machine sits in between.',
 fns:[['execute','A mini virtual machine. It runs the instruction list with a program counter, local variables for every call, a printf formatter and a step limit.'],['calc','Does arithmetic and comparisons. The optimizer and the virtual machine share it.']]}
];
const FN={lex,tokName,tokVal,parse,ptE,ptT,ptF,mkAst,treeText,sem,genTAC,fi,tacText,fold,optS,optimize,asm,execute,calc};
let sIdx=0,sTab='learn',sTm;
const SIMPLE=['This is only the text of your program. Nothing has been checked or run yet.',
 'The lexer cuts your code into small pieces called tokens, like cutting a sentence into words.',
 'The parser checks the grammar and draws a parse tree. The AST is a shorter version of the same tree.',
 'Now the compiler checks the meaning: is every name declared, and do the types fit together?',
 'The tree is turned into tiny one-step instructions, like a recipe broken into very small steps.',
 'The compiler tidies those steps: it does easy calculations early and removes useless work.',
 'Every tiny step becomes an instruction the machine understands (registers, LOAD, STORE, JUMP).',
 'The program finally runs, prints its output and returns an exit code.'];
const DEMO=['int x = 5 + 10;','int x = 5 + 10;','int x = 5 + 10;','int x = 5;\nfloat y = x * 2.5;\nprintf("%d", y);','int a = 2, b = 3;\nint c = a * b + 4;','int x = 2 * 3 + 4;\nint y = x * 1;','int a = 2;\nint b = a + 3;','printf("Hi %d\\n", 5 * 2);'];
const fsrc=n=>{const t=FN[n].toString();return /^(async\s+)?(function|class)/.test(t)?t:`const ${n} = ${t};`};
function pretty(src){
  let out='',ind=0,par=0,i=0;const n=src.length,stack=[];
  const sig=()=>{for(let j=out.length-1;j>=0;j--)if(!/\s/.test(out[j]))return out[j];return ''};
  const nl=()=>{out=out.replace(/[ \t]+$/,'');if(out&&!out.endsWith('\n'))out+='\n';out+='  '.repeat(Math.max(ind,0))};
  const nextSig=j=>{while(j<n&&/\s/.test(src[j]))j++;return j};
  const readStr=q=>{let j=i+1;while(j<n&&src[j]!==q){if(src[j]==='\\')j++;if(q==='`'&&src[j]==='$'&&src[j+1]==='{'){let d=1;j+=2;while(j<n&&d){if(src[j]==='`'){j++;while(j<n&&src[j]!=='`'){if(src[j]==='\\')j++;j++}}else if(src[j]==='{')d++;else if(src[j]==='}')d--;j++}continue}j++}return src.slice(i,j+1)};
  while(i<n){const c=src[i];
    if(c==='\n'){nl();i++;while(i<n&&(src[i]===' '||src[i]==='\t'))i++;continue}
    if(c==='/'&&src[i+1]==='/'){let j=src.indexOf('\n',i);if(j<0)j=n;out+=src.slice(i,j);i=j;continue}
    if(c==='/'&&src[i+1]==='*'){let j=src.indexOf('*/',i);j=j<0?n:j+2;out+=src.slice(i,j);i=j;continue}
    if(c==="'"||c==='"'||c==='`'){const t=readStr(c);out+=t;i+=t.length;continue}
    if(c==='/'&&(sig()===''||'(,=:[!&|?{};'.includes(sig()))){let j=i+1,cls=false;while(j<n&&(src[j]!=='/'||cls)){if(src[j]==='\\')j++;else if(src[j]==='[')cls=true;else if(src[j]===']')cls=false;j++}j++;while(/[a-z]/.test(src[j]||''))j++;out+=src.slice(i,j);i=j;continue}
    if(c==='('){par++;out+=c;i++;continue}
    if(c===')'){par--;out+=c;i++;continue}
    if(c==='{'){const p=sig(),tail=out.slice(-40),block=p===')'||p==='>'||p===''||p===';'||p==='}'||p==='{'||/\b(else|do|try|finally)\s*$/.test(tail)||/\b(case\s+[^:]+|default)\s*:\s*$/.test(tail);
      stack.push({block,par});out+='{';i++;if(block){par=0;ind++;nl();while(i<n&&/[ \t]/.test(src[i]))i++}continue}
    if(c==='}'){const o=stack.pop()||{block:false,par:0};
      if(o.block){ind--;nl();out+='}';par=o.par;const j=nextSig(i+1),rest=src.slice(j,j+7);
        if(/^(else|while|catch|finally)/.test(rest)){out+=' '}else if(!')],;.'.includes(src[j]||';')){i++;nl();continue}}
      else out+='}';i++;continue}
    if(c===';'&&par<=0){out+=';';i++;if(src[nextSig(i)]!=='}'){nl();while(i<n&&/[ \t]/.test(src[i]))i++}continue}
    out+=c;i++}
  return out.replace(/\n\s*\n+/g,'\n').trim()}
const hl=l=>esc(l).replace(/(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|function|class|return|if|else|for|while|switch|case|break|continue|new|throw|try|catch|default|of|in)\b|\b(\d+\.?\d*)\b/g,(m,c,s,k,n)=>c?`<span class="c">${c}</span>`:s?`<span class="s">${s}</span>`:k?`<span class="k">${k}</span>`:`<span class="n">${n}</span>`);
const chl=t=>esc(t).replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)|(^#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(int|float|double|char|void|long|short|unsigned|const|struct|typedef|if|else|for|while|do|switch|case|default|break|continue|return|sizeof)\b|\b(\d+\.?\d*)\b/gm,(m,c,pp,s,k,n)=>c?`<span class="c">${c}</span>`:pp?`<span class="k">${pp}</span>`:s?`<span class="s">${s}</span>`:k?`<span class="k">${k}</span>`:`<span class="n">${n}</span>`);
const codeBox=t=>`<div class="code">${pretty(t).split('\n').map((l,i)=>`<div class="cl"><i>${i+1}</i>${hl(l)}</div>`).join('')}</div>`;
const quiet=(code,inp)=>{const sv=STDIN;STDIN=inp||'';try{return compile(code)}finally{STDIN=sv}};
const sres=r=>{const b=r.st.indexOf(2);if(b>=0)return{err:1,t:r.outs[b].split('\n')[0].replace(/^✖\s*/,'')};
  return{err:0,t:(r.outs[7].split('\n').filter(x=>!x.startsWith('[')).join(' ⏎ ')||'(no output)').slice(0,110)}};
function syFill(){const i=$('sy-in'),o=$('sy-out');if(!i||!o)return;i.textContent=R.ins[sIdx]||'—';showOut(o,sIdx);if(sIdx===2)syncTreeCtl();
  const pp=$('pipe');if(pp)pp.innerHTML=pipeHtml()}
function sApply(v,inp){SRC=v;if(inp!==undefined)STDIN=inp;R=compile(SRC);drawAll();buildTokens();const b=$('srcbox');if(b)b.value=SRC;fill()}
const pipeHtml=()=>PH.map((q,i)=>`<button class="pp ${i===sIdx?'on':''} s${R.st[i]}" data-ph="${i}" title="${q.n}"><i></i>${i+1}. ${q.n}</button>`).join('');
function renderStudy(){
  const L=SLANG==='ru',u=UI[SLANG],p=PH[sIdx],d=STUDY[sIdx],S=$('study');let body='';
  const intro=L?RU.intro[sIdx]:d.intro,steps=L?RU.steps[sIdx]:d.steps,terms=L?RU.terms[sIdx]:d.terms,simple=L?RU.simple[sIdx]:SIMPLE[sIdx];
  const tip=(L?RU.tip[sIdx]:d.tip).replace(/^Exam tip:\s*/,'');
  const nav=PH.map((q,i)=>`<li><button data-i="${i}" class="${i===sIdx?'on':''}"><b style="background:${q.c}">${i+1}</b>${q.n}</button></li>`).join('');
  const tabs=[['learn',u.tabs[0]],['yours',u.tabs[1]],['code',u.tabs[2]]].map(([k,l])=>`<button data-t="${k}" class="${k===sTab?'on':''}" role="tab" aria-selected="${k===sTab}">${l}</button>`).join('');
  if(sTab==='learn'){
    const dm=quiet(DEMO[sIdx]),dIn=sIdx===0||sIdx===1?`<pre class="cpre">${chl(DEMO[sIdx])}</pre>`:`<pre>${esc(dm.ins[sIdx]||'')}</pre>`;
    const di=dm.items&&dm.items[dm.items.length-1];
    const dOut=sIdx===2&&di?`<div class="two"><div><span class="cap">Parse tree</span><div class="treebox">${treeSVG(di.pt)}</div></div><div><span class="cap">AST</span><div class="treebox">${treeSVG(di.ast)}</div></div></div>`:`<pre class="${dm.st[sIdx]===2?'er':''}">${esc(sIdx===0?'// Passed to the Lexical Analyzer':dm.outs[sIdx])}</pre>`;
    const exs=d.ex.map((e,i)=>{const r=sres(quiet(e.c,e.i));return `<div class="ex"><b>${L&&RU.exl[sIdx][i]?RU.exl[sIdx][i]:e.l}</b><pre class="cpre">${chl(e.c)}</pre><div class="res ${r.err?'bad':''}"><i>${r.err?u.err:u.ok}</i>${esc(r.t)}</div><button data-ex="${i}">${u.run}</button></div>`}).join('');
    const tp=sIdx===0?`<h3>${u.topics}</h3><div class="tps">${TOPICS.map((t,i)=>`<div class="tp"><span><b>${i+1}.</b> ${L?RU.topics[i]:t.n}</span>${t.c?`<button data-tp="${i}">Run</button>`:''}</div>`).join('')}</div>`:'';
    body=`<div class="callout"><b>${u.simple}</b><p>${simple}</p></div>
      <h3>${u.what}</h3><p class="lead">${intro}</p>
      <h3>${u.demo}</h3><div class="demo${sIdx===2?' wide':''}"><div><span class="cap">${u.inp}</span>${dIn}</div><div class="arrow">→</div><div><span class="cap">${u.outp}</span>${dOut}</div></div>
      <h3>${u.how}</h3><ol class="steps2">${steps.map(x=>`<li>${x}</li>`).join('')}</ol>
      <h3>${u.terms}</h3><div class="terms">${terms.map(([a,b])=>`<div class="term"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div>
      <h3>${u.tryx}</h3><div class="exs">${exs}</div>${tp}
      <div class="callout tip"><b>${u.tip}</b><p>${tip}</p></div>`}
  else if(sTab==='yours')body=`<p class="lead">${u.lead}</p>
      <h3>${u.prog}</h3><textarea id="sy-src" spellcheck="false" aria-label="${u.prog}"></textarea>
      ${sIdx===7?`<h3>${u.stdin}</h3><textarea id="sy-stdin" rows="2" spellcheck="false"></textarea>`:''}
      <h3>${u.pipe}</h3><div class="pipe" id="pipe">${pipeHtml()}</div>
      <div class="io${sIdx===2?' one':''}"><div><div class="lb"><i style="background:#fbbf24"></i>${u.inp} · ${p.n}</div><pre id="sy-in"></pre></div><div><div class="lb"><i style="background:#34d399"></i>${u.outp} · ${p.n}</div>${sIdx===2?treeCtl()+'<div id="sy-out" class="treebox big"></div>':'<pre id="sy-out"></pre>'}</div></div>`;
  else body=sIdx===0?`<p class="lead">${u.gram}</p>${codeBox(SGRAM)}`
      :`<p class="lead">${u.code}</p>`+d.fns.map(([n,note],k)=>`<div class="fn"><div class="fh"><div><b>${n}</b><span class="file">compiler.js</span></div><button data-copy="${n}">Copy</button></div><p>${L&&RU.fns[sIdx][k]?RU.fns[sIdx][k]:note}</p>${codeBox(fsrc(n))}</div>`).join('');
  S.innerHTML=`<div class="sbox" style="--ph:${p.pc}"><nav class="snav" aria-label="${u.phases}"><h5>${u.phases}</h5><ol>${nav}</ol></nav><div class="smain"><div class="shead"><div><div class="plabel">Phase ${sIdx+1} of 8 · Study mode</div><h2>${p.n}</h2><div class="sub">${p.s}</div></div><div class="hbtns"><button class="lang" data-watch>▶ ${u.watch}</button><button class="lang" data-lang>${u.lang}</button><button data-nav="-1" aria-label="Previous phase"${sIdx===0?' disabled':''}>‹</button><button data-nav="1" aria-label="Next phase"${sIdx===7?' disabled':''}>›</button><button id="sclose" aria-label="Close study mode">×</button></div></div><div class="tabs" role="tablist">${tabs}</div><div class="sbody">${body}</div></div></div>`;
  const y=$('sy-src');if(y){y.value=SRC;syFill()}const y2=$('sy-stdin');if(y2)y2.value=STDIN}
function openStudy(i,t){sIdx=i;sTab=t||'learn';$('study').hidden=false;renderStudy();$('sclose').focus()}
function closeStudy(){$('study').hidden=true}
$('study').addEventListener('click',e=>{
  if(e.target===$('study'))return closeStudy();
  const b=e.target.closest('button');if(!b)return;
  const keep=()=>{const sb=document.querySelector('.sbody');return sb?sb.scrollTop:0};
  if(b.id==='sclose')closeStudy();
  else if(b.dataset.lang!==undefined){SLANG=SLANG==='en'?'ru':'en';renderStudy()}
  else if(b.dataset.watch!==undefined){closeStudy();openWatch(sIdx)}
  else if(b.dataset.nav){sIdx=Math.max(0,Math.min(7,sIdx+ +b.dataset.nav));renderStudy()}
  else if(b.dataset.i!==undefined){sIdx=+b.dataset.i;renderStudy()}
  else if(b.dataset.ph!==undefined){sIdx=+b.dataset.ph;const y=$('sy-src'),t=y?y.scrollTop:0;renderStudy()}
  else if(b.dataset.t){sTab=b.dataset.t;renderStudy()}
  else if(b.dataset.ex!==undefined){const x=STUDY[sIdx].ex[+b.dataset.ex];sApply(x.c,x.i===undefined?'':x.i);sTab='yours';renderStudy()}
  else if(b.dataset.tp!==undefined){const t=TOPICS[+b.dataset.tp];sApply(t.c,t.i===undefined?'':t.i);sTab='yours';renderStudy()}
  else if(b.dataset.copy){try{navigator.clipboard.writeText(pretty(fsrc(b.dataset.copy)));b.textContent='Copied'}catch(x){}}
});
$('study').addEventListener('input',e=>{const v=e.target.value;
  if(e.target.id==='sy-stdin'){STDIN=v;R=compile(SRC);drawAll();fill();syFill();return}
  if(e.target.id!=='sy-src')return;clearTimeout(sTm);sTm=setTimeout(()=>{sApply(v);syFill()},200)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('study').hidden)closeStudy()});
$('stb').onclick=()=>openStudy(act,'learn');
