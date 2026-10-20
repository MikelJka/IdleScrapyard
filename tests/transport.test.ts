import { describe, expect, it } from 'vitest';
import { ECONOMY, ZONES, advance, buy, cartBatch, load, newGame, orderQuantity, purchases, serialize, transportLoad, unitValue } from '../src/sim/game';

/** Partida con las zonas abiertas hasta la `id` y mucha chatarra. */
function rich(openUpTo: string) {
  const s = newGame();
  for (const def of ZONES) {
    s.zones[def.id].unlocked = true;
    s.zones[def.id].machines = Math.max(1, s.zones[def.id].machines);
    if (def.id === openUpTo) break;
  }
  s.scrap = 1e12;
  return s;
}

describe('tren y barco', () => {
  it('los vagones y los contenedores no van al muelle de los camiones', () => {
    const s = newGame();
    s.zones.wagons.unlocked = true;
    s.zones.wagons.machines = 50;
    s.scrap = 1e9;
    advance(s, 400);
    expect(s.dockUnits).toBe(0);
    expect(s.transports.rail.units + s.transports.rail.sent * transportLoad('rail', s)).toBeGreaterThan(0);
  });

  it('el tren sale cuando está lleno y paga más que el camión', () => {
    const s = newGame();
    s.transports.rail.units = transportLoad('rail', s) + 5;
    s.transports.rail.value = (transportLoad('rail', s) + 5) * 100;
    advance(s, 1);
    expect(s.transports.rail.sent).toBe(1);
    expect(s.transports.rail.units).toBeCloseTo(5, 6);
    expect(s.dollars).toBeCloseTo(transportLoad('rail', s) * 100 * ECONOMY.transports.rail.payMultiplier, 4);
    expect(s.transports.rail.cooldown).toBeGreaterThan(0);
  });

  it('el barco no sale con menos carga que la suya', () => {
    const s = newGame();
    s.transports.sea.units = transportLoad('sea', s) - 1;
    s.transports.sea.value = 1000;
    advance(s, 5);
    expect(s.transports.sea.sent).toBe(0);
    expect(s.dollars).toBe(0);
  });

  it('la mejora de tren se ofrece solo en su línea y sube la carga', () => {
    const s = newGame();
    expect(purchases(s).some((p) => p.kind === 'transport')).toBe(false);
    s.zones.wagons.unlocked = true;
    s.dollars = 1e12;
    const before = transportLoad('rail', s);
    expect(buy(s, 'transport:wagons')).toBe(true);
    expect(transportLoad('rail', s)).toBe(before + ECONOMY.transports.rail.loadPerLevel);
  });

  it('una partida antigua sin tren ni barco se carga con ellos vacíos', () => {
    const s = load(JSON.stringify({ version: 1, dollars: 5 }));
    expect(s.transports.rail.units).toBe(0);
    expect(s.transports.sea.level).toBe(0);
    expect(s.order).toBeNull();
  });
});

describe('pedidos especiales', () => {
  it('no se pide nada de una línea cerrada, sin chatarra o demasiado lenta', () => {
    const s = newGame();
    expect(orderQuantity(s, ZONES[0])).toBe(0); // sin chatarra
    s.scrap = 100;
    expect(orderQuantity(s, ZONES[1])).toBe(0); // cerrada
    s.zones.wagons.unlocked = true;
    expect(orderQuantity(s, ZONES.find((d) => d.id === 'wagons')!)).toBe(0); // una máquina: no llena una tanda a tiempo
  });

  it('la cantidad pedida son tandas enteras que caben en el plazo', () => {
    const s = rich('beams');
    s.zones.crusher.machines = 20;
    const q = orderQuantity(s, ZONES[0]);
    expect(q).toBeGreaterThan(0);
    expect(q % cartBatch(s.zones.crusher)).toBe(0);
  });

  it('aparece a los 15 min, se cumple entregando y paga la bonificación una sola vez', () => {
    const s = newGame();
    s.zones.crusher.machines = 20;
    s.zones.crusher.carts = 5;
    s.scrap = 1e12;
    advance(s, ECONOMY.orders.everySeconds + 1);
    expect(s.order).not.toBeNull();
    const o = s.order!;
    const bonus = o.qty * unitValue(ZONES[0], s.zones.crusher) * ECONOMY.orders.bonusMultiplier;
    const dollarsBefore = s.dollars;
    advance(s, ECONOMY.orders.windowSeconds);
    expect(s.ordersDone).toBe(1);
    expect(s.order).toBeNull();
    // Lo ganado incluye la bonificación una vez (más los camiones que hayan salido).
    expect(s.dollars - dollarsBefore).toBeGreaterThanOrEqual(bonus);
    expect(s.orderTimer).toBeGreaterThan(0);
  });

  it('si no se cumple a tiempo se pierde sin castigo y se espera al siguiente', () => {
    const s = newGame();
    s.zones.crusher.machines = 20;
    s.scrap = 1e12;
    advance(s, ECONOMY.orders.everySeconds + 1);
    expect(s.order).not.toBeNull();
    const bonus = s.order!.qty * unitValue(ZONES[0], s.zones.crusher);
    s.zones.crusher.carts = 0; // sin carretillas no se entrega nada
    const before = s.dollars;
    advance(s, ECONOMY.orders.windowSeconds + 2);
    expect(s.order).toBeNull();
    expect(s.ordersDone).toBe(0);
    expect(s.dollars - before).toBeLessThan(bonus); // solo los camiones que ya iban, nunca la bonificación
    expect(s.orderTimer).toBeGreaterThan(ECONOMY.orders.everySeconds - 5);
  });

  it('sin ninguna línea posible vuelve a mirar en un minuto y no se atasca', () => {
    const s = newGame(); // sin chatarra
    advance(s, ECONOMY.orders.everySeconds + 1);
    expect(s.order).toBeNull();
    expect(s.orderTimer).toBeGreaterThan(0);
    expect(s.orderTimer).toBeLessThanOrEqual(60);
  });

  it('se guarda y se carga con el pedido en marcha; uno roto se descarta', () => {
    const s = newGame();
    s.order = { zoneId: 'crusher', qty: 20, delivered: 10, left: 50 };
    expect(load(serialize(s)).order).toEqual(s.order);
    const bad = JSON.parse(serialize(s));
    bad.order = { zoneId: 'no-existe', qty: 20, delivered: 0, left: 50 };
    expect(load(JSON.stringify(bad)).order).toBeNull();
    bad.order = { zoneId: 'crusher', qty: 'x' };
    expect(load(JSON.stringify(bad)).order).toBeNull();
  });
});
