/* ===================== A mini C compiler (a subset of C) written in JavaScript ===================== */
const TYW=new Set(['int','long','short','float','double','char','bool','void']);
const MODS=['const','static','unsigned','signed'];
const KW=new Set([...TYW,...MODS,'struct','typedef','sizeof','if','else','while','for','do','switch','case','default','break','continue','return','true','false']);
const OPN={'+':'PLUS','-':'MINUS','*':'MUL','/':'DIV','%':'MOD','=':'ASSIGN','<':'LT','>':'GT','<=':'LE','>=':'GE','==':'EQ','!=':'NE','&&':'AND','||':'OR','!':'NOT','&':'AMP','++':'INC','--':'DEC','+=':'PLUS_ASSIGN','-=':'MINUS_ASSIGN','*=':'MUL_ASSIGN','/=':'DIV_ASSIGN','%=':'MOD_ASSIGN','->':'ARROW','.':'DOT','?':'QUESTION',':':'COLON','(':'LPAREN',')':'RPAREN','{':'LBRACE','}':'RBRACE','[':'LBRACKET',']':'RBRACKET',';':'SEMICOLON',',':'COMMA'};
const nb=t=>/float|double/.test(t)?'float':/char/.test(t)?'char':t==='bool'?'bool':t==='void'?'void':'int';
const isPtr=t=>t.endsWith('*'),isNumT=t=>t==='int'||t==='char'||t==='float'||t==='bool',isStr=t=>t.startsWith('struct ')&&!t.endsWith('*');
const TS=(bt,st)=>bt+'*'.repeat(st||0);
const unesc=s=>s.replace(/\\(.)/g,(_,c)=>({n:'\n',t:'\t','0':'\0','r':'\r'}[c]??c));
const calc=(op,a,b,f)=>{switch(op){
  case '+':return a+b;case '-':return a-b;case '*':return a*b;
  case '<':return +(a<b);case '>':return +(a>b);case '<=':return +(a<=b);case '>=':return +(a>=b);
  case '==':return +(a===b);case '!=':return +(a!==b);case '&&':return +(!!a&&!!b);case '||':return +(!!a||!!b)}
  if(b===0)return null;return op==='%'?a%b:(f?a/b:Math.trunc(a/b))};

