/**
 * Simulación de Chatarrero: chatarra → zonas → carretillas → muelle → camiones → dólares.
 * TypeScript puro, sin DOM. El tiempo entra siempre como parámetro (segundos).
 */
import zonesData from '../data/zones.json';
import economyData from '../data/economy.json';
import achievementsData from '../data/achievements.json';

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
  /** Nivel del ayudante de la zona (0 al abrirla). */
  helperLevel: number;
  /** Segundos que ha trabajado la zona desde el último nivel desbloqueado del ayudante. */
  helperXp: number;
  /** Mayor múltiplo de 5 de nivel de máquina cuyo premio ya se cobró. */
  milestone: number;
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
  /** Unidades de cada producto (por id de zona) que esperan en el muelle; suman `dockUnits`. */
  dockByZone: Record<string, number>;
  /** Segundos que faltan para que llegue el siguiente camión de expedición. */
  truckCooldown: number;
  zones: Record<string, ZoneState>;
  /** Pase de chatarrero comprado: sin anuncios y tope de ganancias fuera más alto. */
  hasPass: boolean;
  /** Segundos que le quedan al empujón ×2 y a la espera para el siguiente. */
  boostSeconds: number;
  boostCooldown: number;
  /** Segundos hasta que llegue el camión dorado y segundos que le quedan a la vista. */
  goldenTimer: number;
  goldenVisible: number;
  /** Último día de la racha cobrado (1-7, 0 sin racha) y número del día en que se cobró (-1 nunca). */
  streakDay: number;
  lastClaimDay: number;
  /** Ids de los logros conseguidos (`src/data/achievements.json`). */
  achievements: string[];
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
      helperLevel: 0,
      helperXp: 0,
      milestone: 0,
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
    dockByZone: {},
    truckCooldown: 0,
    zones,
    hasPass: false,
    boostSeconds: 0,
    boostCooldown: 0,
    goldenTimer: ECONOMY.goldenTruck.everySeconds,
    goldenVisible: 0,
    streakDay: 0,
    lastClaimDay: -1,
    achievements: [],
  };
}

/** Zonas ordenadas por dólares por unidad de chatarra: la chatarra y las carretillas van primero a la que más paga. */
const ZONES_BY_PROFIT = [...ZONES].sort((a, b) => b.unitValue / b.scrapPerUnit - a.unitValue / a.scrapPerUnit);

export function zoneCapacity(zone: ZoneState): number {
  const c = ECONOMY.zoneUpgrades.capacity;
  return c.startCapacity + zone.capacity * c.effectPerLevel;
}

/** Multiplicador del valor de lo producido por el nivel del ayudante. */
export function helperValueMultiplier(zone: ZoneState): number {
  return 1 + zone.helperLevel * ECONOMY.helpers.valuePerLevel;
}

/** Valor en dólares de cada unidad que sale de la zona (con el ayudante). */
export function unitValue(def: ZoneDef, zone: ZoneState): number {
  return def.unitValue * helperValueMultiplier(zone);
}

/** Niveles del ayudante que la experiencia ya ha desbloqueado y que se pueden pagar. */
export function helperLevelsReady(zone: ZoneState): number {
  const h = ECONOMY.helpers;
  return Math.min(Math.floor(zone.helperXp / h.secondsPerLevel), h.maxLevel - zone.helperLevel);
}

/** Unidades de producto por segundo de una zona. */
export function zoneRate(def: ZoneDef, zone: ZoneState): number {
  if (!zone.unlocked) return 0;
  const u = ECONOMY.zoneUpgrades;
  const speed = (1 + zone.speed * u.speed.effectPerLevel) * (1 + zone.helperLevel * ECONOMY.helpers.speedPerLevel);
  const level = Math.pow(u.machineLevel.outputMultiplierPerLevel, zone.machineLevel);
  return (zone.machines * speed * level) / def.cycleSeconds;
}

export type ZoneStatus = 'locked' | 'working' | 'starved' | 'full';

/** Qué le pasa a una línea: trabaja, no tiene chatarra que aplastar o tiene el palé lleno (esperando carretillas). */
export function zoneStatus(state: GameState, def: ZoneDef): ZoneStatus {
  const zone = state.zones[def.id];
  if (!zone.unlocked) return 'locked';
  if (zone.buffer >= zoneCapacity(zone) - 0.01) return 'full';
  if (state.scrap < def.scrapPerUnit) return 'starved';
  return 'working';
}

/** Dónde se atasca la fábrica: falta chatarra, los palés están llenos (faltan carretillas) o fluye bien. */
export function bottleneck(state: GameState): 'scrap' | 'carts' | 'none' {
  const open = ZONES.filter((d) => state.zones[d.id].unlocked);
  if (open.some((d) => zoneStatus(state, d) === 'starved')) return 'scrap';
  if (open.some((d) => zoneStatus(state, d) === 'full')) return 'carts';
  return 'none';
}

