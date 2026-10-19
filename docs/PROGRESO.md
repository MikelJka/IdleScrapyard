# Progreso

Diario de sesiones, la más reciente arriba.

## 2026-10-19 — Partida en otro dispositivo

- Mikel pregunta si la partida es multidispositivo: hasta ahora no (solo `localStorage`). Primera parte sin servidor: `src/sim/transfer.ts` convierte el guardado en un código `CHAT1:…` y lo valida al leerlo; tests en `tests/transfer.test.ts`.
- En el panel «Mejoras» hay «Copiar código» y «Pegar código» (pide confirmación, sustituye la partida y recarga; no se autoguarda encima).
- Qué probar: copiar el código en el móvil, pegarlo en el PC y ver que llega la partida.
- Siguiente: Mikel elige cómo sincronizar solo (Parte 8 en FEEDBACK.md: S1-S4).

## 2026-10-19 — Sonidos

- `src/ui/sound.ts`: efectos sintetizados con Web Audio (sin archivos ni licencias): toque en la pila, compra, cobro de un camión y recompensas (premio diario, ×2, camión dorado). Botón 🔊/🔇 en la barra de arriba; se recuerda el silencio.
- Qué probar: tocar la pila, comprar, esperar a un camión y silenciar con el botón (en el móvil el sonido empieza tras el primer toque).
- Siguiente: animación de vuelco de chatarra y pulir; después Android.

## 2026-10-19 — Vista isométrica a pantalla completa

- Mikel enseña una captura de un idle de serrería isométrico como referencia.
- `src/ui/iso.ts`: proyección isométrica y bloques de tres caras. `src/ui/yard.ts`: el desguace entero en isométrico: carretera de atrás con hasta 3 camiones de chatarra, pila que se toca, cintas que reparten la chatarra, 8 puestos en dos filas (suelo del color de la zona con línea amarilla discontinua; 1-2 máquinas según las compradas, oxidadas en nivel 0, pintadas en 1, con panel y luz en 2, doradas en 3+; el ayudante hecho de bloques con su casco, gorra, barba…; palé con cajas), carretillas por los pasillos hasta el muelle, muelle con cajas, camión de expedición en la carretera de delante, camión dorado y dinero verde que salta al cobrar. Se ordena lo que está delante y detrás en cada fotograma.
- Pantalla completa: arrastrar mueve la cámara, pellizcar o la rueda acercan; dinero arriba, botones flotantes (×2, premio diario, pase) a la derecha y «Mejoras» abajo con un contador de lo que se puede comprar, que abre un panel.
- Qué probar: la web en el móvil: moverse por el mapa, acercar, tocar la pila y abrir las mejoras.
- Siguiente: lo que diga Mikel del aspecto; sonidos; después Android.

## 2026-10-19 — La chatarrería en vista cenital inclinada

- Mikel pide una escena más bonita: plano cenital inclinado con las líneas de cada máquina, máquinas que cambian por nivel, camiones de chatarra por detrás, carretillas dentro y camiones de expedición delante.
- `src/ui/scene.ts` rehecha: carretera trasera con hasta 3 camiones de chatarra que vuelcan en la pila; tolva y cinta central que reparte la chatarra; 8 líneas en dos columnas, cada una con su suelo de color, su cinta con chatarra avanzando, su máquina (oxidada en nivel 0, pintada con franjas en nivel 1, con luces y ventana en nivel 2, con remates dorados y estrella en nivel 3 o más; «×N» con varias máquinas), su ayudante (se mueve al trabajar) y el palé con el producto; carretillas por los pasillos laterales entre los palés y el muelle; muelle de carga con cajas y camión de expedición que se va por la carretera delantera; camión dorado delante.
- Qué probar: la web en el móvil; subir el nivel de máquina del aplastado y ver cómo cambia.
- Siguiente: sonidos, monedas al cobrar y pulir; después Android.

## 2026-10-19 — Escena 2D del desguace

- Mikel cambia el 3D por 2D muy bonito y atractivo (sin pixel art).
- `src/ui/scene.ts`: escena SVG dibujada por código: cielo de atardecer con ruinas, pila de chatarra que se toca (crece con la chatarra y muestra «+1»), camión de chatarra que llega y vuelca, carretillas por el camino, muelle con cajas que se llenan, camión de expedición que se va y vuelve, las 8 zonas (cerradas con candado y precio; abiertas con su color, chimenea con humo, engranaje que gira, producto, barra del almacén y la cara de su ayudante con su nivel) y el camión dorado, que se toca en la propia escena.
- `src/ui/look.ts`: colores de cada zona y rasgos de cada ayudante (casco, gafas de soldar, barba, gorra, pañuelo, pelo de punta, casco con rayo, casco de carreras), por id.
- Tienda con tarjetas e iconos dibujados; ya no se redibuja en cada fotograma (los toques no se pierden).
- Qué probar: la web en el móvil: tocar la pila, ver moverse camiones y carretillas, abrir la segunda zona.
- Siguiente: sonidos y más animaciones; después Android (Capacitor, AdMob y Google Play).

