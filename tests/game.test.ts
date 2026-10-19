import { describe, expect, it } from 'vitest';
import { ECONOMY, advance, buy, dockLoad, load, newGame, purchases, serialize, tap } from '../src/sim/game';
import { DEFAULT_BOT, playBot } from '../src/sim/bot';

describe('cadena de la chatarra', () => {
  it('tocar la pila da chatarra', () => {
    const s = newGame();
    tap(s);
    expect(s.scrap).toBe(ECONOMY.tap.scrap);
  });

  it('la chatarra se aplasta, llega al muelle y un camión la convierte en dólares', () => {
    const s = newGame();
    for (let i = 0; i < 30; i++) tap(s);
    advance(s, 12);
    // 1 bloque por segundo a 1 $: el primer camión sale al juntar la carga del muelle.
    expect(s.dollars).toBeCloseTo(dockLoad(s) * 1, 5);
  });

  it('sin camión no se cobra hasta que el muelle tiene la carga', () => {
    const s = newGame();
    for (let i = 0; i < 5; i++) tap(s);
    advance(s, 20);
    expect(s.dollars).toBe(0);
    expect(s.dockUnits).toBeCloseTo(5, 5);
  });

  it('la zona deja de producir con el almacén lleno si no hay carretillas', () => {
    const s = newGame();
    s.carts = 0;
    for (let i = 0; i < 100; i++) tap(s);
    advance(s, 100);
    expect(s.zones.crusher.buffer).toBeCloseTo(ECONOMY.zoneUpgrades.capacity.startCapacity, 5);
  });

  it('los camiones de chatarra la traen solos', () => {
    const s = newGame();
    s.scrapTrucks = 2;
    s.zones.crusher.unlocked = false;
    advance(s, 10);
    expect(s.scrap).toBeCloseTo(2 * ECONOMY.scrapTrucks.scrapPerSecond * 10, 5);
  });
});

describe('compras', () => {
  it('cada compra sube el precio ×1,10', () => {
    const s = newGame();
    s.dollars = 1e6;
    const before = purchases(s).find((p) => p.id === 'speed:crusher')!.cost;
    expect(buy(s, 'speed:crusher')).toBe(true);
    const after = purchases(s).find((p) => p.id === 'speed:crusher')!.cost;
    expect(after / before).toBeCloseTo(ECONOMY.costGrowth, 10);
  });

  it('no se compra sin dólares', () => {
    const s = newGame();
    expect(buy(s, 'cart')).toBe(false);
    expect(s.carts).toBe(ECONOMY.carts.start);
  });

  it('solo se ofrece abrir la siguiente zona', () => {
    const unlocks = purchases(newGame()).filter((p) => p.kind === 'unlock');
    expect(unlocks.map((p) => p.zoneId)).toEqual(['smelter']);
  });
});

describe('partida guardada', () => {
  it('se guarda y se carga igual', () => {
    const s = newGame();
    playBot(s, 300);
    expect(load(serialize(s))).toEqual(s);
  });

  it('a una partida antigua le falta lo nuevo y toma el valor por defecto', () => {
    const s = load(JSON.stringify({ version: 1, dollars: 50 }));
    expect(s.dollars).toBe(50);
    expect(s.zones.crusher.unlocked).toBe(true);
    expect(s.carts).toBe(ECONOMY.carts.start);
  });
});

describe('ritmo R2 (decidido por Mikel)', () => {
  it('jugando atento: zona 2 hacia los 10 min y zona 4 hacia las 6 h', { timeout: 60000 }, () => {
    const at = playBot(newGame(), 12 * 3600, { ...DEFAULT_BOT, stopWhenAllOpen: true });
    expect(at.smelter / 60).toBeGreaterThan(6);
    expect(at.smelter / 60).toBeLessThan(15);
    expect(at.pipes / 3600).toBeGreaterThan(4.5);
    expect(at.pipes / 3600).toBeLessThan(8);
  });
});
