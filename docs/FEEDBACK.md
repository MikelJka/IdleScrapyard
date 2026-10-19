# Feedback de Mikel

Escribe aquí lo que quieras, o abre una incidencia en GitHub con la etiqueta `feedback`: cada sesión la pasa a esta lista.

## Pendiente

- [ ] **Estilo visual: 3D de dibujo animado con Three.js y modelos CC0** (2026-10-19, decidido por Mikel): Three.js (gratis) con modelos gratuitos de uso comercial de Kenney y Quaternius (CC0); lo que falte, hecho por código. Cada modelo usado se apunta en `docs/CREDITOS.md`. Va con la fase 1, cuando haya escena que dibujar.

- [ ] **Base del proyecto** (2026-10-19, aprobado por Mikel al crear Zenit Studio): esqueleto con Vite + TypeScript + Vitest, publicación de la versión web en GitHub Pages y capturas automáticas para STONKS. **Hecho el esqueleto**; falta comprobar que la web publicada se ve en el móvil.

- [ ] **Fase 1 — bucle básico** (2026-10-19, diseño de las Partes 1-3 aprobado por Mikel): simulación de la chatarra (toque y camiones), la zona de aplastado con su máquina, carretillas, muelle y camiones de expedición, mejoras y dólares; después la pantalla principal y el guardado. Empieza en cuanto esté decidida la Parte 4 (ritmo y nombres).

## Propuestas para Mikel

Aquí se concreta el diseño de Chatarrero entre Mikel y Claude, por partes. La estructura genérica está en `docs/DISENO.md`. Responde con las letras (p. ej. «O2S») o con tu idea, por el chat, editando este archivo o con una incidencia `feedback`.

- **Parte 4 — Ritmo y nombres** (2026-10-19; lo que falta para empezar la fase 1). Con el ritmo elegido, las sesiones ajustan los precios y velocidades con simulaciones en los tests para que se cumpla:
  - **Ritmo**: **R1** rápido (zona 2 a los ~3 min, zona 4 a la ~1 h); **R2** medio (zona 2 a los ~10 min, zona 4 a las ~6 h); **R3** lento (zona 2 a los ~30 min, zona 4 a los ~2 días).
  - **Subida de precio de cada mejora**: **S1** suave (×1,07 cada compra); **S2** media (×1,10); **S3** fuerte (×1,15).
  - **Tope de lo ganado con el juego cerrado**: **T2** 2 h; **T4** 4 h; **T8** 8 h (ampliable más adelante en todos los casos).
  - **Nombres de los ayudantes**: **N1** Tuerca (aplastado), Chispa (fundido), Yunque (chapa) y Codo (tubos); **N2** Abuela Remache, Soplete, Planchita y Fontanero Fito; **N3** los que propongas tú.

Las siguientes partes, cuando respondas a esta: retención (premio diario, sucesos) y anuncios y compras.

## Hecho

- [x] **Parte 1 del diseño — tema y monedas** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 2 del diseño — cómo funciona la cadena** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 3 del diseño — zonas y ayudantes** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
