# Feedback de Mikel

Escribe aquí lo que quieras, o abre una incidencia en GitHub con la etiqueta `feedback`: cada sesión la pasa a esta lista.

## Pendiente

- [ ] **Estilo visual: 3D de dibujo animado con Three.js y modelos CC0** (2026-10-19, decidido por Mikel): Three.js (gratis) con modelos gratuitos de uso comercial de Kenney y Quaternius (CC0); lo que falte, hecho por código. Cada modelo usado se apunta en `docs/CREDITOS.md`. Va con la fase 1, cuando haya escena que dibujar.

- [ ] **Base del proyecto** (2026-10-19, aprobado por Mikel al crear Zenit Studio): esqueleto con Vite + TypeScript + Vitest, publicación de la versión web en GitHub Pages y capturas automáticas para STONKS. **Hecho el esqueleto**; falta comprobar que la web publicada se ve en el móvil.

## Propuestas para Mikel

Aquí se concreta el diseño de Chatarrero entre Mikel y Claude, por partes. La estructura genérica está en `docs/DISENO.md`. Responde con las letras (p. ej. «O2S») o con tu idea, por el chat, editando este archivo o con una incidencia `feedback`.

- **Parte 3 — Zonas y ayudantes** (2026-10-19; las Partes 1 y 2 ya están en «Decidido» de DISENO.md):
  - **Cuántas zonas en la primera versión**: **4**; **6**; **8**.
  - **Qué se fabrica** (cada zona transforma chatarra directamente; los precios son un punto de partida y se ajustarán con pruebas):
    - **I** industrial: bloques (1 $) → lingotes (4 $) → chapa (15 $) → tubos (60 $) → vigas (250 $) → piezas de motor (1 K $) → motores (4 K $) → coches reconstruidos (15 K $).
    - **H** de humor: bloques (1 $) → lingotes (4 $) → tostadoras «casi nuevas» (15 $) → bicis frankenstein (60 $) → robots mascota (250 $) → coches tuneados (1 K $) → tanques de juguete (4 K $) → cohetes caseros (15 K $).
    - **Mx** mezcla: las primeras industriales (bloques, lingotes, chapa) y luego de humor (tostadoras, robots, coches tuneados, cohetes…).
  - **Cómo son los ayudantes**: **F** personajes fijos con nombre y personalidad, uno por zona (p. ej. «Tuerca», la que aplasta); **G** se generan con nombre y aspecto al azar al abrir cada zona; **FG** fijos los primeros y al azar los siguientes.
  - **Camiones**: **Q** todos iguales y se mejora la carga que esperan (el «X stock»); **W** varios tipos de camión (cada uno más grande y que paga más); **QW** primero uno y más adelante se desbloquean más grandes.

Las siguientes partes, cuando respondas a esta: retención (premio diario, sucesos) y anuncios y compras.

## Hecho

- [x] **Parte 1 del diseño — tema y monedas** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 2 del diseño — cómo funciona la cadena** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
