(() => {
'use strict';
const C = {blue:'#4da3ff', teal:'#2dd4bf', gold:'#fbbf24', purple:'#a78bfa', green:'#34d399', red:'#f87171', txt:'#e6edf7', mut:'#a3b1cc', sg:'#7dd3fc'};
const $ = s => document.querySelector(s);
const rm = matchMedia('(prefers-reduced-motion: reduce)');

const box = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 12}" fill="${o.fill || 'none'}" stroke="${o.stroke || C.mut}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.fill || C.txt}" font-size="${o.size || 14}" font-weight="${o.w || 500}" text-anchor="${o.a || 'middle'}">${s}</text>`;
const wire = (id, color) => `<use href="#p-${id}" class="wire" stroke="${color}"/>`;

const ICON = {
  env:   `<rect x="-13" y="-9" width="26" height="18" rx="3" fill="${C.gold}"/><path d="M-13-9L0 2L13-9" fill="none" stroke="#7a5a00" stroke-width="2"/>`,
  cart:  `<path d="M-13-10H-8L-4 5H8L11-5H-6" fill="none" stroke="${C.gold}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="-2" cy="10" r="2.6" fill="${C.gold}"/><circle cx="7" cy="10" r="2.6" fill="${C.gold}"/>`,
  ok:    `<circle r="13" fill="${C.green}"/><path d="M-6 0L-2 5L6-5" fill="none" stroke="#052e1c" stroke-width="3" stroke-linecap="round"/>`,
  x:     `<circle r="13" fill="${C.red}"/><path d="M-5-5L5 5M5-5L-5 5" stroke="#450a0a" stroke-width="3" stroke-linecap="round"/>`,
  pkg:   `<rect x="-12" y="-12" width="24" height="24" rx="3" fill="#c08a4a"/><path d="M0-12V12M-12 0H12" stroke="#6b4423" stroke-width="2"/>`,
  shield:`<path d="M0-13L11-8V1C11 8 6 12 0 14C-6 12-11 8-11 1V-8Z" fill="${C.teal}"/><path d="M-4 1L-1 4L5-3" fill="none" stroke="#032b27" stroke-width="2.5" stroke-linecap="round"/>`,
  chart: `<rect x="-12" y="-12" width="24" height="24" rx="4" fill="#1e3a8a" stroke="${C.blue}" stroke-width="2"/><path d="M-8 6L-3-1L2 3L8-6" fill="none" stroke="${C.green}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
};
const at = (k, x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${ICON[k]}</g>`;

const PATHS = {
  net:'M150 310 H330', dnsq:'M85 270 V125 H210', dnsr:'M210 145 H115 V270', alias:'M360 125 H490 V200',
  v2a:'M150 310 H340', a2l:'M510 310 H550', l2t:'M660 310 H690',
  b1:'M690 310 V215 H730', b2:'M690 310 V405 H730', b3:'M690 310 V152 H975 V175',
  tls:'M150 310 H550',
  f1:'M150 310 H690 V215 H730', f2:'M150 310 H690 V405 H730', f3:'M150 310 H690 V152 H975 V175',
  r1:'M730 215 H690 V310 H150', r2:'M730 405 H690 V310 H150', r3:'M975 175 V152 H690 V310 H150',
  cw:'M495 420 V505', cw2:'M510 535 H698'
};

/* ---------- state ---------- */
let cur = 1, glow = true, h2 = 'ok', h3 = 'ok', msg = '', playT = null, tm1 = null, tm2 = null;

const SERVERS = [{id:1, x:730, y:175, f:'f1', r:'r1', end:'730 215'}, {id:2, x:730, y:365, f:'f2', r:'r2', end:'730 405'}, {id:3, x:900, y:175, f:'f3', r:'r3', end:'975 175'}];
const status = id => cur < 6 ? 'registered' : id === 2 ? ({ok:'healthy', bad:'unhealthy', check:'checking...'})[h2] : id === 3 ? (h3 === 'ok' ? 'healthy' : 'checking...') : 'healthy';
function srv(s) {
  const st = status(s.id);
  const col = st === 'healthy' ? C.green : st === 'unhealthy' ? C.red : st === 'registered' ? C.purple : C.gold;
  const icon = st === 'healthy' ? at('ok', s.x + 128, s.y + 26, .85) : st === 'unhealthy' ? at('x', s.x + 128, s.y + 26, .85) : '';
  return box(s.x, s.y, 150, 80, {stroke:col, fill:'rgba(255,255,255,.05)', sw:3}) +
    t(s.x + 14, s.y + 28, 'Web server ' + s.id, {a:'start', w:700}) + t(s.x + 14, s.y + 50, st, {a:'start', size:13, fill:col, w:700}) +
    t(s.x + 14, s.y + 69, 'EC2 instance', {a:'start', size:12, fill:C.mut}) + icon;
}

/* ---------- components: s = first step, e = last step ---------- */
const COMPS = [
  {s:1, svg:() => box(20,270,130,80,{stroke:C.blue,fill:'rgba(77,163,255,.08)'}) + t(85,303,'Customers',{w:700}) + t(85,325,'in browsers',{size:13,fill:C.mut}) + t(85,372,'The Internet',{size:13,fill:C.blue})},
  {s:2, svg:() => wire('dnsq',C.blue) + wire('dnsr',C.blue) + box(210,90,150,70,{stroke:C.blue,fill:'rgba(77,163,255,.12)'}) + t(285,112,'Route 53 (DNS)',{w:700,size:13,fill:C.blue}) + t(285,131,'ravishop.com',{size:12}) + t(285,149,'points to the ALB',{size:12,fill:C.mut})},
  {s:3, svg:() => wire('v2a',C.teal) + wire('alias',C.blue) + t(372,116,'alias record',{a:'start',size:12,fill:C.blue}) +
    box(340,200,170,220,{stroke:C.teal,fill:'rgba(45,212,191,.12)',sw:3}) + t(425,228,'Application',{w:700,fill:C.teal}) + t(425,246,'Load Balancer',{w:700,fill:C.teal}) + t(425,270,'the receptionist',{size:13,fill:C.mut}) + t(425,347,'accepts HTTP',{size:12}) + t(425,365,'and HTTPS',{size:12})},
  {s:4, svg:() => wire('a2l',C.gold) + box(550,240,110,140,{stroke:C.gold,fill:'rgba(251,191,36,.10)',sw:3}) + t(605,262,'Listener',{w:700,fill:C.gold}) + t(605,285,'HTTPS port 443',{size:12}) + t(605,345,'HTTP port 80',{size:12}) + t(605,365,'rules: forward',{size:12,fill:C.mut})},
  {s:5, svg:() => wire('l2t',C.purple) + wire('b1',C.purple) + wire('b2',C.purple) +
    box(700,100,385,450,{stroke:C.purple,fill:'rgba(167,139,250,.07)',sw:3}) + t(715,122,'Target group: ravishop-web',{a:'start',size:13,w:700,fill:C.purple}) +
    box(715,130,355,170,{stroke:C.mut,dash:'6 5',rx:10,sw:1.5}) + t(745,292,'Availability Zone A',{a:'start',size:12,fill:C.mut}) +
    box(715,320,355,170,{stroke:C.mut,dash:'6 5',rx:10,sw:1.5}) + t(745,482,'Availability Zone B',{a:'start',size:12,fill:C.mut}) + srv(SERVERS[0]) + srv(SERVERS[1])},
  {s:7, svg:() => t(1060,122,'health check: GET /health',{a:'end',size:12,fill:C.green})},
  {s:8, svg:() => wire('b3',C.purple) + srv(SERVERS[2]) + t(715,515,'Auto Scaling Group: adds servers when busy',{a:'start',size:12,fill:C.green})},
  {s:9, svg:() => box(330,185,190,260,{stroke:C.sg,dash:'9 6',rx:14}) + t(335,452,'ALB security group',{a:'start',size:12,fill:C.sg}) + t(335,469,'80 and 443 from anywhere',{a:'start',size:12,fill:C.sg}) +
    t(715,538,'Web server security group: port 80 only from the ALB',{a:'start',size:12,fill:C.sg}) + t(425,392,'TLS ends here',{size:12,fill:C.teal,w:700}) +
    at('shield',245,310) + t(245,288,'HTTPS',{size:12,fill:C.teal}) + at('shield',530,310) +
    wire('cw',C.blue) + wire('cw2',C.blue) + box(340,505,170,60,{stroke:C.blue,fill:'rgba(77,163,255,.12)'}) + t(425,531,'CloudWatch',{w:700,fill:C.blue}) + t(425,551,'metrics and alarms',{size:12,fill:C.mut})}
];

/* ---------- moving objects ---------- */
function traffic() {
  const list = SERVERS.filter(s => s.id === 1 || (s.id === 2 && h2 === 'ok') || (s.id === 3 && cur >= 8 && h3 === 'ok'));
  const n = list.length, seg = 1 / n, out = [];
  list.forEach((s, i) => {
    const a = i * seg, m = a + seg * .5, b = a + seg;
    out.push({path:s.f, icon:i % 2 ? 'cart' : 'env', dur:5 * n, win:[a, m], pos:s.end});
    out.push({path:s.r, icon:'pkg', dur:5 * n, win:[m, b], pos:'150 310'});
  });
  return out;
}
function movers() {
  switch (cur) {
    case 1: return [{path:'net', icon:'env', dur:3, win:[0,.9], pos:'330 310'}];
    case 2: return [{path:'dnsq', icon:'env', dur:5, win:[0,.45], pos:'210 125'}, {path:'dnsr', icon:'pkg', dur:5, win:[.5,.95], pos:'115 270'}];
    case 3: return [{path:'v2a', icon:'env', dur:3, win:[0,.9], pos:'340 310'}];
    case 4: return [{path:'tls', icon:'env', dur:5, win:[0,.5], pos:'550 310'}, {path:'tls', icon:'shield', dur:5, win:[.5,1], pos:'550 310'}];
    case 5: return [{path:'f1', icon:'cart', dur:5, win:[0,.8], pos:'730 215'}];
    case 9: return traffic().concat([{path:'cw', icon:'chart', dur:3, win:[0,1], pos:'495 505'}]);
    default: return cur >= 6 ? traffic() : [];
  }
}
function mover(m) {
  if (rm.matches) return `<g transform="translate(${m.pos})">${ICON[m.icon]}</g>`;
  const [a, b] = m.win;
  return `<g><animateMotion dur="${m.dur}s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${a};${b};1"><mpath href="#p-${m.path}"/></animateMotion>` +
    `<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;${a};${b}" dur="${m.dur}s" repeatCount="indefinite"/>${ICON[m.icon]}</g>`;
}

/* ---------- content ---------- */
const STEPS = [
  {t:'Visitors', sub:'Customers arrive', plain:"Ravi's shop is open. Customers all over the world type his web address into their browsers and knock on the door.", tech:'Clients: browsers on the public internet sending HTTP or HTTPS requests.', watch:'A gold envelope (an incoming request) leaves the customers box and travels into the night sky.'},
  {t:'DNS', sub:'Finding the shop address', plain:"Customers type a name, but computers need an address. Route 53 is the phone book: it answers \"ravishop.com is over there\", pointing to the receptionist.", tech:'Amazon Route 53 alias record that maps the domain name to the ALB DNS name.', watch:'An envelope asks Route 53 where the shop is, and a package carries the answer back.'},
  {t:'Application Load Balancer', sub:'Meet the receptionist', plain:'The receptionist stands at the front door. Every customer talks to her first, and she decides who helps them. Customers never need to know how many staff are in the back.', tech:'Application Load Balancer (ALB): a layer 7 load balancer for HTTP and HTTPS, spread over subnets in two or more Availability Zones.', watch:'The teal ALB appears, with a wire from the customers and an alias line from Route 53.'},
  {t:'Listener', sub:'Which door, which rule', plain:'The receptionist listens at two doors: the secure door (443) and the normal door (80). A rule tells her what to do with each visitor, such as "send them to the web servers".', tech:'Listener: checks for connection requests on a protocol and port. HTTPS 443 uses a certificate (AWS Certificate Manager). Rules have conditions (host, path) and actions (forward, redirect, fixed response). A common rule redirects port 80 to 443.', watch:'The gold listener appears. A request enters, then a teal shield (HTTPS security) follows it.'},
  {t:'Target Group', sub:'The team in the back', plain:'Behind the receptionist is a team of web servers, kept in one group. Two of them work in two different buildings, so one problem cannot stop the whole shop.', tech:'Target group: a set of registered targets (here, EC2 instances) that receive traffic from a listener rule. The ALB runs health checks on each target. Two Availability Zones give resilience.', watch:'The purple target group appears with Web server 1 (Zone A) and Web server 2 (Zone B). Try the failure button now.'},
  {t:'Traffic Distribution', sub:'Sharing the visitors', plain:'Customer one goes to server 1, customer two goes to server 2, and so on. Nobody gets overloaded.', tech:'The ALB default routing algorithm is round robin. Cross-zone load balancing is on by default for ALBs, so requests are spread across targets in all zones. Only healthy targets receive requests.', watch:'Envelopes and carts travel to each server in turn, and packages (responses) come back.'},
  {t:'Health Checks', sub:'Is every server awake?', plain:'The receptionist regularly asks each server "are you OK?". If one stops answering, she stops sending customers there until it recovers.', tech:'Health check: the ALB requests a path (for example /health) and expects a success code such as 200. After several failed checks a target is unhealthy and gets no new requests. After several passed checks it is healthy again.', watch:'After a moment Web server 2 turns red with a cross, and every new request goes to a healthy server. You can restore it with the button.'},
  {t:'Scaling', sub:'Hiring extra help', plain:'On a busy day Ravi needs more staff. A new server is started automatically. It only starts working after it proves it is ready.', tech:'Auto Scaling Group (ASG) attached to the target group launches an EC2 instance and registers it. The instance receives traffic only after it passes health checks. Scaling policies can use metrics such as request count per target.', watch:'Web server 3 appears with "checking...", turns green, and joins the rotation.'},
  {t:'Complete Architecture', sub:'The whole picture', plain:'Everything together: customers find the shop through Route 53, the receptionist greets them securely, hands them to a healthy server, and a monitor watches it all.', tech:'Visitor, Route 53, ALB, listener, target group, healthy EC2 targets. Security groups: the ALB accepts 80 and 443 from the internet; web servers accept port 80 only from the ALB security group. TLS terminates at the ALB. CloudWatch tracks metrics like RequestCount, TargetResponseTime, HealthyHostCount and HTTPCode_Target_5XX_Count.', watch:'Security group borders, shields and the CloudWatch box appear while requests keep flowing. A chart travels to CloudWatch.'}
];
const LEGEND = [['env','Incoming HTTP request'],['cart','Customer request'],['ok','Healthy target'],['x','Unhealthy target'],['pkg','Server response'],['shield','HTTPS security'],['chart','Monitoring activity']];

/* ---------- rendering ---------- */
function draw() {
  const defs = '<defs>' + Object.entries(PATHS).map(([k, d]) => `<path id="p-${k}" d="${d}"/>`).join('') + '</defs>';
  const comps = COMPS.filter(c => cur >= c.s && cur <= (c.e || 99)).map(c => `<g class="${glow && c.s === cur ? 'new' : ''}">${c.svg()}</g>`).join('');
  const banner = cur >= 5 && h2 === 'bad' ? t(1085,78,'Web server 2 is unhealthy: new requests go to healthy servers',{a:'end',size:13,fill:C.red,w:700})
    : cur >= 5 && h2 === 'check' ? t(1085,78,'Health check running on Web server 2...',{a:'end',size:13,fill:C.gold,w:700}) : '';
  $('#scene').innerHTML = defs + comps + banner + movers().map(mover).join('');
  $('#msg').textContent = msg;
  const f = $('#fail');
  f.disabled = cur < 5 || h2 === 'check';
  f.textContent = h2 === 'bad' ? 'Run health check on Web server 2' : h2 === 'check' ? 'Health check running...' : 'Simulate EC2 failure';
}
function caption() {
  const s = STEPS[cur - 1];
  $('#c-title').textContent = `Step ${cur}: ${s.t}`;
  $('#c-plain').textContent = s.plain; $('#c-tech').textContent = s.tech; $('#c-watch').textContent = s.watch;
  $('#count').textContent = `Step ${cur} of ${STEPS.length}`;
  document.querySelectorAll('.step').forEach((b, i) => {
    b.classList.toggle('done', i + 1 < cur);
    if (i + 1 === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
  });
}
const refresh = () => { glow = false; draw(); };

function go(n) {
  clearTimeout(tm1); clearTimeout(tm2);
  cur = Math.max(1, Math.min(STEPS.length, n));
  h2 = 'ok'; h3 = cur === 8 ? 'check' : 'ok'; msg = ''; glow = true;
  draw(); caption();
  if (cur === 7) tm1 = setTimeout(() => { h2 = 'bad'; msg = 'Web server 2 failed its health checks. The ALB stopped sending it requests.'; refresh(); }, 2500);
  if (cur === 8) tm1 = setTimeout(() => { h3 = 'ok'; msg = 'Web server 3 passed its health checks and joined the target group.'; refresh(); }, 3500);
}
function failToggle() {
  if (cur < 5) return;
  if (h2 === 'ok') { clearTimeout(tm1); h2 = 'bad'; msg = 'Web server 2 failed. The ALB now sends new requests only to healthy servers.'; refresh(); }
  else if (h2 === 'bad') {
    h2 = 'check'; msg = 'Running health checks on Web server 2...'; refresh();
    tm2 = setTimeout(() => { h2 = 'ok'; msg = 'Health check passed. Web server 2 is back in rotation.'; refresh(); }, 2500);
  }
}
function setPlay(on) {
  clearInterval(playT);
  $('#play').setAttribute('aria-pressed', String(on));
  $('#pause').setAttribute('aria-pressed', String(!on));
  if (on) playT = setInterval(() => { if (cur >= STEPS.length) setPlay(false); else go(cur + 1); }, 5000);
}
function init() {
  $('#steps').innerHTML = STEPS.map((s, i) => `<li><button type="button" class="step" data-i="${i + 1}"><span class="n">${i + 1}</span><span><b>${s.t}</b><small>${s.sub}</small></span></button></li>`).join('');
  $('#legend').innerHTML = LEGEND.map(([k, l]) => `<li><svg width="28" height="28" viewBox="-16 -16 32 32" aria-hidden="true">${ICON[k]}</svg>${l}</li>`).join('');
  $('#steps').addEventListener('click', e => { const b = e.target.closest('.step'); if (b) { setPlay(false); go(+b.dataset.i); } });
  $('#play').onclick = () => { if (cur >= STEPS.length) go(1); setPlay(true); };
  $('#pause').onclick = () => setPlay(false);
  $('#reset').onclick = () => { setPlay(false); go(1); };
  $('#fail').onclick = failToggle;
  $('#theme').onclick = () => {
    const d = document.documentElement, next = d.dataset.theme === 'dark' ? 'light' : 'dark';
    d.dataset.theme = next; try { localStorage.setItem('alb-theme', next); } catch (e) { /* ignore */ }
  };
  let saved = null; try { saved = localStorage.getItem('alb-theme'); } catch (e) { /* ignore */ }
  document.documentElement.dataset.theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  rm.addEventListener('change', refresh);
  go(1); setPlay(false);
}
init();
})();
