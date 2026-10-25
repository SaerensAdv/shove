// SHOVE · Carnival coin pusher · prototype v0.7 (Three.js + Rapier, app-ready, art + sound pass)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import RAPIER from '@dimforge/rapier3d-compat';

const $ = id => document.getElementById(id);
const CFG = {
  halfW: 4, front: 5, gutterFrom: 2.2, coinR: 0.42, coinH: 0.08, maxCoins: 230,
  pushBack: -6.0, pushFwd: -4.5, pushHalfZ: 2.0, deckY: 0.7, pushSpeed: 1.25,
  refillSecs: 30, refillCap: 60, startCoins: 120, dailyBonus: 60, prizeEvery: 25,
  dropY: 3.0, dropZ: -4.7, ringY: 2.05, ringTol: 0.42, luckyNeed: 3, starChance: 1 / 40, rainCap: 330,
};
const PLUSH = [
  { id: 'bear',  name: 'Bramblebear', col: 0xB07A4F, ear: 'round' },
  { id: 'bunny', name: 'Hopsy',       col: 0xF1E4D8, ear: 'long' },
  { id: 'frog',  name: 'Lilypad',     col: 0x6CC36A, ear: 'eyes' },
  { id: 'duck',  name: 'Quackers',    col: 0xFFD84D, ear: 'beak' },
  { id: 'pig',   name: 'Truffle',     col: 0xF5A3B5, ear: 'snout' },
  { id: 'cat',   name: 'Whisk',       col: 0x8E8E9A, ear: 'tri' },
  { id: 'panda', name: 'Bao',         col: 0xFAFAFA, ear: 'panda' },
  { id: 'fox',   name: 'Ember',       col: 0xEF7A35, ear: 'fox' },
  { id: 'owl',      name: 'Hoot',     col: 0x8B6A4E, ear: 'owl', set: 2 },
  { id: 'mouse',    name: 'Squeak',   col: 0xC9C2CF, ear: 'mouse', set: 2 },
  { id: 'raccoon',  name: 'Bandit',   col: 0x8A8A94, ear: 'raccoon', set: 2 },
  { id: 'hedgehog', name: 'Prickles', col: 0xB38A5E, ear: 'spiky', set: 2 },
  { id: 'penguin',  name: 'Waddles',  col: 0x2E3340, ear: 'penguin', set: 2 },
  { id: 'lion',     name: 'Leo',      col: 0xEDB247, ear: 'mane', set: 2 },
  { id: 'unicorn',  name: 'Sparkle',  col: 0xF7F1FA, ear: 'horn', set: 2 },
  { id: 'axolotl',  name: 'Mochi',    col: 0xF7A9C8, ear: 'gills', set: 2 },
  { id: 'polar',    name: 'Frost',    col: 0xF4F6F8, ear: 'polar', set: 3 },
  { id: 'reindeer', name: 'Dasher',   col: 0x9A6B45, ear: 'antlers', set: 3 },
  { id: 'snowman',  name: 'Flurry',   col: 0xFBFCFF, ear: 'snowman', set: 3 },
  { id: 'yeti',     name: 'Bigfoot',  col: 0xE9EEF5, ear: 'yeti', set: 3 },
  { id: 'arcfox',   name: 'Nix',      col: 0xF1F3F6, ear: 'arctic', set: 3 },
  { id: 'seal',     name: 'Blubber',  col: 0xA9B3BD, ear: 'seal', set: 3 },
  { id: 'husky',    name: 'Sled',     col: 0x7E8794, ear: 'husky', set: 3 },
  { id: 'ginger',   name: 'Crumbs',   col: 0xB8743E, ear: 'ginger', set: 3 },
];
PLUSH.forEach(p => { p.set ||= 1; });
const SETS = [{ id: 1, name: 'GARDEN PALS', lv: 1, bonus: 200 }, { id: 2, name: 'NIGHT MARKET', lv: 4, bonus: 300 }, { id: 3, name: 'WINTER FAIR', lv: 7, bonus: 400 }];
// booths: each has its own board, look, rule and plush set
const BOOTHS = [
  { id: 'kermis', name: 'KERMIS', sign: 'SHOVE', set: 1, lv: 1, sky: [[0, '#1B0F2E'], [0.55, '#4A1C3A'], [1, '#C8553D']], fog: 0x2A1230, stripe: ['#D8343F', '#F6EBD5'], cab: 0xA51E2A, warm: 0xFF9A4D, pink: 0xFF5FA2,
    rule: 'The classic. 3 lucky-ring hits give a wheel spin.', friction: 0.38, luckyNeed: 3, ringSpeed: 1 },
  { id: 'night', name: 'NIGHT MARKET', sign: 'NIGHT MARKET', set: 2, lv: 4, sky: [[0, '#05081A'], [0.6, '#1A1448'], [1, '#6A2A6A']], fog: 0x120E30, stripe: ['#2B3A8F', '#F2C14E'], cab: 0x24307A, warm: 0xFFB04D, pink: 0x7A6BFF,
    rule: 'Lantern hour: only 2 ring hits for a spin, but the ring swings faster.', friction: 0.38, luckyNeed: 2, ringSpeed: 1.5 },
  { id: 'winter', name: 'WINTER FAIR', sign: 'WINTER FAIR', set: 3, lv: 7, sky: [[0, '#0B1E33'], [0.55, '#2E5A80'], [1, '#B9D6EA']], fog: 0x1E3A55, stripe: ['#2E8FB8', '#FFFFFF'], cab: 0x2B6C8E, warm: 0xBFE4FF, pink: 0xFF8FB0,
    rule: 'Ice deck: coins slide much further. Bigger avalanches, but the gutters bite.', friction: 0.06, luckyNeed: 3, ringSpeed: 1 },
];
const booth = () => BOOTHS.find(b => b.id === save.booth) || BOOTHS[0];
const setUnlocked = s => save.level >= s.lv || !!(save.unlocked && save.unlocked[s.id]);
const boothOpen = B => setUnlocked(SETS[B.set - 1]);
const WHEEL = [
  { id: 'rain15', label: '15 COINS', icon: '🪙', w: 22, col: '#D8343F', ink: '#F6EBD5' },
  { id: 'plush', label: 'PLUSHIE', icon: '🧸', w: 13, col: '#F6EBD5', ink: '#5A1020' },
  { id: 'shake', label: '+2 SHAKE', icon: '〰️', w: 11, col: '#2F8FA6', ink: '#F6EBD5' },
  { id: 'rain25', label: '25 COINS', icon: '💰', w: 14, col: '#D8343F', ink: '#F6EBD5' },
  { id: 'giant', label: 'GIANT', icon: '🟡', w: 12, col: '#F6EBD5', ink: '#5A1020' },
  { id: 'hour', label: '×2 TIME', icon: '⏱️', w: 11, col: '#2F8FA6', ink: '#F6EBD5' },
  { id: 'walls', label: 'WALLS', icon: '🧱', w: 11, col: '#D8343F', ink: '#F6EBD5' },
  { id: 'jackpot', label: 'JACKPOT', icon: '🎰', w: 6, col: '#FFD25A', ink: '#5A1020' },
];
const MPOOL = [
  { id: 'win', t: n => `Win ${n} coins`, g: [40, 80], rw: { coins: 25 } },
  { id: 'lucky', t: n => `Hit the lucky ring ${n}×`, g: [2, 4], rw: { shakes: 1 } },
  { id: 'plush', t: n => `Win ${n} plush${n > 1 ? 'ies' : 'ie'}`, g: [1, 2], rw: { coins: 30 } },
  { id: 'spin', t: n => `Spin the wheel ${n}×`, g: [1, 2], rw: { giants: 1 } },
  { id: 'drop', t: n => `Drop ${n} coins`, g: [60, 120], rw: { coins: 20 } },
  { id: 'power', t: n => `Use ${n} power-up${n > 1 ? 's' : ''}`, g: [1, 2], rw: { walls: 1 } },
  { id: 'combo', t: n => `Hit a ×${n} combo`, g: [8, 12], rw: { coins: 25 }, max: true },
];
// ---------- save ----------
const STRESS = /[?&#]stress/.test(location.search + location.hash) || !!window.SHOVE_STRESS;
const KEY = STRESS ? 'shove_stress_tmp' : 'shove_carnival_v1';
const save = Object.assign({ coins: CFG.startCoins, lastRefill: Date.now(), xp: 0, level: 1, album: {}, shakes: 3, walls: 1, giants: 1, daily: '', dropped: 0, won: 0, sound: true, board: null, lucky: 0, spins: 0, missions: null, streak: 0, streakDay: '', setsDone: {}, booth: 'kermis', boards: {}, unlocked: {}, tut: 0, music: true, haptics: true, quality: 'auto', glow: true, ads: { day: '', n: 0 } },
  STRESS ? { coins: 1e6, sound: false, seenIntro: true, seenRing: true, board: null, tut: 99 } : (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
// ---------- native bridge: the Capacitor app build sets window.SHOVE_NATIVE, the web build leaves it empty ----------
const N = window.SHOVE_NATIVE || null, NATIVE = !!N, VERSION = '0.7';
let prefT = 0;
function persist() { if (STRESS) return; const str = JSON.stringify(save); try { localStorage.setItem(KEY, str); } catch (e) {}
  if (NATIVE && N.Preferences) { clearTimeout(prefT); prefT = setTimeout(() => { N.Preferences.set({ key: KEY, value: JSON.stringify(save) }).catch(() => {}); }, 700); } }
const xpNeed = lv => 40 + lv * 25;
if (save.setDone) save.setsDone[1] = true;
if (save.board && !save.boards.kermis) { save.boards.kermis = save.board; } delete save.board;
if (!save.tut && save.dropped > 40) save.tut = 99;   // v0.4 players already know the ropes
const buzz = p => { if (!save.haptics) return;
  if (NATIVE && N.Haptics) { const ms = Array.isArray(p) ? Math.max(...p) : p; (ms >= 60 ? N.Haptics.vibrate({ duration: Math.min(ms, 300) }) : N.Haptics.impact({ style: ms >= 30 ? 'HEAVY' : ms >= 15 ? 'MEDIUM' : 'LIGHT' })).catch(() => {}); return; }
  try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

// ---------- audio ----------
let AC = null, musicOn = false, busS = null, busM = null, NOISE = null;
// mix: sfx bus + music bus -> soft compressor -> speakers
function ac() { if (AC) return AC; AC = new (window.AudioContext || window.webkitAudioContext)();
  const comp = AC.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(AC.destination);
  busS = AC.createGain(); busS.gain.value = 1; busS.connect(comp); busM = AC.createGain(); busM.gain.value = 0.9; busM.connect(comp);
  NOISE = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return AC; }
function tone(f0, f1, d, type = 'sine', v = 0.05, delay = 0, mus = 0) { if (!save.sound) return; try { const a = ac(), o = a.createOscillator(), g = a.createGain(), t = a.currentTime + delay; o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(mus ? busM : busS); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
// filtered noise burst: the "ch" of metal on metal
function hiss(freq, q, d, v, delay = 0, type = 'bandpass') { if (!save.sound) return; try { const a = ac(), s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + delay; s.buffer = NOISE; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f); f.connect(g); g.connect(busS); s.start(t, Math.random() * 1.5); s.stop(t + d + 0.02); } catch (e) {} }
// fair ambience: crowd murmur + pusher motor hum, very quiet, on the music bus
let amb = null;
function ambience() { if (amb || !AC || !save.sound || !save.music) return; try {
  const crowd = AC.createBufferSource(); crowd.buffer = NOISE; crowd.loop = true; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.6; const cg = AC.createGain(); cg.gain.value = 0.018;
  const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 0.008; lfo.connect(lg); lg.connect(cg.gain); crowd.connect(bp); bp.connect(cg); cg.connect(busM);
  const hum = AC.createOscillator(); hum.type = 'triangle'; hum.frequency.value = 52; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160; const hg = AC.createGain(); hg.gain.value = 0.02; hum.connect(lp); lp.connect(hg); hg.connect(busM);
  crowd.start(); lfo.start(); hum.start(); amb = { crowd, lfo, hum, cg, hg }; } catch (e) {} }
function ambienceOff() { if (!amb) return; try { amb.crowd.stop(); amb.lfo.stop(); amb.hum.stop(); } catch (e) {} amb = null; }
let lastClink = 0;
function clink(v = 1, up = 1) { const n = performance.now(); if (n - lastClink < 40) return; lastClink = n; const f = (1900 + Math.random() * 700) * up;
  hiss(6500, 1.2, 0.025, 0.05 * v); tone(f, f * 0.995, 0.16, 'sine', 0.03 * v); tone(f * 2.76, f * 2.74, 0.09, 'sine', 0.012 * v); tone(f * 5.4, f * 5.38, 0.05, 'sine', 0.006 * v); }
function clatter() { hiss(2600 + Math.random() * 1800, 3, 0.04, 0.03); tone(1400 + Math.random() * 600, 1300, 0.05, 'sine', 0.012); if (Math.random() < 0.5) hiss(4200, 4, 0.03, 0.018, 0.03); }
// tiny calliope waltz
const MEL = [67, 72, 76, 74, 72, 67, 69, 71, 72, 0, 64, 67, 72, 71, 69, 67, 65, 64, 62, 0, 67, 72, 76, 79, 77, 76, 74, 72, 71, 72];
let mi = 0, nextNote = 0;
function music() {
  if (!musicOn || !save.sound || !save.music || !AC) return;
  while (nextNote < AC.currentTime + 0.3) {
    const m = MEL[mi % MEL.length], t = nextNote - AC.currentTime;
    if (m) { const f = 440 * Math.pow(2, (m - 69) / 12); tone(f, f, 0.32, 'square', 0.009, Math.max(0, t), 1); tone(f * 1.004, f * 1.004, 0.3, 'triangle', 0.012, Math.max(0, t), 1); tone(f * 2, f * 2, 0.2, 'sine', 0.006, Math.max(0, t), 1); }
    if (mi % 3 === 0) { tone(110, 100, 0.25, 'triangle', 0.022, Math.max(0, t), 1); } else { tone(220, 218, 0.12, 'triangle', 0.008, Math.max(0, t), 1); tone(277, 275, 0.12, 'triangle', 0.006, Math.max(0, t), 1); }
    mi++; nextNote += 0.24;
  }
}

// ---------- three ----------
const renderer = new THREE.WebGLRenderer({ canvas: $('cv'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 200);
let composer = null, bloomPass = null;
function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
  const portrait = h > w; camera.fov = portrait ? 50 : 40; camera.position.set(0, portrait ? 16.4 : 12.5, portrait ? 13.4 : 12.5); camera.lookAt(0, -0.6, portrait ? -0.6 : 0.4); camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize);

// night fair background
function gradientTex(stops) { const c = document.createElement('canvas'); c.width = 2; c.height = 256; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 256); stops.forEach(([p, col]) => g.addColorStop(p, col)); x.fillStyle = g; x.fillRect(0, 0, 2, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
scene.background = gradientTex([[0, '#1B0F2E'], [0.55, '#4A1C3A'], [1, '#C8553D']]);
scene.fog = new THREE.Fog(0x2A1230, 30, 80);
// lights
scene.add(new THREE.HemisphereLight(0xFFE7C2, 0x2A1230, 0.55));
const key = new THREE.DirectionalLight(0xFFF1D6, 1.6); key.position.set(4, 14, 8); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -7, right: 7, top: 9, bottom: -9, near: 1, far: 40 }); key.shadow.bias = -0.0005; scene.add(key);
const warm = new THREE.PointLight(0xFF9A4D, 8, 18, 2); warm.position.set(-5, 5, 3); scene.add(warm);
const pink = new THREE.PointLight(0xFF5FA2, 5, 16, 2); pink.position.set(5, 4, -1); scene.add(pink);

// materials
const M = {
  gold: new THREE.MeshStandardMaterial({ color: 0xD99A22, metalness: 1, roughness: 0.34 }),
  goldPlush: new THREE.MeshStandardMaterial({ color: 0xF2C14E, metalness: 0.9, roughness: 0.3 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xDDE3E8, metalness: 1, roughness: 0.18 }),
  floor: new THREE.MeshStandardMaterial({ color: 0x2B1846, metalness: 0.6, roughness: 0.35 }),
  red: new THREE.MeshStandardMaterial({ color: 0xA51E2A, roughness: 0.55, metalness: 0.15 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xF6EBD5, roughness: 0.6 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1A0F14, roughness: 0.8 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0, transmission: 0 }),
  bulbOn: new THREE.MeshBasicMaterial({ color: 0xFFE38A }), bulbOff: new THREE.MeshBasicMaterial({ color: 0x6A4A22 }),
  black: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }),
  starSide: new THREE.MeshStandardMaterial({ color: 0xE0A630, metalness: 1, roughness: 0.3 }),
  white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }),
};
function coinFaceTex(base, hi, lo, star) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, 128, 128);
  const ring = (r, w, col) => { x.beginPath(); x.arc(64, 64, r, 0, Math.PI * 2); x.lineWidth = w; x.strokeStyle = col; x.stroke(); };
  ring(58, 6, lo); ring(57, 2, hi); ring(46, 2, lo); ring(45, 1.5, hi);
  const starPath = (cx, cy, R, r) => { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); };
  if (star) { starPath(66, 66, 34, 15); x.fillStyle = lo; x.fill(); starPath(63, 63, 34, 15); x.fillStyle = star; x.fill(); }
  else { x.font = '900 52px Bungee, Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = lo; x.fillText('S', 66, 68); x.fillStyle = hi; x.fillText('S', 63, 65); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function stripeTex(a, b, n = 8) { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(i * 256 / n, 0, 256 / n, 64); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function signTex(text = 'SHOVE', bg = '#2A0E16') { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 512, 128); let fs = 86; x.font = `900 ${fs}px Bungee, Impact, sans-serif`; while (x.measureText(text).width > 470 && fs > 30) { fs -= 4; x.font = `900 ${fs}px Bungee, Impact, sans-serif`; } x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#8A5A12'; x.fillText(text, 256, 70); x.fillStyle = '#FFD25A'; x.fillText(text, 256, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
M.goldFace = new THREE.MeshStandardMaterial({ map: coinFaceTex('#E3AA34', '#FFE7A0', '#8A5A12'), metalness: 1, roughness: 0.32 });
M.starFace = new THREE.MeshStandardMaterial({ map: coinFaceTex('#D02A3C', '#FF8A96', '#5A0A14', '#FFD25A'), metalness: 0.35, roughness: 0.35, emissive: 0x3A0510 });
const tint = (col, golden, mat) => golden ? mat : new THREE.MeshStandardMaterial({ color: col, roughness: 0.92 });
const box = (w, h, d, mat, x, y, z, parent = scene, r = 0.06) => { const m = new THREE.Mesh(r ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };

// cabinet
const W = CFG.halfW;
box(W * 2 + 0.2, 0.3, 12.5, M.floor, 0, -0.15, -1.2, scene, 0.02).castShadow = false;
box(W * 2 + 1.8, 1.4, 1.2, M.red, 0, -0.9, CFG.front + 0.9);                      // front apron
box(W * 2 + 1.8, 0.12, 0.7, M.chrome, 0, -0.18, CFG.front + 0.35, scene, 0.03);   // win chute lip
const chuteGlow = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 0.5), new THREE.MeshBasicMaterial({ color: 0xFFC54D, transparent: true, opacity: 0.35 })); chuteGlow.rotation.x = -Math.PI / 2; chuteGlow.position.set(0, -0.1, CFG.front + 0.3); scene.add(chuteGlow);
for (const sx of [-1, 1]) {
  box(0.35, 3.4, 9.4, M.red, sx * (W + 0.35), 1.2, -2.6);                             // side cabinet (back part)
  const g = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.4, 9.2), M.glass); g.position.set(sx * (W + 0.06), 1.3, -2.6); scene.add(g);
  box(0.6, 0.5, CFG.front - CFG.gutterFrom + 1.4, M.dark, sx * (W + 0.55), -0.5, (CFG.front + CFG.gutterFrom) / 2 + 0.5); // gutter trough
  for (let i = 0; i < 4; i++) box(0.12, 4.6, 0.12, M.chrome, sx * (W + 0.6), 2.2, -7 + i * 2.6, scene, 0.03);
}
box(W * 2 + 1.0, 4.5, 0.4, M.red, 0, 2.6, -7.4);                                     // back panel
const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), new THREE.MeshBasicMaterial({ map: signTex() })); sign.position.set(0, 4.1, -7.15); scene.add(sign);
const backWall = box(W * 2, 2.2, 0.3, M.cream, 0, CFG.deckY + 1.13, -5.35, scene, 0.04);  // fixed wall over the pusher deck
// awning
const aw = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 12, 32, 1, true, Math.PI * 1.25, Math.PI * 0.5), new THREE.MeshStandardMaterial({ map: stripeTex('#D8343F', '#F6EBD5', 12), side: THREE.DoubleSide, roughness: 0.8 }));
aw.rotation.z = Math.PI / 2; aw.position.set(0, 2.2, -2.5); scene.add(aw);
// bulbs around the sign and along the awning edge
const bulbs = [];
const bulbGeo = new THREE.SphereGeometry(0.1, 10, 8);
for (let i = 0; i < 18; i++) { const b = new THREE.Mesh(bulbGeo, M.bulbOn); const a = i / 17; b.position.set(-3.3 + a * 6.6, 5.0, -7.1); scene.add(b); bulbs.push(b); }
for (let i = 0; i < 18; i++) { const b = new THREE.Mesh(bulbGeo, M.bulbOn); const a = i / 17; b.position.set(-3.3 + a * 6.6, 3.2, -7.1); scene.add(b); bulbs.push(b); }
// booth decor groups
const decoK = new THREE.Group(), decoN = new THREE.Group(), decoW = new THREE.Group(); scene.add(decoK, decoN, decoW);
// string lights over the fair
for (let s = 0; s < 3; s++) for (let i = 0; i < 26; i++) { const a = i / 25, x = -14 + a * 28, y = 9 + s * 2.2 - Math.sin(a * Math.PI) * 1.6; const b = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: [0xFFE38A, 0xFF7A8A, 0x8AE8FF][i % 3] })); b.position.set(x, y, -16 - s * 4); b.scale.setScalar(1.6); decoK.add(b); }
// ferris wheel silhouette
const wheel = new THREE.Group(); wheel.position.set(-13, 9, -30); decoK.add(wheel);
{ const ringM = new THREE.MeshBasicMaterial({ color: 0x3A1E4A }); const ring = new THREE.Mesh(new THREE.TorusGeometry(7, 0.15, 6, 48), ringM); wheel.add(ring);
  for (let i = 0; i < 12; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 14, 0.12), ringM); sp.rotation.z = i / 12 * Math.PI; wheel.add(sp); const l = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xFFE38A : 0xFF6FA8 })); l.scale.setScalar(2.2); l.position.set(Math.cos(i / 12 * Math.PI * 2) * 7, Math.sin(i / 12 * Math.PI * 2) * 7, 0.2); wheel.add(l); }
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10, 0.3), ringM); leg.position.set(-2.5, -4.5, 0); leg.rotation.z = 0.28; decoK.add(leg); leg.position.add(wheel.position); const leg2 = leg.clone(); leg2.position.x = wheel.position.x + 2.5; leg2.rotation.z = -0.28; decoK.add(leg2); }
// night market: paper lanterns + moon
{ const cols = [0xFF5A3D, 0xFFB03D, 0xFF7A9A, 0xFFD25A];
  for (let s = 0; s < 3; s++) for (let i = 0; i < 14; i++) { const a = i / 13, x = -14 + a * 28, y = 9.5 + s * 2.4 - Math.sin(a * Math.PI) * 1.4; const l = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), new THREE.MeshBasicMaterial({ color: cols[(i + s) % 4] })); l.scale.set(1, 1.25, 1); l.position.set(x, y, -16 - s * 4); decoN.add(l); }
  const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), new THREE.MeshBasicMaterial({ color: 0xFFF3C8 })); moon.position.set(13, 15, -45); decoN.add(moon);
  const stallM = new THREE.MeshBasicMaterial({ color: 0x0E0A24 }); for (let i = 0; i < 6; i++) { const st = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.2, 4), stallM); st.position.set(-16 + i * 6.4, 2.2, -28); st.rotation.y = Math.PI / 4; decoN.add(st); const bx = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 2), stallM); bx.position.set(-16 + i * 6.4, 0, -28); decoN.add(bx); } }
