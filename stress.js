// SHOVE · real-phone stress test ("The High Striker")
// Runs the real game engine (same physics, same renderer) through a fixed script of loads,
// records every frame and grades the device. Uses a throwaway save, never touches the player's board.
const K = window.__k;
const $ = id => document.getElementById(id);
const VERSION = 'stress-1.0 · game v0.4';

// ---------- ui ----------
const css = `
.st-hide{display:none!important}
#st{position:fixed;inset:0;z-index:20;pointer-events:none;font-family:"DM Sans",system-ui,sans-serif;color:#F6EBD5}
#st .scrim{position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 20%,rgba(43,14,34,.86),rgba(14,6,14,.97));pointer-events:auto}
#st .card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,400px);max-height:94vh;overflow:auto;pointer-events:auto;padding:22px 20px 18px;text-align:center}
#st h1{font-family:Bungee,Impact,sans-serif;font-weight:400;font-size:44px;line-height:.92;margin:0;color:#FFD25A;text-shadow:0 4px 0 #8A2A12;letter-spacing:.01em}
#st h1 small{display:block;font-size:15px;color:#F6EBD5;text-shadow:none;letter-spacing:.32em;margin-bottom:8px}
#st .lede{font-size:17px;line-height:1.4;margin:14px 0 18px;opacity:.9}
#st .rules{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:0 0 18px}
#st .rules span{font:800 14px "DM Sans",system-ui,sans-serif;background:#2A1620;border:2px solid #5A3418;border-radius:999px;padding:6px 12px}
#st .go{font-family:Bungee,Impact,sans-serif;font-size:22px;background:#FFD25A;color:#1A0F14;border:none;border-radius:16px;padding:16px 20px;width:100%;box-shadow:0 5px 0 #8A5A12;cursor:pointer}
#st .ghostbtn{font:800 15px "DM Sans",system-ui,sans-serif;background:none;color:#F6EBD5;border:2px solid #5A3418;border-radius:14px;padding:12px;width:100%;margin-top:10px;cursor:pointer}
#st .fine{font-size:14px;opacity:.6;margin-top:12px;line-height:1.4}
/* live strip */
#stLive{position:fixed;left:10px;right:10px;top:max(10px,env(safe-area-inset-top));z-index:21;background:rgba(26,15,20,.86);border:2px solid #8A5A12;border-radius:18px;padding:10px 14px;display:flex;align-items:center;gap:14px;backdrop-filter:blur(6px);color:#F6EBD5;font-family:"DM Sans",system-ui,sans-serif}
#stLive .fps{font-family:Bungee,Impact,sans-serif;font-size:38px;line-height:1;min-width:64px;text-align:right;color:#FFD25A}
#stLive .fps.warn{color:#FF9A4D}#stLive .fps.bad{color:#FF5A5A}
#stLive .fps small{display:block;font:800 11px "DM Sans",system-ui,sans-serif;letter-spacing:.18em;color:#F6EBD5;opacity:.7;text-align:right}
#stLive .ph{flex:1;min-width:0}
#stLive .ph b{display:block;font-family:Bungee,Impact,sans-serif;font-weight:400;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#stLive .ph span{font:700 14px "DM Sans",system-ui,sans-serif;opacity:.8}
#stLive .bar{height:6px;border-radius:4px;background:#3A2430;margin-top:7px;overflow:hidden}
#stLive .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#FFD25A,#FF8A3D);transition:width .25s linear}
#stLive button{pointer-events:auto;font:800 14px "DM Sans",system-ui,sans-serif;background:#2A1620;color:#F6EBD5;border:2px solid #5A3418;border-radius:12px;padding:8px 10px}
/* result */
.striker{display:flex;gap:16px;align-items:stretch;margin:16px 0 6px;text-align:left}
.tower{position:relative;width:54px;flex:none;height:300px;border-radius:12px;background:linear-gradient(#2A1620,#1A0F14);border:3px solid #8A5A12}
.tower .bell{position:absolute;left:50%;top:-24px;transform:translateX(-50%);width:44px;height:30px;border-radius:22px 22px 6px 6px;background:radial-gradient(circle at 40% 30%,#FFF1B0,#E8B53C 55%,#9C6A12);box-shadow:0 0 0 rgba(255,210,90,0)}
.tower .bell.ring{animation:bell 1.2s ease-out 1.5s}
@keyframes bell{0%,100%{transform:translateX(-50%) rotate(0)}15%{transform:translateX(-50%) rotate(-14deg);box-shadow:0 0 40px rgba(255,210,90,.9)}35%{transform:translateX(-50%) rotate(11deg)}55%{transform:translateX(-50%) rotate(-6deg)}75%{transform:translateX(-50%) rotate(3deg)}}
.tower .seg{position:absolute;left:6px;right:6px;border-radius:6px;opacity:.28}
.tower .seg.lit{opacity:1;box-shadow:0 0 14px currentColor}
.tower .puck{position:absolute;left:50%;bottom:6px;width:30px;height:16px;margin-left:-15px;border-radius:8px;background:#F6EBD5;border:3px solid #D8343F;transition:bottom 1.4s cubic-bezier(.15,1.3,.4,1) .3s}
.marks{flex:1;display:flex;flex-direction:column-reverse;justify-content:space-between;height:300px}
.marks div{display:flex;align-items:center;gap:8px;font-family:Bungee,Impact,sans-serif;font-size:18px;opacity:.35}
.marks div.on{opacity:1;color:#FFD25A}
.marks div small{font:700 13px "DM Sans",system-ui,sans-serif;opacity:.85;color:#F6EBD5}
.verdict{background:#F6EBD5;color:#1A0F14;border-radius:18px;padding:14px 16px;margin:16px 0 10px;text-align:left;border:4px solid #D8343F;transform:rotate(-1deg)}
.verdict b{font-family:Bungee,Impact,sans-serif;font-weight:400;font-size:24px;display:block}
.verdict p{margin:6px 0 0;font-size:16px;line-height:1.35}
.flags{text-align:left;margin:8px 0;padding:0;list-style:none}
.flags li{font-size:15px;line-height:1.35;padding:8px 10px;margin-top:6px;background:#2A1620;border-left:4px solid #FF9A4D;border-radius:8px}
.stubs{margin-top:12px;text-align:left}
.stub{display:grid;grid-template-columns:1fr auto auto;gap:4px 10px;align-items:baseline;padding:9px 12px;margin-top:6px;background:#1A0F14;border-radius:10px;border:2px dashed #3A2430}
.stub b{font-size:15px}.stub em{font-style:normal;font-family:Bungee,Impact,sans-serif;font-size:18px}
.stub em.ok{color:#9BE07A}.stub em.meh{color:#FFD25A}.stub em.bad{color:#FF6A5A}
.stub small{grid-column:1/-1;font-size:14px;opacity:.7}
.dev{font-size:14px;opacity:.7;text-align:left;line-height:1.45;margin-top:12px;word-break:break-word}
.row2{display:flex;gap:8px;margin-top:12px}.row2 .go{font-size:17px;padding:14px 10px}
`;
const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
const root = document.createElement('div'); root.id = 'st'; document.body.appendChild(root);
const live = document.createElement('div'); live.id = 'stLive'; live.className = 'st-hide';
live.innerHTML = `<div class="ph"><b id="stPh">Warming up</b><span id="stSub">…</span><div class="bar"><i id="stBar"></i></div></div><div class="fps" id="stFps">--<small>FPS</small></div><button id="stStop">Stop</button>`;
document.body.appendChild(live);
const gameUI = ['.top', '.side', '.bottom', '#toast', '#pops', '#combo', '#card'];
const hideGame = on => gameUI.forEach(q => document.querySelectorAll(q).forEach(el => el.classList.toggle('st-hide', on)));

