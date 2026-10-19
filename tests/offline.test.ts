import { describe, expect, it } from 'vitest';
import { ECONOMY, advance, buy, newGame, tap } from '../src/sim/game';
import { pack, unpack } from '../src/sim/offline';

function playing() {
  const s = newGame();
  for (let i = 0; i < 40; i++) tap(s);
  advance(s, 1);
  s.dollars = 100;
  buy(s, 'scrapTruck');
  return s;
}

describe('guardado y ganancias con el juego cerrado', () => {
  it('sin partida guardada empieza una nueva', () => {
    const r = unpack(null, 1000);
    expect(r.state.dollars).toBe(0);
    expect(r.simulatedSeconds).toBe(0);
  });

  it('un archivo corrupto no rompe: partida nueva', () => {
    expect(unpack('{no es json', 1000).state.totalEarned).toBe(0);
  });

  it('guardar y cargar al instante conserva el estado', () => {
    const s = playing();
    const r = unpack(pack(s, 5000), 5000);
    expect(r.state).toEqual(s);
  });

  it('simula el tiempo cerrado y gana dólares', () => {
    const s = playing();
    const r = unpack(pack(s, 0), 600 * 1000);
    expect(r.simulatedSeconds).toBe(600);
    expect(r.dollarsEarned).toBeGreaterThan(0);
  });

  it('el tope de horas fuera frena la simulación', () => {
    const s = playing();
    const r = unpack(pack(s, 0), 10 * 3600 * 1000);
    expect(r.awaySeconds).toBe(36000);
    expect(r.simulatedSeconds).toBe(ECONOMY.offlineCapSeconds);
  });

  it('un reloj que va hacia atrás no resta tiempo', () => {
    const r = unpack(pack(playing(), 9000), 1000);
    expect(r.simulatedSeconds).toBe(0);
  });
});