// winter fair: pines + falling snow
const snowGeo = new THREE.BufferGeometry(), SN = 700, snowPos = new Float32Array(SN * 3);
for (let i = 0; i < SN; i++) { snowPos[i * 3] = (Math.random() - 0.5) * 34; snowPos[i * 3 + 1] = Math.random() * 22; snowPos[i * 3 + 2] = -34 + Math.random() * 44; }
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.16, transparent: true, opacity: 0.85, depthWrite: false })); decoW.add(snow);
{ const pine = new THREE.MeshBasicMaterial({ color: 0x0F2A3A }), cap = new THREE.MeshBasicMaterial({ color: 0xDDEBF5 });
  for (let i = 0; i < 9; i++) { const x = -18 + i * 4.5, h = 5 + (i % 3) * 1.6, z = -26 - (i % 2) * 5; const t = new THREE.Mesh(new THREE.ConeGeometry(1.6, h, 7), pine); t.position.set(x, h / 2 - 0.5, z); decoW.add(t); const c = new THREE.Mesh(new THREE.ConeGeometry(0.7, h * 0.3, 7), cap); c.position.set(x, h * 0.85 - 0.5, z); decoW.add(c); } }
// pusher (visual)
const pusherMesh = new THREE.Group(); scene.add(pusherMesh);
box(W * 2 - 0.04, CFG.deckY, CFG.pushHalfZ * 2, M.chrome, 0, CFG.deckY / 2, 0, pusherMesh, 0.05);
for (let i = 0; i < 7; i++) box(0.5, 0.06, 0.04, M.red, -3 + i, CFG.deckY * 0.5, CFG.pushHalfZ + 0.01, pusherMesh, 0);
// wall power-up (visual)
const wallMeshes = [-1, 1].map(sx => { const m = box(0.18, 0.7, CFG.front - CFG.gutterFrom, new THREE.MeshStandardMaterial({ color: 0x5AC8E0, emissive: 0x1B6A7A, transparent: true, opacity: 0.8 }), sx * (W + 0.09), 0.35, (CFG.front + CFG.gutterFrom) / 2); m.visible = false; return m; });

// lucky ring: a sweeping hoop over the pusher shelf. Drop a coin through it to light a lamp.
const ringMat = new THREE.MeshStandardMaterial({ color: 0xFFD25A, emissive: 0xFF7A00, emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.25 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.075, 12, 40), ringMat); ring.rotation.x = Math.PI / 2; scene.add(ring);
const ringBulbs = []; for (let i = 0; i < 8; i++) { const b = new THREE.Mesh(bulbGeo, M.bulbOn); b.scale.setScalar(0.7); const a = i / 8 * Math.PI * 2; b.position.set(Math.cos(a) * 0.58, Math.sin(a) * 0.58, -0.06); ring.add(b); ringBulbs.push(b); }
const lampOff = new THREE.MeshStandardMaterial({ color: 0x5A2A20, roughness: 0.4 }), lampOn = new THREE.MeshBasicMaterial({ color: 0xFFE38A });
const lamps = [-1.1, 0, 1.1].map(x => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 12), lampOff); l.position.set(x, CFG.deckY + 1.72, -5.17); scene.add(l); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.05, 8, 24), M.chrome); rim.position.copy(l.position); scene.add(rim); l.userData.rim = rim; return l; });
let ringT = 0, ringFlash = 0;
const ringX = (t = ringT) => 3.0 * Math.sin(t * 1.6 + 0.7 * Math.sin(t * 0.47));

// ---------- glow (bloom on the bulbs, ring and coins; High tier only) ----------
function makeComposer() { try { composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.35, 1.7); composer.addPass(bloomPass); composer.addPass(new OutputPass());
  composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(innerWidth, innerHeight); } catch (e) { composer = null; } }
