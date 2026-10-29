// Boffle in de game: vilten zeeotter-barker (DEC-112), procedureel in three.js, met idle en reacties.
// Gebruikt door scene-art.js. Geen assets nodig.
import * as THREE from 'three';

// grootte op de machine (1 = knuffelformaat); Boffle is de barker, dus net iets groter dan de prijzen
const SIZE = 1.35;

const C = { fur: 0x6E4329, furDark: 0x553220, cream: 0xF1E2C6, pink: 0xE58A9A, red: 0xC8323C, brass: 0xD9A441, ink: 0x140A0E };

function fabric(color, bump, sheen = 0xFFF1DC, amt = 0.7) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.95, metalness: 0, sheen: amt, sheenColor: new THREE.Color(sheen), sheenRoughness: 0.45, bumpMap: bump || null, bumpScale: 1.1 });
}
function stripeTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 32; const x = c.getContext('2d');
  for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#F0DEBE' : '#A81E2A'; x.fillRect(i * 16, 0, 17, 32); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1); return t;
}

export function buildBoffle(bump) {
  const g = new THREE.Group(); g.name = 'Boffle';
  const fur = fabric(C.fur, bump, 0xA67A54, 0.6), cream = fabric(C.cream, bump), pink = fabric(C.pink, bump), red = fabric(0xB0222E, bump, 0xE07060, 0.4);
  const vest = new THREE.MeshPhysicalMaterial({ map: stripeTex(), roughness: 0.92, sheen: 0.35, sheenColor: new THREE.Color(0xE8C8B0), sheenRoughness: 0.5, bumpMap: bump || null, bumpScale: 1, side: THREE.DoubleSide });
  const bead = new THREE.MeshPhysicalMaterial({ color: C.ink, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 });
  const brass = new THREE.MeshStandardMaterial({ color: C.brass, metalness: 1, roughness: 0.25 });
  const sph = (r, m, x, y, z, sx = 1, sy = 1, sz = 1, parent = g, seg = 22) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), m); s.position.set(x, y, z); s.scale.set(sx, sy, sz); s.castShadow = true; parent.add(s); return s; };

  const body = new THREE.Group(); g.add(body);
  sph(0.5, fur, 0, 0.5, 0, 1, 1.05, 0.9, body);                 // romp
  sph(0.34, cream, 0, 0.47, 0.27, 1, 1.12, 0.62, body);         // buik
  // gilet: band rond de romp, open aan de voorkant zodat de buik zichtbaar blijft
  const vg = new THREE.SphereGeometry(0.515, 40, 20, Math.PI / 2 + 0.55, Math.PI * 2 - 1.1, 0.95, 0.95);
  const v = new THREE.Mesh(vg, vest); v.position.set(0, 0.5, 0); v.scale.set(1, 1.05, 0.9); v.castShadow = true; body.add(v);
  // staart
  sph(0.18, fur, 0, 0.18, -0.48, 0.8, 0.45, 1.7, body);
  // voeten
  sph(0.16, fur, -0.22, 0.08, 0.3, 1, 0.65, 1.35, body); sph(0.16, fur, 0.22, 0.08, 0.3, 1, 0.65, 1.35, body);
  sph(0.09, cream, -0.22, 0.06, 0.48, 1, 0.5, 0.6, body); sph(0.09, cream, 0.22, 0.06, 0.48, 1, 0.5, 0.6, body);

  // armen in een draaipunt bij de schouder, zodat ze kunnen zwaaien
  const arms = [-1, 1].map(sx => { const p = new THREE.Group(); p.position.set(sx * 0.42, 0.78, 0.08); body.add(p);
    const a = sph(0.15, fur, sx * 0.06, -0.2, 0.04, 1, 1.5, 1, p); a.rotation.z = sx * 0.25; sph(0.1, fur, sx * 0.1, -0.42, 0.08, 1, 0.9, 1, p); p.userData.sx = sx; return p; });

  // strik + bel
  const bow = new THREE.Group(); bow.position.set(0, 0.83, 0.4); body.add(bow);
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.18, 4), red); w.rotation.z = sx * Math.PI / 2; w.position.x = sx * 0.09; w.castShadow = true; bow.add(w); }
  sph(0.045, red, 0, 0, 0.01, 1, 1, 1, bow, 12);
  const bellPivot = new THREE.Group(); bellPivot.position.set(0, 0.76, 0.43); body.add(bellPivot);
  const prof = [[0, 0], [0.03, 0.005], [0.07, 0.03], [0.095, 0.08], [0.1, 0.13], [0.115, 0.15], [0.115, 0.165], [0, 0.165]].map(([x, y]) => new THREE.Vector2(x, -y));
  const bell = new THREE.Mesh(new THREE.LatheGeometry(prof.reverse(), 28), brass); bell.position.y = -0.02; bell.castShadow = true; bellPivot.add(bell);
  sph(0.03, brass, 0, -0.19, 0, 1, 1, 1, bellPivot, 10);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 6, 16), brass); loop.position.y = 0.0; bellPivot.add(loop);

  // hoofd
  const head = new THREE.Group(); head.position.set(0, 1.04, 0.03); body.add(head);
  sph(0.4, fur, 0, 0.04, 0, 1.04, 0.96, 0.95, head);
  sph(0.23, cream, 0, -0.06, 0.27, 1.3, 0.85, 0.85, head);      // snuit
  sph(0.07, pink, 0, 0.0, 0.47, 1.35, 0.9, 1, head);            // neus
  sph(0.05, pink, 0, -0.16, 0.42, 1.4, 0.45, 0.6, head);        // mondje
  const eyes = [-1, 1].map(sx => { const e = sph(0.055, bead, sx * 0.15, 0.12, 0.33, 1, 1, 0.8, head, 16); sph(0.015, cream, sx * 0.15 + 0.018, 0.14, 0.375, 1, 1, 1, head, 8); return e; });
  for (const sx of [-1, 1]) { sph(0.1, fur, sx * 0.3, 0.33, -0.02, 1, 0.8, 0.55, head); sph(0.055, cream, sx * 0.3, 0.33, 0.02, 1, 0.8, 0.4, head, 12); }
  const wh = new THREE.MeshBasicMaterial({ color: 0xF6EBD5 });
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.32, 4), wh); w.rotation.z = Math.PI / 2 + sx * (k - 1) * 0.18; w.position.set(sx * 0.3, -0.04 + (k - 1) * 0.03, 0.36); head.add(w); }

  g.userData = { body, head, arms, eyes, bellPivot, t: 0, hop: 0, wave: 0, cheer: 0, blink: 2 + Math.random() * 2 };
  return g;
}

