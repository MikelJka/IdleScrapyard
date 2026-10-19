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
import { FORKLIFT, createScene, helperFace, productIcon, truck } from './scene';
import { buyPass, showRewardedAd } from './ads';
import { pack, unpack } from '../sim/offline';
import { t } from './texts';

const KEY = 'chatarrero.save';
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
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function writeSave(state: GameState): void {
  try {
    localStorage.setItem(KEY, pack(state, Date.now()));
  } catch {
    /* sin almacenamiento: se juega igual */
  }
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
  const result = unpack(readSave(), Date.now());
  state = result.state;
  root.innerHTML = `
    <main class="game">
      <header>
        <div class="money"><span class="coin">$</span><span id="dollars"></span></div>
        <span id="rate"></span>
      </header>
      <div id="scene-wrap"></div>
      <p id="welcome" hidden></p>
      <section id="extras"></section>
      <h2>${t('shop.title')}</h2>
      <section id="shop"></section>
    </main>`;
  const $ = (id: string) => root.querySelector<HTMLElement>('#' + id)!;
  if (result.simulatedSeconds > 60) {
    const w = $('welcome');
    w.hidden = false;
    w.textContent = t('welcomeBack', { dollars: fmt(result.dollarsEarned), minutes: Math.round(result.simulatedSeconds / 60) });
  }
  const scene = createScene();
  $('scene-wrap').appendChild(scene.el);
  scene.el.querySelector('#pile')!.addEventListener('click', () => {
    tap(state);
    scene.pop('+' + ECONOMY.tap.scrap);
  });
  scene.el.querySelector('#golden')!.addEventListener('click', async () => {
    if (busy || state.goldenVisible <= 0) return;
    busy = true;
    try {
      if (await rewarded()) claimGoldenTruck(state);
    } finally {
      busy = false;
    }
  });
  $('shop').addEventListener('click', (e) => {
    const id = (e.target as HTMLElement).closest<HTMLElement>('button[data-id]')?.dataset.id;
    if (id) buy(state, id);
  });

  $('extras').addEventListener('click', async (e) => {
    const action = (e.target as HTMLElement).closest<HTMLElement>('button[data-action]')?.dataset.action;
    if (!action || busy) return;
    busy = true;
    try {
      if (action === 'daily') claimDaily(state, localDay());
      if (action === 'boost' && canBoost(state) && (await rewarded())) activateBoost(state);
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
    const buttons = [
      day > 0
        ? `<button type="button" data-action="daily" ${dailyReward(state, today) > 0 ? '' : 'disabled'}>${t('daily.claim', { day })}</button>`
        : `<button type="button" disabled>${t('daily.done', { day: nextDay })}</button>`,
      state.boostSeconds > 0
        ? `<button type="button" disabled>${t('boost.active', { minutes: Math.ceil(state.boostSeconds / 60) })}</button>`
        : canBoost(state)
          ? `<button type="button" data-action="boost">${t('boost.ready')}</button>`
          : `<button type="button" disabled>${t('boost.wait', { minutes: Math.ceil(state.boostCooldown / 60) })}</button>`,
    ];
    const price = ECONOMY.pass.priceEur.toFixed(2).replace('.', ',');
    buttons.push(
      state.hasPass
        ? `<button type="button" disabled>${t('pass.owned')}</button>`
        : `<button type="button" data-action="pass">${t('pass.buy', { price })}</button>`,
    );
    return buttons.join('');
  }

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
    }
  }

  let last = performance.now();
  let lastSave = last;
  const loop = (now: number) => {
    advance(state, Math.min((now - last) / 1000, 1));
    last = now;
    if (now - lastSave > AUTOSAVE_MS) {
      writeSave(state);
      lastSave = now;
    }
    render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) writeSave(state);
  });
  window.addEventListener('pagehide', () => writeSave(state));
}
