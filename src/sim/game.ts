/**
 * Simulación de Chatarrero: chatarra → zonas → carretillas → muelle → camiones → dólares.
 * TypeScript puro, sin DOM. El tiempo entra siempre como parámetro (segundos).
 */
import zonesData from '../data/zones.json';
import economyData from '../data/economy.json';

export interface ZoneDef {
  id: string;
  name: string;
  product: string;
  unitValue: number;
  scrapPerUnit: number;
  cycleSeconds: number;
  unlockCost: number;
  upgradeCostScale: number;
  helper: { id: string; name: string; bio: string };
}

export type Economy = typeof economyData;

export const ZONES: readonly ZoneDef[] = zonesData;
export const ECONOMY: Economy = economyData;

export const SAVE_VERSION = 1;

export interface ZoneState {
  unlocked: boolean;
  machines: number;
  speed: number;
  capacity: number;
  machineLevel: number;
  /** Producto terminado esperando a una carretilla. */
  buffer: number;
}

export interface GameState {
  version: number;
  /** Segundos de juego simulados. */
  time: number;
  dollars: number;
  totalEarned: number;
  /** Chatarra en la pila del desguace. */
  scrap: number;
  scrapTrucks: number;
  carts: number;
  dockLevel: number;
  /** Unidades y valor en dólares de lo que espera en el muelle. */
  dockUnits: number;
  dockValue: number;
  /** Segundos que faltan para que llegue el siguiente camión de expedición. */
  truckCooldown: number;
  zones: Record<string, ZoneState>;
}

export function newGame(): GameState {
  const zones: Record<string, ZoneState> = {};
  for (const z of ZONES) {
    zones[z.id] = {
      unlocked: z.unlockCost === 0,
      machines: z.unlockCost === 0 ? 1 : 0,
      speed: 0,
      capacity: 0,
      machineLevel: 0,
      buffer: 0,
    };
  }
  return {
    version: SAVE_VERSION,
    time: 0,
    dollars: 0,
    totalEarned: 0,
    scrap: 0,
    scrapTrucks: 0,
    carts: ECONOMY.carts.start,
    dockLevel: 0,
    dockUnits: 0,
    dockValue: 0,
    truckCooldown: 0,
    zones,
  };
}

/** Zonas ordenadas por dólares por unidad de chatarra: la chatarra y las carretillas van primero a la que más paga. */
const ZONES_BY_PROFIT = [...ZONES].sort((a, b) => b.unitValue / b.scrapPerUnit - a.unitValue / a.scrapPerUnit);

export function zoneCapacity(zone: ZoneState): number {
  const c = ECONOMY.zoneUpgrades.capacity;
  return c.startCapacity + zone.capacity * c.effectPerLevel;
}

/** Unidades de producto por segundo de una zona. */
export function zoneRate(def: ZoneDef, zone: ZoneState): number {
  if (!zone.unlocked) return 0;
  const u = ECONOMY.zoneUpgrades;
  const speed = 1 + zone.speed * u.speed.effectPerLevel;
  const level = Math.pow(u.machineLevel.outputMultiplierPerLevel, zone.machineLevel);
  return (zone.machines * speed * level) / def.cycleSeconds;
}

export function scrapPerSecond(state: GameState): number {
  return state.scrapTrucks * ECONOMY.scrapTrucks.scrapPerSecond;
}

export function dockLoad(state: GameState): number {
  return ECONOMY.dock.baseLoad + state.dockLevel * ECONOMY.dock.loadPerLevel;
}

/** El jugador toca la pila de chatarra. */
export function tap(state: GameState): void {
  state.scrap += ECONOMY.tap.scrap;
}

function step(state: GameState, dt: number): void {
  state.time += dt;
  state.scrap += scrapPerSecond(state) * dt;

  for (const def of ZONES_BY_PROFIT) {
    const zone = state.zones[def.id];
    if (!zone.unlocked) continue;
    const space = Math.max(0, zoneCapacity(zone) - zone.buffer);
    const units = Math.min(zoneRate(def, zone) * dt, space, state.scrap / def.scrapPerUnit);
    if (units <= 0) continue;
    state.scrap -= units * def.scrapPerUnit;
    zone.buffer += units;
  }

  let carry = state.carts * ECONOMY.carts.unitsPerSecond * dt;
  for (const def of ZONES_BY_PROFIT) {
    if (carry <= 0) break;
    const zone = state.zones[def.id];
    const units = Math.min(carry, zone.buffer);
    if (units <= 0) continue;
    zone.buffer -= units;
    carry -= units;
    state.dockUnits += units;
    state.dockValue += units * def.unitValue;
  }

  state.truckCooldown = Math.max(0, state.truckCooldown - dt);
  const load = dockLoad(state);
  if (state.truckCooldown === 0 && state.dockUnits >= load) {
    const value = (state.dockValue * load) / state.dockUnits;
    state.dockUnits -= load;
    state.dockValue -= value;
    state.dollars += value;
    state.totalEarned += value;
    state.truckCooldown = ECONOMY.dock.returnSeconds;
  }
}

