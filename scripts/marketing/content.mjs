// Textos del material de anuncio (es/en) y lista de capturas.
export const SHOTS = [
  { id: 'start', save: 'early', query: '?hora=14', wait: 3000 },
  { id: 'factory', save: 'mid', query: '?hora=14' },
  { id: 'upgrade', save: 'mid', query: '?hora=14', line: 'smelter' },
  { id: 'night', save: 'late', query: '?hora=22' },
  { id: 'away', save: 'away', query: '?hora=14', wait: 3500 },
  { id: 'empire', save: 'late', query: '?hora=17' },
];

export const CAPTIONS = {
  es: {
    start: 'Toca, aplasta y <b>cobra</b>',
    factory: 'Construye tu <b>fábrica de chatarra</b>',
    upgrade: 'Mejora <b>cada línea</b> a tu manera',
    night: 'Día y noche en <b>tu desguace</b>',
    away: 'Gana incluso con el juego <b>cerrado</b>',
    empire: '8 zonas, 8 ayudantes: tu <b>imperio</b>',
    video: ['Toca la chatarra…', 'Abre una línea y mejórala', 'Las carretillas llevan todo al muelle', 'Día y noche en tu fábrica'],
  },
  en: {
    start: 'Tap, crush and <b>get paid</b>',
    factory: 'Build your <b>scrap factory</b>',
    upgrade: 'Upgrade <b>every line</b> your way',
    night: 'Day and night in <b>your yard</b>',
    away: 'Keep earning while the game is <b>closed</b>',
    empire: '8 zones, 8 helpers: your <b>empire</b>',
    video: ['Tap the scrap…', 'Open a line and upgrade it', 'Forklifts carry everything to the dock', 'Day and night in your factory'],
  },
};

export const STORE = {
  en: {
    name: 'SCRAP EMPIRE · Idle Factory',
    heading: 'Scrap Empire: Idle Factory',
    short: 'Tap scrap, run forklifts, build a crushing, smelting and car-rebuilding empire.',
    long: [
      'Start with a pile of scrap and a tap. Crush it into blocks, smelt it into ingots, roll it into sheets, turn it into pipes, beams, engine parts, engines and rebuilt cars.',
      'Each of the 8 production lines has its own helper with a personality, its own machines that transform as you upgrade them, and its own forklifts that carry full loads to the dock. Trucks take the goods away and pay you.',
      'Day and night cycle with the real clock, a cheerful isometric scrapyard, and progress that keeps going while the game is closed. Play in short sessions, with one hand.',
    ],
  },
  es: {
    name: 'SCRAP EMPIRE · Idle Factory',
    heading: 'Scrap Empire: Idle Factory (en español)',
    short: 'Toca chatarra, mueve carretillas y levanta tu imperio de desguaces.',
    long: [
      'Empiezas con una pila de chatarra y un toque. Aplástala en bloques, fúndela en lingotes, lamínala en chapa y conviértela en tubos, vigas, piezas de motor, motores y coches reconstruidos.',
      'Cada una de las 8 líneas tiene su ayudante con personalidad, sus máquinas que se transforman al mejorarlas y sus carretillas, que llevan tandas completas al muelle. Los camiones se llevan lo producido y te pagan.',
      'Ciclo de día y noche con el reloj real, un desguace isométrico alegre y progreso que sigue con el juego cerrado. Partidas cortas y a una mano.',
    ],
  },
};
