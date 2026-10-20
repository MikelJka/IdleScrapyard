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
  if (!muted) navigator.vibrate?.(ms);
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  syncMusic();
  try {
    localStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    /* sin almacenamiento: se juega igual */
  }
}

// Música ambiental: un colchón de acordes lento y unas notas sueltas, todo sintetizado.
// Tiene su propio volumen (0 = apagada, 1 = suave, 2 = normal) y respeta el silencio general.
const MUSIC_KEY = 'chatarrero.music';
const MUSIC_GAIN = [0, 0.05, 0.1];
const BAR = 8; // segundos por compás
// Acordes (Hz) de una progresión tranquila en La menor: Am, F, C, G.
const CHORDS = [
  [110, 164.81, 220, 261.63],
  [87.31, 130.81, 174.61, 220],
  [130.81, 196, 261.63, 329.63],
  [98, 146.83, 196, 246.94],
];
const PLUCKS = [440, 523.25, 659.25, 784, 880];

let musicLevel = (() => {
  try {
    const v = Number(localStorage.getItem(MUSIC_KEY) ?? '1');
    return v === 0 || v === 2 ? v : 1;
  } catch {
    return 1;
  }
})();
let musicBus: GainNode | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let nextBar = 0;
let barIndex = 0;

export function getMusicLevel(): number {
  return musicLevel;
}

export function setMusicLevel(level: number): void {
  musicLevel = level;
  try {
    localStorage.setItem(MUSIC_KEY, String(level));
  } catch {
    /* sin almacenamiento: se juega igual */
  }
  syncMusic();
}

function scheduleBar(c: AudioContext, bus: GainNode, t0: number): void {
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.connect(bus);
  for (const freq of CHORDS[barIndex % CHORDS.length]) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.25, t0 + BAR * 0.4);
    g.gain.linearRampToValueAtTime(0.0001, t0 + BAR + 0.5);
    osc.connect(g).connect(filter);
    osc.start(t0);
    osc.stop(t0 + BAR + 0.6);
  }
  // Notas sueltas, en posiciones fijas del compás para que suene siempre igual de calmado.
  [1, 3.5, 5.5].forEach((beat, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    const start = t0 + beat;
    osc.type = 'sine';
    osc.frequency.value = PLUCKS[(barIndex * 3 + i * 2) % PLUCKS.length];
    g.gain.setValueAtTime(0.18, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + 1.6);
    osc.connect(g).connect(bus);
    osc.start(start);
    osc.stop(start + 1.7);
  });
  barIndex++;
}

/** Arranca, ajusta o para la música según el volumen y el silencio. Hay que llamarla tras un gesto del jugador. */
export function syncMusic(): void {
  if (typeof AudioContext === 'undefined') return;
  const on = !muted && musicLevel > 0;
  try {
    if (!on) {
      if (musicBus && ctx) musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      if (musicTimer) clearInterval(musicTimer);
      musicTimer = null;
      return;
    }
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const c = ctx;
    if (!musicBus) {
      musicBus = c.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(c.destination);
    }
    musicBus.gain.setTargetAtTime(MUSIC_GAIN[musicLevel], c.currentTime, 0.4);
    if (musicTimer) return;
    nextBar = c.currentTime + 0.1;
    const bus = musicBus;
    const tick = () => {
      while (nextBar < c.currentTime + BAR) {
        scheduleBar(c, bus, nextBar);
        nextBar += BAR;
      }
    };
    tick();
    musicTimer = setInterval(tick, 2000);
  } catch {
    /* sin audio: se juega igual */
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