## 2026-10-19 — Racha, empujón, camión dorado y pase

- Mikel decide: si se falta un día, la racha vuelve al día 1.
- `src/sim/game.ts`: racha de 7 días (10, 20, 30, 45, 60, 90 y 120 min de producción; sin producción no se cobra ni se gasta el día), empujón ×2 a lo que pagan los camiones durante 30 min, camión dorado cada 15 min que espera 20 s y paga ×10 lo del muelle, y Pase de chatarrero (tope fuera de 8 h). Números en `src/data/economy.json`. Tests en `tests/extras.test.ts`.
- `src/ui/ads.ts`: anuncios y compra de prueba en la web (aviso de 2 s y confirmación); con el pase, las recompensas se dan sin anuncio.
- Provisional: la espera de 30 min entre empujones y los días 2-6 de la racha (entre 10 min y 2 h).
- Qué probar: cobrar el premio diario, activar el ×2, tocar el camión dorado cuando salga y activar el pase de prueba.
- Siguiente: el dibujado 3D con Three.js y modelos CC0; después Android (Capacitor, AdMob y Google Play).

## 2026-10-19 — Los ayudantes suben de nivel

- Mikel decide la Parte 6: un nivel de ayudante cada hora de trabajo, +10 % de valor y +5 % de velocidad por nivel, máximo 25, racha de 10 min a 2 h de producción, camión dorado cada ~15 min y pase a 2,99 €.
- `src/sim/game.ts`: cada zona guarda el nivel y la experiencia de su ayudante; la experiencia sube solo mientras la zona trabaja; el nivel se compra cuando está desbloqueado. Números en `src/data/economy.json` (`helpers`); el precio de cada nivel (100 $ × escala de la zona × 1,5 por nivel) es provisional. Partidas antiguas: los ayudantes empiezan en nivel 0. Tests en `tests/game.test.ts`.
- La pantalla muestra cada ayudante con su nivel y el botón «Subir de nivel a …» cuando está listo.
- Ritmo con el jugador simulado: zona 8 a las ~104 h volviendo cada hora (antes 131 h); las 4 primeras zonas siguen en R2.
- Qué probar: jugar una hora con la zona trabajando y subir de nivel a Tuerca.
- Siguiente: la Parte 7 (qué pasa si se falta un día de la racha); después el pase, la racha, el empujón y el camión dorado, y el dibujado 3D.

## 2026-10-19 — Ocho zonas con sus personajes

- Mikel decide la Parte 5: Pase de chatarrero (compra única), racha de 7 días, empujón ×2 con anuncio, camión dorado con anuncio y más zonas antes de publicar.
- `src/data/zones.json`: 4 zonas nuevas (vigas, piezas de motor, motores y coches reconstruidos) con sus ayudantes Grúa, Pistón, Bujía y Turbo; los 8 ayudantes llevan una frase de personalidad.
- Ritmo con el jugador simulado: zona 5 a las ~18 h, zona 6 a las ~35 h, zona 7 a las ~75 h y zona 8 a las ~131 h volviendo cada hora (137 h jugando atento; 122 h cada 2 h). El ritmo de las 4 primeras no cambia.
- Aviso: a partir de la zona 5 el freno es la chatarra (los camiones de chatarra suben de precio ×1,10 y traen siempre lo mismo); los niveles de los ayudantes ayudarán.
- Qué probar: en la web, las zonas nuevas aparecen en la lista de compras al llegar a ellas.
- Siguiente: la Parte 6 del diseño (ayudantes, racha, camión dorado y precio del pase); y el dibujado 3D.

## 2026-10-19 — Pantalla principal, guardado y ganancias con el juego cerrado

- `src/ui/app.ts`: pantalla vertical provisional (sin 3D): dólares, pila de chatarra para tocar, zonas abiertas, muelle y lista de compras con botones de 44 px. Textos en `src/ui/texts.ts`.
- `src/sim/offline.ts`: guardado con marca de tiempo (localStorage cada 10 s y al salir) y simulación del tiempo cerrado con el tope de 2 h. Tests en `tests/offline.test.ts`.
- La prueba de humo ahora toca la pila y captura «jugando» (no pude ejecutarla aquí: se cuelga en el entorno; la comprobará el workflow).
- Qué probar: abrir la web en el móvil, tocar, comprar, cerrar y volver (mensaje de lo ganado).
- Siguiente: dibujado 3D con Three.js y modelos CC0; la Parte 5 sigue esperando respuesta.

