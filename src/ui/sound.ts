// Sonidos sintetizados con WebAudio: sin archivos ni licencias. Solo la interfaz los usa.
const KEY = 'chatarrero.mute';

let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = localStorage.getItem(KEY) === '1';
} catch {
  /* sin almacenamiento */
}

export type Sfx = 'tap' | 'cash' | 'buy' | 'golden' | 'reward';

/** Una nota corta: frecuencia inicial y final, duración y forma de onda. */
function blip(freq: number, endFreq: number, dur: number, type: OscillatorType, vol: number, delay = 0): void {
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

export function play(sfx: Sfx): void {
  if (muted) return;
  try {
    // El navegador solo deja crear el audio tras un toque del jugador.
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    return;
  }
  if (sfx === 'tap') blip(180, 70, 0.09, 'square', 0.08);
  else if (sfx === 'cash') {
    blip(988, 988, 0.08, 'triangle', 0.1);
    blip(1319, 1319, 0.16, 'triangle', 0.1, 0.07);
  } else if (sfx === 'buy') {
    blip(440, 660, 0.12, 'sine', 0.12);
    blip(660, 880, 0.14, 'sine', 0.1, 0.1);
  } else if (sfx === 'golden') {
    [523, 659, 784, 1047].forEach((f, i) => blip(f, f, 0.2, 'triangle', 0.12, i * 0.09));
  } else {
    [440, 554, 659].forEach((f, i) => blip(f, f, 0.16, 'sine', 0.12, i * 0.08));
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    /* sin almacenamiento */
  }
}
