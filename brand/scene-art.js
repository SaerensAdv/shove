// Bofflebell 3D-art pass v1.1: vilt, messing, bel-munt, logobord, warme lampjes en kermis achter de machine.
// Losse laag bovenop main.js: haakt in op de render-call en past de bestaande scene aan. main.js blijft onaangeroerd.
// Elke stap is idempotent en faalt stil, zodat de game altijd blijft draaien.
import * as THREE from 'three';

const STRESS = /[?&#]stress/.test(location.search + location.hash) || !!window.SHOVE_STRESS;
const ART = { on: !STRESS && !/[?&#]noart/.test(location.search + location.hash) };
window.bbArt = ART;
const asset = p => new URL(p, import.meta.url).href;
const booth = () => document.body.dataset.booth || 'kermis';

// ---------- textures ----------
function canvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
function rnd(seed) { let s = seed >>> 0; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }
// vilt: lichte vezelstructuur, wordt vermenigvuldigd met de kleur van het materiaal
function feltCanvas(size = 256, seed = 7, base = 232) {
  const r = rnd(seed);
  return canvas(size, size, (x, w, h) => {
    x.fillStyle = `rgb(${base},${base},${base})`; x.fillRect(0, 0, w, h);
    const img = x.getImageData(0, 0, w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 34; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    x.putImageData(img, 0, 0);
    for (let i = 0; i < 1400; i++) { const px = r() * w, py = r() * h, a = r() * Math.PI, l = 3 + r() * 9; x.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.13)'; x.lineWidth = 0.6 + r() * 0.6;
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + 0.6) * l * 0.5, py + Math.sin(a + 0.6) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  });
}
function tex(c, rep = 1, srgb = true) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 4; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; }
const FELT = feltCanvas(256, 7, 236), FELT_B = feltCanvas(256, 11, 128);
const feltMap = rep => tex(FELT, rep), feltBump = rep => tex(FELT_B, rep, false);

// bel-munt: messing met reliëfrand en een bel in het midden
function bellPath(x, cx, cy, s) {
  x.beginPath();
  x.moveTo(cx, cy - 0.62 * s);
  x.bezierCurveTo(cx - 0.36 * s, cy - 0.62 * s, cx - 0.42 * s, cy - 0.2 * s, cx - 0.44 * s, cy + 0.18 * s);
  x.lineTo(cx - 0.56 * s, cy + 0.34 * s); x.quadraticCurveTo(cx, cy + 0.44 * s, cx + 0.56 * s, cy + 0.34 * s);
  x.lineTo(cx + 0.44 * s, cy + 0.18 * s);
  x.bezierCurveTo(cx + 0.42 * s, cy - 0.2 * s, cx + 0.36 * s, cy - 0.62 * s, cx, cy - 0.62 * s);
  x.closePath();
}
function coinFace() {
  return canvas(256, 256, (x) => {
    const g = x.createRadialGradient(100, 90, 10, 128, 128, 128); g.addColorStop(0, '#FFE7A6'); g.addColorStop(0.5, '#E2B04A'); g.addColorStop(1, '#9A6A1C');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const ring = (r, w, col) => { x.beginPath(); x.arc(128, 128, r, 0, Math.PI * 2); x.lineWidth = w; x.strokeStyle = col; x.stroke(); };
    ring(118, 12, '#7A4E12'); ring(116, 3, '#FFE9B0'); ring(96, 3, '#7A4E12'); ring(94, 2, '#FFE9B0');
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; x.beginPath(); x.arc(128 + Math.cos(a) * 106, 128 + Math.sin(a) * 106, 3, 0, Math.PI * 2); x.fillStyle = i % 2 ? '#FFE9B0' : '#8A5A16'; x.fill(); }
    // schaduw, dan de bel zelf
    x.save(); x.translate(5, 6); bellPath(x, 128, 132, 92); x.fillStyle = 'rgba(90,55,10,.75)'; x.fill(); x.restore();
    bellPath(x, 128, 132, 92); const bg = x.createLinearGradient(90, 70, 170, 180); bg.addColorStop(0, '#FFF1C4'); bg.addColorStop(0.45, '#F2C14E'); bg.addColorStop(1, '#A87418'); x.fillStyle = bg; x.fill();
    x.lineWidth = 3; x.strokeStyle = '#7A4E12'; x.stroke();
    x.beginPath(); x.arc(128, 74, 9, 0, Math.PI * 2); x.lineWidth = 5; x.strokeStyle = '#7A4E12'; x.stroke();
    x.beginPath(); x.arc(128, 174, 11, 0, Math.PI * 2); x.fillStyle = '#8A5A16'; x.fill();
    x.beginPath(); x.ellipse(108, 112, 6, 18, 0.2, 0, Math.PI * 2); x.fillStyle = 'rgba(255,250,225,.6)'; x.fill();
  });
}
function gradientTex(stops) { const c = canvas(2, 512, (x) => { const g = x.createLinearGradient(0, 0, 0, 512); stops.forEach(([p, col]) => g.addColorStop(p, col)); x.fillStyle = g; x.fillRect(0, 0, 2, 512); }); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function stripes(a, b, n = 12) { const t = tex(canvas(256, 64, (x) => { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(i * 256 / n, 0, 256 / n + 1, 64); } }), 1); return t; }

const SKY_K = [[0, '#0E0614'], [0.45, '#24102C'], [0.8, '#4A1A36'], [1, '#7A2E34']];

// ---------- scene upgrade ----------
const near = (c, hex, tol = 0.02) => { const o = new THREE.Color(hex); return Math.abs(c.r - o.r) < tol && Math.abs(c.g - o.g) < tol && Math.abs(c.b - o.b) < tol; };
let S = null, R = null, st = null;

function init(scene, renderer) {
  S = scene; R = renderer; st = { done: new WeakSet(), apron: [], t: 0, frame: 0 };
  renderer.toneMappingExposure = 1.02;
  const mats = new Set(); scene.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m)); });
  for (const m of mats) {
    if (!m || !m.isMeshStandardMaterial) continue;
    // chroom wordt messing: pusher, rails, lip van de goot, lamprand
    if (m.metalness === 1 && near(m.color, 0xDDE3E8)) { m.color.setHex(0xD3A04A); m.roughness = 0.3; m.envMapIntensity = 1.2; st.done.add(m); continue; }
    // kast en voorschort: vilt (kleur blijft per booth wisselen)
    if (Math.abs(m.roughness - 0.55) < 0.001 && Math.abs(m.metalness - 0.15) < 0.001) { m.map = feltMap(3); m.bumpMap = feltBump(3); m.bumpScale = 1.4; m.roughness = 0.94; m.metalness = 0; m.needsUpdate = true; st.done.add(m); continue; }
    // speelveld: diep pruimkleurig vilt
    if (near(m.color, 0x2B1846) && m.metalness > 0.5) { m.color.setHex(0x3A1430); m.map = feltMap(5); m.bumpMap = feltBump(5); m.bumpScale = 1.0; m.roughness = 0.9; m.metalness = 0; m.needsUpdate = true; st.done.add(m); continue; }
    // achterwand: crème vilt
    if (near(m.color, 0xF6EBD5) && Math.abs(m.roughness - 0.6) < 0.001) { m.map = feltMap(2); m.bumpMap = feltBump(2); m.bumpScale = 1.2; m.roughness = 0.95; m.needsUpdate = true; st.done.add(m); continue; }
    // luifel: vilt-reliëf op de strepen
    if (m.map && Math.abs(m.roughness - 0.8) < 0.001 && m.side === THREE.DoubleSide) { m.bumpMap = feltBump(6); m.bumpScale = 1.2; m.roughness = 0.92; m.needsUpdate = true; st.done.add(m); continue; }
    // muntrand: warmer messing
    if (m.metalness === 1 && near(m.color, 0xD99A22)) { m.color.setHex(0xE6B24A); m.roughness = 0.3; m.metalness = 0.85; st.done.add(m); }
  }
  // pusher: crème vilt met messing rand, zodat de munten er duidelijk op afsteken
  const pushM = new THREE.MeshStandardMaterial({ color: 0xEADBB8, map: feltMap(2), bumpMap: feltBump(2), bumpScale: 1.1, roughness: 0.93 }); st.done.add(pushM);
  scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.parameters && Math.abs((o.geometry.parameters.width || 0) - 7.96) < 0.001 && o.parent && o.parent !== scene) o.material = pushM; });
  // munten: bel op de voorkant
  const face = tex(coinFace(), 1); face.wrapS = face.wrapT = THREE.ClampToEdgeWrapping; face.repeat.set(1, 1);
  scene.traverse(o => { if (o.isInstancedMesh && Array.isArray(o.material) && o.material.length === 3) { const f = o.material[1]; if (f && f.map && f.metalness === 1 && !st.done.has(f)) { f.map = face; f.roughness = 0.3; f.metalness = 0.82; f.emissive = new THREE.Color(0x2A1804); f.needsUpdate = true; st.done.add(f); } } });
  // logobord en de lampjesrijen die het vervangt
  scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 6.4 && o.geometry.parameters.height === 1.6) st.sign = o; });
  st.signRows = []; scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'SphereGeometry' && Math.abs(o.position.z + 7.1) < 0.01 && (Math.abs(o.position.y - 5) < 0.01 || Math.abs(o.position.y - 3.2) < 0.01)) st.signRows.push(o); });
  if (st.sign) { st.signGeo0 = st.sign.geometry; st.signGeo = new THREE.PlaneGeometry(6.0, 6.0 * 339 / 720);
    new THREE.TextureLoader().load(asset('../assets/intro/logo-720.webp'), t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; st.logo = t; }); }
  // reuzenrad: warmer, met meer lampjes
  scene.traverse(o => { if (o.isGroup && !st.wheel && o.children.some(c => c.geometry && c.geometry.type === 'TorusGeometry' && c.geometry.parameters.radius === 7)) st.wheel = o; });
  if (st.wheel) { st.wheel.children.forEach(c => { if (c.material && c.material.isMeshBasicMaterial && near(c.material.color, 0x3A1E4A)) c.material.color.setHex(0x7A3A5E); }); }
  buildFair(scene);
  buildTrim(scene);
  vignette();
}