// per frame; ev = { win, big, prize } vlaggen sinds de vorige frame
export function animateBoffle(g, dt, ev) {
  const u = g.userData; u.t += dt;
  if (ev.prize) u.cheer = 1.6; if (ev.big) u.wave = Math.max(u.wave, 1.4); if (ev.win && u.hop <= 0) u.hop = 0.32;
  const breathe = Math.sin(u.t * 2.2) * 0.015;
  u.body.scale.set(SIZE * (1 - breathe * 0.5), SIZE * (1 + breathe), SIZE * (1 - breathe * 0.5));
  // hupje bij een gewonnen munt
  let y = 0; if (u.hop > 0) { u.hop -= dt; const k = 1 - u.hop / 0.32; y = Math.sin(k * Math.PI) * 0.12; }
  if (u.cheer > 0) { u.cheer -= dt; y = Math.abs(Math.sin(u.cheer * 9)) * 0.18; }
  u.body.position.y = y * SIZE;
  // hoofd: rustig rondkijken
  u.head.rotation.z = Math.sin(u.t * 0.7) * 0.08; u.head.rotation.y = Math.sin(u.t * 0.43) * 0.25; u.head.rotation.x = Math.sin(u.t * 0.9) * 0.04;
  // armen
  const [L, R] = u.arms;
  if (u.cheer > 0) { L.rotation.z = -2.5; R.rotation.z = 2.5; }
  else if (u.wave > 0) { u.wave -= dt; L.rotation.z = THREE.MathUtils.lerp(L.rotation.z, 0, 0.2); R.rotation.z = 2.2 + Math.sin(u.wave * 16) * 0.45; }
  else { L.rotation.z = THREE.MathUtils.lerp(L.rotation.z, Math.sin(u.t * 1.3) * 0.06, 0.15); R.rotation.z = THREE.MathUtils.lerp(R.rotation.z, -Math.sin(u.t * 1.3) * 0.06, 0.15); }
  // bel slingert mee
  const swing = (u.wave > 0 || u.cheer > 0 ? 0.6 : 0.12) * Math.sin(u.t * (u.wave > 0 || u.cheer > 0 ? 14 : 2.6));
  u.bellPivot.rotation.z = swing; u.bellPivot.rotation.x = 0.1;
  // knipperen
  u.blink -= dt; let s = 1; if (u.blink < 0.12) s = 0.12; if (u.blink < 0) u.blink = 2.5 + Math.random() * 3;
  u.eyes.forEach(e => e.scale.y = s);
}
