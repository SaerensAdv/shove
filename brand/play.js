// Bofflebell gameplay-laag v0.9: muntgleuven, aardbeving bij de giant coin, sterkere shake, minder rad, economie-meting.
// Werkt bovenop main.js via window.__k (main.js blijft onaangeroerd). ?econ start een meting en toont het resultaat.
import * as THREE from 'three';

const qs = location.search + location.hash;
const STRESS = /[?&#]stress/.test(qs) || !!window.SHOVE_STRESS;
const st = { slots: [], marks: [], sel: 1, quake: 0, qAmp: 0, jolt: 0, waves: [], cam: null, scene: null, prevShakes: null, giants: new WeakSet(), ac: null };
window.bbPlay = st;

// ---------- balans: rad minder vaak (ringhit moet preciezer, lucky token zeldzamer) ----------
function tune(k) { k.CFG.ringTol = 0.09; k.CFG.starChance = 1 / 320; }

// ---------- gleuven ----------
const BASE = [-1.9, 0, 1.9], EXTRA = [-0.95, 0.95];
function slotXs(k) { return k.save.level >= 3 ? [-1.9, -0.95, 0, 0.95, 1.9] : BASE; }
function buildMarks(scene, k) {
  const brass = new THREE.MeshStandardMaterial({ color: 0xD3A04A, metalness: 1, roughness: 0.25 });
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFD27A).multiplyScalar(1.8), transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false });
  for (const x of [...BASE, ...EXTRA]) {
    const g = new THREE.Group(); g.position.set(x, k.CFG.dropY + 0.32, k.CFG.dropZ);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 10, 32), brass); ring.rotation.x = Math.PI / 2; g.add(ring);
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.1), new THREE.MeshStandardMaterial({ color: 0x1A0F14, roughness: 0.6 })); slit.position.y = 0.01; g.add(slit);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.42, 28), glow.clone()); halo.rotation.x = -Math.PI / 2; halo.position.y = -0.02; g.add(halo);
    g.userData = { x, halo }; scene.add(g); st.marks.push(g);
  }
}
// main.js mikt via een straal op het vlak y = 1.5; we zoeken de gleuf die het dichtst bij dat raakpunt ligt
// en rekenen terug welke schermpositie main.js exact op die gleuf laat uitkomen.
const _ray = new THREE.Raycaster(), _pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.5), _hit = new THREE.Vector3(), _v = new THREE.Vector3();
function nearestSlot(e, k) {
  if (!st.cam) return null; const r = k.renderer.domElement.getBoundingClientRect();
  _ray.setFromCamera({ x: (e.clientX - r.left) / r.width * 2 - 1, y: -(e.clientY - r.top) / r.height * 2 + 1 }, st.cam);
  if (!_ray.ray.intersectPlane(_pl, _hit)) return null;
  const xs = slotXs(k); let x = xs[0]; for (const c of xs) if (Math.abs(c - _hit.x) < Math.abs(x - _hit.x)) x = c;
  _v.set(x, 1.5, _hit.z).project(st.cam); return { x, sx: r.left + (_v.x + 1) / 2 * r.width };
}
// Echte tik op de machine: we sturen hem door met de x van de dichtstbijzijnde gleuf, zodat main.js zijn eigen logica (geluid, vasthouden, tutorial) houdt.
function snapInput(k) {
  const cv = k.renderer.domElement;
  const relay = e => { if (!e.isTrusted || e.target !== cv || !k.ready) return; const s = nearestSlot(e, k); if (!s) return;
    e.stopImmediatePropagation(); st.sel = slotXs(k).indexOf(s.x); audio();
    cv.dispatchEvent(new PointerEvent(e.type, { clientX: s.sx, clientY: e.clientY, pointerId: e.pointerId, pointerType: e.pointerType, isPrimary: e.isPrimary, bubbles: true, cancelable: true })); };
  window.addEventListener('pointerdown', relay, true); window.addEventListener('pointermove', relay, true);
}

// ---------- geluid (eigen kanaal, volgt de sound-instelling) ----------
function audio() { if (st.ac) { if (st.ac.state === 'suspended') st.ac.resume(); return st.ac; } try { st.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} return st.ac; }
function boom(k, big = 1) { if (!k.save.sound || !st.ac) return; const a = st.ac, t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.6); g.gain.setValueAtTime(0.32 * big, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.8);
  const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; const ng = a.createGain(); ng.gain.value = 0.22 * big; n.buffer = b; n.connect(f); f.connect(ng); ng.connect(a.destination); n.start(t); }
const buzz = (k, p) => { if (k.save.haptics) try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

// ---------- aardbeving bij de giant coin ----------
function quake(k, x, z) {
  st.quake = 0.75; st.qAmp = 0.16; buzz(k, [90, 40, 160]); boom(k, 1);
  for (const c of k.coins) { const t = c.body.translation(), dx = t.x - x, dz = t.z - z, d = Math.hypot(dx, dz); if (d > 5.5) continue; const f = 1 - d / 5.5;
    c.body.wakeUp(); c.body.applyImpulse({ x: (dx / (d || 1)) * 0.09 * f + (Math.random() - 0.5) * 0.04, y: 0.16 + 0.22 * f * Math.random() + 0.06, z: (dz / (d || 1)) * 0.06 * f + 0.07 * f }, true); }
  for (const p of k.prizes) { p.body.wakeUp(); p.body.applyImpulse({ x: 0, y: 0.5, z: 0.55 }, true); }
  k.sparkBurst(x, 0.25, z, 40, 1.6);
  const w = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.42, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFD27A).multiplyScalar(2), transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  w.rotation.x = -Math.PI / 2; w.position.set(x, 0.3, z); st.scene.add(w); st.waves.push({ m: w, t: 0 });
}
function watchGiants(k) {
  for (const c of k.coins) { if (!c.giant || st.giants.has(c)) continue; const t = c.body.translation(), v = c.body.linvel();
    if (!c._bbArmed && t.y > 1.6) c._bbArmed = true;
    if (c._bbArmed && t.y < 1.15 && v.y > -2.5) { st.giants.add(c); quake(k, t.x, t.z); } }
}

