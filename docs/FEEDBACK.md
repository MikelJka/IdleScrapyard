# Feedback de Mikel

Escribe aquí lo que quieras, o abre una incidencia en GitHub con la etiqueta `feedback`: cada sesión la pasa a esta lista.

## Pendiente

- [ ] **Estilo visual: 2D muy bonito y atractivo** (2026-10-19, Mikel cambia el 3D por 2D: «no aporta nada ver esto desde diferentes ángulos»): escena del desguace en SVG dibujada por código, estilo dibujo animado. **Hecha la vista isométrica** (2026-10-19, como la captura de serrería que enseñó Mikel): mapa a pantalla completa (arrastrar y pellizcar), puestos con líneas amarillas, máquinas por nivel (1-2 por puesto), ayudantes de bloques, palés, carretillas, camiones de chatarra detrás y de expedición delante, dinero que salta al cobrar; botones flotantes y tienda en panel inferior. **Hechos los sonidos** (2026-10-19, sintetizados por código, con botón de silencio) **y las animaciones** (2026-10-19): productos distintos por línea, carretillas que giran, máquinas que trabajan, volquete, coches de fondo, ciudad industrial, nave en rayos X, nubes, pájaros y paseantes. Falta: pulir.

- [ ] **Base del proyecto** (2026-10-19, aprobado por Mikel al crear Zenit Studio): esqueleto con Vite + TypeScript + Vitest, publicación de la versión web en GitHub Pages y capturas automáticas para STONKS. **Hecho el esqueleto**; falta comprobar que la web publicada se ve en el móvil.

- [ ] **Fase 1 — bucle básico** (2026-10-19, diseño de las Partes 1-3 aprobado por Mikel): simulación de la chatarra (toque y camiones), la zona de aplastado con su máquina, carretillas, muelle y camiones de expedición, mejoras y dólares; después la pantalla principal y el guardado. **Hecha la simulación, la pantalla principal (sin 3D), el guardado automático y las ganancias con el juego cerrado** (2026-10-19); hecha la escena 2D. Los ayudantes (experiencia y niveles) van después.

- [x] **Ampliación a 8 zonas con sus personajes** (2026-10-19, L2): vigas (Grúa), piezas de motor (Pistón), motores (Bujía) y coches reconstruidos (Turbo); cada ayudante con una frase de personalidad en `src/data/zones.json`. **Hecho.**

- [x] **Pase de chatarrero (P1)** (2026-10-19): compra única que quita los anuncios y sube el tope de lo ganado fuera de 2 h a 8 h. Precio: 2,99 €. **Hecho** (en la web, compra de prueba).

- [x] **Racha de 7 días (D2)** (2026-10-19): premio diario que crece durante 7 días seguidos. Premios: el día 1 da 10 min de producción y sube hasta 2 h el día 7. Si se falta un día, vuelve al día 1. **Hecho.**

- [x] **Empujón con anuncio (E1)** (2026-10-19): ×2 a la producción durante 30 min viendo un anuncio, con espera entre uno y otro.

- [x] **Camión dorado con anuncio (S1)** (2026-10-19): aparece de vez en cuando; si se toca y se ve un anuncio, paga ×10 lo que hay en el muelle. Aparece cada ~15 min y espera 20 s a que lo toques. **Hecho** (anuncio de prueba en la web).

- [x] **Ayudantes con experiencia y niveles** (2026-10-19): un nivel nuevo disponible cada hora de trabajo de su zona, que se paga en dólares; cada nivel da +10 % de valor y +5 % de velocidad; nivel máximo 25. **Hecho** en la simulación y en la pantalla.

- [x] **Partida en varios dispositivos, primera parte** (2026-10-19, lo pide Mikel): código de partida que se copia y se pega en otro dispositivo, sin servidor. **Hecho.** Sincronización automática descartada por ahora (Mikel eligió S1, 2026-10-19), con el guardado detrás de `SaveStore` para poder cambiarlo luego.

- [x] **Tope de lo ganado fuera: 1 h sin pase** (2026-10-19, lo pide Mikel): antes 2 h; el pase sigue en 8 h. **Hecho.** La ampliación con anuncio, hecha (Parte 10: A3 + A4).
- [x] **Arreglos de la escena** (2026-10-19, Mikel): animaciones de las líneas suaves (arrancan y paran sin saltos), carretillas que salen a trabajar en cuanto hay producto, AGV con rutas pintadas en vez de gente paseando, coches de fondo que ya no se atraviesan. **Hecho.**

