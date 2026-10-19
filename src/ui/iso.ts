// Dibujo isométrico en SVG: proyección y bloques con tres caras (estilo low-poly, sin pixel art).

/** Medio ancho y medio alto de una baldosa, y píxeles por unidad de altura. */
export const TW = 28;
export const TH = 14;
export const TZ = 20;

export function iso(x: number, y: number, z = 0): [number, number] {
  return [(x - y) * TW, (x + y) * TH - z * TZ];
}

function pts(list: [number, number][]): string {
  return list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
}

export function shade(hex: string, f: number): string {
  if (!hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

const EDGE = 'stroke="#2a1d14" stroke-width="0.9" stroke-linejoin="round"';

/** Bloque desde (x, y, z) con tamaño w (eje x), d (eje y) y h (alto). Se ven la tapa y las caras +x y +y. */
export function block(x: number, y: number, z: number, w: number, d: number, h: number, color: string, opts: { top?: string; edge?: boolean } = {}): string {
  const e = opts.edge === false ? '' : EDGE;
  const top = pts([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)]);
  const right = pts([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)]);
  const left = pts([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)]);
  return `<polygon points="${right}" fill="${shade(color, 0.82)}" ${e}/><polygon points="${left}" fill="${shade(color, 0.66)}" ${e}/><polygon points="${top}" fill="${opts.top ?? shade(color, 1.12)}" ${e}/>`;
}

/** Rectángulo en el suelo (o a altura z). */
export function tile(x: number, y: number, w: number, d: number, attrs: string, z = 0): string {
  return `<polygon points="${pts([iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)])}" ${attrs}/>`;
}

/** Rueda vista en la cara +y (lado izquierdo de la pantalla). */
export function wheel(x: number, y: number, r = 0.22): string {
  const [cx, cy] = iso(x, y, r);
  return `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(r * TW * 0.9).toFixed(1)}" ry="${(r * TZ).toFixed(1)}" fill="#2a1d14"/><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(r * TW * 0.4).toFixed(1)}" ry="${(r * TZ * 0.45).toFixed(1)}" fill="#8a8a8a"/>`;
}
