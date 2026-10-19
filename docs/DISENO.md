# Estructura de un juego idle

Esta es la plantilla genérica de un juego incremental (idle) para móvil: las piezas que tiene casi cualquier juego del género y dónde encaja cada cosa. **No es el diseño de Chatarrero**: lo concreto (tema, recursos, números, anuncios) se decide entre Mikel y Claude en «Propuestas para Mikel» de `FEEDBACK.md`, y lo aprobado se apunta en la sección «Decidido» al final de este archivo.

## 1. El bucle principal

1. **Acción manual**: el jugador toca para ganar una pequeña cantidad. Es lo único que hay al empezar y deja de importar pronto.
2. **Generadores**: cosas que se compran y producen solas cada segundo. Es el corazón del juego.
3. **Mejoras**: compras puntuales que multiplican la producción de un generador, de todos o de los toques.
4. **Hitos**: al tener N unidades de un generador (10, 25, 50, 100…), su producción se multiplica. Dan objetivos a corto plazo.
5. **Reinicio con premio** (prestigio): cuando el avance se frena, el jugador lo reinicia todo a cambio de una moneda permanente que acelera la siguiente partida.

Un buen ritmo: algo nuevo que comprar cada pocos segundos al principio, cada pocos minutos a la media hora y un reinicio rentable a las pocas horas.

## 2. Monedas

| Tipo | Ejemplo | Se pierde al reiniciar |
| --- | --- | --- |
| Principal | la que dan los toques y los primeros generadores | Sí |
| Secundarias (opcional) | se fabrican con la principal; abren generadores nuevos | Sí |
| De prestigio | se gana al reiniciar; bonificación permanente | No |
| Premium (opcional) | gemas, solo con anuncios o compras | No |

Cuantas menos monedas, más fácil de entender. Lo habitual en un primer juego: una principal, como mucho una secundaria y la de prestigio.

## 3. Números

- **Precio de cada generador**: `precio_base × factor ^ unidades_compradas`, con un factor entre 1,07 y 1,15.
- **Producción**: `producción_base × unidades × multiplicadores` (mejoras, hitos, prestigio).
- **Números grandes**: se escriben abreviados (1,2 K · 3,4 M · 5,6 B…) y la simulación debe aguantar números enormes.
- **Ganancias con el juego cerrado**: producción por segundo × tiempo fuera, con un tope (normalmente 2–8 h, ampliable con mejoras).
- **Equilibrio**: se prueba con simulaciones en los tests (cuánto se tarda en llegar a cada generador jugando de forma razonable).

## 4. Retención (que vuelvan)

- **Ganancias con el juego cerrado** y su pantalla de bienvenida.
- **Recompensa diaria** y rachas de días seguidos.
- **Objetivos o logros** con premio.
- **Sucesos temporales**: algo aparece un rato y da un empujón si se toca.
- **Notificaciones** (con permiso): «tu almacén está lleno».

## 5. Dónde van los anuncios

| Sitio | Tipo | Cómo se recibe |
| --- | --- | --- |
| Pantalla de bienvenida | Con recompensa: doblar (o triplicar) lo ganado fuera | El mejor: lo pide el jugador y lo ve mucha gente |
| Empujón temporal | Con recompensa: ×2 a la producción durante unos minutos | Muy bueno; con un tiempo de espera entre uno y otro |
| Suceso que aparece | Con recompensa: premio del suceso | Bueno si no es constante |
| Premio diario o cofre | Con recompensa: doble premio | Bueno |
| Entre pantallas | Pantalla completa, salta solo | Da dinero, pero molesta; con límite de frecuencia o mejor no ponerlo |
| Banner fijo | Siempre visible | Poco dinero y estorba en vertical; no recomendado |

La compra **«quitar anuncios»** quita los que saltan solos y suele dar las recompensas sin ver el anuncio (o dejar los de recompensa como opcionales).

## 6. Compras dentro del juego (opcionales)

- Quitar anuncios (pago único).
- Paquetes de inicio (moneda + mejora) a buen precio, una sola vez.
- Multiplicadores permanentes (×2 a todo).
- Moneda premium por paquetes.

En un primer juego, lo sensato es empezar solo con «quitar anuncios» y añadir lo demás si hay jugadores.

## 7. Pantallas

1. **Principal** (vertical): arriba la escena que muestra el progreso; abajo la lista de generadores con el botón de comprar (×1, ×10, máximo).
2. **Mejoras**.
3. **Prestigio**: cuánto se ganaría al reiniciar ahora.
4. **Logros y premio diario**.
5. **Ajustes**: sonido, notación de números, idioma, guardado, compra y restaurar compra.

## 8. Lo técnico

