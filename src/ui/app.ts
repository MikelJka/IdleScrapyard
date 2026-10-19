// Pantalla principal en vertical (provisional, sin 3D todavía). Solo lee el estado y llama a la simulación.
import { ECONOMY, ZONES, advance, buy, dockLoad, purchases, scrapPerSecond, tap, zoneCapacity, type GameState } from '../sim/game';
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

  function render(): void {
    $('dollars').textContent = '$' + fmt(state.dollars);
    $('rate').textContent = t('scrapRate', { n: fmt(scrapPerSecond(state)) });
    $('pile').textContent = t('pile', { scrap: fmt(state.scrap), gain: ECONOMY.tap.scrap });
    $('zones').innerHTML = ZONES.filter((z) => state.zones[z.id].unlocked)
      .map((z) => {
        const zs = state.zones[z.id];
        return `<div class="row"><b>${z.name}</b><span>${t('zoneLine', { buffer: fmt(zs.buffer), cap: fmt(zoneCapacity(zs)), machines: zs.machines })}</span></div>`;
      })
      .join('');
    $('dock').innerHTML = `<div class="row"><b>${t('dock')}</b><span>${t('dockLine', { units: fmt(state.dockUnits), load: dockLoad(state) })}</span></div>`;
    $('shop').innerHTML = purchases(state)
      .map((p) => {
        const name = t('buy.' + p.kind) + (p.zoneId ? ' · ' + ZONES.find((z) => z.id === p.zoneId)!.name : '');
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