/** Chatarra por segundo que las máquinas podrían aplastar si no faltara. */
export function scrapDemand(state: GameState): number {
  return ZONES.reduce((sum, d) => sum + zoneRate(d, state.zones[d.id]) * d.scrapPerUnit, 0);
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

/** Dólares por segundo a ritmo estable: la chatarra va a la zona que más paga, limitada por carretillas y muelle. Sin empujón. */
export function incomePerSecond(state: GameState, tapsPerSecond = 0): number {
  let scrap = scrapPerSecond(state) + tapsPerSecond * ECONOMY.tap.scrap;
  let carry = Math.min(state.carts * ECONOMY.carts.unitsPerSecond, dockLoad(state) / ECONOMY.dock.returnSeconds);
  let income = 0;
  for (const def of ZONES_BY_PROFIT) {
    const units = Math.min(zoneRate(def, state.zones[def.id]), scrap / def.scrapPerUnit, carry);
    scrap -= units * def.scrapPerUnit;
    carry -= units;
    income += units * unitValue(def, state.zones[def.id]);
  }
  return income;
}

/** Tope de lo ganado con el juego cerrado (más alto con el pase). */
export function offlineCapSeconds(state: GameState): number {
  return state.hasPass ? ECONOMY.pass.offlineCapSeconds : ECONOMY.offlineCapSeconds;
}

/** Se puede activar el empujón ×2 (tras ver el anuncio, o directamente con el pase). */
export function canBoost(state: GameState): boolean {
  return state.boostSeconds === 0 && state.boostCooldown === 0;
}

export function activateBoost(state: GameState): boolean {
  if (!canBoost(state)) return false;
  state.boostSeconds = ECONOMY.boost.seconds;
  return true;
}

/** Cobra el camión dorado si está a la vista: paga ×10 lo que hay en el muelle y lo vacía. Devuelve lo cobrado. */
export function claimGoldenTruck(state: GameState): number {
  if (state.goldenVisible === 0) return 0;
  const value = state.dockValue * ECONOMY.goldenTruck.dockMultiplier;
  state.dollars += value;
  state.totalEarned += value;
  state.dockUnits = 0;
  state.dockValue = 0;
  state.dockByZone = {};
  state.goldenVisible = 0;
  return value;
}

/** Día de la racha que se cobraría hoy (`today` = número de día local), o 0 si ya se cobró hoy. Si se falta un día, vuelve al 1. */
export function streakDayFor(state: GameState, today: number): number {
  if (state.lastClaimDay === today) return 0;
  const days = ECONOMY.dailyStreak.rewardMinutes.length;
  return state.lastClaimDay === today - 1 ? (state.streakDay % days) + 1 : 1;
}

/** Dólares del premio diario de hoy: minutos de producción según el día de la racha. */
export function dailyReward(state: GameState, today: number): number {
  const day = streakDayFor(state, today);
  if (day === 0) return 0;
  return ECONOMY.dailyStreak.rewardMinutes[day - 1] * 60 * incomePerSecond(state);
}

export function claimDaily(state: GameState, today: number): number {
  const day = streakDayFor(state, today);
  if (day === 0) return 0;
  const value = dailyReward(state, today);
  // Sin producción todavía (al empezar) el premio sería 0: no se gasta el día de la racha.
  if (value <= 0) return 0;
  state.dollars += value;
  state.totalEarned += value;
  state.streakDay = day;
  state.lastClaimDay = today;
  return value;
}

function step(state: GameState, dt: number): void {
  state.time += dt;
  if (state.boostSeconds > 0) {
    state.boostSeconds = Math.max(0, state.boostSeconds - dt);
    if (state.boostSeconds === 0) state.boostCooldown = ECONOMY.boost.cooldownSeconds;
  } else {
    state.boostCooldown = Math.max(0, state.boostCooldown - dt);
  }
  state.goldenVisible = Math.max(0, state.goldenVisible - dt);
  state.goldenTimer -= dt;
  if (state.goldenTimer <= 0) {
    state.goldenTimer += ECONOMY.goldenTruck.everySeconds;
    state.goldenVisible = ECONOMY.goldenTruck.visibleSeconds;
  }
  state.scrap += scrapPerSecond(state) * dt;

  for (const def of ZONES_BY_PROFIT) {
    const zone = state.zones[def.id];
    if (!zone.unlocked) continue;
    const space = Math.max(0, zoneCapacity(zone) - zone.buffer);
    const units = Math.min(zoneRate(def, zone) * dt, space, state.scrap / def.scrapPerUnit);
    if (units <= 0) continue;
    // El ayudante gana experiencia mientras su zona trabaja (hasta el nivel máximo).
    const h = ECONOMY.helpers;
    zone.helperXp = Math.min(zone.helperXp + dt, (h.maxLevel - zone.helperLevel) * h.secondsPerLevel);
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
    state.dockValue += units * unitValue(def, zone);
    state.dockByZone[def.id] = (state.dockByZone[def.id] ?? 0) + units;
  }

  state.truckCooldown = Math.max(0, state.truckCooldown - dt);
  const load = dockLoad(state);
  if (state.truckCooldown === 0 && state.dockUnits >= load) {
    const value = (state.dockValue * load) / state.dockUnits;
    // El camión se lleva de cada producto la parte que le toca.
    const keep = (state.dockUnits - load) / state.dockUnits;
    for (const id of Object.keys(state.dockByZone)) state.dockByZone[id] *= keep;
    state.dockUnits -= load;
    state.dockValue -= value;
    // El empujón dobla lo que pagan los camiones de expedición.
    const paid = value * (state.boostSeconds > 0 ? ECONOMY.boost.multiplier : 1);
    state.dollars += paid;
    state.totalEarned += paid;
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

export type PurchaseKind = 'scrapTruck' | 'cart' | 'dock' | 'unlock' | 'speed' | 'capacity' | 'machines' | 'machineLevel' | 'helper';

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
    // El siguiente nivel del ayudante solo se ofrece cuando su experiencia lo ha desbloqueado.
    if (helperLevelsReady(zone) > 0) {
      const h = ECONOMY.helpers;
      list.push({ id: `helper:${def.id}`, kind: 'helper', zoneId: def.id, cost: s * growthCost(h.baseCost, zone.helperLevel, h.costGrowth) });
    }
  }
  return list;
}

/** Premio por llegar a un múltiplo de 5 de nivel de máquina: 10 minutos de lo que produce la línea. */
export function milestoneReward(def: ZoneDef, zone: ZoneState): number {
  return 600 * zoneRate(def, zone) * unitValue(def, zone);
}

export interface AchievementDef {
  id: string;
  name: string;
  kind: 'earned' | 'zones' | 'machineLevel' | 'carts' | 'helperLevel' | 'machines';
  value: number;
}
export const ACHIEVEMENTS: readonly AchievementDef[] = achievementsData as AchievementDef[];

function achievementProgress(state: GameState, kind: AchievementDef['kind']): number {
  const zs = Object.values(state.zones);
  switch (kind) {
    case 'earned':
      return state.totalEarned;
    case 'zones':
      return zs.filter((z) => z.unlocked).length;
    case 'machineLevel':
      return Math.max(...zs.map((z) => z.machineLevel));
    case 'carts':
      return state.carts;
    case 'helperLevel':
      return Math.max(...zs.map((z) => z.helperLevel));
    case 'machines':
      return Math.max(...zs.map((z) => z.machines));
  }
}

/** Marca los logros recién conseguidos y los devuelve (para avisar al jugador). */
export function checkAchievements(state: GameState): AchievementDef[] {
  const got = ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id) && achievementProgress(state, a.kind) >= a.value);
  for (const a of got) state.achievements.push(a.id);
  return got;
}

