// Decorado de la escena: cielo, ciudad industrial de fondo y silueta de la nave en «rayos X». Solo apariencia.
import { block, cyl, iso, pts, tile } from './iso';

/** Altura de pantalla del horizonte: lo de detrás es cielo. */
export const HORIZON = -205;

/** Límites del suelo del desguace (en baldosas), usados por la nave. */
const HALL = { x0: -0.6, x1: 19.4, y0: -0.6, y1: 15.0, wall: 4.6, ridge: 6.6 };

// Generador pseudoaleatorio con semilla para que la ciudad siempre sea la misma.
function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function windows(rand: () => number, x: number, y: number, w: number, d: number, h: number, haze: number): string {
  let s = '';
  const cols = Math.max(2, Math.round(d * 2.2));
  const rows = Math.max(2, Math.round(h * 1.4));
  // Cara +y (izquierda en pantalla), con ventanas que a veces están encendidas.
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (rand() < 0.22) continue;
      const lit = rand() < 0.35;
      const u0 = x + ((i + 0.25) * w) / cols;
      const u1 = x + ((i + 0.75) * w) / cols;
      const z0 = 0.3 + (j * (h - 0.6)) / rows;
      const z1 = z0 + ((h - 0.6) / rows) * 0.55;
      const p = pts([iso(u0, y + d, z0), iso(u1, y + d, z0), iso(u1, y + d, z1), iso(u0, y + d, z1)]);
      s += `<polygon points="${p}" fill="${lit ? '#ffd76a' : '#33425a'}" opacity="${lit ? 0.9 - haze * 0.4 : 0.7}"/>`;
    }
  }
  return s;
}

