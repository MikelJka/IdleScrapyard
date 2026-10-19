// Pantalla principal en vertical (provisional, sin 3D todavía). Solo lee el estado y llama a la simulación.
import {
  ECONOMY,
  ZONES,
  activateBoost,
  advance,
  buy,
  canBoost,
  claimDaily,
  claimGoldenTruck,
  dailyReward,
  incomePerSecond,
  purchases,
  streakDayFor,
  tap,
  type GameState,
} from '../sim/game';
import { HELPER_LOOKS } from './look';
import { FORKLIFT, helperFace, productIcon, truck } from './icons';
import { createYard } from './yard';
import { buyPass, showRewardedAd } from './ads';
import { pack, unpack } from '../sim/offline';
import { fromCode, toCode } from '../sim/transfer';
import { t } from './texts';
import { store } from './storage';
import { isMuted, play, setMuted } from './sound';

const AUTOSAVE_MS = 10_000;

function fmt(n: number): string {
  if (n < 1000) return n.toFixed(n < 10 ? 1 : 0);
  const units = ['K', 'M', 'B', 'T'];
  let i = -1;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return n.toFixed(n < 10 ? 2 : 1) + units[i];
}

/** Número del día según la hora local (para la racha). */
function localDay(): number {
  const now = new Date();
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000);
}

function readSave(): string | null {
  return store.read();
}

function writeSave(state: GameState): void {
  store.write(pack(state, Date.now()));
}

function shopIcon(kind: string, zoneId?: string): string {
  const def = zoneId ? ZONES.find((z) => z.id === zoneId) : undefined;
  let inner = '';
  if (kind === 'helper' && def) inner = helperFace(HELPER_LOOKS[def.helper.id]);
  else if (def) inner = `<g transform="scale(1.3)">${productIcon(def.id)}</g>`;
  else if (kind === 'scrapTruck') inner = `<g transform="scale(0.42) translate(2 10)">${truck('#7d8b6a', '#9fb07f')}</g>`;
  else if (kind === 'cart') inner = `<g transform="scale(0.8) translate(-1 9)">${FORKLIFT}</g>`;
  else if (kind === 'dock') inner = `<g><rect x="-11" y="-2" width="10" height="9" fill="#c58a4a" stroke="#2a1d14"/><rect x="1" y="-2" width="10" height="9" fill="#c58a4a" stroke="#2a1d14"/><rect x="-5" y="-11" width="10" height="9" fill="#c58a4a" stroke="#2a1d14"/></g>`;
  return `<svg class="icon" viewBox="-16 -16 32 32" aria-hidden="true">${inner}</svg>`;
}