const glowOn = () => !STRESS && save.glow && qTier === 0 && composer;
let glowState = null;   // with glow, light sources burn brighter than white so only they bloom
function glowSync() { const g = !!glowOn(); if (g === glowState) return; glowState = g; const k = g ? 3.4 : 1;
  M.bulbOn.color.setHex(0xFFE38A).multiplyScalar(k); lampOn.color.setHex(0xFFE38A).multiplyScalar(k); sparks.material.color.setHex(0xFFE07A).multiplyScalar(g ? 2.8 : 1); }
function dotTex() { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,240,190,.85)'); g.addColorStop(1, 'rgba(255,200,80,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); }
// ---------- particles: sparks at the chute, confetti for big moments ----------
const SPK = 260, spkPos = new Float32Array(SPK * 3).fill(-99), spkVel = new Float32Array(SPK * 3), spkLife = new Float32Array(SPK); let spkI = 0;
const spkGeo = new THREE.BufferGeometry(); spkGeo.setAttribute('position', new THREE.BufferAttribute(spkPos, 3));
const sparks = new THREE.Points(spkGeo, new THREE.PointsMaterial({ color: 0xFFE07A, size: 0.32, map: dotTex(), transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false })); sparks.frustumCulled = false; scene.add(sparks);
function sparkBurst(x, y, z, n = 8, power = 1) { for (let k = 0; k < n; k++) { const i = spkI++ % SPK; spkPos[i * 3] = x + (Math.random() - 0.5) * 0.4; spkPos[i * 3 + 1] = y; spkPos[i * 3 + 2] = z;
  spkVel[i * 3] = (Math.random() - 0.5) * 3 * power; spkVel[i * 3 + 1] = (2 + Math.random() * 3.5) * power; spkVel[i * 3 + 2] = (Math.random() - 0.2) * 2 * power; spkLife[i] = 0.5 + Math.random() * 0.5; } }
const CF = 180, cfMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.2, 0.11), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CF), cf = [];
cfMesh.frustumCulled = false; cfMesh.count = 0; scene.add(cfMesh);
const CFCOL = [0xD8343F, 0xFFD25A, 0xF6EBD5, 0x2F8FA6, 0xFF7AB0, 0x7ED36A].map(c => new THREE.Color(c));
for (let i = 0; i < CF; i++) cfMesh.setColorAt(i, CFCOL[i % CFCOL.length]);
function confetti(n = 90) { for (let k = 0; k < n; k++) { if (cf.length >= CF) cf.shift(); cf.push({ p: new THREE.Vector3((Math.random() - 0.5) * 7, 7 + Math.random() * 3, -3 + Math.random() * 7), v: new THREE.Vector3((Math.random() - 0.5) * 2.5, Math.random() * 1.5, (Math.random() - 0.5) * 2), r: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0), s: 3 + Math.random() * 6, life: 3 + Math.random() * 1.5 }); } }
const cfDummy = new THREE.Object3D();
function fxTick(dt) {
  for (let i = 0; i < SPK; i++) { if (spkLife[i] <= 0) continue; spkLife[i] -= dt; if (spkLife[i] <= 0) { spkPos[i * 3 + 1] = -99; continue; }
    spkVel[i * 3 + 1] -= 9 * dt; spkPos[i * 3] += spkVel[i * 3] * dt; spkPos[i * 3 + 1] += spkVel[i * 3 + 1] * dt; spkPos[i * 3 + 2] += spkVel[i * 3 + 2] * dt; }
  spkGeo.attributes.position.needsUpdate = true;
  for (let i = cf.length - 1; i >= 0; i--) { const c = cf[i]; c.life -= dt; if (c.life <= 0 || c.p.y < -1) { cf.splice(i, 1); continue; } c.v.y -= 2.2 * dt; c.v.multiplyScalar(0.985); c.p.addScaledVector(c.v, dt); c.p.x += Math.sin(c.life * c.s) * dt * 0.6; c.r.x += dt * c.s; c.r.y += dt * c.s * 0.7; }
  cfMesh.count = cf.length; cf.forEach((c, i) => { cfDummy.position.copy(c.p); cfDummy.rotation.copy(c.r); cfDummy.updateMatrix(); cfMesh.setMatrixAt(i, cfDummy.matrix); }); cfMesh.instanceMatrix.needsUpdate = true; }

// ---------- physics ----------
let world, pusherBody, wallColliders = [], floorCol;
const coins = [];   // {body, giant}
const prizes = [];  // {body, mesh, kind, golden}
let coinMesh, giantMesh, starMesh;
const MAXI = 480;
function coinCollider(r, h) { return RAPIER.ColliderDesc.cylinder(h, r).setFriction(0.42).setRestitution(0.04).setDensity(3); }
function addCoin(x, y, z, type = 0, rot = null) {
  const giant = type === 1;
  const b = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z).setLinearDamping(0.12).setAngularDamping(0.5).setCcdEnabled(false));
  if (rot) b.setRotation(rot, true); else b.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.3, Math.random() * 6, (Math.random() - 0.5) * 0.3)), true);
  world.createCollider(coinCollider(giant ? CFG.coinR * 2.1 : CFG.coinR, giant ? CFG.coinH * 2 : CFG.coinH), b);
  const rec = { body: b, giant, star: type === 2, type, fresh: false, py: y }; coins.push(rec); return rec;
}
function buildPlush(kind, golden) {
  const P = PLUSH.find(p => p.id === kind), g = new THREE.Group();
  const mat = golden ? M.goldPlush : new THREE.MeshStandardMaterial({ color: P.col, roughness: 0.95 });
  const mk = (r, x, y, z, m = mat, sx = 1, sy = 1, sz = 1) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), m); s.position.set(x, y, z); s.scale.set(sx, sy, sz); s.castShadow = true; g.add(s); return s; };
  mk(0.5, 0, 0.5, 0, mat, 1, 0.95, 0.9);            // body
  mk(0.4, 0, 1.08, 0.05);                            // head
  const dark = golden ? M.dark : M.black;
  mk(0.06, -0.14, 1.14, 0.38, dark); mk(0.06, 0.14, 1.14, 0.38, dark);   // eyes
  const accent = golden ? M.goldPlush : new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  if (P.ear === 'round') { mk(0.14, -0.3, 1.4, 0); mk(0.14, 0.3, 1.4, 0); mk(0.12, 0, 1.0, 0.38, accent); }
  if (P.ear === 'long') { mk(0.11, -0.15, 1.6, -0.02, mat, 0.8, 2.6, 0.6); mk(0.11, 0.15, 1.6, -0.02, mat, 0.8, 2.6, 0.6); mk(0.08, 0, 1.02, 0.38, golden ? mat : new THREE.MeshStandardMaterial({ color: 0xF59FB0 })); }
  if (P.ear === 'eyes') { mk(0.14, -0.18, 1.4, 0.15); mk(0.14, 0.18, 1.4, 0.15); mk(0.05, -0.18, 1.45, 0.27, dark); mk(0.05, 0.18, 1.45, 0.27, dark); }
  if (P.ear === 'beak') { mk(0.13, 0, 1.0, 0.42, golden ? mat : new THREE.MeshStandardMaterial({ color: 0xFF9A2E }), 1.3, 0.6, 1); }
  if (P.ear === 'snout') { mk(0.13, 0, 1.0, 0.4, golden ? mat : new THREE.MeshStandardMaterial({ color: 0xE47F97 }), 1.2, 0.9, 0.7); mk(0.1, -0.28, 1.38, 0, mat, 1, 0.6, 1); mk(0.1, 0.28, 1.38, 0, mat, 1, 0.6, 1); }
  if (P.ear === 'tri' || P.ear === 'fox') { for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.32, 4), mat); c.position.set(sx * 0.22, 1.47, 0); c.rotation.z = -sx * 0.25; g.add(c); } if (P.ear === 'fox') mk(0.15, 0, 0.98, 0.33, accent, 1.2, 0.8, 1); }
  if (P.ear === 'panda') { const bl = golden ? M.dark : M.black; mk(0.13, -0.28, 1.38, 0, bl); mk(0.13, 0.28, 1.38, 0, bl); mk(0.1, -0.14, 1.14, 0.33, bl); mk(0.1, 0.14, 1.14, 0.33, bl); mk(0.04, -0.14, 1.15, 0.42, M.white); mk(0.04, 0.14, 1.15, 0.42, M.white); }
  const A = col => tint(col, golden, mat);
  const ears2 = (col, sy = 1) => { for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.32 * sy, 4), col); c.position.set(sx * 0.22, 1.47, 0); c.rotation.z = -sx * 0.25; g.add(c); } };
  if (P.ear === 'owl') { for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 5), mat); c.position.set(sx * 0.24, 1.46, -0.02); c.rotation.z = -sx * 0.45; g.add(c); mk(0.14, sx * 0.15, 1.13, 0.31, A(0xF6EBD5), 1, 1, 0.5); }
    mk(0.07, 0, 1.0, 0.4, A(0xF2A33A), 1, 1.3, 1); mk(0.32, 0, 0.52, 0.22, A(0xE9D3B0), 1, 1.1, 0.6); }
  if (P.ear === 'mouse') { for (const sx of [-1, 1]) { mk(0.22, sx * 0.3, 1.42, -0.04, mat, 1, 1, 0.35); mk(0.14, sx * 0.3, 1.42, 0.03, A(0xF2A5B8), 1, 1, 0.3); } mk(0.05, 0, 1.03, 0.43, A(0xF07C9A)); }
  if (P.ear === 'raccoon') { ears2(mat); mk(0.2, 0, 1.15, 0.29, A(0x2A2630), 1.55, 0.42, 0.55); mk(0.12, 0, 1.0, 0.36, A(0xF6EBD5), 1.15, 0.8, 1); mk(0.035, 0, 1.03, 0.47, M.black);
    for (const sx of [-1, 1]) mk(0.025, sx * 0.13, 1.17, 0.44, M.white); }
  if (P.ear === 'spiky') { mk(0.3, 0, 1.04, 0.17, A(0xF3DFC0), 1, 0.92, 0.8); mk(0.05, 0, 1.02, 0.46, M.black); const sp = A(0x5A3A22), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2 * 3.1, el = -0.2 + (i / 22) * 1.3, d = new THREE.Vector3(Math.cos(a) * Math.cos(el) * 0.9, Math.sin(el) + 0.25, -Math.abs(Math.sin(a) * Math.cos(el)) - 0.25).normalize(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.26, 5), sp);
      const base = i < 11 ? new THREE.Vector3(0, 1.08, 0.0) : new THREE.Vector3(0, 0.55, 0); c.position.copy(base).addScaledVector(d, i < 11 ? 0.38 : 0.46); c.quaternion.setFromUnitVectors(up, d); g.add(c); } }
  if (P.ear === 'penguin') { mk(0.36, 0, 0.5, 0.2, A(0xF6F2EA), 1, 1.05, 0.72); mk(0.27, 0, 1.04, 0.18, A(0xF6F2EA), 1.05, 0.85, 0.8); const bk = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), A(0xF29A2E)); bk.rotation.x = Math.PI / 2; bk.position.set(0, 1.0, 0.46); g.add(bk); }
  if (P.ear === 'mane') { const mn = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.16, 10, 22), A(0xB8642A)); mn.position.set(0, 1.08, -0.04); g.add(mn); mk(0.12, -0.28, 1.4, 0.02); mk(0.12, 0.28, 1.4, 0.02); mk(0.14, 0, 1.0, 0.36, A(0xF6E0B0), 1.2, 0.8, 0.9); mk(0.05, 0, 1.05, 0.48, A(0x6A3A20)); }
  if (P.ear === 'horn') { ears2(mat, 0.8); const hn = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.42, 12), golden ? mat : M.goldPlush); hn.position.set(0, 1.56, 0.16); hn.rotation.x = 0.35; g.add(hn);
    const mc = [0xF59FC8, 0xB9A4F5, 0x8FD8F0]; for (let i = 0; i < 5; i++) mk(0.11, 0, 1.42 - i * 0.14, -0.3 - Math.sin(i / 4 * Math.PI) * 0.06, A(mc[i % 3])); mk(0.12, 0, 1.0, 0.36, A(0xF9DCEB), 1.1, 0.8, 0.9); }
  if (P.ear === 'gills') { const gm = A(0xE5487A); for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const gl = mk(0.06, sx * (0.4 + Math.abs(i - 1) * 0.03), 1.08 + (i - 1) * 0.15, -0.02, gm, 2.4, 0.7, 0.7); gl.rotation.z = sx * (i - 1) * 0.5; }
    mk(0.025, -0.08, 0.98, 0.4, M.black); mk(0.025, 0.08, 0.98, 0.4, M.black); }
  if (P.ear === 'polar') { mk(0.13, -0.3, 1.4, 0); mk(0.13, 0.3, 1.4, 0); mk(0.14, 0, 1.0, 0.36, A(0xFFFFFF), 1.2, 0.85, 0.9); mk(0.05, 0, 1.04, 0.49, M.black); }
  if (P.ear === 'antlers') { const an = A(0xE8D6B0); for (const sx of [-1, 1]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.42, 6), an); st.position.set(sx * 0.2, 1.58, -0.02); st.rotation.z = -sx * 0.35; g.add(st);
      for (const k of [0, 1]) { const tn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.2, 6), an); tn.position.set(sx * (0.25 + k * 0.06), 1.6 + k * 0.12, -0.02); tn.rotation.z = -sx * (1.1 + k * 0.2); g.add(tn); } mk(0.09, sx * 0.36, 1.32, 0, mat, 1.5, 0.6, 0.6); }
    mk(0.13, 0, 1.0, 0.36, A(0xD9B48A), 1.15, 0.85, 0.9); mk(0.065, 0, 1.03, 0.48, A(0xE0302E)); }
  if (P.ear === 'snowman') { const hat = A(0x1C1C22); const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 20), hat); brim.position.set(0, 1.4, 0.03); g.add(brim); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.32, 20), hat); top.position.set(0, 1.58, 0.03); g.add(top);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 10), A(0xF07A22)); nose.rotation.x = Math.PI / 2; nose.position.set(0, 1.04, 0.56); g.add(nose); for (let i = 0; i < 3; i++) mk(0.045, 0, 0.75 - i * 0.2, 0.45 - Math.abs(i - 1) * 0.02, A(0x1C1C22));
    const sc = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 8, 20), A(0xD8343F)); sc.rotation.x = Math.PI / 2; sc.position.set(0, 0.86, 0.04); g.add(sc); }
  if (P.ear === 'yeti') { for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; mk(0.12, Math.cos(a) * 0.36, 1.12 + Math.sin(a) * 0.36, -0.05, mat); } mk(0.27, 0, 1.04, 0.2, A(0x8FB4D8), 1.05, 0.95, 0.75); mk(0.05, -0.06, 0.92, 0.42, A(0xFFFFFF)); mk(0.05, 0.06, 0.92, 0.42, A(0xFFFFFF)); }
  if (P.ear === 'arctic') { ears2(mat); mk(0.15, 0, 0.98, 0.33, A(0xFFFFFF), 1.2, 0.8, 1); mk(0.04, 0, 1.0, 0.47, M.black); }
  if (P.ear === 'seal') { mk(0.15, 0, 1.0, 0.34, A(0xD2D8DE), 1.25, 0.8, 0.9); mk(0.05, 0, 1.05, 0.47, M.black); for (const sx of [-1, 1]) { mk(0.14, sx * 0.5, 0.35, 0.18, mat, 0.6, 0.35, 1.3); for (let k = 0; k < 2; k++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 4), A(0xFFFFFF)); w.rotation.z = Math.PI / 2 + sx * (k - 0.5) * 0.4; w.position.set(sx * 0.2, 0.99 + (k - 0.5) * 0.04, 0.44); g.add(w); } } }
  if (P.ear === 'husky') { ears2(mat); mk(0.26, 0, 1.0, 0.2, A(0xFFFFFF), 1.1, 0.8, 0.8); mk(0.04, 0, 1.0, 0.47, M.black); for (const sx of [-1, 1]) mk(0.03, sx * 0.14, 1.15, 0.43, A(0x6BC5F0)); }
  if (P.ear === 'ginger') { const ic = A(0xFFFFFF); for (let i = 0; i < 3; i++) mk(0.05, 0, 0.75 - i * 0.18, 0.44, A([0xD8343F, 0x3FA34D, 0xD8343F][i])); for (const sx of [-1, 1]) { const bd = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 14, Math.PI), ic); bd.position.set(sx * 0.48, 0.5, 0.2); bd.rotation.z = Math.PI; g.add(bd); }
    const sm = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 6, 14, Math.PI), ic); sm.position.set(0, 1.0, 0.4); sm.rotation.z = Math.PI; g.add(sm); }
  // arms + feet
  mk(0.16, -0.48, 0.6, 0.12, mat, 1, 1.3, 1); mk(0.16, 0.48, 0.6, 0.12, mat, 1, 1.3, 1); mk(0.17, -0.22, 0.12, 0.3, mat); mk(0.17, 0.22, 0.12, 0.3, mat);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