- Estilo visual decidido con Mikel; sin pixel art y con coste cero (recursos gratuitos con licencia comercial, anotados en `docs/CREDITOS.md`).

- Simulación pura en `src/sim/`, con el tiempo como parámetro: así se prueban las ganancias de horas en un test.
- Guardado automático cada pocos segundos y al cerrar; partida en JSON con versión.
- Anuncios y compras detrás de una capa propia, con versiones «de mentira» para la web y para los tests.

## Decidido

Lo que Mikel aprueba en `FEEDBACK.md` se resume aquí.

- **Estilo visual** (2026-10-19): 3D de dibujo animado (low-poly) con Three.js y modelos gratuitos CC0 de Kenney y Quaternius; lo que falte, hecho por código. Nada de pixel art; coste cero.
- **Lo que nos diferencia** (2026-10-19): **ayudantes con nombre y rasgos que suben de nivel**. Cómo se consiguen, qué rasgos hay y cómo suben se decide en una parte posterior del diseño.
- **Ambientación** (2026-10-19): postapocalíptico con tono ligero y de humor.
- **Moneda y recurso** (2026-10-19): una sola moneda, el **dólar**, con la que se compran todas las mejoras. La **chatarra** es el único recurso de entrada. Todo lo fabricado se convierte en dólares al expedirlo.
- **Zonas** (2026-10-19): se desbloquean con dólares y cada una transforma la chatarra en un producto de más valor (p. ej. aplastado de chatarra → bloques de chatarra, 1 $; fundido de chatarra → lingotes de chatarra, 4 $…).
- **Ayudantes** (2026-10-19): uno nuevo por cada zona desbloqueada. Según su nivel dan mejoras, por ejemplo que lo producido valga más dinero.
- **Prestigio** (2026-10-19): no en la primera versión; en una actualización posterior.
- **Chatarra** (2026-10-19): al principio se recoge tocando la pila; luego se compran camiones que la traen solos.
- **Zonas en paralelo** (2026-10-19): cada zona transforma la chatarra directamente en su producto; las nuevas dan un producto que vale más.
- **Expedición** (2026-10-19): se compran carretillas que llevan lo fabricado a un muelle de carga; los camiones llegan solos a cargar cuando el muelle tiene suficiente stock, y al expedirlo se convierte en dólares.
- **Mejoras de cada zona** (2026-10-19, con dólares): velocidad, capacidad, número de máquinas y nivel de las máquinas.
- **Nivel de los ayudantes** (2026-10-19): la experiencia por trabajar desbloquea el siguiente nivel y se paga en dólares para subirlo.
- **Qué mejoran los ayudantes** (2026-10-19): el valor de lo producido y la velocidad de su zona.
- **Zonas de la primera versión** (2026-10-19; ampliadas a 8 el mismo día): industriales. Aplastado → bloques de chatarra (1 $), fundido → lingotes (4 $), chapa (15 $) y tubos (60 $). Los precios son un punto de partida y se ajustan con pruebas. Ampliadas con vigas (250 $), piezas de motor (1 K $), motores (4 K $) y coches reconstruidos (15 K $).
- **Ayudantes fijos** (2026-10-19): un personaje con nombre y personalidad por zona.
- **Camiones** (2026-10-19): todos iguales; se mejora la carga que esperan en el muelle antes de salir.
- **Ritmo R2** (2026-10-19): la zona 2 se abre hacia los 10 min y la zona 4 hacia las 6 h jugando atento. Lo comprueba un test con un jugador simulado (`src/sim/bot.ts`).
- **Precios** (2026-10-19): cada mejora sube ×1,10 al comprarla.
- **Ganancias con el juego cerrado** (2026-10-19): tope de 2 h; un «free pass» lo amplía (cómo, en la Parte 5).
- **Ayudantes** (2026-10-19): Tuerca (aplastado), Chispa (fundido), Yunque (chapa) y Codo (tubos).
- **Ayudantes de las zonas nuevas** (2026-10-19): Grúa (vigas), Pistón (piezas de motor), Bujía (motores) y Turbo (coches reconstruidos). Cada uno tiene una frase de personalidad en `src/data/zones.json`.
- **Duración** (2026-10-19): con 8 zonas, abrirlo todo lleva unos 5-6 días (unas 131 h volviendo cada hora), sin contar aún los ayudantes.
- **Pase de chatarrero** (2026-10-19): compra única que quita los anuncios y sube el tope de lo ganado fuera a 8 h.
- **Premio diario** (2026-10-19): racha de 7 días con premio creciente.
- **Empujón con anuncio** (2026-10-19): ×2 a la producción durante 30 min, con espera entre uno y otro.
- **Suceso: camión dorado** (2026-10-19): aparece de vez en cuando; si se toca y se ve un anuncio, paga ×10 lo que hay en el muelle.