// ---------- device ----------
function deviceInfo() {
  let gpu = 'unknown';
  try { const gl = K.renderer.getContext(); const ext = gl.getExtension('WEBGL_debug_renderer_info'); gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (e) {}
  const ua = navigator.userAgent;
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS ' + ((ua.match(/OS (\d+[_\d]*)/) || [])[1] || '').replace(/_/g, '.') : /Android/.test(ua) ? 'Android ' + ((ua.match(/Android ([\d.]+)/) || [])[1] || '') : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : 'other';
  const model = (ua.match(/Android [\d.]+; ([^;)]+)/) || [])[1] || (/iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : '');
  const browser = /CriOS|Chrome\//.test(ua) && !/Edg/.test(ua) ? 'Chrome ' + ((ua.match(/(?:Chrome|CriOS)\/(\d+)/) || [])[1] || '') : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari ' + ((ua.match(/Version\/([\d.]+)/) || [])[1] || '') : 'other';
  return { os, model: model.trim(), browser, gpu, cores: navigator.hardwareConcurrency || null, memGB: navigator.deviceMemory || null,
    screen: `${screen.width}×${screen.height}`, viewport: `${innerWidth}×${innerHeight}`, dpr: +(devicePixelRatio || 1).toFixed(2), ua };
}

// ---------- recorder ----------
let rec = null, lastNow = 0, liveBuf = [];
K.perfHook = (now, dt, phys, render, steps) => {
  const ft = lastNow ? now - lastNow : 16.7; lastNow = now;
  liveBuf.push(ft); if (liveBuf.length > 30) liveBuf.shift();
  if (rec) { rec.ft.push(ft); rec.ph.push(phys); rec.rd.push(render); rec.coins += K.coins.length; rec.n++; }
};
const q = (a, p) => { if (!a.length) return 0; const s = Float64Array.from(a).sort(); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
function summarize(r, secs) {
  const ft = r.ft, wall = ft.reduce((a, b) => a + b, 0) / 1000;
  return { fps: +(ft.length / Math.max(0.001, wall)).toFixed(1), p50: +q(ft, 0.5).toFixed(1), p95: +q(ft, 0.95).toFixed(1), p99: +q(ft, 0.99).toFixed(1),
    jank: +(ft.filter(x => x > 34).length / Math.max(1, ft.length) * 100).toFixed(1), worst: +Math.max(0, ...ft).toFixed(0),
    phys: +avg(r.ph).toFixed(2), physP95: +q(r.ph, 0.95).toFixed(2), render: +avg(r.rd).toFixed(2),
    sim: +(((K.simSteps - r.steps0) / 60) / Math.max(0.001, (performance.now() - r.t0) / 1000)).toFixed(2),
    coins: Math.round(r.coins / Math.max(1, r.n)), frames: ft.length, few: ft.length < 10, hidden: r.hidden };
}
document.addEventListener('visibilitychange', () => { if (document.hidden && rec) rec.hidden = true; });

// ---------- script ----------
const nativeDpr = Math.min(2, window.devicePixelRatio || 1);
const FAST = /[?&]fast/.test(location.search) ? 0.25 : 1; // QA only
const sleep = ms => new Promise(r => setTimeout(r, ms));
let stopped = false, target = 0, topper = null;
function holdCoins(n) { target = n; }
function startTopper() { topper = setInterval(() => { const need = target - K.coins.length; for (let i = 0; i < Math.min(14, need); i++) K.addLooseCoin(); }, 90); }
async function reach(n, maxMs = 6000) { holdCoins(n); const t0 = performance.now(); while (K.coins.length < n * 0.97 && performance.now() - t0 < maxMs && !stopped) await sleep(100); }
async function measure(name, secs, info = {}) {
  if (stopped) return null;
  rec = { ft: [], ph: [], rd: [], coins: 0, n: 0, t0: performance.now(), steps0: K.simSteps, hidden: false };
  const end = performance.now() + secs * 1000 * FAST;
  while (performance.now() < end && !stopped) { await sleep(100); }
  const s = summarize(rec, secs); rec = null; return Object.assign({ name }, info, s);
}
function buildPlan() {
  const mx = [[nativeDpr, true], [1.5, true], [1.5, false], [1, true], [1, false]].filter(([d], i, a) => d <= nativeDpr + 0.01 && a.findIndex(([d2, s2]) => d2 === d && s2 === a[i][1]) === i);
  return { mx, total: 4 + 8 + 4 * 7 + 8 + mx.length * 6 + 45 + 20 };
}
let doneSecs = 0, planTotal = 1;
function setPhase(t, sub) { $('stPh').textContent = t; $('stSub').textContent = sub; }
const tick = setInterval(() => {
  if (!liveBuf.length) return; const f = 1000 / avg(liveBuf); const el = $('stFps');
  el.firstChild.nodeValue = Math.round(f); el.className = 'fps' + (f < 40 ? ' bad' : f < 55 ? ' warn' : '');
  if (rec || target) $('stBar').style.width = Math.min(100, (doneSecs + (rec ? (performance.now() - rec.t0) / 1000 : 0)) / planTotal * 100) + '%';
}, 250);

async function run() {
  stopped = false; const results = []; const plan = buildPlan(); planTotal = plan.total; doneSecs = 0;
  let wake = null; try { wake = await navigator.wakeLock?.request('screen'); } catch (e) {}
  root.innerHTML = ''; live.classList.remove('st-hide'); hideGame(true);
  K.setQuality({ dpr: nativeDpr, shadows: true }); startTopper();
  const step = async (label, sub, secs, info, coins) => { if (stopped) return; setPhase(label, sub); if (coins) await reach(coins); await sleep(1200); const r = await measure(label, secs, Object.assign({ dpr: K.renderer.getPixelRatio(), shadows: true }, info)); if (r) results.push(r); doneSecs += secs + 1.5; };
  // 0. idle: estimate the display refresh rate
  setPhase('Warming up', 'measuring your screen'); holdCoins(K.coins.length); await sleep(800);
  const idle = await measure('idle', 4); doneSecs += 4; const refresh = idle ? [60, 90, 120, 144].reduce((b, h) => Math.abs(h - idle.fps) < Math.abs(b - idle.fps) ? h : b, 60) : 60;
  // 1. normal play
  await step('Normal play', '~190 coins, full quality', 8, { group: 'load' }, 190);
  // 2. ramp
  for (const n of [250, 300, 350, 400]) await step(`Load · ${n} coins`, 'piling up the tray', 7, { group: 'load' }, n);
  // 3. jackpot burst from 280 coins
  if (!stopped) { setPhase('Jackpot burst', '50-coin shower + shake'); K.trimTo(280); holdCoins(0); await sleep(1500); K.burst(); const r = await measure('Jackpot burst', 8, { group: 'burst', dpr: K.renderer.getPixelRatio(), shadows: true }); if (r) results.push(r); doneSecs += 9.5; }
  // 4. quality matrix at 330 coins
  for (const [d, sh] of plan.mx) { if (stopped) break; K.setQuality({ dpr: d, shadows: sh }); K.trimTo(340); await step(`Quality · ${d}× ${sh ? 'shadows' : 'no shadows'}`, '330 coins', 6, { group: 'quality', dpr: d, shadows: sh }, 330); }
  // 5. sustained, default quality, in 15 s buckets to catch thermal throttling
  if (!stopped) { K.setQuality({ dpr: nativeDpr, shadows: true }); K.trimTo(340); await reach(330); }
  for (let i = 0; i < 3 && !stopped; i++) { setPhase(`Endurance ${i + 1}/3`, 'does it heat up and slow down?'); const r = await measure(`Endurance ${i + 1}/3`, 15, { group: 'sustain', dpr: nativeDpr, shadows: true }); if (r) results.push(r); doneSecs += 15; }
  clearInterval(topper); holdCoins(0); live.classList.add('st-hide');
  try { wake?.release(); } catch (e) {}
  K.setQuality({ dpr: nativeDpr, shadows: true });
  if (stopped && results.length < 3) { intro('Test stopped. Run it again when you are ready.'); hideGame(false); return; }
  report(grade(results, refresh, idle), results);
}

// ---------- grading ----------
const TIERS = [
  { id: 'ULTRA', note: `full quality` },
  { id: 'HIGH', note: '1.5× resolution, shadows' },
  { id: 'MEDIUM', note: 'lower res or no shadows' },
  { id: 'LOW', note: '1× resolution, no shadows' },
  { id: 'STRUGGLES', note: 'needs fewer coins' },
];
function grade(R, refresh, idle) {
  const goal = Math.min(55, refresh * 0.9);
  const ok = r => r && !r.few && r.fps >= goal && r.jank < 5 && !r.hidden;
  const by = n => R.find(r => r.name === n);
  const qual = R.filter(r => r.group === 'quality');
  const pick = qual.find(ok);
  let tier;
  if (!pick) tier = 'STRUGGLES';
  else if (pick === qual[0]) tier = 'ULTRA';
  else if (pick.dpr >= 1.5 && pick.shadows) tier = 'HIGH';
  else if (pick.dpr >= 1.5 || pick.shadows) tier = 'MEDIUM';
  else tier = 'LOW';
  const loads = R.filter(r => r.group === 'load');
  const maxOk = loads.filter(ok).reduce((m, r) => Math.max(m, r.coins), 0);
  const flags = [];
  const sus = R.filter(r => r.group === 'sustain');
  if (sus.length === 3 && !sus[0].few && !sus[2].few) { const drop = (sus[0].fps - sus[2].fps) / sus[0].fps; if (drop > 0.12) flags.push(`Gets ${Math.round(drop * 100)}% slower after a minute. Likely heat throttling.`); }
  const q330 = qual.find(r => !r.few);
  if (q330 && q330.sim < 0.95) flags.push(`At 330 coins the physics falls behind (runs at ${Math.round(q330.sim * 100)}% speed). Coins move in slow motion.`);
  if (q330 && q330.physP95 > 8) flags.push(`Physics is heavy here (${q330.physP95} ms per frame at the worst moments). The CPU is the limit, so lower resolution won't fully fix it.`);
  const lo = qual.filter(r => !r.few).pop();
  if (q330 && lo && lo !== q330 && lo.fps - q330.fps > 12 && q330.physP95 < 6) flags.push(`Dropping resolution and shadows gives +${Math.round(lo.fps - q330.fps)} fps. The GPU is the limit, so adaptive quality would fix it.`);
  const b = by('Jackpot burst'); if (b && b.worst > 120) flags.push(`The jackpot shower caused a ${b.worst} ms hitch. Spread the shower out more.`);
  if (R.some(r => r.few)) flags.push('Some phases had too few frames to measure. The device is far too slow for this load.');
  if (R.some(r => r.hidden)) flags.push('The app went to the background during the test. Those numbers are unreliable.');
  if (refresh > 60) flags.push(`Screen runs at ${refresh} Hz. The game targets 60, so ${refresh} fps isn't the bar.`);
  return { tier, pick, maxOk, flags, refresh, goal: Math.round(goal), idleFps: idle?.fps };
}

// ---------- report ----------
let lastText = '', lastJson = '';
function report(G, R) {
  const D = deviceInfo();
  const ti = TIERS.findIndex(t => t.id === G.tier), lvl = TIERS.length - 1 - ti; // 4 = ultra, 0 = struggles
  const cls = r => r.fps >= G.goal && r.jank < 5 ? 'ok' : r.fps >= G.goal * 0.75 ? 'meh' : 'bad';
  const headline = { ULTRA: 'Rings the bell.', HIGH: 'Strong arm.', MEDIUM: 'Decent swing.', LOW: 'Needs a lighter hammer.', STRUGGLES: 'The puck barely moves.' }[G.tier];
  const advice = G.pick ? `Plays smooth at 330 coins with ${G.pick.dpr}× resolution and ${G.pick.shadows ? 'shadows on' : 'shadows off'}. Holds ${G.goal}+ fps up to ${G.maxOk || 'fewer than 190'} coins at full quality.`
    : `Even at 1× without shadows it doesn't hold ${G.goal} fps at 330 coins. Cap the board lower on this kind of phone (smooth up to ${G.maxOk || 'fewer than 190'} coins).`;
  const segCol = ['#FF5A5A', '#FF9A4D', '#FFD25A', '#9BE07A', '#5AC8E0'];
  root.innerHTML = `<div class="scrim"></div><div class="card">
    <h1><small>THE HIGH STRIKER</small>${G.tier}</h1>
    <div class="striker"><div class="tower"><div class="bell ${lvl === 4 ? 'ring' : ''}"></div>
      ${segCol.map((c, i) => `<div class="seg ${i <= lvl ? 'lit' : ''}" style="background:${c};color:${c};bottom:${8 + i * 57}px;height:50px"></div>`).join('')}
      <div class="puck" id="puck"></div></div>
      <div class="marks">${TIERS.slice().reverse().map((t, i) => `<div class="${i === lvl ? 'on' : ''}">${t.id}<small>${t.note}</small></div>`).join('')}</div></div>
    <div class="verdict"><b>${headline}</b><p>${advice}</p></div>
    ${G.flags.length ? `<ul class="flags">${G.flags.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
    <div class="row2"><button class="go" id="stCopy">COPY RESULTS</button>${navigator.share ? '<button class="go" id="stShare">SHARE</button>' : ''}</div>
    <div class="stubs">${R.map(r => `<div class="stub"><b>${r.name}</b><em class="${r.few ? 'bad' : cls(r)}">${r.few ? '–' : Math.round(r.fps)}</em><span>fps</span><small>${r.few ? 'too few frames to measure · ' : ''}${r.coins} coins · p95 ${r.p95} ms · ${r.jank}% janky · physics ${r.phys} ms${r.sim < 0.97 ? ' · sim ' + Math.round(r.sim * 100) + '%' : ''}</small></div>`).join('')}</div>
    <div class="dev">${[D.model, D.os, D.browser].filter(Boolean).join(' · ')}<br>GPU: ${D.gpu}<br>${D.cores || '?'} cores · ${D.memGB ? D.memGB + ' GB' : 'memory hidden'} · ${D.viewport} @${D.dpr}× · ${G.refresh} Hz</div>
    <button class="ghostbtn" id="stAgain">Run again</button>${window.SHOVE_STRESS ? '' : '<button class="ghostbtn" id="stBack">Back to the machine</button>'}
    <div class="fine">${VERSION}. Paste the copied results in the ClickUp chat.</div></div>`;
  setTimeout(() => { const p = $('puck'); if (p) p.style.bottom = (12 + lvl * 57 + 18) + 'px'; }, 60);
  if (lvl === 4) try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = 1568; g.gain.setValueAtTime(0.0001, a.currentTime + 1.5); g.gain.exponentialRampToValueAtTime(0.12, a.currentTime + 1.52); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 3.2); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 3.3); } catch (e) {}
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  lastText = [`SHOVE stress test · ${VERSION} · ${stamp}`, `Device: ${[D.model, D.os, D.browser].filter(Boolean).join(' · ')} · GPU ${D.gpu} · ${D.cores || '?'} cores · ${D.memGB || '?'} GB · ${D.viewport}@${D.dpr}x · ${G.refresh} Hz`,
    `Verdict: ${G.tier}. ${advice}`, ...G.flags.map(f => `! ${f}`), 'Phases (fps · p95 ms · jank% · physics ms · coins · sim):',
    ...R.map(r => `- ${r.name}: ${r.fps} · ${r.p95} · ${r.jank}% · ${r.phys} (p95 ${r.physP95}) · ${r.coins} · ${Math.round(r.sim * 100)}%${r.hidden ? ' · INTERRUPTED' : ''}`)].join('\n');
  lastJson = JSON.stringify({ v: VERSION, at: stamp, device: D, grade: { tier: G.tier, maxOk: G.maxOk, refresh: G.refresh, flags: G.flags }, phases: R });
  $('stCopy').onclick = async () => { const txt = lastText + '\n\nJSON: ' + lastJson; try { await navigator.clipboard.writeText(txt); $('stCopy').textContent = 'COPIED ✓'; } catch (e) { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); $('stCopy').textContent = 'COPIED ✓'; } };
  if ($('stShare')) $('stShare').onclick = () => navigator.share({ title: 'SHOVE stress test', text: lastText + '\n\nJSON: ' + lastJson }).catch(() => {});
  $('stAgain').onclick = () => run();
  if ($('stBack')) $('stBack').onclick = () => { location.href = location.pathname; };
  window.__stress = { G, R, text: lastText };
}

function intro(msg) {
  hideGame(true);
  root.innerHTML = `<div class="scrim"></div><div class="card">
    <h1><small>THE HIGH STRIKER</small>HOW HARD CAN<br>YOUR PHONE<br>PUSH?</h1>
    <p class="lede">${msg || 'Two minutes of the real machine at full blast: up to 400 coins, a jackpot shower, every quality setting and a heat test.'}</p>
    <div class="rules"><span>⏱ ~2½ min</span><span>🔆 keep the screen on</span><span>📵 close other apps</span></div>
    <button class="go" id="stGo">SWING THE HAMMER</button>
    <div class="fine">Uses a test board. Your coins, plushies and saved machine stay untouched.</div></div>`;
  $('stGo').onclick = () => run();
}
$('stStop').onclick = () => { stopped = true; setPhase('Stopping…', ''); };
window.__stressRun = run;
intro();
