# Progreso

Diario de sesiones, la más reciente arriba.

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
