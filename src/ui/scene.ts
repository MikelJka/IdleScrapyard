// Escena 2D del desguace dibujada con SVG por código (estilo dibujo animado, sin pixel art).
// Solo lee el estado de la simulación: la pila se toca, el resto se anima según lo que pasa.
import { ECONOMY, ZONES, dockLoad, zoneCapacity, zoneRate, type GameState, type ZoneDef } from '../sim/game';
import { HELPER_LOOKS, ZONE_LOOKS, type HelperLook } from './look';

const NS = 'http://www.w3.org/2000/svg';
const W = 400;
const H = 360;
const ROAD_Y = 172;
const DOCK_X = 300;

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

const STATIC_BACKGROUND = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff9e5e"/><stop offset="0.55" stop-color="#ffc98a"/><stop offset="1" stop-color="#ffe2b0"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9c7a52"/><stop offset="1" stop-color="#6e5236"/>
    </linearGradient>
    <radialGradient id="sun"><stop offset="0" stop-color="#fff4c2"/><stop offset="0.6" stop-color="#ffd76a"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset="0.5" stop-color="#f2b705"/><stop offset="1" stop-color="#b07d00"/></linearGradient>
  </defs>
  <rect width="${W}" height="150" fill="url(#sky)"/>
  <circle cx="330" cy="52" r="46" fill="url(#sun)"/>
  <g fill="#fff" opacity="0.7" class="clouds">
    <ellipse cx="70" cy="34" rx="26" ry="9"/><ellipse cx="88" cy="28" rx="16" ry="9"/>
    <ellipse cx="220" cy="22" rx="22" ry="7"/><ellipse cx="236" cy="18" rx="12" ry="7"/>
  </g>
  <path d="M0 118 L18 118 L18 96 L30 96 L30 108 L44 108 L44 84 L52 80 L60 84 L60 112 L80 112 L80 100 L96 92 L96 116 L120 116 L126 104 L140 104 L140 118 L170 118 L176 98 L190 98 L190 112 L210 112 L214 90 L222 90 L226 112 L250 112 L250 102 L262 102 L262 118 L400 118 L400 150 L0 150Z" fill="#c9875a" opacity="0.55"/>
  <path d="M0 132 Q60 118 120 130 T240 128 T400 126 L400 150 L0 150Z" fill="#b8784c" opacity="0.6"/>
  <rect y="146" width="${W}" height="${H - 146}" fill="url(#ground)"/>
  <rect y="${ROAD_Y - 10}" width="${W}" height="20" fill="#5b4632"/>
  <path d="M0 ${ROAD_Y} H${W}" stroke="#e8d3a8" stroke-width="2" stroke-dasharray="12 10" opacity="0.6"/>
  <g transform="translate(${DOCK_X - 26} 98)">
    <rect x="0" y="34" width="96" height="20" fill="#7a5a3a" stroke="#2a1d14" stroke-width="1.5"/>
    <rect x="4" y="0" width="88" height="36" fill="#a3825b" stroke="#2a1d14" stroke-width="1.5"/>
    <path d="M-4 2 L48 -14 L100 2Z" fill="#6b4a2b" stroke="#2a1d14" stroke-width="1.5"/>
    <text x="48" y="-1" text-anchor="middle" font-size="9" font-weight="700" fill="#ffe2b0">MUELLE</text>
  </g>`;

export interface Scene {
  el: SVGSVGElement;
  update(state: GameState): void;
  /** Animación del «+1» al tocar la pila. */
  pop(text: string): void;
}

export function createScene(): Scene {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'scene');
  svg.innerHTML = `${STATIC_BACKGROUND}
    <g id="scrap-truck">${truck('#7d8b6a', '#9fb07f', '<path d="M-32 -22 L-26 -30 L-14 -27 L-6 -32 L8 -24 L8 -22Z" fill="#8c7b6b" stroke="#2a1d14"/>')}</g>
    <g id="pile" class="tappable" role="button" aria-label="Pila de chatarra">
      <ellipse cx="80" cy="150" rx="74" ry="12" fill="#000" opacity="0.18"/>
      <g id="pile-body">
        <path d="M14 150 Q30 96 64 92 Q84 70 108 90 Q140 96 148 150Z" fill="#8a7b6c" stroke="#2a1d14" stroke-width="2"/>
        <path d="M34 124 L60 116 L58 128Z" fill="#b5523b" stroke="#2a1d14"/>
        <rect x="88" y="104" width="30" height="10" rx="2" transform="rotate(-18 103 109)" fill="#5f7d91" stroke="#2a1d14"/>
        <circle cx="76" cy="132" r="11" fill="#2a1d14"/><circle cx="76" cy="132" r="5" fill="#6d6d6d"/>
        <path d="M100 136 L126 128 L128 140 L104 146Z" fill="#c9a24a" stroke="#2a1d14"/>
        <path d="M58 100 L74 84 L80 90 L66 106Z" fill="#9aa5ab" stroke="#2a1d14"/>
        <circle cx="120" cy="116" r="6" fill="none" stroke="#2a1d14" stroke-width="2.5"/>
      </g>
      <text id="pile-count" x="80" y="166" text-anchor="middle" font-size="11" font-weight="800" fill="#fff6e0" stroke="#2a1d14" stroke-width="3" paint-order="stroke"></text>
    </g>
    <g id="pile-hint" pointer-events="none" transform="translate(80 70)">
        <rect x="-34" y="-12" width="68" height="20" rx="10" fill="#fff6e0" stroke="#2a1d14" stroke-width="1.2"/>
        <text y="2.5" text-anchor="middle" font-size="10" font-weight="800" fill="#2a1d14">¡TÓCAME!</text>
      </g>
    <g id="dock-crates"></g>
    <g id="ship-truck">${truck('#c2683a', '#e08a4f')}</g>
    <g id="carts"></g>
    <g id="zones"></g>
    <g id="golden" class="tappable" data-action="golden" visibility="hidden">
      <g id="golden-truck">${truck('url(#gold)', '#ffd34d', '<text x="-12" y="-7" text-anchor="middle" font-size="12" font-weight="900" fill="#8a5a00">$</text>')}</g>
      <g class="sparkles" fill="#fffbd1"><path d="M-40 -34 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2Z"/><path d="M28 -30 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5Z"/></g>
    </g>
    <g id="pops"></g>`;
  const q = <T extends SVGElement = SVGGElement>(id: string) => svg.querySelector<T>('#' + id)!;
  const scrapTruck = q('scrap-truck');
  const shipTruck = q('ship-truck');
  const crates = q('dock-crates');
  const carts = q('carts');
  const zonesG = q('zones');
  const golden = q('golden');
  const goldenTruck = q('golden-truck');
  const pileBody = q('pile-body');
  const pileHint = q('pile-hint');
  const pileCount = q<SVGTextElement>('pile-count');
  const pops = q('pops');

  let zonesKey = '';
  let cratesShown = -1;
  let cartsShown = -1;
  const gears: { el: SVGGElement; def: ZoneDef; angle: number }[] = [];
  const smokes: { el: SVGGElement; def: ZoneDef }[] = [];
  const bars: { el: SVGRectElement; def: ZoneDef }[] = [];
  const levels: { el: SVGTextElement; def: ZoneDef }[] = [];
  let lastTime = 0;

  function buildZones(state: GameState): void {
    gears.length = smokes.length = bars.length = levels.length = 0;
    const nextLocked = ZONES.find((z) => !state.zones[z.id].unlocked);
    zonesG.innerHTML = ZONES.map((def, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 6 + col * 97;
      const y = 192 + row * 84;
      const zone = state.zones[def.id];
      const look = ZONE_LOOKS[def.id] ?? { wall: '#999', roof: '#555' };
      if (!zone.unlocked) {
        const price = def === nextLocked ? `<text x="46" y="58" text-anchor="middle" font-size="10" font-weight="800" fill="#ffe2b0">$${fmtShort(def.unlockCost)}</text>` : '';
        return `<g transform="translate(${x} ${y})" opacity="${def === nextLocked ? 0.95 : 0.5}">
          <rect x="4" y="18" width="84" height="56" rx="4" fill="#4a3a2a" stroke="#2a1d14" stroke-width="1.5" stroke-dasharray="4 3"/>
          <g transform="translate(46 38)"><rect x="-8" y="-3" width="16" height="12" rx="2" fill="#c9a24a" stroke="#2a1d14"/><path d="M-5 -3 V-7 Q0 -13 5 -7 V-3" stroke="#2a1d14" stroke-width="2" fill="none"/></g>
          ${price}
        </g>`;
      }
      const helper = HELPER_LOOKS[def.helper.id];
      return `<g transform="translate(${x} ${y})">
        <g data-smoke="${def.id}" opacity="0">
          <circle class="puff p1" cx="72" cy="0" r="5" fill="#ddd"/><circle class="puff p2" cx="76" cy="-8" r="6" fill="#e8e8e8"/><circle class="puff p3" cx="70" cy="-16" r="7" fill="#f2f2f2"/>
        </g>
        <rect x="66" y="2" width="10" height="20" fill="#5a4a3a" stroke="#2a1d14" stroke-width="1.2"/>
        <rect x="4" y="22" width="84" height="52" rx="3" fill="${look.wall}" stroke="#2a1d14" stroke-width="1.5"/>
        <path d="M2 24 L16 10 L16 24 L30 10 L30 24 L44 10 L44 24 L58 10 L58 24 L90 24" fill="${look.roof}" stroke="#2a1d14" stroke-width="1.5" stroke-linejoin="round"/>
        <rect x="56" y="44" width="26" height="30" rx="2" fill="#3b2c20" stroke="#2a1d14" stroke-width="1.2"/>
        <g transform="translate(69 56)"><g data-gear="${def.id}">
          <path d="M0 -10 L2.5 -6 L7 -7 L6 -2.5 L10 0 L6 2.5 L7 7 L2.5 6 L0 10 L-2.5 6 L-7 7 L-6 2.5 L-10 0 L-6 -2.5 L-7 -7 L-2.5 -6Z" fill="#c9c9c9" stroke="#2a1d14" stroke-width="1"/>
          <circle r="3" fill="#6d6d6d"/></g></g>
        <text x="8" y="34" font-size="8.5" font-weight="800" fill="#fff6e0" stroke="#2a1d14" stroke-width="2.4" paint-order="stroke">${def.product.split(' ')[0]}</text>
        <g transform="translate(20 55)">${helperFace(helper)}</g>
        <g transform="translate(34 66)"><circle r="7" fill="#fff6e0" stroke="#2a1d14" stroke-width="1"/><text data-level="${def.id}" y="3" text-anchor="middle" font-size="8" font-weight="900" fill="#2a1d14">0</text></g>
        <g transform="translate(44 44)">${productIcon(def.id)}</g>
        <rect x="8" y="77" width="76" height="4" rx="2" fill="#2a1d14" opacity="0.5"/>
        <rect data-bar="${def.id}" x="8" y="77" width="0" height="4" rx="2" fill="#7ee081"/>
      </g>`;
    }).join('');
    for (const def of ZONES) {
      const gear = zonesG.querySelector<SVGGElement>(`[data-gear="${def.id}"]`);
      if (gear) gears.push({ el: gear, def, angle: 0 });
      const smoke = zonesG.querySelector<SVGGElement>(`[data-smoke="${def.id}"]`);
      if (smoke) smokes.push({ el: smoke, def });
      const bar = zonesG.querySelector<SVGRectElement>(`[data-bar="${def.id}"]`);
      if (bar) bars.push({ el: bar, def });
      const level = zonesG.querySelector<SVGTextElement>(`[data-level="${def.id}"]`);
      if (level) levels.push({ el: level, def });
    }
  }

  function update(state: GameState): void {
    const dt = Math.max(0, Math.min(0.5, state.time - lastTime));
    lastTime = state.time;
    const key = ZONES.map((z) => (state.zones[z.id].unlocked ? 1 : 0)).join('');
    if (key !== zonesKey) {
      zonesKey = key;
      buildZones(state);
    }

    // Pila: crece con la chatarra acumulada.
    const pileScale = 0.75 + Math.min(0.35, Math.log10(1 + state.scrap) / 10);
    pileBody.setAttribute('transform', `translate(80 150) scale(${pileScale.toFixed(3)}) translate(-80 -150)`);
    pileCount.textContent = `${fmtShort(state.scrap)} chatarra`;
    pileHint.setAttribute('visibility', state.scrapTrucks === 0 ? 'visible' : 'hidden');

    // Camión de chatarra: llega, vuelca y se va (ciclo de 8 s) si hay alguno comprado.
    if (state.scrapTrucks > 0) {
      const p = (state.time % 8) / 8;
      const x = p < 0.35 ? -60 + (p / 0.35) * 110 : p < 0.6 ? 50 : 50 - ((p - 0.6) / 0.4) * 140;
      const tilt = p >= 0.38 && p < 0.58 ? -14 : 0;
      scrapTruck.setAttribute('transform', `translate(${x.toFixed(1)} ${ROAD_Y + 4}) scale(-0.8 0.8) rotate(${tilt})`);
      scrapTruck.setAttribute('visibility', 'visible');
    } else scrapTruck.setAttribute('visibility', 'hidden');

    // Camión de expedición: espera en el muelle; al cargar se va y vuelve.
    const away = state.truckCooldown / ECONOMY.dock.returnSeconds;
    let tx = DOCK_X + 20;
    if (away > 0) {
      const p = 1 - away;
      tx = p < 0.5 ? DOCK_X + 20 + p * 2 * 140 : DOCK_X + 160 - (p - 0.5) * 2 * 140;
    }
    shipTruck.setAttribute('transform', `translate(${tx.toFixed(1)} ${ROAD_Y + 4}) scale(0.85)`);

    // Cajas en el muelle según lo que falta para llenar el camión.
    const fill = Math.min(1, state.dockUnits / dockLoad(state));
    const nCrates = Math.round(fill * 6);
    if (nCrates !== cratesShown) {
      cratesShown = nCrates;
      crates.innerHTML = Array.from({ length: nCrates }, (_, i) => {
        const cx = DOCK_X - 18 + (i % 3) * 15;
        const cy = 122 - Math.floor(i / 3) * 13;
        return `<rect x="${cx}" y="${cy}" width="13" height="12" rx="1.5" fill="#c58a4a" stroke="#2a1d14" stroke-width="1"/><path d="M${cx} ${cy + 6} H${cx + 13}" stroke="#2a1d14" stroke-width="0.8"/>`;
      }).join('');
    }

    // Carretillas: van y vienen por el camino mientras haya algo que llevar.
    const busy = ZONES.some((z) => state.zones[z.id].buffer > 0.5) || state.dockUnits > 0;
    const nCarts = busy ? Math.min(4, state.carts) : 0;
    if (nCarts !== cartsShown) {
      cartsShown = nCarts;
      carts.innerHTML = Array.from({ length: nCarts }, () => `<g class="cart">${FORKLIFT}</g>`).join('');
    }
    carts.querySelectorAll<SVGGElement>('.cart').forEach((c, i) => {
      const p = ((state.time / 6 + i / Math.max(1, nCarts)) % 1) * 2;
      const going = p < 1;
      const x = 150 + (going ? p : 2 - p) * (DOCK_X - 170);
      c.setAttribute('transform', `translate(${x.toFixed(1)} ${ROAD_Y + 8}) scale(${going ? 1 : -1} 1)`);
    });

    // Zonas: engranaje que gira según su ritmo, humo si trabaja y barra de almacén.
    for (const g of gears) {
      const zone = state.zones[g.def.id];
      const working = zone.buffer < zoneCapacity(zone) - 0.01 && (state.scrap > 0.01 || state.scrapTrucks > 0);
      if (working) g.angle = (g.angle + dt * (60 + Math.min(600, zoneRate(g.def, zone) * 40))) % 360;
      g.el.setAttribute('transform', `rotate(${g.angle.toFixed(1)})`);
    }
    for (const s of smokes) {
      const zone = state.zones[s.def.id];
      s.el.setAttribute('opacity', state.scrap > 0.01 || state.scrapTrucks > 0 ? (zone.buffer < zoneCapacity(zone) - 0.01 ? '1' : '0.3') : '0');
    }
    for (const b of bars) {
      const zone = state.zones[b.def.id];
      b.el.setAttribute('width', (76 * Math.min(1, zone.buffer / zoneCapacity(zone))).toFixed(1));
    }
    for (const l of levels) l.el.textContent = String(state.zones[l.def.id].helperLevel);

    // Camión dorado: cruza despacio mientras está a la vista.
    if (state.goldenVisible > 0) {
      const p = 1 - state.goldenVisible / ECONOMY.goldenTruck.visibleSeconds;
      golden.setAttribute('visibility', 'visible');
      golden.setAttribute('transform', `translate(${(70 + p * 160).toFixed(1)} ${ROAD_Y + 2})`);
      goldenTruck.setAttribute('transform', `translate(0 ${(Math.sin(state.time * 8) * 1.5).toFixed(2)})`);
    } else golden.setAttribute('visibility', 'hidden');
  }

  function pop(text: string): void {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', String(60 + Math.random() * 40));
    t.setAttribute('y', '110');
    t.setAttribute('class', 'pop');
    t.textContent = text;
    pops.appendChild(t);
    setTimeout(() => t.remove(), 900);
  }

  return { el: svg, update, pop };
}
