// Preferencias de ajustes guardadas en el aparato (solo interfaz, no son parte de la partida).
const CALM_KEY = 'chatarrero.calm';

/** Lee un interruptor guardado; sin valor guardado devuelve el de por defecto. */
export function readFlag(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}

export function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    /* sin almacenamiento: vale para esta sesión */
  }
}

/** «Reducir movimiento»: lo elegido en ajustes o, si no se ha tocado, lo que pide el sistema. */
export function reducedMotion(): boolean {
  return readFlag(CALM_KEY, window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
}

export function setReducedMotion(value: boolean): void {
  writeFlag(CALM_KEY, value);
}
