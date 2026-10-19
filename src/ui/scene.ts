// Escena 2D del desguace dibujada con SVG por código (estilo dibujo animado, sin pixel art).
// Solo lee el estado de la simulación: la pila se toca, el resto se anima según lo que pasa.
import { ECONOMY, ZONES, dockLoad, zoneCapacity, zoneRate, type GameState, type ZoneDef } from '../sim/game';
import { HELPER_LOOKS, ZONE_LOOKS, type HelperLook } from './look';

const NS = 'http://www.w3.org/2000/svg';
const W = 400;
const H = 600;

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

/** Cara de un ayudante centrada en (0,0), radio ~13. */
export function helperFace(look: HelperLook): string {
  const { skin, hair, gear, accessory } = look;
  const eyes = `<circle cx="-4.5" cy="-1" r="1.7" fill="#2a1d14"/><circle cx="4.5" cy="-1" r="1.7" fill="#2a1d14"/>`;
  const smile = `<path d="M-5 4 Q0 9 5 4" stroke="#2a1d14" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  const cheeks = `<circle cx="-8" cy="3" r="2.2" fill="#ff8a80" opacity="0.45"/><circle cx="8" cy="3" r="2.2" fill="#ff8a80" opacity="0.45"/>`;
  const head = `<circle r="12" fill="${skin}" stroke="#2a1d14" stroke-width="1.4"/>`;
  const hairCap = `<path d="M-12 -2 Q-12 -14 0 -14 Q12 -14 12 -2 Q6 -9 0 -9 Q-6 -9 -12 -2Z" fill="${hair}"/>`;
  let extra = '';
  switch (accessory) {
    case 'hardhat':
      extra = `<path d="M-14 -5 Q-13 -18 0 -18 Q13 -18 14 -5Z" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><rect x="-15" y="-6" width="30" height="3" rx="1.5" fill="${gear}" stroke="#2a1d14" stroke-width="1"/>
        <path d="M-13 4 q-4 4 -2 9 M13 4 q4 4 2 9" stroke="${hair}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      break;
    case 'goggles':
      extra = `${hairCap}<rect x="-12" y="-9" width="24" height="3" fill="#2a1d14"/><circle cx="-5" cy="-8" r="3.6" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><circle cx="5" cy="-8" r="3.6" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/>`;
      break;
    case 'beard':
      extra = `<path d="M-11 1 Q-12 15 0 16 Q12 15 11 1 Q6 7 0 7 Q-6 7 -11 1Z" fill="${hair}"/><path d="M-4 7 Q0 9 4 7" stroke="#2a1d14" stroke-width="1.4" fill="none"/>`;
      break;
    case 'cap':
      extra = `<path d="M-12 -4 Q-12 -15 0 -15 Q12 -15 12 -4Z" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><path d="M2 -5 L18 -4 Q17 -1 2 -2Z" fill="${gear}" stroke="#2a1d14" stroke-width="1"/><path d="M-6 5 Q0 3 6 5" stroke="${hair}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      break;
    case 'bandana':
      extra = `${hairCap}<path d="M-12 -6 Q0 -12 12 -6 L12 -3 Q0 -9 -12 -3Z" fill="${gear}"/><path d="M11 -5 l6 -3 l-1 6Z" fill="${gear}"/><circle cx="-6" cy="-7" r="0.9" fill="#fff"/><circle cx="3" cy="-8" r="0.9" fill="#fff"/>`;
      break;
    case 'spiky':
      extra = `<path d="M-12 -3 L-10 -16 L-5 -10 L-1 -19 L3 -10 L8 -17 L9 -9 L13 -12 L12 -3 Q0 -9 -12 -3Z" fill="${hair}"/><path d="M13 -6 q2 3 0 5 q-2 -2 0 -5Z" fill="#7fd3ff"/>`;
      break;
    case 'glasses':
      extra = `<path d="M-14 -5 Q-13 -18 0 -18 Q13 -18 14 -5Z" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><path d="M-2 -16 l3 0 l-2 4 l3 0 l-5 7 l1 -5 l-3 0Z" fill="#fff6b0"/>
        <circle cx="-4.5" cy="-1" r="3.6" fill="none" stroke="#2a1d14" stroke-width="1.3"/><circle cx="4.5" cy="-1" r="3.6" fill="none" stroke="#2a1d14" stroke-width="1.3"/>`;
      break;
    case 'helmet':
      extra = `<path d="M-13 2 Q-14 -17 0 -17 Q14 -17 13 2 L9 2 L9 -4 L-9 -4 L-9 2Z" fill="${gear}" stroke="#2a1d14" stroke-width="1.2"/><rect x="-2" y="-17" width="4" height="13" fill="#fff" opacity="0.85"/>`;
      break;
  }
  return `${head}${cheeks}${eyes}${smile}${extra}`;
}

/** Icono del producto de cada zona centrado en (0,0), unos 16 px. */
export function productIcon(id: string): string {
  switch (id) {
    case 'crusher':
      return `<path d="M-7 -3 L0 -7 L7 -3 L7 5 L0 9 L-7 5Z" fill="#8f8f8f" stroke="#3b3b3b"/><path d="M-7 -3 L0 1 L7 -3 M0 1 L0 9" stroke="#3b3b3b" fill="none"/>`;
    case 'smelter':
      return `<path d="M-8 4 L-5 -4 L5 -4 L8 4Z" fill="#f2c14e" stroke="#8a6410"/><path d="M-4 -2 L3 -2" stroke="#fff3c4" stroke-width="1.5"/>`;
    case 'sheet':
      return `<path d="M-9 2 L-3 -5 L9 -5 L3 2Z" fill="#b7c7d3" stroke="#4d6070"/><path d="M-9 2 L-9 4 L3 4 L3 2 M3 4 L9 -3 L9 -5" stroke="#4d6070" fill="#91a4b2"/>`;
    case 'pipes':
      return `<rect x="-8" y="-4" width="14" height="8" rx="1" fill="#7fb9ac" stroke="#2d6156"/><ellipse cx="6" cy="0" rx="2.5" ry="4" fill="#2d6156"/>`;
    case 'beams':
      return `<path d="M-9 -5 H9 V-2 H2 V2 H9 V5 H-9 V2 H-2 V-2 H-9Z" fill="#b3a6d6" stroke="#57487d"/>`;
    case 'engine-parts':
      return `<circle r="6" fill="#d98a82" stroke="#7a2f29" stroke-width="1.2"/><circle r="2.2" fill="#7a2f29"/><path d="M0 -9 V-6 M0 6 V9 M-9 0 H-6 M6 0 H9 M-6.4 -6.4 L-4.2 -4.2 M6.4 6.4 L4.2 4.2 M6.4 -6.4 L4.2 -4.2 M-6.4 6.4 L-4.2 4.2" stroke="#7a2f29" stroke-width="2.4"/>`;
    case 'engines':
      return `<rect x="-8" y="-3" width="16" height="9" rx="2" fill="#8fa8dc" stroke="#334f8a"/><rect x="-6" y="-8" width="4" height="5" fill="#8fa8dc" stroke="#334f8a"/><rect x="2" y="-8" width="4" height="5" fill="#8fa8dc" stroke="#334f8a"/>`;
    case 'cars':
      return `<path d="M-10 3 L-10 -1 L-5 -2 L-2 -6 L5 -6 L8 -2 L10 -1 L10 3Z" fill="#e8c35a" stroke="#8f6d12"/><circle cx="-5" cy="4" r="2.6" fill="#2a1d14"/><circle cx="5" cy="4" r="2.6" fill="#2a1d14"/>`;
    default:
      return '';
  }
}

export function truck(color: string, cab: string, load = ''): string {
  return `<g>
    <rect x="-34" y="-22" width="44" height="22" rx="3" fill="${color}" stroke="#2a1d14" stroke-width="1.5"/>
    ${load}
    <path d="M10 -16 L22 -16 L30 -6 L30 0 L10 0Z" fill="${cab}" stroke="#2a1d14" stroke-width="1.5"/>
    <path d="M13 -13 L21 -13 L26 -7 L13 -7Z" fill="#bfe7ff" stroke="#2a1d14" stroke-width="1"/>
    <circle cx="-22" cy="1" r="6" fill="#2a1d14"/><circle cx="-22" cy="1" r="2.4" fill="#9a9a9a"/>
    <circle cx="20" cy="1" r="6" fill="#2a1d14"/><circle cx="20" cy="1" r="2.4" fill="#9a9a9a"/>
  </g>`;
}

export const FORKLIFT = `<g>
  <rect x="-9" y="-12" width="14" height="10" rx="2" fill="#f4c430" stroke="#2a1d14" stroke-width="1.2"/>
  <path d="M-7 -12 L-7 -19 L3 -19 L3 -12" stroke="#2a1d14" stroke-width="1.6" fill="none"/>
  <path d="M6 -16 L6 -2 L12 -2" stroke="#2a1d14" stroke-width="1.8" fill="none"/>
  <rect x="7" y="-8" width="7" height="6" fill="#b07a45" stroke="#2a1d14" stroke-width="1"/>
  <circle cx="-5" cy="-1" r="3" fill="#2a1d14"/><circle cx="3" cy="-1" r="3" fill="#2a1d14"/>
</g>`;

// ---- Vista cenital inclinada: fondo (llega la chatarra), líneas de producción y muelle al frente ----

const ROW_Y0 = 194;
const ROW_DY = 76;
const BACK_ROAD_Y = 62;
const DOCK_Y = 498;
const FRONT_ROAD_Y = 566;
const AISLE_L = 18;
const AISLE_R = W - 18;
const CENTER_X = W / 2;

/** Posición de cada línea: columna (0 izquierda, 1 derecha) y fila. */
function lineSlot(index: number): { side: 0 | 1; y: number } {
  return { side: (index % 2) as 0 | 1, y: ROW_Y0 + Math.floor(index / 2) * ROW_DY };
}

/** Caja vista desde arriba y de frente: cara superior + cara frontal. (x, y) = esquina superior izquierda de la cara frontal. */
function box(x: number, y: number, w: number, h: number, d: number, top: string, front: string, extra = ''): string {
  return `<path d="M${x} ${y} L${x + 6} ${y - d} L${x + w + 6} ${y - d} L${x + w} ${y}Z" fill="${top}" stroke="#2a1d14" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M${x + w} ${y} L${x + w + 6} ${y - d} L${x + w + 6} ${y - d + h} L${x + w} ${y + h}Z" fill="${front}" opacity="0.75" stroke="#2a1d14" stroke-width="1.3" stroke-linejoin="round"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${front}" stroke="#2a1d14" stroke-width="1.3"/>${extra}`;
}

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

