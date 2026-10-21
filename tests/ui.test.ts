import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZONES } from '../src/sim/game';
import { esc, helperFace, inlineIcon, productIcon, uiIcon, type UiIconName } from '../src/ui/icons';
import { iso, pts, shade, TH, TW, TZ } from '../src/ui/iso';
import { HELPER_LOOKS, ZONE_LOOKS } from '../src/ui/look';
import { readFlag, writeFlag } from '../src/ui/prefs';
import { t } from '../src/ui/texts';

const ICONS: UiIconName[] = ['trophy', 'gear', 'sound-on', 'sound-off', 'timer', 'ad', 'hourglass', 'gift', 'star', 'target', 'finger', 'coin', 'cart', 'check', 'warning', 'medal'];

describe('proyección isométrica', () => {
  it('el origen es (0,0) y cada eje avanza media baldosa', () => {
    expect(iso(0, 0)).toEqual([0, 0]);
    expect(iso(1, 0)).toEqual([TW, TH]);
    expect(iso(0, 1)).toEqual([-TW, TH]);
  });
  it('subir en z solo mueve hacia arriba', () => {
    expect(iso(2, 3, 1)).toEqual([iso(2, 3)[0], iso(2, 3)[1] - TZ]);
  });
  it('pts formatea con un decimal', () => {
    expect(pts([[1, 2], [3.14159, 4]])).toBe('1.0,2.0 3.1,4.0');
  });
  it('shade oscurece y deja intactos los colores que no son hex', () => {
    expect(shade('#ffffff', 0.5)).toBe('rgb(128,128,128)');
    expect(shade('#fff', 1)).toMatch(/^rgb\(/);
    expect(shade('red', 0.5)).toBe('red');
    expect(shade('#ffffff', 2)).toBe('rgb(255,255,255)');
  });
});

describe('iconos', () => {
  it('esc escapa lo que rompería el HTML', () => {
    expect(esc('<b a="1">\'')).not.toMatch(/[<>"']/);
    expect(esc('<script>')).toBe('&#60;script&#62;');
  });
  it('cada icono de interfaz es un SVG con su clase', () => {
    for (const name of ICONS) {
      const svg = uiIcon(name);
      expect(svg, name).toContain('<svg');
      expect(svg, name).toContain('class="uiicon"');
    }
  });
  it('inlineIcon escapa el texto y marca el icono como en línea', () => {
    const html = inlineIcon('coin', '<x>');
    expect(html).toContain('uiicon inline');
    expect(html).toContain('&#60;x&#62;');
    expect(html).not.toContain('<x>');
  });
  it('cada zona tiene aspecto, icono de producto y cara de ayudante', () => {
    for (const z of ZONES) {
      expect(ZONE_LOOKS[z.id], `look de ${z.id}`).toBeDefined();
      expect(HELPER_LOOKS[z.helper.id], `cara de ${z.helper.id}`).toBeDefined();
      expect(productIcon(z.id).length, `producto de ${z.id}`).toBeGreaterThan(0);
      expect(helperFace(HELPER_LOOKS[z.helper.id]).length).toBeGreaterThan(0);
    }
  });
});

describe('textos con variables', () => {
  it('una clave desconocida se devuelve tal cual', () => {
    expect(t('no.existe.esta.clave')).toBe('no.existe.esta.clave');
  });
});

describe('preferencias', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('sin almacenamiento usa el valor por defecto y no falla', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(readFlag('k', true)).toBe(true);
    expect(() => writeFlag('k', true)).not.toThrow();
  });
  it('guarda y lee un interruptor', () => {
    const data = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) });
    expect(readFlag('k', false)).toBe(false);
    writeFlag('k', true);
    expect(readFlag('k', false)).toBe(true);
    writeFlag('k', false);
    expect(readFlag('k', true)).toBe(false);
  });
});