let thumbR = null, thumbS, thumbC; const thumbCache = {};
function plushThumb(kind, golden) {
  const k = kind + (golden ? '_g' : ''); if (thumbCache[k]) return thumbCache[k];
  try {
    if (!thumbR) { thumbR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); thumbR.setPixelRatio(1); thumbR.setSize(160, 160, false); thumbR.outputColorSpace = THREE.SRGBColorSpace; thumbR.toneMapping = THREE.ACESFilmicToneMapping;
      thumbS = new THREE.Scene(); const pm = new THREE.PMREMGenerator(thumbR); thumbS.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; thumbS.environmentIntensity = 0.7;
      thumbS.add(new THREE.HemisphereLight(0xFFF3DD, 0x553344, 1.1)); const d = new THREE.DirectionalLight(0xffffff, 1.8); d.position.set(2, 4, 5); thumbS.add(d);
      thumbC = new THREE.PerspectiveCamera(30, 1, 0.1, 50); thumbC.position.set(0.9, 1.6, 4.4); thumbC.lookAt(0, 0.88, 0); }
    const m = buildPlush(kind, golden); m.rotation.y = -0.3; thumbS.add(m); thumbR.render(thumbS, thumbC); thumbCache[k] = thumbR.domElement.toDataURL('image/png'); thumbS.remove(m);
  } catch (e) { thumbCache[k] = ''; }
  return thumbCache[k];
}
function addPrize(kind, golden, x, y, z, rot = null) {
  const b = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z).setLinearDamping(0.2).setAngularDamping(0.6));
  if (rot) b.setRotation(rot, true);
  world.createCollider(RAPIER.ColliderDesc.ball(0.5).setTranslation(0, 0.5, 0).setFriction(0.8).setDensity(0.5), b);
  world.createCollider(RAPIER.ColliderDesc.ball(0.4).setTranslation(0, 1.08, 0.05).setFriction(0.8).setDensity(0.5), b);
  const mesh = buildPlush(kind, golden); mesh.scale.setScalar(0.62); scene.add(mesh);
  prizes.push({ body: b, mesh, kind, golden });
}
// colliders are built for a 0.62 scaled plush -> rebuild with scaled dims
function addPrizeScaled(kind, golden, x, y, z, rot = null) {
  const s = 0.92, b = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z).setLinearDamping(0.2).setAngularDamping(0.6));
  if (rot) b.setRotation(rot, true);
  world.createCollider(RAPIER.ColliderDesc.ball(0.5 * s).setTranslation(0, 0.5 * s, 0).setFriction(0.8).setDensity(0.6), b);
  world.createCollider(RAPIER.ColliderDesc.ball(0.4 * s).setTranslation(0, 1.08 * s, 0.05 * s).setFriction(0.8).setDensity(0.6), b);
  const mesh = buildPlush(kind, golden); mesh.scale.setScalar(s); scene.add(mesh);
  prizes.push({ body: b, mesh, kind, golden });
}
function randomPrize() { const pool = PLUSH.filter(p => p.set === booth().set); const p = pool[Math.floor(Math.random() * pool.length)]; return [p.id, Math.random() < 0.1]; }
let pushT = 0;
function pusherZ() { return CFG.pushBack + (CFG.pushFwd - CFG.pushBack) * (0.5 - 0.5 * Math.cos(pushT * CFG.pushSpeed)); }
function initWorld() {
  world = new RAPIER.World({ x: 0, y: -22, z: 0 });
  world.timestep = 1 / 60;
  const fixed = (hx, hy, hz, x, y, z, fr = 0.35) => world.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(x, y, z).setFriction(fr));
  floorCol = fixed(W, 0.15, 6.2, 0, -0.15, CFG.front - 6.2);      // floor up to the front edge
  floorCol.setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min); floorCol.setFriction(booth().friction);
  for (const sx of [-1, 1]) fixed(0.15, 2, (CFG.gutterFrom + 8) / 2, sx * (W + 0.15), 1.5, (CFG.gutterFrom - 8) / 2); // side walls back part
  fixed(W, 1.1, 0.15, 0, CFG.deckY + 1.13, -5.35);                // wall over the deck
  fixed(W, 2, 0.2, 0, 1.5, -8.3);                                 // far back stop
  wallColliders = [-1, 1].map(sx => { const c = fixed(0.09, 0.6, (CFG.front - CFG.gutterFrom) / 2, sx * (W + 0.09), 0.4, (CFG.front + CFG.gutterFrom) / 2); c.setEnabled(false); return c; });
  pusherBody = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, CFG.deckY / 2, pusherZ()));
  world.createCollider(RAPIER.ColliderDesc.cuboid(W - 0.02, CFG.deckY / 2, CFG.pushHalfZ).setFriction(0.5), pusherBody);
}
function fillBoard() {
  const bd = save.boards[save.booth];
  if (bd && bd.c && bd.c.length > 40) {
    for (const c of bd.c) addCoin(c[0], c[1], c[2], +c[7] || 0, { x: c[3], y: c[4], z: c[5], w: c[6] });
    for (const p of bd.p || []) if (PLUSH.find(x => x.id === p[0])) addPrizeScaled(p[0], p[1], p[2], p[3], p[4], { x: p[5], y: p[6], z: p[7], w: p[8] });
    pushT = bd.t || 0; return false;
  }
  // a packed tray with piles, like a machine that's been running all day
  for (let i = 0; i < 165; i++) addCoin(-3.5 + Math.random() * 7, 0.12 + Math.floor(i / 80) * 0.18 + Math.random() * 0.12, -2.3 + Math.random() * 6.9);
  for (let i = 0; i < 22; i++) addCoin(-3.4 + Math.random() * 6.8, 1.0, -5.0 + Math.random() * 2.2);
  addCoin(0.6, 0.5, 2.6, 2);
  for (let i = 0; i < 3; i++) { const [k, gld] = randomPrize(); addPrizeScaled(k, gld, -2.5 + i * 2.5, 0.8, 0.5 + Math.random() * 2); }
  return true;
}
function saveBoard() {
  if (STRESS) return;
  const c = coins.map(({ body, type }) => { const t = body.translation(), r = body.rotation(); return [t.x, t.y, t.z, r.x, r.y, r.z, r.w, type].map(v => typeof v === 'number' ? +v.toFixed(3) : v); });
  const p = prizes.map(({ body, kind, golden }) => { const t = body.translation(), r = body.rotation(); return [kind, golden, +t.x.toFixed(3), +t.y.toFixed(3), +t.z.toFixed(3), r.x, r.y, r.z, r.w]; });
  save.boards[save.booth] = { c, p, t: pushT }; persist();
}

// ---------- game ----------
let wallT = 0, prizeCounter = 0;
function refill() {
  const now = Date.now();
  if (save.coins >= CFG.refillCap) { save.lastRefill = now; return; }
  const n = Math.floor((now - save.lastRefill) / (CFG.refillSecs * 1000));
  if (n > 0) { save.coins = Math.min(CFG.refillCap, save.coins + n); save.lastRefill += n * CFG.refillSecs * 1000; persist(); }
}
const today = () => new Date().toDateString();
function dropAt(x) {
  if (save.coins <= 0) { openModal('out'); return false; }
  if (coins.length > CFG.maxCoins + 60) return false;
  save.coins--; save.dropped++; prizeCounter++; mission('drop');
  const cx = Math.max(-W + 0.5, Math.min(W - 0.5, x));
  const rec = addCoin(cx, CFG.dropY, CFG.dropZ + (Math.random() - 0.5) * 0.5); rec.fresh = true;
  if (Math.random() < CFG.starChance) { const st = addCoin(Math.max(-3, Math.min(3, cx + (Math.random() - 0.5))), CFG.dropY + 0.6, CFG.dropZ, 2); st.fresh = true; toast('⭐ A lucky token fell in!'); }
  tone(600, 420, 0.06, 'square', 0.018);
  if (prizeCounter >= CFG.prizeEvery) { prizeCounter = 0; dropPrize(); toast('🎁 A prize dropped on the pusher!'); }
  hud(); return true;
}
function dropPrize(golden = null) { const [k, g] = randomPrize(); addPrizeScaled(k, golden ?? g, (Math.random() - 0.5) * 5, 3.2, -4.6); tone(660, 990, 0.25, 'triangle', 0.05); }
function useShake() {
  if (save.shakes <= 0) return; save.shakes--; mission('power'); doShake(); hud(); persist();
}
function doShake() { shakeFx = 0.5; buzz(60);
  for (const { body } of coins) { body.wakeUp(); body.applyImpulse({ x: (Math.random() - 0.5) * 0.08, y: 0.12 + Math.random() * 0.1, z: 0.12 + Math.random() * 0.14 }, true); }
  for (const { body } of prizes) { body.wakeUp(); body.applyImpulse({ x: 0, y: 0.3, z: 0.4 }, true); }
  tone(90, 60, 0.4, 'square', 0.05); }
function wallsOn(secs) { wallT = Math.max(wallT, secs); wallColliders.forEach(c => c.setEnabled(true)); wallMeshes.forEach(m => m.visible = true); tone(300, 600, 0.3, 'sawtooth', 0.04); }
function useWall() { if (save.walls <= 0 || wallT > 0) return; save.walls--; mission('power'); wallsOn(30); hud(); persist(); }
function dropGiant() { addCoin((Math.random() - 0.5) * 2, 3, -1.8, 1); tone(200, 90, 0.5, 'triangle', 0.07); }
function useGiant() { if (save.giants <= 0) return; save.giants--; mission('power'); dropGiant(); toast('Giant coin incoming!'); hud(); persist(); }
function gainXP(n) {
  save.xp += n;
  while (save.xp >= xpNeed(save.level)) { save.xp -= xpNeed(save.level); save.level++; save.coins += 20; save.shakes++; if (save.level % 2 === 0) save.walls++; if (save.level % 3 === 0) save.giants++;
    toast(`⭐ Level ${save.level}! +20 coins, +1 shake${save.level % 2 === 0 ? ', +1 wall' : ''}${save.level % 3 === 0 ? ', +1 giant coin' : ''}`); tone(523, 1046, 0.3, 'triangle', 0.07); tone(784, 1568, 0.35, 'triangle', 0.06, 0.12); buzz([30, 40, 30]);
    const nb = BOOTHS.find(x => x.lv === save.level); if (nb && nb.lv > 1) { toast(`🎪 New booth open: ${nb.name}! Tap 🎪 to walk over.`, 4); $('boothDot').classList.remove('hidden'); } }
}
// combo: coins tumbling off in a burst
let combo = 0, comboT = 0, comboBest = 0;
function bumpCombo() { combo++; comboT = 1.3; mission('combo', combo);
  if (combo === 15 || combo === 30 || combo === 50) { const b = combo === 15 ? 5 : combo === 30 ? 15 : 30; save.coins += b; toast(`${combo === 50 ? '🌋 MEGA AVALANCHE' : '💥 AVALANCHE'} ×${combo}! +${b} bonus`); tone(523, 784, 0.2, 'square', 0.05); tone(784, 1175, 0.3, 'square', 0.05, 0.1); buzz([20, 30, 20]); }
  $('combo').textContent = '×' + combo; $('combo').classList.toggle('on', combo >= 5); $('combo').classList.toggle('hot', combo >= 15);
  $('combo').style.animation = 'none'; void $('combo').offsetWidth; $('combo').style.animation = ''; }
