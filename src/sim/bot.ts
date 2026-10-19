/**
 * Jugador simulado para probar el ritmo: toca la pila mientras juega activo y
 * compra lo que más dólares por segundo añade por dólar gastado; abre cada zona en cuanto puede.
 */
import { ECONOMY, ZONES, advance, buy, dockLoad, purchases, scrapPerSecond, tap, unitValue, zoneRate, type GameState, type Purchase } from './game';

export interface BotOptions {
  /** Toques por segundo mientras juega activo. */
  tapsPerSecond: number;
  /** Segundos de juego activo (tocando) desde el principio. */
  activeSeconds: number;
  /** Después del juego activo, cada cuántos segundos vuelve a abrir el juego y compra (1 = siempre abierto). */
  checkEverySeconds: number;
  /** Deja de jugar en cuanto están abiertas todas las zonas. */
  stopWhenAllOpen?: boolean;
}

export const DEFAULT_BOT: BotOptions = { tapsPerSecond: 2, activeSeconds: 600, checkEverySeconds: 1 };

/** Dólares por segundo a ritmo estable: la chatarra va a la zona que más paga, limitada por carretillas y muelle. */
export function steadyIncome(state: GameState, tapsPerSecond = 0): number {
  let scrap = scrapPerSecond(state) + tapsPerSecond * ECONOMY.tap.scrap;
  let carry = Math.min(state.carts * ECONOMY.carts.unitsPerSecond, dockLoad(state) / ECONOMY.dock.returnSeconds);
  let income = 0;
  const byProfit = [...ZONES].sort((a, b) => b.unitValue / b.scrapPerUnit - a.unitValue / a.scrapPerUnit);
  for (const def of byProfit) {
    const units = Math.min(zoneRate(def, state.zones[def.id]), scrap / def.scrapPerUnit, carry);
    scrap -= units * def.scrapPerUnit;
    carry -= units;
    income += units * unitValue(def, state.zones[def.id]);
  }
  return income;
}

function score(state: GameState, p: Purchase, taps: number): number {
  const after = structuredClone(state);
  after.dollars = Infinity;
  buy(after, p.id);
  return (steadyIncome(after, taps) - steadyIncome(state, taps)) / p.cost;
}

function shop(state: GameState, taps: number): void {
  for (;;) {
    const list = purchases(state);
    const unlock = list.find((p) => p.kind === 'unlock');
    if (unlock && unlock.cost <= state.dollars) {
      buy(state, unlock.id);
      continue;
    }
    const affordable = list.filter((p) => p.kind !== 'unlock' && p.cost <= state.dollars);
    if (!affordable.length) return;
    const best = affordable.map((p) => ({ p, s: score(state, p, taps) })).sort((a, b) => b.s - a.s)[0];
    if (best.s > 0) {
      // Solo compra si se paga sola antes de lo que tardaría en ahorrar para la siguiente zona.
      const income = steadyIncome(state, taps);
      const payback = 1 / best.s;
      const toUnlock = unlock ? (unlock.cost - state.dollars + best.p.cost) / Math.max(income, 1e-9) : Infinity;
      if (payback > toUnlock) return;
      buy(state, best.p.id);
      continue;
    }
    // Varios topes iguales (chatarra, carretillas, muelle): ninguna compra sola mejora; sube el más barato.
    const supply = scrapPerSecond(state) + taps * ECONOMY.tap.scrap;
    const carts = state.carts * ECONOMY.carts.unitsPerSecond;
    const dock = dockLoad(state) / ECONOMY.dock.returnSeconds;
    const min = Math.min(supply, carts, dock);
    const binding = list.filter(
      (p) => (p.kind === 'scrapTruck' && supply <= min * 1.01) || (p.kind === 'cart' && carts <= min * 1.01) || (p.kind === 'dock' && dock <= min * 1.01),
    );
    const cheapest = binding.sort((a, b) => a.cost - b.cost)[0];
    if (!cheapest || cheapest.cost > state.dollars) return;
    buy(state, cheapest.id);
  }
}

/**
 * Juega hasta `seconds` y devuelve el segundo en que se abrió cada zona.
 * Con el juego cerrado solo se produce hasta el tope de ganancias fuera (`offlineCapSeconds`).
 */
export function playBot(state: GameState, seconds: number, opts: BotOptions = DEFAULT_BOT): Record<string, number> {
  const unlockedAt: Record<string, number> = {};
  let clock = 0;
  while (clock < seconds) {
    const active = clock < opts.activeSeconds;
    const taps = active ? opts.tapsPerSecond : 0;
    const gap = active || opts.checkEverySeconds <= 1 ? 1 : opts.checkEverySeconds;
    for (let i = 0; i < taps; i++) tap(state);
    advance(state, gap > 1 ? Math.min(gap, ECONOMY.offlineCapSeconds) : 1);
    clock += gap;
    shop(state, taps);
    for (const [id, z] of Object.entries(state.zones)) if (z.unlocked && unlockedAt[id] === undefined) unlockedAt[id] = clock;
    if (opts.stopWhenAllOpen && Object.keys(unlockedAt).length === ZONES.length) break;
  }
  return unlockedAt;
}
