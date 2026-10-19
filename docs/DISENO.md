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
