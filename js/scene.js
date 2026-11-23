/* ===================== 3D scene ===================== */
const cv=$('c'),ren=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
ren.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,200);cam.position.set(0,0,19);
const G=new THREE.Group();scene.add(G);
let rx=-.1,ry=.32,tx=0,ty=0,cx=0,cy=0,zt=19,foc=false,run=null,lit=0,mx=0,my=0;
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
const lt=(h,f)=>{const n=parseInt(h.slice(1),16);return '#'+[16,8,0].map(s=>Math.round(((n>>s)&255)*(1-f)+255*f).toString(16).padStart(2,'0')).join('')};
function draw(i){
  const p=PH[i],c=p.cv.getContext('2d'),W=p.cv.width,H=p.cv.height;
  c.clearRect(0,0,W,H);const gr=c.createLinearGradient(0,0,W*.4,H);gr.addColorStop(0,lt(p.c,.3));gr.addColorStop(1,p.c);c.fillStyle=gr;rr(c,2,2,W-4,H-4,Math.min(W,H)*.1);c.fill();c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=3;c.stroke();
  c.textAlign='center';c.fillStyle='#fff';
  const fs=Math.max(20,Math.min(54,W*.88/(p.n.length*.56)));
  c.font=`500 ${fs}px Outfit,sans-serif`;c.fillText(p.n,W/2,H/2+fs*.1);
  c.fillStyle='rgba(255,255,255,.7)';c.font=`400 ${fs*.58}px Outfit,sans-serif`;c.fillText('('+p.s+')',W/2,H/2+fs*.95);
  const st=R.st[i];if(st){c.fillStyle=st===1?'#bbf7d0':'#fecaca';c.font=`700 ${fs*.9}px Outfit,sans-serif`;c.textAlign='right';c.fillText(st===1?'✓':'✕',W-W*.05,fs*1.1)}
  p.tex.needsUpdate=true;
}
function drawAll(){PH.forEach((_,i)=>draw(i))}
PH.forEach((p,i)=>{
  p.cv=document.createElement('canvas');p.cv.width=512;p.cv.height=Math.round(512*p.h/p.w);p.tex=new THREE.CanvasTexture(p.cv);p.tex.anisotropy=4;p.ts=i===0?1.1:1;
  p.mesh=new THREE.Mesh(new THREE.PlaneGeometry(p.w,p.h),new THREE.MeshBasicMaterial({map:p.tex,transparent:true,side:THREE.DoubleSide}));
  p.mesh.position.set(p.x,p.y,0);p.mesh.userData.i=i;G.add(p.mesh);
});
const CV=[],TM=[],FP=[],LC=new THREE.Color(0x38bdf8),DC=new THREE.Color(0x35424f);
for(let i=0;i<7;i++){
  const a=PH[i],b=PH[i+1],A=new THREE.Vector3(a.x,a.y,-.15),B=new THREE.Vector3(b.x,b.y,-.15),d=B.clone().sub(A),nr=new THREE.Vector3(-d.y,d.x,0).normalize().multiplyScalar(.55);
  const cu=new THREE.CatmullRomCurve3([A,A.clone().lerp(B,.33).add(nr),A.clone().lerp(B,.66).sub(nr),B]),col=0x35424f;
  CV.push(cu);const tm=new THREE.MeshBasicMaterial({color:col});TM.push(tm);G.add(new THREE.Mesh(new THREE.TubeGeometry(cu,48,.09,8,false),tm));
  [.3,.7].forEach(t=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.17,16,16),tm);s.position.copy(cu.getPoint(t));G.add(s)});
  const fp=new THREE.Mesh(new THREE.SphereGeometry(.13,12,12),new THREE.MeshBasicMaterial({color:0xbae6fd}));fp.visible=false;G.add(fp);FP.push({m:fp,o:i*.37});
}
const PUL=new THREE.Mesh(new THREE.SphereGeometry(.3,16,16),new THREE.MeshBasicMaterial({color:0x67e8f9}));PUL.visible=false;G.add(PUL);
function runTo(i){vstop();PH.forEach(p=>{p.gl=0;p.ts=1});PH[0].gl=1;PH[0].ts=1.14;lit=0;bg(0);run=i>0?{seg:0,t:0,to:i,w:22}:null;PUL.visible=i>0;shift(0);if(i===0)speak(0)}
const sp=[];for(let i=0;i<700;i++)sp.push((Math.random()-.5)*90,(Math.random()-.5)*70,-8-Math.random()*30);
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
const starMat=new THREE.PointsMaterial({color:0x9aa4b2,size:.1,transparent:true,opacity:.8}),stars=new THREE.Points(sg,starMat);scene.add(stars);
/* floating 3D token field in the background, built from the real tokens of the user's code */
const TK=new THREE.Group();scene.add(TK);let TKS=[];const TC={KEYWORD:'#c084fc',ID:'#67e8f9',NUMBER:'#fbbf24',STRING:'#86efac',CHAR:'#86efac'},tcache={};
function tokTex(txt,col){const key=txt+col;if(tcache[key])return tcache[key];
  const c=document.createElement('canvas'),x=c.getContext('2d');x.font='500 44px "JetBrains Mono",monospace';
  const w=Math.max(84,Math.ceil(x.measureText(txt).width)+44);c.width=w;c.height=84;x.font='500 44px "JetBrains Mono",monospace';
  x.fillStyle='rgba(255,255,255,.05)';rr(x,3,3,w-6,78,18);x.fill();x.globalAlpha=.75;x.strokeStyle=col;x.lineWidth=3;x.stroke();x.globalAlpha=1;
  x.fillStyle=col;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,44);
  return tcache[key]={t:new THREE.CanvasTexture(c),w:w/84}}
