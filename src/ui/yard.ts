// Chatarrería en vista isométrica (2D con bloques que parecen 3D). Solo lee el estado de la simulación.
// Fondo: carretera con los camiones de chatarra. Centro: las líneas de cada zona. Frente: muelle y camiones de expedición.
import { ECONOMY, ZONES, dockLoad, zoneCapacity, type GameState, type ZoneDef } from '../sim/game';
import { block, iso, shade, tile, wheel } from './iso';
import { HELPER_LOOKS, ZONE_LOOKS, type HelperLook } from './look';
import { productIcon } from './icons';

const NS = 'http://www.w3.org/2000/svg';

// Plano del desguace (en baldosas).
const COL_X = [1, 5.5, 10, 14.5];
const ROW_Y = [5, 10];
const SIZE = 3.5;
const BELT_Y = [4.0, 9.0];
const DOCK_Y = 15;
const BACK_Y = -2.6;
const FRONT_Y = 17.2;
const PILE = { x: 2.2, y: 1.9 };
const TRUCK_PARK_X = 7.5;

function fmtShort(n: number): string {
  if (n < 1000) return String(Math.floor(n));
  const units = ['K', 'M', 'B', 'T'];
  let i = -1;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return n.toFixed(n < 10 ? 1 : 0) + units[i];
}

function station(i: number): { x: number; y: number; row: number; col: number } {
  const row = i < 4 ? 0 : 1;
  const col = i % 4;
  return { x: COL_X[col], y: ROW_Y[row], row, col };
}

function at(x: number, y: number, z = 0): string {
  const [a, b] = iso(x, y, z);
  return `translate(${a.toFixed(1)} ${b.toFixed(1)})`;
}

// ---- Piezas ----

function truckIso(body: string, cab: string, load = ''): string {
  return `<ellipse cx="${iso(1.3, 0.5)[0]}" cy="${iso(1.3, 0.5)[1] + 4}" rx="44" ry="14" fill="#000" opacity="0.18"/>
    ${block(0, 0, 0.25, 2.7, 1, 0.12, '#3b3b3b')}
    ${block(0, 0, 0.37, 1.75, 1, 0.75, body)}
    ${load}
    ${block(1.85, 0, 0.37, 0.85, 1, 0.8, cab)}
    <polygon points="${[iso(2.7, 0.12, 0.75), iso(2.7, 0.88, 0.75), iso(2.7, 0.88, 1.08), iso(2.7, 0.12, 1.08)].map((p) => p.join(',')).join(' ')}" fill="#bfe7ff" stroke="#2a1d14" stroke-width="0.8"/>
    ${wheel(0.45, 1)}${wheel(1.4, 1)}${wheel(2.3, 1)}`;
}

const SCRAP_LOAD = block(0.15, 0.15, 1.12, 0.5, 0.4, 0.22, '#8c7b6b') + block(0.7, 0.3, 1.12, 0.45, 0.5, 0.3, '#b5523b') + block(1.15, 0.1, 1.12, 0.45, 0.45, 0.18, '#5f7d91');

function forkliftIso(loaded: boolean, crate: string): string {
  return `<ellipse cx="0" cy="${iso(0.25, 0.5)[1] + 3}" rx="18" ry="8" fill="#000" opacity="0.18"/>
    ${block(0, 0, 0.12, 0.55, 0.7, 0.35, '#f4c430')}
    ${block(0.05, 0.05, 0.47, 0.45, 0.4, 0.05, '#2a1d14')}
    ${block(0.17, 0.18, 0.47, 0.22, 0.2, 0.25, '#f2c28e')}
    ${block(0.06, 0.7, 0.12, 0.44, 0.07, 0.95, '#3b3b3b')}
    ${block(0.08, 0.77, 0.14, 0.4, 0.42, 0.04, '#5a5a5a')}
    ${loaded ? block(0.08, 0.78, 0.18, 0.4, 0.4, 0.34, crate) : ''}
    ${wheel(0.1, 0.7, 0.13)}${wheel(0.45, 0.7, 0.13)}`;
}

