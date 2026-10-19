// Sonidos sintetizados con WebAudio (sin archivos ni recursos de terceros). Solo la interfaz los llama.
const MUTE_KEY = 'chatarrero.mute';

let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = localStorage.getItem(MUTE_KEY) === '1';
} catch {
  /* sin almacenamiento */
}

function audio(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Una nota corta: frecuencia (Hz) que puede deslizarse hasta `to`, duración en s y volumen. */
function blip(freq: number, dur: number, type: OscillatorType, vol: number, to = freq, delay = 0): void {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

export type Sfx = 'tap' | 'buy' | 'coin' | 'reward';

export function play(sfx: Sfx): void {
  if (sfx === 'tap') blip(160, 0.09, 'square', 0.08, 70);
  else if (sfx === 'buy') {
    blip(440, 0.1, 'triangle', 0.12);
    blip(660, 0.14, 'triangle', 0.12, 660, 0.08);
  } else if (sfx === 'coin') {
    blip(988, 0.08, 'square', 0.05);
    blip(1319, 0.18, 'square', 0.05, 1319, 0.07);
  } else {
    [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.16, 'triangle', 0.12, f, i * 0.09));
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    /* sin almacenamiento */
  }
}
