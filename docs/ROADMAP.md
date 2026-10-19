# Roadmap de Chatarrero

Cada sesión toma la primera tarea sin marcar de la fase actual que esté aprobada en «Pendiente» de `FEEDBACK.md`. Una fase solo termina cuando se cumple su criterio de «terminado». Las fases 1 en adelante se concretarán con el diseño que se decida en FEEDBACK.md.

## Fase 0 — Base del proyecto

Terminado: la URL pública muestra la pantalla del juego en el móvil y en PC, las capturas llegan a la rama `capturas` y el diseño está decidido.

- [x] Proyecto Vite + TypeScript estricto + Vitest
- [x] Publicación automática en GitHub Pages y capturas de la prueba de humo
- [x] Estructura genérica de juego idle (`docs/DISENO.md`)
- [x] Estilo visual decidido con Mikel (3D con Three.js y modelos CC0)
- [x] Diseño concreto decidido con Mikel en FEEDBACK.md (Partes 1-7)
- [ ] Comprobar en la URL pública que se ve bien en el móvil (lo confirma Mikel)

## Fase 1 — Bucle básico

Terminado: puedo tocar para ganar, comprar los primeros generadores y ver crecer la moneda; la partida se guarda.

- [x] Simulación: chatarra, zonas, carretillas, muelle, camiones, mejoras y dólares
- [x] Pantalla principal en vertical (primera versión en DOM, sin 3D todavía)
- [x] Guardado automático
- [x] Ganancias con el juego cerrado
- [ ] Dibujado 3D con Three.js y modelos CC0 de la pantalla principal

## Fase 2 — Contenido de la primera versión

Terminado: la primera versión se juega de principio a fin y engancha a Mikel.

- [x] Ocho zonas con sus productos y mejoras
- [x] Ayudantes con experiencia y niveles
- [x] Retención: racha de 7 días, empujón ×2 y camión dorado
- [x] Pase de chatarrero (en la web, de prueba)
- [ ] Aspecto y sonidos (con el dibujado 3D)
- [ ] Equilibrio: ajustar precios jugando de verdad (precios de los ayudantes y espera del empujón provisionales)
- Prestigio: no en la primera versión (decidido por Mikel)

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
