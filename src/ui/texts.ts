// Textos del juego en un solo sitio, para poder sacarlo también en inglés.
const es: Record<string, string> = {
  welcomeBack: 'Mientras no estabas ({minutes} min) has ganado ${dollars}.',
  'buy.scrapTruck': 'Camión de chatarra',
  'buy.cart': 'Carretilla',
  'buy.dock': 'Más carga en el muelle',
  'buy.speed': 'Velocidad',
  'buy.capacity': 'Capacidad',
  'buy.machines': 'Máquina extra',
  'buy.machineLevel': 'Nivel de máquina',
  'buy.helper': 'Subir de nivel a {helper}',
  'buy.unlock': 'Abrir zona nueva',
  'shop.title': 'Mejoras',
  close: 'Cerrar',
  'transfer.title': 'Partida en otro dispositivo',
  'transfer.help': 'Copia el código aquí y pégalo en el otro dispositivo.',
  'transfer.copy': 'Copiar código',
  'transfer.paste': 'Pegar código',
  'transfer.copied': 'Código copiado. Pégalo en el otro dispositivo con «Pegar código».',
  'transfer.copyManual': 'Copia este código:',
  'transfer.pastePrompt': 'Pega aquí el código de tu otra partida:',
  'transfer.invalid': 'Ese código no es válido.',
  'transfer.confirm': 'Se sustituirá la partida de este dispositivo por la del código. ¿Seguro?',
  'sound.on': 'Silenciar',
  'sound.off': 'Activar sonido',
  'boost.short': '×2 · 30 min',
  'boost.activeShort': '×2 · {minutes} min',
  'boost.waitShort': '{minutes} min',
  'daily.short': 'Día {day}',
  'daily.doneShort': 'Mañana',
  'pass.short': 'Pase',
  'pass.ownedShort': 'Pase ✓',
  incomeRate: '{n} $/s',
  'sub.scrapTruck': 'Trae chatarra sola',
  'sub.cart': 'Lleva lo fabricado al muelle',
  'sub.dock': 'Los camiones se llevan más',
  'pass.fakeConfirm': 'Versión de prueba: ¿activar el Pase de chatarrero ({price} €) sin pagar?',
  'ad.fake': 'Anuncio de prueba…',
};

export function t(key: string, vars: Record<string, string | number> = {}): string {
  const text = es[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}
