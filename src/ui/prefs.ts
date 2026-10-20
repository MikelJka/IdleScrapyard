// Preferencias de ajustes que se guardan en el aparato (vibración y reducir movimiento).
const VIBRATION_KEY = 'chatarrero.vibration';
const MOTION_KEY = 'chatarrero.calm';

function read(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}

function write(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    /* sin almacenamiento: vale para esta sesión */
  }
}

let vibration = read(VIBRATION_KEY, true);
let calm = read(MOTION_KEY, false);

export const isVibrationOn = (): boolean => vibration;
export function setVibration(value: boolean): void {
  vibration = value;
  write(VIBRATION_KEY, value);
}

/** Movimiento reducido: lo pide el sistema o lo activa el jugador en ajustes. */
export const isCalmMotion = (): boolean => calm || (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
export function setCalmMotion(value: boolean): void {
  calm = value;
  write(MOTION_KEY, value);
}
