# Progreso

Diario de sesiones, la más reciente arriba.

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