let goldT = 0, rainQ = 0, rainT = 0;
function collectCoin(c) {
  if (c.star) { save.won++; toast('⭐ Lucky token! Spin the wheel'); queueSpin(); buzz(40); return; }
  let v = c.giant ? 10 : 1; if (goldT > 0) v *= 2;
  save.coins += v; save.won += v; gainXP(v); mission('win', v); bumpCombo(); clink(c.giant ? 2 : 1, 1 + Math.min(combo, 30) * 0.025); popup('+' + v); if (c.giant) buzz(40);
  const t = c.body.translation(); sparkBurst(t.x, -0.1, CFG.front + 0.35, c.giant ? 26 : combo >= 15 ? 10 : 5, c.giant ? 1.4 : 1);
}
function collectPrize(p) {
  const key = p.kind + (p.golden ? '_gold' : ''); const first = !save.album[key];
  save.album[key] = (save.album[key] || 0) + 1; gainXP(15); save.coins += 5; mission('plush');
  const P = PLUSH.find(x => x.id === p.kind);
  showCard(P, p.golden, first); confetti(p.golden ? 150 : first ? 90 : 40);
  tone(784, 1175, 0.2, 'triangle', 0.07); tone(1175, 1568, 0.3, 'triangle', 0.06, 0.15); buzz([40, 50, 80]);
  checkSets(); persist(); hud();
}
function luckyHit() { ringFlash = 0.6; save.lucky = (save.lucky || 0) + 1; mission('lucky'); popup('LUCKY!', 'lucky'); tone(880, 1760, 0.15, 'square', 0.04); tone(1320, 2640, 0.2, 'triangle', 0.04, 0.08); buzz(25);
  if (save.lucky >= booth().luckyNeed) { save.lucky = 0; queueSpin(); }
  hud(); persist(); }
// ---------- lucky wheel ----------
let wheelRot = 0, spinning = false, pendingSpins = 0, wheelOpen = false;
const wTotal = WHEEL.reduce((a, b) => a + b.w, 0);
function drawWheel() {
  const cv = $('wheelCv'), x = cv.getContext('2d'), R = 290; x.clearRect(0, 0, 600, 600); x.save(); x.translate(300, 300);
  let a0 = -Math.PI / 2;
  for (const s of WHEEL) { const a1 = a0 + s.w / wTotal * Math.PI * 2; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, R, a0, a1); x.closePath(); x.fillStyle = s.col; x.fill(); x.lineWidth = 4; x.strokeStyle = '#5A1020'; x.stroke();
    x.save(); x.rotate((a0 + a1) / 2); x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillStyle = s.ink; x.font = `900 ${s.w < 8 ? 24 : 28}px Bungee, Impact, sans-serif`; x.fillText(s.label, R - 22, 0); x.font = '34px serif'; x.textAlign = 'center'; x.fillText(s.icon, 92, 0); x.restore(); a0 = a1; }
  x.beginPath(); x.arc(0, 0, R, 0, Math.PI * 2); x.lineWidth = 14; x.strokeStyle = '#8A5A12'; x.stroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * R, Math.sin(a) * R, 6, 0, Math.PI * 2); x.fillStyle = i % 2 ? '#FFE38A' : '#FFF7D6'; x.fill(); }
  x.beginPath(); x.arc(0, 0, 48, 0, Math.PI * 2); x.fillStyle = '#D8343F'; x.fill(); x.lineWidth = 8; x.strokeStyle = '#FFD25A'; x.stroke();
  x.fillStyle = '#FFD25A'; x.font = '900 22px Bungee, Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SPIN', 0, 2); x.restore();
}
function queueSpin() { pendingSpins++; tone(523, 1046, 0.2, 'square', 0.04); if (!wheelOpen) setTimeout(openWheel, 500); else updateSpinBtn(); }
function updateSpinBtn() { const b = $('spinBtn'); b.disabled = spinning; b.textContent = spinning ? 'SPINNING…' : pendingSpins > 0 ? (pendingSpins > 1 ? `SPIN! (${pendingSpins})` : 'SPIN!') : 'COLLECT'; }
function openWheel() { wheelOpen = true; drawWheel(); $('wheelRes').textContent = 'Every slice shows its real odds.'; $('wheel').classList.remove('hidden'); updateSpinBtn(); }
function spin() {
  if (spinning) return; if (pendingSpins <= 0) { $('wheel').classList.add('hidden'); wheelOpen = false; return; }
  ac(); pendingSpins--; spinning = true; updateSpinBtn(); save.spins++; mission('spin');
  let r = Math.random() * wTotal, idx = 0; while (r >= WHEEL[idx].w) { r -= WHEEL[idx].w; idx++; }
  let start = 0; for (let i = 0; i < idx; i++) start += WHEEL[i].w;
  const mid = (start + WHEEL[idx].w * (0.5 + (Math.random() - 0.5) * 0.7)) / wTotal * 360;
  const from = wheelRot; wheelRot = wheelRot - (wheelRot % 360) + 360 * 5 + (360 - mid);
  $('wheelCv').style.transform = `rotate(${wheelRot}deg)`;
  const S = Math.floor((wheelRot - from) / 22);
  for (let k = 1; k < S; k++) setTimeout(() => tone(1400, 1100, 0.03, 'square', 0.025), 3600 * (1 - Math.pow(1 - k / S, 1 / 3)));
  setTimeout(() => { spinning = false; reward(WHEEL[idx]); updateSpinBtn(); }, 3750);
}
function reward(s) {
  const say = t => { $('wheelRes').textContent = t; toast(t); };
  if (s.id === 'rain15') { rainQ += 15; say('🪙 Coin shower! 15 coins rain down'); }
  if (s.id === 'rain25') { rainQ += 25; say('💰 Big coin shower! 25 coins'); }
  if (s.id === 'plush') { dropPrize(); say('🧸 A plushie drops on the pusher'); }
  if (s.id === 'shake') { save.shakes += 2; say('〰️ +2 shakes'); }
  if (s.id === 'giant') { dropGiant(); say('🟡 Giant coin incoming'); }
  if (s.id === 'hour') { goldT = Math.max(goldT, 0) + 20; say('⏱️ Double time! Every coin counts ×2 for 20 s'); }
  if (s.id === 'walls') { wallsOn(25); say('🧱 Free walls for 25 s'); }
  if (s.id === 'jackpot') { rainQ += 50; dropPrize(true); jackFx = 3; confetti(180); say('🎰 JACKPOT! 50 coins + a golden plushie'); buzz([60, 40, 60, 40, 120]); for (let i = 0; i < 6; i++) tone(523 * Math.pow(1.26, i % 4), 1046, 0.25, 'square', 0.05, i * 0.12); }
  else { tone(784, 1568, 0.3, 'triangle', 0.07); buzz(50); }
  persist(); hud();
}
let jackFx = 0;
// ---------- daily missions ----------
function seeded(str) { let h = 2166136261; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
function ensureMissions() {
  if (save.missions && save.missions.day === today()) return;
  const rnd = seeded(today()), pool = MPOOL.slice(), list = [];
  while (list.length < 3) { const m = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; list.push({ id: m.id, goal: m.g[Math.floor(rnd() * m.g.length)], prog: 0, claimed: false }); }
  save.missions = { day: today(), list, bonus: false }; persist();
}
function mission(id, n = 1) { ensureMissions(); for (const m of save.missions.list) if (m.id === id && !m.claimed) { const def = MPOOL.find(x => x.id === id); const was = m.prog >= m.goal; m.prog = def.max ? Math.max(m.prog, n) : m.prog + n; if (!was && m.prog >= m.goal) { toast('✅ Daily task done! Claim it in 📋'); tone(660, 1320, 0.2, 'triangle', 0.05); } } }
const rwText = rw => Object.entries(rw).map(([k, v]) => k === 'coins' ? `+${v} coins` : `+${v} ${k === 'shakes' ? 'shake' : k === 'walls' ? 'wall' : 'giant coin'}`).join(', ');
function claimMission(i) {
  const m = save.missions.list[i]; if (!m || m.claimed || m.prog < m.goal) return; m.claimed = true;
  const rw = MPOOL.find(x => x.id === m.id).rw; for (const [k, v] of Object.entries(rw)) save[k] += v;
  tone(784, 1568, 0.3, 'triangle', 0.07); buzz(30);
  if (save.missions.list.every(x => x.claimed) && !save.missions.bonus) {
    save.missions.bonus = true; const y = new Date(Date.now() - 864e5).toDateString();
    save.streak = save.streakDay === y ? save.streak + 1 : 1; save.streakDay = today();
    const b = 20 + 10 * Math.min(save.streak, 7); save.coins += b; toast(`🔥 All 3 done! Day ${save.streak} streak: +${b} coins`, 3.5);
  }
  persist(); hud(); openModal('missions');
}
// ---------- booths ----------
function applyBooth() {
  const B = booth();
  scene.background = gradientTex(B.sky); scene.fog.color.setHex(B.fog);
  aw.material.map = stripeTex(B.stripe[0], B.stripe[1], 12); aw.material.needsUpdate = true;
  sign.material.map = signTex(B.sign); sign.material.needsUpdate = true;
  M.red.color.setHex(B.cab); warm.color.setHex(B.warm); pink.color.setHex(B.pink);
  decoK.visible = B.id === 'kermis'; decoN.visible = B.id === 'night'; decoW.visible = B.id === 'winter';
  if (floorCol) floorCol.setFriction(B.friction);
  document.body.dataset.booth = B.id;
}
function clearBoard() {
  for (const c of coins) world.removeRigidBody(c.body); coins.length = 0;
  for (const p of prizes) { world.removeRigidBody(p.body); scene.remove(p.mesh); } prizes.length = 0;
  rainQ = 0; combo = 0;
}
function warmBoard() { for (let i = 0; i < 420; i++) { pushT += 1 / 60; pusherBody.setNextKinematicTranslation({ x: 0, y: CFG.deckY / 2, z: pusherZ() }); world.step(); }
  for (let i = coins.length - 1; i >= 0; i--) if (coins[i].body.translation().y < -0.5) { world.removeRigidBody(coins[i].body); coins.splice(i, 1); } }
function switchBooth(id) {
  const B = BOOTHS.find(b => b.id === id); if (!B || id === save.booth || !boothOpen(B)) return;
  saveBoard(); $('loading').innerHTML = `WALKING TO THE<br>${B.name}…`; $('loading').classList.remove('hidden');
  setTimeout(() => { clearBoard(); save.booth = id; save.lucky = 0; applyBooth(); if (fillBoard()) warmBoard(); persist(); hud(); $('loading').classList.add('hidden'); toast(`🎪 ${B.name}: ${B.rule}`, 4); tone(523, 784, 0.25, 'triangle', 0.05); }, 60);
}
// ---------- coin booth: no paid chance ----------
// Coins can't be bought. Money only buys things without randomness: a specific plushie, or early access to a booth.
const AD_COINS = 30, AD_MAX = 5;
function adsLeft() { if (save.ads.day !== today()) save.ads = { day: today(), n: 0 }; return AD_MAX - save.ads.n; }
function watchAd() {
  if (adsLeft() <= 0) return; const ov = $('adOv'); ov.classList.remove('hidden'); let t = 5; $('adT').textContent = t;
  const iv = setInterval(() => { t--; $('adT').textContent = t; if (t <= 0) { clearInterval(iv); ov.classList.add('hidden'); save.ads.n++; save.coins += AD_COINS; persist(); hud(); toast(`📺 +${AD_COINS} coins. Thanks for watching!`); tone(660, 1320, 0.3, 'triangle', 0.07); buzz(30); if (!$('shop').classList.contains('hidden')) openModal('shop'); if (!$('out').classList.contains('hidden')) openModal('out'); } }, 1000);
}
function buyPlush(id) { const P = PLUSH.find(p => p.id === id); if (!P || save.album[id]) return; save.album[id] = 1; mission('plush'); showCard(P, false, true); checkSets(); persist(); hud(); toast(`TEST purchase: ${P.name} added (no payment)`); openModal('shop'); }
function buyBooth(id) { const B = BOOTHS.find(b => b.id === id); if (!B) return; save.unlocked[B.set] = true; persist(); toast(`TEST purchase: ${B.name} unlocked (no payment)`); openModal('booths'); hud(); }
function checkSets() { for (const S of SETS) { const done = PLUSH.filter(x => x.set === S.id).every(x => save.album[x.id] || save.album[x.id + '_gold']);
  if (done && !save.setsDone[S.id]) { save.setsDone[S.id] = true; save.coins += S.bonus; confetti(180); toast(`🏆 ${S.name} set complete! +${S.bonus} coins`, 4); } } }
// ---------- onboarding ----------
const vtmp = new THREE.Vector3();
function proj(x, y, z) { vtmp.set(x, y, z).project(camera); return [(vtmp.x + 1) / 2 * innerWidth, (1 - vtmp.y) / 2 * innerHeight]; }
const TUT = [
  { t: 'Tap the machine to drop a coin.', at: () => proj(0, CFG.dropY, CFG.dropZ), done: b => save.dropped >= b.d + 1 },
  { t: 'Nice! Coins land on the moving shelf and get shoved forward. Now <b>hold your finger down</b> to keep dropping.', at: () => proj(aimX, CFG.dropY, CFG.dropZ), done: b => save.dropped >= b.d + 7 },
  { t: 'Everything that falls off the <b>front edge</b> is yours. The sides are gutters.', at: () => proj(0, 0, CFG.front + 0.2), done: (b, t) => save.won > b.w || t > 8 },
  { t: '🎯 Drop a coin <b>through the moving ring</b> to light a lamp. Light them all for a wheel spin.', at: () => proj(ringX(), CFG.ringY + 0.4, CFG.dropZ), done: (b, t) => save.lucky > b.l || save.spins > b.s || t > 14 },
  { t: 'Every 25 coins a plushie drops in. Push it off and it lands on your <b>Prize Shelf</b>.', at: () => { const r = $('bShelf').getBoundingClientRect(); return [r.left - 6, r.top + r.height / 2, 'left']; }, done: (b, t) => t > 6 },
];
let tutBase = null, tutT = 0;
function tutStep() {
  if (save.tut >= TUT.length || STRESS) { $('coach').classList.add('hidden'); return; }
  const st = TUT[save.tut];
  if (!tutBase) { tutBase = { d: save.dropped, w: save.won, l: save.lucky, s: save.spins }; tutT = performance.now(); $('coachT').innerHTML = st.t; $('coachN').textContent = `${save.tut + 1}/${TUT.length}`; $('coach').classList.remove('hidden'); }
  if (st.done(tutBase, (performance.now() - tutT) / 1000)) { save.tut++; tutBase = null; persist(); if (save.tut >= TUT.length) { $('coach').classList.add('hidden'); toast("You're a natural. Have fun at the fair!"); save.tut = 99; persist(); } }
}
function tutArrow() { if (save.tut >= TUT.length || $('coach').classList.contains('hidden')) return; const p = TUT[save.tut].at(); const a = $('tutArrow'); a.style.left = p[0] + 'px'; a.style.top = p[1] + 'px'; a.className = p[2] === 'left' ? 'left' : ''; }
// ---------- prize shelf (3D vitrine) ----------
let shelfR = null, shelfS, shelfC, shelfG = null, shelfOpen = false, shelfSet = 1, shelfRot = 0, shelfDrag = null, shelfPick = null, shelfItems = [], shelfT0 = 0;
M.sil = new THREE.MeshStandardMaterial({ color: 0x1A0F14, roughness: 1, transparent: true, opacity: 0.55 });
M.wood = new THREE.MeshStandardMaterial({ color: 0x6B3A24, roughness: 0.7 });
M.velvet = new THREE.MeshStandardMaterial({ color: 0x5A1020, roughness: 1 });
function labelTex(text, sub) { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d'); x.fillStyle = '#F6EBD5'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#D8343F'; x.fillRect(0, 0, 512, 8); x.fillRect(0, 88, 512, 8);
  x.fillStyle = '#1A0F14'; x.font = '900 40px Bungee, Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, sub ? 40 : 50); if (sub) { x.font = '700 22px "DM Sans", system-ui, sans-serif'; x.fillText(sub, 256, 74); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function buildShelf() {
  if (!shelfR) { shelfR = new THREE.WebGLRenderer({ canvas: $('shelfCv'), antialias: true }); shelfR.setPixelRatio(Math.min(2, devicePixelRatio || 1)); shelfR.outputColorSpace = THREE.SRGBColorSpace; shelfR.toneMapping = THREE.ACESFilmicToneMapping;
    shelfS = new THREE.Scene(); shelfS.background = gradientTex([[0, '#1B0F2E'], [1, '#4A1C3A']]); const pm = new THREE.PMREMGenerator(shelfR); shelfS.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; shelfS.environmentIntensity = 0.6;
    shelfS.add(new THREE.HemisphereLight(0xFFE7C2, 0x2A1230, 0.7)); const sp = new THREE.SpotLight(0xFFF1D6, 60, 30, 0.6, 0.5); sp.position.set(0, 8, 9); shelfS.add(sp); shelfS.add(sp.target);
    shelfC = new THREE.PerspectiveCamera(36, 1, 0.1, 100); }
  if (shelfG) { shelfS.remove(shelfG); shelfG.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  shelfG = new THREE.Group(); shelfS.add(shelfG); shelfItems = [];
  const S = SETS[shelfSet - 1], open = setUnlocked(S), list = PLUSH.filter(p => p.set === S.id);
  const bx = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.05), m); o.position.set(x, y, z); shelfG.add(o); return o; };
  bx(5.6, 6.4, 0.3, M.velvet, 0, 0.6, -1.0); bx(0.3, 6.8, 2.2, M.wood, -2.95, 0.6, 0); bx(0.3, 6.8, 2.2, M.wood, 2.95, 0.6, 0); bx(6.2, 0.35, 2.4, M.wood, 0, 4.1, 0); bx(6.2, 0.4, 2.4, M.wood, 0, -2.8, 0);
  for (const y of [-0.9, 1.6]) { const g = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.06, 1.9), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, roughness: 0.05 })); g.position.set(0, y, 0); shelfG.add(g); }
  for (let i = 0; i < 12; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), M.bulbOn); b.position.set(-2.6 + i * 0.47, 3.85, 1.05); shelfG.add(b); }
  const have = list.filter(p => save.album[p.id] || save.album[p.id + '_gold']).length;
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.82), new THREE.MeshBasicMaterial({ map: labelTex(S.name, open ? `${have}/8 collected${save.setsDone[S.id] ? ' · COMPLETE' : ''}` : `unlocks at level ${S.lv}`) })); lab.position.set(0, 4.75, 0.4); shelfG.add(lab);
  list.forEach((p, i) => { const n = save.album[p.id] || 0, g = save.album[p.id + '_gold'] || 0, got = n || g;
    const m = buildPlush(p.id, !!g); if (!got) m.traverse(o => { if (o.isMesh) o.material = M.sil; });
    const row = i < 4 ? 1 : 0, col = i % 4; m.scale.setScalar(0.62); m.position.set(-2.0 + col * 1.33, row ? 1.66 : -0.84, 0.15); m.rotation.y = -0.15 + (col - 1.5) * -0.12; shelfG.add(m);
    shelfItems.push({ m, p, n, g, got, y0: m.position.y, hop: 0 }); });
}
function openShelf(set) { shelfSet = set || booth().set; shelfOpen = true; $('shelf').classList.remove('hidden'); shelfTabs(); buildShelf(); resizeShelf(); shelfRot = 0.35; shelfT0 = performance.now(); $('shelfInfo').textContent = 'Drag to turn · tap a plushie'; requestAnimationFrame(shelfFrame); }
function shelfTabs() { $('shelfTabs').innerHTML = SETS.map(x => `<button data-set="${x.id}" class="${x.id === shelfSet ? 'on' : ''}">${x.name}${setUnlocked(x) ? '' : ' 🔒'}</button>`).join('');
  $('shelfTabs').querySelectorAll('button').forEach(b => b.onclick = () => { shelfSet = +b.dataset.set; shelfTabs(); buildShelf(); shelfRot = 0.3; }); }
