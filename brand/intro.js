// Bofflebell intro: eerste start = volledige intro (tap gate -> video met geluid -> Tap to play).
// Terugkomst = korte bel-sting. Instelling (Auto / Always / Off) in Settings. Altijd overslaanbaar.
// Ontbreken de videobestanden, dan slaat de intro zichzelf stil over.
(() => {
  // 3D-art laag (vilt, messing, bel-munt, logobord) laden naast main.js
  import('./scene-art.js').catch(e => console.warn('bofflebell art niet geladen', e));
  const KEY = 'bb_intro_mode', SEEN = 'bb_intro_seen';
  const SRC = { full: './assets/intro/intro.mp4', sting: './assets/intro/sting.mp4', poster: './assets/intro/poster.jpg' };
  const get = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function build(kind) {
    const el = document.createElement('div');
    el.id = 'bbIntro'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Bofflebell intro');
    el.innerHTML = `
      <video playsinline webkit-playsinline preload="auto" ${kind === 'full' ? `poster="${SRC.poster}"` : ''}></video>
      <div class="bbi-gate${kind === 'full' ? '' : ' hidden'}"><button class="bbi-start" type="button"><span class="bbi-bell" aria-hidden="true"></span>Tap to open the fair</button><small>Sound on for the full show</small></div>
      <button class="bbi-skip hidden" type="button">Skip</button>
      <div class="bbi-end hidden"><button class="btn bbi-play" type="button">Tap to play</button></div>`;
    document.body.appendChild(el);
    return el;
  }

  function play(kind, done) {
    const el = build(kind), v = el.querySelector('video');
    const gate = el.querySelector('.bbi-gate'), skip = el.querySelector('.bbi-skip'), end = el.querySelector('.bbi-end');
    let closed = false;
    const close = () => {
      if (closed) return; closed = true;
      try { v.pause(); } catch {}
      el.classList.add('out');
      setTimeout(() => { el.remove(); done && done(); }, reduce ? 0 : 450);
    };
    const showEnd = () => { skip.classList.add('hidden'); end.classList.remove('hidden'); end.querySelector('button').focus({ preventScroll: true }); };
    v.addEventListener('error', close, { once: true });
    v.src = kind === 'full' ? SRC.full : SRC.sting;
    v.addEventListener('ended', () => kind === 'full' ? showEnd() : close());
    skip.addEventListener('click', () => kind === 'full' ? (v.currentTime = Math.max(0, v.duration - 3.4), v.play().catch(showEnd)) : close());
    end.querySelector('button').addEventListener('click', close);
    el.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
    const start = (withSound) => {
      gate.classList.add('hidden');
      v.muted = !withSound;
      v.play().then(() => setTimeout(() => !closed && end.classList.contains('hidden') && skip.classList.remove('hidden'), 900))
        .catch(() => { v.muted = true; v.play().catch(close); });
    };
    if (kind === 'full') { el.querySelector('.bbi-start').addEventListener('click', () => start(true)); el.querySelector('.bbi-start').focus({ preventScroll: true }); }
    else { el.addEventListener('pointerdown', close, { once: true }); start(get('bb_sound', '1') !== '0'); }
  }

  function boot() {
    const mode = get(KEY, 'auto');
    if (mode === 'off') return;
    const seen = get(SEEN, '0') === '1';
    if (mode === 'always' || !seen) { play('full', () => set(SEEN, '1')); set(SEEN, '1'); }
    else play('sting');
  }

  // Instellingen: Intro Auto / Always / Off + opnieuw afspelen
  function settings() {
    const panel = document.querySelector('#settings .panel'); if (!panel || panel.querySelector('#introRow')) return;
    const anchor = panel.querySelector('.sub');
    const row = document.createElement('div'); row.className = 'setrow'; row.id = 'introRow';
    row.innerHTML = `Intro<div class="seg" role="group" aria-label="Intro"><button type="button" data-intro="auto">Auto</button><button type="button" data-intro="always">Always</button><button type="button" data-intro="off">Off</button></div>`;
    panel.insertBefore(row, anchor);
    const paint = () => row.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.intro === get(KEY, 'auto')));
    row.addEventListener('click', e => { const b = e.target.closest('[data-intro]'); if (!b) return; set(KEY, b.dataset.intro); paint(); });
    paint();
    const tut = panel.querySelector('#tutReplay');
    if (tut) { const r = document.createElement('button'); r.className = 'btn'; r.id = 'introReplay'; r.type = 'button'; r.textContent = 'Replay the intro'; tut.after(r);
      r.addEventListener('click', () => { document.getElementById('settings')?.classList.add('hidden'); play('full'); }); }
  }

  // Laadscherm: vervang het CSS-bord door het echte logo zodra het geladen is (ontbreekt het, dan blijft het bord).
  function loadingLogo() {
    const sign = document.querySelector('#loading .bb-sign'); if (!sign) return;
    const im = new Image(); im.className = 'bb-logo'; im.alt = 'Bofflebell'; im.decoding = 'async';
    im.onload = () => sign.isConnected && sign.replaceWith(im);
    im.src = './assets/intro/logo-720.webp';
  }

  // dit script staat onderaan de body: de DOM is er al, dus meteen starten (niet wachten tot three.js binnen is)
  const go = () => { loadingLogo(); settings(); boot(); };
  go();
  window.bbIntro = { play };
})();
