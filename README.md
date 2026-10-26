# SHOVE · carnival coin pusher (prototype v0.8)

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

## v0.8 front-end polish (26 Oct 2026)

- Landscape phone layouts now keep the full navigation visible; the HUD and coach compress to preserve the play area.
- Icon-only navigation controls and dialogs expose accessible labels/roles, visible keyboard focus, and Escape dismisses closable dialogs/side games.
- QA checked 320×568, 390×844 portrait, 568×320 and 844×390 landscape, and 1024×768 tablet layouts. No JavaScript errors in those checks.
- This is the first front-end polish pass, not a claim that the full game or release is complete. Next: complete-flow QA and first-session/progression work.

## v0.8: the fair + balance

- **The fair** (🎡 button): three skill games, no luck involved. Each play costs coins, so they work as coin sinks.
  - High Striker (5 coins, LV1): stop the needle on the gold line. Bell = +15 coins and XP.
  - Shooting Gallery (10 coins, LV2): 20 s, 15 shots, golden ducks worth 50. 300+ = +20 coins and a power-up.
  - The Claw (15 coins, LV3): one drop, centred wins a plushie (prefers ones you're missing).
- **Balance**: start 80 coins, refill 1 per 40 s up to 50, daily bonus 50, lucky token 1 in 150, narrower lucky ring, smaller wheel prizes (10/18/jackpot 35), level-up +10, plushies give no coins. Measured net return dropped from about 126 to about 95 per 100 coins played.
- New daily task: play fair games.

## v0.6: app-ready

- **Installable web app**: `manifest.json` + `sw.js`. After the first visit the game plays offline (own files network-first, CDN libraries cache-first). Settings → "Put SHOVE on your home screen".
- **Native bridge**: `main.js` reads `window.SHOVE_NATIVE` (set only in the app build by `native/native-init.js`): haptics, native save mirror (Preferences), Android back button, status bar, daily reminder at 19:00 (local notification). The web build never loads Capacitor.
- **Welcome back** card after 5+ minutes away (refilled coins, daily bonus, tasks ready).
- **Backup code** (`SHOVE1.` + base64 JSON, boards excluded): move progress between phones or from the web into the app.

## App build (Capacitor)

```
npm install
npm run build          # www/index.html: one file, three + rapier bundled, no CDN
npx cap add android    # once
npx cap sync android
```

GitHub Actions (`.github/workflows/android.yml`) builds a **debug APK** on every push to `main` (Actions → latest run → artifact `shove-debug-apk`) and commits PNG icons rendered from `assets/icon.svg`. iOS needs a Mac or a signed CI run with an Apple Developer account (v0.6b), as do AdMob and RevenueCat (ads and purchases are still placeholders).

Monetisation rules: DEC-101, no paid chance. Coins are never sold.