- [x] **Fondo y decorado (Parte 9: D1, D3, D4, D5)** (2026-10-19, lo elige Mikel tras ver un vídeo de la web): ciudad con autopista elevada, farolas, árboles, cartel y aceras (D1); puerto con vía y tren de mercancías, grúa pórtico, barco y agua (D3); suelo con texturas, charcos y ciclo día/noche con la hora real (D4); nave rellena con estanterías, oficina, depósitos, bidones, taquillas y palés, y andamios con lona y «Próximamente» en las zonas cerradas (D5). **Hecho.**
- [x] **Anuncios al volver (Parte 10: A3 + A4)** (2026-10-19): al volver tras estar fuera, un botón duplica lo ganado y, si se pasó del tope, otro recupera lo perdido (hasta el tope del Pase, 8 h). Con el Pase se dan sin anuncio. **Hecho.**
- [x] **Pedidos de Mikel tras probar en el Pixel 10** (2026-10-19): **hecho** (a revisar en el móvil): (1) chatarra total y cuello de botella visibles (barra de arriba con pila, entrada, demanda, palés y muelle, más el estado de cada línea: trabajando / sin chatarra / palé lleno); (2) piezas por segundo y unidades en el palé de cada línea; (3) una huella de salida por producto en el muelle con sus unidades; (4) focos de noche que iluminan la nave y lo de dentro; (5) hasta 9 máquinas visibles por puesto (cuadrícula) y «+N» si hay más; (6) arreglo de las carretillas que solo giraban: ahora hacen el viaje al muelle y cada línea abierta tiene la suya a la vista; (7) tocar un puesto abre sus mejoras (también el muelle y la carretera de camiones) y desaparece el botón compartido; los ajustes y el código de partida pasan al ⚙; (8) animación al llegar a un nivel múltiplo de 5 de cualquier mejora, y la máquina se transforma cada 5 niveles de máquina (depósitos, segunda chimenea, dorado, neón, corona y aura); (9) menos parpadeo (ver PROGRESO).
- [ ] **Ranking mundial de dinero generado** (2026-10-19, lo pide Mikel): necesita un servidor; ver la Parte 12 en «Propuestas para Mikel». Sin decidir.

## Propuestas para Mikel

Aquí se concreta el diseño de Chatarrero entre Mikel y Claude, por partes. La estructura genérica está en `docs/DISENO.md`. Responde con las letras (p. ej. «O2S») o con tu idea, por el chat, editando este archivo o con una incidencia `feedback`.

### Parte 11 — Qué hacemos ahora (2026-10-19)

Todo lo aprobado está hecho salvo «pulir» y comprobar la web en el móvil. Para la siguiente sesión, ¿qué prefieres?

- **N1 — Equilibrio:** ajusto precios y tiempos con una simulación de partida (cuánto tarda cada zona en estar al máximo) y te propongo una tabla de números para aprobar.
- **N2 — Android:** empaquetar con Capacitor y generar el archivo para Google Play en GitHub Actions (sin anuncios reales aún).
- **N3 — Textos en inglés:** pasar todos los textos a un archivo de traducciones (es/en) con selector de idioma.
- **N4 — Rendimiento:** medir y aligerar la escena para móviles flojos (el parpadeo del vídeo), sin cambiar el juego.
- **N5 — Otra cosa:** dime tu idea.

Responde con las letras (p. ej. «N1N4»).

### Parte 12 — Ranking mundial (2026-10-19)

Mikel quiere un ranking mundial de quien más dinero ha generado, accesible desde el juego. Necesita guardar datos fuera del móvil, y el proyecto es «sin backend propio» y de coste cero, así que hay que elegir cómo:

- **R1 — Firebase (Firestore + inicio de sesión anónimo), nivel gratuito.** Es lo más rápido y suele ir bien con Capacitor/Android. Se guardan nombre, país opcional y `totalEarned`. Gratis hasta unas decenas de miles de lecturas al día; si el juego crece mucho habría que pasar a pago (se avisaría antes). Las reglas de seguridad limitan que cada jugador solo escriba lo suyo.
- **R2 — Supabase (Postgres), nivel gratuito.** Parecido a R1 pero con SQL: el ranking es una consulta ordenada, más fácil de limpiar o de añadir filtros (semanal, por país). El proyecto gratuito se pausa si no tiene actividad una semana.
- **R3 — Google Play Games Services (tabla de clasificación).** Solo en Android y sin servidor nuestro; gratis y con el inicio de sesión de Google ya hecho. No funciona en la versión web, así que la web de pruebas no tendría ranking.
- **R4 — Sin servidor: solo ranking entre amigos con códigos.** Cada uno comparte un código y se comparan en local. No es mundial, pero cuesta cero y no tiene trampas de servidor.

Cosas a decidir sea cual sea (mi recomendación entre paréntesis):
1. **Trampas:** los números del móvil se pueden falsear. (Enviar también un resumen de la partida —tiempo jugado, camiones vendidos— y rechazar saltos imposibles; no será perfecto.)
2. **Qué se mide:** dinero generado en total en la vida de la partida (lo que pides) o también un ranking semanal. (Total, y semanal más adelante.)
3. **Privacidad:** apodo libre y moderado, sin datos personales; hay que sumarlo a la política de privacidad y al consentimiento de la UE. (Apodo elegido por el jugador, con lista de palabras prohibidas.)
4. **Dónde se ve:** botón 🏆 en la barra de arriba que abre la lista (top 100 y tu posición). (Sí.)

Mi recomendación: **R1** si quieres web y Android con el mismo ranking; **R3** si prefieres lo más simple y solo en Android.

### Parte 13 — Parpadeo en el Pixel 10: cómo dibujar lo animado (2026-10-19)