function resizeShelf() { const w = innerWidth, h = innerHeight; shelfR.setSize(w, h, false); shelfC.aspect = w / h; const t = Math.tan(THREE.MathUtils.degToRad(18)), dist = Math.max(4.4 / t, 3.5 / (t * shelfC.aspect)); shelfC.position.set(0, 1.0, dist); shelfC.lookAt(0, 0.9, 0); shelfC.updateProjectionMatrix(); }
function closeShelf() { shelfOpen = false; $('shelf').classList.add('hidden'); }
function shelfFrame(now) {
  if (!shelfOpen) return;
  if (!shelfDrag) shelfRot *= 0.92;
  shelfG.rotation.y = shelfRot + Math.sin(now / 2400) * 0.04;
  for (const it of shelfItems) { if (it.hop > 0) { it.hop -= 0.016; const k = it.hop / 1.2; it.m.position.y = it.y0 + Math.abs(Math.sin(k * Math.PI * 3)) * 0.5 * k; it.m.rotation.y += 0.18; } }
  shelfR.render(shelfS, shelfC); requestAnimationFrame(shelfFrame);
}
{ const cv = () => $('shelfCv'), sray = new THREE.Raycaster();
  const down = e => { shelfDrag = { x: e.clientX, r: shelfRot, moved: 0 }; };
  const move = e => { if (!shelfDrag) return; const dx = e.clientX - shelfDrag.x; shelfDrag.moved = Math.max(shelfDrag.moved, Math.abs(dx)); shelfRot = Math.max(-0.8, Math.min(0.8, shelfDrag.r + dx / 260)); };
  const up = e => { if (!shelfDrag) return; const tap = shelfDrag.moved < 6; shelfDrag = null; if (!tap) return; const r = cv().getBoundingClientRect();
    sray.setFromCamera({ x: (e.clientX - r.left) / r.width * 2 - 1, y: -(e.clientY - r.top) / r.height * 2 + 1 }, shelfC);
    const hits = sray.intersectObjects(shelfItems.map(i => i.m), true); if (!hits.length) return; let o = hits[0].object; const it = shelfItems.find(i => { let x = o; while (x) { if (x === i.m) return true; x = x.parent; } return false; }); if (!it) return;
    it.hop = 1.2; tone(it.got ? 880 : 300, it.got ? 1320 : 240, 0.15, 'triangle', 0.05); buzz(15);
    $('shelfInfo').innerHTML = it.got ? `<b>${it.p.name}</b> · ${it.n ? '×' + it.n : ''}${it.g ? ' ✨ golden ×' + it.g : ''}` : `<b>???</b> · win it in the ${BOOTHS.find(b => b.set === it.p.set).name}`; };
  setTimeout(() => { cv().addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); }, 0); }