/** Ayudante o trabajador hecho de bloques. */
export function personIso(look: HelperLook): string {
  const { skin, hair, gear, accessory } = look;
  let top = block(0.0, -0.02, 1.0, 0.32, 0.28, 0.08, hair);
  let extra = '';
  switch (accessory) {
    case 'hardhat':
      top = block(-0.04, -0.06, 1.0, 0.4, 0.36, 0.1, gear) + block(0.04, 0.0, 1.1, 0.24, 0.22, 0.06, gear);
      break;
    case 'helmet':
      top = block(-0.03, -0.03, 0.82, 0.38, 0.32, 0.3, gear) + block(0.12, -0.03, 1.12, 0.08, 0.32, 0.01, '#fff');
      break;
    case 'cap':
      top = block(0.0, -0.02, 1.0, 0.32, 0.28, 0.08, gear) + block(0.04, 0.26, 1.0, 0.24, 0.14, 0.03, gear);
      break;
    case 'glasses':
      top = block(-0.04, -0.06, 1.0, 0.4, 0.36, 0.1, gear);
      extra = block(0.04, 0.245, 0.86, 0.24, 0.01, 0.06, '#2a1d14');
      break;
    case 'goggles':
      extra = block(0.0, 0.25, 0.94, 0.32, 0.02, 0.05, gear);
      break;
    case 'bandana':
      extra = block(-0.01, -0.01, 0.95, 0.34, 0.3, 0.06, gear);
      break;
    case 'beard':
      extra = block(0.04, 0.245, 0.75, 0.24, 0.04, 0.1, hair);
      break;
    case 'spiky':
      top = block(0.0, -0.02, 1.0, 0.32, 0.28, 0.06, hair) + block(0.05, 0.02, 1.06, 0.08, 0.08, 0.1, hair) + block(0.2, 0.1, 1.06, 0.08, 0.08, 0.12, hair);
      break;
  }
  const [e1x, e1y] = iso(0.1, 0.25, 0.9);
  const [e2x, e2y] = iso(0.21, 0.25, 0.9);
  return `<ellipse cx="0" cy="${iso(0.15, 0.12)[1] + 2}" rx="11" ry="5" fill="#000" opacity="0.2"/>
    ${block(0.02, 0.02, 0, 0.12, 0.2, 0.36, '#3b4a6b')}${block(0.18, 0.02, 0, 0.12, 0.2, 0.36, '#3b4a6b')}
    <g class="torso">${block(-0.02, -0.02, 0.36, 0.34, 0.26, 0.4, gear)}
    ${block(0.02, 0.0, 0.74, 0.28, 0.25, 0.27, skin)}
    <circle cx="${e1x.toFixed(1)}" cy="${e1y.toFixed(1)}" r="1.1" fill="#2a1d14"/><circle cx="${e2x.toFixed(1)}" cy="${e2y.toFixed(1)}" r="1.1" fill="#2a1d14"/>
    ${top}${extra}</g>`;
}