/* ---------- 1. Lexical analysis ---------- */
function lex(src){
  const re=/\s+|\/\/.*|\/\*[\s\S]*?\*\/|(\/\*)|(#.*)|(0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?[fFlLuU]*)|([A-Za-z_]\w*)|("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(->|==|!=|<=|>=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|%=|[+\-*\/%=<>(){};,!\[\]:&.?])|(.)/y,out=[];
  let line=1,ls=0;const LE=(text,l,c)=>({kind:'Lexical error',text,ln:l,col:c});
  while(re.lastIndex<src.length){
    const s=re.lastIndex,m=re.exec(src);if(!m)break;const l=line,c=s-ls+1,len=m[0].length;
    const nl=m[0].split('\n').length-1;if(nl){line+=nl;ls=s+m[0].lastIndexOf('\n')+1}
    if(m[1])throw LE('unterminated comment: /* is never closed with */',l,c);
    if(m[2])out.push({k:'PREPROC',v:m[2].trim(),l,c,len});
    else if(m[3])out.push({k:'NUMBER',v:m[3],l,c,len});
    else if(m[4])out.push(m[4]==='NULL'?{k:'NUMBER',v:'0',l,c,len}:{k:KW.has(m[4])?'KEYWORD':'ID',v:m[4],l,c,len});
    else if(m[5])out.push({k:'STRING',v:unesc(m[5].slice(1,-1)),l,c,len});
    else if(m[6]){const q=unesc(m[6].slice(1,-1));
      if(q.length!==1)throw LE(q.length?'character constant is too long (use double quotes "..." for text)':'empty character constant',l,c);
      out.push({k:'CHAR',v:q,cc:q.charCodeAt(0),l,c,len})}
    else if(m[7])out.push({k:OPN[m[7]],v:m[7],l,c,len});
    else if(m[8]){
      if(m[8]==='"')throw LE('unterminated string: the closing " is missing',l,c);
      if(m[8]==="'")throw LE('invalid character literal',l,c);
      throw LE(`unexpected character '${m[8]}'`,l,c)}
  }
  const DEF=new Map();
  for(const t of out)if(t.k==='PREPROC'){const m=t.v.match(/^#\s*define\s+([A-Za-z_]\w*)\s+(.+)$/);
    if(m){try{const v=lex(m[2]).find(x=>x.k!=='PREPROC');if(v)DEF.set(m[1],v)}catch(e){}}}
  const res=out.map(t=>t.k==='ID'&&DEF.has(t.v)?{...DEF.get(t.v),l:t.l,c:t.c,len:t.len}:t);
  if(!res.some(t=>t.k!=='PREPROC'))throw{kind:'Lexical error',text:'empty program: write some code in the Source Code phase',ln:0};
  return res;
}
const tokName=t=>t.k==='NUMBER'?(/^0[xX]/.test(t.v)||!/[.eE]/.test(t.v)?'INTEGER':'FLOAT'):t.k;
const tokVal=t=>t.k==='STRING'?JSON.stringify(t.v):t.k==='CHAR'?`'${t.v}'`:t.v;

/* ---------- 2. Syntax analysis (recursive descent) ---------- */
function parse(all){
  const toks=all.filter(t=>t.k!=='PREPROC');let p=0;const T=()=>toks[p];
  const structs=new Map(),typedefs=new Map(),sdefs=[];let anon=0;
  const is=v=>{const t=T();return !!t&&t.v===v&&t.k!=='STRING'&&t.k!=='CHAR'};
  const SE=(text,t,col)=>({kind:'Syntax error',text,ln:t?t.l:0,col:col||(t?t.c:0)});
  const err=m=>{const t=T(),q=toks[p-1];throw t?SE(`${m} before '${tokVal(t)}'`,t):SE(`${m} at the end of the program`,q,q?q.c+q.len:0)};
  const eat=v=>{if(is(v))return toks[p++];const q=toks[p-1],t=T();
    if(v===')'&&t&&['=','+=','-=','*=','/=','%='].includes(t.v)&&t.k!=='STRING')throw SE("assignment inside an expression is not supported here: did you mean '=='?",t);
    if(q&&(!t||t.l>q.l))throw SE(`missing '${v}' after '${tokVal(q)}'`,q,q.c+q.len);err(`expected '${v}'`)};
  const isTy=t=>!!t&&((t.k==='KEYWORD'&&(TYW.has(t.v)||MODS.includes(t.v)||t.v==='struct'))||(t.k==='ID'&&typedefs.has(t.v)));
  const lv=e=>e.t==='id'||e.t==='idx'||e.t==='mem'||e.t==='deref';
  const typeSpec=()=>{let cst=false,mods=[],t=T();
    while(t&&t.k==='KEYWORD'&&MODS.includes(t.v)){if(t.v==='const')cst=true;if(t.v==='unsigned'||t.v==='signed')mods.push(t.v);p++;t=T()}
    if(t&&t.k==='KEYWORD'&&t.v==='struct'){p++;let id=T();
      if(id&&id.k==='ID')p++;else if(is('{'))id={v:'__anon'+(++anon),l:id.l};else err('expected a structure name');
      if(is('{')){p++;const members=[];
        while(T()&&!is('}')){const sp=typeSpec();
          while(1){let st=sp.stars||0;while(is('*')){p++;st++}const mi=T();if(!mi||mi.k!=='ID')err('expected a member name');p++;
            const dims=[];while(is('[')){p++;dims.push(ex());eat(']')}
            members.push({ty:sp.ty,bt:sp.bt,stars:st,n:mi.v,dims,ln:mi.l});if(is(',')){p++;continue}break}
          eat(';')}
        eat('}');if(structs.has(id.v))throw SE(`redefinition of 'struct ${id.v}'`,id);
        const sd={t:'structdef',n:id.v,members,ln:id.l};structs.set(id.v,sd);sdefs.push(sd)}
      return{ty:'struct '+id.v,bt:'struct '+id.v,cst}}
    if(t&&t.k==='ID'&&typedefs.has(t.v)){p++;return{...typedefs.get(t.v),cst}}
    if(t&&t.k==='KEYWORD'&&TYW.has(t.v)){p++;let ty=t.v;
      if(ty==='long'&&is('long')){p++;ty='long long'}
      if((ty==='long'||ty==='short')&&is('int'))p++;
      if(ty==='long'&&is('double')){p++;ty='long double'}
      return{ty:(mods[0]?mods[0]+' ':'')+ty,bt:nb(ty),cst}}
    if(mods.length)return{ty:mods[0]+' int',bt:'int',cst};
    err('expected a type')};
  const typedefS=()=>{p++;const sp=typeSpec();let st=0;while(is('*')){p++;st++}const id=T();
    if(!id||id.k!=='ID')err('expected a name for the typedef');p++;eat(';');
    let {ty,bt}=sp;
    if(bt.startsWith('struct __anon')){const sd=structs.get(bt.slice(7));structs.delete(bt.slice(7));sd.n=id.v;structs.set(id.v,sd);bt=ty='struct '+id.v}
    typedefs.set(id.v,{ty,bt,stars:st})};
  const bin=(next,ops)=>()=>{let l=next();while(T()&&ops.includes(T().v)&&T().k!=='STRING'&&T().k!=='CHAR'){const o=toks[p++];l={t:'bin',op:o.v,l,r:next(),ln:o.l}}return l};
  const prim=()=>{const t=T();if(!t)err('expected an expression');
    if(t.k==='NUMBER'){p++;const hx=/^0[xX]/.test(t.v),f=!hx&&/[.eE]/.test(t.v);return{t:'num',v:hx?parseInt(t.v,16):parseFloat(t.v),ty:f?'float':'int',ln:t.l}}
    if(t.k==='STRING'){p++;let s=t.v;while(T()&&T().k==='STRING'){s+=T().v;p++}return{t:'str',v:s,ln:t.l}}
    if(t.k==='CHAR'){p++;return{t:'num',v:t.cc,ty:'char',ln:t.l}}
    if(t.k==='KEYWORD'&&(t.v==='true'||t.v==='false')){p++;return{t:'num',v:t.v==='true'?1:0,ty:'bool',ln:t.l}}
    if(t.k==='ID'){p++;
      if(is('(')){p++;const args=[];if(!is(')')){args.push(ex());while(is(',')){p++;args.push(ex())}}eat(')');return{t:'call',n:t.v,args,ln:t.l}}
      return{t:'id',n:t.v,ln:t.l}}
    if(is('(')){p++;const e=ex();eat(')');return e}
    err('expected an expression')};
  const post=()=>{let e=prim();
    while(T()){const t=T();
      if(is('[')){p++;const i=ex();eat(']');e={t:'idx',b:e,i,ln:t.l}}
      else if(is('.')||is('->')){p++;const id=T();if(!id||id.k!=='ID')err('expected a member name');p++;e={t:'mem',b:e,n:id.v,arrow:t.v==='->',ln:t.l}}
      else break}
    if((is('++')||is('--'))&&lv(e)){const o=toks[p++];e={t:'incdec',lv:e,op:o.v,pre:false,ln:o.l}}
    return e};
  const un=()=>{const t=T();
    if(is('-')||is('!')){p++;return{t:'un',op:t.v,e:un(),ln:t.l}}
    if(is('++')||is('--')){p++;const e=un();if(!lv(e))throw SE(`lvalue required as operand of ${t.v}`,t);return{t:'incdec',lv:e,op:t.v,pre:true,ln:t.l}}
    if(is('*')){p++;return{t:'deref',e:un(),ln:t.l}}
    if(is('&')){p++;const e=un();if(!lv(e))throw SE('cannot take the address of this expression',t);return{t:'addr',e,ln:t.l}}
    if(is('sizeof')){p++;
      if(is('(')&&isTy(toks[p+1])){p++;const sp=typeSpec();let st=sp.stars||0;while(is('*')){p++;st++}eat(')');return{t:'sizeof',ty:sp.ty,bt:sp.bt,stars:st,ln:t.l}}
      return{t:'sizeof',e:un(),ln:t.l}}
    if(is('(')&&isTy(toks[p+1])){p++;const sp=typeSpec();let st=sp.stars||0;while(is('*')){p++;st++}eat(')');return{t:'cast',ty:sp.ty,bt:sp.bt,stars:st,e:un(),ln:t.l}}
    return post()};
  const orE=bin(bin(bin(bin(bin(bin(un,['*','/','%']),['+','-']),['<','>','<=','>=']),['==','!=']),['&&']),['||']);
  const tern=()=>{const c=orE();if(is('?')){const q=toks[p++];const a=ex();eat(':');const b=tern();return{t:'tern',c,a,b,ln:q.l}}return c};
  const ex=()=>tern();
  const initL=()=>{eat('{');const items=[];while(!is('}')){items.push(is('{')?initL():ex());if(is(','))p++;else break}eat('}');return{t:'init',items}};
  const declList=sp=>{const out=[];
    while(1){let st=sp.stars||0;while(is('*')){p++;st++}const id=T();if(!id||id.k!=='ID')err('expected a variable name');p++;
      const dims=[];while(is('[')){p++;dims.push(is(']')?null:ex());eat(']')}
      let init=null;if(is('=')){p++;init=is('{')?initL():ex()}
      out.push({t:'decl',ty:sp.ty,bt:sp.bt,stars:st,n:id.v,init,dims:dims.length?dims:null,cst:sp.cst&&st===0,ln:id.l});
      if(is(',')){p++;continue}break}
    return out};
  const AO=['=','+=','-=','*=','/=','%='];
  const mkAs=(l,op,e,show,ln)=>({t:'assign',lv:l,op,show:show||op,e,ln,full:op==='='?e:{t:'bin',op:op[0],l,r:e,ln}});
  const one1={t:'num',v:1,ty:'int'};
  const asnRhs=()=>{const r=ex();if(is('=')&&lv(r)){const n=toks[p++],rr=asnRhs();return{pre:[...rr.pre,mkAs(r,'=',rr.val,null,n.l)],val:r}}return{pre:[],val:r}};
  const simpleList=()=>{const l=[simple()];while(is(',')){p++;l.push(simple())}return l.length===1?l[0]:{t:'block',b:l,flat:true}};
  const simple=()=>{const t=T();
    if(is('++')||is('--')){p++;const e=un();if(!lv(e))throw SE(`lvalue required as operand of ${t.v}`,t);return mkAs(e,t.v==='++'?'+=':'-=',one1,t.v,t.l)}
    const e=ex(),n=T();
    if(n&&n.k!=='STRING'&&n.k!=='CHAR'){
      if(AO.includes(n.v)){if(!lv(e))throw SE('lvalue required as the left side of an assignment',n);p++;
        if(n.v!=='=')return mkAs(e,n.v,ex(),null,t.l);
        const rh=asnRhs(),a=mkAs(e,'=',rh.val,null,t.l);return rh.pre.length?{t:'block',b:[...rh.pre,a],flat:true}:a}
      if(n.v==='++'||n.v==='--'){if(!lv(e))throw SE(`lvalue required as operand of ${n.v}`,n);p++;return mkAs(e,n.v==='++'?'+=':'-=',one1,n.v,t.l)}}
    if(e.t==='incdec')return mkAs(e.lv,e.op==='++'?'+=':'-=',one1,e.op,t.l);
    return{t:'expr',e,ln:t?t.l:0}};
  const one=()=>{const r=stmt();return Array.isArray(r)?{t:'block',b:r}:r};
  const block=()=>{eat('{');const b=[];while(T()&&!is('}')){const r=stmt();Array.isArray(r)?b.push(...r):b.push(r)}eat('}');return{t:'block',b}};
  const stmt=()=>{const t=T();if(!t)err('expected a statement');
    if(is('typedef')){typedefS();return[]}
    if(isTy(t)){const sp=typeSpec();if(is(';')){p++;return[]}const d=declList(sp);eat(';');return d}
    if(t.k==='ID'&&toks[p+1]&&toks[p+1].k==='ID'&&!typedefs.has(t.v))
      throw SE(`unknown type name '${t.v}'${t.v==='string'?' (C has no string type: use char name[] or char *name)':''}`,t);
    if(is('{'))return block();
    if(is(';')){p++;return{t:'block',b:[]}}
    if(t.k==='KEYWORD'){
      if(t.v==='if'){p++;eat('(');const c=ex();eat(')');const a=one();let b=null;if(is('else')){p++;b=one()}return{t:'if',c,a,b}}
      if(t.v==='else')throw SE("'else' without a previous 'if'",t);
      if(t.v==='while'){p++;eat('(');const c=ex();eat(')');return{t:'while',c,b:one()}}
      if(t.v==='do'){p++;const b=one();if(!is('while'))err("expected 'while' after the do-block");p++;eat('(');const c=ex();eat(')');eat(';');return{t:'dowhile',c,b}}
      if(t.v==='for'){p++;eat('(');let i=null,c=null,u=null;
        if(!is(';')){if(isTy(T())){const d=declList(typeSpec());i=d.length===1?d[0]:{t:'block',b:d,flat:true}}else i=simpleList()}eat(';');
        if(!is(';'))c=ex();eat(';');if(!is(')'))u=simpleList();eat(')');return{t:'for',i,c,u,b:one()}}
      if(t.v==='switch'){p++;eat('(');const c=ex();eat(')');eat('{');const cases=[];
        while(T()&&!is('}')){let v=null;const ln=T().l;
          if(is('case')){p++;let e=ex();if(e.t==='un'&&e.op==='-'&&e.e.t==='num')e={t:'num',v:-e.e.v,ty:e.e.ty};
            if(e.t!=='num'||e.ty==='float')throw SE('case label must be an integer or character constant',t);v=e;eat(':')}
          else if(is('default')){p++;eat(':')}else err("expected 'case' or 'default'");
          const body=[];while(T()&&!is('case')&&!is('default')&&!is('}')){const r=stmt();Array.isArray(r)?body.push(...r):body.push(r)}
          cases.push({v,body,ln})}
        eat('}');return{t:'switch',c,cases,ln:t.l}}
      if(t.v==='break'||t.v==='continue'){p++;eat(';');return{t:t.v==='break'?'brk':'cont',ln:t.l}}
      if(t.v==='return'){p++;const e=is(';')?null:ex();eat(';');return{t:'ret',e,ln:t.l}}
      if(t.v==='case'||t.v==='default')throw SE(`'${t.v}' label is not inside a switch`,t)}
    const s=simple();eat(';');return s};
  const funcs=[],globals=[];
  while(T()){
    if(is('typedef')){typedefS();continue}
    if(isTy(T())){const sp=typeSpec();if(is(';')){p++;continue}
      let i=p;while(toks[i]&&toks[i].v==='*'&&toks[i].k!=='STRING')i++;
      if(toks[i]&&toks[i].k==='ID'&&toks[i+1]&&toks[i+1].k==='LPAREN'){
        let st=sp.stars||0;while(is('*')){p++;st++}const nm=toks[p++];p++;const params=[];
        if(is('void')&&toks[p+1]&&toks[p+1].v===')')p++;
        else if(!is(')'))while(1){const ps=typeSpec();let pst=ps.stars||0;while(is('*')){p++;pst++}const pn=T();
          const named=pn&&pn.k==='ID';if(named)p++;else if(!(is(',')||is(')')))err('expected a parameter name');
          let ad=0;const pd=[];while(is('[')){p++;pd.push(is(']')?null:ex());eat(']');ad++}
          params.push({ty:ps.ty,bt:ps.bt,stars:pst,n:named?pn.v:'',ad,pd});if(is(',')){p++;continue}break}
        eat(')');if(is(';')){p++;continue}
        if(params.some(q=>!q.n))err('parameter name omitted in a function definition');
        funcs.push({t:'func',ty:sp.ty,bt:sp.bt,stars:st,n:nm.v,params,body:block(),ln:nm.l});continue}
      const d=declList(sp);eat(';');globals.push(...d);continue}
    const r=stmt();Array.isArray(r)?globals.push(...r):globals.push(r)}
  if(!funcs.length)funcs.push({t:'func',ty:'int',bt:'int',stars:0,n:'main',params:[],body:{t:'block',b:globals.splice(0)},ln:1});
  else if(globals.some(g=>g.t!=='decl'))throw{kind:'Syntax error',text:'only variable declarations are allowed outside functions',ln:0};
  return{t:'prog',structs:sdefs,funcs,globals};
}

/* ---------- the parse tree and the AST (both drawn as real trees) ---------- */
const dimTxt=ds=>(ds||[]).map(d=>d?`[${d.t==='num'?d.v:'…'}]`:'[]').join('');
const litTxt=n=>n.t==='str'?JSON.stringify(n.v.length>16?n.v.slice(0,15)+'…':n.v):n.ty==='char'?`'${String.fromCharCode(n.v)}'`:n.ty==='bool'?(n.v?'true':'false'):String(n.v);
const tyTxt=(ty,st)=>ty+'*'.repeat(st||0);
const A=(l,k,c)=>({l,k,c:c||[]});
/* AST: compact. The operator is the node, the operands are its children. */
function mkAst(n){switch(n.t){
  case 'prog':return A('Program','prog',[...n.structs.map(mkAst),...n.globals.map(mkAst),...n.funcs.map(mkAst)]);
  case 'structdef':return A('struct '+n.n,'func',n.members.map(m=>A(`${tyTxt(m.ty,m.stars)} ${m.n}${dimTxt(m.dims)}`,'leaf')));
  case 'func':return A(`${n.n}(${n.params.map(q=>q.n).join(', ')})`,'func',n.body.b.map(mkAst));
  case 'block':return A('{ }','stmt',n.b.map(mkAst));
  case 'decl':{const d=`${n.cst?'const ':''}${tyTxt(n.ty,n.stars)} ${n.n}${dimTxt(n.dims)}`;return n.init?A('=','stmt',[A(d,'leaf'),mkAst(n.init)]):A(d,'stmt')}
  case 'init':return A('{ }','expr',n.items.map(mkAst));
  case 'assign':return n.show==='++'||n.show==='--'?A(n.show,'stmt',[mkAst(n.lv)]):A(n.show,'stmt',[mkAst(n.lv),mkAst(n.e)]);
  case 'expr':return mkAst(n.e);
  case 'ret':return A('return','stmt',n.e?[mkAst(n.e)]:[]);
  case 'brk':return A('break','stmt');case 'cont':return A('continue','stmt');
  case 'if':return A('if','stmt',[mkAst(n.c),mkAst(n.a),...(n.b?[mkAst(n.b)]:[])]);
  case 'while':return A('while','stmt',[mkAst(n.c),mkAst(n.b)]);
  case 'dowhile':return A('do-while','stmt',[mkAst(n.b),mkAst(n.c)]);
  case 'for':return A('for','stmt',[n.i?mkAst(n.i):A('ε','leaf'),n.c?mkAst(n.c):A('ε','leaf'),n.u?mkAst(n.u):A('ε','leaf'),mkAst(n.b)]);
  case 'switch':return A('switch','stmt',[mkAst(n.c),...n.cases.map(k=>A(k.v?'case '+litTxt(k.v):'default','role',k.body.map(mkAst)))]);
  case 'num':case 'str':return A(litTxt(n),'leaf');
  case 'id':return A(n.n,'leaf');
  case 'un':return A(n.op,'expr',[mkAst(n.e)]);
  case 'bin':return A(n.op,'expr',[mkAst(n.l),mkAst(n.r)]);
  case 'tern':return A('?:','expr',[mkAst(n.c),mkAst(n.a),mkAst(n.b)]);
  case 'cast':return A(`(${tyTxt(n.ty,n.stars)})`,'expr',[mkAst(n.e)]);
  case 'call':return A(n.n+'()','expr',n.args.map(mkAst));
  case 'idx':return A('[ ]','expr',[mkAst(n.b),mkAst(n.i)]);
  case 'mem':return A(n.arrow?'->':'.','expr',[mkAst(n.b),A(n.n,'leaf')]);
  case 'deref':return A('*','expr',[mkAst(n.e)]);
  case 'addr':return A('&','expr',[mkAst(n.e)]);
  case 'incdec':return A(n.pre?n.op+' (pre)':n.op+' (post)','expr',[mkAst(n.lv)]);
  case 'sizeof':return A('sizeof','expr',n.e?[mkAst(n.e)]:[A(tyTxt(n.ty,n.stars),'leaf')])}}
/* Parse tree: every grammar rule that was used is a node (E, T, F ...), every token is a leaf. */
const PK=l=>({l,k:'tok',c:[]}),PN=(l,c)=>({l,k:'nt',c:c.filter(Boolean)});
const PRC={'||':1,'&&':2,'==':3,'!=':3,'<':4,'>':4,'<=':4,'>=':4,'+':5,'-':5,'*':6,'/':6,'%':6};
const prc=e=>e.t==='tern'?0:e.t==='bin'?PRC[e.op]:8;
function ptF(e){
  if(prc(e)<8)return PN('F',[PK('('),ptTop(e),PK(')')]);
  switch(e.t){
    case 'num':case 'str':return PN('F',[PK(litTxt(e))]);
    case 'id':return PN('F',[PK(e.n)]);
    case 'un':return PN('F',[PK(e.op),ptF(e.e)]);
    case 'deref':return PN('F',[PK('*'),ptF(e.e)]);
    case 'addr':return PN('F',[PK('&'),ptF(e.e)]);
    case 'cast':return PN('F',[PK('('),PK(tyTxt(e.ty,e.stars)),PK(')'),ptF(e.e)]);
    case 'sizeof':return PN('F',[PK('sizeof'),PK('('),e.e?ptTop(e.e):PK(tyTxt(e.ty,e.stars)),PK(')')]);
    case 'incdec':return PN('F',e.pre?[PK(e.op),ptF(e.lv)]:[ptF(e.lv),PK(e.op)]);
    case 'idx':return PN('F',[ptF(e.b),PK('['),ptTop(e.i),PK(']')]);
    case 'mem':return PN('F',[ptF(e.b),PK(e.arrow?'->':'.'),PK(e.n)]);
    case 'call':return PN('F',[PN('Call',[PK(e.n),PK('('),e.args.length?PN('Args',e.args.flatMap((a,i)=>i?[PK(','),ptTop(a)]:[ptTop(a)])):null,PK(')')])])}}
const ptT=e=>e.t==='bin'&&'*/%'.includes(e.op)?PN('T',[ptT(e.l),PK(e.op),ptF(e.r)]):PN('T',[ptF(e)]);
const ptE=e=>e.t==='bin'&&(e.op==='+'||e.op==='-')?PN('E',[ptE(e.l),PK(e.op),ptT(e.r)]):PN('E',[ptT(e)]);
const ptC2=(x,min)=>x.t==='bin'&&PRC[x.op]<=4?(PRC[x.op]>=min?ptC(x):PN('C',[PN('E',[PN('T',[PN('F',[PK('('),ptTop(x),PK(')')])])])])):PN('C',[ptE(x)]);
const ptC=e=>PN('C',[ptC2(e.l,PRC[e.op]),PK(e.op),ptC2(e.r,PRC[e.op]+1)]);
function ptTop(e){return e.t==='tern'?PN('Expr',[ptTop(e.c),PK('?'),ptTop(e.a),PK(':'),ptTop(e.b)]):e.t==='bin'&&PRC[e.op]<=4?ptC(e):ptE(e)}
const ptInit=i=>PN('InitList',[PK('{'),...i.items.flatMap((x,k)=>[k?PK(','):null,x.t==='init'?ptInit(x):ptTop(x)]),PK('}')]);
const ptStmt=s=>PN('Stmt',[ptS(s)]);
function ptS(s,semi=true){const sm=semi?PK(';'):null;switch(s.t){
  case 'decl':{const t=[s.cst?PK('const'):null,PK(s.ty),...Array.from({length:s.stars},()=>PK('*')),PK(s.n)];
    (s.dims||[]).forEach(d=>t.push(PK('['),d?ptTop(d):null,PK(']')));
    if(s.init)t.push(PK('='),s.init.t==='init'?ptInit(s.init):ptTop(s.init));t.push(sm);return PN('Decl',t)}
  case 'assign':return PN('Assign',s.show==='++'||s.show==='--'?[ptF(s.lv),PK(s.show),sm]:[ptF(s.lv),PK(s.show),ptTop(s.e),sm]);
  case 'expr':return PN('ExprStmt',[ptTop(s.e),sm]);
  case 'block':return s.flat?PN('StmtList',s.b.map(x=>ptS(x))):PN('Block',[PK('{'),...s.b.map(ptStmt),PK('}')]);
  case 'if':return PN('If',[PK('if'),PK('('),ptTop(s.c),PK(')'),ptStmt(s.a),s.b?PK('else'):null,s.b?ptStmt(s.b):null]);
  case 'while':return PN('While',[PK('while'),PK('('),ptTop(s.c),PK(')'),ptStmt(s.b)]);
  case 'dowhile':return PN('DoWhile',[PK('do'),ptStmt(s.b),PK('while'),PK('('),ptTop(s.c),PK(')'),PK(';')]);
  case 'for':return PN('For',[PK('for'),PK('('),s.i?ptS(s.i,true):PK(';'),s.c?ptTop(s.c):null,PK(';'),s.u?ptS(s.u,false):null,PK(')'),ptStmt(s.b)]);
  case 'switch':return PN('Switch',[PK('switch'),PK('('),ptTop(s.c),PK(')'),PK('{'),...s.cases.map(k=>PN('Case',[PK(k.v?'case':'default'),k.v?PK(litTxt(k.v)):null,PK(':'),...k.body.map(ptStmt)])),PK('}')]);
  case 'ret':return PN('Return',[PK('return'),s.e?ptTop(s.e):null,sm]);
  case 'brk':return PN('Break',[PK('break'),sm]);
  case 'cont':return PN('Continue',[PK('continue'),sm])}}
const ptFunc=f=>PN('Function',[PK(tyTxt(f.ty,f.stars)),PK(f.n),PK('('),f.params.length?PN('Params',f.params.flatMap((q,i)=>[i?PK(','):null,PN('Param',[PK(tyTxt(q.ty,q.stars)),q.n?PK(q.n):null,...(q.pd||[]).flatMap(d=>[PK('['),d?ptTop(d):null,PK(']')])])])):null,PK(')'),PN('Block',[PK('{'),...f.body.b.map(ptStmt),PK('}')])]);
const ptStruct=s=>PN('StructDef',[PK('struct'),PK(s.n),PK('{'),...s.members.map(m=>PN('Member',[PK(tyTxt(m.ty,m.stars)),PK(m.n),...m.dims.flatMap(d=>[PK('['),ptTop(d),PK(']')]),PK(';')])),PK('}'),PK(';')]);
const ptProg=P=>PN('Program',[...P.structs.map(ptStruct),...P.globals.map(ptStmt),...P.funcs.map(ptFunc)]);
/* a list of things the student can pick and look at: the whole program, a function, or one statement */
function treeItems(P,src){const Ls=src.split('\n'),sn=l=>l?(Ls[l-1]||'').trim().slice(0,44):'';
  const mk=(label,a,p)=>({label,ast:a,pt:p});const items=[mk('Whole program',mkAst(P),ptProg(P))];
  P.structs.forEach(s=>items.push(mk('struct '+s.n,mkAst(s),ptStruct(s))));
  P.globals.forEach(g=>items.push(mk('global › '+sn(g.ln),mkAst(g),ptStmt(g))));
  P.funcs.forEach(f=>{items.push(mk(`function ${f.n}()`,mkAst(f),ptFunc(f)));f.body.b.forEach(s=>items.push(mk(`${f.n} › ${sn(s.ln)||s.t}`,mkAst(s),ptStmt(s))))});
  return items}
function treeText(t){const o=[t.l];const rec=(n,pre)=>n.c.forEach((c,i)=>{const last=i===n.c.length-1;o.push(pre+(last?'└── ':'├── ')+c.l);rec(c,pre+(last?'    ':'│   '))});rec(t,'');return o.join('\n')}

/* ---------- 3. Semantic analysis ---------- */
const BUILTINS={printf:{any:1,ret:'int'},scanf:{any:1,scan:1,ret:'int'},puts:{ps:['s'],ret:'int'},putchar:{ps:['n'],ret:'int'},getchar:{ps:[],ret:'int'},fgets:{ps:['s','n','p'],ret:'char*'},
  strlen:{ps:['s'],ret:'int'},strcpy:{ps:['s','s'],ret:'char*'},strncpy:{ps:['s','s','n'],ret:'char*'},strcat:{ps:['s','s'],ret:'char*'},strcmp:{ps:['s','s'],ret:'int'},strncmp:{ps:['s','s','n'],ret:'int'},
  abs:{ps:['n'],ret:'int'},fabs:{ps:['n'],ret:'float'},sqrt:{ps:['n'],ret:'float'},pow:{ps:['n','n'],ret:'float'},floor:{ps:['n'],ret:'float'},ceil:{ps:['n'],ret:'float'},
  sin:{ps:['n'],ret:'float'},cos:{ps:['n'],ret:'float'},tan:{ps:['n'],ret:'float'},log:{ps:['n'],ret:'float'},log10:{ps:['n'],ret:'float'},exp:{ps:['n'],ret:'float'},
  toupper:{ps:['n'],ret:'int'},tolower:{ps:['n'],ret:'int'},isdigit:{ps:['n'],ret:'int'},isalpha:{ps:['n'],ret:'int'},isalnum:{ps:['n'],ret:'int'},isupper:{ps:['n'],ret:'int'},islower:{ps:['n'],ret:'int'},isspace:{ps:['n'],ret:'int'},
  atoi:{ps:['s'],ret:'int'},malloc:{ps:['n'],ret:'void*'},calloc:{ps:['n','n'],ret:'void*'},free:{ps:['p'],ret:'void'},exit:{ps:['n'],ret:'void'}};
function sem(P){
  const rows=[],notes=[],errs=[],SD=new Map(),F=new Map(Object.entries(BUILTINS));
  const E=(text,n)=>({kind:'Semantic error',text,ln:n&&n.ln||0});
  const rec=f=>{try{f()}catch(e){if(e&&e.kind)errs.push(e);else throw e}};
  const kindOf=t=>isStr(t)?'struct':isPtr(t)?'ptr':t==='float'?'float':t==='bool'?'bool':'int';
  const mult=dv=>(dv||[]).reduce((a,b)=>a*(b||1),1);
  const sizeBase=(ty,bt,st)=>st?8:isStr(bt)?(SD.get(bt.slice(7))||{size:0}).size:/char|bool/.test(ty)?1:/short/.test(ty)?2:/long|double/.test(ty)?8:4;
  const cv=e=>{if(!e)return null;switch(e.t){
    case 'num':return e.v;
    case 'un':{const x=cv(e.e);return x===null?null:e.op==='-'?-x:+!x}
    case 'cast':return cv(e.e);
    case 'bin':{const a=cv(e.l),b=cv(e.r);if(a===null||b===null)return null;return calc(e.op,a,b,!Number.isInteger(a)||!Number.isInteger(b))}
    case 'sizeof':{try{ty(e)}catch(x){return null}return e.v}
    default:return null}};
  const sc=[],nm=[],lab=()=>nm.length>1?nm.slice(1).join('.'):'global';
  const push=n=>{sc.push(new Map());nm.push(n)},pop=()=>{sc.pop();nm.pop()};
  const look=n=>{for(let i=sc.length-1;i>=0;i--)if(sc[i].has(n))return sc[i].get(n)};
  const isNull=n=>n.t==='num'&&n.v===0;
  const vtype=s=>TS(s.bt,s.stars+(s.dims?s.dims.length:0));
  const decl=(n,d,kind,init,node)=>{
    if(sc[sc.length-1].has(n))throw E(`'${n}' is already declared in this scope`,node);
    sc[sc.length-1].set(n,{ty:d.ty,bt:d.bt,stars:d.stars||0,dims:d.dims||null,kind,init,cst:!!d.cst});
    rows.push([n,d.ty+'*'.repeat(d.stars||0)+(d.dims?d.dims.map(x=>`[${x===null?'':x}]`).join(''):d.ad?'[]'.repeat(d.ad):''),kind,lab()])};
  const asgOK=(to,from,n,fn)=>{const nn=fn||n;
    if(isNumT(to)&&from==='char*')throw E(`cannot assign a string to a ${to} variable (use char name[] or char *name for text)`,n);
    if(from==='void')throw E('a void value is used where a value is needed',n);
    if(isStr(to)||isStr(from)){if(to!==from)throw E(`incompatible types: cannot convert ${from} to ${to}`,n);return}
    if(isNumT(to)&&isNumT(from)){if(to!=='float'&&to!=='bool'&&from==='float')notes.push(`line ${n.ln}: float value converted to ${to} (the fraction is lost)`);return}
    if(isPtr(to)&&isPtr(from)){if(to!==from&&to!=='void*'&&from!=='void*')notes.push(`line ${n.ln}: incompatible pointer types (${from} used as ${to})`);return}
    if(isPtr(to)&&isNumT(from)){if(isNull(nn))return;throw E(`cannot convert ${from} to a pointer (${to}); only 0 / NULL is allowed`,n)}
    if(isNumT(to)&&isPtr(from))throw E(`cannot convert pointer ${from} to ${to}`,n);
    throw E(`incompatible types: cannot convert ${from} to ${to}`,n)};
  const fspec=s=>[...s.matchAll(/%[-+ 0]*\d*(?:\.\d+)?(?:ll|hh|l|h)?([dicfsuxXep%])/g)].map(m=>m[1]).filter(c=>c!=='%');
  const dimAt=e=>{let d=0,b=e.b;while(b.t==='idx'){d++;b=b.b}if(b.t==='id'){const s=look(b.n);if(s&&s.dims&&s.dims[d]!=null)return s.dims[d]}return null};
  const ty=e=>{let t;switch(e.t){
    case 'num':t=e.ty;break;
    case 'str':t='char*';break;
    case 'id':{const s=look(e.n);if(!s)throw E(`'${e.n}' is not declared (declare it before using it)`,e);
      if(!s.dims&&!s.init&&s.kind==='var'&&!isStr(TS(s.bt,s.stars))){notes.push(`line ${e.ln}: '${e.n}' is used before it gets a value`);s.init=true}
      t=vtype(s);break}
    case 'un':{const a=ty(e.e);
      if(e.op==='!'){if(!isNumT(a)&&!isPtr(a))throw E(`operator '!' cannot be applied to ${a}`,e);t='bool'}
      else{if(!isNumT(a))throw E(`operator '-' cannot be applied to ${a}`,e);t=a==='float'?'float':'int'}break}
    case 'deref':{const a=ty(e.e);if(!isPtr(a))throw E(`cannot dereference a non-pointer (type ${a}); '*' needs a pointer`,e);if(a==='void*')throw E("cannot dereference a 'void *' pointer (cast it first)",e);t=a.slice(0,-1);break}
    case 'addr':{const a=ty(e.e);if(e.e.t==='id'){const s=look(e.e.n);if(s)s.init=true}t=a+'*';break}
    case 'idx':{const b=ty(e.b),i=ty(e.i);
      if(!isPtr(b))throw E(`subscripted value is not an array or pointer (type ${b})`,e);
      if(!isNumT(i)||i==='float')throw E('array subscript must be an integer',e);
      const iv=cv(e.i),dm=dimAt(e);if(iv!==null&&dm!==null&&(iv<0||iv>=dm))notes.push(`line ${e.ln}: index ${iv} is outside the array (size ${dm})`);
      t=b.slice(0,-1);break}
    case 'mem':{const b=ty(e.b);
      if(e.arrow){if(!(isPtr(b)&&isStr(b.slice(0,-1))))throw E(`'->' needs a pointer to a struct (type is ${b})`,e)}
      else if(!isStr(b))throw E(`'.' needs a struct value (type is ${b})${isPtr(b)&&isStr(b.slice(0,-1))?": use '->' for pointers":''}`,e);
      const sname=(e.arrow?b.slice(0,-1):b).slice(7),sd=SD.get(sname);if(!sd)throw E(`struct ${sname} is not defined`,e);
      const m=sd.members.find(x=>x.n===e.n);if(!m)throw E(`struct ${sname} has no member named '${e.n}'`,e);
      t=TS(m.bt,m.stars+m.dv.length);break}
    case 'incdec':{const a=ty(e.lv);if(!isNumT(a)&&!isPtr(a))throw E(`cannot apply ${e.op} to ${a}`,e);let r=e.lv;while(r.t==='idx'||r.t==='mem')r=r.b;
      if(r.t==='id'){const v=look(r.n);if(v&&v.cst)throw E(`cannot modify const variable '${r.n}'`,e);if(v&&v.dims&&e.lv.t==='id')throw E(`cannot modify array '${r.n}'`,e)}e.lt=a;t=a;break}
    case 'cast':{const a=ty(e.e),b=TS(e.bt,e.stars);if(isStr(a)||isStr(b)||a==='void')throw E(`cannot cast ${a} to ${b}`,e);t=b;break}
    case 'sizeof':{let n;
      if(e.e){const x=e.e;if(x.t==='id'){const s=look(x.n);if(s)n=sizeBase(s.ty,s.bt,s.stars)*mult(s.dims)}
        if(n===undefined){const tt=ty(x),st=(tt.match(/\*+$/)||[''])[0].length;n=sizeBase(tt,tt.replace(/\*+$/,''),st)}}
      else n=sizeBase(e.ty,e.bt,e.stars);
      Object.assign(e,{t:'num',v:n,ty:'int'});delete e.e;t='int';break}
    case 'tern':{const c=ty(e.c),a=ty(e.a),b=ty(e.b);if(!isNumT(c)&&!isPtr(c))throw E('the condition of ?: must be a number or pointer',e);
      if(isNumT(a)&&isNumT(b))t=a==='float'||b==='float'?'float':a;else if(a===b)t=a;else if(isPtr(a)&&isNull(e.b))t=a;else if(isPtr(b)&&isNull(e.a))t=b;
      else throw E(`the two results of ?: have different types (${a} and ${b})`,e);break}
    case 'bin':{const a=ty(e.l),b=ty(e.r),o=e.op,ok=x=>isNumT(x)||isPtr(x);
      if(o==='&&'||o==='||'){if(!ok(a)||!ok(b))throw E(`operator '${o}' cannot be applied to ${a} and ${b}`,e);t='bool'}
      else if(['<','>','<=','>='].includes(o)){if(!((isNumT(a)&&isNumT(b))||(isPtr(a)&&isPtr(b))))throw E(`cannot compare ${a} with ${b} using '${o}'`,e);t='bool'}
      else if(o==='=='||o==='!='){if(!((isNumT(a)&&isNumT(b))||(isPtr(a)&&isPtr(b))||(isPtr(a)&&isNull(e.r))||(isPtr(b)&&isNull(e.l))))throw E(`cannot compare ${a} with ${b}`,e);t='bool'}
      else if(o==='+'||o==='-'){
        if(isPtr(a)&&isNumT(b)&&b!=='float')t=a;
        else if(o==='+'&&isNumT(a)&&a!=='float'&&isPtr(b))t=b;
        else if(o==='-'&&isPtr(a)&&isPtr(b))t='int';
        else{if(!isNumT(a)||!isNumT(b))throw E(`operator '${o}' cannot be applied to ${a} and ${b}`,e);t=a==='float'||b==='float'?'float':'int'}}
      else{if(!isNumT(a)||!isNumT(b))throw E(`operator '${o}' cannot be applied to ${a} and ${b}`,e);
        if(o==='%'&&(a==='float'||b==='float'))throw E("operator '%' needs integer operands",e);
        if(cv(e.r)===0)throw E('division by zero',e);
        t=a==='float'||b==='float'?'float':'int'}
      break}
    case 'call':{const f=F.get(e.n);if(!f)throw E(`function '${e.n}' is not declared`,e);const as=e.args.map(ty);
      as.forEach(a=>{if(isStr(a)&&!f.user)throw E(`cannot pass a struct to ${e.n}`,e)});
      if(f.any){
        if(!as.length||as[0]!=='char*')throw E(`${e.n} needs a format string as its first argument`,e);
        const fs=e.args[0].t==='str'?(f.scan?[...e.args[0].v.matchAll(/%\*?(?:ll|hh|l|h)?([dicfsu])/g)].map(m=>m[1]):fspec(e.args[0].v)):null;
        if(fs){if(fs.length!==as.length-1)notes.push(`line ${e.ln}: ${e.n} has ${fs.length} format specifier(s) but ${as.length-1} argument(s)`);
          else fs.forEach((c,i)=>{const a=as[i+1];
            if(f.scan){if(!isPtr(a))throw E(`argument ${i+2} of scanf must be an address (like &x), not ${a}`,e);
              const want=c==='f'?'float*':c==='c'||c==='s'?'char*':'int*';if(a!==want&&a!=='void*'&&!(c==='f'&&a==='float*'))notes.push(`line ${e.ln}: %${c} expects ${want} but the argument is ${a}`)}
            else if('dicuxX'.includes(c)){if(a==='float')notes.push(`line ${e.ln}: %${c} expects an integer but the argument is a float`);else if(isPtr(a))notes.push(`line ${e.ln}: %${c} expects an integer but the argument is a pointer`)}
            else if(c==='f'||c==='e'){if(a!=='float')notes.push(`line ${e.ln}: %${c} expects a float/double but the argument is ${a}`)}
            else if(c==='s'&&a!=='char*')notes.push(`line ${e.ln}: %s expects a string (char *) but the argument is ${a}`)})}
        if(f.scan)as.slice(1).forEach((a,i)=>{if(!isPtr(a))throw E(`argument ${i+2} of scanf must be an address (like &x), not ${a}`,e)})}
      else{if(as.length!==f.ps.length)throw E(`function '${e.n}' expects ${f.ps.length} argument(s) but got ${as.length}`,e);
        as.forEach((a,i)=>{const p=f.ps[i];
          if(f.user)asgOK(p,a,e.args[i],e.args[i]);
          else if(p==='n'?!isNumT(a):p==='s'?(a!=='char*'&&a!=='void*'):!isPtr(a))throw E(`argument ${i+1} of '${e.n}' has the wrong type (${a})`,e)})}
      t=f.ret;break}}
    e.ty=t;return t};
  const cond=(e,n)=>{const t=ty(e);if(!isNumT(t)&&!isPtr(t))throw E(`condition must be a number, boolean or pointer, not ${t}`,n)};
  const initStruct=(I,st,n)=>{const ms=SD.get(st.slice(7)).members;
    if(I.items.length>ms.length)throw E(`too many initializers for ${st}`,n);
    I.items.forEach((x,i)=>{const m=ms[i],mt=TS(m.bt,m.stars);
      if(m.dv.length){
        if(x.t==='str'&&m.bt==='char'&&!m.stars&&m.dv.length===1){if(x.v.length+1>m.dv[0])notes.push(`line ${n.ln}: the string does not fit in member '${m.n}'`)}
        else if(x.t==='init'){if(x.items.length>m.dv[0])throw E(`too many initializers for member '${m.n}'`,n);x.items.forEach(y=>asgOK(mt,ty(y),n,y))}
        else throw E(`member '${m.n}' needs { } or a string`,n)}
      else if(isStr(mt)){if(x.t==='init')initStruct(x,mt,n);else asgOK(mt,ty(x),n,x)}
      else{if(x.t==='init')throw E(`unexpected { } for member '${m.n}'`,n);asgOK(mt,ty(x),n,x)}})};
  const initArr=(s,dv,et)=>{const I=s.init,an=s.n;
    if(I.t==='str'){if(dv.length!==1||et!=='char')throw E('only a char array can be initialised with a string',s);
      if(dv[0]===null)dv[0]=I.v.length+1;else if(I.v.length+1>dv[0])notes.push(`line ${s.ln}: the string "${I.v}" does not fit in ${an}[${dv[0]}]`);return}
    if(I.t!=='init')throw E(`array '${an}' must be initialised with { ... }`,s);
    if(dv[0]===null)dv[0]=I.items.length;
    if(I.items.length>dv[0])throw E(`too many initializers for '${an}[${dv[0]}]'`,s);
    const walk=(it,l)=>it.items.forEach(x=>{
      if(l<dv.length-1){
        if(x.t==='str'&&et==='char'&&l===dv.length-2){if(x.v.length+1>dv[l+1])notes.push(`line ${s.ln}: a string does not fit in ${an}`);return}
        if(x.t!=='init')throw E(`array '${an}' needs { } for each row`,s);
        if(x.items.length>dv[l+1])throw E(`too many initializers in a row of '${an}'`,s);walk(x,l+1)}
      else if(x.t==='init'){if(isStr(et))initStruct(x,et,s);else throw E(`too many braces for '${an}'`,s)}
      else asgOK(et,ty(x),s,x)});
    walk(I,0)};
  let cur=null,loops=0,sw=0;
  const sts=l=>l.forEach(x=>rec(()=>st(x)));
  const st=s=>{if(!s)return;switch(s.t){
    case 'decl':{let er=null,dv=null;const et=TS(s.bt,s.stars);
      try{
        if(s.bt==='void'&&!s.stars)throw E(`variable '${s.n}' cannot be of type void`,s);
        if(isStr(TS(s.bt,0))&&!SD.has(s.bt.slice(7)))throw E(`unknown type '${s.bt}' (define the struct before using it)`,s);
        if(s.dims){dv=s.dims.map((d,k)=>{if(d===null){if(k>0||!s.init)throw E(`array '${s.n}' needs a size`,s);return null}
            const v=cv(d);if(v===null||!Number.isInteger(v)||v<=0)throw E(`size of array '${s.n}' must be a positive integer constant`,s);return v});
          if(dv.length>2)throw E('only 1D and 2D arrays are supported',s)}
        if(s.init){
          if(dv)initArr(s,dv,et);
          else if(s.init.t==='init'){if(isStr(et))initStruct(s.init,et,s);else throw E(`'${s.n}' is not an array or struct, so { } cannot be used`,s)}
          else asgOK(et,ty(s.init),s,s.init)}
        else if(s.cst&&!dv)throw E(`const variable '${s.n}' must be initialised`,s)
      }catch(e){er=e}
      s.dv=dv;s.vt=dv?'array':kindOf(et);
      try{decl(s.n,{ty:s.ty,bt:s.bt,stars:s.stars,dims:dv,cst:s.cst},s.cst?'const':dv?'array':'var',!!s.init||!!dv||isStr(et),s)}catch(e){if(!er)er=e}
      if(er)throw er;break}
    case 'assign':{const l=s.lv;let lt;
      if(l.t==='id'){const v=look(l.n);if(!v)throw E(`'${l.n}' is not declared (declare it before using it)`,l);
        if(v.cst)throw E(`cannot assign to const variable '${l.n}'`,s);
        if(v.dims)throw E(`cannot assign to array '${l.n}' as a whole`,s);
        lt=TS(v.bt,v.stars);l.ty=lt;v.init=true}
      else{lt=ty(l);let r=l;while(r.t==='idx'||r.t==='mem')r=r.b;if(r.t==='id'){const v=look(r.n);if(v&&v.cst)throw E(`cannot assign to an element of const '${r.n}'`,s)}}
      const et=ty(s.full);asgOK(lt,et,s,s.op==='='?s.e:null);s.lt=lt;s.vt=kindOf(lt);break}
    case 'expr':ty(s.e);break;
    case 'block':if(s.flat)sts(s.b);else{push(nm[nm.length-1]+'.block');sts(s.b);pop()}break;
    case 'if':cond(s.c,s);push('if');rec(()=>st(s.a));pop();if(s.b){push('else');rec(()=>st(s.b));pop()}break;
    case 'while':cond(s.c,s);loops++;push('while');rec(()=>st(s.b));pop();loops--;break;
    case 'dowhile':loops++;push('do');rec(()=>st(s.b));pop();loops--;cond(s.c,s);break;
    case 'for':push('for');rec(()=>st(s.i));if(s.c)rec(()=>cond(s.c,s));rec(()=>st(s.u));loops++;rec(()=>st(s.b));loops--;pop();break;
    case 'switch':{const ct=ty(s.c);if(!isNumT(ct)||ct==='float')throw E('switch expression must be an integer or char',s);
      const seen=new Set();sw++;push('switch');
      s.cases.forEach(k=>{if(k.v){if(seen.has(k.v.v))rec(()=>{throw E(`duplicate case value ${k.v.v}`,k)});seen.add(k.v.v)}
        else{if(seen.has('d'))rec(()=>{throw E('more than one default label',k)});seen.add('d')}sts(k.body)});
      pop();sw--;break}
    case 'brk':case 'cont':if(s.t==='brk'?!(loops||sw):!loops)throw E(`'${s.t==='brk'?'break':'continue'}' used outside a loop${s.t==='brk'?' or switch':''}`,s);break;
    case 'ret':{const rt=cur.rt;s.cl=isStr(rt);
      if(rt==='void'){if(s.e)throw E('a void function cannot return a value',s)}
      else{if(!s.e)throw E(`function '${cur.n}' must return a value of type ${rt}`,s);asgOK(rt,ty(s.e),s,s.e)}}}};
  const hasRet=s=>{if(!s)return false;if(s.t==='ret')return true;if(s.cases)return s.cases.some(k=>k.body.some(hasRet));if(Array.isArray(s.b))return s.b.some(hasRet);return hasRet(s.a)||hasRet(s.b)};
  /* structs */
  for(const sd of P.structs)rec(()=>{const ms=[],seen=new Set();
    for(const m of sd.members){if(seen.has(m.n))throw E(`duplicate member '${m.n}' in struct ${sd.n}`,m);seen.add(m.n);
      if(m.bt==='void'&&!m.stars)throw E(`member '${m.n}' cannot be void`,m);
      if(isStr(m.bt)&&!m.stars&&!SD.has(m.bt.slice(7)))throw E(`member '${m.n}' has incomplete type '${m.bt}'`,m);
      const dv=m.dims.map(d=>{const v=cv(d);if(v===null||v<=0||!Number.isInteger(v))throw E(`size of member '${m.n}' must be a positive integer constant`,m);return v});
      ms.push({...m,dv})}
    SD.set(sd.n,{members:ms,size:0});SD.get(sd.n).size=ms.reduce((a,m)=>a+sizeBase(m.ty,m.bt,m.stars)*mult(m.dv),0);
    rows.push([`struct ${sd.n}`,`${ms.length} member(s)`,'type','global'])});
  /* functions */
  for(const f of P.funcs)rec(()=>{
    if(F.has(f.n)&&(F.get(f.n).user))throw E(`function '${f.n}' is defined twice`,f);
    if(f.n==='printf'||f.n==='scanf')throw E(`'${f.n}' is a standard library function and cannot be redefined`,f);
    f.rt=TS(f.bt,f.stars);
    F.set(f.n,{ret:f.rt,ps:f.params.map(q=>TS(q.bt,q.stars+q.ad)),user:1});
    rows.push([f.n,`${f.ty}${'*'.repeat(f.stars)}(${f.params.map(q=>q.ty+'*'.repeat(q.stars)+'[]'.repeat(q.ad)).join(', ')})`,'function','global'])});
  push('global');sc[0].set('stdin',{ty:'void',bt:'void',stars:1,dims:null,kind:'var',init:true});sts(P.globals);
  for(const f of P.funcs)rec(()=>{cur=f;push(f.n);
    for(const q of f.params)rec(()=>{if(q.bt==='void'&&!q.stars&&!q.ad)throw E(`parameter '${q.n}' cannot be void`,f);decl(q.n,{ty:q.ty,bt:q.bt,stars:q.stars+q.ad,dims:null},'param',true,f);rows[rows.length-1][1]=q.ty+'*'.repeat(q.stars)+'[]'.repeat(q.ad)});
    sts(f.body.b);
    if(f.rt!=='void'&&f.n!=='main'&&!hasRet(f.body))notes.push(`function '${f.n}' may end without returning a value`);pop()});
  if(!F.has('main')||!F.get('main').user)notes.push('there is no main() function');
  if(errs.length){const m=errs.slice(0,6);if(errs.length>6)m.push({kind:'Note',text:`... and ${errs.length-6} more error(s)`,ln:0});throw{multi:m}}
  P.SD=SD;
  return{rows,notes};
}

/* ---------- 4. Intermediate code (three-address code) ---------- */
function genTAC(P,naive){
  const o=[],lp=[],SD=P.SD;let tn_=0,ln=0;const T=()=>`t${++tn_}`,L=()=>`L${++ln}`,fl=n=>n.ty==='float';
  const fmt=e=>e.ty==='float'?(Number.isInteger(e.v)?e.v.toFixed(1):String(e.v)):e.ty==='char'?`'${JSON.stringify(String.fromCharCode(e.v)).slice(1,-1)}'`:String(e.v);
  const ctOf=t=>t==='int'||t==='char'||t==='bool'?'int':null;
  const DIRECT=e=>['un','idx','mem','deref','call','addr'].includes(e.t)||(e.t==='bin'&&e.op!=='&&'&&e.op!=='||');
  const ex=(e,d)=>{switch(e.t){
    case 'num':return fmt(e);case 'str':return JSON.stringify(e.v);case 'id':return e.n;
    case 'un':{const a=ex(e.e),r=d||T();o.push({k:'un',r,op:e.op,a});return r}
    case 'bin':{
      if(e.op==='&&'||e.op==='||'){const r=T(),le=L(),and=e.op==='&&',k=and?'ifF':'ifT';
        o.push({k:'copy',r,a:and?'0':'1'});const a=ex(e.l);o.push({k,a,l:le});const b=ex(e.r);o.push({k,a:b,l:le},{k:'copy',r,a:and?'1':'0'},{k:'label',l:le});return r}
      const a=ex(e.l),b=ex(e.r),r=d||T();o.push({k:'bin',r,a,op:e.op,b,f:fl(e.l)||fl(e.r)});return r}
    case 'tern':{const r=T(),lf=L(),le=L(),c=ex(e.c);o.push({k:'ifF',a:c,l:lf});const a=ex(e.a);o.push({k:'copy',r,a},{k:'goto',l:le},{k:'label',l:lf});
      const b=ex(e.b);o.push({k:'copy',r,a:b},{k:'label',l:le});return r}
    case 'cast':{const a=ex(e.e);if(isPtr(e.ty)||isPtr(e.e.ty)||e.ty==='void'||e.ty===e.e.ty)return a;const r=T();o.push({k:'cast',r,a,to:e.ty});return r}
    case 'idx':{const a=ex(e.b),i=ex(e.i),r=d||T();o.push({k:'aload',r,a,i});return r}
    case 'mem':{const a=ex(e.b),r=d||T();o.push({k:'mload',r,a,f:e.n,arrow:e.arrow});return r}
    case 'deref':{const a=ex(e.e),r=d||T();o.push({k:'dload',r,a});return r}
    case 'addr':{const x=e.e,r=d||T();
      if(x.t==='id')o.push({k:'ref',r,kind:'var',a:x.n});
      else if(x.t==='idx'){const a=ex(x.b),i=ex(x.i);o.push({k:'ref',r,kind:'idx',a,i})}
      else if(x.t==='mem'){const a=ex(x.b);o.push({k:'ref',r,kind:'mem',a,f:x.n,arrow:x.arrow})}
      else o.push({k:'copy',r,a:ex(x.e)});
      return r}
    case 'incdec':{const l=e.lv,op=e.op==='++'?'+':'-',ct=ctOf(e.lt),f=e.lt==='float';
      if(l.t==='id'){let old=null;if(!e.pre){old=T();o.push({k:'copy',r:old,a:l.n})}o.push({k:'bin',r:l.n,a:l.n,op,b:'1',f,ct});return e.pre?l.n:old}
      const cur=ex(l);let old=null;if(!e.pre){old=T();o.push({k:'copy',r:old,a:cur})}const nv=T();o.push({k:'bin',r:nv,a:cur,op,b:'1',f});store(l,nv,e.lt);return e.pre?nv:old}
    case 'call':{const as=e.args.map(a=>ex(a));as.forEach((a,i)=>o.push({k:'param',a,cl:isStr(e.args[i].ty)}));
      const r=d===null?null:(d||T());o.push({k:'call',r,f:e.n,n:as.length});return r}}};
  const asgId=(n,lt,e)=>{const ct=ctOf(lt);
    if(!naive&&DIRECT(e)){ex(e,n);o[o.length-1].ct=ct}else{const a=ex(e);o.push({k:'copy',r:n,a,ct,cl:isStr(lt)})}};
  const store=(l,v,lt)=>{const ct=ctOf(lt),cl=isStr(lt);
    if(l.t==='id')o.push({k:'copy',r:l.n,a:v,ct,cl});
    else if(l.t==='idx'){const a=ex(l.b),i=ex(l.i);o.push({k:'astore',a,i,v,ct,cl})}
    else if(l.t==='mem'){const a=ex(l.b);o.push({k:'mstore',a,f:l.n,arrow:l.arrow,v,ct,cl})}
    else{const a=ex(l.e);o.push({k:'dstore',a,v,ct,cl})}};
  const fill=(ref,t,item)=>{const dims=t.dims||[];
    if(dims.length){
      if(item.t==='str'){o.push({k:'sinit',a:ref,s:JSON.stringify(item.v)});return}
      const et={bt:t.bt,stars:t.stars,dims:dims.slice(1)};
      item.items.forEach((x,i)=>{const scalar=!et.dims.length&&!(isStr(et.bt)&&!et.stars);
        if((scalar||x.t!=='init')&&!(x.t==='str'&&et.dims.length)){const ety=TS(et.bt,et.stars);o.push({k:'astore',a:ref,i:String(i),v:ex(x),ct:ctOf(ety),cl:isStr(ety)})}
        else{const r=T();o.push({k:'aload',r,a:ref,i:String(i)});fill(r,et,x)}})}
    else{const sd=SD.get(t.bt.slice(7));
      item.items.forEach((x,i)=>{const m=sd.members[i],mt={bt:m.bt,stars:m.stars,dims:m.dv},mty=TS(m.bt,m.stars);
        if((!m.dv.length&&!isStr(mty))||(x.t!=='init'&&!(x.t==='str'&&m.dv.length)))o.push({k:'mstore',a:ref,f:m.n,arrow:false,v:ex(x),ct:ctOf(mty),cl:isStr(mty)});
        else{const r=T();o.push({k:'mload',r,a:ref,f:m.n,arrow:false});fill(r,mt,x)}})}};
  const g=s=>{if(!s)return;switch(s.t){
    case 'decl':{const ety=TS(s.bt,s.stars);
      if(s.dv||isStr(ety)){
        if(!s.dv&&s.init&&s.init.t!=='init'){o.push({k:'copy',r:s.n,a:ex(s.init),cl:true});break}
        o.push({k:'alloc',a:s.n,dv:s.dv||[],bt:s.bt,stars:s.stars});
        if(s.init)fill(s.n,{bt:s.bt,stars:s.stars,dims:s.dv||[]},s.init)}
      else if(s.init)asgId(s.n,ety,s.init);
      break}
    case 'assign':if(s.lv.t==='id')asgId(s.lv.n,s.lt,s.full);else{const v=ex(s.full);store(s.lv,v,s.lt)}break;
    case 'expr':ex(s.e,s.e.t==='call'?null:undefined);break;
    case 'block':s.b.forEach(g);break;
    case 'ret':o.push({k:'ret',a:s.e?ex(s.e):null,cl:s.cl});break;
    case 'brk':o.push({k:'goto',l:lp[lp.length-1].b});break;
    case 'cont':o.push({k:'goto',l:lp[lp.length-1].c});break;
    case 'if':{const c=ex(s.c),lf=L();o.push({k:'ifF',a:c,l:lf});g(s.a);
      if(s.b){const le=L();o.push({k:'goto',l:le},{k:'label',l:lf});g(s.b);o.push({k:'label',l:le})}else o.push({k:'label',l:lf});break}
    case 'while':{const a=L(),b=L();o.push({k:'label',l:a});const c=ex(s.c);o.push({k:'ifF',a:c,l:b});lp.push({b,c:a});g(s.b);lp.pop();o.push({k:'goto',l:a},{k:'label',l:b});break}
    case 'dowhile':{const a=L(),u=L(),b=L();o.push({k:'label',l:a});lp.push({b,c:u});g(s.b);lp.pop();o.push({k:'label',l:u});const c=ex(s.c);o.push({k:'ifF',a:c,l:b},{k:'goto',l:a},{k:'label',l:b});break}
    case 'switch':{const c=ex(s.c),end=L(),ls=s.cases.map(()=>L());let dl=null;
      s.cases.forEach((k,i)=>{if(k.v){const t=T();o.push({k:'bin',r:t,a:c,op:'!=',b:fmt(k.v),f:false},{k:'ifF',a:t,l:ls[i]})}else dl=ls[i]});
      o.push({k:'goto',l:dl||end});lp.push({b:end,c:lp.length?lp[lp.length-1].c:null});
      s.cases.forEach((k,i)=>{o.push({k:'label',l:ls[i]});k.body.forEach(g)});lp.pop();o.push({k:'label',l:end});break}
    case 'for':{const a=L(),u=L(),b=L();g(s.i);o.push({k:'label',l:a});if(s.c){const c=ex(s.c);o.push({k:'ifF',a:c,l:b})}
      lp.push({b,c:u});g(s.b);lp.pop();o.push({k:'label',l:u});g(s.u);o.push({k:'goto',l:a},{k:'label',l:b})}}};
  for(const sd of P.structs){const ms=SD.get(sd.n).members;o.push({k:'struct',n:sd.n,members:ms.map(m=>({n:m.n,bt:m.bt,stars:m.stars,dv:m.dv}))})}
  if(P.globals.length){o.push({k:'fn',f:'__init',params:[]});P.globals.forEach(g);o.push({k:'ret',a:null})}
  for(const f of P.funcs){o.push({k:'fn',f:f.n,params:f.params});f.body.b.forEach(g);
    const l=o[o.length-1];if(!l||l.k!=='ret')o.push({k:'ret',a:f.n==='main'?'0':null})}
  return o;
}
const fi=i=>{const ix=x=>x;switch(i.k){
  case 'struct':return `struct ${i.n} { ${i.members.map(m=>m.n+m.dv.map(d=>`[${d}]`).join('')).join(', ')} }`;
  case 'fn':return `func ${i.f}(${i.params.map(p=>p.n).join(', ')}):`;
  case 'label':return i.l+':';case 'goto':return '  goto '+i.l;
  case 'ifF':return `  ifFalse ${i.a} goto ${i.l}`;case 'ifT':return `  ifTrue ${i.a} goto ${i.l}`;
  case 'param':return '  param '+i.a;case 'call':return `  ${i.r?i.r+' = ':''}call ${i.f}, ${i.n}`;
  case 'ret':return '  return'+(i.a!=null?' '+i.a:'');
  case 'bin':return `  ${i.r} = ${i.a} ${i.op} ${i.b}`;case 'un':return `  ${i.r} = ${i.op}${i.a}`;case 'copy':return `  ${i.r} = ${i.a}`;
  case 'cast':return `  ${i.r} = (${i.to}) ${i.a}`;
  case 'alloc':return `  alloc ${i.a}${i.dv.map(x=>`[${x}]`).join('')}${i.bt.startsWith('struct ')&&!i.stars?' : '+i.bt:''}`;
  case 'sinit':return `  init ${i.a} = ${i.s}`;
  case 'aload':return `  ${i.r} = ${i.a}[${i.i}]`;case 'astore':return `  ${i.a}[${i.i}] = ${i.v}`;
  case 'mload':return `  ${i.r} = ${i.a}${i.arrow?'->':'.'}${i.f}`;case 'mstore':return `  ${i.a}${i.arrow?'->':'.'}${i.f} = ${i.v}`;
  case 'dload':return `  ${i.r} = *${i.a}`;case 'dstore':return `  *${i.a} = ${i.v}`;
  case 'ref':return `  ${i.r} = &${i.kind==='var'?i.a:i.kind==='idx'?`${i.a}[${i.i}]`:`${i.a}${i.arrow?'->':'.'}${i.f}`}`}};
const tacText=c=>c.map(fi).join('\n')||'(no instructions)';

/* ---------- 5. Optimization (on the AST, then the IR is generated again) ---------- */
let OS;
const lg=(k,t)=>{if(OS.log.length<150)OS.log.push({k,t})};
const exTxt=e=>{switch(e.t){case 'num':case 'str':return litTxt(e);case 'id':return e.n;case 'un':return e.op+exTxt(e.e);
  case 'bin':{const w=x=>x.t==='bin'&&prc(x)<prc(e)?`(${exTxt(x)})`:exTxt(x);return `${w(e.l)} ${e.op} ${w(e.r)}`}
  case 'call':return e.n+'('+e.args.map(exTxt).join(', ')+')';case 'idx':return exTxt(e.b)+'['+exTxt(e.i)+']';
  case 'mem':return exTxt(e.b)+(e.arrow?'->':'.')+e.n;case 'deref':return '*'+exTxt(e.e);case 'addr':return '&'+exTxt(e.e);
  case 'cast':return `(${e.ty}) ${exTxt(e.e)}`;case 'tern':return `${exTxt(e.c)} ? ${exTxt(e.a)} : ${exTxt(e.b)}`;
  case 'incdec':return e.pre?e.op+exTxt(e.lv):exTxt(e.lv)+e.op;default:return '…'}};
const num=(v,ty)=>({t:'num',v,ty});
const conv=(n,vt)=>{if(n.t!=='num')return n;if(vt==='int'&&n.ty==='float')return num(Math.trunc(n.v),'int');if(vt==='float'&&n.ty!=='float')return num(n.v,'float');return n};
const fold=(e,env)=>{switch(e.t){
  case 'num':case 'str':case 'sizeof':return e;
  case 'id':if(env.has(e.n)){OS.prop++;lg('prop',`${e.n} → ${litTxt(env.get(e.n))}`);return env.get(e.n)}return e;
  case 'un':{const x=fold(e.e,env);if(x.t==='num'){OS.fold++;const r=num(e.op==='-'?-x.v:+!x.v,e.ty);lg('fold',`${e.op}${litTxt(x)} → ${litTxt(r)}`);return r}return{...e,e:x}}
  case 'cast':{const x=fold(e.e,env);if(x.t==='num'&&isNumT(e.ty)){OS.fold++;const r=num(e.ty==='float'?x.v:Math.trunc(x.v),e.ty);lg('fold',`(${e.ty}) ${litTxt(x)} → ${litTxt(r)}`);return r}return{...e,e:x}}
  case 'call':return{...e,args:e.args.map(a=>fold(a,env))};
  case 'incdec':if(e.lv.t==='id'){env.delete(e.lv.n);return e}return{...e,lv:fold(e.lv,env)};
  case 'idx':return{...e,b:fold(e.b,env),i:fold(e.i,env)};
  case 'mem':return{...e,b:fold(e.b,env)};
  case 'deref':return{...e,e:fold(e.e,env)};
  case 'addr':return e.e.t==='id'?e:{...e,e:fold(e.e,env)};
  case 'tern':{const c=fold(e.c,env);if(c.t==='num'){OS.fold++;lg('fold',`${litTxt(c)} ? … : … → the ${c.v?'first':'second'} choice`);return fold(c.v?e.a:e.b,env)}return{...e,c,a:fold(e.a,env),b:fold(e.b,env)}}
  case 'bin':{const l=fold(e.l,env);
    if(e.op==='&&'&&l.t==='num'&&!l.v){OS.fold++;lg('fold','0 && … → 0 (the right side never runs)');return num(0,'bool')}
    if(e.op==='||'&&l.t==='num'&&l.v){OS.fold++;lg('fold','1 || … → 1 (the right side never runs)');return num(1,'bool')}
    const r=fold(e.r,env),f=l.ty==='float'||r.ty==='float';
    if(l.t==='num'&&r.t==='num'){const v=calc(e.op,l.v,r.v,f);if(v!==null){OS.fold++;const rr=num(v,e.ty);lg('fold',`${exTxt(l)} ${e.op} ${exTxt(r)} → ${litTxt(rr)}`);return rr}}
    if(e.op==='+'&&r.t==='num'&&r.v===0&&l.ty===e.ty){OS.alg++;lg('alg',`${exTxt(l)} + 0 → ${exTxt(l)}`);return l}
    if(e.op==='+'&&l.t==='num'&&l.v===0&&r.ty===e.ty){OS.alg++;lg('alg',`0 + ${exTxt(r)} → ${exTxt(r)}`);return r}
    if(e.op==='*'&&r.t==='num'&&r.v===1&&l.ty===e.ty){OS.alg++;lg('alg',`${exTxt(l)} * 1 → ${exTxt(l)}`);return l}
    if(e.op==='*'&&l.t==='num'&&l.v===1&&r.ty===e.ty){OS.alg++;lg('alg',`1 * ${exTxt(r)} → ${exTxt(r)}`);return r}
    return{...e,l,r}}}};
const asgn=(s,set=new Set())=>{if(!s)return set;
  if(s.t==='decl')set.add(s.n);if(s.t==='assign'&&s.lv.t==='id')set.add(s.lv.n);
  if(Array.isArray(s.b))s.b.forEach(x=>asgn(x,set));else asgn(s.b,set);asgn(s.a,set);asgn(s.i,set);asgn(s.u,set);
  if(s.cases)s.cases.forEach(k=>k.body.forEach(x=>asgn(x,set)));return set};
const optInit=(i,env)=>i.t==='init'?{...i,items:i.items.map(x=>optInit(x,env))}:fold(i,env);
const findAddr=(n,set)=>{if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(x=>findAddr(x,set));return}
  if(n.t==='addr'&&n.e&&n.e.t==='id')set.add(n.e.n);if(n.t==='incdec'&&n.lv.t==='id')set.add(n.lv.n);for(const k in n)if(n[k]&&typeof n[k]==='object')findAddr(n[k],set)};
const PROP=new Set(['int','float','bool']);
function optList(list,env){const out=[];
  for(let ix=0;ix<list.length;ix++){const s=list[ix],r=optS(s,env);if(r)out.push(r);
    if((s.t==='ret'||s.t==='brk'||s.t==='cont')&&ix<list.length-1){OS.dead++;lg('dead','code after return / break / continue can never run, so it is removed');break}}
  return out}
function optS(s,env){switch(s.t){
  case 'decl':{if(s.dv||s.vt==='struct'){env.delete(s.n);return s.init?{...s,init:optInit(s.init,env)}:s}
    if(!s.init){env.delete(s.n);return s}const e=conv(fold(s.init,env),s.vt);
    if(e.t==='num'&&PROP.has(s.vt)&&!OS.G.has(s.n)&&!OS.V.has(s.n))env.set(s.n,e);else env.delete(s.n);return{...s,init:e}}
  case 'assign':{const l=s.lv,e=conv(fold(s.full,env),s.vt);
    if(l.t==='id'){if(e.t==='num'&&PROP.has(s.vt)&&!OS.G.has(l.n)&&!OS.V.has(l.n))env.set(l.n,e);else env.delete(l.n);return{...s,op:'=',show:'=',e,full:e}}
    return{...s,lv:fold(l,env),op:'=',show:'=',e,full:e}}
  case 'expr':return{...s,e:fold(s.e,env)};
  case 'ret':return{...s,e:s.e&&fold(s.e,env)};
  case 'block':{const o=optList(s.b,s.flat?env:new Map(env));if(!s.flat)asgn(s).forEach(n=>env.delete(n));return{...s,b:o}}
  case 'if':{const c=fold(s.c,env);
    if(c.t==='num'){OS.dead++;lg('dead',`if (${litTxt(c)}) is always ${c.v?'true: only the then-part stays':'false: the then-part is removed'}`);const br=c.v?s.a:s.b;return br?optS(br.t==='block'?{...br,flat:true}:br,env):null}
    const a=optS(s.a,new Map(env)),b=s.b?optS(s.b,new Map(env)):null;asgn(s).forEach(n=>env.delete(n));return{...s,c,a,b}}
  case 'while':{asgn(s).forEach(n=>env.delete(n));const c=fold(s.c,env);if(c.t==='num'&&!c.v){OS.dead++;lg('dead','while (0) never runs, so the loop is removed');return null}
    return{...s,c,b:optS(s.b,new Map(env))}}
  case 'dowhile':{asgn(s).forEach(n=>env.delete(n));return{...s,c:fold(s.c,new Map()),b:optS(s.b,new Map(env))}}
  case 'switch':{asgn(s).forEach(n=>env.delete(n));const c=fold(s.c,env);return{...s,c,cases:s.cases.map(k=>({...k,body:optList(k.body,new Map(env))}))}}
  case 'for':{const i=s.i?optS(s.i,env):null;asgn(s).forEach(n=>env.delete(n));const c=s.c?fold(s.c,env):null;
    if(c&&c.t==='num'&&!c.v){OS.dead++;lg('dead','for-loop condition is always false, so the loop is removed');return i}
    return{...s,i,c,u:s.u?optS(s.u,new Map()):null,b:optS(s.b,new Map(env))}}
  default:return s}}
function optimize(P){
  OS={log:[],fold:0,prop:0,alg:0,dead:0,G:new Set(P.globals.map(g=>g.n)),V:new Set()};findAddr(P,OS.V);
  const globals=P.globals.map(g=>({...g,init:g.init&&(g.dv||g.vt==='struct'?optInit(g.init,new Map()):conv(fold(g.init,new Map()),g.vt))}));
  const funcs=P.funcs.map(f=>({...f,body:{...f.body,b:optList(f.body.b,new Map())}}));
  return{...P,globals,funcs};
}

/* ---------- 6. Code generation (IR -> assembly-like code) ---------- */
function asm(code){
  const o=[],D=[],S=new Map(),OP={'+':'ADD','-':'SUB','*':'MUL','/':'DIV','%':'MOD','&&':'AND','||':'OR'},CM={'<':'SETLT','>':'SETGT','<=':'SETLE','>=':'SETGE','==':'SETEQ','!=':'SETNE'};
  const I=(m,x)=>o.push('  '+m.padEnd(6)+x),sid=s=>{if(!S.has(s)){S.set(s,'str'+S.size);D.push(`${S.get(s)}: .string ${s}`)}return S.get(s)};
  const ld=(r,x)=>{if(x[0]==='"')I('LOAD',`${r}, =${sid(x)}`);else if(/^-?\d/.test(x)||x[0]==="'")I('MOV',`${r}, #${x}`);else I('LOAD',`${r}, [${x}]`)};
  const sv=r=>I('STORE',`[${r}], R0`);
  for(const i of code){switch(i.k){
    case 'struct':o.push(`; struct ${i.n} { ${i.members.map(m=>m.n).join(', ')} }`);break;
    case 'fn':o.push(i.f+':');I('PUSH','BP');break;
    case 'label':o.push(i.l+':');break;
    case 'goto':I('JMP',i.l);break;
    case 'ifF':ld('R0',i.a);I('CMP','R0, #0');I('JE',i.l);break;
    case 'ifT':ld('R0',i.a);I('CMP','R0, #0');I('JNE',i.l);break;
    case 'bin':ld('R0',i.a);ld('R1',i.b);if(CM[i.op]){I('CMP','R0, R1');I(CM[i.op],'R0')}else I(OP[i.op],'R0, R1');sv(i.r);break;
    case 'un':ld('R0',i.a);I(i.op==='-'?'NEG':'NOT','R0');sv(i.r);break;
    case 'copy':ld('R0',i.a);sv(i.r);break;
    case 'cast':ld('R0',i.a);I(i.to==='float'?'CVTIF':'CVTFI','R0');sv(i.r);break;
    case 'param':ld('R0',i.a);I('PUSH','R0');break;
    case 'call':I('CALL',i.f);if(i.n)I('ADD',`SP, #${i.n}`);if(i.r)sv(i.r);break;
    case 'alloc':I('ALLOC',`${i.a}, #${i.dv.reduce((a,b)=>a*b,1)}${i.bt.startsWith('struct ')?'  ; '+i.bt:''}`);break;
    case 'sinit':I('STRCPY',`${i.a}, =${sid(i.s)}`);break;
    case 'aload':ld('R1',i.a);ld('R2',i.i);I('LOAD','R0, [R1+R2]');sv(i.r);break;
    case 'astore':ld('R1',i.a);ld('R2',i.i);ld('R0',i.v);I('STORE','[R1+R2], R0');break;
    case 'mload':ld('R1',i.a);I('LOAD',`R0, [R1].${i.f}`);sv(i.r);break;
    case 'mstore':ld('R1',i.a);ld('R0',i.v);I('STORE',`[R1].${i.f}, R0`);break;
    case 'dload':ld('R1',i.a);I('LOAD','R0, [R1]');sv(i.r);break;
    case 'dstore':ld('R1',i.a);ld('R0',i.v);I('STORE','[R1], R0');break;
    case 'ref':if(i.kind==='var')I('LEA',`R0, [${i.a}]`);else if(i.kind==='idx'){ld('R1',i.a);ld('R2',i.i);I('LEA','R0, [R1+R2]')}else{ld('R1',i.a);I('LEA',`R0, [R1].${i.f}`)}sv(i.r);break;
    case 'ret':if(i.a!=null)ld('R0',i.a);I('POP','BP');I('RET','')}}
  return (D.length?'.data\n'+D.join('\n')+'\n':'')+'.text\n'+o.join('\n');
}

/* ---------- 7. Execution of the optimized IR ---------- */
class Ptr{constructor(o,k){this.o=o;this.k=k}}
function execute(code,stdin){
  const fns={},lab={},SDV={},G=Object.create(null),inp=stdin||'';let out='',steps=0,ip=0,eof=false;
  code.forEach((i,ix)=>{if(i.k==='fn')fns[i.f]={ix,params:i.params};else if(i.k==='label')lab[i.l]=ix;else if(i.k==='struct')SDV[i.n]=i.members});
  const RE=text=>({kind:'Runtime error',text});
  const P=v=>Array.isArray(v)?new Ptr(v,0):v;
  const chkP=(p,w)=>{if(!(p instanceof Ptr))throw RE(p===0||p===undefined?`${w||'dereference'} of a NULL pointer (segmentation fault)`:`${w||'dereference'} of an invalid pointer`);return p};
  const bad=(o,k)=>{if(Array.isArray(o)&&(k<0||k>=o.length))throw RE(`array index out of bounds (index ${k}, size ${o.length})`)};
  const rd=p=>{p=chkP(P(p));bad(p.o,p.k);const v=p.o[p.k];return v===undefined?0:v};
  const wr=(p,v)=>{p=chkP(P(p));bad(p.o,p.k);p.o[p.k]=v};
  const padd=(p,n)=>{p=chkP(P(p),'pointer arithmetic on');if(typeof p.k==='string'){if(n!==0)throw RE('pointer arithmetic is only allowed on arrays');return p}return new Ptr(p.o,p.k+n)};
  const cstr=v=>{const p=P(v);if(!(p instanceof Ptr))return '(null)';const a=p.o;if(!Array.isArray(a))return '';let s='';for(let q=p.k;q<a.length&&a[q]!==0;q++)s+=String.fromCharCode(a[q]);return s};
  const wstr=(dst,s)=>{const p=chkP(P(dst)),a=p.o;if(!Array.isArray(a)||p.k+s.length+1>a.length)throw RE('buffer overflow: the destination array is too small');
    for(let q=0;q<s.length;q++)a[p.k+q]=s.charCodeAt(q);a[p.k+s.length]=0};
  const clone=v=>{if(Array.isArray(v))return v.map(clone);if(v instanceof Ptr||v===null||typeof v!=='object')return v;const o=Object.create(null);for(const k in v)o[k]=clone(v[k]);return o};
  const mkv=(bt,st,dv,q)=>{q=q||0;if(dv&&q<dv.length)return Array.from({length:dv[q]},()=>mkv(bt,st,dv,q+1));if(st)return 0;
    if(bt.startsWith('struct ')){const o=Object.create(null);for(const m of SDV[bt.slice(7)])o[m.n]=mkv(m.bt,m.stars,m.dv);return o}return 0};
  const SL=new Map(),lit=s=>{if(!SL.has(s)){const a=[...s].map(c=>c.charCodeAt(0));a.push(0);SL.set(s,a)}return new Ptr(SL.get(s),0)};
  const val=(fr,s)=>{const c=s[0];if(c==='"')return lit(JSON.parse(s));
    if(c==="'"){const q=s.slice(1,-1);return (q.length>1?JSON.parse('"'+q+'"'):q).charCodeAt(0)}
    if(/^-?\d/.test(s))return parseFloat(s);return s in fr?fr[s]:(s in G?G[s]:0)};
  const pbin=(op,a,b)=>{const pa=P(a),pb=P(b),is=x=>x instanceof Ptr;
    switch(op){case '+':return is(pa)?padd(pa,Math.trunc(pb)):padd(pb,Math.trunc(pa));
      case '-':return is(pb)?(pa.k-pb.k):padd(pa,-Math.trunc(pb));
      case '==':case '!=':{const eq=is(pa)&&is(pb)?(pa.o===pb.o&&pa.k===pb.k):pa===pb;return +(op==='=='?eq:!eq)}
      default:return calc(op,is(pa)?pa.k:pa,is(pb)?pb.k:pb,false)}};
  const fmtp=a=>{let k=1;return cstr(a[0]).replace(/%([-+ 0]*)(\d+)?(?:\.(\d+))?(?:ll|hh|l|h)?([dicfsuxXep%])/g,(m,fl,w,p,c)=>{if(c==='%')return '%';
    let v=a[k++];if(typeof v!=='number'&&c!=='s'&&c!=='p')v=0;let s;
    switch(c){case 'f':s=Number(v).toFixed(p===undefined?6:+p);break;
      case 'e':s=Number(v).toExponential(p===undefined?6:+p).replace(/e([+-])(\d)$/,'e$10$2');break;
      case 'c':s=String.fromCharCode(v);break;case 's':s=cstr(v);if(p!==undefined)s=s.slice(0,+p);break;
      case 'x':s=(Math.trunc(v)>>>0).toString(16);break;case 'X':s=(Math.trunc(v)>>>0).toString(16).toUpperCase();break;
      case 'p':s=v instanceof Ptr?'0x'+(0x7ffc1000+(typeof v.k==='number'?v.k*4:0)).toString(16):'(nil)';break;
      default:s=String(Math.trunc(v))}
    if(w&&s.length<+w){const n=+w;s=fl.includes('-')?s.padEnd(n):(fl.includes('0')&&'difu'.includes(c))?(s[0]==='-'?'-'+s.slice(1).padStart(n-1,'0'):s.padStart(n,'0')):s.padStart(n)}
    return s})};
  const scan=a=>{const f=cstr(a[0]);let n=0,k=1;
    for(let q=0;q<f.length;q++){const ch=f[q];
      if(/\s/.test(ch)){while(ip<inp.length&&/\s/.test(inp[ip]))ip++;continue}
      if(ch!=='%'){if(inp[ip]===ch)ip++;else break;continue}
      q++;if(f[q]==='%'){if(inp[ip]==='%')ip++;else break;continue}
      while(f[q]==='l'||f[q]==='h')q++;
      const c=f[q],tg=a[k++];
      if(c==='c'){if(ip>=inp.length){eof=true;break}wr(tg,inp.charCodeAt(ip++));n++;continue}
      while(ip<inp.length&&/\s/.test(inp[ip]))ip++;
      if(ip>=inp.length){eof=true;break}
      if(c==='s'){const s0=ip;while(ip<inp.length&&!/\s/.test(inp[ip]))ip++;wstr(tg,inp.slice(s0,ip));n++;continue}
      const m=(c==='f'?/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/:/^[+-]?\d+/).exec(inp.slice(ip));if(!m)break;
      ip+=m[0].length;wr(tg,c==='f'?parseFloat(m[0]):parseInt(m[0],10));n++}
    return n};
  const cvv=(v,i)=>{if(i.cl)v=clone(v);if(i.ct==='int'&&typeof v==='number')v=Math.trunc(v);return v};
  function run(name,args,depth){
    if(depth>1000)throw RE('stack overflow (infinite recursion?)');
    const f=fns[name],fr=name==='__init'?G:Object.create(null),pend=[];f.params.forEach((q,i)=>{fr[q.n]=args[i]});
    const get=s=>val(fr,s),set=(n,v,ct)=>{if(ct==='int'&&typeof v==='number')v=Math.trunc(v);if(n in fr||!(n in G))fr[n]=v;else G[n]=v};
    let pc=f.ix+1;
    while(1){
      if(++steps>3000000)throw RE('too many steps (possible infinite loop)');
      const i=code[pc];if(!i||i.k==='fn')return 0;
      switch(i.k){
        case 'bin':{const a=get(i.a),b=get(i.b);const v=typeof a==='number'&&typeof b==='number'?calc(i.op,a,b,i.f):pbin(i.op,a,b);
          if(v===null)throw RE('division by zero');set(i.r,v,i.ct);break}
        case 'un':{const a=get(i.a);set(i.r,i.op==='-'?-a:+!a,i.ct);break}
        case 'cast':{const a=get(i.a);set(i.r,i.to==='float'?a:i.to==='char'?((Math.trunc(a)+128)%256+256)%256-128:Math.trunc(a));break}
        case 'copy':set(i.r,cvv(get(i.a),i));break;
        case 'alloc':set(i.a,mkv(i.bt,i.stars,i.dv));break;
        case 'sinit':{const p=P(get(i.a)),s=JSON.parse(i.s),a=p.o;for(let q=p.k;q<a.length;q++)a[q]=q-p.k<s.length?s.charCodeAt(q-p.k):0;break}
        case 'aload':set(i.r,rd(padd(get(i.a),Math.trunc(get(i.i)))),i.ct);break;
        case 'astore':wr(padd(get(i.a),Math.trunc(get(i.i))),cvv(get(i.v),i));break;
        case 'mload':{const ob=i.arrow?rd(get(i.a)):get(i.a);if(!ob||typeof ob!=='object')throw RE('invalid struct access');set(i.r,ob[i.f],i.ct);break}
        case 'mstore':{const ob=i.arrow?rd(get(i.a)):get(i.a);if(!ob||typeof ob!=='object')throw RE('invalid struct access');ob[i.f]=cvv(get(i.v),i);break}
        case 'dload':set(i.r,rd(get(i.a)),i.ct);break;
        case 'dstore':wr(get(i.a),cvv(get(i.v),i));break;
        case 'ref':{let v;
          if(i.kind==='var'){if(!(i.a in fr)&&!(i.a in G))fr[i.a]=0;v=new Ptr(i.a in fr?fr:G,i.a)}
          else if(i.kind==='idx')v=padd(get(i.a),Math.trunc(get(i.i)));
          else{const ob=i.arrow?rd(get(i.a)):get(i.a);v=new Ptr(ob,i.f)}
          set(i.r,v);break}
        case 'goto':pc=lab[i.l];continue;
        case 'ifF':if(!get(i.a)){pc=lab[i.l];continue}break;
        case 'ifT':if(get(i.a)){pc=lab[i.l];continue}break;
        case 'param':pend.push(i.cl?clone(get(i.a)):get(i.a));break;
        case 'call':{const a=pend.splice(pend.length-i.n,i.n);let v=0;
          if(fns[i.f])v=run(i.f,a,depth+1);
          else switch(i.f){
            case 'printf':{const s=fmtp(a);out+=s;v=s.length;break}
            case 'puts':out+=cstr(a[0])+'\n';break;case 'putchar':out+=String.fromCharCode(a[0]);v=a[0];break;
            case 'scanf':v=scan(a);break;
            case 'getchar':v=ip<inp.length?inp.charCodeAt(ip++):-1;break;
            case 'fgets':{if(ip>=inp.length){v=0;break}let e2=inp.indexOf('\n',ip);e2=e2<0?inp.length:e2+1;const ln=inp.slice(ip,Math.min(e2,ip+a[1]-1));ip+=ln.length;wstr(a[0],ln);v=a[0];break}
            case 'strlen':v=cstr(a[0]).length;break;
            case 'strcmp':{const x=cstr(a[0]),y=cstr(a[1]);v=x<y?-1:x>y?1:0;break}
            case 'strncmp':{const x=cstr(a[0]).slice(0,a[2]),y=cstr(a[1]).slice(0,a[2]);v=x<y?-1:x>y?1:0;break}
            case 'strcpy':wstr(a[0],cstr(a[1]));v=a[0];break;
            case 'strncpy':wstr(a[0],cstr(a[1]).slice(0,a[2]));v=a[0];break;
            case 'strcat':wstr(padd(a[0],cstr(a[0]).length),cstr(a[1]));v=a[0];break;
            case 'abs':v=Math.abs(a[0]);break;case 'fabs':v=Math.abs(a[0]);break;case 'sqrt':v=Math.sqrt(a[0]);break;
            case 'pow':v=Math.pow(a[0],a[1]);break;case 'floor':v=Math.floor(a[0]);break;case 'ceil':v=Math.ceil(a[0]);break;
            case 'sin':v=Math.sin(a[0]);break;case 'cos':v=Math.cos(a[0]);break;case 'tan':v=Math.tan(a[0]);break;
            case 'log':v=Math.log(a[0]);break;case 'log10':v=Math.log10(a[0]);break;case 'exp':v=Math.exp(a[0]);break;
            case 'toupper':v=String.fromCharCode(a[0]).toUpperCase().charCodeAt(0);break;case 'tolower':v=String.fromCharCode(a[0]).toLowerCase().charCodeAt(0);break;
            case 'isdigit':v=+/[0-9]/.test(String.fromCharCode(a[0]));break;case 'isalpha':v=+/[A-Za-z]/.test(String.fromCharCode(a[0]));break;
            case 'isalnum':v=+/[A-Za-z0-9]/.test(String.fromCharCode(a[0]));break;case 'isupper':v=+/[A-Z]/.test(String.fromCharCode(a[0]));break;
            case 'islower':v=+/[a-z]/.test(String.fromCharCode(a[0]));break;case 'isspace':v=+/\s/.test(String.fromCharCode(a[0]));break;
            case 'atoi':v=parseInt(cstr(a[0]),10)||0;break;
            case 'malloc':v=new Ptr(new Array(Math.max(1,Math.trunc(a[0]))).fill(0),0);break;
            case 'calloc':v=new Ptr(new Array(Math.max(1,Math.trunc(a[0]*a[1]))).fill(0),0);break;
            case 'free':break;
            case 'exit':throw{exit:Math.trunc(a[0])}}
          if(i.r)set(i.r,v,i.ct);break}
        case 'ret':return i.a!=null?cvv(get(i.a),i):0}
      pc++}}
  let code0=0;
  try{
    if(fns.__init)run('__init',[],0);
    if(!fns.main)throw RE('there is no main() function to run');
    code0=run('main',[],0)
  }catch(e){if(e&&e.exit!==undefined)code0=e.exit;else throw e}
  if(out.length>20000)out=out.slice(0,20000)+'\n...(output cut)';
  return (out?out.replace(/\n$/,'')+'\n':'(no output)\n')+(eof?'[scanf ran out of input: type the values in the Input box]\n':'')+`[program exited with code ${Math.trunc(Number(code0)||0)}]`;
}

/* ---------- pipeline ---------- */
function fmtErr(e,src){const Ls=src.split('\n');let s=`${e.kind}${e.ln?` (line ${e.ln}${e.col?`, column ${e.col}`:''})`:''}: ${e.text}`;
  if(e.ln&&Ls[e.ln-1]!==undefined){s+=`\n  ${String(e.ln).padStart(3)} | ${Ls[e.ln-1]}`;if(e.col)s+=`\n      | ${' '.repeat(Math.max(0,e.col-1))}^`}return s}
function compile(src){
  const R={ins:[src,src,'','','','','',''],outs:Array(8).fill(''),st:Array(8).fill(0),tree:null,items:[]};
  R.outs[0]='// Passed to\n// Lexical Analyzer';R.st[0]=1;
  let bad=false,toks,ast,opt,ir,oir;
  const step=(i,f)=>{if(bad){R.outs[i]='— skipped: an earlier phase failed';return}
    try{R.outs[i]=f();R.st[i]=1}catch(e){bad=true;R.st[i]=2;
      R.outs[i]='✖ '+(e&&e.multi?e.multi.map(x=>fmtErr(x,src)).join('\n\n'):e&&e.kind?fmtErr(e,src):'Internal error: '+(e&&e.message||e))}};
  step(1,()=>{toks=lex(src);return toks.map(t=>`<${tokName(t)}, ${tokVal(t)}>`).join('\n')});
  if(toks)R.ins[2]=toks.filter(t=>t.k!=='PREPROC').map(tokVal).join(' ');
  step(2,()=>{ast=parse(toks);R.items=treeItems(ast,src);R.tree=R.items[0].ast;return treeText(R.tree)});
  if(ast)R.ins[3]=R.ins[4]=R.outs[2];
  step(3,()=>{const r=sem(ast),w=[0,1,2].map(i=>Math.max(i===2?10:6,...r.rows.map(x=>x[i].length))+2);
    return ['name','type','kind','scope'].map((h,i)=>i<3?h.padEnd(w[i]):h).join('')+'\n'+r.rows.map(x=>x.map((c,i)=>i<3?c.padEnd(w[i]):c).join('')).join('\n')+'\n\n'+
      (r.notes.length?r.notes.map(x=>'⚠ '+x).join('\n'):'✔ All names declared, types consistent')});
  step(4,()=>{ir=genTAC(ast,true);return tacText(ir)});
  R.ins[5]=R.outs[4];
  step(5,()=>{opt=optimize(ast);R.optlog=OS.log;oir=genTAC(opt,false);
    return `; folded: ${OS.fold} · propagated: ${OS.prop} · simplified: ${OS.alg} · dead code removed: ${OS.dead}\n; instructions: ${ir.length} → ${oir.length}\n`+tacText(oir)});
  R.ins[6]=R.outs[5];
  step(6,()=>asm(oir));
  R.ins[7]=R.outs[6];
  step(7,()=>execute(oir,typeof STDIN==='string'?STDIN:''));
  return R;
}