## 2026-10-19 — Simulación del bucle básico y ritmo R2

- Mikel decide la Parte 4: ritmo R2, precios ×1,10, tope de 2 h fuera (ampliable con un «free pass») y ayudantes Tuerca, Chispa, Yunque y Codo.
- `src/sim/game.ts`: chatarra (toques y camiones), 4 zonas en paralelo, carretillas, muelle con camiones de expedición que salen al juntar la carga, mejoras (velocidad, capacidad, máquinas, nivel de máquina, carretillas, carga del muelle, camiones de chatarra), dólares y guardado en JSON con versión. Contenido y números en `src/data/zones.json` y `src/data/economy.json`.
- `src/sim/bot.ts`: jugador simulado que compra lo que se paga antes de poder abrir la siguiente zona. Con él se han ajustado los precios: zona 2 a los 10 min, zona 3 a los 49 min y zona 4 a las 6,1 h jugando atento; volviendo cada hora, 7,2 h; cada 2 h, 10,2 h; cada 4 h, 20 h (el tope de 2 h fuera frena).
- Supuestos provisionales (se ajustan probando): todas las zonas gastan 1 de chatarra por unidad; el nivel de máquina dobla su producción; la chatarra y las carretillas van primero a la zona que más paga.
- Qué probar: nada visible todavía; la web sigue con la pantalla de «en diseño».
- Siguiente: la pantalla principal en vertical; y la Parte 5 del diseño (free pass, premio diario, anuncios, sucesos y duración).

## 2026-10-19 — Decidida la Parte 3 del diseño

- Mikel decide: 4 zonas industriales (bloques, lingotes, chapa y tubos), ayudantes fijos con nombre y personalidad y camiones todos iguales. Resumido en «Decidido» de DISENO.md; la fase 1 pasa a «Pendiente».
- Qué probar: nada nuevo en el juego.
- Siguiente: la Parte 4 (ritmo, subida de precios, tope de lo ganado fuera y nombres); con ella empieza la fase 1.

## 2026-10-19 — Decidida la Parte 2 del diseño

- Mikel decide: la chatarra se recoge tocando y luego la traen camiones; zonas en paralelo; carretillas que llevan lo fabricado al muelle y camiones que cargan solos con suficiente stock; mejoras de velocidad, capacidad, máquinas y nivel de máquina; ayudantes que suben con experiencia y dólares y mejoran valor y velocidad. Resumido en «Decidido» de DISENO.md.
- Qué probar: nada nuevo en el juego.
- Siguiente: la Parte 3 del diseño (zonas, productos, ayudantes y camiones) en FEEDBACK.md; con ella se puede empezar la fase 1.

## 2026-10-19 — Decidida la Parte 1 del diseño

- Esqueleto subido a `main` y publicado («Probar y publicar» correcto).
- Mikel decide: tono ligero y de humor; el dólar como única moneda y la chatarra como único recurso; zonas que se desbloquean con dólares, cada una con su ayudante que da mejoras según su nivel; sin prestigio en la primera versión. Resumido en «Decidido» de DISENO.md.
- Qué probar: nada nuevo en el juego.
- Siguiente: la Parte 2 del diseño (de dónde sale la chatarra, cadena de zonas, expedición, mejoras y ayudantes) en FEEDBACK.md.

## 2026-10-19 — Nace Chatarrero, el primer juego de Zenit Studio

- Mikel crea Zenit Studio (repositorio `IdleScrapyard`) y elige empezar por un juego incremental (idle) para Android.
- Esqueleto del proyecto: Vite + TypeScript + Vitest, publicación de la versión web en GitHub Pages y capturas automáticas (rama `capturas`) para el módulo de STONKS.
- `docs/DISENO.md`: estructura genérica de un juego idle (bucle, monedas, números, retención, dónde van los anuncios). El diseño concreto se decide con Mikel en FEEDBACK.md, por partes; ya decidido: 3D con Three.js y modelos CC0 de Kenney y Quaternius, y ayudantes con nombre y rasgos que suben de nivel como lo que nos diferencia. Falta: tema, monedas y prestigio.
- Qué probar: abrir https://mikeljka.github.io/IdleScrapyard/ en el móvil; de momento es solo la pantalla de «en diseño».
- Siguiente: seguir concretando el diseño con Mikel; con lo básico decidido, la fase 1 (bucle, generadores y guardado).
