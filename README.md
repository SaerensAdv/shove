# SHOVE · carnival coin pusher (prototype v0.4)

Free-to-play carnival coin pusher in real 3D: Three.js for rendering, Rapier (WASM) for physics. Plushie collections, lucky ring, lucky wheel with honest odds, daily tasks. Saerens game lab, not released.

## Play

- Game: `index.html`
- Real-phone stress test ("The High Striker"): `stress.html` (or `index.html?stress`)

Three.js 0.185.1 and Rapier 0.12.0 load from jsDelivr, so the first load needs internet. No build step: `main.js` runs as an ES module through the import map in `index.html`.

## Stress test

About 2.5 minutes on the real engine with a throwaway save (the player's board and album stay untouched):

1. Idle: estimates the screen refresh rate
2. Normal play at ~190 coins
3. Load ramp: 250, 300, 350, 400 coins
4. Jackpot burst: 50-coin shower plus shake
5. Quality matrix at 330 coins: native/1.5×/1× resolution, shadows on/off
6. Endurance: 3 × 15 s at 330 coins to catch heat throttling

Per phase it records fps, frame-time p50/p95/p99, jank (% frames over 34 ms), physics ms, CPU render ms and simulation speed. The grade (ULTRA, HIGH, MEDIUM, LOW, STRUGGLES) is the best quality setting that holds 55 fps (or 90% of the refresh rate) with under 5% jank at 330 coins. COPY RESULTS puts a text summary plus JSON on the clipboard.

## Hosting

Settings → Pages → Deploy from branch → `play` / root. Until Pages is on, the test URL is `https://raw.githack.com/SaerensAdv/shove/play/stress.html`.