/** Máquina de una zona: cambia con su nivel (0 oxidada, 1 pintada, 2 con panel y luz, 3+ de lujo dorada). */
function machineIso(id: string, level: number): string {
  const look = ZONE_LOOKS[id] ?? { wall: '#999', roof: '#555' };
  const tier = Math.min(3, level);
  const h = [0.7, 0.85, 1.0, 1.1][tier];
  const color = tier === 0 ? '#8a7a6a' : look.wall;
  let s = block(0, 0, 0, 0.95, 1.1, h, color);
  // Boca por donde entra la chatarra.
  s += block(0.25, -0.05, h - 0.25, 0.45, 0.1, 0.2, '#2a1d14');
  if (tier === 0) {
    s += block(0.7, 0.75, h, 0.12, 0.12, 0.35, '#5a4a3a');
    s += `<circle cx="${iso(0.3, 1.1, 0.4)[0]}" cy="${iso(0.3, 1.1, 0.4)[1]}" r="2" fill="#6b4a2b"/>`;
  } else {
    s += block(0, 1.1, 0.06, 0.95, 0.02, 0.12, '#f4c430', { edge: false });
    s += block(0.7, 0.7, h, 0.16, 0.16, 0.5, shade(look.roof, 1));
  }
  if (tier >= 2) {
    s += block(0.1, 1.1, 0.3, 0.4, 0.12, 0.35, '#3b4a5a');
    const [lx, ly] = iso(0.3, 0.3, h + 0.05);
    s += `<circle class="lamp" cx="${lx.toFixed(1)}" cy="${(ly - 3).toFixed(1)}" r="3.2" fill="#7ee081" stroke="#2a1d14" stroke-width="0.8"/>`;
  }
  if (tier >= 3) {
    s += block(-0.02, -0.02, h, 0.99, 1.14, 0.05, '#f2b705');
    s += block(0.1, 0.1, h + 0.05, 0.14, 0.14, 0.45, '#f2b705');
  }
  // Placa con el producto en la cara frontal.
  const [px, py] = iso(0.62, 1.1, h * 0.5);
  s += `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(0.62)"><rect x="-11" y="-10" width="22" height="20" rx="3" fill="#fff3dc" stroke="#2a1d14"/>${productIcon(id)}</g>`;
  return `<ellipse cx="${iso(0.5, 0.55)[0]}" cy="${iso(0.5, 0.55)[1] + 3}" rx="30" ry="13" fill="#000" opacity="0.15"/>${s}`;
}

function crate(color: string): string {
  return block(0, 0, 0, 0.34, 0.34, 0.28, color);
}

const BELT_ATTR = 'fill="#5a5550" stroke="#2a1d14" stroke-width="0.8"';

function staticYard(): string {
  let s = '';
  // Carretera de atrás y valla.
  s += tile(-10, BACK_Y - 0.6, 40, 2.4, 'fill="#5b4632"');
  s += `<polyline points="${[iso(-10, BACK_Y + 0.6), iso(30, BACK_Y + 0.6)].map((p) => p.join(',')).join(' ')}" stroke="#e8d3a8" stroke-width="2" stroke-dasharray="12 10" opacity="0.6"/>`;
  // Suelo del desguace con baldosas.
  s += tile(-0.6, -0.6, 20, 15.6, 'fill="#cdbba0" stroke="#2a1d14" stroke-width="1.2"');
  for (let x = 0; x <= 19; x++) s += `<polyline points="${[iso(x - 0.6, -0.6), iso(x - 0.6, 15)].map((p) => p.join(',')).join(' ')}" stroke="#b9a587" stroke-width="0.7"/>`;
  for (let y = 0; y <= 15; y++) s += `<polyline points="${[iso(-0.6, y - 0.6), iso(19.4, y - 0.6)].map((p) => p.join(',')).join(' ')}" stroke="#b9a587" stroke-width="0.7"/>`;
  for (let x = -0.6; x < 19.4; x += 0.8) s += block(x, -0.9, 0, 0.12, 0.12, 0.55, '#8a7a6a');
  s += block(-0.6, -0.86, 0.38, 20, 0.04, 0.06, '#8a7a6a', { edge: false });
  // Cintas que reparten la chatarra desde la pila.
  s += tile(4.6, BELT_Y[0], 14.4, 0.4, BELT_ATTR);
  s += tile(0.25, 4.0, 0.4, 5.4, BELT_ATTR);
  s += tile(0.25, BELT_Y[1], 18.75, 0.4, BELT_ATTR);
  // Pasillos de las carretillas.
  for (const c of COL_X) s += tile(c + 3.75, 4.6, 0.5, 10.2, 'fill="#f4c430" opacity="0.18"');
  // Muelle de carga.
  s += block(0.2, DOCK_Y, 0, 19, 1.4, 0.3, '#8a6a4a');
  for (let b = 0; b < 4; b++) s += tile(2 + b * 4.6, DOCK_Y + 0.2, 2.2, 1, 'fill="none" stroke="#f4c430" stroke-width="1.5" stroke-dasharray="5 4"', 0.3);
  // Carretera de delante.
  s += tile(-10, FRONT_Y - 0.6, 40, 3.4, 'fill="#5b4632"');
  s += `<polyline points="${[iso(-10, FRONT_Y + 1.1), iso(30, FRONT_Y + 1.1)].map((p) => p.join(',')).join(' ')}" stroke="#e8d3a8" stroke-width="2" stroke-dasharray="12 10" opacity="0.6"/>`;
  return s;
}