/** Máquina de una zona; cambia de aspecto con su nivel (0 oxidada, 1 pintada, 2 con luces, 3+ de lujo). */
function machine(id: string, level: number, count: number, mouthLeft: boolean): string {
  const look = ZONE_LOOKS[id] ?? { wall: '#999', roof: '#555' };
  const tier = Math.min(3, level);
  const w = 46 + tier * 4;
  const h = 26 + tier * 3;
  const x = -w / 2;
  const y = -h;
  const body = tier === 0 ? '#8a7a6a' : look.wall;
  const top = tier === 0 ? '#a39484' : shade(look.wall, 1.25);
  let extra = '';
  // Panel con el producto.
  const px = mouthLeft ? x + w - 23 : x + 5;
  extra += `<rect x="${px}" y="${y + 5}" width="18" height="${h - 10}" rx="2" fill="#fff3dc" stroke="#2a1d14"/><g transform="translate(${px + 9} ${y + h / 2}) scale(0.8)">${productIcon(id)}</g>`;
  // Boca de la máquina por donde entra la cinta.
  extra += `<rect x="${mouthLeft ? x + 2 : x + w - 14}" y="${y + h - 14}" width="12" height="10" rx="2" fill="#2a1d14"/>`;
  if (tier === 0) {
    extra += `<circle cx="${x + 30}" cy="${y + 8}" r="2" fill="#6b4a2b"/><circle cx="${x + 36}" cy="${y + 14}" r="1.5" fill="#6b4a2b"/>
      <rect x="${x + w - 12}" y="${y - 14}" width="5" height="12" fill="#5a4a3a" stroke="#2a1d14"/>`;
  } else {
    extra += `<path d="M${x} ${y + h - 4} h${w}" stroke="#f4c430" stroke-width="4" stroke-dasharray="5 5"/>`;
    extra += `<rect x="${x + w - 14}" y="${y - 20}" width="7" height="18" fill="${shade(look.roof, 1)}" stroke="#2a1d14"/>`;
  }
  if (tier >= 2) {
    extra += `<circle class="lamp" cx="${x + 30}" cy="${y + 8}" r="3" fill="#7ee081" stroke="#2a1d14"/><rect x="${x + 26}" y="${y + 14}" width="12" height="7" rx="1" fill="#bfe7ff" stroke="#2a1d14"/>`;
  }
  if (tier >= 3) {
    extra += `<path d="M${x} ${y} h${w}" stroke="#f2b705" stroke-width="3"/><rect x="${x + 4}" y="${y - 18}" width="7" height="16" fill="#f2b705" stroke="#2a1d14"/>
      <path d="M${x + 33} ${y - 9} l2 4 l4 0.5 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 -0.5Z" fill="#fff1a8" stroke="#8a6410" stroke-width="0.8"/>`;
  }
  const badge = count > 1 ? `<g transform="translate(${x + w + 2} ${y - 4})"><rect x="-11" y="-8" width="22" height="13" rx="6.5" fill="#2a1d14"/><text y="2" text-anchor="middle" font-size="9" font-weight="900" fill="#ffd76a">×${count}</text></g>` : '';
  const lv = level > 0 ? `<text x="${x + w / 2 + 6}" y="${y + h + 11}" text-anchor="middle" font-size="7.5" font-weight="800" fill="#fff6e0" stroke="#2a1d14" stroke-width="2.2" paint-order="stroke">Nv ${level}</text>` : '';
  return `<ellipse cx="3" cy="2" rx="${w / 2 + 6}" ry="5" fill="#000" opacity="0.2"/>${box(x, y, w, h, 9, top, body, extra)}${badge}${lv}`;
}

