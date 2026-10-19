/**
 * Guardado con marca de tiempo y ganancias con el juego cerrado.
 * El reloj entra como parámetro (milisegundos) para poder probarlo.
 */
import { ECONOMY, advance, load, newGame, serialize, type GameState } from './game';

export interface OfflineResult {
  state: GameState;
  /** Segundos realmente simulados (con el tope aplicado). */
  simulatedSeconds: number;
  /** Segundos que pasaron de verdad con el juego cerrado. */
  awaySeconds: number;
  /** Dólares ganados mientras estaba cerrado. */
  dollarsEarned: number;
}

/** Guarda la partida junto con el instante en que se guardó. */
export function pack(state: GameState, nowMs: number): string {
  return JSON.stringify({ savedAt: nowMs, state: JSON.parse(serialize(state)) });
}

/** Lee una partida guardada y simula el tiempo pasado, con el tope de `offlineCapSeconds`. Sin datos, partida nueva. */
export function unpack(json: string | null, nowMs: number): OfflineResult {
  if (!json) return { state: newGame(), simulatedSeconds: 0, awaySeconds: 0, dollarsEarned: 0 };
  let parsed: { savedAt?: number; state?: unknown };
  try {
    parsed = JSON.parse(json);
  } catch {
    return { state: newGame(), simulatedSeconds: 0, awaySeconds: 0, dollarsEarned: 0 };
  }
  const state = load(JSON.stringify(parsed.state ?? {}));
  const savedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : nowMs;
  const awaySeconds = Math.max(0, (nowMs - savedAt) / 1000);
  const simulatedSeconds = Math.min(awaySeconds, ECONOMY.offlineCapSeconds);
  const before = state.dollars;
  advance(state, simulatedSeconds);
  return { state, simulatedSeconds, awaySeconds, dollarsEarned: state.dollars - before };
}