function pileIso(): string {
  const [cx, cy] = iso(PILE.x, PILE.y);
  const junk = [
    [1.0, 0.6, 0.3, 0.7, 0.5, 0.3, '#5f7d91'],
    [2.2, 1.0, 0.5, 0.6, 0.6, 0.4, '#b5523b'],
    [1.4, 1.8, 0.6, 0.8, 0.5, 0.3, '#9aa5ab'],
    [2.6, 2.3, 0.2, 0.6, 0.7, 0.3, '#c9a24a'],
    [1.6, 1.2, 1.0, 0.5, 0.5, 0.35, '#7d8b6a'],
    [0.6, 2.2, 0.2, 0.5, 0.6, 0.4, '#8c7b6b'],
  ] as const;
  const mound = [iso(0, 1.6), iso(1.2, 0.2), iso(2.6, 0.2), iso(3.8, 1.4), iso(3.8, 2.8), iso(2.4, 3.8), iso(0.6, 3.6)];
  const [hx, hy] = iso(2, 2, 1.6);
  return `<g transform="translate(${-cx} ${-cy})">
    <ellipse cx="${iso(2, 2)[0]}" cy="${iso(2, 2)[1]}" rx="${3 * 28}" ry="${3 * 14}" fill="#000" opacity="0.15"/>
    <polygon points="${mound.map(([a, b]) => `${a},${b}`).join(' ')}" fill="#7a6d60" stroke="#2a1d14" stroke-width="1.2"/>
    <path d="M${iso(0.6, 1.8)[0]} ${iso(0.6, 1.8)[1]} Q${hx} ${hy - 30} ${iso(3.6, 2.2)[0]} ${iso(3.6, 2.2)[1]}" fill="#8a7b6c" stroke="#2a1d14" stroke-width="1.2"/>
    ${junk.map(([x, y, z, w, d, h, c]) => block(x, y, z, w, d, h, c)).join('')}
    ${wheel(2.0, 2.6, 0.3)}
  </g>`;
}

// ---- Escena ----

export interface Yard {
  el: SVGSVGElement;
  update(state: GameState): void;
  pop(text: string, where: 'pile' | 'dock'): void;
}

interface Obj {
  el: SVGGElement;
  depth: number;
}