// messing randen en een lampjesrij op het voorschort
function buildTrim(scene) {
  const brass = new THREE.MeshStandardMaterial({ color: 0xD3A04A, metalness: 1, roughness: 0.28 });
  const g = new THREE.Group(); g.name = 'bbTrim'; scene.add(g);
  const bar = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), brass); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  const W = 4, front = 5;
  bar(9.9, 0.14, 0.14, 0, -0.2, front + 1.5);          // bovenrand voorschort
  bar(9.9, 0.1, 0.1, 0, -1.58, front + 1.5);           // onderrand voorschort
  for (const sx of [-1, 1]) { bar(0.5, 0.12, 9.5, sx * (W + 0.35), 2.92, -2.6); bar(0.12, 0.12, 0.12, sx * (W + 0.35), 2.92, 2.15); }
  bar(9.1, 0.14, 0.5, 0, 4.88, -7.4);                  // bovenrand achterpaneel
  // lampjes op het voorschort, lopend licht
  const geo = new THREE.SphereGeometry(0.11, 12, 8);
  st.apronOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFE38A).multiplyScalar(2.2), toneMapped: false });
  st.apronOff = new THREE.MeshBasicMaterial({ color: 0x7A4A1E });
  for (let i = 0; i < 22; i++) { const b = new THREE.Mesh(geo, st.apronOn); b.position.set(-4.62 + i * 0.44, -0.9, front + 1.52); g.add(b); st.apron.push(b);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.06, 14), brass); cup.rotation.x = Math.PI / 2; cup.position.set(b.position.x, -0.9, front + 1.49); g.add(cup); }
  // warme gloed vanaf het voorschort op het speelveld
  const glow = new THREE.PointLight(0xFFB060, 6, 9, 2); glow.position.set(0, 0.6, front + 2.2); g.add(glow); st.apronLight = glow;
}

