// SHOVE · side games at the fair (v0.8): High Striker, Shooting Gallery, Claw.
// Pure skill: no hidden odds. Each play costs coins (a coin sink), the reward depends on how well you play.
export const SIDE = [
  { id: 'striker', name: 'HIGH STRIKER', icon: '🔔', cost: 5, lv: 1, blurb: 'Stop the needle in the middle. Ring the bell.' },
  { id: 'gallery', name: 'SHOOTING GALLERY', icon: '🎯', cost: 10, lv: 2, blurb: '20 seconds, 15 shots. Golden ducks are worth five.' },
  { id: 'claw', name: 'THE CLAW', icon: '🧸', cost: 15, lv: 3, blurb: 'One drop. Line it up and grab a plushie.' },
];
export function initSideGames(api) {
  const { save, persist, hud, toast, tone, buzz, $ } = api;
  const root = document.createElement('div'); root.id = 'sg'; root.className = 'hidden';
  root.innerHTML = `<canvas id="sgCv"></canvas><div class="sg-top"><b id="sgTitle"></b><span id="sgInfo"></span><button class="x" id="sgClose">×</button></div>
    <div id="sgEnd" class="hidden"><div class="panel"><h2 id="sgEndT"></h2><p id="sgEndP"></p><div id="sgEndR"></div><button class="btn" id="sgAgain">PLAY AGAIN</button><button class="pack" id="sgBack">Back to the fair</button></div></div>`;
  document.body.appendChild(root);
  const cv = $('sgCv'), x = cv.getContext('2d'); let W = 0, H = 0, dpr = 1, game = null, raf = 0, last = 0;
  const S = { open: false };
  function size() { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener('resize', () => { if (S.open) size(); });
  const F = (w, s) => `${w} ${s}px Bungee, Impact, sans-serif`, T = (w, s) => `${w} ${s}px "DM Sans", system-ui, sans-serif`;
  function stripes(a, b, n = 14, y0 = 0, h = 120) { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.beginPath(); x.moveTo(i * W / n, y0); x.lineTo((i + 1) * W / n, y0); x.lineTo((i + 1) * W / n - W / n / 2, y0 + h); x.lineTo(i * W / n - W / n / 2, y0 + h); x.fill(); } }
  function bulbs(y, t, n = 16) { for (let i = 0; i < n; i++) { const on = (i + Math.floor(t * 6)) % 3 !== 0; x.fillStyle = on ? '#FFE38A' : '#6A4A22'; x.beginPath(); x.arc((i + 0.5) * W / n, y, 4, 0, 7); x.fill(); if (on) { x.fillStyle = 'rgba(255,220,120,.18)'; x.beginPath(); x.arc((i + 0.5) * W / n, y, 10, 0, 7); x.fill(); } } }
  function backdrop(t, top = '#2A0E16') { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1B0F2E'); g.addColorStop(1, top); x.fillStyle = g; x.fillRect(0, 0, W, H); stripes('#D8343F', '#F6EBD5', 14, 54, 70); bulbs(128, t); }
  function text(s, X, Y, font, col = '#F6EBD5', al = 'center', sh = '#8A2A12') { x.font = font; x.textAlign = al; x.textBaseline = 'middle'; if (sh) { x.fillStyle = sh; x.fillText(s, X + 2, Y + 3); } x.fillStyle = col; x.fillText(s, X, Y); }
  function open(id) {
    const G = SIDE.find(g => g.id === id); if (!G) return;
    if (save.level < G.lv) { toast(`🔒 ${G.name} opens at level ${G.lv}`); return; }
    if (save.coins < G.cost) { toast(`You need ${G.cost} coins for the ${G.name}`); return; }
    save.coins -= G.cost; save.sideTotal = (save.sideTotal || 0) + 1; api.mission('side'); persist(); hud();
    S.open = true; S.G = G; root.classList.remove('hidden'); $('sgEnd').classList.add('hidden'); size();
    $('sgTitle').textContent = G.name; game = MAKE[id](); last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); tone(523, 784, 0.2, 'triangle', 0.05);
  }
  function close() { S.open = false; root.classList.add('hidden'); cancelAnimationFrame(raf); game = null; hud(); }
  function finish(title, line, rewards) {
    const parts = [];
    if (rewards.coins) { save.coins += rewards.coins; parts.push(`🪙 +${rewards.coins} coins`); }
    for (const k of ['shakes', 'walls', 'giants']) if (rewards[k]) { save[k] += rewards[k]; parts.push(`${k === 'shakes' ? '〰️ +1 shake' : k === 'walls' ? '🧱 +1 wall' : '🪙 +1 giant coin'}`); }
    if (rewards.plush) parts.push(`🧸 ${rewards.plush.name} → your shelf`);
    if (rewards.xp) api.gainXP(rewards.xp);
    persist(); hud();
    $('sgEndT').textContent = title; $('sgEndP').textContent = line; $('sgEndR').innerHTML = parts.length ? parts.map(p => `<div class="aw"><b>${p}</b></div>`).join('') : '<div class="note">No prize this time.</div>';
    $('sgAgain').textContent = `PLAY AGAIN · ${S.G.cost} 🪙`; $('sgAgain').disabled = save.coins < S.G.cost;
    setTimeout(() => $('sgEnd').classList.remove('hidden'), 450);
  }
  $('sgClose').onclick = close; $('sgBack').onclick = close; $('sgAgain').onclick = () => { const id = S.G.id; close(); open(id); };
  function loop(now) { if (!S.open) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; game.tick(dt, now / 1000); raf = requestAnimationFrame(loop); }
  cv.addEventListener('pointerdown', e => { if (game && game.tap) game.tap(e.clientX, e.clientY); });

  const MAKE = {
    // ---------- HIGH STRIKER: timing ----------
    striker() { let needle = 0, dir = 1, speed = 1.25, state = 'aim', power = 0, puck = 0, bell = 0, t0 = 0;
      const sweet = 0.5;
      return { tick(dt, t) { backdrop(t);
        const tx = W / 2, top = 190, bot = H - 250, th = bot - top;
        // tower
        x.fillStyle = '#5A1020'; x.fillRect(tx - 26, top, 52, th); x.fillStyle = '#F6EBD5'; for (let i = 0; i <= 10; i++) { const y = bot - th * i / 10; x.fillRect(tx - 26, y - 1, i % 5 ? 14 : 22, 2); }
        text('100', tx + 46, top + 8, F(400, 14), '#FFD25A', 'left', null); text('50', tx + 46, top + th / 2, F(400, 14), '#F6EBD5', 'left', null);
        // bell
        const bw = bell > 0 ? Math.sin(t * 40) * 6 * bell : 0; x.fillStyle = bell > 0 ? '#FFF3B0' : '#FFD25A'; x.beginPath(); x.moveTo(tx - 34 + bw, top - 6); x.quadraticCurveTo(tx + bw, top - 70, tx + 34 + bw, top - 6); x.fill(); x.fillStyle = '#8A5A12'; x.fillRect(tx - 38 + bw, top - 8, 76, 8);
        if (bell > 0) { bell -= dt; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + t * 3; x.fillStyle = '#FFE38A'; x.beginPath(); x.arc(tx + Math.cos(a) * 70, top - 40 + Math.sin(a) * 40, 4, 0, 7); x.fill(); } }
        // puck
        if (state === 'fly') { const k = Math.min(1, (t - t0) / 0.7), up = k < 0.6 ? Math.sin(k / 0.6 * Math.PI / 2) : 1 - (k - 0.6) / 0.4 * 0.0; puck = power * up; if (k >= 1) { state = 'done'; result(); } }
        const py = bot - 16 - (th - 20) * puck; x.fillStyle = '#C0C6CC'; x.beginPath(); x.ellipse(tx, py, 22, 12, 0, 0, 7); x.fill(); x.fillStyle = '#FFFFFF'; x.fillRect(tx - 8, py - 6, 10, 4);
        // base pad + hammer
        x.fillStyle = '#8A5A12'; x.fillRect(tx - 70, bot + 6, 140, 26); x.fillStyle = '#D8343F'; x.fillRect(tx - 54, bot - 2, 108, 10);
        // meter
        const mx = 34, mw = W - 68, my = H - 150; x.fillStyle = '#1A0F14'; x.fillRect(mx, my, mw, 34); const g = x.createLinearGradient(mx, 0, mx + mw, 0); g.addColorStop(0, '#5A1020'); g.addColorStop(0.42, '#D8343F'); g.addColorStop(0.5, '#FFD25A'); g.addColorStop(0.58, '#D8343F'); g.addColorStop(1, '#5A1020'); x.fillStyle = g; x.fillRect(mx + 3, my + 3, mw - 6, 28);
        x.fillStyle = '#FFF3B0'; x.fillRect(mx + mw * (sweet - 0.015), my - 6, mw * 0.03, 46);
        if (state === 'aim') { needle += dir * speed * dt; if (needle > 1) { needle = 1; dir = -1; } if (needle < 0) { needle = 0; dir = 1; } speed = Math.min(2.6, speed + dt * 0.08); }
        x.fillStyle = '#F6EBD5'; x.fillRect(mx + mw * needle - 3, my - 12, 6, 58);
        text(state === 'aim' ? 'TAP TO SWING' : '', W / 2, H - 80, F(400, 22), '#FFD25A');
        $('sgInfo').textContent = 'Hit the gold line';
      }, tap() { if (state !== 'aim') return; const off = Math.abs(needle - sweet); power = Math.max(0.08, 1 - off * 2.2); state = 'fly'; t0 = performance.now() / 1000; tone(140, 80, 0.2, 'square', 0.06); buzz(40); } };
      function result() { const p = Math.round(power * 100);
        if (p >= 97) { bell = 1.5; tone(1568, 1568, 0.9, 'sine', 0.08); tone(2349, 2349, 0.7, 'sine', 0.04); buzz([40, 40, 80]); finish('DING DING!', `${p} out of 100. The bell rings.`, { coins: 15, xp: 10 }); }
        else if (p >= 85) finish('STRONG!', `${p} out of 100. So close to the bell.`, { coins: 8, xp: 6 });
        else if (p >= 65) finish('NOT BAD', `${p} out of 100.`, { coins: 4, xp: 3 });
        else finish('WEAK SAUCE', `${p} out of 100. Aim for the gold line.`, { xp: 1 }); }
    },
    // ---------- SHOOTING GALLERY: aim ----------
    gallery() { let left = 20, ammo = 15, score = 0, over = false, flash = []; const ducks = [];
      const rows = [0.36, 0.52, 0.68];
      function spawn(row, now) { const dir = row % 2 ? -1 : 1, gold = Math.random() < 0.12; ducks.push({ row, x: dir > 0 ? -40 : W + 40, dir, v: (70 + row * 22 + (gold ? 80 : 0)) * (1 + (20 - left) * 0.02), gold, hit: 0 }); }
      let next = [0, 0.5, 1];
      return { tick(dt, t) { backdrop(t, '#3A1420');
        if (!over) { left -= dt; if (left <= 0 || ammo <= 0 && !ducks.some(d => d.hit > 0)) { left = Math.max(0, left); over = true; result(); } }
        rows.forEach((r, i) => { const y = H * r; x.fillStyle = '#6B3A24'; x.fillRect(0, y + 22, W, 10); next[i] -= dt; if (next[i] <= 0 && !over) { spawn(i); next[i] = 0.9 + Math.random() * 0.9; } });
        for (let i = ducks.length - 1; i >= 0; i--) { const d = ducks[i]; if (d.hit > 0) { d.hit -= dt; if (d.hit <= 0) { ducks.splice(i, 1); continue; } } else d.x += d.dir * d.v * dt;
          if (d.x < -60 || d.x > W + 60) { ducks.splice(i, 1); continue; }
          const y = H * rows[d.row]; x.save(); x.translate(d.x, y); if (d.hit > 0) x.scale(1, Math.max(0.05, d.hit / 0.3)); x.scale(d.dir, 1);
          x.fillStyle = d.gold ? '#FFD25A' : '#F6EBD5'; x.beginPath(); x.ellipse(0, 4, 22, 14, 0, 0, 7); x.fill(); x.beginPath(); x.arc(14, -12, 10, 0, 7); x.fill();
          x.fillStyle = '#FF8A2E'; x.beginPath(); x.moveTo(22, -12); x.lineTo(32, -9); x.lineTo(22, -6); x.fill(); x.fillStyle = '#1A0F14'; x.beginPath(); x.arc(16, -14, 2, 0, 7); x.fill();
          x.fillStyle = '#8A5A12'; x.fillRect(-3, 16, 6, 10); x.restore(); }
        flash = flash.filter(f => (f.t -= dt) > 0); for (const f of flash) { x.strokeStyle = `rgba(255,230,140,${f.t * 3})`; x.lineWidth = 3; x.beginPath(); x.arc(f.x, f.y, 26 - f.t * 40, 0, 7); x.stroke(); if (f.s) text(f.s, f.x, f.y - 30 + f.t * 40, F(400, 20), '#FFD25A'); }
        text(`${score}`, W / 2, H - 120, F(400, 46), '#FFD25A'); text(`⏱ ${Math.ceil(left)}s   ·   ${'●'.repeat(Math.min(ammo, 15))}`, W / 2, H - 70, T(800, 16), '#F6EBD5', 'center', null);
        $('sgInfo').textContent = '300+ wins a power-up';
      }, tap(px, py) { if (over || ammo <= 0) return; ammo--; tone(900, 200, 0.08, 'square', 0.04); buzz(10);
        let best = null; for (const d of ducks) if (!d.hit) { const y = H * rows[d.row], dd = Math.hypot(px - d.x, py - y); if (dd < 30 && (!best || dd < best.dd)) best = { d, dd }; }
        if (best) { best.d.hit = 0.3; const pts = best.d.gold ? 50 : 10; score += pts; flash.push({ x: px, y: py, t: 0.35, s: '+' + pts }); tone(best.d.gold ? 1320 : 880, 1320, 0.12, 'triangle', 0.05); } else flash.push({ x: px, y: py, t: 0.25 }); } };
      function result() { const pw = ['shakes', 'walls', 'giants'][(save.sideTotal || 0) % 3];
        if (score >= 300) finish('SHARPSHOOTER!', `${score} points.`, { coins: 20, [pw]: 1, xp: 12 });
        else if (score >= 200) finish('NICE SHOOTING', `${score} points. 300 wins a power-up.`, { coins: 14, xp: 8 });
        else if (score >= 110) finish('NOT BAD', `${score} points.`, { coins: 7, xp: 4 });
        else finish('MISSED…', `${score} points. Lead the duck a little.`, { coins: 2, xp: 1 }); }
    },
    // ---------- THE CLAW: precision ----------
    claw() { const set = api.booth().set, pool = api.PLUSH.filter(p => p.set === set), items = [];
      const missing = pool.filter(p => !save.album[p.id] && !save.album[p.id + '_gold']);
      for (let i = 0; i < 6; i++) { const P = (missing.length && i < 3 ? missing : pool)[Math.floor(Math.random() * (missing.length && i < 3 ? missing.length : pool.length))]; const img = new Image(); img.src = api.plushThumb(P.id, false); items.push({ P, img, x: 0, y: 0 }); }
      let cx = 0.5, dir = 1, state = 'move', cy = 0, held = null, slip = false, tState = 0;
      const lay = () => { const bx = 30, bw = W - 60, floor = H - 190; items.forEach((it, i) => { it.x = bx + 80 + (i % 3) * ((bw - 110) / 2.4) + (i > 2 ? 40 : 0); it.y = floor - 30 - (i > 2 ? 34 : 0); }); return { bx, bw, floor }; };
      let L = lay();
      return { tick(dt, t) { backdrop(t, '#24307A'); L = lay(); const { bx, bw, floor } = L, top = 180;
        x.fillStyle = 'rgba(180,220,255,.08)'; x.fillRect(bx, top, bw, floor - top + 20); x.strokeStyle = '#8A5A12'; x.lineWidth = 6; x.strokeRect(bx, top, bw, floor - top + 20);
        x.fillStyle = '#1A0F14'; x.fillRect(bx, floor + 20, 70, 50); text('PRIZE', bx + 35, floor + 46, F(400, 13), '#FFD25A', 'center', null);
        for (const it of items) if (it !== held) x.drawImage(it.img, it.x - 40, it.y - 40, 80, 80);
        const range = [bx + 110, bx + bw - 30]; if (state === 'move') { cx += dir * 0.42 * dt; if (cx > 1) { cx = 1; dir = -1; } if (cx < 0) { cx = 0; dir = 1; } }
        let clX = range[0] + (range[1] - range[0]) * cx, clY = top + 20 + cy;
        if (state === 'drop') { cy += 260 * dt; if (clY >= floor - 70) { state = 'grab'; tState = 0.35;
            let best = null; for (const it of items) { const d = Math.abs(it.x - clX) + Math.abs(it.y - (floor - 30)) * 0.3; if (!best || d < best.d) best = { it, d }; }
            if (best && best.d < 22) { held = best.it; slip = false; tone(660, 880, 0.15, 'triangle', 0.05); } else if (best && best.d < 34) { held = best.it; slip = true; tone(500, 600, 0.12, 'triangle', 0.04); } else { held = null; tone(220, 160, 0.2, 'sine', 0.04); } } }
        if (state === 'grab') { tState -= dt; if (tState <= 0) state = 'up'; }
        if (state === 'up') { cy -= 220 * dt; if (slip && held && cy < (floor - top) * 0.45) { held.y = floor - 30; held = null; toast('So close… it slipped!'); buzz([20, 30, 20]); } if (cy <= 0) { cy = 0; state = held ? 'carry' : 'done'; if (!held) result(); } }
        if (state === 'carry') { cx -= 0.8 * dt; if (range[0] + (range[1] - range[0]) * cx <= bx + 35) { state = 'done'; result(); } }
        clX = state === 'carry' ? Math.max(bx + 35, range[0] + (range[1] - range[0]) * cx) : clX; clY = top + 20 + cy;
        x.strokeStyle = '#C0C6CC'; x.lineWidth = 3; x.beginPath(); x.moveTo(clX, top); x.lineTo(clX, clY); x.stroke(); x.fillStyle = '#DDE3E8'; x.fillRect(clX - 18, clY - 6, 36, 12);
        const open = state === 'move' || state === 'drop' ? 1 : 0.35; x.lineWidth = 5; x.beginPath(); x.moveTo(clX - 14, clY + 4); x.lineTo(clX - 14 - 12 * open, clY + 30); x.lineTo(clX - 6, clY + 44); x.moveTo(clX + 14, clY + 4); x.lineTo(clX + 14 + 12 * open, clY + 30); x.lineTo(clX + 6, clY + 44); x.stroke();
        if (held) { held.x = clX; held.y = clY + 50; x.drawImage(held.img, held.x - 40, held.y - 40, 80, 80); }
        text(state === 'move' ? 'TAP TO DROP' : '', W / 2, H - 80, F(400, 22), '#FFD25A'); $('sgInfo').textContent = 'Centre the claw over a plushie';
      }, tap() { if (state === 'move') { state = 'drop'; tone(400, 300, 0.15, 'square', 0.03); } } };
      function result() { if (held) { const P = held.P; save.album[P.id] = (save.album[P.id] || 0) + 1; api.mission('plush'); api.checkSets(); api.showCard(P, false, save.album[P.id] === 1); tone(784, 1175, 0.2, 'triangle', 0.07); buzz([40, 50, 80]);
          finish('GOT IT!', `${P.name} is yours.`, { plush: P, xp: 15 }); }
        else finish('EMPTY CLAW', 'The claw came up empty. Centre it right over a plushie.', { xp: 1 }); }
    },
  };
  return { S, open, close };
}
