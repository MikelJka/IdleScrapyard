import { describe, expect, it } from 'vitest';
import { ECONOMY, ZONES, advance, bottleneck, buy, checkAchievements, currentGoal, dockLoad, load, newGame, purchases, scrapDemand, serialize, tap, zoneStatus } from '../src/sim/game';
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

describe('ayudantes', () => {
  const h = ECONOMY.helpers;

  it('con una hora de trabajo de su zona se puede pagar el siguiente nivel', () => {
    const s = newGame();
    s.scrapTrucks = 10;
    s.carts = 10;
    advance(s, h.secondsPerLevel - 10);
    expect(purchases(s).some((p) => p.id === 'helper:crusher')).toBe(false);
    advance(s, 20);
    s.dollars = 1e9;
    expect(buy(s, 'helper:crusher')).toBe(true);
    expect(s.zones.crusher.helperLevel).toBe(1);
    expect(purchases(s).some((p) => p.id === 'helper:crusher')).toBe(false);
  });

  it('sin trabajo no gana experiencia', () => {
    const s = newGame();
    advance(s, 2 * h.secondsPerLevel);
    expect(s.zones.crusher.helperXp).toBe(0);
  });

  it('cada nivel sube un 10 % el valor y un 5 % la velocidad', () => {
    const s = newGame();
    s.zones.crusher.helperLevel = 3;
    s.carts = 0;
    for (let i = 0; i < 100; i++) tap(s);
    advance(s, 1);
    expect(s.zones.crusher.buffer).toBeCloseTo(1 + 3 * h.speedPerLevel, 10);
    s.carts = 1;
    advance(s, 1);
    expect(s.dockValue / s.dockUnits).toBeCloseTo(1 + 3 * h.valuePerLevel, 10);
  });

  it('no pasa del nivel máximo', () => {
    const s = newGame();
    s.zones.crusher.helperLevel = h.maxLevel;
    s.scrapTrucks = 10;
    advance(s, 2 * h.secondsPerLevel);
    expect(s.zones.crusher.helperXp).toBe(0);
    expect(purchases(s).some((p) => p.kind === 'helper')).toBe(false);
  });

  it('una partida guardada sin ayudantes empieza en nivel 0', () => {
    const s = load(JSON.stringify({ zones: { crusher: { unlocked: true, machines: 3 } } }));
    expect(s.zones.crusher.machines).toBe(3);
    expect(s.zones.crusher.helperLevel).toBe(0);
  });
});

describe('muelle por producto', () => {
  it('lo que espera en el muelle suma lo mismo por producto y en total', () => {
    const s = newGame();
    s.scrap = 100;
    advance(s, 4);
    const sum = Object.values(s.dockByZone).reduce((a, b) => a + b, 0);
    expect(s.dockUnits).toBeGreaterThan(0);
    expect(sum).toBeCloseTo(s.dockUnits, 6);
  });

  it('el camión se lleva de cada producto su parte', () => {
    const s = newGame();
    s.dockUnits = 30;
    s.dockByZone = { crusher: 20, smelter: 10 };
    s.dockValue = 60;
    advance(s, 1);
    const sum = Object.values(s.dockByZone).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(s.dockUnits, 6);
    expect(s.dockByZone.crusher / s.dockByZone.smelter).toBeCloseTo(2, 6);
  });

  it('una partida antigua sin muelle por producto se carga', () => {
    expect(load(JSON.stringify({ dockUnits: 3 })).dockByZone).toEqual({});
  });
});

describe('cuello de botella', () => {
  it('sin chatarra se atasca por la chatarra y con el palé lleno por las carretillas', () => {
    const s = newGame();
    expect(bottleneck(s)).toBe('scrap');
    expect(zoneStatus(s, ZONES[0])).toBe('starved');
    s.scrap = 50;
    expect(zoneStatus(s, ZONES[0])).toBe('working');
    expect(bottleneck(s)).toBe('none');
    s.zones.crusher.buffer = 999;
    expect(zoneStatus(s, ZONES[0])).toBe('full');
    expect(bottleneck(s)).toBe('carts');
  });

  it('la demanda de chatarra crece con las máquinas', () => {
    const s = newGame();
    const one = scrapDemand(s);
    s.zones.crusher.machines = 3;
    expect(scrapDemand(s)).toBeCloseTo(one * 3, 6);
  });
});

describe('hitos, logros y objetivo', () => {
  it('al llegar a un múltiplo de 5 de máquina se cobra el premio una sola vez', () => {
    const s = newGame();
    s.zones.crusher.machineLevel = 4;
    s.dollars = 1e12;
    const before = s.dollars;
    const cost = purchases(s).find((p) => p.id === 'machineLevel:crusher')!.cost;
    expect(buy(s, 'machineLevel:crusher')).toBe(true);
    expect(s.zones.crusher.milestone).toBe(5);
    expect(s.dollars).toBeGreaterThan(before - cost);
    const after = s.dollars;
    buy(s, 'machineLevel:crusher'); // nivel 6: sin premio
    expect(s.dollars).toBeLessThan(after);
  });

  it('los logros se dan una vez', () => {
    const s = newGame();
    expect(checkAchievements(s)).toEqual([]);
    s.totalEarned = 2000;
    expect(checkAchievements(s).map((a) => a.id)).toEqual(['earned1k']);
    expect(checkAchievements(s)).toEqual([]);
  });

  it('el objetivo es abrir la siguiente zona', () => {
    const g = currentGoal(newGame());
    expect(g.kind).toBe('unlock');
  });

  it('una partida antigua sin hitos ni logros se carga', () => {
    const s = load(JSON.stringify({ zones: { crusher: { unlocked: true } } }));
    expect(s.achievements).toEqual([]);
    expect(s.zones.crusher.milestone).toBe(0);
  });
});
