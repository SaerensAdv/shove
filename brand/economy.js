// Bofflebell retention economy v1: welcome-back coins, larger hopper, early-game cushion, no broken best-streaks.
// Installed as a sidecar. main.js remains untouched.
const SAVE_KEY = 'shove_carnival_v1';
const DAY = 86_400_000;
const STRESS = /[?&#]stress/.test(location.search + location.hash) || !!window.SHOVE_STRESS;
const ECON_TEST = /[?&#]econ/.test(location.search + location.hash);
if (STRESS) { window.bbEconomy = { installed: false, reason: 'stress build' }; }
else {
  if (ECON_TEST && window.SHOVE_NATIVE?.Preferences?.set) window.SHOVE_NATIVE.Preferences.set = () => Promise.resolve();
  let firstSeen = 0;
  try { firstSeen = Number(JSON.parse(localStorage.getItem(SAVE_KEY) || '{}').seen) || 0; } catch {}
  let installed = false, bootBonusHandled = false, hiddenAt = 0, streakObs = null;
  const diag = { installed: false, refillCap: 100, refillSecs: 30, starterRefundEvery: 16, welcomeBonus: null };
  window.bbEconomy = diag;

  function persist(k) {
    if (ECON_TEST) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(k.save)); } catch {}
    const native = window.SHOVE_NATIVE;
    if (native && native.Preferences) native.Preferences.set({ key: SAVE_KEY, value: JSON.stringify(k.save) }).catch(() => {});
  }
  function announce(k, text) {
    if (ECON_TEST) return;
    const el = document.getElementById('toast');
    if (el) { el.textContent = text; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 3600); }
    const coins = document.getElementById('coins'); if (coins) coins.textContent = k.save.coins;
    const shake = document.getElementById('shakeN'); if (shake) shake.textContent = k.save.shakes;
    const giant = document.getElementById('giantN'); if (giant) giant.textContent = k.save.giants;
  }
  function awardWelcome(k, away) {
    const days = Math.floor(away / DAY);
    if (days < 2 || away < DAY * 2) return 0;
    const last = Number(k.save.bbWelcomeBonusAt) || 0;
    if (last && Date.now() - last < DAY * 2) return 0;
    const coins = Math.min(300, 40 + 15 * days);
    k.save.coins += coins;
    const bonus = { coins, days, shakes: 0, giants: 0 };
    if (days >= 7) { k.save.shakes += 1; k.save.giants += 1; bonus.shakes = 1; bonus.giants = 1; }
    k.save.bbWelcomeBonusAt = Date.now();
    persist(k); announce(k, `Boffle saved you a seat: +${coins} coins${bonus.shakes ? ', +1 shake and +1 giant coin' : ''}!`);
    diag.welcomeBonus = bonus;
    return coins;
  }
  function protectBestRun(save) {
    if (Object.getOwnPropertyDescriptor(save, 'streak')?.get) return;
    let days = Math.max(0, Number(save.streak) || 0);
    Object.defineProperty(save, 'streak', {
      configurable: true, enumerable: true,
      get() { return days; },
      set(value) {
        const next = Math.max(0, Number(value) || 0);
        const y = new Date(Date.now() - DAY).toDateString();
        // main.js normally resets a missed-day streak to 1. Keep counting completed fair days instead.
        if (next === 1 && days > 0 && save.streakDay && save.streakDay !== y) days += 1;
        else days = Math.max(days, next);
      }
    });
  }
  function labelBestRun(save) {
    const line = document.getElementById('streakLine');
    if (!line) return;
    const text = `Fair days completed: ${Number(save.streak) || 0} · no streak loss when you take a break.`;
    if (line.textContent !== text) line.textContent = text;
  }
  function instrumentEcon(k) {
    if (!ECON_TEST || !window.MutationObserver) return;
    const attach = () => {
      const out = document.getElementById('bbEcon');
      if (!out) return false;
      let baseline = Number(k.save.bbStarterRefunds) || 0;
      const update = () => {
        if (out.textContent.startsWith('econ: meten')) { baseline = Number(k.save.bbStarterRefunds) || 0; return; }
        if (!out.textContent.startsWith('ECON ')) return;
        try {
          const r = JSON.parse(out.textContent.slice(5));
          if (r.cushionRefunds !== undefined) return;
          r.physicsReturnPct = r.returnPct;
          r.cushionRefunds = Math.max(0, (Number(k.save.bbStarterRefunds) || 0) - baseline);
          r.effectiveReturnPct = +((r.won + r.cushionRefunds) / Math.max(1, r.drops) * 100).toFixed(1);
          r.netPerMin = +((r.won + r.cushionRefunds - r.drops) / 5).toFixed(1);
          out.textContent = 'ECON ' + JSON.stringify(r);
          window.bbEconResult = r;
        } catch {}
      };
      new MutationObserver(update).observe(out, { subtree: true, childList: true, characterData: true });
      update(); return true;
    };
    if (attach()) return;
    const bodyObs = new MutationObserver(() => { if (attach()) bodyObs.disconnect(); });
    bodyObs.observe(document.body, { subtree: true, childList: true });
  }
  function init(k) {
    if (!k || installed) return;
    installed = true; diag.installed = true; instrumentEcon(k);
    // The main game's refill() reads this shared mutable config object.
    k.CFG.refillSecs = 30;
    k.CFG.refillCap = 100;
    protectBestRun(k.save);
    // Soft start: +1 coin for every 16 real drops through level 3, adding ~6.25 points to effective return.
    // Intercept save.dropped itself so this also catches the main.js drop loop and the balance simulator.
    let dropped = Math.max(0, Number(k.save.dropped) || 0);
    Object.defineProperty(k.save, 'dropped', {
      configurable: true, enumerable: true,
      get() { return dropped; },
      set(value) {
        const next = Math.max(0, Number(value) || 0), delta = next - dropped; dropped = next;
        if (delta === 1 && k.save.level <= 3) {
          const progress = (Number(k.save.bbStarterProgress) || 0) + 1;
          if (progress >= 16) {
            k.save.bbStarterProgress = 0;
            k.save.bbStarterRefunds = (Number(k.save.bbStarterRefunds) || 0) + 1;
            k.save.coins += 1;
            persist(k); announce(k, 'Boffle’s beginner cushion: +1 coin');
          } else k.save.bbStarterProgress = progress;
        }
      }
    });
    // Daily missions may reset, but lifetime collection/booth progress is saved by the base game and the fair-day record never falls.
    const panel = document.getElementById('missions');
    const missionIntro = panel?.querySelector('.panel > p');
    if (missionIntro) missionIntro.textContent = 'Three new tasks every day. Collection and booth progress keep going while you are away, and completed fair days never reset.';
    if (panel && window.MutationObserver) {
      streakObs = new MutationObserver(() => labelBestRun(k.save));
      streakObs.observe(panel, { subtree: true, childList: true, characterData: true });
      labelBestRun(k.save);
    }
    // Boot return: read the prior persisted timestamp captured before main.js updates save.seen.
    if (!bootBonusHandled && k.ready) {
      bootBonusHandled = true;
      if (firstSeen) awardWelcome(k, Date.now() - firstSeen);
    }
  }
  // Apply the balance before main.js performs its initial refill and welcome calculation.
  const poll = setInterval(() => {
    const k = window.__k;
    if (!k) return;
    if (!installed) init(k);
    if (k.ready) {
      if (!bootBonusHandled) { bootBonusHandled = true; if (firstSeen) awardWelcome(k, Date.now() - firstSeen); }
      clearInterval(poll);
    }
  }, 20);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt) {
      const away = Date.now() - hiddenAt; hiddenAt = 0;
      const k = window.__k; if (k && installed) awardWelcome(k, away);
    }
  });
}
