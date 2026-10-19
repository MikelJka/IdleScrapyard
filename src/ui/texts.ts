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
  'buy.helper': 'Subir de nivel a {helper}',
  helperLine: '{helper} · nivel {level}',
  'daily.claim': '🎁 Premio diario · día {day} de 7',
  'daily.done': '🎁 Vuelve mañana: día {day} de 7',
  'boost.ready': '📺 ×2 a lo que pagan los camiones · 30 min',
  'boost.active': '×2 activo · quedan {minutes} min',
  'boost.wait': '×2 disponible en {minutes} min',
  'golden.claim': '🚚✨ ¡Camión dorado! ×10 lo del muelle ({seconds} s)',
  'pass.buy': '⭐ Pase de chatarrero · sin anuncios y 8 h fuera · {price} €',
  'pass.owned': '⭐ Pase de chatarrero activo',
  'pass.fakeConfirm': 'Versión de prueba: ¿activar el Pase de chatarrero ({price} €) sin pagar?',
  'ad.fake': 'Anuncio de prueba…',
};

export function t(key: string, vars: Record<string, string | number> = {}): string {
  const text = es[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}