/** Avanza la simulación `seconds` segundos, en pasos de un segundo como máximo. */
export function advance(state: GameState, seconds: number): void {
  let left = seconds;
  while (left > 0) {
    const dt = Math.min(1, left);
    step(state, dt);
    left -= dt;
  }
}

export type PurchaseKind = 'scrapTruck' | 'cart' | 'dock' | 'unlock' | 'speed' | 'capacity' | 'machines' | 'machineLevel';

export interface Purchase {
  /** Identificador estable, p. ej. «cart» o «speed:crusher». */
  id: string;
  kind: PurchaseKind;
  zoneId?: string;
  cost: number;
}

function growthCost(base: number, count: number, growth = ECONOMY.costGrowth): number {
  return base * Math.pow(growth, count);
}

/** Todo lo que se puede comprar ahora (se pueda pagar o no). */
export function purchases(state: GameState): Purchase[] {
  const list: Purchase[] = [
    { id: 'scrapTruck', kind: 'scrapTruck', cost: growthCost(ECONOMY.scrapTrucks.baseCost, state.scrapTrucks) },
    { id: 'cart', kind: 'cart', cost: growthCost(ECONOMY.carts.baseCost, state.carts - ECONOMY.carts.start) },
    { id: 'dock', kind: 'dock', cost: growthCost(ECONOMY.dock.baseCost, state.dockLevel) },
  ];
  const u = ECONOMY.zoneUpgrades;
  let nextLockedShown = false;
  for (const def of ZONES) {
    const zone = state.zones[def.id];
    if (!zone.unlocked) {
      // Solo se ofrece abrir la siguiente zona cerrada.
      if (!nextLockedShown) list.push({ id: `unlock:${def.id}`, kind: 'unlock', zoneId: def.id, cost: def.unlockCost });
      nextLockedShown = true;
      continue;
    }
    const s = def.upgradeCostScale;
    list.push(
      { id: `speed:${def.id}`, kind: 'speed', zoneId: def.id, cost: s * growthCost(u.speed.baseCost, zone.speed) },
      { id: `capacity:${def.id}`, kind: 'capacity', zoneId: def.id, cost: s * growthCost(u.capacity.baseCost, zone.capacity) },
      { id: `machines:${def.id}`, kind: 'machines', zoneId: def.id, cost: s * growthCost(u.machines.baseCost, zone.machines - 1) },
      {
        id: `machineLevel:${def.id}`,
        kind: 'machineLevel',
        zoneId: def.id,
        cost: s * growthCost(u.machineLevel.baseCost, zone.machineLevel, u.machineLevel.growth),
      },
    );
  }
  return list;
}

/** Compra algo si hay dólares. Devuelve si se ha comprado. */
export function buy(state: GameState, id: string): boolean {
  const p = purchases(state).find((x) => x.id === id);
  if (!p || p.cost > state.dollars) return false;
  state.dollars -= p.cost;
  const zone = p.zoneId ? state.zones[p.zoneId] : undefined;
  switch (p.kind) {
    case 'scrapTruck':
      state.scrapTrucks++;
      break;
    case 'cart':
      state.carts++;
      break;
    case 'dock':
      state.dockLevel++;
      break;
    case 'unlock':
      zone!.unlocked = true;
      zone!.machines = 1;
      break;
    case 'speed':
    case 'capacity':
    case 'machines':
    case 'machineLevel':
      zone![p.kind]++;
      break;
  }
  return true;
}

/** Partida guardada: JSON con versión. Lo que falte en partidas antiguas toma el valor de una partida nueva. */
export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function load(json: string): GameState {
  const data = JSON.parse(json) as Partial<GameState>;
  const base = newGame();
  const zones = { ...base.zones };
  for (const id of Object.keys(zones)) zones[id] = { ...zones[id], ...(data.zones?.[id] ?? {}) };
  return { ...base, ...data, version: SAVE_VERSION, zones };
}
