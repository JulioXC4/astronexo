# Avisos, ayudas y modales (narrativa y UX)

Reglas del equipo: el juego se entiende por **personajes y decisiones**, no por cajas de texto. Una sola cosa pide atención a la vez, y un modal siempre manda.

## Quién manda (de mayor a menor)

1. **Ventana importante**: cualquier `role="dialog"` con `aria-modal="true"` (consola de un minijuego, acuerdo del grupo, Modo Estación, transición de turno) o un elemento con `data-radio-block="true"` (cartel de Ayuda `TutorialCoachMark`, ficha de una instalación del mapa).
2. **Globo de radio** (`RadioBubble`): esquina superior derecha, o sobre la vista de la base en la guardia (`useRadioAnchor('guard')`). Nunca tapa barras de recursos, alertas ni botones.
3. **Avisos de peligro y acciones del jugador** (`tone: 'danger'`, `front: true`) pasan al frente de la cola, pero solo interrumpen un globo que lleva más de 2,8 s.

Mientras haya una ventana importante, la radio **calla y su cola espera**; al cerrarse la ventana sigue sola (a los ~0,9 s). `RadioProvider` lo detecta observando el DOM, así que una ventana nueva solo necesita `aria-modal="true"` o `data-radio-block="true"`.

## Reglas de la radio (`src/features/radio`)

- **Sin duplicados**: un mismo texto no vuelve a salir si está en pantalla, en cola o salió hace menos de 20 s. Las pistas `once` salen una vez por pantalla.
- **Se cierra** con la X o con Escape, y **se repite** con el botón «Repetir ayuda» (recuerda las 3 últimas ayudas de la pantalla; no repite avisos de peligro).
- **No queda nada pendiente de otra pantalla**: `useScreenRadio` y `useRadioLeave` vacían la cola al salir.
- Tiempos de JD (§8 de la especificación de exploración): primer globo a 1,8 s, `max(4,5 s; 2,5 s + 55 ms por carácter)` en pantalla, 2,4 s entre globos.

## Dentro de un modal, la ayuda vive en el modal

La consola de un minijuego de la guardia usa `ConsoleGuide` (personaje + una frase grande) en lugar de la radio, así la instrucción nunca se repite ni compite con otra notificación. Lo mismo para el dato de la estrella dorada.

## Foco y teclado

`useModalFocus` (en `src/visual-kit`): el foco entra al abrir, Tab da la vuelta dentro, Escape cierra y el foco vuelve a donde estaba. Lo usan la consola de los minijuegos, el acuerdo del grupo y el Modo Estación. El cartel de Ayuda tiene su propio atrapado de foco y cierra con Escape.

## Capas (z-index)

| Capa | z-index |
|---|---|
| Juego (barras, mapa, exploración) | ≤ 40 |
| Globo de radio y «Repetir ayuda» | 45 |
| Menús y consolas modales | 50 |
| Diálogo de acuerdo del grupo | 60 |
| Cartel de Ayuda | 90 |

## Idiomas

`en`, `es`, `qu` y `no` tienen las mismas claves (lo comprueba `tests/game/i18n.test.ts`); quechua y noruego siguen marcados como borrador pedagógico pendiente de revisión de hablantes nativos. Los textos originales de Juan Diego (exploración) se conservan en español como referencia de la traducción.

## Qué cambió en esta rama (`feature/narrative-ux-polish`)

- **Avisos y modales**: la radio calla bajo cualquier modal o ayuda, no repite textos, se cierra (X o Escape) y se repite («Repetir ayuda»); se aparta sola de objetivos y controles (`data-target`, `data-radio-avoid`, botones); en la guardia va sobre la vista de la base. La ayuda de la consola de un minijuego vive dentro de su ventana (`ConsoleGuide`). El panel de una instalación del mapa manda sobre la radio y ya no se repite por radio. El selector de idioma ya no tapa menús (z-index 12).
- **Foco y teclado**: `useModalFocus` en la consola de minijuegos, el acuerdo del grupo y el Modo Estación.
- **Misiones terrestres**: un objetivo resaltado a la vez («Pulsa aquí» / «Gira aquí»), escena atenuada alrededor, menos etiquetas a la vez, ✓ tras cada acción, letras más grandes y brillos más suaves; los datos largos van en «Más detalles» o «Datos reales».
- **Construcción de módulos**: Elegir → Construir → Terminado → Funcionando con insignias y animaciones sencillas, chips ↑/↓ de lo que cada módulo ayuda y gasta (leídos de `src/game/config/modules.ts`, sin tocar números), avisos «+N / −N» en las barras y diálogos cortos de Nico y Alba.
- **Idiomas**: `en`, `es`, `qu` y `no` con las mismas 1624 claves; la prueba `tests/game/i18n.test.ts` lo exige. Los textos de Operación Refugio pasaron de un objeto interno a i18n (`minigames.solarWatchCopy`).
- **Diálogos de la exploración**: se restauró el texto original de Nico del paquete de JD (`introNico`).

## Pendiente

- Revisión de hablantes nativos de quechua (sureño, Chanka/Collao) y noruego: los textos son borradores pedagógicos y varios términos técnicos quedaron como préstamos.
- `Más detalles` / `Datos reales` de cada misión conserva las fuentes NASA; falta decidir con JD qué datos del paquete (radiación en el informe, lugar de la base, fuentes clicables) entran en una segunda etapa.
- Por debajo de 1020 px de ancho el panel de detalle del constructor se oculta, así que ahí los chips de cada módulo no se ven.

## Capturas

`docs/screenshots/narrative-ux/` (WebP, escritorio y tablet): radio en la guardia, modal y ayuda con prioridad, Operación Refugio con un objetivo a la vez y el globo apartado, constructor → obra → terminado → funcionando, cambio de recursos en la guardia, briefing uniforme, Aire y agua y Nubes y soles simplificados.
