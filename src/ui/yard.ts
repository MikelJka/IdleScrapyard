// Chatarrería en vista isométrica (2D con bloques que parecen 3D). Solo lee el estado de la simulación.
// Fondo: carretera con los camiones de chatarra. Centro: las líneas de cada zona. Frente: muelle y camiones de expedición.
import { ECONOMY, ZONES, dockLoad, zoneCapacity, type GameState, type ZoneDef } from '../sim/game';
import { block, iso, shade, tile, wheel } from './iso';
import { HELPER_LOOKS, ZONE_LOOKS, type HelperLook } from './look';
import { productIcon } from './icons';
import { PROP_HEIGHT, propIso } from './props';
import { HORIZON, citySvg, floorDetailsSvg, hallBackSvg, hallFrameSvg, skySvg } from './scenery';
import { TRUCK_SLOTS, agvIso, carIso, forkliftIso, goldenTruckIso, scrapTruckIso, shipTruckIso } from './vehicles';

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
  // Partes que se mueven cuando la línea trabaja: prensa, engranaje, chispas y humo de la chimenea.
  s += `<g class="press">${block(0.12, 0.22, h, 0.5, 0.45, 0.16, '#3b3b3b')}</g>`;
  const [spx, spy] = iso(0.47, -0.04, h - 0.15);
  s += `<g class="fx"><circle class="spark" cx="${spx.toFixed(1)}" cy="${spy.toFixed(1)}" r="3.4" fill="#ffe37a"/>`;
  const gz = h * 0.5;
  s += `<g transform="matrix(-28 14 0 -20 26.6 13.3)"><g transform="translate(0.55 ${gz.toFixed(2)})"><g class="gear" fill="#3b3b3b" stroke="#2a1d14" stroke-width="0.03"><circle r="0.13"/>${[0, 45, 90, 135].map((a) => `<rect x="-0.03" y="-0.19" width="0.06" height="0.38" transform="rotate(${a})"/>`).join('')}<circle r="0.05" fill="#8a8a8a"/></g></g></g>`;
  const [chx, chy] = iso(0.78, 0.8, h + (tier === 0 ? 0.35 : 0.5));
  s += [0, 1, 2].map((k) => `<circle class="puff" cx="${chx.toFixed(1)}" cy="${chy.toFixed(1)}" r="5" fill="#e6dccb" style="animation-delay:${(-k * 0.8).toFixed(1)}s"/>`).join('') + '</g>';
  // Placa con el producto en la cara frontal.
  const [px, py] = iso(0.62, 1.1, h * 0.5);
  s += `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(0.62)"><rect x="-11" y="-10" width="22" height="20" rx="3" fill="#fff3dc" stroke="#2a1d14"/>${productIcon(id)}</g>`;
  return `<ellipse cx="${iso(0.5, 0.55)[0]}" cy="${iso(0.5, 0.55)[1] + 3}" rx="30" ry="13" fill="#000" opacity="0.15"/>${s}`;
}

const BELT_ATTR = 'fill="#5a5550" stroke="#2a1d14" stroke-width="0.8"';

