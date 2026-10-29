// Bofflebell UI-richting C: verplaatst de bestaande knoppen (met hun listeners en ID's) naar een tabbalk en een bel-menu.
// Geen nieuwe logica: elke knop blijft de originele knop van main.js.
(() => {
  const $ = id => document.getElementById(id);
  if (!$('bBooth') || $('bbTabs')) return;
  const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = new URL('./ui-c.css', import.meta.url).href; document.head.appendChild(link);
  document.documentElement.style.setProperty('--bbBellMask', `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 70'%3E%3Ccircle cx='32' cy='7' r='5' fill='none' stroke='black' stroke-width='4'/%3E%3Cpath d='M32 11c-14 0-20 12-20 26v10l-6 8h52l-6-8V37c0-14-6-26-20-26z'/%3E%3Crect x='6' y='52' width='52' height='7' rx='3.5'/%3E%3Ccircle cx='32' cy='63' r='6'/%3E%3C/svg%3E")`);
  const label = (b, t) => { const s = document.createElement('span'); s.className = 'tl'; s.textContent = t; b.appendChild(s); return b; };
  // tabbalk: FAIR · SHELF · PLAY (kramen) · TASKS · SHOP
  const tabs = document.createElement('nav'); tabs.id = 'bbTabs'; tabs.setAttribute('aria-label', 'Fair menu');
  [['bFair', 'Fair'], ['bShelf', 'Shelf'], ['bBooth', 'Play'], ['bMiss', 'Tasks'], ['bShop', 'Shop']].forEach(([id, t]) => { const b = $(id); if (!b) return; label(b, t); if (id === 'bBooth') b.classList.add('bb-play'); tabs.appendChild(b); });
  document.body.appendChild(tabs);
  // bel-menu rechtsboven: collectie en instellingen
  const bell = document.createElement('button'); bell.id = 'bbBell'; bell.type = 'button'; bell.setAttribute('aria-label', 'Menu'); bell.setAttribute('aria-expanded', 'false');
  const menu = document.createElement('div'); menu.id = 'bbMenu'; menu.className = 'hidden';
  [['bAlbum', 'Collection'], ['bSet', 'Settings']].forEach(([id, t]) => { const b = $(id); if (!b) return; label(b, t); menu.appendChild(b); b.addEventListener('click', () => toggle(false)); });
  const toggle = on => { menu.classList.toggle('hidden', !on); bell.setAttribute('aria-expanded', String(on)); };
  bell.addEventListener('click', e => { e.stopPropagation(); toggle(menu.classList.contains('hidden')); });
  document.addEventListener('pointerdown', e => { if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== bell) toggle(false); });
  document.body.append(bell, menu);
  // rode stip op de bel als er in het menu iets nieuws is (bv. een nieuwe kraam staat in de tabbalk, collectie-teller niet)
  const dot = document.createElement('span'); dot.className = 'dot hidden'; bell.appendChild(dot);
  // de lucky-lampjes blijven naast het level; de oude zijkolom is leeg en verborgen
})();