export type Goal = { kind: 'unlock'; zoneId: string; cost: number } | { kind: 'machineLevel'; zoneId: string; level: number; cost: number } | { kind: 'done' };

/** Objetivo a la vista: abrir la siguiente zona o, con todas abiertas, el siguiente múltiplo de 5 de máquina más cercano. */
export function currentGoal(state: GameState): Goal {
  const next = ZONES.find((d) => !state.zones[d.id].unlocked);
  if (next) return { kind: 'unlock', zoneId: next.id, cost: next.unlockCost };
  const p = purchases(state)
    .filter((x) => x.kind === 'machineLevel')
    .sort((a, b) => a.cost - b.cost)[0];
  if (!p) return { kind: 'done' };
  const zone = state.zones[p.zoneId!];
  return { kind: 'machineLevel', zoneId: p.zoneId!, level: (Math.floor(zone.machineLevel / 5) + 1) * 5, cost: p.cost };
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
      zone![p.kind]++;
      break;
    case 'machineLevel': {
      zone!.machineLevel++;
      // Hito cada 5 niveles de máquina: premio único de unos minutos de producción de la línea.
      if (zone!.machineLevel % 5 === 0 && zone!.machineLevel > zone!.milestone) {
        zone!.milestone = zone!.machineLevel;
        const reward = milestoneReward(ZONES.find((d) => d.id === p.zoneId)!, zone!);
        state.dollars += reward;
        state.totalEarned += reward;
      }
      break;
    }
    case 'helper':
      zone!.helperLevel++;
      zone!.helperXp -= ECONOMY.helpers.secondsPerLevel;
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
  return { ...base, ...data, dockByZone: { ...(data.dockByZone ?? {}) }, version: SAVE_VERSION, zones };
}