// ---------- adaptive quality ----------
let qTier = 0, qBuf = [], qNext = 0;
const QT = [{ dpr: Math.min(2, window.devicePixelRatio || 1), shadows: true }, { dpr: Math.min(1.5, window.devicePixelRatio || 1), shadows: true }, { dpr: 1, shadows: false }];
function setTier(i) { qTier = i; setQuality(QT[i]); }
function qualityTick(ft, now) {
  if (STRESS || save.quality !== 'auto' || shelfOpen) return; qBuf.push(ft); if (qBuf.length > 240) qBuf.shift();
  if (now < qNext || qBuf.length < 180) return; qNext = now + 4000;
  const fps = 1000 / (qBuf.reduce((a, b) => a + b, 0) / qBuf.length);
  if (fps < 45 && qTier < QT.length - 1) { setTier(qTier + 1); qBuf = []; }
}
function applyQualitySetting() { if (save.quality === 'high') setTier(0); else if (save.quality === 'low') setTier(2); else setTier(0); qBuf = []; qNext = performance.now() + 6000; }
// ---------- ui ----------
let toastQ = [], toastT = 0;
function toast(t, secs = 2.4) { toastQ.push([t, secs]); }
function popup(t, cls = '') { const el = document.createElement('div'); el.className = 'pop ' + cls; el.textContent = t; el.style.left = (40 + Math.random() * 20) + '%'; $('pops').appendChild(el); setTimeout(() => el.remove(), 900); }
let cardT = 0;
function showCard(P, golden, first) {
  const c = $('card'); $('cardImg').src = plushThumb(P.id, golden); $('cardTag').textContent = first ? (golden ? 'NEW · GOLDEN!' : 'NEW!') : (golden ? 'GOLDEN' : 'DUPLICATE');
  $('cardTag').className = first ? 'new' : ''; $('cardName').textContent = P.name;
  const key = P.id + (golden ? '_gold' : ''); const S = SETS[P.set - 1]; const have = PLUSH.filter(x => x.set === S.id && (save.album[x.id] || save.album[x.id + '_gold'])).length;
  $('cardSub').textContent = `${S.name} · ${have}/8${save.album[key] > 1 ? ' · ×' + save.album[key] : ''}`;
  c.classList.toggle('gold', !!golden); c.classList.remove('hidden', 'fly'); void c.offsetWidth; c.classList.add('in');
  clearTimeout(cardT); cardT = setTimeout(() => { c.classList.add('fly'); setTimeout(() => { c.classList.add('hidden'); c.classList.remove('in', 'fly'); $('bAlbum').classList.add('bump'); setTimeout(() => $('bAlbum').classList.remove('bump'), 500); }, 520); }, 2300);
}
function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function hud() {
  $('coins').textContent = save.coins;
  const left = CFG.refillSecs - Math.floor((Date.now() - save.lastRefill) / 1000) % CFG.refillSecs;
  $('refill').textContent = save.coins >= CFG.refillCap ? 'free refill: max' : `+1 free in ${fmt(Math.max(0, left))}`;
  $('lvl').textContent = save.level; $('xpfill').style.width = Math.min(100, save.xp / xpNeed(save.level) * 100) + '%';
  $('shakeN').textContent = save.shakes; $('wallN').textContent = wallT > 0 ? Math.ceil(wallT) + 's' : save.walls; $('giantN').textContent = save.giants;
  $('bShake').disabled = save.shakes <= 0; $('bWall').disabled = save.walls <= 0 && wallT <= 0; $('bGiant').disabled = save.giants <= 0;
  const open = PLUSH.filter(p => setUnlocked(SETS[p.set - 1])), owned = open.filter(p => save.album[p.id] || save.album[p.id + '_gold']).length; $('albumN').textContent = owned + '/' + open.length;
  $('dailyDot').classList.toggle('hidden', save.daily === today());
  ensureMissions(); $('missDot').classList.toggle('hidden', !save.missions.list.some(m => !m.claimed && m.prog >= m.goal));
  $('missN').textContent = save.missions.list.filter(m => m.claimed).length + '/3';
  const need = booth().luckyNeed;
  document.querySelectorAll('#luckyL i').forEach((el, i) => { el.classList.toggle('on', i < save.lucky); el.classList.toggle('hidden', i >= need); });
  lamps.forEach((l, i) => { l.material = i < save.lucky ? lampOn : lampOff; l.visible = i < need; l.userData.rim.visible = i < need; });
  $('hour').classList.toggle('hidden', goldT <= 0); $('hourT').textContent = Math.ceil(goldT) + 's';
  $('boothName').textContent = booth().name;
}
let albumSet = 1;
function openModal(id) {
  for (const m of ['album', 'shop', 'out', 'missions', 'booths', 'settings', 'backup', 'away', 'odds']) $(m).classList.toggle('hidden', m !== id);
  if (id === 'album') {
    const S = SETS[albumSet - 1], open = setUnlocked(S), list = PLUSH.filter(p => p.set === S.id);
    $('albumTabs').innerHTML = SETS.map(x => `<button data-set="${x.id}" class="${x.id === albumSet ? 'on' : ''}">${x.name}${setUnlocked(x) ? '' : ' 🔒'}</button>`).join('');
    $('albumTabs').querySelectorAll('button').forEach(b => b.onclick = () => { albumSet = +b.dataset.set; openModal('album'); });
    const have = list.filter(p => save.album[p.id] || save.album[p.id + '_gold']).length;
    const BB = BOOTHS.find(b => b.set === S.id);
    $('albumLine').textContent = open ? `${have}/8 collected · won in the ${BB.name} booth · complete the set for +${S.bonus} coins${save.setsDone[S.id] ? ' ✓' : ''}. Golden ones are rare (10%).` : `The ${BB.name} booth opens at level ${S.lv}.`;
    $('albumGrid').innerHTML = list.map(p => { const n = save.album[p.id] || 0, g = save.album[p.id + '_gold'] || 0, got = n || g;
      return `<div class="slot ${got ? 'have' : ''} ${g ? 'gold' : ''}"><img src="${plushThumb(p.id, !!g && !n)}" class="${got ? '' : 'sil'}" alt=""><b>${got ? p.name : '???'}</b><small>${n ? '×' + n : ''}${g ? ' ✨' + g : ''}${got ? '' : '&nbsp;'}</small></div>`; }).join('');
    $('albumGrid').classList.toggle('locked', !open);
  }
  if (id === 'shop') {
    $('dailyBtn').disabled = save.daily === today(); $('dailyBtn').textContent = save.daily === today() ? 'Daily bonus claimed ✓' : `Claim daily bonus · +${CFG.dailyBonus}`;
    const al = adsLeft(); $('adBtn').disabled = al <= 0; $('adBtn').innerHTML = al > 0 ? `📺 Watch a short ad · +${AD_COINS} coins<em>${al} left today</em>` : '📺 No more ads today<em>back tomorrow</em>';
    const miss = PLUSH.filter(p => p.set === booth().set && !save.album[p.id]).slice(0, 4);
    $('prizeBooth').innerHTML = miss.length ? miss.map(p => `<button class="pack pb" data-buy="${p.id}"><img src="${plushThumb(p.id, false)}" alt=""><span>${p.name}<small>this exact plushie</small></span><em>€1,99</em></button>`).join('') : '<div class="note">You own every plushie in this booth. Nice.</div>';
    $('prizeBooth').querySelectorAll('[data-buy]').forEach(b => b.onclick = () => buyPlush(b.dataset.buy));
  }
  if (id === 'booths') {
    $('boothDot').classList.add('hidden');
    $('boothList').innerHTML = BOOTHS.map(B => { const op = boothOpen(B), here = B.id === save.booth, S = SETS[B.set - 1], have = PLUSH.filter(p => p.set === B.set && (save.album[p.id] || save.album[p.id + '_gold'])).length;
      return `<div class="booth b-${B.id} ${here ? 'here' : ''} ${op ? '' : 'locked'}"><div class="bh"><b>${B.name}</b><small>${S.name} · ${have}/8</small></div><p>${B.rule}</p>
        ${here ? '<span class="tag">YOU ARE HERE</span>' : op ? `<button class="btn" data-go="${B.id}">WALK OVER</button>` : `<div class="lockrow"><span>🔒 Level ${B.lv}</span><button class="pack" data-unlock="${B.id}">Open now<em>€2,99</em></button></div>`}</div>`; }).join('');
    $('boothList').querySelectorAll('[data-go]').forEach(b => b.onclick = () => { $('booths').classList.add('hidden'); switchBooth(b.dataset.go); });
    $('boothList').querySelectorAll('[data-unlock]').forEach(b => b.onclick = () => buyBooth(b.dataset.unlock));
  }
  if (id === 'settings') {
    document.querySelectorAll('[data-set-k]').forEach(b => { const k = b.dataset.setK; b.classList.toggle('on', !!save[k]); b.textContent = save[k] ? 'ON' : 'OFF'; });
    document.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', save.quality === b.dataset.q));
    $('remRow').classList.toggle('hidden', !(NATIVE && N.LocalNotifications)); $('remBtn').classList.toggle('on', !!save.remind); $('remBtn').textContent = save.remind ? 'ON' : 'OFF';
    $('installBtn').classList.toggle('hidden', !canInstall());
    $('verLine').textContent = `SHOVE v${VERSION} · ${NATIVE ? 'app' : standalone() ? 'home screen' : 'browser'} · Auto lowers resolution and shadows when your phone can't keep up.`;
  }
  if (id === 'odds') {
    const pct = w => Math.round(w / wTotal * 1000) / 10 + '%';
    $('oddsList').innerHTML = WHEEL.map(s => `<div class="od"><span>${s.icon}</span><b>${s.label}</b><em>${pct(s.w)}</em></div>`).join('');
    $('oddsMore').innerHTML = `<div class="od"><span>⭐</span><b>Lucky token per dropped coin</b><em>1 in ${Math.round(1 / CFG.starChance)}</em></div><div class="od"><span>✨</span><b>Golden plushie</b><em>10%</em></div><div class="od"><span>🧸</span><b>Plushie drop</b><em>every ${CFG.prizeEvery} coins</em></div>`;
  }
  if (id === 'missions') {
    ensureMissions();
    $('missList').innerHTML = save.missions.list.map((m, i) => { const d = MPOOL.find(x => x.id === m.id), p = Math.min(m.prog, m.goal), done = m.prog >= m.goal;
      return `<div class="mis ${m.claimed ? 'claimed' : done ? 'done' : ''}"><div><b>${d.t(m.goal)}</b><div class="bar"><i style="width:${p / m.goal * 100}%"></i></div><small>${p}/${m.goal} · ${rwText(d.rw)}</small></div><button data-claim="${i}" ${done && !m.claimed ? '' : 'disabled'}>${m.claimed ? '✓' : 'CLAIM'}</button></div>`; }).join('');
    $('missList').querySelectorAll('[data-claim]').forEach(b => b.onclick = () => claimMission(+b.dataset.claim));
    const n = save.streakDay === today() ? save.streak : (save.streakDay === new Date(Date.now() - 864e5).toDateString() ? save.streak : 0);
    $('streakLine').textContent = `🔥 Streak: ${n} day${n === 1 ? '' : 's'} · finish all 3 for +${20 + 10 * Math.min(n + (save.missions.bonus ? 0 : 1), 7)} coins. New tasks at midnight.`;
  }
  if (id === 'out') { const left = CFG.refillSecs - Math.floor((Date.now() - save.lastRefill) / 1000) % CFG.refillSecs; $('outLine').textContent = `Next free coin in ${fmt(left)}. Free coins refill up to ${CFG.refillCap}.`;
    const al = adsLeft(); $('outAd').disabled = al <= 0; $('outAd').textContent = al > 0 ? `📺 Watch an ad · +${AD_COINS} coins` : 'No more ads today'; }
}
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('.modal').classList.add('hidden')));
$('bAlbum').addEventListener('click', () => openModal('album'));
$('bShop').addEventListener('click', () => openModal('shop'));
$('bMiss').addEventListener('click', () => openModal('missions'));
$('spinBtn').addEventListener('click', spin);
$('outShop').addEventListener('click', () => openModal('shop'));
$('dailyBtn').addEventListener('click', () => { if (save.daily === today()) return; save.daily = today(); save.coins += CFG.dailyBonus; persist(); hud(); openModal('shop'); toast(`+${CFG.dailyBonus} daily coins`); tone(660, 1320, 0.3, 'triangle', 0.07); });
$('adBtn').addEventListener('click', watchAd); $('outAd').addEventListener('click', watchAd);
$('bBooth').addEventListener('click', () => openModal('booths'));
$('bShelf').addEventListener('click', () => openShelf()); $('shelfClose').addEventListener('click', closeShelf); $('albumShelf').addEventListener('click', () => { $('album').classList.add('hidden'); openShelf(albumSet); });
$('bSet').addEventListener('click', () => openModal('settings'));
document.querySelectorAll('[data-set-k]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.setK; save[k] = !save[k]; persist(); openModal('settings'); if (!save.sound || !save.music) ambienceOff(); else if (musicOn) ambience(); }));
document.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { save.quality = b.dataset.q; persist(); applyQualitySetting(); openModal('settings'); }));
$('remBtn').addEventListener('click', () => { save.remind = !save.remind; persist(); openModal('settings'); setReminder(save.remind); });
$('bkCopy').addEventListener('click', () => openBackup('copy')); $('bkLoad').addEventListener('click', () => openBackup('load'));
$('installBtn').addEventListener('click', install);
$('oddsBtn').addEventListener('click', () => openModal('odds')); $('wheelOdds').addEventListener('click', () => { $('wheel').classList.add('hidden'); wheelOpen = false; openModal('odds'); if (pendingSpins > 0) $('oddsBack').classList.remove('hidden'); });
$('oddsBack').addEventListener('click', () => { $('odds').classList.add('hidden'); $('oddsBack').classList.add('hidden'); openWheel(); });
$('tutReplay').addEventListener('click', () => { save.tut = 0; tutBase = null; persist(); $('settings').classList.add('hidden'); });
$('coachSkip').addEventListener('click', () => { save.tut = 99; persist(); $('coach').classList.add('hidden'); });
window.addEventListener('resize', () => { if (shelfOpen) resizeShelf(); });
$('bShake').addEventListener('click', useShake); $('bWall').addEventListener('click', useWall); $('bGiant').addEventListener('click', useGiant);
// drop input: tap / hold to keep dropping
const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.5), hit = new THREE.Vector3();
let holding = false, holdX = 0, nextHold = 0, aimX = 0;
function pickX(e) { const r = renderer.domElement.getBoundingClientRect(); ray.setFromCamera({ x: (e.clientX - r.left) / r.width * 2 - 1, y: -(e.clientY - r.top) / r.height * 2 + 1 }, camera); ray.ray.intersectPlane(plane, hit); return hit.x; }
renderer.domElement.addEventListener('pointerdown', e => { ac(); musicOn = true; if (AC.state === 'suspended') AC.resume(); ambience(); holding = true; holdX = aimX = pickX(e); dropAt(holdX); nextHold = performance.now() + 380; });
renderer.domElement.addEventListener('pointermove', e => { aimX = pickX(e); if (holding) holdX = aimX; });
window.addEventListener('pointerup', () => { holding = false; });
// aim marker (a ghost coin riding above the pusher)
const ghost = new THREE.Mesh(new THREE.CylinderGeometry(CFG.coinR, CFG.coinR, CFG.coinH * 2, 24), new THREE.MeshBasicMaterial({ color: 0xFFE38A, transparent: true, opacity: 0.45 })); scene.add(ghost);