// ---------- sterkere shake ----------
function strongerShake(k) {
  const b = document.getElementById('bShake'); if (!b) return; let before = 0;
  b.addEventListener('click', () => { before = k.save.shakes; }, true);
  b.addEventListener('click', () => { if (k.save.shakes >= before) return;
    const kick = (s) => { for (const c of k.coins) { c.body.wakeUp(); c.body.applyImpulse({ x: (Math.random() - 0.5) * 0.1 * s, y: (0.1 + Math.random() * 0.12) * s, z: (0.1 + Math.random() * 0.14) * s }, true); }
      for (const p of k.prizes) { p.body.wakeUp(); p.body.applyImpulse({ x: 0, y: 0.35 * s, z: 0.45 * s }, true); } };
    kick(1); setTimeout(() => kick(0.6), 170); st.quake = Math.max(st.quake, 0.45); st.qAmp = Math.max(st.qAmp, 0.09); buzz(k, [50, 30, 70]); audio(); boom(k, 0.55); });
}

// ---------- economie-meting (?econ): 60 s opwarmen, dan 5 min spelen met 3 drops per seconde ----------
function econ(k) {
  const out = document.createElement('pre'); out.id = 'bbEcon'; out.style.cssText = 'position:fixed;left:8px;right:8px;top:40%;z-index:30;background:#F6EBD5;color:#1A0F14;padding:10px;font:12px ui-monospace,monospace;white-space:pre-wrap;border-radius:10px'; out.textContent = 'econ: meten...'; document.body.appendChild(out);
  setTimeout(() => { const r = {}; const t0 = performance.now(); const coins0 = k.save.coins;
    k.sim(60, 3); for (const key of Object.keys(k.stats)) k.stats[key] = 0; const lvl0 = k.save.level;
    k.sim(300, 3); const s = k.stats;
    r.drops = s.drop; r.won = s.won; r.gutter = s.gutter; r.plush = s.plush; r.spins = s.spins || 0;
    r.returnPct = +(s.won / Math.max(1, s.drop) * 100).toFixed(1); r.netPerMin = +((s.won - s.drop) / 5).toFixed(1);
    r.spinsPerHour = +((r.spins) * 12).toFixed(1); r.plushPerHour = +(s.plush * 12).toFixed(1); r.levels = k.save.level - lvl0; r.ms = Math.round(performance.now() - t0);
    out.textContent = 'ECON ' + JSON.stringify(r); window.bbEconResult = r; }, 1500);
}

// ---------- per frame ----------
function frame(scene, camera) {
  const k = window.__k; if (!k || !k.ready) return;
  if (!st.init) { st.init = true; st.scene = scene; tune(k); buildMarks(scene, k); snapInput(k); strongerShake(k); if (/[?&#]econ/.test(qs)) econ(k); }
  st.cam = camera;
  const now = performance.now(), dt = Math.min(0.05, (now - (st.last || now)) / 1000); st.last = now;
  // gleufmarkeringen: alleen ontgrendelde, de laatst gebruikte gloeit
  const xs = slotXs(k); st.marks.forEach(g => { const i = xs.indexOf(g.userData.x); g.visible = i >= 0; const on = i === st.sel;
    g.userData.halo.material.opacity = on ? 0.55 + Math.sin(now / 220) * 0.2 : 0.18; g.scale.setScalar(on ? 1.08 : 1); });
  // Boffle opzij zodat de linkergleuf vrij is
  const bo = scene.getObjectByName('Boffle'); if (bo && innerHeight >= innerWidth) bo.position.x = -3.35;
  watchGiants(k);
  // schokgolven + beven van de hele scène
  for (let i = st.waves.length - 1; i >= 0; i--) { const w = st.waves[i]; w.t += dt; const s = 1 + w.t * 14; w.m.scale.set(s, s, s); w.m.material.opacity = Math.max(0, 0.9 - w.t * 1.6); if (w.t > 0.6) { scene.remove(w.m); w.m.geometry.dispose(); st.waves.splice(i, 1); } }
  if (st.quake > 0) { st.quake -= dt; const a = st.qAmp * Math.max(0, st.quake / 0.75); scene.position.set(Math.sin(now / 23) * a, Math.abs(Math.sin(now / 31)) * a * 0.7, Math.cos(now / 27) * a * 0.5); }
  else if (scene.position.lengthSq() > 0) scene.position.set(0, 0, 0);
}

if (!STRESS) {
  const P = THREE.Scene.prototype, before = P.onBeforeRender;
  P.onBeforeRender = function (renderer, scene, camera, target) {
    const r = before.call(this, renderer, scene, camera, target);
    try { if (renderer && renderer.domElement && renderer.domElement.id === 'cv' && this.children.length > 30 && (!st.scene || this === st.scene)) frame(this, camera); } catch (e) { if (!st.err) { st.err = String(e); console.warn('bofflebell play', e); } }
    return r;
  };
}