export function createYard(container: HTMLElement): Yard {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'yard');
  svg.innerHTML = `<defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="0.5" stop-color="#f2b705"/><stop offset="1" stop-color="#b07d00"/></linearGradient></defs>
    <rect x="-3000" y="-3000" width="6000" height="6000" fill="#a8906a"/>
    <g id="ground">${staticYard()}</g>
    <g id="back"></g>
    <g id="objects"></g>
    <g id="front"></g>
    <g id="labels"></g>
    <g id="pops"></g>`;
  container.appendChild(svg);
  const q = (id: string) => svg.querySelector<SVGGElement>('#' + id)!;
  const back = q('back');
  const objectsG = q('objects');
  const front = q('front');
  const labels = q('labels');
  const pops = q('pops');

  const mk = (parent: SVGGElement, html: string, cls = ''): SVGGElement => {
    const g = document.createElementNS(NS, 'g');
    if (cls) g.setAttribute('class', cls);
    g.innerHTML = html;
    parent.appendChild(g);
    return g;
  };

  // Pila de chatarra (se toca).
  const pile = mk(objectsG, `<g class="pile-body">${pileIso()}</g>`, 'tappable');
  pile.id = 'pile';
  pile.setAttribute('role', 'button');
  pile.setAttribute('aria-label', 'Pila de chatarra');
  pile.setAttribute('transform', at(PILE.x, PILE.y));
  const pileBody = pile.querySelector<SVGGElement>('.pile-body')!;
  const pileLabel = mk(labels, '', 'tag');
  const hint = mk(labels, `<rect x="-36" y="-12" width="72" height="20" rx="10" fill="#fff6e0" stroke="#2a1d14" stroke-width="1.2"/><text y="2.5" text-anchor="middle" font-size="10" font-weight="800" fill="#2a1d14">¡TÓCAME!</text>`, 'hint');
  hint.setAttribute('pointer-events', 'none');
  {
    const [x, y] = iso(PILE.x + 0.8, PILE.y + 0.8, 2.6);
    hint.setAttribute('transform', `translate(${x} ${y})`);
  }

  const objs: Obj[] = [{ el: pile, depth: PILE.x + PILE.y + 2 }];

  // Camiones de chatarra (atrás) y de expedición (delante).
  const scrapTrucks = [0, 1, 2].map(() => mk(back, truckIso('#7d8b6a', '#9fb07f', SCRAP_LOAD)));
  const shipTruck = mk(front, '');
  let shipLoaded = -1;
  const golden = mk(front, `<g class="bob">${truckIso('url(#gold)', '#ffd34d', block(0.5, 0.3, 1.12, 0.7, 0.4, 0.2, '#fff1a8'))}</g><g class="sparkles" fill="#fffbd1"><path d="M0 -40 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2Z"/><path d="M50 -30 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5Z"/></g>`, 'tappable');
  golden.id = 'golden';
  golden.dataset.action = 'golden';

  // Cajas del muelle.
  const dockCrates = mk(objectsG, '');
  objs.push({ el: dockCrates, depth: TRUCK_PARK_X + DOCK_Y + 1 });
  let cratesShown = -1;

  // Líneas de cada zona.
  interface Line {
    def: ZoneDef;
    key: string;
    floor: SVGGElement;
    machines: SVGGElement;
    worker: SVGGElement;
    pallet: SVGGElement;
    label: SVGGElement;
    belts: SVGGElement;
    palletShown: number;
  }
  const floorLayer = q('ground');
  const lines: Line[] = ZONES.map((def, i) => {
    const st = station(i);
    const line: Line = {
      def,
      key: '',
      floor: mk(floorLayer, ''),
      belts: mk(floorLayer, ''),
      machines: mk(objectsG, ''),
      worker: mk(objectsG, '', 'worker'),
      pallet: mk(objectsG, ''),
      label: mk(labels, ''),
      palletShown: -1,
    };
    line.worker.setAttribute('transform', at(st.x + 1.3, st.y + 2.3));
    line.pallet.setAttribute('transform', at(st.x + 2.45, st.y + 2.45));
    objs.push({ el: line.machines, depth: st.x + st.y + 1.2 }, { el: line.worker, depth: st.x + st.y + 3.6 }, { el: line.pallet, depth: st.x + st.y + 5.5 });
    return line;
  });

  // Carretillas.
  const cartsG: SVGGElement[] = [];
  let cartsLoaded: boolean[] = [];

  function buildLine(l: Line, state: GameState, i: number, isNext: boolean): void {
    const st = station(i);
    const zone = state.zones[l.def.id];
    const look = ZONE_LOOKS[l.def.id] ?? { wall: '#999', roof: '#555' };
    if (!zone.unlocked) {
      l.floor.innerHTML = tile(st.x, st.y, SIZE, SIZE, `fill="#000" opacity="${isNext ? 0.12 : 0.06}" stroke="#2a1d14" stroke-width="1.2" stroke-dasharray="6 5"`);
      l.belts.innerHTML = '';
      l.machines.innerHTML = l.worker.innerHTML = l.pallet.innerHTML = '';
      const [x, y] = iso(st.x + SIZE / 2, st.y + SIZE / 2, 0.4);
      l.label.innerHTML = `<g transform="translate(${x} ${y})" opacity="${isNext ? 1 : 0.6}"><rect x="-10" y="-5" width="20" height="15" rx="3" fill="#c9a24a" stroke="#2a1d14"/><path d="M-6 -5 V-9 Q0 -16 6 -9 V-5" stroke="#2a1d14" stroke-width="2.2" fill="none"/>
        ${isNext ? `<text y="26" text-anchor="middle" font-size="11" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke">${l.def.name}</text><text y="40" text-anchor="middle" font-size="11" font-weight="900" fill="#ffd76a" stroke="#2a1d14" stroke-width="3" paint-order="stroke">$${fmtShort(l.def.unlockCost)}</text>` : ''}</g>`;
      return;
    }
    l.floor.innerHTML =
      tile(st.x, st.y, SIZE, SIZE, `fill="${shade(look.wall, 0.75)}" opacity="0.35"`) +
      tile(st.x + 0.1, st.y + 0.1, SIZE - 0.2, SIZE - 0.2, 'fill="none" stroke="#f4c430" stroke-width="2.2" stroke-dasharray="7 6"');
    const n = Math.min(2, zone.machines);
    let belts = '';
    let machines = '';
    for (let j = 0; j < n; j++) {
      const mx = st.x + 0.2 + j * 1.6;
      belts += tile(mx + 0.4, BELT_Y[st.row] + 0.4, 0.5, st.y + 0.3 - BELT_Y[st.row] - 0.4, BELT_ATTR);
      machines += `<g transform="${at(mx - st.x, 0.3)} scale(1.35)">${machineIso(l.def.id, zone.machineLevel)}</g>`;
    }
    l.belts.innerHTML = belts;
    l.machines.innerHTML = `<g transform="${at(st.x, st.y)}">${machines}</g>`;
    l.worker.innerHTML = `<g transform="scale(1.45)">${personIso(HELPER_LOOKS[l.def.helper.id])}</g>`;
    const [lx, ly] = iso(st.x + 0.3, st.y + SIZE + 0.2);
    const extra = zone.machines > 1 ? ` · ${zone.machines} máq.` : '';
    l.label.innerHTML = `<g transform="translate(${lx} ${ly})"><text text-anchor="middle" font-size="10" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke">${l.def.product}${extra}</text></g>
      <g class="lvl" transform="translate(${iso(st.x + 1.3, st.y + 2.3, 2.75)[0]} ${iso(st.x + 1.3, st.y + 2.3, 2.75)[1]})"><rect x="-17" y="-9" width="34" height="15" rx="7.5" fill="#2a1d14" opacity="0.85"/><text y="2.5" text-anchor="middle" font-size="9" font-weight="900" fill="#ffd76a"></text></g>`;
    l.palletShown = -1;
  }

  let lastDepthOrder = '';
  let lastEarned = -1;
  let lastCooldown = 0;

  function update(state: GameState): void {
    const t = state.time;
    const nextLocked = ZONES.find((z) => !state.zones[z.id].unlocked)?.id ?? '';
    const working = state.scrap > 0.01 || state.scrapTrucks > 0;

    // Pila.
    const s = 0.85 + Math.min(0.3, Math.log10(1 + state.scrap) / 10);
    pileBody.setAttribute('transform', `scale(${s.toFixed(3)})`);
    const [plx, ply] = iso(PILE.x + 1.8, PILE.y + 2.6, 0);
    pileLabel.innerHTML = `<text x="${plx}" y="${ply}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke">${fmtShort(state.scrap)} chatarra</text>`;
    hint.setAttribute('visibility', state.scrapTrucks === 0 ? 'visible' : 'hidden');

    // Camiones de chatarra: llegan por detrás, vuelcan junto a la pila y se van.
    const nTrucks = Math.min(3, state.scrapTrucks);
    scrapTrucks.forEach((g, i) => {
      if (i >= nTrucks) return g.setAttribute('visibility', 'hidden');
      const p = (t / 10 + i / nTrucks) % 1;
      const x = p < 0.35 ? -9 + (p / 0.35) * 12 : p < 0.55 ? 3 : 3 + ((p - 0.55) / 0.45) * 26;
      g.setAttribute('visibility', 'visible');
      g.setAttribute('transform', at(x, BACK_Y));
    });

    // Líneas.
    lines.forEach((l, i) => {
      const zone = state.zones[l.def.id];
      const key = `${zone.unlocked ? 1 : 0}-${zone.machineLevel}-${Math.min(2, zone.machines)}-${zone.machines}-${l.def.id === nextLocked ? 1 : 0}`;
      if (key !== l.key) {
        l.key = key;
        buildLine(l, state, i, l.def.id === nextLocked);
      }
      if (!zone.unlocked) return;
      const running = working && zone.buffer < zoneCapacity(zone) - 0.01;
      l.worker.classList.toggle('busy', running);
      const lvl = l.label.querySelector('.lvl text');
      const txt = `Nv ${zone.helperLevel}`;
      if (lvl && lvl.textContent !== txt) lvl.textContent = txt;
      const stack = Math.ceil(Math.min(1, zone.buffer / zoneCapacity(zone)) * 8);
      if (stack !== l.palletShown) {
        l.palletShown = stack;
        const c = (ZONE_LOOKS[l.def.id] ?? { wall: '#c58a4a' }).wall;
        let h = block(0, 0, 0, 0.8, 0.8, 0.12, '#b07a45');
        for (let k = 0; k < stack; k++) h += `<g transform="${at(0.04 + (k % 2) * 0.38, 0.04 + (Math.floor(k / 2) % 2) * 0.38, 0.12 + Math.floor(k / 4) * 0.28)}">${crate(c)}</g>`;
        l.pallet.innerHTML = `<g transform="scale(1.25)">${h}</g>`;
      }
    });

    // Carretillas: del palé de cada zona abierta, por su pasillo, hasta el muelle.
    const open = ZONES.map((z, i) => ({ z, i })).filter(({ z }) => state.zones[z.id].unlocked);
    const busy = open.some(({ z }) => state.zones[z.id].buffer > 0.5) || state.dockUnits > 0;
    const nCarts = busy ? Math.min(8, state.carts) : 0;
    while (cartsG.length < nCarts) {
      const g = mk(objectsG, '');
      cartsG.push(g);
      objs.push({ el: g, depth: 0 });
      cartsLoaded.push(false);
    }
    cartsG.forEach((g, k) => {
      const obj = objs.find((o) => o.el === g)!;
      if (k >= nCarts) {
        g.setAttribute('visibility', 'hidden');
        obj.depth = -99;
        return;
      }
      const src = open[k % open.length];
      const st = station(src.i);
      const ax = st.x + 4.0;
      const p0 = { x: st.x + 3.0, y: st.y + 2.7 };
      const legA = ax - p0.x;
      const legB = DOCK_Y - 0.9 - p0.y;
      const total = legA + legB;
      const ph = ((t / 8 + k * 0.29) % 1) * 2;
      const going = ph < 1;
      const d = (going ? ph : 2 - ph) * total;
      const x = d < legA ? p0.x + d : ax;
      const y = d < legA ? p0.y : p0.y + (d - legA);
      if (cartsLoaded[k] !== going || !g.firstChild) {
        cartsLoaded[k] = going;
        g.innerHTML = forkliftIso(going, (ZONE_LOOKS[src.z.id] ?? { wall: '#c58a4a' }).wall);
      }
      g.setAttribute('visibility', 'visible');
      g.setAttribute('transform', at(x - 0.27, y - 0.35));
      obj.depth = x + y;
    });

    // Cajas en el muelle.
    const fill = Math.min(1, state.dockUnits / dockLoad(state));
    const nCrates = Math.round(fill * 8);
    if (nCrates !== cratesShown) {
      cratesShown = nCrates;
      dockCrates.innerHTML = Array.from({ length: nCrates }, (_, k) => `<g transform="${at(TRUCK_PARK_X + (k % 4) * 0.42, DOCK_Y + 0.4 + Math.floor(k / 4) * 0.42, 0.3)}">${crate('#c58a4a')}</g>`).join('');
    }

    // Camión de expedición: espera junto al muelle y se va cargado.
    const away = state.truckCooldown / ECONOMY.dock.returnSeconds;
    let tx = TRUCK_PARK_X;
    if (away > 0) {
      const p = 1 - away;
      tx = p < 0.5 ? TRUCK_PARK_X + p * 2 * 22 : TRUCK_PARK_X - 22 + (p - 0.5) * 2 * 22;
    }
    const loaded = away > 0 && 1 - away < 0.5 ? 1 : 0;
    if (loaded !== shipLoaded) {
      shipLoaded = loaded;
      shipTruck.innerHTML = truckIso('#c2683a', '#e08a4f', loaded ? block(0.2, 0.2, 1.12, 0.6, 0.6, 0.3, '#c58a4a') + block(0.9, 0.2, 1.12, 0.6, 0.6, 0.3, '#c58a4a') : '');
    }
    shipTruck.setAttribute('transform', at(tx, FRONT_Y));

    // Dinero que salta al cobrar un camión.
    if (lastEarned >= 0 && state.totalEarned > lastEarned + 1e-9 && state.truckCooldown > lastCooldown) pop('+$' + fmtShort(state.totalEarned - lastEarned), 'dock');
    lastEarned = state.totalEarned;
    lastCooldown = state.truckCooldown;

    // Camión dorado.
    if (state.goldenVisible > 0) {
      const p = 1 - state.goldenVisible / ECONOMY.goldenTruck.visibleSeconds;
      golden.setAttribute('visibility', 'visible');
      golden.setAttribute('transform', at(-2 + p * 10, FRONT_Y + 1.5));
    } else golden.setAttribute('visibility', 'hidden');

    // Orden de dibujo: lo que está más al fondo, primero.
    const sorted = objs.filter((o) => o.depth > -99).sort((a, b) => a.depth - b.depth);
    const order = sorted.map((o) => objs.indexOf(o)).join(',');
    if (order !== lastDepthOrder) {
      lastDepthOrder = order;
      for (const o of sorted) objectsG.appendChild(o.el);
    }
  }

  function pop(text: string, where: 'pile' | 'dock'): void {
    const [x, y] = where === 'pile' ? iso(PILE.x + 1.5, PILE.y + 1.5, 2) : iso(TRUCK_PARK_X + 1.2, FRONT_Y, 1.8);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${(x + (Math.random() - 0.5) * 30).toFixed(1)} ${y})`);
    g.innerHTML = `<text class="pop ${where === 'dock' ? 'money' : ''}" text-anchor="middle">${text}</text>`;
    pops.appendChild(g);
    setTimeout(() => g.remove(), 1100);
  }

  // ---- Cámara: arrastrar para mover, pellizcar o rueda para acercar ----
  const cam = { x: iso(4.5, 6.5)[0], y: iso(4.5, 6.5)[1], scale: 1 };
  let fitted = false;
  function apply(): void {
    const w = container.clientWidth || 380;
    const h = container.clientHeight || 640;
    if (!fitted && w > 0) {
      cam.scale = Math.min(1.8, Math.max(0.6, w / 430));
      fitted = true;
    }
    cam.scale = Math.min(2.2, Math.max(0.4, cam.scale));
    cam.x = Math.min(700, Math.max(-560, cam.x));
    cam.y = Math.min(560, Math.max(-60, cam.y));
    const vw = w / cam.scale;
    const vh = h / cam.scale;
    svg.setAttribute('viewBox', `${(cam.x - vw / 2).toFixed(1)} ${(cam.y - vh / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
  }
  apply();
  new ResizeObserver(apply).observe(container);

  const pointers = new Map<number, { x: number; y: number }>();
  let moved = 0;
  let pinch = 0;
  svg.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) moved = 0;
  });
  svg.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    if (pointers.size === 1) {
      cam.x -= (cur.x - prev.x) / cam.scale;
      cam.y -= (cur.y - prev.y) / cam.scale;
      moved += Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y);
      if (moved > 8) svg.setPointerCapture?.(e.pointerId);
    }
    pointers.set(e.pointerId, cur);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0) cam.scale *= dist / pinch;
      pinch = dist;
      moved = 99;
    }
    apply();
  });
  const end = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = 0;
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
  svg.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      cam.scale *= e.deltaY < 0 ? 1.1 : 0.9;
      apply();
    },
    { passive: false },
  );
  // Un arrastre no cuenta como toque.
  svg.addEventListener(
    'click',
    (e) => {
      if (moved > 8) {
        e.stopPropagation();
        e.preventDefault();
      }
    },
    true,
  );

  return { el: svg, update, pop };
}
