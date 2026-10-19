# Feedback de Mikel

Escribe aquí lo que quieras, o abre una incidencia en GitHub con la etiqueta `feedback`: cada sesión la pasa a esta lista.

## Pendiente

- [ ] **Estilo visual: 3D de dibujo animado con Three.js y modelos CC0** (2026-10-19, decidido por Mikel): Three.js (gratis) con modelos gratuitos de uso comercial de Kenney y Quaternius (CC0); lo que falte, hecho por código. Cada modelo usado se apunta en `docs/CREDITOS.md`. Va con la fase 1, cuando haya escena que dibujar.

- [ ] **Base del proyecto** (2026-10-19, aprobado por Mikel al crear Zenit Studio): esqueleto con Vite + TypeScript + Vitest, publicación de la versión web en GitHub Pages y capturas automáticas para STONKS. **Hecho el esqueleto**; falta comprobar que la web publicada se ve en el móvil.

## Propuestas para Mikel

Aquí se concreta el diseño de Chatarrero entre Mikel y Claude, por partes. La estructura genérica está en `docs/DISENO.md`. Responde con las letras (p. ej. «O2S») o con tu idea, por el chat, editando este archivo o con una incidencia `feedback`.

- **Parte 2 — Cómo funciona la cadena** (2026-10-19; la Parte 1 ya está en «Decidido» de DISENO.md):
  - **De dónde sale la chatarra**: **A** el jugador toca la pila para recogerla y luego compra camiones que la traen solos; **B** llega sola desde el principio a un ritmo que se mejora con dólares; **C** se compra con dólares a un precio que va subiendo.
  - **Cómo se encadenan las zonas**: **E** en cadena: cada zona usa lo que hace la anterior (chatarra → bloques → lingotes…); **P** en paralelo: cada zona transforma chatarra directamente y vale más; **M** mezcla: las primeras en paralelo y las avanzadas en cadena.
  - **Expedición**: **X** automática y continua (lo terminado se vende al momento); **T** un camión de expedición que sale cada pocos segundos con una capacidad que se mejora; **K** el jugador toca «Expedir» y, más adelante, un ayudante lo automatiza.
  - **Mejoras de cada zona (con dólares)**: **1** solo velocidad; **2** velocidad y capacidad; **3** velocidad, capacidad y número de máquinas.
  - **Cómo sube de nivel un ayudante**: **D** pagando dólares; **H** con experiencia por trabajar (sube solo con el tiempo); **DH** las dos cosas (la experiencia desbloquea el nivel y se paga para subirlo).
  - **Qué mejora un ayudante** (además de que lo producido valga más): **V** solo el valor; **R** valor y velocidad; **Z** cada ayudante una cosa distinta según su rasgo (valor, velocidad, capacidad, ganancias con el juego cerrado…).

Las siguientes partes, cuando respondas a esta: la lista de zonas (nombres, productos y precios), retención (premio diario, sucesos) y anuncios y compras.

## Hecho

- [x] **Parte 1 del diseño — tema y monedas** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
