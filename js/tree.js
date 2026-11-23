/* ===================== Syntax tree drawing (SVG, top to bottom, with arrows) ===================== */
const TCL={blue:'#0b72e7',pink:'#e0457b',green:'#12a15f',purple:'#6a4ae0',orange:'#e0771c',teal:'#0e8fa8'};
let treeZoom=1;
function treeSVG(t,anim){
  const BH=34,GY=36,GX=16,PAD=16,bw=s=>Math.ceil(Math.max(44,s.length*8.2+26));
  const meas=n=>{n.bw=bw(n.l);const cs=n.c.map(meas);n.sw=cs.length?Math.max(n.bw,cs.reduce((a,b)=>a+b,0)+GX*(cs.length-1)):n.bw;return n.sw};
  let maxD=0;
  const place=(n,x0,d)=>{n.d=d;maxD=Math.max(maxD,d);n.cx=x0+n.sw/2;
    if(n.c.length){const tot=n.c.reduce((a,c)=>a+c.sw,0)+GX*(n.c.length-1);let x=x0+(n.sw-tot)/2;n.c.forEach(c=>{place(c,x,d+1);x+=c.sw+GX})}};
  meas(t);place(t,0,0);let oc=0;const ord=n=>{n.o=oc++;n.c.forEach(ord)};ord(t);
  const W=Math.ceil(t.sw+PAD*2),H=(maxD+1)*(BH+GY)-GY+PAD*2,id='ah'+(treeSVG.n=(treeSVG.n||0)+1);
  const colOf=n=>n.d===0?TCL.blue:n.k==='tok'||n.k==='leaf'?(/^(-?\d|['"])/.test(n.l)?TCL.orange:TCL.green):n.k==='expr'?TCL.purple:n.k==='role'?TCL.teal:n.k==='prog'||n.k==='func'?TCL.blue:TCL.pink;
  let links='',nodes='';
  const draw=n=>{const x=n.cx-n.bw/2+PAD,y=n.d*(BH+GY)+PAD;
    n.c.forEach(c=>{const px=n.cx+PAD,cx=c.cx+PAD,cy=c.d*(BH+GY)+PAD,my=y+BH+GY/2;
      links+=px===cx?`<path class="lk" data-o="${c.o}" d="M${px} ${y+BH} V${cy-2}" marker-end="url(#${id})"/>`:`<path class="lk" data-o="${c.o}" d="M${px} ${y+BH} V${my} H${cx} V${cy-2}" marker-end="url(#${id})"/>`;draw(c)});
    nodes+=`<g class="nd" data-o="${n.o}"><rect x="${x}" y="${y}" width="${n.bw}" height="${BH}" rx="5" fill="${colOf(n)}"/><text x="${x+n.bw/2}" y="${y+BH/2+4.5}" text-anchor="middle">${esc(n.l)}</text></g>`};
  draw(t);
  return `<svg class="tsvg${anim?' anim':''}" width="${Math.round(W*treeZoom)}" height="${Math.round(H*treeZoom)}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Syntax tree"><defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#9aa7b8"/></marker></defs><g fill="none" stroke="#9aa7b8" stroke-width="1.8" stroke-linejoin="round">${links}</g><g fill="#fff">${nodes}</g></svg>`}
