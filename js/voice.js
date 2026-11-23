/* ===================== Voice narration (Web Speech API) + animated credit ===================== */
const NAR={
 en:['Phase 1, Source Code. This is the program written by the developer. The compiler has not understood it yet.',
  'Phase 2, Lexical Analysis. The code is broken into small pieces called tokens, like keywords, names, numbers and symbols.',
  'Phase 3, Syntax Analysis. The parser checks that the tokens follow the grammar, and builds a parse tree and an abstract syntax tree of your program.',
  'Phase 4, Semantic Analysis. Here the compiler checks the meaning: variables must be declared, and types must match.',
  'Phase 5, Intermediate Code. The program becomes simple three address code, using temporary variables.',
  'Phase 6, Code Optimization. The compiler makes the code faster and smaller, for example by calculating constants early.',
  'Phase 7, Code Generation. The optimized code is translated into assembly instructions for the machine.',
  'Phase 8, Target Code. Finally the program runs and produces its output.'],
 ur:['مرحلہ ایک، سورس کوڈ۔ یہ وہ پروگرام ہے جو ڈویلپر لکھتا ہے۔ کمپائلر نے ابھی اسے سمجھا نہیں ہے۔',
  'مرحلہ دو، لیکسیکل اینالیسس۔ یہاں کوڈ کو چھوٹے ٹکڑوں یعنی ٹوکنز میں بانٹا جاتا ہے۔',
  'مرحلہ تین، سنٹیکس اینالیسس۔ پارسر دیکھتا ہے کہ ٹوکنز گرامر کے مطابق ہیں، اور پروگرام کا ایک ٹری بناتا ہے۔',
  'مرحلہ چار، سیمینٹک اینالیسس۔ یہاں مطلب کی جانچ ہوتی ہے، یعنی ویریبلز ڈیکلیئر ہوں اور ٹائپس آپس میں ملتی ہوں۔',
  'مرحلہ پانچ، انٹرمیڈیئٹ کوڈ۔ پروگرام تھری ایڈریس کوڈ کی سادہ شکل میں بدل جاتا ہے۔',
  'مرحلہ چھ، کوڈ آپٹیمائزیشن۔ کوڈ کو تیز اور چھوٹا بنایا جاتا ہے، جیسے مستقل قدروں کا حساب پہلے ہی کر لینا۔',
  'مرحلہ سات، کوڈ جنریشن۔ آپٹیمائزڈ کوڈ اسمبلی ہدایات میں بدلا جاتا ہے۔',
  'مرحلہ آٹھ، ٹارگٹ کوڈ۔ آخر میں پروگرام چلتا ہے اور آؤٹ پٹ ملتا ہے۔'],
 ru:['Phase 1, Source Code. Ye wo program hai jo developer likhta hai. Compiler ne abhi isay samjha nahi hota.', 'Phase 2, Lexical Analysis. Code ko chhote tukron yaani tokens mein kaata jata hai, jaise keywords, naam, numbers aur symbols.', 'Phase 3, Syntax Analysis. Parser dekhta hai ke tokens grammar ke mutabiq hain, aur aapke program ka parse tree aur abstract syntax tree banata hai.', 'Phase 4, Semantic Analysis. Yahan compiler matlab check karta hai: variables declare hon, aur types aapas mein milein.', 'Phase 5, Intermediate Code. Program simple three address code ban jata hai, jisme temporary variables hote hain.', 'Phase 6, Code Optimization. Compiler code ko tez aur chhota banata hai, jaise constants ka hisaab pehle hi kar lena.', 'Phase 7, Code Generation. Optimized code machine ke liye assembly instructions mein badal jata hai.', 'Phase 8, Target Code. Aakhir mein program chalta hai aur apna output deta hai.']};
let vmode='en';const VV={en:null,ur:null},HASV='speechSynthesis' in window;
function pickVoices(){if(!HASV)return;const v=speechSynthesis.getVoices();
  VV.en=v.find(x=>/^en[-_](US|GB|IN)/i.test(x.lang)&&/(Natural|Google|Aria|Jenny|Zira|Samantha)/i.test(x.name))||v.find(x=>/^en/i.test(x.lang))||null;
  VV.ur=v.find(x=>/^ur/i.test(x.lang))||null;VV.ru=v.find(x=>/^en[-_]IN/i.test(x.lang))||VV.en}
function vlabel(){const b=$('voice');if(b)b.textContent='Voice: '+(vmode==='en'?'EN':vmode==='ur'?'اردو':vmode==='ru'?'Roman Urdu':'Off')}
function duck(on){try{if(AC&&mst&&!mute){mst.gain.cancelScheduledValues(AC.currentTime);mst.gain.linearRampToValueAtTime(on?.3:.75,AC.currentTime+.4)}}catch(e){}}
function vstop(){if(HASV)speechSynthesis.cancel();duck(0)}
function vextra(i){const ur=vmode==='ur';if(vmode==='ru'){if(R.st[i]===2)return ' Is phase mein aapke program mein ghalti mili hai.';if(R.st[i]===0)return ' Pichle phase mein ghalti ki wajah se ye phase chhor diya gaya.';if(i===1)return ` Aapke program mein ${R.outs[1].split('\n').length} tokens hain.`;if(i===4)return ` Isme ${R.outs[4].split('\n').length} instructions hain.`;if(i===5){const m=R.outs[5].match(/instructions: (\d+) → (\d+)/);return m?` Instructions ${m[1]} se ${m[2]} reh gaye.`:''}return ''}
  if(R.st[i]===2)return ur?' اس مرحلے میں آپ کے پروگرام میں غلطی ملی ہے۔':' This phase found an error in your program. '+R.outs[i].replace(/^✖\s*/,'');
  if(R.st[i]===0)return ur?' پچھلے مرحلے میں غلطی کی وجہ سے یہ مرحلہ چھوڑ دیا گیا۔':' This phase was skipped because an earlier phase failed.';
  if(ur)return '';
  if(i===1)return ` Your program has ${R.outs[1].split('\n').length} tokens.`;
  if(i===4)return ` It has ${R.outs[4].split('\n').length} instructions.`;
  if(i===5){const m=R.outs[5].match(/instructions: (\d+) → (\d+)/);return m?` Instructions went from ${m[1]} to ${m[2]}.`:''}
  return ''}
function speak(i){if(!HASV||vmode==='off')return;vstop();
  const u=new SpeechSynthesisUtterance(NAR[vmode][i]+vextra(i));u.lang=vmode==='ur'?'ur-PK':vmode==='ru'?'en-IN':'en-US';if(VV[vmode])u.voice=VV[vmode];u.rate=.95;
  u.onstart=()=>duck(1);u.onend=u.onerror=()=>duck(0);speechSynthesis.speak(u)}
if(HASV){pickVoices();speechSynthesis.onvoiceschanged=pickVoices}
$('voice').onclick=()=>{if(!HASV){$('voice').textContent='Voice: n/a';return}
  const ms=['en'].concat(VV.ur?['ur']:[],['ru','off']);vmode=ms[(ms.indexOf(vmode)+1)%ms.length];vlabel();if(vmode==='off')vstop();else speak(act)};
vlabel();
const wb=document.querySelector('.wm b');
if(wb)wb.innerHTML=[...wb.textContent].map((c,i)=>`<i style="--d:${i*.11}s">${c===' '?'&nbsp;':c==='&'?'&amp;':c}</i>`).join('');