Con Capacitor la app usa el mismo motor que Chrome (WebView), así que el parpadeo **no se arregla solo al pasar a Android**: depende de cómo dibujamos. Ahora todo es SVG con unos 4000 nodos y decenas de animaciones CSS, y un móvil con pantalla de alta densidad lo repinta casi entero en cada fotograma. Ya reduje los nodos que se recrean (carretillas, camiones y AGV); si sigue, las opciones son:

- **G1 — Seguir afinando el SVG** (coste: bajo, 1 sesión). Menos animaciones CSS a la vez (solo las líneas visibles en pantalla), ocultar lo que queda fuera de la cámara, partir las imágenes estáticas enormes en trozos. Mejora segura pero puede no bastar.
- **G2 — Lo animado en un `<canvas>` 2D** (coste: medio, 3-4 sesiones). Fondo y suelo siguen siendo imágenes estáticas; carretillas, camiones, máquinas, personas y efectos se pintan en un canvas con `requestAnimationFrame`. Un solo elemento a repintar, rendimiento muy estable. Pierde la facilidad de tocar elementos SVG (habría que hacer nosotros la detección de toques, que ya hacemos con las zonas).
- **G3 — PixiJS (WebGL, licencia MIT, gratis)** (coste: alto, 5-6 sesiones). Todo en GPU, lo mejor para muchas animaciones y efectos de luz de noche. Añade ~150 KB y hay que rehacer el dibujado de las formas isométricas como sprites generados.
- **G4 — Medir primero**: añado un contador de fotogramas por segundo (activable con `?fps=1`) para que me digas cuántos hace el Pixel y en qué momento baja (zoom, noche, muchas máquinas). Con ese dato elijo entre G1-G3.

Recomendación: **G4 ahora + G1**, y pasar a **G2** si el contador confirma que hay caídas de fotogramas.

### Parte 14 — Logística visible: carretillas, huellas y camiones (2026-10-19)

Ahora las carretillas van al muelle pero lo que «descargan» no se ve entrar en la huella de su producto, y el camión se carga de la nada. Opciones:

- **L1 — Las carretillas sueltan su producto en la huella del producto** (se ve cómo sube el número) y el camión de expedición se llena cogiendo de las huellas, producto a producto.
- **L2 — Como L1, y además cada huella tiene un tope visible** (el muelle llena una huella y se para esa línea): añade una decisión (mejorar el muelle por producto) pero cambia las reglas de la simulación.
- **L3 — Dejarlo como está** (solo informativo).

Recomendación: **L1** (no cambia reglas, solo lo que se ve).

### Parte 15 — Qué pasa al subir grados de máquina (2026-10-19)

Cada 5 niveles de máquina ahora se transforma (6 grados, hasta el nivel 30). El nivel de máquina cuesta ×4 y dobla la producción, así que llegar al grado 2 ya cuesta millones. Opciones para dar sentido al grado:

- **M1 — Solo estético** (como ahora): se ve mejor.
- **M2 — Bonus por grado**: cada grado da un +25 % extra de valor del producto de la línea (sube el incentivo de llegar al múltiplo de 5).
- **M3 — Un hito con premio**: en cada múltiplo de 5 se da una recompensa única (por ejemplo 10 min de producción de esa línea o una carretilla gratis).
- **M4 — M2 + M3**.

Recomendación: **M3** (premio pequeño y claro, no rompe el equilibrio).

### Parte 16 — Objetivos y logros (2026-10-19)

Para dar razones de volver y ayudar a saber qué hacer ahora:

- **O1 — Objetivo actual en pantalla**: una línea fija (por ejemplo «Abre Laminado: $15K») que se actualiza sola.
- **O2 — Misiones diarias** (3 al día: «cobra 5 camiones», «sube 2 niveles», «toca 100 veces») con premio de minutos de producción.
- **O3 — Logros permanentes** (insignias por hitos: primera zona, 100 K, máquina grado 3…), con lista en ⚙.
- **O4 — O1 + O3** (sin misiones diarias, más tranquilo).

Recomendación: **O4**.


## Hecho

- [x] **Parte 1 del diseño — tema y monedas** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 2 del diseño — cómo funciona la cadena** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 3 del diseño — zonas y ayudantes** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 4 del diseño — ritmo y nombres** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 5 del diseño — retención, anuncios y compras** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 6 del diseño — ayudantes, racha y pase** (2026-10-19): decidido por Mikel; resumido en «Decidido» de DISENO.md.
- [x] **Parte 7 del diseño — racha** (2026-10-19): si se falta un día, vuelve al día 1.
- [x] **Parte 8 del diseño — sincronización entre dispositivos** (2026-10-19): S1, solo código manual; fácil de sustituir. Resumido en «Decidido» de DISENO.md.
- [x] **Parte 9 del diseño — fondo y decorado** (2026-10-19): D1, D3, D4 y D5; resumido en «Decidido» de DISENO.md.
- [x] **Parte 10 del diseño — anuncios al volver** (2026-10-19): A3 y A4; resumido en «Decidido» de DISENO.md.