export function startApp(root: HTMLElement): void {
  // Con el pase, las recompensas se dan sin anuncio.
  let state!: GameState;
  const rewarded = async (): Promise<boolean> => state.hasPass || (await showRewardedAd());
  let busy = false;
  let importing = false;
  const result = unpack(readSave(), Date.now());
  state = result.state;
  root.innerHTML = `
    <main class="game">
      <div id="scene-wrap"></div>
      <header class="hud">
        <div class="money"><span class="coin">$</span><span id="dollars"></span></div>
        <span id="rate"></span>
        <button id="mute" type="button"></button>
      </header>
      <p id="welcome" hidden></p>
      <aside id="extras"></aside>
      <button id="open-shop" type="button"><span class="cart">🛒</span><span>${t('shop.title')}</span><b id="shop-badge" hidden></b></button>
      <section id="sheet" hidden>
        <div class="sheet-head"><h2>${t('shop.title')}</h2><button id="close-shop" type="button" aria-label="${t('close')}">✕</button></div>
        <div id="shop"></div>
        <div id="transfer">
          <b>${t('transfer.title')}</b>
          <small>${t('transfer.help')}</small>
          <div><button id="copy-code" type="button">${t('transfer.copy')}</button><button id="paste-code" type="button">${t('transfer.paste')}</button></div>
        </div>
      </section>
    </main>`;
  const $ = (id: string) => root.querySelector<HTMLElement>('#' + id)!;
  if (result.simulatedSeconds > 60) {
    const w = $('welcome');
    w.hidden = false;
    w.textContent = t('welcomeBack', { dollars: fmt(result.dollarsEarned), minutes: Math.round(result.simulatedSeconds / 60) });
    w.addEventListener('click', () => (w.hidden = true));
    setTimeout(() => (w.hidden = true), 8000);
  }
  const scene = createYard($('scene-wrap'));
  scene.el.querySelector('#pile')!.addEventListener('click', () => {
    tap(state);
    play('tap');
    scene.pop('+' + ECONOMY.tap.scrap, 'pile');
  });
  const mute = $('mute');
  const showMute = () => {
    mute.textContent = isMuted() ? '🔇' : '🔊';
    mute.setAttribute('aria-label', t(isMuted() ? 'sound.off' : 'sound.on'));
  };
  showMute();
  mute.addEventListener('click', () => {
    setMuted(!isMuted());
    showMute();
    play('buy');
  });
  $('open-shop').addEventListener('click', () => ($('sheet').hidden = false));
  $('close-shop').addEventListener('click', () => ($('sheet').hidden = true));
  scene.el.querySelector('#golden')!.addEventListener('click', async () => {
    if (busy || state.goldenVisible <= 0) return;
    busy = true;
    try {
      if (await rewarded()) {
        claimGoldenTruck(state);
        play('reward');
      }
    } finally {
      busy = false;
    }
  });
  $('copy-code').addEventListener('click', async () => {
    const code = toCode(pack(state, Date.now()));
    try {
      await navigator.clipboard.writeText(code);
      alert(t('transfer.copied'));
    } catch {
      prompt(t('transfer.copyManual'), code);
    }
  });
  $('paste-code').addEventListener('click', () => {
    const json = fromCode(prompt(t('transfer.pastePrompt')) ?? '');
    if (json === null) return alert(t('transfer.invalid'));
    if (!confirm(t('transfer.confirm'))) return;
    importing = true;
    if (!store.write(json)) return alert(t('transfer.invalid'));
    location.reload();
  });
  $('shop').addEventListener('click', (e) => {
    const id = (e.target as HTMLElement).closest<HTMLElement>('button[data-id]')?.dataset.id;
    if (id && buy(state, id)) play('buy');
  });

  $('extras').addEventListener('click', async (e) => {
    const action = (e.target as HTMLElement).closest<HTMLElement>('button[data-action]')?.dataset.action;
    if (!action || busy) return;
    busy = true;
    try {
      if (action === 'daily' && claimDaily(state, localDay()) > 0) play('reward');
      if (action === 'boost' && canBoost(state) && (await rewarded())) {
        activateBoost(state);
        play('reward');
      }
      if (action === 'pass' && !state.hasPass && (await buyPass(ECONOMY.pass.priceEur))) state.hasPass = true;
      writeSave(state);
    } finally {
      busy = false;
    }
  });

  function renderExtras(): string {
    const today = localDay();
    const day = streakDayFor(state, today);
    const nextDay = (state.streakDay % ECONOMY.dailyStreak.rewardMinutes.length) + 1;
    const btn = (action: string, icon: string, label: string, enabled: boolean, cls = '') =>
      `<button type="button" class="${cls}" ${enabled ? `data-action="${action}"` : 'disabled'}><span class="ico">${icon}</span><span>${label}</span></button>`;
    const buttons = [
      state.boostSeconds > 0
        ? btn('boost', '⏱️', t('boost.activeShort', { minutes: Math.ceil(state.boostSeconds / 60) }), false, 'boost on')
        : canBoost(state)
          ? btn('boost', '📺', t('boost.short'), true, 'boost')
          : btn('boost', '⏳', t('boost.waitShort', { minutes: Math.ceil(state.boostCooldown / 60) }), false, 'boost'),
      day > 0
        ? btn('daily', '🎁', t('daily.short', { day }), dailyReward(state, today) > 0, 'daily ready')
        : btn('daily', '🎁', t('daily.doneShort', { day: nextDay }), false, 'daily'),
      state.hasPass ? btn('pass', '⭐', t('pass.ownedShort'), false, 'pass') : btn('pass', '⭐', t('pass.short'), true, 'pass'),
    ];
    return buttons.join('');
  }

  let lastEarned = state.totalEarned;
  let lastCooldown = state.truckCooldown;
  let lastExtras = '';
  let lastShop = '';
  function render(): void {
    // Los botones de extras solo se redibujan si cambian, para no perder el toque.
    const extras = renderExtras();
    if (extras !== lastExtras) {
      $('extras').innerHTML = extras;
      lastExtras = extras;
    }
    $('dollars').textContent = fmt(state.dollars);
    $('rate').textContent = t('incomeRate', { n: fmt(incomePerSecond(state)) });
    scene.update(state);
    // Sonido al cobrar un camión (el dinero sube y el camión se reinicia).
    if (state.totalEarned > lastEarned + 1e-9 && state.truckCooldown > lastCooldown) play('cash');
    lastEarned = state.totalEarned;
    lastCooldown = state.truckCooldown;
    const shop = purchases(state)
      .map((p) => {
        const def = p.zoneId ? ZONES.find((z) => z.id === p.zoneId) : undefined;
        const name = p.kind === 'helper' ? t('buy.helper', { helper: def!.helper.name }) : t('buy.' + p.kind);
        const sub = def ? (p.kind === 'unlock' ? def.product : def.name) : t('sub.' + p.kind);
        const cls = p.kind === 'unlock' ? 'unlock' : p.kind === 'helper' ? 'helper' : '';
        return `<button type="button" class="${cls}" data-id="${p.id}" ${p.cost > state.dollars ? 'disabled' : ''}>${shopIcon(p.kind, p.zoneId)}<span class="what"><b>${name}</b><small>${sub}</small></span><span class="price">$${fmt(p.cost)}</span></button>`;
      })
      .join('');
    // Solo se redibuja si cambia algo, para que los toques no se pierdan.
    if (shop !== lastShop) {
      $('shop').innerHTML = shop;
      lastShop = shop;
      const affordable = purchases(state).filter((p) => p.cost <= state.dollars).length;
      const badge = $('shop-badge');
      badge.hidden = affordable === 0;
      badge.textContent = String(affordable);
    }
  }

  let last = performance.now();
  let lastSave = last;
  const loop = (now: number) => {
    advance(state, Math.min((now - last) / 1000, 1));
    last = now;
    if (now - lastSave > AUTOSAVE_MS && !importing) {
      writeSave(state);
      lastSave = now;
    }
    render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !importing) writeSave(state);
  });
  window.addEventListener('pagehide', () => {
    if (!importing) writeSave(state);
  });
}
