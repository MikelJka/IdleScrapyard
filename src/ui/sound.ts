import { isVibrationOn } from './prefs';
// Sonidos sintetizados con Web Audio: sin archivos de terceros (coste cero). Solo la interfaz los usa.
const KEY = 'chatarrero.mute';

let ctx: AudioContext | null = null;
let muted = (() => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
})();

export type Sfx = 'tap' | 'buy' | 'cash' | 'reward';

// Notas (Hz) y duración de cada sonido; el tipo de onda da el carácter.
const SFX: Record<Sfx, { notes: number[]; step: number; wave: OscillatorType; gain: number }> = {
  tap: { notes: [180, 120], step: 0.04, wave: 'square', gain: 0.08 },
  buy: { notes: [523, 659], step: 0.07, wave: 'triangle', gain: 0.14 },
  cash: { notes: [880, 1175, 1568], step: 0.06, wave: 'sine', gain: 0.14 },
  reward: { notes: [523, 659, 784, 1047], step: 0.08, wave: 'triangle', gain: 0.16 },
};

/** Vibración corta en el móvil (si el aparato lo permite). */
export function buzz(ms = 12): void {
  if (!muted && isVibrationOn()) navigator.vibrate?.(ms);
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    /* sin almacenamiento: se juega igual */
  }
}

export function play(name: Sfx): void {
  if (muted || typeof AudioContext === 'undefined') return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const def = SFX[name];
    const t0 = ctx.currentTime;
    def.notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const g = ctx!.createGain();
      const start = t0 + i * def.step;
      osc.type = def.wave;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(def.gain, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + def.step * 2);
      osc.connect(g).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + def.step * 2);
    });
  } catch {
    /* sin audio: se juega igual */
  }
}