function buildTokens(){
  TKS.forEach(o=>TK.remove(o.m));TKS=[];let toks=[];
  try{toks=lex(SRC).filter(t=>t.k!=='PREPROC')}catch(e){}
  if(!toks.length)toks=['int','x','=','5','+','10',';','{','}','return','if','while','printf'].map(v=>({k:/^\d/.test(v)?'NUMBER':KW.has(v)?'KEYWORD':/^[a-z]+$/.test(v)?'ID':'OP',v}));
  for(let i=0;i<46;i++){const t=toks[i%toks.length],col=TC[t.k]||'#f472b6',o=tokTex(tokVal(t).slice(0,12),col);
    const m=new THREE.Sprite(new THREE.SpriteMaterial({map:o.t,transparent:true,opacity:.2+Math.random()*.32,depthWrite:false})),s=1.5+Math.random()*1.4;
    m.scale.set(o.w*s,s,1);m.position.set((Math.random()-.5)*68,(Math.random()-.5)*40,-9-Math.random()*20);TK.add(m);
    TKS.push({m,vx:(Math.random()-.5)*.01+.01,vy:(Math.random()-.5)*.008,ph:Math.random()*6})}
}
function bg(k){const r=document.documentElement.style;r.setProperty('--ph',PH[k].pc);r.setProperty('--pc',PH[k].c);starMat.color.set(PH[k].pc)}
function shift(i=act){
  const m=innerWidth<760,f=foc&&openP,asp=innerWidth/innerHeight,pw=Math.min(400,innerWidth-28),fr=Math.max(.3,(innerWidth-22-pw)/innerWidth);
  let z=m?26:19;if(!m&&openP)z=Math.max(19,11/(.9326*asp*fr));
  if(f)z=m?22:Math.max(13.5,(PH[i].w*1.25+1)/(.9326*asp*fr));
  zt=Math.min(z,34);const W=.9326*zt*asp,po=(openP&&!m)?(fr/2-.5+11/innerWidth)*W:0;
  tx=po-(f?PH[i].x*.95:0);ty=(f?-PH[i].y:0)+((m&&openP)?.22*1.865*zt:0);
  if(f){ry=.05;rx=-.03}else{ry=.32;rx=-.1}}
function resize(){const w=innerWidth,h=innerHeight;ren.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();if(w<760)zt=Math.max(zt,26);shift()}
addEventListener('resize',resize);resize();
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
let down=null,moved=0;
cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};moved=0;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
cv.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;moved+=Math.abs(dx)+Math.abs(dy);ry+=dx*.006;rx=Math.max(-.8,Math.min(.8,rx+dy*.004));down={x:e.clientX,y:e.clientY}});
cv.addEventListener('pointerup',e=>{cv.style.cursor='grab';if(down&&moved<6){
  const r=cv.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),cam);
  G.updateMatrixWorld(true);const h=ray.intersectObjects(PH.map(p=>p.mesh))[0];if(h)sel(h.object.userData.i)}down=null});
cv.addEventListener('wheel',e=>{e.preventDefault();zt=Math.max(9,Math.min(34,zt+e.deltaY*.012))},{passive:false});
(function loop(t){
  requestAnimationFrame(loop);
  G.rotation.x+=(rx-G.rotation.x)*.12;G.rotation.y+=(ry+Math.sin(t*.0004)*.03-G.rotation.y)*.12;
  cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;cam.position.z+=(zt-cam.position.z)*.08;
  if(run){if(run.w>0)run.w--;else run.t+=.019;if(run.t>=1){run.t=0;run.seg++;const k=run.seg;run.w=k>=run.to?0:26;lit=k;PH.forEach((p,j)=>p.ts=j===k?1.14:1);PH[k].gl=1.6;ping(SCL[k],.08);bg(k);shift(k);if(k>=run.to){run=null;PUL.visible=false;speak(k)}}
    if(run){PUL.position.copy(CV[run.seg].getPoint(run.t));PUL.position.z=.3;PUL.scale.setScalar(1+Math.sin(t*.02)*.18)}}G.position.set(cx,cy,0);
  PH.forEach(p=>{const s=p.mesh.scale.x+(p.ts-p.mesh.scale.x)*.15;p.mesh.scale.set(s,s,1);p.gl=(p.gl||0)*.96;p.mesh.material.color.setScalar(1+p.gl*.6)});
  TM.forEach((m,i)=>m.color.lerp(i<lit?LC:DC,.08));
  FP.forEach((f,i)=>{if(i<lit){f.m.visible=true;f.m.position.copy(CV[i].getPoint((t*.0003+f.o)%1));f.m.position.z=.2}else f.m.visible=false});
  PH.forEach((p,i)=>{p.mesh.position.y=p.y+Math.sin(t*.0012+i*1.3)*.09});
  TKS.forEach(o=>{const p=o.m.position;p.x+=o.vx*(run?5:1);p.y+=Math.sin(t*.0004+o.ph)*.004+o.vy;if(p.x>36)p.x=-36;if(p.x<-36)p.x=36;if(p.y>21)p.y=-21;if(p.y<-21)p.y=21});
  TK.rotation.y+=(ry*.2-TK.rotation.y)*.04;TK.rotation.x+=(rx*.15-TK.rotation.x)*.04;TK.position.x=mx*-2.5;TK.position.y=my*1.8;
  stars.rotation.z=t*.00002;stars.position.x=mx*-1.6;stars.position.y=my*1.1;
  ren.render(scene,cam);
})(0);

buildSteps();showPanel();markSteps();shift();drawAll();bg(0);buildTokens();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{drawAll();for(const k in tcache)delete tcache[k];buildTokens()});