function staticYard(): string {
  let s = '';
  // Carretera de atrás y valla.
  s += tile(-10, BACK_Y - 1.6, 44, 3.4, 'fill="#5b4632"');
  s += `<polyline points="${[iso(-10, BACK_Y - 0.85), iso(34, BACK_Y - 0.85)].map((p) => p.join(',')).join(' ')}" stroke="#e8d3a8" stroke-width="2" stroke-dasharray="12 10" opacity="0.6"/>`;
  // Suelo del desguace con baldosas.
  s += tile(-0.6, -0.6, 20, 15.6, 'fill="#cdbba0" stroke="#2a1d14" stroke-width="1.2"');
  s += floorDetailsSvg();
  for (let x = 0; x <= 19; x++) s += `<polyline points="${[iso(x - 0.6, -0.6), iso(x - 0.6, 15)].map((p) => p.join(',')).join(' ')}" stroke="#b9a587" stroke-width="0.7"/>`;
  for (let y = 0; y <= 15; y++) s += `<polyline points="${[iso(-0.6, y - 0.6), iso(19.4, y - 0.6)].map((p) => p.join(',')).join(' ')}" stroke="#b9a587" stroke-width="0.7"/>`;
  for (let x = -0.6; x < 19.4; x += 0.8) s += block(x, -0.9, 0, 0.12, 0.12, 0.55, '#8a7a6a');
  s += block(-0.6, -0.86, 0.38, 20, 0.04, 0.06, '#8a7a6a', { edge: false });
  // Cintas que reparten la chatarra desde la pila.
  s += tile(4.6, BELT_Y[0], 14.4, 0.4, BELT_ATTR);
  s += tile(0.25, 4.0, 0.4, 5.4, BELT_ATTR);
  s += tile(0.25, BELT_Y[1], 18.75, 0.4, BELT_ATTR);
  const flow = (x0: number, y0: number, x1: number, y1: number) => `<polyline class="flow" points="${iso(x0, y0)[0]},${iso(x0, y0)[1]} ${iso(x1, y1)[0]},${iso(x1, y1)[1]}" fill="none" stroke="#c9a24a" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 14"/>`;
  s += `<g id="mainflow" class="belts">${flow(4.6, 4.2, 19, 4.2)}${flow(0.45, 4.0, 0.45, 9.4)}${flow(0.25, 9.2, 19, 9.2)}</g>`;
  // Rutas pintadas de los AGV.
  for (const [x0, y0, x1, y1] of [[-0.25, 3.2, -0.25, 9.8], [0.9, 8.7, 18.2, 8.7], [1.0, 14.3, 18.2, 14.3]]) {
    s += `<polyline points="${iso(x0, y0)[0]},${iso(x0, y0)[1]} ${iso(x1, y1)[0]},${iso(x1, y1)[1]}" stroke="#3f8fc4" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round" opacity="0.7" fill="none"/>`;
  }
  // Pasillos de las carretillas.
  for (const c of COL_X) s += tile(c + 3.75, 4.6, 0.5, 10.2, 'fill="#f4c430" opacity="0.18"');
  // Muelle de carga.
  s += block(0.2, DOCK_Y, 0, 19, 1.4, 0.3, '#8a6a4a');
  for (let b = 0; b < 4; b++) s += tile(2 + b * 4.6, DOCK_Y + 0.2, 2.2, 1, 'fill="none" stroke="#f4c430" stroke-width="1.5" stroke-dasharray="5 4"', 0.3);
  // Carretera de delante.
  s += tile(-10, FRONT_Y - 0.6, 44, 3.4, 'fill="#5b4632"');
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
  svg.innerHTML = `<defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="0.5" stop-color="#f2b705"/><stop offset="1" stop-color="#b07d00"/></linearGradient>
      <clipPath id="hz"><rect x="-4000" y="${HORIZON}" width="8000" height="6000"/></clipPath></defs>
    ${skySvg()}
    <g id="clouds"></g>
    <g id="city">${citySvg()}</g>
    <g id="birds"></g>
    <g id="ground" clip-path="url(#hz)">${staticYard()}</g>
    <g id="back" clip-path="url(#hz)"></g>
    ${hallBackSvg()}
    <g id="objects"></g>
    ${hallFrameSvg()}
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
  const clouds = q('clouds');
  const birds = q('birds');
  const mainFlow = q('mainflow');

  const mk = (parent: SVGGElement, html: string, cls = ''): SVGGElement => {
    const g = document.createElementNS(NS, 'g');
    if (cls) g.setAttribute('class', cls);
    g.innerHTML = html;
    parent.appendChild(g);
    return g;
  };

  // Nubes y pájaros del cielo.
  const cloudEls = [0, 1, 2, 3].map((i) => mk(clouds, `<g opacity="${0.5 + (i % 2) * 0.15}" fill="#fff6e6"><ellipse rx="${60 + i * 8}" ry="${14 + (i % 2) * 4}"/><ellipse cx="${-26 + i * 4}" cy="-10" rx="30" ry="14"/><ellipse cx="22" cy="-12" rx="34" ry="15"/></g>`));
  const birdEls = [0, 1, 2, 3, 4].map(() => mk(birds, '<path class="bird" d="M-7 0 Q-3.5 -5 0 0 Q3.5 -5 7 0" fill="none" stroke="#2a1d14" stroke-width="1.6" stroke-linecap="round"/>'));

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

  // Camiones de chatarra (atrás): llegan, se acercan a la pila, vuelcan la caja y se van.
  const scrapTrucks = [0, 1, 2].map(() => mk(back, ''));
  const scrapKey: string[] = ['', '', ''];

  // Tráfico de fondo en las dos carreteras.
  const CAR_COLORS = ['#c0392b', '#2f6fb3', '#e8e0d0', '#3fa7a0', '#d4a72c', '#6b5a8a', '#4a4a4a'];
  const mkCars = (parent: SVGGElement, lanes: { y: number; dir: 1 | -1; speed: number }[], perLane: number) => {
    const list: { g: SVGGElement; y: number; dir: 1 | -1; speed: number; off: number }[] = [];
    let n = 0;
    for (const lane of lanes)
      for (let i = 0; i < perLane; i++) {
        // Misma velocidad en cada carril y huecos iguales: así nunca se alcanzan ni se atraviesan.
        const g = mk(parent, carIso(CAR_COLORS[(n * 3 + 1) % CAR_COLORS.length], n % 3 === 2, lane.dir < 0));
        list.push({ g, y: lane.y, dir: lane.dir, speed: lane.speed, off: (i / perLane) * 44 });
        n++;
      }
    return list;
  };
  const backCars = mkCars(back, [{ y: BACK_Y - 1.55, dir: -1, speed: 2.6 }, { y: BACK_Y - 0.7, dir: 1, speed: 3.0 }], 2);
  const frontCars = mkCars(front, [{ y: FRONT_Y + 2.2, dir: 1, speed: 2.8 }], 3);

  // Camión de expedición (delante): carga los productos poco a poco y se va.
  const shipTruck = mk(front, '');
  let shipKey = '';
  let shipPhase: 'park' | 'leave' | 'return' = 'park';
  let shipT = 0;
  let shipFill = 0;
  let shipPending = 0;
  let pendingMoney = 0;
  let prevCooldown = -1;
  let lastTime = -1;
  const golden = mk(front, `<g class="bob">${goldenTruckIso()}</g><g class="sparkles" fill="#fffbd1"><path d="M0 -40 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2Z"/><path d="M50 -30 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5Z"/></g>`, 'tappable');
  golden.id = 'golden';
  golden.dataset.action = 'golden';

  // Productos que esperan en el muelle.
  const dockCrates = mk(objectsG, '');
  objs.push({ el: dockCrates, depth: TRUCK_PARK_X + DOCK_Y + 1 });
  let cratesKey = '';

  // Vehículos guiados (AGV) que llevan contenedores de chatarra por rutas fijas pintadas en el suelo.
  const agvs = [
    { x0: -0.25, y0: 3.2, x1: -0.25, y1: 9.8, speed: 1.1 }, // de la pila al inicio de las cintas
    { x0: 0.9, y0: 8.7, x1: 18.2, y1: 8.7, speed: 1.0 }, // reparte por el pasillo central
    { x0: 18.2, y0: 14.3, x1: 1.0, y1: 14.3, speed: 1.2 }, // pasillo del muelle
  ].map((r) => {
    const g = mk(objectsG, '');
    const o: Obj = { el: g, depth: 0 };
    objs.push(o);
    return { ...r, g, o, key: '' };
  });

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
    /** Cuánto está trabajando (0-1), suavizado para que las animaciones arranquen y paren sin saltos. */
    level: number;
    phase: number;
    gearAngle: number;
    press: SVGElement[];
    gears: SVGElement[];
    fx: SVGElement[];
    flows: SVGElement[];
    torso: SVGElement | null;
  }
  const floorLayer = q('ground');
  const lines: Line[] = ZONES.map((def, i) => {
    const st = station(i);
    const line: Line = {
      def,
      key: '',
      floor: mk(floorLayer, ''),
      belts: mk(floorLayer, '', 'belts'),
      machines: mk(objectsG, ''),
      worker: mk(objectsG, '', 'worker'),
      pallet: mk(objectsG, ''),
      label: mk(labels, ''),
      palletShown: -1,
      level: 0,
      phase: 0,
      gearAngle: 0,
      press: [],
      gears: [],
      fx: [],
      flows: [],
      torso: null,
    };
    line.worker.setAttribute('transform', at(st.x + 1.3, st.y + 2.3));
    line.pallet.setAttribute('transform', at(st.x + 2.45, st.y + 2.45));
    objs.push({ el: line.machines, depth: st.x + st.y + 1.2 }, { el: line.worker, depth: st.x + st.y + 3.6 }, { el: line.pallet, depth: st.x + st.y + 5.5 });
    return line;
  });

  // Carretillas.
  interface Cart {
    g: SVGGElement;
    o: Obj;
    key: string;
    loadN: number;
    trip: boolean;
    t0: number;
    home: string;
  }
  const carts: Cart[] = [];

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
      const [fx0, fy0] = iso(mx + 0.65, BELT_Y[st.row] + 0.4);
      const [fx1, fy1] = iso(mx + 0.65, st.y + 0.3);
      belts += `<polyline class="flow" points="${fx0.toFixed(1)},${fy0.toFixed(1)} ${fx1.toFixed(1)},${fy1.toFixed(1)}" fill="none" stroke="${look.wall}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="4 14"/>`;
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
    l.press = [...l.machines.querySelectorAll<SVGElement>('.press')];
    l.gears = [...l.machines.querySelectorAll<SVGElement>('.gear')];
    l.fx = [...l.machines.querySelectorAll<SVGElement>('.fx')];
    l.flows = [...l.belts.querySelectorAll<SVGElement>('.flow')];
    l.torso = l.worker.querySelector<SVGElement>('.torso');
  }

  let lastDepthOrder = '';
  let lastEarned = -1;
  let mainLevel = 0;

  // Un viaje de carretilla dura CYC s: ir (MOVE), girar en el muelle (TURN), volver (MOVE) y girar junto al palé (TURN).
  const MOVE = 3.4;
  const TURN = 0.6;
  const CYC = 2 * MOVE + 2 * TURN;
  const lerp = (a: number, b: number, f: number) => a + (b - a) * Math.min(1, Math.max(0, f));

  function cartPose(u: number, p0: { x: number; y: number }, ax: number): { x: number; y: number; ang: number; phase: 0 | 1 | 2 | 3 } {
    const legA = ax - p0.x;
    const legB = DOCK_Y - 0.9 - p0.y;
    const total = legA + legB;
    const at2 = (d: number) => (d < legA ? { x: p0.x + d, y: p0.y } : { x: ax, y: p0.y + (d - legA) });
    const w = 0.6;
    if (u < MOVE) {
      const d = (u / MOVE) * total;
      return { ...at2(d), ang: lerp(0, Math.PI / 2, (d - legA + w) / (2 * w)), phase: 0 };
    }
    if (u < MOVE + TURN) return { ...at2(total), ang: Math.PI / 2 + Math.PI * ((u - MOVE) / TURN), phase: 1 };
    if (u < 2 * MOVE + TURN) {
      const d = (1 - (u - MOVE - TURN) / MOVE) * total;
      return { ...at2(d), ang: lerp((3 * Math.PI) / 2, Math.PI, (legA - d + w) / (2 * w)), phase: 2 };
    }
    return { ...at2(0), ang: Math.PI + Math.PI * ((u - 2 * MOVE - TURN) / TURN), phase: 3 };
  }

  function update(state: GameState): void {
    const t = state.time;
    const nextLocked = ZONES.find((z) => !state.zones[z.id].unlocked)?.id ?? '';
    const working = state.scrap > 0.01 || state.scrapTrucks > 0;
    const dtv = lastTime < 0 ? 0 : Math.min(0.25, Math.max(0, t - lastTime));
    lastTime = t;

    // Cielo: nubes y pájaros.
    cloudEls.forEach((g, i) => g.setAttribute('transform', `translate(${(((t * 2.5 + i * 700) % 2800) - 1200).toFixed(1)} ${HORIZON - 190 - i * 38})`));
    birdEls.forEach((g, i) => g.setAttribute('transform', `translate(${(((t * (16 + i * 3) + i * 520) % 2600) - 1100).toFixed(1)} ${(HORIZON - 120 - i * 34 + Math.sin(t * 1.3 + i) * 10).toFixed(1)})`));
    mainLevel += ((working ? 1 : 0) - mainLevel) * Math.min(1, dtv * (working ? 6 : 1.4));
    mainFlow.style.opacity = (0.95 * mainLevel).toFixed(2);

    // Pila.
    const s = 0.85 + Math.min(0.3, Math.log10(1 + state.scrap) / 10);
    pileBody.setAttribute('transform', `scale(${s.toFixed(3)})`);
    const [plx, ply] = iso(PILE.x + 1.8, PILE.y + 2.6, 0);
    pileLabel.innerHTML = `<text x="${plx}" y="${ply}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke">${fmtShort(state.scrap)} chatarra</text>`;
    hint.setAttribute('visibility', state.scrapTrucks === 0 ? 'visible' : 'hidden');

    // Camiones de chatarra: llegan por detrás, maniobran hasta la pila, vuelcan la caja y se van vacíos.
    const nTrucks = Math.min(3, state.scrapTrucks);
    scrapTrucks.forEach((g, i) => {
      if (i >= nTrucks) return g.setAttribute('visibility', 'hidden');
      const p = (t / 12 + i / nTrucks) % 1;
      const lane = BACK_Y;
      let x = 1.2;
      let y = lane;
      let tilt = 0;
      let slide = 0;
      let dust = 0;
      if (p < 0.3) x = -5 + (p / 0.3) * 6.2;
      else if (p < 0.36) y = lane + ((p - 0.3) / 0.06) * 0.85;
      else if (p < 0.5) {
        y = lane + 0.85;
        tilt = Math.min(1, (p - 0.36) / 0.06) * 0.6;
        slide = Math.min(1, Math.max(0, (p - 0.42) / 0.07));
        dust = slide > 0.9 ? Math.min(1, (p - 0.49) / 0.04) : 0;
      } else if (p < 0.56) {
        y = lane + 0.85;
        tilt = (1 - (p - 0.5) / 0.06) * 0.6;
        slide = 1;
      } else if (p < 0.6) {
        y = lane + 0.85 * (1 - (p - 0.56) / 0.04);
        slide = 1;
      } else {
        x = 1.2 + ((p - 0.6) / 0.4) * 34;
        slide = 1;
      }
      const loaded = p < 0.5;
      const key = `${Math.round(tilt * 30)}|${Math.round(slide * 12)}|${Math.round(dust * 6)}|${loaded ? 1 : 0}`;
      if (scrapKey[i] !== key) {
        scrapKey[i] = key;
        g.innerHTML = scrapTruckIso(tilt, true, slide, dust);
      }
      g.setAttribute('visibility', 'visible');
      g.setAttribute('transform', at(x, y));
    });

    // Tráfico de fondo.
    const drive = (list: typeof backCars) =>
      list.forEach((c) => {
        const run = (((c.off + c.dir * t * c.speed) % 44) + 44) % 44;
        c.g.setAttribute('transform', at(-8 + run, c.y));
      });
    drive(backCars);
    drive(frontCars);

    // Líneas.
    const openIds: string[] = [];
    lines.forEach((l, i) => {
      const zone = state.zones[l.def.id];
      if (zone.unlocked) openIds.push(l.def.id);
      const key = `${zone.unlocked ? 1 : 0}-${zone.machineLevel}-${Math.min(2, zone.machines)}-${zone.machines}-${l.def.id === nextLocked ? 1 : 0}`;
      if (key !== l.key) {
        l.key = key;
        buildLine(l, state, i, l.def.id === nextLocked);
      }
      if (!zone.unlocked) return;
      const running = working && zone.buffer < zoneCapacity(zone) - 0.01;
      // Arranca rápido y para despacio; así no hay saltos cuando la chatarra llega a golpes.
      l.level += ((running ? 1 : 0) - l.level) * Math.min(1, dtv * (running ? 6 : 1.4));
      if (l.level < 0.004) l.level = 0;
      l.phase += dtv * l.level * 11;
      l.gearAngle = (l.gearAngle + dtv * l.level * 320) % 360;
      const wave = 0.5 + 0.5 * Math.sin(l.phase);
      for (const e of l.press) e.style.translate = `0 ${(l.level * wave * 7).toFixed(2)}px`;
      for (const e of l.gears) e.style.rotate = `${l.gearAngle.toFixed(1)}deg`;
      for (const e of l.fx) e.style.opacity = l.level.toFixed(2);
      for (const e of l.flows) e.style.opacity = (0.95 * l.level).toFixed(2);
      if (l.torso) l.torso.style.translate = `0 ${(-2 * l.level * (0.5 + 0.5 * Math.sin(l.phase * 1.3))).toFixed(2)}px`;
      const lvl = l.label.querySelector('.lvl text');
      const txt = `Nv ${zone.helperLevel}`;
      if (lvl && lvl.textContent !== txt) lvl.textContent = txt;
      const stack = Math.ceil(Math.min(1, zone.buffer / zoneCapacity(zone)) * 8);
      if (stack !== l.palletShown) {
        l.palletShown = stack;
        const hgt = PROP_HEIGHT[l.def.id] ?? 0.3;
        let h = block(0, 0, 0, 0.8, 0.8, 0.12, '#b07a45');
        for (let k = 0; k < stack; k++) h += `<g transform="${at(0.03 + (k % 2) * 0.4, 0.03 + (Math.floor(k / 2) % 2) * 0.4, 0.12 + Math.floor(k / 4) * hgt)}">${propIso(l.def.id)}</g>`;
        l.pallet.innerHTML = `<g transform="scale(1.25)">${h}</g>`;
      }
    });

    // Carretillas: cada una atiende una zona abierta. Si hay producto (o la zona está produciendo) sale a trabajar,
    // gira en cada extremo y lleva solo lo que hay; si no, espera junto al palé.
    const open = ZONES.map((z, i) => ({ z, i })).filter(({ z }) => state.zones[z.id].unlocked);
    const nCarts = Math.min(8, state.carts);
    while (carts.length < nCarts) {
      const g = mk(objectsG, '');
      const o: Obj = { el: g, depth: 0 };
      objs.push(o);
      carts.push({ g, o, key: '', loadN: 0, trip: false, t0: 0, home: '' });
    }
    carts.forEach((c, k) => {
      if (k >= nCarts) {
        c.g.setAttribute('visibility', 'hidden');
        c.o.depth = -99;
        return;
      }
      const src = open[k % open.length];
      if (c.home !== src.z.id) {
        c.home = src.z.id;
        c.trip = false;
      }
      const zone = state.zones[src.z.id];
      const st = station(src.i);
      const p0 = { x: st.x + 3.0, y: st.y + 2.7 };
      const flowing = zone.buffer > 0.05 || (working && zone.buffer < zoneCapacity(zone) - 0.01);
      if (c.trip && t - c.t0 >= CYC) c.trip = false;
      if (!c.trip && flowing) {
        // No sale otra carretilla de la misma zona hasta que la anterior se haya alejado.
        const crowded = carts.some((o, j) => j !== k && j < nCarts && o.trip && o.home === c.home && t - o.t0 < 2.2);
        if (!crowded) {
          c.trip = true;
          c.t0 = t - (CYC - TURN); // empieza girando junto al palé, donde carga
          c.loadN = Math.max(1, Math.min(3, Math.ceil((zone.buffer / zoneCapacity(zone)) * 3)));
        }
      }
      const u = c.trip ? Math.min(CYC - 1e-6, t - c.t0) : 0;
      const pose = c.trip ? cartPose(u, p0, st.x + 4.0) : { x: p0.x, y: p0.y, ang: Math.PI, phase: 3 as const };
      const dockMid = MOVE + TURN / 2;
      const midTurn = CYC - TURN / 2;
      const carrying = c.trip && (u < dockMid || u >= midTurn) ? c.loadN : 0;
      const key = `${src.z.id}|${Math.round((pose.ang * 18) / Math.PI)}|${carrying}`;
      if (key !== c.key) {
        c.key = key;
        c.g.innerHTML = forkliftIso(
          pose.ang,
          Array.from({ length: carrying }, () => propIso(src.z.id)),
        );
      }
      c.g.setAttribute('visibility', 'visible');
      c.g.setAttribute('transform', at(pose.x, pose.y));
      c.o.depth = pose.x + pose.y;
    });

    // Camión de expedición: espera en el muelle mientras se llena, y se va cuando está completo.
    if (prevCooldown >= 0 && state.truckCooldown > prevCooldown + 0.5) {
      shipPending = Math.min(2, shipPending + 1);
      pendingMoney += Math.max(0, state.totalEarned - lastEarned);
    }
    prevCooldown = state.truckCooldown;
    const load = dockLoad(state);
    if (shipPhase === 'park') {
      const target = shipPending > 0 ? 1 : Math.min(1, state.dockUnits / load);
      shipFill = target < shipFill ? target : Math.min(target, shipFill + dtv * 1.4);
      if (shipPending > 0 && shipFill >= 0.999) {
        shipPhase = 'leave';
        shipT = 0;
        shipPending--;
        if (pendingMoney > 0) pop('+$' + fmtShort(pendingMoney), 'dock');
        pendingMoney = 0;
      }
    } else {
      shipT += dtv;
      if (shipT >= 2.4) {
        shipT = 0;
        shipPhase = shipPhase === 'leave' ? 'return' : 'park';
        shipFill = 0;
      }
    }
    lastEarned = state.totalEarned;
    let tx = TRUCK_PARK_X;
    if (shipPhase === 'leave') tx = TRUCK_PARK_X + (shipT / 2.4) * 24;
    else if (shipPhase === 'return') tx = TRUCK_PARK_X - 24 + (shipT / 2.4) * 24;
    const count = shipPhase === 'leave' ? TRUCK_SLOTS : shipPhase === 'return' ? 0 : Math.round(shipFill * TRUCK_SLOTS);
    const ids = Array.from({ length: count }, (_, k) => openIds[k % openIds.length]);
    const sk = ids.join(',');
    if (sk !== shipKey) {
      shipKey = sk;
      shipTruck.innerHTML = shipTruckIso(ids);
    }
    shipTruck.setAttribute('transform', at(tx, FRONT_Y));

    // Productos que esperan en el muelle mientras no hay camión.
    const stock = shipPhase === 'park' ? 0 : Math.round(Math.min(1, state.dockUnits / load) * TRUCK_SLOTS);
    const ck = `${stock}|${openIds.join()}`;
    if (ck !== cratesKey) {
      cratesKey = ck;
      dockCrates.innerHTML = Array.from({ length: stock }, (_, k) => `<g transform="${at(TRUCK_PARK_X + (k % 3) * 0.55, DOCK_Y + 0.35 + Math.floor(k / 3) * 0.5, 0.3)}">${propIso(openIds[k % openIds.length])}</g>`).join('');
    }

    // Camión dorado.
    if (state.goldenVisible > 0) {
      const p = 1 - state.goldenVisible / ECONOMY.goldenTruck.visibleSeconds;
      golden.setAttribute('visibility', 'visible');
      golden.setAttribute('transform', at(-2 + p * 10, FRONT_Y + 1.05));
    } else golden.setAttribute('visibility', 'hidden');

    // AGV: van al final de su ruta cargados, giran, descargan y vuelven vacíos.
    agvs.forEach((r, i) => {
      const len = Math.hypot(r.x1 - r.x0, r.y1 - r.y0);
      const move = len / r.speed;
      const turn = 0.7;
      const cyc = 2 * (move + turn);
      const u = (t + i * 5.3) % cyc;
      const dir = Math.atan2(r.y1 - r.y0, r.x1 - r.x0);
      let f: number;
      let ang: number;
      let loaded: boolean;
      if (u < move) {
        f = u / move;
        ang = dir;
        loaded = true;
      } else if (u < move + turn) {
        f = 1;
        ang = dir + Math.PI * ((u - move) / turn);
        loaded = u < move + turn / 2;
      } else if (u < 2 * move + turn) {
        f = 1 - (u - move - turn) / move;
        ang = dir + Math.PI;
        loaded = false;
      } else {
        f = 0;
        ang = dir + Math.PI + Math.PI * ((u - 2 * move - turn) / turn);
        loaded = u >= 2 * move + turn + turn / 2;
      }
      const x = lerp(r.x0, r.x1, f);
      const y = lerp(r.y0, r.y1, f);
      const key = `${Math.round((ang * 18) / Math.PI)}|${loaded ? 1 : 0}`;
      if (key !== r.key) {
        r.key = key;
        r.g.innerHTML = agvIso(ang, loaded);
      }
      r.g.setAttribute('transform', at(x, y));
      r.o.depth = x + y + 0.3;
    });

    // Orden de dibujo: lo que está más al fondo, primero.
    const sorted = objs.filter((o) => o.depth > -99).sort((a, b) => a.depth - b.depth);
    const order = sorted.map((o) => objs.indexOf(o)).join(',');
    if (order !== lastDepthOrder) {
      lastDepthOrder = order;
      for (const o of sorted) objectsG.appendChild(o.el);
    }
  }

  function pop(text: string, where: 'pile' | 'dock'): void {
    if (where === 'pile') {
      pileBody.classList.remove('jiggle');
      void pileBody.getBoundingClientRect();
      pileBody.classList.add('jiggle');
      const [cx, cy] = iso(PILE.x + 1.8, PILE.y + 1.4, 1.8);
      for (let k = 0; k < 4; k++) {
        const chip = document.createElementNS(NS, 'rect');
        const a = Math.random() * Math.PI - Math.PI;
        chip.setAttribute('x', String(cx - 2));
        chip.setAttribute('y', String(cy - 2));
        chip.setAttribute('width', '5');
        chip.setAttribute('height', '5');
        chip.setAttribute('fill', ['#b5523b', '#5f7d91', '#c9a24a', '#9aa5ab'][k]);
        chip.setAttribute('class', 'chip');
        chip.setAttribute('style', `--dx:${(Math.cos(a) * 34).toFixed(0)}px;--dy:${(Math.sin(a) * 26 - 8).toFixed(0)}px`);
        pops.appendChild(chip);
        setTimeout(() => chip.remove(), 600);
      }
    }
    const [x, y] = where === 'pile' ? iso(PILE.x + 1.5, PILE.y + 1.5, 2) : iso(TRUCK_PARK_X + 1.2, FRONT_Y, 1.8);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${(x + (Math.random() - 0.5) * 30).toFixed(1)} ${y})`);
    g.innerHTML = `<text class="pop ${where === 'dock' ? 'money' : ''}" text-anchor="middle">${text}</text>`;
    pops.appendChild(g);
    setTimeout(() => g.remove(), 1100);
  }

  // ---- Cámara: arrastrar para mover, pellizcar o rueda para acercar ----
  const cam = { x: iso(4.5, 6.5)[0], y: iso(4.5, 4.8)[1], scale: 1 };
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
    cam.y = Math.min(560, Math.max(-230, cam.y));
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
