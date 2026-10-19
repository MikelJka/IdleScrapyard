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
  dockLoad,
  purchases,
  scrapPerSecond,
  streakDayFor,
  tap,
  zoneCapacity,
  type GameState,
} from '../sim/game';
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

export function startApp(root: HTMLElement): void {
  const result = unpack(readSave(), Date.now());
  const state = result.state;
  root.innerHTML = `
    <main class="game">
      <header><span id="dollars"></span><span id="rate"></span></header>
      <p id="welcome" hidden></p>
      <button id="pile" type="button"></button>
      <section id="extras"></section>
      <section id="zones"></section>
      <section id="dock"></section>
      <section id="shop"></section>
    </main>`;
  const $ = (id: string) => root.querySelector<HTMLElement>('#' + id)!;
  if (result.simulatedSeconds > 60) {
    const w = $('welcome');
    w.hidden = false;
    w.textContent = t('welcomeBack', { dollars: fmt(result.dollarsEarned), minutes: Math.round(result.simulatedSeconds / 60) });
  }
  $('pile').addEventListener('click', () => tap(state));
  $('shop').addEventListener('click', (e) => {
    const id = (e.target as HTMLElement).closest<HTMLElement>('button[data-id]')?.dataset.id;
    if (id) buy(state, id);
  });

  // Con el pase, las recompensas se dan sin anuncio.
  const rewarded = async (): Promise<boolean> => state.hasPass || (await showRewardedAd());
  let busy = false;
  $('extras').addEventListener('click', async (e) => {
    const action = (e.target as HTMLElement).closest<HTMLElement>('button[data-action]')?.dataset.action;
    if (!action || busy) return;
    busy = true;
    try {
      if (action === 'daily') claimDaily(state, localDay());
      if (action === 'boost' && canBoost(state) && (await rewarded())) activateBoost(state);
      if (action === 'golden' && state.goldenVisible > 0 && (await rewarded())) claimGoldenTruck(state);
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
    if (state.goldenVisible > 0)
      buttons.unshift(`<button type="button" class="golden" data-action="golden">${t('golden.claim', { seconds: Math.ceil(state.goldenVisible) })}</button>`);
    const price = ECONOMY.pass.priceEur.toFixed(2).replace('.', ',');
    buttons.push(
      state.hasPass
        ? `<button type="button" disabled>${t('pass.owned')}</button>`
        : `<button type="button" data-action="pass">${t('pass.buy', { price })}</button>`,
    );
    return buttons.join('');
  }

  let lastExtras = '';
  function render(): void {
    // Los botones de extras solo se redibujan si cambian, para no perder el toque.
    const extras = renderExtras();
    if (extras !== lastExtras) {
      $('extras').innerHTML = extras;
      lastExtras = extras;
    }
    $('dollars').textContent = '$' + fmt(state.dollars);
    $('rate').textContent = t('scrapRate', { n: fmt(scrapPerSecond(state)) });
    $('pile').textContent = t('pile', { scrap: fmt(state.scrap), gain: ECONOMY.tap.scrap });
    $('zones').innerHTML = ZONES.filter((z) => state.zones[z.id].unlocked)
      .map((z) => {
        const zs = state.zones[z.id];
        return `<div class="row"><b>${z.name}</b><span>${t('zoneLine', { buffer: fmt(zs.buffer), cap: fmt(zoneCapacity(zs)), machines: zs.machines })}</span></div><div class="row"><span>${t('helperLine', { helper: z.helper.name, level: zs.helperLevel })}</span></div>`;
      })
      .join('');
    $('dock').innerHTML = `<div class="row"><b>${t('dock')}</b><span>${t('dockLine', { units: fmt(state.dockUnits), load: dockLoad(state) })}</span></div>`;
    $('shop').innerHTML = purchases(state)
      .map((p) => {
        const def = p.zoneId ? ZONES.find((z) => z.id === p.zoneId) : undefined;
        const name = p.kind === 'helper' ? t('buy.helper', { helper: def!.helper.name }) : t('buy.' + p.kind) + (def ? ' · ' + def.name : '');
        return `<button type="button" data-id="${p.id}" ${p.cost > state.dollars ? 'disabled' : ''}><span>${name}</span><b>$${fmt(p.cost)}</b></button>`;
      })
      .join('');
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