// kermis achter de machine: tenten, lampjesslingers, grond
function buildFair(scene) {
  const g = new THREE.Group(); g.name = 'bbFair'; scene.add(g); st.fair = g;
  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshStandardMaterial({ color: 0x2E1428, roughness: 0.55, metalness: 0.25 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -1.62, -20); ground.receiveShadow = false; g.add(ground);
  const tents = [[-7.2, -12.5, 2.6, 4.6, 0], [7.4, -13, 2.8, 5.0, 1], [-2.6, -15.5, 2.2, 4.2, 2], [3.2, -16.5, 2.4, 4.8, 0], [-11, -16, 3, 5.6, 1], [11.5, -17, 3.2, 6, 2], [0, -20, 3.4, 6.4, 1]];
  const pairs = [['#C8323C', '#F3E3C6'], ['#C8323C', '#E9B24A'], ['#5A2A6A', '#F3E3C6']];
  const glowM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFFC060).multiplyScalar(1.6), toneMapped: false });
  for (const [x, z, r, h, p] of tents) {
    const sm = new THREE.MeshStandardMaterial({ map: stripes(pairs[p][0], pairs[p][1], 14), bumpMap: feltBump(4), bumpScale: 1, roughness: 0.92, emissive: 0x2A0A12, emissiveIntensity: 0.6 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h * 0.45, 28, 1, true), sm); body.position.set(x, -1.62 + h * 0.225, z); g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.12, h * 0.6, 28, 1, true), sm); roof.position.set(x, -1.62 + h * 0.45 + h * 0.3, z); g.add(roof);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(r * 0.7, h * 0.36), glowM); door.position.set(x, -1.62 + h * 0.18, z + r + 0.01); g.add(door);
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0xD3A04A, metalness: 1, roughness: 0.3 })); flag.position.set(x, -1.62 + h * 1.05 + 0.25, z); g.add(flag);
  }
  const fairLight = new THREE.PointLight(0xFFA860, 40, 26, 2); fairLight.position.set(0, 4, -13); g.add(fairLight);
  // slingers met lampjes tussen de tenten
  const bulb = new THREE.SphereGeometry(0.09, 8, 6), cols = [0xFFE38A, 0xFF9A6A, 0xFFE38A, 0xFFF1C8];
  st.fairBulbs = [];
  const sling = (a, b, n, sag) => { for (let i = 0; i <= n; i++) { const k = i / n, p = new THREE.Vector3().lerpVectors(a, b, k); p.y -= Math.sin(k * Math.PI) * sag;
    const m = new THREE.Mesh(bulb, new THREE.MeshBasicMaterial({ color: new THREE.Color(cols[i % 4]).multiplyScalar(2), toneMapped: false })); m.position.copy(p); g.add(m); st.fairBulbs.push(m); } };
  sling(new THREE.Vector3(-9, 4.6, -11), new THREE.Vector3(-4.6, 5.6, -8.2), 12, 0.6);
  sling(new THREE.Vector3(4.6, 5.6, -8.2), new THREE.Vector3(9.4, 4.8, -11.5), 12, 0.6);
  sling(new THREE.Vector3(-12, 5.4, -15), new THREE.Vector3(12, 5.6, -15.5), 34, 1.6);
  // sterren
  const sp = new Float32Array(240 * 3), r = rnd(3); for (let i = 0; i < 240; i++) { sp[i * 3] = (r() - 0.5) * 90; sp[i * 3 + 1] = 8 + r() * 30; sp[i * 3 + 2] = -40 - r() * 20; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xFFF1C8, size: 0.22, transparent: true, opacity: 0.8, depthWrite: false })));
}