/** Camión visto de lado y algo desde arriba (para las carreteras). */
function sideTruck(body: string, cab: string, load = ''): string {
  return `<g>
    <ellipse cx="-2" cy="4" rx="36" ry="4" fill="#000" opacity="0.25"/>
    <path d="M-34 -22 L-30 -27 L14 -27 L10 -22Z" fill="${shade(body.startsWith('#') ? body : '#c2683a', 1.25)}" stroke="#2a1d14" stroke-width="1.2"/>
    ${truck(body, cab, load)}
  </g>`;
}

const STATIC_BACKGROUND = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff9e5e"/><stop offset="1" stop-color="#ffd59a"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a88a66"/><stop offset="1" stop-color="#c2a47e"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="0.5" stop-color="#f2b705"/><stop offset="1" stop-color="#b07d00"/></linearGradient>
    <pattern id="belt" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#3b3b3b"/><rect width="3" height="8" fill="#555"/></pattern>
  </defs>
  <rect width="${W}" height="40" fill="url(#sky)"/>
  <circle cx="340" cy="26" r="20" fill="#ffe08a" opacity="0.9"/>
  <path d="M0 40 L0 26 L14 26 L14 16 L26 16 L26 30 L40 30 L44 12 L52 12 L56 30 L90 30 L90 20 L104 20 L104 34 L150 34 L156 22 L170 22 L172 34 L230 34 L234 14 L242 14 L246 34 L300 34 L300 24 L318 24 L318 36 L400 36 L400 40Z" fill="#c9875a" opacity="0.7"/>
  <rect y="40" width="${W}" height="${H - 40}" fill="url(#floor)"/>
  <rect y="${BACK_ROAD_Y - 18}" width="${W}" height="36" fill="#5b4632"/>
  <path d="M0 ${BACK_ROAD_Y} H${W}" stroke="#e8d3a8" stroke-width="2" stroke-dasharray="12 10" opacity="0.5"/>
  <path d="M0 ${BACK_ROAD_Y + 19} H${W}" stroke="#7a6a5a" stroke-width="3"/>
  ${Array.from({ length: 21 }, (_, i) => `<path d="M${i * 20} ${BACK_ROAD_Y + 18} v8" stroke="#7a6a5a" stroke-width="2"/>`).join('')}
  ${Array.from({ length: 10 }, (_, i) => {
    const y = 160 + i * i * 4.2 + i * 18;
    return y < DOCK_Y - 20 ? `<path d="M0 ${y.toFixed(0)} H${W}" stroke="#8f7454" stroke-width="1" opacity="0.35"/>` : '';
  }).join('')}
  <rect x="${CENTER_X - 9}" y="146" width="18" height="${DOCK_Y - 170}" fill="url(#belt)" stroke="#2a1d14" stroke-width="1.2" class="main-belt"/>
  <path d="M${AISLE_L} 150 V${DOCK_Y - 6}" stroke="#f4c430" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
  <path d="M${AISLE_R} 150 V${DOCK_Y - 6}" stroke="#f4c430" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
  <g>
    ${box(8, DOCK_Y, W - 22, 22, 12, '#b39572', '#7a5a3a')}
    ${[70, 200, 330].map((x) => `<rect x="${x - 30}" y="${DOCK_Y + 3}" width="60" height="16" rx="2" fill="#3b2c20" stroke="#2a1d14"/><path d="M${x - 30} ${DOCK_Y + 7} h60 M${x - 30} ${DOCK_Y + 11} h60 M${x - 30} ${DOCK_Y + 15} h60" stroke="#5a4636" stroke-width="1"/>`).join('')}
    <text x="${CENTER_X}" y="${DOCK_Y - 2}" text-anchor="middle" font-size="9" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="2.4" paint-order="stroke">MUELLE DE CARGA</text>
  </g>
  <rect y="${FRONT_ROAD_Y - 22}" width="${W}" height="${H - FRONT_ROAD_Y + 22}" fill="#5b4632"/>
  <path d="M0 ${FRONT_ROAD_Y + 6} H${W}" stroke="#e8d3a8" stroke-width="2" stroke-dasharray="12 10" opacity="0.5"/>`;

export interface Scene {
  el: SVGSVGElement;
  update(state: GameState): void;
  /** Animación del «+1» al tocar la pila. */
  pop(text: string): void;
}

interface LineRefs {
  def: ZoneDef;
  key: string;
  g: SVGGElement;
  items: SVGGElement | null;
  pallet: SVGGElement | null;
  helper: SVGGElement | null;
  belt: SVGRectElement | null;
  palletShown: number;
}

export function createScene(): Scene {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'scene');
  const scrapLoad = '<path d="M-32 -22 L-26 -31 L-14 -27 L-6 -33 L8 -25 L8 -22Z" fill="#8c7b6b" stroke="#2a1d14"/><circle cx="-18" cy="-27" r="3" fill="#2a1d14"/>';
  svg.innerHTML = `${STATIC_BACKGROUND}
    <g id="scrap-trucks">${[0, 1, 2].map(() => `<g class="strk">${sideTruck('#7d8b6a', '#9fb07f', scrapLoad)}</g>`).join('')}</g>
    <g id="pile" class="tappable" role="button" aria-label="Pila de chatarra">
      <rect x="20" y="88" width="150" height="62" fill="transparent"/>
      <ellipse cx="96" cy="138" rx="72" ry="12" fill="#000" opacity="0.2"/>
      <g id="pile-body">
        <path d="M30 140 Q44 98 76 96 Q96 76 120 94 Q152 98 162 140Z" fill="#8a7b6c" stroke="#2a1d14" stroke-width="2"/>
        <path d="M48 120 L74 112 L72 124Z" fill="#b5523b" stroke="#2a1d14"/>
        <rect x="100" y="104" width="30" height="10" rx="2" transform="rotate(-18 115 109)" fill="#5f7d91" stroke="#2a1d14"/>
        <circle cx="90" cy="126" r="10" fill="#2a1d14"/><circle cx="90" cy="126" r="4.5" fill="#6d6d6d"/>
        <path d="M114 130 L140 122 L142 134 L118 140Z" fill="#c9a24a" stroke="#2a1d14"/>
        <path d="M70 102 L86 86 L92 92 L78 108Z" fill="#9aa5ab" stroke="#2a1d14"/>
        <circle cx="134" cy="110" r="6" fill="none" stroke="#2a1d14" stroke-width="2.5"/>
      </g>
      <text id="pile-count" x="96" y="156" text-anchor="middle" font-size="11" font-weight="800" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke"></text>
    </g>
    <g id="pile-hint" pointer-events="none" transform="translate(96 84)">
      <rect x="-34" y="-12" width="68" height="20" rx="10" fill="#fff6e0" stroke="#2a1d14" stroke-width="1.2"/>
      <text y="2.5" text-anchor="middle" font-size="10" font-weight="800" fill="#2a1d14">¡TÓCAME!</text>
    </g>
    <g transform="translate(${CENTER_X} 146)">${box(-22, -4, 44, 14, 8, '#6d6d6d', '#4a4a4a', '<text x="0" y="7" text-anchor="middle" font-size="7" font-weight="900" fill="#ffd76a">TOLVA</text>')}</g>
    <g id="lines"></g>
    <g id="carts"></g>
    <g id="dock-crates"></g>
    <g id="ship-truck"></g>
    <g id="golden" class="tappable" data-action="golden" visibility="hidden">
      <g id="golden-truck">${sideTruck('url(#gold)', '#ffd34d', '<text x="-12" y="-7" text-anchor="middle" font-size="12" font-weight="900" fill="#8a5a00">$</text>')}</g>
      <g class="sparkles" fill="#fffbd1"><path d="M-40 -34 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2Z"/><path d="M28 -30 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5Z"/></g>
    </g>
    <g id="pops"></g>`;
  const q = <T extends SVGElement = SVGGElement>(id: string) => svg.querySelector<T>('#' + id)!;
  const scrapTrucks = Array.from(q('scrap-trucks').querySelectorAll<SVGGElement>('.strk'));
  const shipTruck = q('ship-truck');
  const crates = q('dock-crates');
  const carts = q('carts');
  const linesG = q('lines');
  const golden = q('golden');
  const goldenTruck = q('golden-truck');
  const pileBody = q('pile-body');
  const pileHint = q('pile-hint');
  const pileCount = q<SVGTextElement>('pile-count');
  const pops = q('pops');

  const lines: LineRefs[] = ZONES.map((def, i) => {
    const g = document.createElementNS(NS, 'g');
    const { side, y } = lineSlot(i);
    g.setAttribute('transform', `translate(0 ${y})`);
    g.dataset.side = String(side);
    linesG.appendChild(g);
    return { def, key: '', g, items: null, pallet: null, helper: null, belt: null, palletShown: -1 };
  });
  let cratesShown = -1;
  let cartsShown = -1;
  let truckKey = '';

  /** Dibuja una línea: suelo de su color, cinta desde la cinta central, máquina, ayudante y palé. */
  function buildLine(l: LineRefs, state: GameState, index: number): void {
    const zone = state.zones[l.def.id];
    const side = index % 2;
    const look = ZONE_LOOKS[l.def.id] ?? { wall: '#999', roof: '#555' };
    const nextLocked = ZONES.find((z) => !state.zones[z.id].unlocked);
    // En la columna izquierda la línea va de la cinta central hacia la izquierda; en la derecha, al revés (espejo).
    const flip = side === 0 ? '' : ` transform="translate(${W} 0) scale(-1 1)"`;
    if (!zone.unlocked) {
      const isNext = l.def === nextLocked;
      l.g.innerHTML = `<g${flip}><rect x="34" y="-34" width="${CENTER_X - 48}" height="62" rx="6" fill="#000" opacity="0.12" stroke="#2a1d14" stroke-width="1.2" stroke-dasharray="5 4"/></g>
        <g transform="translate(${side === 0 ? 108 : W - 108} -6)" opacity="${isNext ? 1 : 0.55}">
          <rect x="-9" y="-4" width="18" height="13" rx="2" fill="#c9a24a" stroke="#2a1d14"/><path d="M-5.5 -4 V-8 Q0 -14 5.5 -8 V-4" stroke="#2a1d14" stroke-width="2" fill="none"/>
          ${isNext ? `<text y="22" text-anchor="middle" font-size="10" font-weight="900" fill="#fff6e0" stroke="#2a1d14" stroke-width="2.6" paint-order="stroke">${l.def.name} · $${fmtShort(l.def.unlockCost)}</text>` : ''}
        </g>`;
      l.items = l.pallet = l.helper = null;
      l.belt = null;
      return;
    }
    const helperLook = HELPER_LOOKS[l.def.helper.id];
    // Posición en x reflejada para la columna derecha (sin reflejar dibujos ni textos).
    const mx = (x: number) => (side === 0 ? x : W - x);
    l.g.innerHTML = `<g${flip}>
        <rect x="34" y="-34" width="${CENTER_X - 48}" height="62" rx="6" fill="${look.wall}" opacity="0.22" stroke="${look.roof}" stroke-width="1.5"/>
        <rect class="belt" x="96" y="-10" width="${CENTER_X - 105}" height="10" fill="url(#belt)" stroke="#2a1d14" stroke-width="1.2"/>
        <g class="items"></g>
      </g>
      <g transform="translate(${mx(76)} 0)">${machine(l.def.id, zone.machineLevel, zone.machines, side === 1)}</g>
      <g class="pallet" transform="translate(${mx(AISLE_L + 22)} 4)"></g>
      <g class="helper" transform="translate(${mx(120)} 18)"><g>
        <path d="M-7 14 Q-8 2 0 2 Q8 2 7 14Z" fill="${helperLook.gear}" stroke="#2a1d14" stroke-width="1.2"/>
        <g transform="translate(0 -6) scale(0.7)">${helperFace(helperLook)}</g>
        <g transform="translate(9 -12)"><circle r="6" fill="#fff6e0" stroke="#2a1d14"/><text class="hl" y="2.6" text-anchor="middle" font-size="7.5" font-weight="900" fill="#2a1d14">${zone.helperLevel}</text></g>
      </g></g>`;
    l.items = l.g.querySelector('.items');
    l.pallet = l.g.querySelector('.pallet');
    l.helper = l.g.querySelector('.helper');
    l.belt = l.g.querySelector('.belt');
    l.palletShown = -1;
  }

  function update(state: GameState): void {
    const t = state.time;
    const nextLocked = ZONES.find((z) => !state.zones[z.id].unlocked)?.id ?? '';
    const working = state.scrap > 0.01 || state.scrapTrucks > 0;

    // Pila de chatarra: crece con lo acumulado.
    const pileScale = 0.8 + Math.min(0.3, Math.log10(1 + state.scrap) / 10);
    pileBody.setAttribute('transform', `translate(96 140) scale(${pileScale.toFixed(3)}) translate(-96 -140)`);
    pileCount.textContent = `${fmtShort(state.scrap)} chatarra`;
    pileHint.setAttribute('visibility', state.scrapTrucks === 0 ? 'visible' : 'hidden');

    // Camiones de chatarra por la carretera de atrás: llegan, vuelcan en la pila y se van.
    const nTrucks = Math.min(3, state.scrapTrucks);
    scrapTrucks.forEach((g, i) => {
      if (i >= nTrucks) {
        g.setAttribute('visibility', 'hidden');
        return;
      }
      const p = ((t / 9 + i / nTrucks) % 1);
      const x = p < 0.35 ? -50 + (p / 0.35) * 170 : p < 0.55 ? 120 : 120 + ((p - 0.55) / 0.45) * 340;
      const tilt = p >= 0.38 && p < 0.52 ? -12 : 0;
      g.setAttribute('visibility', 'visible');
      g.setAttribute('transform', `translate(${x.toFixed(1)} ${BACK_ROAD_Y + 6}) scale(0.62) rotate(${tilt} -10 0)`);
    });

    // Líneas de producción.
    lines.forEach((l, i) => {
      const zone = state.zones[l.def.id];
      const key = `${zone.unlocked ? 1 : 0}-${zone.machineLevel}-${zone.machines}-${l.def.id === nextLocked ? 1 : 0}`;
      if (key !== l.key) {
        l.key = key;
        buildLine(l, state, i);
      }
      if (!zone.unlocked) return;
      const full = zone.buffer >= zoneCapacity(zone) - 0.01;
      const running = working && !full;
      l.belt?.classList.toggle('run', running);
      l.helper?.classList.toggle('busy', running);
      const hl = l.helper?.querySelector('.hl');
      if (hl && hl.textContent !== String(zone.helperLevel)) hl.textContent = String(zone.helperLevel);
      // Trozos de chatarra avanzando por la cinta hacia la máquina.
      if (l.items) {
        const n = running ? 3 : 0;
        if (l.items.childElementCount !== n)
          l.items.innerHTML = Array.from({ length: n }, () => `<rect width="6" height="5" rx="1" fill="#9a8a7a" stroke="#2a1d14" stroke-width="0.8"/>`).join('');
        const speed = 0.35 + Math.min(1.5, zoneRate(l.def, zone) * 0.1);
        Array.from(l.items.children).forEach((c, k) => {
          const p = ((t * speed + k / n) % 1);
          c.setAttribute('transform', `translate(${(CENTER_X - 14 - p * (CENTER_X - 112)).toFixed(1)} -11)`);
        });
      }
      // Palé con el producto terminado esperando a las carretillas.
      const stack = Math.ceil(Math.min(1, zone.buffer / zoneCapacity(zone)) * 4);
      if (l.pallet && stack !== l.palletShown) {
        l.palletShown = stack;
        l.pallet.innerHTML = `<rect x="-14" y="2" width="28" height="6" fill="#b07a45" stroke="#2a1d14"/>` +
          Array.from({ length: stack }, (_, k) => `<g transform="translate(${(k % 2) * 12 - 6} ${-2 - Math.floor(k / 2) * 9}) scale(0.7)">${productIcon(l.def.id)}</g>`).join('');
      }
    });

    // Carretillas: bajan por los pasillos laterales desde los palés hasta el muelle y vuelven.
    const open = ZONES.map((z, i) => ({ i, z })).filter(({ z }) => state.zones[z.id].unlocked);
    const busy = open.some(({ z }) => state.zones[z.id].buffer > 0.5) || state.dockUnits > 0;
    const nCarts = busy ? Math.min(6, state.carts) : 0;
    if (nCarts !== cartsShown) {
      cartsShown = nCarts;
      carts.innerHTML = Array.from({ length: nCarts }, () => `<g class="cart">${FORKLIFT}</g>`).join('');
    }
    carts.querySelectorAll<SVGGElement>('.cart').forEach((c, k) => {
      const src = open[k % open.length];
      const { side, y } = lineSlot(src.i);
      const x = side === 0 ? AISLE_L : AISLE_R;
      const p = ((t / 7 + k * 0.37) % 1) * 2;
      const down = p < 1;
      const yy = y + 10 + (down ? p : 2 - p) * (DOCK_Y - 14 - (y + 10));
      // Mirando hacia el centro del almacén; baja cargada y sube vacía.
      c.setAttribute('transform', `translate(${x} ${yy.toFixed(1)}) scale(${side === 0 ? 0.9 : -0.9} 0.9)`);
      c.classList.toggle('empty', !down);
    });

    // Cajas en el muelle según lo que falta para llenar el camión.
    const fill = Math.min(1, state.dockUnits / dockLoad(state));
    const nCrates = Math.round(fill * 8);
    if (nCrates !== cratesShown) {
      cratesShown = nCrates;
      crates.innerHTML = Array.from({ length: nCrates }, (_, k) => {
        const cx = CENTER_X + 46 + (k % 4) * 15;
        const cy = DOCK_Y - 14 - Math.floor(k / 4) * 11;
        return box(cx, cy, 12, 10, 4, '#e0a868', '#c58a4a');
      }).join('');
    }

    // Camión de expedición al frente: espera en el muelle, se va cargado y vuelve.
    const size = Math.min(1.25, 0.85 + state.dockLevel * 0.02);
    const tk = size.toFixed(2);
    if (tk !== truckKey) {
      truckKey = tk;
      shipTruck.innerHTML = sideTruck('#c2683a', '#e08a4f');
    }
    const away = state.truckCooldown / ECONOMY.dock.returnSeconds;
    let tx = CENTER_X;
    if (away > 0) {
      const p = 1 - away;
      tx = p < 0.5 ? CENTER_X + p * 2 * 260 : CENTER_X - 260 + (p - 0.5) * 2 * 260;
    }
    shipTruck.setAttribute('transform', `translate(${tx.toFixed(1)} ${FRONT_ROAD_Y}) scale(${tk})`);

    // Camión dorado: cruza despacio por delante mientras está a la vista.
    if (state.goldenVisible > 0) {
      const p = 1 - state.goldenVisible / ECONOMY.goldenTruck.visibleSeconds;
      golden.setAttribute('visibility', 'visible');
      golden.setAttribute('transform', `translate(${(40 + p * 120).toFixed(1)} ${FRONT_ROAD_Y + 18})`);
      goldenTruck.setAttribute('transform', `translate(0 ${(Math.sin(t * 8) * 1.5).toFixed(2)})`);
    } else golden.setAttribute('visibility', 'hidden');
  }

  function pop(text: string): void {
    const el = document.createElementNS(NS, 'text');
    el.setAttribute('x', String(70 + Math.random() * 50));
    el.setAttribute('y', '110');
    el.setAttribute('class', 'pop');
    el.textContent = text;
    pops.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  return { el: svg, update, pop };
}