// ---------- loop ----------
let last = performance.now(), acc = 0, shakeFx = 0, saveT = 0, hudT = 0, bulbT = 0;
const dummy = new THREE.Object3D();
let simSteps = 0;
function frame(now) {
  const tA = performance.now();
  const rawFt = now - last; const dt = Math.min(0.05, rawFt / 1000); last = now;
  acc += dt; let steps = 0;
  while (acc >= 1 / 60 && steps < 2) {
    pushT += 1 / 60; ringT += booth().ringSpeed / 60; pusherBody.setNextKinematicTranslation({ x: 0, y: CFG.deckY / 2, z: pusherZ() });
    world.step(); acc -= 1 / 60; steps++; simSteps++;
    for (const c of coins) if (c.fresh) { const t = c.body.translation();
      if (c.py > CFG.ringY && t.y <= CFG.ringY && Math.abs(t.x - ringX()) < CFG.ringTol && Math.abs(t.z - CFG.dropZ) < 0.7) { luckyHit(); if (c.star) c.fresh = false; }
      if (t.y < 1.05) { c.fresh = false; clatter(); } c.py = t.y; }
    // collect / lose
    for (let i = coins.length - 1; i >= 0; i--) { const t = coins[i].body.translation(); if (t.y < -0.6) { const won = t.z > CFG.front - 0.2 && Math.abs(t.x) < W + 0.05; if (won) collectCoin(coins[i]); else { tone(240, 140, 0.12, 'sine', 0.02); if (coins[i].star) toast('Lucky token slipped into the gutter…'); } world.removeRigidBody(coins[i].body); coins.splice(i, 1); } }
    for (let i = prizes.length - 1; i >= 0; i--) { const t = prizes[i].body.translation(); if (t.y < -0.6) { if (t.z > CFG.front - 0.3) collectPrize(prizes[i]); else toast('A prize slipped into the gutter…'); world.removeRigidBody(prizes[i].body); scene.remove(prizes[i].mesh); prizes.splice(i, 1); } }
  }
  if (acc > 0.1) acc = 0;
  const tB = performance.now();
  if (rainQ > 0) { rainT -= dt; while (rainT <= 0 && rainQ > 0) { rainT += 0.055; rainQ--; if (coins.length < CFG.rainCap) { const r = addCoin(-3.3 + Math.random() * 6.6, 3.6 + Math.random() * 0.6, -4.6 + Math.random() * 7.2); r.py = 9; if (Math.random() < 0.3) clatter(); } else { save.coins++; popup('+1'); } } }
  if (comboT > 0) { comboT -= dt; if (comboT <= 0) { combo = 0; $('combo').classList.remove('on', 'hot'); } }
  if (goldT > 0) goldT -= dt;
  if (holding && now > nextHold) { dropAt(holdX); nextHold = now + 260; }
  if (wallT > 0) { wallT -= dt; if (wallT <= 0) { wallColliders.forEach(c => c.setEnabled(false)); wallMeshes.forEach(m => m.visible = false); } }
  // sync visuals
  pusherMesh.position.z = pusherZ();
  let ni = 0, gi = 0, si = 0;
  for (const c of coins) { const t = c.body.translation(), r = c.body.rotation(); dummy.position.set(t.x, t.y, t.z); dummy.quaternion.set(r.x, r.y, r.z, r.w); dummy.updateMatrix(); if (c.giant) giantMesh.setMatrixAt(gi++, dummy.matrix); else if (c.star) { if (si < 30) starMesh.setMatrixAt(si++, dummy.matrix); } else if (ni < MAXI) coinMesh.setMatrixAt(ni++, dummy.matrix); }
  coinMesh.count = ni; coinMesh.instanceMatrix.needsUpdate = true; giantMesh.count = gi; giantMesh.instanceMatrix.needsUpdate = true; starMesh.count = si; starMesh.instanceMatrix.needsUpdate = true;
  ring.position.set(ringX(), CFG.ringY, CFG.dropZ); ring.rotation.z += dt * 2;
  if (ringFlash > 0) { ringFlash -= dt; ring.scale.setScalar(1 + ringFlash * 0.6); ringMat.emissiveIntensity = 0.6 + ringFlash * 4; } else { ring.scale.setScalar(1); ringMat.emissiveIntensity = 0.6; }
  ringBulbs.forEach((b, i) => b.material = (i + Math.floor(now / 120)) % 2 ? M.bulbOn : M.bulbOff);
  for (const p of prizes) { const t = p.body.translation(), r = p.body.rotation(); p.mesh.position.set(t.x, t.y, t.z); p.mesh.quaternion.set(r.x, r.y, r.z, r.w); }
  ghost.position.set(Math.max(-W + 0.5, Math.min(W - 0.5, aimX)), CFG.dropY, CFG.dropZ); ghost.visible = save.coins > 0;
  bulbT += dt; const party = goldT > 0 || jackFx > 0; if (jackFx > 0) jackFx -= dt;
  if (bulbT > (party ? 0.08 : 0.18)) { bulbT = 0; const k = Math.floor(now / (party ? 80 : 180)); bulbs.forEach((b, i) => { if (i < 36) b.material = party ? ((i + k) % 2 ? M.bulbOn : M.bulbOff) : (i + k) % 3 === 0 ? M.bulbOff : M.bulbOn; }); }
  chuteGlow.material.color.setHex(goldT > 0 ? 0xFFE38A : 0xFFC54D);
  wheel.rotation.z += dt * 0.08; chuteGlow.material.opacity = 0.25 + Math.sin(now / 300) * 0.1;
  if (decoW.visible) { const a = snowGeo.attributes.position.array; for (let i = 0; i < SN; i++) { a[i * 3 + 1] -= dt * (1.2 + (i % 5) * 0.25); a[i * 3] += Math.sin(now / 900 + i) * dt * 0.3; if (a[i * 3 + 1] < -1) a[i * 3 + 1] = 21; } snowGeo.attributes.position.needsUpdate = true; }
  fxTick(dt); glowSync(); tutStep(); tutArrow(); qualityTick(rawFt, now);
  if (shakeFx > 0 || jackFx > 2) { shakeFx = Math.max(0, shakeFx - dt); const k = Math.max(shakeFx, jackFx > 2 ? 0.15 : 0); camera.position.x = Math.sin(now / 20) * k * 0.4; } else camera.position.x = 0;
  // toasts
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('on'); }
  else if (toastQ.length) { const [t, s] = toastQ.shift(); $('toast').textContent = t; $('toast').classList.add('on'); toastT = s; }
  hudT += dt; if (hudT > 0.5) { hudT = 0; refill(); hud(); }
  saveT += dt; if (saveT > 6) { saveT = 0; save.seen = Date.now(); saveBoard(); }
  music();
  const tC = performance.now();
  if (!shelfOpen) { if (glowOn()) composer.render(); else renderer.render(scene, camera); }
  if (perfHook) perfHook(now, dt, tB - tA, performance.now() - tC, steps);
  requestAnimationFrame(frame);
}
// ---------- lifecycle: pause when hidden, welcome back on return ----------
let hiddenAt = 0;
function goAway() { save.seen = Date.now(); saveBoard(); persist(); if (!hiddenAt) hiddenAt = Date.now(); holding = false; try { AC && AC.state === 'running' && AC.suspend(); } catch (e) {} }
function comeBack() { if (!hiddenAt) return; const away = Date.now() - hiddenAt; hiddenAt = 0; last = performance.now(); acc = 0; save.seen = Date.now();
  try { AC && musicOn && AC.resume(); } catch (e) {}
  const before = save.coins; refill(); hud(); welcome(away, save.coins - before); }
document.addEventListener('visibilitychange', () => { if (document.hidden) goAway(); else comeBack(); });
window.addEventListener('pagehide', goAway);
function awayText(ms) { const m = Math.round(ms / 6e4); if (m < 60) return `${m} min`; const h = Math.floor(m / 60); if (h < 24) return `${h} h ${String(m % 60).padStart(2, '0')} min`; const d = Math.floor(h / 24); return `${d} day${d > 1 ? 's' : ''}`; }
function welcome(away, got) {
  if (STRESS || away < 5 * 6e4 || save.tut < TUT.length) return;
  ensureMissions();
  const ready = save.missions.list.filter(m => !m.claimed && m.prog >= m.goal).length, daily = save.daily !== today();
  const items = [];
  if (got > 0) items.push(['🪙', `+${got} free coin${got > 1 ? 's' : ''}`, save.coins >= CFG.refillCap ? 'the hopper is full again' : 'refilled while you were gone']);
  else if (save.coins >= CFG.refillCap) items.push(['🪙', 'Hopper is full', `${save.coins} coins ready to drop`]);
  if (daily) items.push(['🎁', 'Daily bonus ready', `+${CFG.dailyBonus} coins in the coin booth`]);
  if (ready) items.push(['✅', `${ready} task${ready > 1 ? 's' : ''} ready to claim`, 'in daily tasks']);
  if (!items.length) return;
  $('awayLine').textContent = `You were away ${awayText(away)}. The machine kept warm.`;
  $('awayList').innerHTML = items.map(([i, b, s]) => `<div class="aw"><span>${i}</span><div><b>${b}</b><small>${s}</small></div></div>`).join('');
  $('awayGo').textContent = daily ? 'GRAB THE DAILY BONUS' : 'BACK TO THE MACHINE';
  $('awayGo').onclick = () => { $('away').classList.add('hidden'); if (daily) openModal('shop'); };
  openModal('away'); tone(523, 784, 0.25, 'triangle', 0.05); buzz(15);
}
// ---------- backup code: move your progress to another phone or into the app ----------
const B64 = { enc: s => btoa(String.fromCharCode(...new TextEncoder().encode(s))), dec: s => new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0))) };
function backupCode() { const o = Object.assign({}, save); delete o.boards; delete o.board; o.v = VERSION; o.at = Date.now(); return 'SHOVE1.' + B64.enc(JSON.stringify(o)); }
function readCode(code) { const c = (code || '').trim().replace(/\s+/g, ''); if (!c.startsWith('SHOVE1.')) return null; try { const o = JSON.parse(B64.dec(c.slice(7))); return o && typeof o.coins === 'number' && o.album ? o : null; } catch (e) { return null; } }
function openBackup(mode) { openModal('backup'); const ta = $('bkText'); $('bkMsg').textContent = '';
  if (mode === 'copy') { $('bkTitle').textContent = 'YOUR BACKUP CODE'; $('bkInfo').textContent = 'Paste this code on another phone (or in the app later) to bring your coins, plushies, level and streak along. Machine boards start fresh.'; ta.value = backupCode(); ta.readOnly = true; $('bkAct').textContent = 'COPY CODE'; $('bkAct').onclick = copyCode; }
  else { $('bkTitle').textContent = 'RESTORE PROGRESS'; $('bkInfo').textContent = 'Paste a SHOVE backup code. This replaces the progress on this phone.'; ta.value = ''; ta.readOnly = false; $('bkAct').textContent = 'RESTORE'; $('bkAct').onclick = restoreCode; setTimeout(() => ta.focus(), 50); } }
async function copyCode() { const ta = $('bkText'); try { await navigator.clipboard.writeText(ta.value); $('bkMsg').textContent = 'Copied ✓ Keep it somewhere safe.'; } catch (e) { ta.select(); try { document.execCommand('copy'); $('bkMsg').textContent = 'Copied ✓'; } catch (e2) { $('bkMsg').textContent = 'Select the code and copy it by hand.'; } } buzz(15); }
let restoreArm = 0;
function restoreCode() { const o = readCode($('bkText').value); if (!o) { $('bkMsg').textContent = "That isn't a SHOVE backup code."; buzz([20, 40, 20]); return; }
  const owned = Object.keys(o.album).filter(k => !k.endsWith('_gold')).length;
  if (Date.now() - restoreArm > 10000) { restoreArm = Date.now(); $('bkMsg').textContent = `Found: level ${o.level}, ${o.coins} coins, ${owned} plushies. Tap RESTORE again to replace this phone's progress.`; return; }
  const n = Object.assign({}, o, { boards: {}, seen: Date.now() }); delete n.v; delete n.at;
  hiddenAt = 0; window.removeEventListener('pagehide', goAway); document.removeEventListener('visibilitychange', goAway);
  Object.keys(save).forEach(k => delete save[k]); Object.assign(save, n); persist();
  if (NATIVE && N.Preferences) N.Preferences.set({ key: KEY, value: JSON.stringify(save) }).finally(() => location.reload()); else location.reload(); }
// ---------- install on the home screen (web) ----------
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const webApp = () => !NATIVE && !STRESS && window.isSecureContext && /^https?:$/.test(location.protocol);
const canInstall = () => webApp() && !standalone();
async function install() { if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); installEvt = null; if (r && r.outcome === 'accepted') toast('📲 SHOVE is on your home screen'); return; }
  $('settings').classList.add('hidden'); toast(isIOS() ? 'In Safari: tap Share ⬆️, then “Add to Home Screen”' : 'Open the browser menu ⋮, then “Install app” or “Add to Home screen”', 5); }
// ---------- daily reminder (app only) ----------
async function setReminder(on) { const L = N && N.LocalNotifications; if (!L) return;
  try { if (on) { const p = await L.requestPermissions(); if (p.display !== 'granted') { save.remind = false; persist(); toast('Notifications are off for SHOVE in your phone settings'); openModal('settings'); return; }
      await L.cancel({ notifications: [{ id: 1 }] }).catch(() => {});
      await L.schedule({ notifications: [{ id: 1, title: 'The fair is open 🎪', body: 'Your daily bonus and three new tasks are waiting.', schedule: { on: { hour: 19, minute: 0 }, allowWhileIdle: true } }] });
      toast('⏰ Reminder set for 19:00 every day'); }
    else await L.cancel({ notifications: [{ id: 1 }] }); } catch (e) { toast('Could not set the reminder'); } }
function nativeHooks() { if (!NATIVE) return;
  if (N.StatusBar) { N.StatusBar.setBackgroundColor({ color: '#1A0F14' }).catch(() => {}); N.StatusBar.setStyle({ style: 'DARK' }).catch(() => {}); }
  if (N.App) N.App.addListener('backButton', () => {
    const open = [...document.querySelectorAll('.modal')].find(m => !m.classList.contains('hidden') && m.id !== 'wheel');
    if (open) open.classList.add('hidden'); else if (shelfOpen) closeShelf(); else { goAway(); N.App.minimizeApp().catch(() => {}); } }); }

// ---------- boot ----------
(async () => {
  if (NATIVE && N.Preferences && !STRESS && !localStorage.getItem(KEY)) {   // iOS can wipe WebView storage: restore from native storage
    try { const r = await N.Preferences.get({ key: KEY }); if (r && r.value) { localStorage.setItem(KEY, r.value); location.reload(); return; } } catch (e) {} }
  await RAPIER.init();
  const coinsBefore = save.coins, awayBoot = save.seen ? Date.now() - save.seen : 0;
  initWorld();
  coinMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(CFG.coinR, CFG.coinR, CFG.coinH * 2, 28), [M.gold, M.goldFace, M.goldFace], MAXI); coinMesh.castShadow = true; coinMesh.receiveShadow = true; coinMesh.frustumCulled = false; scene.add(coinMesh);
  giantMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(CFG.coinR * 2.1, CFG.coinR * 2.1, CFG.coinH * 4, 36), [M.gold, M.goldFace, M.goldFace], 20); giantMesh.castShadow = true; giantMesh.frustumCulled = false; scene.add(giantMesh);
  starMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(CFG.coinR * 1.05, CFG.coinR * 1.05, CFG.coinH * 2.4, 28), [M.starSide, M.starFace, M.starFace], 30); starMesh.castShadow = true; starMesh.frustumCulled = false; scene.add(starMesh);
  if (!boothOpen(booth())) save.booth = 'kermis';
  applyBooth();
  if (fillBoard()) warmBoard();
  makeComposer(); ensureMissions(); refill(); resize(); applyQualitySetting(); hud();
  $('loading').classList.add('hidden');
  nativeHooks(); save.seen = Date.now(); welcome(awayBoot, save.coins - coinsBefore);
  if (webApp() && 'serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});

  requestAnimationFrame(frame);
  window.__k.ready = true;
  if (STRESS) import('./stress.js');
})();
let perfHook = null;
function setQuality({ dpr, shadows }) { if (dpr) { renderer.setPixelRatio(dpr); resize(); } if (shadows !== undefined) { key.castShadow = shadows; renderer.shadowMap.needsUpdate = true; } }
function addLooseCoin() { return addCoin(-3.3 + Math.random() * 6.6, 3.2 + Math.random() * 0.8, -2.2 + Math.random() * 6); }
function trimTo(n) { while (coins.length > n) { const i = Math.floor(Math.random() * coins.length); world.removeRigidBody(coins[i].body); coins.splice(i, 1); } }
window.__k = { switchBooth, openShelf, closeShelf, watchAd, buyPlush, BOOTHS, get qTier() { return qTier; }, STRESS, renderer, setQuality, addLooseCoin, trimTo, burst() { rainQ += 50; doShake(); }, set perfHook(f) { perfHook = f; }, get simSteps() { return simSteps; }, ready: false, save, coins, prizes, dropAt, useShake, useWall, useGiant, openModal, CFG, queueSpin, spin, luckyHit, showCard, PLUSH, reward, WHEEL, mission, ringX, get combo() { return combo; }, get rainQ() { return rainQ; }, set goldT(v) { goldT = v; }, bumpCombo, get world() { return world; }, welcome, backupCode, readCode, openBackup, goAway, comeBack, confetti, sparkBurst, get glow() { return !!glowOn(); } };
