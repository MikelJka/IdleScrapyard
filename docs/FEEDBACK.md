# Feedback de Mikel

Escribe aquí lo que quieras, o abre una incidencia en GitHub con la etiqueta `feedback`: cada sesión la pasa a esta lista.

## Pendiente

- [ ] **Estilo visual: 3D de dibujo animado con Three.js y modelos CC0** (2026-10-19, decidido por Mikel): Three.js (gratis) con modelos gratuitos de uso comercial de Kenney y Quaternius (CC0); lo que falte, hecho por código. Cada modelo usado se apunta en `docs/CREDITOS.md`. Va con la fase 1, cuando haya escena que dibujar.

- [ ] **Base del proyecto** (2026-10-19, aprobado por Mikel al crear Zenit Studio): esqueleto con Vite + TypeScript + Vitest, publicación de la versión web en GitHub Pages y capturas automáticas para STONKS. **Hecho el esqueleto**; falta comprobar que la web publicada se ve en el móvil.

- [ ] **Fase 1 — bucle básico** (2026-10-19, diseño de las Partes 1-3 aprobado por Mikel): simulación de la chatarra (toque y camiones), la zona de aplastado con su máquina, carretillas, muelle y camiones de expedición, mejoras y dólares; después la pantalla principal y el guardado. **Hecha la simulación, la pantalla principal (sin 3D), el guardado automático y las ganancias con el juego cerrado** (2026-10-19); falta el dibujado 3D. Los ayudantes (experiencia y niveles) van después.

- [x] **Ampliación a 8 zonas con sus personajes** (2026-10-19, L2): vigas (Grúa), piezas de motor (Pistón), motores (Bujía) y coches reconstruidos (Turbo); cada ayudante con una frase de personalidad en `src/data/zones.json`. **Hecho.**

- [x] **Pase de chatarrero (P1)** (2026-10-19): compra única que quita los anuncios y sube el tope de lo ganado fuera de 2 h a 8 h. Precio: 2,99 €. **Hecho** (en la web, compra de prueba).

- [x] **Racha de 7 días (D2)** (2026-10-19): premio diario que crece durante 7 días seguidos. Premios: el día 1 da 10 min de producción y sube hasta 2 h el día 7. Si se falta un día, vuelve al día 1. **Hecho.**

- [x] **Empujón con anuncio (E1)** (2026-10-19): ×2 a la producción durante 30 min viendo un anuncio, con espera entre uno y otro.

- [x] **Camión dorado con anuncio (S1)** (2026-10-19): aparece de vez en cuando; si se toca y se ve un anuncio, paga ×10 lo que hay en el muelle. Aparece cada ~15 min y espera 20 s a que lo toques. **Hecho** (anuncio de prueba en la web).

- [x] **Ayudantes con experiencia y niveles** (2026-10-19): un nivel nuevo disponible cada hora de trabajo de su zona, que se paga en dólares; cada nivel da +10 % de valor y +5 % de velocidad; nivel máximo 25. **Hecho** en la simulación y en la pantalla.

## Propuestas para Mikel

Aquí se concreta el diseño de Chatarrero entre Mikel y Claude, por partes. La estructura genérica está en `docs/DISENO.md`. Responde con las letras (p. ej. «O2S») o con tu idea, por el chat, editando este archivo o con una incidencia `feedback`.

Nada pendiente de decidir por ahora.

## Hecho

- [x] **Parte 1 del diseño — tema y monedas** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 2 del diseño — cómo funciona la cadena** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 3 del diseño — zonas y ayudantes** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 4 del diseño — ritmo y nombres** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 5 del diseño — retención, anuncios y compras** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 6 del diseño — ayudantes, racha y pase** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 7 del diseño — racha** (2026-10-19): si se falta un día, vuelve al día 1.
