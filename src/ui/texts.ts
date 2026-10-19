// Textos del juego en un solo sitio, para poder sacarlo también en inglés.
const es: Record<string, string> = {
  welcomeBack: 'Mientras no estabas ({minutes} min) has ganado ${dollars}.',
  scrapRate: '{n} chatarra/s',
  pile: 'Toca la pila · {scrap} de chatarra (+{gain})',
  zoneLine: '{buffer}/{cap} · {machines} máq.',
  dock: 'Muelle',
  dockLine: '{units}/{load} para el camión',
  'buy.scrapTruck': 'Camión de chatarra',
  'buy.cart': 'Carretilla',
  'buy.dock': 'Más carga en el muelle',
  'buy.unlock': 'Abrir zona',
  'buy.speed': 'Velocidad',
  'buy.capacity': 'Capacidad',
  'buy.machines': 'Máquina extra',
  'buy.machineLevel': 'Nivel de máquina',
};

export function t(key: string, vars: Record<string, string | number> = {}): string {
  const text = es[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}