/** Cielo de atardecer y suelo de fondo. */
export function skySvg(): string {
  return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f86a8"/><stop offset="0.55" stop-color="#e9b98a"/><stop offset="1" stop-color="#f6dcae"/></linearGradient></defs>
    <rect x="-4000" y="-1600" width="8000" height="${1600 + HORIZON}" fill="url(#sky)"/>
    <rect x="-4000" y="${HORIZON}" width="8000" height="6000" fill="#a8906a"/>`;
}

interface Building {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  kind: 'tower' | 'factory' | 'silo' | 'tank' | 'chimney' | 'crane';
}

/** Ciudad industrial en el horizonte: torres, naves, silos, depósitos, chimeneas con humo y grúas. */
export function citySvg(): string {
  const rand = lcg(20261019);
  const rows = [
    { c: -15.6, haze: 0.62, scale: 1.25 },
    { c: -14.4, haze: 0.4, scale: 1.1 },
    { c: -13.2, haze: 0.2, scale: 1.0 },
  ];
  const palette = ['#55627a', '#6a6f86', '#5a7280', '#7a6f7a', '#64708a'];
  let out = '';
  for (const row of rows) {
    const list: Building[] = [];
    // De izquierda a derecha de la pantalla: D = x - y.
    for (let D = -38; D < 44; D += 2.6 + rand() * 2.2) {
      const x = (row.c + D) / 2;
      const y = (row.c - D) / 2;
      const r = rand();
      const kind: Building['kind'] = r < 0.34 ? 'tower' : r < 0.58 ? 'factory' : r < 0.7 ? 'silo' : r < 0.8 ? 'tank' : r < 0.92 ? 'chimney' : 'crane';
      list.push({ x, y, w: 1.4 + rand() * 1.2, d: 1.4 + rand() * 1.2, h: (kind === 'tower' ? 3.5 + rand() * 4 : kind === 'factory' ? 1.6 + rand() * 1.2 : 3 + rand() * 1.5) * row.scale, kind });
    }
    for (const b of list) {
      const col = palette[Math.floor(rand() * palette.length)];
      const haze = (c: string) => mix(c, '#d9b48e', row.haze);
      switch (b.kind) {
        case 'tower':
          out += block(b.x, b.y, 0, b.w, b.d, b.h, haze(col)) + windows(rand, b.x, b.y, b.w, b.d, b.h, row.haze) + block(b.x + b.w * 0.3, b.y + b.d * 0.3, b.h, b.w * 0.4, b.d * 0.4, 0.4, haze('#8a8a96'));
          break;
        case 'factory': {
          out += block(b.x, b.y, 0, b.w * 1.8, b.d, b.h, haze(col)) + windows(rand, b.x, b.y, b.w * 1.8, b.d, b.h, row.haze);
          // Tejado de dientes de sierra.
          for (let k = 0; k < 3; k++) out += block(b.x + k * b.w * 0.6, b.y, b.h, b.w * 0.5, b.d, 0.35, haze('#7d6a5a'));
          break;
        }
        case 'silo':
          out += cyl(b.x + 0.5, b.y + 0.5, 0, 0.45, b.h, haze('#9aa0a8')) + cyl(b.x + 1.5, b.y + 0.5, 0, 0.45, b.h * 0.85, haze('#9aa0a8'));
          break;
        case 'tank':
          out += cyl(b.x + 0.8, b.y + 0.8, 0, 1.0, b.h * 0.45, haze('#8f6f5a'));
          break;
        case 'chimney': {
          out += block(b.x - 0.2, b.y - 0.2, 0, 1.6, 1.6, 1.0, haze(col)) + cyl(b.x + 0.6, b.y + 0.6, 1.0, 0.3, b.h * 1.2, haze('#a85a48')) + cyl(b.x + 0.6, b.y + 0.6, 1.0 + b.h * 1.1, 0.31, 0.25, haze('#e8e0d0'));
          const [sx, sy] = iso(b.x + 0.6, b.y + 0.6, 1.0 + b.h * 1.2 + 0.2);
          out += [0, 1, 2].map((k) => `<circle class="far-smoke" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${10 + k * 3}" fill="#e9dcc8" style="animation-delay:${(-k * 1.6).toFixed(1)}s"/>`).join('');
          break;
        }
        case 'crane': {
          out += block(b.x, b.y, 0, 0.3, 0.3, b.h * 1.1, haze('#d9a43a'));
          const [x0, y0] = iso(b.x + 0.15, b.y + 0.15, b.h * 1.1);
          const [x1, y1] = iso(b.x + 2.4, b.y - 0.9, b.h * 1.1);
          out += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${haze('#d9a43a')}" stroke-width="3.5"/><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${(y1 + 26).toFixed(1)}" stroke="#2a1d14" stroke-width="1.2"/><rect x="${(x1 - 4).toFixed(1)}" y="${(y1 + 26).toFixed(1)}" width="8" height="6" fill="#2a1d14"/>`;
          break;
        }
      }
    }
  }
  return out;
}

function mix(hex: string, into: string, f: number): string {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(into.slice(1), 16);
  const c = (sh: number) => Math.round(((a >> sh) & 255) * (1 - f) + ((b >> sh) & 255) * f);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

const XRAY = 'stroke="#d8f3ff" stroke-width="1.3" stroke-dasharray="7 5" fill="none"';

/** Fondo de la nave: las dos paredes del fondo como cristal tenue (se ven detrás de las máquinas). */
export function hallBackSvg(): string {
  const { x0, x1, y0, y1, wall, ridge } = HALL;
  const back = pts([iso(x0, y0, 0), iso(x1, y0, 0), iso(x1, y0, wall), iso((x0 + x1) / 2, y0, ridge + 0.4), iso(x0, y0, wall)]);
  const left = pts([iso(x0, y0, 0), iso(x0, y1, 0), iso(x0, y1, wall), iso(x0, (y0 + y1) / 2, ridge), iso(x0, y0, wall)]);
  return `<g pointer-events="none"><polygon points="${back}" fill="#cfeaff" opacity="0.1"/><polygon points="${left}" fill="#cfeaff" opacity="0.2"/>
    <polygon points="${back}" ${XRAY} opacity="0.5"/><polygon points="${left}" ${XRAY} opacity="0.5"/></g>`;
}

/** Estructura de la nave por delante (columnas, vigas y cubierta) en líneas de rayos X: se ve su forma por fuera. */
export function hallFrameSvg(): string {
  const { x0, x1, y0, y1, wall, ridge } = HALL;
  const line = (a: [number, number], b: [number, number]) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
  const ym = (y0 + y1) / 2;
  let s = '';
  // Columnas de las cuatro esquinas y cada cuatro baldosas.
  for (let x = x0; x <= x1 + 0.01; x += 5) {
    s += line(iso(x, y1, 0), iso(x, y1, wall));
    s += line(iso(x, y1, wall), iso(x, ym, ridge));
    s += line(iso(x, ym, ridge), iso(x, y0, wall));
  }
  for (let y = y0; y <= y1 + 0.01; y += 5) s += line(iso(x1, y, 0), iso(x1, y, wall));
  // Aleros y cumbrera.
  s += line(iso(x0, y1, wall), iso(x1, y1, wall));
  s += line(iso(x1, y1, wall), iso(x1, y0, wall));
  s += line(iso(x0, ym, ridge), iso(x1, ym, ridge));
  s += line(iso(x1, y1, 0), iso(x1, y0, 0));
  // Cerchas de la cubierta del lado derecho y del frente.
  s += line(iso(x1, y1, wall), iso(x1, ym, ridge));
  s += line(iso(x1, ym, ridge), iso(x1, y0, wall));
  return `<g pointer-events="none" stroke="#d8f3ff" stroke-width="1.3" stroke-dasharray="7 5" opacity="0.32" fill="none">${s}</g>`;
}

/** Sombras y manchas de aceite en el suelo para dar vida (estático). */
export function floorDetailsSvg(): string {
  const rand = lcg(77);
  let s = '';
  for (let i = 0; i < 14; i++) {
    const x = rand() * 18.5;
    const y = rand() * 14;
    s += tile(x, y, 0.5 + rand() * 0.8, 0.4 + rand() * 0.5, 'fill="#2a1d14" opacity="0.07"');
  }
  return s;
}
