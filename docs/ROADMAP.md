# Roadmap de Chatarrero

Cada sesión toma la primera tarea sin marcar de la fase actual que esté aprobada en «Pendiente» de `FEEDBACK.md`. Una fase solo termina cuando se cumple su criterio de «terminado». Las fases 1 en adelante se concretarán con el diseño que se decida en FEEDBACK.md.

## Fase 0 — Base del proyecto

Terminado: la URL pública muestra la pantalla del juego en el móvil y en PC, las capturas llegan a la rama `capturas` y el diseño está decidido.

- [x] Proyecto Vite + TypeScript estricto + Vitest
- [x] Publicación automática en GitHub Pages y capturas de la prueba de humo
- [x] Estructura genérica de juego idle (`docs/DISENO.md`)
- [x] Estilo visual decidido con Mikel (2D de dibujo animado, SVG por código)
- [x] Diseño concreto decidido con Mikel en FEEDBACK.md (Partes 1-7)
- [ ] Comprobar en la URL pública que se ve bien en el móvil (lo confirma Mikel)

## Fase 1 — Bucle básico

Terminado: puedo tocar para ganar, comprar los primeros generadores y ver crecer la moneda; la partida se guarda.

- [x] Simulación: chatarra, zonas, carretillas, muelle, camiones, mejoras y dólares
- [x] Pantalla principal en vertical (primera versión en DOM, sin 3D todavía)
- [x] Guardado automático
- [x] Ganancias con el juego cerrado
- [x] Escena 2D del desguace en la pantalla principal

## Fase 2 — Contenido de la primera versión

Terminado: la primera versión se juega de principio a fin y engancha a Mikel.

- [x] Ocho zonas con sus productos y mejoras
- [x] Ayudantes con experiencia y niveles
- [x] Retención: racha de 7 días, empujón ×2 y camión dorado
- [x] Pase de chatarrero (en la web, de prueba)
- [x] Sonidos (sintetizados, con botón de silencio)
- [x] Más animaciones (vuelco de chatarra, máquinas trabajando, coches, ciudad de fondo, nave en rayos X)
- [x] Panel de mejoras por línea (se toca el puesto), estado y cuello de botella a la vista, huellas de salida por producto, focos de noche y máquinas que se transforman cada 5 niveles
- [ ] Ranking mundial (a decidir: Parte 12 de FEEDBACK.md)
- [ ] Equilibrio: ajustar precios jugando de verdad (precios de los ayudantes y espera del empujón provisionales)
- Prestigio: no en la primera versión (decidido por Mikel)

## Fase 2b — Calidad profesional

Terminado: el juego se ve, suena y se siente como un título de estudio grande, no de aficionado (orden de Mikel, 2026-10-19: «que sea un videojuego profesional y no parezca tan indie»). Cada sesión toma la primera tarea sin marcar.

- [x] Pantalla de carga con logo, icono, manifest e iconos de la web
- [x] Vibración en toques y compras
- [x] Contador de fotogramas (`?fps=1`) para medir el parpadeo
- [x] Objetivo a la vista, logros con aviso y lista en ajustes
- [x] Hito cada 5 niveles de máquina con premio
- [x] Ranking mundial: código listo (Firebase); falta que Mikel cree el proyecto (`docs/RANKING.md`)
- [ ] Tutorial de los primeros 2 minutos: flechas y mensajes que guían (tocar la pila, comprar, abrir un puesto, abrir la segunda zona)
- [ ] Interfaz coherente: iconos SVG propios en lugar de emojis, tipografía y botones con relieve en todo, paneles con transición, cifras que cuentan hacia arriba
- [ ] «Juice»: monedas que vuelan al contador al cobrar, números flotantes por camión, destello al comprar, temblor suave al abrir una zona
- [ ] Apertura de zona animada (se levanta el andamio y entra la máquina)
- [ ] Logística visible (L1): las carretillas sueltan su producto en su huella y el camión se llena de las huellas
- [ ] Música ambiental sintetizada (suave, con volumen propio) y sonidos por tipo de línea
- [ ] Ajustes completos: música, efectos, vibración, idioma, calidad gráfica (baja/alta), reducir movimiento
- [ ] Rendimiento: ocultar lo que queda fuera de cámara, animar solo las líneas visibles, modo «calidad baja»; pasar lo animado a canvas si el contador lo pide (Parte 13)
- [ ] Iluminación y sombras suaves en toda la escena, no solo de noche (degradados, ambient occlusion falso bajo las máquinas)
- [ ] Estadísticas del jugador (tiempo jugado, camiones, mejor racha) en ajustes
- [ ] Accesibilidad: texto más grande, alto contraste, no depender solo del color (iconos en los estados), reducir movimiento
- [ ] Textos en inglés con selector de idioma
- [ ] Equilibrio con el bot: tabla de tiempos por zona y grado de máquina, propuesta de números para Mikel
- [ ] Pruebas: la prueba de humo comprueba el panel por línea, el ranking apagado y la noche; tests de interfaz sencillos

## Fase 3 — Android y monetización

Terminado: el juego está en la prueba cerrada de Google Play con anuncios de prueba funcionando.

- [ ] Empaquetar con Capacitor y generar el archivo para Google Play en GitHub Actions
- [x] Anuncios y compras decididos (empujón, camión dorado, pase a 2,99 €)
- [ ] Anuncios reales con AdMob y compra del pase con Google Play Billing
- [ ] Consentimiento de anuncios (UE) y política de privacidad
- [ ] Textos en inglés
- [ ] Ficha de la tienda: textos, icono y capturas

## Fase 4 — Publicación

Terminado: Chatarrero está publicado en Google Play.

- [ ] Prueba cerrada de 14 días con 12 personas (o cuenta de empresa)
- [ ] Arreglar lo que salga en la prueba
- [ ] Publicar