// zachte vignet over het canvas, onder de HUD
function vignette() {
  if (document.getElementById('bbVignette')) return;
  const v = document.createElement('div'); v.id = 'bbVignette';
  v.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(120% 90% at 50% 55%,transparent 55%,rgba(14,6,12,.55) 100%)';
  const cv = document.getElementById('cv'); cv && cv.after(v);
}

// ---------- per frame ----------
function tick() {
  st.frame++; const now = performance.now(), B = booth(), K = B === 'kermis';
  if (st.fair) st.fair.visible = K;
  if (K && (!S.background || !S.background.userData.bb)) { const t = gradientTex(SKY_K); t.userData.bb = true; S.background = t; if (S.fog) S.fog.color.setHex(0x22101E); }
  // logobord alleen op de kermis, andere booths houden hun eigen bord
  if (st.sign) {
    const useLogo = K && st.logo;
    if (useLogo && st.sign.material.map !== st.logo) { st.sign.geometry = st.signGeo; st.sign.material.map = st.logo; st.sign.material.transparent = true; st.sign.material.toneMapped = false; st.sign.material.needsUpdate = true; st.sign.position.y = 4.15; }
    if (!useLogo && st.sign.geometry === st.signGeo) { st.sign.geometry = st.signGeo0; st.sign.material.transparent = false; st.sign.material.toneMapped = true; st.sign.material.needsUpdate = true; st.sign.position.y = 4.1; }
    const hide = st.sign.geometry === st.signGeo; for (const b of st.signRows) b.visible = !hide;
  }
  // lopend licht op het voorschort
  const k = Math.floor(now / 140); st.apron.forEach((b, i) => { b.material = (i + k) % 4 === 0 ? st.apronOff : st.apronOn; });
  if (st.apronLight) st.apronLight.intensity = 5.5 + Math.sin(now / 420) * 0.8;
  if (st.fairBulbs && st.frame % 6 === 0) st.fairBulbs.forEach((b, i) => { b.visible = (i + Math.floor(now / 500)) % 7 !== 0; });
  // knuffels: vilt-reliëf op nieuwe knuffels (elke halve seconde)
  if (st.frame % 30 === 0) S.traverse(o => { if (!o.isMesh || !o.material || Array.isArray(o.material)) return; const m = o.material;
    if (st.done.has(m) || !m.isMeshStandardMaterial || m.roughness < 0.88 || m.metalness > 0.1 || m.map) return;
    m.bumpMap = feltBump(2); m.bumpScale = 0.9; m.roughness = 0.97; m.needsUpdate = true; st.done.add(m); });
}

// ---------- hook ----------
// WebGLRenderer.render is een instance-methode, dus we haken in op Scene.onBeforeRender (wordt elke render één keer per scene aangeroepen).
if (ART.on) {
  const P = THREE.Scene.prototype, before = P.onBeforeRender;
  P.onBeforeRender = function (renderer, scene, camera, target) {
    try {
      if (renderer && renderer.domElement && renderer.domElement.id === 'cv') {
        if (!S && this.children.length > 30) init(this, renderer);
        if (this === S) tick();
      }
    } catch (e) { if (!ART.err) { ART.err = String(e); console.warn('bofflebell art', e); } }
    return before.call(this, renderer, scene, camera, target);
  };
  ART.ready = true;
}
